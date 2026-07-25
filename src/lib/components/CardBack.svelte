<script lang="ts">
	/**
	 * 全肯定カードの裏面。親の箱いっぱいに広がるので、大きさと角丸は親が決める
	 * （border-radius: inherit）。FAB と、引いた瞬間のフリップ演出の両方がこれを使う。
	 * 「押す前に見えているもの」と「めくれるもの」が同じ絵であることに意味があるので、
	 * 片方だけ変えないこと。
	 */
	let {
		/** botたんの大きさ。親の幅に対する割合で指定する。 */
		mark = '46%',
		/** 内枠。小さく描くときは線が団子になるので落とす。 */
		frame = true,
	}: { mark?: string; frame?: boolean } = $props();
</script>

<span class="card-back" style="--card-back-mark: {mark}" aria-hidden="true">
	{#if frame}<span class="card-back-frame"></span>{/if}
	<span class="card-back-mark"></span>
</span>

<style>
	.card-back {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		border-radius: inherit;
		/* 小さく描くときは親が --card-back-border を細くする。 */
		border: var(--card-back-border, 2px) solid var(--accent-border);
		background: var(--brand-gradient);
		overflow: hidden;
	}
	/* トレカの裏面によくある内枠。これがあるだけで「?」より格段にカードに見える。 */
	.card-back-frame {
		position: absolute;
		inset: 0;
		/* inset の % は上下が高さ基準・左右が幅基準で不揃いになる。margin の % は
		   すべて幅基準なので、縦長のカードでも枠の余白が四辺で揃う。 */
		margin: 6%;
		border: 1px solid color-mix(in srgb, var(--text-on-accent) 40%, transparent);
		border-radius: 4px;
	}
	/* botたんは線画 PNG なので、透過をマスクにして裏面の地色に馴染む一色で塗る。 */
	.card-back-mark {
		inline-size: var(--card-back-mark);
		aspect-ratio: 381 / 464;
		background-color: var(--text-on-accent);
		-webkit-mask: url('/bot_icon_trans.png') center / contain no-repeat;
		mask: url('/bot_icon_trans.png') center / contain no-repeat;
	}
</style>
