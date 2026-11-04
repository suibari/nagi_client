<script lang="ts">
	import type { Facet, LinkCardView, PostImage } from '$lib/api/types';
	import { parseRichText } from '$lib/atproto/markdown';
	import { contentWarningDisplay } from '$lib/atproto/contentWarning';
	import { APPVIEW_URL } from '$lib/api/appview';
	import { blobKey } from '$lib/blog/inlineImages';
	import { httpUrl } from '$lib/atproto/facets';
	import InlineRuns from './InlineRuns.svelte';
	import ImageGallery from './ImageGallery.svelte';
	import LinkCard from './LinkCard.svelte';
	/**
	 * images は本文の `![alt](url)` を差し込むための添付画像。本文に書かれた URL が
	 * この投稿の添付と同じ blob を指すときだけ表示する（任意の外部画像は読み込まない）。
	 * 渡されなければ画像行は何も出さない（タイムラインでは添付はギャラリー側に出る）。
	 *
	 * linkCards は記事本文用。渡したときだけ URL だけの行をその位置のリンクカードにする
	 * （画像と同じく、カードの中身は投稿の linkCards から URL で引く）。カードの無い URL 行は
	 * 普通の段落として出す。渡さなければ段落の区切り方も含めて従来どおり。
	 */
	let {
		text,
		facets = [],
		images = [],
		linkCards,
	}: {
		text: string;
		facets?: Facet[];
		images?: PostImage[];
		linkCards?: LinkCardView[];
	} = $props();
	let display = $derived(contentWarningDisplay(text, facets as Facet[]));
	let blocks = $derived(
		parseRichText(display.text, display.facets, display.range, { cardLines: Boolean(linkCards) }),
	);
	// 行の URL は httpUrl で正規化済みなので、カード側も同じ形にそろえて引く。
	let cardsByUrl = $derived(
		new Map((linkCards ?? []).map((card) => [httpUrl(card.uri) ?? card.uri, card])),
	);
	let imagesByKey = $derived.by(() => {
		const origins = [new URL(APPVIEW_URL, 'http://localhost').origin];
		const map = new Map<string, PostImage>();
		for (const image of images) {
			const key = blobKey(image.url, origins);
			if (key && !map.has(key)) map.set(key, image);
		}
		return map;
	});
	const inlineImage = (url: string, alt: string): PostImage | undefined => {
		const key = blobKey(url);
		const image = key ? imagesByKey.get(key) : undefined;
		return image && { ...image, alt: alt || image.alt };
	};
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
	.post-gap は入力にあったブロック間の空行ぶんの余白（.post-text がその行数だけ空ける）。
-->
{#each blocks as block}
	{#if block.gap}<div class="post-gap" style:--gap={block.gap} aria-hidden="true"></div>{/if}
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
	{:else if block.type === 'code'}
		<pre data-block="code"><code>{block.text}</code></pre>
	{:else if block.type === 'rule'}
		<hr data-block="rule" />
	{:else if block.type === 'image'}
		{@const image = inlineImage(block.url, block.alt)}
		{#if image}<div class="post-inline-image" data-block="image">
				<ImageGallery images={[image]} />
			</div>{/if}
	{:else if block.type === 'card'}
		{@const card = cardsByUrl.get(block.url)}
		{#if card}<div class="post-inline-card" data-block="card"><LinkCard {card} /></div>
		{:else}<p data-block="p"><InlineRuns runs={block.runs} {warningState} /></p>{/if}
	{:else}
		<p data-block="p"><InlineRuns runs={block.runs} {warningState} /></p>
	{/if}
{/each}
