<script lang="ts">
	import { tick } from 'svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import {
		ApiRequestError,
		donateCards,
		getCardBoard,
		takeBoardCard,
	} from '$lib/api/appview';
	import type { CardBoardEntry, CardBoardView, CardView, DonatedCard } from '$lib/api/types';
	import { donateFlightPlan, donateVibration } from '$lib/cards/share-board';
	import { cardCollections } from '$lib/cards/collection.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import AffirmationCard from './AffirmationCard.svelte';
	import CardDetailDialog from './CardDetailDialog.svelte';
	import CardShareHelp from './CardShareHelp.svelte';

	/**
	 * おすそわけボード（bsky-affirmative-bot の docs/zenkatsu.md 13章）。
	 * だぶったカードを置いて Ƶ をもらい、まだ持っていないカードを Ƶ で受け取る。
	 *
	 * 置いたときの気持ちよさは「1枚ずつ数えられる」ことから来るので、まとめて置いても
	 * カードを1枚ずつ Ƶ 欄へ吸い込ませ、着いた瞬間に数字を上げる。
	 */
	let { did }: { did: string } = $props();

	let board = $state<CardBoardView | undefined>();
	let loadError = $state('');
	let actionError = $state('');
	let busy = $state(false);
	let showHelp = $state(false);
	let welcome = $state<number | undefined>();
	// 演出中は表示用の残高を実際の残高から遅らせて、着いたカードのぶんだけ足していく。
	let shownBalance = $state(0);
	let bump = $state(0);
	let flying = $state(false);
	let earnedTotal = $state<number | undefined>();
	// 受け取ったカードはカード詳細ダイアログで開く（botたんのコメントもそこで待つ）。
	let received = $state<CardView | undefined>();

	let balanceEl = $state<HTMLElement>();
	let layer = $state<HTMLElement>();
	let timers: ReturnType<typeof setTimeout>[] = [];
	let finishFlight: (() => void) | undefined;

	const donatableTotal = $derived(
		board?.cards.reduce((sum, e) => sum + e.donatable, 0) ?? 0,
	);
	const donatableZenny = $derived(
		board?.cards.reduce((sum, e) => sum + e.donatable * e.zenny, 0) ?? 0,
	);

	async function load() {
		loadError = '';
		try {
			const view = await getCardBoard();
			board = view;
			if (!flying) shownBalance = view.balance;
			if (view.welcomeGranted) welcome = view.welcomeGranted;
		} catch (e) {
			loadError = e instanceof Error && e.message ? e.message : m.boardLoadFailed();
		}
	}

	$effect(() => {
		void did;
		void load();
		return () => cancelFlight();
	});

	function errorText(e: unknown): string {
		if (e instanceof ApiRequestError) {
			if (e.code === 'out_of_stock') return m.boardErrorOutOfStock();
			if (e.code === 'insufficient_zenny') return m.boardErrorInsufficient();
			if (e.code === 'already_owned') return m.boardErrorAlreadyOwned();
			if (e.code === 'not_donatable') return m.boardErrorNotDonatable();
		}
		return m.boardActionFailed();
	}

	const reduceMotion = () =>
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const touchDevice = () =>
		navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

	function vibrate(pattern: number[]) {
		if (touchDevice() && typeof navigator.vibrate === 'function') navigator.vibrate(pattern);
	}

	function cancelFlight() {
		for (const t of timers) clearTimeout(t);
		timers = [];
		if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
			navigator.vibrate(0);
		}
		layer?.replaceChildren();
	}

	/** カードを1枚ずつ Ƶ 欄へ飛ばす。返り値の Promise は最後の1枚が着いたら解決する。 */
	function fly(donated: DonatedCard[], finalBalance: number): Promise<void> {
		const plan = donateFlightPlan(donated);
		const target = balanceEl?.getBoundingClientRect();
		if (!plan.length || !target || !layer || reduceMotion()) {
			shownBalance = finalBalance;
			return Promise.resolve();
		}
		flying = true;
		return new Promise((resolve) => {
			finishFlight = () => {
				cancelFlight();
				shownBalance = finalBalance;
				flying = false;
				finishFlight = undefined;
				resolve();
			};
			for (const step of plan) {
				timers.push(
					setTimeout(() => {
						const source = document
							.querySelector(`[data-board-card="${step.volume}-${step.id}"]`)
							?.getBoundingClientRect();
						const from = source ?? target;
						const chip = document.createElement('span');
						chip.className = `flyer rarity-${step.rarity.toLowerCase()}`;
						chip.style.left = `${from.left + from.width / 2 - 18}px`;
						chip.style.top = `${from.top + from.height / 2 - 26}px`;
						layer!.append(chip);
						const dx = target.left + target.width / 2 - (from.left + from.width / 2);
						const dy = target.top + target.height / 2 - (from.top + from.height / 2);
						// 上へふくらむ弧。中間点を持ち上げて、縮みながら吸い込まれる。
						const lift = Math.min(-60, dy / 2 - 80);
						const animation = chip.animate(
							[
								{ transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
								{
									transform: `translate(${dx / 2}px, ${lift}px) scale(0.8) rotate(-12deg)`,
									opacity: 1,
									offset: 0.45,
								},
								{
									transform: `translate(${dx}px, ${dy}px) scale(0.15) rotate(8deg)`,
									opacity: 0.4,
								},
							],
							{ duration: step.durationMs, easing: 'cubic-bezier(.45,.05,.55,.95)' },
						);
						animation.onfinish = () => {
							chip.remove();
							shownBalance += step.zenny;
							bump += 1;
							vibrate(donateVibration(step.rarity));
						};
					}, step.delayMs),
				);
			}
			const last = plan[plan.length - 1];
			timers.push(setTimeout(() => finishFlight?.(), last.delayMs + last.durationMs + 120));
		});
	}

	async function donate(input: Parameters<typeof donateCards>[0]) {
		if (busy || !board) return;
		busy = true;
		actionError = '';
		earnedTotal = undefined;
		try {
			const result = await donateCards(input);
			const before = board.balance;
			shownBalance = before;
			await tick();
			await fly(result.donated, result.balance);
			if (result.earned) earnedTotal = result.earned;
			// 所持枚数が減ったので、図鑑のキャッシュも取り直す。
			void cardCollections.refresh(did);
			await load();
		} catch (e) {
			actionError = errorText(e);
		} finally {
			busy = false;
		}
	}

	async function take(entry: CardBoardEntry) {
		if (busy) return;
		busy = true;
		actionError = '';
		try {
			const result = await takeBoardCard({
				card: { volume: entry.card.volume, id: entry.card.id },
				price: entry.price,
			});
			shownBalance = result.balance;
			bump += 1;
			cardCollections.applyCard(did, result.card);
			received = result.card;
			await load();
		} catch (e) {
			actionError = errorText(e);
			await load();
		} finally {
			busy = false;
		}
	}

	const cardName = (card: CardView) => (i18n.locale === 'ja' ? card.nameJa : card.nameEn);
</script>

{#snippet entryTile(entry: CardBoardEntry)}
	<li class="tile" class:muted={!entry.available && !entry.donatable}>
		<div class="tile-card" data-board-card="{entry.card.volume}-{entry.card.id}">
			<!-- 図鑑と同じく、未所持で手に入らないカードは伏せたまま。受け取れるカードだけ表面を見せる。 -->
			<AffirmationCard card={entry.card} revealUnowned={entry.available} />
		</div>
		<div class="tile-meta">
			{#if entry.card.owned}
				<span class="badge owned">{m.boardOwned()}</span>
			{:else if entry.available}
				<span class="badge stock">{m.boardInStock()}</span>
			{:else}
				<span class="badge none">{m.boardOutOfStock()}</span>
			{/if}
			{#if entry.donatable}
				<span class="spare">{m.boardDonatable({ count: entry.donatable })}</span>
			{/if}
		</div>
		{#if entry.donatable}
			<button
				type="button"
				class="donate-one tile-action"
				disabled={busy}
				aria-label="{cardName(entry.card)}: {m.boardDonateOne({ zenny: entry.zenny })}"
				onclick={() =>
					donate({ mode: 'single', card: { volume: entry.card.volume, id: entry.card.id } })}
			>
				{m.boardDonateOne({ zenny: entry.zenny })}
			</button>
		{/if}
		{#if !entry.card.owned && entry.available}
			<button
				type="button"
				class="primary tile-action"
				disabled={busy || !entry.canTake}
				aria-label="{cardName(entry.card)}: {m.boardTake({ price: entry.price })}"
				onclick={() => take(entry)}
			>
				{m.boardTake({ price: entry.price })}
			</button>
		{/if}
	</li>
{/snippet}

<section class="share-board">
	<div class="wallet">
		<div class="wallet-balance" bind:this={balanceEl}>
			<span class="wallet-label">{m.boardBalanceLabel()}</span>
			{#key bump}
				<strong class="wallet-amount" class:bump={bump > 0}
					>{shownBalance}<span class="zenny">{m.boardUnit()}</span></strong
				>
			{/key}
		</div>
		{#if earnedTotal}
			<p class="earned" aria-live="polite">{m.boardEarnedTotal({ amount: earnedTotal })}</p>
		{/if}
	</div>
	<div class="intro-row">
		<p class="intro">{m.boardIntro()}</p>
		<button
			type="button"
			class="help-button"
			aria-expanded={showHelp}
			aria-haspopup="dialog"
			aria-controls="card-share-help"
			onclick={() => (showHelp = true)}>{m.boardHelpOpen()}</button
		>
	</div>
	{#if welcome}
		<p class="welcome" role="status">{m.boardWelcome({ amount: welcome })}</p>
	{/if}

	{#if loadError}
		<p class="error" role="alert">{loadError}</p>
		<button type="button" class="ghost" onclick={load}>{m.retry()}</button>
	{:else if !board}
		<Spinner />
	{:else}
		<div class="bulk">
			{#if flying}
				<button type="button" class="ghost" onclick={() => finishFlight?.()}>{m.boardSkip()}</button>
			{:else if donatableTotal}
				<button
					type="button"
					class="primary"
					disabled={busy}
					onclick={() => donate({ mode: 'all' })}
				>
					{#if busy}<Spinner size="sm" inline decorative />{m.boardDonating()}{:else}{m.boardDonateAll({
							count: donatableTotal,
							amount: donatableZenny,
						})}{/if}
				</button>
			{:else}
				<p class="hint">{m.boardDonateAllNone()}</p>
			{/if}
			{#if actionError}<p class="error" role="alert">{actionError}</p>{/if}
		</div>

		<ul class="grid">
			{#each board.cards as entry (`${entry.card.volume}-${entry.card.id}`)}
				{@render entryTile(entry)}
			{/each}
		</ul>
	{/if}
</section>

<div class="flight-layer" bind:this={layer} aria-hidden="true"></div>

{#if received}
	<CardDetailDialog initial={received} actor={did} onclose={(final) => {
		received = undefined;
		cardCollections.applyCard(did, final);
	}} />
{/if}
{#if showHelp}
	<CardShareHelp id="card-share-help" onclose={() => (showHelp = false)} />
{/if}

<style>
	.share-board {
		display: grid;
		gap: 0.9rem;
		padding: 1rem;
	}
	.wallet {
		position: sticky;
		top: var(--mobile-header-h, 0);
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border: 1px solid var(--panel-border);
		border-radius: var(--radius-m);
		background: var(--panel-bg);
		box-shadow: var(--shadow-panel);
	}
	.wallet-balance {
		display: grid;
	}
	.wallet-label {
		color: var(--text-faint);
		font-size: 0.75rem;
	}
	.wallet-amount {
		font-size: 1.6rem;
		font-variant-numeric: tabular-nums;
		color: var(--text-strong);
	}
	.wallet-amount.bump {
		animation: wallet-bump 260ms ease-out;
	}
	.zenny {
		margin-inline-start: 0.2em;
		color: var(--accent-strong);
		font-size: 0.85em;
	}
	.earned {
		color: var(--accent-strong);
		font-weight: 800;
		font-size: 1.2rem;
		animation: earned-pop 600ms ease-out;
	}
	.intro-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem 1rem;
	}
	.intro-row .intro {
		flex: 1 1 16rem;
		margin: 0;
	}
	/* ゼンカツの「あそびかた」と同じ見た目にそろえる。 */
	.help-button {
		min-height: 44px;
		padding: 10px 18px;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-md);
		background: var(--bg-raised);
		color: var(--text);
		font-weight: 700;
		letter-spacing: 0.02em;
	}
	.intro,
	.hint {
		color: var(--text-muted);
		font-size: 0.85rem;
	}
	.welcome {
		padding: 0.6rem 0.8rem;
		border-radius: var(--radius-s);
		background: var(--accent-softer);
		color: var(--text-strong);
		font-weight: 700;
	}
	.error {
		color: var(--danger);
		font-size: 0.85rem;
	}
	.bulk {
		display: grid;
		gap: 0.4rem;
	}
	.bulk .primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.8rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.tile {
		display: grid;
		gap: 0.35rem;
		align-content: start;
	}
	.tile.muted .tile-card {
		opacity: 0.45;
	}
	.tile-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.75rem;
	}
	.badge {
		padding: 0.05rem 0.45rem;
		border-radius: var(--radius-pill);
		font-weight: 700;
	}
	.badge.stock {
		background: var(--success-soft);
		color: var(--success);
	}
	.badge.none {
		background: var(--bg-inset);
		color: var(--text-faint);
	}
	.badge.owned {
		background: var(--accent-softer);
		color: var(--accent-strong);
	}
	.spare {
		color: var(--text-muted);
	}
	.tile-action {
		inline-size: 100%;
		font-size: 0.8rem;
	}
	/* 受け取る（primary）と並んでも主従が分かるよう、枠線のボタンにする。 */
	.donate-one {
		min-block-size: 36px;
		padding: 6px 10px;
		border: 1.5px solid var(--accent);
		border-radius: var(--r-md);
		background: transparent;
		color: var(--accent-strong);
		font-weight: 700;
	}
	.donate-one:active:not(:disabled) {
		background: color-mix(in srgb, var(--accent) 14%, transparent);
	}
	@media (hover: hover) and (pointer: fine) {
		.donate-one:hover:not(:disabled) {
			background: color-mix(in srgb, var(--accent) 10%, transparent);
		}
	}
	.donate-one:disabled {
		opacity: 0.5;
	}
	.flight-layer {
		position: fixed;
		inset: 0;
		z-index: 50;
		pointer-events: none;
	}
	.flight-layer :global(.flyer) {
		position: fixed;
		inline-size: 36px;
		block-size: 52px;
		border-radius: 5px;
		background: var(--card-face);
		border: 2px solid var(--card-rarity-n);
		box-shadow: var(--shadow-pop);
		will-change: transform;
	}
	.flight-layer :global(.flyer.rarity-r) {
		border-color: var(--card-rarity-r);
	}
	.flight-layer :global(.flyer.rarity-sr) {
		border-color: var(--card-rarity-sr);
		box-shadow:
			0 0 12px var(--card-rarity-sr),
			var(--shadow-pop);
	}
	.flight-layer :global(.flyer.rarity-ur) {
		border-color: var(--card-rarity-ur);
		box-shadow:
			0 0 16px var(--card-rarity-ur),
			var(--shadow-pop);
	}
	.flight-layer :global(.flyer.rarity-aar) {
		border-color: var(--card-rarity-aar);
		box-shadow:
			0 0 22px var(--card-rarity-aar),
			var(--shadow-pop);
	}
	@keyframes wallet-bump {
		0% {
			transform: scale(1);
		}
		40% {
			transform: scale(1.18);
		}
		100% {
			transform: scale(1);
		}
	}
	@keyframes earned-pop {
		0% {
			transform: scale(0.6);
			opacity: 0;
		}
		60% {
			transform: scale(1.15);
			opacity: 1;
		}
		100% {
			transform: scale(1);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.wallet-amount.bump,
		.earned {
			animation: none;
		}
	}
</style>
