<script lang="ts">
	import type { Facet } from '$lib/api/types';
	import { parseRichText } from '$lib/atproto/markdown';
	import InlineRuns from './InlineRuns.svelte';
	let { text, facets = [] }: { text: string; facets?: Facet[] } = $props();
	let blocks = $derived(parseRichText(text, facets));
</script>

{#each blocks as block}
	{#if block.type === 'h1'}
		<h3><InlineRuns runs={block.runs} /></h3>
	{:else if block.type === 'h2'}
		<h4><InlineRuns runs={block.runs} /></h4>
	{:else if block.type === 'h3'}
		<h5><InlineRuns runs={block.runs} /></h5>
	{:else if block.type === 'quote'}
		<blockquote><InlineRuns runs={block.runs} /></blockquote>
	{:else if block.type === 'ul'}
		<ul>
			{#each block.items as item}<li><InlineRuns runs={item} /></li>{/each}
		</ul>
	{:else if block.type === 'ol'}
		<ol start={block.start}>
			{#each block.items as item}<li><InlineRuns runs={item} /></li>{/each}
		</ol>
	{:else}
		<p><InlineRuns runs={block.runs} /></p>
	{/if}
{/each}
