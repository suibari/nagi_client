import { describe, expect, it } from 'vitest';
import {
	NOTIFICATION_PREFERENCE_GROUPS,
	isBlueskyPushEnabled,
	isNotificationCategoryEnabled,
	withBlueskyPush,
	withNotificationCategory,
} from './preferences';

describe('notification preferences', () => {
	it('未設定のカテゴリはオン', () => {
		expect(isNotificationCategoryEnabled({}, 'botInteraction')).toBe(true);
	});

	it('トグルは list と push に同じ値を書き、ほかのカテゴリは残す', () => {
		const next = withNotificationCategory(
			{ reply: { list: false, push: false } },
			'botInteraction',
			false,
		);
		expect(next).toEqual({
			reply: { list: false, push: false },
			botInteraction: { list: false, push: false },
		});
		expect(isNotificationCategoryEnabled(next, 'botInteraction')).toBe(false);
		expect(
			isNotificationCategoryEnabled(withNotificationCategory(next, 'reply', true), 'reply'),
		).toBe(true);
	});

	it('どちらか片方でも生きていればオンと見せる（後で list / push を分けたときの値）', () => {
		expect(isNotificationCategoryEnabled({ reply: { list: true, push: false } }, 'reply')).toBe(
			true,
		);
	});

	it('全カテゴリをちょうど1回ずつ並べる', () => {
		const all = NOTIFICATION_PREFERENCE_GROUPS.flatMap((group) => group.categories);
		expect(new Set(all).size).toBe(all.length);
		expect(all.length).toBe(10);
	});
});

describe('Bluesky push preferences', () => {
	it('are off until turned on, unlike Nagi categories', () => {
		expect(isBlueskyPushEnabled({}, 'blueskyLike')).toBe(false);
		expect(isNotificationCategoryEnabled({}, 'reply')).toBe(true);
	});

	it('save push only, keeping the other settings', () => {
		const next = withBlueskyPush({ reply: { list: false, push: false } }, 'blueskyLike', true);
		expect(next).toEqual({
			reply: { list: false, push: false },
			blueskyLike: { list: false, push: true },
		});
		expect(isBlueskyPushEnabled(next, 'blueskyLike')).toBe(true);
		expect(isBlueskyPushEnabled(withBlueskyPush(next, 'blueskyLike', false), 'blueskyLike')).toBe(
			false,
		);
	});

	it('are not part of the Nagi notification groups', () => {
		const grouped: string[] = NOTIFICATION_PREFERENCE_GROUPS.flatMap((group) => [
			...group.categories,
		]);
		expect(grouped.some((category) => category.startsWith('bluesky'))).toBe(false);
	});
});
