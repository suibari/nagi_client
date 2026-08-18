// 静的ソース検査は Vitest の Node 環境で実行する。
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
