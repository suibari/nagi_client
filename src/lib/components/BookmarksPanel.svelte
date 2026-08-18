<script lang="ts">
	import { getBookmarks } from '$lib/api/appview';
	import type {
		ActorView,
		BookmarkFolderView,
		BookmarkItemView,
		DiaryView,
		PostView,
	} from '$lib/api/types';
	import { bookmarks } from '$lib/bookmarks/bookmarks.svelte';
	import { dateLocale, i18n, m } from '$lib/i18n/i18n.svelte';
	import { isDiaryBodyHidden } from '$lib/diary/privacy';
	import ChatBubble from './ChatBubble.svelte';
	import NewsCard from './NewsCard.svelte';
	import InfiniteScroll from './InfiniteScroll.svelte';
	import { untrack } from 'svelte';
	import Icon from './shell/Icon.svelte';
	import BookmarkFolderDialog from './BookmarkFolderDialog.svelte';
	import DiaryPrivateNotice from './DiaryPrivateNotice.svelte';
	import { session, signIn } from '$lib/oauth/session.svelte';
	import { grantedOptIns } from '$lib/optin/scope-optin';

	let selectedFolder = $state<string>();
	let items = $state<BookmarkItemView[]>([]);
	let cursor = $state<string>();
	let hasMore = $state(false);
	let loading = $state(false);
	let error = $state('');
	let botActor = $state<ActorView>();
	let folderDialog = $state<{ mode: 'create' | 'rename'; folder?: BookmarkFolderView }>();
	let folderSaving = $state(false);
	let folderError = $state('');
	let loadVersion = 0;
	const visibleItems = $derived(
		items.filter((item) => {
			const state = bookmarks.state(item.subjectUri);
			return state === undefined || Boolean(state.folderId);
		}),
	);
	const selectedFolderView = $derived(
		selectedFolder ? bookmarks.folders.find((folder) => folder.id === selectedFolder) : undefined,
	);

	$effect(() => {
		void selectedFolder;
		void i18n.locale;
		untrack(() => void load(true));
	});

	async function load(reset = false) {
		if (loading && !reset) return;
		const version = reset ? ++loadVersion : loadVersion;
		if (reset) {
			items = [];
			cursor = undefined;
			hasMore = false;
		}
		loading = true;
		error = '';
		try {
			const page = await getBookmarks({
				folderId: selectedFolder,
				cursor: reset ? undefined : cursor,
				lang: i18n.locale,
			});
			if (version !== loadVersion) return;
			items = reset ? page.items : [...items, ...page.items];
			cursor = page.cursor;
			hasMore = page.hasMore;
			botActor = page.botActor;
		} catch (cause) {
			bookmarks.noteError(cause);
			if (version === loadVersion) error = m.loadFailed();
		} finally {
			if (version === loadVersion) loading = false;
		}
	}

	function diaryPost(diary: DiaryView): PostView {
		return {
			uri: diary.uri,
			cid: diary.cid,
			author: botActor ?? {
				did: 'did:unknown:bot-tan',
				handle: 'bot-tan',
				displayName: 'Botたん',
				isBot: true,
			},
			text: diary.text,
			langs: diary.langs,
			createdAt: diary.createdAt,
			indexedAt: diary.indexedAt,
			reactions: [],
			isBot: true,
			isAffirmation: false,
		};
	}
	const diaryTitle = (diary: DiaryView) =>
		i18n.locale === 'ja' ? (diary.titleJa ?? diary.titleEn) : (diary.titleEn ?? diary.titleJa);
	const diaryDate = (diary: DiaryView) =>
		new Date(`${diary.date}T00:00:00`).toLocaleDateString(dateLocale(), {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});

	async function saveFolder(name: string) {
		if (!name.trim() || !folderDialog) return;
		const dialog = folderDialog;
		folderError = '';
		folderSaving = true;
		try {
			await bookmarks.saveFolder(name, dialog.folder?.id);
			folderDialog = undefined;
		} catch {
			folderError = m.bookmarkFolderSaveFailed();
		} finally {
			folderSaving = false;
		}
	}
	async function removeFolder(folder: BookmarkFolderView) {
		if (!confirm(m.bookmarkDeleteFolderConfirm({ name: folder.name, count: folder.count }))) return;
		folderError = '';
		try {
			await bookmarks.deleteFolder(folder);
			if (selectedFolder === folder.id) selectedFolder = undefined;
			else void load(true);
		} catch {
			folderError = m.bookmarkFolderDeleteFailed();
		}
	}
	async function removeUnavailable(uri: string) {
		try {
			await bookmarks.remove(uri);
		} catch {
			error = m.bookmarkRemoveFailed();
		}
	}
	async function reauthorize() {
		if (!$session) return;
		await signIn($session.did, { ...(await grantedOptIns()), refreshPermissions: true });
	}
</script>

