<script lang="ts">
	import { untrack } from 'svelte';
	import type { ZenkatsuSubmissionView } from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';

	let {
		outcome,
		replay = true,
		oncomplete,
	}: {
		outcome: ZenkatsuSubmissionView;
		replay?: boolean;
		oncomplete: () => void;
	} = $props();
	let entries = $derived([
		...((outcome.tailwindCount ?? 0) > 0
			? [
					{
						id: 'attribute',
						type: 'ATTRIBUTE',
						title: m.zenkatsuResultTailwind(),
						detail: m.zenkatsuResultTailwindHit({ n: outcome.tailwindCount }),
						mark: `×${outcome.tailwindCount}`,
					},
				]
			: []),
		...(outcome.combos ?? []).map((combo) => ({
			id: `${combo.volume}:${combo.id}`,
			type: 'COMBO',
			title: i18n.locale === 'ja' ? combo.nameJa : combo.nameEn,
			detail: i18n.locale === 'ja' ? combo.descJa : combo.descEn,
			mark: '✦',
		})),
	]);
	let sequence = $derived(entries.map((entry) => entry.id).join('|'));
	let stopSequence = () => {};
	let current = $state(0);
	let complete = $state(false);
	function finish() {
		stopSequence();
		current = Math.max(0, entries.length - 1);
		complete = true;
		oncomplete();
	}
	$effect(() => {
		// Depend on identity/count, not on poll object or translated labels: neither should replay a bonus.
		void sequence;
		const count = untrack(() => entries.length);
		if (!replay || !count || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			untrack(finish);
			return;
		}
		current = 0;
		complete = false;
		let step = 0;
		const timer = setInterval(() => {
			step++;
			if (step >= count) {
				clearInterval(timer);
				finish();
			} else current = step;
		}, 1150);
		stopSequence = () => clearInterval(timer);
		return stopSequence;
	});
</script>

<!--
	ボーナスは1件ずつ出るが、**出たものは消えない**。演出が終わった時点で、成立した全項目が
	説明文つきのまま一覧として残る。最後の1件だけが大きく、残りが小さなチップに潰れると、
	何が起きたのかを後から見通せない。
