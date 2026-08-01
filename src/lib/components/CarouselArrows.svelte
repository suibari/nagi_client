<script lang="ts">
	import Icon from './shell/Icon.svelte';

	let {
		previousLabel,
		nextLabel,
		previousDisabled = false,
		nextDisabled = false,
		onprevious,
		onnext,
	}: {
		previousLabel: string;
		nextLabel: string;
		previousDisabled?: boolean;
		nextDisabled?: boolean;
		onprevious: () => void;
		onnext: () => void;
	} = $props();
</script>

<div class="carousel-arrows">
	<button
		type="button"
		class="previous"
		disabled={previousDisabled}
		aria-label={previousLabel}
		title={previousLabel}
		onclick={onprevious}
	>
		<Icon name="chevron" size={16} />
	</button>
	<button
		type="button"
		disabled={nextDisabled}
		aria-label={nextLabel}
		title={nextLabel}
		onclick={onnext}
	>
		<Icon name="chevron" size={16} />
	</button>
</div>

<style>
	.carousel-arrows {
		display: flex;
		gap: 4px;
	}

	button {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
		background: var(--surface-2);
		color: var(--text-sub);
		cursor: pointer;
		transition:
			background 0.16s ease,
			border-color 0.16s ease,
			color 0.16s ease,
			opacity 0.16s ease;
	}

	button.previous {
		transform: rotate(180deg);
	}

	button:hover:not(:disabled),
	button:focus-visible:not(:disabled) {
		border-color: var(--line-strong);
		background: var(--surface-3);
		color: var(--text);
	}

	button:disabled {
		cursor: default;
		opacity: 0.28;
	}

	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}
	}
</style>
