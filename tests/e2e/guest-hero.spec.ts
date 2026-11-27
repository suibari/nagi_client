import { expect, test } from '@playwright/test';

for (const recentSession of [false, true]) {
	test(`hides prerendered landing before hydration (recent session: ${recentSession})`, async ({
		page,
	}) => {
		await page.addInitScript((recent) => {
			localStorage.setItem('nagi-locale', 'ja');
			if (recent) localStorage.setItem('nagi.did', 'did:plc:previous-session');
		}, recentSession);
		// 初回描画を認証ストアの起動前で止め、事前生成HTMLそのものを検証する。
		await page.route('**/*', async (route) => {
			const request = route.request();
			const path = new URL(request.url()).pathname;
			if (
				request.resourceType() === 'script' &&
				path !== '/auth-init.js' &&
				path !== '/theme-init.js'
			) {
				await route.abort();
			} else {
				await route.continue();
			}
		});
		await page.goto('/');
		await expect(page.locator('.landing-hero')).toBeAttached();
		await expect(page.locator('.landing-hero')).toBeHidden();
		await expect(page.locator('html')).toHaveAttribute('data-oauth-pending', '');
	});
}

test('shows the landing and opens login from the join CTA after confirming there is no session', async ({
	page,
}) => {
	await page.goto('/');
	await expect(page.locator('html')).not.toHaveAttribute('data-oauth-pending');
	await expect(page.locator('.landing-hero')).toBeVisible();
	await page.locator('.landing-hero a[href="/login"]').click();
	await expect(page).toHaveURL(/\/login$/);
});

test('keeps the prerendered introduction visible without JavaScript', async ({
	browser,
	baseURL,
}) => {
	const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
	try {
		const page = await context.newPage();
		await page.goto('/');
		await expect(page.locator('.landing-hero')).toBeVisible();
	} finally {
		await context.close();
	}
});

test('shows the news article before the guest introduction and opens login from it', async ({
	page,
}) => {
	const rkey = 'guest-hero-test';
	const news = {
		uri: `at://did:plc:newsbot/com.suibari.nagi.news/${rkey}`,
		cid: 'news-cid',
		articleId: rkey,
		url: 'https://example.com/news',
		title: 'Guest hero test article',
		botComment: 'A comment accompanying the news article.',
		lang: 'ja',
		createdAt: '2026-11-26T00:00:00Z',
		indexedAt: '2026-11-26T00:00:00Z',
		reactions: [],
	};
	const newsPage = { items: [news], hasMore: false };
	await page.route('**/xrpc/com.suibari.nagi.getPositiveNews?*', (route) =>
		route.fulfill({ json: newsPage }),
	);
	await page.route('**/xrpc/com.suibari.nagi.getNewsItem?*', (route) =>
		route.fulfill({ json: { news } }),
	);
	await page.route('**/xrpc/com.suibari.nagi.getNewsQuotes?*', (route) =>
		route.fulfill({ json: { items: [], hasMore: false } }),
	);
	await page.route('**/xrpc/com.suibari.nagi.getSimilarNews?*', (route) =>
		route.fulfill({ json: { items: [] } }),
	);

	await page.goto('/news');
	const articleLink = page.getByRole('link', { name: news.title, exact: true });
	await expect(articleLink).toBeVisible();
	await expect(page.locator('.hero-join')).toHaveCount(0);
	await articleLink.click();
	await expect(page).toHaveURL(new RegExp(`/news/${rkey}$`));

	const article = page.locator('.news-permalink');
	await expect(article.getByText(news.title)).toBeVisible();
	await expect(article.getByText(news.botComment)).toBeVisible();
	const hero = page.locator(
		'.news-permalink + .hero:has(+ [aria-labelledby="news-quotes-heading"])',
	);
	await expect(hero).toBeVisible();
	await hero.locator('a.hero-join[href="/login"]').click();
	await expect(page).toHaveURL(/\/login$/);
});
