import { expect, test } from '@playwright/test';

for (const width of [320, 375, 1440]) {
	test(`game selection and finale at ${width}px`, async ({ page }, testInfo) => {
		await page.setViewportSize({ width, height: 900 });
		await page.addInitScript(() => {
			localStorage.setItem('nagi-locale', 'ja');
			let vibrations = 0;
			Object.defineProperty(navigator, 'vibrate', {
				value: () => {
					localStorage.setItem('zenkatsu-e2e-vibrations', String(++vibrations));
					return true;
				},
			});
		});
		let polls = 0;
		await page.route('**/xrpc/com.suibari.nagi.getZenkatsu**', (route) =>
			route.fulfill({
				json: {
					submissions: [
						{
							uri: 'at://did:plc:preview/tan.zenkatsu/2026-09-19',
							commentJa: ++polls > 1 ? '今日のきみも、すてきだよ！' : undefined,
							commentPending: polls <= 1,
						},
					],
				},
			}),
		);
		await page.goto('/dev/e2e/zenkatsu');
		await page.getByText('Open game', { exact: true }).click();
		const dialog = page.getByRole('dialog', { name: /今日のきみに/ });
		await expect(dialog).toBeVisible();
		await expect(dialog).toHaveCSS('background-color', 'rgb(9, 11, 16)');
		await expect(dialog.getByRole('heading', { level: 1 })).toContainText('そんなとき？');
		await expect(dialog.locator('.recommended-attribute')).toHaveText('おすすめ属性: 風');
		const rect = await dialog.boundingBox();
		expect(rect?.width).toBe(width);
		await expect(page.locator('.slot')).toHaveCount(3);
		await expect(page.locator('.hand-card').last()).toBeDisabled();
		await page.locator('.hand-card').nth(0).click();
		await expect(page.locator('.selected-card').first()).toContainText('きみが今日ここにいる');
		await page.locator('.hand-card').nth(1).click();
		await page.locator('.hand-card').nth(2).click();
		await page.locator('.hand-card').nth(3).click();
		await expect(page.locator('.selected-card')).toHaveCount(3);
		expect(
			await page.evaluate(() => Number(localStorage.getItem('zenkatsu-e2e-vibrations'))),
		).toBeGreaterThan(0);
		expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
		await dialog.evaluate((el) => (el.scrollTop = 0));
		await page.screenshot({ path: testInfo.outputPath('selection.png') });
		const helpButton = dialog.getByRole('button', { name: 'あそびかた', exact: true });
		await helpButton.click();
		const help = page.getByRole('dialog', { name: 'あそびかた', exact: true });
		await expect(help).toContainText('Nは2日、Rは3日、SRは4日、URは6日、AARは7日');
		await page.screenshot({ path: testInfo.outputPath('help.png') });
		await page.keyboard.press('Escape');
		await expect(help).not.toBeVisible();
		await expect(dialog).toBeVisible();
		await expect(helpButton).toBeFocused();
		await expect(page.locator('.selected-card')).toHaveCount(3);
		await page.getByRole('button', { name: 'これで出す' }).click();
		await expect(page.locator('.cutin')).toHaveCount(3);
		await expect(page.locator('.speech')).toContainText('今日のきみも、すてきだよ！', {
			timeout: 15000,
		});
		await expect(page.locator('.bot-review img')).toHaveAttribute('src', '/bot_assist_sitting.png');
		await page.screenshot({ path: testInfo.outputPath('review.png') });
		await page.locator('.finale').getByRole('button', { name: 'おわる' }).click();
		await expect(dialog).not.toBeVisible();
		await expect(page.getByTestId('submissions')).toHaveText('1');
	});
}

