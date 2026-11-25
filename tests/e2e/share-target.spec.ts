import { expect, test, type Page } from '@playwright/test';

const did = 'did:plc:share-target-test';

async function account(page: Page, selected: string | null = did) {
	await page.evaluate(async (selected) => {
		const modulePath = '/src/lib/oauth/session.svelte.ts';
		const auth = await import(/* @vite-ignore */ modulePath);
		auth.session.set(
			selected
				? {
						did: selected,
						fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
						getTokenInfo: async () => ({ scope: '' }),
					}
				: null,
		);
		auth.oauthReady.set(true);
	}, selected);
}

async function receive(page: Page, text = '共有した本文', files = 0, bad = false) {
	return page.evaluate(
		async ({ text, files, bad }) => {
			const modulePath = '/src/lib/share-target/receive.ts';
			const { receiveShare } = await import(/* @vite-ignore */ modulePath);
			const form = new FormData();
			if (text) form.set('text', text);
			const canvas = document.createElement('canvas');
			canvas.width = canvas.height = 2;
			canvas.getContext('2d')!.fillRect(0, 0, 2, 2);
			const blob = await new Promise<Blob>((resolve) =>
				canvas.toBlob((value) => resolve(value!), 'image/png'),
			);
			for (let i = 0; i < files; i++)
				form.append('images', new File([blob], `${i}.png`, { type: 'image/png' }));
			if (bad) form.append('images', new File(['bad'], 'bad.png', { type: 'image/png' }));
			const response = await receiveShare(
				new Request(`${location.origin}/share-target`, { method: 'POST', body: form }),
			);
			if (response.status !== 303) throw new Error(await response.text());
			return new URL(response.headers.get('location')!).searchParams.get('id')!;
		},
		{ text, files, bad },
	);
}

async function start(page: Page) {
	await page.route('**/xrpc/**', async (route) => {
		const method = new URL(route.request().url()).pathname.split('/').pop();
		const payload =
			method === 'com.suibari.nagi.getDrafts'
				? { drafts: [] }
				: { items: [], uris: [], feeds: [], folders: [], count: 0 };
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(payload),
		});
	});
	await page.addInitScript(() => {
		localStorage.setItem('nagi-locale', 'ja');
		localStorage.setItem('nagi-last-post-scope', 'feed');
	});
	await page.goto('/share-target');
	await expect(page.getByText('未処理の共有内容がありません。', { exact: false })).toBeVisible();
}

async function openReceipt(page: Page, id: string) {
	await page.goto(`/share-target?id=${id}`);
	await expect(
		page.getByRole('button', { name: 'ログインして取り込む', exact: true }),
	).toBeVisible();
	await account(page);
	await page.getByRole('button', { name: '投稿画面へ', exact: true }).click();
	await expect(page.getByRole('button', { name: '確認して取り込む', exact: true })).toBeEnabled();
}

async function pending(page: Page, id: string) {
	return page.evaluate(async (id) => {
		const path = '/src/lib/share-target/store.ts';
		return (await import(/* @vite-ignore */ path)).loadShare(id);
	}, id);
}

const editor = (page: Page) =>
	page
		.locator(
			'.post-modal .composer-write [contenteditable="true"], .post-modal .composer-write textarea',
		)
		.first();

test('本文と画像を確認後に取り込み、自動投稿しない', async ({ page }) => {
	await start(page);
	await page.setViewportSize({ width: 375, height: 812 });
	const id = await receive(page, '共有した本文', 2);
	await openReceipt(page, id);
	await page.getByRole('button', { name: '確認して取り込む', exact: true }).click();
	await expect(page.locator('.composer-write')).toContainText('共有した本文');
	await expect(page.locator('.attachment-preview')).toHaveCount(2);
	await expect.poll(() => pending(page, id)).toBeUndefined();
	await expect(page.getByRole('dialog').first()).toBeVisible();
	expect(await page.locator('.post-modal').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
		true,
	);
	await page.screenshot({ path: '/tmp/nagi-share-mobile.png' });
});

