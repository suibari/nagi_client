import { expect, test } from '@playwright/test';

test('Last.fm radio shows a square jacket and link, while old YouTube cards still work', async ({
	page,
}) => {
	await page.route('https://lastfm-img.freetls.fastly.net/**', (route) =>
		route.fulfill({
			contentType: 'image/svg+xml',
			body: '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#b3d1b4"/><text x="50" y="150">Album artwork</text></svg>',
		}),
	);
	await page.goto('/dev/e2e/radio');
	await page.setViewportSize({ width: 375, height: 812 });
	const radio = page.getByTestId('lastfm-radio');
	await expect(radio.locator('.radio-content')).toHaveClass(/is-unread/);
	await expect(radio.getByText('チェリー', { exact: true })).toBeVisible();
	await expect(radio.getByText('スピッツ', { exact: true })).toBeVisible();
	await expect(radio.locator('time')).toContainText('2026');
	await expect(radio.locator('.radio-station')).toBeVisible();
	await expect(radio.getByRole('link')).toHaveAttribute(
		'href',
		'https://www.last.fm/music/Spitz/_/Cherry',
	);
	const cover = radio.locator('img');
	await expect(cover).toBeVisible();
	await expect.poll(() => cover.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(300);
	await expect(cover).toHaveCSS('object-fit', 'contain');
	const bounds = await cover.boundingBox();
	expect(bounds?.width).toBe(bounds?.height);
	await expect(radio.locator('iframe')).toHaveCount(0);
	await expect(page.getByTestId('legacy-radio').getByRole('button')).toBeVisible();
	await page.setViewportSize({ width: 1280, height: 900 });
	await expect(radio.locator('.radio-station')).toBeVisible();
	await expect(radio.getByRole('link')).toBeVisible();
	expect(await radio.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
});
