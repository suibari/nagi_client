import { searchEmojis } from '$lib/api/appview';
import type { EmojiView } from '$lib/api/types';

const USAGE_KEY = 'nagi:reaction-usage:v2';
const LEGACY_RECENTS_KEY = 'nagi:reaction-recents:v1';
const MAX_USAGE_ITEMS = 64;

export const SAFE_UNICODE_REACTIONS = [
	'😊',
	'😄',
	'😆',
	'🥰',
	'😍',
	'🤗',
	'🤩',
	'🥳',
	'🙌',
	'👏',
	'👍',
	'💪',
	'🙏',
	'🫶',
	'🤝',
	'👀',
	'✨',
	'🎉',
	'🎊',
	'🌸',
	'🌼',
	'🌈',
	'☀️',
	'⭐',
	'💖',
	'💛',
	'💚',
	'💙',
	'💜',
	'🍀',
	'☕',
	'🍵',
] as const;

export type ReactionChoice =
	{ kind: 'unicode'; emoji: string } | { kind: 'custom'; emoji: EmojiView };

export type ReactionUsage =
	| { kind: 'unicode'; emoji: string; count: number; lastUsedAt: number }
	| { kind: 'custom'; emoji: EmojiView; count: number; lastUsedAt: number };

export const reactionChoiceKey = (choice: ReactionChoice) =>
	choice.kind === 'custom' ? choice.emoji.uri : choice.emoji;

export const validChoice = (value: unknown): value is ReactionChoice => {
	if (!value || typeof value !== 'object') return false;
	const item = value as { kind?: unknown; emoji?: unknown };
	if (item.kind === 'unicode') return typeof item.emoji === 'string' && item.emoji.length > 0;
	if (item.kind !== 'custom' || !item.emoji || typeof item.emoji !== 'object') return false;
	const emoji = item.emoji as Partial<EmojiView>;
	return (
		typeof emoji.uri === 'string' &&
		typeof emoji.cid === 'string' &&
		typeof emoji.did === 'string' &&
		typeof emoji.name === 'string' &&
		typeof emoji.url === 'string'
	);
};

const validUsage = (value: unknown): value is ReactionUsage => {
	if (!validChoice(value)) return false;
	const item = value as ReactionUsage;
	return (
		Number.isFinite(item.count) &&
		item.count > 0 &&
		Number.isFinite(item.lastUsedAt) &&
		item.lastUsedAt > 0
	);
};

const saveUsage = (usage: ReactionUsage[]) => {
	try {
		localStorage.setItem(USAGE_KEY, JSON.stringify(usage.slice(0, MAX_USAGE_ITEMS)));
	} catch {
		// Reactions remain available when storage is disabled.
	}
};

export function loadReactionUsage(): ReactionUsage[] {
	try {
		const raw = localStorage.getItem(USAGE_KEY);
		if (raw !== null) {
			const stored = JSON.parse(raw);
			if (Array.isArray(stored)) return stored.filter(validUsage).slice(0, MAX_USAGE_ITEMS);
		}
	} catch {
		// Fall through to the v1 migration.
	}

	try {
		const legacy = JSON.parse(localStorage.getItem(LEGACY_RECENTS_KEY) ?? '[]');
		if (!Array.isArray(legacy)) return [];
		const now = Date.now();
		const migrated = legacy
			.filter(validChoice)
			.slice(0, MAX_USAGE_ITEMS)
			.map((item, index) => ({
				...item,
				count: 1,
				lastUsedAt: now - index,
			})) satisfies ReactionUsage[];
		saveUsage(migrated);
		localStorage.removeItem(LEGACY_RECENTS_KEY);
		return migrated;
	} catch {
		return [];
	}
}

