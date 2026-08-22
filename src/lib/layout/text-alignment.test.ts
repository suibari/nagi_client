import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

describe('readable text alignment', () => {
	it('left-aligns shared states and settings details', () => {
		const baseCss = read('../../routes/styles/base.css');
		const componentsCss = read('../../routes/styles/components.css');

		expect(baseCss).toMatch(/\.state,\s*\.notice\s*\{[^}]*text-align:\s*start;/s);
		expect(componentsCss).toMatch(/\.settings-detail\s*\{[^}]*text-align:\s*start;/s);
	});

	it('keeps affirmation-card text left-aligned in every host', () => {
		const card = read('../components/AffirmationCard.svelte');
		const detail = read('../components/CardDetailDialog.svelte');
		const guide = read('../components/CardReactionGuideDialog.svelte');
		const milestone = read('../components/CardMilestoneDialog.svelte');

		expect(card).toMatch(/\.card\s*\{[^}]*text-align:\s*start;/s);
		expect(detail).toMatch(/\.draw-dialog\s*\{[^}]*text-align:\s*start;/s);
		expect(guide).toMatch(/\.card-guide\s*\{[^}]*text-align:\s*start;/s);
		expect(milestone).toMatch(/\.milestone-dialog\s*\{[^}]*text-align:\s*start;/s);
	});

	it('left-aligns infinite-scroll errors', () => {
		const infiniteScroll = read('../components/InfiniteScroll.svelte');

		expect(infiniteScroll).toMatch(/\.infinite-scroll-error\s*\{[^}]*text-align:\s*start;/s);
	});
});
