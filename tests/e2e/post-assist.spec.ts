import { expect, test, type Page } from '@playwright/test';

test.use({ timezoneId: 'Asia/Tokyo', locale: 'ja-JP' });

type AssistRequest = { text: string; lang: string; today: string; previous: string[] };

async function mockXrpc(page: Page) {
	const assistRequests: AssistRequest[] = [];
	await page.route('**/xrpc/**', async (route) => {
		const request = route.request();
		const method = new URL(request.url()).pathname.split('/').pop();
		const json = (body: unknown) =>
			route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

		if (method === 'com.suibari.nagi.generatePostAssist') {
			const input = request.postDataJSON() as AssistRequest;
			assistRequests.push(input);
			await json({
				message: input.text
					? `9月1日にもギターの弦を替えてたよね！今日はどんな音だった？`
					: '最近は登山が気になってるみたいだね。なにかあった？',
			});
			return;
		}
		if (method === 'com.suibari.nagi.getDrafts') {
			await json({ drafts: [] });
			return;
		}
		await json({ items: [], folders: [], uris: [] });
	});
	return assistRequests;
}

test('手が止まるとbotたんが考え中を見せてから声をかけ、×で閉じたらモーダルを開き直すまで出さない', async ({
	page,
}) => {
	const assistRequests = await mockXrpc(page);
	await page.clock.install({ time: new Date('2026-09-15T10:00:00+09:00') });
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/dev/e2e/post-assist');

	const openModal = page.getByRole('button', { name: 'ポストモーダルを開く' });
	const textarea = page.locator('.post-modal textarea');
	const assist = page.locator('.composer-assist');
	const thinking = page.locator('.composer-assist-thinking');

	// 未入力のまま3秒で、吹き出しを先に出して考え中を見せる。
	await openModal.click();
	await page.clock.runFor(2500);
	await expect(assist).toHaveCount(0);
	await page.clock.runFor(600);
	await expect(thinking).toBeVisible();
	await expect(assist).toContainText('おたすけbotたん');
	await expect(page.locator('.composer-assist-character')).toBeVisible();
	expect(assistRequests[0]).toEqual({ text: '', lang: 'ja', today: '2026-09-15', previous: [] });
	// 生成がすぐ返っても、考え中は最低限見せてからセリフに替える。
	await page.clock.runFor(500);
	await expect(thinking).toHaveCount(0);
	await expect(assist).toContainText('最近は登山が気になってるみたいだね');

	// PCではbotたんをクリックすると、しばらく喜ぶ姿に切り替わってから元に戻る。
	const character = page.locator('.composer-assist-character');
	await page.getByRole('button', { name: 'botたんをなでる' }).click();
	await expect(character).toHaveAttribute('src', '/bot_assist_petted.png');
	await expect(character).toHaveClass(/petted/);
	await page.clock.runFor(1500);
	await expect(character).toHaveAttribute('src', '/bot_assist_sitting.png');

	// 入力途中は4秒待つ。前のセリフは考え中に置き換わる。
	await textarea.fill('久しぶりにギターを');
	await page.clock.runFor(3500);
	expect(assistRequests).toHaveLength(1);
	await page.clock.runFor(600);
	await expect(thinking).toBeVisible();
	await expect(assist).not.toContainText('最近は登山');
	await page.clock.runFor(500);
	await expect(assist).toContainText('9月1日にもギターの弦を替えてたよね！');
	expect(assistRequests[1]).toMatchObject({
		text: '久しぶりにギターを',
		previous: ['最近は登山が気になってるみたいだね。なにかあった？'],
	});

	// 同じ書きかけのままなら聞き直さない。
	await page.clock.runFor(6000);
	expect(assistRequests).toHaveLength(2);

	await page.getByRole('button', { name: 'おたすけを閉じる' }).click();
	await expect(assist).toHaveCount(0);
	await textarea.fill('久しぶりにギターを弾いた');
	await page.clock.runFor(6000);
	await expect(assist).toHaveCount(0);
	expect(assistRequests).toHaveLength(2);

	// モーダルを閉じて開き直すと、また手伝ってくれる。
	await page.locator('.post-modal-close').click();
	await openModal.click();
	await page.clock.runFor(4500);
	await expect(assist).toBeVisible();
	expect(assistRequests[2].previous).toEqual([]);

	// スマホ幅では吹き出しだけを出す。
	await page.setViewportSize({ width: 390, height: 844 });
	await expect(page.locator('.composer-assist-bubble')).toBeVisible();
	await expect(page.locator('.composer-assist-character')).toBeHidden();
});

test('生成できないときは考え中の吹き出しをそっと消す', async ({ page }) => {
	await page.route('**/xrpc/**', (route) =>
		new URL(route.request().url()).pathname.endsWith('generatePostAssist')
			? route.fulfill({
					status: 429,
					contentType: 'application/json',
					body: JSON.stringify({
						error: 'rate_limited',
						message: 'Post assist rate limit exceeded',
					}),
				})
			: route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: '{"items":[],"drafts":[]}',
				}),
	);
	await page.clock.install({ time: new Date('2026-09-15T10:00:00+09:00') });
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/dev/e2e/post-assist');
	await page.getByRole('button', { name: 'ポストモーダルを開く' }).click();
	await page.clock.runFor(3100);
	await expect(page.locator('.composer-assist-thinking')).toBeVisible();
	await page.clock.runFor(1000);
	await expect(page.locator('.composer-assist')).toHaveCount(0);
	await expect(page.locator('.post-modal')).toBeVisible();
});
