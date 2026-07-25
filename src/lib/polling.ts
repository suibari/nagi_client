/**
 * タブが見えている間だけ走るポーリング。バックグラウンドのタブで無駄に叩かないための
 * visibility ガードと、復帰時に interval を待たない即時実行をここにまとめる。
 * 戻り値（解除関数）をそのまま onMount の cleanup に返して使う。
 */
export function startVisiblePolling(
	run: () => void,
	intervalMs: number,
	options: { onReturn?: boolean; when?: () => boolean } = {},
): () => void {
	if (typeof window === 'undefined') return () => {};
	const { onReturn = false, when } = options;
	// タブ切り替えでは visibilitychange と focus の両方が発火するので、直近の実行から
	// 間もない再発火は捨てて1回にまとめる。
	let lastRun = 0;
	const DEDUPE_MS = 1000;
	function fire() {
		lastRun = Date.now();
		run();
	}
	const timer = setInterval(() => {
		if (document.visibilityState !== 'visible') return;
		if (when && !when()) return;
		fire();
	}, intervalMs);
	// 別アプリからの復帰では focus しか出ないことがあるため、両方を購読する。
	const onReturnToTab = () => {
		if (document.visibilityState !== 'visible') return;
		if (Date.now() - lastRun < DEDUPE_MS) return;
		fire();
	};
	if (onReturn) {
		document.addEventListener('visibilitychange', onReturnToTab);
		window.addEventListener('focus', onReturnToTab);
	}
	return () => {
		clearInterval(timer);
		if (onReturn) {
			document.removeEventListener('visibilitychange', onReturnToTab);
			window.removeEventListener('focus', onReturnToTab);
		}
	};
}
