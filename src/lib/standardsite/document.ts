import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { TID } from '@atproto/common-web';
import { ensureRecord } from '$lib/api/appview';
import { session } from '$lib/oauth/session.svelte';
import { ensurePublication } from './publication';
import { buildRecord, usableAsCoverImage } from './record';
import { DOCUMENT, type ArticleInput } from './types';

export { buildRecord, usableAsCoverImage } from './record';

const current = () => {
	const value = get(session);
	if (!value) throw new Error('Authentication required');
	return value;
};

const isRecordNotFound = (error: unknown) =>
	typeof error === 'object' &&
	error !== null &&
	(('error' in error && (error as { error?: unknown }).error === 'RecordNotFound') ||
		('message' in error &&
			typeof (error as { message?: unknown }).message === 'string' &&
			(error as { message: string }).message.includes('RecordNotFound')));

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

/**
 * 投稿を standard.site の記事として公開する。
 * document の rkey には元の Nagi 投稿の rkey をそのまま使う（どちらも key: tid）。
 * これで対応表を持たずに編集・削除を追従できる。
 */
export async function publishStandardSiteDocument(input: Omit<ArticleInput, 'rkey'> & { rkey?: string }): Promise<{ uri: string; cid: string }> {
	const s = current();
	const site = await ensurePublication();
	const rkey = input.rkey ?? TID.nextStr();
	const response = await new Agent(s).com.atproto.repo.putRecord({
		repo: s.did,
		collection: DOCUMENT,
		rkey,
		validate: false,
		record: buildRecord({ ...input, rkey }, site, s.did),
	});
	await ensureRecord(response.data.uri, response.data.cid).catch(() => undefined);
	return response.data;
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
	// description と textContent は markdown から作り直せるので、本文が消えたら落とす。
	// tags / coverImage / bskyPostRef は本文からは導けず、記事の公開時に一度だけ決まる。
	// 本文編集の追従（ChatBubble の syncStandardSiteDocument）はこれらを渡さないので、
	// ここで消すと編集のたびにヘッダー画像とタグが黙って失われる。
	for (const key of ['description', 'textContent'] as const) {
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
