import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from './spa.js';

const did = 'did:plc:qcwhrvzx6wmi5hz775uyi6fh';

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
		} else {
			expect(response.send).not.toHaveBeenCalled();
			expect(response.end).toHaveBeenCalledOnce();
		}
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
