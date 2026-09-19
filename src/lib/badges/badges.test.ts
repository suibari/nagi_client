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

describe('今日のゼンカツ部長', () => {
	it('受賞していなければ出さない', () => {
		expect(actorBadges(actor({})).map((b) => b.id)).not.toContain('zenkatsu-chief');
	});

	it('受賞していればラベルに賞名まで出す（title はタッチ端末で読めないため）', () => {
		const badge = actorBadges(actor({ zenkatsuChief: true })).find(
			(b) => b.id === 'zenkatsu-chief',
		);
		expect(badge).toBeDefined();
		// 絵文字だけだとスマホで意味が伝わらない。
		expect(badge?.label).toContain('ゼンカツ部長');
		expect(badge?.title).toBeTruthy();
	});

	it('累積を表す情報は持たない（回数やレベルを出さない）', () => {
		// 累積表示は競争圧力になるとして超ポジティブLvが既に非表示にされている。
		// 同じものを別名で復活させないための固定。
		const badge = actorBadges(actor({ zenkatsuChief: true })).find(
			(b) => b.id === 'zenkatsu-chief',
		);
		expect(badge?.label).not.toMatch(/\d/);
	});
});
