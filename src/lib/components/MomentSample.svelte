<script lang="ts">
	/**
	 * Nagi でのやりとりを一場面だけ見せる見本（架空のユーザー）。
	 * 投稿 → botたんの返信 → 読んだ人からの絵文字、の流れで体験のイメージを伝える。
	 * 実物の ChatBubble はセッションやリアクション操作に依存するので、見た目だけ似せた静的な描画にする。
	 */
	import { sampleMoment } from '$lib/about/samples';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';

	const moment = $derived(sampleMoment(i18n.locale));
</script>

<figure class="moment-sample" aria-label={m.heroSampleLabel()}>
	<div class="moment-post">
		<img class="moment-avatar" src={moment.avatar} alt="" width="36" height="36" />
		<div class="moment-bubble">
			<strong>{moment.displayName}</strong>
			<p>{moment.post}</p>
			<ul class="moment-reactions" aria-label={m.aboutMomentEmojiTitle()}>
				{#each moment.reactions as emoji (emoji)}
					<li>{emoji}</li>
				{/each}
			</ul>
		</div>
	</div>
	<div class="moment-post is-reply">
		<span class="moment-avatar is-bot" aria-hidden="true"><Icon name="bot" size={22} /></span>
		<div class="moment-bubble">
			<strong>{m.heroSampleBotName()}</strong>
			<p>{moment.reply}</p>
		</div>
	</div>
	<figcaption>
		<span class="about-sample-badge">{m.aboutSampleBadge()}</span>
		{m.aboutSampleNote()}
	</figcaption>
</figure>
