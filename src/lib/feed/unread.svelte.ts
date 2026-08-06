import { createReadWatermark, type ReadWatermark } from '$lib/unread/watermark.svelte';

// フィードは端末ローカルの既読基準だけを持つ。ナビにドットは出さない（グローバルTLは
// 常に更新されるのでドットが光り続けて煩わしい）ため unread ストアは購読しない。
// タブごとに読んだ位置は別なので、キーも分ける。
export const globalFeedRead = createReadWatermark('nagi.feed-read-state.global.v1');
export const homeFeedRead = createReadWatermark('nagi.feed-read-state.home.v1');
export const affirmationFeedRead = createReadWatermark('nagi.feed-read-state.affirmation.v1');

/**
 * タブごとのウォーターマーク。追加できるタブ（チャンネル）は数が決まらないので、
 * 使われたぶんだけ遅延で作る。上の3本は既存キーをそのまま返す — キー文字列を
 * 変えるとその端末の既読が全部リセットされる。
 */
const registry = new Map<string, ReadWatermark>([
	['global', globalFeedRead],
	['home', homeFeedRead],
	['affirmation', affirmationFeedRead],
]);
export function feedRead(key: string): ReadWatermark {
	const existing = registry.get(key);
	if (existing) return existing;
	const watermark = createReadWatermark(`nagi.feed-read-state.${key}.v1`);
	registry.set(key, watermark);
	return watermark;
}
