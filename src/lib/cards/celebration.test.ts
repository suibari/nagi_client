import { describe, expect, it } from 'vitest';
import {
	cardCompletionPercent,
	cardRevealEffect,
	nextCardMilestone,
	rarityConfettiLevel,
	reachedCardMilestone,
} from './celebration';

describe('card celebration', () => {
	it.each([
		[1, undefined],
		[2, 10],
		[5, 20],
		[26, 90],
		[29, 100],
	])('detects a milestone when a new card moves 30-card progress from %i', (before, expected) => {
		expect(reachedCardMilestone(before, 30, { alreadyDrawn: false, isNew: true })).toBe(expected);
	});

	it('does not celebrate duplicates or an idempotently returned daily card', () => {
		expect(reachedCardMilestone(2, 30, { alreadyDrawn: false, isNew: false })).toBeUndefined();
		expect(reachedCardMilestone(2, 30, { alreadyDrawn: true, isNew: true })).toBeUndefined();
	});

	it('calculates visible progress and the next milestone', () => {
		expect(cardCompletionPercent(7, 30)).toBe(23);
		expect(nextCardMilestone(7, 30)).toBe(30);
		expect(nextCardMilestone(30, 30)).toBeUndefined();
	});

	it('maps R and above to increasingly strong confetti levels', () => {
		expect(rarityConfettiLevel('N')).toBeUndefined();
		expect(rarityConfettiLevel('R')).toBe('r');
		expect(rarityConfettiLevel('SR')).toBe('sr');
		expect(rarityConfettiLevel('UR')).toBe('ur');
		expect(rarityConfettiLevel('AAR')).toBe('aar');
	});

	it('increases charge and haptic beats with rarity', () => {
		const effects = ['N', 'R', 'SR', 'UR', 'AAR'].map((rarity) =>
			cardRevealEffect(rarity as 'N' | 'R' | 'SR' | 'UR' | 'AAR'),
		);
		expect(effects.map((effect) => effect.chargeMs)).toEqual([900, 2000, 4000, 6000, 10500]);
		expect(effects.map((effect) => effect.vibration.length)).toEqual([1, 7, 11, 13, 15]);
		expect(effects.at(-1)?.blackout).toBe(true);
		expect(effects.slice(0, -1).every((effect) => !effect.blackout)).toBe(true);
	});

	it('builds through each lower rarity color before the result color', () => {
		expect(cardRevealEffect('N').stages).toEqual([]);
		expect(cardRevealEffect('R').stages).toEqual(['R']);
		expect(cardRevealEffect('SR').stages).toEqual(['R', 'SR']);
		expect(cardRevealEffect('UR').stages).toEqual(['R', 'SR', 'UR']);
		expect(cardRevealEffect('AAR').stages).toEqual(['R', 'SR', 'UR', 'AAR']);
		for (const rarity of ['R', 'SR', 'UR', 'AAR'] as const) {
			expect(cardRevealEffect(rarity).stageMs).toBe(2_000);
		}
		expect(cardRevealEffect('AAR').chargeMs - 4 * cardRevealEffect('AAR').stageMs).toBe(2_500);
	});

	it('uses progressively longer haptic pulses within each rare reveal', () => {
		for (const rarity of ['R', 'SR', 'UR', 'AAR'] as const) {
			const pulses = cardRevealEffect(rarity).vibration.filter((_, index) => index % 2 === 0);
			expect(pulses).toEqual([...pulses].sort((a, b) => a - b));
		}
	});
});
