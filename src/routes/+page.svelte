<script lang="ts">
	/**
	 * TOP。サインイン済みならフィード、未サインインならランディング。
	 * プリレンダ時はセッションが無いのでランディングが HTML に入る（検索エンジンと初回訪問者向け）。
	 * 認証確認中のランディングは Landing 側の CSS で隠す。
	 * 未サインインのタイムラインと端末保存の投稿は `/feed` にある。
	 */
	import FeedHome from '$lib/components/FeedHome.svelte';
	import Landing from '$lib/components/landing/Landing.svelte';
	import { session } from '$lib/oauth/session.svelte';
</script>

{#if $session}
	<FeedHome />
{:else}
	<Landing />
{/if}
