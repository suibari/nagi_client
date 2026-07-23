<script lang="ts">
	import { page } from '$app/state';
	import { navItems, isActive, formatUnread } from './nav';
	import { m } from '$lib/i18n/i18n.svelte';
	import { unreadCount } from '$lib/notifications/unread.svelte';
	import { unreadNews } from '$lib/news/unread.svelte';
	import Icon from './Icon.svelte';
</script>

<nav class="mobile-nav" aria-label={m.mainNavAria()}>
	{#each navItems as item (item.href)}
		<a
			href={item.href}
			class:active={isActive(page.url.pathname, item.href)}
			aria-current={isActive(page.url.pathname, item.href) ? 'page' : undefined}
		>
			<span class="nav-icon">
				<Icon name={item.icon} size={22} />
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
			</span><span>{item.label()}</span>
		</a>
	{/each}
</nav>
