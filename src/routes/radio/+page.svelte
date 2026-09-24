<script lang="ts">
	import { getRadioHistory } from '$lib/api/appview';
	import type { RadioTrack } from '$lib/api/types';
	import RadioContent from '$lib/radio/RadioContent.svelte';
	import { radio } from '$lib/radio/radio.svelte';
	import { m, i18n } from '$lib/i18n/i18n.svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';

	let tracks = $state<RadioTrack[]>([]);
	let cursor = $state<string>();
	let unreadSlotKey = $state<string>();
	let loading = $state(false);
	let error = $state(false);
	let loadedFor = '';
	let requestId = 0;

	async function load(reset = false) {
		const did = $session?.did;
		if (!did || loading) return;
		const id = ++requestId;
		loading = true;
		error = false;
		try {
			const page = await getRadioHistory(reset ? undefined : cursor);
			if (id !== requestId || $session?.did !== did) return;
			tracks = reset ? page.tracks : [...tracks, ...page.tracks];
			cursor = page.cursor;
			if (reset) unreadSlotKey = page.unreadSlotKey;
			if (reset && page.tracks[0]) {
				void radio.markSeen(page.tracks[0].slotKey).catch((cause) =>
					console.error('Failed to mark radio as seen:', cause),
				);
			}
		} catch (cause) {
			if (id === requestId) {
				error = true;
				console.error('Failed to fetch radio history:', cause);
			}
		} finally {
			if (id === requestId) loading = false;
		}
	}

	$effect(() => {
		if (!$oauthReady) return;
		const did = $session?.did;
		if (!did) {
			location.href = '/login';
			return;
		}
		if (loadedFor === did) return;
		loadedFor = did;
		requestId++;
		loading = false;
		tracks = [];
		cursor = undefined;
		void load(true);
	});
</script>

<section class="page-title"><h1>{m.radioTitle()}</h1></section>
{#if $session}
	<div class="radio-history">
		<p class="radio-description">{m.radioDescription()}</p>
		{#each tracks as track (track.slotKey)}
			<article class="radio-entry">
				<RadioContent {track} unread={track.slotKey === unreadSlotKey} />
			</article>
		{/each}
		{#if !loading && !error && tracks.length === 0}
			<p class="state">{m.radioHistoryEmpty()}</p>
		{/if}
		{#if loading && tracks.length === 0}<p class="state">{m.loading()}</p>{/if}
		{#if error}
			<p class="state">{m.radioHistoryError()}</p>
			<button class="more" onclick={() => load(tracks.length === 0)}>{m.retry()}</button>
		{:else if cursor}
			<button class="more" disabled={loading} onclick={() => load()}>{m.radioHistoryMore()}</button>
		{/if}
	</div>
{/if}

<style>
	.radio-history {
		display: grid;
		gap: 20px;
		padding: 16px;
	}
	.radio-entry {
		display: grid;
		gap: 7px;
		min-width: 0;
	}
	.radio-description {
		margin: 0;
		color: var(--text-muted);
		font-size: 14px;
		line-height: 1.65;
	}
	.state {
		padding: 24px 0;
		color: var(--text-muted);
		text-align: center;
	}
	.more {
		justify-self: center;
		padding: 9px 18px;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--bg);
		color: var(--text);
		cursor: pointer;
	}
</style>
