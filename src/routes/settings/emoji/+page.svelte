<script lang="ts">
	import { onDestroy } from 'svelte';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		createBluemojiItem,
		deleteBluemoji,
		displayEmojiName,
		EMOJI_NAME_PATTERN,
		EmojiProcessingError,
		listMyBluemoji,
		processEmojiImage,
		type MyEmoji,
	} from '$lib/atproto/bluemoji';

	let emojis = $state<MyEmoji[]>([]);
	let loaded = $state(false);
	let name = $state('');
	let alt = $state('');
	let file = $state<File>();
	let preview = $state<string>();
	let busy = $state(false);
	let status = $state('');
	let error = $state('');

	onDestroy(() => {
		if (preview) URL.revokeObjectURL(preview);
	});
	$effect(() => {
		if (!$session?.did || loaded) return;
		listMyBluemoji()
			.then((items) => (emojis = items))
			.catch((e) => (error = e instanceof Error ? e.message : m.emojiLoadFailed()))
			.finally(() => (loaded = true));
	});

	const taken = $derived(new Set(emojis.map((emoji) => displayEmojiName(emoji.name))));
	const nameValid = $derived(EMOJI_NAME_PATTERN.test(name));

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
		// 名前が未入力ならファイル名から埋めておく。
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
			const blob = await processEmojiImage(file);
			await createBluemojiItem(name, blob, alt.trim());
			emojis = await listMyBluemoji();
			if (preview) URL.revokeObjectURL(preview);
			preview = undefined;
			file = undefined;
			name = '';
			alt = '';
			status = m.emojiUploaded();
		} catch (e) {
			error =
				e instanceof EmojiProcessingError
					? emojiErrorMessage(e)
					: e instanceof Error
						? e.message
						: m.emojiUploadFailed();
		} finally {
			busy = false;
		}
	}

	const emojiErrorMessage = (e: EmojiProcessingError) =>
		e.code === 'type'
			? m.emojiTypeError()
			: e.code === 'input-size'
				? m.emojiInputSizeError()
				: e.code === 'animated-size'
					? m.emojiAnimatedSizeError()
					: m.emojiCompressError();

	async function remove(emoji: MyEmoji) {
		if (busy) return;
		busy = true;
		status = '';
		error = '';
		try {
			await deleteBluemoji(emoji.rkey);
			emojis = emojis.filter((item) => item.uri !== emoji.uri);
			status = m.emojiDeleted();
		} catch (e) {
			error = e instanceof Error ? e.message : m.emojiDeleteFailed();
		} finally {
			busy = false;
		}
	}
</script>

<section class="auth-card settings-detail">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.emojiSettingsTitle()}</h1>
	<p>{m.emojiSettingsNote()}</p>
	{#if !$session && $oauthReady}
		<p>{m.loginRequired()}</p>
		<a class="login" href="/login">{m.login()}</a>
	{:else}
		<div class="emoji-upload">
			{#if preview}<img class="emoji-upload-preview" src={preview} alt={name} />{/if}
			<label class="avatar-select"
				>{m.selectImage()}<input
					type="file"
					accept="image/png,image/webp,image/gif,image/apng"
					onchange={selectFile}
				/></label
			>
			<small>{m.emojiUploadNote()}</small>
		</div>
		<label
			>{m.emojiNameLabel()}<input bind:value={name} maxlength="32" placeholder="blobcat" /></label
		>
		{#if name && !nameValid}<p class="error">{m.emojiNameInvalid()}</p>{/if}
		{#if nameValid && taken.has(name)}<p class="error">{m.emojiNameTaken()}</p>{/if}
		<label>{m.emojiAltLabel()}<input bind:value={alt} maxlength="100" /></label>
		<button disabled={busy || !file || !nameValid || taken.has(name)} onclick={upload}
			>{busy ? m.saving() : m.emojiUpload()}</button
		>
		{#if status}<p>{status}</p>{/if}{#if error}<p class="error">{error}</p>{/if}

		<h2>{m.emojiMineTitle()}</h2>
		{#if !loaded}
			<p>{m.loading()}</p>
		{:else if !emojis.length}
			<p>{m.emojiMineEmpty()}</p>
		{:else}
			<ul class="emoji-list">
				{#each emojis as emoji (emoji.uri)}
					<li>
						{#if emoji.url}<img src={emoji.url} alt={emoji.alt ?? emoji.name} loading="lazy" />{/if}
						<span class="emoji-list-name">{emoji.name}</span>
						<button type="button" class="ghost" disabled={busy} onclick={() => remove(emoji)}
							>{m.remove()}</button
						>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</section>
