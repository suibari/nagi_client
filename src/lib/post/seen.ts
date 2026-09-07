const STORAGE_KEY_PREFIX = 'nagi.seen-posts.v1';
const MAX_SEEN_POSTS = 1000;

type SeenEntry = [uri: string, seenAt: number];
type SeenState = Map<string, number>;

const registry = new Map<string, SeenState>();
let listeningForStorage = false;

const storageKey = (viewerDid?: string) =>
	`${STORAGE_KEY_PREFIX}.${encodeURIComponent(viewerDid ?? 'guest')}`;

function storage(): Storage | undefined {
	try {
		return globalThis.localStorage;
	} catch {
		return undefined;
	}
}

function stateFor(viewerDid?: string): SeenState {
	if (
		!listeningForStorage &&
		typeof window !== 'undefined' &&
		typeof window.addEventListener === 'function'
	) {
		listeningForStorage = true;
		window.addEventListener('storage', (event) => {
			if (event.key?.startsWith(`${STORAGE_KEY_PREFIX}.`)) registry.delete(event.key);
		});
	}
	const key = storageKey(viewerDid);
	const existing = registry.get(key);
	if (existing) return existing;
	const state: SeenState = new Map();
	try {
		const parsed = JSON.parse(storage()?.getItem(key) ?? '[]') as unknown;
		if (Array.isArray(parsed)) {
			for (const entry of parsed) {
				if (Array.isArray(entry) && typeof entry[0] === 'string' && typeof entry[1] === 'number')
					state.set(entry[0], entry[1]);
			}
		}
	} catch {
		// 壊れた端末データは空として扱い、次の閲覧で正常な形式へ戻す。
	}
	registry.set(key, state);
	return state;
}

function persist(viewerDid: string | undefined, state: SeenState): void {
	try {
		storage()?.setItem(storageKey(viewerDid), JSON.stringify([...state] satisfies SeenEntry[]));
	} catch {
		// localStorage が使えなくても、このタブを開いている間のメモリ記録は維持する。
	}
}

/** 同一アカウントで一度画面内に入った投稿URIか。 */
export function hasSeenPost(uri: string, viewerDid?: string): boolean {
	return stateFor(viewerDid).has(uri);
}

/** URI単位で記録するため、別セクションの未閲覧投稿まで日時で巻き込まない。 */
export function markPostSeen(uri: string, viewerDid?: string): void {
	if (!uri) return;
	const state = stateFor(viewerDid);
	state.delete(uri);
	state.set(uri, Date.now());
	while (state.size > MAX_SEEN_POSTS) state.delete(state.keys().next().value!);
	persist(viewerDid, state);
}

type SeenActionParameters = { uri: string; viewerDid?: string; disabled?: boolean };

/** ChatBubble が実際にビューポートへ入った時点で投稿を既読台帳へ記録する。 */
export function trackPostSeen(node: HTMLElement, initial: SeenActionParameters) {
	let parameters = initial;
	let observer: IntersectionObserver | undefined;

	function observe() {
		observer?.disconnect();
		observer = undefined;
		if (parameters.disabled) return;
		if (typeof IntersectionObserver === 'undefined') {
			markPostSeen(parameters.uri, parameters.viewerDid);
			return;
		}
		observer = new IntersectionObserver((entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) return;
			markPostSeen(parameters.uri, parameters.viewerDid);
			observer?.disconnect();
			observer = undefined;
		});
		observer.observe(node);
	}

	observe();
	return {
		update(next: SeenActionParameters) {
			if (
				next.uri === parameters.uri &&
				next.viewerDid === parameters.viewerDid &&
				next.disabled === parameters.disabled
			)
				return;
			parameters = next;
			observe();
		},
		destroy() {
			observer?.disconnect();
		},
	};
}

/** テスト間でモジュール内キャッシュを分離する。 */
export function resetSeenPostsForTests(): void {
	registry.clear();
}
