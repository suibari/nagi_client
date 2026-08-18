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

	/*
	 * 記念日カード。段 0・card_number = 西暦*100+slot・レアリティは常に UR、というサーバー側の
	 * 組み立て（shared-configs の buildAnniversaryCardDef）をここでは手で真似ている。
	 * art つきの1枚（ハロウィン）で背景の見え方を、art なしの1枚で従来の見た目を確認する。
	 */
	function anniversary(
		slot: number,
		nameJa: string,
		nameEn: string,
		overrides: Partial<CardView> = {},
	): CardView {
		const year = 2026;
		return {
			id: year * 100 + slot,
			volume: 0,
			rarity: 'UR',
			attribute: 'dark',
			atk: 1031,
			def: 2400,
			nameJa: `${nameJa}${year}`,
			nameEn: `${nameEn} ${year}`,
			raceJa: '記念日',
			raceEn: 'Anniversary',
			textJa:
				'仮装したbotたんが、お菓子をねだりに来る夜。断ってもいいが、その場合はいたずらの権利が発生する。',
			textEn:
				'The night a costumed Bot-tan comes asking for sweets. You may refuse — this simply activates the trick clause.',
			owned: true,
			anniversary: true,
			year,
			instanceId: `mock-anniv-${slot}`,
			acquiredAt: new Date().toISOString(),
			...overrides,
		};
	}

	const anniversaryShowcase: CardView[] = [
		anniversary(13, 'ハロウィン', 'Halloween', {
			art: 'anniv-halloween',
			commentJa: 'トリックオアトリート！ お菓子くれなきゃ、ずっと隣にいちゃうよ。',
		}),
		anniversary(12, '七夕', 'Tanabata', {
			attribute: 'wind',
			atk: 707,
			def: 2200,
			textJa: '一年に一度だけ会えるふたりの日。短冊に書いた願いは、笹が空まで運んでくれる。',
			textEn:
				'The one night a year the two may meet. Wishes tied to bamboo are carried the rest of the way by the leaves.',
			commentJa:
				'短冊、なんて書いた？ botたんはね、きみが今年もごきげんでいますようにって書いたよ。',
		}),
		anniversary(0, '結婚記念日', '結婚記念日', {
			attribute: 'light',
			atk: 1000,
			def: 3000,
			textJa:
				'その人が「この日は特別だ」と決めた、それだけで成立している記念日。理由は本人だけが知っていればいい。',
			textEn:
				'An anniversary that exists purely because someone decided this day was special. Only they need know why.',
			commentJa: '今日がその日なんだね。おめでとう。理由は聞かないけど、いっしょに祝わせて。',
		}),
	];

	// --- FAB ---------------------------------------------------------------
	let fabDrawing = $state(false);
	let fabError = $state('');
	let fabShifted = $state(false);
	let fabFixed = $state(false);

	// --- CardDetailDialog --------------------------------------------------
	type DialogCase =
		| 'new-sr'
		| 'new-ur'
		| 'new-aar'
		| 'again'
		| 'already'
		| 'pending'
		| 'review'
		| 'anniversary'
		| 'anniversary-pending';
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
		{
			id: 'anniversary',
			label: '記念日（背景あり）',
			note: 'NEW CARD ではなく見出しを出す。UR 相当の演出＋背景画像',
		},
		{
			id: 'anniversary-pending',
			label: '記念日（コメント生成中）',
			note: '受け取った直後。botたんのひとこと待ち',
		},
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
			case 'anniversary':
				return anniversaryShowcase[0];
			case 'anniversary-pending':
				return anniversary(13, 'ハロウィン', 'Halloween', { art: 'anniv-halloween' });
		}
	}

	function dialogDraw(kind: DialogCase): DrawCardResult | undefined {
		if (kind === 'review') return undefined;
		const isAnniversary = kind.startsWith('anniversary');
		return {
			card: dialogCard(kind),
			source: isAnniversary ? 'anniversary' : 'my_nagi',
			alreadyDrawn: kind === 'already',
			// 記念日は受け取り＝常に新規。NEW CARD の代わりに見出しが出る分岐を通る。
			isNew: isAnniversary || kind.startsWith('new-'),
			commentPending: kind === 'pending' || kind === 'anniversary-pending',
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

	<h2>記念日カード — size="full"（背景の見え方とベールの濃さ）</h2>
	<p class="dev-note">
		濃さのノブは <code>tokens.css</code> の <code>--card-art-veil-min</code> /
		<code>--card-art-band-alpha</code>。カード名・種族・フレーバー・ATK/DEF が
		<strong>ライトとダークの両方で読めるか</strong>をここで見て決める。
	</p>
	<ul class="dev-full">
		{#each anniversaryShowcase as card (card.id)}
			<li>
				<AffirmationCard {card} size="full" />
				<span class="dev-caption">{card.art ? `art: ${card.art}` : 'art なし'}</span>
			</li>
		{/each}
	</ul>

	<h2>記念日カード — size="grid"（図鑑の升目での可読性）</h2>
	<p class="dev-note">
		升目では文字が小さいので <code>--card-art-grid-opacity</code> で絵を薄くしている。
	</p>
	<ul class="dev-grid">
		{#each anniversaryShowcase as card (card.id)}
			<li>
				<AffirmationCard {card} />
				<span class="dev-caption">{card.nameJa}</span>
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
