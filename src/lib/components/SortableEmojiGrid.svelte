<script lang="ts" generics="T extends { id: string }">
	import { onDestroy, type Snippet } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	let {
		items = $bindable(),
		disabled = false,
		onselect,
		onreorder,
		children,
	}: {
		items: T[];
		disabled?: boolean;
		/** しきい値未満のポインタ操作＝タップ。ドラッグ中は発火しない。 */
		onselect?: (item: T) => void;
		onreorder?: (items: T[]) => void;
		children: Snippet<[item: T]>;
	} = $props();

	// タップ（リアクション）とドラッグ（並び替え）を同じタイルで受けるためのしきい値。
	const DRAG_THRESHOLD = 6;

	let draggingId = $state<string>();
	let targetId = $state<string>();
	let pointerId = $state<number>();
	let pendingId: string | undefined;
	let startX = 0;
	let startY = 0;
	let announcement = $state('');
	let dragGhost: HTMLElement | undefined;
	let ghostOffsetX = 0;
	let ghostOffsetY = 0;

	function positionGhost(clientX: number, clientY: number) {
		if (!dragGhost) return;
		dragGhost.style.left = `${clientX - ghostOffsetX}px`;
		dragGhost.style.top = `${clientY - ghostOffsetY}px`;
	}

	function createGhost(tile: HTMLElement, clientX: number, clientY: number) {
		const rect = tile.getBoundingClientRect();
		ghostOffsetX = clientX - rect.left;
		ghostOffsetY = clientY - rect.top;
		dragGhost = tile.cloneNode(true) as HTMLElement;
		dragGhost.classList.remove('dragging', 'drop-target');
		dragGhost.classList.add('emoji-sort-ghost');
		dragGhost.setAttribute('aria-hidden', 'true');
		dragGhost.style.width = `${rect.width}px`;
		dragGhost.style.height = `${rect.height}px`;
		for (const control of dragGhost.querySelectorAll<HTMLElement>('button, input')) {
			control.tabIndex = -1;
		}
		document.body.append(dragGhost);
		positionGhost(clientX, clientY);
	}

	function removeGhost() {
		dragGhost?.remove();
		dragGhost = undefined;
	}

	function move(from: number, to: number) {
		if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
		const next = [...items];
		const [item] = next.splice(from, 1);
		next.splice(to, 0, item);
		items = next;
		onreorder?.(next);
		announcement = m.emojiFavoriteMoved({ position: to + 1 });
	}

	function startPointer(event: PointerEvent, id: string) {
		if (event.button !== 0 && event.pointerType === 'mouse') return;
		// タイル内のボタン（削除など）はドラッグにもタップ選択にも巻き込まない。
		if ((event.target as HTMLElement).closest('button')) return;
		pointerId = event.pointerId;
		pendingId = id;
		startX = event.clientX;
		startY = event.clientY;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function movePointer(event: PointerEvent) {
		if (event.pointerId !== pointerId) return;
		if (pendingId) {
			if (disabled || items.length < 2) return;
			const moved = Math.hypot(event.clientX - startX, event.clientY - startY);
			if (moved < DRAG_THRESHOLD) return;
			draggingId = pendingId;
			targetId = pendingId;
			pendingId = undefined;
			createGhost(event.currentTarget as HTMLElement, event.clientX, event.clientY);
		}
		if (!draggingId) return;
		event.preventDefault();
		positionGhost(event.clientX, event.clientY);
		const target = document
			.elementFromPoint(event.clientX, event.clientY)
			?.closest<HTMLElement>('[data-sortable-emoji-id]');
		const nextTargetId = target?.dataset.sortableEmojiId;
		if (!nextTargetId || nextTargetId === draggingId || nextTargetId === targetId) return;
		targetId = nextTargetId;
		move(
			items.findIndex((item) => item.id === draggingId),
			items.findIndex((item) => item.id === nextTargetId),
		);
	}

	function endPointer(event: PointerEvent) {
		if (event.pointerId !== pointerId) return;
		const target = event.currentTarget as HTMLElement;
		if (target.hasPointerCapture(event.pointerId)) {
			target.releasePointerCapture(event.pointerId);
		}
		const tapped = event.type === 'pointerup' && pendingId;
		if (tapped) {
			const item = items.find((candidate) => candidate.id === pendingId);
			if (item) onselect?.(item);
		}
		pendingId = undefined;
		draggingId = undefined;
		targetId = undefined;
		pointerId = undefined;
		removeGhost();
	}

	function keydown(event: KeyboardEvent, id: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			const item = items.find((candidate) => candidate.id === id);
			if (!item || !onselect) return;
			event.preventDefault();
			onselect(item);
			return;
		}
		if (disabled || items.length < 2) return;
		const from = items.findIndex((item) => item.id === id);
		let to: number | undefined;
		if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') to = Math.max(0, from - 1);
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
			to = Math.min(items.length - 1, from + 1);
		if (event.key === 'Home') to = 0;
		if (event.key === 'End') to = items.length - 1;
		if (to === undefined || to === from) return;
		event.preventDefault();
		move(from, to);
		requestAnimationFrame(() =>
			document.querySelector<HTMLElement>(`[data-sortable-emoji-id="${CSS.escape(id)}"]`)?.focus(),
		);
	}

	onDestroy(removeGhost);
</script>

<div class="emoji-sort-grid">
	{#each items as item, index (item.id)}
		<div
			class="emoji-sort-item"
			class:dragging={draggingId === item.id}
			class:drop-target={Boolean(draggingId && targetId === item.id && draggingId !== item.id)}
			data-sortable-emoji-id={item.id}
			role="button"
			tabindex="0"
			aria-label={m.emojiFavoriteReorder({ index: index + 1 })}
			onpointerdown={(event) => startPointer(event, item.id)}
			onpointermove={movePointer}
			onpointerup={endPointer}
			onpointercancel={endPointer}
			onlostpointercapture={endPointer}
			onkeydown={(event) => keydown(event, item.id)}
		>
			{@render children(item)}
		</div>
	{/each}
</div>
<span class="visually-hidden" aria-live="polite">{announcement}</span>
