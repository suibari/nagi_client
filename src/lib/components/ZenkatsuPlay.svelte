<script lang="ts">
	import { getZenkatsu } from '$lib/api/appview';
	import type {
		CardView,
		ZenkatsuPlayableCard,
		ZenkatsuThemeView,
		ZenkatsuSubmissionView,
	} from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import AffirmationCard from './AffirmationCard.svelte';
	import ZenkatsuHelp from './ZenkatsuHelp.svelte';

	let {
		hand,
		maxCards,
		theme,
		onsubmit,
		onclose,
		initialSubmission,
		loadFeed = getZenkatsu,
	}: {
		hand: { p: ZenkatsuPlayableCard; card: CardView }[];
		maxCards: number;
		theme: ZenkatsuThemeView;
		onsubmit: (cards: { volume: number; id: number }[]) => Promise<string>;
		onclose: () => void;
		initialSubmission?: ZenkatsuSubmissionView;
		loadFeed?: typeof getZenkatsu;
	} = $props();
	const attributeLabels = {
		light: m.cardAttributeLight,
		dark: m.cardAttributeDark,
		fire: m.cardAttributeFire,
		water: m.cardAttributeWater,
		wind: m.cardAttributeWind,
		earth: m.cardAttributeEarth,
	};

	let dialog: HTMLDialogElement;
	let picked = $state<CardView[]>([]);
	let stage = $state<'select' | 'cutin' | 'review'>('select');
	let busy = $state(false);
	let error = $state('');
	let uri = $state('');
	let animationDone = $state(false);
	let commentJa = $state('');
	let commentEn = $state('');
	let waiting = $state(true);
	let retry = $state(0);
	let showGuide = $state(false);
	/**
	 * 提出の結果（追い風の枚数と、成立したコンボ）。
	 *
	 * コンボは隠し要素なので**定義をクライアントへ配らない**。成立したものだけがサーバから
	 * 降りてくるので、ここへ溜めて review 段で出す。
	 */
	let outcome = $state<ZenkatsuSubmissionView | undefined>();
	// 初期表示専用。提出済みの結果を開く場合も同じ総評画面を使う。
	$effect(() => {
		if (initialSubmission && !uri) {
			picked = [...initialSubmission.cards];
			uri = initialSubmission.uri;
			commentJa = initialSubmission.commentJa ?? '';
			commentEn = initialSubmission.commentEn ?? '';
			outcome = initialSubmission;
			animationDone = true;
		}
	});
	const key = (c: { volume: number; id: number }) => `${c.volume}:${c.id}`;
	const name = (c: CardView) => (i18n.locale === 'ja' ? c.nameJa : c.nameEn);
	let comment = $derived((i18n.locale === 'ja' ? commentJa : commentEn) || commentJa || commentEn);

	function vibrate(pattern: number | number[]) {
		if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			try {
				navigator.vibrate?.(pattern);
			} catch {
				/* 非対応環境でもプレイは続ける。 */
			}
		}
	}
	$effect(() => {
		dialog.showModal();
		const previous = document.documentElement.style.overflow;
		document.documentElement.style.overflow = 'hidden';
		return () => {
			document.documentElement.style.overflow = previous;
			try {
				navigator.vibrate?.(0);
			} catch {
				/* 振動の停止が非対応でも閉じられる。 */
			}
		};
	});
	$effect(() => {
		if (uri && animationDone) stage = 'review';
	});
	$effect(() => {
		if (stage !== 'review' || !uri || commentJa || commentEn) return;
		void retry;
		const submissionUri = uri;
		let cancelled = false;
		let timer: ReturnType<typeof setTimeout>;
		const deadline = Date.now() + 60_000;
		waiting = true;
		async function poll() {
			try {
				const feed = await loadFeed({ date: theme.themeDate });
				if (cancelled) return;
				const submission = feed.submissions.find((s) => s.uri === submissionUri);
				// 追い風とコンボは総評より先に確定しているので、見つけた時点で受け取る。
				if (submission) outcome = submission;
				if (submission && (submission.commentJa || submission.commentEn)) {
					commentJa = submission.commentJa || '';
					commentEn = submission.commentEn || '';
					waiting = false;
					vibrate([25, 60, 40]);
					return;
				}
			} catch {
				/* 索引・総評を待って再取得する。 */
			}
			if (cancelled) return;
			if (Date.now() >= deadline) {
				waiting = false;
				return;
			}
			timer = setTimeout(poll, 2500);
		}
		void poll();
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	});
	function toggle(card: CardView) {
		if (picked.some((c) => key(c) === key(card)))
			picked = picked.filter((c) => key(c) !== key(card));
		else if (picked.length < maxCards) picked = [...picked, card];
		vibrate(15);
	}
	async function submit() {
		if (busy || !picked.length || uri) return;
		busy = true;
		error = '';
		animationDone = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		stage = 'cutin';
		dialog.scrollTop = 0;
		vibrate([35, 65, 35, 65, 70]);
		try {
			uri = await onsubmit(picked.map(({ volume, id }) => ({ volume, id })));
		} catch {
			error = m.zenkatsuSubmitFailed();
			stage = 'select';
		} finally {
			busy = false;
		}
	}
	function close() {
		if (!busy) onclose();
	}
