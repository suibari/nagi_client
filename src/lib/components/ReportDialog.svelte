<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import {
		ApiRequestError,
		createReport,
		isAuthorizationError,
		type ReportReason,
	} from '$lib/api/appview';
	import type { ActorView, PostView, ReactionView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session, setOAuthReturnTo, signIn } from '$lib/oauth/session.svelte';
	import { grantedOptIns } from '$lib/optin/scope-optin';
	import Avatar from './Avatar.svelte';
	import Button from './Button.svelte';

	/**
	 * 投稿（botたんの投稿を含む）や、自分の投稿に付いたリアクションを運営に伝える。
	 * 届くのは運営の Discord だけで、相手には知らされない。
	 */
	let {
		post,
		reactions,
		onclose,
	}: {
		post: PostView;
		/** 渡したときはリアクションの通報になる（自分の投稿に付いたもの）。 */
		reactions?: ReactionView[];
		onclose: () => void;
	} = $props();

	const COMMENT_MAX = 1000;
	const reactionMode = $derived(Boolean(reactions));
	const kind = $derived(reactionMode ? 'reaction' : post.isBot ? 'bot' : 'post');

	/** 誰が・どの絵文字を付けたか。自分のリアクションは選べない。 */
	const reactors = $derived.by(() => {
		const byDid = new Map<string, { actor: ActorView; emojis: string[] }>();
		for (const reaction of reactions ?? []) {
			const label = reaction.bluemoji ? `:${reaction.bluemoji.name}:` : reaction.emoji;
			for (const actor of reaction.reactors) {
				if (actor.did === $session?.did) continue;
				const entry = byDid.get(actor.did) ?? { actor, emojis: [] };
				entry.emojis.push(label);
				byDid.set(actor.did, entry);
			}
		}
		return [...byDid.values()];
	});

	const reasonOptions = $derived<{ id: ReportReason; label: () => string }[]>(
		kind === 'bot'
			? [
					{ id: 'botResponse', label: m.reportReasonBotResponse },
					{ id: 'sensitive', label: m.reportReasonSensitive },
					{ id: 'other', label: m.reportReasonOther },
				]
			: kind === 'reaction'
				? [
						{ id: 'harassment', label: m.reportReasonHarassment },
						{ id: 'spam', label: m.reportReasonSpam },
						{ id: 'other', label: m.reportReasonOther },
					]
				: [
						{ id: 'harassment', label: m.reportReasonHarassment },
						{ id: 'spam', label: m.reportReasonSpam },
						{ id: 'sensitive', label: m.reportReasonSensitive },
						{ id: 'other', label: m.reportReasonOther },
					],
	);

	let reason = $state<ReportReason | undefined>(undefined);
	let reactorDid = $state<string | undefined>(undefined);
	let comment = $state('');
	let busy = $state(false);
	let error = $state('');
	let needsAuthorization = $state(false);
	let sent = $state(false);
	let dialog = $state<HTMLElement>();

	// botたんの投稿は「返答へのFB」が主な用途なので最初から選んでおく。相手が1人ならそれも選んでおく。
	$effect(() => {
		if (kind === 'bot' && !reason) reason = 'botResponse';
		if (reactionMode && !reactorDid && reactors.length === 1) reactorDid = reactors[0].actor.did;
	});

	const canSubmit = $derived(
		!busy &&
			Boolean(reason) &&
			(!reactionMode || Boolean(reactorDid)) &&
			comment.length <= COMMENT_MAX,
	);
	const title = $derived(
		kind === 'reaction'
			? m.reportTitleReaction()
			: kind === 'bot'
				? m.reportTitleBot()
				: m.reportTitlePost(),
	);

	onMount(() => {
		const previousFocus = document.activeElement;
		dialog?.focus({ preventScroll: true });
		return () => {
			if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
				previousFocus.focus({ preventScroll: true });
		};
	});

	async function submit() {
		if (!canSubmit || !reason) return;
		busy = true;
		error = '';
		needsAuthorization = false;
		try {
			await createReport({
				subject: { uri: post.uri, ...(reactionMode && reactorDid ? { reactor: reactorDid } : {}) },
				reason,
				...(comment.trim() ? { comment: comment.trim() } : {}),
			});
			sent = true;
		} catch (cause) {
			if (isAuthorizationError(cause)) needsAuthorization = true;
			else if (cause instanceof ApiRequestError && cause.status === 429)
				error = m.reportRateLimited();
			else error = m.reportFailed();
		} finally {
			busy = false;
		}
	}

	async function reauthorize() {
		if (!$session || busy) return;
		busy = true;
		setOAuthReturnTo(`${page.url.pathname}${page.url.search}`);
		try {
			await signIn($session.did, { ...(await grantedOptIns()), refreshPermissions: true });
		} catch {
			error = m.reportFailed();
		} finally {
			busy = false;
		}
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !busy) onclose();
	}
	function backdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget && !busy) onclose();
	}
</script>

