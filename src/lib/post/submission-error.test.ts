import { describe, expect, it } from 'vitest';
import { PostSubmissionError, postSubmissionErrorMessage } from './submission-error';

describe('postSubmissionErrorMessage', () => {
	it.each([
		['image-upload', '画像をアップロードできませんでした'],
		['link-card-upload', 'リンクカードの画像をアップロードできませんでした'],
		['record-create', '投稿を保存できませんでした'],
	] as const)('reports the failed stage: %s', (stage, expected) => {
		const cause = new Error('network detail');
		const error = new PostSubmissionError(stage, cause);
		expect(error.cause).toBe(cause);
		expect(postSubmissionErrorMessage(error)).toContain(expected);
	});

	it('does not blame the connection when the server rejected the post', () => {
		const rejected = Object.assign(new Error('Reply root is not a kossori post'), { status: 400 });
		const message = postSubmissionErrorMessage(new PostSubmissionError('record-create', rejected));
		expect(message).toContain('受け付けてもらえませんでした');
		expect(message).not.toContain('通信状態');
	});

	it.each([401, 408, 429, 500, 502])('keeps the retry message for status %d', (status) => {
		const cause = Object.assign(new Error('transient'), { status });
		expect(postSubmissionErrorMessage(new PostSubmissionError('record-create', cause))).toContain(
			'通信状態を確認',
		);
	});

	it('uses an actionable fallback for an unclassified failure', () => {
		expect(postSubmissionErrorMessage(new Error('unknown'))).toContain('もう一度投稿してください');
	});
});
