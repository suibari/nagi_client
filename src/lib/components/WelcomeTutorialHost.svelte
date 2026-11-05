<script lang="ts">
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import { welcomeTutorial } from '$lib/onboarding/tutorial.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import WelcomeTutorialDialog from './WelcomeTutorialDialog.svelte';

	/*
	 * 「Nagiのはじめかた」の進捗をアプリ全体で拾う。対象外のユーザー（記録が無い）では
	 * markDone は何もしないので、ここでは条件を分けずに合図だけ流す。
	 * 絵文字の送信は ReactionBar が直接 markDone('reaction') を呼ぶ。
	 */
	$effect(() => {
		welcomeTutorial.load($session?.did);
	});

	// 投稿の合図はカウンタなので、マウント時点の値は「済んだ」扱いにしない。
	let postedBaseline = untrack(() => postedSignal.count);
	$effect(() => {
		const count = postedSignal.count;
		if (count === postedBaseline) return;
		postedBaseline = count;
		welcomeTutorial.markDone('post');
	});

	// 感情グラフは /diary の月間アクティビティ（既定のタブ）にある。年表タブは数えない。
	$effect(() => {
		if (page.url.pathname === '/diary' && page.url.searchParams.get('tab') !== 'chronicle')
			welcomeTutorial.markDone('mood');
	});
</script>

{#if welcomeTutorial.open}
	<WelcomeTutorialDialog />
{/if}
