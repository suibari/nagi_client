import { expect, test } from '@playwright/test';

test('app title follows navigation after visiting cards', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/cards');
	await expect(page).toHaveTitle('Nagi — やさしい言葉が凪ぐ場所');
	await page.locator('.sidebar-left .brand').click();
	await expect(page).toHaveTitle('Nagi（ナギ）— やさしい言葉が凪ぐ全肯定SNS');
	await page.locator('.sidebar-left a[href="/cards"]').click();
	await expect(page).toHaveTitle('Nagi — やさしい言葉が凪ぐ場所');
});
