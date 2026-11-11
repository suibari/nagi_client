import type { NotificationPreferenceCategory, NotificationPreferences } from '$lib/api/types';

/**
 * 通知設定。判定はすべて AppView 側（通知一覧・未読数・プッシュ配信）が行い、
 * クライアントは設定画面で読み書きするだけ。
 *
 * 保存の形は Bluesky に合わせて { list, push } を持つが、今の UI は
 * 「通知欄＝プッシュ」のトグル1つで両方へ同じ値を書く。あとで分けたくなっても、
 * UI を2つにするだけで保存形式は変えなくてよい。
 */

/** 設定画面での並び。人から / botたんから / そのほか。 */
export const NOTIFICATION_PREFERENCE_GROUPS = [
	{ id: 'people', categories: ['reply', 'mention', 'reaction'] },
	{
		id: 'bot',
		categories: ['botInteraction', 'diary', 'analysis', 'chronicle', 'mood', 'seasonal'],
	},
	{ id: 'other', categories: ['gift'] },
] as const satisfies ReadonlyArray<{
	id: string;
	categories: readonly NotificationPreferenceCategory[];
}>;

/** 未設定は有効。list と push のどちらかでも生きていれば「オン」と見せる。 */
export function isNotificationCategoryEnabled(
	preferences: NotificationPreferences,
	category: NotificationPreferenceCategory,
): boolean {
	const preference = preferences[category];
	return !preference || preference.list || preference.push;
}

/** トグル1つ分の変更を、送信用の設定全体にして返す（サーバーは丸ごと置き換える）。 */
export function withNotificationCategory(
	preferences: NotificationPreferences,
	category: NotificationPreferenceCategory,
	enabled: boolean,
): NotificationPreferences {
	return { ...preferences, [category]: { list: enabled, push: enabled } };
}