-->
<section class="bonus-stage" class:complete class:quiet={!entries.length} aria-label="BONUS">
	<div class="bonus-header">
		<span class="bonus-heading">BONUS</span>
		<span class="bonus-progress"
			>{entries.length
				? `${complete ? entries.length : current + 1} / ${entries.length}`
				: '—'}</span
		>
		{#if !complete}<button onclick={finish}>{m.zenkatsuResultSkip()} ↗</button>{/if}
	</div>
	{#if entries.length}
		<ol class="bonus-list" aria-live="polite">
			{#each entries as entry, i (entry.id)}
				<li
					class="bonus-item"
					class:revealed={complete || i <= current}
					class:current={i === current}
					class:combo={entry.type === 'COMBO'}
				>
					<span class="bonus-mark" aria-hidden="true">{entry.mark}</span>
					<div class="bonus-copy">
						{#if entry.type === 'COMBO'}
							<p class="bonus-kind">{m.zenkatsuResultCombo()}</p>
						{/if}
						<h2>{entry.title}</h2>
						<p class="bonus-detail">{entry.detail}</p>
					</div>
				</li>
			{/each}
		</ol>
	{:else}
		<p class="no-bonus">{m.zenkatsuResultTailwindNone()}</p>
	{/if}
</section>

<style>
	.bonus-stage {
		--bonus: var(--zenkatsu-game-accent);
		--bonus-soft: color-mix(in srgb, var(--bonus) 12%, transparent);
		width: var(--zk-col, min(100%, 760px));
		border: 1px solid color-mix(in srgb, var(--bonus) 30%, var(--line));
		border-radius: var(--zk-r-panel, 18px);
		background: linear-gradient(
			150deg,
			color-mix(in srgb, var(--bonus) 7%, var(--zenkatsu-game-elevated)),
			var(--zenkatsu-game-elevated)
		);
		overflow: hidden;
	}
	.bonus-header {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 11px 20px;
		border-bottom: 1px solid var(--line);
		background: color-mix(in srgb, var(--bonus) 5%, transparent);
	}
	.bonus-heading {
		font-size: 0.72rem;
		font-weight: 900;
		letter-spacing: 0.26em;
		color: var(--bonus);
	}
	.bonus-progress {
		font-size: 0.7rem;
		font-variant-numeric: tabular-nums;
		color: var(--text-faint);
	}
	button {
		margin-left: auto;
		background: none;
		border: 0;
		padding: 6px;
		color: var(--text-faint);
		font: inherit;
		font-size: 0.75rem;
		cursor: pointer;
		min-height: 32px;
	}
	button:focus-visible {
		outline: 2px solid var(--bonus);
		outline-offset: 2px;
	}
	.bonus-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.bonus-item {
		position: relative;
		display: flex;
		align-items: center;
		gap: 18px;
		padding: 18px 20px 18px 22px;
		animation: bonus-hit 560ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	/* 未公開の行は場所も取らない。1件ずつ下へ伸びて「積み上がる」ように見せる。 */
	.bonus-item:not(.revealed) {
		display: none;
	}
	.bonus-item + .bonus-item {
		border-top: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
	}
	.combo {
		--bonus: var(--zenkatsu-game-gold);
	}
	/* 今出た行だけ左に色の柱を立てる。完了後は平らな一覧に戻し、全項目を対等に見せる。 */
	.bonus-item.current::before {
		content: '';
		position: absolute;
		inset-block: 0;
		inset-inline-start: 0;
		width: 3px;
		background: var(--bonus);
	}
	.bonus-item.current {
		background: var(--bonus-soft);
	}
	.complete .bonus-item.current::before {
		display: none;
	}
	.complete .bonus-item.current {
		background: none;
	}
	.bonus-mark {
		flex-shrink: 0;
		display: grid;
		place-items: center;
		width: 58px;
		height: 58px;
		border-radius: var(--zk-r-card, 12px);
		border: 1px solid color-mix(in srgb, var(--bonus) 35%, transparent);
		background: color-mix(in srgb, var(--bonus) 10%, transparent);
		font-size: 1.6rem;
		font-weight: 900;
		letter-spacing: -0.05em;
		line-height: 1;
		color: var(--bonus);
		text-shadow: 0 0 22px color-mix(in srgb, var(--bonus) 35%, transparent);
	}
	.bonus-copy {
		min-width: 0;
	}
	p,
	h2 {
		margin: 0;
	}
	.bonus-kind {
		color: var(--bonus);
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.18em;
		margin-bottom: 6px;
	}
	h2 {
		font-size: clamp(1.05rem, 2.6vw, 1.35rem);
		line-height: 1.4;
		overflow-wrap: anywhere;
	}
	.bonus-detail {
		color: var(--text-faint);
		font-size: 0.82rem;
		line-height: 1.7;
		margin-top: 5px;
	}
	.quiet {
		border-color: var(--line);
		background: var(--zenkatsu-game-elevated);
	}
	.no-bonus {
		margin: 0;
		padding: 18px 20px;
		color: var(--text-faint);
		font-size: 0.85rem;
		line-height: 1.7;
	}
	@keyframes bonus-hit {
		0% {
			opacity: 0;
			transform: scale(1.12) translateY(-10px);
			filter: blur(5px);
		}
		45% {
			opacity: 1;
			transform: scale(0.99);
			filter: blur(0);
		}
		100% {
			transform: scale(1);
		}
	}
	@media (max-width: 600px) {
		.bonus-header {
			padding-inline: 16px;
		}
		.bonus-item {
			gap: 14px;
			padding: 15px 16px 15px 18px;
		}
		.bonus-mark {
			width: 46px;
			height: 46px;
			font-size: 1.25rem;
		}
		.no-bonus {
			padding-inline: 16px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.bonus-item {
			animation: none;
		}
	}
</style>
