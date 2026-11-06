import { expect, test, type Page } from '@playwright/test';

const date = '2020-02-29';
const uri = 'at://did:plc:playwright-diary/com.suibari.nagi.post/leap';
const aiMood = { uri, date, createdAt: `${date}T03:00:00.000Z`, valence: 4, text: 'Leap day!' };

/** setPostMood の返事を順に差し替える。null は権限不足（古いセッション）。 */
async function mockAppview(page: Page, replies: Array<Record<string, unknown> | null>) {
	const sent: unknown[] = [];
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'en'));
	await page.route('**/xrpc/**', async (route) => {
		const url = new URL(route.request().url());
		const method = url.pathname.split('/').pop();
		if (method === 'com.suibari.nagi.setPostMood') {
			sent.push(route.request().postDataJSON());
			const reply = replies.shift();
			if (reply === null)
				await route.fulfill({
					status: 403,
					json: { error: 'ScopeMissingError', message: 'Missing required scope' },
				});
			else await route.fulfill({ json: reply ?? {} });
			return;
		}
		if (method === 'com.suibari.nagi.getDiaries') {
			const from = url.searchParams.get('from');
			const to = url.searchParams.get('to');
			const inRange = Boolean(from && to && from <= date && date <= to);
			await route.fulfill({
				json: {
					items: [],
					hasMore: false,
					...(url.searchParams.get('moods') === 'true'
						? { moods: inRange ? [aiMood] : [], moodPending: 0 }
						: {}),
				},
			});
			return;
		}
		await route.fulfill({ json: { items: [], folders: [], uris: [], drafts: [], hasMore: false } });
	});
	return sent;
}

async function openDay(page: Page) {
	await page.goto('/dev/e2e/diary-navigation');
	await page.getByRole('link', { name: 'Open old mood link' }).click();
	await expect(page.locator(`.mood-calendar [data-date="${date}"]`)).toHaveAttribute(
		'aria-pressed',
		'true',
	);
}

test('the owner can change a mood point, see it marked, and go back to Bot-tan’s value', async ({
	page,
}) => {
	const sent = await mockAppview(page, [
		{ mood: { ...aiMood, valence: -2, edited: true } },
		{ mood: aiMood },
	]);
	await openDay(page);

	const chip = page.getByRole('button', { name: 'Mood +4. Tap to change' });
	await chip.click();
	const editor = page.getByRole('group', { name: 'Change mood' });
	await expect(editor).toBeVisible();
	await expect(editor.getByRole('button', { name: '+4' })).toHaveAttribute('aria-pressed', 'true');
	// 0 は中立の意味になるので選べない。
	await expect(editor.getByRole('button', { name: '0', exact: true })).toHaveCount(0);
	await page.screenshot({ path: 'test-results/mood-edit-open.png', fullPage: true });

	await editor.getByRole('button', { name: '-2' }).click();
	await expect(editor).toHaveCount(0);
	const edited = page.getByRole('button', { name: 'Mood -2. Tap to change' });
	await expect(edited).toHaveClass(/mood-chip--edited/);
	await expect(page.locator('.mood-day')).toContainText('Set by you');
	await page.screenshot({ path: 'test-results/mood-edit-saved.png', fullPage: true });

	await edited.click();
	await page.getByRole('button', { name: "Use Bot-tan's value" }).click();
	await expect(page.getByRole('button', { name: 'Mood +4. Tap to change' })).not.toHaveClass(
		/mood-chip--edited/,
	);
	await expect(page.locator('.mood-day')).not.toContainText('Set by you');
	expect(sent).toEqual([{ uri, valence: -2 }, { uri }]);
});

test('an older session is asked to refresh permissions instead of failing silently', async ({
	page,
}) => {
	await mockAppview(page, [null]);
	await openDay(page);

	await page.getByRole('button', { name: 'Mood +4. Tap to change' }).click();
	await page
		.getByRole('group', { name: 'Change mood' })
		.getByRole('button', { name: '+5' })
		.click();
	await expect(page.getByRole('alert')).toContainText('needs updated permissions');
	await expect(
		page.getByRole('button', { name: 'Sign in again to update permissions' }),
	).toBeVisible();
	// 保存できなかったので、値は botたんのまま。
	await expect(page.getByRole('button', { name: 'Mood +4. Tap to change' })).toBeVisible();
});
