import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
});

for (const width of [375, 1280]) {
	test(`checklist progresses and celebrates at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 });
		await page.goto('/dev/e2e/welcome-tutorial');
		const dialog = page.getByRole('dialog', { name: 'Nagiのはじめかた' });
		await expect(dialog).toBeVisible();
		await expect(dialog.getByLabel('3つ中0つ完了')).toBeVisible();
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
		);
		expect(overflow).toBeLessThanOrEqual(0);

		await dialog.getByRole('button', { name: '閉じる' }).click();
		await expect(dialog).toBeHidden();
		const entry = page.getByRole('button', { name: 'Nagiのはじめかたを開く' });
		await expect(entry).toBeVisible();

		await page.getByRole('button', { name: 'complete post' }).click();
		await page.getByRole('button', { name: 'complete reaction' }).click();
		await expect(entry.getByLabel('3つ中2つ完了')).toBeVisible();
		await expect(dialog).toBeHidden();

		// 3つ目で、閉じていても開き直して完了を見せる。入口は役目を終えて消える。
		await page.getByRole('button', { name: 'complete mood' }).click();
		await expect(dialog).toBeVisible();
		await expect(dialog.getByText('ぜんぶ試せたね')).toBeVisible();
		await expect(dialog.getByLabel('3つ中3つ完了')).toBeVisible();
		await expect(entry).toBeHidden();
	});
}

test('dismissing the entry hides it and remembers the choice', async ({ page }) => {
	await page.goto('/dev/e2e/welcome-tutorial?closed');
	const entry = page.getByRole('button', { name: 'Nagiのはじめかたを開く' });
	await expect(entry).toBeVisible();
	await page.getByRole('button', { name: 'もう表示しない' }).click();
	await expect(entry).toBeHidden();
	const saved = await page.evaluate(() =>
		localStorage.getItem('nagi-welcome-tutorial:did:plc:welcome-tutorial-preview'),
	);
	expect(JSON.parse(saved ?? '{}')).toMatchObject({ dismissed: true });
});

test('a task row opens its destination', async ({ page }) => {
	await page.goto('/dev/e2e/welcome-tutorial');
	const dialog = page.getByRole('dialog', { name: 'Nagiのはじめかた' });
	await dialog.getByRole('button', { name: /自分の感情グラフを見てみよう/ }).click();
	await expect(page).toHaveURL(/\/diary$/);
	await expect(dialog).toBeHidden();
});
