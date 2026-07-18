<script lang="ts">
	import { onMount } from 'svelte';
	import { getNotifications } from '$lib/api/appview';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	let items = $state<any[]>([]);
	let error = $state('');
	onMount(async () => {
		if (!$session && $oauthReady) {
			location.href = '/login';
			return;
		}
		try {
			items = (await getNotifications()).items;
		} catch (e) {
			error = e instanceof Error ? e.message : '通知を取得できません';
		}
	});
</script>

<section class="page-title"><h1>通知</h1></section>
<section class="timeline">
	{#if error}<div class="state error">{error}</div>{/if}{#each items as item}<div class="notice">
			<strong>{item.actor.displayName ?? item.actor.handle}</strong>さんが{item.type === 'reply'
				? '返信'
				: 'リアクション'}しました。
		</div>{/each}
</section>
