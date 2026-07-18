<script lang="ts">
	import { onMount } from 'svelte';
	import { getNotifications } from '$lib/api/appview';
	import type { NotificationView } from '$lib/api/types';
	import Avatar from '$lib/components/Avatar.svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	let items = $state<NotificationView[]>([]);
	let error = $state('');
	let loading = $state(true);
	onMount(async () => {
		if (!$session && $oauthReady) {
			location.href = '/login';
			return;
		}
		try {
			items = (await getNotifications()).items;
		} catch (e) {
			error = e instanceof Error ? e.message : '通知を取得できません';
		} finally {
			loading = false;
		}
	});
	const threadHref = (uri: string) => {
		const [, , did, , rkey] = uri.split('/');
		return `/thread/${did}/${rkey}`;
	};
</script>

<section class="page-title"><h1>通知</h1></section>
<section class="timeline">
	{#if error}<div class="state error">{error}</div>
	{:else if loading}<div class="state">読み込み中…</div>
	{:else if !items.length}<div class="state">まだ通知はありません。</div>
	{:else}
		{#each items as item (item.id)}
			<a class="notification card" href={threadHref(item.subjectUri)}>
				<Avatar actor={item.actor} size="small" />
				<span class="what"
					><strong>{item.actor.displayName ?? item.actor.handle}</strong>さんが{item.type ===
					'reply'
						? '返信'
						: 'リアクション'}しました</span
				>
				<time class="when"
					>{new Date(item.createdAt).toLocaleString('ja-JP', {
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
					})}</time
				>
			</a>
		{/each}
	{/if}
</section>
