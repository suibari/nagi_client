<script lang="ts">
	import { signIn, oauthError } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { getCrosspostEnabled, markCrosspostPending } from '$lib/crosspost/preferences';
	import HandleInput from '$lib/components/HandleInput.svelte';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import { onMount } from 'svelte';
	let handle = $state('');
	let busy = $state(false);
	let crosspostOptIn = $state(false);
	onMount(() => {
		// 前回クロスポストを有効にしていたら、スイッチの初期値も ON にして復元する。
		// enabled フラグはログアウトをまたいで残るので、うっかりログアウトや再ログインでも
		// 1 回のサインインで元の状態に戻せる。
		crosspostOptIn = getCrosspostEnabled();
	});
	async function submit() {
		busy = true;
		try {
			if (crosspostOptIn) {
				// クロスポスト有効でログインするときは、最初から Bluesky への投稿権限を含む
				// スコープで認可し、復帰後に有効化を確定させるため保留フラグを立てておく。
				markCrosspostPending();
				await signIn(handle, { crosspost: true });
			} else {
				await signIn(handle);
			}
		} finally {
			busy = false;
		}
	}
</script>

<section class="auth-card">
	<img class="mark large" src="/nagi_icon.png" alt="" />
	<h1>{m.loginTitle()}</h1>
	<p>
		{m.loginBody()}
	</p>
	<label
		>{m.loginHandleLabel()}<HandleInput
			bind:value={handle}
			placeholder="yourname.bsky.social"
			ariaLabel={m.loginHandleLabel()}
			disabled={busy}
			onsubmit={submit}
			onselect={(h) => {
				handle = h;
				submit();
			}}
		/></label
	><ToggleSwitch
		checked={crosspostOptIn}
		label={m.loginCrosspostLabel()}
		disabled={busy}
		onchange={(next) => (crosspostOptIn = next)}
	/>
	<p class="hint">{m.loginCrosspostNote()}</p>
	<button disabled={busy || !handle.trim()} onclick={submit}
		>{busy ? m.loginRedirecting() : m.loginSubmit()}</button
	>{#if $oauthError}<p class="error">{$oauthError}</p>{/if}<a href="/">{m.loginBrowse()}</a>
</section>

<style>
	/* トグル直下の補足文。カード内の他の段落より小さく、左寄せでトグルと揃える。 */
	.hint {
		margin-top: 6px;
		text-align: left;
		font-size: 12px;
	}
</style>
