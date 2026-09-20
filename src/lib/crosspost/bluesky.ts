import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import type { Facet } from '$lib/atproto/facets';
import type { PostAssets, PostDraft } from '$lib/atproto/records';
import type { StrongRef } from '$lib/api/types';

const BSKY_POST = 'app.bsky.feed.post';
/** Bluesky の投稿上限。app.bsky.feed.post#text の maxGraphemes / maxLength。 */
const MAX_GRAPHEMES = 300;
const MAX_BYTES = 3000;
/** app.bsky.embed.external#thumb の maxSize。超える blob を載せるとレコードごと弾かれる。 */
const MAX_THUMB_BYTES = 1_000_000;
/** クロスポストであることの目印。Bluesky 側botたんはこれを見て反応をスキップする。 */
export const VIA = 'Nagi';

const encoder = new TextEncoder();

export type CrosspostChunk = { text: string; facets: Facet[] };

export function getCrosspostSelfLabels(draft: Pick<PostDraft, 'labels'>) {
	return draft.labels?.values.filter((label) =>
		['porn', 'sexual', 'nudity', 'graphic-media'].includes(label.val),
	);
}

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
 *
 * `reserved` は、呼び出し元があとから末尾に足す文字列のぶんの席取り。
 * 記事のティーザー（1件だけ投稿し、末尾に「続きはNagiで」を置く）で使う。
 */
