<script lang="ts">
	import type { CardView, DrawCardResult } from '$lib/api/types';
	import { anniversaryCardReward } from '$lib/cards/anniversary-reward.svelte';
	import { cardCollections } from '$lib/cards/collection.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import CardDetailDialog from './CardDetailDialog.svelte';

	let myDid = $derived($session?.did);
	const pending = $derived(cardCollections.pendingAnniversary);
	/*
	 * 「どの記念日か」で受け取り済みを覚える。ブール1個で覚えると、アプリを開いたまま
	 * JST 4:00 をまたいで別の記念日が現れたときに二度と受け取れなくなる。
	 */
	const pendingKey = $derived(
		pending
			.map((a) => a.slot)
			.sort((a, b) => a - b)
			.join(','),
	);

	// コレクションを持っていないと pendingAnniversary が分からないので、まずそれを取る。
	// CardDrawEntry と同じ共有ストアなので、両方あっても取得は1回で済む。
	$effect(() => {
		if ($oauthReady && myDid) void cardCollections.ensure(myDid);
	});

	/*
	 * 受け取りは pending を見て自動で走らせる。DID を覚えて1回だけ、という形にしないのは、
	 * CardDrawEntry の5分ポーリング（refreshSelfIfStale）が日付境界をまたいで取り直したとき、
	 * その結果をそのまま拾いたいから。
	 */
	$effect(() => {
		const did = myDid;
		if (!did || !pendingKey) return;
		for (const a of pending) anniversaryCardReward.preload(a.art);
		void anniversaryCardReward.claim(did, pendingKey);
	});

	/*
	 * 記念日カードは抽選ではないので DrawCardResult を持っていないが、CardDetailDialog の
	 * 演出（裏→表のフリップ、NEW CARD、コンフェッティ）はこの型で駆動している。
	 * 受け取り＝常に新規なので、その形に組み直して渡す。
	 */
	const draw = $derived<DrawCardResult | undefined>(
		anniversaryCardReward.current
			? {
					card: anniversaryCardReward.current,
					source: 'anniversary',
					alreadyDrawn: false,
					isNew: true,
					commentPending: !anniversaryCardReward.current.commentJa,
					drawStatus: cardCollections.selfDrawStatus ?? {
						canDraw: false,
						nextDrawAt: new Date().toISOString(),
					},
				}
			: undefined,
	);

	function close(final: CardView) {
		anniversaryCardReward.close(final);
	}
</script>

{#if anniversaryCardReward.current && myDid && draw}
	<CardDetailDialog
		initial={anniversaryCardReward.current}
		actor={myDid}
		{draw}
		collectionHref={`/profile/${myDid}?tab=cards`}
		onclose={close}
	/>
{/if}

{#if anniversaryCardReward.error}
	<div class="anniversary-card-error" role="alert">
		<span>{m.cardAnniversaryClaimFailed()}</span>
		<button
			type="button"
			class="ghost"
			aria-label={m.close()}
			onclick={() => anniversaryCardReward.clearError()}>×</button
		>
	</div>
{/if}

<style>
	.anniversary-card-error {
		position: fixed;
		z-index: 119;
		inset-inline: 50% auto;
		inset-block-end: calc(84px + env(safe-area-inset-bottom));
		display: flex;
		align-items: center;
		gap: 0.55rem;
		inline-size: min(calc(100vw - 32px), 460px);
		padding: 0.7rem 0.8rem;
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
		background: var(--bg-raised);
		box-shadow: var(--shadow-pop);
		transform: translateX(-50%);
	}
	.anniversary-card-error span {
		flex: 1;
		font-size: 0.88rem;
	}
	.anniversary-card-error button {
		min-block-size: 36px;
	}
</style>
