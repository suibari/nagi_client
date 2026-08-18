<script lang="ts">
	import type {
		ActorView,
		BookmarkFolderView,
		BookmarkItemView,
		DiaryView,
		PostView,
	} from '$lib/api/types';
	import { dateLocale, i18n } from '$lib/i18n/i18n.svelte';
	import { isDiaryBodyHidden } from '$lib/diary/privacy';
	import ChatBubble from './ChatBubble.svelte';
	import DiaryPrivateNotice from './DiaryPrivateNotice.svelte';
	import NewsCard from './NewsCard.svelte';

	let {
		items,
		folders,
		botActor,
	}: { items: BookmarkItemView[]; folders: BookmarkFolderView[]; botActor?: ActorView } = $props();

	const sections = $derived(
		folders
			.map((folder) => ({
				folder,
				items: items.filter((item) => item.folderId === folder.id),
			}))
			.filter((section) => section.items.length),
	);
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
</script>

{#each sections as section (section.folder.id)}
	<section class="bookmark-search-folder">
		<h2>{section.folder.name}</h2>
		<div class="bookmark-search-items">
			{#each section.items as item (item.id)}
				{#if item.content.kind === 'post'}
					<article><ChatBubble post={item.content.post} /></article>
				{:else if item.content.kind === 'news'}
					<article><NewsCard news={item.content.news} {botActor} /></article>
				{:else if item.content.kind === 'diary'}
					<article class="bookmark-search-diary">
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
				{/if}
			{/each}
		</div>
	</section>
{/each}

<style>
	.bookmark-search-folder {
		min-inline-size: 0;
	}
	.bookmark-search-folder > h2 {
		display: flex;
		align-items: center;
		gap: 7px;
		margin: 0;
		padding: 10px 14px;
		font-size: 14px;
		color: var(--text-strong);
	}
	.bookmark-search-items {
		display: grid;
		min-inline-size: 0;
	}
	.bookmark-search-items article {
		min-inline-size: 0;
		padding: 12px;
		border-bottom: 1px solid var(--line);
	}
	.bookmark-search-diary h3 {
		margin: 0 0 5px;
		font-size: 14px;
	}
	.bookmark-search-diary > p {
		margin: 0 0 8px;
		color: var(--text-muted);
		font-size: 12px;
	}
</style>
