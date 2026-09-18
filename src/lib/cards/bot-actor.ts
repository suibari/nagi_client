import { getTimeline } from '$lib/api/appview';
import type { ActorView } from '$lib/api/types';

// フィードと同じアカウント情報を使い、複数の総評間で取得を共有する。
let pending: Promise<ActorView | undefined> | undefined;

export function loadCardBotActor(): Promise<ActorView | undefined> {
	return (pending ??= getTimeline()
		.then((page) => {
			if (!page.botActor) pending = undefined;
			return page.botActor;
		})
		.catch(() => {
			pending = undefined;
			return undefined;
		}));
}
