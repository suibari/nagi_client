import { m } from '$lib/i18n/i18n.svelte';

export type PostSubmissionStage = 'image-upload' | 'link-card-upload' | 'record-create';

/** 投稿失敗を、利用者が再試行できる単位まで分類して保持する。 */
export class PostSubmissionError extends Error {
	constructor(
		readonly stage: PostSubmissionStage,
		cause: unknown,
	) {
		super(cause instanceof Error ? cause.message : 'Post submission failed', { cause });
		this.name = 'PostSubmissionError';
	}
}

export function postSubmissionErrorMessage(error: unknown): string {
	if (!(error instanceof PostSubmissionError)) return m.postFailedRetry();
	if (error.stage === 'image-upload') return m.postImageUploadFailed();
	if (error.stage === 'link-card-upload') return m.postLinkCardUploadFailed();
	return m.postRecordCreateFailed();
}
