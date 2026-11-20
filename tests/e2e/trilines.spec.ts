import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ timezoneId: 'Asia/Tokyo', locale: 'ja-JP' });

const NOW = new Date('2026-11-03T21:00:00+09:00');

async function pasteImage(input: Locator) {
	await input.focus();
	return input.evaluate(async (element) => {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 2;
		const blob = await new Promise<Blob>((resolve) => canvas.toBlob((image) => resolve(image!)));
		const data = new DataTransfer();
		data.items.add(new File([blob], 'pasted.png', { type: 'image/png' }));
		data.setData('text/plain', '画像に付随するテキスト');
		return element.dispatchEvent(
			new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }),
		);
	});
}

const uploadedBlob = {
	$type: 'blob',
	ref: { $link: 'bafyreie5737gdxlw5i64vzichcalba3z2v5n6icifvx5xytvske7mr3hpm' },
	mimeType: 'image/webp',
};

type Recorded = { assist: any[]; created: any[]; imageUploads: number[] };

async function mockXrpc(page: Page, { writtenToday = false } = {}) {
	const recorded: Recorded = { assist: [], created: [], imageUploads: [] };
	await page.route('**/xrpc/**', async (route) => {
		const request = route.request();
		const method = new URL(request.url()).pathname.split('/').pop();
		const json = (body: unknown) =>
			route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

		if (method === 'com.suibari.nagi.generateTrilinesAssist') {
			const input = request.postDataJSON();
			recorded.assist.push(input);
			await json({
				lines: input.lines.map(
					(line: string, index: number) => line || ['カレーを作った', '', '早く寝た'][index],
				),
			});
			return;
		}
		if (method === 'com.atproto.repo.listRecords') {
			await json({
				records: writtenToday
					? [
							{
								uri: 'at://did:plc:playwright-trilines/com.suibari.trilinesat.diary/3old',
								cid: 'bafyreie5737gdxlw5i64vzichcalba3z2v5n6icifvx5xytvske7mr3hpm',
								value: { createdAt: '2026-11-03T05:00:00.000Z', lines: [{ text: '昼' }] },
							},
						]
					: [],
			});
			return;
		}
		if (method === 'com.atproto.repo.createRecord') {
			const input = request.postDataJSON();
			recorded.created.push(input);
			await json({
				uri: `at://did:plc:playwright-trilines/${input.collection}/3new`,
				cid: 'bafyreie5737gdxlw5i64vzichcalba3z2v5n6icifvx5xytvske7mr3hpm',
			});
			return;
		}
		if (method === 'com.atproto.repo.uploadBlob') {
			const size = request.postDataBuffer()?.length ?? 0;
			recorded.imageUploads.push(size);
			await json({ blob: { ...uploadedBlob, size } });
			return;
		}
		if (method === 'com.suibari.nagi.getDrafts') {
			await json({ drafts: [] });
			return;
		}
		await json({ items: [], folders: [], uris: [] });
	});
	return recorded;
}

