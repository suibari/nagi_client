import { expect, test, type Page } from '@playwright/test';

const date = '2020-02-29';
const text = 'A memorable leap-day diary.';
const moodText = 'Leap day, finally!';

async function mockAppview(page: Page, longDiary = false) {
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
			const activityCounts = [0, 1, 4, 5, 9, 10, 19, 20, 32, undefined];
			const extraEntries =
				longDiary && inRange
					? activityCounts.map((postCount, i) => ({
							uri: `at://did:plc:playwright-diary/com.suibari.nagi.diary/day${i}`,
							cid: 'bafy-diary',
							subject: 'did:plc:playwright-diary',
							date: `2020-02-${String(i + 2).padStart(2, '0')}`,
							text: 'A quiet diary.',
							postCount,
							createdAt: `${date}T12:00:00.000Z`,
							indexedAt: `${date}T12:00:00.000Z`,
						}))
					: [];
			const extraMoods =
				longDiary && inRange
					? Array.from({ length: 10 }, (_, i) => ({
							uri: `at://did:plc:playwright-diary/com.suibari.nagi.post/day${i}`,
							date: `2020-02-${String(i + 3).padStart(2, '0')}`,
							createdAt: `2020-02-${String(i + 3).padStart(2, '0')}T03:00:00.000Z`,
							valence: [-4, -2, 1, 3, 5][i % 5],
							text: 'A moment from this day.',
						}))
					: [];

			body = {
				...(url.searchParams.get('moods') === 'true'
					? {
							moods: inRange
								? [
										...extraMoods,
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
							...extraEntries,
							{
								uri: 'at://did:plc:playwright-diary/com.suibari.nagi.diary/leap-day',
								cid: 'bafy-diary',
								subject: 'did:plc:playwright-diary',
								date,
								text: longDiary
									? Array(16)
											.fill(text + ' A day of conversations, small discoveries, and time to pause.')
											.join('\n\n')
									: text,
								postCount: 12,
								...(longDiary
									? {
											titleEn:
												'A very long diary title with many memorable moments and people to look back on together',
											involvedActors: Array.from({ length: 10 }, (_, i) => ({
												did: `did:plc:person${i}`,
												handle: `person${i}.example`,
												displayName: `Person ${i}`,
											})),
										}
									: {}),
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
	const detail = page.locator('.detail');

	// A date takes precedence even when the URL also requests Chronicle.
	await expect(page).toHaveURL(`/diary?date=${date}&tab=chronicle`);
	await expect(activity).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator('.month-title h2')).toHaveText('February 2020');
	// One selection is shared by the month calendar and the mood graph.
	await expect(calendarDay).toHaveAttribute('aria-pressed', 'true');
	await expect(moodDay).toHaveAttribute('aria-pressed', 'true');
	await expect(page.locator('.activity .diary')).toHaveCount(0);
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
	await expect(page.locator('.activity .diary')).toHaveCount(0);

	// Clicking inside the detail keeps the day; clicking outside or pressing Escape clears it.
	await detail.click();
	await expect(page).toHaveURL(`/diary?date=${date}`);
	await page.locator('.activity-about').click();
	await expect(page).toHaveURL('/diary?month=2020-02');
	await calendarDay.click();
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

for (const width of [375, 768, 1280]) {
	for (const theme of ['light', 'dark']) {
		test(`monthly overview and long diary fit ${width}px in ${theme} mode`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.addInitScript((theme) => localStorage.setItem('nagi-theme', theme), theme);
			await mockAppview(page, true);
			await page.goto('/dev/e2e/diary-navigation');
			await page.getByRole('link', { name: 'Open diary deep link' }).click();
			const day = page.locator(`.mood-calendar [data-date="${date}"]`);
			await expect(day).toHaveAttribute('aria-label', /12 posts/);
			await expect(day).toHaveCSS('--cell-percent', '80%');
			await expect(page.locator('.detail-stats')).toContainText('12 posts');
			await expect(page.locator('.detail')).toContainText(text);
			const calendar = await page.locator('.calendar-card').boundingBox();
			const chart = await page.locator('.mood').boundingBox();
			const detail = await page.locator('.detail').boundingBox();
			const activity = await page.locator('.activity').boundingBox();
			expect(chart!.y).toBeGreaterThanOrEqual(calendar!.y + calendar!.height);
			expect(detail!.y).toBeGreaterThanOrEqual(chart!.y + chart!.height);
			expect(detail!.width).toBeCloseTo(activity!.width, 0);
			expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
				true,
			);
			await page.getByRole('link', { name: 'Go to the selected day’s diary' }).click();
			await expect(page.locator('#activity-diary')).toBeFocused();
			await expect(page).toHaveURL(`/diary?date=${date}&tab=chronicle`);
			await page.screenshot({
				path: `/tmp/monthly-activity-${width}-${theme}.png`,
				fullPage: true,
			});
		});
	}
}

test('calendar distinguishes missing counts, unscored moods, and days without diaries', async ({
	page,
}) => {
	await mockAppview(page, true);
	await page.goto('/dev/e2e/diary-navigation');
	await page.getByRole('link', { name: 'Open diary deep link' }).click();
	const day = (date: string) => page.locator(`.mood-calendar [data-date="${date}"]`);
	await expect(day('2020-02-02')).toHaveAttribute(
		'aria-label',
		/Mood unavailable · 0 posts · Has a diary/,
	);
	await expect(day('2020-02-02')).toHaveCSS('--cell-percent', '20%');
	await day('2020-02-02').click();
	await expect(page.locator('.detail-stats')).toContainText('0 posts');
	await expect(page.locator('.detail-stats')).toContainText('Mood unavailable');
	await day('2020-02-11').click();
	await expect(day('2020-02-11')).toHaveCSS('--cell-percent', '60%');
	await expect(page.locator('.detail-stats')).toContainText('Post count unknown');
	await day('2020-02-12').click();
	await expect(day('2020-02-12').locator('.diary-dot')).toHaveCount(0);
	await expect(page.locator('.detail')).toContainText('No diary for this day.');
	await expect(page.locator('.detail-posts')).toHaveAttribute('open', '');
	await day('2020-02-01').click();
	await expect(page.locator('.detail')).toContainText('No diary for this day.');
	await expect(page.locator('.detail-stats')).toContainText('Mood unavailable');
	await page.getByRole('button', { name: 'Previous month' }).click();
	await expect(page.locator('.detail')).toContainText(
		'No diary or mood records for this month yet.',
	);
	await expect(page.locator('.diary-jump')).toHaveCount(0);
});
