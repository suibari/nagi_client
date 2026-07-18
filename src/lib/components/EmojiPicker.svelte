<script lang="ts">
	let { select }: { select: (emoji: string) => void } = $props();
	const emojis = ['🌿', '🫶', '✨', '☺️', '🌊', '💐', '👏', '💫'];
</script>

<div class="emoji-picker" role="menu" aria-label="リアクションを選択">
	{#each emojis as emoji}<button role="menuitem" onclick={() => select(emoji)}>{emoji}</button
		>{/each}
</div>