export function recordReactionUsage(
	usage: ReactionUsage[],
	raw: string | EmojiView,
): ReactionUsage[] {
	const choice: ReactionChoice =
		typeof raw === 'string'
			? { kind: 'unicode', emoji: raw.normalize('NFC') }
			: { kind: 'custom', emoji: raw };
	const key = reactionChoiceKey(choice);
	const existing = usage.find((item) => reactionChoiceKey(item) === key);
	const updated: ReactionUsage =
		choice.kind === 'custom'
			? {
					...choice,
					count: (existing?.count ?? 0) + 1,
					lastUsedAt: Date.now(),
				}
			: {
					...choice,
					count: (existing?.count ?? 0) + 1,
					lastUsedAt: Date.now(),
				};
	const next = [updated, ...usage.filter((item) => reactionChoiceKey(item) !== key)]
		.sort((a, b) => b.count - a.count || b.lastUsedAt - a.lastUsedAt)
		.slice(0, MAX_USAGE_ITEMS);
	saveUsage(next);
	return next;
}

export function frequentReactionChoices(
	usage: ReactionUsage[],
	limit: number,
	failedCustomUris: string[] = [],
): ReactionChoice[] {
	return usage
		.filter((item) => item.kind === 'unicode' || !failedCustomUris.includes(item.emoji.uri))
		.sort((a, b) => b.count - a.count || b.lastUsedAt - a.lastUsedAt)
		.slice(0, limit)
		.map((item) =>
			item.kind === 'custom'
				? { kind: 'custom', emoji: item.emoji }
				: { kind: 'unicode', emoji: item.emoji },
		);
}

export function recentReactionChoices(
	usage: ReactionUsage[],
	limit: number,
	failedCustomUris: string[] = [],
): ReactionChoice[] {
	return usage
		.filter((item) => item.kind === 'unicode' || !failedCustomUris.includes(item.emoji.uri))
		.sort((a, b) => b.lastUsedAt - a.lastUsedAt)
		.slice(0, limit)
		.map((item) =>
			item.kind === 'custom'
				? { kind: 'custom', emoji: item.emoji }
				: { kind: 'unicode', emoji: item.emoji },
		);
}

const shuffled = <T>(items: readonly T[]) => {
	const result = [...items];
	for (let index = result.length - 1; index > 0; index -= 1) {
		const swapWith = Math.floor(Math.random() * (index + 1));
		[result[index], result[swapWith]] = [result[swapWith]!, result[index]!];
	}
	return result;
};

export function buildQuickReactionChoices(
	usage: ReactionUsage[],
	customPool: EmojiView[],
	failedCustomUris: string[] = [],
): ReactionChoice[] {
	const chosen: ReactionChoice[] = [];
	const keys = new Set<string>();
	const add = (choice: ReactionChoice) => {
		const key = reactionChoiceKey(choice);
		if (keys.has(key)) return false;
		keys.add(key);
		chosen.push(choice);
		return true;
	};

	for (const choice of frequentReactionChoices(usage, 2, failedCustomUris)) add(choice);

	let safeAdded = 0;
	for (const emoji of shuffled(SAFE_UNICODE_REACTIONS)) {
		if (add({ kind: 'unicode', emoji })) safeAdded += 1;
		if (safeAdded === 2) break;
	}

	let customAdded = 0;
	for (const emoji of shuffled(customPool)) {
		if (failedCustomUris.includes(emoji.uri)) continue;
		if (add({ kind: 'custom', emoji })) customAdded += 1;
		if (customAdded === 2) break;
	}

	for (const emoji of shuffled(SAFE_UNICODE_REACTIONS)) {
		if (chosen.length >= 6) break;
		add({ kind: 'unicode', emoji });
	}

	return chosen.slice(0, 6);
}

let customSuggestionPoolPromise: Promise<EmojiView[]> | undefined;

export function loadCustomSuggestionPool(): Promise<EmojiView[]> {
	customSuggestionPoolPromise ??= searchEmojis({ limit: 100 })
		.then((result) => result.emojis)
		.catch(() => []);
	return customSuggestionPoolPromise;
}
