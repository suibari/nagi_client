import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

const did = 'did:plc:playwright-video';
const fixtures = new URL('./fixtures/', import.meta.url);
const blob = {
	$type: 'blob',
	ref: { $link: 'bafkreiuploadedvideo' },
	mimeType: 'video/mp4',
	size: 29060,
};

async function mockServices(page: Page) {
	const calls = {
		serviceAuth: [] as string[],
		createdRecord: undefined as unknown,
		savedRecord: undefined as unknown,
		polls: 0,
	};
	await page.route('**/xrpc/**', async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		const method = url.pathname.split('/').pop();
		const json = (body: unknown, status = 200) =>
			route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

		if (url.host === 'video.bsky.app') {
			if (method === 'app.bsky.video.getUploadLimits')
				return json({ canUpload: true, remainingDailyVideos: 100, remainingDailyBytes: 1e10 });
			if (method === 'app.bsky.video.uploadVideo')
				return json({ did, jobId: 'job-1', state: 'JOB_STATE_CREATED' });
			if (method === 'app.bsky.video.getJobStatus') {
				calls.polls++;
				return json({
					jobStatus:
						calls.polls < 2
							? { jobId: 'job-1', did, state: 'JOB_STATE_ENCODING', progress: 50 }
							: { jobId: 'job-1', did, state: 'JOB_STATE_COMPLETED', blob },
				});
			}
		}
		if (method === 'com.atproto.server.getServiceAuth') {
			calls.serviceAuth.push(`${url.searchParams.get('aud')} ${url.searchParams.get('lxm')}`);
			return json({ token: 'service-token' });
		}
		if (method === 'com.atproto.repo.createRecord') {
			calls.createdRecord = request.postDataJSON().record;
			return json({ uri: `at://${did}/com.suibari.nagi.post/new`, cid: 'bafynew' });
		}
		if (method === 'com.atproto.repo.putRecord') {
			calls.savedRecord = request.postDataJSON().record;
			return json({
				uri: `at://${did}/com.suibari.nagi.post/video`,
				cid: 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi',
			});
		}
		if (
			method === 'com.atproto.repo.getRecord' &&
			url.searchParams.get('collection') === 'com.suibari.nagi.post'
		)
			return json({
				uri: `at://${did}/com.suibari.nagi.post/video`,
				cid: 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi',
				value: {
					$type: 'com.suibari.nagi.post',
					text: '動画つきの投稿',
					createdAt: '2026-10-09T00:00:00.000Z',
					embed: {
						$type: 'com.suibari.nagi.post#video',
						video: { ...blob, ref: { $link: 'bafkreivideofixture' } },
						alt: '走る猫',
					},
				},
			});
		if (method === 'com.atproto.repo.getRecord')
			return json({
				uri: `at://${did}/com.suibari.nagi.profile/self`,
				cid: 'bafyreidnq5e4j7qaw5l4dpa4g5vjt4y5dpjywqrnit23nkrnnjwf5f24xi',
				value: { $type: 'com.suibari.nagi.profile', displayName: '動画確認用' },
			});
		return json({ drafts: [], items: [], folders: [], uris: [] });
	});
	await page.route('https://video.bsky.app/watch/**/thumbnail.jpg', (route) =>
		route.fulfill({
			contentType: 'image/jpeg',
			body: readFileSync(new URL('thumbnail.jpg', fixtures)),
		}),
	);
	return calls;
}

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('nagi-locale', 'ja'));
});

test('動画を添付すると変換が終わるまで投稿できず、終わると #video で保存する', async ({ page }) => {
	const calls = await mockServices(page);
	await page.goto('/dev/e2e/video');
	await page.getByRole('button', { name: 'Open composer' }).click();
	const composer = page.locator('.post-modal .composer');
	await expect(composer).toBeVisible();

	await composer.locator('input[type="file"][accept*="video"]').setInputFiles({
		name: 'sample.webm',
		mimeType: 'video/webm',
		buffer: readFileSync(new URL('sample.webm', fixtures)),
	});
	const submit = composer.locator('.submit-primary');
	await expect(submit).toBeDisabled();
	await expect(composer.getByText('動画の準備ができました')).toBeVisible();
	// 動画を付けている間は、画像も2本目の動画も足せない。
	await expect(composer.getByRole('button', { name: '画像・動画を追加' })).toBeDisabled();
	await composer.getByLabel('動画の説明（任意）').fill('テスト動画');
	await expect(submit).toBeEnabled();

	await submit.click();
	await expect.poll(() => calls.createdRecord).toBeTruthy();
	expect(calls.serviceAuth).toEqual([
		'did:web:video.bsky.app app.bsky.video.getUploadLimits',
		'did:web:pds.example com.atproto.repo.uploadBlob',
	]);
	expect((calls.createdRecord as { embed: unknown }).embed).toEqual({
		$type: 'com.suibari.nagi.post#video',
		video: blob,
		alt: 'テスト動画',
		aspectRatio: { width: 320, height: 180 },
	});
});

