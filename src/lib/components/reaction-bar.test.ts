import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const componentsCss = read('../../routes/styles/components.css');
const reactionBar = read('./ReactionBar.svelte');
const reactionStamp = read('./ReactionStamp.svelte');
const chatBubble = read('./ChatBubble.svelte');
const newsCard = read('./NewsCard.svelte');
const kossoriReactionBubble = read('./KossoriReactionBubble.svelte');
const communityAffirmationPanel = read('./CommunityAffirmationPanel.svelte');

function cssRule(selector: string): string {
	return componentsCss.match(new RegExp(`\\.${selector}\\s*\\{[^}]*\\}`, 's'))?.[0] ?? '';
}

describe('reaction bar presentation', () => {
	it('shows reactor identities only when the subject owner explicitly opts in', () => {
		expect(reactionBar).toMatch(/showReactors\s*=\s*false/);
		expect(chatBubble).toContain('showReactors={mine}');
		expect(newsCard).toContain('showReactors={false}');
		expect(communityAffirmationPanel).toContain('showReactors={false}');
		expect(kossoriReactionBubble).toMatch(/<ReactionBar[\s\S]*?showReactors[\s\S]*?\/>/);
	});

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

	it('animates a reaction chip only while the button is pressed', () => {
		const active = cssRule('reaction-emoji\\.active');
		expect(active).not.toMatch(/animation:/);
		expect(componentsCss).toMatch(
			/button\.reaction-emoji:active\s*\{[^}]*transform:\s*scale\(1\.15\);/s,
		);
		expect(componentsCss).not.toContain('@keyframes reaction-pop');
	});

	it('keeps reactor avatars visually balanced beside the larger chips', () => {
		expect(componentsCss).toMatch(
			/\.reaction-avatar \.avatar\.small\s*\{[^}]*width:\s*28px;[^}]*height:\s*28px;/s,
		);
	});

	it('pops an added reaction as a temporary stamp at the interaction origin', () => {
		expect(reactionBar).toContain('use:registerReactionButton={keyOf(reaction)}');
		expect(reactionBar).toContain('popStamp(raw, reactionButtons.get(key) ?? origin);');
		expect(reactionBar).toContain("import ReactionStamp from './ReactionStamp.svelte'");
		expect(reactionBar).toContain('<ReactionStamp');
		expect(reactionStamp).toContain("import { portal } from '$lib/actions/portal'");
		expect(reactionStamp).toContain('use:portal');
		expect(reactionStamp).toContain('class="reaction-stamp"');
		expect(reactionStamp).toContain('animation: stamp-fade 0.72s linear both;');
		expect(reactionStamp).toContain(
			'animation: stamp-grow 0.72s cubic-bezier(0.16, 0.8, 0.2, 1) both;',
		);
		expect(reactionStamp).toMatch(
			/@keyframes stamp-fade[\s\S]*34%[\s\S]*opacity:\s*1;[\s\S]*100%[\s\S]*opacity:\s*0;/,
		);
		expect(reactionStamp).toMatch(
			/@keyframes stamp-grow[\s\S]*scale\(0\.58\)[\s\S]*scale\(1\.45\)/,
		);
		expect(reactionStamp).toMatch(
			/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.reaction-stamp[\s\S]*display:\s*none;/,
		);
		expect(reactionBar.indexOf('popStamp(raw, reactionButtons.get(key) ?? origin);')).toBeLessThan(
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
