<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
</script>

<section class="auth-card settings-detail">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsAboutTitle()}</h1>
	<p>
		{m.aboutBeforeLink()}<a href="https://suibari.com/character/">{m.aboutLinkText()}</a
		>{m.aboutAfterLink()}
	</p>
	<div class="legal-links">
		<a href="/terms">{m.termsLink()}</a><a href="/privacy">{m.privacyLink()}</a>
	</div>
</section>
