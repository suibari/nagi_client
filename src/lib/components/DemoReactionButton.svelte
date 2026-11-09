<script lang="ts">
	/**
	 * 紹介用の見本に置く、押せる絵文字。押すと本物のリアクションと同じ演出
	 * （でか絵文字＋花火）だけを出す。記録はどこにも書かない（API も PDS も呼ばない）。
	 * 押した見た目は手元でだけ切り替わり、ページを離れれば消える。
	 */
	import type { EmojiView } from '$lib/api/types';
	import { displayEmojiName } from '$lib/atproto/bluemoji';
	import { m } from '$lib/i18n/i18n.svelte';
	import { onDestroy } from 'svelte';
	import BluemojiMedia from './BluemojiMedia.svelte';
	import ReactionStamp from './ReactionStamp.svelte';

	let {
		emoji,
		bluemoji,
		class: className = '',
	}: { emoji: string; bluemoji?: EmojiView; class?: string } = $props();

	let pressed = $state(false);
	let unavailable = $state(false);
	let stamp = $state<{ id: number; left: number; top: number }>();
	let stampId = 0;
	let timer: ReturnType<typeof setTimeout> | undefined;
	onDestroy(() => clearTimeout(timer));

	const label = $derived(bluemoji ? displayEmojiName(bluemoji.name) : emoji);

	function pop(event: MouseEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		pressed = !pressed;
		// 外すときは演出を出さない。本物の ReactionBar と同じふるまい。
		if (!pressed) return;
		stamp = { id: ++stampId, left: rect.left + rect.width / 2, top: rect.top + rect.height / 2 };
		clearTimeout(timer);
		timer = setTimeout(() => (stamp = undefined), 800);
	}
</script>

<button
	type="button"
	class={['demo-reaction', className]}
	class:active={pressed}
	aria-pressed={pressed}
	aria-label={m.reactWithAria({ emoji: label })}
	onclick={pop}
>
	{#if bluemoji && !unavailable}
		<BluemojiMedia
			class="reaction-image"
			emoji={bluemoji}
			onunavailable={() => (unavailable = true)}
		/>
	{:else}
		{label}
	{/if}
</button>

{#if stamp}
	{#key stamp.id}
		<ReactionStamp {emoji} {bluemoji} left={stamp.left} top={stamp.top} />
	{/key}
{/if}
