<script lang="ts">
	import { page } from '$app/state';
</script>

<nav class="feed-tabs" aria-label="フィード切り替え">
	<a href="/" class:active={page.url.pathname === '/'}>グローバル</a>
	<a href="/affirmation" class:active={page.url.pathname.startsWith('/affirmation')}>全肯定</a>
</nav>
