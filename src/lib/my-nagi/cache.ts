import type {
	ActorView,
	MyNagiView,
	NewsView,
	PostView,
} from '$lib/api/types';

/**
 * ルートを離れても、同じブラウザセッション中は直近の my Nagi をすぐ再表示する。
 * SSR のプロセス共有メモリへユーザーデータを置かないよう、ブラウザでだけ読み書きする。
 */
const MAX_ACCOUNTS = 6;

export type MyNagiPageCache = {
	newsLoaded: boolean;
	news: NewsView[];
	botLoaded: boolean;
	botPosts: PostView[];
	botActor?: ActorView;
	listLoaded: boolean;
	listActivity: MyNagiView;
};

const pageCache = new Map<string, MyNagiPageCache>();

function readLru<T>(cache: Map<string, T>, key: string): T | undefined {
	if (typeof window === 'undefined') return undefined;
	const value = cache.get(key);
	if (!value) return undefined;
	cache.delete(key);
	cache.set(key, value);
	return value;
}

function updateLru<T>(cache: Map<string, T>, key: string, value: T): void {
	if (typeof window === 'undefined') return;
	cache.delete(key);
	cache.set(key, value);
	if (cache.size > MAX_ACCOUNTS) cache.delete(cache.keys().next().value!);
}

export const readMyNagiPageCache = (key: string) => readLru(pageCache, key);

export function updateMyNagiPageCache(key: string, patch: Partial<MyNagiPageCache>): void {
	const current = pageCache.get(key) ?? {
		newsLoaded: false,
		news: [],
		botLoaded: false,
		botPosts: [],
		listLoaded: false,
		listActivity: { listUsers: [], channels: [] },
	};
	updateLru(pageCache, key, { ...current, ...patch });
}
