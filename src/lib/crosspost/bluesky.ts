import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import { IMAGE_LINE, type Facet } from '$lib/atproto/facets';
import type { PostAssets, PostDraft } from '$lib/atproto/records';
import type { StrongRef } from '$lib/api/types';
import { BLUESKY_MEDIA_BLUR_LABELS, crosspostContentWarningBlock } from './content-warning';

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
		(BLUESKY_MEDIA_BLUR_LABELS as readonly string[]).includes(label.val),
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
 * 記事のリンクカード用抜粋で、省略記号のぶんを確保するために使う。
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
	// 動画は video.bsky.app が PDS へ置いた blob なので、Bluesky 側でもそのまま再生できる。
	// Bluesky には画像と動画を混ぜる embed が無いので、両方あるときは動画だけを送る。
	if (assets.video)
		return {
			$type: 'app.bsky.embed.video',
			video: assets.video.video,
			...(assets.video.alt ? { alt: assets.video.alt } : {}),
			...(assets.video.aspectRatio ? { aspectRatio: assets.video.aspectRatio } : {}),
		};
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

/** 組み立て済みの下書きについて、CW がクロスポストを止めるか。 */
export function crosspostDraftBlock(
	draft: Pick<PostDraft, 'text' | 'attachments' | 'video' | 'labels'>,
) {
	return crosspostContentWarningBlock({
		text: draft.text,
		mediaWarning: Boolean(
			draft.attachments.some((image) => image.contentWarning) || draft.video?.contentWarning,
		),
		labels: draft.labels?.values.map((label) => label.val) ?? [],
	});
}

/** Bluesky 側で続ける先。返信ならコピーへの返信、引用ならコピーの引用として出す。 */
export type CrosspostTarget = {
	reply?: { root: StrongRef; parent: StrongRef };
	quote?: StrongRef;
};

/** 作ったコピー。ref は Nagi の投稿レコードの crosspost にそのまま入れる。 */
export type CrosspostResult = {
	ref: { root: StrongRef; tail: StrongRef; threadRoot: StrongRef };
};

/**
 * 分割投稿の途中で失敗した。作った分は消さない（Bluesky の権限は作成だけ）ので、
 * 呼び出し側は Bluesky に途中までのコピーが残ったことを伝える。
 */
export class CrosspostPartialError extends Error {
	constructor(
		readonly posts: StrongRef[],
		cause: unknown,
	) {
		super('Crosspost was only partially created', { cause });
		this.name = 'CrosspostPartialError';
	}
}

/** 引用は先頭の1件にだけ付ける。画像・動画・リンクカードと一緒なら recordWithMedia にする。 */
function withQuote(embed: ReturnType<typeof buildEmbed>, quote: StrongRef | undefined) {
	if (!quote) return embed;
	const record = { $type: 'app.bsky.embed.record', record: quote };
	return embed ? { $type: 'app.bsky.embed.recordWithMedia', record, media: embed } : record;
}

/**
 * Nagi の投稿を Bluesky にも投稿する。
 * 300 文字を超える場合は分割し、2件目以降は直前の投稿へのリプライで芋づるに繋ぐ。
 * blob は Nagi 投稿でアップロード済みのものを使い回す（同一リポジトリ・同一サイズ上限）。
 *
 * target を渡すと、自分のクロスポスト済みの投稿への返信・引用として Bluesky でも続ける。
 * Nagi の投稿を保存した後に呼ぶ。1件目で失敗したら元の例外、2件目以降なら CrosspostPartialError を投げる。
 */
export async function crosspostToBluesky(
	draft: PostDraft,
	assets: PostAssets,
	target: CrosspostTarget = {},
): Promise<CrosspostResult | undefined> {
	// こっそり投稿と、Bluesky では伏せられない CW を含む投稿はクロスポストしない。
	if (draft.kossori || crosspostDraftBlock(draft)) return;
	const current = get(session);
	if (!current) throw new Error('Authentication required');
	const agent = new Agent(current);
	const { chunks, embed } = prepareCrosspostContent(draft, assets);
	const firstEmbed = withQuote(embed, target.quote);
	if (!chunks.length && firstEmbed) chunks.push({ text: '', facets: [] });
	if (!chunks.length) return;
	const base = Date.parse(draft.createdAt) || Date.now();
	const threadRoot = target.reply?.root;
	let root: StrongRef | undefined;
	let parent: StrongRef | undefined = target.reply?.parent;
	const created: StrongRef[] = [];
	const crosspostSelfLabels = getCrosspostSelfLabels(draft);

	try {
		for (const [index, chunk] of chunks.entries()) {
			const replyRoot = threadRoot ?? root;
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
					...(index === 0 && firstEmbed ? { embed: firstEmbed } : {}),
					...(replyRoot && parent ? { reply: { root: replyRoot, parent } } : {}),
				},
			});
			const ref = { uri: response.data.uri, cid: response.data.cid };
			created.push(ref);
			root ??= ref;
			parent = ref;
		}
	} catch (cause) {
		if (created.length) throw new CrosspostPartialError(created, cause);
		throw cause;
	}
	return { ref: { root: root!, tail: parent!, threadRoot: threadRoot ?? root! } };
}

/**
 * Bluesky のコピーがまだあるか。自分の PDS に聞く（1件ずつ getRecord）。
 * 無い（RecordNotFound）なら false、確かめられなかったら例外。
 */
