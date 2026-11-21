<script lang="ts">
	import { onMount } from 'svelte';
	import { reportBskyPost, type BskyReportReason } from '$lib/bsky/agent';
	import type { BskyPostCardView } from '$lib/bsky/mapView';
	import { portal } from '$lib/actions/portal';
	import { m } from '$lib/i18n/i18n.svelte';
	import Button from '../Button.svelte';

	/**
	 * Bluesky 投稿を Bluesky のモデレーションへ通報する（BSKY-14）。
	 * Nagi の運営への通報（MOD-04）とは別で、送信先が Bluesky であることを示す。
	 */
	let { post, onclose }: { post: BskyPostCardView; onclose: () => void } = $props();

	const COMMENT_MAX = 2000;
	const reasons: { id: BskyReportReason; label: () => string }[] = [
		{ id: 'reasonSpam', label: m.bskyReportSpam },
		{ id: 'reasonRude', label: m.bskyReportRude },
		{ id: 'reasonSexual', label: m.bskyReportSexual },
		{ id: 'reasonMisleading', label: m.bskyReportMisleading },
		{ id: 'reasonViolation', label: m.bskyReportViolation },
		{ id: 'reasonOther', label: m.bskyReportOther },
	];
	let reason = $state<BskyReportReason>();
	let comment = $state('');
	let busy = $state(false);
	let error = $state('');
	let sent = $state(false);
	let cancelButton = $state<HTMLElement>();
	onMount(() => cancelButton?.focus());

	async function submit() {
		if (!reason || busy) return;
		busy = true;
		error = '';
		try {
			await reportBskyPost(post, reason, comment.trim() || undefined);
			sent = true;
		} catch (cause) {
			console.warn('[BskyReportDialog] report failed', cause);
			error = m.bskyReportFailed();
		} finally {
			busy = false;
		}
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !busy) onclose();
	}
</script>

<svelte:window onkeydown={keydown} />
<div
	class="delete-backdrop"
	role="presentation"
	use:portal
	onclick={(event) => event.target === event.currentTarget && !busy && onclose()}
>
	<div class="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="bsky-report-title">
		<h2 id="bsky-report-title">{m.bskyReportTitle()}</h2>
		{#if sent}
			<p role="status">{m.bskyReportSent()}</p>
			<div class="delete-actions">
				<Button variant="primary" type="button" onclick={onclose}>{m.close()}</Button>
			</div>
		{:else}
			<p>{m.bskyReportBody()}</p>
			<fieldset class="bsky-report-reasons" disabled={busy}>
				<legend class="visually-hidden">{m.bskyReportReason()}</legend>
				{#each reasons as option (option.id)}
					<label>
						<input type="radio" name="bsky-report-reason" value={option.id} bind:group={reason} />
						<span>{option.label()}</span>
					</label>
				{/each}
			</fieldset>
			<label class="bsky-report-comment">
				<span>{m.bskyReportComment()}</span>
				<textarea bind:value={comment} maxlength={COMMENT_MAX} rows="3" disabled={busy}></textarea>
			</label>
			{#if error}<p class="delete-error" role="alert">{error}</p>{/if}
			<div class="delete-actions">
				<Button
					variant="secondary"
					bind:ref={cancelButton}
					type="button"
					disabled={busy}
					onclick={onclose}>{m.cancel()}</Button
				>
				<Button variant="danger" type="button" disabled={!reason || busy} onclick={submit}
					>{m.bskyReportSubmit()}</Button
				>
			</div>
		{/if}
	</div>
</div>

<style>
	.bsky-report-reasons {
		display: grid;
		gap: 6px;
		margin: 0;
		padding: 0;
		border: 0;
		font-size: 14px;
	}
	.bsky-report-reasons label {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.bsky-report-comment {
		display: grid;
		gap: 4px;
		color: var(--text-muted);
		font-size: 13px;
	}
	.bsky-report-comment textarea {
		padding: 8px;
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
		background: var(--surface-1);
		color: var(--text);
		font: inherit;
		resize: vertical;
	}
</style>
