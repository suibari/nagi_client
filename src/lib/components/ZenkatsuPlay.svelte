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
	import ZenkatsuBonus from './ZenkatsuBonus.svelte';

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
	let shell: HTMLDivElement;
	let picked = $state<CardView[]>([]);
	let stage = $state<'select' | 'cutin' | 'review'>('select');
	let busy = $state(false);
	let error = $state('');
	let uri = $state('');
	let animationDone = $state(false);
	/** 最後の1枚が botたんの手に着いた。ここから受け取りの余韻に入る。 */
	let received = $state(false);
	let receiveTimer: ReturnType<typeof setTimeout> | undefined;
	let commentJa = $state('');
	let commentEn = $state('');
	let waiting = $state(true);
	let retry = $state(0);
	let showGuide = $state(false);
	let bonusDone = $state(false);
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
	let reviewVisible = $derived(!!comment && (bonusDone || !!initialSubmission));

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
		/*
		 * showModal() は最初のフォーカス可能な要素（＝ヘッダーの閉じる）へ焦点を移す。
		 * 開いた瞬間に「やめる」が光って見えるので、器そのものへ逃がして画面から始める。
		 */
		shell?.focus({ preventScroll: true });
		const previous = document.documentElement.style.overflow;
		document.documentElement.style.overflow = 'hidden';
		return () => {
			document.documentElement.style.overflow = previous;
			clearTimeout(receiveTimer);
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
		if (!uri || commentJa || commentEn) return;
		void retry;
		const submissionUri = uri;
		let cancelled = false;
		let timer: ReturnType<typeof setTimeout>;
		const deadline = Date.now() + 60_000;
		/*
		 * 短く始めて、だんだん間隔を空ける。
		 *
		 * 生成は実測 3.2秒ほどで終わるので、一定 2.5秒で回すと「出来ているのに最大2.5秒
		 * 待たされる」時間が毎回乗る。最初を短くすれば出来た直後に拾えるし、
		 * 長引いたときは間隔が伸びるので無駄打ちも増えない。
		 */
		let delay = 600;
		waiting = true;
		async function poll() {
			try {
				const feed = await loadFeed({ date: theme.themeDate }, { publicOnly: true });
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
			timer = setTimeout(poll, delay);
			delay = Math.min(2500, Math.round(delay * 1.6));
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
		received = animationDone;
		stage = 'cutin';
		dialog.scrollTop = 0;
		vibrate([35, 65, 35, 65, 70]);
		try {
			uri = await onsubmit(picked.map(({ volume, id }) => ({ volume, id })));
		} catch {
			error = m.zenkatsuSubmitFailed();
			clearTimeout(receiveTimer);
			received = false;
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
	<div class="game-shell" class:playing={stage !== 'select'} bind:this={shell} tabindex="-1">
		<header class="game-header">
			<img src="/zenkatsu-logo.png" alt={m.zenkatsuTitle()} width="1671" height="941" />
			<span>{m.zenkatsuTagline()}</span>
			<!--
				出口はひとつに見せる。提出後はリザルト側に大きな「おわる」が出るので、
				ヘッダーは×に退く（読み上げ名は変えない）。
			-->
			{#if uri}
				<button
					class="game-ghost icon"
					disabled={busy}
					aria-label={m.zenkatsuFinish()}
					onclick={close}>×</button
				>
			{:else}
				<button class="game-ghost" disabled={busy} onclick={close}>{m.zenkatsuCancel()}</button>
			{/if}
		</header>
		<nav class="play-progress" aria-label={i18n.locale === 'ja' ? 'プレイの進行' : 'Play progress'}>
			<span class:active={stage === 'select'}><b>01</b> {m.zenkatsuStepSelect()}</span>
			<i></i><span class:active={stage === 'cutin' || (stage === 'review' && !bonusDone)}
				><b>02</b> {m.zenkatsuStepBonus()}</span
			>
			<i></i><span class:active={stage === 'review' && bonusDone}
				><b>03</b> {m.zenkatsuStepReview()}</span
			>
		</nav>
		<section class="theme">
			<p class="eyebrow">{m.zenkatsuThemeLabel()}</p>
			<h1 id="game-title">
				{i18n.locale === 'ja' ? theme.textJa : theme.textEn}
				<span class="theme-question">{m.zenkatsuThemeQuestion()}</span>
			</h1>
			<!-- おすすめ属性はここ1箇所にまとめる。お題のすぐ下なら、選ぶ前に必ず目に入る。 -->
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
			<!--
				提出は「渡す」場面。札が下から舞い上がって扇に開き、botたんが受け取る。
				受け取り切るまで総評へ進まないので、出した手応えが必ず1回挟まる。
			-->
			<section class="cutin-stage" class:received aria-label={m.zenkatsuSubmitting()}>
				<div class="cutin-rays" aria-hidden="true">
					{#each Array.from({ length: 14 }) as _, i}
						<i style={`--i: ${i}`}></i>
					{/each}
				</div>
				<div class="cutin-cards">
					{#each picked as card, i (key(card))}
						<div
							class="cutin"
							style={`--i: ${i}; --turn: ${i - (picked.length - 1) / 2}; --lift: ${Math.abs(
								i - (picked.length - 1) / 2,
							)}`}
							onanimationstart={(event) => {
								if (event.animationName.includes('card-toss')) vibrate(25);
							}}
							onanimationend={(event) => {
								if (!event.animationName.includes('card-toss')) return;
								if (i !== picked.length - 1) return;
								// 受け取った顔を見せてから総評へ。すぐ切り替えると渡した実感が残らない。
								received = true;
								vibrate([20, 40, 30]);
								receiveTimer = setTimeout(() => (animationDone = true), 750);
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
				<div class="cutin-bot">
					<img
						src={received ? '/bot_assist_petted.png' : '/bot_assist_sitting.png'}
						alt="botたん"
						width="264"
						height="350"
					/>
				</div>
				<p class="cutin-status" role="status">
					{received ? m.zenkatsuSubmitReceived() : m.zenkatsuSubmitting()}
				</p>
			</section>
		{:else}
			<section class="finale" class:review-ready={reviewVisible}>
				{#if reviewVisible}
					<div class="review-sparks" aria-hidden="true">
						{#each Array.from({ length: 18 }) as _, i}
							<i
								style={`--x: ${5 + ((i * 37) % 90)}%; --delay: ${(i % 6) * 90}ms; --drift: ${(i % 2 ? 1 : -1) * (15 + i * 3)}px`}
								>✦</i
							>
						{/each}
					</div>
				{/if}
				<!-- 出した札 → BONUS → 総評。3つとも同じ幅の柱に乗せて、縦に1本通す。 -->
				<section class="result-block" aria-label={m.zenkatsuSelectedCards()}>
					<p class="block-label">{m.zenkatsuSelectedCards()}</p>
					<div class="review-cards" style={`--played: ${picked.length}`}>
						{#each picked as card (key(card))}<div>
								<AffirmationCard
									{card}
									revealUnowned
									attributeGlow={card.attribute === theme.attribute}
								/>
							</div>{/each}
					</div>
				</section>
				{#if outcome}
					<ZenkatsuBonus
						{outcome}
						replay={!initialSubmission}
						oncomplete={() => (bonusDone = true)}
					/>
				{/if}
				<div class="bot-review" class:thinking={!reviewVisible && waiting}>
					<img src="/bot_assist_sitting.png" alt="botたん" width="264" height="350" />
					<div class="speech" aria-live="polite">
						<h2>{m.zenkatsuBotReview()}</h2>
						<p class:comment-arrived={reviewVisible}>
							{reviewVisible
								? comment
								: waiting || !!comment
									? m.zenkatsuCommentPending()
									: m.zenkatsuReviewLater()}
						</p>
						{#if !reviewVisible && (waiting || !!comment)}
							<div class="thinking-dots" aria-hidden="true"><i></i><i></i><i></i></div>
						{/if}
						{#if !waiting && !comment}<button class="game-ghost" onclick={() => retry++}
								>{m.zenkatsuRetryReview()}</button
							>{/if}
					</div>
				</div>
				<footer class="finale-actions">
					<button class="game-primary" onclick={close}>{m.zenkatsuFinish()}</button>
				</footer>
			</section>
		{/if}
	</div>
	{#if showGuide}
		<ZenkatsuHelp id="zenkatsu-play-guide" {maxCards} onclose={() => (showGuide = false)} />
	{/if}
</dialog>

<style>
	.play-progress {
		display: flex;
		align-items: center;
		gap: clamp(8px, 2vw, 12px);
		width: min(100%, 460px);
		margin: 12px auto 0;
		padding-inline: 4px;
		overflow: hidden;
	}
	.play-progress span {
		display: flex;
		align-items: center;
		gap: 7px;
		min-width: 0;
		color: var(--text-faint);
		font-size: clamp(0.62rem, 2.2vw, 0.68rem);
		font-weight: 700;
		letter-spacing: 0.08em;
		white-space: nowrap;
	}
	.play-progress b {
		font-size: 0.62rem;
		opacity: 0.55;
	}
	.play-progress .active {
		color: var(--accent-strong);
	}
	.play-progress i {
		height: 1px;
		flex: 1;
		background: var(--line);
	}
	.playing .theme {
		margin-block: 1rem 0.5rem;
	}
	.playing h1 {
		font-size: clamp(1rem, 2vw, 1.3rem);
	}
	.playing .theme-question,
	.playing .recommended-attribute {
		display: none;
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
		/*
		 * 寸法のものさし。パネル幅・角丸・縦の間は**この4つだけ**を使う。
		 * 場当たりの 10px / 14px / 20px / 24px が混ざると、揃っていないことが先に目に入る。
		 */
		--zk-col: min(100%, 760px);
		--zk-r-panel: 18px;
		--zk-r-card: 12px;
		--zk-gap: clamp(0.9rem, 2.5vw, 1.4rem);
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
	/* プログラムから当てる焦点。輪郭は出さない（キーボード移動は中の要素が受け持つ）。 */
	.game-shell:focus {
		outline: none;
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
		outline-offset: 2px;
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
	.game-ghost.icon {
		width: 44px;
		padding: 0;
		font-size: 1.4rem;
		line-height: 1;
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
		margin: 1.2rem auto 1.5rem;
		max-width: 900px;
	}
	/* 「そんなとき？」はお題の続き。色を変えず、行を変えるだけで地続きに読ませる。 */
	.theme-question {
		display: block;
		margin-top: 0.35rem;
	}
	.recommended-attribute {
		display: inline-block;
		margin-top: 0.7rem;
		padding: 5px 14px;
		border: 1px solid color-mix(in srgb, var(--accent-strong) 40%, transparent);
		border-radius: 999px;
		background: color-mix(in srgb, var(--accent-strong) 10%, transparent);
		color: var(--accent-strong);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.04em;
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
		width: min(100%, 620px);
		min-width: 0;
	}
	.section-heading {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		margin-bottom: 0.75rem;
	}
	.section-heading span {
		margin-left: auto;
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
		border-radius: var(--zk-r-card);
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
		border-radius: var(--zk-r-card);
		background: none;
		text-align: start;
	}
	.selected-card {
		animation: select-card 0.48s cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.remove {
		position: absolute;
		top: -9px;
		right: -9px;
		width: 30px;
		height: 30px;
		border: 1px solid color-mix(in srgb, var(--accent-strong) 45%, var(--line));
		border-radius: 999px;
		background: color-mix(in srgb, var(--bg) 88%, transparent);
		backdrop-filter: blur(6px);
		color: var(--text);
		line-height: 1;
	}
	.hand-area {
		width: min(100%, 1120px);
		margin: 1.8rem auto 0;
		padding-top: 1rem;
		/* 最終行がスティッキーなフッターの下に潜らないよう、footer のぶんを空けておく。 */
		padding-bottom: 5.5rem;
		border-top: 1px solid var(--line);
	}
	.hand {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
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
		box-shadow:
			0 0 0 2px var(--accent-strong),
			0 0 22px color-mix(in srgb, var(--accent-strong) 35%, transparent);
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
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: clamp(0.5rem, 2vw, 1rem);
		text-align: center;
		overflow: hidden;
		min-height: 60dvh;
	}
	/* 光は中心へ集める。botたんの手もとが渡し先だと分かる位置に置く。 */
	.cutin-stage::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -2;
		background: radial-gradient(
			circle at 50% 62%,
			color-mix(in srgb, var(--accent-strong) 22%, transparent),
			transparent 58%
		);
	}
	.cutin-cards {
		display: flex;
		justify-content: center;
		padding-bottom: 0.5rem;
	}
	.cutin {
		/* 狭い画面でも札は読める大きさを保つ。渡しているものが見えないと演出が成立しない。 */
		width: clamp(108px, 26vw, 170px);
		position: relative;
		/* 扇に開く。--turn は中央を0とした左右の位置。 */
		margin-inline: clamp(-18px, -1.2vw, -6px);
		animation: card-toss 0.9s cubic-bezier(0.18, 0.9, 0.24, 1) both;
		animation-delay: calc(var(--i) * 0.22s);
	}
	.cutin-card {
		position: relative;
	}
	.cutin-bot {
		position: relative;
		line-height: 0;
	}
	.cutin-bot img {
		width: clamp(139px, 23.2vw, 220px);
		height: auto;
		animation: bot-wait 1.6s ease-in-out infinite;
	}
	.received .cutin-bot img {
		animation: bot-catch 0.6s cubic-bezier(0.2, 1.4, 0.4, 1) both;
	}
	.cutin-status {
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--text-faint);
	}
	.received .cutin-status {
		color: var(--accent-strong);
	}
	/*
	 * 結果は「出した札 → BONUS → 総評」を**同じ幅の柱**に積む。
	 * 中央揃え（justify-content: center）は使わない。縦に伸びたとき上が切れる。
	 */
	.finale {
		position: relative;
		isolation: isolate;
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--zk-gap);
		padding: 0.5rem 0 0;
	}
	.result-block,
	.bot-review {
		width: var(--zk-col);
	}
	.result-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.7rem;
	}
	.block-label {
		color: var(--accent-strong);
		font-size: 0.68rem;
		font-weight: 800;
		letter-spacing: 0.22em;
	}
	.review-cards {
		display: grid;
		grid-template-columns: repeat(var(--played), minmax(0, 180px));
		justify-content: center;
		gap: clamp(0.6rem, 2vw, 1.2rem);
	}
	/* 吹き出しは BONUS と同じ枠。botたんはその左上の縁に腰かける。 */
	.bot-review {
		--bot: clamp(83px, 14.2vw, 129px);
		position: relative;
		/* 挿絵は枠の上辺に腰かける。またぐのは足元だけにして、見出しに被せない。 */
		padding-top: calc(var(--bot) * 0.86);
	}
	/* 高さで効かせる。上に空ける量（padding-top）と同じ物差しでないと、被りがずれる。 */
	.bot-review img {
		position: absolute;
		top: 0;
		left: clamp(12px, 3vw, 28px);
		width: auto;
		height: var(--bot);
		object-fit: contain;
		z-index: 1;
	}
	.speech {
		position: relative;
		min-width: 0;
		border: 1px solid var(--line);
		background: var(--zenkatsu-game-elevated);
		border-radius: var(--zk-r-panel);
		padding: clamp(1rem, 3vw, 1.6rem);
		box-shadow: 0 10px 40px rgb(0 0 0 / 0.25);
	}
	/* 吹き出しの尻尾。挿絵の真下に向ける。 */
	.speech::before {
		content: '';
		position: absolute;
		left: clamp(30px, 5.5vw, 56px);
		bottom: calc(100% - 1px);
		border: 9px solid transparent;
		border-bottom-color: var(--zenkatsu-game-elevated);
	}
	.speech h2 {
		color: var(--accent-strong);
		margin-bottom: 0.6rem;
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.16em;
	}
	.speech p {
		font-size: clamp(0.95rem, 1.2vw, 1.05rem);
		line-height: 1.85;
		white-space: pre-line;
		overflow-wrap: anywhere;
	}
	.speech button {
		margin-top: 1rem;
	}
	/* 選択段と同じ終わり方にする。画面の下端がどちらも1本のバーで閉じる。 */
	.finale-actions {
		position: sticky;
		bottom: 0;
		width: 100%;
		display: flex;
		justify-content: center;
		margin-top: auto;
		padding: 1rem 0 max(0.5rem, env(safe-area-inset-bottom));
		background: color-mix(in srgb, var(--bg) 94%, transparent);
		border-top: 1px solid var(--line);
		backdrop-filter: blur(12px);
		z-index: 2;
	}
	.finale-actions .game-primary {
		width: min(100%, 320px);
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
	@keyframes card-toss {
		from {
			opacity: 0;
			transform: translateY(55vh) scale(0.82) rotate(0deg);
		}
		60% {
			opacity: 1;
			transform: translateY(calc(-14px + var(--lift) * 6px)) scale(1.03)
				rotate(calc(var(--turn) * 9deg));
		}
		to {
			opacity: 1;
			transform: translateY(calc(var(--lift) * 12px)) rotate(calc(var(--turn) * 9deg));
		}
	}
	@keyframes bot-wait {
		50% {
			transform: translateY(-5px);
		}
	}
	@keyframes bot-catch {
		0% {
			transform: translateY(6px) scale(0.94);
		}
		55% {
			transform: translateY(-14px) scale(1.06);
		}
		100% {
			transform: none;
		}
	}
	@media (max-width: 1000px) {
		.selection-area {
			flex-direction: column;
			gap: 1rem;
		}
		.selection {
			max-width: 680px;
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
			grid-template-columns: repeat(var(--slots), minmax(0, 1fr));
			gap: 1rem;
			overflow-x: auto;
			scroll-snap-type: x proximity;
			padding: 12px 4px 18px;
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
		.speech {
			padding: 1rem;
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
	/* 集中線は中心から放射させる。横に流すと、画面の外へ持っていかれる向きに見える。 */
	.cutin-rays {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		z-index: -1;
		pointer-events: none;
		animation: rays-turn 18s linear infinite;
	}
	.cutin-rays i {
		position: absolute;
		width: 2px;
		height: 140vmax;
		background: linear-gradient(
			to top,
			transparent 33%,
			color-mix(in srgb, var(--accent-strong) 45%, transparent) 50%,
			transparent 67%
		);
		transform: rotate(calc(var(--i) * 25.7deg));
		animation: ray-open 0.7s ease-out both;
		animation-delay: calc(var(--i) * 28ms);
	}
	.cutin-card::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--zk-r-card);
		pointer-events: none;
		background: linear-gradient(
			115deg,
			transparent 35%,
			color-mix(in srgb, var(--accent-strong) 50%, transparent) 50%,
			transparent 65%
		);
		background-size: 300% 100%;
		animation: card-shine 0.7s ease-out both;
		animation-delay: calc(0.45s + var(--i) * 0.22s);
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
	@keyframes ray-open {
		from {
			opacity: 0;
			transform: rotate(calc(var(--i) * 25.7deg)) scaleY(0.15);
		}
		to {
			opacity: 0.5;
			transform: rotate(calc(var(--i) * 25.7deg)) scaleY(1);
		}
	}
	@keyframes rays-turn {
		to {
			transform: rotate(360deg);
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
		.cutin-rays,
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
