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

	it('uses an actionable fallback for an unclassified failure', () => {
		expect(postSubmissionErrorMessage(new Error('unknown'))).toContain('もう一度投稿してください');
	});
});
