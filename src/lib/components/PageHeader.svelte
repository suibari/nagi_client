<script lang="ts">
	/**
	 * ページの見出し。どのページも「タイトル（h1）→ 説明 → 本文」の同じ形で始める。
	 * 右に置く操作（「ニュースを追加」「今日の一枚」など）は actions に渡す。
	 * 見た目は base.css の .page-header にだけ持つ。
	 */
	import type { Snippet } from 'svelte';

	let {
		title,
		titleLabel,
		description,
		eyebrow,
		back,
		actions,
	}: {
		title: string;
		/** 見出しの読み上げを、表示と変えたいときだけ渡す。 */
		titleLabel?: string;
		description?: string;
		/** 見出しの上に添える小さな文脈（例: 「スレッド」）。 */
		eyebrow?: string;
		back?: { href: string; label: string };
		actions?: Snippet;
	} = $props();
</script>

<header class="page-header">
	{#if back}<a class="page-header-back" href={back.href}>← {back.label}</a>{/if}
	{#if eyebrow}<p class="page-header-eyebrow">{eyebrow}</p>{/if}
	<div class="page-header-row">
		<h1 aria-label={titleLabel}>{title}</h1>
		{#if actions}<div class="page-header-actions">{@render actions()}</div>{/if}
	</div>
	{#if description}<p class="page-header-description">{description}</p>{/if}
</header>
