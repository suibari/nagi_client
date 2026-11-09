<script lang="ts">
	/**
	 * 未サインインの TOP（`/`）。アプリの殻（左ナビ・右レール・投稿ボタン）は外し、
	 * 体験と「ふつうのSNSとの違い」を上から順に伝える。
	 *
	 * 構成は「ヒーロー → 3本柱 → いまのNagi（実投稿） → 締め」。
	 * 違いは比較表にせず、柱ごとに「ふつうのSNSなら」を薄い1行で添え、見出しで Nagi の場合を言い、
	 * すぐ横の実物（やりとり・絵文字・グラフ）で見せる。説明は1文に抑える。
	 * 参加の導線はヒーローと締めの2か所。タイムラインそのものは `/feed` にある。
	 *
	 * プリレンダHTMLにはこのページが入る（検索エンジンと初回訪問者向け）。サインイン済みの人には
	 * 一瞬も見せたくないので、認証確認中は html[data-oauth-pending] で隠してスピナーにする。
	 */
	import Button from '$lib/components/Button.svelte';
	import DiaryMoodChart from '$lib/components/DiaryMoodChart.svelte';
	import MomentSample from '$lib/components/MomentSample.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import LandingLivePosts from './LandingLivePosts.svelte';
	import LandingReactionSample from './LandingReactionSample.svelte';
	import { sampleMoods } from '$lib/about/samples';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { onMount } from 'svelte';

	// m.* はロケールを読むアクセサ。関数のまま持ち、テンプレートで呼んで言語切り替えに追従させる。
	type Pillar = {
		id: 'safe' | 'loose' | 'reflect';
		icon: string;
		title: () => string;
		old: () => string;
		heading: () => string;
		line: () => string;
	};
	const pillars: Pillar[] = [
		{
			id: 'safe',
			icon: 'shield',
			title: m.landingSafeTitle,
			old: m.landingSafeOld,
			heading: m.landingSafeHeading,
			line: m.landingSafeLine,
		},
		{
			id: 'loose',
			icon: 'emoji',
			title: m.landingLooseTitle,
			old: m.landingLooseOld,
			heading: m.landingLooseHeading,
			line: m.landingLooseLine,
		},
		{
			id: 'reflect',
			icon: 'sun',
			title: m.landingReflectTitle,
			old: m.landingReflectOld,
			heading: m.landingReflectHeading,
			line: m.landingReflectLine,
		},
	];

	// 感情グラフは「今日までの1年」を描くので、日付がビルド時とずれないようクライアントでだけ組む。
	let mounted = $state(false);
	onMount(() => (mounted = true));
	const moodSample = $derived(mounted ? sampleMoods(i18n.locale) : undefined);
	let moodSelected = $state<string>();
	$effect(() => {
		if (moodSample) moodSelected = moodSample.selected;
	});
</script>

<div class="landing-pending" aria-hidden="true"><Spinner decorative /></div>

<div class="landing">
	<header class="landing-header">
		<a class="brand" href="/" aria-label="Nagi home"
			><img class="mark" src="/nagi_icon.png" alt="" width="32" height="32" /><span>Nagi</span></a
		>
		<nav class="landing-header-actions" aria-label={m.landingNavAria()}>
			<a class="landing-header-link" href="/about">{m.aboutLink()}</a>
			<Button variant="secondary" size="sm" href="/login">{m.login()}</Button>
		</nav>
	</header>

	<section class="landing-hero">
		<div class="landing-hero-copy">
			<h1>
				<span>{m.landingTitleLead()}</span>
				<span>{m.landingTitleTail()}</span>
			</h1>
			<p class="landing-hero-body">{m.landingLead()}</p>
			<div class="landing-cta">
				<Button variant="primary" size="lg" href="/login#signup">{m.aboutHeroCta()}</Button>
				<Button variant="secondary" size="lg" href="/feed">{m.landingBrowse()}</Button>
			</div>
		</div>
		<div class="landing-hero-figure">
			<img src="/bot_image_hero_trans.webp" alt={m.aboutHeroImageAlt()} width="600" height="900" />
		</div>
	</section>

	<!-- 柱ごとに「文 ⇔ 実物」を左右交互に並べる。狭幅では文 → 実物の順に積む。 -->
	<div class="landing-pillars">
		{#each pillars as pillar (pillar.id)}
			<section class="landing-pillar" data-pillar={pillar.id}>
				<div class="landing-pillar-copy">
					<p class="about-eyebrow"><Icon name={pillar.icon} size={16} />{pillar.title()}</p>
					<p class="landing-pillar-old">
						<span>{m.landingOldPrefix()}</span>{pillar.old()}
					</p>
					<h2>{pillar.heading()}</h2>
					<p class="landing-pillar-line">{pillar.line()}</p>
				</div>
				<div class="landing-pillar-sample">
					{#if pillar.id === 'safe'}
						<MomentSample />
					{:else if pillar.id === 'loose'}
						<LandingReactionSample />
					{:else}
						<figure class="about-sample" data-sample="mood">
							{#if moodSample}
								<DiaryMoodChart
									did="did:plc:about-sample"
									preview={{ moods: moodSample.moods }}
									bind:selected={moodSelected}
								/>
							{:else}
								<!-- プリレンダ時は日付が決まらないので、高さだけ確保してガタつきを抑える。 -->
								<div class="about-sample-placeholder card" aria-hidden="true"></div>
							{/if}
							<figcaption>
								<span class="about-sample-badge">{m.aboutSampleBadge()}</span>
								{m.aboutSampleNote()}
							</figcaption>
						</figure>
					{/if}
				</div>
			</section>
		{/each}
	</div>

	<section class="landing-section">
		<header class="about-section-head">
			<h2>{m.landingLiveHeading()}</h2>
			<p>{m.landingLiveLead()}</p>
		</header>
		<LandingLivePosts />
		<a class="about-text-link landing-more" href="/feed">{m.landingLiveMore()} →</a>
	</section>

	<section class="landing-final">
		<img
			class="landing-final-bot"
			src="/bot_assist_sitting.png"
			alt={m.heroSampleBotName()}
			width="264"
			height="350"
			loading="lazy"
		/>
		<h2>{m.aboutFinalHeading()}</h2>
		<p>{m.aboutFinalBody()}</p>
		<div class="landing-cta">
			<Button variant="primary" size="lg" href="/login#signup">{m.aboutHeroCta()}</Button>
			<a class="about-text-link" href="/about">{m.welcomeAboutLink()} →</a>
		</div>
	</section>

	<footer class="landing-footer">
		<div class="legal-links">
			<a href="/about">{m.aboutLink()}</a><a href="/terms">{m.termsLink()}</a><a href="/privacy"
				>{m.privacyLink()}</a
			>
		</div>
	</footer>
</div>
