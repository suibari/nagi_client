import { expect, test } from '@playwright/test';

test('リアクターは自分の投稿だけに表示し、他人の投稿と検索ニュースでは隠す', async ({ page }) => {
	const viewerDid = 'did:plc:playwright-reaction-owner';
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	// レイアウトがログイン直後に読む周辺データは、この表示検証では空レスポンスで固定する。
	await page.route('**/xrpc/**', (route) => {
		const method = new URL(route.request().url()).pathname.split('/').pop();
		let body: Record<string, unknown> = {
			cards: [],
			items: [],
			folders: [],
			uris: [],
			actors: [],
			count: 0,
		};
		if (method === 'com.atproto.repo.getRecord') {
			body = {
				uri: `at://${viewerDid}/com.suibari.nagi.profile/self`,
				cid: 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi',
				value: {
					$type: 'com.suibari.nagi.profile',
					displayName: 'Playwright確認用',
					description: '',
				},
			};
		} else if (method === 'com.suibari.nagi.getProfile') {
			body = {
				profile: { did: viewerDid, handle: 'owner.nagi.example' },
				feed: { items: [], hasMore: false },
			};
		} else if (method === 'com.suibari.nagi.getDrafts') {
			body = { drafts: [] };
		}
		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(body),
		});
	});
	await page.goto('/dev/e2e/reaction-privacy');

	const ownPost = page.getByTestId('own-post');
	const otherPost = page.getByTestId('other-post');
	const searchNews = page.getByTestId('search-news');

	await expect(ownPost.locator('.reaction-emoji')).toBeVisible();
	await expect(ownPost.locator('.reaction-actors')).toBeVisible();
	await expect(ownPost.getByTitle('リアクションした人')).toBeVisible();

	await expect(otherPost.locator('.reaction-emoji')).toBeVisible();
	await expect(otherPost.locator('.reaction-actors')).toHaveCount(0);
	await expect(otherPost.getByTitle('リアクションした人')).toHaveCount(0);

	await expect(searchNews.locator('.reaction-emoji')).toBeVisible();
	await expect(searchNews.locator('.reaction-actors')).toHaveCount(0);
	await expect(searchNews.getByTitle('リアクションした人')).toHaveCount(0);
});