export async function blueskyPostsExist(refs: StrongRef[]): Promise<boolean> {
	const current = get(session);
	if (!current) throw new Error('Authentication required');
	const agent = new Agent(current);
	for (const ref of refs) {
		const rkey = ref.uri.slice(ref.uri.lastIndexOf('/') + 1);
		try {
			await agent.com.atproto.repo.getRecord({ repo: current.did, collection: BSKY_POST, rkey });
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			if (
				/RecordNotFound|Could not locate record/i.test(message) ||
				(error as { error?: string })?.error === 'RecordNotFound'
			)
				return false;
			throw error;
		}
	}
	return true;
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
 * 記事本文に置いた画像の行（`![alt](url)`）を落とす。Bluesky の抜粋では記法のまま
 * 見えてしまうため。画像行は facet を持たないので、後ろの facet をずらすだけでよい。
 */
export function stripImageLines(text: string, facets: Facet[] = []) {
	const lines = text.split('\n');
	if (!lines.some((line) => IMAGE_LINE.test(line))) return { text, facets };
	let out = '';
	let byte = 0;
	// 落とした行（直後の改行ごと）の元のバイト位置と、そこまでに落とした累計バイト数。
	const removed: Array<{ end: number; total: number }> = [];
	let total = 0;
	for (const [index, line] of lines.entries()) {
		const chunk = index < lines.length - 1 ? `${line}\n` : line;
		const bytes = encoder.encode(chunk).length;
		if (IMAGE_LINE.test(line)) {
			total += bytes;
			removed.push({ end: byte + bytes, total });
		} else out += chunk;
		byte += bytes;
	}
	const shift = (at: number) =>
		removed.reduce((value, item) => (item.end <= at ? item.total : value), 0);
	return {
		text: out,
		facets: facets.map((facet) => ({
			...facet,
			index: {
				byteStart: facet.index.byteStart - shift(facet.index.byteStart),
				byteEnd: facet.index.byteEnd - shift(facet.index.byteStart),
			},
		})),
	};
}

/**
 * ブログの投稿通知と「Nagi」のリンク facet、リンクカード用の抜粋を組み立てる。
 * 通知文は呼び出し元が翻訳済みで渡す。
 */
export function buildArticleTeaser(
	draft: Pick<PostDraft, 'text' | 'facets'>,
	article: { url: string; teaser: string },
): CrosspostChunk & { excerpt: string } {
	const heading = stripLeadingHeading(draft.text, draft.facets as Facet[]);
	const body = stripImageLines(heading.text, heading.facets);
	const [head] = splitForBluesky(body.text, body.facets, {
		graphemes: 1,
		bytes: encoder.encode('…').length,
	});
	const excerpt = head?.text ?? '';
	const truncated = excerpt.length < body.text.trim().length;
	const text = article.teaser;
	const nagiOffset = text.indexOf(VIA);
	const byteStart = encoder.encode(text.slice(0, nagiOffset)).length;
	return {
		text,
		excerpt: `${excerpt}${truncated ? '…' : ''}`,
		facets:
			nagiOffset < 0
				? []
				: [
						{
							index: { byteStart, byteEnd: byteStart + encoder.encode(VIA).length },
							features: [{ $type: 'app.bsky.richtext.facet#link' as const, uri: article.url }],
						},
					],
	};
}

export type ArticleTeaserTarget = {
	url: string;
	title: string;
	teaser: string;
	/**
	 * 記事の site.standard.document と publication への強参照。Bluesky の AppView は
	 * external.associatedRefs に固定された版を読んで、出典・著者・読了時間つきのカードを出す
	 * （URL から記事を探しには行かない）。document が site で指す publication も必ず含める。
	 */
	associatedRefs?: StrongRef[];
};

/** ティーザーのリンクカード。associatedRefs が無ければ通常のリンクカードになる。 */
export function buildArticleEmbed(article: ArticleTeaserTarget, excerpt: string, thumb?: unknown) {
	return {
		$type: 'app.bsky.embed.external',
		external: {
			uri: article.url,
			title: article.title,
			description: excerpt,
			...(thumb ? { thumb } : {}),
			...(article.associatedRefs?.length
				? {
						associatedRefs: article.associatedRefs.map(({ uri, cid }) => ({
							$type: 'com.atproto.repo.strongRef',
							uri,
							cid,
						})),
					}
				: {}),
		},
	};
}

/**
 * ブログとして書いた投稿を Bluesky に1件だけ出す。
 *
 * 記事を crosspostToBluesky に流すと 300 グラフェムごとの分割連投になり、
 * Bluesky のタイムラインが1本の記事で埋まってしまう。代わりにリンク付きの
 * 投稿通知と記事のリンクカードを1件投稿する。
 * 本文全体は Nagi と standard.site の document が持つ。
 */
export async function crosspostArticleToBluesky(
	draft: PostDraft,
	assets: PostAssets,
	article: ArticleTeaserTarget,
): Promise<StrongRef | undefined> {
	// CW 付きはブログにできない（記事のリーダーではぼかしもラベルも効く保証が無い）ので、
	// ティーザーも cwRestricted で一律に止める。
	if (draft.kossori || draft.cwRestricted) return;
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
			embed: buildArticleEmbed(article, excerpt, thumb),
		},
	});
	return { uri: response.data.uri, cid: response.data.cid };
}
