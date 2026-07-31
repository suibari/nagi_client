<script lang="ts">
	import type { ActorView, NewsView } from '$lib/api/types';
	import { newsBotPost, safeNewsUrl } from '$lib/news/bot-post';
	import { NewsQuote } from '$lib/news/quote.svelte';
	import { m, relativeTime } from '$lib/i18n/i18n.svelte';
	import ChatBubble from './ChatBubble.svelte';
	import InlinePostComposer from './InlinePostComposer.svelte';
	import ReactionBar from './ReactionBar.svelte';
	import Icon from './shell/Icon.svelte';

	/**
	 * my Nagi 用のニュース1行表示。
	 *
	 * NewsCard はカードなので、他に3セクションが縦に並ぶ my Nagi では大きすぎる。
	 * ここは見出しだけを1行に畳み、押した行だけがその場で開いて botたんコメントと
	 * リアクションを見せる。同時に開くのは1件だけ。
	 */
	let { items, botActor }: { items: NewsView[]; botActor?: ActorView } = $props();

	let openUri = $state<string>();
	let reactionPickerOpen = $state(false);
	let reactionButton = $state<HTMLButtonElement>();
	// 開くのは1行だけなので、引用の状態も1つで足りる。行を替えたら書きかけは捨てる。
	const quote = new NewsQuote();

	function toggle(uri: string) {
		reactionPickerOpen = false;
		quote.cancel();
		openUri = openUri === uri ? undefined : uri;
	}

	/**
	 * 見出しが枠に収まらない行だけ、ホバー中に流す。
	 * 溢れ幅と所要時間を CSS 変数で渡し、動き自体は CSS 側の keyframes に任せる。
	 */
	function startMarquee(event: MouseEvent | FocusEvent) {
		const text = (event.currentTarget as HTMLElement).querySelector<HTMLElement>(
			'.news-ticker-text',
		);
		if (!text) return;
		const overflow = text.scrollWidth - text.clientWidth;
		if (overflow <= 0) return;
		text.style.setProperty('--marquee-shift', `${-overflow}px`);
		// 速度を一定にしたいので、距離に比例した時間を与える（約 60px/秒）。
		text.style.setProperty('--marquee-duration', `${Math.max(2, overflow / 60)}s`);
		text.classList.add('marquee');
	}

	function stopMarquee(event: MouseEvent | FocusEvent) {
		(event.currentTarget as HTMLElement)
			.querySelector<HTMLElement>('.news-ticker-text')
			?.classList.remove('marquee');
	}
</script>

<ul class="news-ticker">
	{#each items as news (news.uri)}
		<li class="news-ticker-item" class:open={openUri === news.uri}>
			<button
				class="news-ticker-row"
				type="button"
				aria-expanded={openUri === news.uri}
				onclick={() => toggle(news.uri)}
				onmouseenter={startMarquee}
				onmouseleave={stopMarquee}
				onfocus={startMarquee}
				onblur={stopMarquee}
			>
				<span class="news-ticker-title"><span class="news-ticker-text">{news.title}</span></span>
				<time class="news-ticker-time">{relativeTime(news.publishedAt ?? news.createdAt)}</time>
				<span class="news-ticker-caret" class:open={openUri === news.uri} aria-hidden="true">
					<Icon name="chevron" size={15} />
				</span>
			</button>
			{#if openUri === news.uri}
				{@const url = safeNewsUrl(news.url)}
				<div class="news-ticker-detail">
					<ChatBubble post={newsBotPost(news, botActor)} displayOnly />
					<ReactionBar
						uri={news.uri}
						cid={news.cid}
						reactions={news.reactions}
						bind:pickerOpen={reactionPickerOpen}
						pickerAnchor={reactionButton}
					/>
					<div class="news-ticker-actions">
						{#if url}
							<a class="primary news-read" href={url} target="_blank" rel="noopener noreferrer"
								>{m.newsReadArticle()}</a
							>
						{/if}
						<button
							class="ghost icon-action timeline-action"
							type="button"
							aria-label={m.newsQuote()}
							title={m.newsQuote()}
							onclick={() => quote.toggle()}><Icon name="quote" size={18} /></button
						>
						<button
							bind:this={reactionButton}
							class="ghost icon-action timeline-action"
							class:active={reactionPickerOpen}
							type="button"
							aria-label={m.addReactionAria()}
							title={m.addReactionAria()}
							aria-expanded={reactionPickerOpen}
							onclick={() => (reactionPickerOpen = !reactionPickerOpen)}
						>
							<Icon name="emojiPlus" size={18} />
						</button>
					</div>
					{#if quote.composing}
						<InlinePostComposer
							id={`my-nagi-news-quote-${news.cid}`}
							label={m.newsQuoteLabel()}
							placeholder={m.quotePlaceholder()}
							bind:text={quote.text}
							bind:mentions={quote.mentions}
							bind:channels={quote.channels}
							bind:emojis={quote.emojis}
							channelSuggestionsEnabled
							bind:attachments={quote.attachments}
							bind:linkCards={quote.linkCards}
							busy={quote.busy}
							error={quote.error}
							onsubmit={() => void quote.submit(news)}
							oncancel={() => quote.cancel()}
						/>
					{/if}
				</div>
			{/if}
		</li>
	{/each}
</ul>

<style>
	/*
		minmax(0, 1fr) と min-width: 0 が両方要る。既定の min-width: auto のままだと
		行が中身の最小幅まで広がってしまい、見出しの省略も botたんコメントの折り返しも
		効かずに右へはみ出す。
	*/
	.news-ticker {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.news-ticker-item {
		min-width: 0;
	}

	.news-ticker-item + .news-ticker-item {
		border-top: 1px solid var(--line);
	}

	.news-ticker-row {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 9px 4px;
		border: 0;
		background: none;
		color: var(--text);
		font: inherit;
		text-align: start;
		cursor: pointer;
	}

	.news-ticker-row:hover,
	.news-ticker-row:focus-visible {
		color: var(--accent-strong);
	}

	.news-ticker-title {
		flex: 1;
		min-width: 0;
		overflow: hidden;
	}

	.news-ticker-text {
		display: block;
		overflow: hidden;
		font-size: 0.86rem;
		line-height: 1.5;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* 溢れている行だけ JS が付ける。往復して元の位置に戻る。 */
	:global(.news-ticker-text.marquee) {
		text-overflow: clip;
		animation: news-ticker-marquee var(--marquee-duration, 4s) ease-in-out infinite alternate;
	}

	@keyframes news-ticker-marquee {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(var(--marquee-shift, 0));
		}
	}

	.news-ticker-time {
		flex: 0 0 auto;
		color: var(--text-faint);
		font-size: 0.72rem;
	}

	.news-ticker-caret {
		flex: 0 0 auto;
		display: grid;
		place-items: center;
		color: var(--text-faint);
		transform: rotate(90deg);
		transition: transform 0.18s ease;
	}

	.news-ticker-caret.open {
		transform: rotate(270deg);
	}

	.news-ticker-detail {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 8px;
		min-width: 0;
		padding: 4px 4px 12px;
	}

	.news-ticker-actions {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.news-ticker-actions .news-read {
		display: inline-flex;
		align-items: center;
		min-height: 34px;
		padding: 0.4rem 0.85rem;
		text-decoration: none;
	}

	.news-ticker-actions .icon-action {
		width: 34px;
		height: 34px;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.news-ticker-text.marquee) {
			animation: none;
		}

		.news-ticker-caret {
			transition: none;
		}
	}
</style>
