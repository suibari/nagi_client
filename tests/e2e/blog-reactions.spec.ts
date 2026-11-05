import { expect, test } from '@playwright/test';

const blog = (rkey: string, title: string, reactions: unknown[]) => ({
	uri: `at://did:plc:blog-author/com.suibari.nagi.post/${rkey}`,
	text: `# ${title}\n\n本文です。`,
	createdAt: '2026-11-01T00:00:00.000Z',
	indexedAt: '2026-11-01T00:00:00.000Z',
	author: { did: 'did:plc:blog-author', handle: 'author.nagi.example', displayName: '書いた人' },
	reactions,
});

for (const width of [375, 1280]) {
	test(`blog cards show reactions without numbers at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
		await page.route('**/xrpc/com.suibari.nagi.listIndexableBlogs**', (route) =>
			route.fulfill({
				json: {
					hasMore: false,
					items: [
						blog('with', 'リアクションのある記事', [
							{ emoji: '🥹', reactors: [], hasMoreReactors: true },
							{ emoji: '👏', reactors: [], hasMoreReactors: true },
						]),
						blog('without', 'まだ反応のない記事', []),
					],
				},
			}),
		);
		await page.route('**/xrpc/com.atproto.repo.getRecord**', (route) =>
			route.fulfill({ status: 404, json: { error: 'RecordNotFound' } }),
		);
		await page.goto('/blog');
		const withReactions = page.locator('[data-post-uri$="/with"]');
		await expect(
			withReactions.getByRole('heading', { name: 'リアクションのある記事' }),
		).toBeVisible();
		const bar = withReactions.locator('.blog-card-reactions');
		await expect(bar).toContainText('🥹');
		await expect(bar).toContainText('👏');
		// 数は出さない。付け外しもさせない（一覧は公開キャッシュ）。
		await expect(bar).not.toContainText(/\d/);
		await expect(bar.getByRole('button')).toHaveCount(0);
		await expect(page.locator('[data-post-uri$="/without"] .blog-card-reactions')).toHaveCount(0);
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
		);
		expect(overflow).toBeLessThanOrEqual(0);
		await page.screenshot({
			path: `/home/suibari/.config/orca/chat-scratch/7cc76d47f5ff93c6d6a661d01980d3fb/blog-${width}.png`,
		});
	});
}
