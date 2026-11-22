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
	/** Bluesky への操作の権限も持つセッションにする。 */
	interact?: boolean;
	/** この rkey の Bluesky 投稿の削除を失敗させる。 */
	failDelete?: string;
};
type Write = {
	method: 'create' | 'put' | 'delete';
	collection: string;
	rkey?: string;
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
		if (body.rkey === opts.failDelete)
			return route.fulfill({ status: 500, json: { error: 'InternalError', message: 'PDS down' } });
		created.push({ method: 'delete', collection: body.collection, rkey: body.rkey });
		await route.fulfill({ json: {} });
	});
	// 分割したコピー（root → mid → tail）のスレッド。
	await page.route('**/xrpc/app.bsky.feed.getPostThread**', (route) => {
		const node = (rkey: string, replies: unknown[] = []) => ({
			$type: 'app.bsky.feed.defs#threadViewPost',
			post: {
				uri: `at://${did}/app.bsky.feed.post/${rkey}`,
				cid,
				author: { did, handle: 'me.test' },
				record: { $type: 'app.bsky.feed.post', text: rkey, createdAt: '2026-11-05T00:00:00.000Z' },
				indexedAt: '2026-11-05T00:00:00.000Z',
			},
			replies,
		});
		return route.fulfill({ json: { thread: node('root', [node('mid', [node('tail')])]) } });
	});
	await page.route('**/xrpc/com.suibari.nagi.**', (route) => route.fulfill({ json: {} }));
	await page.goto(opts.interact ? '/dev/e2e/crosspost?interact' : '/dev/e2e/crosspost');
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
	await expect(scope.getByText('Blueskyにも投稿した自分のポストへの返信だけ')).toBeVisible();
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

async function quoteToBluesky(page: Page, testId: string, text: string) {
	await page.getByTestId(testId).getByRole('button', { name: '引用', exact: true }).click();
	const composer = page.getByRole('dialog').last();
	await composer.getByRole('button', { name: /投稿範囲：/ }).click();
	await page.getByRole('radio', { name: 'Blueskyにも', exact: true }).click();
	await page.getByRole('button', { name: '決定', exact: true }).click();
	await composer.getByRole('textbox').first().fill(text);
	return composer;
}

test('a quote of a post that is not on Bluesky becomes a link card there', async ({ page }) => {
	const created = await setup(page);
	const other = 'https://nagi.suibari.com/thread/did:plc:someone-else/3kother';
	const composer = await quoteToBluesky(page, 'local', `紹介します ${other}`);
	await composer.getByRole('button', { name: '投稿する', exact: true }).click();
	await expect.poll(() => created.length).toBe(3);
	// 他人の投稿のリンクはカードにしない（POST-07）。
	expect(created[0].record?.linkCards).toBeUndefined();
	expect(created[1].record?.embed).toMatchObject({
		$type: 'app.bsky.embed.external',
		external: { uri: `https://nagi.suibari.com/thread/${did}/local` },
	});
	expect(created[1].record?.text).toBe(`紹介します ${other}`);
});

test('a quote whose Bluesky copy is gone falls back to a link card', async ({ page }) => {
	const created = await setup(page, { missing: ['root'] });
	const composer = await quoteToBluesky(page, 'crossposted', '引用です');
	await composer.getByRole('button', { name: '投稿する', exact: true }).click();
	await expect.poll(() => created.length).toBe(3);
	expect(created[1].record?.embed).toMatchObject({
		$type: 'app.bsky.embed.external',
		external: { uri: `https://nagi.suibari.com/thread/${did}/crossposted` },
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

async function openDelete(page: Page) {
	await page.getByTestId('crossposted').getByRole('button', { name: 'その他の投稿操作' }).click();
	await page.getByRole('menuitem', { name: '削除' }).click();
	return page.getByRole('dialog', { name: '投稿を削除しますか？' });
}

test('deleting a Nagi post keeps the Bluesky copy unless asked', async ({ page }) => {
	const writes = await setup(page, { interact: true });
	const dialog = await openDelete(page);
	const option = dialog.getByRole('checkbox', { name: 'Blueskyのコピーも削除する' });
	await expect(option).not.toBeChecked();
	await dialog.getByRole('button', { name: '削除する' }).click();
	await expect(dialog).toHaveCount(0);
	expect(writes.filter((write) => write.collection === 'app.bsky.feed.post')).toEqual([]);
});

test('deleting a Nagi post can delete every split Bluesky copy', async ({ page }) => {
	const writes = await setup(page, { interact: true });
	const dialog = await openDelete(page);
	await dialog.getByRole('checkbox', { name: 'Blueskyのコピーも削除する' }).check();
	await dialog.getByRole('button', { name: '削除する' }).click();
	await expect(dialog).toHaveCount(0);
	await expect
		.poll(() => writes.filter((write) => write.collection === 'app.bsky.feed.post').length)
		.toBe(3);
	expect(writes.map((write) => [write.collection, write.rkey])).toEqual([
		['com.suibari.nagi.post', 'crossposted'],
		['app.bsky.feed.post', 'tail'],
		['app.bsky.feed.post', 'mid'],
		['app.bsky.feed.post', 'root'],
	]);
});

test('a copy that cannot be deleted is reported after the Nagi post is gone', async ({ page }) => {
	await setup(page, { interact: true, failDelete: 'mid' });
	const dialog = await openDelete(page);
	await dialog.getByRole('checkbox', { name: 'Blueskyのコピーも削除する' }).check();
	await dialog.getByRole('button', { name: '削除する' }).click();
	await expect(dialog).toHaveCount(0);
	await expect(page.getByRole('status')).toContainText(
		'Blueskyのコピーの一部を削除できませんでした',
	);
});

test('sessions without delete permission are not offered to delete the copy', async ({ page }) => {
	await setup(page);
	const dialog = await openDelete(page);
	await expect(dialog).toBeVisible();
	await expect(dialog.getByRole('checkbox')).toHaveCount(0);
});
