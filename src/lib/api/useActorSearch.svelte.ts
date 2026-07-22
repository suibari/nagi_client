import type { ActorView, SearchActorsResult } from './types';

type SearchFn = (query: string) => Promise<SearchActorsResult>;

// アクター検索の 200ms デバウンス + requestId レース制御をまとめた runes ファクトリ。
// 検索関数を注入できるので、メンション（Nagi AppView）とログイン（公開 Bsky AppView）で
// 同じロジックを使い回せる。activeIndex やキーボード操作はホスト固有なので持たせない。
export function createActorSearch(searchFn: SearchFn) {
	let actors = $state<ActorView[]>([]);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let requestId = 0;

	function search(query: string, onResult?: () => void) {
		const current = ++requestId;
		if (timer) clearTimeout(timer);
		timer = setTimeout(async () => {
			try {
				const result = await searchFn(query);
				if (current !== requestId) return;
				actors = result.actors;
				onResult?.();
			} catch {
				if (current === requestId) actors = [];
			}
		}, 200);
	}

	function reset() {
		actors = [];
		if (timer) clearTimeout(timer);
	}

	return {
		get actors() {
			return actors;
		},
		search,
		reset,
	};
}
