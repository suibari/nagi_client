<script lang="ts">
	import { drawCard } from '$lib/api/appview';
	import type { CardView, DrawCardResult } from '$lib/api/types';
	import { cardCollections } from '$lib/cards/collection.svelte';
	import { dateLocale, m } from '$lib/i18n/i18n.svelte';
	import AffirmationCard from './AffirmationCard.svelte';
	import CardDetailDialog from './CardDetailDialog.svelte';

	let {
		did,
		isSelf = false,
	}: {
		did: string;
		/** 自分のプロフィールか。ドローボタンは自分のときだけ出す。 */
		isSelf?: boolean;
	} = $props();

	let drawing = $state(false);
	let drawError = $state('');
	// 引いた直後の演出。開いているカードは opened で持つ。
	let drawResult = $state<DrawCardResult | undefined>();
	// モーダルで開いているカード（引いた直後 / 一覧からタップ の両方）。
	let opened = $state<CardView | undefined>();

	// コレクションは cardCollections が DID ごとに 1 度だけ取る。フィードの FAB と同じ
	// 実体を見ているので、TOP で引いた直後にここへ来ても drawStatus がズレない。
	$effect(() => {
		void cardCollections.ensure(did);
	});
	const entry = $derived(cardCollections.entry(did));
	const collection = $derived(entry?.view);
	const loading = $derived(!entry?.view && !entry?.failed);
	const error = $derived(entry?.failed ? entry.error || m.cardFetchFailed() : '');

	const status = $derived(collection?.drawStatus);
	/*
	 * 並びは AppView が返した順（= カード定義 JSON の順）をそのまま使い、**絶対に並べ替えない**。
	 * 各カードが図鑑の決まった枠に収まることで、「どこが空いているか」が毎回同じ位置で分かる。
	 * 所持順やレアリティ順に寄せると、1枚引くたびに全部の位置がずれて図鑑にならない。
	 */
	const cards = $derived(collection?.cards ?? []);

	function formatTime(iso: string): string {
		const date = new Date(iso);
		if (Number.isNaN(date.getTime())) return '';
		return date.toLocaleString(dateLocale(), {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	async function draw() {
		if (drawing) return;
		drawing = true;
		drawError = '';
		try {
			const result = await drawCard();
			cardCollections.applyDraw(did, result);
			drawResult = result;
			opened = result.card;
		} catch (e) {
			drawError = e instanceof Error ? e.message : m.cardDrawFailed();
		} finally {
			drawing = false;
		}
	}

	/**
	 * モーダルを閉じたら、開いていたカード（コメント込み）をコレクションへ反映する。
	 * 見返しで開いたときも、待っている間にコメントが届いていれば一覧へ書き戻る。
	 */
	function closeDialog(final: CardView) {
		opened = undefined;
		drawResult = undefined;
		cardCollections.applyCard(did, final);
	}
</script>

<section class="cards">
	{#if isSelf}
		<div class="cards-draw">
			{#if status?.canDraw}
				<button type="button" class="primary" disabled={drawing} onclick={draw}>
					{drawing ? m.cardDrawing() : m.cardDrawButton()}
				</button>
			{:else if status}
				<p class="cards-next">{m.cardNextDrawAt({ time: formatTime(status.nextDrawAt) })}</p>
			{/if}
			{#if drawError}<p class="cards-error" role="alert">{drawError}</p>{/if}
		</div>
	{/if}

	{#if loading}
		<p class="cards-note">{m.loading()}</p>
	{:else if error}
		<p class="cards-error" role="alert">{error}</p>
	{:else if collection}
		<p class="cards-progress">
			{m.cardCollectionProgress({
				owned: collection.ownedCount,
				total: collection.totalCount,
			})}
		</p>
		<ul class="cards-grid">
			{#each cards as card (`${card.volume}-${card.id}`)}
				<li>
					{#if card.owned}
						<!-- 所持カードはタップで詳細モーダル。botたんのコメントはそこでだけ読む
						     （一覧に出すと図鑑の升目が高さバラバラになり、配置が読めなくなる）。 -->
						<button type="button" class="cards-slot" onclick={() => (opened = card)}>
							<AffirmationCard {card} />
							<span class="visually-hidden">{m.cardOpenDetail()}</span>
						</button>
					{:else}
						<AffirmationCard {card} />
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>

{#if opened}
	<CardDetailDialog initial={opened} actor={did} draw={drawResult} onclose={closeDialog} />
{/if}

<style>
	.cards {
		display: grid;
		gap: 0.9rem;
		padding: 0.9rem 0;
	}
	.cards-draw {
		display: grid;
		justify-items: center;
		gap: 0.4rem;
	}
	.cards-progress {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.85rem;
	}
	.cards-note,
	.cards-next {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.85rem;
	}
	.cards-error {
		margin: 0;
		color: var(--danger);
		font-size: 0.85rem;
	}
	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.8rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.cards-grid li {
		display: grid;
		gap: 0.35rem;
		align-content: start;
	}
	/* カードそのものがボタン。ボタンの既定の見た目は全部落とす。 */
	.cards-slot {
		display: block;
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: start;
		cursor: pointer;
		border-radius: var(--radius-s);
		transition: transform 0.12s ease;
	}
	.cards-slot:hover {
		transform: translateY(-2px);
	}
	.cards-slot:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 3px;
	}
	.visually-hidden {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@media (prefers-reduced-motion: reduce) {
		.cards-slot {
			transition: none;
		}
		.cards-slot:hover {
			transform: none;
		}
	}
</style>
