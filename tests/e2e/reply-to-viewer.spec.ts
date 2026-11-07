import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
});

for (const width of [375, 1280]) {
	test(`marks only other people's replies to the viewer at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/dev/e2e/reply-to-viewer');

		const plain = page.getByTestId('plain');
		await expect(plain.getByText('いいな〜、こっちはまだ緑だよ')).toBeVisible();
		await expect(plain.getByText('あなたへ', { exact: true })).toHaveCount(1);

		// 会話カードには botたん・自己返信・他の人宛ての返信も並ぶが、目印は自分宛ての1件だけ。
		const conversation = page.getByTestId('conversation');
		await expect(conversation.getByText('明日も行こうかな')).toBeVisible();
		const marks = conversation.getByText('あなたへ', { exact: true });
		await expect(marks).toHaveCount(1);
		const mark = conversation.locator('.reply-to-viewer');
		await expect(mark.locator('xpath=following-sibling::*[1]')).toContainText(
			'いいな〜、こっちはまだ緑だよ',
		);

		await page.screenshot({
			path: test.info().outputPath(`reply-to-viewer-${width}.png`),
			fullPage: true,
		});
	});
}
