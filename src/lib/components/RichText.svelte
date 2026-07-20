<script lang="ts">
	import type { Facet } from '$lib/api/types';
	import { httpUrl } from '$lib/atproto/facets';
	let { text, facets = [] }: { text: string; facets?: Facet[] } = $props();
	type Segment = { text: string; href?: string; external?: boolean };
	let segments = $derived.by(() => {
		const bytes = new TextEncoder().encode(text);
		const decoder = new TextDecoder();
		const result: Segment[] = [];
		let offset = 0;
		for (const facet of [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart)) {
			const feature = facet.features.find((item) => {
				if (typeof item !== 'object' || item === null) return false;
				const candidate = item as { $type?: unknown; uri?: unknown; did?: unknown };
				return (
					(candidate.$type === 'app.bsky.richtext.facet#link' &&
						typeof candidate.uri === 'string') ||
					(candidate.$type === 'app.bsky.richtext.facet#mention' &&
						typeof candidate.did === 'string')
				);
			}) as { $type: string; uri?: string; did?: string } | undefined;
			const start = facet.index.byteStart;
			const end = facet.index.byteEnd;
			if (!feature || start < offset || end <= start || end > bytes.length) continue;
			if (start > offset) result.push({ text: decoder.decode(bytes.slice(offset, start)) });
			// facet の URI が http(s) の場合のみリンクとして描画する。それ以外はリンクにせず
			// テキスト表示にし、細工された javascript: URI がクリックで実行されないようにする。
			const href =
				feature.$type === 'app.bsky.richtext.facet#mention' && feature.did
					? `/profile/${encodeURIComponent(feature.did)}`
					: feature.uri
						? httpUrl(feature.uri)
						: undefined;
			result.push({
				text: decoder.decode(bytes.slice(start, end)),
				href,
				external: feature.$type === 'app.bsky.richtext.facet#link',
			});
			offset = end;
		}
		if (offset < bytes.length) result.push({ text: decoder.decode(bytes.slice(offset)) });
		return result;
	});
</script>

{#each segments as segment}
	{#if segment.href}<a
			class="rich-link"
			href={segment.href}
			target={segment.external ? '_blank' : undefined}
			rel={segment.external ? 'noopener noreferrer' : undefined}>{segment.text}</a
		>{:else}{segment.text}{/if}
{/each}
