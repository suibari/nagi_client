<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';

	let {
		label,
		size = 'md',
		inline = false,
		decorative = false,
	}: {
		label?: string;
		size?: 'sm' | 'md';
		inline?: boolean;
		decorative?: boolean;
	} = $props();

	// 既定値を props に置くと初期化時の言語で固定されるため、描画時に解決して言語切替へ追従させる。
	const ariaLabel = $derived(label ?? m.loading());
</script>

<span
	class="loading-indicator"
	class:inline
	role={decorative ? undefined : 'status'}
	aria-label={decorative ? undefined : ariaLabel}
	aria-hidden={decorative ? 'true' : undefined}
>
	<span class="ring" class:small={size === 'sm'} aria-hidden="true"></span>
</span>

<style>
	.loading-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32px;
		color: var(--accent-strong);
	}
	.inline {
		display: inline-flex;
		padding: 0;
		vertical-align: middle;
		color: inherit;
	}
	.ring {
		flex: none;
		box-sizing: border-box;
		width: 24px;
		height: 24px;
		border: 3px solid color-mix(in srgb, currentColor 25%, transparent);
		border-top-color: currentColor;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	.small {
		width: 16px;
		height: 16px;
		border-width: 2px;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.ring {
			animation: none;
		}
	}
</style>
