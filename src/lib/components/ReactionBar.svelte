<script lang="ts">
	import type { ReactionView } from '$lib/api/types';
	import { session } from '$lib/oauth/session.svelte';
	let { reactions = [] }: { reactions?: ReactionView[] } = $props();
	const palette = ['🌿', '🫶', '✨', '☺️'];
	function react() {
		if (!$session) location.href = '/login';
	}
</script>

<div class="reactions">
	{#each reactions as reaction}<button class:active={reaction.reactedByMe} onclick={react}
			>{reaction.emoji} {reaction.count}</button
		>{/each}{#each palette
		.filter((e) => !reactions.some((r) => r.emoji === e))
		.slice(0, 1) as emoji}<button class="add" onclick={react}>{emoji} ＋</button>{/each}
</div>
