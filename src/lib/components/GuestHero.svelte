<script lang="ts">
	/**
	 * 未ログインの人に見せる紹介。フィードの冒頭と、ブログ・ニュースの個別記事の上に同じ形で置き、
	 * 「Nagiのことを知る」と「参加する」への導線を持つ。
	 */
	import Icon from '$lib/components/shell/Icon.svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	// /about の「なぜNagiなのか」と同じ4本柱。見出しは共有し、本文だけカード用に短くする。
	const points = [
		{ icon: 'bot', title: m.aboutBotTitle, body: m.heroBotBody },
		{ icon: 'heart', title: m.aboutNoLikesTitle, body: m.heroNoLikesBody },
		{ icon: 'emoji', title: m.aboutEmojiTitle, body: m.heroEmojiBody },
		{ icon: 'sun', title: m.aboutGraphTitle, body: m.heroGraphBody },
	];
</script>

<section class="hero">
	<p class="eyebrow">{m.heroEyebrow()}</p>
	<!-- 置き先のページはどれも自前の h1（フィード見出し・記事タイトル）を持つので h2 にする。 -->
	<h2 class="hero-title">{m.heroTitle()}</h2>
	<p class="hero-body">{m.heroBody()}</p>
	<ul class="hero-points">
		{#each points as point (point.icon)}
			<li>
				<span class="hero-point-icon"><Icon name={point.icon} size={18} /></span>
				<span class="hero-point-text">
					<strong>{point.title()}</strong>
					<span>{point.body()}</span>
				</span>
			</li>
		{/each}
	</ul>
	<p class="hero-ai-note">
		<Icon name="shield" size={14} />
		<span>{m.heroLocalAi()} <a href="/privacy#p5">{m.heroLocalAiLink()}</a></span>
	</p>
	<div class="hero-actions">
		<a class="hero-about" href="/about">{m.welcomeAboutLink()}</a>
		<a class="hero-join" href="/login">{m.joinCta()}</a>
	</div>
</section>
