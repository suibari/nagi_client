import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CARD_PACK_TEAR_THRESHOLD, cardPackTearProgress } from './pack-assets';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const dialog = read('../components/CardDetailDialog.svelte');
const pack = read('../components/CardPack.svelte');

describe('card pack tear progress (CARD-09)', () => {
	it('右へなぞった量をパック幅の85%で破り切る', () => {
		expect(cardPackTearProgress(10, 10, 300)).toBe(0);
		expect(cardPackTearProgress(0, 127.5, 300)).toBeCloseTo(0.5);
		expect(cardPackTearProgress(0, 400, 300)).toBe(1);
	});

	it('左へ動かしても破れない', () => {
		expect(cardPackTearProgress(200, 50, 300)).toBe(0);
	});

	it('6割で自動完了、それ未満は戻す', () => {
		expect(CARD_PACK_TEAR_THRESHOLD).toBe(0.6);
		expect(pack).toContain('if (tear >= CARD_PACK_TEAR_THRESHOLD) finishTear();');
		expect(pack).toContain('else tear = 0;');
	});
});

describe('card pack presentation contract (CARD-09)', () => {
	it('抽選で引いた直後だけパックを出す。記念日・動きを減らす設定・見返しでは出さない', () => {
		expect(dialog).toContain(
			"const usePack = shouldAnimate && !reduceMotion && draw?.source !== 'anniversary';",
		);
		expect(dialog).toContain("usePack ? 'sealed' : 'none'");
	});

	it('パックからレア度を漏らさない', () => {
		expect(pack).not.toMatch(/rarity/i);
		expect(dialog).toContain("active={shouldAnimate && !skipped && packPhase === 'none'}");
		// タメの振動はパックが開いてから始める。
		expect(dialog).toMatch(/function openPack\(\)[\s\S]*startCharge\(\);/);
		expect(dialog).toMatch(/if \(packPhase === 'none'\) startCharge\(\);/);
	});

	it('開封前は背景のクリックで閉じない', () => {
		expect(dialog).toMatch(
			/function backdropClick\(event: MouseEvent\) \{[\s\S]*?if \(packPhase === 'sealed'\) return;/,
		);
	});

	it('タップ・キーボードでも開けるボタンで、なぞりはスクロールと競合させない', () => {
		expect(pack).toMatch(/<button[\s\S]*?type="button"[\s\S]*?class="card-pack"/);
		expect(pack).toContain('aria-label={m.cardPackOpenLabel()}');
		expect(pack).toContain('onclick={click}');
		expect(pack).toMatch(/\.card-pack \{[^}]*touch-action: none;/s);
	});

	it('ロゴとbotたんは装飾として描く', () => {
		expect(pack).toContain('src={CARD_PACK_LOGO_SRC} alt=""');
		expect(pack).toContain('src={CARD_PACK_HERO_SRC} alt=""');
	});

	it('スキップでパックごと抜ける', () => {
		expect(dialog).toMatch(/function finishReveal\(\) \{[\s\S]*?packPhase = 'none';/);
	});
});
