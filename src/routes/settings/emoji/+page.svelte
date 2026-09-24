<script lang="ts">
	import { page } from '$app/state';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		createBluemojiItem,
		deleteBluemoji,
		displayEmojiName,
		EMOJI_NAME_PATTERN,
		EMOJI_FILE_ACCEPT,
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
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import EmojiInputPreview from '$lib/components/EmojiInputPreview.svelte';

	type BatchItem = {
		id: string;
		file: File;
		name: string;
		state: 'ready' | 'processing' | 'success' | 'failed';
		error?: string;
	};
	type EmojiTab = 'single' | 'batch' | 'mine';

	let activeTab = $state<EmojiTab>('single');
	let emojis = $state<MyEmoji[]>([]);
	let loaded = $state(false);
	let name = $state('');
	let alt = $state('');
	let file = $state<File>();
	let busy = $state(false);
	let status = $state('');
	let error = $state('');
	let batch = $state<BatchItem[]>([]);
	let ignoredFiles = $state(0);
	let batchTotal = $state(0);
	let batchCompleted = $state(0);
	let batchSucceeded = $state(0);
	let visibleEmojiCount = $state(60);
	let singleFileInput = $state<HTMLInputElement>();
	let folderInput = $state<HTMLInputElement>();
	let batchFileInput = $state<HTMLInputElement>();

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
	const batchNames = $derived(
		batch.reduce(
			(counts, item) => counts.set(item.name, (counts.get(item.name) ?? 0) + 1),
			new Map<string, number>(),
		),
	);
	const tabs: { id: EmojiTab; label: () => string }[] = [
		{ id: 'single', label: () => m.emojiSingleTitle() },
		{ id: 'batch', label: () => m.emojiBatchTitle() },
		{ id: 'mine', label: () => m.emojiMineTitle() },
	];
	function handleTabKeydown(event: KeyboardEvent, tab: EmojiTab) {
		const index = tabs.findIndex((item) => item.id === tab);
		const next =
			event.key === 'ArrowRight'
				? (index + 1) % tabs.length
				: event.key === 'ArrowLeft'
					? (index + tabs.length - 1) % tabs.length
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? tabs.length - 1
							: -1;
		if (next < 0) return;
		event.preventDefault();
		activeTab = tabs[next].id;
		(document.getElementById(`emoji-tab-${activeTab}`) as HTMLButtonElement)?.focus();
	}
	const visibleEmojis = $derived(emojis.slice(0, visibleEmojiCount));
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

	const loadEmojis = async () => {
		emojis = await listMyBluemoji();
		visibleEmojiCount = 60;
	};

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
		file = selected;
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
		if (!loaded || !file || !nameValid || taken.has(name)) return;
		busy = true;
		status = '';
		error = '';
		try {
			await createBluemojiItem(name, await processEmojiImage(file), alt.trim());
			await loadEmojis();
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
		if (busy) return;
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
					state: 'ready' as const,
				},
			];
		});
		ignoredFiles = files.length - supported.length;
		batch = supported;
		batchTotal = 0;
		batchCompleted = 0;
		batchSucceeded = 0;
		status = '';
		error = '';
	}
	function batchProblem(item: BatchItem) {
		if (item.state === 'success') return '';
		if (!EMOJI_NAME_PATTERN.test(item.name)) return m.emojiNameInvalid();
		if ((batchNames.get(item.name) ?? 0) > 1) return m.emojiBatchDuplicate();
		if (taken.has(item.name)) return m.emojiNameTaken();
		return fileProblem(item.file);
	}
	const batchReady = $derived(
		batch.some(
			(item) =>
				(item.state === 'ready' || item.state === 'failed') && batchProblem(item).length === 0,
		),
	);
	const batchStateText = (state: BatchItem['state']) =>
		state === 'processing'
			? m.emojiBatchStateProcessing()
			: state === 'success'
				? m.emojiBatchStateSuccess()
				: state === 'failed'
					? m.emojiBatchStateFailed()
					: m.emojiBatchStateReady();

	async function uploadBatch() {
		if (!$session || busy || !loaded) return;
		const queue = batch.filter(
			(item) =>
				(item.state === 'ready' || item.state === 'failed') && batchProblem(item).length === 0,
		);
		if (!queue.length) return;
		busy = true;
		batchTotal = queue.length;
		batchCompleted = 0;
		batchSucceeded = 0;
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
					batchSucceeded += 1;
				} catch (cause) {
					item.state = 'failed';
					item.error = errorMessage(cause);
				}
				batchCompleted += 1;
			}
		};
		await Promise.all([worker(), worker()]);
		await loadEmojis().catch((cause) => (error = errorMessage(cause)));
		status = m.emojiBatchUploaded({ count: batchSucceeded });
		busy = false;
	}

	async function remove(emoji: MyEmoji) {
		if (busy || !confirm(m.emojiDeleteConfirm({ emoji: displayEmojiName(emoji.name) }))) return;
		busy = true;
		status = '';
		error = '';
		try {
			await deleteBluemoji(emoji.rkey);
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
		<SignedOutNotice message={m.loginRequired()} />
	{:else if $session}
		<div class="emoji-settings-tabs" role="tablist" aria-label={m.emojiSettingsTitle()}>
			{#each tabs as tab (tab.id)}
				<button
					type="button"
					id={`emoji-tab-${tab.id}`}
					role="tab"
					aria-selected={activeTab === tab.id}
					aria-controls={`emoji-panel-${tab.id}`}
					tabindex={activeTab === tab.id ? 0 : -1}
					class:active={activeTab === tab.id}
					onkeydown={(event) => handleTabKeydown(event, tab.id)}
					onclick={() => (activeTab = tab.id)}>{tab.label()}</button
				>
			{/each}
		</div>
		{#if status}<p role="status">
				{status}
				{#if activeTab === 'batch' && batchSucceeded > 0 && !error}
					<button type="button" class="emoji-return" onclick={() => (activeTab = 'mine')}
						>{m.emojiViewMine()}</button
					>
				{/if}
				{#if returnTo}
					<a class="emoji-return" href={returnTo}>{m.emojiBackToSource()}</a>
				{/if}
			</p>{/if}
		{#if error}<p class="error" role="alert">{error}</p>{/if}
		{#if activeTab === 'single'}
			<div id="emoji-panel-single" role="tabpanel" aria-labelledby="emoji-tab-single">
				<div class="emoji-upload">
					{#if file && !singleFileProblem}<EmojiInputPreview
							class="emoji-upload-preview"
							{file}
							{name}
						/>{/if}
					<input
						bind:this={singleFileInput}
						type="file"
						accept={EMOJI_FILE_ACCEPT}
						class="visually-hidden"
						onchange={selectFile}
					/>
					<button type="button" class="avatar-select" onclick={() => singleFileInput?.click()}
						>{m.selectImage()}</button
					>
					<small>{m.emojiUploadNote()}</small>
					{#if singleFileProblem}<p class="error">{singleFileProblem}</p>{/if}
				</div>
				<label
					>{m.emojiNameLabel()}<input
						bind:value={name}
						maxlength="32"
						placeholder="blobcat"
					/></label
				>
				{#if name && !nameValid}<p class="error">{m.emojiNameInvalid()}</p>{/if}
				{#if nameValid && taken.has(name)}<p class="error">{m.emojiNameTaken()}</p>{/if}
				<label>{m.emojiAltLabel()}<input bind:value={alt} maxlength="100" /></label>
				<button
					disabled={busy ||
						!loaded ||
						!file ||
						!nameValid ||
						taken.has(name) ||
						Boolean(singleFileProblem)}
					onclick={upload}>{busy ? m.saving() : m.emojiUpload()}</button
				>
			</div>
		{:else if activeTab === 'batch'}
			<div id="emoji-panel-batch" role="tabpanel" aria-labelledby="emoji-tab-batch">
				<h2>{m.emojiBatchTitle()}</h2>
				<p>{m.emojiBatchNote()}</p>
				<div class="emoji-batch-actions">
					<input
						bind:this={folderInput}
						type="file"
						accept={EMOJI_FILE_ACCEPT}
						use:directoryPicker
						class="visually-hidden"
						onchange={selectBatch}
					/>
					<button
						type="button"
						class="avatar-select"
						disabled={busy}
						onclick={() => folderInput?.click()}>{m.emojiSelectFolder()}</button
					>
					<input
						bind:this={batchFileInput}
						type="file"
						multiple
						accept={EMOJI_FILE_ACCEPT}
						class="visually-hidden"
						onchange={selectBatch}
					/>
					<button
						type="button"
						class="avatar-select"
						disabled={busy}
						onclick={() => batchFileInput?.click()}>{m.emojiSelectFiles()}</button
					>
				</div>
				{#if ignoredFiles}<p class="muted">{m.emojiBatchIgnored({ count: ignoredFiles })}</p>{/if}
				{#if batch.length}
					{#if batchTotal > 0}
						<p class="emoji-batch-progress" role="status" aria-live="polite">
							{m.emojiBatchProgress({
								completed: batchCompleted,
								total: batchTotal,
								succeeded: batchSucceeded,
							})}
						</p>
						<progress
							value={batchCompleted}
							max={batchTotal}
							aria-label={m.emojiBatchProgressLabel()}
						></progress>
					{/if}
					<div class="emoji-batch-grid">
						{#each batch as item (item.id)}
							<div
								class:failed={Boolean(batchProblem(item) || item.state === 'failed')}
								class="emoji-batch-item"
							>
								<EmojiInputPreview file={item.file} name={item.name} />
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
					<button disabled={busy || !loaded || !batchReady} onclick={uploadBatch}
						>{busy ? m.saving() : m.emojiBatchUpload()}</button
					>
				{/if}
			</div>
		{:else}
			<div id="emoji-panel-mine" role="tabpanel" aria-labelledby="emoji-tab-mine">
				<h2>{m.emojiMineTitle()}</h2>
				{#if !loaded}
					<p>{m.loading()}</p>
				{:else if !emojis.length}
					<p>{m.emojiMineEmpty()}</p>
				{:else}
					<div class="emoji-settings-grid">
						{#each visibleEmojis as emoji (emoji.uri)}
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
						<InfiniteScroll
							hasMore={visibleEmojiCount < emojis.length}
							loading={false}
							onload={() => {
								visibleEmojiCount = Math.min(emojis.length, visibleEmojiCount + 60);
							}}
						/>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</section>
