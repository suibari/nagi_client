<script lang="ts">
	import { tick } from 'svelte';
	import { portal } from '$lib/actions/portal';
	import { m } from '$lib/i18n/i18n.svelte';
	import { tagFavorites } from '$lib/tag-favorites/tag-favorites.svelte';
	import Icon from './shell/Icon.svelte';

	/**
	 * 投稿画面の「#」から開くタグパレット。お気に入り絵文字のパレットと同じく、
	 * 上にお気に入り、下に最近使ったタグを並べる。タップで本文へ `#tag ` を挿入する。
	 * 「最近使った」の ☆ からお気に入りへ登録できる（外すのは右クリックメニューか設定画面）。
	 */
	let {
		open = $bindable(false),
		anchor,
		select,
	}: {
		open?: boolean;
		anchor?: HTMLElement;
		select: (tag: string) => void;
	} = $props();

	let popup = $state<HTMLDivElement>();
	let style = $state('');
	let announcement = $state('');

	const favorites = $derived(tagFavorites.favorites);
	const recents = $derived(tagFavorites.recents.filter((tag) => !favorites.includes(tag)));

	$effect(() => {
		if (!open || !anchor || !popup) return;
		const target = popup;
		const update = () => {
			const rect = anchor.getBoundingClientRect();
			const margin = 12;
			const width = Math.min(320, window.innerWidth - margin * 2);
			const height = target.offsetHeight;
			const left = Math.min(Math.max(margin, rect.left), window.innerWidth - margin - width);
			const openAbove = rect.top > height + margin + 8;
			const desired = openAbove ? rect.top - height - 8 : rect.bottom + 8;
			const top = Math.max(margin, Math.min(desired, window.innerHeight - margin - height));
			style = `top:${top}px;left:${left}px;width:${width}px;`;
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(target);
		const keydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') close();
		};
		window.addEventListener('resize', update);
		window.addEventListener('scroll', update, true);
		window.addEventListener('keydown', keydown);
		return () => {
			observer.disconnect();
			window.removeEventListener('resize', update);
			window.removeEventListener('scroll', update, true);
			window.removeEventListener('keydown', keydown);
		};
	});

	$effect(() => {
		if (!open) return;
		announcement = '';
		void tick().then(() => popup?.querySelector<HTMLButtonElement>('.tag-palette-chip')?.focus());
	});

	function close(restoreFocus = true) {
		open = false;
		if (restoreFocus) requestAnimationFrame(() => anchor?.focus());
	}

	/** 挿入したら入力欄へ戻す（挿入側がフォーカスするので、ボタンへは戻さない）。 */
	function choose(tag: string) {
		select(tag);
		close(false);
	}

	function favorite(tag: string) {
		if (!tagFavorites.add(tag)) {
			announcement = m.tagFavoritesFull();
			return;
		}
		announcement = m.tagFavoriteAdded({ tag });
	}
</script>

{#snippet chip(tag: string, recent: boolean)}
	<span class="tag-palette-item">
		<button
			class="tag-palette-chip"
			type="button"
			aria-label={m.tagPaletteInsertAria({ tag })}
			onmousedown={(event) => event.preventDefault()}
			onclick={() => choose(tag)}><span aria-hidden="true">#</span>{tag}</button
		>{#if recent}<button
				class="tag-palette-star"
				type="button"
				aria-label={m.tagFavoriteAddAria({ tag })}
				title={m.tagFavoriteAdd()}
				disabled={tagFavorites.full}
				onmousedown={(event) => event.preventDefault()}
				onclick={() => favorite(tag)}><Icon name="star" size={14} /></button
			>{/if}
	</span>
{/snippet}

{#if open && anchor}
	<div class="tag-palette-portal" use:portal>
		<button class="reaction-picker-backdrop" aria-label={m.close()} onclick={() => close()}
		></button>
		<div
			bind:this={popup}
			class="tag-palette"
			{style}
			role="dialog"
			aria-label={m.tagPaletteAria()}
		>
			{#if favorites.length}
				<div class="tag-palette-section">
					<span class="reaction-quick-label">{m.tagPaletteFavorites()}</span>
					<div class="tag-palette-list">
						{#each favorites as tag (tag)}{@render chip(tag, false)}{/each}
					</div>
				</div>
			{/if}
			{#if recents.length}
				<div class="tag-palette-section">
					<span class="reaction-quick-label">{m.tagPaletteRecent()}</span>
					<div class="tag-palette-list">
						{#each recents as tag (tag)}{@render chip(tag, true)}{/each}
					</div>
				</div>
			{/if}
			{#if !favorites.length && !recents.length}
				<p class="reaction-quick-empty">{m.tagPaletteEmpty()}</p>
			{/if}
			<span class="visually-hidden" aria-live="polite">{announcement}</span>
		</div>
	</div>
{/if}

<style>
	.tag-palette-portal {
		display: contents;
	}
	.tag-palette {
		position: fixed;
		z-index: 141;
		max-height: min(360px, calc(100dvh - 24px));
		padding: 8px;
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
		background: var(--bg-raised);
		box-shadow: var(--shadow-pop);
		overflow-y: auto;
	}
	.tag-palette-section + .tag-palette-section {
		margin-top: 8px;
	}
	.tag-palette-list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.tag-palette-item {
		display: inline-flex;
		align-items: stretch;
		max-width: 100%;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--bg-inset);
		overflow: hidden;
	}
	.tag-palette-chip,
	.tag-palette-star {
		border: 0;
		border-radius: 0;
		background: transparent;
		color: var(--text);
		font: inherit;
		cursor: pointer;
	}
	.tag-palette-chip {
		min-width: 0;
		min-height: 32px;
		padding: 4px 12px;
		overflow: hidden;
		font-size: 0.86rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.tag-palette-chip span {
		margin-right: 1px;
		color: var(--text-faint);
	}
	.tag-palette-star {
		display: inline-grid;
		place-items: center;
		min-width: 30px;
		padding: 0 8px 0 4px;
		border-left: 1px solid var(--line);
		color: var(--text-faint);
	}
	.tag-palette-chip:hover,
	.tag-palette-chip:focus-visible,
	.tag-palette-star:hover:not(:disabled),
	.tag-palette-star:focus-visible {
		background: var(--bg-hover);
	}
	.tag-palette-star:hover:not(:disabled) {
		color: var(--accent-strong);
	}
	.tag-palette-star:disabled {
		opacity: 0.4;
		cursor: default;
	}
</style>
