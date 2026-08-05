<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './Icon.svelte';

	// 右サイドバー上端の検索ボックス。結果は全部 /search に見せるので、ここは入口だけ持つ
	// （サジェストは出さない）。右サイドバーは shell.css の 1179px 以下で display:none に
	// なるため、PC 幅でのみ現れる。

	// /search に居るときは検索した言葉を残す。別ページへ移ったら消える。
	// prerender 中は url.searchParams を読めない（このコンポーネントはレイアウト＝全ページに乗る）
	// ので、参照は $effect の中だけに置く。エフェクトはブラウザでしか走らない。
	let value = $state('');
	$effect(() => {
		value = page.url.pathname === '/search' ? (page.url.searchParams.get('q') ?? '') : '';
	});

	function submit(event: SubmitEvent) {
		event.preventDefault();
		const q = value.trim();
		if (!q) return;
		void goto(`/search?q=${encodeURIComponent(q)}`);
	}

	function handleKeydown(event: KeyboardEvent) {
		// IME 変換確定の Enter で送信しない。確定後の Enter は form の submit に任せる。
		if (event.key === 'Enter' && event.isComposing) event.preventDefault();
	}
</script>

<form class="sidebar-search" role="search" onsubmit={submit}>
	<span class="sidebar-search-icon" aria-hidden="true"><Icon name="search" size={16} /></span>
	<input
		type="search"
		bind:value
		placeholder={m.searchPlaceholder()}
		aria-label={m.searchSubmitAria()}
		onkeydown={handleKeydown}
	/>
</form>
