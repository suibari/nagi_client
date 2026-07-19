<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
</script>

<section class="auth-card">
	<div class="mark large">{m.brandMark()}</div>
	<h1>{m.welcomeTitle()}</h1>
	<p>{m.onboardingBody()}</p>
	<a class="login" href="/settings/profile?onboarding=1">{m.onboardingSetupProfile()}</a>
</section>
