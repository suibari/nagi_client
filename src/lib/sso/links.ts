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
export async function gotoSsoApp(app: SsoApp, returnTo = '/'): Promise<void> {
	const appOrigin = SSO_APPS[app];
	try {
		const { ticket } = await createSsoTicket(appOrigin);
		// お部屋は Next.js の API ルートでチケットを受けるので /api/sso。
		window.location.href = buildTicketUrl({ appOrigin, ticket, returnTo, ssoPath: '/api/sso' });
		return;
	} catch (error) {
		console.warn('[sso] ticket unavailable, falling back to did hint:', error);
	}
	window.location.href = buildDidHintUrl(app, returnTo);
}
