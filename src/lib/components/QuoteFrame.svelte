<script lang="ts">
	import type { Snippet } from 'svelte';
	import { dateLocale } from '$lib/i18n/i18n.svelte';
	let {
		name,
		profileHref,
		datetime,
		timeHref,
		children,
	}: {
		name: string;
		profileHref?: string;
		datetime?: string;
		timeHref?: string;
		children: Snippet;
	} = $props();
	let label = $derived.by(() =>
		datetime
			? new Date(datetime).toLocaleString(dateLocale(), {
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				})
			: '',
	);
</script>

<aside class="quote-card">
	<header class="quote-meta">
		{#if profileHref}<a href={profileHref}><strong>{name}</strong></a>{:else}<strong>{name}</strong
			>{/if}
		{#if datetime}<span aria-hidden="true">·</span>
			<time {datetime}
				>{#if timeHref}<a href={timeHref}>{label}</a>{:else}{label}{/if}</time
			>{/if}
	</header>
	{@render children()}
</aside>

<style>
	.quote-card {
		margin-top: 0.6rem;
		min-inline-size: 0;
		max-inline-size: 100%;
		padding: 0.25rem 0 0.25rem 0.75rem;
		border-left: 3px solid var(--line-strong);
		color: var(--text);
		font-size: 0.875rem;
		text-align: left;
	}

	.quote-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-bottom: 0.35rem;
		color: var(--text-muted);
		font-size: 0.75rem;
		min-inline-size: 0;
	}

	.quote-meta > a {
		min-inline-size: 0;
		max-inline-size: 100%;
	}

	.quote-meta strong {
		color: var(--text-strong);
		overflow-wrap: anywhere;
	}

	.quote-meta a:hover {
		color: var(--accent-strong);
	}
</style>