test('failed submission preserves selection and permits retry with reduced motion', async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.route('**/xrpc/com.suibari.nagi.getZenkatsu**', (route) =>
		route.fulfill({ json: { submissions: [] } }),
	);
	await page.goto('/dev/e2e/zenkatsu');
	await page.getByLabel('Fail submission').check();
	await page.getByText('Open game', { exact: true }).click();
	await page.locator('.hand-card').first().click();
	await page.getByRole('button', { name: 'これで出す' }).click();
	await expect(page.getByRole('alert')).toBeVisible();
	await expect(page.locator('.selected-card')).toHaveCount(1);
	await page.getByRole('button', { name: 'やめる', exact: true }).click();
	await page.getByLabel('Fail submission').uncheck();
	await page.getByText('Open game', { exact: true }).click();
	await page.locator('.hand-card').first().click();
	await page.getByRole('button', { name: 'これで出す' }).click();
	await expect(page.locator('.speech')).toContainText('botたんが考えているよ');
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('board keeps the game open while reloading after a successful submission', async ({
	page,
}) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	let submitted = false;
	let reloading = false;
	const uri = 'at://did:plc:zenkatsu-preview/com.suibari.nagi.zenkatsu/2026-09-19';
	const cid = 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi';
	await page.route('**/xrpc/**', (route) =>
		route.fulfill({ json: { items: [], folders: [], uris: [], drafts: [] } }),
	);
	await page.route('**/xrpc/com.atproto.repo.getRecord**', (route) =>
		route.fulfill({
			json: {
				uri: 'at://did:plc:zenkatsu-preview/com.suibari.nagi.profile/self',
				cid,
				value: { $type: 'com.suibari.nagi.profile', displayName: 'Preview', description: '' },
			},
		}),
	);
	await page.route('**/xrpc/com.suibari.nagi.getCards**', (route) =>
		route.fulfill({
			json: {
				cards: [1, 2, 3].map((id) => ({
					volume: 1,
					id,
					rarity: 'R',
					attribute: 'wind',
					atk: 1200,
					def: 900,
					owned: true,
					nameJa: `きみの味方 ${id}`,
					nameEn: `Your ally ${id}`,
					raceJa: 'もふもふ族',
					raceEn: 'Fluffy',
					textJa: '今日のきみもすてきだよ。',
					textEn: 'You are wonderful today, too.',
				})),
				ownedCount: 3,
				totalCount: 3,
			},
		}),
	);
	await page.route('**/xrpc/com.atproto.repo.putRecord', async (route) => {
		submitted = true;
		await route.fulfill({ json: { uri, cid } });
	});
	await page.route('**/xrpc/com.suibari.nagi.ensureRecord', (route) => route.fulfill({ json: {} }));
	await page.route('**/xrpc/com.suibari.nagi.getZenkatsu**', async (route) => {
		if (submitted && !reloading) {
			reloading = true;
			// Leave the board loading long enough to cover the cut-in transition.
			await new Promise((resolve) => setTimeout(resolve, 2500));
		}
		await route.fulfill({
			json: {
				theme: {
					volume: 1,
					id: 1,
					themeDate: '2026-09-19',
					attribute: 'wind',
					tone: 'sunao',
					textJa: '今日のきみに、追い風を。',
					textEn: 'A tailwind for you today.',
				},
				viewer: {
					submitted,
					maxCards: 3,
					playable: [1, 2, 3].map((id) => ({ volume: 1, id, available: 1 })),
				},
				submissions: submitted
					? [
							{
								uri,
								cid: 'bafy-preview',
								cards: [],
								commentJa: 'きみの一歩を応援しているよ！',
								commentPending: false,
								author: { did: 'did:plc:zenkatsu-preview', handle: 'preview.example' },
								createdAt: '2026-09-19T00:00:00Z',
								indexedAt: '2026-09-19T00:00:00Z',
							},
						]
					: [],
			},
		});
	});
	await page.goto('/dev/e2e/zenkatsu?board');
	const playButton = page.getByRole('button', { name: 'プレイする', exact: true });
	const guideButton = page.getByRole('button', { name: 'あそびかた', exact: true });
	await expect(page.locator('.theme-question')).toHaveText('そんなとき？');
	const playRect = await playButton.boundingBox();
	const guideRect = await guideButton.boundingBox();
	expect(playRect?.y).toBe(guideRect?.y);
	await guideButton.click();
	await expect(guideButton).toHaveAttribute('aria-expanded', 'true');
	const guide = page.getByRole('dialog', { name: 'あそびかた', exact: true });
	await expect(guide).toContainText('手持ちから1〜3枚');
	await expect(guide).toContainText('プレイは1日1回');
	await expect(guide).toContainText('Nは2日、Rは3日、SRは4日、URは6日、AARは7日');
	await expect(guide).toContainText('カードはなくならない');
	await guide.getByRole('button', { name: '閉じる', exact: true }).click();
	await expect(guide).not.toBeVisible();
	await playButton.click();
	await page.locator('.hand-card').first().click();
	await page.getByRole('button', { name: 'これで出す' }).click();
	await expect(page.locator('.speech')).toContainText('きみの一歩を応援しているよ！');
	await page.locator('.finale').getByRole('button', { name: 'おわる' }).click();
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await expect(page.getByText('今日はもう出したよ', { exact: true })).toBeVisible();
});

test('standalone mock opens a completed three-card review without registration', async ({
	page,
}) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	const writes: string[] = [];
	page.on('request', (request) => {
		if (request.url().includes('putRecord')) writes.push(request.url());
	});
	await page.goto('/dev/zenkatsu');
	await expect(page.locator('.review-cards .card')).toHaveCount(3);
	await expect(page.locator('.speech')).toContainText('自分を置き去りにしない3枚');
	await page.locator('.finale').getByRole('button', { name: 'おわる' }).click();
	await page.getByRole('button', { name: '選択・提出の演出を試す' }).click();
	for (let i = 0; i < 3; i++) await page.locator('.hand-card').nth(i).click();
	await page.getByRole('button', { name: 'これで出す' }).click();
	await expect(page.locator('.speech')).toContainText('自分を置き去りにしない3枚');
	expect(writes).toEqual([]);
});

test('card news review uses the feed bot avatar and profile link', async ({ page }) => {
	const bot = {
		did: 'did:plc:review-bot',
		handle: 'bot.example',
		displayName: 'botたん',
		avatar: 'https://example.com/bot-avatar.png',
	};
	await page.route('**/xrpc/**', (route) =>
		route.fulfill({
			json: route.request().url().includes('getCardNews')
				? {
						items: [
							{
								uri: 'at://did:plc:demo/com.suibari.nagi.zenkatsu/demo',
								type: 'zenkatsu',
								author: { did: 'did:plc:demo', handle: 'demo.example' },
								cards: [],
								commentJa: 'すてきな3枚です！',
							},
						],
					}
				: { items: [], botActor: bot },
		}),
	);
	await page.goto('/cards');
	const avatar = page.locator('.card-bot-review .avatar-link');
	await expect(avatar).toHaveAttribute('href', `/profile/${bot.did}`);
	await expect(avatar.locator('img')).toHaveAttribute('src', bot.avatar);
	await expect(page.locator('.card-bot-review')).toContainText('すてきな3枚です！');
});
