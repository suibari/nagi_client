import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, linked: boolean) {
	const saved: unknown[] = [];
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.route('**/xrpc/**', async (route) => {
		const method = new URL(route.request().url()).pathname.split('/').pop();
		if (method === 'com.suibari.nagi.getPreferences')
			return route.fulfill({ json: { notificationPreferences: {} } });
		if (method === 'com.suibari.nagi.putPreferences') {
			const body = route.request().postDataJSON();
			saved.push(body.notificationPreferences);
			return route.fulfill({ json: { notificationPreferences: body.notificationPreferences } });
		}
		return route.fulfill({ json: {} });
	});
	await page.goto(`/dev/e2e/notification-settings${linked ? '?bluesky' : ''}`);
	await expect(page.getByText('通知する内容')).toBeVisible({ timeout: 20_000 });
	return saved;
}

const section = (page: Page) =>
	page.locator('.settings-section').filter({ hasText: 'Blueskyの通知のプッシュ' });

test('offers Bluesky push to linked accounts, all off at first, saving push only', async ({
	page,
}) => {
	const saved = await open(page, true);
	await expect(section(page)).toContainText('ミュートしている相手からも届きます');
	const switches = section(page).getByRole('switch');
	await expect(switches).toHaveCount(6);
	for (const toggle of await switches.all()) await expect(toggle).not.toBeChecked();
	await section(page).getByRole('switch', { name: 'いいね' }).click();
	await expect.poll(() => saved.length).toBe(1);
	expect(saved[0]).toEqual({ blueskyLike: { list: false, push: true } });
	await expect(section(page).getByRole('switch', { name: 'いいね' })).toBeChecked();
});

test('does not show Bluesky push to accounts without Bluesky linked', async ({ page }) => {
	await open(page, false);
	await expect(page.getByText('Blueskyの通知のプッシュ')).toHaveCount(0);
});
