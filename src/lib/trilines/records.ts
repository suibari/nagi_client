import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import { ensureRecord } from '$lib/api/appview';
import { sessionCovers } from '$lib/optin/scope-optin';
import { TRILINES_COLLECTION_SCOPE } from '$lib/oauth/client';
import type { ImageAttachment } from '$lib/images';
import { getDiaryDateKey } from './date';

/**
 * TriLinesAt の3行日記（com.suibari.trilinesat.diary）の読み書き。
 *
 * 正本は本人の PDS。TriLinesAt と Nagi のどちらから書いても同じレコードになり、
 * Nagi の AppView は Jetstream で取り込んで投稿として表示する。
 * Nagi の投稿（com.suibari.nagi.post）への複製は作らない。
 */
export const TRILINES_DIARY = 'com.suibari.trilinesat.diary';
/** TriLinesAt のグローバルフィードを Constellation で集めるための固定バックリンク先。 */
export const TRILINES_HUB_URI = 'at://did:plc:uixgxpiqf4i63p6rgpu7ytmx/app.bsky.actor.profile/self';
export const TRILINES_ORIGIN = 'https://trilinesat.suibari.com';
export const TRILINES_LINE_COUNT = 3;
export const TRILINES_LINE_MAX_GRAPHEMES = 50;
/** lexicon の line.image は 1MB まで。processImage の上限に渡す。 */
export const TRILINES_IMAGE_MAX_BYTES = 900_000;

/** 編集中の行の画像。既存は PDS 上の BlobRef をそのまま使い回す。 */
export type TrilinesLineImage =
	| { kind: 'existing'; blob: unknown; previewUrl: string }
	| { kind: 'new'; attachment: ImageAttachment };

export type TrilinesLineDraft = { text: string; alt: string; image?: TrilinesLineImage };

export type TrilinesRecordLine = { text: string; image?: unknown; alt?: string };
export type TrilinesRecord = {
	$type: typeof TRILINES_DIARY;
	lines: TrilinesRecordLine[];
	langs?: string[];
	createdAt: string;
	hubRef?: string;
	sharedPost?: { uri: string; cid: string };
};

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
export const graphemeCount = (value: string) => [...segmenter.segment(value)].length;

export const emptyTrilinesLines = (): TrilinesLineDraft[] =>
	Array.from({ length: TRILINES_LINE_COUNT }, () => ({ text: '', alt: '' }));

/** 投稿できる状態か。TriLinesAt と同じく3行すべてが書かれていて、どの行も上限以内。 */
export function trilinesSubmittable(lines: readonly TrilinesLineDraft[]): boolean {
	return (
		lines.length === TRILINES_LINE_COUNT &&
		lines.every((line) => {
			const count = graphemeCount(line.text.trim());
			return count > 0 && count <= TRILINES_LINE_MAX_GRAPHEMES;
		})
	);
}

/**
 * レコードの lines を組み立てる。空の行は詰める（TriLinesAt も空行は保存しない）。
 * 画像だけの行は作れない（lexicon で text が必須の行に、本文の無い画像を置かない）。
 */
export function buildTrilinesLines(
	lines: readonly TrilinesLineDraft[],
	blobs: readonly (unknown | undefined)[],
): TrilinesRecordLine[] {
	return lines.flatMap((line, index) => {
		const text = line.text.trim();
		if (!text) return [];
		const image = blobs[index];
		return [
			{
				text,
				...(image ? { image, ...(line.alt.trim() ? { alt: line.alt.trim() } : {}) } : {}),
			},
		];
	});
}

const current = () => {
	const value = get(session);
	if (!value) throw new Error('Authentication required');
	return value;
};

const rkeyOf = (uri: string) => uri.slice(uri.lastIndexOf('/') + 1);

/** 日記の書き込み権限があるか。導入前にログインした人は再認可が要る。 */
export const hasTrilinesScope = () => sessionCovers([TRILINES_COLLECTION_SCOPE]);

async function uploadLineImages(agent: Agent, lines: readonly TrilinesLineDraft[]) {
	return Promise.all(
		lines.map(async (line) => {
			if (!line.text.trim() || !line.image) return undefined;
			if (line.image.kind === 'existing') return line.image.blob;
			const { blob } = line.image.attachment;
			const response = await agent.com.atproto.repo.uploadBlob(blob, { encoding: blob.type });
			return response.data.blob as unknown;
		}),
	);
}

