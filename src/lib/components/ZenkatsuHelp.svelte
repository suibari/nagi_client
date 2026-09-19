<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import ZenkatsuFlow from './ZenkatsuFlow.svelte';

	let { id, maxCards, onclose }: { id: string; maxCards: number; onclose: () => void } = $props();
	let dialog: HTMLDialogElement;
	let body: HTMLDivElement;
	onMount(() => {
		const previousFocus = document.activeElement;
		dialog.showModal();
		// 開いた瞬間に「×」が光るのを避ける。読み始めは本文から。
		body?.focus({ preventScroll: true });
		const previous = document.documentElement.style.overflow;
		document.documentElement.style.overflow = 'hidden';
		return () => {
			dialog.close();
			document.documentElement.style.overflow = previous;
			queueMicrotask(() => {
				if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
					previousFocus.focus({ preventScroll: true });
			});
		};
	});
</script>

<dialog
	bind:this={dialog}
	{id}
	class="help"
	aria-labelledby={`${id}-title`}
	oncancel={(event) => {
		event.preventDefault();
		onclose();
	}}
	onclick={(event) => {
		/*
		 * ::backdrop を押すと、target はダイアログ自身になる（中身なら中身の要素）。
		 * アプリの他のモーダルは背景クリックで閉じるので、ネイティブ dialog でも揃える。
		 */
		if (event.target === dialog) onclose();
	}}
>
	<header>
		<h2 id={`${id}-title`}>{m.zenkatsuHowToPlay()}</h2>
		<button class="help-close" aria-label={m.close()} onclick={onclose}>×</button>
	</header>
	<div class="help-body" bind:this={body} tabindex="-1">
		<!--
			まず流れを一行で。章を読まなくても「えらぶ → BONUS → 総評」だけは持ち帰れるようにする。
			語はプレイ画面の進行バーと共有していて、ここで覚えた言葉がそのまま画面に出てくる。
		-->
		<div class="flow">
			<ZenkatsuFlow />
			<p class="flow-summary">{m.zenkatsuGuideSummary({ max: maxCards })}</p>
		</div>
		<section>
			<h3><span class="step-number">01</span>{m.zenkatsuGuideSelectTitle()}</h3>
			<ul>
				<li>{m.zenkatsuGuideSelect1({ max: maxCards })}</li>
				<li>{m.zenkatsuGuideSelect2()}</li>
			</ul>
		</section>
		<section>
			<h3><span class="step-number">02</span>{m.zenkatsuGuideSubmitTitle()}</h3>
			<ul>
				<li>{m.zenkatsuGuideSubmit1()}</li>
				<li>{m.zenkatsuGuideSubmit2()}</li>
			</ul>
		</section>
		<section>
			<h3><span class="step-number">03</span>{m.zenkatsuGuideBonusTitle()}</h3>
			<ul>
				<li>{m.zenkatsuGuideBonus1()}</li>
				<li>{m.zenkatsuGuideBonus2()}</li>
			</ul>
		</section>
		<section>
			<h3><span class="step-number">04</span>{m.zenkatsuGuideReviewTitle()}</h3>
			<ul>
				<li>{m.zenkatsuGuideReview1()}</li>
			</ul>
		</section>
		<section>
			<h3>{m.zenkatsuGuideCooldownTitle()}</h3>
			<ul>
				<li>{m.zenkatsuGuideCooldown1()}</li>
				<li>{m.zenkatsuGuideCooldown2()}</li>
				<li>{m.zenkatsuGuideCooldown3()}</li>
			</ul>
		</section>
	</div>
</dialog>

<style>
	.help {
		width: min(620px, calc(100vw - 32px));
		max-width: none;
		max-height: calc(100dvh - 32px);
		margin: auto;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 20px;
		background: var(--bg-raised);
		color: var(--text);
		overscroll-behavior: contain;
	}
	.help::backdrop {
		background: rgb(0 0 0 / 0.72);
	}
	header {
		position: sticky;
		top: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1.25rem;
		border-bottom: 1px solid var(--line);
		background: var(--bg-raised);
	}
	h2,
	h3 {
		margin: 0;
		font-size: 1rem;
	}
	.help-close {
		width: 44px;
		height: 44px;
		flex-shrink: 0;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--bg);
		color: var(--text);
		font-size: 1.5rem;
	}
	.help-body:focus {
		outline: none;
	}
	.help-close:focus-visible {
		outline: 3px solid var(--accent-strong);
		outline-offset: 2px;
	}
	.help-body {
		padding: 1.25rem;
		font-size: 0.9rem;
		line-height: 1.8;
		overflow-wrap: anywhere;
	}
	.flow {
		border: 1px solid color-mix(in srgb, var(--accent-strong) 28%, var(--line));
		border-radius: var(--r-md);
		background: color-mix(in srgb, var(--accent-strong) 8%, transparent);
		padding: 0.9rem 1rem;
	}
	.flow-summary {
		margin: 0.5rem 0 0;
		color: var(--text-faint);
		font-size: 0.85rem;
		text-align: center;
	}
	section {
		margin-top: 1.4rem;
	}
	h3 {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}
	.step-number {
		color: var(--accent-strong);
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.12em;
	}
	/* base.css が ul の記号を落としているので、ここで戻す（箇条書きに見えないと章が効かない）。 */
	ul {
		margin: 0.35rem 0 0;
		padding-inline-start: 1.25em;
		list-style: disc;
	}
	li {
		margin-top: 0.3rem;
	}
</style>
