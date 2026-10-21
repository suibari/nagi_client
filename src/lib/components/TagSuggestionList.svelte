<script lang="ts">
	import type { TagSuggestionView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';
	import SuggestionList from './SuggestionList.svelte';

	let {
		tags,
		marker,
		activeIndex,
		onchoose,
	}: {
		tags: TagSuggestionView[];
		marker: string;
		activeIndex: number;
		onchoose: (tag: TagSuggestionView) => void;
	} = $props();
</script>

<SuggestionList
	items={tags}
	{activeIndex}
	{onchoose}
	keyOf={(tag) => tag.tag}
	listClass="tag-suggestions"
	ariaLabel={m.tagSuggestions()}
>
	{#snippet row(tag)}
		<span class="tag-suggestion-icon"><Icon name="hash" size={16} /></span>
		<span class="tag-suggestion-copy">
			<strong>{marker}{tag.tag}</strong>
			{#if tag.count}<small>{m.tagSuggestionCount({ count: tag.count })}</small>{/if}
		</span>
	{/snippet}
</SuggestionList>
