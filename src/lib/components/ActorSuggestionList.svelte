<script lang="ts">
	import type { ActorView } from '$lib/api/types';
	import Avatar from './Avatar.svelte';
	import SuggestionList from './SuggestionList.svelte';

	// アクター候補ドロップダウンの見た目だけを担う純粋な提示コンポーネント。
	// listbox の骨組みは SuggestionList、検索・キーボード操作はホスト側
	// （MentionTextarea / HandleInput）が持つ。
	let {
		actors,
		activeIndex,
		onchoose,
		pending = false,
	}: {
		actors: ActorView[];
		activeIndex: number;
		onchoose: (actor: ActorView) => void;
		pending?: boolean;
	} = $props();
</script>

<SuggestionList items={actors} {activeIndex} {onchoose} {pending} keyOf={(actor) => actor.did}>
	{#snippet row(actor)}
		<Avatar {actor} size="small" />
		<span><strong>{actor.displayName ?? actor.handle}</strong><small>@{actor.handle}</small></span>
	{/snippet}
</SuggestionList>
