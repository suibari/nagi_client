<script lang="ts">
	import type { NewsView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	let { news }: { news: NewsView } = $props();
	let safeUrl = $derived.by(() => { try { const u = new URL(news.url); return ['http:', 'https:'].includes(u.protocol) ? u.href : undefined; } catch { return undefined; } });
</script>
{#if news.unavailable}
	<div class="news-quote unavailable">{m.newsUnavailable()}</div>
{:else}
	<a class="news-quote" href={safeUrl} target="_blank" rel="noopener noreferrer">
		<small>{news.sourceName ?? m.newsSourceUnknown()}</small><strong>{news.title}</strong>
	</a>
{/if}
<style>
	.news-quote{display:flex;flex-direction:column;gap:.3rem;margin-top:.6rem;padding:.75rem;border:1px solid var(--line);border-radius:.8rem;color:inherit;text-decoration:none}.news-quote:hover{background:var(--bg-hover)}.news-quote small,.unavailable{color:var(--text-muted)}
</style>