export async function createTrilinesDiary(
	lines: readonly TrilinesLineDraft[],
	langs: string[],
): Promise<{ uri: string; cid: string; record: TrilinesRecord }> {
	const s = current();
	const agent = new Agent(s);
	const blobs = await uploadLineImages(agent, lines);
	const record: TrilinesRecord = {
		$type: TRILINES_DIARY,
		lines: buildTrilinesLines(lines, blobs),
		...(langs.length ? { langs } : {}),
		createdAt: new Date().toISOString(),
		hubRef: TRILINES_HUB_URI,
	};
	const { data } = await agent.com.atproto.repo.createRecord({
		repo: s.did,
		collection: TRILINES_DIARY,
		validate: false,
		record,
	});
	await ensureRecord(data.uri, data.cid).catch(() => undefined);
	return { uri: data.uri, cid: data.cid, record };
}

export async function getOwnTrilinesDiary(
	rkey: string,
): Promise<{ uri: string; cid: string; value: TrilinesRecord }> {
	const s = current();
	const { data } = await new Agent(s).com.atproto.repo.getRecord({
		repo: s.did,
		collection: TRILINES_DIARY,
		rkey,
	});
	return { uri: data.uri, cid: data.cid ?? '', value: data.value as unknown as TrilinesRecord };
}

/** 行だけを書き換える。作成日時・共有先などほかの値は元のまま残す。 */
export async function updateTrilinesDiary(
	uri: string,
	lines: readonly TrilinesLineDraft[],
): Promise<{ uri: string; cid: string }> {
	const s = current();
	const agent = new Agent(s);
	const rkey = rkeyOf(uri);
	const existing = await getOwnTrilinesDiary(rkey);
	const blobs = await uploadLineImages(agent, lines);
	const { data } = await agent.com.atproto.repo.putRecord({
		repo: s.did,
		collection: TRILINES_DIARY,
		rkey,
		validate: false,
		swapRecord: existing.cid || undefined,
		record: { ...existing.value, lines: buildTrilinesLines(lines, blobs) },
	});
	await ensureRecord(data.uri, data.cid).catch(() => undefined);
	return { uri: data.uri, cid: data.cid };
}

export async function deleteTrilinesDiary(uri: string, cid?: string): Promise<void> {
	const s = current();
	const agent = new Agent(s);
	const rkey = rkeyOf(uri);
	const known =
		cid ??
		(await agent.com.atproto.repo
			.getRecord({ repo: s.did, collection: TRILINES_DIARY, rkey })
			.then((response) => response.data.cid)
			.catch(() => undefined));
	await agent.com.atproto.repo.deleteRecord({ repo: s.did, collection: TRILINES_DIARY, rkey });
	if (known) await ensureRecord(uri, known).catch(() => undefined);
}

/** Bluesky へ共有した投稿を日記へ書き戻す。日記が途中で編集されていたら諦める。 */
export async function attachSharedPost(
	created: { uri: string; cid: string; record: TrilinesRecord },
	sharedPost: { uri: string; cid: string },
): Promise<void> {
	const s = current();
	const { data } = await new Agent(s).com.atproto.repo.putRecord({
		repo: s.did,
		collection: TRILINES_DIARY,
		rkey: rkeyOf(created.uri),
		validate: false,
		swapRecord: created.cid,
		record: { ...created.record, sharedPost },
	});
	await ensureRecord(data.uri, data.cid).catch(() => undefined);
}

/**
 * 今日（正午区切り）の日記をもう書いているか。新しい順に数件だけ見る。
 * 投稿は止めず、警告を出すのに使う。読めなければ「書いていない」として扱う。
 */
export async function hasTrilinesDiaryToday(now: Date = new Date()): Promise<boolean> {
	const s = current();
	try {
		const { data } = await new Agent(s).com.atproto.repo.listRecords({
			repo: s.did,
			collection: TRILINES_DIARY,
			limit: 5,
		});
		const today = getDiaryDateKey(now);
		return data.records.some((item) => {
			const createdAt = (item.value as { createdAt?: unknown }).createdAt;
			return typeof createdAt === 'string' && getDiaryDateKey(createdAt) === today;
		});
	} catch {
		return false;
	}
}

/** TriLinesAt の日記ページ。 */
export const trilinesEntryUrl = (uri: string) => {
	const [, , did, , rkey] = uri.split('/');
	return `${TRILINES_ORIGIN}/entry/${did}/${rkey}`;
};
