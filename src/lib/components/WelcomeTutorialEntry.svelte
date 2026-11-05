<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import { TUTORIAL_TASKS, welcomeTutorial } from '$lib/onboarding/tutorial.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import Icon from './shell/Icon.svelte';

	/** モーダルを閉じたあとも、済むまではフィードの上から開き直せるようにしておく控えめな入口。 */
	const done = $derived(welcomeTutorial.done.length);
	const total = TUTORIAL_TASKS.length;
</script>

{#if $session && welcomeTutorial.showEntry}
	<div class="entry">
		<button
			type="button"
			class="open"
			aria-label={m.tutorialOpen()}
			onclick={() => welcomeTutorial.show()}
		>
			<span class="icon" aria-hidden="true"><Icon name="sprout" size={18} /></span>
			<span class="label">{m.tutorialTitle()}</span>
			<span class="progress" aria-hidden="true">
				{#each TUTORIAL_TASKS as task (task)}
					<span class:filled={welcomeTutorial.done.includes(task)}></span>
				{/each}
			</span>
			<span class="count" aria-label={m.tutorialProgressAria({ done, total })}>{done}/{total}</span>
		</button>
		<button
			type="button"
			class="dismiss"
			aria-label={m.tutorialDismiss()}
			title={m.tutorialDismiss()}
			onclick={() => welcomeTutorial.dismiss()}
		>
			<Icon name="close" size={16} />
		</button>
	</div>
{/if}

<style>
	.entry {
		display: flex;
		align-items: center;
		gap: 4px;
		margin: 0 16px 12px;
		padding: 4px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: var(--bg-raised);
	}
	.open {
		display: flex;
		flex: 1 1 auto;
		align-items: center;
		gap: 10px;
		min-inline-size: 0;
		min-block-size: 44px;
		padding: 0 8px 0 12px;
		border: 0;
		border-radius: 8px;
		background: transparent;
		color: var(--text);
		font: inherit;
		font-size: 0.9rem;
		font-weight: 700;
		text-align: start;
		cursor: pointer;
		transition: background-color 0.14s ease;
	}
	.open:hover {
		background: var(--bg);
	}
	.icon {
		display: inline-flex;
		color: var(--accent-strong);
	}
	.label {
		flex: 1 1 auto;
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.progress {
		display: grid;
		grid-template-columns: repeat(3, 20px);
		gap: 4px;
	}
	.progress span {
		block-size: 4px;
		border-radius: 2px;
		background: var(--line);
	}
	.progress span.filled {
		background: var(--accent-strong);
	}
	/* 狭い画面ではタイトルを優先し、進捗は数字だけにする。 */
	@media (max-width: 480px) {
		.progress {
			display: none;
		}
	}
	.count {
		color: var(--text-faint);
		font-size: 0.78rem;
		font-variant-numeric: tabular-nums;
	}
	.dismiss {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
		inline-size: 44px;
		block-size: 44px;
		border: 0;
		border-radius: 8px;
		background: transparent;
		color: var(--text-faint);
		cursor: pointer;
	}
	.dismiss:hover {
		background: var(--bg);
		color: var(--text);
	}
	.open:focus-visible,
	.dismiss:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}
</style>
