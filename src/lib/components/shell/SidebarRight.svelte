<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import SidebarSearch from './SidebarSearch.svelte';
	import RadioContent from '$lib/radio/RadioContent.svelte';
	import { radio } from '$lib/radio/radio.svelte';
</script>

<!-- 右サイドバーは 1100px 未満で消える。検索ボックスはそのため PC 専用
     （スマホから使えないのは許容した判断）。 -->
<aside class="sidebar sidebar-right">
	<SidebarSearch />
	{#if radio.track}<RadioContent track={radio.track} />{/if}
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
