<script lang="ts">
	import { page } from '$app/state';
	import { getProfile } from '$lib/api/appview';
	import type { ActorView } from '$lib/api/types';
	import DiaryCalendar from '$lib/components/DiaryCalendar.svelte';
	import { m, i18n } from '$lib/i18n/i18n.svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';

	// 日記は本人だけのページ。通知から ?date=YYYY-MM-DD で該当日を開く。
	const initialDate = $derived(page.url.searchParams.get('date') ?? undefined);
	let botActor = $state<ActorView>();
	let botActorFor = '';

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
			.then((response) => (botActor = response.feed.botActor ?? botActor))
			.catch(() => {});
	});
</script>

<section class="page-title"><h1>{m.navDiary()}</h1></section>
{#if $session}
	<section class="timeline">
		<DiaryCalendar did={$session.did} {initialDate} {botActor} />
	</section>
{/if}
