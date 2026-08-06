import { createDragGhost } from './ghost';

/**
 * 並び替え（ドラッグ＆ドロップ）の共通実装。お気に入り絵文字・投稿画像・フィードのタブが
 * これを使う。以前はコンポーネントごとに同じコードを持っていて、同じ不具合も持っていた。
 *
 * 不具合の中身と、ここでの直し方:
 *
 * 1. ドラッグ中に勝手にドロップ扱いになる
 *    ポインタキャプチャを「掴んだ行そのもの」に張っていたのが原因。並べ替えると
 *    keyed each が DOM ノードを動かし、その拍子にキャプチャが外れて lostpointercapture が
 *    飛ぶ。それをドロップとして扱っていたので、指を離していないのに並び替えが終わっていた。
 *    → キャプチャは**並び替えで動かないコンテナ**に張る。終了は pointerup / pointercancel
 *      だけで判断し、lostpointercapture は無視する。
 *
 * 2. 掴み直しが要る
 *    キャプチャがコンテナにあるので、指が行の外へ出ても move は届き続ける。
 */
export type SortableItem = { id: string };

export type SortableOptions<T extends SortableItem> = {
	/** 現在の並び。常に最新を返すこと。 */
	items: () => T[];
	/** 並べ替えの反映。呼び出し側が items を差し替え、必要なら保存する。 */
	commit: (next: T[]) => void;
	/** ゴーストに付けるクラス名。見た目は呼び出し側の CSS が持つ。 */
	ghostClass: string;
	/**
	 * ドラッグ開始と見なす移動量(px)。同じ場所でタップも受ける UI（絵文字タイル）は
	 * これを効かせ、専用ハンドルがある UI は 0 でよい。
	 */
	threshold?: number;
	/** 指定すると、このセレクタに一致する要素からしかドラッグを始めない。 */
	handleSelector?: string;
	/** しきい値未満で離したとき＝タップ。 */
	onTap?: (item: T, event: PointerEvent) => void;
	/** 移動後の読み上げ文（1始まりの位置）。 */
	announce?: (position: number) => string;
	disabled?: () => boolean;
};

/** 行／タイルに必ず付ける属性。コンテナから掴んだ要素を引くのに使う。 */
export const SORTABLE_ATTR = 'data-sortable-id';
const itemIdOf = (element: Element | null | undefined) =>
	element?.closest<HTMLElement>(`[${SORTABLE_ATTR}]`)?.dataset.sortableId;

