<script lang="ts">
	import type { CardAttribute, CardRarity, CardView, DrawCardResult } from '$lib/api/types';
	import AffirmationCard from '$lib/components/AffirmationCard.svelte';
	import CardDetailDialog from '$lib/components/CardDetailDialog.svelte';
	import CardDrawFab from '$lib/components/CardDrawFab.svelte';
	import CardMilestoneDialog from '$lib/components/CardMilestoneDialog.svelte';
	import CardReactionGuideDialog from '$lib/components/CardReactionGuideDialog.svelte';

	/*
	 * カードまわりの見た目をまとめて確認するための開発専用ページ（/dev/cards）。
	 * 本番では +page.ts が 404 を投げる。
	 *
	 * その日ぶんを引いてしまうと FAB もドロー演出も二度と見られなくなるので、
	 * サーバーにもセッションにも触らないモックだけでここに並べる。カード定義は
	 * AppView 側の cards_v1.json（別リポジトリ）にあるため、代表ぶんを手書きで持つ。
	 */
	const RARITIES: CardRarity[] = ['N', 'R', 'SR', 'UR', 'AAR'];
	const ATTRIBUTES: CardAttribute[] = ['light', 'dark', 'fire', 'water', 'wind', 'earth'];

	const ATTR_FLAVOR: Record<CardAttribute, { ja: string; en: string }> = {
		light: { ja: 'ひかりの', en: 'Shining ' },
		dark: { ja: 'やみの', en: 'Shadowed ' },
		fire: { ja: 'ほのおの', en: 'Blazing ' },
		water: { ja: 'みずの', en: 'Flowing ' },
		wind: { ja: 'かぜの', en: 'Drifting ' },
		earth: { ja: 'つちの', en: 'Grounded ' },
	};

	function mock(
		rarity: CardRarity,
		attribute: CardAttribute,
		overrides: Partial<CardView> = {},
	): CardView {
		const flavor = ATTR_FLAVOR[attribute];
		return {
			id: RARITIES.indexOf(rarity) * 6 + ATTRIBUTES.indexOf(attribute) + 1,
			volume: 1,
			rarity,
			attribute,
			atk: 1200 + RARITIES.indexOf(rarity) * 400,
			def: 900 + ATTRIBUTES.indexOf(attribute) * 100,
			nameJa: `${flavor.ja}ぜんこうてい${rarity}`,
			nameEn: `${flavor.en}Affirmation ${rarity}`,
			raceJa: 'もふもふ族',
			raceEn: 'Fluffy',
			textJa: 'きみが今日ここにいる、それだけでもう十分すごいことなんだよ。',
			textEn: 'Just being here today is already something worth celebrating.',
			owned: true,
			instanceId: `mock-${rarity}-${attribute}`,
			acquiredAt: new Date().toISOString(),
			...overrides,
		};
	}

	const showcase = RARITIES.flatMap((rarity) => ATTRIBUTES.map((attr) => mock(rarity, attr)));

	// --- FAB ---------------------------------------------------------------
	let fabDrawing = $state(false);
	let fabError = $state('');
	let fabShifted = $state(false);
	let fabFixed = $state(false);

	// --- CardDetailDialog --------------------------------------------------
	type DialogCase = 'new-sr' | 'new-ur' | 'new-aar' | 'again' | 'already' | 'pending' | 'review';
	let dialogCase = $state<DialogCase | undefined>();
	let milestone = $state<number | undefined>();
	let guideOpen = $state(false);
	// 演出をやり直すための再マウント用キー。
	let replay = $state(0);

	const DIALOG_CASES: Array<{ id: DialogCase; label: string; note: string }> = [
		{ id: 'new-sr', label: '新規（SR）', note: 'NEW CARD＋少量コンフェッティ' },
		{ id: 'new-ur', label: '新規（UR）', note: 'NEW CARD＋中量コンフェッティ' },
		{ id: 'new-aar', label: '新規（AAR）', note: 'NEW CARD＋最大量コンフェッティ' },
		{ id: 'again', label: '重複（R ×3）', note: 'isNew=false: 「また会えたね」＋×3 バッジ' },
		{ id: 'already', label: '本日引き済み（SR）', note: 'alreadyDrawn: 別タブが先に引いた場合' },
		{ id: 'pending', label: 'コメント生成中（AAR）', note: 'コメント未着。getCards を叩きに行く' },
		{ id: 'review', label: '見返し（N）', note: 'draw なし: 演出なしで最初から表' },
	];

	const drawStatus = {
		canDraw: false,
		nextDrawAt: new Date(Date.now() + 8 * 3600_000).toISOString(),
		myNagi: { canDraw: false, cardVolume: 1, cardId: 1 },
		reaction: { canDraw: true },
	};

	function dialogCard(kind: DialogCase): CardView {
		switch (kind) {
			case 'new-sr':
				return mock('SR', 'wind', { commentJa: '新しい出会いだね。今日はしっかりお祝いしよう！' });
			case 'new-ur':
				return mock('UR', 'fire', { commentJa: 'よく来たね。今日のきみ、いい顔してる。' });
			case 'new-aar':
				return mock('AAR', 'light', { commentJa: 'すごい！ この出会いは、ずっと覚えていたいね。' });
			case 'again':
				return mock('R', 'water', {
					duplicateCount: 3,
					commentJa: 'また会えたね。何度でも言うよ、きみで大丈夫。',
				});
			case 'already':
				return mock('SR', 'wind', { commentJa: 'もう今日のぶんは渡したよ。また明日ね。' });
			case 'pending':
				// commentJa/En を入れないので「考え中」の吹き出しが出る。実際に getCards を
				// 叩きに行って失敗し続け、60 秒後に cardCommentNotReady へ落ちる。
				return mock('AAR', 'light');
			case 'review':
				return mock('N', 'earth', { commentJa: 'あのときのきみも、ちゃんとえらかったよ。' });
		}
	}

	function dialogDraw(kind: DialogCase): DrawCardResult | undefined {
		if (kind === 'review') return undefined;
		return {
			card: dialogCard(kind),
			source: 'my_nagi',
			alreadyDrawn: kind === 'already',
			isNew: kind.startsWith('new-'),
			commentPending: kind === 'pending',
			drawStatus,
		};
	}

	function open(kind: DialogCase) {
		dialogCase = kind;
		replay += 1;
	}
