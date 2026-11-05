<script lang="ts">
	import { onMount } from 'svelte';
	import WelcomeTutorialEntry from '$lib/components/WelcomeTutorialEntry.svelte';
	import {
		TUTORIAL_TASKS,
		welcomeTutorial,
		type TutorialTask,
	} from '$lib/onboarding/tutorial.svelte';
	import { get } from 'svelte/store';
	import { oauthReady, session, type OAuthSession } from '$lib/oauth/session.svelte';

	/**
	 * 「Nagiのはじめかた」の確認用。?done=post,reaction で済んだ項目を、?closed でモーダルを閉じた状態を作る。
	 * ボタンで残りの項目を済ませて、全部済んだときの演出も確かめられる。
	 */
	const previewDid = 'did:plc:welcome-tutorial-preview';
	onMount(() => {
		const params = new URLSearchParams(location.search);
		let fake = false;
		let begun = false;
		/*
		 * OAuth の復元が終わってから始める。先に仮のセッションを入れると、あとから本物のセッションに
		 * 置き換わった時点で「別ユーザーに切り替わった」扱いになり、モーダルが閉じてしまう。
		 * サインイン済みならその DID で（このページを開くとその DID の進捗はやり直しになる）、
		 * 未サインインなら仮のセッションで始める。
		 */
		const unsubscribe = oauthReady.subscribe((ready) => {
			if (!ready || begun) return;
			begun = true;
			let did = get(session)?.did;
			if (!did) {
				did = previewDid;
				fake = true;
				session.set({
					did,
					fetchHandler: (url: string | URL) =>
						Promise.resolve(
							String(url).includes('com.atproto.repo.getRecord')
								? Response.json({ uri: '', value: { displayName: 'わたし', description: '' } })
								: Response.json({}),
						),
					getTokenInfo: async () => ({ scope: '' }),
				} as unknown as OAuthSession);
			}
			try {
				localStorage.removeItem(`nagi-welcome-tutorial:${did}`);
			} catch {
				// 確認用ページなので、消せなくても続ける。
			}
			welcomeTutorial.start(did);
			const done = (params.get('done') ?? '').split(',');
			for (const task of TUTORIAL_TASKS) if (done.includes(task)) welcomeTutorial.markDone(task);
			if (params.has('closed')) welcomeTutorial.close();
		});
		return () => {
			unsubscribe();
			if (fake) session.set(null);
		};
	});

	const complete = (task: TutorialTask) => welcomeTutorial.markDone(task);
</script>

<WelcomeTutorialEntry />
<div class="controls">
	{#each TUTORIAL_TASKS as task (task)}
		<button type="button" onclick={() => complete(task)}>complete {task}</button>
	{/each}
</div>

<style>
	.controls {
		display: flex;
		gap: 8px;
		padding: 16px;
	}
</style>
