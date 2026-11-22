import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

async function drag(
	page: Page,
	selector: string,
	dx: number,
	dy: number,
	{ release = true, stepDelay = 0 }: { release?: boolean; stepDelay?: number } = {},
) {
	const box = await page.locator(selector).first().boundingBox();
	if (!box) throw new Error(`Missing ${selector}`);
	const x = box.x + Math.min(180, box.width / 2);
	const y = box.y + Math.min(30, box.height / 2);
	const cdp = await page.context().newCDPSession(page);
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
	for (let i = 1; i <= 8; i++) {
		await cdp.send('Input.dispatchTouchEvent', {
			type: 'touchMove',
			touchPoints: [{ x: x + (dx * i) / 8, y: y + (dy * i) / 8 }],
		});
		if (stepDelay) await page.waitForTimeout(stepDelay);
	}
	if (release) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	if (release) await cdp.detach();
	return cdp;
}

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('nagi-locale', 'ja');
		localStorage.setItem(
			'nagi:feed-tabs:v1.guest',
			JSON.stringify({
				tabs: [
					{ id: 'global', kind: 'global' },
					{ id: 'affirmation', kind: 'custom', source: 'affirmation' },
				],
				updatedAt: '2026-10-26T00:00:00Z',
			}),
		);
	});
	await page.route('**/xrpc/**', (route) =>
		route.fulfill({
			json: { items: [], cards: [], folders: [], uris: [], actors: [], count: 0, drafts: [] },
		}),
	);
	await page.goto('/dev/e2e/feed-interactions');
	await expect(page.getByTestId('refresh-count')).toHaveText('1');
});

test('other people speak from their avatar in both sources', async ({ page }) => {
	await page.getByRole('button', { name: '新着を再現' }).click();
	await expect(page.getByTestId('refresh-count')).toHaveText('2');
	await expect(page.locator('.feed-entering .bubble')).toHaveCSS('animation-name', 'bubble-sprout');
	await expect(page.locator('.feed-entering .bubble')).toHaveCSS('transform-origin', '-32px 20px');
	await page.getByRole('button', { name: '表示切替' }).click();
	await expect(page.getByTestId('refresh-count')).toHaveText('3');
	await page.getByRole('button', { name: '新着を再現' }).click();
	await expect(page.getByTestId('refresh-count')).toHaveText('4');
	await expect(page.locator('[data-bsky-thread] .bubble').first()).toHaveCSS(
		'animation-name',
		'bubble-sprout',
	);
	await expect(page.locator('[data-bsky-thread] .post-row')).toHaveCount(4);
	await expect(page.locator('.thread-gap')).toContainText('2');
	await expect(page.locator('.feed-entering')).toHaveCount(0);
	await page.screenshot({ path: '/tmp/nagi-feed-mobile.png', fullPage: true });
});

test('dragging slides the feed and reveals the neighbouring tab', async ({ page }) => {
	await drag(page, '[data-testid="gesture-area"]', -120, 2, { release: false });
	await expect(page.getByTestId('feed-peek')).toBeVisible();
	await expect(page.getByTestId('peek-tab')).toHaveText('affirmation');
	const shift = await page
		.locator('.feed-track')
		.evaluate((track) => new DOMMatrix(getComputedStyle(track).transform).m41);
	expect(shift).toBeLessThan(-100);
});

test('a slow, short drag snaps back without changing tabs', async ({ page }) => {
	await drag(page, '[data-testid="gesture-area"]', -90, 2, { stepDelay: 80 });
	await expect(page.getByTestId('feed-peek')).toHaveCount(0);
	await expect(page).toHaveURL(/\/dev\/e2e\/feed-interactions$/);
	await expect(page.locator('.feed-track')).toHaveCSS('transform', 'none');
});

test('dragging past the last tab resists and shows no preview', async ({ page }) => {
	await page.goto('/dev/e2e/feed-interactions?tab=affirmation');
	await expect(page.getByTestId('refresh-count')).toHaveText('1');
	await drag(page, '[data-testid="gesture-area"]', -120, 2, { release: false });
	await expect(page.getByTestId('feed-peek')).toHaveCount(0);
	const shift = await page
		.locator('.feed-track')
		.evaluate((track) => new DOMMatrix(getComputedStyle(track).transform).m41);
	expect(shift).toBeGreaterThan(-60);
});

test('a left swipe selects the next feed tab', async ({ page }) => {
	await drag(page, '[data-testid="gesture-area"]', -110, 4);
	await expect(page).toHaveURL(/\/\?tab=affirmation$/);
});

