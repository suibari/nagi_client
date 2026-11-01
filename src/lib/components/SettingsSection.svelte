<script lang="ts">
	/**
	 * 設定ページの中の1まとまり。見出しの下に1枚の面を置き、行（SettingRow）を細い線で区切って並べる。
	 * plain を付けると面を持たない（一覧や見本など、自前の見た目を持つ中身のため）。
	 */
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		plain = false,
		children,
	}: { title?: string; description?: string; plain?: boolean; children: Snippet } = $props();
</script>

<section class="settings-section">
	{#if title}<h2>{title}</h2>{/if}
	{#if description}<p class="settings-section-description">{description}</p>{/if}
	<div class={plain ? 'settings-section-body' : 'settings-panel'}>{@render children()}</div>
</section>
