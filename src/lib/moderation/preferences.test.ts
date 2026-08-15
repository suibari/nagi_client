import { afterEach, describe, expect, it } from 'vitest';
import {
	clearModerationPreferences,
	postModerationDisplay,
	setModerationPreference,
} from './preferences.svelte';

afterEach(() => clearModerationPreferences());

describe('post moderation preferences', () => {
	it('defaults Amateras and NSFW to warning, while AI is ignored', () => {
		expect(postModerationDisplay({ moderationLabels: ['harassment'] })).toEqual({
			hidden: false,
			warn: true,
			reason: 'amateras',
		});
		expect(postModerationDisplay({ selfLabels: ['ai-generated'] })).toEqual({
			hidden: false,
			warn: false,
			reason: undefined,
		});
		expect(postModerationDisplay({ selfLabels: ['sexual'] })).toEqual({
			hidden: false,
			warn: true,
			reason: 'selfNsfw',
		});
	});

	it('lets ignore remove an NSFW warning and hide take priority over warning', () => {
		setModerationPreference('selfNsfw', 'ignore');
		expect(postModerationDisplay({ selfLabels: ['sexual'] }).warn).toBe(false);

		setModerationPreference('selfAi', 'hide');
		expect(
			postModerationDisplay({
				selfLabels: ['ai-generated'],
				moderationLabels: ['harassment'],
			}),
		).toEqual({ hidden: true, warn: false, reason: 'selfAi' });
	});
});
