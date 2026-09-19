<script lang="ts">
	import { onMount } from 'svelte';
	import type { ActorView } from '$lib/api/types';
	import { loadCardBotActor } from '$lib/cards/bot-actor';
	import Avatar from './Avatar.svelte';
	import AvatarLink from './AvatarLink.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	let { comment, pending = false }: { comment: string; pending?: boolean } = $props();
	let botActor = $state<ActorView>();
	onMount(() => {
		let cancelled = false;
		void loadCardBotActor().then((actor) => {
			if (!cancelled) botActor = actor;
		});
		return () => {
			cancelled = true;
		};
	});
</script>

<div class="card-bot-review" aria-label={m.zenkatsuBotReview()}>
	<div class="review-avatar">
		{#if botActor}
			<AvatarLink actor={botActor} size="small" />
		{:else}
			<Avatar size="small" />
		{/if}
	</div>
	<p class:pending>{comment}</p>
</div>

<style>
	.card-bot-review {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		margin-block-start: 0.6rem;
	}
	.review-avatar {
		flex-shrink: 0;
	}
	p {
		min-width: 0;
		margin: 0;
		padding: 0.8rem 1rem;
		border: 1px solid var(--line);
		border-radius: 2px 16px 16px 16px;
		background: var(--bubble-bot-bg);
		font-size: 0.9rem;
		line-height: 1.7;
		white-space: pre-line;
		overflow-wrap: anywhere;
	}
	.pending {
		color: var(--text-faint);
	}
</style>
