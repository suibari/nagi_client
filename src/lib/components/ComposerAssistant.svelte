<script lang="ts">
	import { portal } from '$lib/actions/portal';
	import { generatePostAssist } from '$lib/api/appview';
	import { dayKey, i18n, m } from '$lib/i18n/i18n.svelte';
	import { onDestroy } from 'svelte';
	import Icon from './shell/Icon.svelte';

	/**
	 * ポストおたすけ。書き進めているときは具体的な良さを肯定し、未入力・削除時は本人の日記・
	 * 過去の投稿を材料に LLM でひとこと声をかける（生成は AppView の generatePostAssist）。
	 * ×で閉じたらモーダルを閉じるまで出さない。
	 *
	 * ポストモーダルの backdrop は外側クリックで閉じるので、吹き出しは body 直下へ portal し、
	 * 吹き出し以外はクリックを素通しする。reservedHeight はモーダル側で下端の余白に使う。
	 */
	let {
		open,
		text,
		mode = 'affirm',
		paused = false,
		reservedHeight = $bindable(0),
	}: {
		open: boolean;
		text: string;
		mode?: 'affirm' | 'question';
		paused?: boolean;
		reservedHeight?: number;
	} = $props();

	/**
	 * 手が止まってから声をかけるまで。書き出しに迷っている未入力は早めに、
	 * 文の途中で考えている入力途中は遮らないよう少し待つ。
	 */
	const IDLE_EMPTY_MS = 3000;
	const IDLE_TYPING_MS = 4000;
	/** 生成が速すぎても「…」が一瞬だけ点滅しないよう、最低限見せる時間。 */
	const MIN_THINKING_MS = 400;
	/** 生成できなかったとき、吹き出しを消すまでのフェード時間（CSS と揃える）。 */
	const FADE_OUT_MS = 180;
	/** なでたリアクションを見せてから、待機姿へ戻るまで。 */
	const PET_REACTION_MS = 1400;
	/** 繰り返さないよう AppView へ渡す、直近に言ったことの件数（lexicon の上限）。 */
	const MAX_PREVIOUS = 5;

	let message = $state('');
	let messageVersion = $state(0);
	let thinking = $state(false);
	let fading = $state(false);
	let dismissed = $state(false);
	let keyboardInset = $state(0);
	let height = $state(0);
	let canPet = $state(false);
	let petted = $state(false);
	let petResetTimer: ReturnType<typeof setTimeout> | undefined;
	let wasOpen = false;
	let lastText: string | undefined;
	let lastMode: 'affirm' | 'question' | undefined;
	let previous: string[] = [];

	const visible = $derived(open && !paused && !dismissed && (thinking || Boolean(message)));

	// 閉じたら×も含めて忘れ、次に開いたときにまた手伝えるようにする。
	$effect(() => {
		if (open === wasOpen) return;
		wasOpen = open;
		message = '';
		thinking = false;
		fading = false;
		dismissed = false;
		lastText = undefined;
		lastMode = undefined;
		previous = [];
		petted = false;
		if (petResetTimer) clearTimeout(petResetTimer);
	});

	// 画面幅ではなく入力機器で判定し、マウスで操作するPCにだけなでる操作を出す。
	$effect(() => {
		const query = window.matchMedia('(hover: hover) and (pointer: fine)');
		const update = () => (canPet = query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});

	// 初回クリック時にもすぐ切り替わるよう、表示中のPCでリアクション画像を先読みする。
	$effect(() => {
		if (!visible || !canPet) return;
		const image = new Image();
		image.src = '/bot_assist_petted.png';
	});

	function petBot() {
		if (!canPet) return;
		petted = true;
		if (petResetTimer) clearTimeout(petResetTimer);
		petResetTimer = setTimeout(() => (petted = false), PET_REACTION_MS);
	}

	onDestroy(() => {
		if (petResetTimer) clearTimeout(petResetTimer);
	});

	// 書き進めた・閉じた・×を押したら、待っている古い書きかけへの問い合わせは捨てる。
	$effect(() => {
		const current = text;
		const currentMode = current.trim() ? mode : 'question';
		if (!open || paused || dismissed || (current === lastText && currentMode === lastMode)) return;
		let request: AbortController | undefined;
		const timer = setTimeout(
			() => {
				request = new AbortController();
				void ask(current, currentMode, request.signal);
			},
			current.trim() ? IDLE_TYPING_MS : IDLE_EMPTY_MS,
		);
		return () => {
			clearTimeout(timer);
			// 考え中のまま捨てたら、前のセリフ（無ければ吹き出しごと）に戻す。
			if (request && !request.signal.aborted) {
				request.abort();
				thinking = false;
				fading = false;
			}
		};
	});

	const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

	async function ask(current: string, currentMode: 'affirm' | 'question', signal: AbortSignal) {
		// 失敗しても同じ書きかけでは聞き直さない。書き進めればまた声をかける。
		lastText = current;
		lastMode = currentMode;
		fading = false;
		thinking = true;
		const startedAt = Date.now();
		let result: { message: string } | undefined;
		try {
			result = await generatePostAssist(
				{
					text: current,
					mode: currentMode,
					lang: i18n.locale,
					today: dayKey(new Date().toISOString())!,
					previous,
				},
				signal,
			);
		} catch {
			// 生成できないとき（混雑・権限の反映待ちなど）は、書く邪魔をしないよう黙って消える。
		}
		await wait(Math.max(0, MIN_THINKING_MS - (Date.now() - startedAt)));
		if (signal.aborted) return;
		if (result) {
			previous = [...previous, result.message].slice(-MAX_PREVIOUS);
			message = result.message;
			messageVersion += 1;
			thinking = false;
			return;
		}
		fading = true;
		await wait(FADE_OUT_MS);
		if (signal.aborted || !fading) return;
		message = '';
		thinking = false;
		fading = false;
	}

	// ソフトウェアキーボードが出ている間は、その上端へ寄せる。
	$effect(() => {
		const viewport = window.visualViewport;
		if (!visible || !viewport) {
			keyboardInset = 0;
			return;
		}
		const update = () =>
			(keyboardInset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop));
		update();
		viewport.addEventListener('resize', update);
		viewport.addEventListener('scroll', update);
		return () => {
			viewport.removeEventListener('resize', update);
			viewport.removeEventListener('scroll', update);
		};
	});

	$effect(() => {
		reservedHeight = visible ? height : 0;
	});
