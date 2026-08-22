import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshPushSubscription } from './appview';

afterEach(() => vi.unstubAllGlobals());

describe('refreshPushSubscription', () => {
	it('sends both the installation capability and rotated browser subscription', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ registered: true }), {
				status: 200,
				headers: { 'content-type': 'application/json' },
			}),
		);
		vi.stubGlobal('fetch', fetchMock);
		const input = {
			installationId: '7db73bd8-dd80-4df8-96c5-e49e54e08b55',
			capability: 'JYV5uMq3SNE5GttjOVhhoYftmBIlRKKkNyRCI9mkoX4',
			endpoint: 'https://push.example/new-endpoint',
			keys: { p256dh: 'new-p256dh', auth: 'new-auth' },
		};

		await refreshPushSubscription(input);

		const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
		expect(JSON.parse(String(request.body))).toEqual(input);
	});
});
