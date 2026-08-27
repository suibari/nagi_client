import { describe, expect, it } from 'vitest';
import type { ActorView } from '$lib/api/types';
import { actorBadges } from './badges';

const actor = (overrides: Partial<ActorView> = {}): ActorView => ({
	did: 'did:plc:test',
	handle: 'test.example.com',
	...overrides,
});

describe('actorBadges', () => {
	it('does not display the super-positive badge even when a level is present', () => {
		expect(actorBadges(actor({ superPositiveLevel: 100 }))).toEqual([]);
	});

	it('keeps the diary title badge visible', () => {
		expect(
			actorBadges(actor({ currentTitle: { ja: 'やさしい一日', en: 'A Gentle Day' } })).map(
				(badge) => badge.id,
			),
		).toEqual(['title']);
	});

	it('only filters the disabled kind when multiple badges apply', () => {
		expect(
			actorBadges(
				actor({
					isBot: true,
					currentTitle: { ja: 'やさしい一日', en: 'A Gentle Day' },
					superPositiveLevel: 50,
				}),
			).map((badge) => badge.id),
		).toEqual(['bot', 'title']);
	});
});