<section class="bookmarks-panel">
	<header class="bookmarks-head">
		<div class="folder-toolbar">
			<div class="bookmark-folders" aria-label={m.bookmarkTab()}>
				<button
					class="folder-filter"
					class:active={!selectedFolder}
					onclick={() => (selectedFolder = undefined)}
				>
					{m.bookmarkAll()}
				</button>
				{#each bookmarks.folders as folder (folder.id)}
					<button
						class="folder-filter"
						class:active={selectedFolder === folder.id}
						title={folder.name}
						onclick={() => (selectedFolder = folder.id)}
					>
						<span class="folder-name">{folder.name}</span><span class="folder-count"
							>{folder.count}</span
						>
					</button>
				{/each}
			</div>
			<button
				class="folder-add icon-action"
				aria-label={m.bookmarkNewFolder()}
				title={m.bookmarkNewFolder()}
				onclick={() => {
					folderError = '';
					folderDialog = { mode: 'create' };
				}}><Icon name="folderPlus" size={20} /></button
			>
		</div>
		{#if selectedFolderView}
			<div class="folder-management">
				<div class="folder-heading">
					<strong title={selectedFolderView.name}>{selectedFolderView.name}</strong>
					<button
						class="icon-action folder-edit"
						aria-label={m.bookmarkRenameFolder()}
						title={m.bookmarkRenameFolder()}
						onclick={() => {
							folderError = '';
							folderDialog = { mode: 'rename', folder: selectedFolderView };
						}}><Icon name="edit" size={16} /></button
					>
				</div>
				{#if !selectedFolderView.isDefault}
					<button class="danger" onclick={() => void removeFolder(selectedFolderView)}
						>{m.bookmarkDeleteFolder()}</button
					>
				{/if}
			</div>
		{/if}
		{#if folderError && !folderDialog}<p class="error" role="alert">{folderError}</p>{/if}
	</header>

	<div class="bookmarks-list" aria-busy={loading}>
		{#if loading && !items.length}<div class="state">{m.loading()}</div>
		{:else if error && !items.length}<div class="state error">
				{bookmarks.unauthorized ? m.bookmarkPermissionRequired() : error}
				<button
					class="ghost"
					onclick={() => void (bookmarks.unauthorized ? reauthorize() : load(true))}
				>
					{bookmarks.unauthorized ? m.bookmarkRefreshPermissions() : m.retry()}
				</button>
			</div>
		{:else if !visibleItems.length}<div class="state">{m.bookmarkEmpty()}</div>
		{:else}
			{#each visibleItems as item (item.id)}
				{#if item.content.kind === 'post'}
					<article class="bookmark-item"><ChatBubble post={item.content.post} /></article>
				{:else if item.content.kind === 'news'}
					<article class="bookmark-item"><NewsCard news={item.content.news} {botActor} /></article>
				{:else if item.content.kind === 'diary'}
					<article class="bookmark-item bookmark-diary">
						<h3>{diaryDate(item.content.diary)}</h3>
						{#if diaryTitle(item.content.diary)}<p>{diaryTitle(item.content.diary)}</p>{/if}
						{#if isDiaryBodyHidden(item.content.diary)}
							<DiaryPrivateNotice />
						{:else}
							<ChatBubble
								post={diaryPost(item.content.diary)}
								displayOnly
								bookmarkSubject={{ kind: 'diary', uri: item.content.diary.uri }}
							/>
						{/if}
					</article>
				{:else}
					<article class="bookmark-item bookmark-unavailable">
						<p>{m.bookmarkUnavailable()}</p>
						<button class="ghost" onclick={() => void removeUnavailable(item.subjectUri)}
							>{m.bookmarkRemove()}</button
						>
					</article>
				{/if}
			{/each}
			<InfiniteScroll {hasMore} {loading} {error} onload={() => load()} />
		{/if}
	</div>
</section>
{#if folderDialog}
	<BookmarkFolderDialog
		mode={folderDialog.mode}
		initialName={folderDialog.folder?.name}
		busy={folderSaving}
		error={folderError}
		onconfirm={(name) => void saveFolder(name)}
		oncancel={() => {
			if (!folderSaving) {
				folderDialog = undefined;
				folderError = '';
			}
		}}
	/>
{/if}

<style>
	.bookmarks-panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 12px;
		inline-size: 100%;
		max-inline-size: 100%;
		min-inline-size: 0;
	}
	.bookmarks-head {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 8px;
		min-inline-size: 0;
	}
	.folder-toolbar {
		display: flex;
		align-items: center;
		gap: 8px;
		inline-size: 100%;
		min-inline-size: 0;
	}
	.bookmark-folders {
		display: flex;
		flex: 1;
		gap: 6px;
		min-inline-size: 0;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 2px 0 6px;
		overscroll-behavior-inline: contain;
		-webkit-overflow-scrolling: touch;
	}
	.folder-add {
		flex: 0 0 auto;
		inline-size: 38px;
		block-size: 38px;
	}
	.bookmark-folders > button {
		flex: 0 0 auto;
	}
	.bookmark-folders button {
		white-space: nowrap;
	}
	.folder-filter {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		max-inline-size: min(240px, calc(100vw - 48px));
		min-block-size: 36px;
		padding: 6px 12px;
		border: 1px solid var(--line);
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--text-muted);
		overflow: hidden;
	}
	.folder-filter.active {
		border-color: var(--accent);
		color: var(--accent-strong);
		background: var(--accent-soft);
	}
	.folder-name {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.folder-count {
		flex: 0 0 auto;
		color: var(--text-faint);
		font-size: 11px;
	}
	.folder-management {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		min-inline-size: 0;
	}
	.folder-heading {
		display: flex;
		align-items: center;
		gap: 2px;
		min-inline-size: 0;
	}
	.folder-heading strong {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.folder-edit {
		flex: 0 0 auto;
		inline-size: 30px;
		block-size: 30px;
	}
	.bookmark-item {
		padding: 12px;
		border-bottom: 1px solid var(--line);
		min-inline-size: 0;
	}
	.bookmarks-list {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}
	.bookmark-diary h3 {
		margin: 0 0 5px;
		font-size: 14px;
	}
	.bookmark-diary > p {
		margin: 0 0 8px;
		color: var(--text-muted);
		font-size: 12px;
	}
	.bookmark-unavailable {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		color: var(--text-muted);
	}
	.bookmark-unavailable p {
		margin: 0;
		min-inline-size: 0;
	}
	.error,
	.danger {
		color: var(--danger);
	}
	@media (max-width: 600px) {
		.folder-management > .danger {
			flex: 0 0 auto;
		}
	}
</style>
