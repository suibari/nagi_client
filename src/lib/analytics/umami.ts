import { NAGI_PUBLIC_ORIGIN } from '$lib/standardsite/types';
import type { OAuthDiagnosticData, OAuthDiagnosticName } from '$lib/oauth/diagnostics';
import type { AfterNavigate } from '@sveltejs/kit';

export const UMAMI_SCRIPT_ORIGIN = 'https://cloud.umami.is';
export const UMAMI_SCRIPT_SRC = `${UMAMI_SCRIPT_ORIGIN}/script.js`;
const PRODUCTION_HOSTNAME = new URL(NAGI_PUBLIC_ORIGIN).hostname;

type PageFields = {
	website: string;
	hostname: string;
	language: string;
	screen: string;
	url: string;
	referrer?: string;
};

type UmamiFields = PageFields & { name?: string; data?: OAuthDiagnosticData };
type ViewTarget = Pick<NonNullable<AfterNavigate['to']>, 'route' | 'url'>;
type TrackerState = {
	websiteId: string;
	page?: PageFields;
	pendingViews: PageFields[];
	ready: boolean;
};

let tracker: TrackerState | undefined;

declare global {
	interface Window {
		umami?: { track: (fields: UmamiFields) => Promise<void> };
	}
}

/** SEO-08: サイトIDがあり、本番のホスト名で開いたときだけ読み込む。 */
export function shouldLoadUmami(websiteId: string, hostname: string): boolean {
	return websiteId.trim() !== '' && hostname === PRODUCTION_HOSTNAME;
}

export function injectUmami(websiteId: string): void {
	if (typeof document === 'undefined') return;
	if (!shouldLoadUmami(websiteId, location.hostname)) return;
	if (hasDoNotTrack()) return;
	if (document.querySelector(`script[src="${UMAMI_SCRIPT_SRC}"]`)) return;
	const state: TrackerState = { websiteId: websiteId.trim(), pendingViews: [], ready: false };
	tracker = state;
	const script = document.createElement('script');
	script.defer = true;
	script.src = UMAMI_SCRIPT_SRC;
	script.dataset.websiteId = state.websiteId;
	script.dataset.domains = PRODUCTION_HOSTNAME;
	script.dataset.excludeSearch = 'true';
	script.dataset.excludeHash = 'true';
	script.dataset.doNotTrack = 'true';
	script.dataset.autoTrack = 'false';
	script.addEventListener(
		'load',
		() => {
			state.ready = true;
			for (const page of state.pendingViews.splice(0)) void send(page);
		},
		{ once: true },
	);
	script.addEventListener(
		'error',
		() => {
			tracker = undefined;
		},
		{ once: true },
	);
	document.head.appendChild(script);
}

function hasDoNotTrack(): boolean {
	const browser = window as Window & { doNotTrack?: string | number };
	const navigator = browser.navigator as Navigator & { msDoNotTrack?: string | number };
	const signals = [navigator.doNotTrack, browser.doNotTrack, navigator.msDoNotTrack];
	return signals.some((signal) => signal === '1' || signal === 1 || signal === 'yes');
}

function referrerOrigin(referrer: string): string | undefined {
	try {
		const url = new URL(referrer);
		if (url.protocol === 'https:' || url.protocol === 'http:') return url.origin;
	} catch {
		return undefined;
	}
}

export function trackUmamiPageView({
	from,
	to,
}: {
	from: ViewTarget | null;
	to: ViewTarget | null;
}): void {
	if (!tracker) return;
	if (!to?.route.id) {
		tracker.page = undefined;
		return;
	}
	if (tracker.page && from?.url.pathname === to.url.pathname) return;

	const page = {
		website: tracker.websiteId,
		hostname: PRODUCTION_HOSTNAME,
		language: navigator.language,
		screen: `${window.screen.width}x${window.screen.height}`,
		url: to.route.id,
		referrer: from ? (from.route.id ?? undefined) : referrerOrigin(document.referrer),
	};
	tracker.page = page;
	if (tracker.ready) {
		void send(page);
	} else if (tracker.pendingViews.length < 16) {
		tracker.pendingViews.push(page);
	}
}

export function trackUmami(name: OAuthDiagnosticName, data: OAuthDiagnosticData): void {
	if (!tracker?.ready || !tracker.page) return;
	const { failure, online, locks, display, hoursSinceSuccess } = data;
	void send({
		...tracker.page,
		name,
		data: { failure, online, locks, display, hoursSinceSuccess },
	});
}

async function send(fields: UmamiFields): Promise<void> {
	try {
		if (hasDoNotTrack()) return;
		await window.umami?.track(fields);
	} catch {
		// 解析の失敗を呼び出し元の処理へ波及させない。
	}
}
