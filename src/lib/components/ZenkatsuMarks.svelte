<script lang="ts">
	import type { ZenkatsuSubmissionCombo } from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';

	/**
	 * 記録に添える「何が起きたか」。ニュースタブと、ゼンカツの今日の記録で共用する。
	 *
	 * **得点は出さない。** 出すのは追い風の枚数と、成立したコンボの名前だけ。
	 * コンボを公開するのは、4060通りを自力で総当たりするのが現実的でないから。
	 * 誰かが出したものが見えることで、攻略がコミュニティに伝わる。
	 */
	let {
		tailwindCount = 0,
		combos = [],
		pioneerCombos = [],
	}: {
		tailwindCount?: number;
		combos?: ZenkatsuSubmissionCombo[];
		/** combos のうち、その回が世界初だったぶん。ニュースからだけ渡る。 */
		pioneerCombos?: ZenkatsuSubmissionCombo[];
	} = $props();
	const ja = $derived(i18n.locale === 'ja');
	const keyOf = (combo: ZenkatsuSubmissionCombo) => combo.volume + ':' + combo.id;
	const pioneerKeys = $derived(new Set(pioneerCombos.map(keyOf)));
</script>

{#if tailwindCount > 0 || combos.length}
	<p class="zk-marks">
		{#if tailwindCount > 0}
			<span class="zk-mark zk-wind">{m.zenkatsuTailwindBadge({ n: tailwindCount })}</span>
		{/if}
		{#each combos as combo (keyOf(combo))}
			<span
				class="zk-mark zk-combo"
				class:zk-pioneer={pioneerKeys.has(keyOf(combo))}
				title={ja ? combo.descJa : combo.descEn}
				>✦ {ja ? combo.nameJa : combo.nameEn}{#if pioneerKeys.has(keyOf(combo))}<span
						class="zk-pioneer-note">{m.deckComboPioneer()}</span
					>{/if}</span
			>
		{/each}
	</p>
{/if}

<style>
	.zk-marks {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		margin-block: 0.4rem;
	}
	/*
	 * クラス名に接頭辞を付けているのは、`.mark` が base.css の**36x36アイコン用**
	 * グローバルクラスだから。素の `.mark` を使うと固定サイズと背景を持っていかれ、
	 * scoped スタイルでは打ち消せずにピルが正方形に潰れる。
	 */
	.zk-mark {
		/* flex アイテムは既定で縮む。CJK は min-content が1文字なので、これが無いと縦に潰れる。 */
		flex: 0 0 auto;
		white-space: nowrap;
		padding: 2px 9px;
		border-radius: 999px;
		font-size: 0.72rem;
		font-weight: 700;
	}
	.zk-wind {
		background: var(--accent-soft);
		color: var(--accent-strong);
	}
	/* コンボは追い風より目立たせる。見つけたこと自体が出来事なので。 */
	.zk-combo {
		background: var(--badge-title-bg, var(--accent-soft));
		color: var(--badge-title-fg, var(--accent-strong));
	}
	/* 世界初はニュースの見出しでも言うので、ピル側は縁取りだけにして重ねすぎない。 */
	.zk-pioneer {
		box-shadow: 0 0 0 1px var(--accent-strong);
	}
	.zk-pioneer-note {
		margin-inline-start: 0.3rem;
		font-size: 0.66rem;
		opacity: 0.85;
	}
</style>
