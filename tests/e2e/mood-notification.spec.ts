import { expect, test } from '@playwright/test';

const bot = { did: 'did:plc:bot', handle: 'bot.nagi.example', displayName: 'botたん', isBot: true };

test('the first-mood notification leads to the mood graph', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
	await page.route('**/xrpc/com.suibari.nagi.getNotifications**', (route) =>
		route.fulfill({
			json: {
				items: [
					{
						id: 'mood-1',
						type: 'mood',
						actor: bot,
						subjectUri: 'at://did:plc:notifications-viewer',
						reasonUri: 'at://did:plc:notifications-viewer/mood/first',
						createdAt: new Date().toISOString(),
					},
				],
			},
		}),
	);
	await page.route('**/xrpc/com.suibari.nagi.getUnreadCount**', (route) =>
		route.fulfill({ json: { count: 1 } }),
	);
	await page.route('**/xrpc/com.suibari.nagi.updateSeen**', (route) => route.fulfill({ json: {} }));
	await page.goto('/dev/e2e/notifications');
	const row = page.getByRole('link', { name: /あなたの気持ちを感情グラフに載せました/ });
	await expect(row).toBeVisible();
	await expect(row).toContainText('アクティビティで振り返れます');
	await expect(row).toHaveAttribute('href', '/diary');
});
