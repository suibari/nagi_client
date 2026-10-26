/** Shared timeline rule: keep the root and the last three replies. */
export const VISIBLE_REPLY_COUNT = 3;
export function threadPreview<T>(replies: T[]) {
	return {
		visible: replies.slice(-VISIBLE_REPLY_COUNT),
		hiddenCount: Math.max(0, replies.length - VISIBLE_REPLY_COUNT),
	};
}
