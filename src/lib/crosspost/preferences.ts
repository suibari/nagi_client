import {
	clearOptInPending,
	getOptIn,
	hasOptInScope,
	isOptInPending,
	markOptInPending,
	setOptIn,
} from '$lib/optin/scope-optin';

// クロスポスト固有の入口。実体は optin/scope-optin.ts（standard.site と共通）。
// 呼び出し側の差分を増やさないため、従来の関数名をそのまま残している。
export const getCrosspostEnabled = () => getOptIn('crosspost');
export const setCrosspostEnabled = (enabled: boolean) => setOptIn('crosspost', enabled);

export const isCrosspostPending = () => isOptInPending('crosspost');
export const markCrosspostPending = () => markOptInPending('crosspost');
export const clearCrosspostPending = () => clearOptInPending('crosspost');

/** 現在のセッションに Bluesky への書き込み権限が付与されているか。 */
export const hasCrosspostScope = () => hasOptInScope('crosspost');
