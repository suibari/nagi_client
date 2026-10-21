/**
 * ハッシュタグの正規形。先頭の # / ＃ を除いた小文字で、AppView の保存・検索・ミュートと同じ。
 * 表示用に原文ケースを残したいとき（プロフィールのタグなど）は使わないこと。
 */
export const normalizeTag = (value: string): string =>
	value
		.trim()
		.replace(/^[#＃]+/, '')
		.trim()
		.toLowerCase();

/** タグの投稿一覧（/search のタグモード）へのリンク。 */
export const hashtagHref = (tag: string): string =>
	`/search?tag=${encodeURIComponent(normalizeTag(tag))}`;
