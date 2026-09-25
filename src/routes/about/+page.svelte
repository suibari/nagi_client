<script lang="ts">
	import {
		sampleAvatar,
		sampleChronicle,
		sampleDisplayName,
		sampleMoods,
		sampleNameCard,
	} from '$lib/about/samples';
	import BusinessCard from '$lib/components/BusinessCard.svelte';
	import ChronicleTimeline from '$lib/components/ChronicleTimeline.svelte';
	import DiaryMoodChart from '$lib/components/DiaryMoodChart.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import { onMount } from 'svelte';

	// m.* はロケールを読むアクセサ。文字列に展開せず関数のまま持ち、
	// テンプレートで呼ぶことで言語切り替えに追従させる。
	type Reason = { icon: string; title: () => string; body: () => string };
	type Step = { title: () => string; body: () => string };
	type Feature = {
		icon: string;
		title: () => string;
		body: () => string;
		href?: string;
	};
	/**
	 * 機能のカテゴリ。十数個を平らに並べると「羅列」に見えて、どれも同じ重みの
	 * 設定項目のように読めてしまうので、意味のまとまりごとに見出しと色を与える。
	 * 色だけだと何の色か分からないため、必ず見出しとセットで出す。
	 */
	type FeatureCategory = 'connect' | 'keep' | 'own' | 'reach';
	type FeatureGroup = { category: FeatureCategory; label: () => string; items: Feature[] };
	type CompareRow = { label: () => string; old: () => string; nagi: () => string };

	// 「選ばれる理由」。ここで語ったものは下の機能一覧には重ねない。
	const reasons: Reason[] = [
		{ icon: 'bot', title: m.aboutBotTitle, body: m.aboutBotBody },
		{ icon: 'heart', title: m.aboutNoLikesTitle, body: m.aboutNoLikesBody },
		{ icon: 'text', title: m.aboutLongPostTitle, body: m.aboutLongPostBody },
	];
	const steps: Step[] = [
		{ title: m.aboutStep1Title, body: m.aboutStep1Body },
		{ title: m.aboutStep2Title, body: m.aboutStep2Body },
		{ title: m.aboutStep3Title, body: m.aboutStep3Body },
	];
	// 一覧で圧倒しないよう、1項目 = アイコン + 見出し + 1行。詳細は各設定ページに任せ、
	// href がある項目は全体をリンクにする。
	// 並びは「人とつながる → 残る → 自分で決める → 外へ」。こっそりを先頭に置くと
	// Nagi 全体がこっそり前提の場所に見えるので、つながる機能の後に置く。
	const featureGroups: FeatureGroup[] = [
		{
			category: 'connect',
			label: m.aboutCategoryConnect,
			items: [
				{ icon: 'hash', title: m.aboutChannelsTitle, body: m.aboutChannelsBody, href: '/channels' },
				{ icon: 'emoji', title: m.aboutReactionTitle, body: m.aboutReactionBody },
				{ icon: 'newspaper', title: m.aboutNewsTitle, body: m.aboutNewsBody, href: '/news' },
				{
					icon: 'emojiPlus',
					title: m.aboutCustomEmojiTitle,
					body: m.aboutCustomEmojiBody,
					href: '/settings/emoji',
				},
				{
					icon: 'language',
					title: m.aboutTranslateTitle,
					body: m.aboutTranslateBody,
					href: '/settings/language',
				},
			],
		},
		{
			category: 'keep',
			label: m.aboutCategoryKeep,
			items: [
				{ icon: 'markdown', title: m.aboutMarkdownTitle, body: m.aboutMarkdownBody },
				{ icon: 'edit', title: m.aboutEditTitle, body: m.aboutEditBody },
			],
		},
		{
			category: 'own',
			label: m.aboutCategoryOwn,
			items: [
				{ icon: 'hide', title: m.aboutKossoriTitle, body: m.aboutKossoriBody },
				{
					icon: 'profile',
					title: m.aboutProfileTitle,
					body: m.aboutProfileBody,
					href: '/settings/profile',
				},
				{
					icon: 'shield',
					title: m.aboutDataTitle,
					body: m.aboutDataBody,
					href: '/settings/delete-data',
				},
			],
		},
		{
			category: 'reach',
			label: m.aboutCategoryReach,
			items: [
				{
					icon: 'send',
					title: m.aboutCrosspostTitle,
					body: m.aboutCrosspostBody,
					href: '/settings/crosspost',
				},
				{
					icon: 'link',
					title: m.aboutStandardSiteTitle,
					body: m.aboutStandardSiteBody,
					href: '/settings/crosspost',
				},
			],
		},
	];
	const compareRows: CompareRow[] = [
		{
			label: m.aboutAtprotoAccountLabel,
			old: m.aboutAtprotoAccountOld,
			nagi: m.aboutAtprotoAccountNagi,
		},
		{ label: m.aboutAtprotoDataLabel, old: m.aboutAtprotoDataOld, nagi: m.aboutAtprotoDataNagi },
		{
			label: m.aboutAtprotoShutdownLabel,
			old: m.aboutAtprotoShutdownOld,
			nagi: m.aboutAtprotoShutdownNagi,
		},
		{ label: m.aboutAtprotoLoginLabel, old: m.aboutAtprotoLoginOld, nagi: m.aboutAtprotoLoginNagi },
		{ label: m.aboutAtprotoMoveLabel, old: m.aboutAtprotoMoveOld, nagi: m.aboutAtprotoMoveNagi },
	];

	/**
	 * サインインしないと見られない機能を、架空ユーザーのサンプルで見せる。
	 * 実物のコンポーネントをそのまま使うので、見た目が本物とずれない。
	 */
	type ShowcaseId = 'mood' | 'chronicle' | 'nameCard';
	type Showcase = {
		id: ShowcaseId;
		icon: string;
		eyebrow: () => string;
		title: () => string;
		body: () => string;
		/** サインイン済みなら、本人のものへの導線を出す。 */
		href: (did: string) => string;
	};
	const showcases: Showcase[] = [
		{
			id: 'mood',
			icon: 'sun',
			eyebrow: m.aboutShowcaseMoodEyebrow,
			title: m.aboutShowcaseMoodTitle,
			body: m.aboutShowcaseMoodBody,
			href: () => '/diary?tab=mood',
		},
		{
			id: 'chronicle',
			icon: 'clock',
			eyebrow: m.aboutShowcaseChronicleEyebrow,
			title: m.aboutShowcaseChronicleTitle,
			body: m.aboutShowcaseChronicleBody,
			href: () => '/diary?tab=chronicle',
		},
		{
			id: 'nameCard',
			icon: 'profile',
			eyebrow: m.aboutShowcaseNameCardEyebrow,
			title: m.aboutShowcaseNameCardTitle,
			body: m.aboutShowcaseNameCardBody,
			href: (did) => `/profile/${did}`,
		},
	];
	const sampleCard = $derived(sampleNameCard(i18n.locale));
	const chronicleItems = $derived(sampleChronicle(i18n.locale));
	// 感情グラフは「今日までの1年」を描くので、日付がビルド時とずれないようクライアントでだけ組む。
	let mounted = $state(false);
	onMount(() => (mounted = true));
	const moodSample = $derived(mounted ? sampleMoods(i18n.locale) : undefined);
	let moodSelected = $state<string>();
	$effect(() => {
		if (moodSample) moodSelected = moodSample.selected;
	});

	// 参加導線はサインイン前にだけ意味がある。$oauthReady を待つのは、
	// 復元中に一瞬 CTA が出て消えるのを避けるため。
	const showJoin = $derived($oauthReady && !$session);
