import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import type { BluemojiFacetFormats, EmojiView } from '$lib/api/types';
import { APPVIEW_URL, searchEmojis } from '$lib/api/appview';
import { listRecords as pdsListRecords, resolvePdsUrl } from '$lib/atproto/pds';

/** Bluemoji の絵文字定義レコード。カスタム絵文字はユーザー自身の PDS に置く。 */
export const BLUEMOJI_ITEM = 'blue.moji.collection.item';
/** Nagi で作成した Bluemoji を識別する、同じ rkey のサイドカーレコード。 */
export const NAGI_BLUEMOJI = 'com.suibari.nagi.bluemoji';
/** ラスタ形式は長辺 128px。1 ページに多数並ぶため blob も小さく保つ。 */
export const EMOJI_SIZE = 128;
export const MAX_EMOJI_BLOB_SIZE = 262_144;
export const MAX_EMOJI_INLINE_SIZE = 65_536;
export const MAX_EMOJI_ORIGINAL_SIZE = 1_000_000;
export const MAX_EMOJI_INPUT_SIZE = 5_000_000;
export const EMOJI_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,32}$/;

export const SUPPORTED_EMOJI_TYPES = [
	'image/png',
	'image/webp',
	'image/gif',
	'image/apng',
	'application/lottie+zip',
] as const;
/** blob の mimeType と formats_v0 のフィールド名の対応。 */
const FORMAT_KEY: Record<string, string> = {
	'image/png': 'png_128',
	'image/webp': 'webp_128',
	'image/gif': 'gif_128',
};
const FORMATS_V0 = `${BLUEMOJI_ITEM}#formats_v0`;

/**
 * 絵文字名を rkey にすると、同名の旧形式レコードが PDS に残っている場合に create が
 * 衝突する。Bluemoji は key:any なので、名前とは独立した十分にランダムなキーを使う。
 */
const createBluemojiRkey = () => {
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	return `nagi_${[...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')}`;
};

export class EmojiProcessingError extends Error {
	constructor(
		message: string,
		readonly code: 'type' | 'input-size' | 'animated-size' | 'compress',
	) {
		super(message);
	}
}

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

export const resolveEmojiUrl = (url: string) => (url.startsWith('/') ? APPVIEW_URL + url : url);
export const displayEmojiName = (name: string) => name.replace(/^:|:$/g, '');

const canvasBlob = (canvas: HTMLCanvasElement, quality: number) =>
	new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));

export const emojiFileType = (file: File): (typeof SUPPORTED_EMOJI_TYPES)[number] | undefined => {
	if (file.name.toLowerCase().endsWith('.lottie')) return 'application/lottie+zip';
	if (file.name.toLowerCase().endsWith('.apng')) return 'image/apng';
	if (SUPPORTED_EMOJI_TYPES.includes(file.type as (typeof SUPPORTED_EMOJI_TYPES)[number]))
		return file.type as (typeof SUPPORTED_EMOJI_TYPES)[number];
	return undefined;
};

/**
 * 絵文字用に画像を整える。アルファチャンネルは canvas も WebP も保持するので、
 * 透過PNGは透過のまま扱える。アニメーション（GIF/APNG）は canvas を通すと 1 コマ目に
 * 潰れてしまうので再エンコードせず、サイズ超過なら拒否する。
 */
