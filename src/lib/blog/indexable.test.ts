import { describe, expect, it } from 'vitest';
import type { IndexableBlog } from '$lib/api/types';
import { blogPath, collectIndexableBlogs } from './indexable';

const item = (key: string) =>
	({ uri: `at://did:plc:author/com.suibari.nagi.post/${key}` }) as IndexableBlog;

describe('blog index', () => {
	it('uses a stable permalink for an opted-in post', () => {
		expect(blogPath(item('3abc').uri)).toBe('/blog/did:plc:author/3abc');
		expect(() => blogPath('at://did:plc:author/com.suibari.nagi.news/3abc')).toThrow();
	});

	it('collects past the former 100-page and 1500-item limits', async () => {
		let calls = 0;
		const posts = await collectIndexableBlogs(async () => {
			calls += 1;
			return {
				items: Array.from({ length: 16 }, (_, index) => item(`${calls}-${index}`)),
				hasMore: calls < 101,
				cursor: `page-${calls}`,
			};
		});
		expect(calls).toBe(101);
		expect(posts).toHaveLength(1616);
		expect(posts.at(-1)?.uri).toBe(item('101-15').uri);
	});

	it('stops if the API repeats a cursor', async () => {
		let calls = 0;
		const posts = await collectIndexableBlogs(async () => {
			calls += 1;
			return { items: [item(String(calls))], hasMore: true, cursor: 'same' };
		});
		expect(calls).toBe(2);
		expect(posts).toHaveLength(2);
	});
});
