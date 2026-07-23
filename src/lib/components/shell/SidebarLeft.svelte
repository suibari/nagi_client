<script lang="ts">
	import { page } from '$app/state';
	import { navItems, isActive, formatUnread } from './nav';
	import { m } from '$lib/i18n/i18n.svelte';
	import { unreadCount } from '$lib/notifications/unread.svelte';
	import { unreadNews } from '$lib/news/unread.svelte';
	import Icon from './Icon.svelte';
	import AccountCard from './AccountCard.svelte';
</script>

<aside class="sidebar sidebar-left">
	<a class="brand" href="/" aria-label="Nagi home"
		><img class="mark" src="/nagi_icon.png" alt="" /><span>Nagi</span></a
	>
	<nav class="side-nav" aria-label={m.mainNavAria()}>
		{#each navItems as item (item.href)}
			<a
				href={item.href}
				class:active={isActive(page.url.pathname, item.href)}
				title={item.label()}
				aria-current={isActive(page.url.pathname, item.href) ? 'page' : undefined}
			>
				<span class="nav-icon">
					<Icon name={item.icon} />
					{#if item.href === '/' && $unreadNews}
						<span class="news-unread-dot"
							><span class="visually-hidden">{m.newsUnreadAria()}</span></span
						>
					{/if}
					{#if item.href === '/notifications' && $unreadCount > 0}
						<span class="nav-badge" aria-label={m.notifUnreadBadgeAria({ count: $unreadCount })}
							>{formatUnread($unreadCount)}</span
						>
					{/if}
				</span><span class="label">{item.label()}</span>
			</a>
		{/each}
	</nav>
	<div class="spacer"></div>
	<AccountCard />
</aside>
