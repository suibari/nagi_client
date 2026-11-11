/**
 * 本文のハッシュタグを右クリック／長押ししたときのメニュー。画面に1つだけ置く
 * （TagContextMenu をレイアウトにマウントする）ので、開く側はここへ座標とタグを渡すだけ。
 */
class TagMenuState {
	tag = $state<string>();
	x = $state(0);
	y = $state(0);
	/** 閉じたときにフォーカスを戻す先。 */
	origin: HTMLElement | undefined;

	show(tag: string, x: number, y: number, origin?: HTMLElement) {
		this.tag = tag;
		this.x = x;
		this.y = y;
		this.origin = origin;
	}

	close(restoreFocus = false) {
		if (!this.tag) return;
		this.tag = undefined;
		const origin = this.origin;
		this.origin = undefined;
		if (restoreFocus) requestAnimationFrame(() => origin?.focus());
	}
}

export const tagMenu = new TagMenuState();

const LONG_PRESS_MS = 500;
const MOVE_TOLERANCE = 10;

/**
 * タグのリンクに付ける action。マウスは右クリック（contextmenu）、タッチとペンは長押しで開く。
 * iOS Safari は長押しで contextmenu を出さないので、タイマーで自前に判定する。
 * Android は長押しでも contextmenu が来るが、同じタグを開き直すだけなので二重には見えない。
 * 長押しで開いたあとの click はリンク遷移（と親の投稿タップ）にしない。
 */
export function tagMenuTrigger(node: HTMLElement, tag: string | undefined) {
	let current = tag;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let start: { x: number; y: number } | undefined;
	let fired = false;

	const cancel = () => {
		if (timer) clearTimeout(timer);
		timer = undefined;
		start = undefined;
	};
	const contextmenu = (event: MouseEvent) => {
		if (!current) return;
		event.preventDefault();
		cancel();
		tagMenu.show(current, event.clientX, event.clientY, node);
	};
	const pointerdown = (event: PointerEvent) => {
		if (!current || event.pointerType === 'mouse' || !event.isPrimary) return;
		cancel();
		fired = false;
		start = { x: event.clientX, y: event.clientY };
		const at = start;
		const value = current;
		timer = setTimeout(() => {
			timer = undefined;
			fired = true;
			tagMenu.show(value, at.x, at.y, node);
			navigator.vibrate?.(10);
		}, LONG_PRESS_MS);
	};
	const pointermove = (event: PointerEvent) => {
		if (!start) return;
		if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > MOVE_TOLERANCE) cancel();
	};
	const click = (event: MouseEvent) => {
		if (!fired) return;
		fired = false;
		event.preventDefault();
		event.stopPropagation();
	};

	node.addEventListener('contextmenu', contextmenu);
	node.addEventListener('pointerdown', pointerdown);
	node.addEventListener('pointermove', pointermove);
	node.addEventListener('pointerup', cancel);
	node.addEventListener('pointercancel', cancel);
	node.addEventListener('pointerleave', cancel);
	node.addEventListener('click', click);
	return {
		update(next: string | undefined) {
			current = next;
			if (!next) cancel();
		},
		destroy() {
			cancel();
			node.removeEventListener('contextmenu', contextmenu);
			node.removeEventListener('pointerdown', pointerdown);
			node.removeEventListener('pointermove', pointermove);
			node.removeEventListener('pointerup', cancel);
			node.removeEventListener('pointercancel', cancel);
			node.removeEventListener('pointerleave', cancel);
			node.removeEventListener('click', click);
		},
	};
}