test('送信中は%、変換中と仕上げ中は段階を出し、ページ離脱を確認する', async ({
	page,
}, testInfo) => {
	let jobState = 'JOB_STATE_ENCODING';
	let releaseUpload: () => void = () => {};
	const uploadHeld = new Promise<void>((resolve) => (releaseUpload = resolve));
	await mockServices(page);
	// mockServices より後に登録したルートが優先される。送信の応答と変換の段階をテスト側で進める。
	await page.route('https://video.bsky.app/xrpc/app.bsky.video.uploadVideo**', async (route) => {
		await uploadHeld;
		await route.fulfill({
			contentType: 'application/json',
			body: JSON.stringify({ did, jobId: 'job-1', state: 'JOB_STATE_CREATED' }),
		});
	});
	await page.route('https://video.bsky.app/xrpc/app.bsky.video.getJobStatus**', (route) =>
		route.fulfill({
			contentType: 'application/json',
			body: JSON.stringify({
				jobStatus:
					jobState === 'JOB_STATE_COMPLETED'
						? { jobId: 'job-1', did, state: jobState, blob }
						: { jobId: 'job-1', did, state: jobState, progress: 0 },
			}),
		}),
	);
	await page.goto('/dev/e2e/video');
	await page.getByRole('button', { name: 'Open composer' }).click();
	const composer = page.locator('.post-modal .composer');
	await composer.locator('input[type="file"][accept*="video"]').setInputFiles({
		name: 'sample.webm',
		mimeType: 'video/webm',
		buffer: readFileSync(new URL('sample.webm', fixtures)),
	});
	const attachment = composer.locator('.video-attachment');
	const progress = attachment.locator('progress');
	const shot = (name: string) =>
		attachment.screenshot({ path: testInfo.outputPath(`video-${name}.png`) });

	await expect(attachment).toContainText(/動画を送信中…（\d+%）/);
	await expect(progress).toHaveAttribute('value', /\d+/);
	await shot('uploading');

	// 送信中にページを離れようとすると、ブラウザの離脱確認が出る。
	const dialog = page.waitForEvent('dialog');
	void page.evaluate(() => location.reload());
	const prompt = await dialog;
	expect(prompt.type()).toBe('beforeunload');
	await prompt.dismiss();

	releaseUpload();
	await expect(attachment).toContainText('動画を変換中…');
	await expect(progress).not.toHaveAttribute('value');
	await expect(composer.locator('.submit-primary')).toBeDisabled();
	await shot('processing');

	jobState = 'JOB_STATE_UPLOADING';
	await expect(attachment).toContainText('動画を仕上げ中…');
	await shot('finishing');

	jobState = 'JOB_STATE_COMPLETED';
	await expect(attachment).toContainText('動画の準備ができました');
	await expect(progress).toHaveCount(0);
	await composer.locator('textarea, [contenteditable="true"]').first().fill('動画のテスト');
	await expect(composer.locator('.submit-primary')).toBeEnabled();
	await shot('ready');
	await page.screenshot({ path: testInfo.outputPath('video-composer.png') });
});

test('以前に送った動画で PDS に残っていなければ、添付の時点で理由を出す', async ({ page }) => {
	await mockServices(page);
	// 同じ動画の再送。サービスは 409 と前回の blob を返すが、PDS からは消えている。
	await page.route('https://video.bsky.app/xrpc/app.bsky.video.uploadVideo**', (route) =>
		route.fulfill({
			status: 409,
			contentType: 'application/json',
			body: JSON.stringify({
				did,
				jobId: 'job-old',
				state: 'JOB_STATE_COMPLETED',
				blob,
				error: 'already_exists',
				message: 'Video already processed',
			}),
		}),
	);
	await page.route('https://pds.example/xrpc/com.atproto.sync.getBlob**', (route) =>
		route.fulfill({
			status: 400,
			contentType: 'application/json',
			body: JSON.stringify({ error: 'BlobNotFound', message: 'Blob not found' }),
		}),
	);
	await page.goto('/dev/e2e/video');
	await page.getByRole('button', { name: 'Open composer' }).click();
	const composer = page.locator('.post-modal .composer');
	await composer.locator('input[type="file"][accept*="video"]').setInputFiles({
		name: 'sample.webm',
		mimeType: 'video/webm',
		buffer: readFileSync(new URL('sample.webm', fixtures)),
	});
	await expect(composer.locator('.video-attachment [role="alert"]')).toContainText(
		'この動画は以前に送信済みのため',
	);
	await expect(composer.locator('.submit-primary')).toBeDisabled();
});

