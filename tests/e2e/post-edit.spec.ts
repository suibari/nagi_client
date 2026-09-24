import { expect, test, type Page } from '@playwright/test';

const did = 'did:plc:playwright-post-editor';
const postUri = `at://${did}/com.suibari.nagi.post/playwright`;
const oldUrl = 'https://old.example/article';
const newUrl = 'https://new.example/article';
const cid = 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi';

async function mockXrpc(page: Page) {
	let savedRecord: Record<string, unknown> | undefined;
	await page.route('**/xrpc/**', async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		const method = url.pathname.split('/').pop();
		const json = (body: unknown) =>
			route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

		if (method === 'com.atproto.repo.getRecord') {
			if (url.searchParams.get('collection') === 'com.suibari.nagi.profile') {
				await json({
					uri: `at://${did}/com.suibari.nagi.profile/self`,
					cid,
					value: {
						$type: 'com.suibari.nagi.profile',
						displayName: 'Playwright確認用',
						description: '',
					},
				});
				return;
			}
			await json({
				uri: postUri,
				cid,
				value: {
					$type: 'com.suibari.nagi.post',
					text: `変更前 ${oldUrl}`,
					facets: [],
					langs: ['ja'],
					createdAt: '2026-09-13T00:00:00.000Z',
					linkCards: [{ uri: oldUrl, title: '変更前のリンクカード' }],
				},
			});
			return;
		}
		if (method === 'com.suibari.nagi.getLinkMetadata') {
			const target = url.searchParams.get('url');
			await json(
				target === newUrl
					? { uri: newUrl, title: '変更後のリンクカード', description: 'E2E metadata' }
					: { uri: oldUrl, title: '変更前のリンクカード' },
			);
			return;
		}
		if (method === 'com.atproto.repo.putRecord') {
			savedRecord = request.postDataJSON().record as Record<string, unknown>;
			await json({ uri: postUri, cid });
			return;
		}
		if (method === 'com.suibari.nagi.ensureRecord') {
			await json({ uri: postUri, cid, indexed: true });
			return;
		}
		if (method === 'com.suibari.nagi.getDrafts') {
			await json({ drafts: [] });
			return;
		}
		await json({ items: [], folders: [], uris: [] });
	});
	return () => savedRecord;
}

test('投稿編集でリンクカードを張り替えて保存できる', async ({ page }) => {
	const savedRecord = await mockXrpc(page);
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.goto('/dev/e2e/post-edit');

	const fixture = page.getByTestId('post-edit-fixture');
	await fixture.getByRole('button', { name: 'その他の投稿操作' }).click();
	await fixture.getByRole('menuitem', { name: '編集' }).click();

	const editor = fixture.locator('.inline-edit');
	await expect(editor.getByText('変更前のリンクカード')).toBeVisible();
	await editor.getByRole('button', { name: 'リンクカードを削除' }).click();
	await editor.locator('.cm-content').fill(`変更後 ${newUrl}`);
	await expect(editor.getByText('変更後のリンクカード')).toBeVisible();

	await editor.getByRole('button', { name: '投稿する' }).click();
	await expect(editor).toHaveCount(0);
	await expect(fixture.getByText('変更後のリンクカード')).toBeVisible();
	await expect(fixture.getByText('変更前のリンクカード')).toHaveCount(0);

	await expect.poll(savedRecord).toMatchObject({
		linkCards: [{ uri: newUrl, title: '変更後のリンクカード', description: 'E2E metadata' }],
	});
});
