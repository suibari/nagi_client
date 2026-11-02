export type FeedGestureOptions = {
	enabled: () => boolean;
	/** Horizontal drag in progress (px from the touch start). Called at most once per frame. */
	drag: (dx: number) => void;
	/** Finger lifted after a horizontal drag. `velocity` is px/ms, signed like dx. */
	release: (dx: number, velocity: number) => void;
	/** The drag was interrupted (touchcancel, second finger, disabled mid-way). */
	cancel: () => void;
};

const MOBILE = '(max-width: 767px) and (pointer: coarse)';

/**
 * Whether a release completes the tab switch: far enough, or a quick flick.
 * Returns the tab direction (1 = next, -1 = previous) or 0 to snap back.
 */
export function swipeDirection(dx: number, velocity: number, width: number): -1 | 0 | 1 {
	const far = Math.abs(dx) >= Math.max(64, width * 0.35);
	const flick =
		Math.abs(velocity) >= 0.3 && Math.abs(dx) >= 40 && Math.sign(velocity) === Math.sign(dx);
	if (!far && !flick) return 0;
	return dx < 0 ? 1 : -1;
}

/** One recognizer for both sources; nested media, controls and horizontal scrollers own their gestures. */
export function feedGestures(node: HTMLElement, options: FeedGestureOptions) {
	let start: { x: number; y: number } | undefined;
	let axis: 'x' | 'y' | undefined;
	/** Recent samples for release velocity. */
	let samples: { x: number; time: number }[] = [];
	let frame = 0;
	let pending: number | undefined;
	const flush = () => {
		frame = 0;
		if (pending !== undefined) options.drag(pending);
		pending = undefined;
	};
	const reset = () => {
		if (frame) cancelAnimationFrame(frame);
		frame = 0;
		pending = undefined;
		start = undefined;
		axis = undefined;
		samples = [];
	};
	const abort = () => {
		const dragging = axis === 'x';
		reset();
		if (dragging) options.cancel();
	};
	function begin(event: TouchEvent) {
		abort();
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
		start = { x: touch.clientX, y: touch.clientY };
	}
	function move(event: TouchEvent) {
		if (!start) return;
		if (event.touches.length !== 1 || !options.enabled()) {
			abort();
			return;
		}
		const touch = event.touches[0];
		const dx = touch.clientX - start.x;
		const dy = touch.clientY - start.y;
		if (!axis) {
			if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
			if (Math.abs(dx) <= Math.abs(dy) * 1.5 || !matchMedia(MOBILE).matches) {
				// Vertical gestures belong entirely to the browser, including pull-to-refresh.
				reset();
				return;
			}
			axis = 'x';
		}
		if (event.cancelable) event.preventDefault();
		const now = performance.now();
		samples.push({ x: touch.clientX, time: now });
		while (samples.length > 2 && now - samples[0].time > 100) samples.shift();
		pending = dx;
		if (!frame) frame = requestAnimationFrame(flush);
	}
	function end(event: TouchEvent) {
		if (!start || axis !== 'x') {
			reset();
			return;
		}
		const touch = event.changedTouches[0];
		const x = touch?.clientX ?? samples.at(-1)?.x ?? start.x;
		const dx = x - start.x;
		const first = samples[0];
		const elapsed = first ? performance.now() - first.time : 0;
		const velocity = first && elapsed > 0 ? (x - first.x) / Math.max(elapsed, 16) : 0;
		// A quick flick can end before the throttled frame fires; deliver it first.
		if (frame) flush();
		reset();
		if (!options.enabled()) {
			options.cancel();
			return;
		}
		options.release(dx, velocity);
	}
	node.addEventListener('touchstart', begin, { passive: true });
	node.addEventListener('touchmove', move, { passive: false });
	node.addEventListener('touchend', end);
	node.addEventListener('touchcancel', abort);
	return {
		destroy() {
			node.removeEventListener('touchstart', begin);
			node.removeEventListener('touchmove', move);
			node.removeEventListener('touchend', end);
			node.removeEventListener('touchcancel', abort);
			reset();
		},
	};
}
