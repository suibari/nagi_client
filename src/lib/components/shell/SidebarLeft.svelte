<script lang="ts">
	import { page } from '$app/state';
	import { navItems, isActive } from './nav';
	import Icon from './Icon.svelte';
	import AccountCard from './AccountCard.svelte';
</script>

<aside class="sidebar sidebar-left">
	<a class="brand" href="/" aria-label="Nagi home"><span class="mark">凪</span><span>Nagi</span></a>
	<nav class="side-nav" aria-label="メインナビゲーション">
		{#each navItems as item (item.href)}
			<a
				href={item.href}
				class:active={isActive(page.url.pathname, item.href)}
				title={item.label}
				aria-current={isActive(page.url.pathname, item.href) ? 'page' : undefined}
			>
				<Icon name={item.icon} /><span class="label">{item.label}</span>
			</a>
		{/each}
	</nav>
	<div class="spacer"></div>
	<AccountCard />
</aside>
