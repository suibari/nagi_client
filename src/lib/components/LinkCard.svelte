<script lang="ts">
	import type { LinkCardView } from '$lib/api/types';
	import { APPVIEW_URL } from '$lib/api/appview';
	import { httpUrl } from '$lib/atproto/facets';
	import { decorateSiblingUrl } from '$lib/sso/links';
	import { isInternalUrl, toInternalPath } from '$lib/utils/url';
	let { card }: { card: LinkCardView } = $props();
	// カードの URI が http(s) の場合のみリンクにする。細工された javascript: URI は
	// クリック不能なプレーンカードとして描画する。
	// 姉妹アプリ宛なら did ヒントを足す（それ以外の URL は素通り）。
	let rawHref = $derived(decorateSiblingUrl(httpUrl(card.uri)));
	let isInternal = $derived(isInternalUrl(rawHref));
	let safeHref = $derived(isInternal ? toInternalPath(rawHref) : rawHref);
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
	target={safeHref && !isInternal ? '_blank' : undefined}
	rel={safeHref && !isInternal ? 'noopener noreferrer' : undefined}
>
	{#if card.thumb}<img src={resolve(card.thumb)} alt="" />{/if}
	<span class="link-card-copy">
		<strong>{card.title}</strong>
		{#if card.description}<span>{card.description}</span>{/if}
		<small>{host}</small>
	</span>
</svelte:element>
