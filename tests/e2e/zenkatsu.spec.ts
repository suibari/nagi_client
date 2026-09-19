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
		// カットインでは botたんが受け取り手として立つ。
		await expect(page.locator('.cutin-bot img')).toHaveCount(1);
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
	/*
	 * 総評は提出より遅れて載る。盤面が提出直後に引く1回では間に合わず、
	 * ゲーム側のポーリングが先に受け取る。閉じたあとに引き直せているかを、この時間差で見る。
	 */
	let submittedAt = 0;
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
	const commentLanded = () => submittedAt > 0 && Date.now() - submittedAt > 3500;
	await page.route('**/xrpc/com.atproto.repo.putRecord', async (route) => {
		submitted = true;
		submittedAt = Date.now();
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
								commentJa: commentLanded() ? 'きみの一歩を応援しているよ！' : undefined,
								commentPending: !commentLanded(),
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
	// 閉じたあとの記録欄に総評が載っていること（提出直後の再取得だけだと「考えているよ…」で止まる）。
	await expect(page.locator('.record')).toContainText('きみの一歩を応援しているよ！');
	await expect(page.locator('.record')).not.toContainText('botたんが考えているよ');
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

test('the how-to-play dialog closes on a backdrop click', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/dev/zenkatsu');
	await page.locator('.game-header').getByRole('button', { name: 'おわる' }).click();
	await page.getByRole('button', { name: '選択・提出の演出を試す' }).click();
	const help = page.getByRole('dialog', { name: 'あそびかた', exact: true });
	await page.locator('.game-actions').getByRole('button', { name: 'あそびかた' }).click();
	await expect(help).toBeVisible();
	// パネルの中を押しても閉じない。
	await help.locator('.flow').click();
	await expect(help).toBeVisible();
	// ::backdrop（パネルの外）は閉じる。アプリの他のモーダルと同じ挙動。
	await page.mouse.click(8, 450);
	await expect(help).not.toBeVisible();
	await expect(page.getByRole('dialog', { name: /がんばったのに/ })).toBeVisible();
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
	// 既定はゼンカツタブ。この検証はニュース側なので開き直す（このテストはロケールを固定しない）。
	await page.getByRole('tab', { name: /ニュース|News/ }).click();
	const avatar = page.locator('.card-bot-review .avatar-link');
	await expect(avatar).toHaveAttribute('href', `/profile/${bot.did}`);
	await expect(avatar.locator('img')).toHaveAttribute('src', bot.avatar);
	await expect(page.locator('.card-bot-review')).toContainText('すてきな3枚です！');
});

for (const reducedMotion of [false, true]) {
	test(`bonus reveal completes before an early review (reduced motion: ${reducedMotion})`, async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });
		await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
		await page.route('**/xrpc/com.suibari.nagi.getZenkatsu**', (route) =>
			route.fulfill({
				json: {
					submissions: [
						{
							uri: 'at://did:plc:preview/tan.zenkatsu/2026-09-19',
							tailwindCount: 1,
							combos: [1, 2].map((id) => ({
								volume: 1,
								id,
								nameJa: `発見コンボ${id}`,
								nameEn: `Combo ${id}`,
								descJa: 'カードがつながった！',
								descEn: 'Connected!',
							})),
							commentJa: 'すぐ届いた総評です。',
						},
					],
				},
			}),
		);
		await page.goto('/dev/e2e/zenkatsu');
		await page.getByText('Open game', { exact: true }).click();
		await page.locator('.hand-card').first().click();
		await page.getByRole('button', { name: 'これで出す' }).click();
		if (!reducedMotion) {
			await expect(page.locator('.bonus-item.current h2')).toHaveText('おすすめ属性');
			await expect(page.locator('.bonus-item.revealed')).toHaveCount(1);
			await expect(page.locator('.speech')).not.toContainText('すぐ届いた総評です。');
			await expect(page.locator('.bonus-item.current h2')).toHaveText('発見コンボ1');
			await expect(page.locator('.speech')).not.toContainText('すぐ届いた総評です。');
			await expect(page.locator('.bonus-item.current h2')).toHaveText('発見コンボ2');
		}
		await expect(page.locator('.speech')).toContainText('すぐ届いた総評です。');
		// 演出が終わったら、成立した全項目が説明文つきで**同時に**残っていること。
		await expect(page.locator('.bonus-item.revealed h2')).toHaveText([
			'おすすめ属性',
			'発見コンボ1',
			'発見コンボ2',
		]);
		await expect(page.locator('.bonus-item.revealed .bonus-detail').last()).toBeVisible();
		await expect(page.locator('.bonus-progress')).toHaveText('3 / 3');
	});
}

test('skipping bonuses settles the sequence and closing cancels pending animation', async ({
	page,
}) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/dev/zenkatsu');
	await page.locator('.game-header').getByRole('button', { name: 'おわる' }).click();
	await page.getByRole('button', { name: '選択・提出の演出を試す' }).click();
	await page.locator('.hand-card').first().click();
	await page.getByRole('button', { name: 'これで出す' }).click();
	await page.getByRole('button', { name: 'スキップ' }).click();
	await expect(page.locator('.bonus-item.revealed h2')).toHaveText([
		'おすすめ属性',
		'明日への一歩',
	]);
	await expect(page.locator('.speech')).toContainText('自分の頑張りを認めて');
	await expect(page.locator('.bonus-stage')).toHaveClass(/complete/);
	await page.waitForTimeout(1300);
	await expect(page.locator('.bonus-item.current h2')).toHaveText('明日への一歩');
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).not.toBeVisible();
});
