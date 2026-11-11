<script lang="ts">
	/**
	 * 設定ページの中の1まとまり。見出しの下に1枚の面を置き、行（SettingRow）を細い線で区切って並べる。
	 * plain を付けると面を持たない（一覧や見本など、自前の見た目を持つ中身のため）。
	 * level={3} は plain なセクションの中に置く小分け。見出しが h3 になり、控えめな見た目になる。
	 */
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		plain = false,
		level = 2,
		children,
	}: {
		title?: string;
		description?: string;
		plain?: boolean;
		level?: 2 | 3;
		children: Snippet;
	} = $props();
</script>

<section class="settings-section">
	{#if title}<svelte:element this={`h${level}`}>{title}</svelte:element>{/if}
	{#if description}<p class="settings-section-description">{description}</p>{/if}
	<div class={plain ? 'settings-section-body' : 'settings-panel'}>{@render children()}</div>
</section>
