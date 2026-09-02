import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const dialog = read('../components/CardDetailDialog.svelte');
const effects = read('../components/CardDrawEffects.svelte');
const devCards = read('../../routes/dev/cards/+page.svelte');

describe('card reveal presentation contract', () => {
	it('offers an accessible skip path and stops haptics', () => {
		expect(dialog).toContain('cardDrawSkip');
		expect(dialog).toContain('function skipReveal()');
		expect(dialog).toContain('navigator.vibrate(0)');
		expect(dialog).toContain('prefers-reduced-motion: reduce');
	});

	it('shakes the card during the charge and stops at reveal', () => {
		expect(dialog).toContain('class:charging={shouldAnimate && !revealed && !skipped}');
		expect(dialog).toContain('class="draw-shake"');
		expect(dialog).toMatch(/\.draw-stage\.charging \.draw-shake\s*\{[^}]*draw-shake-hard/s);
		expect(dialog).toMatch(/\.draw-stage\.rarity-aar\s*\{[^}]*--shake-x:\s*11px;/s);
		expect(dialog).toMatch(/\.draw-stage\.rarity-aar\s*\{[^}]*--shake-hard-speed:\s*0\.045s;/s);
		expect(effects).toContain('blackout-in var(--blackout-duration)');
	});

	it('steps through rarity-colored ripples before the final reveal', () => {
		expect(effects).toContain('{#each effect.stages as stage');
		expect(effects).toContain('stage-{stage.toLowerCase()}');
		expect(effects).toContain('charge-ripple-build');
		expect(effects).toContain('index * effect.stageMs');
	});

	it('collapses an AAR cross into full black before releasing a white flash', () => {
		expect(effects).toContain('class="crt-plus"');
		expect(effects).toContain('crt-plus-collapse');
		expect(effects).toContain('blackout-release');
		expect(effects).toMatch(/48%,\s*100%\s*\{\s*opacity:\s*0;\s*transform:\s*scale\(0\);/s);
	});

	it('uses ripples, focus lines, and AAR blackout without lightning', () => {
		expect(effects).toContain('reveal-ripple');
		expect(effects).toContain('focus-lines');
		expect(effects).toContain('draw-blackout');
		expect(effects).not.toMatch(/lightning|<svg/i);
	});

	it('renders effects at the viewport layer instead of inside the card shell', () => {
		expect(effects).toMatch(/\.draw-fx\s*\{[^}]*position:\s*fixed;[^}]*inset:\s*0;/s);
		expect(dialog.indexOf('<CardDrawEffects')).toBeLessThan(
			dialog.indexOf('<div class="draw-dialog"'),
		);
		expect(dialog).toMatch(/\.draw-dialog\s*\{[^}]*scrollbar-width:\s*none;/s);
		expect(dialog).toMatch(/\.draw-dialog::\-webkit-scrollbar\s*\{[^}]*display:\s*none;/s);
	});

	it('exposes every rarity in the development preview', () => {
		for (const rarity of ['new-n', 'new-r', 'new-sr', 'new-ur', 'new-aar']) {
			expect(devCards).toContain(`'${rarity}'`);
		}
	});
});
