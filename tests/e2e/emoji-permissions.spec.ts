import { expect, test } from '@playwright/test';

for (const phase of ['list', 'create']) {
	for (const failure of [
		{ status: 401, error: 'AuthRequired', message: 'Authentication required', permission: true },
		{ status: 403, error: 'Forbidden', message: 'Forbidden', permission: true },
		{ status: 400, error: 'InvalidRequest', message: 'Missing scope', permission: true },
		{ status: 503, error: 'not_configured', message: 'Not configured', permission: false },
		{ status: 500, error: 'InternalError', message: 'Failed', permission: false },
	]) {
		test(`emoji ${phase}: ${failure.status} ${failure.error} の更新ボタン`, async ({ page }) => {
			await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
			await page.route('**/xrpc/**', (route) => {
				if (route.request().url().includes('EmojiGeneration')) {
					if (phase === 'create' && route.request().method() === 'GET') {
						return route.fulfill({ json: { generations: [] } });
					}
					return route.fulfill({ status: failure.status, json: failure });
				}
				return route.fulfill({ json: { items: [], cards: [], folders: [], uris: [], drafts: [] } });
			});
			await page.route('**/src/lib/oauth/session.svelte.ts', (route) =>
				route.fulfill({
					contentType: 'application/javascript',
					body: `
					export * from '/src/lib/oauth/session.svelte.ts?permissions-original';
					export async function signIn(did, options) {
						window.permissionRequest = { did, options };
					}
				`,
				}),
			);
			await page.goto('/settings/emoji');
			await page.evaluate(async () => {
				// @ts-expect-error Vite resolves the browser module.
				const { session } = await import('/src/lib/oauth/session.svelte.ts');
				session.set({
					did: 'did:plc:emoji-permissions',
					getTokenInfo: async () => ({ scope: 'repo:app.bsky.feed.post' }),
					fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
				});
			});
			const panel = page.locator('#emoji-panel-generate');
			if (phase === 'create') {
				await panel.locator('input').first().fill('ねこ');
				await panel.locator('button.primary').click();
			}
			const refresh = panel.getByRole('button', { name: 'ログイン権限を更新' });
			await expect(panel.getByRole('alert')).toBeVisible();
			if (!failure.permission) {
				await expect(refresh).toHaveCount(0);
				return;
			}
			await expect(refresh).toBeVisible();
			await refresh.click();
			await expect
				.poll(() => page.evaluate(() => (window as any).permissionRequest))
				.toEqual({
					did: 'did:plc:emoji-permissions',
					options: { crosspost: true, standardSite: false, refreshPermissions: true },
				});
			await expect
				.poll(() => page.evaluate(() => localStorage.getItem('nagi.oauth.return-to')))
				.toBe('/settings/emoji');
		});
	}
}
