import { expect, test } from '@playwright/test';

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

for (const kind of ['reply', 'quote'] as const) {
	test(`${kind} target stays blurred until explicitly revealed and can be concealed again`, async ({
		page,
	}) => {
		await page.getByRole('button', { name: `Open ${kind} target` }).click();
		const target = page.locator(`.post-modal .composer-target-card.${kind}`);
		const mask = target.locator('.cw-mask');
		const content = target.locator('.cw-content');
		await expect(target).toBeVisible();
		await expect(mask).toHaveAttribute('aria-expanded', 'false');
		await expect(content).toHaveAttribute('aria-hidden', 'true');
		await expect(content).toHaveCSS('filter', 'blur(24px)');

		await mask.click();
		await expect(mask).toHaveAttribute('aria-expanded', 'true');
		await expect(content).not.toHaveAttribute('aria-hidden', 'true');
		await expect(content).toHaveCSS('filter', 'none');
		await expect(content).toHaveText('Moderated composer target text');

		await mask.focus();
		await mask.press('Enter');
		await expect(mask).toHaveAttribute('aria-expanded', 'false');
		await expect(content).toHaveAttribute('aria-hidden', 'true');
		await expect(content).toHaveCSS('filter', 'blur(24px)');
	});

	test(`${kind} target omits hidden content from the DOM`, async ({ page }) => {
		await page.getByLabel('Moderation preference').selectOption('hide');
		await page.getByRole('button', { name: `Open ${kind} target` }).click();
		const target = page.locator(`.post-modal .composer-target-card.${kind}`);
		await expect(target).toBeVisible();
		await expect(target).toContainText('Moderation fixture');
		await expect(target.locator('.composer-target-text')).toHaveCount(0);
		await expect(target.locator('.cw-mask')).toHaveCount(0);
		await expect(target).not.toContainText('Moderated composer target text');
	});

	test(`${kind} target respects ignore`, async ({ page }) => {
		await page.getByLabel('Moderation preference').selectOption('ignore');
		await page.getByRole('button', { name: `Open ${kind} target` }).click();
		const target = page.locator(`.post-modal .composer-target-card.${kind}`);
		await expect(target.locator('.composer-target-text')).toHaveText(
			'Moderated composer target text',
		);
		await expect(target.locator('.cw-content')).toHaveCSS('filter', 'none');
		await expect(target.locator('.cw-content')).not.toHaveAttribute('aria-hidden', 'true');
		await expect(target.locator('.cw-mask')).not.toHaveAttribute('role', 'button');
	});
}
