import { afterEach, describe, expect, it } from 'vitest';
import type { PostDraft } from '$lib/atproto/records';
import { optimisticPosts } from './optimistic-posts.svelte';

const draft: PostDraft = {
	text: '# 新しいブログ\n\n投稿した本文',
	facets: [],
	langs: ['ja'],
	createdAt: '2026-10-29T00:00:00.000Z',
	attachments: [],
	linkCards: [],
	article: true,
};

afterEach(() => {
	for (const entry of optimisticPosts.entries) optimisticPosts.remove(entry.id);
	optimisticPosts.blogs = [];
});

describe('optimistic blog publishing', () => {
	it('keeps a directory card after another feed reconciles the post', () => {
		const id = optimisticPosts.add(draft, 'did:plc:alice', { articleTags: ['日記'] });
		expect(optimisticPosts.blogs[0]).toMatchObject({
			title: '新しいブログ',
			tags: ['日記'],
			optimisticState: 'sending',
			optimisticKey: id,
		});
		const uri = 'at://did:plc:alice/site.standard.document/abc';
		optimisticPosts.markCreated(id, { uri, cid: 'cid' });
		optimisticPosts.reconcile(optimisticPosts.items);
		expect(optimisticPosts.items).toHaveLength(0);
		expect(optimisticPosts.blogs[0]).toMatchObject({
			uri,
			optimisticState: 'indexing',
			optimisticKey: id,
		});
	});

	it('removes the directory card if publishing fails', () => {
		const id = optimisticPosts.add(draft, 'did:plc:alice');
		optimisticPosts.remove(id);
		expect(optimisticPosts.blogs).toHaveLength(0);
	});

	it('does not add ordinary posts to the directory', () => {
		optimisticPosts.add({ ...draft, article: false }, 'did:plc:alice');
		expect(optimisticPosts.blogs).toHaveLength(0);
	});
});
