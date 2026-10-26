import { expect, test, type Page } from '@playwright/test';

const uri = (id: string) => `at://did:plc:thread-test/app.bsky.feed.post/${id}`;
const post = (id: string, parent?: string) => ({
	uri: uri(id),
	cid: 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi',
	author: { did: 'did:plc:thread-test', handle: 'thread.test', displayName: '会話の人' },
	record: {
		$type: 'app.bsky.feed.post',
		text: id === 'root' ? 'フィードには先頭ポストだけ' : `追加取得した返信 ${id}`,
		createdAt: `2026-10-26T00:00:0${id === 'root' ? 0 : id}Z`,
		...(parent
			? {
					reply: {
						root: {
							uri: uri('root'),
							cid: 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi',
						},
						parent: {
							uri: uri(parent),
							cid: 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi',
						},
					},
				}
			: {}),
	},
	indexedAt: '2026-10-26T00:00:00Z',
	replyCount: id === 'root' ? 4 : 0,
});
const thread = {
	$type: 'app.bsky.feed.defs#threadViewPost',
	post: post('root'),
	replies: ['1', '2', '3', '4'].map((id) => ({
		$type: 'app.bsky.feed.defs#threadViewPost',
		post: post(id, 'root'),
		replies: [],
	})),
};

async function signIn(page: Page, oldScopes = false) {
	await page.evaluate(async (oldScopes) => {
		const sessionPath = '/src/lib/oauth/session.svelte.ts';
		const scopePath = '/src/lib/oauth/client.ts';
		const tabsPath = '/src/lib/feed-tabs/feed-tabs.svelte.ts';
		const { session } = await import(/* @vite-ignore */ sessionPath);
		const { BLUESKY_VIEW_SCOPES } = await import(/* @vite-ignore */ scopePath);
		const { feedTabs } = await import(/* @vite-ignore */ tabsPath);
		const tabs = [{ id: 'bsky-thread', kind: 'bsky', source: 'following', label: 'Bluesky' }];
		localStorage.setItem(
			'nagi:feed-tabs:v1.did%3Aplc%3Athread-viewer',
			JSON.stringify({ tabs, updatedAt: '2026-10-26T00:00:00Z' }),
		);
		const scopes = oldScopes
			? BLUESKY_VIEW_SCOPES.filter(
					(scope: string) => !scope.startsWith('rpc:app.bsky.feed.getPostThread'),
				)
			: BLUESKY_VIEW_SCOPES;
		session.set({
			did: 'did:plc:thread-viewer',
			getTokenInfo: async () => ({ scope: ['atproto', ...scopes].join(' ') }),
			fetchHandler: (url: string, init?: RequestInit) => {
				const requestUrl = new URL(url, location.origin);
				return fetch(`${requestUrl.pathname}${requestUrl.search}`, init);
			},
		});
		feedTabs.tabs = tabs;
	}, oldScopes);
}

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.route('**/xrpc/**', async (route) => {
		const method = new URL(route.request().url()).pathname.split('/').pop();
		if (method === 'com.atproto.repo.getRecord')
			return route.fulfill({
				json: {
					uri: 'at://did:plc:thread-viewer/com.suibari.nagi.actor.profile/self',
					cid: post('root').cid,
					value: { displayName: 'テスト利用者' },
				},
			});
		if (method === 'app.bsky.actor.getPreferences')
			return route.fulfill({ json: { preferences: [] } });
		if (method === 'app.bsky.labeler.getServices') return route.fulfill({ json: { views: [] } });
		if (method === 'app.bsky.feed.getTimeline')
			return route.fulfill({ json: { feed: [{ post: post('root') }] } });
		if (method === 'app.bsky.feed.getPostThread') return route.fulfill({ json: { thread } });
		return route.fulfill({
			json: {
				items: [],
				cards: [],
				folders: [],
				uris: [],
				actors: [],
				members: [],
				count: 0,
				drafts: [],
			},
		});
	});
	await page.goto('/feed?tab=bsky-thread');
	await expect(page.locator('.feed-tabs')).toBeVisible({ timeout: 20_000 });
});

test('fetches missing replies from the authenticated thread API when the feed only supplies a root', async ({
	page,
}) => {
	let requests = 0;
	page.on('request', (request) => {
		if (request.url().includes('app.bsky.feed.getPostThread')) requests++;
	});
	await signIn(page);
	await expect(page.getByText('フィードには先頭ポストだけ', { exact: true })).toBeVisible();
	await expect(page.getByText('追加取得した返信 4', { exact: true })).toBeVisible();
	await expect(page.locator('[data-bsky-thread] .post-row')).toHaveCount(4);
	await expect(page.getByText('追加取得した返信 1', { exact: true })).toHaveCount(0);
	await expect(page.locator('.thread-gap')).toContainText('1');
	expect(requests).toBe(1);
});

test('keeps the root on failure and retries fetching replies', async ({ page }) => {
	let attempts = 0;
	await page.route('**/xrpc/app.bsky.feed.getPostThread*', (route) => {
		attempts++;
		return attempts === 1
			? route.fulfill({ status: 503, json: { error: 'Unavailable', message: 'offline' } })
			: route.fulfill({ json: { thread } });
	});
	await signIn(page);
	await expect(page.getByText('返信を読み込めませんでした')).toBeVisible();
	await expect(page.getByText('フィードには先頭ポストだけ', { exact: true })).toBeVisible();
	await page.locator('[data-bsky-thread]').getByRole('button', { name: 'もう一度' }).click();
	await expect(page.getByText('追加取得した返信 4', { exact: true })).toBeVisible();
	expect(attempts).toBe(2);
});

test('asks old sessions to grant the missing thread permission before fetching', async ({
	page,
}) => {
	await signIn(page, true);
	await expect(page.locator('.bsky-permission')).toBeVisible();
	await expect(page.locator('[data-bsky-thread]')).toHaveCount(0);
});

test('refreshes replies on the next poll without requiring reply items in the feed', async ({
	page,
}) => {
	await page.clock.install();
	await signIn(page);
	await expect(page.getByText('追加取得した返信 4', { exact: true })).toBeVisible();
	await page.route('**/xrpc/app.bsky.feed.getPostThread*', (route) =>
		route.fulfill({
			json: {
				thread: {
					...thread,
					replies: [
						...thread.replies,
						{ $type: 'app.bsky.feed.defs#threadViewPost', post: post('5', 'root'), replies: [] },
					],
				},
			},
		}),
	);
	await page.clock.fastForward(30_000);
	await expect(page.getByText('追加取得した返信 5', { exact: true })).toBeVisible();
	await expect(page.getByText('追加取得した返信 2', { exact: true })).toHaveCount(0);
	await expect(page.locator('.thread-gap')).toContainText('2');
});

test('does not request threads for posts explicitly reporting zero replies', async ({ page }) => {
	let requests = 0;
	page.on('request', (request) => {
		if (request.url().includes('app.bsky.feed.getPostThread')) requests++;
	});
	await page.route('**/xrpc/app.bsky.feed.getTimeline*', (route) =>
		route.fulfill({ json: { feed: [{ post: { ...post('root'), replyCount: 0 } }] } }),
	);
	await signIn(page);
	await expect(page.getByText('フィードには先頭ポストだけ', { exact: true })).toBeVisible();
	await expect(page.locator('[data-bsky-thread] .post-row')).toHaveCount(1);
	expect(requests).toBe(0);
});
