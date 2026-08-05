<script lang="ts">
	import { page } from '$app/state';
	import { navItems, isActive, handleNavClick } from './nav';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './Icon.svelte';
	import NavBadge from './NavBadge.svelte';
</script>

<nav class="mobile-nav" aria-label={m.mainNavAria()}>
	{#each navItems as item (item.href)}
		<a
			href={item.href}
			class:active={isActive(page.url.pathname, item.href)}
			aria-current={isActive(page.url.pathname, item.href) ? 'page' : undefined}
			onclick={(event) => handleNavClick(event, page.url.pathname, item.href)}
		>
			<span class="nav-icon">
				<Icon name={item.icon} size={22} />
				{#if item.badge}<NavBadge {...item.badge} />{/if}
			</span><span>{item.label()}</span>
		</a>
	{/each}
</nav>