</script>

{#if visible}
	<div
		class="composer-assist"
		class:fading
		use:portal
		style:--composer-assist-keyboard={`${keyboardInset}px`}
		bind:offsetHeight={height}
	>
		<div class="composer-assist-inner">
			<button
				type="button"
				class="composer-assist-character-button"
				aria-label={m.assistPet()}
				title={m.assistPet()}
				disabled={!canPet}
				onmousedown={(event) => event.preventDefault()}
				onclick={petBot}
			>
				<img
					class="composer-assist-character"
					class:petted
					src={petted ? '/bot_assist_petted.png' : '/bot_assist_sitting.png'}
					alt=""
					width={petted ? 384 : 228}
					height={petted ? 384 : 320}
					draggable="false"
				/>
			</button>
			<div class="composer-assist-bubble" role="status" aria-live="polite">
				<div class="composer-assist-head">
					<span>{m.assistLabel()}</span>
					<!-- 押しても本文の入力欄からフォーカスを奪わない（モバイルでキーボードが閉じないように）。 -->
					<button
						type="button"
						class="icon-action composer-assist-close"
						aria-label={m.assistClose()}
						title={m.assistClose()}
						onmousedown={(event) => event.preventDefault()}
						onclick={() => (dismissed = true)}><Icon name="close" size={14} /></button
					>
				</div>
				{#if thinking}
					<!-- 先に吹き出しを出し、生成を待つ間は「…」で考え中を見せる。 -->
					<div class="composer-assist-body composer-assist-thinking">
						<span class="visually-hidden">{m.assistThinking()}</span>
						<span class="composer-assist-dot" aria-hidden="true"></span>
						<span class="composer-assist-dot" aria-hidden="true"></span>
						<span class="composer-assist-dot" aria-hidden="true"></span>
					</div>
				{:else}
					{#key messageVersion}
						<p class="composer-assist-body composer-assist-message">{message}</p>
					{/key}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.composer-assist {
		position: fixed;
		right: 0;
		bottom: calc(max(var(--composer-assist-keyboard, 0px), env(safe-area-inset-bottom)) + 12px);
		left: 0;
		z-index: 115;
		display: flex;
		justify-content: center;
		padding: 0 16px;
		pointer-events: none;
	}
	.composer-assist-inner {
		display: flex;
		align-items: flex-end;
		gap: 2px;
		width: min(100%, 620px);
	}
	.composer-assist-character-button {
		flex: none;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		width: 72px;
		height: 101px;
		padding: 0;
		border: 0;
		background: transparent;
		pointer-events: auto;
		cursor: pointer;
	}
	.composer-assist-character-button:disabled {
		pointer-events: none;
	}
	.composer-assist-character {
		flex: none;
		width: 72px;
		height: auto;
		filter: drop-shadow(0 4px 6px rgb(0 0 0 / 0.18));
		transform-origin: 50% 90%;
		animation: composer-assist-float 3.6s ease-in-out infinite;
		user-select: none;
	}
	.composer-assist-character.petted {
		width: 88px;
		max-width: none;
		animation: composer-assist-petted 420ms cubic-bezier(0.2, 0.9, 0.3, 1.25);
	}
	.composer-assist-bubble {
		position: relative;
		flex: 1;
		min-width: 0;
		margin-bottom: 20px;
		padding: 6px 8px 10px 14px;
		border: 1px solid var(--accent-border);
		border-radius: var(--r-md);
		background: var(--surface-1);
		box-shadow: var(--shadow-pop);
		pointer-events: auto;
		animation: composer-assist-pop 220ms ease-out;
	}
	/* キャラクター側へ向けたしっぽ */
	.composer-assist-bubble::before {
		position: absolute;
		bottom: 18px;
		left: -7px;
		width: 12px;
		height: 12px;
		border-bottom: 1px solid var(--accent-border);
		border-left: 1px solid var(--accent-border);
		background: var(--surface-1);
		content: '';
		transform: rotate(45deg);
	}
	.composer-assist-head {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--accent-strong);
		font-size: 11px;
		font-weight: 700;
	}
	.composer-assist-close {
		width: 26px;
		height: 26px;
		margin-inline-start: auto;
	}
	/* 考え中とセリフで高さが跳ねないよう、2行分を確保して縦中央に置く。 */
	.composer-assist-body {
		display: flex;
		align-items: center;
		min-height: calc(13px * 1.6 * 2);
		margin: 0;
		font-size: 13px;
		line-height: 1.6;
	}
	.composer-assist-message {
		padding-inline-end: 6px;
		color: var(--text);
		overflow-wrap: anywhere;
		animation: composer-assist-pop 220ms ease-out;
	}
	.composer-assist-thinking {
		gap: 5px;
		padding-inline-start: 2px;
	}
	.composer-assist-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent-strong);
		opacity: 0.35;
		animation: composer-assist-dot 1.1s ease-in-out infinite;
	}
	/* 1つ目の子はスクリーンリーダー用の文言なので、点は2〜4番目。 */
	.composer-assist-dot:nth-child(3) {
		animation-delay: 0.15s;
	}
	.composer-assist-dot:nth-child(4) {
		animation-delay: 0.3s;
	}
	.composer-assist {
		transition: opacity 180ms ease-out;
	}
	.composer-assist.fading {
		opacity: 0;
	}
	@keyframes composer-assist-dot {
		0%,
		80%,
		100% {
			transform: translateY(0);
			opacity: 0.35;
		}
		40% {
			transform: translateY(-4px);
			opacity: 1;
		}
	}
	@keyframes composer-assist-float {
		0%,
		100% {
			transform: translateY(0) rotate(-2deg);
		}
		50% {
			transform: translateY(-6px) rotate(2deg);
		}
	}
	@keyframes composer-assist-petted {
		0% {
			opacity: 0.35;
			transform: translateY(5px) scale(0.88);
		}
		55% {
			transform: translateY(-5px) scale(1.06);
		}
		100% {
			opacity: 1;
			transform: none;
		}
	}
	@keyframes composer-assist-pop {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@media (max-width: 767px) {
		.composer-assist {
			bottom: calc(max(var(--composer-assist-keyboard, 0px), env(safe-area-inset-bottom)) + 8px);
			padding: 0 8px;
		}
		.composer-assist-character-button,
		.composer-assist-bubble::before {
			display: none;
		}
		.composer-assist-bubble {
			margin-bottom: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.composer-assist-character-button,
		.composer-assist-character,
		.composer-assist-bubble,
		.composer-assist-message,
		.composer-assist-dot {
			animation: none;
		}
		.composer-assist-dot {
			opacity: 0.6;
		}
		.composer-assist {
			transition: none;
		}
	}
</style>
