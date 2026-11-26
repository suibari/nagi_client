import { NAGI_PUBLIC_ORIGIN } from '$lib/standardsite/types';

export const UMAMI_SCRIPT_ORIGIN = 'https://cloud.umami.is';
export const UMAMI_SCRIPT_SRC = `${UMAMI_SCRIPT_ORIGIN}/script.js`;
const PRODUCTION_HOSTNAME = new URL(NAGI_PUBLIC_ORIGIN).hostname;

type UmamiEventData = Record<string, string | number | boolean | null>;

declare global {
	interface Window {
		umami?: { track: (name: string, data?: UmamiEventData) => void };
	}
}

/** SEO-08: サイトIDがあり、本番のホスト名で開いたときだけ読み込む。 */
export function shouldLoadUmami(websiteId: string, hostname: string): boolean {
	return websiteId.trim() !== '' && hostname === PRODUCTION_HOSTNAME;
}

export function injectUmami(websiteId: string): void {
	if (typeof document === 'undefined') return;
	if (!shouldLoadUmami(websiteId, location.hostname)) return;
	if (document.querySelector(`script[src="${UMAMI_SCRIPT_SRC}"]`)) return;
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

/** トラッカーが無い（開発・DNT・ブロッカー）ときは何もしない。 */
export function trackUmami(name: string, data?: UmamiEventData): void {
	if (typeof window === 'undefined') return;
	try {
		window.umami?.track(name, data);
	} catch {
		// 解析の失敗を呼び出し元の処理へ波及させない。
	}
}
