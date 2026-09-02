<script lang="ts">
	import { portal } from '$lib/actions/portal';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { positionFloatingMenu } from '$lib/layout/floating-menu';
	import { AVAILABLE_SELF_LABELS } from '$lib/post/labels';

	let {
		open = $bindable(false),
		anchor,
		selectedLabels = $bindable([]),
		hasSelection,
		textWarningDisabled = false,
		disabled = false,
		ontextwarning,
	}: {
		open?: boolean;
		anchor?: HTMLElement;
		selectedLabels?: string[];
		hasSelection: boolean;
		textWarningDisabled?: boolean;
		disabled?: boolean;
		ontextwarning: () => void;
	} = $props();

	let menu = $state<HTMLElement>();
	let menuStyle = $state('');

	function closeMenu(restoreFocus = true) {
		open = false;
		if (restoreFocus) requestAnimationFrame(() => anchor?.focus());
	}

	function applyTextWarning() {
		if (!hasSelection || textWarningDisabled || disabled) return;
		closeMenu(false);
		ontextwarning();
	}

	function toggleLabel(value: string) {
		if (disabled) return;
		selectedLabels = selectedLabels.includes(value)
			? selectedLabels.filter((label) => label !== value)
			: [...selectedLabels, value];
	}

	$effect(() => {
		if (!open || !anchor || !menu) return;
		const anchorElement = anchor;
		const menuElement = menu;
		const updatePosition = () => {
			const rect = anchorElement.getBoundingClientRect();
			const visual = window.visualViewport;
			const viewport = visual
				? {
						left: visual.offsetLeft,
						top: visual.offsetTop,
						width: visual.width,
						height: visual.height,
					}
				: { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
			const position = positionFloatingMenu(rect, viewport, menuElement.scrollHeight);
			menuStyle = `left:${position.left}px;top:${position.top}px;width:${position.width}px;max-height:${position.maxHeight}px;`;
		};
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closeMenu();
		};
		requestAnimationFrame(updatePosition);
		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);
		window.addEventListener('keydown', handleKeydown);
		window.visualViewport?.addEventListener('resize', updatePosition);
		window.visualViewport?.addEventListener('scroll', updatePosition);
		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
			window.removeEventListener('keydown', handleKeydown);
			window.visualViewport?.removeEventListener('resize', updatePosition);
			window.visualViewport?.removeEventListener('scroll', updatePosition);
		};
	});
</script>

{#if open && anchor}
	<div class="content-warning-portal" use:portal>
		<button
			class="content-warning-backdrop"
			type="button"
			aria-label={m.contentWarningMenuClose()}
			onclick={() => closeMenu()}
		></button>
		<div
			bind:this={menu}
			class="content-warning-menu"
			style={menuStyle}
			role="menu"
			aria-label={m.contentWarningMenuTitle()}
		>
			<div class="menu-heading">
				<strong>{m.contentWarningMenuTitle()}</strong>
				<span>{m.contentWarningMenuHelp()}</span>
			</div>
			<button
				type="button"
				class="menu-item text-warning"
				disabled={disabled || !hasSelection || textWarningDisabled}
				onclick={applyTextWarning}
				role="menuitem"
			>
				<span class="item-mark" aria-hidden="true">||</span>
				<span
					><strong>{m.contentWarningTextChoice()}</strong><small
						>{m.contentWarningTextChoiceHelp()}</small
					></span
				>
			</button>
			<div class="menu-divider"></div>
			{#each AVAILABLE_SELF_LABELS as option}
				{@const selected = selectedLabels.includes(option.value)}
				<button
					type="button"
					class="menu-item"
					class:selected
					{disabled}
					aria-checked={selected}
					role="menuitemcheckbox"
					onclick={() => toggleLabel(option.value)}
				>
					<input type="checkbox" checked={selected} tabindex="-1" aria-hidden="true" />
					<span
						><strong>{option.badgeText[i18n.locale]}</strong><small
							>{option.description[i18n.locale]}</small
						></span
					>
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.content-warning-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1100;
		border: 0;
		background: transparent;
	}

	.content-warning-menu {
		position: fixed;
		z-index: 1101;
		overflow: auto;
		box-sizing: border-box;
		padding: 8px;
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		background: var(--surface-1);
		box-shadow: var(--shadow-pop);
	}

	.menu-heading {
		display: grid;
		gap: 2px;
		padding: 5px 8px 8px;
	}

	.menu-heading strong,
	.menu-item strong {
		font-size: 12px;
	}

	.menu-heading span,
	.menu-item small {
		color: var(--text-muted);
		font-size: 10px;
		line-height: 1.35;
	}

	.menu-item {
		display: flex;
		width: 100%;
		align-items: flex-start;
		gap: 9px;
		padding: 8px;
		border: 0;
		border-radius: var(--r-md);
		background: transparent;
		color: var(--text);
		text-align: left;
	}

	.menu-item:hover:not(:disabled),
	.menu-item.selected {
		background: var(--accent-soft);
	}

	.menu-item:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.menu-item input {
		margin: 2px 0 0;
		pointer-events: none;
		accent-color: var(--accent);
	}

	.menu-item > span:last-child {
		display: grid;
		min-width: 0;
		gap: 2px;
	}

	.item-mark {
		display: inline-flex;
		min-width: 16px;
		justify-content: center;
		font-size: 11px;
		font-weight: 800;
	}

	.menu-divider {
		height: 1px;
		margin: 3px 6px;
		background: var(--line);
	}
</style>
