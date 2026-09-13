import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const chatBubble = readFileSync(new URL('./ChatBubble.svelte', import.meta.url), 'utf8');

describe('post edit cancellation', () => {
	it('offers a cancel button beside the edit submit action', () => {
		expect(chatBubble).toMatch(
			/class="ghost icon-action"[\s\S]*?aria-label=\{m\.cancel\(\)\}[\s\S]*?onclick=\{cancelEdit\}/,
		);
	});

	it('cancels with Escape unless a nested editor interaction handled it', () => {
		expect(chatBubble).toContain('use:editEscape');
		expect(chatBubble).toContain("node.addEventListener('keydown', handleEditKeydown)");
		expect(chatBubble).toContain("event.key !== 'Escape'");
		expect(chatBubble).toContain('event.defaultPrevented');
		expect(chatBubble).toContain('event.isComposing');
		expect(chatBubble).toContain('cancelEdit();');
	});

	it('does not hide an edit while its submission is in progress', () => {
		expect(chatBubble).toMatch(/function cancelEdit\(\) \{\s*if \(editBusy\) return;/);
		expect(chatBubble).toMatch(/disabled=\{editBusy\}[\s\S]*?aria-label=\{m\.cancel\(\)\}/);
	});
});
