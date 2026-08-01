<script lang="ts">
	import { signIn, signUp, oauthError } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { getCrosspostEnabled, markCrosspostPending } from '$lib/crosspost/preferences';
	import { getStandardSiteEnabled, markStandardSitePending } from '$lib/standardsite/preferences';
	import HandleInput from '$lib/components/HandleInput.svelte';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import { onMount } from 'svelte';

	type AuthAction = 'login' | 'signup';

	let handle = $state('');
	let busy = $state<AuthAction | null>(null);
	// 他サービス連携（Blueskyクロスポスト / standard.site）はまとめて1つのスイッチで扱う。
	// 権限は初回にまとめて渡し、どちらを実際に使うかは設定画面で切り替える方針。
	let federateOptIn = $state(false);
	onMount(() => {
		// 前回どちらかを有効にしていたら、スイッチの初期値も ON にして復元する。
		// enabled フラグはログアウトをまたいで残るので、うっかりログアウトや再ログインでも
		// 1 回のサインインで元の状態に戻せる。
		federateOptIn = getCrosspostEnabled() || getStandardSiteEnabled();
	});
	async function submit(action: AuthAction) {
		if (busy || (action === 'login' && !handle.trim())) return;
		busy = action;
		oauthError.set(null);
		try {
			const options = federateOptIn ? { crosspost: true, standardSite: true } : {};
			if (federateOptIn) {
				// 連携ありで進むときは、最初から両方の書き込み権限を含むスコープで
				// 認可し、復帰後に有効化を確定させるため保留フラグを立てておく。
				markCrosspostPending();
				markStandardSitePending();
			}
			if (action === 'signup') await signUp(options);
			else await signIn(handle, options);
		} catch (error) {
			console.error('[oauth] failed to start authorization', error);
			oauthError.set(m.loginStartFailed());
		} finally {
			busy = null;
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
			disabled={busy !== null}
			onsubmit={() => void submit('login')}
		/></label
	>
	<div class="federate-optin">
		<ToggleSwitch
			checked={federateOptIn}
			label={m.loginFederateLabel()}
			disabled={busy !== null}
			onchange={(next) => (federateOptIn = next)}
		/>
		<p class="hint">{m.loginFederateNote()}</p>
	</div>
	<button disabled={busy !== null || !handle.trim()} onclick={() => void submit('login')}
		>{busy === 'login' ? m.loginRedirecting() : m.loginSubmit()}</button
	>
	<section class="signup-section" id="signup">
		<h2>{m.loginSignupTitle()}</h2>
		<p>{m.loginSignupBody()}</p>
		<button class="signup-button" disabled={busy !== null} onclick={() => void submit('signup')}
			>{busy === 'signup' ? m.loginSignupRedirecting() : m.loginSignupSubmit()}</button
		>
	</section>
	{#if $oauthError}<p class="error">{$oauthError}</p>{/if}
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
	.signup-section {
		margin-top: 26px;
		padding-top: 24px;
		border-top: 1px solid var(--line);
		scroll-margin-top: 24px;
	}
	.signup-section h2 {
		margin: 0;
		font-size: 18px;
		color: var(--text-strong);
	}
	.signup-section p {
		margin: 8px 0 16px;
		font-size: 13px;
	}
	.signup-button {
		width: 100%;
		padding: 12px 18px;
		border: 1px solid var(--accent);
		border-radius: var(--r-md);
		background: transparent;
		color: var(--accent-strong);
		font-weight: 700;
	}
	.signup-button:hover {
		background: var(--bg-inset);
	}
	.signup-button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	/* 18歳以上の告知と規約同意。両方の入口の直下に置いて、押す前に目に入るようにする。 */
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
