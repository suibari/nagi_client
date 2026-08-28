<script lang="ts">
	import { APPVIEW_URL } from '$lib/api/appview';
	import type { Feed } from '$lib/feed/feed.svelte';
	import { mediaTileKey, mediaTiles } from '$lib/feed/media-tiles';
	import { postHref } from '$lib/feed/post-follow.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import ContentWarningMask from './ContentWarningMask.svelte';
	import InfiniteScroll from './InfiniteScroll.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		feed,
		showChannel = false,
		emptyLabel,
	}: { feed?: Feed; showChannel?: boolean; emptyLabel: string } = $props();

	const resolve = (url: string) => (url.startsWith('/') ? APPVIEW_URL + url : url);
	let tiles = $derived(feed ? mediaTiles(feed.visibleItems) : []);
</script>

{#if !feed || (feed.loading && !tiles.length)}
	<div class="state">{m.loading()}</div>
{:else if feed.error && !tiles.length}
	<div class="state error">
		{feed.error}<button
			class="icon-action"
			type="button"
			aria-label={m.retry()}
			title={m.retry()}
			onclick={() => feed?.load()}><Icon name="refresh" size={18} /></button
		>
	</div>
{:else if !tiles.length}
	<div class="state">{emptyLabel}</div>
{:else}
	<div class="media-grid">
		{#each tiles as tile (mediaTileKey(tile))}
			<a class="media-tile" href={postHref(tile.post.uri)}>
				{#if tile.image.contentWarning}
					<!-- タイル自体がリンクなので、マスクは操作させない（リンクの中にボタンを置けない）。
					     解除はスレッドを開いた先の ImageGallery でやってもらう。 -->
					<ContentWarningMask kind="image" interactive={false}>
						<img src={resolve(tile.image.url)} alt="" loading="lazy" />
					</ContentWarningMask>
				{:else}
					<img src={resolve(tile.image.url)} alt={tile.image.alt} loading="lazy" />
				{/if}
				{#if showChannel && tile.post.channel}
					<!-- リンクの入れ子は不正なので、ここはバッジ表示だけ。CH へはスレッド側から辿れる。 -->
					<span class="channel-badge media-tile-channel"
						><Icon name="hash" size={12} />{tile.post.channel.name ?? m.navChannels()}</span
					>
				{/if}
				{#if tile.image.alt}
					<span class="media-tile-alt" aria-hidden="true">ALT</span>
				{/if}
			</a>
		{/each}
	</div>
	<InfiniteScroll
		hasMore={feed.hasMore}
		loading={feed.loading}
		error={feed.error}
		onload={() => feed?.loadMore()}
	/>
{/if}
