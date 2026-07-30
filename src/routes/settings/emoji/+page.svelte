<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		createBluemojiItem,
		deleteBluemoji,
		displayEmojiName,
		EMOJI_NAME_PATTERN,
		emojiFileType,
		EmojiProcessingError,
		listMyBluemoji,
		MAX_EMOJI_BLOB_SIZE,
		MAX_EMOJI_INPUT_SIZE,
		MAX_EMOJI_ORIGINAL_SIZE,
		processEmojiImage,
		type MyEmoji,
	} from '$lib/atproto/bluemoji';
	import BluemojiMedia from '$lib/components/BluemojiMedia.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import type { EmojiView } from '$lib/api/types';

	type BatchItem = {
		id: string;
		file: File;
		name: string;
		preview: string;
		mediaType: EmojiView['mediaType'];
		state: 'ready' | 'processing' | 'success' | 'failed';
		error?: string;
	};

	let emojis = $state<MyEmoji[]>([]);
	let loaded = $state(false);
	let name = $state('');
	let alt = $state('');
	let file = $state<File>();
	let preview = $state<string>();
	let busy = $state(false);
	let status = $state('');
	let error = $state('');
	let batch = $state<BatchItem[]>([]);
	let ignoredFiles = $state(0);

	const safeInternalReturnTo = (value: string | null) => {
		if (!value?.startsWith('/') || value.startsWith('//')) return undefined;
		try {
			const base = new URL('https://nagi.local');
			const resolved = new URL(value, base);
			if (resolved.origin !== base.origin) return undefined;
			return `${resolved.pathname}${resolved.search}${resolved.hash}`;
		} catch {
			return undefined;
		}
	};
	const returnTo = $derived(safeInternalReturnTo(page.url.searchParams.get('returnTo')));
	const backHref = $derived(returnTo ?? '/settings');
	const backLabel = $derived(returnTo ? m.emojiBackToSource() : m.backToSettings());
	const taken = $derived(new Set(emojis.map((emoji) => displayEmojiName(emoji.name))));
	const nameValid = $derived(EMOJI_NAME_PATTERN.test(name));
	const fileProblem = (selected: File) => {
		const type = emojiFileType(selected);
		if (!type) return m.emojiTypeError();
		if (selected.size > MAX_EMOJI_INPUT_SIZE) return m.emojiInputSizeError();
		if (
			(type === 'image/apng' || type === 'application/lottie+zip') &&
			selected.size > MAX_EMOJI_ORIGINAL_SIZE
		)
			return m.emojiAnimatedSizeError();
		if (type === 'image/gif' && selected.size > MAX_EMOJI_BLOB_SIZE)
			return m.emojiAnimatedSizeError();
		return '';
	};
	const singleFileProblem = $derived(file ? fileProblem(file) : '');
	const singlePreviewEmoji = $derived(
		preview && file && emojiFileType(file)
			? ({
					uri: 'preview',
					cid: 'preview',
					did: '',
					name: `:${name || 'preview'}:`,
					url: preview,
					mediaType: emojiFileType(file)!,
				} satisfies EmojiView)
			: undefined,
	);

	const releaseEmojiUrls = (items: MyEmoji[]) => {
		for (const emoji of items) if (emoji.url.startsWith('blob:')) URL.revokeObjectURL(emoji.url);
	};
	const loadEmojis = async () => {
		const next = await listMyBluemoji();
		releaseEmojiUrls(emojis);
		emojis = next;
	};
	onDestroy(() => {
		if (preview) URL.revokeObjectURL(preview);
		for (const item of batch) URL.revokeObjectURL(item.preview);
		releaseEmojiUrls(emojis);
	});
	$effect(() => {
		if (!$session?.did || loaded) return;
		loadEmojis()
			.catch((cause) => (error = cause instanceof Error ? cause.message : m.emojiLoadFailed()))
			.finally(() => (loaded = true));
	});

	const emojiErrorMessage = (cause: EmojiProcessingError) =>
		cause.code === 'type'
			? m.emojiTypeError()
			: cause.code === 'input-size'
				? m.emojiInputSizeError()
				: cause.code === 'animated-size'
					? m.emojiAnimatedSizeError()
					: m.emojiCompressError();
	const errorMessage = (cause: unknown) =>
		cause instanceof EmojiProcessingError
			? emojiErrorMessage(cause)
			: cause instanceof Error
				? cause.message
				: m.emojiUploadFailed();

	function selectFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const selected = input.files?.[0];
		input.value = '';
		if (!selected) return;
		if (preview) URL.revokeObjectURL(preview);
		file = selected;
		preview = URL.createObjectURL(selected);
		error = '';
		status = '';
		if (!name) {
			const stem = selected.name.replace(/\.[^.]+$/, '').slice(0, 32);
			if (EMOJI_NAME_PATTERN.test(stem)) name = stem;
		}
	}

	async function upload() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		if (!file || !nameValid || taken.has(name)) return;
		busy = true;
		status = '';
		error = '';
		try {
			await createBluemojiItem(name, await processEmojiImage(file), alt.trim());
			await loadEmojis();
			if (preview) URL.revokeObjectURL(preview);
			preview = undefined;
			file = undefined;
			name = '';
			alt = '';
			status = m.emojiUploaded();
		} catch (cause) {
			error = errorMessage(cause);
		} finally {
			busy = false;
		}
	}

	const directoryPicker = (node: HTMLInputElement) => {
		node.setAttribute('webkitdirectory', '');
		node.multiple = true;
	};
	function selectBatch(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		for (const item of batch) URL.revokeObjectURL(item.preview);
		const files = [...(input.files ?? [])];
		input.value = '';
		const supported = files.flatMap((selected, index) => {
			const mediaType = emojiFileType(selected);
			if (!mediaType) return [];
			return [
				{
					id: `${selected.webkitRelativePath || selected.name}:${selected.lastModified}:${index}`,
					file: selected,
					name: selected.name.replace(/\.[^.]+$/, '').slice(0, 32),
					preview: URL.createObjectURL(selected),
					mediaType,
					state: 'ready' as const,
				},
			];
		});
		ignoredFiles = files.length - supported.length;
		batch = supported;
		status = '';
		error = '';
	}
	const duplicateBatchNames = () => {
		const counts = new Map<string, number>();
		for (const item of batch) counts.set(item.name, (counts.get(item.name) ?? 0) + 1);
		return counts;
	};
	function batchProblem(item: BatchItem) {
		if (!EMOJI_NAME_PATTERN.test(item.name)) return m.emojiNameInvalid();
		if (taken.has(item.name)) return m.emojiNameTaken();
		if ((duplicateBatchNames().get(item.name) ?? 0) > 1) return m.emojiBatchDuplicate();
		return fileProblem(item.file);
	}
	const batchReady = $derived(
		batch.some(
			(item) =>
				(item.state === 'ready' || item.state === 'failed') && batchProblem(item).length === 0,
		),
	);
	const batchPreview = (item: BatchItem): EmojiView => ({
		uri: item.id,
		cid: item.id,
		did: '',
		name: `:${item.name}:`,
		url: item.preview,
		mediaType: item.mediaType,
	});
	const batchStateText = (state: BatchItem['state']) =>
		state === 'processing'
			? m.emojiBatchStateProcessing()
			: state === 'success'
				? m.emojiBatchStateSuccess()
				: state === 'failed'
					? m.emojiBatchStateFailed()
					: m.emojiBatchStateReady();

	async function uploadBatch() {
		if (!$session || busy) return;
		const queue = batch.filter(
			(item) =>
				(item.state === 'ready' || item.state === 'failed') && batchProblem(item).length === 0,
		);
		if (!queue.length) return;
		busy = true;
		status = '';
		error = '';
		let cursor = 0;
		const worker = async () => {
			while (cursor < queue.length) {
				const item = queue[cursor++];
				item.state = 'processing';
				item.error = undefined;
				try {
					await createBluemojiItem(item.name, await processEmojiImage(item.file));
					item.state = 'success';
				} catch (cause) {
					item.state = 'failed';
					item.error = errorMessage(cause);
				}
			}
		};
		await Promise.all([worker(), worker()]);
		await loadEmojis().catch((cause) => (error = errorMessage(cause)));
		const succeeded = queue.filter((item) => item.state === 'success').length;
		status = m.emojiBatchUploaded({ count: succeeded });
		busy = false;
	}

	async function remove(emoji: MyEmoji) {
		if (busy || !confirm(m.emojiDeleteConfirm({ emoji: displayEmojiName(emoji.name) }))) return;
		busy = true;
		status = '';
		error = '';
		try {
			await deleteBluemoji(emoji.rkey);
			if (emoji.url.startsWith('blob:')) URL.revokeObjectURL(emoji.url);
			emojis = emojis.filter((item) => item.uri !== emoji.uri);
			status = m.emojiDeleted();
		} catch (cause) {
			error = cause instanceof Error ? cause.message : m.emojiDeleteFailed();
		} finally {
			busy = false;
		}
	}
