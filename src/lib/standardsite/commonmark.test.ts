import { describe, expect, it } from 'vitest';
import { toCommonMark } from './commonmark';

const ORIGIN = 'https://nagi.suibari.com';
const md = (text: string, facets = []) => toCommonMark(text, facets, ORIGIN);

describe('toCommonMark', () => {
	it('keeps the supported block syntax', () => {
		expect(md('# Title\n\n## Sub\n\n> quote\n> more\n\n- a\n- b\n\n3. c\n4. d')).toBe(
			'# Title\n\n## Sub\n\n> quote\\\n> more\n\n- a\n- b\n\n3. c\n4. d\n',
		);
	});

	it('turns single newlines into hard breaks', () => {
		expect(md('one\ntwo\n\nthree')).toBe('one\\\ntwo\\\n\\\nthree\n');
	});

	it('escapes characters that Nagi shows literally', () => {
		expect(md('<b>a</b> & [x](y) _u_ | ~')).toBe('\\<b\\>a\\</b\\> \\& \\[x\\](y) *u* \\| \\~\n');
		expect(md('#### not a heading\n+ not a list\n2024.\n=')).toBe(
			'\\#### not a heading\\\n\\+ not a list\\\n2024\\.\\\n\\=\n',
		);
	});

	it('protects indentation from becoming a code block', () => {
		expect(md('a\n    b')).toBe('a\\\n&#32;&#32;&#32;&#32;b\n');
	});

	it('writes emphasis, code and strikethrough', () => {
		expect(md('**bold** *it* `co`de` ~~del~~')).toBe('**bold** *it* `co`de\\` ~~del~~\n');
	});

	it('writes code fences, rules and images', () => {
		expect(
			md(
				'```ts\nconst a = `x`;\n```\n---\n![alt](https://nagi.suibari.com/api/blob/did:plc:a/bafy)',
			),
		).toBe(
			'```ts\nconst a = `x`;\n```\n\n---\n\n![alt](https://nagi.suibari.com/api/blob/did:plc:a/bafy)\n',
		);
	});

	it('writes mentions and tags as absolute Nagi links without viewer decoration', () => {
		const text = '@alice #タグ';
		const enc = new TextEncoder();
		expect(
			md(text, [
				{
					index: { byteStart: 0, byteEnd: 6 },
					features: [{ $type: 'app.bsky.richtext.facet#mention', did: 'did:plc:alice' }],
				},
				{
					index: { byteStart: 7, byteEnd: 7 + enc.encode('#タグ').length },
					features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'タグ' }],
				},
			] as never),
		).toBe(
			`[@alice](${ORIGIN}/profile/did%3Aplc%3Aalice) [#タグ](${ORIGIN}/search?tag=%E3%82%BF%E3%82%B0)\n`,
		);
	});
});
