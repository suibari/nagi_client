<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { portal } from '$lib/actions/portal';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session, setOAuthReturnTo, signIn } from '$lib/oauth/session.svelte';
	import { grantedOptIns } from '$lib/optin/scope-optin';
	import { onMount } from 'svelte';

	/** Bluesky への操作に要る権限を、操作しようとしたときに案内する（AUTH-08）。 */
	let { onclose }: { onclose: () => void } = $props();

	let busy = $state(false);
	let error = $state('');
	let cancelButton = $state<HTMLElement>();
	onMount(() => cancelButton?.focus());

	async function grant() {
		if (!$session || busy) return;
		busy = true;
		error = '';
		try {
			setOAuthReturnTo(location.pathname + location.search + location.hash);
			// クロスポストの保留フラグは立てない。権限を足すだけで「Blueskyにも」を勝手に有効にしない。
			await signIn($session.did, { ...(await grantedOptIns()), crosspost: true });
		} catch (cause) {
			error = cause instanceof Error ? cause.message : m.loginStartFailed();
			busy = false;
		}
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !busy) onclose();
	}
	function backdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget && !busy) onclose();
	}
</script>

<svelte:window onkeydown={keydown} />
<div class="delete-backdrop" role="presentation" onclick={backdropClick} use:portal>
	<div
		class="delete-dialog"
		role="dialog"
		aria-modal="true"
		aria-labelledby="bsky-permission-title"
	>
		<h2 id="bsky-permission-title">{m.bskyPermissionTitle()}</h2>
		<p>{m.bskyPermissionBody()}</p>
		{#if error}<p class="delete-error" role="alert">{error}</p>{/if}
		<div class="delete-actions">
			<Button
				variant="secondary"
				bind:ref={cancelButton}
				type="button"
				disabled={busy}
				onclick={onclose}>{m.cancel()}</Button
			>
			<Button variant="primary" type="button" disabled={busy} onclick={grant}>
				{#if busy}<Spinner inline size="sm" decorative />{/if}
				{busy ? m.crosspostReauthPending() : m.crosspostReauthSubmit()}
			</Button>
		</div>
	</div>
</div>