test('書きかけを残して追記し、部分失敗の再試行で重複しない', async ({ page }) => {
	await start(page);
	const id = await receive(page, '追記する本文', 1, true);
	await openReceipt(page, id);
	await editor(page).fill('書きかけ');
	await expect(page.getByText('書きかけがあります。', { exact: false })).toBeVisible();
	await page.getByRole('button', { name: '確認して取り込む', exact: true }).click();
	await expect(page.locator('.composer-write')).toContainText('書きかけ');
	await expect(page.locator('.composer-write')).toContainText('追記する本文');
	await expect(page.locator('.share-import [role="alert"]')).toBeVisible();
	await expect.poll(async () => (await pending(page, id))?.files.length).toBe(1);
	await page.getByRole('button', { name: '確認して取り込む', exact: true }).click();
	await expect(page.locator('.attachment-preview')).toHaveCount(1);
	await expect(editor(page).locator('.cm-line')).toHaveText(['書きかけ', '', '追記する本文']);
});

test('未ログインの共有を保持してログイン復帰先を記録する', async ({ page }) => {
	await start(page);
	const id = await receive(page, '', 1);
	await page.goto(`/share-target?id=${id}`);
	await page.getByRole('button', { name: 'ログインして取り込む', exact: true }).click();
	await expect(page).toHaveURL(/\/login$/);
	const returnTo = await page.evaluate(() => localStorage.getItem('nagi.oauth.return-to'));
	expect(returnTo).toBe(`/share-target?id=${id}`);
	expect((await pending(page, id))?.files).toHaveLength(1);
	await openReceipt(page, id);
	await page.getByRole('button', { name: '確認して取り込む', exact: true }).click();
	await expect(page.locator('.attachment-preview')).toHaveCount(1);
});

test('画像はこっそりで保留し、利用者が「Nagiに」を選んだ後に投稿できる', async ({ page }) => {
	await start(page);
	const cid = 'bafyreie5737gdxlw5i64vzichcalba3z2v5n6icifvx5xytvske7mr3hpm';
	await page.route('**/xrpc/com.atproto.repo.uploadBlob', (route) =>
		route.fulfill({
			json: {
				blob: {
					$type: 'blob',
					ref: { $link: cid },
					mimeType: 'image/webp',
					size: route.request().postDataBuffer()?.length ?? 0,
				},
			},
		}),
	);
	await page.route('**/xrpc/com.atproto.repo.createRecord', (route) =>
		route.fulfill({ json: { uri: `at://${did}/com.suibari.nagi.post/3new`, cid } }),
	);
	const id = await receive(page, '', 1);
	await page.evaluate(() => localStorage.setItem('nagi-last-post-scope', 'kossori'));
	// addInitScriptのfeed初期値より後、Composerのマウントより前に設定する。
	await page.goto(`/share-target?id=${id}`);
	await page.evaluate(() => localStorage.setItem('nagi-last-post-scope', 'kossori'));
	await account(page);
	await page.getByRole('button', { name: '投稿画面へ', exact: true }).click();
	await expect(page.getByText('画像を添付するには', { exact: false })).toBeVisible();
	await expect(page.getByRole('button', { name: '確認して取り込む', exact: true })).toBeDisabled();
	expect((await pending(page, id))?.files).toHaveLength(1);
	await page.getByRole('button', { name: '投稿範囲：', exact: false }).click();
	await page.getByRole('radio', { name: 'Nagiに', exact: true }).click();
	await page.getByRole('button', { name: '決定', exact: true }).click();
	await expect(page.getByRole('button', { name: '投稿範囲：Nagiに（変更する）' })).toBeVisible();
	await page.getByRole('button', { name: '確認して取り込む', exact: true }).click();
	await expect(page.locator('.attachment-preview')).toHaveCount(1);
	const saved = page.waitForResponse('**/xrpc/com.atproto.repo.createRecord');
	await page.locator('.post-modal').getByRole('button', { name: '投稿する', exact: true }).click();
	const response = await saved;
	expect(response.ok()).toBe(true);
	expect(response.request().postDataJSON()).toMatchObject({
		collection: 'com.suibari.nagi.post',
		record: { embed: { images: [{ image: { ref: { $link: cid } } }] } },
	});
});

