import { expect, test, type Page, type Route } from '@playwright/test';
import type { DraftView } from '../../src/lib/api/types';

test.use({ locale: 'ja-JP' });
type Draft = DraftView;
async function setup(page: Page, save?: (route: Route, draft: Draft) => Promise<void>) {
	const drafts = new Map<string, Draft>();
	const requests: Draft[] = [];
	await page.route('**/xrpc/**', async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		const method = url.pathname.split('.').pop();
		const json = (body: unknown) => route.fulfill({ json: body });
		if (method === 'putDraft') {
			const input = request.postDataJSON();
			const draft = {
				...input.content,
				id: input.id,
				createdAt: input.createdAt,
				updatedAt: input.updatedAt,
			};
			requests.push(draft);
			drafts.set(draft.id, draft);
			if (save) await save(route, draft);
			else await json(draft);
		} else if (method === 'getDrafts') {
			await json({
				drafts: [...drafts.values()].map((d) => ({ ...d, linkCardCount: d.linkCards.length })),
				limit: 30,
			});
		} else if (method === 'getDraft') await json(drafts.get(url.searchParams.get('id')!));
		else if (method === 'deleteDraft') {
			drafts.delete(request.postDataJSON().id);
			await json({ deleted: true });
		} else await json({ items: [], folders: [], uris: [], message: '' });
	});
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/dev/e2e/blog-write');
	await expect(page.getByPlaceholder('タイトルを入力…')).toBeVisible();
	return { drafts, requests };
}
const title = (page: Page) => page.getByPlaceholder('タイトルを入力…');
const saved = (page: Page) => page.locator('.draft-save-status');
const leave = (page: Page) => page.getByRole('link', { name: '別のページへ' });
async function manualSave(page: Page) {
	await page.getByRole('button', { name: '下書き一覧', exact: true }).click();
	await page.getByRole('button', { name: '現在の内容を下書きに保存' }).click();
}
async function expectWarning(page: Page, pattern = /保存していない変更/) {
	const message = page.waitForEvent('dialog').then(async (dialog) => {
		expect(dialog.message()).toMatch(pattern);
		await dialog.dismiss();
	});
	await leave(page).click();
	await message;
	await expect(page).toHaveURL(/blog-write$/);
}

test('タイトル・タグだけでも自動保存し、警告なく離脱して復元できる', async ({ page }) => {
	const { requests } = await setup(page);
	await title(page).fill('途中のタイトル');
	await page.getByRole('textbox', { name: 'タグ', exact: true }).fill('日常');
	await page.getByRole('textbox', { name: 'タグ', exact: true }).press('Enter');
	await expect(saved(page)).toHaveText('保存済み');
	expect(requests.at(-1)).toMatchObject({
		text: '',
		articleTitle: '途中のタイトル',
		articleTags: ['日常'],
	});
	page.on('dialog', async (dialog) => {
		await dialog.dismiss();
		throw new Error('保存済みで警告: ' + dialog.message());
	});
	await leave(page).click();
	await expect(page).toHaveURL(/post-assist$/);
	await page.goto('/dev/e2e/blog-write');
	await page.getByRole('button', { name: '下書き一覧', exact: true }).click();
	await page
		.locator('.draft-item')
		.filter({ hasText: '途中のタイトル' })
		.getByRole('button', { name: '復元', exact: true })
		.click();
	await expect(title(page)).toHaveValue('途中のタイトル');
	await expect(page.locator('.article-tag')).toContainText('日常');
	await expect(saved(page)).toHaveText('保存済み');
});

test('手動保存した本文も警告なく離脱できる', async ({ page }) => {
	await setup(page);
	await page.locator('.blog-write .cm-content').fill('本文を保存する');
	await manualSave(page);
	await expect(saved(page)).toHaveText('保存済み');
	page.on('dialog', async (dialog) => {
		await dialog.dismiss();
		throw new Error(dialog.message());
	});
	await leave(page).click();
	await expect(page).toHaveURL(/post-assist$/);
});

test('保存失敗と旧APIのメタデータ欠落では警告を解除しない', async ({ page }) => {
	let fail = true;
	const { requests } = await setup(page, async (route, draft) => {
		if (fail) await route.fulfill({ status: 403, json: { error: 'Forbidden' } });
		else {
			const { articleTitle, articleTags, ...legacy } = draft;
			await route.fulfill({ json: legacy });
		}
	});
	await title(page).fill('失われてはいけない');
	await expect(page.locator('.error')).toContainText('下書きを保存できませんでした');
	await expectWarning(page);
	fail = false;
	await manualSave(page);
	await expect.poll(() => requests.length).toBe(2);
	await expect(saved(page)).toHaveCount(0);
	await expect(page.locator('.error')).toContainText('下書きを保存できませんでした');
	await page.getByRole('button', { name: '下書き一覧を閉じる' }).click();
	await expectWarning(page);
	await page.waitForTimeout(1700);
	expect(requests).toHaveLength(2);
});

test('保存中に入力を変更したら、古い応答では警告を解除しない', async ({ page }) => {
	let release!: () => void;
	const gate = new Promise<void>((resolve) => {
		release = resolve;
	});
	const { requests } = await setup(page, async (route, draft) => {
		await gate;
		await route.fulfill({ json: draft });
	});
	await title(page).fill('最初');
	await expect.poll(() => requests.length).toBe(1);
	await title(page).fill('追加入力');
	await expectWarning(page);
	release();
	await expect(saved(page)).toHaveText('保存済み');
	expect(requests.at(-1)?.articleTitle).toBe('追加入力');
});

