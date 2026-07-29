<script lang="ts">
	import type { Facet } from '$lib/api/types';
	import { parseRichText } from '$lib/atproto/markdown';
	import { contentWarningDisplay } from '$lib/atproto/contentWarning';
	import InlineRuns from './InlineRuns.svelte';
	let { text, facets = [] }: { text: string; facets?: Facet[] } = $props();
	let display = $derived(contentWarningDisplay(text, facets as Facet[]));
	let blocks = $derived(parseRichText(display.text, display.facets, display.range));
	let warningState = $state({ revealed: false });
	let warningText: string | undefined;
	$effect(() => {
		if (text === warningText) return;
		warningText = text;
		warningState.revealed = false;
	});
</script>

{#each blocks as block}
	{#if block.type === 'h1'}
		<h3><InlineRuns runs={block.runs} {warningState} /></h3>
	{:else if block.type === 'h2'}
		<h4><InlineRuns runs={block.runs} {warningState} /></h4>
	{:else if block.type === 'h3'}
		<h5><InlineRuns runs={block.runs} {warningState} /></h5>
	{:else if block.type === 'quote'}
		<blockquote><InlineRuns runs={block.runs} {warningState} /></blockquote>
	{:else if block.type === 'ul'}
		<ul>
			{#each block.items as item}<li><InlineRuns runs={item} {warningState} /></li>{/each}
		</ul>
	{:else if block.type === 'ol'}
		<ol start={block.start}>
			{#each block.items as item}<li><InlineRuns runs={item} {warningState} /></li>{/each}
		</ol>
	{:else}
		<p><InlineRuns runs={block.runs} {warningState} /></p>
	{/if}
{/each}
