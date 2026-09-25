<script lang="ts">
	import type { ActorView, DiaryView, PostView } from '$lib/api/types';
	import { i18n, m, dateLocale } from '$lib/i18n/i18n.svelte';
	import AvatarLink from './AvatarLink.svelte';
	import ChatBubble from './ChatBubble.svelte';

	/**
	 * 日記1日ぶんの見出し（日付・称号・関わった人）と、botたんの日記の吹き出し。
	 * 日記タブの年間アクティビティで使う。
	 * summary はホバー中の日も含めた見出し用、entry は選択中の日で吹き出しに出す。
	 */
	let {
		summary,
		entry,
		botActor,
	}: {
		summary?: DiaryView;
		entry?: DiaryView;
		botActor?: ActorView;
	} = $props();

	const longDate = (date: string) =>
		new Date(`${date}T12:00:00`).toLocaleDateString(dateLocale(), {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	const entryTitle = (value: DiaryView) =>
		i18n.locale === 'ja' ? (value.titleJa ?? value.titleEn) : (value.titleEn ?? value.titleJa);
	const actorName = (actor: ActorView) => actor.displayName ?? actor.handle;
	const diaryPost = $derived.by((): PostView | undefined => {
		if (!entry) return undefined;
		return {
			uri: entry.uri,
			cid: entry.cid,
			author:
				botActor ??
				({
					did: 'did:unknown:bot-tan',
					handle: 'bot-tan',
					displayName: m.botBadge(),
					isBot: true,
				} satisfies ActorView),
			text: entry.text,
			langs: entry.langs,
			createdAt: entry.createdAt,
			indexedAt: entry.indexedAt,
			reactions: [],
			isBot: true,
			isAffirmation: false,
		};
	});
</script>

{#if summary}
	<article class="diary-day-detail" aria-live="polite">
		<div>
			<h3>{longDate(summary.date)}</h3>
			{#if entryTitle(summary)}
				<p class="diary-title">{m.diaryTitleLabel({ title: entryTitle(summary)! })}</p>
			{/if}
		</div>
		{#if summary.involvedActors?.length}
			<div class="diary-connections">
				<span>{m.diaryInvolvedPeople()}</span>
				<div class="reaction-actors" role="group" aria-label={m.diaryInvolvedPeople()}>
					{#each summary.involvedActors as actor (actor.did)}
						<AvatarLink
							{actor}
							size="small"
							className="reaction-avatar"
							ariaLabel={m.viewProfileOfAria({ name: actorName(actor) })}
							title={actorName(actor)}
						/>
					{/each}
					{#if summary.involvedActorsHasMore}
						<span class="reaction-more" aria-label={m.diaryMoreConnectionsAria()}>…</span>
					{/if}
				</div>
			</div>
		{/if}
	</article>
{/if}

{#if diaryPost}
	<article class="diary-entry">
		<ChatBubble post={diaryPost} displayOnly collapsible={false} />
	</article>
{/if}

<style>
	.diary-day-detail {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 18px;
		padding: 12px;
		border-radius: var(--radius-m);
		background: var(--surface-soft);
		min-block-size: 62px;
	}
	.diary-day-detail h3 {
		font-size: 12px;
		font-weight: 800;
		color: var(--text-strong);
	}
	.diary-title {
		display: inline-block;
		max-inline-size: 100%;
		margin-top: 6px;
		border-radius: var(--radius-pill);
		background: var(--badge-title-bg);
		color: var(--badge-title-fg);
		padding: 3px 10px;
		font-size: 11px;
		font-weight: 800;
		overflow-wrap: anywhere;
	}
	.diary-connections {
		display: flex;
		align-items: center;
		gap: 6px;
		white-space: nowrap;
		font-size: 11px;
		font-weight: 700;
		color: var(--text-muted);
	}
	.diary-entry {
		min-inline-size: 0;
	}
	@media (max-width: 560px) {
		.diary-day-detail {
			flex-direction: column;
		}
	}
</style>
