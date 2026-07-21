import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import type { EmojiView } from '$lib/api/types';
import { APPVIEW_URL } from '$lib/api/appview';

/** Bluemoji の絵文字定義レコード。カスタム絵文字はユーザー自身の PDS に置く。 */
export const BLUEMOJI_ITEM = 'blue.moji.collection.item';
/** ラスタ形式は長辺 128px。1 ページに多数並ぶため blob も小さく保つ。 */
export const EMOJI_SIZE = 128;
export const MAX_EMOJI_BLOB_SIZE = 128_000;
export const MAX_EMOJI_INPUT_SIZE = 5_000_000;
export const EMOJI_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,32}$/;

const SUPPORTED_EMOJI_TYPES = ['image/png', 'image/webp', 'image/gif', 'image/apng'];
/** blob の mimeType と formats_v1 のフィールド名の対応。 */
const FORMAT_KEY: Record<string, string> = {
	'image/png': 'png_128',
	'image/webp': 'webp_128',
	'image/gif': 'gif_128',
	'image/apng': 'apng_128',
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

export const resolveEmojiUrl = (url: string) => (url.startsWith('/') ? APPVIEW_URL + url : url);
export const displayEmojiName = (name: string) => name.replace(/^:|:$/g, '');

const canvasBlob = (canvas: HTMLCanvasElement, quality: number) =>
	new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));

/**
 * 絵文字用に画像を整える。アルファチャンネルは canvas も WebP も保持するので、
 * 透過PNGは透過のまま扱える。アニメーション（GIF/APNG）は canvas を通すと 1 コマ目に
 * 潰れてしまうので再エンコードせず、サイズ超過なら拒否する。
 */
export async function processEmojiImage(file: File): Promise<Blob> {
	if (!SUPPORTED_EMOJI_TYPES.includes(file.type))
		throw new EmojiProcessingError('Unsupported image type', 'type');
	if (file.size > MAX_EMOJI_INPUT_SIZE)
		throw new EmojiProcessingError('Image input is too large', 'input-size');
	if (file.type === 'image/gif' || file.type === 'image/apng') {
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
	url?: string;
};

// AppView と同じ優先順位。アニメーションを優先しつつ <img> で描画できる形式のみ使う。
const FORMAT_PRIORITY = ['apng_128', 'gif_128', 'webp_128', 'png_128'] as const;
const blobUrlOf = (did: string, formats: unknown) => {
	const values = (formats ?? {}) as Record<string, { ref?: { $link?: unknown } }>;
	for (const key of FORMAT_PRIORITY) {
		const link = values[key]?.ref?.$link;
		if (typeof link === 'string')
			return resolveEmojiUrl(`/api/blob/${encodeURIComponent(did)}/${link}`);
	}
	return undefined;
};

export async function listMyBluemoji(): Promise<MyEmoji[]> {
	const s = current();
	const agent = new Agent(s);
	const items: MyEmoji[] = [];
	let cursor: string | undefined;
	do {
		const response = await agent.com.atproto.repo.listRecords({
			repo: s.did,
			collection: BLUEMOJI_ITEM,
			limit: 100,
			cursor,
		});
		for (const record of response.data.records) {
			const value = record.value as { name?: unknown; alt?: unknown; formats?: unknown };
			if (typeof value.name !== 'string') continue;
			items.push({
				rkey: record.uri.slice(record.uri.lastIndexOf('/') + 1),
				uri: record.uri,
				cid: record.cid,
				name: value.name,
				alt: typeof value.alt === 'string' ? value.alt : undefined,
				url: blobUrlOf(s.did, value.formats),
			});
		}
		cursor = response.data.cursor;
	} while (cursor);
	return items;
}

export async function createBluemojiItem(name: string, blob: Blob, alt = '') {
	const s = current();
	const agent = new Agent(s);
	const uploaded = await agent.com.atproto.repo.uploadBlob(blob, { encoding: blob.type });
	const formatKey = FORMAT_KEY[blob.type];
	if (!formatKey) throw new EmojiProcessingError('Unsupported image type', 'type');
	const alias = `:${name}:`;
	return agent.com.atproto.repo.putRecord({
		repo: s.did,
		collection: BLUEMOJI_ITEM,
		rkey: name,
		validate: false,
		record: {
			$type: BLUEMOJI_ITEM,
			name: alias,
			...(alt ? { alt } : {}),
			adultOnly: false,
			fallbackText: alias,
			createdAt: new Date().toISOString(),
			formats: {
				$type: `${BLUEMOJI_ITEM}#formats_v1`,
				[formatKey]: uploaded.data.blob,
			},
		},
	});
}

export async function deleteBluemoji(rkey: string) {
	const s = current();
	return new Agent(s).com.atproto.repo.deleteRecord({
		repo: s.did,
		collection: BLUEMOJI_ITEM,
		rkey,
	});
}

/** リアクションレコードに載せる参照。formats は AppView がインデックスから補う。 */
export const bluemojiRefOf = (emoji: EmojiView) => ({
	uri: emoji.uri,
	cid: emoji.cid,
	name: emoji.name,
	...(emoji.alt ? { alt: emoji.alt } : {}),
});
