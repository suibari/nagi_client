import { expect, test, type Page } from '@playwright/test';

test.use({ timezoneId: 'Asia/Tokyo', locale: 'ja-JP' });

const did = 'did:plc:playwright-blog-writer';
const documentUri = `at://${did}/site.standard.document/playwright`;
const cid = 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi';

async function mockXrpc(page: Page) {
	const saved: Record<string, unknown>[] = [];
	await page.route('**/xrpc/**', async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		const method = url.pathname.split('/').pop();
		const json = (body: unknown) =>
			route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

		if (method === 'com.suibari.nagi.generatePostAssist') {
			await json({ message: 'いい書き出しだね！' });
			return;
		}
		if (method === 'com.atproto.repo.getRecord') {
			await json({
				uri: documentUri,
				cid,
				value: {
					$type: 'site.standard.document',
					site: `at://${did}/site.standard.publication/self`,
					path: '/playwright',
					title: '変更前のタイトル',
					publishedAt: '2026-09-13T00:00:00.000Z',
					tags: ['本文タグ', '既存タグ'],
					nagi: {
						$type: 'com.suibari.nagi.post',
						text: '# 変更前のタイトル\n\n変更前のブログ本文 #本文タグ',
						createdAt: '2026-09-13T00:00:00.000Z',
					},
				},
			});
			return;
		}
		if (method === 'com.atproto.repo.putRecord') {
			saved.push(request.postDataJSON() as Record<string, unknown>);
			await json({ uri: documentUri, cid });
			return;
		}
		if (method === 'com.suibari.nagi.ensureRecord') {
			await json({ uri: documentUri, cid, indexed: true });
			return;
		}
		if (method === 'com.suibari.nagi.getDrafts') {
			await json({ drafts: [] });
			return;
		}
		await json({ items: [], folders: [], uris: [] });
	});
	return saved;
}

test('PCでは本文の右におたすけを置き、入力欄に重ねない', async ({ page }) => {
	await mockXrpc(page);
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.clock.install();
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/dev/e2e/blog-write');

	await expect(page.getByRole('heading', { name: 'ブログを書く' })).toBeVisible();
	await expect(page.getByRole('tab')).toHaveCount(0);
	await page.locator('.blog-write .cm-content').fill('今日は');
	await page.clock.runFor(4600);
	const assist = page.locator('.composer-side .composer-assist.inline');
	await expect(assist).toContainText('いい書き出しだね！');
	const assistBox = await assist.boundingBox();
	const mainBox = await page.locator('.blog-write .composer-main').boundingBox();
	expect(assistBox).not.toBeNull();
	expect(mainBox).not.toBeNull();
	expect(assistBox!.x).toBeGreaterThanOrEqual(mainBox!.x + mainBox!.width);
});

test('スマホ幅ではおたすけを下に出し、その高さぶんページ下に余白を取る', async ({ page }) => {
	await mockXrpc(page);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.clock.install();
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/dev/e2e/blog-write');

	await page.locator('.blog-write .cm-content').fill('今日は');
	await page.clock.runFor(4600);
	const assist = page.locator('body > .composer-assist');
	await expect(assist).toContainText('いい書き出しだね！');
	const height = (await assist.boundingBox())!.height;
	await expect
		.poll(() =>
			page
				.locator('.blog-write')
				.evaluate((node) => parseFloat(getComputedStyle(node).paddingBottom)),
		)
		.toBeCloseTo(height, 0);
	await expect(page.locator('.blog-write-submit')).toBeVisible();
});

test('書きかけのまま離れようとしたら確認し、取り消せば残る', async ({ page }) => {
	await mockXrpc(page);
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/dev/e2e/blog-write');

	const leave = page.getByRole('link', { name: '別のページへ' });
	await page.getByPlaceholder('タイトルを入力…').fill('今日のこと');

	const messages: string[] = [];
	let answer: 'dismiss' | 'accept' = 'dismiss';
	page.on('dialog', (dialog) => {
		messages.push(dialog.message());
		void (answer === 'accept' ? dialog.accept() : dialog.dismiss());
	});
	await leave.click();
	await expect
		.poll(() => messages)
		.toEqual(['保存していない変更があります。このページを離れますか？']);
	await expect(page).toHaveURL(/\/dev\/e2e\/blog-write$/);
	await expect(page.getByPlaceholder('タイトルを入力…')).toHaveValue('今日のこと');

	answer = 'accept';
	await leave.click();
	await expect(page).toHaveURL(/\/dev\/e2e\/post-assist$/);
});

