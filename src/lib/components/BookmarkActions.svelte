<script lang="ts">
	import { session } from '$lib/oauth/session.svelte';
	import { signIn } from '$lib/oauth/session.svelte';
	import { grantedOptIns } from '$lib/optin/scope-optin';
	import { bookmarks } from '$lib/bookmarks/bookmarks.svelte';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import type { BookmarkSubjectType } from '$lib/api/types';
	import ActionMenu from './ActionMenu.svelte';

	let { subject }: { subject: { kind: BookmarkSubjectType; uri: string } } = $props();
	let choosing = $state(false);
	let creating = $state(false);
	let folderName = $state('');
	let error = $state('');
	let announcement = $state('');
	const saved = $derived(bookmarks.isSaved(subject.uri));
	const pending = $derived(bookmarks.isPending(subject.uri));
	const recent = $derived(bookmarks.lastFolder());

	$effect(() => {
		void bookmarks.loaded;
		bookmarks.register(subject.uri);
	});
	async function prepareMenu() {
		if (!$session) return;
		error = '';
		if (!bookmarks.loaded) await bookmarks.load($session.did, i18n.locale);
		await bookmarks.ensureState(subject.uri).catch(() => undefined);
	}
	function resetMenu() {
		choosing = false;
		creating = false;
		folderName = '';
	}
	async function save(folderId: string, close: () => void) {
		error = '';
		try {
			await bookmarks.save(subject.uri, folderId);
			announcement = m.bookmarkSaved();
			resetMenu();
			close();
		} catch {
			error = m.bookmarkSaveFailed();
		}
	}
	async function remove(close: () => void) {
		error = '';
		try {
			await bookmarks.remove(subject.uri);
			announcement = m.bookmarkRemoved();
			resetMenu();
			close();
		} catch {
			error = m.bookmarkRemoveFailed();
		}
	}
	async function createAndSave(close: () => void) {
		if (!folderName.trim()) return;
		error = '';
		try {
			const folder = await bookmarks.saveFolder(folderName);
			await save(folder.id, close);
		} catch {
			error = m.bookmarkFolderSaveFailed();
		}
	}
	async function reauthorize() {
		if (!$session) return;
		await signIn($session.did, { ...(await grantedOptIns()), refreshPermissions: true });
	}
</script>

{#if $session}
	<ActionMenu
		label={saved ? m.bookmarkRemove() : m.bookmark()}
		icon={saved ? 'bookmarkFilled' : 'bookmark'}
		active={saved}
		disabled={pending}
		triggerSize={subject.kind === 'news' ? 'news' : 'post'}
		onopen={prepareMenu}
	>
		{#snippet menu(close)}
			{#if saved}
				<button role="menuitem" disabled={pending} onclick={() => void remove(close)}>
					{m.bookmarkRemove()}
				</button>
			{:else if bookmarks.loaded}
				{#if recent}
					<button role="menuitem" onclick={() => void save(recent.id, close)}>
						{m.bookmarkSaveToRecent({ name: recent.name })}
					</button>
				{/if}
				<button role="menuitem" onclick={() => (choosing = !choosing)}>
					{m.bookmarkChooseFolder()}
				</button>
				{#if choosing}
					<div class="bookmark-folder-list">
						{#each bookmarks.folders as folder (folder.id)}
							<button role="menuitem" onclick={() => void save(folder.id, close)}
								>{folder.name}</button
							>
						{/each}
						<button role="menuitem" onclick={() => (creating = true)}>
							{m.bookmarkNewFolder()}
						</button>
					</div>
				{/if}
				{#if creating}
					<form
						class="bookmark-create"
						onsubmit={(event) => {
							event.preventDefault();
							void createAndSave(close);
						}}
					>
						<label>{m.bookmarkFolderName()}<input bind:value={folderName} maxlength="80" /></label>
						<button class="primary" type="submit" disabled={!folderName.trim()}
							>{m.bookmarkCreateAndSave()}</button
						>
					</form>
				{/if}
			{:else if bookmarks.unauthorized}
				<p>{m.bookmarkPermissionRequired()}</p>
				<button role="menuitem" onclick={() => void reauthorize()}
					>{m.bookmarkRefreshPermissions()}</button
				>
			{:else}
				<p>{m.loading()}</p>
			{/if}
			{#if error}<p class="error" role="alert">{error}</p>{/if}
		{/snippet}
	</ActionMenu>
	<span class="visually-hidden" aria-live="polite">{announcement}</span>
{/if}

<style>
	.bookmark-folder-list {
		display: grid;
		margin-inline-start: 12px;
		border-inline-start: 2px solid var(--line);
	}
	.bookmark-create {
		display: grid;
		gap: 7px;
		padding: 8px;
	}
	.bookmark-create label {
		display: grid;
		gap: 4px;
		font-size: 12px;
		color: var(--text-muted);
	}
	.bookmark-create input {
		inline-size: 100%;
		min-inline-size: 0;
	}
	:global(.action-menu) p {
		margin: 7px 9px;
		font-size: 12px;
	}
	:global(.action-menu) .error {
		color: var(--danger);
	}
</style>
