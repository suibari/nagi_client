import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const composer = read('./Composer.svelte');
const editor = read('./ComposerEditor.svelte');
const modal = read('./PostModalShell.svelte');
const signedInModal = read('./PostModal.svelte');
const guestModal = read('./GuestPostModal.svelte');
const input = read('./ComposerInput.svelte');
const decorations = read('./composer-decorations.ts');
const styles = read('../../routes/styles/components.css');

describe('rich composer improvements', () => {
	it('decorates the input in place instead of showing a separate preview', () => {
		expect(editor).not.toContain('RichText');
		expect(editor).not.toContain('role="tablist"');
		expect(input).toContain('new EditorView(');
		expect(input).toContain('composerDecorations(() => ({ mentions, channels, emojis }))');
		expect(decorations).toContain('highlightComposerText(');
		// しっかりは本文 1 列になったので、広い画面でもモーダルを広げない
		expect(modal).not.toContain('1040px');
	});

	it('hides only the formatting buttons in simple mode', () => {
		expect(editor).toMatch(/\{#if isWideComposer\(mode\)\}\s*<MarkdownPalette/);
	});

	it('sets the input in the same type as the posted text', () => {
		expect(styles).toMatch(
			/\.mention-textarea \.composer-input \.cm-content \{[^}]*font-size: 15px;\s*line-height: 1\.8;/,
		);
		expect(styles).toMatch(/\.post-text \{[\s\S]*?font-size: 15px;\s*line-height: 1\.8;/);
		// 見出しは投稿の h3〜h5 と同じ大きさ
		expect(styles).toMatch(/\.composer-input \.cm-line\[data-block='h1'\] \{\s*font-size: 20px;/);
		expect(styles).toMatch(/\.composer-input \.cm-line\[data-block='h2'\] \{\s*font-size: 18px;/);
		expect(styles).toMatch(/\.composer-input \.cm-line\[data-block='h3'\] \{\s*font-size: 16px;/);
		// 箇条書きの `- ` は「•」で見せる
		expect(decorations).toContain("bullet.textContent = '•'");
	});

	it('renders one draft control in both modes and debounces rich autosave', () => {
		expect(composer.match(/class="icon-action draft-open"/g)).toHaveLength(1);
		expect(composer).toContain('!isWideComposer(mode)');
		expect(composer).toContain('setTimeout(() => void startDraftSave(key, draftSnapshot()), 1500)');
		expect(composer).toContain('attachments: []');
		expect(composer).toContain("draftSaveStatus === 'saving'");
		expect(composer).toContain('await finishDraftSaves()');
	});

	it('keeps the modal mode until posting and resets it only after success', () => {
		expect(modal).toContain('onmodechange?.(nextMode)');
		expect(signedInModal).toContain('mode = getComposerMode()');
		expect(signedInModal).toContain('mode = resetComposerMode()');
		// ゲストはブログにできないので、保存済みの blog は rich へ読み替えて復元する。
		expect(guestModal).toContain('const stored = getComposerMode()');
		expect(guestModal).toContain("mode = stored === 'blog' ? 'rich' : stored");
		expect(guestModal).toContain('mode = resetComposerMode()');
	});

	it('keeps markdown headings larger than the 15px post body', () => {
		expect(styles).toMatch(/\.post-text h3\s*\{\s*font-size: 20px;/);
		expect(styles).toMatch(/\.post-text h4\s*\{\s*font-size: 18px;/);
		expect(styles).toMatch(/\.post-text h5\s*\{\s*font-size: 16px;/);
	});

	it('keeps markdown lists flush with the surrounding text', () => {
		expect(styles).toMatch(/\.post-text ul,\s*\.post-text ol\s*\{\s*margin: 0;/);
		// 項目の間やブロックの間に、入力には無い余白を足さない
		expect(styles).not.toContain('.post-text li + li');
		expect(styles).not.toContain('.post-text > * + *');
	});

	it('routes emoji choices through the shared suggestion keyboard handling', () => {
		expect(input).toContain("token.kind === 'emoji'");
		expect(input).toContain('chooseActive() || continueList(target)');
		expect(input).toContain("{ key: 'Tab', run: chooseActive }");
		expect(input).toContain('<EmojiSuggestionList');
	});

	it('anchors suggestions to the caret and clamps them to the viewport', () => {
		expect(input).toContain('const caret = caretRect()');
		expect(input).toContain('view?.coordsAtPos(view.state.selection.main.head)');
		expect(input).toContain('Math.max(margin, caret.left)');
	});
});
