import { expect, test, type Page } from '@playwright/test';

const did = 'did:plc:crosspost-viewer';
const cid = 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi';

async function setup(page: Page, opts: { missing?: string[]; checkFailed?: boolean } = {}) {
	await page.addInitScript(() => {
		localStorage.setItem('nagi-locale', 'ja');
		localStorage.setItem('nagi-crosspost-bluesky', 'true');
		localStorage.setItem('nagi-last-post-scope', 'external');
	});
	const created: Array<{ collection: string; record: Record<string, unknown> }> = [];
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
		return route.fulfill({
			json: {
				uri: 'at://did:plc:crosspost-viewer/app.bsky.feed.post/root',
				cid: 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi',
				value: {},
			},
		});
	});
	await page.route('**/xrpc/com.atproto.repo.createRecord', async (route) => {
		const body = route.request().postDataJSON();
		created.push({ collection: body.collection, record: body.record });
		const rkey = `new${created.length}`;
		await route.fulfill({
			json: { uri: `at://${did}/${body.collection}/${rkey}`, cid },
		});
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
	await expect.poll(() => created.length).toBe(2);
	// Bluesky のコピーが先にでき、その参照を入れて Nagi の投稿を作る。
	expect(created[0].collection).toBe('app.bsky.feed.post');
	expect(created[0].record.reply).toEqual({
		root: { uri: `at://${did}/app.bsky.feed.post/root`, cid: 'cid-root' },
		parent: { uri: `at://${did}/app.bsky.feed.post/tail`, cid: 'cid-tail' },
	});
	expect(created[1].collection).toBe('com.suibari.nagi.post');
	expect(created[1].record.crosspost).toEqual({
		root: { uri: `at://${did}/app.bsky.feed.post/new1`, cid },
		tail: { uri: `at://${did}/app.bsky.feed.post/new1`, cid },
		threadRoot: { uri: `at://${did}/app.bsky.feed.post/root`, cid: 'cid-root' },
	});
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
	await expect.poll(() => created.length).toBe(2);
	expect(created[0].record.embed).toEqual({
		$type: 'app.bsky.embed.record',
		record: { uri: `at://${did}/app.bsky.feed.post/root`, cid: 'cid-root' },
	});
	expect(created[1].record.crosspost).toMatchObject({
		root: { uri: `at://${did}/app.bsky.feed.post/new1`, cid },
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
