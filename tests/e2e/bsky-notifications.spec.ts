import { expect, test, type Page } from '@playwright/test';

const VIEWER = 'did:plc:notifications-viewer';
const CID = 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi';
const mine = `at://${VIEWER}/app.bsky.feed.post/mine`;
const actor = (name: string) => ({
	did: `did:plc:${name}`,
	handle: `${name}.test`,
	displayName: `${name}さん`,
});
const post = (uri: string, did: string, text: string, labels: unknown[] = []) => ({
	uri,
	cid: CID,
	author: did === VIEWER ? { did, handle: 'me.test' } : actor(did.slice('did:plc:'.length)),
	record: { $type: 'app.bsky.feed.post', text, createdAt: '2026-11-21T00:00:00.000Z' },
	indexedAt: '2026-11-21T00:00:00.000Z',
	likeCount: 3,
	labels,
});
const reply = 'at://did:plc:dave/app.bsky.feed.post/reply';
const adult = 'at://did:plc:erin/app.bsky.feed.post/adult';
type Seed = { reason: string; name: string; uri: string; subject?: string; at: string };
const seeds: Seed[] = [
	{ reason: 'mention', name: 'erin', uri: adult, at: '2026-11-21T00:06:00.000Z' },
	{ reason: 'reply', name: 'dave', uri: reply, at: '2026-11-21T00:05:00.000Z' },
	...['alice', 'bob', 'carol'].map((name, index) => ({
		reason: 'like',
		name,
		uri: `at://did:plc:${name}/app.bsky.feed.like/${name}`,
		subject: mine,
		at: `2026-11-21T00:0${3 - index}:00.000Z`,
	})),
	{
		reason: 'like-via-repost',
		name: 'frank',
		uri: 'at://did:plc:frank/app.bsky.feed.like/frank',
		at: '2026-11-20T00:00:00.000Z',
	},
];
const notifications = seeds.map((item) => ({
	uri: item.uri,
	cid: CID,
	author: actor(item.name),
	reason: item.reason,
	...(item.subject ? { reasonSubject: item.subject } : {}),
	record: {},
	indexedAt: item.at,
}));

type Calls = {
	bskySeen: string[];
	nagiSeen: number;
	failList: boolean;
	unread: string[];
	lastSeen?: string;
};

async function setup(page: Page, opts: { tab?: 'bluesky'; unread?: string[] } = {}) {
	const calls: Calls = {
		bskySeen: [],
		nagiSeen: 0,
		failList: false,
		unread: opts.unread ?? ['reply'],
	};
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.route('**/xrpc/**', async (route) => {
		const url = new URL(route.request().url());
		const method = url.pathname.split('/').pop();
		switch (method) {
			case 'com.suibari.nagi.getNotifications':
				return route.fulfill({
					json: {
						items: [
							{
								id: 'n1',
								type: 'reply',
								actor: actor('nagi-friend'),
								createdAt: '2026-11-21T00:00:00.000Z',
								subjectUri: `at://${VIEWER}/com.suibari.nagi.post/mine`,
								reasonUri: 'at://did:plc:nagi-friend/com.suibari.nagi.post/1',
								post: {
									uri: 'at://did:plc:nagi-friend/com.suibari.nagi.post/1',
									cid: CID,
									author: actor('nagi-friend'),
									text: 'Nagiの返信',
									createdAt: '2026-11-21T00:00:00.000Z',
									indexedAt: '2026-11-21T00:00:00.000Z',
									reactions: [],
								},
							},
						],
					},
				});
			case 'com.suibari.nagi.updateSeen':
				calls.nagiSeen++;
				return route.fulfill({ json: {} });
			case 'app.bsky.notification.listNotifications':
				if (calls.failList)
					return route.fulfill({ status: 503, json: { error: 'Unavailable', message: 'down' } });
				return route.fulfill({
					json: {
						notifications: notifications.map((item) => ({
							...item,
							// Bluesky AppView と同じく、記録した seenAt より厳密に前の通知だけ既読になる。
							isRead:
								!calls.unread.includes(item.reason) ||
								(calls.lastSeen !== undefined && calls.lastSeen > item.indexedAt),
						})),
					},
				});
			case 'app.bsky.notification.getUnreadCount':
				return route.fulfill({ json: { count: 2 } });
			case 'app.bsky.notification.updateSeen': {
				const seenAt: string = route.request().postDataJSON().seenAt;
				calls.bskySeen.push(seenAt);
				if (!calls.lastSeen || seenAt > calls.lastSeen) calls.lastSeen = seenAt;
				return route.fulfill({ json: {} });
			}
			case 'app.bsky.feed.getPosts':
				return route.fulfill({
					json: {
						posts: [
							post(mine, VIEWER, 'わたしの散歩の投稿'),
							post(reply, 'did:plc:dave', '素敵ですね'),
							post(adult, 'did:plc:erin', '成人向けの内容', [
								{ src: 'did:plc:erin', uri: adult, val: 'porn', cts: '2026-11-21T00:00:00.000Z' },
							]),
						],
					},
				});
			case 'app.bsky.feed.getPostThread':
				return route.fulfill({
					json: {
						thread: {
							$type: 'app.bsky.feed.defs#threadViewPost',
							post: post(reply, 'did:plc:dave', '素敵ですね'),
							replies: [],
						},
					},
				});
			case 'app.bsky.actor.getPreferences':
				return route.fulfill({ json: { preferences: [] } });
			case 'app.bsky.actor.putPreferences':
				return route.fulfill({ status: 403, json: { error: 'Forbidden' } });
			case 'app.bsky.labeler.getServices':
				return route.fulfill({ json: { views: [] } });
			default:
				return route.fulfill({ json: { items: [], count: 0 } });
		}
	});
	await page.goto(`/dev/e2e/notifications?bluesky${opts.tab ? `&tab=${opts.tab}` : ''}`);
	return calls;
}

