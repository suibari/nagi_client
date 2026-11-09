<script lang="ts">
	/**
	 * 「ゆるくつながる」の見本。架空のユーザーの投稿1件に、押せる絵文字を並べる。
	 * 押すと本物と同じでか絵文字＋花火が出るが、どこにも記録しない（DemoReactionButton）。
	 * 数は出さない。いいね数の代わりに「絵文字が届く」ことを、触って分かってもらう。
	 */
	import { sampleReactionPost } from '$lib/about/samples';
	import DemoReactionButton from '$lib/components/DemoReactionButton.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';

	const sample = $derived(sampleReactionPost(i18n.locale));
</script>

<figure class="landing-reaction-sample">
	<div class="moment-post">
		<img class="moment-avatar" src={sample.avatar} alt="" width="36" height="36" />
		<div class="moment-bubble">
			<strong>{sample.displayName}</strong>
			<p>{sample.post}</p>
			<div class="landing-post-reactions">
				{#each sample.reactions as emoji (emoji)}
					<DemoReactionButton class="reaction-emoji" {emoji} />
				{/each}
			</div>
		</div>
	</div>
	<figcaption>
		<span class="landing-try">{m.landingLooseTry()}</span>
		<span><span class="about-sample-badge">{m.aboutSampleBadge()}</span> {m.aboutSampleNote()}</span
		>
	</figcaption>
</figure>
