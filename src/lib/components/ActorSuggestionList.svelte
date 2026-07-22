<script lang="ts">
	import type { ActorView } from '$lib/api/types';
	import Avatar from './Avatar.svelte';

	// アクター候補ドロップダウンの見た目だけを担う純粋な提示コンポーネント。
	// 検索・キーボード操作はホスト側（MentionTextarea / HandleInput）が持つ。
	let {
		actors,
		activeIndex,
		onchoose,
	}: {
		actors: ActorView[];
		activeIndex: number;
		onchoose: (actor: ActorView) => void;
	} = $props();
</script>

{#if actors.length}
	<div class="mention-suggestions" role="listbox">
		{#each actors as actor, index (actor.did)}
			<button
				type="button"
				class:active={index === activeIndex}
				role="option"
				aria-selected={index === activeIndex}
				onmousedown={(event) => event.preventDefault()}
				onclick={() => onchoose(actor)}
			>
				<Avatar {actor} size="small" />
				<span
					><strong>{actor.displayName ?? actor.handle}</strong><small>@{actor.handle}</small></span
				>
			</button>
		{/each}
	</div>
{/if}
