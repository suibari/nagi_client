import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import type { Facet } from '$lib/atproto/facets';
import type { PostAssets, PostDraft } from '$lib/atproto/records';

const BSKY_POST = 'app.bsky.feed.post';
/** Bluesky の投稿上限。app.bsky.feed.post#text の maxGraphemes / maxLength。 */
const MAX_GRAPHEMES = 300;
const MAX_BYTES = 3000;
/** クロスポストであることの目印。Bluesky 側botたんはこれを見て反応をスキップする。 */
export const VIA = 'Nagi';

const encoder = new TextEncoder();

export type CrosspostChunk = { text: string; facets: Facet[] };

type Segment = { text: string; start: number; end: number };

function graphemes(text: string): Segment[] {
	const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
	const result: Segment[] = [];
	let byte = 0;
	for (const { segment } of segmenter.segment(text)) {
		const end = byte + encoder.encode(segment).length;
		result.push({ text: segment, start: byte, end });
		byte = end;
	}
	return result;
}

/**
 * 300 グラフェム / 3000 バイトに収まるようテキストを分割する。
 * 改行 > 空白 > グラフェム境界の順で区切り、URL やメンションの facet を
 * またぐ位置では切らない（切れる場所が無いときだけ facet を諦めて強制分割）。
 */
export function splitForBluesky(text: string, facets: Facet[] = []): CrosspostChunk[] {
	const segments = graphemes(text);
	const inFacet = (byte: number) =>
		facets.some((facet) => facet.index.byteStart < byte && byte < facet.index.byteEnd);
	const chunks: CrosspostChunk[] = [];
	let index = 0;

	while (index < segments.length) {
		const startByte = segments[index].start;
		let limit = index;
		while (
			limit < segments.length &&
			limit - index < MAX_GRAPHEMES &&
			segments[limit].end - startByte <= MAX_BYTES
		)
			limit++;

		let end = limit;
		if (end < segments.length) {
			const findBreak = (matches: (segment: Segment) => boolean) => {
				for (let candidate = end; candidate > index; candidate--) {
					if (inFacet(segments[candidate].start)) continue;
					if (matches(segments[candidate - 1])) return candidate;
				}
				return -1;
			};
			const chosen = [
				findBreak((segment) => segment.text === '\n'),
				findBreak((segment) => /\s/.test(segment.text)),
				findBreak(() => true),
			].find((candidate) => candidate > index);
			// どこで切っても facet を割ってしまう場合（極端に長い URL など）は
			// 上限位置で強制的に切り、収まらない facet は落とす。
			if (chosen !== undefined) end = chosen;
		}

		// 前後の空白を落としてからチャンクを確定する。
		let first = index;
		let last = end - 1;
		while (first <= last && /^\s+$/.test(segments[first].text)) first++;
		while (last >= first && /^\s+$/.test(segments[last].text)) last--;

		if (first <= last) {
			const chunkStart = segments[first].start;
			const chunkEnd = segments[last].end;
			chunks.push({
				text: segments
					.slice(first, last + 1)
					.map((segment) => segment.text)
					.join(''),
				facets: facets
					.filter((facet) => facet.index.byteStart >= chunkStart && facet.index.byteEnd <= chunkEnd)
					.map((facet) => ({
						...facet,
						index: {
							byteStart: facet.index.byteStart - chunkStart,
							byteEnd: facet.index.byteEnd - chunkStart,
						},
					})),
			});
		}
		index = end;
	}

	return chunks;
}

function buildEmbed(assets: PostAssets) {
	if (assets.images.length)
		return { $type: 'app.bsky.embed.images', images: assets.images.slice(0, 4) };
	const card = assets.cards[0];
	if (!card) return undefined;
	return {
		$type: 'app.bsky.embed.external',
		external: {
			uri: card.uri,
			title: card.title,
			description: card.description ?? '',
			...(card.thumb ? { thumb: card.thumb } : {}),
		},
	};
}

/**
 * Nagi のトップレベル投稿を Bluesky にも投稿する。
 * 300 文字を超える場合は分割し、2件目以降は直前の投稿へのリプライで芋づるに繋ぐ。
 * blob は Nagi 投稿でアップロード済みのものを使い回す（同一リポジトリ・同一サイズ上限）。
 */
export async function crosspostToBluesky(draft: PostDraft, assets: PostAssets) {
	const current = get(session);
	if (!current) throw new Error('Authentication required');
	const agent = new Agent(current);
	const chunks = splitForBluesky(draft.text, draft.facets as Facet[]);
	if (!chunks.length) return;
	const embed = buildEmbed(assets);
	const base = Date.parse(draft.createdAt) || Date.now();
	let root: { uri: string; cid: string } | undefined;
	let parent: { uri: string; cid: string } | undefined;

	for (const [index, chunk] of chunks.entries()) {
		const response = await agent.com.atproto.repo.createRecord({
			repo: current.did,
			collection: BSKY_POST,
			record: {
				$type: BSKY_POST,
				text: chunk.text,
				...(chunk.facets.length ? { facets: chunk.facets } : {}),
				langs: draft.langs,
				createdAt: new Date(base + index).toISOString(),
				via: VIA,
				...(index === 0 && embed ? { embed } : {}),
				...(root && parent ? { reply: { root, parent } } : {}),
			},
		});
		const ref = { uri: response.data.uri, cid: response.data.cid };
		root ??= ref;
		parent = ref;
	}
}
