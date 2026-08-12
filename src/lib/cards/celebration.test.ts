import { describe, expect, it } from 'vitest';
import {
	cardCompletionPercent,
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

	it('maps only SR and above to increasingly strong confetti levels', () => {
		expect(rarityConfettiLevel('N')).toBeUndefined();
		expect(rarityConfettiLevel('R')).toBeUndefined();
		expect(rarityConfettiLevel('SR')).toBe('sr');
		expect(rarityConfettiLevel('UR')).toBe('ur');
		expect(rarityConfettiLevel('AAR')).toBe('aar');
	});
});
