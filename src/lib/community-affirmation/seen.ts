const STORAGE_KEY = 'nagi:community-affirmation-reacted:v1';
const TTL_MS = 7 * 24 * 60 * 60 * 1_000;

type ReactedEntry = { uri: string; reactedAt: number };

function read(now = Date.now()): ReactedEntry[] {
	if (typeof window === 'undefined') return [];
	try {
		const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(entry): entry is ReactedEntry =>
				typeof entry?.uri === 'string' &&
				typeof entry?.reactedAt === 'number' &&
				entry.reactedAt >= now - TTL_MS,
		);
	} catch {
		return [];
	}
}

function write(entries: ReactedEntry[]) {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-200)));
	} catch {
		// 保存できない環境でも、この表示中のリアクション操作は続けられる。
	}
}

export function communityAffirmationReactedUris(now = Date.now()): Set<string> {
	const entries = read(now);
	write(entries);
	return new Set(entries.map((entry) => entry.uri));
}

export function markCommunityAffirmationReacted(uri: string, now = Date.now()) {
	const entries = read(now).filter((entry) => entry.uri !== uri);
	entries.push({ uri, reactedAt: now });
	write(entries);
}

export function unmarkCommunityAffirmationReacted(uri: string) {
	write(read().filter((entry) => entry.uri !== uri));
}
