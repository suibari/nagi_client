<script lang="ts">
	import { goto } from '$app/navigation';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import AppLinkCard from '$lib/components/AppLinkCard.svelte';
	import { loadProfileAppLinks, type AppLinkView } from '$lib/atproto/appLinks';

	let { did }: { did?: string } = $props();

	let links = $state<AppLinkView[]>([]);
	// did ごとに一度だけ読む。表示は所有者の PDS を直読みするため失敗しても静かに握りつぶす。
	let loadedDid = '';
	$effect(() => {
		const target = did;
		if (!target || target === loadedDid) return;
		loadedDid = target;
		links = [];
		loadProfileAppLinks(target)
			.then((result) => {
				if (loadedDid === target) links = result;
			})
			.catch(() => {
				if (loadedDid === target) links = [];
			});
	});

	// 自分のプロフィールなら各カードに編集ボタンを出し、押すと設定画面の該当連携を開く。
	let isOwner = $derived(Boolean($session?.did && did && $session.did === did));
	function edit(collection: string) {
		void goto(`/settings/app-links?edit=${encodeURIComponent(collection)}`);
	}
</script>

{#if links.length}
	<section class="app-links" aria-labelledby="profile-app-links-heading">
		<h2 id="profile-app-links-heading" class="heading">{m.profileAppLinksHeading()}</h2>
		{#each links as link (link.collection)}
			<AppLinkCard {link} editable={isOwner} onedit={() => edit(link.collection)} />
		{/each}
	</section>
{/if}

<style>
	.app-links {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-block-start: 0.75rem;
	}
	.heading {
		margin: 0;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--text-muted);
	}
</style>
