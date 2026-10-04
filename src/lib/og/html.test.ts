import { describe, expect, it } from 'vitest';
import { isSafeDid, isSafeRkey, withPostCardMeta, withProfileCardMeta } from './html';

describe('dynamic OGP HTML', () => {
	it('accepts AT Protocol DIDs and rejects values that can escape routing or markup', () => {
		expect(isSafeDid('did:plc:qcwhrvzx6wmi5hz775uyi6fh')).toBe(true);
		expect(isSafeDid('did:web:example.com')).toBe(true);
		expect(isSafeDid('did:plc:x"><script>')).toBe(false);
		expect(isSafeDid('not-a-did')).toBe(false);
	});

	it('replaces both Open Graph and Twitter images without leaving the fixed image behind', () => {
		const html = `<!doctype html><head>
			<meta property="og:image" content="https://nagi.suibari.com/nagi_ogp.jpg" />
			<meta property="og:image:type" content="image/jpeg" />
			<meta property="og:image:alt" content="Nagi" />
			<meta name="twitter:image" content="https://nagi.suibari.com/nagi_ogp.jpg" />
			<meta name="twitter:image:alt" content="Nagi" />
		</head>`;
		const output = withProfileCardMeta(html, 'did:plc:qcwhrvzx6wmi5hz775uyi6fh');

		expect(output).not.toContain('nagi_ogp.jpg');
		expect(output.match(/api\/profile-card/g)).toHaveLength(2);
		expect(output.match(/profile-card\?v=2&amp;did=/g)).toHaveLength(2);
		expect(output).toContain('content="image/png"');
		expect(output.match(/Nagiのプロフィールカード/g)).toHaveLength(2);
	});

	it('accepts record keys and rejects path traversal or markup', () => {
		expect(isSafeRkey('3mwxsd6ee5k2h')).toBe(true);
		expect(isSafeRkey('..')).toBe(false);
		expect(isSafeRkey('a/b')).toBe(false);
		expect(isSafeRkey('x"><script>')).toBe(false);
	});

	it('points posts and blogs at the post card with their record key', () => {
		const html = `<!doctype html><head>
			<meta property="og:image" content="https://nagi.suibari.com/nagi_ogp.jpg" />
			<meta name="twitter:image" content="https://nagi.suibari.com/nagi_ogp.jpg" />
		</head>`;
		const did = 'did:plc:uixgxpiqf4i63p6rgpu7ytmx';
		const blog = withPostCardMeta(html, did, '3mwxsd6ee5k2h', 'blog');

		expect(blog).not.toContain('nagi_ogp.jpg');
		expect(
			blog.match(
				/api\/post-card\?v=1&amp;kind=blog&amp;did=did%3Aplc%3Auixgxpiqf4i63p6rgpu7ytmx&amp;rkey=3mwxsd6ee5k2h/g,
			),
		).toHaveLength(2);
		expect(blog.match(/Nagiのブログ/g)).toHaveLength(2);
		expect(withPostCardMeta(html, did, '3mwz6vcf7jz2q', 'post')).toContain('kind=post');
	});
});
