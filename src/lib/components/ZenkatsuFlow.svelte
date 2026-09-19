<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';

	/**
	 * ゲームの流れを一行で。「えらぶ → BONUS → 総評」。
	 *
	 * 語はプレイ画面の進行バーと共有している。盤面とあそびかたで先に覚えた言葉が、
	 * そのままプレイ中の見出しとして出てくる。
	 */
	let { size = 'md' }: { size?: 'sm' | 'md' } = $props();
</script>

<ol class="zk-flow" class:sm={size === 'sm'}>
	<li><b>01</b> {m.zenkatsuStepSelect()}</li>
	<li><b>02</b> {m.zenkatsuStepBonus()}</li>
	<li><b>03</b> {m.zenkatsuStepReview()}</li>
</ol>

<style>
	.zk-flow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.04em;
	}
	.sm {
		font-size: 0.8rem;
	}
	li {
		display: flex;
		align-items: baseline;
		gap: 0.35rem;
		white-space: nowrap;
	}
	/* 矢印は区切り。読み上げには要らない。 */
	li + li::before {
		content: '→';
		margin-inline-end: 0.15rem;
		color: var(--text-faint);
		font-weight: 400;
	}
	b {
		color: var(--accent-strong);
		font-size: 0.7rem;
		letter-spacing: 0.1em;
	}
</style>
