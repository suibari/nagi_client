<script lang="ts">
	import { displayEmojiName } from '$lib/atproto/bluemoji';
	import type { EmojiView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import BluemojiMedia from './BluemojiMedia.svelte';
	import SuggestionList from './SuggestionList.svelte';

	let {
		emojis,
		activeIndex,
		onchoose,
		pending = false,
	}: {
		emojis: EmojiView[];
		activeIndex: number;
		onchoose: (emoji: EmojiView) => void;
		pending?: boolean;
	} = $props();
</script>

<SuggestionList
	items={emojis}
	{activeIndex}
	{onchoose}
	{pending}
	keyOf={(emoji) => emoji.uri}
	listClass="emoji-suggestions"
	ariaLabel={m.emojiSuggestions()}
>
	{#snippet row(emoji)}
		<span class="emoji-suggestion-media"><BluemojiMedia {emoji} /></span>
		<span class="emoji-suggestion-copy"><strong>:{displayEmojiName(emoji.name)}:</strong></span>
	{/snippet}
</SuggestionList>
