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
	}: { tailwindCount?: number; combos?: ZenkatsuSubmissionCombo[] } = $props();
	const ja = $derived(i18n.locale === 'ja');
</script>

{#if tailwindCount > 0 || combos.length}
	<p class="zk-marks">
		{#if tailwindCount > 0}
			<span class="zk-mark zk-wind">{m.zenkatsuTailwindBadge({ n: tailwindCount })}</span>
		{/if}
		{#each combos as combo (combo.volume + ':' + combo.id)}
			<span class="zk-mark zk-combo" title={ja ? combo.descJa : combo.descEn}
				>✦ {ja ? combo.nameJa : combo.nameEn}</span
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
</style>