export async function processEmojiImage(file: File): Promise<Blob> {
	const type = emojiFileType(file);
	if (!type) throw new EmojiProcessingError('Unsupported image type', 'type');
	if (file.size > MAX_EMOJI_INPUT_SIZE)
		throw new EmojiProcessingError('Image input is too large', 'input-size');
	if (type === 'application/lottie+zip' || type === 'image/apng') {
		if (file.size > MAX_EMOJI_ORIGINAL_SIZE)
			throw new EmojiProcessingError('Animated image is too large', 'animated-size');
		return new Blob([file], { type });
	}
	if (type === 'image/gif') {
		if (file.size > MAX_EMOJI_BLOB_SIZE)
			throw new EmojiProcessingError('Animated image is too large', 'animated-size');
		return file;
	}

	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, EMOJI_SIZE / Math.max(bitmap.width, bitmap.height));
	// すでに 128px 以下で軽いなら再エンコードしない。非可逆WebPは透過の輪郭に
	// にじみが出ることがあるので、元のPNG/WebPをそのまま使えるならその方がきれい。
	if (scale === 1 && file.size <= MAX_EMOJI_BLOB_SIZE) {
		bitmap.close();
		return file;
	}
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	if (!context) {
		bitmap.close();
		throw new EmojiProcessingError('Canvas is unavailable', 'compress');
	}
	canvas.width = Math.max(1, Math.round(bitmap.width * scale));
	canvas.height = Math.max(1, Math.round(bitmap.height * scale));
	context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	bitmap.close();
	let output: Blob | null = null;
	for (const quality of [0.9, 0.8, 0.7, 0.6, 0.5]) {
		output = await canvasBlob(canvas, quality);
		if (output && output.size <= MAX_EMOJI_BLOB_SIZE) break;
	}
	if (!output || output.size > MAX_EMOJI_BLOB_SIZE)
		throw new EmojiProcessingError('Could not compress image', 'compress');
	return output;
}

export type MyEmoji = {
	rkey: string;
	uri: string;
	cid: string;
	name: string;
	alt?: string;
	adultOnly: boolean;
	did: string;
	url: string;
	mediaType: EmojiView['mediaType'];
	formats?: BluemojiFacetFormats;
};

type BlobRef = { ref?: { $link?: unknown }; mimeType?: unknown; size?: unknown };
const graphemeCount = (value: string) =>
	[...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value)].length;
const validSelfLabels = (value: unknown) => {
	const labels = value as { $type?: unknown; values?: unknown };
	return (
		labels?.$type === 'com.atproto.label.defs#selfLabels' &&
		Array.isArray(labels.values) &&
		labels.values.length <= 20 &&
		labels.values.every((label) => {
			const val = (label as { val?: unknown })?.val;
			return typeof val === 'string' && val.length > 0 && val.length <= 128;
		})
	);
};
const validAtUri = (value: unknown) =>
	typeof value === 'string' && /^at:\/\/[^/\s]+\/[^/\s]+\/[^/\s]+$/.test(value);
const validBlob = (
	value: BlobRef | undefined,
	maxSize: number,
	accept: (type: string) => boolean,
) =>
	typeof value?.ref?.$link === 'string' &&
	typeof value.mimeType === 'string' &&
	accept(value.mimeType) &&
	Number.isInteger(value.size) &&
	(value.size as number) >= 0 &&
	(value.size as number) <= maxSize;
const validBytes = (value: unknown) => {
	const bytes = (value as { $bytes?: unknown })?.$bytes;
	if (typeof bytes !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(bytes)) return undefined;
	try {
		const decoded = atob(bytes);
		if (
			decoded.length > MAX_EMOJI_INLINE_SIZE ||
			btoa(decoded).replace(/=+$/, '') !== bytes.replace(/=+$/, '')
		)
			return undefined;
		return bytes;
	} catch {
		return undefined;
	}
};
const pdsBlobUrl = (pds: string, did: string, cid: string) => {
	const params = new URLSearchParams({ did, cid });
	return `${pds}/xrpc/com.atproto.sync.getBlob?${params}`;
};
const directMediaOf = (
	pds: string,
	did: string,
	raw: unknown,
): Pick<MyEmoji, 'url' | 'mediaType' | 'formats'> | undefined => {
	const formats = raw as Record<string, any>;
	if (!formats || formats.$type !== FORMATS_V0) return undefined;
	const lottie = validBytes(formats.lottie);
	if (lottie)
		return {
			url: `data:application/lottie+zip;base64,${lottie}`,
			mediaType: 'application/lottie+zip',
			formats: { $type: 'blue.moji.richtext.facet#formats_v0', lottie: true },
		};
	const apng = validBytes(formats.apng_128);
	if (apng)
		return {
			url: `data:image/apng;base64,${apng}`,
			mediaType: 'image/apng',
			formats: { $type: 'blue.moji.richtext.facet#formats_v0', apng_128: true },
		};
	for (const [key, mediaType] of [
		['gif_128', 'image/gif'],
		['webp_128', 'image/webp'],
		['png_128', 'image/png'],
	] as const) {
		const blob = formats[key] as BlobRef | undefined;
		const link = blob?.ref?.$link;
		if (validBlob(blob, MAX_EMOJI_BLOB_SIZE, (type) => type.length > 0) && typeof link === 'string')
			return {
				url: pdsBlobUrl(pds, did, link),
				mediaType,
				formats: {
					$type: 'blue.moji.richtext.facet#formats_v0',
					[key]: link,
				},
			};
	}
	const original = formats.original as BlobRef | undefined;
	if (
		validBlob(
			original,
			MAX_EMOJI_ORIGINAL_SIZE,
			(type) => type.startsWith('image/') || type === 'application/lottie+zip',
		)
	)
		return {
			url: pdsBlobUrl(pds, did, original!.ref!.$link as string),
			mediaType: original!.mimeType as EmojiView['mediaType'],
		};
	return undefined;
};

