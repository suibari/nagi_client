import { getOptIn } from '$lib/optin/scope-optin';

/**
 * 投稿範囲。右へ行くほど届く範囲が広がる排他的な3段階で、投稿範囲モーダルの
 * ゲージUIと1対1で対応する。
 *
 * - kossori: 共有タイムラインに本文を出さない（レコードの `kossori: true`）
 * - feed:    いま見ているフィードに出す。チャンネルページならそのチャンネル投稿になる
 * - external: feed に加えて、設定で選んだ外部サービスにも出す
 *
 * 以前は「こっそりトグル」「standard.site トグル」「Blueskyにも送信ボタン」が
 * 独立して並んでおり、組み合わせの可否がユーザーから見えなかった。1本の軸に
 * まとめることで「広げる/狭める」だけの操作にしている。
 */
export type PostScope = 'kossori' | 'feed' | 'external';

export const POST_SCOPES: PostScope[] = ['kossori', 'feed', 'external'];

const SCOPE_KEY = 'nagi-last-post-scope';
const TARGET_KEY = 'nagi-external-target';

/** 自分とリストの人しか居ない場所。従来のホームタブと同じくこっそりを既定にする。 */
const HOME_LIKE = new Set<string>(['/', '/feed']);

function read(key: string): string | null {
	if (typeof window === 'undefined') return null;
	try {
		return window.localStorage.getItem(key);
	} catch {
		return null;
	}
}

export function getLastPostScope(): PostScope | null {
	const stored = read(SCOPE_KEY);
	if (stored === 'kossori' || stored === 'feed' || stored === 'external') return stored;
	return null;
}

export function setLastPostScope(scope: PostScope) {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(SCOPE_KEY, scope);
	} catch {
		// 保存できなくても投稿自体には影響しない。
	}
}

/**
 * そのページで投稿を始めたときの既定の投稿範囲。
 * 端末に前回選択した投稿範囲が保存されている場合はそれを優先し、
 * 未保存の場合はページに応じた既定値（ホーム等はこっそり）を使用する。
 */
export function defaultScopeForPath(pathname: string): PostScope {
	const lastScope = getLastPostScope();
	if (lastScope) return lastScope;
	return HOME_LIKE.has(pathname) ? 'kossori' : 'feed';
}

/**
 * 外部クロスポスト先。投稿ごとに選ばせると投稿範囲ゲージが2軸になってしまうので、
 * 「どこに出すか」はあらかじめ設定で1つ選んでおき、投稿時は出す/出さないだけにする。
 * 保存先が localStorage なので端末ごとの設定になる（オプトイン本体と同じ方針）。
 */
export type ExternalTarget = 'bluesky' | 'standardSite';

/**
 * 選択中の外部クロスポスト先。未設定のときは、実際にオプトイン済みの方へ倒す
 * （既存ユーザーが設定画面を開かなくても今までどおり動くようにするため）。
 * どちらも有効なら Bluesky を既定にする。
 */
export function getExternalTarget(): ExternalTarget {
	const stored = read(TARGET_KEY);
	if (stored === 'bluesky' || stored === 'standardSite') return stored;
	if (!getOptIn('crosspost') && getOptIn('standardSite')) return 'standardSite';
	return 'bluesky';
}

export function setExternalTarget(target: ExternalTarget) {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(TARGET_KEY, target);
	} catch {
		// 保存できなくても投稿自体には影響しない。
	}
}
