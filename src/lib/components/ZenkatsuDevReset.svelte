<script lang="ts">
	import { dev } from '$app/environment';
	import { resetZenkatsu } from '$lib/api/appview';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';

	/**
	 * 開発専用。今日のぶんを消して、もう一度ゼンカツを出せるようにする。
	 *
	 * 1日1回のロックを環境変数で外すのではなく「消して出し直す」形にしているのは、
	 * 所持・クールダウン・当日判定・採点・コンボ・総評という**本物の経路を毎回まるごと通す**ため。
	 * ロックを殺してしまうと、検証したい当の制約が効いていない状態で試すことになる。
	 *
	 * `dev` はビルド時に決まるので、本番バンドルにはこのボタンごと残らない。
	 * AppView 側も開発モードでなければルートを登録しないので、二重に閉じている。
	 */
	let { onReset }: { onReset?: () => void } = $props();
	let busy = $state(false);
	let done = $state(false);

	async function run() {
		busy = true;
		try {
			await resetZenkatsu();
			done = true;
			onReset?.();
		} finally {
			busy = false;
		}
	}
</script>

{#if dev && $session}
	<div class="dev">
		<button onclick={run} disabled={busy}>{m.zenkatsuDevReset()}</button>
		{#if done}<span class="done">{m.zenkatsuDevResetDone()}</span>{/if}
	</div>
{/if}

<style>
	/* 開発用なので、本番の意匠に混ざらないよう意図的に浮かせる。 */
	.dev {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.6rem 1rem;
		border: 1px dashed var(--line);
		border-radius: 10px;
		margin: 0.5rem 1rem;
	}
	.dev button {
		padding: 0.4rem 1rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: none;
		color: var(--text-faint);
		font-size: 0.8rem;
	}
	.done {
		color: var(--text-faint);
		font-size: 0.75rem;
	}
</style>
