import { describe, expect, it } from 'vitest';
import type { AdventCardView } from '$lib/api/types';
import {
	adventDayFromReasonUri,
	adventOpenedDay,
	adventShareUrl,
	adventSlots,
	adventYear,
	garlandPath,
	isAdventMenuSeason,
	parseAdventDayParam,
	treeHalfWidth,
	unopenedOwnDays,
} from './advent';

describe('advent calendar dates', () => {
	it('opens each day at JST midnight', () => {
		expect(adventOpenedDay(2026, Date.parse('2026-11-30T14:59:59Z'))).toBe(0);
		expect(adventOpenedDay(2026, Date.parse('2026-11-30T15:00:00Z'))).toBe(1);
		expect(adventOpenedDay(2026, Date.parse('2026-12-24T15:00:00Z'))).toBe(25);
	});

	it('shows the menu from December 1 to January 7 (JST)', () => {
		expect(isAdventMenuSeason(Date.parse('2026-11-30T14:59:59Z'))).toBe(false);
		expect(isAdventMenuSeason(Date.parse('2026-11-30T15:00:00Z'))).toBe(true);
		expect(isAdventMenuSeason(Date.parse('2027-01-07T14:59:59Z'))).toBe(true);
		expect(isAdventMenuSeason(Date.parse('2027-01-07T15:00:00Z'))).toBe(false);
	});

	it('keeps pointing at last year’s calendar during January', () => {
		expect(adventYear(Date.parse('2027-01-05T00:00:00Z'))).toBe(2026);
		expect(adventYear(Date.parse('2026-12-05T00:00:00Z'))).toBe(2026);
	});

	it('parses only valid day params and notification URIs', () => {
		expect(parseAdventDayParam('3')).toBe(3);
		expect(parseAdventDayParam('25')).toBe(25);
		expect(parseAdventDayParam('26')).toBeUndefined();
		expect(parseAdventDayParam('0')).toBeUndefined();
		expect(parseAdventDayParam('3a')).toBeUndefined();
		expect(adventDayFromReasonUri('at://did:plc:a/advent/2026-12-03')).toBe(3);
		expect(adventDayFromReasonUri('at://did:plc:a/chronicle/2026-12-03')).toBeUndefined();
	});
});

describe('share link', () => {
	it('adds lang=en only for English viewers', () => {
		expect(adventShareUrl('https://nagi.suibari.com', 3)).toBe(
			'https://nagi.suibari.com/advent?day=3',
		);
		expect(adventShareUrl('https://nagi.suibari.com', 3, 'en')).toBe(
			'https://nagi.suibari.com/advent?day=3&lang=en',
		);
	});
});

describe('tree layout', () => {
	const slots = adventSlots();

	it('places 25 ornaments from the bottom up, with 25 at the top', () => {
		expect(slots.map((slot) => slot.day)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
		const ys = slots.map((slot) => slot.y);
		for (let i = 1; i < ys.length; i += 1) expect(ys[i]).toBeLessThanOrEqual(ys[i - 1]);
		expect(slots[24].y).toBe(Math.min(...ys));
		expect(slots[0].y).toBe(Math.max(...ys));
	});

	it('keeps every ornament on the tree', () => {
		for (const slot of slots.slice(0, 24))
			expect(Math.abs(slot.x - 50)).toBeLessThanOrEqual(treeHalfWidth(slot.y));
	});

	it('draws the garland through days 1–24 in order', () => {
		const path = garlandPath(slots);
		expect(path.startsWith(`M ${slots[0].x} ${slots[0].y}`)).toBe(true);
		expect(path.split(/[MQ]/).filter((part) => part.trim()).length).toBe(24);
	});
});

describe('letter animation', () => {
	const card = (day: number, did: string) => ({ day, actor: { did } }) as AdventCardView;

	it('lists only the viewer’s unopened cards, oldest first', () => {
		const cards = [card(5, 'did:me'), card(2, 'did:me'), card(3, 'did:other'), card(1, 'did:me')];
		expect(unopenedOwnDays(cards, 'did:me', [1])).toEqual([2, 5]);
		expect(unopenedOwnDays(cards, undefined, [])).toEqual([]);
	});
});
