<script lang="ts">
	import { reactionCardReward } from '$lib/cards/reaction-reward.svelte';
	import { cardCollections } from '$lib/cards/collection.svelte';
	import type { CardView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import CardDetailDialog from './CardDetailDialog.svelte';
	import CardMilestoneDialog from './CardMilestoneDialog.svelte';

	let pendingMilestone = $state<number>();
	let pendingDid = $state('');

	function closeCard(final: CardView) {
		const reward = reactionCardReward.current;
		if (!reward) return;
		cardCollections.applyCard(reward.did, final);
		pendingMilestone = reward.milestone;
		pendingDid = reward.did;
		reactionCardReward.closeCard();
	}
</script>

{#if reactionCardReward.current}
	<CardDetailDialog
		initial={reactionCardReward.current.draw.card}
		actor={reactionCardReward.current.did}
		draw={reactionCardReward.current.draw}
		collectionHref={reactionCardReward.current.milestone
			? undefined
			: `/profile/${reactionCardReward.current.did}?tab=cards`}
		onclose={closeCard}
	/>
{:else if pendingMilestone}
	<CardMilestoneDialog
		percent={pendingMilestone}
		collectionHref={pendingDid ? `/profile/${pendingDid}?tab=cards` : undefined}
		onclose={() => (pendingMilestone = undefined)}
	/>
{/if}

{#if reactionCardReward.error}
	<div class="reaction-card-error" role="alert">
		<span>{m.cardReactionRewardFailed()}</span>
		<button
			type="button"
			onclick={() => reactionCardReward.retry()}
			disabled={reactionCardReward.busy}
		>
			{m.retry()}
		</button>
		<button
			type="button"
			class="ghost"
			aria-label={m.close()}
			onclick={() => reactionCardReward.clearError()}>×</button
		>
	</div>
{/if}

<style>
	.reaction-card-error {
		position: fixed;
		z-index: 119;
		inset-inline-start: 50vw;
		inset-block-start: calc(100dvh - 84px - env(safe-area-inset-bottom));
		display: flex;
		align-items: center;
		gap: 0.55rem;
		inline-size: min(calc(100vw - 32px), 460px);
		padding: 0.7rem 0.8rem;
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
		background: var(--bg-raised);
		box-shadow: var(--shadow-pop);
		translate: -50% -100%;
	}
	.reaction-card-error span {
		flex: 1;
		font-size: 0.88rem;
	}
	.reaction-card-error button {
		min-block-size: 36px;
	}
</style>
