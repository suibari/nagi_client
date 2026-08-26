const STORAGE_KEY = 'nagi:community-affirmation-reacted:v1';
const TTL_MS = 7 * 24 * 60 * 60 * 1_000;

type HandledEntry = { uri: string; reactedAt: number };

function read(now = Date.now()): HandledEntry[] {
	if (typeof window === 'undefined') return [];
	try {
		const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(entry): entry is HandledEntry =>
				typeof entry?.uri === 'string' &&
				typeof entry?.reactedAt === 'number' &&
				entry.reactedAt >= now - TTL_MS,
		);
	} catch {
		return [];
	}
}

/** AppView移行専用。受理されるまでは消さず、権限未反映端末でも履歴を失わない。 */
export function legacyCommunityAffirmationHandledUris(now = Date.now()): string[] {
	return read(now).map((entry) => entry.uri);
}

export function clearLegacyCommunityAffirmationHandledUris() {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.removeItem(STORAGE_KEY);
	} catch {
		/* 次回に再試行する。 */
	}
}
