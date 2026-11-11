<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { portal } from '$lib/actions/portal';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { mutes } from '$lib/mute/mutes.svelte';
	import { feedTabs } from '$lib/feed-tabs/feed-tabs.svelte';
	import { FEED_TABS_LIMIT, newTabId, tabIdentity } from '$lib/feed-tabs/types';
	import { preferencesReady } from '$lib/preferences/sync.svelte';
	import { tagFavorites } from '$lib/tag-favorites/tag-favorites.svelte';
	import { tagMenu } from '$lib/tag-favorites/tag-menu.svelte';
	import { hashtagHref, normalizeTag } from '$lib/tags';
	import Icon from './shell/Icon.svelte';

	/**
	 * 本文のハッシュタグの右クリック／長押しメニュー。レイアウトに1つだけ置く。
	 * お気に入り・フィードのタブ・ミュートの切り替えと、タグの投稿一覧への移動ができる。
	 */
	let popup = $state<HTMLDivElement>();
	let style = $state('');
	let error = $state('');

	const tag = $derived(tagMenu.tag ? normalizeTag(tagMenu.tag) : undefined);
	const favorite = $derived(Boolean(tag) && tagFavorites.has(tag!));
	const hasTab = $derived(
		Boolean(tag) && feedTabs.tabs.some((tab) => tabIdentity(tab) === `hashtag:${tag}`),
	);
	const tabsFull = $derived(feedTabs.tabs.length >= FEED_TABS_LIMIT);
	const muted = $derived(Boolean(tag) && mutes.hasTag(tag!));

	$effect(() => {
		if (!tag || !popup) return;
		const target = popup;
		const x = tagMenu.x;
		const y = tagMenu.y;
		error = '';
		const margin = 8;
		const width = target.offsetWidth;
		const height = target.offsetHeight;
		const left = Math.max(margin, Math.min(x, window.innerWidth - margin - width));
		// 下に入らなければ指の上へ出す（長押しの指でメニューが隠れないように）。
		const top = y + height + margin <= window.innerHeight ? y : Math.max(margin, y - height);
		style = `left:${left}px;top:${top}px;`;
		void tick().then(() =>
			target.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus({
				preventScroll: true,
			}),
		);
	});

	$effect(() => {
		if (!tag) return;
		const outside = (event: PointerEvent) => {
			if (!popup?.contains(event.target as Node)) tagMenu.close();
		};
		const keydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') tagMenu.close(true);
		};
		const dismiss = () => tagMenu.close();
		document.addEventListener('pointerdown', outside, true);
		document.addEventListener('keydown', keydown);
		window.addEventListener('resize', dismiss);
		window.addEventListener('scroll', dismiss, true);
		return () => {
			document.removeEventListener('pointerdown', outside, true);
			document.removeEventListener('keydown', keydown);
			window.removeEventListener('resize', dismiss);
			window.removeEventListener('scroll', dismiss, true);
		};
	});

	function keydown(event: KeyboardEvent) {
		const items = [
			...(popup?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []),
		];
		if (!items.length) return;
		const current = Math.max(0, items.indexOf(document.activeElement as HTMLButtonElement));
		let next: number | undefined;
		if (event.key === 'ArrowDown') next = (current + 1) % items.length;
		if (event.key === 'ArrowUp') next = (current - 1 + items.length) % items.length;
		if (event.key === 'Home') next = 0;
		if (event.key === 'End') next = items.length - 1;
		if (event.key === 'Tab') {
			tagMenu.close();
			return;
		}
		if (next === undefined) return;
		event.preventDefault();
		items[next]?.focus();
	}

	// 同期の取り込みが済んでから書く。先に書くと、同期前の一覧で新しい updatedAt を
	// 付けてしまい、サーバー側の値を上書きする（タブ設定画面と同じ理由）。
	async function toggleFavorite() {
		if (!tag) return;
		const target = tag;
		tagMenu.close(true);
		await preferencesReady();
		tagFavorites.toggle(target);
	}

	async function addTab() {
		if (!tag || hasTab || tabsFull) return;
		const target = tag;
		tagMenu.close(true);
		await preferencesReady();
		if (feedTabs.tabs.some((tab) => tabIdentity(tab) === `hashtag:${target}`)) return;
		feedTabs.replace([...feedTabs.tabs, { id: newTabId('tag'), kind: 'hashtag', query: target }]);
	}

	async function toggleMute() {
		if (!tag || mutes.isPending(tag)) return;
		const target = tag;
		try {
			await mutes.toggleTag(target);
			tagMenu.close(true);
		} catch {
			error = m.muteUpdateFailed();
		}
	}

	function openPosts() {
		if (!tag) return;
		const target = tag;
		tagMenu.close();
		void goto(hashtagHref(target));
	}
