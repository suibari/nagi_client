<script lang="ts" generics="T extends { id: string }">
	import type { Snippet } from 'svelte';
	import { createSortable } from '$lib/dnd/sortable.svelte';
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
		/**
		 * しきい値未満のポインタ操作＝タップ。ドラッグ中は発火しない。
		 * event は Shift+クリックの連続選択判定のために渡す（受け取らなくてよい）。
		 */
		onselect?: (item: T, event: PointerEvent | KeyboardEvent) => void;
		onreorder?: (items: T[]) => void;
		children: Snippet<[item: T]>;
	} = $props();

	// タップ（リアクション）とドラッグ（並び替え）を同じタイルで受けるためのしきい値。
	const sortable = createSortable<T>({
		items: () => items,
		commit: (next) => {
			items = next;
			onreorder?.(next);
		},
		ghostClass: 'emoji-sort-ghost',
		threshold: 6,
		onTap: (item, event) => onselect?.(item, event),
		announce: (position) => m.emojiFavoriteMoved({ position }),
		disabled: () => disabled,
	});

	function keydown(event: KeyboardEvent, id: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			const item = items.find((candidate) => candidate.id === id);
			if (!item || !onselect) return;
			event.preventDefault();
			onselect(item, event);
			return;
		}
		if (!sortable.moveByKey(id, event.key)) return;
		event.preventDefault();
		sortable.refocus(id);
	}
</script>

<div class="emoji-sort-grid" use:sortable.container>
	{#each items as item, index (item.id)}
		<div
			class="emoji-sort-item"
			class:dragging={sortable.draggingId === item.id}
			class:drop-target={sortable.isDropTarget(item.id)}
			data-sortable-id={item.id}
			role="button"
			tabindex="0"
			aria-label={m.emojiFavoriteReorder({ index: index + 1 })}
			onkeydown={(event) => keydown(event, item.id)}
		>
			{@render children(item)}
		</div>
	{/each}
</div>
<span class="visually-hidden" aria-live="polite">{sortable.announcement}</span>
