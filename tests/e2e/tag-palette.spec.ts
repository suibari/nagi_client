import { expect, test } from '@playwright/test';

const did = 'did:plc:playwright-tags';
const key = (prefix: string) => `${prefix}.${encodeURIComponent(did)}`;

test.beforeEach(async ({ page }) => {
	await page.addInitScript(
		({ favorites, recents }) => {
			localStorage.setItem('nagi-locale', 'ja');
			if (sessionStorage.getItem('seeded')) return;
			sessionStorage.setItem('seeded', '1');
			localStorage.setItem(
				favorites,
				JSON.stringify({ tags: ['diary'], updatedAt: '2026-11-01T00:00:00.000Z' }),
			);
			localStorage.setItem(recents, JSON.stringify(['nagi', 'diary', 'art']));
		},
		{ favorites: key('nagi:tag-favorites:v1'), recents: key('nagi:tag-recents:v1') },
	);
	// AppView は空で返す（設定同期も「サーバー未保存」になる）。
	await page.route('**/xrpc/**', (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				readPositions: [],
				emojiFavorites: [],
				feedTabs: [],
				drafts: [],
				items: [],
				folders: [],
				uris: [],
				actors: [],
				tags: [],
			}),
		}),
	);
	await page.goto('/dev/e2e/tags');
});

test('tag palette inserts tags and adds recent ones to favorites', async ({ page }) => {
	await page.getByRole('button', { name: 'Open composer' }).click();
	const input = page.getByRole('textbox', { name: '投稿内容' });
	await input.click();
	await page.keyboard.type('こんにちは');

	await page.locator('.post-modal').getByRole('button', { name: 'タグを挿入' }).click();
	const palette = page.getByRole('dialog', { name: '投稿に挿入するタグを選択' });
	await expect(palette).toBeVisible();
	await expect(palette.getByRole('button', { name: '#diary を投稿に挿入' })).toBeVisible();
	// お気に入り済みの diary は「最近使った」に重ねて出さない。
	await expect(palette.getByRole('button', { name: '#diary をお気に入りに追加' })).toHaveCount(0);

	await palette.getByRole('button', { name: '#nagi をお気に入りに追加' }).click();
	await expect(palette.getByRole('button', { name: '#nagi をお気に入りに追加' })).toHaveCount(0);
	const stored = await page.evaluate(
		(storageKey) => JSON.parse(localStorage.getItem(storageKey) ?? '{}').tags,
		key('nagi:tag-favorites:v1'),
	);
	expect(stored).toEqual(['diary', 'nagi']);

	await palette.getByRole('button', { name: '#art を投稿に挿入' }).click();
	await expect(palette).toBeHidden();
	await expect(input).toHaveText('こんにちは #art');
	await expect(input).toBeFocused();
	// 直後にそのまま打ち続けられる（後ろに空白を補っている）。
	await page.keyboard.type('x');
	await expect(input).toHaveText('こんにちは #art x');
});

test('right-clicking a hashtag opens the tag menu', async ({ page }) => {
	const link = page.locator('.post-text a.rich-tag', { hasText: '#Nagi' });
	await link.click({ button: 'right' });
	const menu = page.getByRole('menu', { name: '#nagi のメニュー' });
	await expect(menu).toBeVisible();
	await expect(menu.getByRole('menuitem', { name: 'このタグをミュート' })).toBeVisible();
	await expect(menu.getByRole('menuitem', { name: 'フィードのタブに追加' })).toBeVisible();

	await menu.getByRole('menuitem', { name: 'お気に入りに追加' }).click();
	await expect(menu).toBeHidden();
	await expect
		.poll(() =>
			page.evaluate(
				(storageKey) => JSON.parse(localStorage.getItem(storageKey) ?? '{}').tags,
				key('nagi:tag-favorites:v1'),
			),
		)
		.toEqual(['diary', 'nagi']);

	await link.click({ button: 'right' });
	await expect(menu.getByRole('menuitem', { name: 'お気に入りから外す' })).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(menu).toBeHidden();
	await expect(page).toHaveURL(/\/dev\/e2e\/tags$/);
});
