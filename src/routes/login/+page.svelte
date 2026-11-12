<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { signIn, signUp, oauthError } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { getCrosspostEnabled, markCrosspostPending } from '$lib/crosspost/preferences';
	import HandleInput from '$lib/components/HandleInput.svelte';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import { onMount } from 'svelte';

	type AuthAction = 'login' | 'signup';

	let handle = $state('');
	let busy = $state<AuthAction | null>(null);
	// standard.site は常に認可し、このスイッチは任意の Bluesky 連携（クロスポストとフィード閲覧）だけを扱う。
	let federateOptIn = $state(false);
	onMount(() => {
		// 前回クロスポストを有効にしていたら、スイッチの初期値も ON にして復元する。
		// enabled フラグはログアウトをまたいで残るので、うっかりログアウトや再ログインでも
		// 1 回のサインインで元の状態に戻せる。
		federateOptIn = getCrosspostEnabled();
	});
	async function submit(action: AuthAction) {
		if (busy || (action === 'login' && !handle.trim())) return;
		busy = action;
		oauthError.set(null);
		try {
			const options = federateOptIn ? { crosspost: true } : {};
			if (federateOptIn) {
				// 復帰後にクロスポストの有効化を確定させるため保留フラグを立てておく。
				markCrosspostPending();
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

<section class="auth-card login-card">
	<header class="login-head">
		<img class="mark" src="/nagi_icon.png" alt="" />
		<div>
			<h1>{m.loginTitle()}</h1>
			<p>{m.loginBody()}</p>
		</div>
	</header>
	<label
		>{m.loginHandleLabel()}<HandleInput
			bind:value={handle}
			placeholder="yourname.bsky.social"
			ariaLabel={m.loginHandleLabel()}
			disabled={busy !== null}
			onsubmit={() => void submit('login')}
		/></label
	>
	<!-- 連携はログインと新規登録の両方の認可に効くので、両ボタンより前に置く（AUTH-07）。 -->
	<div class="federate-optin">
		<ToggleSwitch
			checked={federateOptIn}
			label={m.loginFederateLabel()}
			disabled={busy !== null}
			onchange={(next) => (federateOptIn = next)}
		/>
		<p class="hint">{m.loginFederateNote()}</p>
	</div>
	<Button
		variant="primary"
		size="lg"
		block
		disabled={busy !== null || !handle.trim()}
		onclick={() => void submit('login')}
		>{busy === 'login' ? m.loginRedirecting() : m.loginSubmit()}</Button
	>
	<div class="signup-divider" role="presentation">{m.loginSignupTitle()}</div>
	<Button
		variant="secondary"
		size="lg"
		block
		disabled={busy !== null}
		onclick={() => void submit('signup')}
		>{busy === 'signup' ? m.loginSignupRedirecting() : m.loginCreateAccount()}</Button
	>
	{#if $oauthError}<p class="error">{$oauthError}</p>{/if}
	<p class="legal-note">
		{m.loginAgreeBefore()}<a href="/terms">{m.termsLink()}</a>{m.loginAgreeSeparator()}<a
			href="/privacy">{m.privacyLink()}</a
		>{m.loginAgreeAfter()}
	</p>
	<a href="/feed">{m.loginBrowse()}</a>
</section>

<style>
	.login-card {
		padding: 28px;
	}
	.login-head {
		display: flex;
		align-items: center;
		gap: 12px;
		text-align: left;
	}
	.login-head .mark {
		flex: none;
		width: 48px;
		height: 48px;
		border-radius: 15px;
	}
	.login-head h1 {
		margin: 0;
		font-size: 20px;
		line-height: 1.3;
	}
	.login-head p {
		margin: 2px 0 0;
		font-size: 13px;
		line-height: 1.5;
		text-wrap: pretty;
	}
	.login-card label {
		margin: 20px 0 14px;
	}
	/* ToggleSwitch は内部で <button> を描画するため、.auth-card 直下に置くと
	   .auth-card > button のプライマリボタン装飾を拾ってしまう。div で包んで直下 button を回避する。 */
	.federate-optin {
		margin: 0 0 18px;
	}
	.hint {
		margin-top: 4px;
		text-align: left;
		font-size: 12px;
		line-height: 1.5;
		text-wrap: pretty;
	}
	.signup-divider {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 20px 0 12px;
		color: var(--text-faint);
		font-size: 12px;
	}
	.signup-divider::before,
	.signup-divider::after {
		content: '';
		flex: 1;
		border-top: 1px solid var(--line);
	}
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
	@media (max-width: 767px) {
		.login-card {
			margin-block: 16px;
			padding: 20px;
		}
	}
</style>
