import type { PostView } from '$lib/api/types';

export type ModerationPreference = 'warn' | 'hide' | 'ignore';
export type ModerationPreferenceKey = 'amateras' | 'selfAi' | 'selfNsfw';

const STORAGE_KEY = 'nagi:moderation-preferences:v1';
const NSFW_SELF_LABELS = new Set(['porn', 'sexual', 'nudity', 'graphic-media']);
const DEFAULTS: Record<ModerationPreferenceKey, ModerationPreference> = {
	amateras: 'warn',
	selfAi: 'ignore',
	selfNsfw: 'warn',
};

function valid(value: unknown): value is ModerationPreference {
	return value === 'warn' || value === 'hide' || value === 'ignore';
}

function load(): Record<ModerationPreferenceKey, ModerationPreference> {
	if (typeof localStorage === 'undefined') return { ...DEFAULTS };
	try {
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
		return {
			amateras: valid(stored.amateras) ? stored.amateras : DEFAULTS.amateras,
			selfAi: valid(stored.selfAi) ? stored.selfAi : DEFAULTS.selfAi,
			selfNsfw: valid(stored.selfNsfw) ? stored.selfNsfw : DEFAULTS.selfNsfw,
		};
	} catch {
		return { ...DEFAULTS };
	}
}

let state = $state(load());

export const moderationPreferences = {
	get amateras() {
		return state.amateras;
	},
	get selfAi() {
		return state.selfAi;
	},
	get selfNsfw() {
		return state.selfNsfw;
	},
};

export function setModerationPreference(key: ModerationPreferenceKey, value: ModerationPreference) {
	state = { ...state, [key]: value };
	if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearModerationPreferences() {
	state = { ...DEFAULTS };
	if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
}

export type PostModerationDisplay = {
	hidden: boolean;
	warn: boolean;
	reason: 'amateras' | 'selfAi' | 'selfNsfw' | undefined;
};

export function postModerationDisplay(post: Pick<PostView, 'selfLabels' | 'moderationLabels'>) {
	const candidates: Array<{
		preference: ModerationPreference;
		reason: NonNullable<PostModerationDisplay['reason']>;
	}> = [];
	if (post.moderationLabels?.length)
		candidates.push({ preference: state.amateras, reason: 'amateras' });
	if (post.selfLabels?.includes('ai-generated'))
		candidates.push({ preference: state.selfAi, reason: 'selfAi' });
	if (post.selfLabels?.some((label) => NSFW_SELF_LABELS.has(label)))
		candidates.push({ preference: state.selfNsfw, reason: 'selfNsfw' });

	const hidden = candidates.find((candidate) => candidate.preference === 'hide');
	if (hidden) return { hidden: true, warn: false, reason: hidden.reason };
	const warning = candidates.find((candidate) => candidate.preference === 'warn');
	return { hidden: false, warn: Boolean(warning), reason: warning?.reason };
}