test('別受信を上書きせず、排他ロックはページ終了後に再取得できる', async ({ page, context }) => {
	await start(page);
	const first = await receive(page, 'first', 1);
	const second = await receive(page, 'second', 1);
	expect(first).not.toBe(second);
	expect((await pending(page, first))?.text).toBe('first');
	await page.evaluate((id) => {
		void navigator.locks.request(`nagi-share:${id}`, async () => {
			await new Promise(() => {});
		});
	}, first);
	const other = await context.newPage();
	await other.goto(`/share-target?id=${first}`);
	const locked = await other.evaluate(async (id) => {
		const path = '/src/lib/share-target/store.ts';
		return (await import(/* @vite-ignore */ path)).withShareLock(id, async () => 'acquired');
	}, first);
	expect(locked.acquired).toBe(false);
	await page.close();
	await expect
		.poll(async () =>
			other.evaluate(async (id) => {
				const path = '/src/lib/share-target/store.ts';
				return (
					await (await import(/* @vite-ignore */ path)).withShareLock(id, async () => 'acquired')
				).acquired;
			}, first),
		)
		.toBe(true);
	expect((await pending(other, second))?.text).toBe('second');
});

test('画像4枚の上限を超えた分は残し、明示的に破棄できる', async ({ page }) => {
	await start(page);
	const id = await receive(page, '', 5);
	await openReceipt(page, id);
	await page.getByRole('button', { name: '確認して取り込む', exact: true }).click();
	await expect(page.locator('.attachment-preview')).toHaveCount(4);
	await expect.poll(async () => (await pending(page, id))?.files.length).toBe(1);
	await page.locator('.share-import').getByRole('button', { name: '共有内容を破棄' }).click();
	await expect.poll(() => pending(page, id)).toBeUndefined();
	await expect(page.locator('.attachment-preview')).toHaveCount(4);
});

test('画像処理中のアカウント切替では旧共有を適用しない', async ({ page }) => {
	await start(page);
	const id = await receive(page, '旧アカウントへの本文', 1);
	await openReceipt(page, id);
	await page.evaluate(async () => {
		const path = '/src/lib/oauth/session.svelte.ts';
		const { session } = await import(/* @vite-ignore */ path);
		const original = window.createImageBitmap;
		window.createImageBitmap = ((...args: Parameters<typeof createImageBitmap>) => {
			session.update((current: { did: string }) => ({ ...current, did: 'did:plc:changed' }));
			return original(...args);
		}) as typeof createImageBitmap;
	});
	await page.getByRole('button', { name: '確認して取り込む', exact: true }).click();
	await expect(page.locator('.share-import')).toContainText('アカウントが変わりました');
	await expect(editor(page)).not.toContainText('旧アカウントへの本文');
	await expect(page.locator('.attachment-preview')).toHaveCount(0);
	expect((await pending(page, id))?.text).toBe('旧アカウントへの本文');
});

test('返信の文脈を自動解除せず保留し、通常投稿に戻して取り込める', async ({ page }) => {
	await start(page);
	const id = await receive(page, '新規投稿用');
	await openReceipt(page, id);
	await page.evaluate(async () => {
		const path = '/src/lib/post/composer-host.svelte.ts';
		const { composerHost } = await import(/* @vite-ignore */ path);
		composerHost.openReply({
			uri: 'at://did:plc:target/com.suibari.nagi.post/a',
			cid: 'test',
			author: { did: 'did:plc:target', handle: 'target.example' },
			text: '返信先',
			createdAt: new Date().toISOString(),
			reactions: [],
		});
	});
	await expect(page.getByRole('button', { name: '確認して取り込む', exact: true })).toBeDisabled();
	await expect(page.locator('.share-import')).toContainText('返信・引用を外して');
	await page.getByRole('button', { name: '返信を外す', exact: true }).click();
	await page.getByRole('button', { name: '確認して取り込む', exact: true }).click();
	await expect(editor(page)).toContainText('新規投稿用');
});

