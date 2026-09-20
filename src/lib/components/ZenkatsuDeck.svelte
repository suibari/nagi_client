<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import CardCollection from './CardCollection.svelte';

	let { did }: { did: string } = $props();
</script>

<section class="block">
	<h2>{m.deckCardsTitle()}</h2>
	<CardCollection {did} isSelf />
</section>

<style>
	.block {
		padding-block-end: 1.5rem;
	}
	h2 {
		padding: 1rem 1rem 0.5rem;
		font-size: 0.95rem;
	}
</style>
