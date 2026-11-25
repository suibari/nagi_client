import { expect, test } from '@playwright/test';

// POST-10: 返信できる人とサイレントリプライは公開範囲モーダルで選ぶ。
test.beforeEach(async ({ page }) => {
	await page.route('**/xrpc/**', (route) => {
		if (new URL(route.request().url()).pathname.endsWith('/com.atproto.repo.getRecord')) {
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					uri: 'at://did:plc:playwright-composer-moderation/com.suibari.nagi.profile/self',
					cid: 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi',
					value: { $type: 'com.suibari.nagi.profile', displayName: 'Moderation fixture' },
				}),
			});
		}
		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ drafts: [], items: [], folders: [], uris: [] }),
		});
	});
	await page.goto('/dev/e2e/composer-moderation');
});

test('reply gate is chosen in the scope dialog, remembered, and flagged on the scope button', async ({
	page,
}) => {
	await page.getByRole('button', { name: 'Open reply target' }).click();
	const modal = page.locator('.post-modal');
	await expect(modal.locator('.bot-silent-toggle')).toHaveCount(0);
	const scopeButton = modal.locator('.composer-foot > .scope-button');
	await expect(scopeButton.locator('.scope-button-flag')).toHaveCount(0);

	await scopeButton.click();
	const dialog = page.locator('.scope-dialog');
	const section = dialog.locator('.scope-nagi-reply');
	await expect(section.locator('select option')).toHaveCount(3);
	await section.locator('select').selectOption('nobody');
	const silent = section.locator('input[type="checkbox"]');
	await expect(silent).not.toBeChecked();
	await silent.check();
	await dialog.locator('.scope-actions button').click();

	await expect(scopeButton.locator('.scope-button-flag')).toHaveCount(2);
	// 3行日記の入力も同じ選択を使う。
	await expect(modal.locator('.trilines-foot > .scope-button .scope-button-flag')).toHaveCount(1, {
		timeout: 5000,
	});
	expect(await page.evaluate(() => localStorage.getItem('nagi-last-reply-gate'))).toBe('nobody');
	expect(
		await page.evaluate(() => Object.keys(localStorage).some((key) => /silent/i.test(key))),
	).toBe(false);
});
