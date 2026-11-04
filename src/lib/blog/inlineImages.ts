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
	return new Set(inlineImageAlts(text).keys());
}

/**
 * 本文に1行画像として置かれている blob の照合キーと、その行の alt（`![alt](url)`）。
 * 記事の入力欄では alt を本文の行で持つので、添付の alt をこれに合わせる。
 */
export function inlineImageAlts(text: string): Map<string, string> {
	const alts = new Map<string, string>();
	for (const line of text.split('\n')) {
		const match = IMAGE_LINE.exec(line);
		const key = match && blobKey(match[2]);
		if (key && !alts.has(key)) alts.set(key, match[1]);
	}
	return alts;
}

/**
 * 本文の画像行のうち alt が空のものへ、添付の alt（照合キーごと）を入れる。
 * 以前の記事は alt を添付だけに持つことがあり、本文の alt に揃える前に移しておく。
 */
export function fillInlineImageAlts(text: string, alts: ReadonlyMap<string, string>): string {
	return text
		.split('\n')
		.map((line) => {
			const match = IMAGE_LINE.exec(line);
			const key = match && blobKey(match[2]);
			const alt = key ? alts.get(key) : undefined;
			return match && !match[1] && alt ? imageMarkdown(alt, match[2]) : line;
		})
		.join('\n');
}

/** 画像の alt の上限（書記素）。添付の入力欄と同じ。 */
export const MAX_IMAGE_ALT = 1000;

export function limitAlt(alt: string): string {
	return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(alt)]
		.slice(0, MAX_IMAGE_ALT)
		.map((segment) => segment.segment)
		.join('');
}

/**
 * 記事の入力欄で、本文の行に置いた画像の扱い。placed は今の本文にある照合キー、seen は
 * この編集中に一度でも本文にあった照合キー。
 * - 本文にある画像は入力欄の中に出すので、下の一覧には出さない
 * - 行を消した画像（seen にあって placed に無い）は一覧にも投稿にも出さない。添付は
 *   残しておき、元に戻すで行が戻れば画像も戻る
 * - 一度も本文に無かった画像（行単位の配置に対応する前の記事の画像など）は一覧に残す
 */
export function inlineImageState(
	key: string | undefined,
	placed: ReadonlyMap<string, string> | ReadonlySet<string>,
	seen: ReadonlySet<string>,
): 'placed' | 'detached' | 'listed' {
	if (!key || !seen.has(key)) return 'listed';
	return placed.has(key) ? 'placed' : 'detached';
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
