import { describe, expect, it } from 'vitest';
import { isSafeDid, withProfileCardMeta } from './html';

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
});
