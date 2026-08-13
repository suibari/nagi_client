<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import {
		ApiRequestError,
		getLinkThumbnail,
		getMyNewsSubmissions,
		getNewsSubmissionPreview,
		requestNewsReview,
	} from '$lib/api/appview';
	import type { NewsSubmissionItem, NewsSubmissionPreview } from '$lib/api/types';
	import { createNewsRecord, deleteOwnNews } from '$lib/atproto/records';
	import { dateLocale, m } from '$lib/i18n/i18n.svelte';
	import { grantedOptIns } from '$lib/optin/scope-optin';
	import { session, setOAuthReturnTo, signIn } from '$lib/oauth/session.svelte';
	import Icon from './shell/Icon.svelte';

	let { onclose, onapproved }: { onclose: () => void; onapproved: () => void } = $props();
	let dialog = $state<HTMLDivElement>();
	let url = $state('');
	let preview = $state<NewsSubmissionPreview>();
	let previewImage = $state('');
	let busy = $state(false);
	let error = $state('');
	let notice = $state('');
	let permissionError = $state(false);
	let submissions = $state<NewsSubmissionItem[]>([]);
	let pendingRef = $state<{ uri: string; cid: string }>();
	let pollTimer: ReturnType<typeof setInterval> | undefined;
	const pendingStorageKey = () => ($session ? `nagi.news.pending-review.v1:${$session.did}` : '');

	function savePending(value?: { uri: string; cid: string }) {
		pendingRef = value;
		const key = pendingStorageKey();
		if (!key) return;
		try {
			if (value) localStorage.setItem(key, JSON.stringify(value));
			else localStorage.removeItem(key);
		} catch {
			// 同じ画面を開いている間はメモリ上のStrongRefで再試行できる。
		}
	}

	function statusLabel(status: NewsSubmissionItem['status']) {
		return status === 'pending'
			? m.newsSubmissionPending()
			: status === 'processing'
				? m.newsSubmissionProcessing()
				: status === 'approved'
					? m.newsSubmissionApproved()
					: status === 'rejected'
						? m.newsSubmissionRejected()
						: status === 'cancelled'
							? m.newsSubmissionCancelled()
							: m.newsSubmissionFailed();
	}

	function setRequestError(value: unknown, fallback: 'preview' | 'submit' = 'preview') {
		const message = value instanceof Error ? value.message : '';
		permissionError =
			(value instanceof ApiRequestError && (value.status === 401 || value.status === 403)) ||
			/scope|permission/i.test(message);
		if (value instanceof ApiRequestError && value.code === 'duplicate_news')
			error = m.newsDuplicate();
		else if (value instanceof ApiRequestError && value.code === 'news_daily_limit')
			error = m.newsDailyLimit();
		else if (permissionError) error = m.newsPermissionRequired();
		else error = fallback === 'submit' ? m.newsSubmitFailed() : m.newsPreviewFailed();
	}

	async function loadSubmissions() {
		const before = new Set(
			submissions.filter((item) => item.status === 'approved').map((item) => item.uri),
		);
		try {
			const result = await getMyNewsSubmissions();
			submissions = result.items;
			if (result.items.some((item) => item.status === 'approved' && !before.has(item.uri)))
				onapproved();
		} catch {
			// 履歴の取得失敗はURL追加フォーム自体を塞がない。
		}
	}

	async function inspect() {
		if (busy || !url.trim()) return;
		busy = true;
		error = '';
		notice = '';
		permissionError = false;
		preview = undefined;
		if (previewImage) URL.revokeObjectURL(previewImage);
		previewImage = '';
		try {
			preview = await getNewsSubmissionPreview(url.trim());
			url = preview.url;
			if (preview.image) {
				const image = await getLinkThumbnail(preview.image).catch(() => undefined);
				if (image) previewImage = URL.createObjectURL(image);
			}
		} catch (value) {
			setRequestError(value);
		} finally {
			busy = false;
		}
	}

	async function sendReview(subject: { uri: string; cid: string }) {
		await requestNewsReview(subject);
		savePending();
		notice = m.newsSubmitted();
		preview = undefined;
		url = '';
		await loadSubmissions();
	}

	async function submit() {
		if (!preview || busy) return;
		busy = true;
		error = '';
		permissionError = false;
		try {
			const created = await createNewsRecord(preview);
			const subject = { uri: created.data.uri, cid: created.data.cid };
			savePending(subject);
			await sendReview(subject);
		} catch (value) {
			setRequestError(value, 'submit');
		} finally {
			busy = false;
		}
	}

	async function retryPending() {
		if (!pendingRef || busy) return;
		busy = true;
		error = '';
		try {
			await sendReview(pendingRef);
		} catch (value) {
			setRequestError(value, 'submit');
		} finally {
			busy = false;
		}
	}

	async function remove(item: NewsSubmissionItem) {
		if (!confirm(m.newsDeleteConfirm())) return;
		try {
			await deleteOwnNews(item.uri);
			submissions = submissions.map((current) =>
				current.uri === item.uri ? { ...current, status: 'cancelled' } : current,
			);
			onapproved();
		} catch {
			error = m.newsDeleteFailed();
		}
	}

	async function reauthorize() {
		if (!$session || busy) return;
		busy = true;
		setOAuthReturnTo('/news');
		try {
			await signIn($session.did, { ...(await grantedOptIns()), refreshPermissions: true });
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

	onMount(() => {
		dialog?.focus();
		const key = pendingStorageKey();
		if (key) {
			try {
				const stored = JSON.parse(localStorage.getItem(key) ?? 'null');
				if (stored && typeof stored.uri === 'string' && typeof stored.cid === 'string')
					pendingRef = stored;
			} catch {
				localStorage.removeItem(key);
			}
		}
		void loadSubmissions();
		pollTimer = setInterval(() => {
			if (submissions.some((item) => item.status === 'pending' || item.status === 'processing'))
				void loadSubmissions();
		}, 15_000);
	});
	onDestroy(() => {
		if (pollTimer) clearInterval(pollTimer);
		if (previewImage) URL.revokeObjectURL(previewImage);
	});
</script>

<svelte:window onkeydown={keydown} />
<div class="news-submit-backdrop" role="presentation" onclick={backdropClick}>
	<div
		bind:this={dialog}
		class="news-submit-dialog"
		role="dialog"
		aria-modal="true"
		aria-labelledby="news-submit-title"
		tabindex="-1"
	>
		<header>
			<div>
				<h2 id="news-submit-title">{m.newsAddTitle()}</h2>
				<p>{m.newsAddIntro()}</p>
			</div>
			<button
				class="icon-action"
				type="button"
				aria-label={m.close()}
				onclick={onclose}
				disabled={busy}><Icon name="close" size={18} /></button
			>
		</header>
		<form
			onsubmit={(event) => {
				event.preventDefault();
				void inspect();
			}}
		>
			<label for="news-url">{m.newsUrlLabel()}</label>
			<div class="url-row">
				<input
					id="news-url"
					type="url"
					bind:value={url}
					placeholder={m.newsUrlPlaceholder()}
					required
					disabled={busy}
				/>
				<button type="submit" disabled={busy || !url.trim()}
					>{busy && !preview ? m.newsPreviewing() : m.newsPreview()}</button
				>
			</div>
		</form>
		{#if preview}
			<article class="preview">
				{#if previewImage}<img src={previewImage} alt="" />{/if}
				<div>
					<small>{preview.sourceName}</small><strong>{preview.title}</strong>
					{#if preview.publishedAt}<time
							>{new Date(preview.publishedAt).toLocaleString(dateLocale())}</time
						>{/if}
				</div>
			</article>
			<button
				class="primary submit-review"
				type="button"
				disabled={busy}
				onclick={() => void submit()}>{busy ? m.newsSubmitting() : m.newsSubmit()}</button
			>
		{/if}
		{#if pendingRef}<button type="button" disabled={busy} onclick={() => void retryPending()}
				>{m.retry()}</button
			>{/if}
		{#if error}<div class="message error" role="alert">
				<p>{error}</p>
				{#if permissionError}<button
						type="button"
						disabled={busy}
						onclick={() => void reauthorize()}>{m.newsRefreshPermissions()}</button
					>{/if}
			</div>{/if}
		{#if notice}<p class="message success" role="status">{notice}</p>{/if}
		{#if submissions.length}
			<section class="history">
				<h3>{m.newsRecentSubmissions()}</h3>
				<ul>
					{#each submissions as item (item.uri + item.cid)}<li>
							<span><strong>{item.title}</strong><small>{statusLabel(item.status)}</small></span>
							<button
								class="ghost icon-action"
								type="button"
								aria-label={m.newsDelete()}
								title={m.newsDelete()}
								onclick={() => void remove(item)}><Icon name="trash" size={16} /></button
							>
						</li>{/each}
				</ul>
			</section>
		{/if}
	</div>
</div>

<style>
	.news-submit-backdrop {
		position: fixed;
		inset: 0;
		inline-size: 100vw;
		block-size: 100dvh;
		z-index: 130;
		display: grid;
		place-items: center;
		padding: 16px;
		background: color-mix(in srgb, var(--bg) 82%, #000);
	}
	.news-submit-dialog {
		width: min(100%, 620px);
		max-height: calc(100dvh - 32px);
		overflow: auto;
		padding: 18px;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-md);
		background: var(--surface-1);
		box-shadow: var(--shadow-pop);
	}
	.news-submit-dialog:focus {
		outline: none;
	}
	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}
	h2,
	h3,
	header p {
		margin: 0;
	}
	header p {
		margin-top: 5px;
		color: var(--text-muted);
		font-size: 0.86rem;
	}
	form {
		margin-top: 18px;
	}
	label {
		display: block;
		margin-bottom: 6px;
		font-weight: 700;
	}
	.url-row {
		display: flex;
		gap: 8px;
	}
	.url-row input {
		min-width: 0;
		flex: 1;
	}
	.preview {
		display: grid;
		grid-template-columns: minmax(0, 140px) 1fr;
		gap: 12px;
		margin-top: 16px;
		padding: 12px;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
	}
	.preview img {
		width: 100%;
		aspect-ratio: 1.91 / 1;
		object-fit: cover;
		border-radius: var(--r-sm);
	}
	.preview div,
	.history li span {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 4px;
	}
	.preview strong,
	.history strong {
		overflow-wrap: anywhere;
	}
	.preview small,
	.preview time,
	.history small {
		color: var(--text-muted);
		font-size: 0.78rem;
	}
	.submit-review {
		margin-top: 12px;
	}
	.message {
		margin: 12px 0 0;
		padding: 10px;
		border-radius: var(--r-sm);
	}
	.message p {
		margin: 0 0 8px;
	}
	.message.error {
		color: var(--danger);
		background: color-mix(in srgb, var(--danger) 8%, transparent);
	}
	.message.success {
		color: var(--text);
		background: var(--bg-inset);
	}
	.history {
		margin-top: 20px;
		padding-top: 16px;
		border-top: 1px solid var(--line);
	}
	.history h3 {
		font-size: 0.9rem;
	}
	.history ul {
		display: grid;
		gap: 8px;
		margin: 10px 0 0;
		padding: 0;
		list-style: none;
	}
	.history li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 9px 0;
		border-bottom: 1px solid var(--line);
	}
	.history strong {
		font-size: 0.85rem;
	}
	@media (max-width: 520px) {
		.url-row {
			align-items: stretch;
			flex-direction: column;
		}
		.preview {
			grid-template-columns: 1fr;
		}
	}
</style>
