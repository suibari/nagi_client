<script lang="ts">
	import type { ActorView, RadioQuoteView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import QuoteFrame from '$lib/components/QuoteFrame.svelte';
	import { radioComment } from './share';
	import { radioSongCard } from './song-card';

	/**
	 * ポストが引用したbotたんラジオ。ニュースの引用（NewsQuoteCard）と同じ枠で、
	 * botたんの吹き出しにDJコメント、その下に曲のカードを出す。
	 */
	let { radio, botActor }: { radio: RadioQuoteView; botActor?: ActorView } = $props();
	const comment = $derived(radioComment({ comment: '', ...radio }));
	const card = $derived(radioSongCard({ ...radio, comment }));
</script>

{#if radio.unavailable}
	<div class="radio-quote unavailable">{m.radioUnavailable()}</div>
{:else}
	<QuoteFrame
		name={botActor?.displayName ?? botActor?.handle ?? 'Botたん'}
		profileHref={botActor ? `/profile/${botActor.did}` : undefined}
		datetime={radio.publishedAt}
	>
		<!-- 吹き出しとカードの並びは NewsQuoteCard とそろえる。 -->
		{#if comment}<p class="bubble bot-comment">{comment}</p>{/if}
		{#if card}<div class="radio-quote-card">
				<LinkCard card={{ ...card, description: m.radioQuoteLabel() }} />
			</div>{/if}
	</QuoteFrame>
{/if}

<style>
	.bot-comment {
		/* .bubble のしっぽ（::before が left: -8px）が切れないよう左に逃がす。 */
		margin: 0 0 0.5rem 8px;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
	}
	/* 正方形のジャケットを切り抜かず、画像全体を見せる（RadioContent と同じ）。 */
	.radio-quote-card :global(.link-card > img) {
		width: 108px;
		height: 108px;
		object-fit: contain;
		align-self: center;
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
