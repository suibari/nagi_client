import { expect, test, type Page } from '@playwright/test';

const did = 'did:plc:crosspost-viewer';
const cid = 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi';

type Setup = {
	missing?: string[];
	checkFailed?: boolean;
	/** この番号（0始まり）の Bluesky 投稿の作成を失敗させる。 */
	failBlueskyAt?: number;
	failNagi?: boolean;
	failLink?: boolean;
};
type Write = {
	method: 'create' | 'put' | 'delete';
	collection: string;
	record?: Record<string, unknown>;
	swapRecord?: string | null;
};

async function setup(page: Page, opts: Setup = {}) {
	await page.addInitScript(() => {
		localStorage.setItem('nagi-locale', 'ja');
		localStorage.setItem('nagi-crosspost-bluesky', 'true');
		localStorage.setItem('nagi-last-post-scope', 'external');
	});
	const created: Write[] = [];
	await page.route('**/xrpc/**', (route) =>
		route.fulfill({ json: { items: [], folders: [], uris: [], drafts: [], records: [] } }),
	);
	await page.route('**/xrpc/com.atproto.repo.getRecord**', (route) => {
		const url = new URL(route.request().url());
		const rkey = url.searchParams.get('rkey') ?? '';
		if (url.searchParams.get('collection') === 'app.bsky.feed.post' && opts.checkFailed)
			return route.fulfill({ status: 503, json: { error: 'Unavailable', message: 'Try again' } });
		if (url.searchParams.get('collection') === 'app.bsky.feed.post' && opts.missing?.includes(rkey))
			return route.fulfill({
				status: 400,
				json: { error: 'RecordNotFound', message: 'Could not locate record' },
			});
		// 作成済みの Nagi 投稿を読み直すときは、作ったときのレコードを返す。
		const stored = created.find(
			(write) =>
				write.method === 'create' && write.collection === url.searchParams.get('collection'),
		);
		return route.fulfill({
			json: {
				uri: `at://${did}/${url.searchParams.get('collection')}/${rkey}`,
				cid,
				value: stored?.record ?? {},
			},
		});
	});
	let blueskyCount = 0;
	await page.route('**/xrpc/com.atproto.repo.createRecord', async (route) => {
		const body = route.request().postDataJSON();
		if (body.collection === 'app.bsky.feed.post') {
			if (blueskyCount++ === opts.failBlueskyAt)
				return route.fulfill({
					status: 500,
					json: { error: 'InternalError', message: 'PDS down' },
				});
		} else if (opts.failNagi)
			return route.fulfill({ status: 500, json: { error: 'InternalError', message: 'PDS down' } });
		created.push({ method: 'create', collection: body.collection, record: body.record });
		const rkey = `new${created.length}`;
		await route.fulfill({
			json: { uri: `at://${did}/${body.collection}/${rkey}`, cid },
		});
	});
	await page.route('**/xrpc/com.atproto.repo.putRecord', async (route) => {
		const body = route.request().postDataJSON();
		if (opts.failLink)
			return route.fulfill({ status: 500, json: { error: 'InternalError', message: 'PDS down' } });
		created.push({
			method: 'put',
			collection: body.collection,
			record: body.record,
			swapRecord: body.swapRecord,
		});
		await route.fulfill({ json: { uri: `at://${did}/${body.collection}/${body.rkey}`, cid } });
	});
	await page.route('**/xrpc/com.atproto.repo.deleteRecord', async (route) => {
		const body = route.request().postDataJSON();
		created.push({ method: 'delete', collection: body.collection });
		await route.fulfill({ json: {} });
	});
	await page.route('**/xrpc/com.suibari.nagi.**', (route) => route.fulfill({ json: {} }));
	await page.goto('/dev/e2e/crosspost');
	return created;
}

async function openReply(page: Page, testId: string) {
	await page.getByTestId(testId).getByRole('button', { name: '返信', exact: true }).click();
	const composer = page.getByRole('dialog').last();
	await expect(composer).toBeVisible();
	return composer;
}

test('own crossposts carry a label and others do not', async ({ page }) => {
	await setup(page);
	await expect(page.getByTestId('crossposted').getByText('Blueskyにも投稿')).toBeVisible();
	await expect(page.getByTestId('local').getByText('Blueskyにも投稿')).toHaveCount(0);
	await expect(page.getByTestId('other').getByText('Blueskyにも投稿')).toHaveCount(0);
});

test('a reply to your own crosspost continues the Bluesky thread', async ({ page }) => {
	const created = await setup(page);
	const composer = await openReply(page, 'crossposted');
	await composer.getByRole('button', { name: /投稿範囲：/ }).click();
	await page.getByRole('radio', { name: 'Blueskyにも', exact: true }).click();
	await page.getByRole('button', { name: '決定', exact: true }).click();
	await expect(composer.getByRole('button', { name: /投稿範囲：Blueskyにも/ })).toBeVisible();
	await composer.getByRole('textbox').first().fill('続きです');
	await composer
		.getByRole('button', { name: /^(返信|投稿)/ })
		.last()
		.click();
	await expect.poll(() => created.length).toBe(3);
	// Nagi の投稿が先にでき、Bluesky のコピーを作ってから、その参照を投稿へ足す。
	expect(created[0]).toMatchObject({ method: 'create', collection: 'com.suibari.nagi.post' });
	expect(created[0].record?.crosspost).toBeUndefined();
	expect(created[1]).toMatchObject({ method: 'create', collection: 'app.bsky.feed.post' });
	expect(created[1].record?.reply).toEqual({
		root: { uri: `at://${did}/app.bsky.feed.post/root`, cid: 'cid-root' },
		parent: { uri: `at://${did}/app.bsky.feed.post/tail`, cid: 'cid-tail' },
	});
	expect(created[2]).toMatchObject({
		method: 'put',
		collection: 'com.suibari.nagi.post',
		swapRecord: cid,
	});
	// 見える内容は作成時のまま、参照だけが増える。
	expect({ ...created[2].record, crosspost: undefined }).toEqual({
		...created[0].record,
		crosspost: undefined,
	});
	expect(created[2].record?.crosspost).toEqual({
		root: { uri: `at://${did}/app.bsky.feed.post/new2`, cid },
		tail: { uri: `at://${did}/app.bsky.feed.post/new2`, cid },
		threadRoot: { uri: `at://${did}/app.bsky.feed.post/root`, cid: 'cid-root' },
	});
});

