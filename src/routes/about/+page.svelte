<script lang="ts">
	import Icon from '$lib/components/shell/Icon.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';

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
	// 一覧で圧倒しないよう、1枚 = アイコン + 見出し + 1行。詳細は各設定ページに任せ、
	// href があるカードは全体をリンクにする。
	const features: Feature[] = [
		{ icon: 'hash', title: m.aboutChannelsTitle, body: m.aboutChannelsBody, href: '/channels' },
		{ icon: 'emoji', title: m.aboutReactionTitle, body: m.aboutReactionBody },
		{
			icon: 'emojiPlus',
			title: m.aboutCustomEmojiTitle,
			body: m.aboutCustomEmojiBody,
			href: '/settings/emoji',
		},
		{ icon: 'markdown', title: m.aboutMarkdownTitle, body: m.aboutMarkdownBody },
		{ icon: 'edit', title: m.aboutEditTitle, body: m.aboutEditBody },
		{
			icon: 'language',
			title: m.aboutTranslateTitle,
			body: m.aboutTranslateBody,
			href: '/settings/language',
		},
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

	// 参加導線はサインイン前にだけ意味がある。$oauthReady を待つのは、
	// 復元中に一瞬 CTA が出て消えるのを避けるため。
	const showJoin = $derived($oauthReady && !$session);
</script>

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
		<div class="about-hero-figure">
			<img src="/bot_image_hero.webp" alt={m.aboutHeroImageAlt()} width="879" height="1319" />
		</div>
		<div class="about-hero-copy">
			<p class="eyebrow">{m.aboutHeroEyebrow()}</p>
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
	</section>

	<section class="about-section">
		<h2 class="about-heading">{m.aboutWhyHeading()}</h2>
		<p class="about-lead">{m.aboutWhyLead()}</p>
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
		<h2 class="about-heading">{m.aboutStepsHeading()}</h2>
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
		<h2 class="about-heading">{m.aboutFeaturesHeading()}</h2>
		<p class="about-lead">{m.aboutFeaturesLead()}</p>
		<ul class="about-features">
			{#each features as feature (feature.icon)}
				<li>
					<svelte:element
						this={feature.href ? 'a' : 'div'}
						class="about-feature"
						href={feature.href}
					>
						<span class="about-feature-icon"><Icon name={feature.icon} size={20} /></span>
						<h3>{feature.title()}</h3>
						<p>{feature.body()}</p>
					</svelte:element>
				</li>
			{/each}
		</ul>
	</section>

	<section class="about-section">
		<h2 class="about-heading">{m.aboutAtprotoHeading()}</h2>
		<p class="about-lead">{m.aboutAtprotoLead()}</p>
		<!-- テーブルではなくグリッドで組む。600px 未満でも横スクロールを出さないため、
		     狭幅ではラベルを1行、2つの値を2列で並べる形に畳む。 -->
		<div class="about-compare">
			<div class="about-compare-head" aria-hidden="true">
				<span></span>
				<span>{m.aboutAtprotoColOld()}</span>
				<span class="is-nagi">{m.aboutAtprotoColNagi()}</span>
			</div>
			{#each compareRows as row (row.label())}
				<div class="about-compare-row">
					<span class="about-compare-label">{row.label()}</span>
					<span class="about-compare-old">
						<span class="about-compare-caption">{m.aboutAtprotoColOld()}</span>
						{row.old()}
					</span>
					<span class="about-compare-nagi">
						<span class="about-compare-caption">{m.aboutAtprotoColNagi()}</span>
						{row.nagi()}
					</span>
				</div>
			{/each}
		</div>
		<p class="about-note">{m.aboutAtprotoNote()}</p>
	</section>

	{#if showJoin}
		<section class="about-final">
			<h2>{m.aboutFinalHeading()}</h2>
			<p>{m.aboutFinalBody()}</p>
			<div class="about-cta">
				<a class="primary" href="/login">{m.aboutHeroCta()}</a>
				<a class="about-browse" href="/">{m.loginBrowse()}</a>
			</div>
		</section>
	{/if}

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
</div>
