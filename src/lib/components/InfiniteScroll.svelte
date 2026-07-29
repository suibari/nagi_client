<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';

	let {
		hasMore,
		loading,
		error = '',
		onload,
	}: {
		hasMore: boolean;
		loading: boolean;
		error?: string;
		onload: () => void | Promise<void>;
	} = $props();

	let sentinel = $state<HTMLElement>();
	let observerSupported = $state(true);

	onMount(() => {
		observerSupported = 'IntersectionObserver' in window;
	});

	$effect(() => {
		if (
			!observerSupported ||
			!('IntersectionObserver' in window) ||
			!sentinel ||
			!hasMore ||
			loading ||
			error
		)
			return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) void onload();
			},
			{ rootMargin: '0px 0px 240px' },
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

{#if hasMore}
	{#if error}
		<div class="infinite-scroll-error" role="alert">
			<span>{error}</span>
			<button
				class="more icon-action"
				type="button"
				aria-label={m.retry()}
				title={m.retry()}
				onclick={() => void onload()}><Icon name="refresh" size={18} /></button
			>
		</div>
	{:else if observerSupported}
		<div
			class="infinite-scroll"
			class:loading
			bind:this={sentinel}
			role={loading ? 'status' : undefined}
			aria-label={loading ? m.loading() : undefined}
		>
			{#if loading}<span class="spinner" aria-hidden="true"></span>{/if}
		</div>
	{:else}
		<button
			class="more icon-action"
			type="button"
			disabled={loading}
			aria-label={m.loadMore()}
			title={m.loadMore()}
			onclick={() => void onload()}><Icon name="more" size={20} /></button
		>
	{/if}
{/if}

<style>
	.infinite-scroll {
		min-height: 1px;
	}
	.infinite-scroll.loading {
		display: grid;
		place-items: center;
		min-height: 64px;
	}
	.infinite-scroll-error {
		display: grid;
		justify-items: center;
		gap: 8px;
		padding: 12px;
		color: var(--danger);
		font-size: 13px;
		text-align: center;
		overflow-wrap: anywhere;
	}
	.infinite-scroll-error .more {
		margin: 0;
	}
</style>
