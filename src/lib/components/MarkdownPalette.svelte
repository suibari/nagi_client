<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';

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

	const formats: Array<{ format: MarkdownFormat; mark: string; label: () => string }> = [
		{ format: 'heading', mark: 'H', label: m.markdownHeading },
		{ format: 'bulletList', mark: '•', label: m.markdownBulletList },
		{ format: 'numberedList', mark: '1.', label: m.markdownNumberedList },
		{ format: 'quote', mark: '“', label: m.markdownQuote },
		{ format: 'bold', mark: 'B', label: m.markdownBold },
		{ format: 'italic', mark: 'I', label: m.markdownItalic },
		{ format: 'strike', mark: 'S', label: m.markdownStrike },
	];
</script>

<div class="markdown-palette" class:expanded>
	<button
		type="button"
		class="palette-toggle"
		{disabled}
		aria-label={m.markdownPalette()}
		title={m.markdownPalette()}
		aria-expanded={expanded}
		onclick={() => (expanded = !expanded)}
	>
		<span aria-hidden="true">Aa</span>
	</button>
	{#if expanded}
		<div class="palette-actions" role="toolbar" aria-label={m.markdownPaletteAria()}>
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
		background: var(--bg-raised);
		border: 1px solid var(--line);
		border-radius: 50%;
	}

	.palette-toggle {
		font-size: 13px;
		font-weight: 800;
		letter-spacing: -0.06em;
	}

	.palette-actions {
		display: flex;
		flex-direction: row-reverse;
		gap: 4px;
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
		.markdown-palette.expanded {
			z-index: 25;
		}

		.palette-actions {
			position: absolute;
			right: 0;
			bottom: calc(100% + 6px);
			display: grid;
			grid-template-columns: repeat(4, 36px);
			gap: 5px;
			padding: 7px;
			border: 1px solid var(--line);
			border-radius: var(--radius-m);
			background: var(--bg-raised);
			box-shadow: var(--shadow-card);
		}
	}
</style>
