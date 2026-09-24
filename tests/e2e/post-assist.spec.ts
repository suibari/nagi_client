import { expect, test, type Page } from '@playwright/test';

test.use({ timezoneId: 'Asia/Tokyo', locale: 'ja-JP' });

type AssistRequest = {
	mode: 'affirm' | 'question';
	text: string;
	lang: string;
	today: string;
	previous: string[];
};

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
				message:
					input.mode === 'affirm'
						? '「久しぶりに」って言葉から、ギターとの再会が伝わるね！素敵だよ〜'
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
	const editor = page.locator('.post-modal .cm-content');
	const assist = page.locator('.composer-assist');
	const thinking = page.locator('.composer-assist-thinking');

	// 未入力のまま3秒で、吹き出しを先に出して考え中を見せる。
	await openModal.click();
	await page.getByRole('tab', { name: 'ブログ' }).click();
	await page.getByPlaceholder('タイトルを入力…').fill('今日のこと');
	const modalBeforeAssist = await page.locator('.post-modal').boundingBox();
	expect(modalBeforeAssist).not.toBeNull();
	await page.clock.runFor(2500);
	await expect(assist).toHaveCount(0);
	await page.clock.runFor(600);
	await expect(thinking).toBeVisible();
	await expect(assist).toContainText('おたすけbotたん');
	await expect(page.locator('.composer-assist-character')).toBeVisible();
	const modalWithAssist = await page.locator('.post-modal').boundingBox();
	const assistWithModal = await assist.boundingBox();
	expect(modalWithAssist).not.toBeNull();
	expect(assistWithModal).not.toBeNull();
	expect(modalWithAssist!.height).toBeLessThan(modalBeforeAssist!.height);
	expect(modalWithAssist!.y + modalWithAssist!.height).toBeLessThanOrEqual(assistWithModal!.y);
	expect(assistRequests[0]).toEqual({
		text: '',
		mode: 'question',
		lang: 'ja',
		today: '2026-09-15',
		previous: [],
	});
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
	await editor.fill('久しぶりにギターを');
	await page.clock.runFor(3500);
	expect(assistRequests).toHaveLength(1);
	await page.clock.runFor(600);
	await expect(thinking).toBeVisible();
	await expect(assist).not.toContainText('最近は登山');
	await page.clock.runFor(500);
	await expect(assist).toContainText('ギターとの再会が伝わるね！');
	expect(assistRequests[1]).toMatchObject({
		text: '久しぶりにギターを',
		mode: 'affirm',
		previous: ['最近は登山が気になってるみたいだね。なにかあった？'],
	});

	// 同じ書きかけのままなら聞き直さない。
	await page.clock.runFor(6000);
	expect(assistRequests).toHaveLength(2);

	await page.getByRole('button', { name: 'おたすけを閉じる' }).click();
	await expect(assist).toHaveCount(0);
	await editor.fill('久しぶりにギターを弾いた');
	await page.clock.runFor(6000);
	await expect(assist).toHaveCount(0);
	expect(assistRequests).toHaveLength(2);

	// モーダルを閉じて開き直すと、また手伝ってくれる。
	await page.locator('.post-modal-close').click();
	await openModal.click();
	await page.getByRole('tab', { name: 'しっかり' }).click();
	await page.clock.runFor(4500);
	await expect(assist).toBeVisible();
	expect(assistRequests[2].previous).toEqual([]);

	// スマホ幅では吹き出しだけを出す。
	await page.setViewportSize({ width: 390, height: 844 });
	await expect(page.locator('.composer-assist-bubble')).toBeVisible();
	await expect(page.locator('.composer-assist-character')).toBeHidden();
	const mobileSubmit = page.locator('.post-modal-header-action .post-modal-mobile-submit');
	await expect(mobileSubmit).toBeVisible();
	await expect(mobileSubmit).toBeEnabled();
	await expect(page.locator('.composer-foot .submit-primary')).toBeHidden();
	const submitBox = await mobileSubmit.boundingBox();
	const closeBox = await page.locator('.post-modal-close').boundingBox();
	const assistBox = await assist.boundingBox();
	expect(submitBox).not.toBeNull();
	expect(closeBox).not.toBeNull();
	expect(assistBox).not.toBeNull();
	expect(submitBox!.x).toBeGreaterThan(closeBox!.x);
	expect(submitBox!.y + submitBox!.height).toBeLessThan(assistBox!.y);
	const mobileModalBox = await page.locator('.post-modal').boundingBox();
	expect(mobileModalBox).not.toBeNull();
	expect(mobileModalBox!.y + mobileModalBox!.height).toBeLessThanOrEqual(assistBox!.y);
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

test('考え中に入力を始めてもbotたんを表示し続ける', async ({ page }) => {
	await mockXrpc(page);
	await page.clock.install({ time: new Date('2026-09-15T10:00:00+09:00') });
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/dev/e2e/post-assist');
	await page.getByRole('button', { name: 'ポストモーダルを開く' }).click();
	await page.clock.runFor(3100);
	await expect(page.locator('.composer-assist-thinking')).toBeVisible();

	await page.locator('.post-modal .cm-content').fill('今日は空がきれい');
	await expect(page.locator('.composer-assist')).toBeVisible();
	await expect(page.locator('.composer-assist-thinking')).toBeVisible();
});

