<script lang="ts">
	import { signIn, oauthError } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { getCrosspostEnabled, markCrosspostPending } from '$lib/crosspost/preferences';
	import { getStandardSiteEnabled, markStandardSitePending } from '$lib/standardsite/preferences';
	import HandleInput from '$lib/components/HandleInput.svelte';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import { onMount } from 'svelte';
	let handle = $state('');
	let busy = $state(false);
	// 他サービス連携（Blueskyクロスポスト / standard.site）はまとめて1つのスイッチで扱う。
	// 権限は初回にまとめて渡し、どちらを実際に使うかは設定画面で切り替える方針。
	let federateOptIn = $state(false);
	onMount(() => {
		// 前回どちらかを有効にしていたら、スイッチの初期値も ON にして復元する。
		// enabled フラグはログアウトをまたいで残るので、うっかりログアウトや再ログインでも
		// 1 回のサインインで元の状態に戻せる。
		federateOptIn = getCrosspostEnabled() || getStandardSiteEnabled();
	});
	async function submit() {
		busy = true;
		try {
			if (federateOptIn) {
				// 連携ありでログインするときは、最初から両方の書き込み権限を含むスコープで
				// 認可し、復帰後に有効化を確定させるため保留フラグを立てておく。
				markCrosspostPending();
				markStandardSitePending();
				await signIn(handle, { crosspost: true, standardSite: true });
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
		/></label
	>
	<div class="federate-optin">
		<ToggleSwitch
			checked={federateOptIn}
			label={m.loginFederateLabel()}
			disabled={busy}
			onchange={(next) => (federateOptIn = next)}
		/>
		<p class="hint">{m.loginFederateNote()}</p>
	</div>
	<button disabled={busy || !handle.trim()} onclick={submit}
		>{busy ? m.loginRedirecting() : m.loginSubmit()}</button
	>{#if $oauthError}<p class="error">{$oauthError}</p>{/if}
	<p class="legal-note">
		{m.loginAgeNotice()}
		{m.loginAgreeBefore()}<a href="/terms">{m.termsLink()}</a>{m.loginAgreeSeparator()}<a
			href="/privacy">{m.privacyLink()}</a
		>{m.loginAgreeAfter()}
	</p>
	<a href="/">{m.loginBrowse()}</a>
</section>

<style>
	/* ToggleSwitch は内部で <button> を描画するため、.auth-card 直下に置くと
	   .auth-card > button のプライマリボタン装飾を拾ってしまう。div で包んで直下 button を回避する。 */
	.federate-optin {
		margin: 24px 0;
	}
	/* トグル直下の補足文。カード内の他の段落より小さく、左寄せでトグルと揃える。 */
	.hint {
		margin-top: 6px;
		text-align: left;
		font-size: 12px;
	}
	/* 18歳以上の告知と規約同意。ログインボタンの直下に置いて、押す前に目に入るようにする。 */
	.legal-note {
		margin-top: 14px;
		font-size: 12px;
		color: var(--text-faint);
		line-height: 1.7;
	}
	.legal-note a {
		color: var(--accent-strong);
		text-decoration: underline;
	}
</style>
