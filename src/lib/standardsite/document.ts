import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import { stripMarkdown } from '$lib/atproto/markdown';
import { ensurePublication } from './publication';
import { DOCUMENT, MARKDOWN, MARKDOWN_TEXT, type ArticleInput } from './types';

const current = () => {
	const value = get(session);
	if (!value) throw new Error('Authentication required');
	return value;
};

/** document.description の上限。lexicon は 3000 graphemes だが、抜粋なので短く切る。 */
const DESCRIPTION_GRAPHEMES = 200;
/** coverImage は 1MB 未満という lexicon の制約があるので、超える画像は付けない。 */
const COVER_IMAGE_MAX_BYTES = 1_000_000;

const isRecordNotFound = (error: unknown) =>
	typeof error === 'object' &&
	error !== null &&
	(('error' in error && (error as { error?: unknown }).error === 'RecordNotFound') ||
		('message' in error &&
			typeof (error as { message?: unknown }).message === 'string' &&
			(error as { message: string }).message.includes('RecordNotFound')));

function excerpt(plain: string): string {
	const segments = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(plain)];
	if (segments.length <= DESCRIPTION_GRAPHEMES) return plain;
	return `${segments
		.slice(0, DESCRIPTION_GRAPHEMES)
		.map((s) => s.segment)
		.join('')}…`;
}

/**
 * 投稿の tag facet を document.tags へ。lexicon が「先頭に # を付けるな」と明記している。
 * 呼び出し元によって facet の型が composer 由来／AppView 由来で異なるので、
 * 構造だけを見る緩い型で受けて中で絞り込む。
 */
export function tagsFromFacets(facets: readonly { features?: unknown }[] = []): string[] {
	const tags = new Set<string>();
	for (const facet of facets) {
		if (!Array.isArray(facet.features)) continue;
		for (const feature of facet.features) {
			if (typeof feature !== 'object' || feature === null) continue;
			const candidate = feature as { $type?: unknown; tag?: unknown };
			if (candidate.$type === 'app.bsky.richtext.facet#tag' && typeof candidate.tag === 'string') {
				tags.add(candidate.tag.replace(/^#+/, ''));
			}
		}
	}
	return [...tags];
}

/** BlobRef が coverImage として使えるサイズか。 */
export function usableAsCoverImage(blob: unknown): boolean {
	if (!blob || typeof blob !== 'object') return false;
	const size = (blob as { size?: unknown }).size;
	return typeof size === 'number' && size > 0 && size < COVER_IMAGE_MAX_BYTES;
}

function buildRecord(input: ArticleInput, site: string, did: string) {
	const plain = stripMarkdown(input.markdown);
	return {
		$type: DOCUMENT,
		site,
		title: input.title,
		// publication.url（Nagi 本体）と連結して canonical URL になる。
		path: `/thread/${did}/${input.rkey}`,
		publishedAt: input.publishedAt,
		...(plain ? { description: excerpt(plain), textContent: plain } : {}),
		content: {
			$type: MARKDOWN,
			// Nagi の描画は独自の縮小 markdown パーサなので、既知のレンダラ名は書かない
			// （lexicon も「分からないなら renderingRules は省け」としている）。
			flavor: 'commonmark',
			text: { $type: MARKDOWN_TEXT, markdown: input.markdown },
		},
		...(input.tags.length ? { tags: input.tags } : {}),
		...(input.coverImage !== undefined ? { coverImage: input.coverImage } : {}),
	};
}

/**
 * 投稿を standard.site の記事として公開する。
 * document の rkey には元の Nagi 投稿の rkey をそのまま使う（どちらも key: tid）。
 * これで対応表を持たずに編集・削除を追従できる。
 */
export async function publishStandardSiteDocument(input: ArticleInput): Promise<string> {
	const s = current();
	const site = await ensurePublication();
	const response = await new Agent(s).com.atproto.repo.putRecord({
		repo: s.did,
		collection: DOCUMENT,
		rkey: input.rkey,
		validate: false,
		record: buildRecord(input, site, s.did),
	});
	return response.data.uri;
}

/**
 * 既存の記事を投稿の編集に追従させる。まだ記事化されていない投稿なら何もしない
 * （編集をきっかけに勝手に公開しない）。site / publishedAt / 未知フィールドは保持する。
 */
export async function updateStandardSiteDocument(
	rkey: string,
	input: Omit<ArticleInput, 'rkey' | 'publishedAt' | 'title'> & { title?: string },
): Promise<boolean> {
	const s = current();
	const agent = new Agent(s);
	let existing: Record<string, unknown>;
	try {
		const { data } = await agent.com.atproto.repo.getRecord({
			repo: s.did,
			collection: DOCUMENT,
			rkey,
		});
		existing = data.value as Record<string, unknown>;
	} catch (error) {
		if (isRecordNotFound(error)) return false;
		throw error;
	}
	// 既存の site は信用しない。初期実装が他アプリの publication を掴んでいたことがあるため、
	// 常に Nagi の publication へ張り直す（編集をきっかけに自己修復させる）。
	const site = await ensurePublication();
	const publishedAt =
		typeof existing.publishedAt === 'string' ? existing.publishedAt : new Date().toISOString();
	// 本文から見出しが取れなかった編集では、いま付いているタイトルを残す。
	const title =
		input.title ?? (typeof existing.title === 'string' ? existing.title : undefined) ?? '';
	if (!title) return false;
	const next = buildRecord({ ...input, title, rkey, publishedAt }, site, s.did);
	const record: Record<string, unknown> = {
		...existing,
		...next,
		updatedAt: new Date().toISOString(),
	};
	// 画像や本文が消えた場合に古い値が残らないよう、次のレコードに無いものは落とす。
	for (const key of ['description', 'textContent', 'tags', 'coverImage'] as const) {
		if (!(key in next)) delete record[key];
	}
	await agent.com.atproto.repo.putRecord({
		repo: s.did,
		collection: DOCUMENT,
		rkey,
		validate: false,
		record,
	});
	return true;
}

/** 投稿の削除に追従して記事も消す。記事化していない投稿では何も起きない。 */
export async function deleteStandardSiteDocument(rkey: string): Promise<void> {
	const s = current();
	try {
		await new Agent(s).com.atproto.repo.deleteRecord({
			repo: s.did,
			collection: DOCUMENT,
			rkey,
		});
	} catch (error) {
		if (!isRecordNotFound(error)) throw error;
	}
}
