<script lang="ts">
	import { RichText } from '@atproto/api';
	import { httpUrl } from '$lib/atproto/facets';
	import { bskyHashtagUrl, bskyProfileUrl } from '$lib/bsky/links';
	import type { BskyFacet } from '$lib/bsky/mapView';

	/**
	 * Bluesky の本文。Nagi の RichText は Markdown を解釈するので使わない（Bluesky の本文に
	 * `*` や `#` があっても装飾ではない）。リンク・メンション・タグの facet だけを見る。
	 * メンションとタグは bsky.app へ飛ばす。
	 */
	let { text, facets }: { text: string; facets?: BskyFacet[] } = $props();

	type Segment = { text: string; href?: string };

	const segments = $derived.by((): Segment[] => {
		const rich = new RichText({ text, facets: facets as RichText['facets'] });
		return [...rich.segments()].map((segment) => {
			if (segment.link) return { text: segment.text, href: httpUrl(segment.link.uri) };
			if (segment.mention) return { text: segment.text, href: bskyProfileUrl(segment.mention.did) };
			if (segment.tag) return { text: segment.text, href: bskyHashtagUrl(segment.tag.tag) };
			return { text: segment.text };
		});
	});
</script>

<p class="post-text bsky-text">
	{#each segments as segment, index (index)}{#if segment.href}<a
				href={segment.href}
				target="_blank"
				rel="noopener noreferrer">{segment.text}</a
			>{:else}{segment.text}{/if}{/each}
</p>

<style>
	.bsky-text {
		margin: 0.35rem 0 0;
		white-space: pre-wrap;
	}
</style>
