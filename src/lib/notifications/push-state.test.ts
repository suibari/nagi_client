import { describe, expect, it } from 'vitest';
import { failedPushStatus, readyPushStatus } from './push-state';

describe('push status', () => {
	it('keeps the toggle on when only AppView registration needs repair', () => {
		expect(failedPushStatus(true)).toEqual({
			browserSubscribed: true,
			registered: false,
			registration: 'repair-needed',
			subscribed: true,
		});
	});

	it('turns the toggle off only when the browser has no subscription', () => {
		expect(failedPushStatus(false).subscribed).toBe(false);
		expect(readyPushStatus(false).registration).toBe('none');
	});
});
