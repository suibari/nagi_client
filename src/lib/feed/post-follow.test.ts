import { describe, expect, it } from 'vitest';
import { postPageHref, threadRootUriFromPage } from './post-follow.svelte';

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