export function createSortable<T extends SortableItem>(options: SortableOptions<T>) {
	const threshold = options.threshold ?? 0;

	let draggingId = $state<string>();
	let targetId = $state<string>();
	let announcement = $state('');

	let container: HTMLElement | undefined;
	let pointerId: number | undefined;
	let pendingId: string | undefined;
	let startX = 0;
	let startY = 0;
	let ghost: ReturnType<typeof createDragGhost> | undefined;

	const enabled = () => !options.disabled?.() && options.items().length > 1;

	function removeGhost() {
		ghost?.remove();
		ghost = undefined;
	}

	function reset() {
		pendingId = undefined;
		draggingId = undefined;
		targetId = undefined;
		pointerId = undefined;
		removeGhost();
	}

	function move(from: number, to: number) {
		const items = options.items();
		if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
		const next = [...items];
		const [item] = next.splice(from, 1);
		next.splice(to, 0, item);
		options.commit(next);
		if (options.announce) announcement = options.announce(to + 1);
	}

	function elementFor(id: string): HTMLElement | null | undefined {
		return container?.querySelector<HTMLElement>(`[${SORTABLE_ATTR}="${CSS.escape(id)}"]`);
	}

	function beginDrag(id: string, event: PointerEvent) {
		draggingId = id;
		targetId = id;
		pendingId = undefined;
		const source = elementFor(id);
		if (source) ghost = createDragGhost(source, event.clientX, event.clientY, options.ghostClass);
	}

	function onpointerdown(event: PointerEvent) {
		if (event.button !== 0 && event.pointerType === 'mouse') return;
		const target = event.target as HTMLElement;
		if (options.handleSelector) {
			if (!target.closest(options.handleSelector)) return;
		} else if (target.closest('button')) {
			// タイル内のボタン（削除など）はドラッグにもタップ選択にも巻き込まない。
			return;
		}
		const id = itemIdOf(target);
		if (!id) return;
		pointerId = event.pointerId;
		pendingId = id;
		startX = event.clientX;
		startY = event.clientY;
		// キャプチャはコンテナに張る。行に張ると、並べ替えで DOM が動いた拍子に外れる。
		container?.setPointerCapture(event.pointerId);
		// しきい値なし（専用ハンドル）ならその場で開始する。
		if (threshold === 0 && enabled()) {
			event.preventDefault();
			beginDrag(id, event);
		}
	}

	function onpointermove(event: PointerEvent) {
		if (event.pointerId !== pointerId) return;
		if (pendingId) {
			if (!enabled()) return;
			if (Math.hypot(event.clientX - startX, event.clientY - startY) < threshold) return;
			beginDrag(pendingId, event);
		}
		if (!draggingId) return;
		event.preventDefault();
		ghost?.move(event.clientX, event.clientY);
		// ゴーストは pointer-events: none なので、下にある行が取れる。
		const overId = itemIdOf(document.elementFromPoint(event.clientX, event.clientY));
		if (!overId || overId === draggingId || overId === targetId) return;
		targetId = overId;
		const items = options.items();
		move(
			items.findIndex((item) => item.id === draggingId),
			items.findIndex((item) => item.id === overId),
		);
	}

	function onpointerup(event: PointerEvent) {
		if (event.pointerId !== pointerId) return;
		if (container?.hasPointerCapture(event.pointerId))
			container.releasePointerCapture(event.pointerId);
		// しきい値まで動かなかった＝タップ。
		if (pendingId && options.onTap) {
			const item = options.items().find((candidate) => candidate.id === pendingId);
			if (item) options.onTap(item, event);
		}
		reset();
	}

	function onpointercancel(event: PointerEvent) {
		if (event.pointerId !== pointerId) return;
		reset();
	}

	return {
		get draggingId() {
			return draggingId;
		},
		get targetId() {
			return targetId;
		},
		get announcement() {
			return announcement;
		},
		/** ドラッグ中に、その行を「落とす先」として光らせるか。 */
		isDropTarget(id: string) {
			return Boolean(draggingId && targetId === id && draggingId !== id);
		},
		/**
		 * コンテナに付ける action。ここでポインタ操作をすべて受ける。
		 * `use:sortable.container` のように使う。
		 */
		container(node: HTMLElement) {
			container = node;
			node.addEventListener('pointerdown', onpointerdown);
			node.addEventListener('pointermove', onpointermove);
			node.addEventListener('pointerup', onpointerup);
			node.addEventListener('pointercancel', onpointercancel);
			return {
				destroy() {
					node.removeEventListener('pointerdown', onpointerdown);
					node.removeEventListener('pointermove', onpointermove);
					node.removeEventListener('pointerup', onpointerup);
					node.removeEventListener('pointercancel', onpointercancel);
					if (container === node) container = undefined;
					removeGhost();
				},
			};
		},
		/**
		 * 矢印キーでの並び替え。動かせたら true（呼び出し側が preventDefault する）。
		 * ポインタを使わない人にはこちらが唯一の手段なので、全コンポーネントで同じ操作にする。
		 */
		moveByKey(id: string, key: string): boolean {
			if (!enabled()) return false;
			const items = options.items();
			const from = items.findIndex((item) => item.id === id);
			if (from < 0) return false;
			let to: number | undefined;
			if (key === 'ArrowLeft' || key === 'ArrowUp') to = Math.max(0, from - 1);
			if (key === 'ArrowRight' || key === 'ArrowDown') to = Math.min(items.length - 1, from + 1);
			if (key === 'Home') to = 0;
			if (key === 'End') to = items.length - 1;
			if (to === undefined || to === from) return false;
			move(from, to);
			return true;
		},
		/** 並べ替えでフォーカスを失わないよう、動かした行の掴みどころへ戻す。 */
		refocus(id: string, selector?: string) {
			requestAnimationFrame(() => {
				const element = elementFor(id);
				(selector ? element?.querySelector<HTMLElement>(selector) : element)?.focus();
			});
		},
	};
}
