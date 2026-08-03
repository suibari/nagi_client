import { get } from 'svelte/store';
import { buildSsoUrl as buildTicketUrl } from '@suibari/nagi-passport/browser';
import { session } from '$lib/oauth/session.svelte';
import { createSsoTicket } from '$lib/api/appview';

// 姉妹アプリの canonical origin。SSO チケットの aud と必ず一致させる。
// room-bot-tan.suibari.com は room.bot-tan.com へリダイレクトされるので、
// OAuth の client_id と揃えて後者を正とする。
export const SSO_APPS = {
	room: 'https://room.bot-tan.com',
} as const;

export type SsoApp = keyof typeof SSO_APPS;

const SIBLING_ORIGINS: readonly string[] = Object.values(SSO_APPS);

/**
 * 外部リンクが姉妹アプリ宛なら did ヒントを足す。それ以外の URL は一切変更しない。
 *
 * 表示するリンクすべてに適用したいので、プロフィールの website カード・投稿中の
 * リンクカード・本文のリンク・App Links の描画点から呼ぶ。
 *
 * ここで載せるのは「閲覧している人」の DID であって、リンク先の持ち主の DID ではない。
 * 姉妹アプリ側は「誰としてサインインするか」のヒントとしてしか使わず、認証は
 * 遷移先の OAuth が担保する。
 *
 * 許可した origin 以外には絶対に付けない（無関係な外部サイトへ閲覧者の DID を
 * 送ってしまうため）。
 */
export function decorateSiblingUrl(href: string | undefined): string | undefined {
	if (!href) return href;
	const did = get(session)?.did;
	if (!did) return href;
	let url: URL;
	try {
		url = new URL(href);
	} catch {
		return href;
	}
	if (!SIBLING_ORIGINS.includes(url.origin)) return href;
	// 既に did が載っているリンク（利用者が自分で書いた場合など）は尊重する。
	if (url.searchParams.has('did')) return href;
	url.searchParams.set('did', did);
	return url.toString();
}

/**
 * 署名なしのフォールバック URL。
 *
 * 付与する did は「誰としてサインインするか」のヒントでしかなく、認証そのものは
 * 遷移先アプリの OAuth が担保する。したがって詐称されても他人になりすませるわけ
 * ではなく、「他人のハンドルが初期表示される」だけで済む。
 */
export function buildDidHintUrl(app: SsoApp, path = '/'): string {
	const url = new URL(path, SSO_APPS[app]);
	const did = get(session)?.did;
	if (did) url.searchParams.set('did', did);
	return url.toString();
}

/**
 * 姉妹アプリへ「サインイン済みのまま」移動する。
 *
 * チケットは有効期間が60秒しかないので、描画時ではなくクリック時に取りに行く
 * （リンクの href に埋めておくと開かれる頃には期限切れになる）。
 *
 * 取得に失敗したときはヒント経路へ落とす。permission-set を publish した直後は
 * 認可サーバのキャッシュが最大24h残り createSsoTicket が 403 になりうるので、
 * この分岐が無いとその間ずっと導線が壊れる（appview.ts の withPublicFallback と同じ理由）。
 */
// お部屋は Next.js の API ルートでチケットを受ける。trailingSlash 設定のため
// 末尾スラッシュまで書く（無いと 308 で1往復増える）。
const SSO_PATH = '/api/sso/';

export async function gotoSsoApp(app: SsoApp, returnTo = '/'): Promise<void> {
	const appOrigin = SSO_APPS[app];
	try {
		const { ticket } = await createSsoTicket(appOrigin);
		window.location.href = buildTicketUrl({ appOrigin, ticket, returnTo, ssoPath: SSO_PATH });
		return;
	} catch (error) {
		console.warn('[sso] ticket unavailable, falling back to did hint:', error);
	}
	window.location.href = buildDidHintUrl(app, returnTo);
}

/** ヒント用に付けた did は遷移先で不要なので、戻り先パスからは落とす。 */
function returnToFrom(url: URL): string {
	const params = new URLSearchParams(url.search);
	params.delete('did');
	const query = params.toString();
	return `${url.pathname}${query ? `?${query}` : ''}${url.hash}`;
}

async function navigateWithTicket(url: URL, popup: Window | null, fallbackHref: string) {
	const go = (target: string) => {
		if (popup) {
			// 同期で開いた空タブは opener を持つので、遷移前に切っておく。
			popup.opener = null;
			popup.location.replace(target);
		} else {
			window.location.href = target;
		}
	};
	try {
		const { ticket } = await createSsoTicket(url.origin);
		go(buildTicketUrl({ appOrigin: url.origin, ticket, returnTo: returnToFrom(url), ssoPath: SSO_PATH }));
		return;
	} catch (error) {
		console.warn('[sso] ticket unavailable, falling back to did hint:', error);
	}
	// 取得できなければ ?did= 付きの元のリンクへ。遷移先で通常の OAuth になる。
	go(fallbackHref);
}

/**
 * 姉妹アプリ宛リンクのクリックを横取りし、チケット経由の遷移に差し替える。
 *
 * チケットは60秒で失効するので href には埋められない。かといってリンクを
 * ヒント経路のままにすると遷移先で毎回 OAuth の承認画面が出るため、
 * クリック時にだけ取りに行く。
 *
 * ルートレイアウトから document のクリックに繋いで、個々のリンク側に手を
 * 入れずに全リンクへ効かせる。
 */
export function interceptSiblingLinkClick(event: MouseEvent): void {
	if (event.defaultPrevented || event.button !== 0) return;
	// 修飾キー付き（別タブで開く等）はブラウザ既定の挙動を尊重する。
	// この場合は href の ?did= が使われ、遷移先で1クリックの OAuth になる。
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

	const target = event.target;
	const anchor = target instanceof Element ? target.closest('a[href]') : null;
	if (!(anchor instanceof HTMLAnchorElement)) return;

	let url: URL;
	try {
		url = new URL(anchor.href, window.location.href);
	} catch {
		return;
	}
	if (!SIBLING_ORIGINS.includes(url.origin)) return;
	if (!get(session)) return;

	event.preventDefault();
	// ポップアップブロッカに掛からないよう、新規タブはクリック直後に同期で開く。
	// noopener を渡すと参照が返らず遷移先を設定できないので、後から opener を切る。
	const popup = anchor.target === '_blank' ? window.open('', '_blank') : null;
	void navigateWithTicket(url, popup, anchor.href);
}