test('3行日記の書きかけを維持し、既存seedも通常投稿へ追記する', async ({ page }) => {
	await start(page);
	const id = await receive(page, '外部共有の本文');
	await openReceipt(page, id);
	await page.getByRole('button', { name: 'あとで取り込む', exact: true }).click();
	await page.getByRole('tab', { name: '3行日記', exact: true }).click();
	const diary = page.locator('.trilines-composer input[type="text"]').first();
	await diary.fill('日記の書きかけ');
	await page.evaluate(async (id) => {
		const hostPath = '/src/lib/post/composer-host.svelte.ts';
		const storePath = '/src/lib/share-target/store.ts';
		const { composerHost } = await import(/* @vite-ignore */ hostPath);
		composerHost.showWithText('既存のシェア文');
		composerHost.showShared(await (await import(/* @vite-ignore */ storePath)).loadShare(id));
	}, id);
	await page.getByRole('button', { name: '確認して取り込む', exact: true }).click();
	await expect(editor(page)).toContainText('既存のシェア文');
	await expect(editor(page)).toContainText('外部共有の本文');
	await page.getByRole('tab', { name: '3行日記', exact: true }).click();
	await expect(diary).toHaveValue('日記の書きかけ');
});

test('受信の再読込と読み取り失敗は入力の消失を成功扱いにしない', async ({ page }) => {
	await start(page);
	const id = await receive(page, '再読込後も残す', 1);
	await page.goto(`/share-target?id=${id}`);
	await page.reload();
	await expect(page.locator('.share-page pre')).toHaveText('再読込後も残す');
	await page.evaluate(() => {
		indexedDB.open = () => {
			throw new Error('Storage unavailable');
		};
	});
	await page.getByRole('button', { name: 'もう一度', exact: true }).click();
	await expect(page.locator('.share-page [role="alert"]')).toContainText('保存・読み取りに失敗');
	await expect(page.getByRole('button', { name: 'ログインして取り込む', exact: true })).toHaveCount(
		0,
	);
	await page.reload();
	await expect(page.locator('.share-page pre')).toHaveText('再読込後も残す');
});

test('取り込み完了の保存失敗を再試行しても本文・画像を二重追加しない', async ({ page }) => {
	await start(page);
	const id = await receive(page, '一度だけ取り込む', 1);
	await openReceipt(page, id);
	await page.evaluate(() => {
		const original = IDBDatabase.prototype.transaction;
		let failed = false;
		IDBDatabase.prototype.transaction = function (...args: Parameters<typeof original>) {
			const tx = original.apply(this, args);
			if (this.name === 'nagi-share-target' && args[1] === 'readwrite' && !failed) {
				failed = true;
				tx.abort();
			}
			return tx;
		};
	});
	await page.getByRole('button', { name: '確認して取り込む', exact: true }).click();
	await expect(page.locator('.share-import [role="alert"]')).toContainText('保存・読み取りに失敗');
	await expect(page.locator('.attachment-preview')).toHaveCount(1);
	expect((await pending(page, id))?.text).toBe('一度だけ取り込む');
	await page.getByRole('button', { name: '確認して取り込む', exact: true }).click();
	await expect.poll(() => pending(page, id)).toBeUndefined();
	await expect(page.locator('.attachment-preview')).toHaveCount(1);
	await expect(editor(page).locator('.cm-line')).toHaveText(['一度だけ取り込む']);
});

test('画像選択と貼り付けは共有取り込み後も使える', async ({ page }) => {
	await start(page);
	const id = await receive(page, '添付を追加する');
	await openReceipt(page, id);
	await page.getByRole('button', { name: '確認して取り込む', exact: true }).click();
	await page
		.locator('.post-modal .attachment-picker input[type="file"]')
		.setInputFiles('tests/e2e/fixtures/thumbnail.jpg');
	await expect(page.locator('.attachment-preview')).toHaveCount(1);
	await editor(page).evaluate(async (element) => {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 2;
		const blob = await new Promise<Blob>((resolve) => canvas.toBlob((value) => resolve(value!)));
		const data = new DataTransfer();
		data.items.add(new File([blob], 'pasted.png', { type: 'image/png' }));
		element.dispatchEvent(
			new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }),
		);
	});
	await expect(page.locator('.attachment-preview')).toHaveCount(2);
});
