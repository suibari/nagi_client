// テスト実行環境は Node だが、クライアント全体の tsconfig には Node 型を混ぜない。
// @ts-expect-error node:fs は Vitest 実行時にのみ使用する。
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

describe('mobile overflow layout contracts', () => {
	it('contains horizontal carousel content inside its own scroll viewport', () => {
		expect(carousel).toMatch(
			/\.horizontal-carousel\s*\{[^}]*inline-size:\s*100%;[^}]*min-inline-size:\s*0;[^}]*max-inline-size:\s*100%;[^}]*overflow-x:\s*auto;[^}]*contain:\s*inline-size;/s,
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

	it('positions persistent mobile controls from the reliable viewport top-left coordinates', () => {
		expect(shellCss).toMatch(
			/\.mobile-nav\s*\{[^}]*position:\s*fixed;[^}]*inset-block-start:\s*calc\(100dvh - 68px - env\(safe-area-inset-bottom\)\);[^}]*inset-inline-start:\s*0;[^}]*inline-size:\s*100vw;[^}]*block-size:\s*calc\(68px \+ env\(safe-area-inset-bottom\)\);/s,
		);
		expect(postFab).toMatch(
			/inset-block-start:\s*calc\(100dvh - 138px - env\(safe-area-inset-bottom\)\);[^}]*inset-inline-start:\s*calc\(100vw - 72px\);/s,
		);
		expect(baseCss).toMatch(/html,\s*body\s*\{[^}]*overflow-x:\s*hidden;[^}]*overflow-x:\s*clip;/s);
	});

	it('does not use the enlarged bottom edge for other floating mobile controls', () => {
		expect(cardDrawFab).toMatch(
			/@media \(max-width:\s*767px\)[\s\S]*?\.card-fab-wrap\s*\{[^}]*bottom:\s*auto;[^}]*top:\s*calc\(100dvh - 82px - env\(safe-area-inset-bottom\)\);[^}]*translate:\s*0 -100%;/,
		);
		expect(postFollowNotice).toMatch(
			/left:\s*50vw;[^}]*top:\s*calc\(100dvh - 24px\);[^}]*translate:\s*-50% -100%;/s,
		);
		expect(reactionRewardHost).toMatch(
			/inset-inline-start:\s*50vw;[^}]*inset-block-start:\s*calc\(100dvh - 84px - env\(safe-area-inset-bottom\)\);[^}]*translate:\s*-50% -100%;/s,
		);
	});

	it('gives full-screen overlays an explicit viewport size', () => {
		expect(postModal).toMatch(
			/\.post-modal-backdrop\s*\{[^}]*position:\s*fixed;[^}]*inset:\s*0;[^}]*inline-size:\s*100vw;[^}]*block-size:\s*100dvh;/s,
		);
		for (const selector of [
			'draft-backdrop',
			'reaction-picker-backdrop',
			'image-viewer',
			'cropper-backdrop',
			'delete-backdrop',
			'card-backdrop',
		]) {
			expect(componentsCss).toMatch(
				new RegExp(
					`\\.${selector}\\s*\\{[^}]*position:\\s*fixed;[^}]*inset:\\s*0;[^}]*inline-size:\\s*100vw;[^}]*block-size:\\s*100dvh;`,
					's',
				),
			);
		}
	});
});
