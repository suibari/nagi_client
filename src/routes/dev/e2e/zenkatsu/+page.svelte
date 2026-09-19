<script lang="ts">
	import { onMount } from 'svelte';
	import { cardCollections } from '$lib/cards/collection.svelte';
	import { session, type OAuthSession } from '$lib/oauth/session.svelte';
	import ZenkatsuBoard from '$lib/components/ZenkatsuBoard.svelte';
	import ZenkatsuPlay from '$lib/components/ZenkatsuPlay.svelte';
	import type { CardView, ZenkatsuThemeView } from '$lib/api/types';
	let open = $state(false);
	let fail = $state(false);
	let submitted = $state(0);
	let board = $state(false);
	onMount(() => {
		if (!new URLSearchParams(location.search).has('board')) return;
		const did = 'did:plc:zenkatsu-preview';
		session.set({
			did,
			fetchHandler: (url: string | URL, init?: RequestInit) =>
				String(url).includes('com.suibari.nagi.getCards')
					? Promise.resolve(
							Response.json({ cards, ownedCount: cards.length, totalCount: cards.length }),
						)
					: fetch(url, init),
			getTokenInfo: async () => ({ scope: '' }),
		} as unknown as OAuthSession);
		void cardCollections.ensure(did);
		board = true;
		return () => session.set(null);
	});
	const cards: CardView[] = Array.from({ length: 12 }, (_, i) => ({
		volume: 1,
		id: i + 1,
		rarity: 'R',
		attribute: 'wind',
		atk: 1200,
		def: 900,
		nameJa: `きみの味方 ${i + 1}`,
		nameEn: `Your ally ${i + 1}`,
		raceJa: 'もふもふ族',
		raceEn: 'Fluffy',
		owned: true,
		textJa: 'きみが今日ここにいる、それだけでもう十分すごいことなんだよ。',
		textEn: 'Just being here today is already something worth celebrating.',
	}));
	const theme: ZenkatsuThemeView = {
		volume: 1,
		id: 1,
		themeDate: '2026-09-19',
		textJa: '今日のきみに、追い風を。',
		textEn: 'A tailwind for you today.',
		attribute: 'wind',
		tone: 'sunao',
	};
</script>

{#if board}
	<ZenkatsuBoard />
{:else}
	<button onclick={() => (open = true)}>Open game</button>
	<label><input type="checkbox" bind:checked={fail} /> Fail submission</label>
	<p data-testid="submissions">{submitted}</p>
	{#if open}
		<ZenkatsuPlay
			hand={cards.map((card, i) => ({
				card,
				p: { volume: card.volume, id: card.id, available: i === 11 ? 0 : 1, restingDays: 2 },
			}))}
			maxCards={3}
			{theme}
			onclose={() => (open = false)}
			onsubmit={async () => {
				if (fail) throw new Error('Test failure');
				submitted++;
				return 'at://did:plc:preview/tan.zenkatsu/2026-09-19';
			}}
		/>
	{/if}
{/if}
