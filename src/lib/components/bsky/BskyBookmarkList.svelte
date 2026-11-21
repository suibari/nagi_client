<script lang="ts">
	import type { ModerationOpts } from '@atproto/api';
	import { onMount } from 'svelte';
	import { bskyBookmarks, getBskyBookmarks, getModerationOpts } from '$lib/bsky/agent';
	import type { BskyPostCardView } from '$lib/bsky/mapView';
	import { m } from '$lib/i18n/i18n.svelte';
	import InfiniteScroll from '../InfiniteScroll.svelte';
	import Spinner from '../Spinner.svelte';
	import BskyPostCard from './BskyPostCard.svelte';

	/**
	 * Nagi のブックマーク画面の Bluesky 区分（BSKY-13）。Bluesky 側のブックマークをそのまま一覧する。
	 * 公式アプリで保存したものも出る。Nagi のフォルダは使わない。
	 */
	let moderation = $state<ModerationOpts>();
	let items = $state<BskyPostCardView[]>([]);
	let cursor = $state<string>();
	let loading = $state(true);
	let error = $state('');
	let moreError = $state('');
	// この画面で外したものは、読み直すまで一覧から消す。
	const visible = $derived(items.filter((post) => bskyBookmarks.get(post.uri) !== false));

	onMount(async () => {
		try {
			moderation = await getModerationOpts();
			const page = await getBskyBookmarks();
			items = page.items;
			cursor = page.cursor;
		} catch (cause) {
			console.warn('[BskyBookmarkList] load failed', cause);
			error = m.bskyBookmarksFailed();
		} finally {
			loading = false;
		}
	});

	async function loadMore() {
		if (!cursor || loading) return;
		loading = true;
		moreError = '';
		try {
			const page = await getBskyBookmarks(cursor);
			const known = new Set(items.map((post) => post.uri));
			items = [...items, ...page.items.filter((post) => !known.has(post.uri))];
			cursor = page.cursor;
		} catch {
			moreError = m.bskyBookmarksFailed();
		} finally {
			loading = false;
		}
	}
</script>

{#if loading && !items.length}<Spinner />
{:else if error}<div class="state error">{error}</div>
{:else if !visible.length || !moderation}<div class="state">{m.bskyBookmarksEmpty()}</div>
{:else}
	{#each visible as post (post.uri)}
		<article class="bookmark-item">
			<BskyPostCard item={{ key: post.uri, post }} {moderation} />
		</article>
	{/each}
	<InfiniteScroll hasMore={Boolean(cursor)} {loading} error={moreError} onload={() => loadMore()} />
{/if}
