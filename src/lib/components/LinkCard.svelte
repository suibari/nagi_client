<script lang="ts">
	import type { LinkCardView } from '$lib/api/types';
	import { APPVIEW_URL } from '$lib/api/appview';
	import { httpUrl } from '$lib/atproto/facets';
	import { decorateSiblingUrl } from '$lib/sso/links';
	import { isInternalUrl, toInternalPath } from '$lib/utils/url';
	import { youtubeEmbedUrl } from '$lib/media/youtube';
	import { m } from '$lib/i18n/i18n.svelte';
	let { card }: { card: LinkCardView } = $props();
	let playing = $state(false);
	let playingUri: string | undefined;
	$effect(() => {
		if (card.uri === playingUri) return;
		playingUri = card.uri;
		playing = false;
	});
	// カードの URI が http(s) の場合のみリンクにする。細工された javascript: URI は
	// クリック不能なプレーンカードとして描画する。
	// 姉妹アプリ宛なら did ヒントを足す（それ以外の URL は素通り）。
	let rawHref = $derived(decorateSiblingUrl(httpUrl(card.uri)));
	let isInternal = $derived(isInternalUrl(rawHref));
	let safeHref = $derived(isInternal ? toInternalPath(rawHref) : rawHref);
	let videoSrc = $derived(safeHref ? youtubeEmbedUrl(safeHref) : undefined);
	let host = $derived.by(() => {
		try {
			return new URL(card.uri).hostname;
		} catch {
			return card.uri;
		}
	});
	const resolve = (url: string) => (url.startsWith('/') ? APPVIEW_URL + url : url);
</script>

{#if videoSrc}
	<div class="link-card youtube-card">
		<div class="youtube-player">
			{#if playing}
				<iframe
					src={`${videoSrc}?autoplay=1`}
					title={m.youtubePlay({ title: card.title || 'YouTube' })}
					referrerpolicy="strict-origin-when-cross-origin"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowfullscreen
				></iframe>
			{:else}
				<button
					class="youtube-preview"
					type="button"
					aria-label={m.youtubePlay({ title: card.title || 'YouTube' })}
					onclick={() => (playing = true)}
				>
					{#if card.thumb}<img src={resolve(card.thumb)} alt="" />{/if}
					<span class="youtube-play" aria-hidden="true"></span>
				</button>
			{/if}
		</div>
		<a class="link-card-copy" href={safeHref} target="_blank" rel="noopener noreferrer">
			<strong>{card.title}</strong>
			{#if card.description}<span>{card.description}</span>{/if}
			<small>{host}</small>
		</a>
	</div>
{:else}
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
{/if}