</script>

<section class="auth-card settings-detail">
	<a class="settings-back" href={backHref}>← {backLabel}</a>
	<h1>{m.emojiSettingsTitle()}</h1>
	<p>{m.emojiSettingsNote()}</p>
	{#if !$session && $oauthReady}
		<p>{m.loginRequired()}</p>
		<a class="login" href="/login">{m.login()}</a>
	{:else}
		<div class="emoji-upload">
			{#if singlePreviewEmoji}<BluemojiMedia
					class="emoji-upload-preview"
					emoji={singlePreviewEmoji}
				/>{/if}
			<label class="avatar-select"
				>{m.selectImage()}<input
					type="file"
					accept="image/png,image/webp,image/gif,image/apng,.apng,.lottie,application/lottie+zip"
					onchange={selectFile}
				/></label
			>
			<small>{m.emojiUploadNote()}</small>
			{#if singleFileProblem}<p class="error">{singleFileProblem}</p>{/if}
		</div>
		<label
			>{m.emojiNameLabel()}<input bind:value={name} maxlength="32" placeholder="blobcat" /></label
		>
		{#if name && !nameValid}<p class="error">{m.emojiNameInvalid()}</p>{/if}
		{#if nameValid && taken.has(name)}<p class="error">{m.emojiNameTaken()}</p>{/if}
		<label>{m.emojiAltLabel()}<input bind:value={alt} maxlength="100" /></label>
		<button
			disabled={busy || !file || !nameValid || taken.has(name) || Boolean(singleFileProblem)}
			onclick={upload}>{busy ? m.saving() : m.emojiUpload()}</button
		>

		<h2>{m.emojiBatchTitle()}</h2>
		<p>{m.emojiBatchNote()}</p>
		<div class="emoji-batch-actions">
			<label class="avatar-select"
				>{m.emojiSelectFolder()}<input
					type="file"
					accept="image/png,image/webp,image/gif,image/apng,.apng,.lottie,application/lottie+zip"
					use:directoryPicker
					onchange={selectBatch}
				/></label
			>
			<label class="avatar-select"
				>{m.emojiSelectFiles()}<input
					type="file"
					multiple
					accept="image/png,image/webp,image/gif,image/apng,.apng,.lottie,application/lottie+zip"
					onchange={selectBatch}
				/></label
			>
		</div>
		{#if ignoredFiles}<p class="muted">{m.emojiBatchIgnored({ count: ignoredFiles })}</p>{/if}
		{#if batch.length}
			<div class="emoji-batch-grid">
				{#each batch as item (item.id)}
					<div
						class:failed={Boolean(batchProblem(item) || item.state === 'failed')}
						class="emoji-batch-item"
					>
						<BluemojiMedia emoji={batchPreview(item)} />
						<input
							bind:value={item.name}
							maxlength="32"
							disabled={busy || item.state === 'success'}
							aria-label={m.emojiNameLabel()}
						/>
						<small>{batchProblem(item) || item.error || batchStateText(item.state)}</small>
					</div>
				{/each}
			</div>
			<button disabled={busy || !batchReady} onclick={uploadBatch}
				>{busy ? m.saving() : m.emojiBatchUpload()}</button
			>
		{/if}

		{#if status}<p>
				{status}{#if returnTo}
					<a class="emoji-return" href={returnTo}>{m.emojiBackToSource()}</a>
				{/if}
			</p>{/if}{#if error}<p class="error">{error}</p>{/if}

		<h2>{m.emojiMineTitle()}</h2>
		{#if !loaded}
			<p>{m.loading()}</p>
		{:else if !emojis.length}
			<p>{m.emojiMineEmpty()}</p>
		{:else}
			<div class="emoji-settings-grid">
				{#each emojis as emoji (emoji.uri)}
					<div class="emoji-settings-item" title={displayEmojiName(emoji.name)}>
						<BluemojiMedia {emoji} />
						<div class="emoji-settings-meta">
							<strong>{emoji.name}</strong>
							{#if emoji.alt}<small>{emoji.alt}</small>{/if}
						</div>
						<button
							type="button"
							class="emoji-sort-remove"
							disabled={busy}
							aria-label={m.emojiDeleteConfirm({ emoji: displayEmojiName(emoji.name) })}
							onclick={() => remove(emoji)}
						>
							<Icon name="close" size={12} />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</section>