test('long author names stay inside mobile posts and nested replies in both feeds', async ({
	page,
}) => {
	for (const width of [320, 390]) {
		await page.setViewportSize({ width, height: 844 });
		for (const source of ['nagi', 'bsky']) {
			if (source === 'bsky') {
				await page.getByRole('button', { name: '表示切替' }).click();
				await expect(page.locator('.bsky-post')).toHaveCount(4);
			}
			await page.locator('.meta-author-line > a').evaluateAll((authors) => {
				for (const author of authors) {
					author.textContent = 'ひろえもん⚡長い表示名 / ChrySys 💗 long display name '.repeat(5);
				}
			});
			const layout = await page.getByTestId('feed-content').evaluate((feed) => {
				const bounds = feed.getBoundingClientRect();
				return {
					fits: Array.from(feed.querySelectorAll('.bubble, .meta-time')).every((element) => {
						const rect = element.getBoundingClientRect();
						return rect.left >= bounds.left && rect.right <= bounds.right + 1;
					}),
					overflow: feed.scrollWidth - feed.clientWidth,
					truncated: Array.from(feed.querySelectorAll('.meta-author-line > a')).every(
						(element) => element.scrollWidth > element.clientWidth,
					),
				};
			});
			expect(layout).toEqual({ fits: true, overflow: 0, truncated: true });
		}
		await page.getByRole('button', { name: '表示切替' }).click();
	}
});

test('a long name in a Nagi reply does not widen the root post or conversation', async ({
	page,
}) => {
	await page.goto('/dev/e2e/bot-reply-collapse');
	for (const width of [320, 390]) {
		await page.setViewportSize({ width, height: 844 });
		// Exercise both grouped conversations and the legacy parent/reply layout.
		for (const kind of ['bot-root', 'human']) {
			const conversation = page.getByTestId(kind);
			const replyAuthor = conversation.locator('.thread-reply .meta-author-line > a');
			await expect(replyAuthor).toHaveCount(1);
			await replyAuthor.evaluate((author) => {
				author.textContent = 'ひろえもん⚡非公式のド根性お絵かき芸人＠長い名前'.repeat(5);
			});
			const layout = await conversation.evaluate((element) => {
				const bounds = element.getBoundingClientRect();
				const author = element.querySelector('.thread-reply .meta-author-line > a')!;
				return {
					fits: Array.from(element.querySelectorAll('.bubble, .meta-time')).every((bubble) => {
						const rect = bubble.getBoundingClientRect();
						return rect.left >= bounds.left && rect.right <= bounds.right + 1;
					}),
					overflow: element.scrollWidth - element.clientWidth,
					truncated: author.scrollWidth > author.clientWidth,
				};
			});
			expect(layout).toEqual({ fits: true, overflow: 0, truncated: true });
		}
	}
});

test('nested media gestures and short pulls do not reload or change tabs', async ({ page }) => {
	await drag(page, '[data-testid="gesture-area"]', 0, 65);
	await expect(page.getByTestId('refresh-count')).toHaveText('1');
	await drag(page, '[data-feed-gesture-ignore]', -110, 0);
	await expect(page).toHaveURL(/\/dev\/e2e\/feed-interactions$/);
	await expect(page.getByTestId('refresh-count')).toHaveText('1');
});

test('reduced motion disables the shared arrival animation', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.getByRole('button', { name: '新着を再現' }).click();
	await expect(page.getByTestId('refresh-count')).toHaveText('2');
	await expect(page.locator('.bubble').first()).toHaveCSS('animation-name', 'none');
});

test('a right swipe selects the previous feed tab', async ({ page }) => {
	await page.goto('/dev/e2e/feed-interactions?tab=affirmation');
	await expect(page.getByTestId('refresh-count')).toHaveText('1');
	await drag(page, '[data-testid="gesture-area"]', 110, 3);
	await expect(page).toHaveURL(/\/\?tab=global$/);
});

test('a pull that starts while reading lower in the feed does not refresh', async ({ page }) => {
	await page.getByRole('button', { name: '表示切替' }).click();
	await page.evaluate(() => window.scrollTo(0, 100));
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
	const count = await page.getByTestId('refresh-count').textContent();
	await drag(page, '[data-bsky-thread] .bubble', 0, 180);
	await expect(page.getByTestId('refresh-count')).toHaveText(count!);
});

test('downward gestures remain unhandled by the app in both sources', async ({ page }) => {
	for (const source of ['nagi', 'bsky']) {
		if (source === 'bsky') await page.getByRole('button', { name: '表示切替' }).click();
		const count = await page.getByTestId('refresh-count').textContent();
		const prevented = await page.getByTestId('gesture-area').evaluate((target) => {
			const touch = (y: number) => new Touch({ identifier: 1, target, clientX: 180, clientY: y });
			target.dispatchEvent(
				new TouchEvent('touchstart', { bubbles: true, cancelable: true, touches: [touch(200)] }),
			);
			const results = [230, 300, 380].map((y) => {
				const event = new TouchEvent('touchmove', {
					bubbles: true,
					cancelable: true,
					touches: [touch(y)],
				});
				target.dispatchEvent(event);
				return event.defaultPrevented;
			});
			target.dispatchEvent(
				new TouchEvent('touchend', {
					bubbles: true,
					cancelable: true,
					changedTouches: [touch(380)],
				}),
			);
			return results;
		});
		expect(prevented).toEqual([false, false, false]);
		await expect(page.getByTestId('refresh-count')).toHaveText(count!);
	}
});

const imageTile = '.thread-unit .image-tile';

