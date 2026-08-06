import { createDragGhost } from '$lib/dnd/ghost';

/**
 * ドロップ先。DOM 側は `data-emoji-drop="<kind>"` と、必要なら
 * `data-emoji-drop-index="<n>"` を置くだけでよい。要素の親子関係を問わないので、
 * 「最近使った」から「お気に入り」のようにコンテナをまたぐドラッグが書ける。
 *
 * index を持つゾーンでは、要素の左右どちら側にポインタがあるかを after で返す。
 * 「一番右のタイルの右半分＝末尾に追加」を表現するために要る。
 */
export type DropZone = { kind: string; index?: number; after?: boolean };

type Options<P> = {
	/** タップ（＝即リアクション）と区別するための移動量。 */
	threshold?: number;
	/**
	 * 既定では touch を弾く。クイックパレットのお気に入りグリッドは
	 * overflow-y: auto でスクロールするため、ドラッグに必要な
	 * touch-action: none を敷くとスクロールが死ぬ。
	 */
	allowTouch?: boolean;
	onHover?: (zone: DropZone | undefined, payload: P) => void;
	onDrop: (payload: P, zone: DropZone | undefined) => void;
};

export function createEmojiDrag<P>(options: Options<P>) {
	const threshold = options.threshold ?? 6;
	let payload = $state<P>();
	let zone = $state<DropZone>();
	let dragging = $state(false);
	// ドラッグ直後は互換 click が飛んでくる。並び替えた瞬間にリアクションが
	// 実行されないよう、次のタスクまでこのフラグでクリックを弾く。
	let justDragged = $state(false);
	let pending: P | undefined;
	let pointerId: number | undefined;
	let startX = 0;
	let startY = 0;
	let ghost: ReturnType<typeof createDragGhost> | undefined;

	function zoneAt(clientX: number, clientY: number): DropZone | undefined {
		const target = document
			.elementFromPoint(clientX, clientY)
			?.closest<HTMLElement>('[data-emoji-drop]');
		const kind = target?.dataset.emojiDrop;
		if (!kind || !target) return undefined;
		const raw = target.dataset.emojiDropIndex;
		const parsed = raw === undefined ? undefined : Number(raw);
		const index = Number.isFinite(parsed) ? parsed : undefined;
		if (index === undefined) return { kind };
		const rect = target.getBoundingClientRect();
		return { kind, index, after: clientX >= rect.left + rect.width / 2 };
	}

	function reset() {
		pending = undefined;
		pointerId = undefined;
		payload = undefined;
		zone = undefined;
		dragging = false;
		ghost?.remove();
		ghost = undefined;
	}

	return {
		get payload() {
			return payload;
		},
		get zone() {
			return zone;
		},
		get dragging() {
			return dragging;
		},
		get justDragged() {
			return justDragged;
		},
		/** pointerdown。この時点ではまだドラッグせず、閾値を超えるまで待つ。 */
		start(event: PointerEvent, next: P) {
			if (event.button !== 0 && event.pointerType === 'mouse') return;
			if (!options.allowTouch && event.pointerType === 'touch') return;
			pointerId = event.pointerId;
			pending = next;
			startX = event.clientX;
			startY = event.clientY;
			(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		},
		move(event: PointerEvent) {
			if (event.pointerId !== pointerId) return;
			if (pending !== undefined) {
				if (Math.hypot(event.clientX - startX, event.clientY - startY) < threshold) return;
				payload = pending;
				pending = undefined;
				dragging = true;
				ghost = createDragGhost(
					event.currentTarget as HTMLElement,
					event.clientX,
					event.clientY,
					'emoji-sort-ghost',
				);
			}
			if (!dragging || payload === undefined) return;
			event.preventDefault();
			ghost?.move(event.clientX, event.clientY);
			const next = zoneAt(event.clientX, event.clientY);
			if (next?.kind === zone?.kind && next?.index === zone?.index && next?.after === zone?.after)
				return;
			zone = next;
			options.onHover?.(next, payload);
		},
		/** pointerup / pointercancel / lostpointercapture 共通。 */
		end(event: PointerEvent) {
			if (event.pointerId !== pointerId) return;
			const target = event.currentTarget as HTMLElement;
			if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
			if (dragging && payload !== undefined) {
				const dropped = payload;
				const at = event.type === 'pointerup' ? zone : undefined;
				justDragged = true;
				setTimeout(() => (justDragged = false));
				options.onDrop(dropped, at);
			}
			reset();
		},
	};
}
