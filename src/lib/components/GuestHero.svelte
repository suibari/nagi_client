<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	/**
	 * 未ログインの人に見せる紹介。フィードの冒頭と、ブログ・ニュースの個別記事の上に同じ形で置き、
	 * 「Nagiのことを知る」と「参加する」への導線を持つ。
	 * 特徴を言葉で並べるより、投稿 → botたんの返信 → 絵文字 の流れを一度見せるほうが伝わるので、
	 * 中身は動くやりとりの見本にする（4本柱の説明は /about に任せる）。
	 */
	import MomentSample from '$lib/components/MomentSample.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
</script>

<section class="hero">
	<p class="eyebrow">{m.heroEyebrow()}</p>
	<!-- 置き先のページはどれも自前の h1（フィード見出し・記事タイトル）を持つので h2 にする。 -->
	<h2 class="hero-title">{m.heroTitle()}</h2>
	<p class="hero-body">{m.heroBody()}</p>
	<div class="hero-moment">
		<MomentSample />
	</div>
	<p class="hero-ai-note">
		<Icon name="shield" size={14} />
		<span>{m.heroLocalAi()} <a href="/privacy#p5">{m.heroLocalAiLink()}</a></span>
	</p>
	<div class="hero-actions">
		<Button variant="secondary" size="lg" class="hero-about" href="/about"
			>{m.welcomeAboutLink()}</Button
		>
		<Button variant="primary" size="lg" class="hero-join" href="/login">{m.joinCta()}</Button>
	</div>
</section>
