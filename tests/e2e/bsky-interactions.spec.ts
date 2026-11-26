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
let timeline: unknown[];
let threadMissing: boolean;
let otherRequests: string[];
let procedures: { method: string; body: unknown; proxy: string | null }[];
let nagiThreadRequests: string[];
let nagiThread: unknown;

test.beforeEach(async ({ page }) => {
	writes = [];
	failWrites = false;
	timeline = [{ post }];
	threadMissing = false;
	otherRequests = [];
	procedures = [];
	nagiThreadRequests = [];
	nagiThread = undefined;
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
		if (method === 'app.bsky.feed.getTimeline') return route.fulfill({ json: { feed: timeline } });
		if (method === 'com.suibari.nagi.getThread') {
			nagiThreadRequests.push(new URL(route.request().url()).searchParams.get('uri') ?? '');
			if (!nagiThread)
				return route.fulfill({ status: 404, json: { error: 'NotFound', message: 'gone' } });
			return route.fulfill({ json: { thread: { post: nagiThread, replies: [] } } });
		}
		if (method === 'app.bsky.feed.getPostThread') {
			const uri = new URL(route.request().url()).searchParams.get('uri');
			return route.fulfill({
				json: {
					thread: threadMissing
						? { $type: 'app.bsky.feed.defs#notFoundPost', uri, notFound: true }
						: { $type: 'app.bsky.feed.defs#threadViewPost', post, replies: [] },
				},
			});
		}
		otherRequests.push(method);
		if (route.request().method() === 'POST')
			procedures.push({
				method,
				body: route.request().postDataJSON(),
				proxy: route.request().headers()['atproto-proxy'] ?? null,
			});
		if (method === 'com.atproto.moderation.createReport')
			return route.fulfill({
				json: {
					id: 1,
					reasonType: 'com.atproto.moderation.defs#reasonSpam',
					subject: { $type: 'com.atproto.repo.strongRef', uri: post.uri, cid: CID },
					reportedBy: VIEWER,
					createdAt: '2026-11-21T00:00:00.000Z',
				},
			});
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
	// Nagi と同じくアイコンだけで、ラベルの文字をタイムラインに出さない。
	await expect(card(page).locator('.bsky-actions')).toHaveText('');
	await expect(card(page)).not.toContainText('Blueskyで開く');

	const like = card(page).getByRole('button', { name: 'いいね', exact: true });
	await like.click();
	const liked = card(page).getByRole('button', { name: 'いいねを取り消す' });
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

const editor = (page: Page, name: string) =>
	page.getByRole('dialog').getByRole('textbox', { name });

test('replies to a Bluesky post only on Bluesky, without a Nagi post or draft', async ({
	page,
}) => {
	await signIn(page);
	await card(page).getByRole('button', { name: 'Blueskyへ返信' }).click();
	const dialog = page.getByRole('dialog', { name: 'Blueskyへ返信' });
	await expect(dialog).toBeVisible();
	await expect(dialog).toContainText('Blueskyにだけ投稿します');
	await expect(dialog).not.toContainText('こっそり');
	await editor(page, 'Blueskyへ返信').click();
	await page.keyboard.type('Nagiから返信します');
	await dialog.getByRole('button', { name: 'Blueskyへ投稿' }).last().click();
	await expect(page.getByRole('status').filter({ hasText: 'Blueskyへ投稿しました' })).toBeVisible();
	await expect(dialog).toHaveCount(0);

	expect(writes).toHaveLength(1);
	const record = writes[0].body.record as Record<string, unknown>;
	expect(writes[0].body.collection).toBe('app.bsky.feed.post');
	expect(record.text).toBe('Nagiから返信します');
	expect(record.via).toBe('Nagi');
	expect(record.reply).toEqual({
		root: { uri: post.uri, cid: CID },
		parent: { uri: post.uri, cid: CID },
	});
	expect(otherRequests.filter((method) => /putDraft|createPost/.test(method))).toEqual([]);
});

test('quotes a Bluesky post as a Bluesky quote', async ({ page }) => {
	await signIn(page);
	await card(page).getByRole('button', { name: 'Blueskyで引用' }).click();
	const dialog = page.getByRole('dialog', { name: 'Blueskyで引用' });
	await editor(page, 'Blueskyで引用').click();
	await page.keyboard.type('これいい');
	await dialog.getByRole('button', { name: 'Blueskyへ投稿' }).last().click();
	await expect.poll(() => writes.length).toBe(1);
	expect((writes[0].body.record as { embed: unknown }).embed).toEqual({
		$type: 'app.bsky.embed.record',
		record: { uri: post.uri, cid: CID },
	});
});

test('keeps the text and stops when the post being replied to is gone', async ({ page }) => {
	await signIn(page);
	threadMissing = true;
	await card(page).getByRole('button', { name: 'Blueskyへ返信' }).click();
	const dialog = page.getByRole('dialog', { name: 'Blueskyへ返信' });
	await editor(page, 'Blueskyへ返信').click();
	await page.keyboard.type('届くかな');
	await dialog.getByRole('button', { name: 'Blueskyへ投稿' }).last().click();
	await expect(dialog.getByRole('alert')).toContainText('相手の投稿が見つかりません');
	await expect(editor(page, 'Blueskyへ返信')).toContainText('届くかな');
	expect(writes).toEqual([]);
});

test('asks before discarding an unsent Bluesky reply', async ({ page }) => {
	await signIn(page);
	await card(page).getByRole('button', { name: 'Blueskyへ返信' }).click();
	const dialog = page.getByRole('dialog', { name: 'Blueskyへ返信' });
	await editor(page, 'Blueskyへ返信').click();
	await page.keyboard.type('書きかけ');
	await dialog.getByRole('button', { name: '閉じる' }).click();
	const confirm = page.getByRole('dialog', { name: '書きかけを破棄しますか？' });
	await confirm.getByRole('button', { name: 'キャンセル' }).click();
	await expect(editor(page, 'Blueskyへ返信')).toContainText('書きかけ');
	await dialog.getByRole('button', { name: '閉じる' }).click();
	await confirm.getByRole('button', { name: '破棄する' }).click();
	await expect(dialog).toHaveCount(0);
	await card(page).getByRole('button', { name: 'Blueskyへ返信' }).click();
	await expect(editor(page, 'Blueskyへ返信')).not.toContainText('書きかけ');
});

test('deletes only my own Bluesky posts made through Nagi', async ({ page }) => {
	const mine = (rkey: string, via?: string) => ({
		post: {
			...post,
			uri: `at://${VIEWER}/app.bsky.feed.post/${rkey}`,
			author: { did: VIEWER, handle: 'me.test', displayName: '自分' },
			record: { ...post.record, text: `自分の投稿 ${rkey}`, ...(via ? { via } : {}) },
		},
	});
	timeline = [mine('nagi', 'Nagi'), mine('app')];
	await signIn(page);
	const nagiCard = page.locator(`[data-bsky-uri="at://${VIEWER}/app.bsky.feed.post/nagi"]`);
	const appCard = page.locator(`[data-bsky-uri="at://${VIEWER}/app.bsky.feed.post/app"]`);
	await expect(appCard).toBeVisible();
	await appCard.getByRole('button', { name: 'その他の投稿操作' }).click();
	await expect(page.getByRole('menuitem', { name: 'Blueskyで開く' })).toBeVisible();
	await expect(page.getByRole('menuitem', { name: '削除' })).toHaveCount(0);
	await page.keyboard.press('Escape');
	await nagiCard.getByRole('button', { name: 'その他の投稿操作' }).click();
	await page.getByRole('menuitem', { name: '削除' }).click();
	const confirm = page.getByRole('dialog', { name: 'Blueskyの投稿を削除' });
	await confirm.getByRole('button', { name: '削除する' }).click();
	await expect(nagiCard).toHaveCount(0);
	expect(writes).toEqual([
		{
			method: 'com.atproto.repo.deleteRecord',
			body: expect.objectContaining({ collection: 'app.bsky.feed.post', rkey: 'nagi' }),
		},
	]);
});

const openMenu = async (page: Page, target = card(page)) => {
	await target.getByRole('button', { name: 'その他の投稿操作' }).click();
};

test('mutes an author on Bluesky and hides their posts here', async ({ page }) => {
	await signIn(page);
	await openMenu(page);
	await page.getByRole('menuitem', { name: '@author.testをミュート' }).click();
	await expect(page.locator(`[data-bsky-uri="${post.uri}"]`)).toHaveCount(0);
	expect(procedures).toContainEqual(
		expect.objectContaining({
			method: 'app.bsky.graph.muteActor',
			body: { actor: 'did:plc:interaction-author' },
		}),
	);
});

test('mutes a thread and bookmarks a post on Bluesky', async ({ page }) => {
	await signIn(page);
	await openMenu(page);
	await page.getByRole('menuitem', { name: 'このスレッドをミュート' }).click();
	await openMenu(page);
	await page.getByRole('menuitem', { name: 'ブックマーク', exact: true }).click();
	await openMenu(page);
	await expect(page.getByRole('menuitem', { name: 'スレッドのミュートを解除' })).toBeVisible();
	await expect(page.getByRole('menuitem', { name: 'ブックマークを解除' })).toBeVisible();
	expect(
		procedures
			.filter((call) => /muteThread|Bookmark/.test(call.method))
			.map((call) => [call.method, call.body]),
	).toEqual([
		['app.bsky.graph.muteThread', { root: post.uri }],
		['app.bsky.bookmark.createBookmark', { uri: post.uri, cid: CID }],
	]);
});

test('reports a post to Bluesky moderation, not to Nagi', async ({ page }) => {
	await signIn(page);
	await openMenu(page);
	await page.getByRole('menuitem', { name: 'Blueskyに通報' }).click();
	const dialog = page.getByRole('dialog', { name: 'Blueskyに通報' });
	await expect(dialog).toContainText('Nagiの運営に届くものではなく');
	await dialog.getByRole('radio', { name: 'スパム' }).check();
	await dialog.getByRole('button', { name: '送信する' }).click();
	await expect(dialog.getByRole('status')).toContainText('通報を送信しました');
	const report = procedures.find((call) => call.method === 'com.atproto.moderation.createReport');
	expect(report?.proxy).toBe('did:plc:ar7c4by46qjdydhdevvrndac#atproto_labeler');
	expect(report?.body).toMatchObject({
		reasonType: 'com.atproto.moderation.defs#reasonSpam',
		subject: { uri: post.uri, cid: CID },
	});
	expect(otherRequests).not.toContain('com.suibari.nagi.createReport');
});

test('limits replies and quotes on a quote posted to Bluesky', async ({ page }) => {
	await signIn(page);
	await card(page).getByRole('button', { name: 'Blueskyで引用' }).click();
	const dialog = page.getByRole('dialog', { name: 'Blueskyで引用' });
	await editor(page, 'Blueskyで引用').click();
	await page.keyboard.type('ひとこと');
	await dialog.getByText('Blueskyでの返信・引用').click();
	await dialog.getByLabel('返信できる人').selectOption({ label: '返信不可' });
	await dialog.getByRole('checkbox', { name: '引用を許可する' }).uncheck();
	await dialog.getByRole('button', { name: 'Blueskyへ投稿' }).last().click();
	await expect.poll(() => writes.length).toBe(3);
	expect(writes.map((write) => [write.body.collection, write.body.rkey])).toEqual([
		['app.bsky.feed.post', undefined],
		['app.bsky.feed.threadgate', 'created'],
		['app.bsky.feed.postgate', 'created'],
	]);
	expect((writes[1].body.record as { allow: unknown }).allow).toEqual([]);
});

test('does not offer reply limits when replying', async ({ page }) => {
	await signIn(page);
	await card(page).getByRole('button', { name: 'Blueskyへ返信' }).click();
	const dialog = page.getByRole('dialog', { name: 'Blueskyへ返信' });
	await dialog.getByText('Blueskyでの返信・引用').click();
	await expect(dialog.getByLabel('返信できる人')).toHaveCount(0);
	await expect(dialog.getByRole('checkbox', { name: '引用を許可する' })).toBeVisible();
});

test('changes reply settings later on my own post made through Nagi', async ({ page }) => {
	timeline = [
		{
			post: {
				...post,
				uri: `at://${VIEWER}/app.bsky.feed.post/nagi`,
				author: { did: VIEWER, handle: 'me.test' },
				record: { ...post.record, via: 'Nagi' },
			},
		},
	];
	await signIn(page);
	await openMenu(page);
	await expect(page.getByRole('menuitem', { name: 'Blueskyに通報' })).toHaveCount(0);
	await page.getByRole('menuitem', { name: '返信・引用の設定' }).click();
	const dialog = page.getByRole('dialog', { name: 'Blueskyでの返信・引用' });
	const replyAudience = dialog.getByLabel('返信できる人');
	await expect(replyAudience.locator('option[value="nobody"]')).toHaveText('返信不可');
	await replyAudience.selectOption('following');
	await dialog.getByRole('button', { name: '保存する' }).click();
	await expect(dialog).toHaveCount(0);
	expect(writes.map((write) => [write.method, write.body.collection, write.body.rkey])).toEqual([
		['com.atproto.repo.deleteRecord', 'app.bsky.feed.threadgate', 'nagi'],
		['com.atproto.repo.createRecord', 'app.bsky.feed.threadgate', 'nagi'],
	]);
});

test('marks Bluesky feed tabs with the Bluesky icon', async ({ page }) => {
	await signIn(page);
	const tab = page.locator('.feed-tab').filter({ hasText: 'Bluesky' }).first();
	await expect(tab.locator('.feed-tab-bsky')).toHaveCount(1);
	await expect(tab).toContainText('（Bluesky）');
});

test('shows links and mentions in Bluesky posts the same way as in Nagi', async ({ page }) => {
	const text = '@friend.test を見て https://example.com';
	const bytes = (value: string) => new TextEncoder().encode(value).length;
	timeline = [
		{
			post: {
				...post,
				record: {
					...post.record,
					text,
					facets: [
						{
							index: { byteStart: 0, byteEnd: bytes('@friend.test') },
							features: [{ $type: 'app.bsky.richtext.facet#mention', did: 'did:plc:friend' }],
						},
						{
							index: { byteStart: bytes('@friend.test を見て '), byteEnd: bytes(text) },
							features: [{ $type: 'app.bsky.richtext.facet#link', uri: 'https://example.com' }],
						},
					],
				},
			},
		},
	];
	await signIn(page);
	const links = card(page).locator('.bsky-text a.rich-link');
	await expect(links).toHaveCount(2);
	await expect(links.first()).toHaveText('@friend.test');
	await expect(links.nth(1)).toHaveAttribute('href', 'https://example.com/');
});

const AUTHOR = 'did:plc:interaction-author';
const nagiUri = `at://${AUTHOR}/com.suibari.nagi.post/3klong`;
const longPost = {
	...post,
	uri: `at://${AUTHOR}/app.bsky.feed.post/long`,
	record: {
		...post.record,
		text: '長い投稿の冒頭…もっと見る',
		'com.suibari.nagi.longPost': { uri: nagiUri, cid: 'cid-at-crosspost' },
	},
};

test('shows the full text of a long crosspost from Nagi in place', async ({ page }) => {
	timeline = [{ post: longPost }];
	nagiThread = {
		uri: nagiUri,
		cid: 'cid-after-link',
		author: { did: AUTHOR, handle: 'author.test' },
		text: '長い投稿の冒頭から最後までの全文',
		createdAt: '2026-11-21T00:00:00Z',
		indexedAt: '2026-11-21T00:00:00Z',
		reactions: [],
		isBot: false,
		isAffirmation: false,
	};
	await signIn(page);
	await expect(card(page)).toContainText('長い投稿の冒頭…もっと見る');
	await card(page).getByRole('button', { name: '全文を表示' }).click();
	await expect(card(page)).toContainText('長い投稿の冒頭から最後までの全文');
	await expect(card(page).getByRole('button', { name: '全文を表示' })).toHaveCount(0);
	await expect(card(page)).not.toContainText('編集済み');
	// Nagi AppView へ渡すのは Nagi 投稿の URI だけ。
	expect(nagiThreadRequests).toEqual([nagiUri]);
});

test('keeps the opening and says so when the full text cannot be shown', async ({ page }) => {
	timeline = [{ post: longPost }];
	await signIn(page);
	await card(page).getByRole('button', { name: '全文を表示' }).click();
	await expect(card(page).getByRole('status')).toHaveText('全文を表示できませんでした');
	await expect(card(page)).toContainText('長い投稿の冒頭…もっと見る');
});

test("ignores a marker pointing at someone else's Nagi post", async ({ page }) => {
	timeline = [
		{
			post: {
				...longPost,
				record: {
					...longPost.record,
					'com.suibari.nagi.longPost': {
						uri: 'at://did:plc:someone-else/com.suibari.nagi.post/3k',
						cid: 'c',
					},
				},
			},
		},
	];
	await signIn(page);
	await expect(card(page)).toContainText('長い投稿の冒頭…もっと見る');
	await expect(card(page).getByRole('button', { name: '全文を表示' })).toHaveCount(0);
});
