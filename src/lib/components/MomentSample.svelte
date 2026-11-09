<script lang="ts">
	/**
	 * Nagi でのやりとりを一場面だけ見せる見本（架空のユーザー）。
	 * 投稿 → botたんの返信 → 読んだ人からの絵文字、の流れで体験のイメージを伝える。
	 * 実物の ChatBubble はセッションやリアクション操作に依存するので、見た目だけ似せた静的な描画にする。
	 *
	 * 画面に入ったら、その流れをフィードと同じ動き（吹き出しがアバターから生える →
	 * 入力中 → 返信 → 絵文字のスタンプ）で一度だけ再生する。順番は CSS の animation-delay で作り、
	 * ここでは見えた時点で一時停止を解くだけにする。演出を切っている人や JS が動かない環境では、
	 * 最後の状態が静止して見える。
	 *
	 * 再生のあとは絵文字を押せる。押すと本物と同じでか絵文字＋花火が出るが、見た目だけで
	 * どこにも記録しない（DemoReactionButton）。
	 */
	import { sampleMoment } from '$lib/about/samples';
	import Icon from '$lib/components/shell/Icon.svelte';
	import DemoReactionButton from '$lib/components/DemoReactionButton.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';

	let figure: HTMLElement;
	let playing = $state(false);
	$effect(() => {
		if (typeof IntersectionObserver === 'undefined') {
			playing = true;
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				playing = true;
				observer.disconnect();
			},
			{ threshold: 0.4 },
		);
		observer.observe(figure);
		return () => observer.disconnect();
	});

	const moment = $derived(sampleMoment(i18n.locale));
	// ReactionStamp と同じ12方向の火花。
	const sparks = Array.from({ length: 12 }, (_, index) => ({
		angle: index * 30,
		distance: 26 + (index % 3) * 6,
		hue: [42, 331, 187, 216][index % 4],
	}));
</script>

<figure
	bind:this={figure}
	class="moment-sample"
	class:is-playing={playing}
	aria-label={m.heroSampleLabel()}
>
	<div class="moment-post">
		<img class="moment-avatar" src={moment.avatar} alt="" width="36" height="36" />
		<div class="moment-bubble">
			<strong>{moment.displayName}</strong>
			<p>{moment.post}</p>
			<ul class="moment-reactions" aria-label={m.aboutMomentEmojiTitle()}>
				{#each moment.reactions as emoji, i (emoji)}
					<li style:--moment-reaction-index={i}>
						<DemoReactionButton {emoji} />
						<span class="moment-stamp" aria-hidden="true">
							<span class="moment-sparks">
								{#each sparks as spark (spark.angle)}
									<i
										style:--spark-angle={`${spark.angle}deg`}
										style:--spark-distance={`-${spark.distance}px`}
										style:--spark-hue={spark.hue}
									></i>
								{/each}
							</span>
							<span class="moment-stamp-mark">{emoji}</span>
						</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
	<!-- 入力中と返信を同じ升に重ねる。升の高さは返信が決めるので、入れ替わっても下が動かない。 -->
	<div class="moment-reply-slot">
		<div class="moment-post is-reply moment-typing" aria-hidden="true">
			<span class="moment-avatar is-bot"><Icon name="bot" size={22} /></span>
			<div class="moment-bubble">
				<span class="typing"><i></i><i></i><i></i></span>
			</div>
		</div>
		<div class="moment-post is-reply">
			<span class="moment-avatar is-bot" aria-hidden="true"><Icon name="bot" size={22} /></span>
			<div class="moment-bubble">
				<strong>{m.heroSampleBotName()}</strong>
				<p>{moment.reply}</p>
			</div>
		</div>
	</div>
	<figcaption>
		<span class="about-sample-badge">{m.aboutSampleBadge()}</span>
		{m.aboutSampleNote()}
	</figcaption>
</figure>
