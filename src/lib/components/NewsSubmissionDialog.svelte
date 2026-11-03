<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { onDestroy, onMount } from 'svelte';
	import {
		ApiRequestError,
		getLinkThumbnail,
		getMyNewsSubmissions,
		getNewsSubmissionPreview,
		requestNewsReview,
	} from '$lib/api/appview';
	import type { ActorView, NewsSubmissionItem, NewsSubmissionPreview } from '$lib/api/types';
	import { createNewsRecord, deleteOwnNews } from '$lib/atproto/records';
	import { dateLocale, m } from '$lib/i18n/i18n.svelte';
	import { grantedOptIns } from '$lib/optin/scope-optin';
	import { session, setOAuthReturnTo, signIn } from '$lib/oauth/session.svelte';
	import Avatar from './Avatar.svelte';
	import Spinner from './Spinner.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		onclose,
		onapproved,
		botActor,
	}: { onclose: () => void; onapproved: () => void; botActor?: ActorView } = $props();
	let dialog = $state<HTMLDivElement>();
	let input = $state<HTMLInputElement>();
	let url = $state('');
	let preview = $state<NewsSubmissionPreview>();
	let previewImage = $state('');
	let reading = $state(false);
	let busy = $state(false);
	let error = $state('');
	let notice = $state('');
	let permissionError = $state(false);
	let submissions = $state<NewsSubmissionItem[]>([]);
	let pendingRef = $state<{ uri: string; cid: string }>();
	let confirmingUri = $state<string>();
	let canPaste = $state(false);
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

	function clearPreview() {
		preview = undefined;
		if (previewImage) URL.revokeObjectURL(previewImage);
		previewImage = '';
	}

	async function inspect() {
		if (busy || !url.trim()) return;
		busy = true;
		reading = true;
		error = '';
		notice = '';
		permissionError = false;
		clearPreview();
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
			reading = false;
		}
	}

	// URLを貼ったらそのまま読み取る。手入力のときは「読み取る」ボタンか Enter で読む。
	function paste(event: ClipboardEvent) {
		const text = event.clipboardData?.getData('text')?.trim();
		if (!text || !/^https?:\/\//i.test(text)) return;
		event.preventDefault();
		url = text;
		void inspect();
	}

	async function pasteFromClipboard() {
		try {
			const text = (await navigator.clipboard.readText()).trim();
			if (!text) return;
			url = text;
			if (/^https?:\/\//i.test(text)) void inspect();
			else input?.focus();
		} catch {
			// 権限を断られたら、いつもどおり手で貼ってもらう。
			input?.focus();
		}
	}

	function editUrl() {
		// 読み取り後に書き換えたら、古いプレビューのまま追加させない。
		if (preview && url.trim() !== preview.url) clearPreview();
		error = '';
	}

	function resetUrl() {
		url = '';
		error = '';
		clearPreview();
		input?.focus();
	}

	async function sendReview(subject: { uri: string; cid: string }) {
		await requestNewsReview(subject);
		savePending();
		notice = m.newsSubmitted();
		clearPreview();
		url = '';
		// サーバーは受け付けた時点で掲載するので、一覧をすぐ取り直す。
		onapproved();
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
		confirmingUri = undefined;
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
		if (event.key !== 'Escape' || busy) return;
		if (confirmingUri) confirmingUri = undefined;
		else onclose();
	}
	function backdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget && !busy) onclose();
	}

	let publishedLabel = $derived(
		preview?.publishedAt
			? new Date(preview.publishedAt).toLocaleString(dateLocale(), {
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				})
			: '',
	);

	onMount(() => {
		(input ?? dialog)?.focus();
		canPaste = typeof navigator.clipboard?.readText === 'function';
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
		aria-describedby="news-submit-intro"
		tabindex="-1"
	>
		<header>
			<div class="heading">
				<h2 id="news-submit-title">{m.newsAddTitle()}</h2>
				<p id="news-submit-intro">{m.newsAddIntro()}</p>
			</div>
			<button
				class="icon-action"
				type="button"
				aria-label={m.close()}
				onclick={onclose}
				disabled={busy}><Icon name="close" size={18} /></button
			>
		</header>

		<div class="body">
			<form
				class="url-field"
				onsubmit={(event) => {
					event.preventDefault();
					void inspect();
				}}
			>
				<label for="news-url">{m.newsUrlLabel()}</label>
				<p class="hint" id="news-url-hint">{m.newsUrlHint()}</p>
				<div class="url-row">
					<div class="url-control" class:invalid={Boolean(error) && !preview}>
						<span class="url-icon" aria-hidden="true"><Icon name="link" size={16} /></span>
						<input
							bind:this={input}
							id="news-url"
							type="url"
							inputmode="url"
							autocomplete="off"
							spellcheck="false"
							bind:value={url}
							placeholder={m.newsUrlPlaceholder()}
							required
							disabled={busy}
							aria-busy={reading}
							aria-invalid={Boolean(error) && !preview}
							aria-describedby={error ? 'news-url-hint news-url-error' : 'news-url-hint'}
							oninput={editUrl}
							onpaste={paste}
						/>
						{#if url}
							<button
								class="url-inline"
								type="button"
								aria-label={m.newsClearUrl()}
								title={m.newsClearUrl()}
								disabled={busy}
								onclick={resetUrl}><Icon name="close" size={16} /></button
							>
						{:else if canPaste}
							<button
								class="url-inline paste"
								type="button"
								disabled={busy}
								onclick={() => void pasteFromClipboard()}>{m.newsPaste()}</button
							>
						{/if}
					</div>
					{#if !preview}
						<Button
							variant="secondary"
							class="url-read"
							type="submit"
							disabled={busy || !url.trim()}
						>
							{#if reading}<Spinner
									size="sm"
									inline
									decorative
								/>{m.newsPreviewing()}{:else}{m.newsPreview()}{/if}
						</Button>
					{/if}
				</div>
				{#if error}
					<div class="field-message error" id="news-url-error" role="alert">
						<Icon name="warning" size={16} />
						<p>{error}</p>
						{#if permissionError}<Button
								variant="secondary"
								size="sm"
								type="button"
								disabled={busy}
								onclick={() => void reauthorize()}>{m.newsRefreshPermissions()}</Button
							>{:else if pendingRef}<Button
								variant="secondary"
								size="sm"
								type="button"
								disabled={busy}
								onclick={() => void retryPending()}>{m.retry()}</Button
							>{/if}
					</div>
				{:else if pendingRef}
					<div class="field-message">
						<Icon name="clock" size={16} />
						<p>{m.newsPendingRetry()}</p>
						<Button
							variant="secondary"
							size="sm"
							type="button"
							disabled={busy}
							onclick={() => void retryPending()}>{m.retry()}</Button
						>
					</div>
				{:else if notice}
					<div class="field-message success" role="status">
						<Icon name="check" size={16} />
						<p>{notice}</p>
					</div>
				{/if}
			</form>

			{#if preview}
				<article class="preview" aria-label={preview.title}>
					<div class="preview-meta">
						<span>{preview.sourceName}</span>
						{#if publishedLabel}<time datetime={preview.publishedAt}>{publishedLabel}</time>{/if}
					</div>
					<h3>{preview.title}</h3>
					{#if previewImage}<div class="preview-image"><img src={previewImage} alt="" /></div>{/if}
					<p class="preview-bot">
						<span class="preview-bot-avatar"><Avatar actor={botActor} size="small" /></span>
						<span>{m.newsPreviewBotNote()}</span>
					</p>
				</article>
			{/if}

			{#if submissions.length}
				<section class="history" aria-labelledby="news-history-title">
					<h3 id="news-history-title">{m.newsRecentSubmissions()}</h3>
					<ul>
						{#each submissions as item (item.uri + item.cid)}<li>
								{#if confirmingUri === item.uri}
									<span class="history-confirm">{m.newsDeleteAsk()}</span>
									<span class="history-actions">
										<Button
											variant="secondary"
											size="sm"
											type="button"
											onclick={() => (confirmingUri = undefined)}>{m.cancel()}</Button
										>
										<Button
											variant="danger"
											size="sm"
											type="button"
											onclick={() => void remove(item)}>{m.newsDeleteYes()}</Button
										>
									</span>
								{:else}
									<span class="history-text">
										<span class="history-title" title={item.title}>{item.title}</span>
										<span class={`history-status status-${item.status}`}
											><span class="dot" aria-hidden="true"></span>{statusLabel(item.status)}</span
										>
									</span>
									{#if item.status !== 'cancelled'}<button
											class="ghost icon-action"
											type="button"
											aria-label={m.newsDelete()}
											title={m.newsDelete()}
											onclick={() => (confirmingUri = item.uri)}
											><Icon name="trash" size={16} /></button
										>{/if}
								{/if}
							</li>{/each}
					</ul>
				</section>
			{/if}
		</div>

		<footer>
			<Button variant="secondary" type="button" disabled={busy} onclick={onclose}
				>{m.cancel()}</Button
			>
			<Button
				variant="primary"
				type="button"
				disabled={busy || !preview}
				onclick={() => void submit()}
				>{busy && preview ? m.newsSubmitting() : m.newsSubmit()}</Button
			>
		</footer>
	</div>
</div>

<style>
	.news-submit-backdrop {
		position: fixed;
		inset: 0;
		z-index: 130;
		display: grid;
		place-items: center;
		padding: 16px;
		background: color-mix(in srgb, var(--bg) 82%, #000);
	}
	.news-submit-dialog {
		display: flex;
		flex-direction: column;
		inline-size: min(100%, 560px);
		max-block-size: calc(100dvh - 32px);
		overflow: hidden;
		border: 1px solid var(--line-strong);
		border-radius: 12px;
		background: var(--surface-1);
		box-shadow: var(--shadow-pop);
		animation: news-dialog-in 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.news-submit-dialog:focus {
		outline: none;
	}
	@keyframes news-dialog-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.news-submit-dialog {
			animation: none;
		}
	}
	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
		padding: 20px 20px 0;
	}
	.heading {
		display: grid;
		gap: 4px;
		min-inline-size: 0;
	}
	h2,
	h3,
	p {
		margin: 0;
	}
	h2 {
		font-size: 18px;
		font-weight: 600;
		line-height: 1.4;
	}
	header p {
		color: var(--text-muted);
		font-size: 14px;
		line-height: 1.6;
	}
	header .icon-action {
		flex: none;
		margin: -4px -8px 0 0;
	}
	.body {
		display: grid;
		gap: 24px;
		padding: 20px;
		overflow-y: auto;
	}

	/* URL欄 */
	.url-field {
		display: grid;
		gap: 8px;
	}
	label {
		font-size: 14px;
		font-weight: 500;
	}
	.hint {
		margin-block-start: -4px;
		color: var(--text-muted);
		font-size: 13px;
		line-height: 1.6;
	}
	.url-row {
		display: flex;
		gap: 8px;
	}
	.url-control {
		display: flex;
		flex: 1;
		align-items: center;
		min-inline-size: 0;
		block-size: 40px;
		border: 1px solid var(--line-strong);
		border-radius: 8px;
		background: var(--bg);
		transition:
			border-color 120ms ease-out,
			box-shadow 120ms ease-out;
	}
	.url-control:hover {
		border-color: color-mix(in srgb, var(--line-strong) 60%, var(--text-muted));
	}
	.url-control:focus-within {
		border-color: var(--accent-strong);
		box-shadow: 0 0 0 3px var(--focus-ring);
	}
	.url-control.invalid {
		border-color: var(--danger);
	}
	.url-control.invalid:focus-within {
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 30%, transparent);
	}
	.url-icon {
		display: grid;
		flex: none;
		place-items: center;
		inline-size: 36px;
		color: var(--text-muted);
	}
	.url-control input {
		flex: 1;
		min-inline-size: 0;
		block-size: 100%;
		padding: 0 4px 0 0;
		border: 0;
		background: transparent;
		color: var(--text);
		font-size: 15px;
	}
	.url-control input:focus,
	.url-control input:focus-visible {
		outline: none;
	}
	.url-control input::placeholder {
		color: var(--text-faint);
	}
	.url-control input:disabled {
		color: var(--text-muted);
	}
	.url-inline {
		display: grid;
		flex: none;
		place-items: center;
		block-size: 32px;
		min-inline-size: 32px;
		margin-inline-end: 4px;
		padding: 0 8px;
		border: 0;
		border-radius: 6px;
		background: transparent;
		color: var(--text-muted);
		font-size: 13px;
		transition:
			background-color 120ms ease-out,
			color 120ms ease-out;
	}
	.url-inline:hover:not(:disabled) {
		background: var(--bg-hover);
		color: var(--text);
	}
	.url-inline.paste {
		color: var(--accent-strong);
		font-weight: 500;
	}
	:global(.url-read) {
		flex: none;
		gap: 8px;
		block-size: 40px;
	}
	.field-message {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--text-muted);
		font-size: 13px;
		line-height: 1.6;
	}
	.field-message :global(svg) {
		flex: none;
	}
	.field-message p {
		flex: 1;
		min-inline-size: 0;
	}
	.field-message.error {
		color: var(--danger);
	}
	.field-message.success {
		color: var(--success);
	}

	/* プレビューは一覧のニュースカードと同じ並び */
	.preview {
		display: grid;
		gap: 8px;
		padding: 16px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: var(--surface-1);
	}
	.preview-meta {
		display: flex;
		gap: 12px;
		min-inline-size: 0;
		color: var(--text-muted);
		font-size: 12px;
	}
	.preview-meta span {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.preview-meta time {
		flex: none;
		margin-inline-start: auto;
		font-variant-numeric: tabular-nums;
	}
	.preview h3 {
		font-size: 16px;
		font-weight: 600;
		line-height: 1.6;
		overflow-wrap: anywhere;
	}
	.preview-image {
		overflow: hidden;
		aspect-ratio: 1.91 / 1;
		margin-block-start: 4px;
		border: 1px solid var(--line);
		border-radius: 8px;
		background: var(--bg-inset);
	}
	.preview-image img {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}
	.preview-bot {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-block-start: 4px;
		padding-block-start: 12px;
		border-block-start: 1px dashed var(--line-strong);
		color: var(--text-muted);
		font-size: 13px;
	}
	.preview-bot-avatar {
		display: grid;
		flex: none;
	}
	.preview-bot-avatar :global(.avatar.small) {
		inline-size: 24px;
		block-size: 24px;
		font-size: 12px;
	}

	/* 履歴 */
	.history {
		display: grid;
		gap: 8px;
	}
	.history h3 {
		color: var(--text-muted);
		font-size: 13px;
		font-weight: 500;
	}
	.history ul {
		display: grid;
		margin: 0;
		padding: 0;
		list-style: none;
		border-block-start: 1px solid var(--line);
	}
	.history li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-block-size: 52px;
		border-block-end: 1px solid var(--line);
	}
	.history-text {
		display: grid;
		gap: 2px;
		min-inline-size: 0;
	}
	.history-title {
		overflow: hidden;
		font-size: 14px;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.history-status {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--text-muted);
		font-size: 12px;
	}
	.history-status .dot {
		inline-size: 6px;
		block-size: 6px;
		border-radius: 50%;
		background: var(--text-faint);
	}
	.status-approved {
		color: var(--accent-strong);
	}
	.status-approved .dot {
		background: var(--accent-strong);
	}
	.status-pending .dot,
	.status-processing .dot {
		background: transparent;
		box-shadow: inset 0 0 0 1.5px var(--accent-strong);
	}
	.status-rejected .dot {
		background: var(--danger);
	}
	.history .icon-action {
		flex: none;
		inline-size: 32px;
		block-size: 32px;
	}
	.history-confirm {
		font-size: 14px;
	}
	.history-actions {
		display: flex;
		flex: none;
		gap: 8px;
	}

	footer {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		padding: 16px 20px;
		border-block-start: 1px solid var(--line);
		background: var(--surface-1);
	}

	@media (max-width: 520px) {
		.news-submit-backdrop {
			place-items: end stretch;
			padding: 0;
		}
		.news-submit-dialog {
			inline-size: 100%;
			max-block-size: calc(100dvh - 24px);
			border-inline: 0;
			border-block-end: 0;
			border-radius: 16px 16px 0 0;
		}
		header {
			padding: 16px 16px 0;
		}
		.body {
			padding: 16px;
		}
		footer {
			padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
		}
		footer :global(button) {
			flex: 1;
		}
	}
</style>
