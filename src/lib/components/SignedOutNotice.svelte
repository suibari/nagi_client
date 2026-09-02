<script lang="ts">
	import { page } from '$app/state';
	import { m } from '$lib/i18n/i18n.svelte';
	import { setOAuthReturnTo } from '$lib/oauth/session.svelte';

	/**
	 * 設定画面の未ログイン表示。ページごとに違うのは文言だけのはずが、
	 * ログイン導線の有無・fieldset の有無・見た目がバラついていたのでここに集約する。
	 * legend を渡すと fieldset で囲む（そのページの他の設定項目と枠の形を揃えたいとき用）。
	 */
	let { message, legend }: { message: string; legend?: string } = $props();

	function rememberReturnTo() {
		// ログイン後に見ていた設定ページへ戻す。遷移そのものは href に任せる。
		setOAuthReturnTo(page.url.pathname + page.url.search);
	}
</script>

{#snippet body()}
	<p>{message}</p>
	<a class="login" href="/login" onclick={rememberReturnTo}>{m.login()}</a>
{/snippet}

{#if legend}
	<fieldset class="theme-settings signed-out-notice">
		<legend>{legend}</legend>
		{@render body()}
	</fieldset>
{:else}
	<div class="signed-out-notice">
		{@render body()}
	</div>
{/if}

<style>
	.signed-out-notice p {
		margin: 0.35rem 0 0;
	}
	/* .auth-card 直下ではないので .auth-card > a のブロック表示は効かない。
	   どこに置いても同じボタンに見えるよう、この中で完結させる。 */
	.signed-out-notice .login {
		display: block;
		margin-top: 20px;
		font-size: 13px;
		text-align: center;
	}
</style>
