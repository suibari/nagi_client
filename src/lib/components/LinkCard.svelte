<script lang="ts">
	import type { LinkCardView } from '$lib/api/types';
	import { APPVIEW_URL } from '$lib/api/appview';
	import { httpUrl } from '$lib/atproto/facets';
	let { card }: { card: LinkCardView } = $props();
	// カードの URI が http(s) の場合のみリンクにする。細工された javascript: URI は
	// クリック不能なプレーンカードとして描画する。
	let safeHref = $derived(httpUrl(card.uri));
	let host = $derived.by(() => {
		try {
			return new URL(card.uri).hostname;
		} catch {
			return card.uri;
		}
	});
	const resolve = (url: string) => (url.startsWith('/') ? APPVIEW_URL + url : url);
</script>

<svelte:element
	this={safeHref ? 'a' : 'div'}
	class="link-card"
	href={safeHref}
	target={safeHref ? '_blank' : undefined}
	rel={safeHref ? 'noopener noreferrer' : undefined}
>
	{#if card.thumb}<img src={resolve(card.thumb)} alt="" />{/if}
	<span class="link-card-copy">
		<strong>{card.title}</strong>
		{#if card.description}<span>{card.description}</span>{/if}
		<small>{host}</small>
	</span>
</svelte:element>