</script>

<dialog
	bind:this={dialog}
	class="game"
	aria-labelledby="game-title"
	oncancel={(e) => {
		e.preventDefault();
		close();
	}}
>
	<div class="game-shell">
		<header class="game-header">
			<img src="/zenkatsu-logo.png" alt={m.zenkatsuTitle()} width="1671" height="941" />
			<span>{m.zenkatsuTagline()}</span>
			<button class="game-ghost" disabled={busy} onclick={close}
				>{uri ? m.zenkatsuFinish() : m.zenkatsuCancel()}</button
			>
		</header>
		<section class="theme">
			<p class="eyebrow">{m.zenkatsuThemeLabel()}</p>
			<h1 id="game-title">
				{i18n.locale === 'ja' ? theme.textJa : theme.textEn}
				<span class="theme-question">{m.zenkatsuThemeQuestion()}</span>
			</h1>
			<p class="recommended-attribute">
				{m.zenkatsuRecommendedAttribute({ attribute: attributeLabels[theme.attribute]() })}
			</p>
		</section>
		{#if stage === 'select'}
			<div class="selection-area">
				<section class="selection" aria-label={m.zenkatsuSelectedCards()}>
					<div class="section-heading">
						<h2>{m.zenkatsuSelectedCards()}</h2>
						<span aria-live="polite"
							>{m.zenkatsuPickedCount({ picked: picked.length, max: maxCards })}</span
						>
					</div>
					<div
						class="slots"
						class:complete={picked.length === maxCards}
						style={`--slots: ${maxCards}`}
					>
						{#each Array.from({ length: maxCards }) as _, i}
							<div class="slot" class:filled={!!picked[i]}>
								{#if picked[i]}
									{#key key(picked[i])}
										<div class="placement-fx" aria-hidden="true">
											<span class="placement-ring"></span>
											{#each Array.from({ length: 8 }) as _, spark}
												<i style={`--angle: ${spark * 45}deg`}></i>
											{/each}
										</div>
										<div class="selected-card">
											<AffirmationCard
												card={picked[i]}
												revealUnowned
												attributeGlow={picked[i].attribute === theme.attribute}
											/>
										</div>
										<button
											class="remove"
											onclick={() => {
												picked = picked.filter((_, index) => index !== i);
												vibrate(10);
											}}
											aria-label={m.zenkatsuRemoveCard({ name: name(picked[i]) })}>×</button
										>
									{/key}
								{:else}<span class="slot-number">0{i + 1}</span><span>{m.zenkatsuEmptySlot()}</span
									>{/if}
							</div>
						{/each}
					</div>
				</section>
			</div>
			<section class="hand-area">
				<div class="section-heading">
					<h2>{m.zenkatsuHand()}</h2>
					<p>{m.zenkatsuPickPrompt({ max: maxCards })}</p>
					<!-- おすすめ属性は隠さない。選ぶ前に気づけないと、属性が飾りのままになる。 -->
					<p class="tailwind-hint">
						{m.zenkatsuTailwindHint()}: {attributeLabels[theme.attribute]()}
					</p>
				</div>
				{#if !hand.length}<p class="note">{m.zenkatsuNoCards()}</p>{/if}
				<ul class="hand">
					{#each hand as entry (key(entry.p))}
						{@const chosen = picked.some((c) => key(c) === key(entry.card))}
						<li>
							<button
								class="hand-card"
								class:chosen
								class:resting={entry.p.available < 1}
								disabled={entry.p.available < 1}
								aria-pressed={chosen}
								onclick={() => toggle(entry.card)}
							>
								<AffirmationCard
									card={entry.card}
									revealUnowned
									attributeGlow={entry.card.attribute === theme.attribute && entry.p.available > 0}
								/>
								{#if chosen}<span class="badge">✓ {m.zenkatsuSelectedCards()}</span>
								{:else if entry.p.available < 1}<span class="badge"
										>{entry.p.restingDays
											? m.zenkatsuResting({ days: entry.p.restingDays })
											: m.zenkatsuRestingShort()}</span
									>
								{:else if entry.p.available > 1}<span class="badge"
										>{m.zenkatsuStock({ n: entry.p.available })}</span
									>{/if}
							</button>
						</li>
					{/each}
				</ul>
			</section>
			<footer class="game-actions">
				<p>{m.zenkatsuConfirmBody()}</p>
				<div class="action-buttons">
					<button class="game-primary" disabled={!picked.length || busy} onclick={submit}
						>{m.zenkatsuSubmit()} ↗</button
					>
					<button
						class="game-ghost"
						aria-haspopup="dialog"
						aria-controls="zenkatsu-play-guide"
						onclick={() => (showGuide = true)}>{m.zenkatsuHowToPlay()}</button
					>
				</div>
				{#if error}<p class="error" role="alert">{error}</p>{/if}
			</footer>
		{:else if stage === 'cutin'}
			<section class="cutin-stage" aria-label={m.zenkatsuSubmitting()}>
				<div class="speed-lines" aria-hidden="true">
					{#each Array.from({ length: 12 }) as _, i}
						<i style={`--i: ${i}; --y: ${8 + i * 7}%`}></i>
					{/each}
				</div>
				<div class="cutin-cards">
					{#each picked as card, i (key(card))}
						<div
							class="cutin"
							style={`--i: ${i}`}
							onanimationstart={(event) => {
								if (event.animationName.includes('diagonal-cutin')) vibrate(25);
							}}
							onanimationend={(event) => {
								if (event.animationName.includes('diagonal-cutin') && i === picked.length - 1)
									animationDone = true;
							}}
						>
							<div class="cutin-card">
								<AffirmationCard
									{card}
									size="full"
									revealUnowned
									attributeGlow={card.attribute === theme.attribute}
								/>
							</div>
						</div>
					{/each}
				</div>
				<p role="status">{m.zenkatsuSubmitting()}</p>
			</section>
		{:else}
			<section class="finale" class:review-ready={!!comment}>
				{#if comment}
					<div class="review-sparks" aria-hidden="true">
						{#each Array.from({ length: 18 }) as _, i}
							<i
								style={`--x: ${5 + ((i * 37) % 90)}%; --delay: ${(i % 6) * 90}ms; --drift: ${(i % 2 ? 1 : -1) * (15 + i * 3)}px`}
								>✦</i
							>
						{/each}
					</div>
				{/if}
				<div class="review-cards">
					{#each picked as card (key(card))}<div>
							<AffirmationCard
								{card}
								revealUnowned
								attributeGlow={card.attribute === theme.attribute}
							/>
						</div>{/each}
				</div>
				<!--
					追い風 → コンボ → 総評 の順で出す。全部を一度に出すと、いちばん読ませたい総評が
					数字と一緒くたになって流れる。CSS の遅延で段をずらし、最後に言葉が残るようにする。
					**得点は出さない。** 出すのは「何が起きたか」だけ。
				-->
				{#if outcome}
					<div class="outcome">
						<div class="outcome-row" style="--delay: 0ms">
							<span class="outcome-label">{m.zenkatsuResultTailwind()}</span>
							{#if outcome.tailwindCount > 0}
								<span class="outcome-value wind-value"
									>{m.zenkatsuTailwindBadge({ n: outcome.tailwindCount })}</span
								>
							{:else}
								<!-- 乗らなかったことを失敗として見せない。ここに不正解は無い。 -->
								<span class="outcome-none">{m.zenkatsuResultTailwindNone()}</span>
							{/if}
						</div>
						{#each outcome.combos as combo, index (key(combo))}
							<div class="outcome-row" style={`--delay: ${400 + index * 300}ms`}>
								<span class="outcome-label">{m.zenkatsuResultCombo()}</span>
								<span class="outcome-value combo-value"
									>{i18n.locale === 'ja' ? combo.nameJa : combo.nameEn}</span
								>
								<span class="outcome-desc"
									>{i18n.locale === 'ja' ? combo.descJa : combo.descEn}</span
								>
							</div>
						{/each}
					</div>
				{/if}
				<div class="bot-review" class:thinking={waiting && !comment}>
					<img src="/bot_assist_sitting.png" alt="botたん" width="220" height="220" />
					<div class="speech" aria-live="polite">
						<h2>{m.zenkatsuBotReview()}</h2>
						<p class:comment-arrived={!!comment}>
							{comment || (waiting ? m.zenkatsuCommentPending() : m.zenkatsuReviewLater())}
						</p>
						{#if waiting && !comment}
							<div class="thinking-dots" aria-hidden="true"><i></i><i></i><i></i></div>
						{/if}
						{#if !waiting && !comment}<button class="game-ghost" onclick={() => retry++}
								>{m.zenkatsuRetryReview()}</button
							>{/if}
					</div>
				</div>
				<button class="game-primary" onclick={close}>{m.zenkatsuFinish()}</button>
			</section>
		{/if}
	</div>
	{#if showGuide}
		<ZenkatsuHelp id="zenkatsu-play-guide" {maxCards} onclose={() => (showGuide = false)} />
	{/if}
</dialog>

<style>
	/* 今日の追い風。選択時にここで気づけるようにする。 */
	.tailwind-hint {
		color: var(--accent-strong);
		font-weight: 700;
	}
	/* リザルトは順繰りに現れる。遅延だけで段を作るので、クリックを挟まない。 */
	.outcome {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-block: 0.8rem;
	}
	.outcome-row {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
		justify-content: center;
		opacity: 0;
		animation: outcome-in 320ms ease-out var(--delay, 0ms) forwards;
	}
	.outcome-label {
		color: var(--text-faint);
		font-size: 0.75rem;
	}
	.outcome-value {
		font-size: 1.05rem;
		font-weight: 700;
	}
	.wind-value {
		color: var(--accent-strong);
	}
	.combo-value {
		color: var(--badge-title-fg, var(--accent-strong));
	}
	.outcome-desc {
		inline-size: 100%;
		color: var(--text-faint);
		font-size: 0.8rem;
		line-height: 1.6;
	}
	.outcome-none {
		color: var(--text-faint);
		font-size: 0.85rem;
	}
	@keyframes outcome-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	/* 演出を抑える設定では、遅延も動きも出さずに即表示する。 */
	@media (prefers-reduced-motion: reduce) {
		.outcome-row {
			opacity: 1;
			animation: none;
		}
	}
	.game {
		color-scheme: dark;
		--bg: var(--zenkatsu-game-bg);
		--bg-raised: var(--zenkatsu-game-surface);
		--text: var(--zenkatsu-game-text);
		--text-faint: var(--zenkatsu-game-muted);
		--line: var(--zenkatsu-game-line);
		--accent-strong: var(--zenkatsu-game-accent);
		--danger: var(--zenkatsu-game-danger);
		position: fixed;
		inset: 0;
		width: 100vw;
		max-width: none;
		height: 100%;
		height: 100dvh;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		color: var(--text);
		background: var(--bg);
		overflow: auto;
		scrollbar-width: none;
		overscroll-behavior: contain;
	}
	.game::-webkit-scrollbar,
	.slots::-webkit-scrollbar {
		display: none;
	}
	.game::backdrop {
		background: var(--bg);
	}
	.game-shell {
		min-height: 100%;
		display: flex;
		flex-direction: column;
		background: radial-gradient(
			ellipse at 50% 0,
			color-mix(in srgb, var(--accent-strong) 10%, transparent),
			transparent 65%
		);
		padding: max(12px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
			max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
	}
	.game-header {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.game-header img {
		width: 110px;
		height: auto;
	}
	.game-header span {
		color: var(--text-faint);
		font-size: 0.8rem;
	}
	.game-header button {
		margin-left: auto;
	}
	button {
		cursor: pointer;
		font: inherit;
	}
	button:disabled {
		opacity: 0.45;
		cursor: default;
	}
	button:focus-visible {
		outline: 3px solid var(--accent-strong);
		outline-offset: 4px;
	}
	.game-ghost {
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		padding: 10px 18px;
		background: var(--zenkatsu-game-surface);
		color: var(--text);
		min-height: 44px;
		font-weight: 700;
		letter-spacing: 0.02em;
	}
	.game-primary {
		border: 0;
		border-radius: var(--r-md);
		padding: 10px 18px;
		color: white;
		background: var(--zenkatsu-game-action);
		font-weight: 700;
		box-shadow: 0 6px 24px color-mix(in srgb, var(--accent-strong) 25%, transparent);
		min-height: 44px;
		letter-spacing: 0.02em;
	}
	.theme {
		text-align: center;
		margin: 0.5rem auto 1.2rem;
		max-width: 900px;
	}
	.theme-question {
		display: block;
		margin-top: 0.35rem;
		color: var(--accent-strong);
	}
	.recommended-attribute {
		font-size: 0.8rem;
		color: var(--text-faint);
		margin-top: 0.4rem;
	}
	.eyebrow {
		color: var(--accent-strong);
		font-size: 0.8rem;
		letter-spacing: 0.15em;
	}
	h1 {
		font-size: clamp(1.15rem, 2.5vw, 1.8rem);
		margin: 0.3rem 0;
		text-wrap: balance;
	}
	h2,
	p {
		margin: 0;
	}
	h2 {
		font-size: 0.95rem;
	}
	.selection-area {
		width: min(100%, 1300px);
		margin: 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 2rem;
	}
	.selection {
		width: min(100%, 1000px);
		min-width: 0;
	}
	.section-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		margin-bottom: 0.75rem;
	}
	.section-heading span,
	.section-heading p {
		font-size: 0.8rem;
		color: var(--text-faint);
	}
	.slots {
		scrollbar-width: none;
		display: grid;
		grid-template-columns: repeat(var(--slots), minmax(0, 1fr));
		gap: clamp(0.5rem, 2vw, 1.5rem);
	}
	.slot {
		position: relative;
		border: 1px dashed color-mix(in srgb, var(--accent-strong) 45%, var(--line));
		border-radius: 14px;
		aspect-ratio: 59 / 86;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		color: var(--text-faint);
		background: color-mix(in srgb, var(--bg) 65%, transparent);
		font-size: 0.8rem;
	}
	.slot.filled {
		border: 0;
		background: none;
	}
	.slot-number {
		font-size: clamp(1.5rem, 4vw, 3rem);
		opacity: 0.35;
		font-weight: 800;
	}
	.selected-card,
	.hand-card {
		width: 100%;
		border: 0;
		padding: 0;
		border-radius: 10px;
		background: none;
		text-align: start;
	}
	.selected-card {
		animation: select-card 0.48s cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.remove {
		position: absolute;
		top: -8px;
		right: -5px;
		width: 30px;
		height: 30px;
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
		background: var(--bg);
		color: var(--text);
	}
	.hand-area {
		width: min(100%, 1400px);
		margin: 1.8rem auto 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--line);
	}
	.hand {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
		gap: 0.85rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.hand li {
		min-width: 0;
	}
	.hand-card {
		position: relative;
		transition: transform 0.18s;
	}
	.hand-card:hover {
		transform: translateY(-4px);
	}
	.hand-card.chosen {
		outline: 3px solid var(--accent-strong);
		outline-offset: 3px;
	}
	.hand-card.resting {
		opacity: 0.5;
	}
	.badge {
		position: absolute;
		bottom: 5px;
		left: 50%;
		transform: translateX(-50%);
		max-width: 100%;
		border-radius: 999px;
		padding: 0.2rem 0.4rem;
		background: rgb(0 0 0 / 0.8);
		color: white;
		font-size: 0.65rem;
		white-space: nowrap;
	}
	.game-actions {
		position: sticky;
		bottom: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.75rem 2rem;
		margin-top: auto;
		padding: 1rem;
		background: color-mix(in srgb, var(--bg) 94%, transparent);
		border-top: 1px solid var(--line);
		backdrop-filter: blur(12px);
		z-index: 2;
	}
	.action-buttons {
		display: flex;
		align-items: stretch;
		gap: 0.65rem;
	}
	.action-buttons button {
		white-space: nowrap;
		min-height: 44px;
	}
	.game-actions p {
		font-size: 0.8rem;
		color: var(--text-faint);
	}
	.game-actions .error {
		color: var(--danger, #c0392b);
		width: 100%;
		text-align: center;
	}
	.cutin-stage {
		position: relative;
		isolation: isolate;
		flex: 1;
		display: grid;
		align-content: center;
		gap: 2rem;
		text-align: center;
		overflow: hidden;
		min-height: 60dvh;
	}
	.cutin-cards {
		display: flex;
		justify-content: center;
		gap: clamp(0.5rem, 3vw, 3rem);
		padding: 2rem 0.5rem;
	}
	.cutin {
		width: min(27vw, 260px);
		position: relative;
		animation: diagonal-cutin 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
		animation-delay: calc(var(--i) * 0.28s);
	}
	.cutin::before {
		content: '';
		position: absolute;
		inset: -20% -35%;
		transform: skewY(-15deg);
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in srgb, var(--accent-strong) 40%, transparent),
			transparent
		);
	}
	.cutin-card {
		position: relative;
		transform: rotate(-9deg);
	}
	.finale {
		position: relative;
		isolation: isolate;
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		padding: 1.5rem 0;
	}
	.review-cards {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}
	.review-cards > div {
		width: min(23vw, 145px);
	}
	.bot-review {
		display: flex;
		align-items: flex-end;
		gap: 1.5rem;
		width: min(100%, 800px);
	}
	.bot-review img {
		width: clamp(90px, 20vw, 220px);
		height: auto;
		object-fit: contain;
	}
	.speech {
		position: relative;
		flex: 1;
		min-width: 0;
		border: 1px solid var(--line);
		background: var(--zenkatsu-game-surface);
		border-radius: 24px 24px 24px 3px;
		padding: clamp(1rem, 3vw, 2rem);
		box-shadow: 0 8px 40px rgb(0 0 0 / 0.06);
	}
	.speech h2 {
		color: var(--accent-strong);
		margin-bottom: 0.7rem;
	}
	.speech p {
		font-size: clamp(1rem, 1.5vw, 1.2rem);
		line-height: 1.9;
		white-space: pre-line;
		overflow-wrap: anywhere;
	}
	.speech button {
		margin-top: 1rem;
	}
	@keyframes select-card {
		from {
			opacity: 0.4;
			transform: translateY(-28px) scale(1.12) rotate(-5deg);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@keyframes diagonal-cutin {
		from {
			opacity: 0;
			transform: translate(-100vw, 45vh) rotate(-18deg);
		}
		65% {
			opacity: 1;
			transform: translate(0, -8px) rotate(2deg);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@media (max-width: 1000px) {
		.selection-area {
			flex-direction: column;
			gap: 1rem;
		}
		.selection {
			max-width: 1000px;
		}
	}
	@media (max-width: 600px) {
		.game-header span {
			display: none;
		}
		.game-header img {
			width: 90px;
		}
		.theme {
			margin-bottom: 1rem;
		}
		.slots {
			grid-template-columns: repeat(var(--slots), minmax(230px, 72vw));
			gap: 1rem;
			overflow-x: auto;
			scroll-snap-type: x proximity;
			padding: 12px 8px 18px;
			scroll-padding-inline: 8px;
		}
		.slot {
			scroll-snap-align: center;
		}
		.slot {
			font-size: 0.65rem;
		}
		.section-heading {
			flex-wrap: wrap;
		}
		.hand {
			grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
			gap: 0.7rem;
		}
		.game-actions {
			padding: 0.75rem 0;
			gap: 0.5rem;
		}
		.game-actions p {
			text-align: center;
			font-size: 0.7rem;
		}
		.game-primary {
			width: 100%;
		}
		.action-buttons {
			width: 100%;
		}
		.action-buttons .game-primary {
			width: auto;
			flex: 1;
			padding-inline: 1rem;
		}
		.bot-review {
			gap: 0.6rem;
		}
		.bot-review img {
			width: 80px;
		}
		.speech {
			padding: 1rem;
		}
		.finale {
			gap: 1.5rem;
		}
	}
	.placement-fx {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 1;
	}
	.placement-ring {
		position: absolute;
		inset: 0;
		border: 2px solid var(--accent-strong);
		border-radius: 14px;
		animation: placement-ring 0.7s ease-out both;
	}
	.placement-fx i {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--accent-strong);
		animation: placement-spark 0.65s ease-out both;
	}
	.slots.complete .selected-card {
		box-shadow: 0 0 20px color-mix(in srgb, var(--accent-strong) 28%, transparent);
	}
	.speed-lines {
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
	}
	.speed-lines i {
		position: absolute;
		top: var(--y);
		left: 0;
		width: 70%;
		height: 2px;
		background: linear-gradient(90deg, transparent, var(--accent-strong), transparent);
		animation: speed-line 0.8s ease-out both;
		animation-delay: calc(var(--i) * 55ms);
	}
	.cutin-card::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 10px;
		pointer-events: none;
		background: linear-gradient(
			115deg,
			transparent 35%,
			color-mix(in srgb, var(--accent-strong) 50%, transparent) 50%,
			transparent 65%
		);
		background-size: 300% 100%;
		animation: card-shine 0.7s ease-out both;
		animation-delay: calc(0.5s + var(--i) * 0.28s);
	}
	.review-cards {
		animation: review-enter 0.65s ease-out both;
	}
	.bot-review {
		animation: review-enter 0.55s ease-out both;
	}
	.thinking img {
		animation: bot-breathe 2s ease-in-out 6;
	}
	.thinking-dots {
		display: flex;
		gap: 6px;
		margin-top: 0.75rem;
	}
	.thinking-dots i {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent-strong);
		animation: bot-breathe 1s ease-in-out 12;
	}
	.thinking-dots i:nth-child(2) {
		animation-delay: 0.15s;
	}
	.thinking-dots i:nth-child(3) {
		animation-delay: 0.3s;
	}
	.review-ready .bot-review img {
		animation: bot-greeting 0.8s ease-out both;
	}
	.review-ready .speech {
		border-color: var(--accent-strong);
		animation: review-glow 1.2s ease-out both;
	}
	.comment-arrived {
		animation: review-enter 0.6s ease-out both;
	}
	.review-sparks {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		z-index: -1;
	}
	.review-sparks i {
		position: absolute;
		left: var(--x);
		top: 65%;
		color: var(--accent-strong);
		font-size: 1.1rem;
		font-style: normal;
		animation: review-spark 1.7s ease-out both;
		animation-delay: var(--delay);
	}
	@keyframes placement-ring {
		from {
			opacity: 0.9;
			transform: scale(0.92);
		}
		to {
			opacity: 0;
			transform: scale(1.13);
		}
	}
	@keyframes placement-spark {
		from {
			opacity: 0.9;
			transform: rotate(var(--angle)) translateX(10px) scale(1.3);
		}
		to {
			opacity: 0;
			transform: rotate(var(--angle)) translateX(clamp(45px, 10vw, 140px)) scale(0.2);
		}
	}
	@keyframes speed-line {
		from {
			opacity: 0;
			transform: translate(-120%, 80px) rotate(-18deg);
		}
		25% {
			opacity: 0.65;
		}
		to {
			opacity: 0;
			transform: translate(150%, -80px) rotate(-18deg);
		}
	}
	@keyframes card-shine {
		from {
			background-position: 100% 0;
			opacity: 0;
		}
		25% {
			opacity: 1;
		}
		to {
			background-position: 0 0;
			opacity: 0;
		}
	}
	@keyframes review-enter {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@keyframes bot-breathe {
		50% {
			transform: translateY(-4px);
			opacity: 0.65;
		}
	}
	@keyframes bot-greeting {
		0%,
		100% {
			transform: none;
		}
		35% {
			transform: translateY(-12px) rotate(-5deg);
		}
		65% {
			transform: translateY(-3px) rotate(3deg);
		}
	}
	@keyframes review-glow {
		from {
			box-shadow: 0 0 40px color-mix(in srgb, var(--accent-strong) 38%, transparent);
		}
		to {
			box-shadow: 0 0 18px color-mix(in srgb, var(--accent-strong) 10%, transparent);
		}
	}
	@keyframes review-spark {
		from {
			opacity: 0;
			transform: translate(0, 20px) scale(0.4);
		}
		20% {
			opacity: 0.85;
		}
		to {
			opacity: 0;
			transform: translate(var(--drift), -260px) rotate(90deg) scale(0.5);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.placement-fx,
		.speed-lines,
		.review-sparks,
		.cutin-card::after {
			display: none;
		}
		*,
		*::before,
		*::after {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
