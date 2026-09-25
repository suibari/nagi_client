import { expect, test } from '@playwright/test';

test('diary deep links and tabs keep the selected tab, date, and URL in sync', async ({ page }) => {
	const date = '2020-02-29';
	const text = 'A memorable leap-day diary.';
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'en'));
	await page.route('**/xrpc/**', async (route) => {
		const url = new URL(route.request().url());
		const method = url.pathname.split('/').pop();
		let body: unknown = { items: [], folders: [], uris: [], drafts: [], hasMore: false };
		if (method === 'com.atproto.repo.getRecord') {
			await route.fulfill({
				json: {
					uri: 'at://did:plc:playwright-diary/com.suibari.nagi.profile/self',
					cid: 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi',
					value: {
						$type: 'com.suibari.nagi.profile',
						displayName: 'Diary reader',
						description: '',
					},
				},
			});
			return;
		}
		if (method === 'com.suibari.nagi.getChronicle') {
			body = {
				items: [{ id: 'leap-day', kind: 'highlight', date, diaryDate: date, titleEn: 'Leap day' }],
				hasMore: false,
			};
		} else if (method === 'com.suibari.nagi.getDiaries') {
			// Return the old entry only if the UI actually requests a range containing it.
			const from = url.searchParams.get('from');
			const to = url.searchParams.get('to');
			body = {
				items:
					from && to && from <= date && date <= to
						? [
								{
									uri: 'at://did:plc:playwright-diary/com.suibari.nagi.diary/leap-day',
									cid: 'bafy-diary',
									subject: 'did:plc:playwright-diary',
									date,
									text,
									createdAt: `${date}T12:00:00.000Z`,
									indexedAt: `${date}T12:00:00.000Z`,
								},
							]
						: [],
				hasMore: false,
			};
		} else if (method === 'com.suibari.nagi.getProfile') {
			body = {
				profile: { did: 'did:plc:playwright-diary', handle: 'diary.example' },
				feed: { items: [], hasMore: false },
			};
		}
		await route.fulfill({ json: body });
	});

	await page.goto('/dev/e2e/diary-navigation');
	await page.getByRole('link', { name: 'Open diary deep link' }).click();
	const activity = page.getByRole('tab', { name: 'Yearly activity', exact: true });
	const chronicle = page.getByRole('tab', { name: 'Chronicle', exact: true });

	// A date takes precedence even when the URL also requests Chronicle.
	await expect(page).toHaveURL(`/diary?date=${date}&tab=chronicle`);
	await expect(activity).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator(`[data-date="${date}"]`)).toHaveAttribute('aria-pressed', 'true');
	await expect(page.locator('.diary')).toContainText(text);

	await chronicle.click();
	await expect(page).toHaveURL('/diary?tab=chronicle');
	await expect(chronicle).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator('.chronicle')).toBeVisible();

	await activity.click();
	await expect(page).toHaveURL('/diary');
	await expect(activity).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator('.diary')).toBeVisible();

	// Reproduce the original same-route navigation from a Chronicle entry.
	await chronicle.click();
	await page.getByRole('link', { name: 'Read that day' }).click();
	await expect(page).toHaveURL(`/diary?date=${date}`);
	await expect(activity).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator(`[data-date="${date}"]`)).toHaveAttribute('aria-pressed', 'true');
	await expect(page.locator('.diary')).toContainText(text);
});
