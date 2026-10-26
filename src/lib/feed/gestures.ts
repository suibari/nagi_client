export type FeedGestureOptions = {
	swipe: (direction: -1 | 1) => void;
	enabled: () => boolean;
};

/** One recognizer for both sources; nested media, controls and horizontal scrollers own their gestures. */
export function feedGestures(node: HTMLElement, options: FeedGestureOptions) {
	let start: { x: number; y: number; time: number } | undefined;
	let axis: 'x' | 'y' | undefined;
	const reset = () => {
		start = undefined;
		axis = undefined;
	};
	function begin(event: TouchEvent) {
		reset();
		if (!options.enabled() || event.touches.length !== 1) return;
		const target = event.target;
		if (!(target instanceof Element)) return;
		if (
			target.closest(
				'a, button, input, textarea, select, video, audio, [contenteditable], [role="slider"], [data-feed-gesture-ignore]',
			)
		)
			return;
		for (let el: Element | null = target; el && el !== node; el = el.parentElement) {
			const style = getComputedStyle(el);
			if (/(auto|scroll)/.test(style.overflowX) && el.scrollWidth > el.clientWidth) return;
			if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight) return;
		}
		const touch = event.touches[0];
		// Preserve browser edge navigation.
		if (touch.clientX < 24 || touch.clientX > window.innerWidth - 24) return;
		start = { x: touch.clientX, y: touch.clientY, time: Date.now() };
	}
	function move(event: TouchEvent) {
		if (!start) return;
		if (event.touches.length !== 1 || !options.enabled()) {
			reset();
			return;
		}
		const dx = event.touches[0].clientX - start.x;
		const dy = event.touches[0].clientY - start.y;
		if (!axis) {
			if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
			axis = Math.abs(dx) > Math.abs(dy) * 1.5 ? 'x' : 'y';
		}
		if (axis === 'x') {
			if (matchMedia('(max-width: 767px) and (pointer: coarse)').matches && event.cancelable)
				event.preventDefault();
		} else {
			// Vertical gestures belong entirely to the browser, including pull-to-refresh.
			reset();
		}
	}
	function end(event: TouchEvent) {
		if (!start) return;
		const touch = event.changedTouches[0];
		const dx = touch ? touch.clientX - start.x : 0;
		const dy = touch ? touch.clientY - start.y : 0;
		const swipe =
			axis === 'x' &&
			Math.abs(dx) >= 64 &&
			Math.abs(dx) > Math.abs(dy) * 1.5 &&
			Date.now() - start.time < 900 &&
			matchMedia('(max-width: 767px) and (pointer: coarse)').matches;
		reset();
		if (!options.enabled()) return;
		if (swipe) options.swipe(dx < 0 ? 1 : -1);
	}
	node.addEventListener('touchstart', begin, { passive: true });
	node.addEventListener('touchmove', move, { passive: false });
	node.addEventListener('touchend', end);
	node.addEventListener('touchcancel', reset);
	return {
		destroy() {
			node.removeEventListener('touchstart', begin);
			node.removeEventListener('touchmove', move);
			node.removeEventListener('touchend', end);
			node.removeEventListener('touchcancel', reset);
			reset();
		},
	};
}
