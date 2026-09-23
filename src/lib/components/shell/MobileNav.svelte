<script lang="ts">
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import {
		mobilePrimaryItems,
		mobileMenuItems,
		mobileMenuGroups,
		mobileMenuNotice,
		isActive,
		handleNavClick,
	} from './nav';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './Icon.svelte';
	import NavBadge from './NavBadge.svelte';

	let menuOpen = $state(false);
	let menuButton = $state<HTMLButtonElement>();
	let closeButton = $state<HTMLButtonElement>();
	const menuActive = $derived(
		mobileMenuItems.some((item) => isActive(page.url.pathname, item.href)),
	);

	function openMenu() {
		menuOpen = true;
		void tick().then(() => closeButton?.focus());
	}

	function closeMenu(restoreFocus = true) {
		menuOpen = false;
		if (restoreFocus) void tick().then(() => menuButton?.focus());
	}

	function keydown(event: KeyboardEvent) {
		if (menuOpen && event.key === 'Escape') {
			event.preventDefault();
			closeMenu();
		}
	}

	function backdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) closeMenu();
	}

	$effect(() => {
		if (!menuOpen) return;
		const previousOverflow = document.documentElement.style.overflow;
		document.documentElement.style.overflow = 'hidden';
		return () => {
			document.documentElement.style.overflow = previousOverflow;
		};
	});
</script>

<svelte:window onkeydown={keydown} />

{#if menuOpen}
	<div class="mobile-menu-backdrop" role="presentation" onclick={backdropClick}>
		<div
			id="mobile-menu-sheet"
			class="mobile-menu-sheet"
			role="dialog"
			aria-modal="true"
			aria-labelledby="mobile-menu-title"
		>
			<header class="mobile-menu-header">
				<div class="mobile-menu-handle" aria-hidden="true"></div>
				<h2 id="mobile-menu-title">{m.navMenu()}</h2>
				<button
					bind:this={closeButton}
					type="button"
					class="mobile-menu-close"
					aria-label={m.close()}
					onclick={() => closeMenu()}><Icon name="close" size={18} /></button
				>
			</header>
			<nav class="mobile-menu-list" aria-label={m.navMenu()}>
				{#each mobileMenuGroups as group, groupIndex}
					{#if groupIndex > 0}<div class="mobile-menu-divider" role="separator"></div>{/if}
					{#each group as item (item.href)}
					<a
						href={item.href}
						class:active={isActive(page.url.pathname, item.href)}
						aria-current={isActive(page.url.pathname, item.href) ? 'page' : undefined}
						onclick={(event) => {
							handleNavClick(event, page.url.pathname, item.href);
							closeMenu(false);
						}}
					>
						<span class="mobile-menu-item-icon nav-icon">
							<Icon name={item.icon} size={21} />
							{#if item.badge}<NavBadge
									{...item.badge}
									style={item.badge.style === 'text' ? 'dot' : item.badge.style}
								/>{/if}
						</span>
						<span>{item.label()}</span>
						<Icon name="chevron" size={17} />
					</a>
					{/each}
				{/each}
			</nav>
		</div>
	</div>
{/if}

<nav class="mobile-nav" aria-label={m.mainNavAria()}>
	{#each mobilePrimaryItems as item (item.href)}
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
	<button
		bind:this={menuButton}
		type="button"
		class:active={menuOpen || menuActive}
		aria-expanded={menuOpen}
		aria-controls="mobile-menu-sheet"
		onclick={() => (menuOpen ? closeMenu() : openMenu())}
	>
		<span class="nav-icon">
			<Icon name="moreHorizontal" size={22} />
			<NavBadge unread={mobileMenuNotice} style="dot" aria={() => m.navMenu()} />
		</span><span>{m.navMenu()}</span>
	</button>
</nav>

<style>
	.mobile-menu-backdrop {
		display: none;
	}

	@media (max-width: 767px) {
		.mobile-menu-backdrop {
			position: fixed;
			inset: 0;
			z-index: 80;
			display: flex;
			align-items: flex-end;
			background: color-mix(in srgb, var(--bg) 68%, transparent);
		}

		.mobile-menu-sheet {
			display: flex;
			flex-direction: column;
			inline-size: 100%;
			max-block-size: calc(100dvh - 24px);
			padding: 0 14px calc(14px + env(safe-area-inset-bottom));
			border: 1px solid var(--line-strong);
			border-block-end: 0;
			border-radius: 20px 20px 0 0;
			background: var(--surface-1);
			box-shadow: var(--shadow-pop);
		}

		.mobile-menu-header {
			position: relative;
			flex: 0 0 auto;
			display: flex;
			align-items: center;
			min-block-size: 62px;
			padding-block-start: 8px;
			border-bottom: 1px solid var(--line);
		}

		.mobile-menu-handle {
			position: absolute;
			inset-block-start: 8px;
			inset-inline-start: 50%;
			inline-size: 36px;
			block-size: 4px;
			border-radius: var(--radius-pill);
			background: var(--line-strong);
			transform: translateX(-50%);
		}

		.mobile-menu-header h2 {
			margin: 8px 44px 0 2px;
			color: var(--text-strong);
			font-size: 16px;
		}

		.mobile-menu-close {
			position: absolute;
			inset-inline-end: 0;
			inset-block-start: 17px;
			display: grid;
			place-items: center;
			inline-size: 38px;
			block-size: 38px;
			padding: 0;
			border: 0;
			border-radius: 50%;
			background: transparent;
			color: var(--text-muted);
		}

		.mobile-menu-list {
			min-block-size: 0;
			overflow-y: auto;
			overscroll-behavior: contain;
			padding-block: 8px;
		}
		.mobile-menu-divider {
			block-size: 1px;
			margin: 8px 8px;
			background: var(--line);
		}

		.mobile-menu-list a {
			display: grid;
			grid-template-columns: 42px minmax(0, 1fr) auto;
			align-items: center;
			min-block-size: 54px;
			padding: 6px 8px;
			border-radius: var(--r-md);
			color: var(--text-muted);
			font-size: 14px;
			font-weight: 700;
		}

		.mobile-menu-list a.active {
			background: var(--accent-weak);
			color: var(--accent-strong);
		}

		.mobile-menu-item-icon {
			display: inline-flex;
		}
	}
</style>
