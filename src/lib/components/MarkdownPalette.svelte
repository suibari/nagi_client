<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import { portal } from '$lib/actions/portal';

	export type MarkdownFormat =
		'heading' | 'bulletList' | 'numberedList' | 'quote' | 'bold' | 'italic' | 'strike';

	let {
		disabled = false,
		onformat,
	}: {
		disabled?: boolean;
		onformat: (format: MarkdownFormat) => void;
	} = $props();

	let expanded = $state(false);
	let anchor = $state<HTMLButtonElement>();
	let actions = $state<HTMLDivElement>();
	let actionsStyle = $state('');
	let actionsPositioned = $state(false);

	const formats: Array<{ format: MarkdownFormat; mark: string; label: () => string }> = [
		{ format: 'heading', mark: 'H', label: m.markdownHeading },
		{ format: 'bulletList', mark: '•', label: m.markdownBulletList },
		{ format: 'numberedList', mark: '1.', label: m.markdownNumberedList },
		{ format: 'quote', mark: '“', label: m.markdownQuote },
		{ format: 'bold', mark: 'B', label: m.markdownBold },
		{ format: 'italic', mark: 'I', label: m.markdownItalic },
		{ format: 'strike', mark: 'S', label: m.markdownStrike },
	];

	function toggle() {
		expanded = !expanded;
		if (expanded) actionsPositioned = false;
	}

	$effect(() => {
		if (!expanded || !anchor || !actions) return;
		const anchorElement = anchor;
		const actionsElement = actions;
		let frame: number | undefined;
		const updatePosition = () => {
			frame = undefined;
			const rect = anchorElement.getBoundingClientRect();
			const width = actionsElement.offsetWidth;
			const height = actionsElement.offsetHeight;
			const margin = 12;
			const gap = 6;
			const above = rect.top - gap - height;
			const top = above >= margin ? above : rect.bottom + gap;
			const left = Math.min(
				Math.max(margin, rect.right - width),
				Math.max(margin, window.innerWidth - margin - width),
			);
			actionsStyle = `left:${left}px;top:${top}px;`;
			actionsPositioned = true;
		};
		const schedule = () => {
			if (frame !== undefined) return;
			frame = requestAnimationFrame(updatePosition);
		};
		const resizeObserver = new ResizeObserver(schedule);
		resizeObserver.observe(actionsElement);
		window.addEventListener('resize', schedule);
		window.addEventListener('scroll', schedule, true);
		updatePosition();
		return () => {
			if (frame !== undefined) cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			window.removeEventListener('resize', schedule);
			window.removeEventListener('scroll', schedule, true);
		};
	});
</script>

<div class="markdown-palette" class:expanded>
	<button
		bind:this={anchor}
		type="button"
		class="palette-toggle"
		{disabled}
		aria-label={m.markdownPalette()}
		title={m.markdownPalette()}
		aria-expanded={expanded}
		onclick={toggle}
	>
		<span aria-hidden="true">Aa</span>
	</button>
	{#if expanded}
		<div
			bind:this={actions}
			use:portal
			class="palette-actions"
			class:positioned={actionsPositioned}
			style={actionsStyle}
			role="toolbar"
			aria-label={m.markdownPaletteAria()}
		>
			{#each formats as item (item.format)}
				<button
					type="button"
					{disabled}
					class:item-bold={item.format === 'bold'}
					class:item-italic={item.format === 'italic'}
					class:item-strike={item.format === 'strike'}
					aria-label={item.label()}
					title={item.label()}
					onclick={() => onformat(item.format)}
				>
					<span aria-hidden="true">{item.mark}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.markdown-palette {
		position: relative;
		z-index: 5;
		display: flex;
		flex: 0 0 auto;
		flex-direction: row-reverse;
		align-items: center;
		gap: 5px;
		margin: 8px 0;
	}

	button {
		display: inline-grid;
		place-items: center;
		width: 36px;
		height: 36px;
		flex: 0 0 36px;
		padding: 0;
		color: var(--text-muted);
		background: var(--surface-1);
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
	}

	.palette-toggle {
		font-size: 13px;
		font-weight: 800;
		letter-spacing: -0.06em;
	}

	.palette-actions {
		position: fixed;
		z-index: 142;
		display: flex;
		flex-direction: row-reverse;
		gap: 4px;
		padding: 7px;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--surface-1);
		box-shadow: var(--shadow-pop);
	}

	.palette-actions:not(.positioned) {
		visibility: hidden;
	}

	.palette-actions button {
		font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
		font-size: 13px;
		font-weight: 700;
	}

	.palette-actions .item-bold {
		font-weight: 900;
	}

	.palette-actions .item-italic {
		font-style: italic;
	}

	.palette-actions .item-strike span {
		text-decoration: line-through;
	}

	button:active,
	.palette-toggle[aria-expanded='true'] {
		color: var(--accent-strong);
		background: var(--accent-softer);
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}

	@media (hover: hover) and (pointer: fine) {
		button:hover:not(:disabled) {
			color: var(--accent-strong);
			background: var(--accent-softer);
		}
	}

	@media (max-width: 520px) {
		.palette-actions {
			display: grid;
			grid-template-columns: repeat(4, 36px);
			gap: 5px;
		}
	}
</style>
