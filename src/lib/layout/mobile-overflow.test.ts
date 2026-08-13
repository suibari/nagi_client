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

	it('pins the mobile navigation to the viewport even if document content overflows', () => {
		expect(shellCss).toMatch(
			/\.mobile-nav\s*\{[^}]*position:\s*fixed;[^}]*inset-inline-start:\s*0;[^}]*inline-size:\s*100vw;[^}]*max-inline-size:\s*100vw;/s,
		);
		expect(baseCss).toMatch(/html,\s*body\s*\{[^}]*overflow-x:\s*hidden;[^}]*overflow-x:\s*clip;/s);
	});
});
