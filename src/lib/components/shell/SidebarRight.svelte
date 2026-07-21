<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
</script>

<aside class="sidebar sidebar-right">
	<div class="spacer"></div>
	<footer class="side-footer">
		<a href="/terms">{m.termsLink()}</a><a href="/privacy">{m.privacyLink()}</a><a
			href="/settings/about">{m.aboutLink()}</a
		><span>© Nagi</span>
	</footer>
</aside>
