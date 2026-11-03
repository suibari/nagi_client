import { NAGI_PUBLIC_ORIGIN } from '$lib/standardsite/types';
import { IMAGE_LINE } from '$lib/atproto/markdown';

/**
 * 記事本文に書く画像の URL。Nagi の公開オリジンから AppView の blob プロキシへ
 * 転送する（vercel.json の rewrite）。standard.site の他のリーダーでもそのまま表示でき、
 * PDS を移転しても URL が変わらない。
 */
export function inlineImageUrl(did: string, cid: string): string {
	return `${NAGI_PUBLIC_ORIGIN}/api/blob/${did}/${cid}`;
}

const BLOB_PATH = /^\/api\/blob\/([^/]+)\/([a-zA-Z0-9]+)\/?$/;

/**
 * blob の URL から「DID/CID」の照合キーを取り出す。本文の URL（Nagi の公開オリジン）と
 * AppView が返す画像の URL（AppView 相対や AppView のオリジン）を同じキーにそろえる。
 * Nagi の blob 以外の URL は undefined（外部の画像は本文に読み込まない）。
 */
export function blobKey(url: string, allowedOrigins: readonly string[] = []): string | undefined {
	let parsed: URL;
	try {
		parsed = new URL(url, NAGI_PUBLIC_ORIGIN);
	} catch {
		return undefined;
	}
	if (parsed.origin !== NAGI_PUBLIC_ORIGIN && !allowedOrigins.includes(parsed.origin))
		return undefined;
	const match = BLOB_PATH.exec(parsed.pathname);
	if (!match) return undefined;
	try {
		return `${decodeURIComponent(match[1])}/${match[2]}`;
	} catch {
		return undefined;
	}
}

/** 本文に1行画像として置かれている blob の照合キー。 */
export function inlineImageKeys(text: string): Set<string> {
	const keys = new Set<string>();
	for (const line of text.split('\n')) {
		const match = IMAGE_LINE.exec(line);
		const key = match && blobKey(match[2]);
		if (key) keys.add(key);
	}
	return keys;
}

/** `![alt](url)` の alt に入れられない文字（改行と閉じ角括弧）を落とす。 */
export function imageMarkdown(alt: string, url: string): string {
	return `![${alt.replace(/[\]\n\r\\]/g, ' ').trim()}](${url})`;
}

/**
 * Nagi の blob を指す画像行のうち、known（DID/CID）に無いものを本文から落とす。
 * 下書きは画像を保存しないので、戻した本文には添付の無い画像行が残りうる。
 * Nagi 以外の URL の画像行はそのまま残す。
 */
export function pruneInlineImages(text: string, known: ReadonlySet<string>): string {
	return text
		.split('\n')
		.filter((line) => {
			const match = IMAGE_LINE.exec(line);
			const key = match && blobKey(match[2]);
			return !key || known.has(key);
		})
		.join('\n');
}
