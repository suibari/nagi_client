<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		BOT_AAR_PRICE,
		KEEP_PER_CARD,
		WELCOME_ZENNY,
		ZENNY_RATES,
	} from '$lib/cards/share-board';

	/** おすそわけボードのしくみ。画面の短い説明文に入りきらない決まりごとをここに置く。 */
	let { id, onclose }: { id: string; onclose: () => void } = $props();
	let dialog: HTMLDialogElement;
	let body: HTMLDivElement;
	onMount(() => {
		const previousFocus = document.activeElement;
		dialog.showModal();
		// 開いた瞬間に「×」が光るのを避ける。読み始めは本文から。
		body?.focus({ preventScroll: true });
		const previous = document.documentElement.style.overflow;
		document.documentElement.style.overflow = 'hidden';
		return () => {
			dialog.close();
			document.documentElement.style.overflow = previous;
			queueMicrotask(() => {
				if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
					previousFocus.focus({ preventScroll: true });
			});
		};
	});
</script>

<dialog
	bind:this={dialog}
	{id}
	class="help"
	aria-labelledby={`${id}-title`}
	oncancel={(event) => {
		event.preventDefault();
		onclose();
	}}
	onclick={(event) => {
		// ::backdrop を押すと target はダイアログ自身になる。ゼンカツのヘルプと同じく背景で閉じる。
		if (event.target === dialog) onclose();
	}}
>
	<header>
		<h2 id={`${id}-title`}>{m.boardHelpTitle()}</h2>
		<button class="help-close" aria-label={m.close()} onclick={onclose}>×</button>
	</header>
	<div class="help-body" bind:this={body} tabindex="-1">
		<section>
			<h3>{m.boardHelpDonateTitle()}</h3>
			<ul>
				<li>{m.boardHelpDonate1({ keep: KEEP_PER_CARD })}</li>
				<li>{m.boardHelpDonate2()}</li>
				<li>{m.boardHelpDonate3()}</li>
			</ul>
		</section>
		<section>
			<h3>{m.boardHelpGetTitle()}</h3>
			<ul>
				<li>{m.boardHelpGet1()}</li>
				<li>{m.boardHelpGet2()}</li>
				<li>{m.boardHelpGet3()}</li>
				<li>{m.boardHelpGet4()}</li>
			</ul>
		</section>
		<section>
			<h3>{m.boardHelpRateTitle()}</h3>
			<p class="note">{m.boardHelpRateNote()}</p>
			<table>
				<thead>
					<tr>
						<th scope="col">{m.boardHelpRateRarity()}</th>
						<th scope="col" class="num">{m.boardHelpRateZenny()}</th>
					</tr>
				</thead>
				<tbody>
					{#each ZENNY_RATES as rate (rate.rarity)}
						<tr>
							<th scope="row">{rate.rarity}</th>
							<td class="num">{rate.zenny}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
		<section>
			<h3>{m.boardHelpAarTitle()}</h3>
			<ul>
				<li>{m.boardHelpAar1({ price: BOT_AAR_PRICE })}</li>
				<li>{m.boardHelpAar2()}</li>
			</ul>
		</section>
		<section>
			<h3>{m.boardHelpZennyTitle()}</h3>
			<ul>
				<li>{m.boardHelpZenny1({ amount: WELCOME_ZENNY })}</li>
				<li>{m.boardHelpZenny2()}</li>
			</ul>
		</section>
	</div>
</dialog>

<style>
	.help {
		width: min(620px, calc(100vw - 32px));
		max-width: none;
		max-height: calc(100dvh - 32px);
		margin: auto;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 20px;
		background: var(--bg-raised);
		color: var(--text);
		overscroll-behavior: contain;
	}
	.help::backdrop {
		background: rgb(0 0 0 / 0.72);
	}
	header {
		position: sticky;
		top: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1.25rem;
		border-bottom: 1px solid var(--line);
		background: var(--bg-raised);
	}
	h2,
	h3 {
		margin: 0;
		font-size: 1rem;
	}
	.help-close {
		width: 44px;
		height: 44px;
		flex-shrink: 0;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--bg);
		color: var(--text);
		font-size: 1.5rem;
	}
	.help-body:focus {
		outline: none;
	}
	.help-close:focus-visible {
		outline: 3px solid var(--accent-strong);
		outline-offset: 2px;
	}
	.help-body {
		padding: 1.25rem;
		font-size: 0.9rem;
		line-height: 1.8;
		overflow-wrap: anywhere;
	}
	section {
		margin-top: 1.4rem;
	}
	section:first-child {
		margin-top: 0;
	}
	.note {
		margin: 0.35rem 0 0;
		color: var(--text-muted);
	}
	table {
		margin-top: 0.5rem;
		inline-size: 100%;
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
	}
	th,
	td {
		padding: 0.35rem 0.6rem;
		border-bottom: 1px solid var(--line);
		text-align: start;
	}
	td.num,
	th.num {
		text-align: end;
	}
	thead th {
		color: var(--text-muted);
		font-size: 0.8rem;
		font-weight: 700;
	}
	/* base.css が ul の記号を落としているので、ここで戻す（箇条書きに見えないと章が効かない）。 */
	ul {
		margin: 0.35rem 0 0;
		padding-inline-start: 1.25em;
		list-style: disc;
	}
	li {
		margin-top: 0.3rem;
	}
</style>