test('画像と動画を一緒に選ぶと、動画は付けずに理由を出す', async ({ page }) => {
	await mockServices(page);
	await page.goto('/dev/e2e/video');
	await page.getByRole('button', { name: 'Open composer' }).click();
	const composer = page.locator('.post-modal .composer');
	await composer.locator('input[type="file"][accept*="video"]').setInputFiles([
		{
			name: 'sample.webm',
			mimeType: 'video/webm',
			buffer: readFileSync(new URL('sample.webm', fixtures)),
		},
		{
			name: 'thumbnail.jpg',
			mimeType: 'image/jpeg',
			buffer: readFileSync(new URL('thumbnail.jpg', fixtures)),
		},
	]);
	await expect(composer.getByRole('alert')).toHaveText('動画は画像と一緒に添付できません');
	await expect(composer.locator('.video-attachment')).toHaveCount(0);
});

test('投稿の編集で、動画を外して画像ボタンから別の動画に差し替えられる', async ({ page }) => {
	const calls = await mockServices(page);
	await page.goto('/dev/e2e/video');
	const fixture = page.getByTestId('video-fixture');
	await fixture.getByRole('button', { name: 'その他の投稿操作' }).click();
	await fixture.getByRole('menuitem', { name: '編集' }).click();
	const editor = fixture.locator('.inline-edit');
	const add = editor.getByRole('button', { name: '画像・動画を追加' });

	// 動画が付いている間は、画像も動画も足せない。
	await expect(add).toBeDisabled();
	await editor.getByRole('button', { name: '動画を削除' }).click();
	await expect(add).toBeEnabled();

	await editor.locator('input[type="file"][accept*="video"]').setInputFiles({
		name: 'sample.webm',
		mimeType: 'video/webm',
		buffer: readFileSync(new URL('sample.webm', fixtures)),
	});
	await expect(editor.getByText('動画の準備ができました')).toBeVisible();
	await expect(add).toBeDisabled();
	await editor.getByRole('button', { name: '投稿する' }).click();
	await expect(editor).toHaveCount(0);

	await expect
		.poll(() => calls.savedRecord)
		.toMatchObject({
			embed: {
				$type: 'com.suibari.nagi.post#video',
				video: blob,
				aspectRatio: { width: 320, height: 180 },
			},
		});
});

/**
 * video.bsky.app と同じ形の HLS を返す。実物は断片を video.cdn.bsky.app へ 302 するが、
 * Playwright はモックしたリダイレクトの行き先を再び横取りできないので、断片は直接返す。
 */
async function mockHls(page: Page) {
	const base = `https://video.bsky.app/watch/${encodeURIComponent(did)}/bafkreivideofixture`;
	const cors = { 'access-control-allow-origin': '*' };
	await page.route(`${base}/playlist.m3u8`, (route) =>
		route.fulfill({
			headers: cors,
			contentType: 'application/vnd.apple.mpegurl',
			body: [
				'#EXTM3U',
				'#EXT-X-VERSION:3',
				'#EXT-X-STREAM-INF:BANDWIDTH=300000,CODECS="avc1.4d401e,mp4a.40.2",RESOLUTION=320x180',
				'360p/video.m3u8?session_id=fixture',
				'',
			].join('\n'),
		}),
	);
	await page.route(`${base}/360p/video.m3u8**`, (route) =>
		route.fulfill({
			headers: cors,
			contentType: 'application/vnd.apple.mpegurl',
			body: readFileSync(new URL('hls/video.m3u8', fixtures)),
		}),
	);
	await page.route(`${base}/360p/video0.ts**`, (route) =>
		route.fulfill({
			headers: cors,
			contentType: 'video/mp2t',
			body: readFileSync(new URL('hls/video0.mp2t', fixtures)),
		}),
	);
}

test('動画はサムネイルと再生ボタンで表示し、タップで hls.js 経由で再生する', async ({ page }) => {
	await mockServices(page);
	await mockHls(page);
	await page.goto('/dev/e2e/video');
	const frame = page.locator('[data-testid="video-fixture"] .video-frame');
	const play = frame.getByRole('button', { name: '動画を再生: 走る猫' });
	await expect(play).toBeVisible();
	await expect(frame.locator('img')).toHaveAttribute('src', /thumbnail\.jpg$/);
	await expect(frame.locator('video')).toHaveCount(0);

	await play.click();
	const video = frame.locator('video');
	await expect(video).toHaveAttribute('aria-label', '走る猫');
	// MSE（hls.js）で再生している。Chrome は canPlayType で HLS に 'maybe' を返すが、
	// 組み込み再生は本番の video.cdn.bsky.app へのリダイレクトで失敗した（2026-10-10）。
	await expect
		.poll(() => video.evaluate((el: HTMLVideoElement) => el.currentSrc))
		.toMatch(/^blob:/);
	await expect
		.poll(() => video.evaluate((el: HTMLVideoElement) => el.readyState))
		.toBeGreaterThanOrEqual(2);
	await expect(frame.locator('.video-error')).toHaveCount(0);
});
