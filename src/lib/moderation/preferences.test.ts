import { afterEach, describe, expect, it } from 'vitest';
import {
	clearModerationPreferences,
	contentModerationDisplay,
	setModerationPreference,
} from './preferences.svelte';

afterEach(() => clearModerationPreferences());

describe('post moderation preferences', () => {
	it('defaults automatic moderation and NSFW to warning, while AI is ignored', () => {
		expect(contentModerationDisplay({ moderationLabels: ['harassment'] })).toEqual({
			hidden: false,
			warn: true,
			reason: 'automatic',
		});
		expect(contentModerationDisplay({ selfLabels: ['ai-generated'] })).toEqual({
			hidden: false,
			warn: false,
			reason: undefined,
		});
		expect(contentModerationDisplay({ selfLabels: ['sexual'] })).toEqual({
			hidden: false,
			warn: true,
			reason: 'selfNsfw',
		});
	});

	it('lets ignore remove an NSFW warning and hide take priority over warning', () => {
		setModerationPreference('selfNsfw', 'ignore');
		expect(contentModerationDisplay({ selfLabels: ['sexual'] }).warn).toBe(false);

		setModerationPreference('selfAi', 'hide');
		expect(
			contentModerationDisplay({
				selfLabels: ['ai-generated'],
				moderationLabels: ['harassment'],
			}),
		).toEqual({ hidden: true, warn: false, reason: 'selfAi' });
	});
});