for (const source of ['nagi', 'bsky']) {
	for (const direction of [-1, 1]) {
		test(`${source} image swipe previews and selects the ${direction < 0 ? 'next' : 'previous'} tab`, async ({
			page,
		}) => {
			await page.goto(`/dev/e2e/feed-interactions${direction > 0 ? '?tab=affirmation' : ''}`);
			if (source === 'bsky') await page.getByRole('button', { name: '表示切替' }).click();
			await page.locator(imageTile).first().scrollIntoViewIfNeeded();
			const cdp = await drag(page, imageTile, direction * 140, 0, { release: false });
			await expect(page.getByTestId('feed-peek')).toBeVisible();
			await expect(page.getByTestId('peek-tab')).toHaveText(
				direction < 0 ? 'affirmation' : 'global',
			);
			await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
			await cdp.detach();
			await expect(page).toHaveURL(direction < 0 ? /\/\?tab=affirmation$/ : /\/\?tab=global$/);
			await expect(page.locator('.image-viewer')).toHaveCount(0);
		});
	}

	test(`${source} image tap, keyboard and vertical scrolling remain available`, async ({
		page,
	}) => {
		if (source === 'bsky') await page.getByRole('button', { name: '表示切替' }).click();
		const tile = page.locator(imageTile).first();
		await tile.tap();
		await expect(page.locator('.image-viewer')).toBeVisible();
		await drag(page, '.image-viewer img', -80, 0);
		await expect(page.locator('.image-viewer')).toBeVisible();
		await expect(page.getByTestId('feed-peek')).toHaveCount(0);
		await page.keyboard.press('Escape');
		await tile.focus();
		await page.keyboard.press('Enter');
		await expect(page.locator('.image-viewer')).toBeVisible();
		await page.keyboard.press('Escape');
		await tile.scrollIntoViewIfNeeded();
		const before = await page.evaluate(() => scrollY);
		await drag(page, imageTile, 0, -100);
		await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
		await expect(page.getByTestId('feed-peek')).toHaveCount(0);
		await expect(page.locator('.image-viewer')).toHaveCount(0);
	});
}

for (const ending of ['short', 'edge', 'cancel', 'multitouch']) {
	test(`image ${ending} drag suppresses its click and allows the next tap`, async ({ page }) => {
		const tile = page.locator(imageTile).first();
		await tile.scrollIntoViewIfNeeded();
		const cdp = await drag(page, imageTile, ending === 'edge' ? 70 : -30, 0, {
			release: ending === 'short' || ending === 'edge',
			stepDelay: 60,
		});
		if (ending === 'cancel' || ending === 'multitouch') {
			await tile.evaluate((target, ending) => {
				const touch = (identifier: number) =>
					new Touch({ identifier, target, clientX: 140, clientY: 300 });
				target.dispatchEvent(
					new TouchEvent(ending === 'cancel' ? 'touchcancel' : 'touchstart', {
						bubbles: true,
						touches: ending === 'cancel' ? [] : [touch(1), touch(2)],
					}),
				);
			}, ending);
			await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
			await cdp.detach();
		}
		await expect(page.locator('.feed-track')).toHaveCSS('transform', 'none');
		// Inject the compatibility click even when Chromium itself suppresses it.
		expect(
			await tile.evaluate((target) =>
				target.dispatchEvent(
					new MouseEvent('click', {
						bubbles: true,
						cancelable: true,
						detail: 1,
					}),
				),
			),
		).toBe(false);
		await expect(page.locator('.image-viewer')).toHaveCount(0);
		await expect(page).toHaveURL(/\/dev\/e2e\/feed-interactions$/);
		await tile.tap();
		await expect(page.locator('.image-viewer')).toBeVisible();
	});
}

test('warning controls, ordinary controls and nested scrollers keep their gestures', async ({
	page,
}) => {
	const area = page.getByTestId('protected-controls');
	const selectors = [
		'[data-testid="protected-controls"] .cw-mask',
		'[data-testid="protected-controls"] > button',
		'[data-testid="protected-controls"] > a',
		'[data-testid="protected-controls"] > video',
		'[data-testid="protected-controls"] > audio',
		'.horizontal-scroll .image-tile',
		'.vertical-scroll .image-tile',
	];
	for (const selector of selectors) {
		await page.locator(selector).first().scrollIntoViewIfNeeded();
		await drag(page, selector, -80, 0);
		await expect(page.getByTestId('feed-peek')).toHaveCount(0);
		await expect(page.locator('.feed-track')).toHaveCSS('transform', 'none');
		await expect(page).toHaveURL(/\/dev\/e2e\/feed-interactions$/);
	}
	await area.locator('.cw-mask').tap();
	await expect(area.locator('.cw-rehide')).toBeVisible();
	await area.locator('.cw-rehide').scrollIntoViewIfNeeded();
	await drag(page, '[data-testid="protected-controls"] .cw-rehide', -80, 0);
	await expect(page.getByTestId('feed-peek')).toHaveCount(0);
	await area.locator('.cw-rehide').tap();
	await expect(area.locator('.cw-mask')).toBeVisible();
});
