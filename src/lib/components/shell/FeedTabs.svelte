<script lang="ts">
	import { page } from '$app/state';
	import { m } from '$lib/i18n/i18n.svelte';
	import { unreadNews } from '$lib/news/unread.svelte';
</script>

<nav class="feed-tabs" aria-label={m.feedTabsAria()}>
	<a href="/" class:active={page.url.pathname === '/'}>{m.navGlobal()}</a>
	<a href="/affirmation" class:active={page.url.pathname.startsWith('/affirmation')}
		>{m.navAffirmation()}</a
	>
	<a href="/news" class:active={page.url.pathname.startsWith('/news')}
		><span class="feed-tab-label"
			>{m.navNews()}{#if $unreadNews}<span class="news-unread-dot"
					><span class="visually-hidden">{m.newsUnreadAria()}</span></span
				>{/if}</span
		></a
	>
</nav>
