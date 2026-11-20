import { describe, expect, it, vi } from 'vitest';
import { sharedContent, sharedText } from './store';
import { isShareRequest, receiveShare } from './receive';

describe('share input', () => {
	it('combines title, text and url without empty or identical values', () => {
		const form = new FormData();
		form.set('title', '  A title  ');
		form.set('text', 'A title');
		form.set('url', 'https://example.com');
		expect(sharedText(form)).toBe('A title\nhttps://example.com');
	});
	it('keeps file order and gives separate receipts distinct ids', () => {
		const form = new FormData();
		form.append('images', new File(['png'], 'a.png', { type: 'image/png' }));
		form.append('images', new File(['bad'], 'b.txt', { type: 'text/plain' }));
		const first = sharedContent(form);
		expect(first.files.map(({ file }) => file.name)).toEqual(['a.png', 'b.txt']);
		expect(first.text).toBe('');
		expect(sharedContent(form).id).not.toBe(first.id);
		expect(() => sharedContent(new FormData())).toThrow('Empty share');
	});
	it('intercepts only the exact same-origin POST action', () => {
		const origin = 'https://nagi.example';
		for (const [url, method, expected] of [
			[`${origin}/share-target`, 'POST', true],
			[`${origin}/share-target`, 'GET', false],
			[`${origin}/share-target/extra`, 'POST', false],
			['https://other.example/share-target', 'POST', false],
			[`${origin}/xrpc`, 'POST', false],
		] as const)
			expect(isShareRequest(new Request(url, { method }), origin)).toBe(expected);
	});
	it('returns a failure without leaking submitted data when local saving fails', async () => {
		vi.stubGlobal('indexedDB', {
			open: () => {
				throw new Error('secret');
			},
		});
		try {
			const form = new FormData();
			form.set('text', 'private shared text');
			const response = await receiveShare(
				new Request('https://nagi.example/share-target', { method: 'POST', body: form }),
			);
			expect(response.status).toBe(400);
			expect(await response.text()).not.toContain('private shared text');
			expect(response.headers.get('location')).toBeNull();
		} finally {
			vi.unstubAllGlobals();
		}
	});
});
