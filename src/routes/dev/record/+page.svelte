<script lang="ts">
	import type { CardAttribute, CardRarity, CardView, ZenkatsuDeckView } from '$lib/api/types';
	import ZenkatsuRecordShelf from '$lib/components/ZenkatsuRecordShelf.svelte';

	/**
	 * レコードタブ（ZenkatsuRecordShelf）をAppViewなしで確かめるページ。
	 * モックはブラウザ内だけで描画し、どこにも送信しない。
	 */
	const ATTRIBUTES: CardAttribute[] = ['light', 'dark', 'fire', 'water', 'wind', 'earth'];
	const RARITIES: CardRarity[] = ['N', 'R', 'SR', 'UR'];
	const card = (id: number, nameJa: string): CardView =>
		({
			id,
			volume: 1,
			nameJa,
			nameEn: nameJa,
			attribute: ATTRIBUTES[id % ATTRIBUTES.length],
			rarity: RARITIES[id % RARITIES.length],
			owned: true,
			atk: 1000 + id * 100,
			def: 1500,
			raceJa: 'もふもふ族',
			raceEn: 'Fluffy',
			textJa: 'ここまで来たきみを、ちゃんとほめたい。',
			textEn: 'Every small step counts.',
		}) as CardView;

	const COMBO_NAMES = [
		['明日への一歩', 'ひと息ついたら、またきみのペースで。3枚のやさしさがつながった。'],
		['雨上がりの約束', '涙のあとに見える景色は、いつもより少しだけ澄んでいる。'],
		['夜更かしの灯', '眠れない夜にも、灯りはちゃんとともっている。'],
		['ぽかぽか日和', '陽だまりみたいなあたたかさが、ふたつ重なった。'],
		['風のたより', '遠くの誰かの「がんばれ」が、風にのって届いた。'],
		['大地のふとん', 'ぜんぶ受け止めてくれる場所が、足もとにある。'],
		[
			'とてもとても長い名前のコンボで折り返しを確かめるための一枚',
			'長い名前でも崩れないかを見る。',
		],
	];
	const combos = (n: number): ZenkatsuDeckView['combos'] =>
		COMBO_NAMES.slice(0, n).map(([nameJa, descJa], index) => ({
			volume: 1,
			id: index + 1,
			nameJa,
			nameEn: nameJa,
			descJa,
			descEn: descJa,
			slots: [
				[card(index * 3 + 1, '小さな一歩')],
				index % 2
					? [card(index * 3 + 2, 'ひとやすみの魔法'), card(index * 3 + 7, 'まどろみ')]
					: [card(index * 3 + 2, 'ひとやすみの魔法')],
				...(index % 3 === 2 ? [] : [[card(index * 3 + 3, '明日のきみに')]]),
			],
			firstPlayedDate: `2026-09-${String(10 + index).padStart(2, '0')}`,
			isPioneer: index % 3 === 0,
			pioneer:
				index % 3 === 0
					? undefined
					: { did: 'did:plc:pioneer', handle: 'pioneer.example', displayName: 'さきがけさん' },
		}));

	const KINDS = [
		'botan',
		'adventure',
		'adventure',
		'solo',
		'tailwind',
		'adventure',
		'combo',
		'solo',
	];
	const trophies = (n: number): ZenkatsuDeckView['trophies'] =>
		Array.from({ length: n }, (_, index) => {
			const day = 30 - index;
			const date = `2026-${day > 0 ? '09' : '08'}-${String(day > 0 ? day : 31 + day).padStart(2, '0')}`;
			const kind = KINDS[index % KINDS.length];
			return {
				kind,
				themeDate: date,
				themeJa: 'がんばったのに、うまくいかなかった日。',
				themeEn: 'A day when you tried hard but things did not go as planned.',
				submissionUri: `at://did:plc:demo/com.suibari.nagi.zenkatsu/${date}`,
				...(kind === 'botan'
					? {
							commentJa:
								'今日はきみの3枚がいちばん心にしみたよ。うまくいかない日にも、自分を置き去りにしないところがすてき！',
							commentEn: 'Your three cards touched my heart the most today.',
						}
					: {}),
			};
		});

	const SCENARIOS: Record<string, { label: string; record: ZenkatsuDeckView }> = {
		typical: {
			label: 'ふつう（コンボ7/24・トロフィー20）',
			record: { comboTotal: 24, combos: combos(7), trophies: trophies(20) },
		},
		heavy: {
			label: 'やりこみ（トロフィー60・旧debutあり）',
			record: {
				comboTotal: 12,
				combos: combos(7),
				trophies: [
					...trophies(60),
					{ kind: 'debut', themeDate: '2026-07-01', submissionUri: 'at://debut' },
				],
			},
		},
		empty: { label: 'はじめて（何もない）', record: { comboTotal: 24, combos: [], trophies: [] } },
	};
	let scenario = $state('typical');
</script>

<svelte:head><title>レコード モックプレビュー</title></svelte:head>

<section class="demo">
	<h1>レコード モックプレビュー</h1>
	<p>AppViewなしで確認できます。データはサンプルで、どこにも送信しません。</p>
	<div class="controls" role="group" aria-label="シナリオ">
		{#each Object.entries(SCENARIOS) as [id, s] (id)}
			<button class:active={scenario === id} onclick={() => (scenario = id)}>{s.label}</button>
		{/each}
	</div>
</section>

{#key scenario}
	<ZenkatsuRecordShelf record={SCENARIOS[scenario].record} />
{/key}

<style>
	.demo {
		padding: 1.25rem 1.25rem 0;
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
		gap: 0.5rem;
	}
	.controls button {
		padding: 0.3rem 0.8rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--surface-1);
		color: var(--text);
		font: inherit;
		font-size: 0.8rem;
	}
	.controls button.active {
		border-color: var(--accent-strong);
		background: var(--accent-soft);
	}
</style>
