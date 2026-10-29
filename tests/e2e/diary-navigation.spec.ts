import { expect, test, type Page } from '@playwright/test';

const date = '2020-02-29';
const text = 'A memorable leap-day diary.';
const moodText = 'Leap day, finally!';

async function mockAppview(page: Page) {
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
			const inRange = Boolean(from && to && from <= date && date <= to);
			body = {
				...(url.searchParams.get('moods') === 'true'
					? {
							moods: inRange
								? [
										{
											uri: 'at://did:plc:playwright-diary/com.suibari.nagi.post/leap',
											date,
											createdAt: `${date}T03:00:00.000Z`,
											valence: 4,
											text: moodText,
										},
									]
								: [],
							moodPending: 0,
						}
					: {}),
				items: inRange
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
}

test('monthly activity keeps the calendar, graphs, diary, tabs, and URL in sync', async ({
	page,
}) => {
	await mockAppview(page);
	await page.goto('/dev/e2e/diary-navigation');
	await page.getByRole('link', { name: 'Open diary deep link' }).click();
	const activity = page.getByRole('tab', { name: 'Monthly activity', exact: true });
	const chronicle = page.getByRole('tab', { name: 'Your chronicle', exact: true });
	const calendarDay = page.locator(`.mood-calendar [data-date="${date}"]`);
	const moodDay = page.locator(`.mood-hit[data-date="${date}"]`);
	const heatmapDay = page.locator(`.diary [data-date="${date}"]`);
	const detail = page.locator('.detail');

	// A date takes precedence even when the URL also requests Chronicle.
	await expect(page).toHaveURL(`/diary?date=${date}&tab=chronicle`);
	await expect(activity).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator('.month-title h2')).toHaveText('February 2020');
	// One selection is shared by the month calendar, the mood graph, and the yearly graph.
	await expect(calendarDay).toHaveAttribute('aria-pressed', 'true');
	await expect(moodDay).toHaveAttribute('aria-pressed', 'true');
	await expect(heatmapDay).toHaveAttribute('aria-pressed', 'true');
	await expect(detail).toContainText(text);
	await expect(detail).toContainText(moodText);

	await chronicle.click();
	await expect(page).toHaveURL('/diary?tab=chronicle');
	await expect(chronicle).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator('.chronicle')).toBeVisible();

	// Coming back from the chronicle keeps the month that was open (the date is dropped).
	await activity.click();
	await expect(page).toHaveURL('/diary?month=2020-02');
	await expect(activity).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator('.activity')).toBeVisible();

	// Reproduce the original same-route navigation from a Chronicle entry.
	await chronicle.click();
	await page.getByRole('link', { name: 'Read that day' }).click();
	await expect(page).toHaveURL(`/diary?date=${date}`);
	await expect(activity).toHaveAttribute('aria-selected', 'true');
	await expect(calendarDay).toHaveAttribute('aria-pressed', 'true');
	await expect(detail).toContainText(text);

	// Deselecting on the mood graph keeps the month; selecting on the calendar brings the date back.
	await moodDay.click();
	await expect(page).toHaveURL('/diary?month=2020-02');
	await expect(calendarDay).toHaveAttribute('aria-pressed', 'false');
	await calendarDay.click();
	await expect(page).toHaveURL(`/diary?date=${date}`);
	await expect(heatmapDay).toHaveAttribute('aria-pressed', 'true');

	// Clicking inside the detail keeps the day; clicking outside or pressing Escape clears it.
	await detail.click();
	await expect(page).toHaveURL(`/diary?date=${date}`);
	await page.locator('.activity-about').click();
	await expect(page).toHaveURL('/diary?month=2020-02');
	await heatmapDay.click();
	await expect(page).toHaveURL(`/diary?date=${date}`);
	await page.keyboard.press('Escape');
	await expect(page).toHaveURL('/diary?month=2020-02');

	// Month navigation.
	await page.getByRole('button', { name: 'Next month' }).click();
	await expect(page).toHaveURL('/diary?month=2020-03');
	await expect(page.locator('.month-title h2')).toHaveText('March 2020');
	await page.getByRole('button', { name: 'Previous month' }).click();
	await expect(page).toHaveURL('/diary?month=2020-02');
	await calendarDay.click();
	await expect(page).toHaveURL(`/diary?date=${date}`);
	await page.getByRole('button', { name: 'This month' }).click();
	await expect(page).toHaveURL('/diary');
});

test('old mood tab links open the monthly activity on that day', async ({ page }) => {
	await mockAppview(page);
	await page.goto('/dev/e2e/diary-navigation');
	await page.getByRole('link', { name: 'Open old mood link' }).click();
	await expect(page.getByRole('tab', { name: 'Monthly activity', exact: true })).toHaveAttribute(
		'aria-selected',
		'true',
	);
	await expect(page.locator(`.mood-calendar [data-date="${date}"]`)).toHaveAttribute(
		'aria-pressed',
		'true',
	);
	await expect(page.locator('.detail')).toContainText(text);
});
