<script lang="ts">
	import { page } from '$app/state';
	import { navItems, isActive } from './nav';
	import Icon from './Icon.svelte';
</script>

<nav class="mobile-nav" aria-label="メインナビゲーション">
	{#each navItems as item (item.href)}
		<a
			href={item.href}
			class:active={isActive(page.url.pathname, item.href)}
			aria-current={isActive(page.url.pathname, item.href) ? 'page' : undefined}
		>
			<Icon name={item.icon} size={22} /><span>{item.label}</span>
		</a>
	{/each}
</nav>
