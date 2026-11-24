import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from './spa.js';

const did = 'did:plc:qcwhrvzx6wmi5hz775uyi6fh';
const shell = `<html><head>
	<meta property="og:image" content="https://nagi.suibari.com/nagi_ogp.jpg" />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:image" content="https://nagi.suibari.com/nagi_ogp.jpg" />
</head></html>`;

function responseMock() {
	return {
		status: vi.fn().mockReturnThis(),
		setHeader: vi.fn(),
		send: vi.fn(),
		end: vi.fn(),
		redirect: vi.fn(),
	};
}

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('SPA fallback SEO', () => {
	it.each(['GET', 'HEAD'])('keeps %s fallback responses out of the index', async (method) => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html><head></head></html>')));
		const response = responseMock();

		await handler({ method, query: { did } }, response);

		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.setHeader).toHaveBeenCalledWith('X-Robots-Tag', 'noindex, follow');
		if (method === 'GET') {
			expect(response.send).toHaveBeenCalledWith(expect.stringContaining('/api/profile-card'));
			expect(response.send).toHaveBeenCalledWith(
				expect.stringContaining('property="og:image:type" content="image/png"'),
			);
		} else {
			expect(response.send).not.toHaveBeenCalled();
			expect(response.end).toHaveBeenCalledOnce();
		}
	});

	it.each(['post', 'blog'])('uses the post card for %s pages', async (kind) => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(shell)));
		const response = responseMock();

		await handler({ method: 'GET', query: { did, rkey: '3mwz6vcf7jz2q', kind } }, response);

		const html = response.send.mock.calls[0][0] as string;
		const version = kind === 'post' ? '2' : '1';
		const image = `https://nagi.suibari.com/api/post-card?v=${version}&amp;kind=${kind}&amp;did=${encodeURIComponent(did)}&amp;rkey=3mwz6vcf7jz2q`;
		expect(html).toContain(`property="og:image" content="${image}"`);
		expect(html).toContain(`name="twitter:image" content="${image}"`);
		if (kind === 'post') {
			expect(html).not.toMatch(/og:image:(?:type|width|height)/);
		} else {
			expect(html).toContain('property="og:image:type" content="image/png"');
		}
		expect(html).not.toContain('/api/profile-card');
		expect(html.includes('rel="site.standard.document"')).toBe(kind === 'blog');
	});

	it('uses the advent card for the day in the link', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html><head></head></html>')));
		const response = responseMock();

		await handler({ method: 'GET', query: { kind: 'advent', day: '3' } }, response);

		const html = response.send.mock.calls[0][0] as string;
		expect(html).toContain('/api/advent-card?v=2&amp;year=');
		expect(html).toContain('&amp;day=3"');
		expect(html).toContain('Nagiアドベントカレンダー 12月3日のカード');
		expect(html).toContain('property="og:image:type" content="image/png"');
		expect(html).not.toContain('/api/profile-card');
	});

	it('uses the English card and title for English shares', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html><head></head></html>')));
		const response = responseMock();

		await handler({ method: 'GET', query: { kind: 'advent', day: '3', lang: 'en' } }, response);

		const html = response.send.mock.calls[0][0] as string;
		expect(html).toContain('&amp;day=3&amp;lang=en"');
		expect(html).toContain('Nagi Advent Calendar: the card for December 3');
	});

	it('keeps the site image for the advent page without a valid day', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html><head></head></html>')));
		const response = responseMock();

		await handler({ method: 'GET', query: { kind: 'advent', day: '99' } }, response);

		const html = response.send.mock.calls[0][0] as string;
		expect(html).not.toContain('/api/advent-card');
		expect(html).toContain('og:title');
	});

	it('falls back to the profile card for an unsafe record key', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html><head></head></html>')));
		const response = responseMock();

		await handler({ method: 'GET', query: { did, rkey: '../x', kind: 'post' } }, response);

		expect(response.send).toHaveBeenCalledWith(expect.stringContaining('/api/profile-card'));
	});

	it('keeps the error fallback out of the index too', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const response = responseMock();

		await handler({ method: 'GET', query: { did } }, response);

		expect(response.setHeader).toHaveBeenCalledWith('X-Robots-Tag', 'noindex, follow');
		expect(response.redirect).toHaveBeenCalledWith(307, '/200');
	});
});