let myEmojiCache: { did: string; promise: Promise<MyEmoji[]> } | undefined;

export function invalidateMyBluemojiCache() {
	myEmojiCache = undefined;
}

async function fetchMyBluemoji(): Promise<MyEmoji[]> {
	const s = current();
	const pds = await resolvePdsUrl(s.did);
	const items: MyEmoji[] = [];
	let cursor: string | undefined;
	do {
		const response = await pdsListRecords(s.did, BLUEMOJI_ITEM, { limit: 100, cursor });
		for (const record of response.records) {
			const value = record.value as {
				$type?: unknown;
				name?: unknown;
				alt?: unknown;
				formats?: unknown;
				fallbackText?: unknown;
				createdAt?: unknown;
				adultOnly?: unknown;
				copyOf?: unknown;
				labels?: unknown;
			};
			const media = directMediaOf(pds, s.did, value.formats);
			if (
				typeof record.cid !== 'string' ||
				value.$type !== BLUEMOJI_ITEM ||
				typeof value.name !== 'string' ||
				(value.alt !== undefined && typeof value.alt !== 'string') ||
				(value.adultOnly !== undefined && typeof value.adultOnly !== 'boolean') ||
				(value.copyOf !== undefined && !validAtUri(value.copyOf)) ||
				(value.labels !== undefined && !validSelfLabels(value.labels)) ||
				typeof value.createdAt !== 'string' ||
				Number.isNaN(Date.parse(value.createdAt)) ||
				(value.fallbackText !== undefined &&
					(typeof value.fallbackText !== 'string' ||
						value.fallbackText.length > 10 ||
						graphemeCount(value.fallbackText) > 1)) ||
				!media
			)
				continue;
			items.push({
				rkey: record.uri.slice(record.uri.lastIndexOf('/') + 1),
				uri: record.uri,
				cid: record.cid,
				name: value.name,
				alt: typeof value.alt === 'string' ? value.alt : undefined,
				adultOnly: value.adultOnly === true,
				did: s.did,
				...media,
			});
		}
		cursor = response.cursor;
	} while (cursor);
	return items;
}

export function listMyBluemoji(): Promise<MyEmoji[]> {
	const s = current();
	if (myEmojiCache?.did === s.did) return myEmojiCache.promise;
	const promise = fetchMyBluemoji().catch((error) => {
		if (myEmojiCache?.promise === promise) myEmojiCache = undefined;
		throw error;
	});
	myEmojiCache = { did: s.did, promise };
	return promise;
}

export type AvailableEmojiCursor = {
	ownOffset: number;
	appviewCursor?: string;
};

