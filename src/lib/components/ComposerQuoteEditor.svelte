<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import type { QuotePick } from '$lib/post/quote-pick.svelte';
	import QuoteCard from './QuoteCard.svelte';

	let { quote, disabled = false }: { quote: QuotePick; disabled?: boolean } = $props();
</script>

{#if quote.pending || quote.post || quote.error}
	<div class="composer-quote">
		{#if quote.pending}
			<p class="composer-quote-status" role="status" aria-live="polite">{m.quoteResolving()}</p>
		{:else if quote.post}
			<div class="composer-quote-preview">
				<QuoteCard post={quote.post} />
				<button
					type="button"
					class="composer-quote-remove"
					{disabled}
					aria-label={m.quoteRemove()}
					title={m.quoteRemove()}
					onclick={() => quote.clear()}>×</button
				>
			</div>
		{/if}
		{#if quote.error}
			<p class="composer-quote-error error" role="alert">{quote.error}</p>
		{/if}
	</div>
{/if}

<style>
	.composer-quote {
		margin: 10px 0;
	}
	.composer-quote-status {
		color: var(--text-muted);
		font-size: 12px;
	}
	/* 引用カードは本文と同じ見え方のまま、右上に外すボタンだけを重ねる。 */
	.composer-quote-preview {
		position: relative;
		padding-right: 40px;
	}
	.composer-quote-remove {
		position: absolute;
		top: 4px;
		right: 0;
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border: 0;
		border-radius: var(--r-sm);
		background: transparent;
		color: var(--text-sub);
		font-size: 20px;
		line-height: 1;
		cursor: pointer;
	}
	.composer-quote-remove:hover {
		color: var(--text);
		background: var(--surface-2);
	}
	.composer-quote-error {
		margin-top: 4px;
		font-size: 12px;
	}
</style>
