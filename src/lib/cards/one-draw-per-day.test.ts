import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BOT_AAR_PRICE } from './share-board';
import { ja } from '$lib/i18n/ja';
import { en } from '$lib/i18n/en';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

// CARD-02: カードは通常枠の1日1枚。リアクションで追加の枠を開かない。
describe('one card draw per day', () => {
	it('does not draw a card after reacting', () => {
		const reactionBar = read('../components/ReactionBar.svelte');
		expect(reactionBar).not.toMatch(/drawCard|reaction-reward|cardReward/);
	});

	it('never requests a reaction-slot draw', () => {
		const appview = read('../api/appview.ts');
		expect(appview).not.toMatch(/source:\s*'reaction'/);
	});

	it('removes the reaction-slot guidance from both locales', () => {
		for (const messages of [ja, en]) {
			expect(Object.keys(messages).filter((key) => /^cardReaction/.test(key))).toEqual([]);
		}
	});
});

// CARD-07: ボードに無いAARは botたんの分として300Ƶ。
describe('bot AAR price', () => {
	it('shows 300 Zenny in the board help', () => {
		expect(BOT_AAR_PRICE).toBe(300);
	});
});
