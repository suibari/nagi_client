<script lang="ts">
	import type { ActorView, NewsView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { safeNewsImageUrl } from '$lib/news/image';
	import LinkCard from './LinkCard.svelte';
	import QuoteFrame from './QuoteFrame.svelte';
	let { news, botActor }: { news: NewsView; botActor?: ActorView } = $props();
	let card = $derived({
		uri: news.url,
		title: news.title,
		description: news.sourceName,
		thumb: safeNewsImageUrl(news.image),
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
		<!--
			botたんのコメントは吹き出しで出す。ニュース一覧（NewsCard）は ChatBubble を使って
			いるのに、引用のときだけ素のテキストで出ていて見え方が揃っていなかった。
			ここは既に ChatBubble の中なので、入れ子にせず共通の .bubble だけを借りる。
			話し手と時刻は QuoteFrame のヘッダーが出しているので重複させない。
		-->
		{#if news.botComment}<p class="bubble bot-comment">{news.botComment}</p>{/if}
		<LinkCard {card} />
	</QuoteFrame>
{/if}

<style>
	.bot-comment {
		/* .bubble のしっぽ（::before が left: -8px）が切れないよう左に逃がす。 */
		margin: 0 0 0.5rem 8px;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
	}
	.unavailable {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-inline-size: 0;
		max-inline-size: 100%;
		padding: 0.75rem;
		border: 1px solid var(--line);
		border-radius: 0.8rem;
		color: var(--text-muted);
		margin-top: 0.6rem;
	}
</style>
