import { expect, test, type Page } from '@playwright/test';

const CID = 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi';
const VIEWER = 'did:plc:interaction-viewer';
const post = {
	uri: 'at://did:plc:interaction-author/app.bsky.feed.post/root',
	cid: CID,
	author: { did: 'did:plc:interaction-author', handle: 'author.test', displayName: '投稿した人' },
	record: {
		$type: 'app.bsky.feed.post',
		text: 'いいねしてみる投稿',
		createdAt: '2026-11-21T00:00:00Z',
	},
	indexedAt: '2026-11-21T00:00:00Z',
	likeCount: 12,
	repostCount: 3,
	replyCount: 0,
};

type Write = { method: string; body: Record<string, unknown> };

async function signIn(page: Page, withInteractionScopes = true) {
	await page.evaluate(
		async ({ withInteractionScopes, viewer }) => {
			const sessionPath = '/src/lib/oauth/session.svelte.ts';
			const scopePath = '/src/lib/oauth/client.ts';
			const tabsPath = '/src/lib/feed-tabs/feed-tabs.svelte.ts';
			const { session } = await import(/* @vite-ignore */ sessionPath);
			const { BLUESKY_VIEW_SCOPES, BLUESKY_INTERACTION_SCOPES, CROSSPOST_SCOPE } = await import(
				/* @vite-ignore */ scopePath
			);
			const { feedTabs } = await import(/* @vite-ignore */ tabsPath);
			const tabs = [{ id: 'bsky-like', kind: 'bsky', source: 'following', label: 'Bluesky' }];
			localStorage.setItem(
				`nagi:feed-tabs:v1.${encodeURIComponent(viewer)}`,
				JSON.stringify({ tabs, updatedAt: '2026-11-21T00:00:00Z' }),
			);
			const scopes = withInteractionScopes
				? [CROSSPOST_SCOPE, ...BLUESKY_VIEW_SCOPES, ...BLUESKY_INTERACTION_SCOPES]
				: ['repo:app.bsky.feed.post?action=create', ...BLUESKY_VIEW_SCOPES];
			session.set({
				did: viewer,
				getTokenInfo: async () => ({ scope: ['atproto', ...scopes].join(' ') }),
				fetchHandler: (url: string, init?: RequestInit) => {
					const requestUrl = new URL(url, location.origin);
					return fetch(`${requestUrl.pathname}${requestUrl.search}`, init);
				},
			});
			feedTabs.tabs = tabs;
		},
		{ withInteractionScopes, viewer: VIEWER },
	);
}

let writes: Write[];
let failWrites: boolean;

test.beforeEach(async ({ page }) => {
	writes = [];
	failWrites = false;
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.route('**/xrpc/**', async (route) => {
		const method = new URL(route.request().url()).pathname.split('/').pop() ?? '';
		if (method === 'com.atproto.repo.createRecord' || method === 'com.atproto.repo.deleteRecord') {
			const body = route.request().postDataJSON() as Record<string, unknown>;
			if (body.collection !== 'com.suibari.nagi.actor.profile') {
				writes.push({ method, body });
				if (failWrites)
					return route.fulfill({ status: 500, json: { error: 'Internal', message: 'down' } });
				return route.fulfill({
					json:
						method === 'com.atproto.repo.createRecord'
							? { uri: `at://${VIEWER}/${body.collection}/created`, cid: CID }
							: {},
				});
			}
		}
		if (method === 'com.atproto.repo.getRecord')
			return route.fulfill({
				json: {
					uri: `at://${VIEWER}/com.suibari.nagi.actor.profile/self`,
					cid: CID,
					value: { displayName: 'テスト利用者' },
				},
			});
		if (method === 'app.bsky.actor.getPreferences')
			return route.fulfill({ json: { preferences: [] } });
		if (method === 'app.bsky.labeler.getServices') return route.fulfill({ json: { views: [] } });
		if (method === 'app.bsky.feed.getTimeline')
			return route.fulfill({ json: { feed: [{ post }] } });
		return route.fulfill({
			json: { items: [], cards: [], folders: [], uris: [], actors: [], count: 0, drafts: [] },
		});
	});
	await page.goto('/feed?tab=bsky-like');
	await expect(page.locator('.feed-tabs')).toBeVisible({ timeout: 20_000 });
});

const card = (page: Page) => page.locator('[data-bsky-uri]').first();

test('likes and unlikes a Bluesky post without showing any counts', async ({ page }) => {
	await signIn(page);
	await expect(card(page)).toContainText('いいねしてみる投稿');
	await expect(card(page)).not.toContainText('12');
	await expect(card(page)).not.toContainText('3');

	const like = card(page).getByRole('button', { name: 'いいね', exact: true });
	await like.click();
	const liked = card(page).getByRole('button', { name: 'いいね済み' });
	await expect(liked).toHaveAttribute('aria-pressed', 'true');
	await expect.poll(() => writes.length).toBe(1);
	expect(writes[0].method).toBe('com.atproto.repo.createRecord');
	expect(writes[0].body.collection).toBe('app.bsky.feed.like');
	expect((writes[0].body.record as { subject: unknown }).subject).toEqual({
		uri: post.uri,
		cid: CID,
	});

	await liked.click();
	await expect(card(page).getByRole('button', { name: 'いいね', exact: true })).toHaveAttribute(
		'aria-pressed',
		'false',
	);
	await expect.poll(() => writes.length).toBe(2);
	expect(writes[1]).toMatchObject({
		method: 'com.atproto.repo.deleteRecord',
		body: { collection: 'app.bsky.feed.like', rkey: 'created' },
	});
});

test('reposts and rolls back with a message when the write fails', async ({ page }) => {
	await signIn(page);
	failWrites = true;
	await card(page).getByRole('button', { name: 'リポスト', exact: true }).click();
	await expect(card(page).getByRole('status')).toContainText('操作できませんでした');
	await expect(card(page).getByRole('button', { name: 'リポスト', exact: true })).toHaveAttribute(
		'aria-pressed',
		'false',
	);
	expect(writes.map((write) => write.body.collection)).toEqual(['app.bsky.feed.repost']);
});

test('asks sessions without interaction permission to reauthorize instead of writing', async ({
	page,
}) => {
	await signIn(page, false);
	await expect(card(page)).toContainText('いいねしてみる投稿');
	await card(page).getByRole('button', { name: 'いいね', exact: true }).click();
	const dialog = page.getByRole('dialog', { name: 'Blueskyで操作するための権限' });
	await expect(dialog).toBeVisible();
	await expect(card(page).getByRole('button', { name: 'いいね', exact: true })).toHaveAttribute(
		'aria-pressed',
		'false',
	);
	await dialog.getByRole('button', { name: 'キャンセル' }).click();
	await expect(dialog).toHaveCount(0);
	expect(writes).toEqual([]);
});
