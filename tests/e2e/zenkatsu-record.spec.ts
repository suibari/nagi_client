import { expect, test } from '@playwright/test';

for (const mobile of [false, true]) {
	test(`record details open in modals (${mobile ? 'touch' : 'desktop'})`, async ({ browser }) => {
		const context = await browser.newContext({
			viewport: { width: mobile ? 375 : 1440, height: 812 },
			hasTouch: mobile,
		});
		const page = await context.newPage();
		await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
		await page.goto('/dev/record');
		const open = async (locator: ReturnType<typeof page.locator>) => {
			if (mobile) await locator.tap();
			else await locator.click();
		};
		const medal = page.locator('.medal.earned').first();
		await open(medal);
		let dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		await expect(dialog).toContainText('2026-09-30');
		await open(dialog.locator('.date').last());
		await expect(dialog.locator('.ticket-date')).not.toHaveText('2026-09-30');
		await page.keyboard.press('Escape');
		await expect(dialog).toHaveCount(0);
		await expect(medal).toBeFocused();

		await open(page.locator('button.stamp').first());
		dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('明日への一歩');
		await expect(dialog.locator('.slot-card')).toHaveCount(3);
		await open(dialog.getByRole('button', { name: '閉じる', exact: true }));
		await expect(dialog).toHaveCount(0);

		await open(
			page
				.locator('button.stamp.hidden')
				.filter({ has: page.locator('.seen') })
				.first(),
		);
		dialog = page.getByRole('dialog');
		await expect(dialog).toContainText('目を覚まし、内から温め、外に干す。ある朝の手順');
		expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
		await page.mouse.click(2, 2);
		await expect(dialog).toHaveCount(0);
		await context.close();
	});
}
