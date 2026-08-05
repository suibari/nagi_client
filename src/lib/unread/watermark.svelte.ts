import { writable, type Readable } from 'svelte/store';

/**
 * 「ここまで読んだ」位置（ウォーターマーク）。保存と比較だけをここに置き、
 * ポーリングや取得は利用側（news / feed / my Nagi）が持つ。
 *
 * 保存先は常に localStorage。アカウント同期するセクション（my Nagi・ニュース）では
 * onPersist / mergeRemote を通して `$lib/preferences` がサーバーとも突き合わせるが、
 * この層はサーバーを知らないままにしておく（フィードは同期しないため）。
 */
export type ReadPosition = { indexedAt: string; uri: string };
type StoredState = { initialized: false } | { initialized: true; seen?: ReadPosition };

/** AppView と同じ indexedAt DESC, uri DESC の順序で新旧を比較する。 */
export function isNewerPosition(candidate: ReadPosition, baseline: ReadPosition): boolean {
	const candidateTime = Date.parse(candidate.indexedAt);
	const baselineTime = Date.parse(baseline.indexedAt);
	return (
		candidateTime > baselineTime || (candidateTime === baselineTime && candidate.uri > baseline.uri)
	);
}

function isPosition(value: unknown): value is ReadPosition {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as Partial<ReadPosition>;
	return (
		typeof candidate.indexedAt === 'string' &&
		!Number.isNaN(Date.parse(candidate.indexedAt)) &&
		typeof candidate.uri === 'string'
	);
}

function readStoredState(storageKey: string): StoredState {
	if (typeof window === 'undefined') return { initialized: false };
	try {
		const raw = window.localStorage.getItem(storageKey);
		if (!raw) return { initialized: false };
		const parsed = JSON.parse(raw) as { initialized?: unknown; seen?: unknown };
		if (parsed.initialized !== true) return { initialized: false };
		return isPosition(parsed.seen)
			? { initialized: true, seen: parsed.seen }
			: { initialized: true };
	} catch {
		return { initialized: false };
	}
}

/**
 * 画面を開いた時点の既読基準を凍結したビュー。マウントごとに1つ作る。
 * 既読化は保存側だけを進めるので、表示中の未読マークは消えない（通知画面と同じモデル）。
 */
export type UnreadView = {
	/** 表示した最新分までを既読へ進める。凍結した基準は動かさない。 */
	advance(latest?: ReadPosition): void;
	/** 開いた時点の基準より新しい＝未読マーク対象か。未初期化の端末では常に false。 */
	isUnread(position: ReadPosition): boolean;
};

export type ReadWatermark = {
	/** 未読があるか。ナビのドット用（購読しない画面は無視してよい）。 */
	unread: Readable<boolean>;
	readonly storageKey: string;
	/** 端末が初期化済みか。未初期化＝全既読扱い。 */
	readonly initialized: boolean;
	/** 既知の最新位置を反映して未読状態を再計算する（ポーリング用）。 */
	observeLatest(latest?: ReadPosition): void;
	/** localStorage を読み直して未読状態を再計算する（別タブ同期用）。 */
	reloadFromStorage(): void;
	/**
	 * サーバーから受け取った位置を取り込む。既読は前にしか進まないので、
	 * 新しい方だけを採用して保存する。戻り値はマージ後の現在位置（無ければ undefined）で、
	 * ローカルが勝ったかどうかは呼び出し側が戻り値と remote を比べて判断する。
	 * onPersist は呼ばない（受け取った値をそのまま送り返さないため）。
	 */
	mergeRemote(remote?: ReadPosition): ReadPosition | undefined;
	/** 表示用ビューを作る。凍結前に保存値を読み直し、別タブの既読を取り込む。 */
	openView(): UnreadView;
};

export type ReadWatermarkOptions = {
	/** 保存位置が前に進んだときだけ呼ばれる。アカウント同期するセクションで使う。 */
	onPersist?: (seen: ReadPosition) => void;
};

export function createReadWatermark(
	storageKey: string,
	options: ReadWatermarkOptions = {},
): ReadWatermark {
	const unread = writable(false);
	let state: StoredState = readStoredState(storageKey);
	let latestKnown: ReadPosition | undefined;
	let persistFailed = false;

	function persist() {
		if (typeof window === 'undefined') return;
		try {
			window.localStorage.setItem(storageKey, JSON.stringify(state));
		} catch {
			// 保存できない環境でも、このタブを開いている間はメモリ上で状態を維持する。
			persistFailed = true;
		}
	}

	/** 掲載終了プレースホルダなど indexedAt が空のものは位置として扱わない。 */
	function positionOf(value: ReadPosition | undefined): ReadPosition | undefined {
		return value && !Number.isNaN(Date.parse(value.indexedAt))
			? { indexedAt: value.indexedAt, uri: value.uri }
			: undefined;
	}

	function recompute() {
		const seen = state.initialized ? state.seen : undefined;
		unread.set(Boolean(latestKnown && (!seen || isNewerPosition(latestKnown, seen))));
	}

	function advance(latest?: ReadPosition) {
		const seen = positionOf(latest);
		latestKnown = seen ?? latestKnown;
		if (!state.initialized) {
			state = { initialized: true, seen };
			persist();
			if (seen) options.onPersist?.(seen);
		} else if (seen && (!state.seen || isNewerPosition(seen, state.seen))) {
			state = { initialized: true, seen };
			persist();
			options.onPersist?.(seen);
		}
		// 一覧取得後にさらに新しいものを検出済みなら、その分の未読表示は残す。
		recompute();
	}

	return {
		unread,
		storageKey,
		get initialized() {
			return state.initialized;
		},
		observeLatest(latest) {
			latestKnown = positionOf(latest);
			if (!state.initialized) {
				// 機能を初めて使う端末では、現在の掲載分を既読の基準にする。
				state = { initialized: true, seen: latestKnown };
				persist();
				if (latestKnown) options.onPersist?.(latestKnown);
				unread.set(false);
				return;
			}
			recompute();
		},
		reloadFromStorage() {
			state = readStoredState(storageKey);
			if (state.initialized) recompute();
		},
		mergeRemote(remote) {
			const incoming = positionOf(remote);
			const current = state.initialized ? state.seen : undefined;
			if (incoming && (!current || isNewerPosition(incoming, current))) {
				state = { initialized: true, seen: incoming };
				persist();
				recompute();
				return incoming;
			}
			// ローカルが勝った（または同期対象がまだ無い）。呼び出し側が押し戻す。
			return current;
		},
		openView() {
			// 別タブでの既読を取り込んでから基準を凍結する。保存に失敗する端末では
			// localStorage が古いままなので、メモリ上の状態を信じる。
			if (!persistFailed) state = readStoredState(storageKey);
			const active = state.initialized;
			const baseline = state.initialized ? state.seen : undefined;
			return {
				advance,
				isUnread(position) {
					if (!active || Number.isNaN(Date.parse(position.indexedAt))) return false;
					return !baseline || isNewerPosition(position, baseline);
				},
			};
		},
	};
}