test('編集でも同じページでタグを付け替えて保存し、記事ページへ移る', async ({ page }) => {
	const saved = await mockXrpc(page);
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/dev/e2e/blog-write?edit');

	await expect(page.getByRole('heading', { name: 'ブログを編集' })).toBeVisible();
	await expect(page.getByPlaceholder('タイトルを入力…')).toHaveValue('変更前のタイトル');
	await expect(page.locator('.blog-write .cm-content')).not.toContainText('変更前のタイトル');
	// 本文のハッシュタグはメタ欄に重ねて出さない。
	await expect(page.locator('.article-tag')).toHaveText(['既存タグ']);
	// 編集では届け先・下書き・botたんの反応を変えない。
	await expect(page.locator('.blog-write .scope-button')).toHaveCount(0);
	await expect(page.locator('.blog-write .draft-control')).toHaveCount(0);

	await page.getByRole('button', { name: 'タグ「既存タグ」を外す' }).click();
	const tagInput = page.getByRole('textbox', { name: 'タグ' });
	await tagInput.fill('新しいタグ');
	await tagInput.press('Enter');
	await page.locator('.blog-write .composer-foot').getByRole('button', { name: '保存' }).click();

	await page.waitForURL(/\/blog\/did:plc:playwright-blog-writer\/playwright$/, {
		waitUntil: 'commit',
	});
	const put = saved.find((body) => body.collection === 'site.standard.document');
	expect(put).toMatchObject({
		rkey: 'playwright',
		record: {
			title: '変更前のタイトル',
			tags: ['本文タグ', '新しいタグ'],
			nagi: { text: '# 変更前のタイトル\n\n変更前のブログ本文 #本文タグ' },
		},
	});
});

test('Nagi投稿のOGPが1MBを超えてもブログのカードに画像を表示する', async ({ page }) => {
	await mockXrpc(page);
	await page.route('**/xrpc/com.atproto.repo.listRecords?**', (route) =>
		route.fulfill({ json: { records: [] } }),
	);
	const rkey = 'image-preview';
	const postUrl = `https://nagi.suibari.com/thread/${did}/${rkey}`;
	const image = `https://nagi.suibari.com/api/post-card?v=2&kind=post&did=${encodeURIComponent(did)}&rkey=${rkey}`;
	await page.route('**/xrpc/com.suibari.nagi.getLinkMetadata?**', (route) =>
		route.fulfill({ json: { uri: postUrl, title: '画像付きの投稿', image } }),
	);
	await page.route('**/xrpc/com.suibari.nagi.getLinkThumbnail?**', (route) =>
		route.fulfill({ status: 413, json: { error: 'response_too_large' } }),
	);
	await page.addInitScript(() => {
		localStorage.setItem('nagi-locale', 'ja');
		const imageSizes = new Map<string, number>();
		Reflect.set(window, 'testImageSizes', imageSizes);
		const createObjectURL = URL.createObjectURL.bind(URL);
		URL.createObjectURL = (object) => {
			const url = createObjectURL(object);
			if (object instanceof Blob) imageSizes.set(url, object.size);
			return url;
		};
		const fetchOriginal = window.fetch.bind(window);
		window.fetch = async (input, init) => {
			if (typeof input !== 'string' || !input.startsWith('/api/post-card?'))
				return fetchOriginal(input, init);
			const canvas = document.createElement('canvas');
			canvas.width = canvas.height = 768;
			const context = canvas.getContext('2d')!;
			const pixels = context.createImageData(canvas.width, canvas.height);
			let seed = 42;
			for (let offset = 0; offset < pixels.data.length; offset++) {
				seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
				pixels.data[offset] = offset % 4 === 3 ? 255 : seed >>> 24;
			}
			context.putImageData(pixels, 0, 0);
			const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
			if (!blob || blob.size <= 1_000_000) throw new Error('Test image must exceed 1 MB');
			return new Response(blob);
		};
	});
	await page.goto('/dev/e2e/blog-write');
	await page.getByPlaceholder('タイトルを入力…').fill('リンクカードのテスト');
	await page.locator('.blog-write .cm-content').pressSequentially(postUrl);

	const card = page.locator('.composer-embed-card');
	await expect(card).toContainText('画像付きの投稿');
	const preview = card.locator('img');
	await expect(preview).toBeVisible();
	const thumbnail = await preview.evaluate(async (element: HTMLImageElement) => {
		await element.decode();
		const imageSizes = Reflect.get(window, 'testImageSizes') as Map<string, number>;
		return { size: imageSizes.get(element.src), width: element.naturalWidth };
	});
	expect(thumbnail.size).toBeLessThanOrEqual(1_000_000);
	expect(thumbnail.width).toBeGreaterThan(0);
});
