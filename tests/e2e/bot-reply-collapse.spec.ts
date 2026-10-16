import { expect, test } from '@playwright/test';

const root = {
	uri: 'at://did:plc:collapse/com.suibari.nagi.post/other-root',
	cid: 'other-root',
	author: { did: 'did:plc:collapse-other', handle: 'other.example' },
	text: 'other-root',
	createdAt: '2026-10-01T00:00:00Z',
	indexedAt: '2026-10-01T00:00:00Z',
	reactions: [],
	isBot: false,
	isAffirmation: false,
};
const ref = { uri: root.uri, cid: root.cid };
const bot = {
	...root,
	uri: 'at://did:plc:collapse/com.suibari.nagi.post/direct-bot',
	cid: 'direct-bot',
	isBot: true,
	author: { did: 'did:plc:collapse-bot', handle: 'bot.example' },
	text: 'direct-bot',
	reply: { root: ref, parent: ref },
};

test('only eligible bot replies collapse; expansion survives refresh and human replies restore context', async ({
	page,
}) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	let threadRequests = 0;
	await page.route('**/xrpc/**', async (route) => {
		const method = new URL(route.request().url()).pathname.split('/').pop();
		if (method === 'com.suibari.nagi.getThread') {
			threadRequests++;
			return route.fulfill({ json: { thread: { post: root, replies: [bot] } } });
		}
		return route.fulfill({
			json: { items: [], cards: [], folders: [], uris: [], actors: [], count: 0, drafts: [] },
		});
	});
	await page.goto('/dev/e2e/bot-reply-collapse');
	const group = page.getByTestId('group');
	const legacy = page.getByTestId('legacy');
	await expect(group.getByRole('button', { name: '返信を表示', exact: true })).toBeVisible();
	await expect(group.getByText('direct-bot', { exact: true })).toHaveCount(0);
	await expect(legacy.getByRole('button', { name: '返信を表示', exact: true })).toBeVisible();
	await expect(
		page.getByTestId('legacy-duplicate').getByRole('button', { name: '返信を表示', exact: true }),
	).toBeVisible();
	expect(threadRequests).toBe(1);
	await expect(page.getByTestId('own').getByText('own-bot', { exact: true })).toBeVisible();
	await expect(page.getByTestId('bot-root').getByText('bot-root', { exact: true })).toBeVisible();
	await expect(
		page.getByTestId('bot-root').getByText('bot-root-human', { exact: true }),
	).toBeVisible();
	await expect(page.getByTestId('human').getByText('direct-bot', { exact: true })).toBeVisible();
	await group.getByRole('button', { name: '返信を表示', exact: true }).click();
	await expect(group.getByText('direct-bot', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: '一覧を更新', exact: true }).click();
	await expect(group.getByText('direct-bot', { exact: true })).toBeVisible();
	await group.getByRole('button', { name: '返信を隠す', exact: true }).click();
	await expect(group.getByText('direct-bot', { exact: true })).toHaveCount(0);
	await page.getByRole('button', { name: 'ユーザー返信を追加', exact: true }).click();
	await expect(group.getByText('direct-bot', { exact: true })).toBeVisible();
	await expect(group.getByText('human-reply', { exact: true })).toBeVisible();
	await expect(group.locator('.thread-reply-toggle-btn')).toHaveCount(0);
	await page.getByRole('button', { name: 'テスト用ログアウト', exact: true }).click();
	await expect(
		page.getByTestId('own').getByRole('button', { name: '返信を表示', exact: true }),
	).toBeVisible();
});

test('unknown reply status remains visible when the thread check fails', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.route('**/xrpc/**', (route) => {
		if (route.request().url().includes('com.suibari.nagi.getThread'))
			return route.fulfill({ status: 503, body: '{}' });
		return route.fulfill({
			json: { items: [], cards: [], folders: [], uris: [], actors: [], count: 0, drafts: [] },
		});
	});
	const response = page.waitForResponse((response) =>
		response.url().includes('com.suibari.nagi.getThread'),
	);
	await page.goto('/dev/e2e/bot-reply-collapse');
	await response;
	const legacy = page.getByTestId('legacy');
	await expect(legacy.getByText('direct-bot', { exact: true })).toBeVisible();
	await expect(legacy.locator('.thread-reply-toggle-btn')).toHaveCount(0);
});

test('a human reply found by the thread check keeps the bot visible after refresh', async ({
	page,
}) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	let includeHuman = false;
	await page.route('**/xrpc/**', (route) => {
		if (route.request().url().includes('com.suibari.nagi.getThread')) {
			const human = {
				...root,
				uri: `${root.uri}-human`,
				cid: 'human',
				text: 'remote-human',
				reply: { root: ref, parent: { uri: bot.uri, cid: bot.cid } },
			};
			return route.fulfill({
				json: { thread: { post: root, replies: includeHuman ? [bot, human] : [bot] } },
			});
		}
		return route.fulfill({
			json: { items: [], cards: [], folders: [], uris: [], actors: [], count: 0, drafts: [] },
		});
	});
	await page.goto('/dev/e2e/bot-reply-collapse');
	const legacy = page.getByTestId('legacy');
	await expect(legacy.getByRole('button', { name: '返信を表示', exact: true })).toBeVisible();
	includeHuman = true;
	const response = page.waitForResponse((response) =>
		response.url().includes('com.suibari.nagi.getThread'),
	);
	await page.getByRole('button', { name: '一覧を更新', exact: true }).click();
	await response;
	await expect(legacy.getByText('direct-bot', { exact: true })).toBeVisible();
	await expect(legacy.locator('.thread-reply-toggle-btn')).toHaveCount(0);
});
