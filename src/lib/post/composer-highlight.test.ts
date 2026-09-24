import { describe, expect, it } from 'vitest';
import { highlightComposerText } from './composer-highlight';

const classAt = (source: string, text: string) => {
	const lines = highlightComposerText(source);
	let offset = 0;
	const target = source.indexOf(text);
	for (const line of lines) {
		for (const segment of line.segments) {
			if (target < offset + segment.text.length) return segment.className;
			offset += segment.text.length;
		}
		offset += 1;
	}
	return undefined;
};

describe('highlightComposerText', () => {
	it('keeps every input character so the overlay lines up with the textarea', () => {
		const source = '## 見出し\n[リンク](https://example.com) と **太字**\n- 項目\n\n||隠す||';
		const lines = highlightComposerText(source);
		expect(lines.map((line) => line.segments.map((segment) => segment.text).join(''))).toEqual(
			source.split('\n'),
		);
		expect(lines.map((line) => line.kind)).toEqual(['h2', 'p', 'ul', undefined, 'p']);
	});

	it('marks the syntax that disappears after posting', () => {
		const source = '[リンク](https://example.com) **太字** ||隠す||';
		expect(classAt(source, '[')).toBe('md-syntax');
		expect(classAt(source, 'リンク')).toBe('md-link');
		expect(classAt(source, '](https')).toBe('md-syntax');
		expect(classAt(source, '**')).toBe('md-syntax');
		expect(classAt(source, '太字')).toBe('md-bold');
		expect(classAt(source, '||')).toBe('md-syntax');
		expect(classAt(source, '隠す')).toBe('md-cw');
	});

	it('links bare URLs and tags the same way the post does', () => {
		const source = 'みて https://example.com/a_b_c #散歩';
		expect(classAt(source, 'https')).toBe('md-link');
		// URL の中の _ は斜体の記法として扱わない
		expect(classAt(source, 'b_c')).toBe('md-link');
		expect(classAt(source, '#散歩')).toBe('md-link');
	});

	it('highlights a selected mention', () => {
		const source = 'こんにちは @alice.test さん';
		const start = source.indexOf('@');
		const lines = highlightComposerText(source, [
			{ start, end: start + '@alice.test'.length, did: 'did:plc:alice', handle: 'alice.test' },
		]);
		expect(lines[0].segments.find((segment) => segment.text === '@alice.test')?.className).toBe(
			'md-link',
		);
	});
});
