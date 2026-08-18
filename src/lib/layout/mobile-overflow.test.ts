// 静的ソース検査は Vitest の Node 環境で実行する。
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

const carousel = read('../components/HorizontalCarousel.svelte');
const myNagiSection = read('../components/MyNagiSection.svelte');
const myNagiPage = read('../../routes/+page.svelte');
const baseCss = read('../../routes/styles/base.css');
const shellCss = read('../../routes/styles/shell.css');
const componentsCss = read('../../routes/styles/components.css');
const postFab = read('../components/PostFab.svelte');
const cardDrawFab = read('../components/CardDrawFab.svelte');
const postFollowNotice = read('../components/PostFollowNotice.svelte');
const reactionRewardHost = read('../components/ReactionCardRewardHost.svelte');
const postModal = read('../components/PostModal.svelte');
const fixedOverlayComponents = [
	[read('../components/BookmarkFolderDialog.svelte'), 'folder-dialog-backdrop'],
	[read('../components/CardDetailDialog.svelte'), 'draw-backdrop'],
	[read('../components/CardMilestoneDialog.svelte'), 'milestone-backdrop'],
	[read('../components/CardReactionGuideDialog.svelte'), 'card-guide-backdrop'],
	[read('../components/Confetti.svelte'), 'confetti-layer'],
	[read('../components/NewsSubmissionDialog.svelte'), 'news-submit-backdrop'],
	[postModal, 'post-modal-backdrop'],
	[read('../components/PostScopeDialog.svelte'), 'scope-backdrop'],
] as const;

function cssRule(source: string, selector: string): string {
	return source.match(new RegExp(`\\.${selector}\\s*\\{[^}]*\\}`, 's'))?.[0] ?? '';
}

function cssRules(source: string, selector: string): string[] {
	return [...source.matchAll(new RegExp(`\\.${selector}\\s*\\{[^}]*\\}`, 'gs'))].map(
		(match) => match[0],
	);
}