/** 本人PDSを優先し、使い切った後だけAppViewから他ユーザー分を取得する。 */
export async function searchAvailableBluemoji(opts: {
	q?: string;
	limit: number;
	cursor?: AvailableEmojiCursor;
	signal?: AbortSignal;
}) {
	const s = current();
	const q = opts.q?.trim().toLowerCase() ?? '';
	const own = (await listMyBluemoji()).filter((emoji) => {
		if (emoji.adultOnly) return false;
		if (!q) return true;
		return (
			displayEmojiName(emoji.name).toLowerCase().includes(q) || emoji.alt?.toLowerCase().includes(q)
		);
	});
	const ownOffset = opts.cursor?.ownOffset ?? 0;
	const emojis: EmojiView[] = own.slice(ownOffset, ownOffset + opts.limit);
	const nextOwnOffset = ownOffset + emojis.length;
	let appviewCursor = opts.cursor?.appviewCursor;
	if (nextOwnOffset < own.length)
		return {
			emojis,
			cursor: { ownOffset: nextOwnOffset, appviewCursor } satisfies AvailableEmojiCursor,
		};
	try {
		const remaining = opts.limit - emojis.length;
		if (remaining === 0)
			return {
				emojis,
				cursor: { ownOffset: own.length, appviewCursor } satisfies AvailableEmojiCursor,
			};
		if (remaining > 0) {
			const result = await searchEmojis({
				q: opts.q,
				excludeRepo: s.did,
				limit: remaining,
				cursor: appviewCursor,
				signal: opts.signal,
			});
			emojis.push(...result.emojis);
			appviewCursor = result.cursor;
		}
	} catch {
		// 本人PDSの絵文字はAppView障害や429から独立して利用できるようにする。
		appviewCursor = undefined;
	}
	return {
		emojis,
		cursor: appviewCursor
			? ({ ownOffset: own.length, appviewCursor } satisfies AvailableEmojiCursor)
			: undefined,
	};
}

export async function createBluemojiItem(name: string, blob: Blob, alt = '') {
	const s = current();
	const agent = new Agent(s);
	let formats: Record<string, unknown>;
	if (
		(blob.type === 'image/apng' || blob.type === 'application/lottie+zip') &&
		blob.size <= MAX_EMOJI_INLINE_SIZE
	) {
		const bytes = new Uint8Array(await blob.arrayBuffer());
		let binary = '';
		for (const byte of bytes) binary += String.fromCharCode(byte);
		formats = {
			$type: FORMATS_V0,
			[blob.type === 'image/apng' ? 'apng_128' : 'lottie']: { $bytes: btoa(binary) },
		};
	} else {
		const uploaded = await agent.com.atproto.repo.uploadBlob(blob, { encoding: blob.type });
		const formatKey = FORMAT_KEY[blob.type];
		if (!formatKey && blob.type !== 'image/apng' && blob.type !== 'application/lottie+zip')
			throw new EmojiProcessingError('Unsupported image type', 'type');
		formats = {
			$type: FORMATS_V0,
			[formatKey ?? 'original']: uploaded.data.blob,
		};
	}
	const alias = `:${name}:`;
	const createdAt = new Date().toISOString();
	const rkey = createBluemojiRkey();
	const subject = `at://${s.did}/${BLUEMOJI_ITEM}/${rkey}`;
	const response = await agent.com.atproto.repo.applyWrites({
		repo: s.did,
		validate: false,
		writes: [
			{
				$type: 'com.atproto.repo.applyWrites#create',
				collection: BLUEMOJI_ITEM,
				rkey,
				value: {
					$type: BLUEMOJI_ITEM,
					name: alias,
					...(alt ? { alt } : {}),
					adultOnly: false,
					fallbackText: '◌',
					createdAt,
					formats,
				},
			},
			{
				$type: 'com.atproto.repo.applyWrites#create',
				collection: NAGI_BLUEMOJI,
				rkey,
				value: {
					$type: NAGI_BLUEMOJI,
					subject,
					createdAt,
				},
			},
		],
	});
	invalidateMyBluemojiCache();
	return response;
}

export async function deleteBluemoji(rkey: string) {
	const s = current();
	const agent = new Agent(s);
	try {
		await agent.com.atproto.repo.deleteRecord({
			repo: s.did,
			collection: BLUEMOJI_ITEM,
			rkey,
		});
	} catch (error) {
		// 前回、本体削除後にサイドカーの削除だけ失敗した場合も再試行できるようにする。
		if (!isRecordNotFound(error)) throw error;
	}
	try {
		await agent.com.atproto.repo.deleteRecord({
			repo: s.did,
			collection: NAGI_BLUEMOJI,
			rkey,
		});
	} catch (error) {
		// 他アプリ作成分と導入前の Nagi 作成分にはサイドカーがない。
		if (!isRecordNotFound(error)) throw error;
	}
	invalidateMyBluemojiCache();
}

/** リアクションレコードに載せる参照。formats は AppView がインデックスから補う。 */
export const bluemojiRefOf = (emoji: EmojiView) => ({
	uri: emoji.uri,
	cid: emoji.cid,
	name: emoji.name,
	...(emoji.alt ? { alt: emoji.alt } : {}),
});
