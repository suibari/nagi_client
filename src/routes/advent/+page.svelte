<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AdventCalendar from '$lib/components/AdventCalendar.svelte';
	import Button from '$lib/components/Button.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { parseAdventDayParam } from '$lib/advent/advent';
	import {
		adventCalendar,
		fetchAdventReadState,
		loadAdventCalendar,
		markAdventOpened,
		markAdventSeen,
	} from '$lib/advent/notice.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';

	const initialDay = parseAdventDayParam(page.url.searchParams.get('day'));
	let error = $state(false);
	let openedDays = $state<number[] | null>(null);
	let readFor = $state<string | null | undefined>(undefined);

	async function load() {
		error = false;
		try {
			await loadAdventCalendar();
		} catch (cause) {
			console.error('Failed to fetch advent calendar:', cause);
			error = true;
		}
	}

	onMount(() => {
		void load();
	});

	// 既読と開封済みは、ログインの状態が決まってから読む。ゲストは手紙を出さない。
	$effect(() => {
		if (!$oauthReady) return;
		const did = $session?.did ?? null;
		if (readFor === did) return;
		readFor = did;
		openedDays = null;
		if (!did) {
			openedDays = [];
			return;
		}
		void fetchAdventReadState(did)
			.then((state) => {
				if ($session?.did !== did) return;
				const year = $adventCalendar?.year;
				openedDays = state && (!year || state.year === year) ? state.openedDays : [];
			})
			.catch(() => {
				// 読めないときは手紙を出さない（開けたかどうか分からないまま出さない）。
			});
	});

	// 画面に出した日まで既読にして、メニューのバッジを消す。
	$effect(() => {
		const calendar = $adventCalendar;
		if (!calendar || !$session) return;
		markAdventSeen(calendar.year, calendar.openedDay);
	});

	function opened(days: number[]) {
		const year = $adventCalendar?.year;
		if (!year) return;
		for (const day of days) markAdventOpened(year, day);
	}

	function syncDay(day: number | undefined) {
		const url = new URL(page.url);
		if (day) url.searchParams.set('day', String(day));
		else url.searchParams.delete('day');
		void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
	}
</script>

<PageHeader title={m.adventTitle()} description={m.adventDescription()} />
{#if $adventCalendar}
	<AdventCalendar
		calendar={$adventCalendar}
		viewerDid={$session?.did}
		{openedDays}
		{initialDay}
		onopened={opened}
		ondaychange={syncDay}
	/>
{:else if error}
	<p class="state">{m.adventLoadError()}</p>
	<Button variant="secondary" onclick={load}>{m.retry()}</Button>
{:else}
	<Spinner />
{/if}

<style>
	.state {
		color: var(--text-muted);
	}
</style>
