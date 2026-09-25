<script lang="ts">
	import { chronicleUnread } from '$lib/chronicle/notice';
	import NavBadge from '$lib/components/shell/NavBadge.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getProfile } from '$lib/api/appview';
	import type { ActorView } from '$lib/api/types';
	import ChronicleTimeline from '$lib/components/ChronicleTimeline.svelte';
	import DiaryCalendar from '$lib/components/DiaryCalendar.svelte';
	import DiaryMoodChart from '$lib/components/DiaryMoodChart.svelte';
	import { m, i18n } from '$lib/i18n/i18n.svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { untrack } from 'svelte';

	// 日記は本人だけのページ。通知から ?date=YYYY-MM-DD で該当日を開く。
	const urlDate = $derived(page.url.searchParams.get('date') ?? undefined);
	/**
	 * 選択中の日。年間アクティビティと感情グラフで共有し、?date= に書き戻す
	 * （タブを切り替えても同じ日を開いたまま・再読込や共有にも耐える）。
	 */
	let selectedDate = $state<string | undefined>(untrack(() => urlDate));
	/**
	 * 表示する1年の範囲を決める日。URL から来た日付でだけ動かす。
	 * 画面内の選択で動かすと、選択を外した瞬間に範囲が今年へ飛んでしまう。
	 */
	let anchorDate = $state<string | undefined>(untrack(() => urlDate));
	let botActor = $state<ActorView>();
	// 年表の見出し「〜の日記」に出す本人の名前。
	let displayName = $state<string>();
	let avatar = $state<string>();
	let botActorFor = '';

	/**
	 * 表示するタブ。?tab= で共有・再読込に耐える。
	 * **?date= が来ているときに年表は開かない。** 通知からの日付ディープリンクは
	 * その日の日記を開く導線なので、年表を初期表示にすると行き先が変わってしまう。
	 * 感情グラフは日付を持てるので、?tab=mood&date= はそのまま感情グラフで開く。
	 */
	type TabId = 'activity' | 'mood' | 'chronicle';
	const tabs: { id: TabId; label: () => string }[] = [
		{ id: 'activity', label: () => m.diaryTabActivity() },
		{ id: 'mood', label: () => m.diaryTabMood() },
		{ id: 'chronicle', label: () => m.diaryTabChronicle() },
	];
	const tab = $derived.by<TabId>(() => {
		const requested = page.url.searchParams.get('tab');
		if (requested === 'mood') return 'mood';
		if (requested === 'chronicle' && !urlDate) return 'chronicle';
		return 'activity';
	});

	function replaceUrl(url: URL) {
		void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
	}

	function select(next: TabId) {
		if (tab === next) return;
		const url = new URL(page.url);
		if (next === 'activity') url.searchParams.delete('tab');
		else url.searchParams.set('tab', next);
		if (next === 'chronicle') url.searchParams.delete('date');
		else if (selectedDate) url.searchParams.set('date', selectedDate);
		replaceUrl(url);
	}

	// URL → 選択。年表の「この日の日記を見る」など、同じページ内の遷移で ?date= が変わったとき。
	let lastUrlDate = untrack(() => urlDate);
	$effect(() => {
		const next = urlDate;
		if (next === lastUrlDate) return;
		lastUrlDate = next;
		if (next) anchorDate = next;
		selectedDate = next;
	});

	// 選択 → URL。グラフで日付を押したら ?date= を書き換える（年表タブでは持たない）。
	$effect(() => {
		const next = selectedDate;
		untrack(() => {
			if (tab === 'chronicle' || next === urlDate) return;
			const url = new URL(page.url);
			if (next) url.searchParams.set('date', next);
			else url.searchParams.delete('date');
			lastUrlDate = next;
			replaceUrl(url);
		});
	});

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

<section class="page-title"><h1>{m.navActivity()}</h1></section>
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
		{:else if tab === 'mood'}
			<DiaryMoodChart did={$session.did} {anchorDate} bind:selected={selectedDate} />
		{:else}
			<DiaryCalendar did={$session.did} {anchorDate} bind:selected={selectedDate} {botActor} />
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
