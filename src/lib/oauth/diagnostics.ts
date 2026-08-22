import { track } from '@vercel/analytics';

const LAST_SUCCESS_KEY = 'nagi.oauth.last-success-at';

export type OAuthFailureKind =
	| 'network'
	| 'storage-missing'
	| 'storage-failed'
	| 'refresh-rejected'
	| 'dpop'
	| 'revoked'
	| 'unknown';

function errorText(error: unknown): string {
	if (!(error instanceof Error)) return String(error ?? '');
	const cause = (error as Error & { cause?: unknown }).cause;
	return `${error.name} ${error.message} ${cause instanceof Error ? `${cause.name} ${cause.message}` : ''}`;
}

export function classifyOAuthFailure(error: unknown): OAuthFailureKind {
	const text = errorText(error).toLowerCase();
	if (
		(typeof navigator !== 'undefined' && navigator.onLine === false) ||
		/network|fetch failed|failed to fetch|load failed|timeout|aborterror/.test(text)
	) {
		return 'network';
	}
	if (/invalid_grant|tokenrefresherror|refresh token|session has expired/.test(text)) {
		return 'refresh-rejected';
	}
	if (/tokenrevokederror|revoked/.test(text)) return 'revoked';
	if (/dpop|proof nonce|jwk|cryptokey/.test(text)) return 'dpop';
	if (/not found in session store|no stored session|deleted by another process/.test(text)) {
		return 'storage-missing';
	}
	if (/indexeddb|quota|dataclone|transaction|object store|storage/.test(text)) {
		return 'storage-failed';
	}
	return 'unknown';
}

export const isTransientOAuthFailure = (error: unknown): boolean =>
	classifyOAuthFailure(error) === 'network';

function displayMode(): string {
	if (typeof window === 'undefined') return 'unknown';
	if (window.matchMedia?.('(display-mode: standalone)').matches) return 'standalone';
	if ((navigator as Navigator & { standalone?: boolean }).standalone === true) return 'standalone';
	return 'browser';
}

function hoursSinceLastSuccess(): number | null {
	try {
		const value = Number(localStorage.getItem(LAST_SUCCESS_KEY));
		return Number.isFinite(value) && value > 0
			? Math.min(24 * 30, Math.floor((Date.now() - value) / 3_600_000))
			: null;
	} catch {
		return null;
	}
}

export function rememberOAuthSuccess(): void {
	try {
		localStorage.setItem(LAST_SUCCESS_KEY, String(Date.now()));
	} catch {
		// 計測用markerを保存できなくてもsession自体の成否には影響させない。
	}
}

export async function requestPersistentOAuthStorage(): Promise<string> {
	try {
		if (!navigator.storage?.persisted || !navigator.storage.persist) return 'unsupported';
		if (await navigator.storage.persisted()) return 'already-persisted';
		return (await navigator.storage.persist()) ? 'granted' : 'not-granted';
	} catch {
		return 'failed';
	}
}

export function reportOAuthDiagnostic(
	event: 'restore-failed' | 'restore-recovered' | 'session-deleted',
	error?: unknown,
): void {
	const properties = {
		failure: error ? classifyOAuthFailure(error) : 'none',
		online: typeof navigator === 'undefined' ? false : navigator.onLine,
		locks: typeof navigator !== 'undefined' && !!navigator.locks,
		display: displayMode(),
		hoursSinceSuccess: hoursSinceLastSuccess(),
	};
	console.warn(`[oauth] ${event}`, properties);
	track(`oauth_${event.replaceAll('-', '_')}`, properties);
}
