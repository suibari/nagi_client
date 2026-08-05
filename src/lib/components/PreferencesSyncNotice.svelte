<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import { grantedOptIns } from '$lib/optin/scope-optin';
	import { session, signIn } from '$lib/oauth/session.svelte';
	import { preferences } from '$lib/preferences/preferences.svelte';

	/**
	 * permission-set に lxm を足した直後は、既存ユーザーのトークンに旧スコープが
	 * 焼き付いたままなので同期用の API が 403 を返す。その間は端末ローカルで従来どおり
	 * 動くが、黙って同期されないと「壊れている」ように見えるのでここで告知する。
	 * 認可サーバのキャッシュ（最大24h）が切れるまでは再ログインしても解消しないため、
	 * ボタンは「試せる導線」であって保証ではない。
	 */
	let busy = $state(false);

	async function reauthorize() {
		if (!$session || busy) return;
		busy = true;
		try {
			await signIn($session.did, { ...(await grantedOptIns()), refreshPermissions: true });
		} finally {
			busy = false;
		}
	}
</script>

{#if preferences.unauthorized && $session}
	<p class="sync-notice">
		{m.preferencesSyncUnavailable()}
		<button type="button" disabled={busy} onclick={reauthorize}
			>{m.preferencesSyncReauthorize()}</button
		>
	</p>
{/if}

<style>
	.sync-notice {
		margin: 0 0 1rem;
		padding: 0.75rem 0.9rem;
		border-radius: var(--radius-md, 10px);
		background: var(--surface-muted, rgba(127, 127, 127, 0.1));
		color: var(--text-muted, inherit);
		font-size: 0.85rem;
		line-height: 1.6;
	}
	.sync-notice button {
		display: block;
		margin-top: 0.5rem;
		padding: 0;
		border: 0;
		background: none;
		color: var(--accent, inherit);
		font: inherit;
		text-decoration: underline;
		cursor: pointer;
	}
	.sync-notice button:disabled {
		opacity: 0.6;
		cursor: default;
	}
</style>
