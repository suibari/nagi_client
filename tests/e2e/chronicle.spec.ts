import { expect, test, type Page } from '@playwright/test';

const years = [2024, 2025, 2026];

/**
 * 1ページ＝1年、古い年から今年へ進むAppViewの年表を真似る。
 * failing の年は recover() を呼ぶまで500を返す（未読判定も同じAPIを読むので回数では区切らない）。
 */
async function mockChronicle(page: Page, failing?: number) {
	let down = failing !== undefined;
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'en'));
	await page.route('**/xrpc/**', async (route) => {
		const url = new URL(route.request().url());
		const method = url.pathname.split('/').pop();
		if (method === 'com.suibari.nagi.getChronicle') {
			const year = Number(url.searchParams.get('cursor') ?? years[0]);
			if (down && year === failing) {
				await route.fulfill({ status: 500, json: { error: 'InternalServerError' } });
				return;
			}
			const hasMore = year < years[years.length - 1];
			await route.fulfill({
				json: {
					year,
					revision: String(year).padEnd(64, '0'),
					items: ['01', '04', '07', '10'].map((month) => ({
						id: `${year}-${month}`,
						kind: 'highlight',
						date: `${year}-${month}-15`,
						titleEn: `Moment of ${year}-${month}`,
						detailEn: 'A small thing worth keeping.',
					})),
					...(hasMore ? { cursor: String(year + 1) } : {}),
					hasMore,
				},
			});
			return;
		}
		await route.fulfill({ json: { items: [], hasMore: false } });
	});
	return {
		recover: () => {
			down = false;
		},
	};
}

async function openChronicle(page: Page) {
	await page.goto('/dev/e2e/diary-navigation');
	await page.getByRole('link', { name: 'Open diary deep link' }).click();
	// 未読の年があるとタブ名に更新の案内が続く。
	await page.getByRole('tab', { name: /^Your chronicle/ }).click();
}

test('the chronicle opens at the latest moment and the scrubber jumps between years', async ({
	page,
}) => {
	await mockChronicle(page);
	await openChronicle(page);

	const latest = page.getByText('Moment of 2026-10');
	await expect(latest).toBeInViewport();
	await expect(page.getByText('Moment of 2024-01')).not.toBeInViewport();

	const slider = page.getByRole('slider', { name: 'Jump to a year in the chronicle' });
	await expect(slider).toHaveAttribute('aria-valuenow', '2026');
	await expect(slider).toHaveAttribute('aria-valuemin', '2024');

	await slider.focus();
	await page.keyboard.press('Home');
	await expect(slider).toHaveAttribute('aria-valuenow', '2024');
	await expect(page.locator('[data-chronicle-year="2024"]')).toBeInViewport();

	await page.keyboard.press('ArrowDown');
	await expect(slider).toHaveAttribute('aria-valuenow', '2025');

	await page.keyboard.press('End');
	await expect(latest).toBeInViewport();
});

test('a failed year keeps the earlier years and retries from where it stopped', async ({
	page,
}) => {
	const appview = await mockChronicle(page, 2025);
	await openChronicle(page);

	await expect(page.getByText('Moment of 2024-01')).toBeVisible();
	await expect(page.getByText('Moment of 2025-01')).toHaveCount(0);
	// 1年分しか読めていないのでスクラバーは出さない。
	await expect(page.getByRole('slider')).toHaveCount(0);

	appview.recover();
	await page.getByRole('button', { name: 'Try again' }).click();
	await expect(page.getByText('Moment of 2026-10')).toBeInViewport();
	await expect(page.getByText('Moment of 2024-01')).toHaveCount(1);
});
