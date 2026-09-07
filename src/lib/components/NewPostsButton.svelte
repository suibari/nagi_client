<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';

	let { visible, onclick }: { visible: boolean; onclick: () => void } = $props();
</script>

{#if visible}
	<button class="new-posts-button" type="button" {onclick}>
		<span aria-hidden="true">↑</span>
		<span>{m.newPostsAvailable()}</span>
	</button>
{/if}

<style>
	.new-posts-button {
		position: fixed;
		z-index: 35;
		inset-block-start: 14px;
		inset-inline-start: 50%;
		transform: translateX(-50%);
		display: inline-flex;
		align-items: center;
		gap: 7px;
		max-width: calc(100% - 24px);
		padding: 9px 15px;
		border: 1px solid var(--accent-border);
		border-radius: var(--r-full);
		background: var(--accent-strong);
		box-shadow: var(--shadow-pop);
		color: var(--text-on-accent);
		font-size: 13px;
		font-weight: 800;
		white-space: nowrap;
		cursor: pointer;
		animation: new-posts-button-in 0.24s cubic-bezier(0.2, 0.8, 0.25, 1.15);
	}
	.new-posts-button:hover {
		filter: brightness(1.06);
	}
	.new-posts-button:focus-visible {
		outline: 3px solid var(--focus-ring);
		outline-offset: 2px;
	}
	@keyframes new-posts-button-in {
		from {
			opacity: 0;
			transform: translate(-50%, -12px) scale(0.94);
		}
		to {
			opacity: 1;
			transform: translateX(-50%);
		}
	}
	@media (max-width: 767px) {
		.new-posts-button {
			inset-block-start: calc(var(--mobile-header-h) + 8px);
		}
	}
</style>
