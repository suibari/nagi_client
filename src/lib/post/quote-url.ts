import { getThread } from '$lib/api/appview';
import type { PostView } from '$lib/api/types';
import { NAGI_PUBLIC_ORIGIN } from '$lib/standardsite/types';

const POST_COLLECTION = 'com.suibari.nagi.post';

export type QuoteUrlTarget = { did: string; rkey: string };
export type QuoteResolution =
	{ ok: true; post: PostView } | { ok: false; reason: 'notFound' | 'forbidden' };

/**
 * 貼り付けられた文字列が Nagi のスレッドURL（/thread/{did}/{rkey}）なら、その参照先を返す。
 *
 * 「文字列全体が単一URL」のときだけ受ける。本文ごとコピーした文章の中にたまたま
 * スレッドURLが含まれていた場合まで引用へ吸い上げると、入力を奪ってしまうため。
 */
export function parseNagiPostUrl(input: string | undefined | null): QuoteUrlTarget | undefined {
	if (!input) return undefined;
	const source = input.trim();
	// 空白を含む＝URL単体ではない。
	if (!source || /\s/.test(source)) return undefined;
	// '//example.com' はプロトコル相対の外部URLなので相対パス扱いしない。
	const relative = source.startsWith('/') && !source.startsWith('//');
	let url: URL;
	try {
		// 本番からコピーしたURLをローカル／TWAで貼っても通るよう、相対解決の基準は
		// 公開オリジンにしておく（相対パスならどのみち同じ結果になる）。
		url = new URL(source, NAGI_PUBLIC_ORIGIN);
	} catch {
		return undefined;
	}
	if (!relative && !isNagiOrigin(url.origin)) return undefined;
	const segments = url.pathname.split('/').filter(Boolean);
	if (segments.length !== 3 || segments[0] !== 'thread') return undefined;
	const [, did, rkey] = segments;
	if (!did.startsWith('did:') || !rkey) return undefined;
	return { did: decodeURIComponent(did), rkey: decodeURIComponent(rkey) };
}

/** 現在のオリジン（ローカル開発・TWA を含む）と、本番の公開オリジンを内部として扱う。 */
function isNagiOrigin(origin: string): boolean {
	if (origin === NAGI_PUBLIC_ORIGIN) return true;
	return typeof window !== 'undefined' && origin === window.location.origin;
}

export function postUriFromTarget(target: QuoteUrlTarget): string {
	return `at://${target.did}/${POST_COLLECTION}/${target.rkey}`;
}

/**
 * スレッドURLから引用対象の投稿を取り、引用してよい相手かを判定する。
 * 引用できるのは自分の投稿と botたんの投稿だけ（吹き出しの引用ボタンと同じ条件）。
 *
 * URL として解釈できないときは undefined を返す（＝引用の話ではない）。
 */
export async function resolveQuoteFromUrl(
	input: string,
	viewerDid: string | undefined,
): Promise<QuoteResolution | undefined> {
	const target = parseNagiPostUrl(input);
	if (!target) return undefined;
	return resolveQuoteFromUri(postUriFromTarget(target), viewerDid);
}

/** 下書き復元のように、既に AT-URI を持っている場合の入口。判定は URL 経路と同じ。 */
export async function resolveQuoteFromUri(
	uri: string,
	viewerDid: string | undefined,
): Promise<QuoteResolution> {
	let candidates: PostView[];
	try {
		const { thread } = await getThread(uri);
		// getThread は返信のURIで叩いてもルートを起点にスレッド全体を返すので、
		// 目的の投稿は replies 側にいることがある。削除済みは replies から除かれる。
		candidates = [thread.post, ...thread.replies];
	} catch {
		return { ok: false, reason: 'notFound' };
	}
	const post = candidates.find((view) => view.uri === uri);
	if (!post || post.deleted) return { ok: false, reason: 'notFound' };
	// isBot は AppView が付ける（クライアントに bot の DID を持たせない）。
	if (!post.isBot && (!viewerDid || post.author.did !== viewerDid))
		return { ok: false, reason: 'forbidden' };
	return { ok: true, post };
}
