import { describe, expect, it } from 'vitest';
import { crosspostContentWarningBlock } from './content-warning';

describe('crosspostContentWarningBlock', () => {
	it('blocks blurred text, which Bluesky cannot hide', () => {
		expect(
			crosspostContentWarningBlock({ text: 'spoiler ||hidden||', mediaWarning: false, labels: [] }),
		).toBe('text');
		// ラベルを付けても本文の伏せ字は Bluesky で伏せられない。
		expect(
			crosspostContentWarningBlock({
				text: 'spoiler ||hidden||',
				mediaWarning: true,
				labels: ['sexual'],
			}),
		).toBe('text');
	});

	it('blocks blurred media without a label Bluesky would blur by', () => {
		expect(crosspostContentWarningBlock({ text: 'hi', mediaWarning: true, labels: [] })).toBe(
			'media',
		);
		expect(
			crosspostContentWarningBlock({ text: 'hi', mediaWarning: true, labels: ['ai-generated'] }),
		).toBe('media');
	});

	it('allows blurred media carried over as a Bluesky self-label', () => {
		for (const label of ['sexual', 'graphic-media', 'nudity', 'porn'])
			expect(
				crosspostContentWarningBlock({ text: 'hi', mediaWarning: true, labels: [label] }),
			).toBeUndefined();
	});

	it('allows posts without any content warning', () => {
		expect(crosspostContentWarningBlock({ text: 'hi', mediaWarning: false, labels: [] })).toBe(
			undefined,
		);
		expect(
			crosspostContentWarningBlock({ text: 'hi', mediaWarning: false, labels: ['sexual'] }),
		).toBeUndefined();
	});
});