</script>

<section class="dev">
	<header>
		<h1>カード見た目プレビュー（dev 専用）</h1>
		<p>
			サーバーに触らないモックだけで描いている。本番ビルドでは <code>/dev/cards</code> は 404。 TL
			上での実配置は <a href="/?cardFab=1">/?cardFab=1</a> で確認する（未ログインでも出る）。
		</p>
	</header>

	<h2>CardDrawFab</h2>
	<div class="dev-controls">
		<label><input type="checkbox" bind:checked={fabDrawing} /> drawing</label>
		<label
			><input
				type="checkbox"
				checked={!!fabError}
				onchange={(e) => (fabError = e.currentTarget.checked ? 'カードを引けませんでした' : '')}
			/> error</label
		>
		<label><input type="checkbox" bind:checked={fabShifted} /> shifted（通知回避）</label>
		<label><input type="checkbox" bind:checked={fabFixed} /> 実際の fixed 位置で出す</label>
	</div>
	<div class="dev-controls">
		<button type="button" class="ghost" onclick={() => (guideOpen = true)}>
			リアクション案内
		</button>
		{#each [10, 50, 100] as percent (percent)}
			<button type="button" class="ghost" onclick={() => (milestone = percent)}>
				マイルストーン {percent}%
			</button>
		{/each}
	</div>
	{#if fabFixed}
		<CardDrawFab
			drawing={fabDrawing}
			error={fabError}
			shifted={fabShifted}
			ondraw={() => {}}
			ondismisserror={() => (fabError = '')}
		/>
		<p class="dev-note">
			画面右下に出ている。ウィンドウ幅を 1920 / 1280 / 1100 / 767 / 380px と変えて、
			縦長カードと「今日の1枚」ラベルがサイドバー下端のリンク・モバイルナビ・一時通知と
			被らないことを見る。
		</p>
	{:else}
		<div class="dev-fab-inline">
			<CardDrawFab ondraw={() => {}} ondismisserror={() => {}} />
			<CardDrawFab drawing ondraw={() => {}} ondismisserror={() => {}} />
			<CardDrawFab error="カードを引けませんでした" ondraw={() => {}} ondismisserror={() => {}} />
		</div>
		<p class="dev-note">通常 / drawing / error。位置指定は打ち消してインラインで並べている。</p>
	{/if}

	<h2>CardDetailDialog</h2>
	<div class="dev-controls">
		{#each DIALOG_CASES as c (c.id)}
			<button type="button" class="ghost" onclick={() => open(c.id)} title={c.note}>
				{c.label}
			</button>
		{/each}
	</div>

	<h2>AffirmationCard — 未所持</h2>
	<ul class="dev-grid">
		{#each RARITIES as rarity (rarity)}
			<li><AffirmationCard card={mock(rarity, 'light', { owned: false })} /></li>
		{/each}
	</ul>

	<h2>AffirmationCard — size="full"</h2>
	<!-- size-full は inline-size: min(100%, 300px) なので、幅の決まった器に入れないと
	     aspect-ratio から高さを解けず、隣の節へはみ出す。器は必ず固定幅で置く。 -->
	<ul class="dev-full">
		{#each RARITIES as rarity (rarity)}
			<li>
				<AffirmationCard card={mock(rarity, 'fire')} size="full" />
				<span class="dev-caption">{rarity} / fire</span>
			</li>
		{/each}
	</ul>

	<h2>AffirmationCard — 全レアリティ × 全属性（size="grid"）</h2>
	<ul class="dev-grid">
		{#each showcase as card (`${card.rarity}-${card.attribute}`)}
			<li>
				<AffirmationCard {card} />
				<span class="dev-caption">{card.rarity} / {card.attribute}</span>
			</li>
		{/each}
	</ul>
</section>

{#if dialogCase}
	{#key replay}
		<CardDetailDialog
			initial={dialogCard(dialogCase)}
			actor="did:plc:devpreview"
			draw={dialogDraw(dialogCase)}
			collectionHref="/dev/cards"
			onclose={() => (dialogCase = undefined)}
		/>
	{/key}
{:else if milestone}
	<CardMilestoneDialog
		percent={milestone}
		collectionHref="/dev/cards"
		onclose={() => (milestone = undefined)}
	/>
{/if}

{#if guideOpen}
	<CardReactionGuideDialog onclose={() => (guideOpen = false)} />
{/if}

<style>
	.dev {
		display: grid;
		/* main は minmax(0, 600px)。中身が min-content で押し広げるとシェルごと横に
		   はみ出すので、この節より内側は必ず幅 0 まで縮められるようにしておく。 */
		grid-template-columns: minmax(0, 1fr);
		gap: 0.9rem;
		padding: 1rem 0 4rem;
	}
	.dev h1 {
		margin: 0;
		font-size: 1.15rem;
	}
	.dev h2 {
		margin: 1.2rem 0 0;
		font-size: 0.95rem;
		color: var(--text-muted);
	}
	.dev p {
		margin: 0;
		font-size: 0.85rem;
		color: var(--text-muted);
	}
	.dev-note {
		font-size: 0.8rem;
	}
	.dev-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.9rem;
		font-size: 0.85rem;
	}
	.dev-controls label {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	/* fixed を打ち消してインラインで並べるためのコンテナ。 */
	.dev-fab-inline {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 1rem 2.5rem;
		padding: 1rem 0.5rem;
	}
	.dev-fab-inline :global(.card-fab-wrap) {
		position: static;
		inset: auto;
		justify-items: start;
	}
	.dev-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 0.8rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.dev-grid li {
		display: grid;
		gap: 0.25rem;
		align-content: start;
		min-width: 0;
	}
	.dev-caption {
		font-size: 0.7rem;
		color: var(--text-faint);
	}
	/* 器の幅を固定して、size-full の min(100%, 300px) を確定値にする。 */
	.dev-full {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 220px));
		align-items: start;
		gap: 1rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.dev-full li {
		display: grid;
		gap: 0.25rem;
		min-width: 0;
	}
</style>
