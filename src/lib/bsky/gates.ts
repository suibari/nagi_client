/** 返信できる人（BSKY-12）。Bluesky の threadgate の allow に対応する。 */
export type ReplyAudience = 'everyone' | 'following' | 'followers' | 'mentioned' | 'nobody';
export const REPLY_AUDIENCES: ReplyAudience[] = [
	'everyone',
	'following',
	'followers',
	'mentioned',
	'nobody',
];

export type BskyGateSettings = { reply: ReplyAudience; allowQuote: boolean };
/** Bluesky の既定と同じ。何も付けない。 */
export const DEFAULT_BSKY_GATES: BskyGateSettings = { reply: 'everyone', allowQuote: true };

export const THREADGATE = 'app.bsky.feed.threadgate';
export const POSTGATE = 'app.bsky.feed.postgate';

const RULES: Record<Exclude<ReplyAudience, 'everyone' | 'nobody'>, string> = {
	following: `${THREADGATE}#followingRule`,
	followers: `${THREADGATE}#followerRule`,
	mentioned: `${THREADGATE}#mentionRule`,
};

/** threadgate のレコード。誰でも返信できるなら付けない（undefined）。 */
export function threadgateRecord(postUri: string, reply: ReplyAudience, createdAt: string) {
	if (reply === 'everyone') return undefined;
	return {
		$type: THREADGATE,
		post: postUri,
		allow: reply === 'nobody' ? [] : [{ $type: RULES[reply] }],
		createdAt,
	};
}

/** postgate のレコード。引用を許すなら付けない（undefined）。 */
export function postgateRecord(postUri: string, allowQuote: boolean, createdAt: string) {
	if (allowQuote) return undefined;
	return {
		$type: POSTGATE,
		post: postUri,
		embeddingRules: [{ $type: `${POSTGATE}#disableRule` }],
		createdAt,
	};
}

/**
 * 既存の threadgate から、返信できる人を読み取る。allow が無いのは誰でも、空配列は誰も返信できない。
 * Bluesky 公式アプリで複数の条件やリストを組み合わせた設定は Nagi の選択肢に無いので undefined。
 */
export function replyAudienceOf(record: unknown): ReplyAudience | undefined {
	const allow = (record as { allow?: { $type?: string }[] } | undefined)?.allow;
	if (!allow) return 'everyone';
	if (allow.length === 0) return 'nobody';
	if (allow.length > 1) return undefined;
	const rule = Object.entries(RULES).find(([, type]) => type === allow[0].$type);
	return rule ? (rule[0] as ReplyAudience) : undefined;
}

export const rkeyOf = (uri: string) => uri.slice(uri.lastIndexOf('/') + 1);
