import { expect, test } from '@playwright/test';

test('匿名取得後にログインが復元された自分のプロフィールでリアクターを再取得する', async ({
	page,
}) => {
	const ownerDid = 'did:plc:profile-reaction-owner';
	let authenticatedRequests = 0;
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.route('**/xrpc/**', (route) => {
		const request = route.request();
		const method = new URL(request.url()).pathname.split('/').pop();
		let body: Record<string, unknown> = {
			members: [],
			drafts: [],
			items: [],
			cards: [],
			folders: [],
			uris: [],
			actors: [],
			count: 0,
		};
		if (method === 'com.suibari.nagi.getProfile') {
			const authenticated =
				(request.headers()['x-test-viewer'] ?? request.headers()['x-viewer-did']) === ownerDid;
			if (authenticated && new URL(request.url()).searchParams.get('group') === 'true')
				authenticatedRequests++;
			body = {
				profile: { did: ownerDid, handle: 'owner.nagi.example' },
				feed: {
					items: [
						{
							uri: `at://${ownerDid}/com.suibari.nagi.post/own`,
							cid: 'bafy-own',
							author: { did: ownerDid, handle: 'owner.nagi.example' },
							text: 'プロフィールの自分の投稿',
							createdAt: '2026-09-14T00:00:00.000Z',
							indexedAt: '2026-09-14T00:00:00.000Z',
							isBot: false,
							isAffirmation: false,
							reactions: [
								{
									emoji: '👍',
									reactors: authenticated
										? [
												{
													did: 'did:plc:profile-reactor',
													handle: 'reactor.nagi.example',
													displayName: 'リアクションした人',
												},
											]
										: [],
								},
							],
						},
					],
					hasMore: false,
				},
			};
		} else if (method === 'com.atproto.repo.getRecord') {
			body = {
				uri: `at://${ownerDid}/com.suibari.nagi.profile/self`,
				cid: 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi',
				value: { $type: 'com.suibari.nagi.profile', displayName: 'Owner', description: '' },
			};
		}
		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(body),
		});
	});
	await page.goto(`/profile/${ownerDid}`);
	await expect(page.locator('.reaction-emoji')).toBeVisible();
	await expect(page.locator('.reaction-actors')).toHaveCount(0);

	// Vite の同じモジュールを使って、非同期の OAuth 復元を再現する。
	await page.evaluate(async (did) => {
		const modulePath = '/src/lib/oauth/session.svelte.ts';
		const { session } = await import(/* @vite-ignore */ modulePath);
		session.set({
			did,
			fetchHandler: (url: string, init?: RequestInit) => {
				const headers = new Headers(init?.headers);
				headers.set('x-test-viewer', did);
				return fetch(url, { ...init, headers });
			},
			getTokenInfo: async () => ({ scope: '' }),
		});
	}, ownerDid);

	await expect(page.getByTitle('リアクションした人')).toBeVisible();
	expect(authenticatedRequests).toBe(1);
	await page.locator('.profile-tabs').getByRole('button', { name: '返信', exact: true }).click();
	await expect.poll(() => authenticatedRequests).toBe(2);
	await page.locator('.profile-tabs').getByRole('button', { name: '投稿', exact: true }).click();
	await expect(page.getByTitle('リアクションした人')).toBeVisible();
	expect(authenticatedRequests).toBe(2);
});
