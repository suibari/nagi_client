<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { page } from '$app/state';
	import { m } from '$lib/i18n/i18n.svelte';
	import { setOAuthReturnTo } from '$lib/oauth/session.svelte';

	/**
	 * 設定画面などの未ログイン表示。ページごとに違うのは文言だけなので、ここに集約する。
	 * 設定の面（.settings-panel）と同じ形の1枚に、説明とログインへの導線を置く。
	 */
	let { message }: { message: string } = $props();

	function rememberReturnTo() {
		// ログイン後に見ていた設定ページへ戻す。遷移そのものは href に任せる。
		setOAuthReturnTo(page.url.pathname + page.url.search);
	}
</script>

<div class="settings-panel signed-out-notice">
	<p>{message}</p>
	<Button variant="primary" href="/login" onclick={rememberReturnTo}>{m.login()}</Button>
</div>

<style>
	.signed-out-notice {
		justify-items: start;
		gap: 12px;
		padding: 16px;
	}
	.signed-out-notice p {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.9rem;
		line-height: 1.7;
	}
	/* 面の行区切り（> * + *）は、この中の段落とボタンには付けない。 */
	.signed-out-notice > :global(*) {
		border-top: 0;
	}
</style>
