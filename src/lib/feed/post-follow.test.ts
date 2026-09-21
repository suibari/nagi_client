import { describe, expect, it } from 'vitest';
import { postPageHref } from './post-follow.svelte';

const uri = 'at://did:plc:author/com.suibari.nagi.post/3abc';

describe('postPageHref', () => {
	it('opens article roots on the blog page and ordinary posts in the thread', () => {
		expect(postPageHref({ uri, article: true })).toBe('/blog/did:plc:author/3abc');
		expect(postPageHref({ uri })).toBe('/thread/did:plc:author/3abc');
		expect(postPageHref({ uri, article: true, reply: {} })).toBe('/thread/did:plc:author/3abc');
	});
});
