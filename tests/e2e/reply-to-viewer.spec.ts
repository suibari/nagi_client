import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
});

for (const width of [375, 1280]) {
	test(`marks only replies to the viewer at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/dev/e2e/reply-to-viewer');

		const plain = page.getByTestId('plain');
		await expect(plain.getByText('いいな〜、こっちはまだ緑だよ')).toBeVisible();
		await expect(plain.getByText('あなたへ', { exact: true })).toHaveCount(1);

		// 会話カードの自己返信と他の人宛ての返信には出さず、botたんと人からの自分宛てにだけ出す。
		const conversation = page.getByTestId('conversation');
		await expect(conversation.getByText('明日も行こうかな')).toBeVisible();
		const marked = conversation.locator('.reply-to-viewer + *');
		await expect(marked).toHaveCount(2);
		await expect(marked.nth(0)).toContainText('秋の散歩、気持ちよさそう！');
		await expect(marked.nth(1)).toContainText('いいな〜、こっちはまだ緑だよ');

		await page.screenshot({
			path: test.info().outputPath(`reply-to-viewer-${width}.png`),
			fullPage: true,
		});
	});
}
