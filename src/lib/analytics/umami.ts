import type { RouteId } from '$app/types';
import { NAGI_PUBLIC_ORIGIN } from '$lib/standardsite/types';

export const UMAMI_SCRIPT_ORIGIN = 'https://cloud.umami.is';
export const UMAMI_SCRIPT_SRC = `${UMAMI_SCRIPT_ORIGIN}/script.js`;
const UMAMI_SCRIPT_SELECTOR = `script[src="${UMAMI_SCRIPT_SRC}"]`;
const PRODUCTION_HOSTNAME = new URL(NAGI_PUBLIC_ORIGIN).hostname;

type UmamiEventData = Record<string, string | number | boolean | null>;
type UmamiPayload = {
	website: string;
	hostname: string;
	language: string;
	screen: string;
	name?: string;
	url: string;
	referrer?: string;
};
type SignupEvent = 'signup_cta_click' | 'signup_oauth_start' | 'signup_complete';

declare global {
	interface Window {
		umami?: {
			track(name: string, data?: UmamiEventData): void | Promise<void>;
			track(buildPayload: (payload: UmamiPayload) => UmamiPayload): void | Promise<void>;
		};
	}
}

/** SEO-08: サイトIDがあり、本番のホスト名で開いたときだけ読み込む。 */
export function shouldLoadUmami(websiteId: string, hostname: string): boolean {
	return websiteId.trim() !== '' && hostname === PRODUCTION_HOSTNAME;
}

export function injectUmami(websiteId: string): void {
	if (typeof document === 'undefined') return;
	if (!shouldLoadUmami(websiteId, location.hostname)) return;
	if (doNotTrackEnabled()) return;
	if (document.querySelector(UMAMI_SCRIPT_SELECTOR)) return;
	const script = document.createElement('script');
	script.defer = true;
	script.src = UMAMI_SCRIPT_SRC;
	script.dataset.websiteId = websiteId.trim();
	script.dataset.domains = PRODUCTION_HOSTNAME;
	script.dataset.excludeSearch = 'true';
	script.dataset.excludeHash = 'true';
	script.dataset.doNotTrack = 'true';
	document.head.appendChild(script);
}

function doNotTrackEnabled(): boolean {
	const browser = window as Window & { doNotTrack?: string | number };
	const navigator = browser.navigator as Navigator & { msDoNotTrack?: string | number };
	const dntSignals = [navigator.doNotTrack, browser.doNotTrack, navigator.msDoNotTrack];
	return dntSignals.some((signal) => signal === '1' || signal === 1 || signal === 'yes');
}

function externalReferrerOrigin(): string {
	try {
		const referrer = new URL(document.referrer);
		if (referrer.protocol === 'http:' || referrer.protocol === 'https:') {
			if (referrer.origin !== location.origin) return referrer.origin;
		}
	} catch {
		// 直接流入では document.referrer は空になる。
	}
	return '';
}

export function trackSignupEvent(name: SignupEvent, routeId: RouteId): void {
	if (typeof window === 'undefined' || typeof document === 'undefined') return;
	const script = document.querySelector<HTMLScriptElement>(UMAMI_SCRIPT_SELECTOR);
	if (!shouldLoadUmami(script?.dataset.websiteId ?? '', location.hostname) || doNotTrackEnabled())
		return;
	try {
		const referrer = externalReferrerOrigin();
		const result = window.umami?.track(({ website, hostname, language, screen }) => ({
			website,
			hostname,
			language,
			screen,
			name,
			url: routeId,
			referrer,
		}));
		void result?.catch(() => undefined);
	} catch {
		// トラッカーによる障害を認証・画面遷移へ波及させない。
	}
}

/** トラッカーが無い（開発・DNT・ブロッカー）ときは何もしない。 */
export function trackUmami(name: string, data?: UmamiEventData): void {
	if (typeof window === 'undefined') return;
	try {
		window.umami?.track(name, data);
	} catch {
		// 解析の失敗を呼び出し元の処理へ波及させない。
	}
}
