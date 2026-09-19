<script lang="ts">
	import type { CardView, ZenkatsuFeed, ZenkatsuSubmissionView } from '$lib/api/types';
	import ZenkatsuPlay from '$lib/components/ZenkatsuPlay.svelte';

	const cards: CardView[] = [
		{
			id: 1,
			nameJa: '小さな一歩',
			nameEn: 'A small step',
			attribute: 'wind',
			rarity: 'R',
			textJa: '一歩進めた日も、立ち止まった日も。ここまで来たきみを、ちゃんとほめたい。',
		},
		{
			id: 2,
			nameJa: 'ひとやすみの魔法',
			nameEn: 'A moment of rest',
			attribute: 'water',
			rarity: 'SR',
			textJa: '今日は深呼吸だけでも大丈夫。休む時間も、きみを明日へ連れていく。',
		},
		{
			id: 3,
			nameJa: '明日のきみに',
			nameEn: 'For tomorrow’s you',
			attribute: 'light',
			rarity: 'UR',
			textJa:
				'うまくいかなかった今日にも、きみが頑張った時間は確かにある。明日はまた、きみのペースで。',
		},
	].map((card) => ({
		...card,
		volume: 1,
		owned: true,
		atk: 1200,
		def: 1800,
		raceJa: 'もふもふ族',
		raceEn: 'Fluffy',
		textEn: 'Every small step counts. Take your time and be kind to yourself.',
	})) as CardView[];
	const submission: ZenkatsuSubmissionView = {
		uri: 'at://did:plc:zenkatsu-demo/com.suibari.nagi.zenkatsu/2026-09-19',
		cid: 'demo',
		author: { did: 'did:plc:zenkatsu-demo', handle: 'demo.example', displayName: 'おためしさん' },
		cards,
		commentPending: false,
		tailwindCount: 2,
		combos: [],
		commentJa:
			'「小さな一歩」で自分の頑張りを認めて、「ひとやすみの魔法」でひと息。そして「明日のきみに」で、次の日へやさしくつなげたんだね。\n\nうまくいかない日にも、自分を置き去りにしない3枚。そんなきみの選び方、botたんはとってもすてきだと思うよ！',
		commentEn:
			'You recognized your small steps, gave yourself a moment to rest, and left a little hope for tomorrow. These three cards are a lovely reminder to be kind to yourself.',
		createdAt: '2026-09-19T00:00:00Z',
		indexedAt: '2026-09-19T00:00:00Z',
	};
	const feed: ZenkatsuFeed = {
		theme: {
			volume: 1,
			id: 1,
			themeDate: '2026-09-19',
			textJa: 'がんばったのに、うまくいかなかった日。',
			textEn: 'A day when you tried hard but things did not go as planned.',
			attribute: 'light',
			tone: 'sunao',
		},
		submissions: [submission],
	};
	let mode = $state<'result' | 'play' | null>('result');
</script>

<svelte:head><title>ゼンカツ！ モックプレビュー</title></svelte:head>

<section class="demo">
	<h1>ゼンカツ！ モックプレビュー</h1>
	<p>登録なしで確認できます。カード3枚と総評はサンプルです。実際の提出は行いません。</p>
	<div class="controls">
		<button class="primary" onclick={() => (mode = 'result')}>3枚提出済みの総評を見る</button>
		<button class="primary" onclick={() => (mode = 'play')}>選択・提出の演出を試す</button>
	</div>
</section>

{#if mode}
	{#key mode}
		<ZenkatsuPlay
			hand={cards.map((card) => ({ card, p: { volume: card.volume, id: card.id, available: 1 } }))}
			maxCards={3}
			theme={feed.theme}
			initialSubmission={mode === 'result' ? submission : undefined}
			loadFeed={async () => feed}
			onsubmit={async () => submission.uri}
			onclose={() => (mode = null)}
		/>
	{/key}
{/if}

<style>
	.demo {
		padding: 1.25rem;
	}
	h1 {
		font-size: 1.25rem;
	}
	p {
		line-height: 1.8;
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
</style>
