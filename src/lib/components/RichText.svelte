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

<!--
	data-block は元の markdown のブロック種別。見出しは投稿内では h3〜h5 に落として
	いる（ページ見出しとの階層衝突を避けるため）ので、これが無いと「# 見出し」由来か
	「### 見出し」由来かを CSS から区別できない。記事タイトルの装飾で使う。
-->
{#each blocks as block}
	{#if block.type === 'h1'}
		<h3 data-block="h1"><InlineRuns runs={block.runs} {warningState} /></h3>
	{:else if block.type === 'h2'}
		<h4 data-block="h2"><InlineRuns runs={block.runs} {warningState} /></h4>
	{:else if block.type === 'h3'}
		<h5 data-block="h3"><InlineRuns runs={block.runs} {warningState} /></h5>
	{:else if block.type === 'quote'}
		<blockquote data-block="quote"><InlineRuns runs={block.runs} {warningState} /></blockquote>
	{:else if block.type === 'ul'}
		<ul data-block="ul">
			{#each block.items as item}<li><InlineRuns runs={item} {warningState} /></li>{/each}
		</ul>
	{:else if block.type === 'ol'}
		<ol data-block="ol" start={block.start}>
			{#each block.items as item}<li><InlineRuns runs={item} {warningState} /></li>{/each}
		</ol>
	{:else}
		<p data-block="p"><InlineRuns runs={block.runs} {warningState} /></p>
	{/if}
{/each}