test('保存済みでもヘッダー画像が失われることを確認する', async ({ page }) => {
	await setup(page);
	await title(page).fill('画像付き');
	await page.locator('.article-meta input[type=file]').setInputFiles('static/nagi_icon.png');
	await expect(page.locator('.article-cover.has-image')).toBeVisible();
	await expect(saved(page)).toHaveText('保存済み');
	await expect(page.locator('.draft-image-note')).toContainText('画像は下書きに保存されません');
	await expectWarning(page, /画像は下書きに保存されていません/);
	const dialog = page.waitForEvent('dialog', { timeout: 5000 }).then(async (dialog) => {
		expect(dialog.type()).toBe('beforeunload');
		await dialog.dismiss();
	});
	await page.reload({ timeout: 3000 }).catch(() => {});
	await dialog;
});

test('アカウント切替後に古い保存応答が返っても保存済みにしない', async ({ page }) => {
	const releases: Array<() => void> = [];
	const { requests } = await setup(page, async (route, draft) => {
		await new Promise<void>((resolve) => releases.push(resolve));
		await route.fulfill({ json: draft });
	});
	await title(page).fill('アカウント切替前');
	await expect.poll(() => requests.length).toBe(1);
	await page.getByRole('button', { name: 'アカウントを切り替える' }).click();
	releases[0]();
	await expect.poll(() => requests.length).toBe(2);
	await expect(saved(page)).not.toHaveText('保存済み');
	await expectWarning(page);
	releases[1]();
	await expect(saved(page)).toHaveText('保存済み');
	expect(requests[1].id).not.toBe(requests[0].id);
});

test('旧下書きは空のタイトル・タグで復元し再保存する', async ({ page }) => {
	const { drafts } = await setup(page);
	const now = new Date().toISOString();
	drafts.set('legacy', {
		id: 'legacy',
		text: '旧本文',
		mentions: [],
		emojis: [],
		linkCards: [],
		dismissedUrls: [],
		createdAt: now,
		updatedAt: now,
	});
	await page.reload();
	await page.getByRole('button', { name: '下書き一覧', exact: true }).click();
	await page
		.locator('.draft-item')
		.filter({ hasText: '旧本文' })
		.getByRole('button', { name: '復元', exact: true })
		.click();
	await expect(title(page)).toHaveValue('');
	await expect(page.locator('.article-tag')).toHaveCount(0);
	await expect(page.locator('.blog-write .cm-content')).toHaveText('旧本文');
	await expect(saved(page)).toHaveText('保存済み');
});

test('新規公開の成功後は警告なく記事ページへ移動して下書きを片付ける', async ({ page }) => {
	const { drafts } = await setup(page);
	const did = 'did:plc:playwright-blog-writer';
	const cid = 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi';
	await page.route('**/xrpc/com.atproto.repo.listRecords**', (route) =>
		route.fulfill({ json: { records: [] } }),
	);
	await page.route('**/xrpc/com.atproto.repo.getRecord**', (route) =>
		route.fulfill({ status: 400, json: { error: 'RecordNotFound', message: 'RecordNotFound' } }),
	);
	await page.route('**/xrpc/com.atproto.repo.createRecord', (route) =>
		route.fulfill({ json: { uri: `at://${did}/site.standard.publication/self`, cid } }),
	);
	await page.route('**/xrpc/com.atproto.repo.putRecord', (route) =>
		route.fulfill({ json: { uri: `at://${did}/site.standard.document/published`, cid } }),
	);
	await title(page).fill('公開する');
	await page.locator('.blog-write .cm-content').fill('記事本文');
	await expect(saved(page)).toHaveText('保存済み');
	page.on('dialog', async (dialog) => {
		await dialog.dismiss();
		throw new Error(dialog.message());
	});
	await page
		.locator('.blog-write .composer-foot')
		.getByRole('button', { name: '投稿する', exact: true })
		.click();
	await expect(page).toHaveURL(/blog\/did:plc:playwright-blog-writer\/published$/);
	expect(drafts.size).toBe(0);
});

test('ブラウザの戻るも未保存なら確認し、保存後は確認しない', async ({ page }) => {
	let release!: () => void;
	const gate = new Promise<void>((resolve) => {
		release = resolve;
	});
	const { requests } = await setup(page, async (route, draft) => {
		await gate;
		await route.fulfill({ json: draft });
	});
	await page.getByRole('link', { name: '履歴を作る' }).click();
	await expect(page).toHaveURL(/blog-write\?history$/);
	await title(page).fill('戻るの確認');
	await expect.poll(() => requests.length).toBe(1);
	const message = page.waitForEvent('dialog').then(async (dialog) => {
		expect(dialog.message()).toContain('保存していない変更');
		await dialog.dismiss();
	});
	await page.goBack({ timeout: 2000 }).catch(() => {});
	await message;
	await expect(title(page)).toHaveValue('戻るの確認');
	release();
	await expect(saved(page)).toHaveText('保存済み');
	await page.goBack();
	await expect(page).toHaveURL(/blog-write$/);
});
