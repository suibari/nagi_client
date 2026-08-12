<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';
	import Icon from './shell/Icon.svelte';

	let {
		label,
		icon,
		active = false,
		disabled = false,
		align = 'end',
		triggerSize = 'post',
		onopen,
		menu,
	}: {
		label: string;
		icon: string;
		active?: boolean;
		disabled?: boolean;
		align?: 'start' | 'end';
		triggerSize?: 'post' | 'news';
		onopen?: () => void | Promise<void>;
		menu: Snippet<[(restoreFocus?: boolean) => void]>;
	} = $props();

	let open = $state(false);
	let trigger = $state<HTMLButtonElement>();
	let popup = $state<HTMLDivElement>();
	let wrap = $state<HTMLDivElement>();

	$effect(() => {
		if (!open) return;
		const outside = (event: PointerEvent) => {
			if (!wrap?.contains(event.target as Node)) close(false);
		};
		const escape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') close();
		};
		document.addEventListener('pointerdown', outside);
		document.addEventListener('keydown', escape);
		return () => {
			document.removeEventListener('pointerdown', outside);
			document.removeEventListener('keydown', escape);
		};
	});

	async function toggle() {
		open = !open;
		if (!open) return;
		await onopen?.();
		if (!open) return;
		await tick();
		popup?.querySelector<HTMLButtonElement>('[role^="menuitem"]:not(:disabled)')?.focus();
	}
	function close(restoreFocus = true) {
		open = false;
		if (restoreFocus) void tick().then(() => trigger?.focus());
	}
	function keydown(event: KeyboardEvent) {
		const items = [
			...(popup?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]:not(:disabled)') ?? []),
		];
		if (!items.length) return;
		const current = Math.max(0, items.indexOf(document.activeElement as HTMLButtonElement));
		let next: number | undefined;
		if (event.key === 'ArrowDown') next = (current + 1) % items.length;
		if (event.key === 'ArrowUp') next = (current - 1 + items.length) % items.length;
		if (event.key === 'Home') next = 0;
		if (event.key === 'End') next = items.length - 1;
		if (next === undefined) return;
		event.preventDefault();
		items[next]?.focus();
	}
</script>

<div class="action-menu-wrap" bind:this={wrap}>
	<button
		bind:this={trigger}
		class="ghost timeline-action trigger"
		class:news-trigger={triggerSize === 'news'}
		class:active
		type="button"
		{disabled}
		aria-label={label}
		title={label}
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={() => void toggle()}><Icon name={icon} size={18} /></button
	>
	{#if open}
		<div
			bind:this={popup}
			class="action-menu"
			class:align-start={align === 'start'}
			role="menu"
			tabindex="-1"
			aria-label={label}
			onkeydown={keydown}
		>
			{@render menu(close)}
		</div>
	{/if}
</div>

<style>
	.action-menu-wrap {
		position: relative;
		display: inline-flex;
	}
	.trigger {
		display: inline-grid;
		place-items: center;
		inline-size: 30px;
		block-size: 30px;
		padding: 0;
		border: 0;
		border-radius: var(--r-sm);
	}
	.trigger.news-trigger {
		inline-size: 36px;
		block-size: 36px;
	}
	.action-menu {
		position: absolute;
		z-index: 30;
		inset-block-start: calc(100% + 5px);
		inset-inline-end: 0;
		display: grid;
		min-inline-size: 180px;
		max-inline-size: min(280px, calc(100vw - 32px));
		max-block-size: min(480px, calc(100dvh - 96px));
		overflow-y: auto;
		padding: 5px;
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
		background: var(--bg-raised);
		box-shadow: var(--shadow-pop);
	}
	.action-menu.align-start {
		inset-inline: 0 auto;
	}
	.action-menu :global(button) {
		display: flex;
		align-items: center;
		inline-size: 100%;
		block-size: auto;
		min-block-size: 36px;
		justify-content: flex-start;
		gap: 9px;
		padding: 7px 9px;
		border-radius: 8px;
		color: var(--text);
		text-align: start;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.action-menu :global(button:hover),
	.action-menu :global(button:focus-visible) {
		background: var(--bg-hover);
	}
	.action-menu :global(button.active) {
		color: var(--accent-strong);
		background: var(--accent-soft);
	}
	.action-menu :global(button.danger) {
		color: var(--danger);
	}
	@media (max-width: 600px) {
		/* 右寄せの自分の吹き出しでも、メニューを画面外へ押し出さない。 */
		.action-menu.align-start {
			inset-inline: auto 0;
		}
	}
</style>