test('separates Bluesky notifications into their own tab, opening on Nagi', async ({ page }) => {
	const calls = await setup(page);
	const tabs = page.getByRole('tablist', { name: '通知の種類' });
	await expect(tabs.getByRole('tab', { name: 'Nagi' })).toHaveAttribute('aria-selected', 'true');
	await expect(page.getByText('Nagiの返信')).toBeVisible();
	await expect(tabs.getByRole('img', { name: 'Blueskyに未読の通知があります' })).toBeVisible();
	expect(calls.bskySeen).toEqual([]);
	await expect.poll(() => calls.nagiSeen).toBeGreaterThan(0);
});

test('clears the Bluesky badge on return when only excluded notifications are unread', async ({
	page,
}) => {
	await page.clock.install();
	const calls = await setup(page);
	const badge = page.getByRole('img', { name: 'Blueskyに未読の通知があります' });
	await expect(badge).toBeVisible();

	// Bluesky側で返信を既読にしたあと、非表示の通知だけが未読。
	calls.unread = ['mention', 'like-via-repost'];
	await page.clock.fastForward(1_100);
	await page.evaluate(() => window.dispatchEvent(new Event('focus')));
	await expect(badge).toHaveCount(0);
	expect(calls.bskySeen).toEqual([]);
});

test('lists each like on its own, without counts, and marks Bluesky as seen', async ({ page }) => {
	const calls = await setup(page, { tab: 'bluesky' });
	const list = page.locator('.timeline:not([hidden])');
	await expect(list.getByText('aliceさんさんがいいねしました')).toBeVisible();
	await expect(list.getByText('bobさんさんがいいねしました')).toBeVisible();
	await expect(list.getByText('carolさんさんがいいねしました')).toBeVisible();
	await expect(list).not.toContainText('ほか');
	await expect(list).not.toContainText('3');
	await expect(list).not.toContainText('frank');
	await expect(list.getByText('わたしの散歩の投稿').first()).toBeVisible();
	await expect.poll(() => calls.bskySeen).toEqual(['2026-11-21T00:05:00.001Z']);
	expect(calls.nagiSeen).toBe(0);
});

test('clears the Bluesky badge after viewing the Bluesky tab and returning', async ({ page }) => {
	const calls = await setup(page);
	const tabs = page.getByRole('tablist', { name: '通知の種類' });
	const badge = tabs.getByRole('img', { name: 'Blueskyに未読の通知があります' });
	await expect(badge).toBeVisible();

	await tabs.getByRole('tab', { name: 'Bluesky' }).click();
	await expect(page.getByText('daveさんさんが返信しました')).toBeVisible();
	await expect.poll(() => calls.bskySeen.length).toBeGreaterThan(0);

	await tabs.getByRole('tab', { name: 'Nagi' }).click();
	await expect(page.getByText('Nagiの返信')).toBeVisible();
	await expect(badge).toHaveCount(0);
});

test('hides adult content from people not confirmed as adults', async ({ page }) => {
	await setup(page, { tab: 'bluesky' });
	const list = page.locator('.timeline:not([hidden])');
	await expect(list.getByText('daveさんさんが返信しました')).toBeVisible();
	await expect(list).not.toContainText('成人向けの内容');
	await expect(list).not.toContainText('erinさん');
});

test('opens the conversation of a reply in place', async ({ page }) => {
	await setup(page, { tab: 'bluesky' });
	const row = page.getByRole('button', { name: /daveさんさんが返信しました/ });
	await row.click();
	await expect(row).toHaveAttribute('aria-expanded', 'true');
	await expect(page.locator('[data-bsky-thread] [data-bsky-uri]').first()).toContainText(
		'素敵ですね',
	);
});

test('does not show the Bluesky tab to people who have not linked Bluesky', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.route('**/xrpc/**', (route) => route.fulfill({ json: { items: [], count: 0 } }));
	await page.goto('/dev/e2e/notifications');
	await expect(page.getByText('まだ通知はありません。')).toBeVisible();
	await expect(page.getByRole('tablist')).toHaveCount(0);
});

test('keeps the Bluesky list and the Nagi tab when reloading Bluesky fails', async ({ page }) => {
	const calls = await setup(page, { tab: 'bluesky' });
	const tabs = page.getByRole('tablist', { name: '通知の種類' });
	await expect(page.getByText('aliceさんさんがいいねしました')).toBeVisible();
	calls.failList = true;
	await tabs.getByRole('tab', { name: 'Nagi' }).click();
	await expect(page.getByText('Nagiの返信')).toBeVisible();
	await tabs.getByRole('tab', { name: 'Bluesky' }).click();
	await expect(page.getByText('aliceさんさんがいいねしました')).toBeVisible();
	await expect(page.getByText('通知を取得できません')).toHaveCount(0);
});
