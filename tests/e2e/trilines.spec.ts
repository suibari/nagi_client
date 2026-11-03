import { expect, test, type Page } from '@playwright/test';

test.use({ timezoneId: 'Asia/Tokyo', locale: 'ja-JP' });

const NOW = new Date('2026-11-03T21:00:00+09:00');

type Recorded = { assist: any[]; created: any[] };

async function mockXrpc(page: Page, { writtenToday = false } = {}) {
	const recorded: Recorded = { assist: [], created: [] };
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
		if (method === 'com.suibari.nagi.getDrafts') {
			await json({ drafts: [] });
			return;
		}
		await json({ items: [], folders: [], uris: [] });
	});
	return recorded;
}

test('しっかりとブログの間の3行日記タブで、botたんが空いた行だけ埋め、投稿は日記レコードになる', async ({
	page,
}) => {
	const recorded = await mockXrpc(page, { writtenToday: true });
	await page.clock.setFixedTime(NOW);
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/dev/e2e/trilines');
	await page.getByRole('button', { name: 'ポストモーダルを開く' }).click();

	const tabs = page.locator('.post-modal-modes [role="tab"]');
	await expect(tabs).toHaveText(['あっさり', 'しっかり', '3行日記', 'ブログ']);
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
