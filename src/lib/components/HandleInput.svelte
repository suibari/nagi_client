<script lang="ts">
	import { searchActorsTypeahead } from '$lib/api/appview';
	import { createTypeaheadSearch } from '$lib/api/useTypeaheadSearch.svelte';
	import type { ActorView } from '$lib/api/types';
	import { normalizeHandle } from '$lib/atproto/handle';
	import ActorSuggestionList from './ActorSuggestionList.svelte';

	// サジェスト付きの単一行 handle 入力。ログイン画面用。候補はメンション入力と
	// 同じ ActorSuggestionList で描画するので見た目・a11y が揃う。検索元は Nagi
	// 非依存の公開 Bsky AppView（searchActorsTypeahead）。
	let {
		value = $bindable(''),
		id,
		placeholder,
		ariaLabel,
		disabled = false,
		onsubmit,
	}: {
		value?: string;
		id?: string;
		placeholder?: string;
		ariaLabel?: string;
		disabled?: boolean;
		/** 候補非表示中に Enter を押したとき（フォーム送信）。 */
		onsubmit?: () => void;
	} = $props();

	const suggest = createTypeaheadSearch<ActorView>(
		(query, signal) => searchActorsTypeahead(query, 8, signal).then((result) => result.actors),
		{
			matches: (actor, query) =>
				actor.handle.toLowerCase().includes(query) ||
				(actor.displayName?.toLowerCase().includes(query) ?? false),
		},
	);
	let activeIndex = $state(0);
	// 入力前・確定後にドロップダウン（スケルトンや「候補なし」を含む）を出さないための開閉。
	let suggesting = $state(false);

	function reset() {
		suggesting = false;
		suggest.reset();
	}

	function handleInput(event: Event) {
		value = (event.currentTarget as HTMLInputElement).value;
		const query = normalizeHandle(value);
		if (!query) {
			reset();
			return;
		}
		suggesting = true;
		suggest.search(query, () => (activeIndex = 0));
	}

	function choose(actor: ActorView) {
		value = actor.handle;
		reset();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!suggest.items.length) {
			// 候補が出ていない状態の Enter は素直にフォーム送信。
			// IME 変換確定中（isComposing）は誤爆させない。
			if (event.key === 'Enter' && !event.isComposing) {
				event.preventDefault();
				onsubmit?.();
			}
			return;
		}
		// 応答待ちの絞り込みで候補が減ると activeIndex が末尾を追い越すことがある。
		activeIndex = Math.min(activeIndex, suggest.items.length - 1);
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const direction = event.key === 'ArrowDown' ? 1 : -1;
			activeIndex = (activeIndex + direction + suggest.items.length) % suggest.items.length;
		} else if ((event.key === 'Enter' || event.key === 'Tab') && !event.isComposing) {
			event.preventDefault();
			choose(suggest.items[activeIndex]);
		} else if (event.key === 'Escape') {
			event.preventDefault();
			reset();
		}
	}
</script>

<div class="mention-textarea">
	<input
		{id}
		{placeholder}
		{disabled}
		aria-label={ariaLabel}
		{value}
		oninput={handleInput}
		onkeydown={handleKeydown}
		onblur={() => setTimeout(reset, 150)}
	/>
	{#if suggesting}
		<ActorSuggestionList
			actors={suggest.items}
			pending={suggest.pending}
			{activeIndex}
			onchoose={choose}
		/>
	{/if}
</div>

<style>
	/* 親のフォームレイアウト（例: .auth-card label のグリッド）で幅いっぱいに広げる。 */
	input {
		width: 100%;
		box-sizing: border-box;
	}
</style>
