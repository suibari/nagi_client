<script lang="ts">
	let { select }: { select: (emoji: string) => void } = $props();
	const emojis = ['🌿', '🫶', '✨', '☺️', '🌊', '💐', '👏', '💫'];
</script>

<div class="reactions" aria-label="リアクションを選択">
	{#each emojis as emoji}<button onclick={() => select(emoji)}>{emoji}</button>{/each}
</div>
