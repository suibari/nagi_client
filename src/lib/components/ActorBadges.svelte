<script lang="ts">
	import type { ActorView } from '$lib/api/types';
	import { actorBadges } from '$lib/badges/badges';

	let { actor }: { actor?: ActorView } = $props();
	let badges = $derived(actorBadges(actor));
</script>

{#each badges as badge (badge.id)}<span class="badge badge--{badge.tone}" title={badge.title}
		>{badge.label}</span
	>{/each}
