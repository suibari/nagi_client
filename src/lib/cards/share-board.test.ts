import { describe, expect, it } from 'vitest';
import { donateFlightPlan, donateVibration } from './share-board';

describe('donateFlightPlan', () => {
	it('置いたカードを1枚ずつに展開し、合計の Ƶ を保つ', () => {
		const plan = donateFlightPlan([
			{ volume: 1, id: 1, rarity: 'N', quantity: 3, zenny: 3 },
			{ volume: 1, id: 13, rarity: 'R', quantity: 1, zenny: 3 },
		]);
		expect(plan.map((s) => s.id)).toEqual([1, 1, 1, 13]);
		expect(plan.reduce((sum, s) => sum + s.zenny, 0)).toBe(6);
	});

	it('だんだん加速し、間隔は下限で止まる', () => {
		const plan = donateFlightPlan([{ volume: 1, id: 1, rarity: 'N', quantity: 60, zenny: 60 }]);
		const gaps = plan.slice(1).map((s, i) => s.delayMs - plan[i].delayMs);
		expect(gaps[0]).toBeGreaterThan(gaps[5]);
		expect(Math.min(...gaps)).toBeGreaterThanOrEqual(69);
		// 60枚でも10秒以内に流し終える。
		expect(plan.at(-1)!.delayMs).toBeLessThan(10_000);
	});

	it('何も置いていなければ空', () => {
		expect(donateFlightPlan([])).toEqual([]);
	});
});

describe('donateVibration', () => {
	it('レアほど強い', () => {
		const total = (r: Parameters<typeof donateVibration>[0]) =>
			donateVibration(r).reduce((a, b) => a + b, 0);
		expect(total('N')).toBeLessThan(total('R'));
		expect(total('R')).toBeLessThan(total('SR'));
		expect(total('UR')).toBeLessThan(total('AAR'));
	});
});
