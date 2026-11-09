<script lang="ts">
	/**
	 * フィード。サインイン済みの人は TOP（`/`）でも同じものを見る。
	 * 未サインインの TOP はランディングなので、タイムラインと端末保存の投稿（ゲスト投稿）はここで見せる。
	 * `?tab=<id>` のクエリは FeedTabsView が読む。
	 */
	import FeedHome from '$lib/components/FeedHome.svelte';
</script>

<FeedHome />
