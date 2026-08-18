<script lang="ts">
	import type { CardAttribute, CardRarity, CardView } from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';

	let {
		card,
		size = 'grid',
		revealUnowned = false,
	}: {
		card: CardView;
		/** grid = コレクション一覧、full = ドロー演出や詳細で1枚だけ大きく出すとき。 */
		size?: 'grid' | 'full';
		/** ゲストが今引いた1枚など、所持化前でも表面を見せる表示専用フラグ。 */
		revealUnowned?: boolean;
	} = $props();

	/** 属性は絵文字1つで表す（イラスト枠を持たない構成なので、ここが唯一の絵柄）。 */
	const ATTRIBUTE_ICON: Record<CardAttribute, string> = {
		light: '☀',
		dark: '🌑',
		fire: '🔥',
		water: '💧',
		wind: '🌪',
		earth: '🪨',
	};
	/*
	 * カード面のレアリティ表記。ロケールに関わらず英語で統一する（トレカの表記慣習に寄せる）。
	 * 内部の識別子は短縮形（N/R/SR/UR/AAR）のままで、ここは表示専用。
	 */
	const RARITY_LABEL: Record<CardRarity, string> = {
		N: 'Normal',
		R: 'Rare',
		SR: 'Super Rare',
		UR: 'Ultra Rare',
		AAR: 'All-Affirmation Rare',
	};
	const ATTRIBUTE_LABEL: Record<CardAttribute, () => string> = {
		light: m.cardAttributeLight,
		dark: m.cardAttributeDark,
		fire: m.cardAttributeFire,
		water: m.cardAttributeWater,
		wind: m.cardAttributeWind,
		earth: m.cardAttributeEarth,
	};

	const ja = $derived(i18n.locale === 'ja');
	const name = $derived(ja ? card.nameJa : card.nameEn);
	const race = $derived(ja ? card.raceJa : card.raceEn);
	const text = $derived(ja ? card.textJa : card.textEn);
	const attributeLabel = $derived(ATTRIBUTE_LABEL[card.attribute]());
	/*
	 * 図鑑番号。段内の通し番号がそのままコレクションでの配置位置なので、
	 * この番号を見れば「何番目の枠のカードか」が分かる。
	 * レアリティは枠のデザインと配置位置で示すので、カード面には出さない。
	 *
	 * 記念日カードは図鑑の枠を持たず、id には西暦*100+slot が入っていて番号として読めない。
	 * 代わりに「何年ぶんの1枚か」を出す（同じ記念日でも年が違えば別のカード）。
	 */
	const code = $derived(
		card.anniversary
			? String(card.year ?? Math.floor(card.id / 100))
			: `v${card.volume}-${String(card.id).padStart(3, '0')}`,
	);
	// 未所持カードでは背景を出さない。何のカードかを伏せる演出のほうが優先。
	const revealed = $derived(card.owned || revealUnowned);
	const art = $derived(revealed ? card.art : undefined);
</script>

<article
	class="card rarity-{card.rarity.toLowerCase()} attr-{card.attribute} size-{size}"
	class:locked={!revealed}
	class:has-art={!!art}
	aria-label={revealed ? name : m.cardLocked()}
