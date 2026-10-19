<script lang="ts">
	import type { RadioTrack } from '$lib/api/types';
	import RadioContent from '$lib/radio/RadioContent.svelte';
	import RadioPlaylist from '$lib/radio/RadioPlaylist.svelte';

	/**
	 * botたんラジオのプレイリスト表示（RadioPlaylist）をAppViewなしで確かめるページ。
	 * 「いまの表示」に切り替えると、本番の /radio と同じ並べ方と見比べられる。
	 * ジャケットは last.fm の画像を1枚だけ借り、残りはジャケットなしの見た目を確かめる。
	 */
	const SONGS: [string, string, string][] = [
		[
			'チェリー',
			'スピッツ',
			'今日の投稿、なんだか春の匂いがしたの。新しいことを始めるきみに、この曲を。',
		],
		[
			'夜に駆ける',
			'YOASOBI',
			'夜ふかしが続いてるみたいだね。眠れない夜は、無理に眠らなくても大丈夫。',
		],
		['Lemon', '米津玄師', 'ちょっぴり寂しそうだったから。思い出は、苦いほど大事にしたくなるよね。'],
		['ハナミズキ', '一青窈', 'だれかの幸せを願えるきみは、それだけですてき。'],
		['Pretender', 'Official髭男dism', 'うまくいかない日の帰り道に。'],
		['Habit', 'SEKAI NO OWARI', 'いつもの癖を、ちょっと笑い飛ばしてみよう。'],
		[
			'とても長い曲名で折り返しと省略を確かめるためのテストトラック（Extended Mix）',
			'とても長いアーティスト名 feat. もうひとりのアーティスト',
			'長いコメントのときに吹き出しがどう収まるかを確かめるための文章です。\n\n改行も入れてみたよ。botたんはきみの投稿をぜんぶ読んで、いちばん合いそうな一曲を選んでいます。今日はたくさん歩いたみたいだから、帰り道にゆっくり聴いてほしいな。明日もきみのペースでね。',
		],
	];
	const THUMB =
		'https://lastfm-img.freetls.fastly.net/i/u/300x300/85ed13b0384245b1970ec959c1fa39df.png';
	const tracks: RadioTrack[] = Array.from({ length: 14 }, (_, index) => {
		const [title, artist, comment] = SONGS[index % SONGS.length];
		// 1日2〜3枠、新しい順。
		const published = new Date(Date.UTC(2026, 9, 19, 12, 0) - index * 9 * 3600_000);
		return {
			slotKey: published.toISOString().slice(0, 13),
			title,
			artist,
			comment,
			commentJa: comment,
			commentEn: 'Here is a song for your day.',
			songUrl: 'https://www.last.fm/music/Spitz/_/Cherry',
			...(index % 3 === 0 ? { thumbnailUrl: THUMB } : {}),
			publishedAt: published.toISOString(),
		};
	});
	let view = $state<'new' | 'old'>('new');
	let count = $state(tracks.length);
</script>

<svelte:head><title>ラジオ モックプレビュー</title></svelte:head>

<section class="demo">
	<h1>ラジオ モックプレビュー</h1>
	<p>AppViewなしで確認できます。データはサンプルで、どこにも送信しません。</p>
	<div class="controls">
		<button class:active={view === 'new'} onclick={() => (view = 'new')}>新しい表示</button>
		<button class:active={view === 'old'} onclick={() => (view = 'old')}>いまの表示</button>
		<label>
			曲数 <input type="range" min="1" max={tracks.length} bind:value={count} />
			{count}
		</label>
	</div>
</section>

<div class="radio-history">
	{#if view === 'new'}
		<RadioPlaylist tracks={tracks.slice(0, count)} unreadSlotKey={tracks[0].slotKey} />
	{:else}
		{#each tracks.slice(0, count) as track (track.slotKey)}
			<RadioContent {track} unread={track === tracks[0]} variant="page" />
		{/each}
	{/if}
</div>

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
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
	}
	.controls button {
		padding: 0.3rem 0.8rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--surface-1);
		color: var(--text);
		font: inherit;
	}
	.controls button.active {
		border-color: var(--accent-strong);
		background: var(--accent-soft);
	}
	.radio-history {
		display: grid;
		gap: 20px;
		padding: 16px;
	}
</style>
