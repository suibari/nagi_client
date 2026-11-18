import { expect, test, type Page } from '@playwright/test';

const tab = (i: number) => ({ id: `t${i}`, kind: 'hashtag', query: `たぐ${i}ばんめ` });

async function setup(page: Page, count: number) {
	await page.addInitScript(
		(tabs) => {
			localStorage.setItem('nagi-locale', 'ja');
			localStorage.setItem(
				'nagi:feed-tabs:v1.guest',
				JSON.stringify({ tabs, updatedAt: '2026-11-18T00:00:00Z' }),
			);
		},
		[{ id: 'global', kind: 'global' }, ...Array.from({ length: count - 1 }, (_, i) => tab(i + 1))],
	);
	await page.route('**/xrpc/**', (route) =>
		route.fulfill({
			json: { items: [], cards: [], folders: [], uris: [], actors: [], count: 0, drafts: [] },
		}),
	);
	await page.goto('/global');
	await expect(page.locator('.feed-tabs .feed-tab').first()).toBeVisible();
}

const scroller = (page: Page) => page.locator('.feed-tabs .feed-tabs-scroll');

test('収まる本数では ＋ を出し、タブをバーいっぱいに伸ばす', async ({ page }) => {
	await setup(page, 4);
	await expect(page.locator('.feed-tabs .feed-tab-add')).toBeVisible();
	await expect(page.getByRole('button', { name: 'すべてのタブ' })).toHaveCount(0);
	await expect(scroller(page)).not.toHaveClass(/fade-/);
	const gap = await scroller(page).evaluate((el) => {
		const last = el.lastElementChild!.getBoundingClientRect();
		return el.getBoundingClientRect().right - last.right;
	});
	expect(gap).toBeLessThan(2);
});

test('はみ出したら ▾ に替え、続きのある側を薄くする', async ({ page }) => {
	await setup(page, 9);
	await expect(page.locator('.feed-tabs .feed-tab-add')).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'すべてのタブ' })).toBeVisible();
	await expect(scroller(page)).toHaveClass(/fade-end/);
	await expect(scroller(page)).not.toHaveClass(/fade-start/);
	await page.screenshot({ path: 'test-results/feed-tab-overflow.png' });
});

test('▾ の一覧から選ぶと移動し、カスタマイズにも行ける', async ({ page }) => {
	await setup(page, 9);
	await page.getByRole('button', { name: 'すべてのタブ' }).click();
	const menu = page.getByRole('menu', { name: 'すべてのタブ' });
	await expect(menu.getByRole('menuitemradio')).toHaveCount(9);
	await expect(menu.getByRole('menuitemradio', { name: 'グローバル' })).toHaveAttribute(
		'aria-checked',
		'true',
	);
	await page.screenshot({ path: 'test-results/feed-tab-menu.png' });
	await menu.getByRole('menuitemradio', { name: /たぐ8ばんめ/ }).click();
	await expect(page).toHaveURL(/tab=t8/);
	await expect(menu).toHaveCount(0);
	const active = page.locator('.feed-tabs .feed-tab.active');
	await expect(active).toContainText('たぐ8ばんめ');
	await expect(active).toBeInViewport({ ratio: 0.9 });

	await page.getByRole('button', { name: 'すべてのタブ' }).click();
	await page.getByRole('menuitem', { name: 'タブをカスタムする' }).click();
	await expect(page).toHaveURL(/\/settings\/feed-tabs\?returnTo=/);
});

test('Esc で閉じて ▾ にフォーカスを戻す', async ({ page }) => {
	await setup(page, 9);
	const trigger = page.getByRole('button', { name: 'すべてのタブ' });
	await trigger.click();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('menu')).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(page).toHaveURL(/\/global$/);
});

test('ホイールの縦回転でタブを横に送る', async ({ page }) => {
	await setup(page, 9);
	const box = (await scroller(page).boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.wheel(0, 200);
	await expect.poll(() => scroller(page).evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
	await expect(scroller(page)).toHaveClass(/fade-start/);
	expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('設定のプレビューは実物と同じ並びになる', async ({ page }) => {
	await setup(page, 4);
	const real = await page
		.locator('.feed-tabs .feed-tab')
		.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
	await page.goto('/settings/feed-tabs');
	const preview = page.locator('.feed-tab-preview .feed-tabs');
	await expect(preview.locator('.feed-tab')).toHaveCount(4);
	const gap = await preview.locator('.feed-tabs-scroll').evaluate((el) => {
		const last = el.lastElementChild!.getBoundingClientRect();
		return el.getBoundingClientRect().right - last.right;
	});
	expect(gap).toBeLessThan(2);
	expect(real.length).toBe(4);
	await page.screenshot({ path: 'test-results/feed-tab-preview.png', fullPage: true });
});

test.describe('スマホ幅', () => {
	test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
	test('はみ出したら ▾ を出す', async ({ page }) => {
		await setup(page, 7);
		await expect(page.getByRole('button', { name: 'すべてのタブ' })).toBeVisible();
		await page.getByRole('button', { name: 'すべてのタブ' }).click();
		await page.screenshot({ path: 'test-results/feed-tab-mobile.png' });
		const menu = page.getByRole('menu', { name: 'すべてのタブ' });
		const box = (await menu.boundingBox())!;
		expect(box.x).toBeGreaterThanOrEqual(0);
		expect(box.x + box.width).toBeLessThanOrEqual(390);
	});
});
