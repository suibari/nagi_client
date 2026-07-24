<script lang="ts">
	import Icon from '$lib/components/shell/Icon.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';

	// m.* はロケールを読むアクセサ。文字列に展開せず関数のまま持ち、
	// テンプレートで呼ぶことで言語切り替えに追従させる。
	type Feature = {
		icon: string;
		title: () => string;
		body: () => string;
		href?: string;
		link?: () => string;
	};
	const features: Feature[] = [
		{ icon: 'bot', title: m.aboutBotTitle, body: m.aboutBotBody },
		{ icon: 'heart', title: m.aboutNoLikesTitle, body: m.aboutNoLikesBody },
		{
			icon: 'hash',
			title: m.aboutChannelsTitle,
			body: m.aboutChannelsBody,
			href: '/channels',
			link: m.aboutChannelsLink,
		},
		{ icon: 'emoji', title: m.aboutReactionTitle, body: m.aboutReactionBody },
		{
			icon: 'emojiPlus',
			title: m.aboutCustomEmojiTitle,
			body: m.aboutCustomEmojiBody,
			href: '/settings/emoji',
			link: m.aboutCustomEmojiLink,
		},
		{ icon: 'markdown', title: m.aboutMarkdownTitle, body: m.aboutMarkdownBody },
		{ icon: 'text', title: m.aboutLongPostTitle, body: m.aboutLongPostBody },
		{
			icon: 'language',
			title: m.aboutTranslateTitle,
			body: m.aboutTranslateBody,
			href: '/settings/language',
			link: m.aboutTranslateLink,
		},
		{
			icon: 'send',
			title: m.aboutCrosspostTitle,
			body: m.aboutCrosspostBody,
			href: '/settings/crosspost',
			link: m.aboutCrosspostLink,
		},
		{
			icon: 'profile',
			title: m.aboutProfileTitle,
			body: m.aboutProfileBody,
			href: '/settings/profile',
			link: m.aboutProfileLink,
		},
		{
			icon: 'shield',
			title: m.aboutDataTitle,
			body: m.aboutDataBody,
			href: '/settings/delete-data',
			link: m.aboutDataLink,
		},
	];
</script>

<section class="auth-card settings-detail">
	<!-- 未サインインで来る導線（ホームの「Nagiのことを知る」）があるので、
	     戻り先はログイン状態で出し分ける。 -->
	{#if $session}
		<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	{:else if $oauthReady}
		<a class="settings-back" href="/">← {m.backToHome()}</a>
	{/if}
	<h1>{m.settingsAboutTitle()}</h1>
	<p>
		{m.aboutBeforeLink()}<a href="https://suibari.com/character/">{m.aboutLinkText()}</a
		>{m.aboutAfterLink()}
	</p>

	<h2 class="about-heading">{m.aboutFeaturesHeading()}</h2>
	<p class="about-lead">{m.aboutFeaturesLead()}</p>
	<ul class="about-features">
		{#each features as feature (feature.icon)}
			<li class="about-feature">
				<span class="about-feature-icon"><Icon name={feature.icon} size={22} /></span>
				<div>
					<h3>{feature.title()}</h3>
					<p>{feature.body()}</p>
					{#if feature.href && feature.link}
						<a class="about-feature-link" href={feature.href}>{feature.link()} →</a>
					{/if}
				</div>
			</li>
		{/each}
	</ul>

	<div class="legal-links">
		<a href="/terms">{m.termsLink()}</a><a href="/privacy">{m.privacyLink()}</a>
	</div>
</section>
