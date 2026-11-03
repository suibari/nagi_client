import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	clearModerationPreferences,
	contentModerationDisplay,
	setModerationPreferencesScope,
	setModerationPreference,
} from './preferences.svelte';

const values = new Map<string, string>();

beforeEach(() => {
	values.clear();
	Object.defineProperty(globalThis, 'localStorage', {
		configurable: true,
		value: {
			getItem: (key: string) => values.get(key) ?? null,
			setItem: (key: string, value: string) => values.set(key, value),
			removeItem: (key: string) => values.delete(key),
		},
	});
	setModerationPreferencesScope(undefined);
});

afterEach(() => {
	clearModerationPreferences();
	delete (globalThis as { localStorage?: Storage }).localStorage;
});

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

	it('keeps cached choices separate for each signed-in account', () => {
		setModerationPreferencesScope('did:plc:alice');
		setModerationPreference('selfNsfw', 'hide');

		setModerationPreferencesScope('did:plc:bob');
		expect(contentModerationDisplay({ selfLabels: ['sexual'] })).toMatchObject({
			hidden: false,
			warn: true,
		});

		setModerationPreferencesScope('did:plc:alice');
		expect(contentModerationDisplay({ selfLabels: ['sexual'] })).toMatchObject({
			hidden: true,
			warn: false,
		});
	});
});

describe('content already hidden by the author', () => {
	const warned = { contentWarning: true };

	it('does not stack the automatic warning on media the author already blurred', () => {
		expect(
			contentModerationDisplay({ moderationLabels: ['sexual'], images: [warned, warned] }),
		).toEqual({ hidden: false, warn: false, reason: undefined });
		expect(
			contentModerationDisplay({ moderationLabels: ['graphic-media'], video: warned }),
		).toMatchObject({ warn: false });
	});

	it('keeps the warning when some media is left visible', () => {
		expect(
			contentModerationDisplay({ moderationLabels: ['sexual'], images: [warned, {}] }),
		).toEqual({ hidden: false, warn: true, reason: 'automatic' });
		expect(
			contentModerationDisplay({ moderationLabels: ['sexual'], images: [warned], video: {} }),
		).toMatchObject({ warn: true });
	});

	it('keeps warnings that can come from the text or protect minors', () => {
		for (const label of ['harassment', 'hate', '!warn', '!hide'])
			expect(
				contentModerationDisplay({ moderationLabels: [label], images: [warned] }),
			).toMatchObject({ warn: true, reason: 'automatic' });
		expect(
			contentModerationDisplay({ moderationLabels: ['sexual', 'harassment'], images: [warned] }),
		).toMatchObject({ warn: true });
	});

	it('still hides when the viewer chose to hide automatic labels', () => {
		setModerationPreference('automatic', 'hide');
		expect(contentModerationDisplay({ moderationLabels: ['sexual'], images: [warned] })).toEqual({
			hidden: true,
			warn: false,
			reason: 'automatic',
		});
	});

	it('keeps the author NSFW label covering the whole post, text included', () => {
		expect(contentModerationDisplay({ selfLabels: ['sexual'], images: [warned] })).toEqual({
			hidden: false,
			warn: true,
			reason: 'selfNsfw',
		});
	});

	it('titles the warning with the author label rather than the automatic one', () => {
		expect(
			contentModerationDisplay({ selfLabels: ['sexual'], moderationLabels: ['sexual'] }),
		).toEqual({ hidden: false, warn: true, reason: 'selfNsfw' });
	});
});

describe('moderation settings layout', () => {
	it('shows content choices before age assurance and orders NSFW, AI, automatic', () => {
		const page = readFileSync(
			new URL('../../routes/settings/moderation/+page.svelte', import.meta.url),
			'utf8',
		);
		const keys = [...page.matchAll(/\{ key: '(selfNsfw|selfAi|automatic)'/g)].map(
			(match) => match[1],
		);
		expect(keys).toEqual(['selfNsfw', 'selfAi', 'automatic']);
		expect(page.indexOf('title={m.moderationSectionTitle()}')).toBeGreaterThan(-1);
		expect(page.indexOf('title={m.moderationSectionTitle()}')).toBeLessThan(
			page.indexOf('title={m.ageSectionTitle()}'),
		);
	});
});
