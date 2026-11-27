import { expect, test } from '@playwright/test';
import type { FeedItem } from '../../src/lib/api/types';

const author = { did: 'did:plc:thread-author', handle: 'author.example', displayName: '投稿者' };
const threadUrl = `/thread/${author.did}/root`;
const threadRequest = '**/xrpc/com.suibari.nagi.getThread?*';
const post: FeedItem = {
	uri: `at://${author.did}/com.suibari.nagi.post/root`,
	cid: 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi',
	author,
	text: '共有された投稿の本文',
	createdAt: '2026-11-01T00:00:00Z',
	indexedAt: '2026-11-01T00:00:00Z',
	reactions: [],
	isBot: false,
	isAffirmation: false,
};
const reply: FeedItem = {
	...post,
	uri: `at://${author.did}/com.suibari.nagi.post/reply`,
	cid: 'reply-cid',
	text: '会話の返信の本文',
	reply: { root: { uri: post.uri, cid: post.cid }, parent: { uri: post.uri, cid: post.cid } },
};

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.route('**/xrpc/**', (route) => {
		const { pathname, searchParams } = new URL(route.request().url());
		if (pathname.endsWith('/com.atproto.repo.getRecord')) {
			return route.fulfill({
				json: {
					uri: `at://${author.did}/${searchParams.get('collection')}/self`,
					cid: post.cid,
					value: { $type: searchParams.get('collection'), displayName: author.displayName },
				},
			});
		}
		return route.fulfill({
			json: { cards: [], drafts: [], folders: [], items: [], records: [], uris: [] },
		});
	});
});

test('opens the existing login and signup screen from a shared public thread', async ({ page }) => {
	const longText = 'ながい文字列'.repeat(40);
	const longReply = {
		...reply,
		text: `${reply.text}\nhttps://example.com/${'a'.repeat(240)}\n${longText}`,
	};
	await page.route(threadRequest, (route) =>
		route.fulfill({ json: { thread: { post, replies: [longReply] } } }),
	);
	await page.goto(threadUrl);

	const join = page.getByRole('link', { name: '参加する', exact: true });
	await expect(page.getByText(post.text)).toBeVisible();
	await expect(page.getByText(reply.text)).toBeVisible();
	await expect(
		page.locator('article.thread-unit + section').getByRole('link', { name: '参加する' }),
	).toBeVisible();
	await expect(join).toHaveCount(1);
	for (const width of [320, 375, 600]) {
		await page.setViewportSize({ width, height: 860 });
		await expect(join).toBeVisible();
		const overflow = await page
			.locator('html, .timeline, .thread-unit, .timeline > .hero')
			.evaluateAll((elements) =>
				elements.map((element) => element.scrollWidth - element.clientWidth),
			);
		expect(Math.max(...overflow)).toBeLessThanOrEqual(0);
	}
	await join.click();
	await expect(page).toHaveURL(/\/login$/);
	await expect(page.getByRole('button', { name: 'ログイン', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'アカウントを作ってはじめる' })).toBeVisible();
});

test('keeps the introduction hidden while restoring a signed-in session and afterwards', async ({
	page,
}) => {
	const restore = Promise.withResolvers<void>();
	await page.exposeFunction('finishOAuthRestore', () => restore.promise);
	// SDKの復元完了だけを遅らせて、アプリの起動と認証ストアは通常どおり動かす。
	await page.route('**/src/lib/oauth/client.ts*', async (route) => {
		const response = await route.fetch();
		await route.fulfill({
			response,
			body: `${await response.text()}
BrowserOAuthClient.prototype.init = async function () {
	await window.finishOAuthRestore();
	return { session: {
		did: ${JSON.stringify(author.did)},
		getTokenInfo: async () => ({ scope: 'atproto' }),
		fetchHandler: (path, init) => fetch(path, init),
	} };
};`,
		});
	});
	await page.route(threadRequest, (route) =>
		route.fulfill({ json: { thread: { post, replies: [reply] } } }),
	);
	await page.goto(threadUrl);

	const join = page.getByRole('link', { name: '参加する', exact: true });
	await expect(page.getByText(reply.text)).toBeVisible();
	await expect(page.locator('html')).toHaveAttribute('data-oauth-pending', '');
	await expect(join).toHaveCount(0);

	restore.resolve();
	await expect(page.locator('html')).not.toHaveAttribute('data-oauth-pending');
	await expect(join).toHaveCount(0);
	await page
		.locator('article.thread-unit')
		.getByRole('button', { name: '返信', exact: true })
		.first()
		.click();
	await expect(page.getByRole('dialog')).toBeVisible();
});

test('does not show the introduction while loading or after a lookup failure', async ({ page }) => {
	const load = Promise.withResolvers<void>();
	await page.route(threadRequest, async (route) => {
		await load.promise;
		await route.fulfill({ status: 404, json: { message: '投稿が見つかりません' } });
	});
	await page.goto(threadUrl);

	const join = page.getByRole('link', { name: '参加する', exact: true });
	await expect(page.getByRole('status', { name: '読み込み中…' })).toBeVisible();
	await expect(join).toHaveCount(0);
	load.resolve();
	await expect(page.getByText('投稿が見つかりません')).toBeVisible();
	await expect(join).toHaveCount(0);
});

for (const [state, flags] of [
	['こっそり', { threadKossori: true }],
	['旧形式のこっそり', { kossori: true }],
	['削除済み', { deleted: true }],
	['利用不可', { deleted: true, unavailableReason: 'processing-failed' }],
] as const satisfies ReadonlyArray<readonly [string, Partial<FeedItem>]>) {
	test(`does not show the introduction for a ${state} thread`, async ({ page }) => {
		await page.route(threadRequest, (route) =>
			route.fulfill({ json: { thread: { post: { ...post, ...flags }, replies: [] } } }),
		);
		await page.goto(threadUrl);

		await expect(page.locator('html')).not.toHaveAttribute('data-oauth-pending');
		await expect(page.locator('article.thread-unit')).toBeVisible();
		await expect(page.getByRole('link', { name: '参加する', exact: true })).toHaveCount(0);
	});
}