test('しっかりの隣の3行日記タブで、botたんが空いた行だけ埋め、投稿は日記レコードになる', async ({
	page,
}) => {
	const recorded = await mockXrpc(page, { writtenToday: true });
	await page.clock.setFixedTime(NOW);
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/dev/e2e/trilines');
	await page.getByRole('button', { name: 'ポストモーダルを開く' }).click();

	const tabs = page.locator('.post-modal-modes [role="tab"]');
	await expect(tabs).toHaveText(['あっさり', 'しっかり', '3行日記']);
	await page.getByRole('tab', { name: '3行日記' }).click();

	const inputs = page.locator('.trilines-input');
	await expect(inputs).toHaveCount(3);
	await expect(page.getByText('今日の3行日記はもう書いています。')).toBeVisible();
	// 相談中にポストおたすけの吹き出しは出さない。
	await expect(page.locator('.composer-assist')).toHaveCount(0);

	// TriLinesAt でも公開されることを伝え、公開範囲はゲージで選ぶ（こっそりは選べない）。
	await expect(
		page.getByRole('link', { name: '3行日記はTriLinesAtでも見られます。' }),
	).toBeVisible();
	await page.locator('.trilines-composer .scope-button').click();
	const kossori = page.locator('.scope-dialog [role="radio"]').first();
	await expect(kossori).toBeDisabled();
	await expect(page.locator('.scope-dialog [role="radio"][aria-checked="true"]')).toBeEnabled();
	await page.locator('.scope-dialog header .icon-action').click();
	await expect(page.locator('.scope-dialog')).toHaveCount(0);

	// 相談の説明はボタンのツールチップに入れる。
	const consult = page.getByRole('button', { name: /botたんに相談/ });
	await consult.hover();
	await expect(page.getByRole('tooltip')).toBeVisible();

	await inputs.nth(1).fill('猫をなでた');
	await consult.click();
	await expect(inputs.nth(0)).toHaveValue('カレーを作った');
	await expect(inputs.nth(1)).toHaveValue('猫をなでた');
	await expect(inputs.nth(2)).toHaveValue('早く寝た');
	expect(recorded.assist).toHaveLength(1);
	expect(recorded.assist[0].lines).toEqual(['', '猫をなでた', '']);
	// 材料は日記の日付の0時から今まで（21時に書けば、その日の朝の出来事も入る）。
	expect(recorded.assist[0].from).toBe('2026-11-02T15:00:00.000Z');
	expect(recorded.assist[0].to).toBe('2026-11-03T12:00:00.000Z');
	// 相談しただけでは投稿しない。
	expect(recorded.created).toHaveLength(0);

	await page.locator('.trilines-composer .submit-primary').click();
	await expect.poll(() => recorded.created.length).toBe(1);
	const created = recorded.created[0];
	expect(created.collection).toBe('com.suibari.trilinesat.diary');
	expect(created.record.$type).toBe('com.suibari.trilinesat.diary');
	expect(created.record.lines).toEqual([
		{ text: 'カレーを作った' },
		{ text: '猫をなでた' },
		{ text: '早く寝た' },
	]);
	expect(created.record.hubRef).toBe(
		'at://did:plc:uixgxpiqf4i63p6rgpu7ytmx/app.bsky.actor.profile/self',
	);
	expect(created.record.authorDid).toBeUndefined();
});

for (const modifier of ['Control', 'Meta']) {
	test(`3行日記を${modifier}+Enterで投稿でき、通常のEnterやIME変換中は投稿しない`, async ({
		page,
	}) => {
		const recorded = await mockXrpc(page);
		await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
		await page.goto('/dev/e2e/trilines');
		await page.getByRole('button', { name: 'ポストモーダルを開く' }).click();
		await page.getByRole('tab', { name: '3行日記' }).click();

		const inputs = page.locator('.trilines-input');
		await inputs.nth(0).fill('朝ごはん');
		await inputs.nth(0).press(`${modifier}+Enter`);
		await inputs.nth(1).fill('猫');
		await inputs.nth(2).fill('早寝');
		await inputs.nth(2).press('Enter');
		await inputs.nth(2).dispatchEvent('keydown', {
			key: 'Enter',
			ctrlKey: modifier === 'Control',
			metaKey: modifier === 'Meta',
			isComposing: true,
		});
		expect(recorded.created).toHaveLength(0);

		await inputs.nth(2).press(`${modifier}+Enter`);
		await expect.poll(() => recorded.created.length).toBe(1);
		expect(recorded.created[0].record.lines).toEqual([
			{ text: '朝ごはん' },
			{ text: '猫' },
			{ text: '早寝' },
		]);
		await expect(page.locator('.post-modal')).toBeHidden();
	});
}

test('3行日記の権限が無い旧ログインでは、再ログインを案内して投稿させない', async ({ page }) => {
	const recorded = await mockXrpc(page);
	await page.clock.setFixedTime(NOW);
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/dev/e2e/trilines?noscope=1');
	await page.getByRole('button', { name: 'ポストモーダルを開く' }).click();
	await page.getByRole('tab', { name: '3行日記' }).click();

	await expect(page.getByText('3行日記の書き込み権限が含まれていません')).toBeVisible();
	// 3行とも書けていても、権限が無ければ送信できない。
	const inputs = page.locator('.trilines-input');
	for (const [index, text] of ['朝ごはん', '猫', '早寝'].entries())
		await inputs.nth(index).fill(text);
	await expect(page.locator('.trilines-composer .submit-primary')).toBeDisabled();
	await inputs.nth(2).press('Control+Enter');
	expect(recorded.created).toHaveLength(0);
});

