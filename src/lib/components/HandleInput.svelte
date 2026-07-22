<script lang="ts">
	import { searchActorsTypeahead } from '$lib/api/appview';
	import { createActorSearch } from '$lib/api/useActorSearch.svelte';
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
		onselect,
		onsubmit,
	}: {
		value?: string;
		id?: string;
		placeholder?: string;
		ariaLabel?: string;
		disabled?: boolean;
		/** 候補を選択したとき。ログインでは即サインインに使う。 */
		onselect?: (handle: string) => void;
		/** 候補非表示中に Enter を押したとき（フォーム送信）。 */
		onsubmit?: () => void;
	} = $props();

	const suggest = createActorSearch(searchActorsTypeahead);
	let activeIndex = $state(0);

	function handleInput(event: Event) {
		value = (event.currentTarget as HTMLInputElement).value;
		const query = normalizeHandle(value);
		if (query) suggest.search(query, () => (activeIndex = 0));
		else suggest.reset();
	}

	function choose(actor: ActorView) {
		value = actor.handle;
		suggest.reset();
		onselect?.(actor.handle);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!suggest.actors.length) {
			// 候補が出ていない状態の Enter は素直にフォーム送信。
			// IME 変換確定中（isComposing）は誤爆させない。
			if (event.key === 'Enter' && !event.isComposing) {
				event.preventDefault();
				onsubmit?.();
			}
			return;
		}
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const direction = event.key === 'ArrowDown' ? 1 : -1;
			activeIndex = (activeIndex + direction + suggest.actors.length) % suggest.actors.length;
		} else if ((event.key === 'Enter' || event.key === 'Tab') && !event.isComposing) {
			event.preventDefault();
			choose(suggest.actors[activeIndex]);
		} else if (event.key === 'Escape') {
			event.preventDefault();
			suggest.reset();
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
		onblur={() => setTimeout(() => suggest.reset(), 150)}
	/>
	<ActorSuggestionList actors={suggest.actors} {activeIndex} onchoose={choose} />
</div>

<style>
	/* 親のフォームレイアウト（例: .auth-card label のグリッド）で幅いっぱいに広げる。 */
	input {
		width: 100%;
		box-sizing: border-box;
	}
</style>
