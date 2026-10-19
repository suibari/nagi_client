<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte';
	import { getZenkatsuDeck } from '$lib/api/appview';
	import type { ZenkatsuDeckView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import ZenkatsuRecordShelf from './ZenkatsuRecordShelf.svelte';

	/** 未発見のコンボはサーバーから中身が返らない。 */
	let { did }: { did: string } = $props();
	let record = $state<ZenkatsuDeckView>();
	let loading = $state(true);
	let error = $state(false);

	$effect(() => {
		void did;
		let active = true;
		record = undefined;
		loading = true;
		error = false;
		getZenkatsuDeck()
			.then((result) => {
				if (active) record = result;
			})
			.catch(() => {
				if (active) error = true;
			})
			.finally(() => {
				if (active) loading = false;
			});
		return () => {
			active = false;
		};
	});
</script>

{#if loading}
	<Spinner />
{:else if error || !record}
	<p class="state">{m.recordFetchFailed()}</p>
{:else}
	<ZenkatsuRecordShelf {record} />
{/if}

<style>
	.state {
		padding: 2rem 1rem 1rem;
		color: var(--text-faint);
		font-size: 0.9rem;
	}
</style>
