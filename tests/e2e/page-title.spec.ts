import { expect, test } from '@playwright/test';

test('app title follows navigation after visiting cards', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/cards');
	await expect(page).toHaveTitle('Nagi（ナギ）— 気持ちを残し、ゆるくつながるSNS');
	await page.locator('.sidebar-left .brand').click();
	await expect(page).toHaveTitle('Nagi（ナギ）— 気持ちを残し、ゆるくつながるSNS');
	await page.locator('.sidebar-left a[href="/cards"]').click();
	await expect(page).toHaveTitle('Nagi（ナギ）— 気持ちを残し、ゆるくつながるSNS');
});
