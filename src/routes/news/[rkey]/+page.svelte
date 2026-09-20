<script lang="ts">
	import NewsCard from '$lib/components/NewsCard.svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	let { data } = $props();
</script>

<a class="news-back" href="/news">{m.newsBackToList()}</a>
<article class="news-permalink">
	<NewsCard news={data.news} botActor={data.botActor} showImage clampTitle={false} />
</article>

<style>
	.news-back {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		margin-block-end: 12px;
		color: var(--text-muted);
		font-size: 0.86rem;
		font-weight: 700;
		text-decoration: none;
	}
	.news-back:hover,
	.news-back:focus-visible {
		color: var(--accent-strong);
	}
	.news-permalink {
		display: grid;
		gap: 14px;
	}
</style>
