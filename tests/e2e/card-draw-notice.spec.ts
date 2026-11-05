import { expect, test } from '@playwright/test';

const drawStatus = (canDraw: boolean) => ({
	canDraw,
	nextDrawAt: '2026-11-06T19:00:00Z',
	myNagi: { canDraw, nextDrawAt: '2026-11-06T19:00:00Z' },
});

for (const canDraw of [true, false]) {
	// OAuth の復元はレイアウトの初回描画より遅れて終わる（?restore で再現する）。
	// その順序でも、今日の一枚が未ドローならナビの「カードゲーム」に点が付くこと。
	test(`nav card dot after a late sign-in (canDraw=${canDraw})`, async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
		await page.route('**/xrpc/com.suibari.nagi.getCards**', (route) =>
			route.fulfill({
				json: { cards: [], ownedCount: 0, totalCount: 100, drawStatus: drawStatus(canDraw) },
			}),
		);
		await page.route('**/xrpc/com.suibari.nagi.getZenkatsu**', (route) =>
			route.fulfill({
				json: {
					theme: {
						volume: 1,
						id: 1,
						themeDate: '2026-11-05',
						textJa: '今日のきみに、追い風を。',
						textEn: 'A tailwind for you today.',
						attribute: 'wind',
						tone: 'sunao',
					},
					submissions: [],
					viewer: { submitted: true },
				},
			}),
		);
		await page.goto('/dev/e2e/zenkatsu?board&restore&cards-through-network');
		const dot = page.locator('a[href="/cards"] .nav-unread-dot');
		if (canDraw) await expect(dot).toHaveCount(1);
		else {
			await expect(page.getByText('今日のきみに、追い風を。')).toBeVisible();
			await expect(dot).toHaveCount(0);
		}
	});
}
