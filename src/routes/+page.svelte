<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	/**
	 * TOP — フィードそのもの。公開部分（見出し・ヒーロー）はサインイン前にも見せる。
	 * 投稿は左下／右下の FAB からポストモーダルで行う（+layout.svelte に常駐）。
	 */
	import Spinner from '$lib/components/Spinner.svelte';
	import CardDrawEntry from '$lib/components/CardDrawEntry.svelte';
	import FeedTabsView from '$lib/components/FeedTabsView.svelte';
	import GuestHero from '$lib/components/GuestHero.svelte';
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
<PageHeader title={m.navFeed()}>
	{#snippet actions()}<CardDrawEntry variant="header" />{/snippet}
</PageHeader>

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
