<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import AgeAssuranceForm from '$lib/components/AgeAssuranceForm.svelte';
</script>

<section class="auth-card">
	<img class="mark large" src="/nagi_icon.png" alt="" />
	<h1>{m.welcomeTitle()}</h1>
	<p>{m.onboardingBody()}</p>
	<!--
		年齢は任意。入力せずに進めるが、その場合は18歳未満として扱われ、
		成人向けコンテンツは表示されない（あとから設定で1度だけ登録できる）。
		アカウントに紐づく情報なので、サインイン前には出さない。
	-->
	{#if $session}
		<p>{m.onboardingAgeIntro()}</p>
		<AgeAssuranceForm />
	{/if}
	<a class="login" href="/settings/profile?onboarding=1">{m.onboardingSetupProfile()}</a>
</section>
