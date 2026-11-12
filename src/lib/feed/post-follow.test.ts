import { describe, expect, it } from 'vitest';
import { postFollowNotice, postPageHref, threadRootUriFromPage } from './post-follow.svelte';

const uri = 'at://did:plc:author/com.suibari.nagi.post/3abc';

describe('postPageHref', () => {
	it('recognizes standard.site documents without article metadata', () => {
		expect(
			postPageHref({ uri: uri.replace('com.suibari.nagi.post', 'site.standard.document') }),
		).toBe('/blog/did:plc:author/3abc');
	});
	it('opens article roots on the blog page and ordinary posts in the thread', () => {
		expect(postPageHref({ uri, article: true })).toBe('/blog/did:plc:author/3abc');
		expect(postPageHref({ uri })).toBe('/thread/did:plc:author/3abc');
		expect(postPageHref({ uri, article: true, reply: {} })).toBe('/thread/did:plc:author/3abc');
	});
});

describe('3行日記のスレッド', () => {
	const diary = 'at://did:plc:author/com.suibari.trilinesat.diary/3abc';

	it('日記はスレッドページへ印を付けて渡し、ページ側で日記の URI に戻す', () => {
		expect(postPageHref({ uri: diary })).toBe('/thread/did:plc:author/3abc?diary');
		const href = new URL(postPageHref({ uri: diary }), 'https://nagi.example');
		expect(threadRootUriFromPage('did:plc:author', '3abc', href.searchParams)).toBe(diary);
		expect(threadRootUriFromPage('did:plc:author', '3abc', new URLSearchParams())).toBe(uri);
	});
});

describe('postFollowNotice', () => {
	it('keeps a posted-with-warning message when the follow link replaces the notice', () => {
		postFollowNotice.warn('/thread/a/b', 'Blueskyには途中まで');
		postFollowNotice.show('/thread/a/b');
		expect(postFollowNotice.current).toEqual({
			href: '/thread/a/b',
			warning: 'Blueskyには途中まで',
		});
		postFollowNotice.clear();
		postFollowNotice.show('/thread/a/c');
		expect(postFollowNotice.current).toEqual({ href: '/thread/a/c' });
		postFollowNotice.clear();
	});
});
