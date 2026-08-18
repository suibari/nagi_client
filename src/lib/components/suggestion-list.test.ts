// テスト実行環境は Node だが、クライアント全体の tsconfig には Node 型を混ぜない。
// @ts-expect-error node:fs は Vitest 実行時にのみ使用する。
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

const suggestionList = read('./SuggestionList.svelte');
const componentsCss = read('../../routes/styles/components.css');

describe('suggestion list selection', () => {
	it('exposes the keyboard-selected option to styling and assistive technology', () => {
		expect(suggestionList).toContain('class:active={index === activeIndex}');
		expect(suggestionList).toContain('aria-selected={index === activeIndex}');
	});

	it('visually distinguishes the selected option from hover', () => {
		expect(componentsCss).toMatch(
			/\.mention-suggestions button:hover\s*\{[^}]*background:\s*var\(--bg-hover\);/s,
		);
		expect(componentsCss).toMatch(
			/\.mention-suggestions button\.active\s*\{[^}]*background:\s*var\(--accent-soft\);[^}]*color:\s*var\(--accent-strong\);[^}]*box-shadow:\s*inset 3px 0 0 var\(--accent\);/s,
		);
	});

	it('does not refer to the removed undefined surface tokens', () => {
		expect(componentsCss).not.toMatch(/var\(--bg-(?:subtle|soft)\)/);
	});
});
