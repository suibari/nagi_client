import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isGuestCardDrawCurrent } from './guest-draw.svelte';

const affirmationCard = readFileSync(
	new URL('../components/AffirmationCard.svelte', import.meta.url),
	'utf8',
);
const detailDialog = readFileSync(
	new URL('../components/CardDetailDialog.svelte', import.meta.url),
	'utf8',
);
const drawEntry = readFileSync(
	new URL('../components/CardDrawEntry.svelte', import.meta.url),
	'utf8',
);

const result = (expiresAt: string) => ({
	expiresAt,
	card: { volume: 1, id: 1 },
});

describe('guest card day boundary', () => {
	it('keeps only a card whose server-provided JST boundary is still ahead', () => {
		const now = Date.parse('2026-08-19T18:00:00.000Z');
		expect(isGuestCardDrawCurrent(result('2026-08-19T19:00:00.000Z'), now)).toBe(true);
		expect(isGuestCardDrawCurrent(result('2026-08-19T18:00:00.000Z'), now)).toBe(false);
		expect(isGuestCardDrawCurrent(result('2026-08-19T17:59:59.999Z'), now)).toBe(false);
	});

	it('rejects malformed local data instead of keeping it across sign-in', () => {
		expect(isGuestCardDrawCurrent(null)).toBe(false);
		expect(isGuestCardDrawCurrent({ expiresAt: 'invalid', card: { volume: 1, id: 1 } })).toBe(
			false,
		);
		expect(isGuestCardDrawCurrent({ expiresAt: '2999-01-01T00:00:00Z', card: {} })).toBe(false);
	});
});

describe('guest card reveal', () => {
	it('reveals only the drawn guest card without changing its ownership state', () => {
		expect(drawEntry).toContain('revealUnowned={!myDid}');
		expect(detailDialog).toContain('<AffirmationCard {card} size="full" {revealUnowned} />');
		expect(affirmationCard).toContain('const revealed = $derived(card.owned || revealUnowned);');
		expect(affirmationCard).toContain('{#if revealed}');
		expect(affirmationCard).toContain('class:locked={!revealed}');
		expect(affirmationCard).not.toContain('card.owned = true');
	});
});
