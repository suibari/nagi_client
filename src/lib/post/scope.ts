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

/** 自分とリストの人しか居ない場所。従来のホームタブと同じくこっそりを既定にする。 */
const HOME_LIKE = new Set<string>(['/', '/feed']);

/**
 * そのページで投稿を始めたときの既定の投稿範囲。
 * 投稿ボタンはサイドバー（PC）と浮かぶFAB（スマホ）の2箇所にあるので、
 * 判定がずれないようここ1箇所に置く。
 */
export function defaultScopeForPath(pathname: string): PostScope {
	return HOME_LIKE.has(pathname) ? 'kossori' : 'feed';
}

/**
 * 外部クロスポスト先。投稿ごとに選ばせると投稿範囲ゲージが2軸になってしまうので、
 * 「どこに出すか」はあらかじめ設定で1つ選んでおき、投稿時は出す/出さないだけにする。
 * 保存先が localStorage なので端末ごとの設定になる（オプトイン本体と同じ方針）。
 */
export type ExternalTarget = 'bluesky' | 'standardSite';

const TARGET_KEY = 'nagi-external-target';

const read = (key: string) => {
	if (typeof window === 'undefined') return null;
	try {
		return window.localStorage.getItem(key);
	} catch {
		return null;
	}
};

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