test('PCとスマホのIME変換中も表示中のbotたんを保つ', async ({ page }) => {
	await mockXrpc(page);
	await page.clock.install();
	await page.goto('/dev/e2e/post-assist');
	await page.getByRole('button', { name: 'ポストモーダルを開く' }).click();
	await page.clock.runFor(3100);
	await expect(page.locator('.composer-assist-thinking')).toBeVisible();
	await page.clock.runFor(500);

	const editor = page.locator('.post-modal .cm-content');
	const assist = page.locator('.composer-assist');
	await editor.dispatchEvent('compositionstart');
	await expect(assist).toBeVisible();
	await expect(assist).toContainText('最近は登山が気になってるみたいだね');

	// スマホの予測変換も composition が続いたままになる。同じ状態で狭い画面へ変えても、
	// 吹き出しをキーボード上に出し続ける。
	await page.setViewportSize({ width: 390, height: 844 });
	await expect(assist).toBeVisible();
	await expect(page.locator('.composer-assist-bubble')).toBeVisible();
	await expect(page.locator('.composer-assist-character')).toBeHidden();
	await editor.dispatchEvent('compositionend', { data: '今日' });
});

test('削除で問いかけ、追記で肯定へ戻り、IME変換による文字数減少では肯定を維持する', async ({
	page,
}) => {
	const requests = await mockXrpc(page);
	await page.clock.install();
	await page.goto('/dev/e2e/post-assist');
	await page.getByRole('button', { name: 'ポストモーダルを開く' }).click();
	const editor = page.locator('.post-modal .cm-content');
	await editor.fill('今日は空がきれい');
	await page.clock.runFor(4600);
	await expect.poll(() => requests.length).toBe(1);
	expect(requests.at(-1)?.mode).toBe('affirm');

	await editor.press('End');
	await editor.press('Backspace');
	await page.clock.runFor(4600);
	await expect.poll(() => requests.length).toBe(2);
	expect(requests.at(-1)).toMatchObject({ text: '今日は空がきれ', mode: 'question' });

	await editor.pressSequentially('いね');
	await page.clock.runFor(4600);
	await expect.poll(() => requests.length).toBe(3);
	expect(requests.at(-1)?.mode).toBe('affirm');

	// OSのIME操作は自動化できないため、ブラウザに同じイベント列を送って確認する。
	await editor.fill('きょう');
	await editor.dispatchEvent('compositionstart');
	await editor.evaluate((element: HTMLElement) => {
		// CodeMirror は本文の DOM の書き換えを読み取って入力として扱う
		element.querySelector('.cm-line')!.textContent = '今日';
		element.dispatchEvent(
			new InputEvent('input', {
				bubbles: true,
				inputType: 'insertCompositionText',
				isComposing: true,
				data: '今日',
			}),
		);
	});
	// 変換中に手が止まっても生成しない。
	await page.clock.runFor(6000);
	expect(requests).toHaveLength(3);
	await editor.dispatchEvent('compositionend', { data: '今日' });
	await editor.dispatchEvent('input', { inputType: 'insertFromComposition', isComposing: false });
	await page.clock.runFor(4600);
	await expect.poll(() => requests.length).toBe(4);
	expect(requests.at(-1)).toMatchObject({ text: '今日', mode: 'affirm' });

	// 変換後の実際の削除は問いかけになる。全削除の空文字も問いかけ。
	await editor.press('End');
	await editor.press('Backspace');
	await page.clock.runFor(4600);
	await expect.poll(() => requests.length).toBe(5);
	expect(requests.at(-1)).toMatchObject({ text: '今', mode: 'question' });
	await editor.press('Backspace');
	await page.clock.runFor(3600);
	await expect.poll(() => requests.length).toBe(6);
	expect(requests.at(-1)).toMatchObject({ text: '', mode: 'question' });
});

test('生成中に削除すると古い肯定を表示せず、削除後の問いかけを表示する', async ({ page }) => {
	const requests: AssistRequest[] = [];
	let release: (() => void) | undefined;
	await page.route('**/xrpc/**', async (route) => {
		if (!route.request().url().endsWith('generatePostAssist')) {
			await route.fulfill({ json: { items: [], drafts: [] } });
			return;
		}
		const input = route.request().postDataJSON() as AssistRequest;
		requests.push(input);
		if (input.mode === 'affirm') await new Promise<void>((resolve) => (release = resolve));
		await route
			.fulfill({
				json: { message: input.mode === 'affirm' ? '古い肯定のセリフ' : 'どんな空だった？' },
			})
			.catch(() => {});
	});
	await page.clock.install();
	await page.goto('/dev/e2e/post-assist');
	await page.getByRole('button', { name: 'ポストモーダルを開く' }).click();
	const editor = page.locator('.post-modal .cm-content');
	await editor.fill('空がきれい');
	await page.clock.runFor(4100);
	await expect.poll(() => requests.length).toBe(1);
	await editor.press('End');
	await editor.press('Backspace');
	release?.();
	await page.clock.runFor(4600);
	await expect.poll(() => requests.length).toBe(2);
	await page.clock.runFor(500);
	await expect(page.locator('.composer-assist')).toContainText('どんな空だった？');
	await expect(page.locator('.composer-assist')).not.toContainText('古い肯定');
});
