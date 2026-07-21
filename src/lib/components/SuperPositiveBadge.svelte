<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import type { ActorView } from '$lib/api/types';

	let { actor }: { actor?: ActorView } = $props();
	// Bluesky 側のラベルは100で頭打ちだが、Nagi は実値をそのまま出す。
	let level = $derived(actor?.superPositiveLevel ?? 0);
</script>

{#if level > 0}
	<span class="badge" title={m.superPositiveBadgeAria({ level })}
		>{m.superPositiveBadge({ level })}</span
	>
{/if}
