<script lang="ts">
	import type { LinkCardView } from '$lib/api/types';
	import { APPVIEW_URL } from '$lib/api/appview';
	let { card }: { card: LinkCardView } = $props();
	let host = $derived.by(() => {
		try {
			return new URL(card.uri).hostname;
		} catch {
			return card.uri;
		}
	});
	const resolve = (url: string) => (url.startsWith('/') ? APPVIEW_URL + url : url);
</script>

<a class="link-card" href={card.uri} target="_blank" rel="noopener noreferrer">
	{#if card.thumb}<img src={resolve(card.thumb)} alt="" />{/if}
	<span class="link-card-copy">
		<strong>{card.title}</strong>
		{#if card.description}<span>{card.description}</span>{/if}
		<small>{host}</small>
	</span>
</a>
