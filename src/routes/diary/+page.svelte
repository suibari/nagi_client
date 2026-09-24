<script lang="ts">
	import { chronicleUnread } from '$lib/chronicle/notice';
	import NavBadge from '$lib/components/shell/NavBadge.svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { getProfile } from '$lib/api/appview';
	import type { ActorView } from '$lib/api/types';
	import ChronicleTimeline from '$lib/components/ChronicleTimeline.svelte';
	import DiaryCalendar from '$lib/components/DiaryCalendar.svelte';
	import { m, i18n } from '$lib/i18n/i18n.svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';

	// 日記は本人だけのページ。通知から ?date=YYYY-MM-DD で該当日を開く。
	const initialDate = $derived(page.url.searchParams.get('date') ?? undefined);
	let botActor = $state<ActorView>();
	// 年表の見出し「〜の日記」に出す本人の名前。
	let displayName = $state<string>();
	let avatar = $state<string>();
	let botActorFor = '';

	/**
	 * 表示するタブ。?tab= で共有・再読込に耐える。
	 * **?date= が来ているときは必ず年間アクティビティ。** 通知からの日付ディープリンクは
	 * 草グラフの該当日を開く導線なので、年表を初期表示にすると行き先が変わってしまう。
	 */
	type TabId = 'activity' | 'chronicle';
	const tabs: { id: TabId; label: () => string }[] = [
		{ id: 'activity', label: () => m.diaryTabActivity() },
		{ id: 'chronicle', label: () => m.diaryTabChronicle() },
	];
	let tab = $state<TabId>(
		!page.url.searchParams.get('date') && page.url.searchParams.get('tab') === 'chronicle'
			? 'chronicle'
			: 'activity',
	);

	function select(next: TabId) {
		if (tab === next) return;
		tab = next;
		const url = new URL(page.url);
		if (next === 'activity') url.searchParams.delete('tab');
		else url.searchParams.set('tab', next);
		replaceState(url, page.state);
	}

	// OAuth 復元は非同期なので oauthReady を待ってから、未ログインならログインへ回す。
	$effect(() => {
		if (!$oauthReady) return;
		if (!$session) location.href = '/login';
	});

	// 日記の吹き出しに出す botたんの名前・アイコンは、プロフィール取得の付属情報から借りる。
	// 取れなくても DiaryCalendar 側の仮の botたんで表示できるので、失敗は握りつぶす。
	$effect(() => {
		const did = $session?.did;
		if (!did || botActorFor === did) return;
		botActorFor = did;
		getProfile(did, { limit: 1, lang: i18n.locale })
			.then((response) => {
				botActor = response.feed.botActor ?? botActor;
				displayName = response.profile.displayName || response.profile.handle;
				avatar = response.profile.avatar;
			})
			.catch(() => {});
	});
</script>

<section class="page-title"><h1>{m.navDiary()}</h1></section>
{#if $session}
	<div class="tabs" role="tablist" aria-label={m.diaryTabsAria()}>
		{#each tabs as t (t.id)}
			<button
				role="tab"
				aria-selected={tab === t.id}
				class:active={tab === t.id}
				onclick={() => select(t.id)}
				>{t.label()}{#if t.id === 'chronicle'}<span class="tab-notice"
						><NavBadge
							unread={chronicleUnread}
							style="dot"
							aria={() => m.chronicleUnreadBadgeAria()}
						/></span
					>{/if}</button
			>
		{/each}
	</div>
	<section class="timeline">
		{#if tab === 'chronicle'}
			<ChronicleTimeline did={$session.did} {displayName} {avatar} />
		{:else}
			<DiaryCalendar did={$session.did} {initialDate} {botActor} />
		{/if}
	</section>
{/if}

<style>
	.tab-notice {
		position: relative;
		display: inline-block;
		margin-inline-start: 8px;
	}
	.tabs {
		display: flex;
		gap: 4px;
		padding: 0 1rem;
		border-block-end: 1px solid var(--line);
	}
	.tabs button {
		flex: 0 0 auto;
		padding: 0.6rem 0.9rem;
		border: 0;
		border-block-end: 2px solid transparent;
		background: none;
		color: var(--text-faint);
		font-size: 0.9rem;
		font-weight: 700;
	}
	.tabs button.active {
		color: var(--text);
		border-block-end-color: var(--accent-strong);
	}
</style>
