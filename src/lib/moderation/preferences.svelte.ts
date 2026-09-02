/**
 * ラベル付きコンテンツの見せ方の設定。
 *
 * 未成年に成人向けを見せない強制はサーバ側が行う。ここでは成人ユーザーの表示設定を
 * DID ごとの端末キャッシュへ即時保存し、ログイン中は preferences API と同期する。
 */
export type ModerationPreference = 'warn' | 'hide' | 'ignore';
export type ModerationPreferenceKey = 'automatic' | 'selfAi' | 'selfNsfw';
export type ModerationPreferenceValues = Record<ModerationPreferenceKey, ModerationPreference>;
export type StoredModerationPreferences = ModerationPreferenceValues & { updatedAt: string };

const LEGACY_STORAGE_KEY = 'nagi:moderation-preferences:v1';
const STORAGE_PREFIX = 'nagi:moderation-preferences:v2';
const NSFW_SELF_LABELS = new Set(['porn', 'sexual', 'nudity', 'graphic-media']);
const DEFAULTS: ModerationPreferenceValues = {
	automatic: 'warn',
	selfAi: 'ignore',
	selfNsfw: 'warn',
};

let scopedDid: string | undefined;
let changedHandler: ((value: StoredModerationPreferences) => void) | undefined;

export const moderationPreferencesStorageKey = (did: string) =>
	`${STORAGE_PREFIX}.${encodeURIComponent(did)}`;

function valid(value: unknown): value is ModerationPreference {
	return value === 'warn' || value === 'hide' || value === 'ignore';
}

function parse(value: unknown): StoredModerationPreferences | undefined {
	if (!value || typeof value !== 'object') return undefined;
	const item = value as Record<string, unknown>;
	if (!valid(item.automatic) || !valid(item.selfAi) || !valid(item.selfNsfw)) return undefined;
	if (typeof item.updatedAt !== 'string' || Number.isNaN(Date.parse(item.updatedAt)))
		return undefined;
	return {
		automatic: item.automatic,
		selfAi: item.selfAi,
		selfNsfw: item.selfNsfw,
		updatedAt: item.updatedAt,
	};
}

function read(key: string): StoredModerationPreferences | undefined {
	if (typeof localStorage === 'undefined') return undefined;
	try {
		return parse(JSON.parse(localStorage.getItem(key) ?? 'null'));
	} catch {
		return undefined;
	}
}

export function loadStoredModerationPreferences(did: string) {
	return read(moderationPreferencesStorageKey(did));
}

function write(did: string, value: StoredModerationPreferences) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(moderationPreferencesStorageKey(did), JSON.stringify(value));
	} catch {
		// ストレージが使えなくても、現在のタブでは設定を適用する。
	}
}

let state = $state<ModerationPreferenceValues>({ ...DEFAULTS });

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

/** サインイン状態が変わったら、表示へ使う端末キャッシュを切り替える。 */
export function setModerationPreferencesScope(did: string | undefined) {
	scopedDid = did;
	if (!did) {
		state = { ...DEFAULTS };
		return;
	}
	let stored = loadStoredModerationPreferences(did);
	if (!stored && typeof localStorage !== 'undefined') {
		try {
			const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) ?? 'null') as Record<
				string,
				unknown
			> | null;
			if (legacy && valid(legacy.automatic) && valid(legacy.selfAi) && valid(legacy.selfNsfw)) {
				stored = {
					automatic: legacy.automatic,
					selfAi: legacy.selfAi,
					selfNsfw: legacy.selfNsfw,
					updatedAt: new Date().toISOString(),
				};
				write(did, stored);
			}
			// 旧値はアカウントを識別できないため、最初のログイン先へ一度だけ移す。
			localStorage.removeItem(LEGACY_STORAGE_KEY);
		} catch {
			// 壊れた旧値は既定値へフォールバックする。
		}
	}
	state = stored
		? { automatic: stored.automatic, selfAi: stored.selfAi, selfNsfw: stored.selfNsfw }
		: { ...DEFAULTS };
}

export function setModerationPreference(key: ModerationPreferenceKey, value: ModerationPreference) {
	state = { ...state, [key]: value };
	if (!scopedDid) return;
	const stored = { ...state, updatedAt: new Date().toISOString() };
	write(scopedDid, stored);
	changedHandler?.(stored);
}

/** サーバー側が新しいとき、その確定値を通知なしで採用する。 */
export function adoptModerationPreferences(
	did: string,
	value: ModerationPreferenceValues,
	updatedAt: string,
) {
	const stored = { ...value, updatedAt };
	write(did, stored);
	if (scopedDid === did) state = { ...value };
}

export function subscribeModerationPreferencesChanged(
	handler: (value: StoredModerationPreferences) => void,
) {
	changedHandler = handler;
}

export function clearModerationPreferences(did: string | undefined = scopedDid) {
	state = { ...DEFAULTS };
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.removeItem(LEGACY_STORAGE_KEY);
		if (did) localStorage.removeItem(moderationPreferencesStorageKey(did));
	} catch {
		// 消せない端末でもアカウント削除自体は完了している。
	}
}

export type ModerationDisplay = {
	hidden: boolean;
	warn: boolean;
	reason: ModerationPreferenceKey | undefined;
};

/** 投稿・プロフィール・チャンネル・カスタム絵文字で共通の表示判定。 */
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
