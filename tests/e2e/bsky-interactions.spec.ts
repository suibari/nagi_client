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

async function signIn(page: Page, withInteractionScopes = true, viewer = VIEWER) {
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
		{ withInteractionScopes, viewer },
	);
}

let writes: Write[];
let failWrites: boolean;
let failCollection: (body: Record<string, unknown>) => boolean;
let threadReply: unknown;
let threadReads: number;
let createdPosts: number;
let timeline: unknown[];
let threadMissing: boolean;
let otherRequests: string[];
let procedures: { method: string; body: unknown; proxy: string | null }[];
let nagiThreadRequests: string[];
let nagiThread: unknown;

test.beforeEach(async ({ page }) => {
	writes = [];
	failWrites = false;
	failCollection = () => false;
	threadReply = undefined;
	threadReads = 0;
	createdPosts = 0;
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
				if (failWrites || failCollection(body))
					return route.fulfill({ status: 500, json: { error: 'Internal', message: 'down' } });
				if (method === 'com.atproto.repo.createRecord' && body.collection === 'app.bsky.feed.post')
					createdPosts++;
				const rkey =
					body.collection === 'app.bsky.feed.post' && createdPosts > 1
						? `created-${createdPosts}`
						: 'created';
				return route.fulfill({
					json:
						method === 'com.atproto.repo.createRecord'
							? { uri: `at://${VIEWER}/${body.collection}/${rkey}`, cid: CID }
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
		if (method === 'app.bsky.feed.getLikes')
			return route.fulfill({ json: { uri: post.uri, likes: [] } });
		if (method === 'app.bsky.feed.getTimeline') return route.fulfill({ json: { feed: timeline } });
		if (method === 'com.suibari.nagi.getThread') {
			nagiThreadRequests.push(new URL(route.request().url()).searchParams.get('uri') ?? '');
			if (!nagiThread)
				return route.fulfill({ status: 404, json: { error: 'NotFound', message: 'gone' } });
			return route.fulfill({ json: { thread: { post: nagiThread, replies: [] } } });
		}
		if (method === 'app.bsky.feed.getPostThread') {
			const params = new URL(route.request().url()).searchParams;
			const uri = params.get('uri');
			const withReplies = params.get('depth') !== '0';
			if (withReplies) threadReads++;
			return route.fulfill({
				json: {
					thread: threadMissing
						? { $type: 'app.bsky.feed.defs#notFoundPost', uri, notFound: true }
						: {
								$type: 'app.bsky.feed.defs#threadViewPost',
								post,
								replies: withReplies && threadReply ? [threadReply] : [],
							},
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
			json: {
				items: [],
				cards: [],
				folders: [],
				uris: [],
				actors: [],
				count: 0,
				drafts: [],
				tags: [],
			},
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

const tagFacet = (prefix: string, tag: string) => ({
	index: {
		byteStart: new TextEncoder().encode(prefix).length,
		byteEnd: new TextEncoder().encode(`${prefix}#${tag}`).length,
	},
	features: [{ $type: 'app.bsky.richtext.facet#tag', tag }],
});

const recentTags = (page: Page) =>
	page.evaluate(
		(viewer) =>
			JSON.parse(localStorage.getItem(`nagi:tag-recents:v1.${encodeURIComponent(viewer)}`) ?? '[]'),
		VIEWER,
	);

for (const name of ['Blueskyへ返信', 'Blueskyで引用']) {
	test(`inserts a tag and Unicode emoji at the selection in ${name}`, async ({ page }) => {
		await signIn(page);
		await page.evaluate(async () => {
			const path = '/src/lib/tag-favorites/tag-favorites.svelte.ts';
			const { tagFavorites } = await import(/* @vite-ignore */ path);
			tagFavorites.favorites = ['テスト'];
		});
		await card(page).getByRole('button', { name }).click();
		const dialog = page.getByRole('dialog', { name, exact: true });
		await expect(dialog.locator('.composer-target-card')).toContainText('投稿した人');
		const input = editor(page, name);
		await input.fill('前 消 後');
		await input.press('Home');
		await input.press('ArrowRight');
		await input.press('ArrowRight');
		await input.press('Shift+ArrowRight');
		await dialog.getByRole('button', { name: 'タグを挿入' }).click();
		await page.getByRole('button', { name: '#テスト を投稿に挿入' }).click();
		await expect(input).toBeFocused();
		await expect(input).toHaveText('前 #テスト 後');
		await input.press('End');
		await dialog.getByRole('button', { name: '絵文字を挿入' }).click();
		const quickSearch = page.locator('.reaction-quick-search');
		await quickSearch.fill('炎');
		await page
			.locator('.reaction-quick-results')
			.getByRole('button', { name: '🔥 を投稿に挿入', exact: true })
			.click();
		await expect(input).toBeFocused();
		await page.keyboard.insertText('続');
		await expect(input).toHaveText('前 #テスト 後🔥続');
	});
}

test('filters Unicode in all emoji input paths and preserves custom favorites', async ({
	page,
}) => {
	await signIn(page);
	const favoriteKey = `nagi:emoji-favorites:v2.${encodeURIComponent(VIEWER)}`;
	await page.evaluate((key) => {
		const custom = {
			uri: 'at://did:plc:custom/community.lexicon.emoji.emoji/fire',
			cid: 'preview',
			did: 'did:plc:custom',
			name: ':fire_custom:',
			url: '/custom.png',
			mediaType: 'image/png',
		};
		localStorage.setItem(
			key,
			JSON.stringify({
				choices: [
					{ kind: 'unicode', emoji: '😀' },
					{ kind: 'custom', emoji: custom },
					{ kind: 'unicode', emoji: '🎉' },
				],
			}),
		);
		localStorage.setItem(
			'nagi:reaction-usage:v2',
			JSON.stringify([{ kind: 'custom', emoji: custom, lastUsedAt: Date.now(), count: 1 }]),
		);
	}, favoriteKey);
	await card(page).getByRole('button', { name: 'Blueskyへ返信' }).click();
	const dialog = page.getByRole('dialog', { name: 'Blueskyへ返信', exact: true });
	await dialog.getByRole('button', { name: '絵文字を挿入' }).click();
	const quick = page.locator('.reaction-quick-picker');
	await expect(quick.locator('.reaction-quick-favorites button')).toHaveCount(2);
	await expect(quick.locator('img')).toHaveCount(0);
	await quick.getByRole('button', { name: 'すべて見る' }).click();
	const full = page.locator('.emoji-picker');
	await expect(full.getByRole('tab', { name: 'カスタム' })).toHaveCount(0);
	await expect(full.locator('.emoji-sort-item')).toHaveCount(2);
	await full.locator('.emoji-sort-item').first().press('ArrowRight');
	const favorites = await page.evaluate(
		(key) => JSON.parse(localStorage.getItem(key)!).choices,
		favoriteKey,
	);
	expect(
		favorites.map((favorite: { kind: string; emoji: string }) =>
			favorite.kind === 'unicode' ? favorite.emoji : favorite.kind,
		),
	).toEqual(['🎉', 'custom', '😀']);
	await full.getByRole('tab', { name: '絵文字', exact: true }).click();
	await full.getByRole('searchbox').fill('fire');
	await full.locator('.emoji-unicode-item').filter({ hasText: '🔥' }).first().click();
	const input = editor(page, 'Blueskyへ返信');
	await expect(input).toHaveText('🔥');
	await input.fill(':fire');
	await page.keyboard.press('End');
	const suggestions = page.locator('.mention-suggestions-portal');
	await expect(suggestions.getByText('🔥', { exact: true })).toBeVisible();
	await page.keyboard.press('Enter');
	await expect(input).toHaveText('🔥');
	expect(otherRequests.some((name) => /searchEmojis|resolveEmojis/.test(name))).toBe(false);
});

test('replies to a Bluesky post only on Bluesky, without a Nagi post or draft', async ({
	page,
}) => {
	await page.clock.install();
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
	const conversation = page.locator(`[data-bsky-thread="${post.uri}"]`);
	const reply = conversation.getByText('Nagiから返信します', { exact: true });
	await expect(reply).toBeVisible();
	await expect.poll(() => threadReads).toBe(1);
	await expect(reply).toHaveCount(1);

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

	threadReply = {
		$type: 'app.bsky.feed.defs#threadViewPost',
		post: {
			uri: `at://${VIEWER}/app.bsky.feed.post/created`,
			cid: CID,
			author: { did: VIEWER, handle: 'confirmed.test', displayName: '取り込み済み' },
			record,
			indexedAt: record.createdAt,
		},
	};
	await page.clock.fastForward(31_000);
	await expect(conversation.getByText('取り込み済み', { exact: true })).toBeVisible();
	await expect(reply).toHaveCount(1);
});

test('quotes a Bluesky post as a Bluesky quote', async ({ page }) => {
	await signIn(page);
	await card(page).getByRole('button', { name: 'Blueskyで引用' }).click();
	const dialog = page.getByRole('dialog', { name: 'Blueskyで引用' });
	await editor(page, 'Blueskyで引用').click();
	await page.keyboard.type('これいい 🔥 #引用');
	await dialog.getByRole('button', { name: 'Blueskyへ投稿' }).last().click();
	await expect.poll(() => writes.length).toBe(1);
	expect((writes[0].body.record as { embed: unknown }).embed).toEqual({
		$type: 'app.bsky.embed.record',
		record: { uri: post.uri, cid: CID },
	});
	expect((writes[0].body.record as { facets: unknown }).facets).toEqual([
		tagFacet('これいい 🔥 ', '引用'),
	]);
	await expect(dialog).toHaveCount(0);
	expect(await recentTags(page)).toEqual(['引用']);
});

test('records tags from each created chunk without counting tags from failed submissions', async ({
	page,
}) => {
	await signIn(page);
	const replyText = `最初 🔥 #先頭
${'長'.repeat(290)} 🔥 #末尾`;
	const conversation = page.locator(`[data-bsky-thread="${post.uri}"]`);
	const openReply = async (text: string) => {
		await card(page).getByRole('button', { name: 'Blueskyへ返信' }).click();
		await editor(page, 'Blueskyへ返信').fill(text);
		return page.getByRole('dialog', { name: 'Blueskyへ返信', exact: true });
	};
	const submit = (dialog: ReturnType<Page['getByRole']>) =>
		dialog.getByRole('button', { name: 'Blueskyへ投稿' }).last().click();

	failCollection = (body) =>
		body.collection === 'app.bsky.feed.post' &&
		writes.filter((write) => write.body.collection === 'app.bsky.feed.post').length === 2;
	let dialog = await openReply(replyText);
	await submit(dialog);
	await expect(dialog).toHaveCount(0);
	const firstChunk = conversation.locator(
		`[data-bsky-uri="at://${VIEWER}/app.bsky.feed.post/created"]`,
	);
	await expect(firstChunk.getByText('最初 🔥', { exact: false })).toBeVisible();
	await expect(conversation.getByText('#末尾', { exact: true })).toHaveCount(0);
	expect(await recentTags(page)).toEqual([]);
	await openMenu(page, firstChunk);
	await page.getByRole('menuitem', { name: '削除' }).click();
	await page
		.getByRole('dialog', { name: 'Blueskyの投稿を削除' })
		.getByRole('button', { name: '削除する' })
		.click();
	await expect(firstChunk).toHaveCount(0);

	failWrites = true;
	dialog = await openReply('最初から失敗 #失敗');
	await submit(dialog);
	await expect(dialog.getByRole('alert')).toBeVisible();
	await expect(conversation.getByText('#失敗', { exact: true })).toHaveCount(0);
	expect(await recentTags(page)).toEqual([]);
	await dialog.getByRole('button', { name: '閉じる' }).click();
	await page.getByRole('button', { name: '破棄する' }).click();
	expect(await recentTags(page)).toEqual([]);

	failWrites = false;
	failCollection = () => false;
	dialog = await openReply(replyText);
	await submit(dialog);
	await expect(dialog).toHaveCount(0);
	const records = writes
		.slice(-2)
		.map(({ body }) => body.record as { text: string; facets: unknown });
	expect(records[0].facets).toEqual([tagFacet('最初 🔥 ', '先頭')]);
	expect(records[1].facets).toEqual([tagFacet(`${'長'.repeat(290)} 🔥 `, '末尾')]);
	expect(await recentTags(page)).toEqual(['先頭', '末尾']);
	await expect(conversation.getByText('#末尾', { exact: true })).toBeVisible();
});

test('records tags when only the gate write fails', async ({ page }) => {
	await signIn(page);
	failCollection = (body) => body.collection === 'app.bsky.feed.postgate';
	await card(page).getByRole('button', { name: 'Blueskyで引用' }).click();
	const dialog = page.getByRole('dialog', { name: 'Blueskyで引用', exact: true });
	await editor(page, 'Blueskyで引用').fill('引用 #公開');
	await dialog.getByText('Blueskyでの返信・引用').click();
	await dialog.getByRole('checkbox', { name: '引用を許可する' }).uncheck();
	await dialog.getByRole('button', { name: 'Blueskyへ投稿' }).last().click();
	await expect(dialog).toHaveCount(0);
	await expect(
		page.getByText('投稿しましたが、返信・引用の設定を付けられませんでした'),
	).toBeVisible();
	expect(await recentTags(page)).toEqual(['公開']);
});

test('a pending reply does not enter the next account’s conversation or tag history', async ({
	page,
}) => {
	await signIn(page);
	const otherDid = 'did:plc:other-interaction-viewer';
	let requestStarted!: () => void;
	const requested = new Promise<void>((resolve) => (requestStarted = resolve));
	let finishWrite!: () => void;
	const response = new Promise<void>((resolve) => (finishWrite = resolve));
	const uri = `at://${VIEWER}/app.bsky.feed.post/sent-before-switch`;
	await page.route('**/xrpc/com.atproto.repo.createRecord', async (route) => {
		if (route.request().postDataJSON().collection !== 'app.bsky.feed.post') return route.fallback();
		requestStarted();
		await response;
		await route.fulfill({ json: { uri, cid: CID } });
	});
	await card(page).getByRole('button', { name: 'Blueskyへ返信' }).click();
	await editor(page, 'Blueskyへ返信').fill('切替の前 #旧アカウント');
	const dialog = page.getByRole('dialog', { name: 'Blueskyへ返信', exact: true });
	await dialog.getByRole('button', { name: 'Blueskyへ投稿' }).last().click();
	await requested;
	try {
		await signIn(page, true, otherDid);
	} finally {
		finishWrite();
	}
	await expect.poll(() => recentTags(page)).toEqual(['旧アカウント']);
	await expect(page.locator(`[data-bsky-uri="${uri}"]`)).toHaveCount(0);
	const otherTags = await page.evaluate(
		(did) => localStorage.getItem(`nagi:tag-recents:v1.${encodeURIComponent(did)}`),
		otherDid,
	);
	expect(otherTags).toBeNull();
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
