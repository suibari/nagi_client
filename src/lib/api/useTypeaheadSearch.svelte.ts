type FetchFn<T> = (query: string, signal: AbortSignal) => Promise<T[]>;
type TypeaheadOptions<T> = {
	/** 連続入力をまとめる待ち時間。 */
	debounceMs?: number;
	/** 最初の1文字だけ即時検索する。 */
	leading?: boolean;
	/**
	 * 応答待ちの間、前回結果を絞り込んで見せるための判定（stale-narrowing）。
	 * 与えないと打鍵のたびにリストが空になって出直すため、候補がちらつく。
	 */
	matches?: (item: T, query: string) => boolean;
	/** クエリ結果キャッシュの保持件数。 */
	cacheSize?: number;
};

const normalize = (query: string) => query.trim().toLowerCase();

/**
 * 候補サジェスト（@メンション / #チャンネル）のフェッチ・デバウンス・レース制御を
 * まとめた runes ファクトリ。検索関数を注入できるので、メンション（Nagi AppView）・
 * チャンネル・ログイン画面（公開 Bsky AppView）で同じロジックを使い回せる。
 * activeIndex やキーボード操作はホスト固有なので持たせない。
 *
 * 体感速度のための仕掛けは3つ:
 * - 直近クエリの結果をメモリに持ち、打ち直し/バックスペースはリクエスト無しで即描画する。
 *   ログイン中の候補取得は PDS プロキシ経由（DPoP 付き）で HTTP キャッシュが当てにならず、
 *   ここが実質の主キャッシュになる。
 * - 前クエリの前方一致拡張なら、応答待ちの間は前回結果を絞って見せる（matches）。
 * - 新しい打鍵で前のリクエストを abort し、往復を無駄に重ねない。
 */
export function createTypeaheadSearch<T>(fetchFn: FetchFn<T>, options: TypeaheadOptions<T> = {}) {
	let items = $state<T[]>([]);
	let pending = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let controller: AbortController | undefined;
	let requestId = 0;
	let started = false;
	/** 現在 items に映っている結果のクエリ。stale-narrowing の起点。 */
	let shownKey: string | undefined;
	const debounceMs = options.debounceMs ?? 200;
	const cacheSize = options.cacheSize ?? 30;
	const cache = new Map<string, T[]>();

	function remember(key: string, result: T[]) {
		cache.delete(key);
		cache.set(key, result);
		// Map は挿入順なので、あふれたら最古から捨てる。
		while (cache.size > cacheSize) cache.delete(cache.keys().next().value!);
	}

	function abort() {
		controller?.abort();
		controller = undefined;
	}

	function search(query: string, onResult?: () => void) {
		const current = ++requestId;
		const key = normalize(query);
		if (timer) clearTimeout(timer);
		timer = undefined;
		abort();
		const cached = cache.get(key);
		if (cached) {
			items = cached;
			shownKey = key;
			pending = false;
			onResult?.();
			return;
		}
		// 前のクエリを伸ばした入力なら、応答が来るまで前回結果を絞って見せる。
		if (options.matches && shownKey && key.startsWith(shownKey) && items.length) {
			items = items.filter((item) => options.matches!(item, key));
		}
		pending = true;
		const delay = options.leading && !started ? 0 : debounceMs;
		started = true;
		timer = setTimeout(async () => {
			timer = undefined;
			const signal = (controller = new AbortController()).signal;
			try {
				const result = await fetchFn(query, signal);
				if (current !== requestId) return;
				remember(key, result);
				items = result;
				shownKey = key;
				pending = false;
				onResult?.();
			} catch {
				// abort は後続の検索が状態を持っているので、ここでは何も触らない。
				if (current !== requestId) return;
				items = [];
				shownKey = key;
				pending = false;
			}
		}, delay);
	}

	function reset() {
		items = [];
		pending = false;
		shownKey = undefined;
		requestId++;
		if (timer) clearTimeout(timer);
		timer = undefined;
		abort();
		started = false;
		// キャッシュは残す。同じ Composer で `#` を開き直したときに即出したい。
	}

	return {
		get items() {
			return items;
		},
		get pending() {
			return pending;
		},
		search,
		reset,
	};
}
