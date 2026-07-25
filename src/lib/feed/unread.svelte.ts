import { createReadWatermark } from '$lib/unread/watermark.svelte';

// フィードは端末ローカルの既読基準だけを持つ。ナビにドットは出さない（グローバルTLは
// 常に更新されるのでドットが光り続けて煩わしい）ため unread ストアは購読しない。
// タブごとに読んだ位置は別なので、キーも分ける。
export const globalFeedRead = createReadWatermark('nagi.feed-read-state.global.v1');
export const affirmationFeedRead = createReadWatermark('nagi.feed-read-state.affirmation.v1');
