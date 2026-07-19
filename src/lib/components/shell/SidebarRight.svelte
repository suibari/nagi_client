<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
</script>

<aside class="sidebar sidebar-right">
	<div class="side-card">
		<h2>{m.aboutTitle()}</h2>
		<p>
			{m.aboutBeforeLink()}<a href="https://suibari.com/character/">{m.aboutLinkText()}</a
			>{m.aboutAfterLink()}
		</p>
	</div>
	<div class="side-card">
		<h2>{m.tabsGuideTitle()}</h2>
		<p>
			{m.tabsGuideBody()}
		</p>
	</div>
	<div class="spacer"></div>
	<footer class="side-footer">
		<a href="/terms">{m.termsLink()}</a><a href="/privacy">{m.privacyLink()}</a><span>© Nagi</span>
	</footer>
</aside>
