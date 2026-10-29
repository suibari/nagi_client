<script lang="ts">
	/**
	 * TOP — フィードそのもの。公開部分（見出し・ヒーロー）はサインイン前にも見せる。
	 * 投稿は左下／右下の FAB からポストモーダルで行う（+layout.svelte に常駐）。
	 */
	import Spinner from '$lib/components/Spinner.svelte';
	import CardDrawEntry from '$lib/components/CardDrawEntry.svelte';
	import FeedTabsView from '$lib/components/FeedTabsView.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { hadRecentSession, oauthReady, session } from '$lib/oauth/session.svelte';

	// プリレンダ時は $session も目印も無いのでヒーローが出る（＝クローラと初回訪問者が見る形）。
	// 戻ってきた利用者には、OAuth 復元を待たずに最初の描画から出さない。
	const showHero = $derived(!$session && !hadRecentSession());
</script>

<!-- 見出しとヒーローは $oauthReady のゲートの外に置く。ゲートの中だとプリレンダ結果が
     スピナーだけになり、検索エンジンにも初回訪問者にも中身の無いトップページが出る。
     並び（見出し → ヒーロー → フィード）は guest-posts/privacy.test.ts が固定している。
     CardDrawEntry は自身が $oauthReady を見ているので、ここでは何も描かない。 -->
<div class="feed-heading">
	<h1 class="feed-title">{m.navFeed()}</h1>
	<CardDrawEntry variant="header" />
</div>

{#if showHero}
	<section class="hero">
		<p class="eyebrow">{m.heroEyebrow()}</p>
		<h1>{m.heroTitle()}</h1>
		<p class="hero-body">{m.heroBody()}</p>
		<div class="hero-actions">
			<a class="hero-about" href="/about">{m.welcomeAboutLink()}</a>
			<a class="hero-join" href="/login">{m.joinCta()}</a>
		</div>
	</section>
{/if}

{#if !$oauthReady}
	<Spinner />
{:else}
	<FeedTabsView hideWelcome={showHero} />
{/if}

<style>
	.feed-title {
		flex: 0 1 auto;
		min-width: 0;
		margin: 0;
		font-size: 1.1rem;
		font-weight: 800;
	}

	.feed-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		inline-size: 100%;
		min-inline-size: 0;
		max-inline-size: 100%;
		margin-bottom: 12px;
	}
</style>
