import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const componentsCss = read('../../routes/styles/components.css');

function cssRule(selector: string): string {
	return componentsCss.match(new RegExp(`\\.${selector}\\s*\\{[^}]*\\}`, 's'))?.[0] ?? '';
}

describe('reaction bar presentation', () => {
	it('keeps reaction chips large enough for expressive emoji', () => {
		const emoji = cssRule('reaction-emoji');
		expect(emoji).toMatch(/min-width:\s*36px;/);
		expect(emoji).toMatch(/height:\s*36px;/);
		expect(emoji).toMatch(/padding:\s*0 10px;/);
		expect(emoji).toMatch(/font-size:\s*20px;/);
		expect(emoji).toMatch(/background:\s*var\(--surface-2\);/);

		const image = cssRule('reaction-image');
		expect(image).toMatch(/height:\s*26px;/);
		expect(image).toMatch(/min-width:\s*26px;/);
	});

	it('keeps reactor avatars visually balanced beside the larger chips', () => {
		expect(componentsCss).toMatch(
			/\.reaction-avatar \.avatar\.small\s*\{[^}]*width:\s*28px;[^}]*height:\s*28px;/s,
		);
	});
});
