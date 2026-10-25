import { expect, test, type Page } from '@playwright/test';

// タブ追加ダイアログの Bluesky フィード選択。保存済みフィードが多いとダイアログが max-height を
// 超え、flex の子が縮む。overflow を持つ要素は高さ0まで縮められるので、スクロールさせたい
// 保存済み一覧以外（フォロー中の選択肢・URL 入力など）がつぶれていないかを実レイアウトで測る。

const SAVED_FEEDS = 15;
const VIEW_SCOPES = [
	'rpc:app.bsky.feed.getFeed',
	'rpc:app.bsky.feed.getFeedSkeleton',
	'rpc:app.bsky.feed.getTimeline',
	'rpc:app.bsky.feed.getFeedGenerators',
	'rpc:app.bsky.actor.getPreferences',
	'rpc:app.bsky.labeler.getServices',
	'rpc:app.bsky.feed.getLikes',
].map((scope) => `${scope}?aud=*`);

async function openBskyStep(page: Page) {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	// Nagi AppView 宛ては空の一覧で返す。このテストが見るのはダイアログの見た目だけ。
	await page.route('**/xrpc/**', (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				members: [],
				drafts: [],
				items: [],
				cards: [],
				folders: [],
				uris: [],
				actors: [],
				count: 0,
			}),
		}),
	);
	await page.goto('/settings/feed-tabs');

	// Bluesky 連携の権限を持つセッションを差し込み、PDS 経由の app.bsky.* をここで返す。
	await page.evaluate(
		async ({ scopes, count }) => {
			const did = 'did:plc:bsky-feed-tab-dialog';
			const uris = Array.from(
				{ length: count },
				(_, index) => `at://did:plc:feedmaker/app.bsky.feed.generator/feed-${index}`,
			);
			const json = (body: unknown) =>
				new Response(JSON.stringify(body), {
					status: 200,
					headers: { 'content-type': 'application/json' },
				});
			const responses: Record<string, () => Response> = {
				'app.bsky.actor.getPreferences': () =>
					json({
						preferences: [
							{
								$type: 'app.bsky.actor.defs#savedFeedsPrefV2',
								items: uris.map((value, index) => ({
									id: `saved-${index}`,
									type: 'feed',
									value,
									pinned: true,
								})),
							},
						],
					}),
				'app.bsky.labeler.getServices': () => json({ views: [] }),
				'app.bsky.feed.getFeedGenerators': () =>
					json({
						feeds: uris.map((uri, index) => ({
							uri,
							cid: 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi',
							did: 'did:web:feeds.example.com',
							creator: { did: 'did:plc:feedmaker', handle: 'feedmaker.test' },
							displayName: `保存したフィード ${index}`,
							indexedAt: '2026-10-26T00:00:00.000Z',
						})),
					}),
			};
			const modulePath = '/src/lib/oauth/session.svelte.ts';
			const { session } = await import(/* @vite-ignore */ modulePath);
			session.set({
				did,
				fetchHandler: (url: string, init?: RequestInit) => {
					const method = /\/xrpc\/([^?]+)/.exec(url)?.[1];
					const respond = method ? responses[method] : undefined;
					return respond ? Promise.resolve(respond()) : fetch(url, init);
				},
				getTokenInfo: async () => ({ scope: ['atproto', ...scopes].join(' ') }),
			});
		},
		{ scopes: VIEW_SCOPES, count: SAVED_FEEDS },
	);

	await page.getByRole('button', { name: 'タブを追加' }).click();
	await page.getByRole('button', { name: /Blueskyフィード/ }).click();
	await expect(page.getByRole('button', { name: /保存したフィード/ })).toHaveCount(SAVED_FEEDS);
}

/** ダイアログの直下の子のうち、中身より低く描かれている（つぶれている）もの。 */
function squashedChildren(page: Page) {
	return page.locator('.draft-dialog').evaluate((dialog) =>
		[...dialog.children]
			// 保存済み一覧だけはスクロールさせる前提なので、縮んでよい。
			.filter((child) => !child.classList.contains('bsky-saved-feeds'))
			.filter((child) => child.clientHeight + 1 < child.scrollHeight)
			.map((child) => `${child.tagName.toLowerCase()}.${[...child.classList].join('.')}`),
	);
}

for (const viewport of [
	{ name: 'desktop', width: 1280, height: 720 },
	{ name: 'mobile', width: 390, height: 640 },
]) {
	test(`保存済みフィードが多くてもフォロー中の選択肢がつぶれない（${viewport.name}）`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: viewport.width, height: viewport.height });
		await openBskyStep(page);

		await expect(page.getByRole('button', { name: /Blueskyのフォロー中/ })).toBeVisible();
		// ボタン自体は縮まず、入れ物のリストに切り取られる形でつぶれるので、入れ物の側を測る。
		expect(await squashedChildren(page)).toEqual([]);

		// あふれた分は保存済み一覧の中でスクロールする。
		const saved = page.locator('.bsky-saved-feeds');
		expect(await saved.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
			true,
		);
	});
}
