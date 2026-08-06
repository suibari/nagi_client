<script lang="ts" generics="T extends { id: string }">
	import type { Snippet } from 'svelte';
	import { createSortable } from '$lib/dnd/sortable.svelte';
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

	const sortable = createSortable<T>({
		items: () => items,
		commit: (next) => (items = next),
		ghostClass: 'attachment-drag-ghost',
		handleSelector: '.attachment-drag-handle',
		announce: (position) => m.postImageMoved({ position }),
		disabled: () => disabled,
	});

	function keydown(event: KeyboardEvent, id: string) {
		if (!sortable.moveByKey(id, event.key)) return;
		event.preventDefault();
		sortable.refocus(id, '.attachment-drag-handle');
	}
</script>

<div class="attachment-list" use:sortable.container>
	{#each items as item, index (item.id)}
		<div
			class="attachment-item"
			class:dragging={sortable.draggingId === item.id}
			class:drop-target={sortable.isDropTarget(item.id)}
			data-sortable-id={item.id}
		>
			<button
				class="attachment-drag-handle"
				type="button"
				disabled={disabled || items.length < 2}
				aria-label={m.postImageReorder({ index: index + 1 })}
				title={m.postImageReorder({ index: index + 1 })}
				onkeydown={(event) => keydown(event, item.id)}
			>
				<Icon name="drag" size={17} />
			</button>
			{@render children(item)}
		</div>
	{/each}
</div>
<span class="visually-hidden" aria-live="polite">{sortable.announcement}</span>
