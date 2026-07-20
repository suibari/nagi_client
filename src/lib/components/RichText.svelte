<script lang="ts">
	import type { Facet } from '$lib/api/types';
	let { text, facets = [] }: { text: string; facets?: Facet[] } = $props();
	type Segment = { text: string; uri?: string };
	let segments = $derived.by(() => {
		const bytes = new TextEncoder().encode(text);
		const decoder = new TextDecoder();
		const result: Segment[] = [];
		let offset = 0;
		for (const facet of [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart)) {
			const feature = facet.features.find(
				(item): item is { $type: string; uri: string } =>
					typeof item === 'object' &&
					item !== null &&
					(item as { $type?: unknown }).$type === 'app.bsky.richtext.facet#link' &&
					typeof (item as { uri?: unknown }).uri === 'string',
			);
			const start = facet.index.byteStart;
			const end = facet.index.byteEnd;
			if (!feature || start < offset || end <= start || end > bytes.length) continue;
			if (start > offset) result.push({ text: decoder.decode(bytes.slice(offset, start)) });
			result.push({ text: decoder.decode(bytes.slice(start, end)), uri: feature.uri });
			offset = end;
		}
		if (offset < bytes.length) result.push({ text: decoder.decode(bytes.slice(offset)) });
		return result;
	});
</script>

{#each segments as segment}
	{#if segment.uri}<a class="rich-link" href={segment.uri} target="_blank" rel="noopener noreferrer"
			>{segment.text}</a
		>{:else}{segment.text}{/if}
{/each}
