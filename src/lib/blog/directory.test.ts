import { describe, expect, it } from 'vitest';
import { blogDocumentLocation, blogMatches, buildBlogDirectoryItem } from './directory';

const post = {
	uri: 'at://did:plc:alice/site.standard.document/3abc',
	text: '# 海辺の散歩\n\n今日は風が穏やかでした。',
	createdAt: '2026-09-22T00:00:00.000Z',
	indexedAt: '2026-09-22T00:00:01.000Z',
	author: { did: 'did:plc:alice', handle: 'alice.test', displayName: 'Alice' },
};

describe('blog directory', () => {
	it('reads both current and legacy blog URIs', () => {
		expect(blogDocumentLocation(post.uri)).toEqual({ did: 'did:plc:alice', rkey: '3abc' });
		expect(blogDocumentLocation('at://did:plc:alice/com.suibari.nagi.post/3legacy')).toEqual({
			did: 'did:plc:alice',
			rkey: '3legacy',
		});
	});

	it('uses document metadata and normalizes its tags', () => {
		const item = buildBlogDirectoryItem(post, {
			title: '海の一日',
			description: '短い紹介',
			tags: ['#日記', ' 海 ', '#日記', 1],
			coverImage: { ref: { $link: 'bafy-cover' } },
		});
		expect(item.title).toBe('海の一日');
		expect(item.description).toBe('短い紹介');
		expect(item.tags).toEqual(['日記', '海']);
		expect(item.headerImage).toBe('/api/blob/did%3Aplc%3Aalice/bafy-cover');
	});

	it('matches title, body, author and tags case-insensitively', () => {
		const item = buildBlogDirectoryItem(post, { tags: ['Travel'] });
		expect(blogMatches(item, '海辺')).toBe(true);
		expect(blogMatches(item, 'ALICE')).toBe(true);
		expect(blogMatches(item, 'travel')).toBe(true);
		expect(blogMatches(item, '山')).toBe(false);
	});
});
