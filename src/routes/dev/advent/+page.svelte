<script lang="ts">
	import type { AdventCalendarView, AdventCardView } from '$lib/api/types';
	import AdventCalendar from '$lib/components/AdventCalendar.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	/**
	 * アドカレ（ツリー・カード・手紙の開封演出）を AppView なしで確かめるページ。
	 * 開いた日数を変えるとツリーの埋まり方を、「自分のカード」を押すと手紙の演出を見られる。
	 * アバターは Nagi のアイコンを借りる（一部はアバターなしの見た目を確かめる）。
	 */
	const SAMPLES: [string, string, string, string][] = [
		[
			'焼きたてのメロンパン',
			'Freshly baked melon bread',
			'ふわふわのメロンパン、写真からいい匂いがしたよ！みんなにもおすそわけ🍈',
			'Your fluffy melon bread looked so good! Sharing the joy with everyone 🍈',
		],
		[
			'推しのライブ当選',
			'Won tickets to a favorite live show',
			'当選おめでとう！当日まで毎日がたのしみになるね🎫',
			'Congrats! Every day until the show will feel exciting 🎫',
		],
		[
			'猫が膝に乗ってきた夜',
			'The night the cat climbed onto my lap',
			'あったかくて動けなくなるやつだ〜！しあわせのおすそわけ🐈',
			'The warm "can’t move now" moment! Sharing the happiness 🐈',
		],
		[
			'資格試験に合格',
			'Passed the certification exam',
			'こつこつ続けてきたの、ちゃんと届いたね。ほんとうにおめでとう！',
			'All that steady work paid off. Congratulations!',
		],
		[
			'とても長い見出しで折り返しと省略を確かめるためのテキスト',
			'A very long title to check wrapping and truncation in the card',
			'長い一言のときにカードの中でどう収まるかを確かめるための文章だよ。botたんはみんなの嬉しいを毎日ひとつずつ選んでいるよ。',
			'A long comment to check how the text fits in the card. botたん picks one happy thing every day.',
		],
	];
	const VIEWER = 'did:plc:viewer';

	let opened = $state(12);
	let mineDay = $state<number | undefined>(undefined);
	let version = $state(0);

	const calendar = $derived.by<AdventCalendarView>(() => {
		const cards: AdventCardView[] = Array.from({ length: opened }, (_, index) => {
			const day = index + 1;
			const [titleJa, titleEn, commentJa, commentEn] = SAMPLES[index % SAMPLES.length];
			const mine = day === mineDay;
			return {
				year: 2026,
				day,
				actor: {
					did: mine ? VIEWER : `did:plc:user${day}`,
					handle: mine ? 'me.bsky.social' : `user${day}.bsky.social`,
					displayName: mine ? 'わたし' : `ユーザー${day}`,
					...(day % 4 === 0 ? {} : { avatar: '/nagi_icon_512.png' }),
				},
				...(day % 5 === 0 ? {} : { postUri: `at://did:plc:user${day}/com.suibari.nagi.post/x` }),
				titleJa,
				titleEn,
				commentJa,
				commentEn,
				publishedAt: new Date(Date.UTC(2026, 11, day) - 9 * 3600_000).toISOString(),
			};
		});
		return {
			year: 2026,
			openedDay: opened,
			...(opened < 25
				? { nextOpenAt: new Date(Date.UTC(2026, 11, opened + 1) - 9 * 3600_000).toISOString() }
				: {}),
			cards,
		};
	});

	function showLetter() {
		mineDay = opened || undefined;
		version += 1;
	}
</script>

<PageHeader title="アドカレ（開発用）" description="AppView なしでツリーとカードを確かめます。" />
<div class="controls">
	<label>
		開いた日数 {opened}
		<input type="range" min="0" max="25" bind:value={opened} />
	</label>
	<button type="button" onclick={showLetter} disabled={!opened}>
		{opened}日目を自分のカードにして手紙を開ける
	</button>
</div>
{#key version}
	<AdventCalendar {calendar} viewerDid={VIEWER} openedDays={[]} />
{/key}

<style>
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		align-items: center;
		margin-block-end: 12px;
	}
</style>
