<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';

	/**
	 * 作者の意図。**最初は畳んでおく。** 他人の意図を先に読むと、札だけを見て自分なりに
	 * 解釈する楽しみが消えるので、読む人が自分で開くまで本文は出さない。
	 */
	let { note }: { note?: string } = $props();
	let open = $state(false);
	const id = $props.id();
</script>

{#if note}
	<div class="zenkatsu-note">
		<button
			type="button"
			class="toggle"
			aria-expanded={open}
			aria-controls={id}
			onclick={() => (open = !open)}
		>
			<span class="chevron" aria-hidden="true">{open ? '▾' : '▸'}</span>
			{open ? m.zenkatsuNoteHide() : m.zenkatsuNoteShow()}
		</button>
		{#if open}
			<p {id} class="body" aria-label={m.zenkatsuNoteHeading()}>{note}</p>
		{/if}
	</div>
{/if}

<style>
	.zenkatsu-note {
		margin-block-start: 0.6rem;
	}
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 36px;
		padding: 0.3rem 0.8rem;
		border: 1px dashed var(--line-strong);
		border-radius: 999px;
		background: none;
		color: var(--text-sub);
		font: inherit;
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
	}
	.chevron {
		font-size: 0.7rem;
	}
	.body {
		margin: 0.5rem 0 0;
		padding: 0.7rem 0.9rem;
		border-inline-start: 3px solid var(--accent-strong);
		border-radius: 4px;
		background: var(--accent-soft);
		font-size: 0.88rem;
		line-height: 1.7;
		white-space: pre-line;
		overflow-wrap: anywhere;
	}
</style>
