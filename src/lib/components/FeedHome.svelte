<script lang="ts">
	/**
	 * フィードの画面。サインイン済みの TOP（`/`）と、誰でも開ける `/feed` が同じものを描く。
	 * 未サインインの TOP はランディング（landing/Landing.svelte）に譲り、
	 * タイムラインと端末保存の投稿は `/feed` で見せる。
	 * 投稿は左下／右下の FAB からポストモーダルで行う（+layout.svelte に常駐）。
	 * 今日のカードはゼンカツ（/cards）から引く。フィードに置くと毎日開く義務のように見えるため。
	 */
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import FeedTabsView from '$lib/components/FeedTabsView.svelte';
	import WelcomeTutorialEntry from '$lib/components/WelcomeTutorialEntry.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady } from '$lib/oauth/session.svelte';
</script>

<!-- 見出しは $oauthReady のゲートの外に置く。ゲートの中だとプリレンダ結果がスピナーだけになる。
     並び（見出し → フィード）は guest-posts/privacy.test.ts が固定している。 -->
<PageHeader title={m.navFeed()} />

<WelcomeTutorialEntry />

{#if !$oauthReady}
	<Spinner />
{:else}
	<FeedTabsView />
{/if}
