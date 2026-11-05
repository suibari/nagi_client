import { writable } from 'svelte/store';
import { startVisiblePolling } from '$lib/polling';
import { cardCollections } from './collection.svelte';

/**
 * 今日の一枚（my Nagi 枠）がまだ引けるときに 1。ナビの「カードゲーム」に点を出すのに使う。
 * ゼンカツの「未プレイ」とは別の知らせなので、ストアも分けて持つ。
 * 取得は AnniversaryCardHost の ensure() に任せ、ここは日付境界をまたいだ取り直しだけを受け持つ
 * （カードの入口をフィードから外したので、そこにあった5分ポーリングをこちらへ移した）。
 */
export const cardUndrawn = writable(0);

export function startCardDrawNotice(): () => void {
	const stopSync = $effect.root(() => {
		$effect(() => {
			cardUndrawn.set(cardCollections.canDrawMyNagi ? 1 : 0);
		});
	});
	const stopPolling = startVisiblePolling(() => cardCollections.refreshSelfIfStale(), 5 * 60_000, {
		onReturn: true,
	});
	return () => {
		stopSync();
		stopPolling();
		cardUndrawn.set(0);
	};
}
