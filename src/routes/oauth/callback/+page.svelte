<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
</script>

<section class="auth-card">
	<div class="mark large">{m.brandMark()}</div>
	<h1>{m.oauthLoggingIn()}</h1>
	<p>{m.oauthBody()}</p>
	<a href="/">{m.backToTimeline()}</a>
</section>
