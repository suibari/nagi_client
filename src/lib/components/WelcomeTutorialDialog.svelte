<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		TUTORIAL_TASKS,
		welcomeTutorial,
		type TutorialTask,
	} from '$lib/onboarding/tutorial.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import Confetti from './Confetti.svelte';
	import Icon from './shell/Icon.svelte';

	const id = 'welcome-tutorial';
	let dialog: HTMLDialogElement;
	let heading: HTMLHeadingElement;

	const items: { task: TutorialTask; icon: string; title: () => string; body: () => string }[] = [
		{ task: 'post', icon: 'send', title: m.tutorialPostTitle, body: m.tutorialPostBody },
		{
			task: 'reaction',
			icon: 'emoji',
			title: m.tutorialReactionTitle,
			body: m.tutorialReactionBody,
		},
		{ task: 'mood', icon: 'chart', title: m.tutorialMoodTitle, body: m.tutorialMoodBody },
	];
	const done = $derived(welcomeTutorial.done);
	const total = TUTORIAL_TASKS.length;

	onMount(() => {
		const previousFocus = document.activeElement;
		dialog.showModal();
		// 開いた瞬間に1行目へフォーカス枠が出ないよう、読み始めは見出しから。
		heading?.focus({ preventScroll: true });
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

	function close() {
		welcomeTutorial.close();
	}

	function run(task: TutorialTask) {
		close();
		if (task === 'post') composerHost.show();
		else if (task === 'reaction') {
			if (page.url.pathname !== '/') void goto('/');
		} else void goto('/diary');
	}
</script>

<dialog
	bind:this={dialog}
	{id}
	class="tutorial"
	aria-labelledby={`${id}-title`}
	oncancel={(event) => {
		event.preventDefault();
		close();
	}}
	onclick={(event) => {
		if (event.target === dialog) close();
	}}
>
	{#if welcomeTutorial.celebrating}<Confetti level="milestone" fullscreen />{/if}
	<header>
		<h2 id={`${id}-title`} bind:this={heading} tabindex="-1">
			<span class="title-icon" aria-hidden="true"><Icon name="sprout" size={18} /></span>
			{m.tutorialTitle()}
		</h2>
		<span class="count" aria-label={m.tutorialProgressAria({ done: done.length, total })}
			>{done.length}/{total}</span
		>
	</header>
	<p class="lead">{welcomeTutorial.complete ? m.tutorialLeadDone() : m.tutorialLead()}</p>
	<div class="progress" aria-hidden="true">
		{#each TUTORIAL_TASKS as task (task)}
			<span class:filled={done.includes(task)}></span>
		{/each}
	</div>
	<ul class="tasks">
		{#each items as item (item.task)}
			{@const finished = done.includes(item.task)}
			<li>
				<button type="button" class="task" class:finished onclick={() => run(item.task)}>
					<span class="task-icon" aria-hidden="true">
						<Icon name={finished ? 'checkCircle' : item.icon} size={18} />
					</span>
					<span class="task-text">
						<span class="task-title">
							{item.title()}
							{#if finished}<span class="visually-hidden">（{m.tutorialDoneAria()}）</span>{/if}
						</span>
						<span class="task-body">{item.body()}</span>
					</span>
					{#if !finished}
						<span class="task-chevron" aria-hidden="true"><Icon name="chevron" size={16} /></span>
					{/if}
				</button>
			</li>
		{/each}
	</ul>
	<footer>
		<p class="profile-note">
			{m.tutorialProfileNote()}
			<a href="/settings/profile" onclick={close}>{m.tutorialProfileLink()}</a>
		</p>
		<button type="button" class="close" onclick={close}>{m.close()}</button>
	</footer>
</dialog>

<style>
	.tutorial {
		width: min(560px, calc(100vw - 32px));
		max-width: none;
		max-height: calc(100dvh - 32px);
		margin: auto;
		padding: 20px;
		border: 1px solid var(--line);
		border-radius: 20px;
		background: var(--bg-raised);
		color: var(--text);
		overscroll-behavior: contain;
	}
	.tutorial::backdrop {
		background: rgb(0 0 0 / 0.6);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	h2 {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
	}
	h2:focus {
		outline: none;
	}
	.title-icon {
		display: inline-flex;
		color: var(--accent-strong);
	}
	.count {
		flex: 0 0 auto;
		color: var(--text-faint);
		font-size: 0.78rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	.lead {
		margin: 8px 0 0;
		color: var(--text-sub);
		font-size: 0.88rem;
		line-height: 1.7;
	}
	.progress {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 4px;
		margin-block: 12px 12px;
	}
	.progress span {
		block-size: 4px;
		border-radius: 2px;
		background: var(--line);
		transition: background-color 0.3s ease;
	}
	.progress span.filled {
		background: var(--accent-strong);
	}
	.tasks {
		display: grid;
		gap: 4px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.task {
		display: flex;
		align-items: center;
		gap: 12px;
		inline-size: 100%;
		min-block-size: 64px;
		padding: 12px;
		border: 0;
		border-radius: 12px;
		background: transparent;
		color: var(--text);
		font: inherit;
		text-align: start;
		cursor: pointer;
		transition: background-color 0.14s ease;
	}
	.task:hover {
		background: var(--bg);
	}
	.task:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}
	.task.finished {
		background: var(--bg);
	}
	.task-icon {
		display: inline-flex;
		flex: 0 0 auto;
		color: var(--text-sub);
	}
	.task.finished .task-icon {
		color: var(--accent-strong);
	}
	.task-text {
		display: grid;
		flex: 1 1 auto;
		gap: 2px;
		min-inline-size: 0;
	}
	.task-title {
		font-size: 0.95rem;
		font-weight: 700;
	}
	.task-body {
		color: var(--text-faint);
		font-size: 0.8rem;
		line-height: 1.6;
	}
	.task-chevron {
		display: inline-flex;
		flex: 0 0 auto;
		color: var(--text-faint);
	}
	footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-block-start: 12px;
		padding-block-start: 12px;
		border-block-start: 1px solid var(--line);
	}
	.profile-note {
		margin: 0;
		color: var(--text-faint);
		font-size: 0.78rem;
		line-height: 1.6;
	}
	.profile-note a {
		color: var(--text-sub);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.close {
		flex: 0 0 auto;
		min-block-size: 40px;
		padding: 0 16px;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: var(--bg);
		color: var(--text);
		font: inherit;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.close:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}
	@media (prefers-reduced-motion: reduce) {
		.task,
		.progress span {
			transition: none;
		}
	}
</style>
