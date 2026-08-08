<script lang="ts">
	import { createSortable } from '$lib/dnd/sortable.svelte';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import type { AppLinkFieldRole } from '$lib/atproto/appLinks';

	export type FieldChoice = {
		id: string;
		path: string;
		sample: string;
		role: AppLinkFieldRole;
		shown: boolean;
	};

	let { choices = $bindable() }: { choices: FieldChoice[] } = $props();

	const sortable = createSortable<FieldChoice>({
		items: () => choices,
		commit: (next) => {
			choices = next;
		},
		ghostClass: 'field-sort-ghost',
		handleSelector: '[data-choice-drag-handle]',
	});

	function keydown(event: KeyboardEvent, id: string) {
		if (!sortable.moveByKey(id, event.key)) return;
		event.preventDefault();
		sortable.refocus(id, '[data-choice-drag-handle]');
	}

	function fieldName(path: string): string {
		return path.split('.').pop() ?? path;
	}
</script>

<div class="field-list" use:sortable.container>
	{#each choices as choice, index (choice.id)}
		<div
			class="field-row"
			class:dragging={sortable.draggingId === choice.id}
			class:drop-target={sortable.isDropTarget(choice.id)}
			data-sortable-id={choice.id}
		>
			<button
				type="button"
				class="drag-handle field-handle"
				data-choice-drag-handle
				aria-label={`${fieldName(choice.path)}の順序を変更（上下キーで並び替え）`}
				title="ドラッグまたは上下キーで並び替え"
				onpointerdown={(e) => e.stopPropagation()}
				onkeydown={(event) => keydown(event, choice.id)}
			>
				<Icon name="drag" size={16} />
			</button>
			<div class="field-info" title={`${choice.path}: ${choice.sample}`}>
				<span class="field-name">{fieldName(choice.path)}</span>
				{#if choice.sample}
					<span class="field-sample">{choice.sample}</span>
				{/if}
			</div>
			<div class="field-toggle">
				<ToggleSwitch
					checked={choice.shown}
					label=""
					onchange={(v) => (choice.shown = v)}
				/>
			</div>
		</div>
	{/each}
</div>

<style>
	.field-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-block-start: 0.3rem;
	}
	.field-row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.5rem;
		border: 1px solid var(--line);
		border-radius: var(--radius-s);
		background: var(--bg-inset);
		transition: border-color 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
	}
	.field-row.dragging {
		opacity: 0.3;
		border-color: var(--accent);
	}
	.field-row.drop-target {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-soft);
	}
	:global(.field-sort-ghost) {
		position: fixed;
		z-index: 10000;
		margin: 0;
		opacity: 0.9;
		box-shadow: 0 8px 24px rgb(0 0 0 / 30%);
		pointer-events: none;
		background: var(--bg-raised, var(--bg));
		border: 1px solid var(--accent);
		border-radius: var(--radius-s);
		transform: scale(1.01);
	}
	.drag-handle {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		border: 0;
		background: transparent;
		color: var(--text-muted);
		border-radius: var(--radius-s);
		cursor: grab;
		touch-action: none;
	}
	.drag-handle:hover {
		color: var(--text);
		background: var(--bg-inset);
	}
	.drag-handle:active {
		cursor: grabbing;
	}
	.field-info {
		flex: 1;
		min-inline-size: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.field-name {
		font-size: 0.88rem;
		font-weight: 500;
		color: var(--text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.field-sample {
		font-size: 0.75rem;
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.field-toggle {
		flex: 0 0 auto;
	}
</style>
