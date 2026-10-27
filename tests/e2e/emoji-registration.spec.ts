import { expect, test } from '@playwright/test';

// 実際の設定画面を操作し、PDS との境界だけを置き換える。
// 名前の検証・登録ボタン・一括キューは本番のコンポーネントを通す。
for (const mode of ['single', 'batch', 'batch-retry'] as const) {
	test(`${mode}: 同名の絵文字を登録でき、無効な名前は拒否する`, async ({ page }) => {
		const created: string[] = [];
		await page.route('**/xrpc/**', (route) =>
			route.fulfill({ json: { items: [], cards: [], folders: [], uris: [], drafts: [] } }),
		);
		let failNext = mode === 'batch-retry';
		await page.exposeFunction('recordEmojiUpload', (name: string) => {
			if (failNext) {
				failNext = false;
				throw new Error('Internal Server Error');
			}
			created.push(name);
		});
		await page.route('**/src/lib/atproto/bluemoji.ts', (route) =>
			route.fulfill({
				contentType: 'application/javascript',
				body: `
				export * from '/src/lib/atproto/bluemoji.ts?emoji-e2e-original';
				export async function listMyBluemoji() {
					return [{ uri: 'at://did:plc:test/blue.moji.collection.item/existing', name: ':blobcat:' }];
				}
				export async function createBluemojiItem(name) {
					await window.recordEmojiUpload(name);
				}
			`,
			}),
		);
		await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
		await page.goto('/settings/emoji');
		await page.evaluate(async () => {
			// @ts-expect-error Vite がブラウザ向けに解決するモジュール。
			const { session } = await import('/src/lib/oauth/session.svelte.ts');
			session.set({
				did: 'did:plc:emoji-registration',
				fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
			});
		});
		const dataUrl = await page.evaluate(() => {
			const canvas = document.createElement('canvas');
			canvas.width = canvas.height = 1;
			return canvas.toDataURL('image/png');
		});
		const png = Buffer.from(dataUrl.split(',')[1], 'base64');
		const image = (name: string) => ({ name, mimeType: 'image/png', buffer: png });
		if (mode === 'single') {
			const single = page.locator('#emoji-panel-single');
			await single.locator('input[type=file]').setInputFiles(image('blobcat.png'));
			const name = single.locator('input[maxlength="32"]');
			const upload = single.locator('button').last();
			await name.fill('invalid name');
			await expect(upload).toBeDisabled();
			await name.fill('blobcat');
			await expect(upload).toBeEnabled();
			await upload.click();
			await expect.poll(() => created).toEqual(['blobcat']);
			await expect(name).toHaveValue('');
			return;
		}

		await page.locator('#emoji-tab-batch').click();
		const batch = page.locator('#emoji-panel-batch');
		await batch
			.locator('input[type=file]:not([webkitdirectory])')
			.setInputFiles([image('blobcat.png'), image('blobcat.png')]);
		const batchNames = batch.locator('input[maxlength="32"]');
		await expect(batchNames).toHaveCount(2);
		await batchNames.nth(0).fill('invalid name');
		await batchNames.nth(1).fill('invalid name');
		const batchUpload = batch.locator('button').last();
		await expect(batchUpload).toBeDisabled();
		await batchNames.nth(0).fill('blobcat');
		await batchNames.nth(1).fill('blobcat');
		await expect(batch.locator('.emoji-batch-item.failed')).toHaveCount(0);
		await expect(batchUpload).toBeEnabled();
		await batchUpload.click();
		if (mode === 'batch-retry') {
			await expect(batchUpload).toHaveText('未登録の絵文字を再試行');
			await expect.poll(() => created).toEqual(['blobcat']);
			await expect(
				page.getByText(
					'1件を登録できませんでした。ファイルを選び直さず、未登録分を再試行できます。',
				),
			).toBeVisible();
			await batchUpload.click();
		}
		await expect.poll(() => created).toEqual(['blobcat', 'blobcat']);
		await expect(batchNames.nth(0)).toBeDisabled();
		await expect(batchNames.nth(1)).toBeDisabled();
	});
}
