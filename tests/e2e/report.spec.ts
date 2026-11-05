import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
});

async function captureReports(page: Page, status = 200) {
	const bodies: unknown[] = [];
	await page.route('**/xrpc/com.suibari.nagi.createReport', async (route) => {
		bodies.push(route.request().postDataJSON());
		await route.fulfill(
			status === 200
				? { json: {} }
				: { status, json: { error: 'rate_limited', message: 'Too many reports' } },
		);
	});
	return bodies;
}

async function openMenu(page: Page, testId: string, item: string) {
	const section = page.getByTestId(testId);
	await section.getByRole('button', { name: 'その他の投稿操作' }).click();
	await page.getByRole('menuitem', { name: item }).click();
	return page.getByRole('dialog');
}

for (const width of [375, 1280]) {
	test(`reports another person's post at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 });
		const bodies = await captureReports(page);
		await page.goto('/dev/e2e/report');
		const dialog = await openMenu(page, 'other-post', '運営に伝える');
		await expect(dialog.getByRole('heading', { name: 'この投稿を運営に伝える' })).toBeVisible();
		const send = dialog.getByRole('button', { name: '送る' });
		await expect(send).toBeDisabled();
		await dialog.getByLabel('攻撃的・いやがらせ').check();
		await dialog.getByLabel('くわしく（任意）').fill('  言い方がきつかった  ');
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
		);
		expect(overflow).toBeLessThanOrEqual(0);
		await send.click();
		await expect(dialog.getByRole('heading', { name: '運営に届けました' })).toBeVisible();
		expect(bodies).toEqual([
			{
				subject: { uri: 'at://did:plc:report-other/com.suibari.nagi.post/other' },
				reason: 'harassment',
				comment: '言い方がきつかった',
			},
		]);
	});
}

test('bot replies default to feedback on the reply', async ({ page }) => {
	const bodies = await captureReports(page);
	await page.goto('/dev/e2e/report');
	const dialog = await openMenu(page, 'bot-post', 'botたんの返答について伝える');
	await expect(dialog.getByLabel('返答が気になった')).toBeChecked();
	await dialog.getByRole('button', { name: '送る' }).click();
	await expect(dialog.getByRole('heading', { name: '運営に届けました' })).toBeVisible();
	expect(bodies[0]).toMatchObject({ reason: 'botResponse' });
});

test('reactions on your own post are reported per reactor', async ({ page }) => {
	const bodies = await captureReports(page);
	await page.goto('/dev/e2e/report');
	// 自分の投稿には「運営に伝える」は出さず、リアクションだけを伝えられる。
	await page.getByTestId('own-post').getByRole('button', { name: 'その他の投稿操作' }).click();
	await expect(page.getByRole('menuitem', { name: '運営に伝える', exact: true })).toHaveCount(0);
	await page.getByRole('menuitem', { name: 'リアクションを運営に伝える' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByText('💢 👍')).toBeVisible();
	await dialog.getByLabel(/あおい/).check();
	await dialog.getByLabel('攻撃的・いやがらせ').check();
	await dialog.getByRole('button', { name: '送る' }).click();
	await expect(dialog.getByRole('heading', { name: '運営に届けました' })).toBeVisible();
	expect(bodies[0]).toEqual({
		subject: {
			uri: 'at://did:plc:report-viewer/com.suibari.nagi.post/own',
			reactor: 'did:plc:report-reactor-a',
		},
		reason: 'harassment',
	});
});

test('rate limiting keeps the dialog open with a message', async ({ page }) => {
	await captureReports(page, 429);
	await page.goto('/dev/e2e/report');
	const dialog = await openMenu(page, 'other-post', '運営に伝える');
	await dialog.getByLabel('スパム・宣伝').check();
	await dialog.getByRole('button', { name: '送る' }).click();
	await expect(dialog.getByRole('alert')).toHaveText(/しばらくしてから/);
	await expect(dialog.getByRole('button', { name: '送る' })).toBeEnabled();
});
