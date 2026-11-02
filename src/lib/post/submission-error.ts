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
	// 画面には再試行の単位しか出さないので、PDS が返した理由はコンソールに残す。
	console.error('[post] submission failed', error, (error as { cause?: unknown })?.cause);
	if (!(error instanceof PostSubmissionError)) return m.postFailedRetry();
	if (error.stage === 'image-upload') return m.postImageUploadFailed();
	if (error.stage === 'link-card-upload') return m.postLinkCardUploadFailed();
	if (isRejectedByServer(error.cause)) return m.postRecordRejected();
	return m.postRecordCreateFailed();
}

/**
 * サーバが内容を見て断った失敗か。AppView の ApiRequestError も @atproto の XRPCError も
 * `status` を持つ。再送しても同じ結果になるので「通信状態を確認」とは出さない。
 * 401（セッション切れ）・408・429 は時間を置けば通りうるので、通信系の扱いに残す。
 */
function isRejectedByServer(cause: unknown): boolean {
	const status = (cause as { status?: unknown } | null)?.status;
	return (
		typeof status === 'number' &&
		status >= 400 &&
		status < 500 &&
		status !== 401 &&
		status !== 408 &&
		status !== 429
	);
}