>
	{#if art}
		<!--
			背景は background-image ではなく img で敷く。記念日カードのモーダルは一発勝負の
			演出なので、読み込みを eager に指定できるほうが確実。装飾なので alt は空。
		-->
		<img
			class="card-art"
			src="/card-art/{art}.webp"
			alt=""
			aria-hidden="true"
			loading="eager"
			decoding="async"
		/>
		<div class="card-art-veil" aria-hidden="true"></div>
	{/if}
	{#if revealed}
		<header class="card-head">
			<h3 class="card-name">{name}</h3>
			<span class="card-attr" title={attributeLabel} aria-label={attributeLabel}>
				{ATTRIBUTE_ICON[card.attribute]}
			</span>
		</header>
		<div class="card-meta">
			<span class="card-race">{m.cardRaceBracket({ race })}</span>
			<span class="card-rarity">{RARITY_LABEL[card.rarity]}</span>
		</div>
		<p class="card-text">{text}</p>
		<footer class="card-foot">
			<span class="card-stats">
				<b>ATK</b>/{card.atk} <b>DEF</b>/{card.def}
			</span>
			<span class="card-stamp">{code}</span>
		</footer>
		{#if (card.duplicateCount ?? 1) > 1}
			<span class="card-dupe">×{card.duplicateCount}</span>
		{/if}
	{:else}
		<!-- 未所持。枠と番号は見せて「どこが空いているか」を分からせ、中身は伏せる。 -->
		<div class="card-silhouette">
			<span class="card-qmark" aria-hidden="true">?</span>
			<span class="card-stamp">{code}</span>
		</div>
	{/if}
</article>

<style>
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0.55rem 0.6rem 0.5rem;
		/* 遊戯王リスペクトの縦長。イラスト枠が無いぶんフレーバーに面積を割く。 */
		aspect-ratio: 59 / 86;
		border: 2px solid var(--card-rarity-n);
		border-radius: var(--radius-s);
		background: var(--card-face);
		color: var(--card-ink);
		box-shadow: var(--shadow-card);
		container-type: inline-size;
		overflow: hidden;
	}
	.card.size-full {
		inline-size: min(100%, 300px);
		padding: 0.8rem 0.85rem 0.7rem;
	}

	/*
	 * 背景つきカード。イラスト枠を持たない構成のまま、絵をカード全面に敷いて文字を上に乗せる。
	 *
	 * ここで一番大事なのは「絵が見える面積を確保する」こと。フレーバー欄は元々 flex:1 で
	 * カードの中央から下を丸ごと占有していて、そのままだとキャラの顔が完全に隠れる。
	 * 背景があるときだけ内容ぶんの高さに縮めて下端へ寄せ、中央を絵のために空ける。
	 * 濃さと位置のノブは tokens.css に集約する（絵ごとに最適値が変わるため）。
	 */
	/*
	 * 絵はカードいっぱいに敷く。ずらして置くと必ずどこかに地の色の帯ができるので、
	 * inset は 0 に固定する。絵の中の「どこを見せるか」を寄せたいときは、
	 * カード比（59:86）より縦長の画像を用意して --card-art-position で選ぶ
	 * （cover が溢れたぶんを切るので、この方法なら隙間が出ない）。
	 */
	.card-art {
		position: absolute;
		inset: 0;
		z-index: 0;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		object-position: var(--card-art-position);
	}
	/* 図鑑の升目は文字が小さく、絵をそのまま出すと名前もフレーバーも潰れる。 */
	.card.size-grid .card-art {
		opacity: var(--card-art-grid-opacity);
	}
	.card-art-veil {
		position: absolute;
		inset: 0;
		z-index: 0;
		background: linear-gradient(
			to bottom,
			color-mix(in srgb, var(--card-face) 88%, transparent) 0%,
			color-mix(in srgb, var(--card-face) var(--card-art-veil-min), transparent) 16%,
			color-mix(in srgb, var(--card-face) var(--card-art-veil-min), transparent) 64%,
			color-mix(in srgb, var(--card-face) 86%, transparent) 100%
		);
	}
	/* 背景の上に文字を出す。z-index を持たない子は絵に隠れてしまう。 */
	.card.has-art > :not(.card-art):not(.card-art-veil) {
		position: relative;
		z-index: 1;
	}
	/*
	 * 中央を絵に明け渡す。margin-block-start:auto でフレーバーと ATK/DEF を下端へ寄せ、
	 * flex:1 を外して内容ぶんの高さにする（元の版はここが伸びて絵を全部覆っていた）。
	 */
	.card.has-art .card-text {
		flex: 0 0 auto;
		margin-block-start: auto;
		background: color-mix(in srgb, var(--card-face-band) var(--card-art-band-alpha), transparent);
		backdrop-filter: blur(3px);
	}
	/* 帯の下地を薄くしたぶん、名前と数値は縁取りで背景から浮かせる。 */
	.card.has-art .card-name,
	.card.has-art .card-foot {
		text-shadow: 0 1px 3px var(--card-face);
	}

	.card-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.3rem;
		padding-block-end: 0.3rem;
		border-block-end: 1px solid var(--card-rarity-n);
	}
	.card-name {
		margin: 0;
		font-size: 8cqi;
		line-height: 1.2;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.card-attr {
		font-size: 9cqi;
		line-height: 1;
		color: var(--card-attr-light);
	}
	.card-meta {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.35rem;
		font-size: 6cqi;
		color: var(--card-ink-muted);
	}
	/* 種族名が長いときはこちらを削る（レアリティ表記は省略させない）。 */
	.card-race {
		flex: 0 1 auto;
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 600;
	}
	/*
	 * レアリティ表記。枠のデザインと同じ色にして、文字と枠の対応が一目で付くようにする。
	 * "All-Affirmation Rare" が最長なので、狭い升目では折り返させる（省略はしない）。
	 */
	.card-rarity {
		flex: 0 1 auto;
		font-size: 0.85em;
		font-weight: 700;
		line-height: 1.25;
		letter-spacing: 0.02em;
		text-align: end;
		text-wrap: balance;
		color: var(--card-rarity-n);
	}
	.card-text {
		flex: 1;
		margin: 0;
		padding: 0.45rem 0.5rem;
		border-radius: 4px;
		background: var(--card-face-band);
		font-size: 6.2cqi;
		line-height: 1.5;
		overflow: hidden;
	}
	.card-foot {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.3rem;
		padding-block-start: 0.3rem;
		border-block-start: 1px solid var(--card-rarity-n);
		font-size: 6cqi;
		font-variant-numeric: tabular-nums;
	}
	.card-stats b {
		font-size: 0.85em;
		color: var(--card-ink-muted);
	}
	.card-stamp {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.02em;
		color: var(--card-rarity-n);
	}
	/* 同種を引き直した回数。世界に1枚という建て付けなので枚数ではなく「重ねた回数」。 */
	.card-dupe {
		position: absolute;
		inset-block-start: 0.35rem;
		inset-inline-end: 0.35rem;
		padding: 0.05em 0.4em;
		border-radius: var(--radius-pill);
		background: var(--accent-soft);
		color: var(--accent-strong);
		font-size: 5.5cqi;
		font-weight: 700;
	}

	/* --- 属性ごとのアイコン色 --- */
	.attr-light .card-attr {
		color: var(--card-attr-light);
	}
	.attr-dark .card-attr {
		color: var(--card-attr-dark);
	}
	.attr-fire .card-attr {
		color: var(--card-attr-fire);
	}
	.attr-water .card-attr {
		color: var(--card-attr-water);
	}
	.attr-wind .card-attr {
		color: var(--card-attr-wind);
	}
	.attr-earth .card-attr {
		color: var(--card-attr-earth);
	}

	/* --- レアリティ演出。N は無地、上がるほど枠が主張する --- */
	.rarity-r {
		border-color: var(--card-rarity-r);
	}
	.rarity-r .card-stamp,
	.rarity-r .card-rarity {
		color: var(--card-rarity-r);
	}
	.rarity-r .card-head,
	.rarity-r .card-foot {
		border-color: var(--card-rarity-r);
	}

	.rarity-sr {
		border-color: var(--card-rarity-sr);
		box-shadow:
			0 0 0 1px var(--card-rarity-sr) inset,
			var(--shadow-card);
	}
	.rarity-sr .card-stamp,
	.rarity-sr .card-rarity {
		color: var(--card-rarity-sr);
	}
	.rarity-sr .card-head,
	.rarity-sr .card-foot {
		border-color: var(--card-rarity-sr);
	}

	/*
	 * UR / AAR は箔押し。border-image は角丸に追従しないので、2枚重ねの background で
	 * 枠だけグラデーションにする（padding-box に本体色、border-box に箔）。
	 * container-type がスタッキングコンテキストを作るので、疑似要素を z-index:-1 で
	 * 敷く方法は使えない。
	 */
	.rarity-ur,
	.rarity-aar {
		border-color: transparent;
		background-origin: border-box;
		background-clip: padding-box, border-box;
	}
	.rarity-ur {
		background-image: linear-gradient(var(--card-face), var(--card-face)), var(--card-foil-ur);
		background-size:
			auto,
			300% 300%;
		box-shadow:
			0 0 14px -4px var(--card-rarity-ur),
			var(--shadow-card);
	}
	.rarity-aar {
		background-image: linear-gradient(var(--card-face), var(--card-face)), var(--card-foil-aar);
		background-size:
			auto,
			400% 400%;
		animation: card-foil 6s linear infinite;
		box-shadow:
			0 0 22px -4px var(--card-rarity-aar),
			var(--shadow-pop);
	}
	.rarity-ur .card-stamp,
	.rarity-ur .card-rarity {
		color: var(--card-rarity-ur);
	}
	.rarity-aar .card-stamp,
	.rarity-aar .card-rarity {
		color: var(--card-rarity-aar);
	}
	.rarity-ur .card-head,
	.rarity-ur .card-foot {
		border-color: var(--card-rarity-ur);
	}
	.rarity-aar .card-head,
	.rarity-aar .card-foot {
		border-color: var(--card-rarity-aar);
	}

	@keyframes card-foil {
		0% {
			background-position:
				0 0,
				0% 50%;
		}
		50% {
			background-position:
				0 0,
				100% 50%;
		}
		100% {
			background-position:
				0 0,
				0% 50%;
		}
	}

	/* --- 未所持 --- */
	.card.locked {
		border-style: dashed;
		border-color: var(--card-locked);
		background: var(--bg-inset);
		background-image: none;
		box-shadow: none;
		animation: none;
	}
	.card-silhouette {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
	}
	.card-qmark {
		font-size: 26cqi;
		font-weight: 700;
		line-height: 1;
		color: var(--card-locked);
	}
	.card.locked .card-stamp {
		color: var(--card-locked);
		font-size: 6cqi;
	}

	@media (prefers-reduced-motion: reduce) {
		.rarity-aar {
			animation: none;
		}
	}
</style>