<svelte:window onkeydown={keydown} />
<div class="report-backdrop" role="presentation" onclick={backdropClick}>
	<div
		class="report-dialog"
		role="dialog"
		aria-modal="true"
		aria-labelledby="report-title"
		tabindex="-1"
		bind:this={dialog}
	>
		{#if sent}
			<h2 id="report-title">{m.reportDoneTitle()}</h2>
			<p class="note">{m.reportDoneBody()}</p>
			<div class="actions">
				<Button variant="primary" type="button" onclick={onclose}>{m.close()}</Button>
			</div>
		{:else}
			<header>
				<h2 id="report-title">{title}</h2>
				<p class="note">{m.reportPrivacyNote()}</p>
			</header>
			{#if reactionMode}
				<fieldset>
					<legend>{m.reportReactorLabel()}</legend>
					{#each reactors as entry (entry.actor.did)}
						<label class="option">
							<input
								type="radio"
								name="report-reactor"
								value={entry.actor.did}
								bind:group={reactorDid}
							/>
							<Avatar actor={entry.actor} size="small" />
							<span class="option-text">
								<span class="option-name">{entry.actor.displayName || entry.actor.handle}</span>
								<span class="option-meta">{entry.emojis.join(' ')}</span>
							</span>
						</label>
					{/each}
				</fieldset>
			{/if}
			<fieldset>
				<legend>{m.reportReasonLabel()}</legend>
				{#each reasonOptions as option (option.id)}
					<label class="option">
						<input type="radio" name="report-reason" value={option.id} bind:group={reason} />
						<span class="option-name">{option.label()}</span>
					</label>
				{/each}
			</fieldset>
			<label class="comment">
				<span class="legend">{m.reportCommentLabel()}</span>
				<textarea
					bind:value={comment}
					rows="3"
					maxlength={COMMENT_MAX}
					placeholder={m.reportCommentPlaceholder()}
				></textarea>
			</label>
			{#if needsAuthorization}
				<p class="error" role="alert">{m.reportAuthorizationNeeded()}</p>
			{:else if error}
				<p class="error" role="alert">{error}</p>
			{/if}
			<div class="actions">
				<Button variant="secondary" type="button" disabled={busy} onclick={onclose}
					>{m.cancel()}</Button
				>
				{#if needsAuthorization}
					<Button variant="primary" type="button" disabled={busy} onclick={reauthorize}
						>{m.zenkatsuReauthorize()}</Button
					>
				{:else}
					<Button variant="primary" type="button" disabled={!canSubmit} onclick={submit}
						>{busy ? m.reportSending() : m.reportSubmit()}</Button
					>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.report-backdrop {
		position: fixed;
		inset: 0;
		z-index: 110;
		display: grid;
		place-items: center;
		padding: 16px;
		background: color-mix(in srgb, var(--bg) 82%, #000);
	}
	.report-dialog {
		display: grid;
		gap: 16px;
		inline-size: min(100%, 420px);
		max-block-size: calc(100dvh - 32px);
		overflow-y: auto;
		padding: 20px;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-md);
		background: var(--surface-1);
		box-shadow: var(--shadow-pop);
	}
	.report-dialog:focus {
		outline: none;
	}
	header {
		display: grid;
		gap: 4px;
	}
	h2 {
		margin: 0;
		font-size: 1.05rem;
	}
	.note {
		margin: 0;
		color: var(--text-faint);
		font-size: 0.82rem;
		line-height: 1.6;
	}
	fieldset {
		display: grid;
		gap: 4px;
		margin: 0;
		padding: 0;
		border: 0;
	}
	legend,
	.legend {
		margin-block-end: 4px;
		padding: 0;
		color: var(--text-sub);
		font-size: 0.82rem;
		font-weight: 700;
	}
	.option {
		display: flex;
		align-items: center;
		gap: 10px;
		min-block-size: 44px;
		padding: 4px 12px;
		border: 1px solid var(--line);
		border-radius: 10px;
		cursor: pointer;
		transition:
			background-color 0.14s ease,
			border-color 0.14s ease;
	}
	.option:hover {
		background: var(--bg);
	}
	.option:has(input:checked) {
		border-color: var(--accent-strong);
		background: var(--bg);
	}
	.option input {
		flex: 0 0 auto;
		margin: 0;
		accent-color: var(--accent-strong);
	}
	.option-text {
		display: grid;
		min-inline-size: 0;
	}
	.option-name {
		overflow-wrap: anywhere;
		font-size: 0.9rem;
	}
	.option-meta {
		color: var(--text-faint);
		font-size: 0.8rem;
	}
	.comment {
		display: grid;
	}
	textarea {
		inline-size: 100%;
		min-block-size: 80px;
		padding: 8px 12px;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: var(--bg);
		color: var(--text);
		font: inherit;
		font-size: 0.9rem;
		resize: vertical;
	}
	textarea:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 1px;
	}
	.error {
		margin: 0;
		color: var(--danger);
		font-size: 0.85rem;
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}
	@media (prefers-reduced-motion: reduce) {
		.option {
			transition: none;
		}
	}
</style>
