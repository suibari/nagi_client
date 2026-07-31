<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
</script>

<!-- 「みんなで全肯定」は my Nagi へ昇格した。右サイドバーは 1100px 未満で消えるため、
     ここに置いていた間はタブレット・スマホから見えていなかった。 -->
<aside class="sidebar sidebar-right">
	<div class="spacer"></div>
	<footer class="side-footer">
		<a class="suibari-brand" href="https://suibari.com" target="_blank" rel="noreferrer noopener">
			<img src="/suibari_logo.png" alt="suibari.com" width="737" height="158" />
		</a>
		<div class="side-footer-links">
			<a href="/terms">{m.termsLink()}</a><a href="/privacy">{m.privacyLink()}</a><a href="/about"
				>{m.aboutLink()}</a
			><span>© Nagi</span>
		</div>
	</footer>
</aside>