export function splitForBluesky(
	text: string,
	facets: Facet[] = [],
	reserved: { graphemes?: number; bytes?: number } = {},
): CrosspostChunk[] {
	const maxGraphemes = Math.max(1, MAX_GRAPHEMES - (reserved.graphemes ?? 0));
	const maxBytes = Math.max(1, MAX_BYTES - (reserved.bytes ?? 0));
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
			limit - index < maxGraphemes &&
			segments[limit].end - startByte <= maxBytes
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
 * Bluesky に作成する本文チャンクと embed を組み立てる。
 * app.bsky.feed.post は embed があれば空の text を許可するため、画像または
 * リンクカードだけの投稿では空文字のチャンクを1件用意する。
 */
export function prepareCrosspostContent(draft: PostDraft, assets: PostAssets) {
	let chunks = splitForBluesky(draft.text, draft.facets as Facet[]).map((chunk) => ({
		...chunk,
		facets: chunk.facets.flatMap((facet) => {
			// 公式 Bluemoji facet は相互運用のため残し、Nagi の正確な rkey 解決用参照だけ外す。
			const features = facet.features.filter(
				(feature) => feature.$type !== 'com.suibari.nagi.richtext#bluemoji',
			);
			return features.length ? [{ ...facet, features }] : [];
		}),
	}));
	const embed = buildEmbed(assets);
	if (!chunks.length && embed) chunks = [{ text: '', facets: [] }];
	return { chunks, embed };
}

/**
 * Nagi のトップレベル投稿を Bluesky にも投稿する。
 * 300 文字を超える場合は分割し、2件目以降は直前の投稿へのリプライで芋づるに繋ぐ。
 * blob は Nagi 投稿でアップロード済みのものを使い回す（同一リポジトリ・同一サイズ上限）。
 */
export async function crosspostToBluesky(
	draft: PostDraft,
	assets: PostAssets,
): Promise<StrongRef | undefined> {
	// こっそり投稿、およびチャンネル投稿は Bluesky にクロスポストしない。
	// チャンネルは通常/こっそり問わず常に無効（チャンネルのコンテキストを外部に漏らさないため）。
	if (draft.kossori || draft.channel || draft.cwRestricted) return;
	const current = get(session);
	if (!current) throw new Error('Authentication required');
	const agent = new Agent(current);
	const { chunks, embed } = prepareCrosspostContent(draft, assets);
	if (!chunks.length) return;
	const base = Date.parse(draft.createdAt) || Date.now();
	let root: { uri: string; cid: string } | undefined;
	let parent: { uri: string; cid: string } | undefined;
	const crosspostSelfLabels = getCrosspostSelfLabels(draft);

	for (const [index, chunk] of chunks.entries()) {
		const response = await agent.com.atproto.repo.createRecord({
			repo: current.did,
			collection: BSKY_POST,
			record: {
				$type: BSKY_POST,
				text: chunk.text,
				...(chunk.facets.length ? { facets: chunk.facets } : {}),
				langs: draft.langs,
				...(crosspostSelfLabels?.length
					? {
							labels: {
								$type: 'com.atproto.label.defs#selfLabels',
								values: crosspostSelfLabels,
							},
						}
					: {}),
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
	// スレッドの先頭。記事の bskyPostRef にはこれを使う。
	return root;
}

/**
 * 記事の抜粋を作るために、本文先頭のタイトル行（h1）を落とす。
 * タイトルは誘導リンクのカード側に出るので、抜粋に重ねて入れない。
 * h2 以下は本文の一部なので残す。facet のオフセットは落としたぶん前へ詰める。
 */
export function stripLeadingHeading(text: string, facets: Facet[] = []) {
	const match = /^#[ \t]+\S.*(\r?\n)*/.exec(text);
	if (!match) return { text, facets };
	const removed = encoder.encode(match[0]).length;
	return {
		text: text.slice(match[0].length),
		facets: facets
			.filter((facet) => facet.index.byteStart >= removed)
			.map((facet) => ({
				...facet,
				index: {
					byteStart: facet.index.byteStart - removed,
					byteEnd: facet.index.byteEnd - removed,
				},
			})),
	};
}

/**
 * ティーザー本文（抜粋＋誘導文）と、その facet を組み立てる。
 * 誘導文は呼び出し元が翻訳済みの1行で渡す（URL を含む）ので、
 * このモジュールは i18n を知らないままでいられる。
 */
export function buildArticleTeaser(
	draft: Pick<PostDraft, 'text' | 'facets'>,
	article: { url: string; teaser: string },
): CrosspostChunk & { excerpt: string } {
	const body = stripLeadingHeading(draft.text, draft.facets as Facet[]);
	const suffix = `\n\n${article.teaser}`;
	// 抜粋を切り詰めたときに足す「…」のぶんも先に席を取っておく。
	const reserved = {
		graphemes:
			[...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(suffix)].length + 1,
		bytes: encoder.encode(suffix).length + encoder.encode('…').length,
	};
	const [head] = splitForBluesky(body.text, body.facets, reserved);
	const excerpt = head?.text ?? '';
	const truncated = excerpt.length < body.text.trim().length;
	const text = `${excerpt}${truncated ? '…' : ''}${suffix}`;
	// 誘導文の URL をリンクにする。URL は末尾にあるので最後の出現位置を見る。
	const urlOffset = text.lastIndexOf(article.url);
	const byteStart = encoder.encode(text.slice(0, urlOffset)).length;
	return {
		text,
		excerpt: `${excerpt}${truncated ? '…' : ''}`,
		facets: [
			...(head?.facets ?? []),
			{
				index: { byteStart, byteEnd: byteStart + encoder.encode(article.url).length },
				features: [{ $type: 'app.bsky.richtext.facet#link' as const, uri: article.url }],
			},
		],
	};
}

/**
 * ブログとして書いた投稿を Bluesky に1件だけ出す。
 *
 * 記事を crosspostToBluesky に流すと 300 グラフェムごとの分割連投になり、
 * Bluesky のタイムラインが1本の記事で埋まってしまう。代わりに冒頭の抜粋と
 * Nagi への誘導リンクだけを載せた「ティーザー」を1件投稿する。
 * 本文全体は Nagi と standard.site の document が持つ。
 */
export async function crosspostArticleToBluesky(
	draft: PostDraft,
	assets: PostAssets,
	article: { url: string; title: string; teaser: string },
): Promise<StrongRef | undefined> {
	if (draft.kossori || draft.channel || draft.cwRestricted) return;
	const current = get(session);
	if (!current) throw new Error('Authentication required');

	const { text, facets, excerpt } = buildArticleTeaser(draft, article);
	const selfLabels = getCrosspostSelfLabels(draft);
	// 画像は本文添付にせず、誘導リンクのカードのサムネイルとして使う。
	// 「読みに行く先がある」ことを見た目でも示したいため。
	// ヘッダー画像は 1MB 未満に圧縮しているが、通常の画像ピッカー（2MB まで）から
	// 入れた1枚目が先頭に来ることもあるので、上限を超える blob はサムネを諦める
	// （付けたまま投稿するとレコードごと弾かれ、ティーザー自体が出ない）。
	const first = assets.images[0]?.image as { size?: unknown } | undefined;
	const thumb =
		typeof first?.size === 'number' && first.size > 0 && first.size < MAX_THUMB_BYTES
			? first
			: undefined;
	const response = await new Agent(current).com.atproto.repo.createRecord({
		repo: current.did,
		collection: BSKY_POST,
		record: {
			$type: BSKY_POST,
			text,
			facets,
			langs: draft.langs,
			...(selfLabels?.length
				? { labels: { $type: 'com.atproto.label.defs#selfLabels', values: selfLabels } }
				: {}),
			createdAt: draft.createdAt,
			via: VIA,
			embed: {
				$type: 'app.bsky.embed.external',
				external: {
					uri: article.url,
					title: article.title,
					description: excerpt,
					...(thumb ? { thumb } : {}),
				},
			},
		},
	});
	return { uri: response.data.uri, cid: response.data.cid };
}
