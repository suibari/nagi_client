/**
 * Bluesky のフィード・投稿・ユーザーを bsky.app のどこへ飛ばすか。
 * Nagi は Bluesky のプロフィールやスレッドを作り込まず、見たいときは bsky.app で開いてもらう。
 * URL は DID で組む。ハンドルは変わるし、handle.invalid のこともある。
 */

const BSKY_APP = 'https://bsky.app';

/** AppView の parseFeedTabs と同じ形。片方だけ緩いと保存で弾かれる。 */
const FEED_GENERATOR_URI =
	/^at:\/\/(did:(?:plc|web):[^/]+)\/app\.bsky\.feed\.generator\/([A-Za-z0-9._~:-]{1,512})$/;
export const MAX_FEED_URI_LENGTH = 512;

export const isFeedGeneratorUri = (value: string) =>
	value.length <= MAX_FEED_URI_LENGTH && FEED_GENERATOR_URI.test(value);

type AtUriParts = { authority: string; collection: string; rkey: string };

function atUriParts(uri: string): AtUriParts | undefined {
	const match = /^at:\/\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(uri);
	return match ? { authority: match[1], collection: match[2], rkey: match[3] } : undefined;
}

const enc = encodeURIComponent;
/** DID とハンドルはパスにそのまま置ける文字だけでできている。それ以外は念のためエンコードする。 */
const actorSegment = (actor: string) => (/^[A-Za-z0-9._:%-]+$/.test(actor) ? actor : enc(actor));

export const bskyProfileUrl = (actor: string) => `${BSKY_APP}/profile/${actorSegment(actor)}`;

export const bskyHashtagUrl = (tag: string) => `${BSKY_APP}/hashtag/${enc(tag)}`;

/** at://did/app.bsky.feed.post/rkey → bsky.app の投稿ページ。形が違えば著者のプロフィールへ。 */
export function bskyPostUrl(uri: string): string | undefined {
	const parts = atUriParts(uri);
	if (!parts) return undefined;
	if (parts.collection !== 'app.bsky.feed.post') return bskyProfileUrl(parts.authority);
	return `${bskyProfileUrl(parts.authority)}/post/${enc(parts.rkey)}`;
}

export function bskyFeedUrl(uri: string): string | undefined {
	const parts = atUriParts(uri);
	if (!parts || parts.collection !== 'app.bsky.feed.generator') return undefined;
	return `${bskyProfileUrl(parts.authority)}/feed/${enc(parts.rkey)}`;
}

/**
 * 貼り付けられたフィードの指定を読む。bsky.app の URL か AT-URI を受け付ける。
 * actor がハンドルのときは呼び出し側で DID に解決する（ここはネットワークを使わない）。
 */
export function parseFeedInput(input: string): { actor: string; rkey: string } | undefined {
	const value = input.trim();
	if (value.startsWith('at://')) {
		const parts = atUriParts(value);
		if (!parts || parts.collection !== 'app.bsky.feed.generator') return undefined;
		return { actor: parts.authority, rkey: parts.rkey };
	}
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return undefined;
	}
	if (url.protocol !== 'https:' || url.hostname !== 'bsky.app') return undefined;
	const match = /^\/profile\/([^/]+)\/feed\/([^/]+)\/?$/.exec(url.pathname);
	if (!match) return undefined;
	try {
		return { actor: decodeURIComponent(match[1]), rkey: decodeURIComponent(match[2]) };
	} catch {
		return undefined;
	}
}

export const feedGeneratorUri = (did: string, rkey: string) =>
	`at://${did}/app.bsky.feed.generator/${rkey}`;