</script>

<!--
	構成は「ヒーロー → 理由 → 見本（サンプル付き） → 機能一覧 → はじめかた → AT Protocol → 締め」。
	枠（罫線で囲んだカード）はほぼ使わない。まとまりは余白と見出しで作り、色は面ではなく
	アイコンと小見出しに置く。囲むのは「画面の見本」を本文と見分けるためのサンプルだけ。
-->
<div class="about-page">
	<!-- 未サインインで来る導線（ホームの「Nagiのことを知る」）があるので、
	     戻り先はログイン状態で出し分ける。 -->
	{#if $session}
		<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	{:else if $oauthReady}
		<a class="settings-back" href="/">← {m.backToHome()}</a>
	{/if}

	<section class="about-hero">
		<!-- 「凪」らしいやわらかさを出すための泡。装飾なので読み上げ対象から外す。 -->
		<div class="about-bubbles" aria-hidden="true">
			{#each [1, 2, 3, 4, 5, 6] as bubble (bubble)}
				<span class="about-bubble b{bubble}"></span>
			{/each}
		</div>
		<div class="about-hero-copy">
			<p class="about-eyebrow">{m.aboutHeroEyebrow()}</p>
			<h1>{m.aboutHeroTitle()}</h1>
			<p class="about-hero-body">
				{m.aboutBeforeLink()}<a href="https://bot-tan.com/">{m.aboutLinkText()}</a
				>{m.aboutAfterLink()}
			</p>
			{#if showJoin}
				<div class="about-cta">
					<a class="primary" href="/login">{m.aboutHeroCta()}</a>
					<p class="about-cta-note">{m.aboutHeroCtaNote()}</p>
				</div>
			{/if}
		</div>
		<div class="about-hero-figure">
			<img src="/bot_image_hero.webp" alt={m.aboutHeroImageAlt()} width="879" height="1319" />
		</div>
	</section>

	<section class="about-section">
		<header class="about-section-head">
			<h2>{m.aboutWhyHeading()}</h2>
			<p>{m.aboutWhyLead()}</p>
		</header>
		<ul class="about-reasons">
			{#each reasons as reason (reason.icon)}
				<li class="about-reason">
					<span class="about-reason-icon"><Icon name={reason.icon} size={26} /></span>
					<h3>{reason.title()}</h3>
					<p>{reason.body()}</p>
				</li>
			{/each}
		</ul>
	</section>

	<section class="about-section">
		<header class="about-section-head">
			<h2>{m.aboutShowcaseHeading()}</h2>
			<p>{m.aboutShowcaseLead()}</p>
		</header>
		<div class="about-showcases">
			{#each showcases as showcase (showcase.id)}
				<article class="about-showcase">
					<div class="about-showcase-copy">
						<p class="about-eyebrow">
							<Icon name={showcase.icon} size={16} />{showcase.eyebrow()}
						</p>
						<h3>{showcase.title()}</h3>
						<p class="about-showcase-body">{showcase.body()}</p>
						{#if $session}
							<a class="about-text-link" href={showcase.href($session.did)}
								>{m.aboutShowcaseSeeYours()} →</a
							>
						{/if}
					</div>
					<figure class="about-sample" data-sample={showcase.id}>
						{#if showcase.id === 'mood'}
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
						{:else if showcase.id === 'chronicle'}
							<ChronicleTimeline
								did="did:plc:about-sample"
								displayName={sampleDisplayName(i18n.locale)}
								avatar={sampleAvatar()}
								preview={chronicleItems}
							/>
						{:else}
							<BusinessCard data={sampleCard} />
						{/if}
						<figcaption>
							<span class="about-sample-badge">{m.aboutSampleBadge()}</span>
							{m.aboutSampleNote()}
						</figcaption>
					</figure>
				</article>
			{/each}
		</div>
	</section>

	<section class="about-section">
		<header class="about-section-head">
			<h2>{m.aboutFeaturesHeading()}</h2>
			<p>{m.aboutFeaturesLead()}</p>
		</header>
		<div class="about-feature-groups">
			{#each featureGroups as group (group.category)}
				<div class="about-feature-group" data-category={group.category}>
					<h3 class="about-feature-group-label">{group.label()}</h3>
					<ul class="about-features">
						{#each group.items as feature (feature.icon)}
							<li>
								<svelte:element
									this={feature.href ? 'a' : 'div'}
									class="about-feature"
									href={feature.href}
								>
									<span class="about-feature-icon"><Icon name={feature.icon} size={18} /></span>
									<span class="about-feature-text">
										<strong>{feature.title()}</strong>
										<span>{feature.body()}</span>
									</span>
								</svelte:element>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<section class="about-section about-band">
		<header class="about-section-head">
			<h2>{m.aboutStepsHeading()}</h2>
		</header>
		<ol class="about-steps">
			{#each steps as step, i (i)}
				<li class="about-step">
					<span class="about-step-num" aria-hidden="true">{i + 1}</span>
					<h3>{step.title()}</h3>
					<p>{step.body()}</p>
				</li>
			{/each}
		</ol>
	</section>

	<section class="about-section">
		<header class="about-section-head">
			<h2>{m.aboutAtprotoHeading()}</h2>
			<p>{m.aboutAtprotoLead()}</p>
		</header>
		<!-- 表ではなく「従来」と「Nagi」の2列のリストで対比させる。狭幅では縦に積む。 -->
		<div class="about-compare">
			<div class="about-compare-col is-old">
				<h3>{m.aboutAtprotoColOld()}</h3>
				<dl>
					{#each compareRows as row (row.label())}
						<div>
							<dt>{row.label()}</dt>
							<dd>{row.old()}</dd>
						</div>
					{/each}
				</dl>
			</div>
			<div class="about-compare-col is-nagi">
				<h3>{m.aboutAtprotoColNagi()}</h3>
				<dl>
					{#each compareRows as row (row.label())}
						<div>
							<dt>{row.label()}</dt>
							<dd>{row.nagi()}</dd>
						</div>
					{/each}
				</dl>
			</div>
		</div>
		<p class="about-note">{m.aboutAtprotoNote()}</p>
	</section>

	{#if showJoin}
		<section class="about-final">
			<h2>{m.aboutFinalHeading()}</h2>
			<p>{m.aboutFinalBody()}</p>
			<div class="about-cta">
				<a class="primary" href="/login">{m.aboutHeroCta()}</a>
				<a class="about-text-link" href="/">{m.loginBrowse()}</a>
			</div>
		</section>
	{/if}

	<footer class="about-footer">
		<a
			class="about-suibari-brand"
			href="https://suibari.com"
			target="_blank"
			rel="noreferrer noopener"
		>
			<img src="/suibari_logo.png" alt="suibari.com" width="737" height="158" />
		</a>
		<div class="legal-links">
			<a href="/terms">{m.termsLink()}</a><a href="/privacy">{m.privacyLink()}</a>
		</div>
	</footer>
</div>
