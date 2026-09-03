import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const composer = read('./Composer.svelte');
const editor = read('./ComposerEditor.svelte');
const modal = read('./PostModalShell.svelte');
const signedInModal = read('./PostModal.svelte');
const guestModal = read('./GuestPostModal.svelte');
const textarea = read('./MentionTextarea.svelte');
const caret = read('./textarea-caret.ts');
const styles = read('../../routes/styles/components.css');

describe('rich composer improvements', () => {
	it('uses the agreed desktop breakpoint and keeps the narrow tab layout', () => {
		expect(editor).toContain("window.matchMedia('(min-width: 1024px)')");
		expect(editor).toContain("mode === 'rich' && !realtimePreview");
		expect(modal).toMatch(/@media \(min-width: 1024px\)[\s\S]*?\.post-modal\.rich[\s\S]*?1040px/);
		expect(styles).toContain('.composer-editor-panes.realtime-preview');
	});

	it('renders one draft control in both modes and debounces rich autosave', () => {
		expect(composer.match(/class="icon-action draft-open"/g)).toHaveLength(1);
		expect(composer).toContain("mode !== 'rich'");
		expect(composer).toContain('setTimeout(() => void startDraftSave(key, draftSnapshot()), 1500)');
		expect(composer).toContain('attachments: []');
		expect(composer).toContain("draftSaveStatus === 'saving'");
		expect(composer).toContain('await finishDraftSaves()');
	});

	it('keeps the modal mode until posting and resets it only after success', () => {
		expect(modal).toContain('onmodechange?.(nextMode)');
		expect(signedInModal).toContain('mode = getComposerMode()');
		expect(signedInModal).toContain('mode = resetComposerMode()');
		expect(guestModal).toContain('mode = getComposerMode()');
		expect(guestModal).toContain('mode = resetComposerMode()');
	});

	it('keeps markdown headings larger than the 15px post body', () => {
		expect(styles).toMatch(/\.post-text h3\s*\{\s*font-size: 20px;/);
		expect(styles).toMatch(/\.post-text h4\s*\{\s*font-size: 18px;/);
		expect(styles).toMatch(/\.post-text h5\s*\{\s*font-size: 16px;/);
	});

	it('keeps markdown lists flush with the surrounding text', () => {
		expect(styles).toMatch(/\.post-text ul,\s*\.post-text ol\s*\{\s*margin: 0;/);
	});

	it('routes emoji choices through the shared suggestion keyboard handling', () => {
		expect(textarea).toContain("token.kind === 'emoji'");
		expect(textarea).toContain("event.key === 'Enter' || event.key === 'Tab'");
		expect(textarea).toContain('<EmojiSuggestionList');
	});

	it('anchors suggestions to the textarea caret and clamps them to the viewport', () => {
		expect(textarea).toContain('const caret = textareaCaretRect(textarea)');
		expect(textarea).toContain('Math.max(margin, caret.left)');
		expect(caret).toContain("whiteSpace: 'pre-wrap'");
		expect(caret).toContain('textarea.scrollTop');
	});
});
