<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	// 候補ドロップダウンの器。listbox の a11y・アクティブ行・確定操作をここに集約し、
	// 行の中身だけを呼び出し側の snippet に任せる（@メンションと #チャンネルで共通）。
	// 検索中はスケルトンを出す: 結果0件と「まだ探している」が同じ見た目だと、
	// 遅いのか該当が無いのか分からない。
	let {
		items,
		activeIndex,
		onchoose,
		keyOf,
		row,
		pending = false,
		listClass = '',
		ariaLabel,
		skeletonRows = 3,
	}: {
		items: T[];
		activeIndex: number;
		onchoose: (item: T) => void;
		keyOf: (item: T) => string;
		row: Snippet<[T]>;
		pending?: boolean;
		listClass?: string;
		ariaLabel?: string;
		skeletonRows?: number;
	} = $props();

	let containerEl = $state<HTMLDivElement>();

	$effect(() => {
		if (containerEl && activeIndex >= 0) {
			const activeBtn = containerEl.children[activeIndex] as HTMLElement | undefined;
			activeBtn?.scrollIntoView({ block: 'nearest' });
		}
	});
</script>

{#if items.length}
	<div bind:this={containerEl} class="mention-suggestions {listClass}" role="listbox" aria-label={ariaLabel}>
		{#each items as item, index (keyOf(item))}
			<button
				type="button"
				class:active={index === activeIndex}
				role="option"
				aria-selected={index === activeIndex}
				onmousedown={(event) => event.preventDefault()}
				onclick={() => onchoose(item)}
			>
				{@render row(item)}
			</button>
		{/each}
	</div>
{:else if pending}
	<div class="mention-suggestions {listClass}" aria-label={ariaLabel} aria-busy="true">
		<p class="suggestion-status">{m.suggestionsLoading()}</p>
		{#each { length: skeletonRows } as _, index (index)}
			<div class="suggestion-skeleton" aria-hidden="true">
				<span class="suggestion-skeleton-figure"></span>
				<span class="suggestion-skeleton-copy">
					<span class="suggestion-skeleton-bar"></span>
					<span class="suggestion-skeleton-bar short"></span>
				</span>
			</div>
		{/each}
	</div>
{:else}
	<div class="mention-suggestions {listClass}" aria-label={ariaLabel}>
		<p class="suggestion-status">{m.suggestionsEmpty()}</p>
	</div>
{/if}
