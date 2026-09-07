import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const componentsCss = read('../../routes/styles/components.css');
const reactionBar = read('./ReactionBar.svelte');
const reactionStamp = read('./ReactionStamp.svelte');

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

	it('pops an added reaction as a temporary stamp at the interaction origin', () => {
		expect(reactionBar).toContain('popStamp(raw, origin);');
		expect(reactionBar).toContain("import ReactionStamp from './ReactionStamp.svelte'");
		expect(reactionBar).toContain('<ReactionStamp');
		expect(reactionStamp).toContain('class="reaction-stamp"');
		expect(reactionStamp).toMatch(
			/@keyframes stamp-pop[\s\S]*translateY\(-36px\)[\s\S]*scale\(0\.86\)/,
		);
		expect(reactionBar.indexOf('popStamp(raw, origin);')).toBeLessThan(
			reactionBar.indexOf('await createReaction'),
		);
	});

	it('bursts short-lived sparks radially behind the stamp', () => {
		expect(reactionStamp).toContain('length: 12');
		expect(reactionStamp).toContain('angle: index * 30');
		expect(reactionStamp).toContain('class="reaction-firework"');
		expect(reactionStamp).toMatch(
			/@keyframes reaction-spark[\s\S]*translateY\(var\(--spark-distance\)\)[\s\S]*opacity:\s*0;/,
		);
	});
});
