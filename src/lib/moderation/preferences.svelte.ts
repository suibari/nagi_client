/**
 * ラベル付きコンテンツの見せ方の設定。
 *
 * これは「成人ユーザーが自分の好みで選ぶ」ための設定。未成年に成人向けを見せない
 * 強制はサーバ側が行っており（AppView がそもそも返さない）、ここでは解除できない。
 */

export type ModerationPreference = 'warn' | 'hide' | 'ignore';
export type ModerationPreferenceKey = 'automatic' | 'selfAi' | 'selfNsfw';

const STORAGE_KEY = 'nagi:moderation-preferences:v1';
const NSFW_SELF_LABELS = new Set(['porn', 'sexual', 'nudity', 'graphic-media']);
const DEFAULTS: Record<ModerationPreferenceKey, ModerationPreference> = {
	automatic: 'warn',
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
			automatic: valid(stored.automatic) ? stored.automatic : DEFAULTS.automatic,
			selfAi: valid(stored.selfAi) ? stored.selfAi : DEFAULTS.selfAi,
			selfNsfw: valid(stored.selfNsfw) ? stored.selfNsfw : DEFAULTS.selfNsfw,
		};
	} catch {
		return { ...DEFAULTS };
	}
}

let state = $state(load());

export const moderationPreferences = {
	get automatic() {
		return state.automatic;
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

export type ModerationDisplay = {
	hidden: boolean;
	warn: boolean;
	reason: ModerationPreferenceKey | undefined;
};

/**
 * ラベルの付いたコンテンツをどう見せるか。投稿だけでなく、プロフィール・
 * チャンネル・カスタム絵文字にも同じ規則を使う。
 */
export function contentModerationDisplay(content: {
	selfLabels?: string[];
	moderationLabels?: string[];
}): ModerationDisplay {
	const candidates: Array<{
		preference: ModerationPreference;
		reason: ModerationPreferenceKey;
	}> = [];
	if (content.moderationLabels?.length)
		candidates.push({ preference: state.automatic, reason: 'automatic' });
	if (content.selfLabels?.includes('ai-generated'))
		candidates.push({ preference: state.selfAi, reason: 'selfAi' });
	if (content.selfLabels?.some((label) => NSFW_SELF_LABELS.has(label)))
		candidates.push({ preference: state.selfNsfw, reason: 'selfNsfw' });

	const hidden = candidates.find((candidate) => candidate.preference === 'hide');
	if (hidden) return { hidden: true, warn: false, reason: hidden.reason };
	const warning = candidates.find((candidate) => candidate.preference === 'warn');
	return { hidden: false, warn: Boolean(warning), reason: warning?.reason };
}
