<script lang="ts">
	import type { ActorView, NewsView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import QuoteFrame from './QuoteFrame.svelte';
	let { news, botActor }: { news: NewsView; botActor?: ActorView } = $props();
	let safeUrl = $derived.by(() => {
		try {
			const u = new URL(news.url);
			return ['http:', 'https:'].includes(u.protocol) ? u.href : undefined;
		} catch {
			return undefined;
		}
	});
</script>

{#if news.unavailable}
	<div class="news-quote unavailable">{m.newsUnavailable()}</div>
{:else}
	<QuoteFrame
		name={botActor?.displayName ?? botActor?.handle ?? 'Botたん'}
		profileHref={botActor ? `/profile/${botActor.did}` : undefined}
		datetime={news.createdAt}
	>
		{#if news.botComment}<p class="bot-comment">{news.botComment}</p>{/if}
		<a class="news-quote" href={safeUrl} target="_blank" rel="noopener noreferrer">
			<small>{news.sourceName ?? m.newsSourceUnknown()}</small><strong>{news.title}</strong>
		</a>
	</QuoteFrame>
{/if}

<style>
	.bot-comment {
		margin: 0 0 0.5rem;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
	}
	.news-quote {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-inline-size: 0;
		max-inline-size: 100%;
		padding: 0.75rem;
		border: 1px solid var(--line);
		border-radius: 0.8rem;
		color: inherit;
		text-decoration: none;
	}
	.news-quote strong,
	.news-quote small {
		overflow-wrap: anywhere;
	}
	.news-quote:hover {
		background: var(--bg-hover);
	}
	.news-quote small,
	.unavailable {
		color: var(--text-muted);
	}
	.unavailable {
		margin-top: 0.6rem;
	}
</style>
