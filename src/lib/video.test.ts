import { describe, expect, it, vi } from 'vitest';
import {
	blueskyVideoUrls,
	checkVideoFile,
	checkVideoMetadata,
	isMissingScopeError,
	jobStatusOf,
	MAX_VIDEO_SIZE,
	phaseOfJobState,
	VideoUploadError,
	waitForVideoJob,
} from './video';

const codeOf = (run: () => unknown) => {
	try {
		run();
	} catch (error) {
		return error instanceof VideoUploadError ? error.code : 'unexpected';
	}
	return undefined;
};

describe('checkVideoFile / checkVideoMetadata', () => {
	it('accepts videos Bluesky can process and rejects the rest before uploading', () => {
		expect(codeOf(() => checkVideoFile({ type: 'video/mp4', size: 10 }))).toBeUndefined();
		expect(codeOf(() => checkVideoFile({ type: 'video/quicktime', size: 10 }))).toBeUndefined();
		expect(codeOf(() => checkVideoFile({ type: 'image/gif', size: 10 }))).toBe('type');
		expect(codeOf(() => checkVideoFile({ type: 'video/mp4', size: MAX_VIDEO_SIZE + 1 }))).toBe(
			'size',
		);
	});

	it('limits videos to three minutes', () => {
		const aspectRatio = { width: 16, height: 9 };
		expect(codeOf(() => checkVideoMetadata({ duration: 180, aspectRatio }))).toBeUndefined();
		expect(codeOf(() => checkVideoMetadata({ duration: 180.5, aspectRatio }))).toBe('duration');
		expect(codeOf(() => checkVideoMetadata({ duration: Number.NaN, aspectRatio }))).toBe(
			'metadata',
		);
	});
});

describe('jobStatusOf', () => {
	it('reads both the flat response the service sends and the lexicon-wrapped form', () => {
		expect(jobStatusOf({ did: 'did:plc:a', jobId: 'job', state: 'JOB_STATE_CREATED' })).toEqual({
			did: 'did:plc:a',
			jobId: 'job',
			state: 'JOB_STATE_CREATED',
		});
		expect(jobStatusOf({ jobStatus: { jobId: 'job', state: 'JOB_STATE_ENCODING' } })?.jobId).toBe(
			'job',
		);
		expect(jobStatusOf({ error: 'InvalidRequest' })).toBeUndefined();
		expect(jobStatusOf(null)).toBeUndefined();
	});
});

describe('waitForVideoJob', () => {
	const blob = {
		$type: 'blob' as const,
		ref: { $link: 'bafkreivideo' },
		mimeType: 'video/mp4',
		size: 107296,
	};
	const respond = (jobStatus: unknown) => new Response(JSON.stringify({ jobStatus }));

	it('polls until the job completes and returns the stored blob', async () => {
		const states: string[] = [];
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(respond({ jobId: 'job', state: 'JOB_STATE_ENCODING', progress: 40 }))
			.mockRejectedValueOnce(new Error('network'))
			.mockResolvedValueOnce(respond({ jobId: 'job', state: 'JOB_STATE_COMPLETED', blob }));

		await expect(
			waitForVideoJob('job', {
				fetch: fetcher,
				intervalMs: 0,
				onState: (state) => states.push(state),
			}),
		).resolves.toEqual(blob);
		expect(fetcher).toHaveBeenCalledTimes(3);
		expect(String(fetcher.mock.calls[0][0])).toBe(
			'https://video.bsky.app/xrpc/app.bsky.video.getJobStatus?jobId=job',
		);
		expect(states).toEqual(['JOB_STATE_ENCODING']);
	});

	it('surfaces a failed job as a processing error', async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValue(respond({ jobId: 'job', state: 'JOB_STATE_FAILED', message: 'bad' }));

		await expect(waitForVideoJob('job', { fetch: fetcher, intervalMs: 0 })).rejects.toMatchObject({
			code: 'processing',
			detail: 'bad',
		});
	});

	it('gives up after the timeout', async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValue(respond({ jobId: 'job', state: 'JOB_STATE_ENCODING' }));

		await expect(
			waitForVideoJob('job', { fetch: fetcher, intervalMs: 0, timeoutMs: 0 }),
		).rejects.toMatchObject({ code: 'processing' });
	});
});

describe('phaseOfJobState', () => {
	it('shows only the stage, because the service progress resets per stage', () => {
		expect(phaseOfJobState('JOB_STATE_CREATED')).toBe('processing');
		expect(phaseOfJobState('JOB_STATE_ENCODING')).toBe('processing');
		expect(phaseOfJobState('JOB_STATE_UPLOADING')).toBe('finishing');
		expect(phaseOfJobState(undefined)).toBe('processing');
	});
});

describe('helpers', () => {
	it('builds the same playback URLs as the AppView', () => {
		expect(blueskyVideoUrls('did:plc:abc', 'bafkreix')).toEqual({
			playlist: 'https://video.bsky.app/watch/did%3Aplc%3Aabc/bafkreix/playlist.m3u8',
			thumbnail: 'https://video.bsky.app/watch/did%3Aplc%3Aabc/bafkreix/thumbnail.jpg',
		});
	});

	it('recognizes a missing OAuth scope so the UI can offer reauthorization', () => {
		expect(isMissingScopeError({ error: 'ScopeMissingError' })).toBe(true);
		expect(isMissingScopeError(new Error('Missing required scope "rpc:..."'))).toBe(true);
		expect(isMissingScopeError(new Error('fetch failed'))).toBe(false);
	});
});