describe('mobile overflow layout contracts', () => {
	it('contains horizontal carousel content inside its own scroll viewport', () => {
		expect(carousel).toMatch(
			/\.horizontal-carousel\s*\{[^}]*inline-size:\s*100%;[^}]*min-inline-size:\s*0;[^}]*max-inline-size:\s*100%;[^}]*overflow-x:\s*auto;[^}]*contain:\s*inline-size layout paint;/s,
		);
		expect(carousel).toMatch(
			/\.horizontal-carousel\s+:global\(\.horizontal-carousel-track\)\s*\{[^}]*inline-size:\s*100%;[^}]*min-inline-size:\s*0;[^}]*max-inline-size:\s*100%;/s,
		);
	});

	it('keeps every my Nagi section within the main column', () => {
		expect(myNagiSection).toMatch(
			/\.my-nagi-section\s*\{[^}]*inline-size:\s*100%;[^}]*min-inline-size:\s*0;[^}]*max-inline-size:\s*100%;/s,
		);
		expect(myNagiSection).toMatch(
			/\.my-nagi-section-body\s*\{[^}]*inline-size:\s*100%;[^}]*min-inline-size:\s*0;[^}]*max-inline-size:\s*100%;/s,
		);
		expect(myNagiPage).toMatch(
			/\.my-nagi-heading\s*\{[^}]*inline-size:\s*100%;[^}]*min-inline-size:\s*0;[^}]*max-inline-size:\s*100%;/s,
		);
		expect(shellCss).toMatch(
			/\.community-affirmation\s*\{[^}]*inline-size:\s*100%;[^}]*min-inline-size:\s*0;[^}]*max-inline-size:\s*100%;/s,
		);
	});

	it('contains the custom feed-tab preview inside the settings card', () => {
		expect(componentsCss).toMatch(
			/\.feed-tab-preview\s*\{[^}]*inline-size:\s*100%;[^}]*min-inline-size:\s*0;[^}]*max-inline-size:\s*100%;/s,
		);
		expect(componentsCss).toMatch(
			/\.feed-tab-preview \.feed-tabs\s*\{[^}]*inline-size:\s*100%;[^}]*min-inline-size:\s*0;[^}]*max-inline-size:\s*100%;/s,
		);
		expect(shellCss).toMatch(/\.feed-tabs\.scrollable\s*\{[^}]*overflow-x:\s*auto;/s);
	});

	it('keeps post controls shrinkable and wrapping on narrow screens', () => {
		for (const selector of ['timeline', 'post-row', 'post-actions', 'reactions']) {
			expect(componentsCss).toMatch(
				new RegExp(
					`\\.${selector}\\s*\\{[^}]*min-inline-size:\\s*0;[^}]*max-inline-size:\\s*100%;`,
					's',
				),
			);
		}
		expect(componentsCss).toMatch(/\.post-actions\s*\{[^}]*flex-wrap:\s*wrap;/s);
	});

	it('anchors persistent mobile controls to viewport edges across dynamic viewport changes', () => {
		expect(shellCss).toMatch(
			/\.mobile-nav\s*\{[^}]*position:\s*fixed;[^}]*inset-inline:\s*0;[^}]*inset-block-end:\s*0;[^}]*min-block-size:\s*calc\(68px \+ env\(safe-area-inset-bottom\)\);/s,
		);
		expect(postFab).toMatch(
			/inset-block-end:\s*calc\(82px \+ env\(safe-area-inset-bottom\)\);[^}]*inset-inline-end:\s*16px;/s,
		);
		for (const rule of cssRules(shellCss, 'mobile-nav')) expect(rule).not.toMatch(/100[vd]?[wh]/);
		for (const rule of cssRules(postFab, 'post-fab')) expect(rule).not.toMatch(/100[vd]?[wh]/);
		expect(baseCss).toMatch(
			/html\s*\{[^}]*overflow-x:\s*hidden;[^}]*overflow-y:\s*auto;[^}]*overscroll-behavior-x:\s*none;/s,
		);
		expect(baseCss).toMatch(
			/body\s*\{[^}]*overflow-x:\s*clip;[^}]*overscroll-behavior-x:\s*none;/s,
		);
	});

	it('anchors other floating mobile controls to the bottom edge', () => {
		expect(cardDrawFab).toMatch(
			/@media \(max-width:\s*767px\)[\s\S]*?\.card-fab-wrap\s*\{[^}]*bottom:\s*calc\(82px \+ env\(safe-area-inset-bottom\)\);/,
		);
		expect(postFollowNotice).toMatch(
			/left:\s*50%;[^}]*bottom:\s*24px;[^}]*transform:\s*translateX\(-50%\);/s,
		);
		expect(reactionRewardHost).toMatch(
			/inset-inline:\s*50% auto;[^}]*inset-block-end:\s*calc\(84px \+ env\(safe-area-inset-bottom\)\);[^}]*transform:\s*translateX\(-50%\);/s,
		);
	});

	it('sizes full-screen overlays from fixed edges instead of dynamic viewport units', () => {
		for (const [source, selector] of fixedOverlayComponents) {
			const rule = cssRule(source, selector);
			expect(rule).toMatch(/position:\s*fixed;/);
			expect(rule).toMatch(/inset:\s*0;/);
			expect(rule).not.toMatch(/(?:inline|block)-size:\s*100[vd]?[wh];/);
		}
		for (const selector of [
			'draft-backdrop',
			'reaction-picker-backdrop',
			'image-viewer',
			'cropper-backdrop',
			'delete-backdrop',
			'card-backdrop',
		]) {
			const rules = cssRules(componentsCss, selector);
			expect(rules.length).toBeGreaterThan(0);
			const fixedRule = rules.find((rule) => /position:\s*fixed;/.test(rule));
			expect(fixedRule).toMatch(/inset:\s*0;/);
			for (const rule of rules) {
				expect(rule).not.toMatch(/(?:inline|block)-size:\s*100[vd]?[wh];/);
			}
		}
	});
});
