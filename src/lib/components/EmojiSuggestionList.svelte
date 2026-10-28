<script lang="ts">
	import { displayEmojiName } from '$lib/atproto/bluemoji';
	import type { EmojiSuggestion } from '$lib/emoji/emojiSearch';
	import { m } from '$lib/i18n/i18n.svelte';
	import BluemojiMedia from './BluemojiMedia.svelte';
	import SuggestionList from './SuggestionList.svelte';

	let {
		emojis,
		activeIndex,
		onchoose,
		pending = false,
	}: {
		emojis: EmojiSuggestion[];
		activeIndex: number;
		onchoose: (emoji: EmojiSuggestion) => void;
		pending?: boolean;
	} = $props();
</script>

<SuggestionList
	items={emojis}
	{activeIndex}
	{onchoose}
	{pending}
	keyOf={(item) => (item.kind === 'custom' ? item.emoji.uri : item.emoji)}
	listClass="emoji-suggestions"
	ariaLabel={m.emojiSuggestions()}
>
	{#snippet row(item)}
		{#if item.kind === 'custom'}
			<span class="emoji-suggestion-media"><BluemojiMedia emoji={item.emoji} /></span>
			<span class="emoji-suggestion-copy"
				><strong>:{displayEmojiName(item.emoji.name)}:</strong></span
			>
		{:else}
			<span class="emoji-suggestion-media emoji-suggestion-unicode">{item.emoji}</span>
			<span class="emoji-suggestion-copy">{item.label}</span>
		{/if}
	{/snippet}
</SuggestionList>
