<script lang="ts">
	import type { ReactionView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import Icon from './shell/Icon.svelte';
	import ReactionBar from './ReactionBar.svelte';

	/**
	 * ゼンカツの記録とカードニュースに付けるリアクション行。
	 *
	 * subject は本人の repo にある `com.suibari.nagi.zenkatsu` / `com.suibari.nagi.cardGet`
	 * そのもの。投稿・ニュースとまったく同じ経路なので、通知も従来どおり飛ぶ。
	 *
	 * **送信者は出さない。** 誰が誰に反応したかを第三者が追えないよう、AppView は
	 * リアクター一覧を subject の持ち主にしか返さない。ここは持ち主判定を持たないので
	 * 匿名側に倒す（`NewsCard` と同じ扱い）。
	 */
	let {
		uri,
		cid,
		reactions = [],
	}: { uri: string; cid: string; reactions?: ReactionView[] } = $props();

	let pickerOpen = $state(false);
	let pickerButton = $state<HTMLButtonElement>();

	function togglePicker() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		pickerOpen = !pickerOpen;
	}
</script>

<div class="card-reactions">
	<ReactionBar
		{uri}
		{cid}
		{reactions}
		showReactors={false}
		bind:pickerOpen
		pickerAnchor={pickerButton}
	/>
	<button
		bind:this={pickerButton}
		class="ghost icon-action timeline-action"
		class:active={pickerOpen}
		type="button"
		aria-label={m.addReactionAria()}
		title={m.addReactionAria()}
		aria-expanded={pickerOpen}
		onclick={togglePicker}
	>
		<Icon name="emojiPlus" size={18} />
	</button>
</div>

<style>
	.card-reactions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem;
		margin-block-start: 0.5rem;
	}
</style>