async function sendReply(page: Page, text: string) {
	const composer = await openReply(page, 'crossposted');
	await composer.getByRole('button', { name: /投稿範囲：/ }).click();
	await page.getByRole('radio', { name: 'Blueskyにも', exact: true }).click();
	await page.getByRole('button', { name: '決定', exact: true }).click();
	await composer.getByRole('textbox').first().fill(text);
	await composer
		.getByRole('button', { name: /^(返信|投稿)/ })
		.last()
		.click();
	return composer;
}

test('a failed Nagi save creates nothing on Bluesky', async ({ page }) => {
	const created = await setup(page, { failNagi: true });
	const composer = await sendReply(page, '続きです');
	await expect(composer.getByRole('alert').or(composer.locator('.error'))).toBeVisible();
	expect(created).toEqual([]);
});

test('a partial Bluesky thread is kept, not linked, and reported', async ({ page }) => {
	const created = await setup(page, { failBlueskyAt: 1 });
	await sendReply(page, 'あ'.repeat(450));
	await expect(
		page
			.getByRole('status')
			.getByText('Blueskyには途中までしか投稿できませんでした', { exact: false }),
	).toBeVisible();
	expect(created.map((write) => `${write.method}:${write.collection}`)).toEqual([
		'create:com.suibari.nagi.post',
		'create:app.bsky.feed.post',
	]);
});

test('a failed link keeps both posts and warns', async ({ page }) => {
	const created = await setup(page, { failLink: true });
	await sendReply(page, '続きです');
	await expect(
		page.getByRole('status').getByText('Nagiの投稿と結びつけられませんでした', { exact: false }),
	).toBeVisible();
	expect(created.map((write) => `${write.method}:${write.collection}`)).toEqual([
		'create:com.suibari.nagi.post',
		'create:app.bsky.feed.post',
	]);
});

test('a deleted Bluesky copy stops the crosspost and drops the label on this device', async ({
	page,
}) => {
	await setup(page, { missing: ['tail'] });
	const composer = await openReply(page, 'crossposted');
	await composer.getByRole('button', { name: /投稿範囲：/ }).click();
	const scope = page.getByRole('dialog', { name: /投稿範囲/ });
	await expect(scope.getByText('Blueskyのポストが削除されているため')).toBeVisible();
	await expect(scope.getByRole('radio', { name: /Blueskyにも/ })).toBeDisabled();
	await expect(page.getByTestId('crossposted').getByText('Blueskyにも投稿')).toHaveCount(0);
});

test('replies to posts that are not on Bluesky stay on Nagi', async ({ page }) => {
	await setup(page);
	const composer = await openReply(page, 'local');
	await composer.getByRole('button', { name: /投稿範囲：/ }).click();
	const scope = page.getByRole('dialog', { name: /投稿範囲/ });
	await expect(scope.getByRole('radio', { name: /Blueskyにも/ })).toBeDisabled();
	await expect(scope.getByText('Blueskyにも投稿した自分のポストへの返信・引用だけ')).toBeVisible();
});

test('a quote of your own crosspost quotes the Bluesky copy', async ({ page }) => {
	const created = await setup(page);
	await page.getByTestId('crossposted').getByRole('button', { name: '引用', exact: true }).click();
	const composer = page.getByRole('dialog').last();
	await composer.getByRole('button', { name: /投稿範囲：/ }).click();
	await page.getByRole('radio', { name: 'Blueskyにも', exact: true }).click();
	await page.getByRole('button', { name: '決定', exact: true }).click();
	await composer.getByRole('textbox').first().fill('引用です');
	await composer.getByRole('button', { name: '投稿する', exact: true }).click();
	await expect.poll(() => created.length).toBe(3);
	expect(created[1].record?.embed).toEqual({
		$type: 'app.bsky.embed.record',
		record: { uri: `at://${did}/app.bsky.feed.post/root`, cid: 'cid-root' },
	});
	expect(created[2].record?.crosspost).toMatchObject({
		root: { uri: `at://${did}/app.bsky.feed.post/new2`, cid },
	});
});

test('a failed check disables Bluesky without treating the copy as deleted', async ({ page }) => {
	await setup(page, { checkFailed: true });
	const composer = await openReply(page, 'crossposted');
	await composer.getByRole('button', { name: /投稿範囲：/ }).click();
	const scope = page.getByRole('dialog', { name: /投稿範囲/ });
	await expect(
		scope.getByText('Blueskyのポストを確認できませんでした。時間をおいてお試しください'),
	).toBeVisible();
	await expect(scope.getByRole('radio', { name: 'Blueskyにも', exact: true })).toBeDisabled();
	await expect(
		page.getByTestId('crossposted').getByText('Blueskyにも投稿', { exact: true }),
	).toHaveCount(1);
});