test('3行日記の本文欄はCtrl+Vで画像を添付でき、テキストも貼り付けられる', async ({ page }) => {
	await mockXrpc(page);
	await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('/dev/e2e/trilines');
	await page.getByRole('button', { name: 'ポストモーダルを開く' }).click();
	await page.getByRole('tab', { name: '3行日記' }).click();

	const rows = page.locator('.trilines-line');
	const target = rows.nth(1);
	const input = target.locator('.trilines-input');
	await page.evaluate(async () => {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 2;
		const image = await new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!)));
		await navigator.clipboard.write([new ClipboardItem({ 'image/png': image })]);
	});
	await input.fill('猫をなでた');
	await input.press('Control+v');
	const preview = target.locator('.trilines-image img');
	await expect(preview).toBeVisible();
	await expect(rows.locator('.trilines-image img')).toHaveCount(1);
	await expect(input).toHaveValue('猫をなでた');

	const original = await preview.getAttribute('src');
	await target.locator('.trilines-alt').fill('寝ている猫');
	expect(await pasteImage(input)).toBe(false);
	await expect(preview).not.toHaveAttribute('src', original!);
	await expect(target.locator('.trilines-image img')).toHaveCount(1);
	await expect(target.locator('.trilines-alt')).toHaveValue('寝ている猫');
	await expect(input).toHaveValue('猫をなでた');

	await page.evaluate(() => navigator.clipboard.writeText('早く寝た'));
	await rows.nth(2).locator('.trilines-input').press('Control+v');
	await expect(rows.nth(2).locator('.trilines-input')).toHaveValue('早く寝た');
	await expect(rows.locator('.trilines-image img')).toHaveCount(1);
});

test('3行日記は画像処理中の保存を止め、処理失敗時は以前の添付画像を保存できる', async ({
	page,
}) => {
	const recorded = await mockXrpc(page);
	await page.goto('/dev/e2e/trilines');
	await page.getByRole('button', { name: 'ポストモーダルを開く' }).click();
	await page.getByRole('tab', { name: '3行日記' }).click();

	const composer = page.locator('.trilines-composer');
	const inputs = composer.locator('.trilines-input');
	const submit = composer.locator('.submit-primary');
	for (const [index, line] of ['朝ごはん', '猫をなでた', '早く寝た'].entries()) {
		await inputs.nth(index).fill(line);
	}
	await expect(submit).toBeEnabled();

	await page.evaluate(() => {
		const createImageBitmap = window.createImageBitmap;
		const ready = new Promise<void>((resolve) => {
			window.addEventListener('finish-image-decode', () => resolve(), { once: true });
		});
		window.createImageBitmap = async (image) => {
			await ready;
			return createImageBitmap(image);
		};
	});
	await pasteImage(inputs.nth(1));
	await expect(submit).toBeDisabled();
	await inputs.nth(1).press('Control+Enter');
	await pasteImage(inputs.nth(2));
	await page.evaluate(() => window.dispatchEvent(new Event('finish-image-decode')));

	const preview = composer.locator('.trilines-line').nth(1).locator('.trilines-image img');
	await expect(preview).toBeVisible();
	const original = await preview.getAttribute('src');
	await expect(composer.locator('.trilines-image img')).toHaveCount(1);
	expect(recorded.created).toHaveLength(0);

	await page.evaluate(() => {
		const toBlob = HTMLCanvasElement.prototype.toBlob;
		HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
			if (type === 'image/webp') {
				callback(null);
				return;
			}
			toBlob.call(this, callback, type, quality);
		};
	});
	await pasteImage(inputs.nth(1));
	await expect(composer.getByRole('alert')).toContainText('pasted.png');
	await expect(preview).toHaveAttribute('src', original!);
	await expect(submit).toBeEnabled();
	await submit.click();
	await expect.poll(() => recorded.created.length).toBe(1);
	expect(recorded.imageUploads).toHaveLength(1);
	const [size] = recorded.imageUploads;
	expect(size).toBeGreaterThan(0);
	expect(size).toBeLessThanOrEqual(1_000_000);
	expect(recorded.created[0].record.lines).toEqual([
		{ text: '朝ごはん' },
		{ text: '猫をなでた', image: { ...uploadedBlob, size } },
		{ text: '早く寝た' },
	]);
});
