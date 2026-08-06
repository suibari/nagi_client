<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createSortable } from '$lib/dnd/sortable.svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	/**
	 * 縦1列の並び替えリスト。行の中にボタンが載るので、ドラッグの起点はハンドルだけに
	 * 絞る（行全体を掴めると、削除を押したいだけの操作が並び替えになる）。
	 */
	type Item = { id: string };

	let {
		items = $bindable(),
		onreorder,
		children,
	}: {
		items: Item[];
		onreorder?: (items: Item[]) => void;
		children: Snippet<[item: Item, index: number]>;
	} = $props();

	const sortable = createSortable<Item>({
		items: () => items,
		commit: (next) => {
			items = next;
			onreorder?.(next);
		},
		ghostClass: 'feed-tab-ghost',
		handleSelector: '[data-drag-handle]',
		announce: (position) => m.feedTabsMoved({ position }),
	});

	function keydown(event: KeyboardEvent, id: string) {
		if (!sortable.moveByKey(id, event.key)) return;
		event.preventDefault();
		sortable.refocus(id, '[data-drag-handle]');
	}
</script>

<ul class="feed-tab-sort" use:sortable.container>
	{#each items as item, index (item.id)}
		<li
			class="feed-tab-row"
			class:dragging={sortable.draggingId === item.id}
			class:drop-target={sortable.isDropTarget(item.id)}
			data-sortable-id={item.id}
		>
			<button
				type="button"
				class="feed-tab-handle"
				data-drag-handle
				aria-label={m.feedTabsReorder({ index: index + 1 })}
				title={m.feedTabsReorder({ index: index + 1 })}
				onkeydown={(event) => keydown(event, item.id)}
			>
				<span aria-hidden="true">⠿</span>
			</button>
			{@render children(item, index)}
		</li>
	{/each}
</ul>
<span class="visually-hidden" aria-live="polite">{sortable.announcement}</span>
