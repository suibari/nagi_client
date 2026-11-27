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
