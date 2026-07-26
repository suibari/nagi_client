<script lang="ts" generics="T extends { id: string }">
	import { onDestroy, type Snippet } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		items = $bindable(),
		disabled = false,
		children,
	}: {
		items: T[];
		disabled?: boolean;
		children: Snippet<[item: T]>;
	} = $props();

	let draggingId = $state<string>();
	let targetId = $state<string>();
	let pointerId = $state<number>();
	let announcement = $state('');
	let dragGhost: HTMLElement | undefined;
	let ghostOffsetX = 0;
	let ghostOffsetY = 0;

	function positionGhost(clientX: number, clientY: number) {
		if (!dragGhost) return;
		dragGhost.style.left = `${clientX - ghostOffsetX}px`;
		dragGhost.style.top = `${clientY - ghostOffsetY}px`;
	}

	function createGhost(event: PointerEvent) {
		const card = (event.currentTarget as HTMLElement).closest<HTMLElement>('.attachment-item');
		if (!card) return;
		const rect = card.getBoundingClientRect();
		ghostOffsetX = event.clientX - rect.left;
		ghostOffsetY = event.clientY - rect.top;
		dragGhost = card.cloneNode(true) as HTMLElement;
		dragGhost.classList.remove('dragging', 'drop-target');
		dragGhost.classList.add('attachment-drag-ghost');
		dragGhost.setAttribute('aria-hidden', 'true');
		dragGhost.style.width = `${rect.width}px`;
		dragGhost.style.height = `${rect.height}px`;
		for (const control of dragGhost.querySelectorAll<HTMLElement>('button, input')) {
			control.tabIndex = -1;
		}
		document.body.append(dragGhost);
		positionGhost(event.clientX, event.clientY);
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
		announcement = m.postImageMoved({ position: to + 1 });
	}

	function startPointer(event: PointerEvent, id: string) {
		if (disabled || items.length < 2) return;
		event.preventDefault();
		draggingId = id;
		targetId = id;
		pointerId = event.pointerId;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		createGhost(event);
	}

	function movePointer(event: PointerEvent) {
		if (event.pointerId !== pointerId || !draggingId) return;
		event.preventDefault();
		positionGhost(event.clientX, event.clientY);
		const target = document
			.elementFromPoint(event.clientX, event.clientY)
			?.closest<HTMLElement>('[data-sortable-image-id]');
		const nextTargetId = target?.dataset.sortableImageId;
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
		draggingId = undefined;
		targetId = undefined;
		pointerId = undefined;
		removeGhost();
	}

	function keydown(event: KeyboardEvent, id: string) {
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
			document
				.querySelector<HTMLButtonElement>(
					`[data-sortable-image-id="${CSS.escape(id)}"] .attachment-drag-handle`,
				)
				?.focus(),
		);
	}

	onDestroy(removeGhost);
</script>

<div class="attachment-list">
	{#each items as item, index (item.id)}
		<div
			class="attachment-item"
			class:dragging={draggingId === item.id}
			class:drop-target={Boolean(draggingId && targetId === item.id && draggingId !== item.id)}
			data-sortable-image-id={item.id}
		>
			<button
				class="attachment-drag-handle"
				type="button"
				disabled={disabled || items.length < 2}
				aria-label={m.postImageReorder({ index: index + 1 })}
				title={m.postImageReorder({ index: index + 1 })}
				onpointerdown={(event) => startPointer(event, item.id)}
				onpointermove={movePointer}
				onpointerup={endPointer}
				onpointercancel={endPointer}
				onlostpointercapture={endPointer}
				onkeydown={(event) => keydown(event, item.id)}
			>
				<Icon name="drag" size={17} />
			</button>
			{@render children(item)}
		</div>
	{/each}
</div>
<span class="visually-hidden" aria-live="polite">{announcement}</span>
