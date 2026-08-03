<script lang="ts">
	import type { LinkCardView } from '$lib/api/types';
	import { getProfileWebsite } from '$lib/api/appview';
	import LinkCard from './LinkCard.svelte';

	let { did }: { did?: string } = $props();
	let card = $state<LinkCardView>();
	let loadedDid = '';

	$effect(() => {
		const target = did;
		if (!target || target === loadedDid) return;
		loadedDid = target;
		card = undefined;
		getProfileWebsite(target)
			.then((result) => {
				if (loadedDid === target) card = result.card;
			})
			.catch(() => {
				// website は補助情報なので、取得失敗でプロフィール本体をエラーにしない。
				if (loadedDid === target) card = undefined;
			});
	});
</script>

{#if card}
	<div class="profile-website"><LinkCard {card} /></div>
{/if}

<style>
	.profile-website {
		margin-block-start: 0.75rem;
		min-inline-size: 0;
		max-inline-size: 100%;
	}
</style>
