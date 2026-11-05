<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	/**
	 * TOP — フィードそのもの。公開部分（見出し・ヒーロー）はサインイン前にも見せる。
	 * 投稿は左下／右下の FAB からポストモーダルで行う（+layout.svelte に常駐）。
	 */
	import Spinner from '$lib/components/Spinner.svelte';
	import FeedTabsView from '$lib/components/FeedTabsView.svelte';
	import GuestHero from '$lib/components/GuestHero.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';

	// プリレンダHTMLには紹介を残し、認証確認中は GuestHero の CSS で隠す。
	const showHero = $derived(!$session);
</script>

<!-- 見出しとヒーローは $oauthReady のゲートの外に置く。ゲートの中だとプリレンダ結果が
     スピナーだけになり、検索エンジンにも初回訪問者にも中身の無いトップページが出る。
     並び（見出し → ヒーロー → フィード）は guest-posts/privacy.test.ts が固定している。
     今日のカードはゼンカツ（/cards）から引く。フィードに置くと毎日開く義務のように見えるため。 -->
<PageHeader title={m.navFeed()} />

{#if showHero}
	<GuestHero />
{/if}

{#if !$oauthReady}
	<Spinner />
{:else}
	<FeedTabsView hideWelcome={showHero} />
{/if}

<style>
</style>
