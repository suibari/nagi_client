<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	/**
	 * 未ログインの人に見せる紹介。フィードの冒頭と、ブログ・ニュースの個別記事の上に同じ形で置き、
	 * 「Nagiのことを知る」と「参加する」への導線を持つ。
	 * 特徴を言葉で並べるより、投稿 → botたんの返信 → 絵文字 の流れを一度見せるほうが伝わるので、
	 * 中身は動くやりとりの見本にする。キャッチコピーと3本柱はランディング（`/`）と揃え、
	 * ここでは1行ずつに縮める。
	 */
	import MomentSample from '$lib/components/MomentSample.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	const pillars = [
		{ icon: 'shield', text: m.landingSafeShort },
		{ icon: 'emoji', text: m.landingLooseShort },
		{ icon: 'sun', text: m.landingReflectShort },
	];
</script>

<section class="hero">
	<p class="eyebrow">{m.heroEyebrow()}</p>
	<!-- 置き先のページはどれも自前の h1（フィード見出し・記事タイトル）を持つので h2 にする。 -->
	<h2 class="hero-title">{m.heroTitle()}</h2>
	<ul class="hero-pillars">
		{#each pillars as pillar (pillar.icon)}
			<li><Icon name={pillar.icon} size={16} /><span>{pillar.text()}</span></li>
		{/each}
	</ul>
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

<style>
	/* ハイドレーションより前にも適用し、事前生成HTMLのちらつきを防ぐ。 */
	:global(html[data-oauth-pending]) .hero {
		display: none;
	}
</style>