</script>

{#if tag}
	<div class="tag-menu-portal" use:portal>
		<div
			bind:this={popup}
			class="tag-menu"
			{style}
			role="menu"
			tabindex="-1"
			aria-label={m.tagMenuAria({ tag })}
			onkeydown={keydown}
		>
			<p class="tag-menu-title" aria-hidden="true">#{tag}</p>
			{#if $session}
				<button
					type="button"
					role="menuitem"
					class:active={favorite}
					disabled={!favorite && tagFavorites.full}
					onclick={() => void toggleFavorite()}
				>
					<Icon name={favorite ? 'starFilled' : 'star'} size={17} />
					<span
						>{favorite
							? m.tagFavoriteRemove()
							: tagFavorites.full
								? m.tagFavoritesFull()
								: m.tagFavoriteAdd()}</span
					>
				</button>
			{/if}
			<button
				type="button"
				role="menuitem"
				disabled={hasTab || tabsFull}
				onclick={() => void addTab()}
			>
				<Icon name={hasTab ? 'check' : 'plus'} size={17} />
				<span
					>{hasTab ? m.tagFeedTabAdded() : tabsFull ? m.tagFeedTabsFull() : m.tagAddFeedTab()}</span
				>
			</button>
			{#if $session}
				<button
					type="button"
					role="menuitem"
					class:active={muted}
					disabled={mutes.isPending(tag)}
					onclick={() => void toggleMute()}
				>
					<Icon name="hide" size={17} />
					<span>{muted ? m.unmuteTag() : m.muteTag()}</span>
				</button>
			{/if}
			<button type="button" role="menuitem" onclick={openPosts}>
				<Icon name="search" size={17} />
				<span>{m.tagOpenPosts()}</span>
			</button>
			{#if error}<p class="tag-menu-error" role="alert">{error}</p>{/if}
		</div>
	</div>
{/if}

<style>
	.tag-menu-portal {
		display: contents;
	}
	.tag-menu {
		position: fixed;
		z-index: 150;
		display: grid;
		min-inline-size: 200px;
		max-inline-size: min(280px, calc(100vw - 16px));
		padding: 5px;
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
		background: var(--bg-raised);
		box-shadow: var(--shadow-pop);
	}
	.tag-menu-title {
		margin: 0;
		padding: 4px 9px 6px;
		overflow: hidden;
		color: var(--text-faint);
		font-size: 0.78rem;
		font-weight: 700;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.tag-menu button {
		display: flex;
		align-items: center;
		inline-size: 100%;
		min-block-size: 36px;
		gap: 9px;
		padding: 7px 9px;
		border: 0;
		border-radius: 8px;
		background: transparent;
		color: var(--text);
		font: inherit;
		text-align: start;
		cursor: pointer;
	}
	.tag-menu button > :global(svg) {
		flex-shrink: 0;
	}
	.tag-menu button > span {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.tag-menu button:hover:not(:disabled),
	.tag-menu button:focus-visible {
		background: var(--bg-hover);
	}
	.tag-menu button.active {
		color: var(--accent-strong);
	}
	.tag-menu button:disabled {
		color: var(--text-faint);
		cursor: default;
	}
	.tag-menu-error {
		margin: 4px 9px;
		color: var(--danger);
		font-size: 0.78rem;
	}
</style>
