<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getChannels, type ChannelDirectoryView } from '$lib/api/appview';
	import { createChannel } from '$lib/atproto/records';
	import { createdChannels, deletedChannels } from '$lib/channels/optimistic.svelte';
	import type { ChannelView } from '$lib/api/types';
	import AvatarCropper from '$lib/components/AvatarCropper.svelte';
	import ChannelCard from '$lib/components/ChannelCard.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	type DirectoryState = {
		channels: ChannelView[];
		cursor?: string;
		hasMore: boolean;
		loading: boolean;
		loaded: boolean;
		error: string;
		requestId: number;
	};
	const emptyDirectory = (): DirectoryState => ({
		channels: [],
		hasMore: false,
		loading: false,
		loaded: false,
		error: '',
		requestId: 0,
	});
	const tabs: Array<{ id: ChannelDirectoryView; label: () => string }> = [
		{ id: 'trend', label: () => m.channelsTabTrend() },
		{ id: 'list', label: () => m.channelsTabList() },
		{ id: 'mine', label: () => m.channelsTabMine() },
	];
	let active = $state<ChannelDirectoryView>('trend');
	let directories = $state<Record<ChannelDirectoryView, DirectoryState>>({
		trend: emptyDirectory(),
		list: emptyDirectory(),
		mine: emptyDirectory(),
	});
	let current = $derived(directories[active]);
	let privateDid = $state<string | undefined>();

	// 新規作成ダイアログの状態。
	let createOpen = $state(false);
	let name = $state('');
	let description = $state('');
	let bannerBlob = $state<Blob | null>(null);
	let bannerPreview = $state<string>();
	let cropFile = $state<File>();
	let creating = $state(false);
	let createError = $state('');
	let bannerInput = $state<HTMLInputElement>();

	// at://<did>/<collection>/<rkey> → /channels/<did>/<rkey>
	const channelHref = (uri: string) => {
		const rest = uri.slice('at://'.length).split('/');
		return `/channels/${rest[0]}/${rest[2]}`;
	};
	// 削除直後は取り込み反映まで API がまだ返すので、楽観的に除外する。
	let visibleChannels = $derived(current.channels.filter((c) => !deletedChannels.has(c.uri)));

	async function load(view: ChannelDirectoryView, reset = false) {
		const state = directories[view];
		if (state.loading || (!reset && state.loaded)) return;
		const requestId = ++state.requestId;
		state.loading = true;
		state.error = '';
		try {
			const page = await getChannels(view);
			if (requestId !== state.requestId) return;
			state.channels = page.channels;
			state.cursor = page.cursor;
			state.hasMore = page.hasMore;
			state.loaded = true;
		} catch (e) {
			if (requestId === state.requestId)
				state.error = e instanceof Error ? e.message : m.loadFailed();
		} finally {
			if (requestId === state.requestId) state.loading = false;
		}
	}
	async function loadMore() {
		const view = active;
		const state = directories[view];
		if (!state.cursor || state.loading) return;
		const requestId = ++state.requestId;
		state.loading = true;
		state.error = '';
		try {
			const page = await getChannels(view, state.cursor);
			if (requestId !== state.requestId) return;
			state.channels = [...state.channels, ...page.channels];
			state.cursor = page.cursor;
			state.hasMore = page.hasMore;
		} catch (e) {
			if (requestId === state.requestId)
				state.error = e instanceof Error ? e.message : m.loadFailed();
		} finally {
			if (requestId === state.requestId) state.loading = false;
		}
	}
	function selectTab(view: ChannelDirectoryView) {
		active = view;
		if (view === 'trend' || $session) void load(view);
	}
	// 公開のトレンドはセッション復元を待たずに読み始める。本人向けタブだけは上の分岐で待つ。
	onMount(() => void load('trend'));

	// アカウントが切り替わったとき、前の本人向け一覧を画面やメモリに残さない。
	$effect(() => {
		const did = $session?.did;
		if (did === privateDid) return;
		privateDid = did;
		directories.list = emptyDirectory();
		directories.mine = emptyDirectory();
		if (did && active !== 'trend') void load(active);
	});

	function openCreate() {
		name = '';
		description = '';
		bannerBlob = null;
		if (bannerPreview?.startsWith('blob:')) URL.revokeObjectURL(bannerPreview);
		bannerPreview = undefined;
		createError = '';
		createOpen = true;
	}
	function selectBanner(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			createError = m.imageTypeError();
			return;
		}
		if (file.size > 25_000_000) {
			createError = m.imageSizeError();
			return;
		}
		createError = '';
		cropFile = file;
	}
	function applyBanner(blob: Blob) {
		if (bannerPreview?.startsWith('blob:')) URL.revokeObjectURL(bannerPreview);
		bannerBlob = blob;
		bannerPreview = URL.createObjectURL(blob);
		cropFile = undefined;
	}
	async function submitCreate() {
		if (creating || !name.trim() || !$session) return;
		creating = true;
		createError = '';
		try {
			const res = await createChannel({
				name: name.trim(),
				description: description.trim() || undefined,
				banner: bannerBlob ?? undefined,
			});
			const now = new Date().toISOString();
			createdChannels.add(
				{
					uri: res.data.uri,
					cid: res.data.cid,
					did: $session.did,
					name: name.trim(),
					...(description.trim() ? { description: description.trim() } : {}),
					createdAt: now,
					indexedAt: now,
				},
				bannerBlob ?? undefined,
			);
			createOpen = false;
			await goto(channelHref(res.data.uri));
		} catch (e) {
			createError = e instanceof Error ? e.message : m.channelCreateFailed();
		} finally {
			creating = false;
		}
	}
</script>

<section class="channels-head">
	<h1>{m.channelsTitle()}</h1>
	{#if $session}
		<button class="primary" type="button" onclick={openCreate}>
			<Icon name="hash" size={16} />{m.channelCreate()}
		</button>
	{/if}
</section>
<!-- Bluesky から来た人・Nagi 初心者向け。「入らないと書けない場所」に見せないための一文。 -->
<p class="channels-intro">{m.channelsIntro()}</p>

<div class="channel-tabs" role="tablist" aria-label={m.channelsTabsAria()}>
	{#each tabs as tab (tab.id)}
		<button
			type="button"
			role="tab"
			aria-selected={active === tab.id}
			class:active={active === tab.id}
			onclick={() => selectTab(tab.id)}>{tab.label()}</button
		>
	{/each}
</div>

<section class="channels-list" aria-busy={current.loading}>
	{#if active !== 'trend' && !$oauthReady}
		<div class="timeline-loading" role="status" aria-label={m.loading()}>
			<span class="spinner" aria-hidden="true"></span>
		</div>
	{:else if active !== 'trend' && !$session}
		<div class="state channel-sign-in">
			<p>{m.channelsSignInRequired()}</p>
			<a href="/login">{m.login()}</a>
		</div>
	{:else if current.loading && !current.channels.length}
		<div class="timeline-loading" role="status" aria-label={m.loading()}>
			<span class="spinner" aria-hidden="true"></span>
		</div>
	{:else if current.error && !current.channels.length}
		<div class="state error">
			{current.error}<button
				class="icon-action"
				type="button"
				aria-label={m.retry()}
				onclick={() => load(active, true)}><Icon name="refresh" size={18} /></button
			>
		</div>
	{:else if !visibleChannels.length}
		<div class="state">
			{active === 'trend'
				? m.channelsTrendEmpty()
				: active === 'list'
					? m.channelsListEmpty()
					: m.channelsMineEmpty()}
		</div>
	{:else}
		{#each visibleChannels as channel (channel.uri)}
			<ChannelCard {channel} />
		{/each}
		{#if current.hasMore}
			<button
				class="more icon-action"
				type="button"
				aria-label={m.loadMore()}
				title={m.loadMore()}
				onclick={loadMore}><Icon name="more" size={20} /></button
			>
		{/if}
	{/if}
</section>

{#if createOpen}
	<div class="draft-backdrop" role="presentation">
		<div class="draft-dialog" role="dialog" aria-modal="true" aria-label={m.channelCreateTitle()}>
			<h2>{m.channelCreateTitle()}</h2>
			<label class="field"
				>{m.channelNameLabel()}
				<input bind:value={name} maxlength="500" placeholder={m.channelNamePlaceholder()} />
				<small>{m.channelNameHint()}</small>
			</label>
			<label class="field"
				>{m.channelDescLabel()}
				<textarea
					bind:value={description}
					maxlength="3000"
					rows="3"
					placeholder={m.channelDescPlaceholder()}
				></textarea>
			</label>
			<div class="field">
				<span>{m.channelBannerLabel()}</span>
				{#if bannerPreview}
					<span class="channel-banner preview"><img src={bannerPreview} alt="" /></span>
				{/if}
				<input
					bind:this={bannerInput}
					type="file"
					accept="image/jpeg,image/png,image/webp"
					class="visually-hidden"
					onchange={selectBanner}
				/>
				<button type="button" class="avatar-select" onclick={() => bannerInput?.click()}
					>{m.selectImage()}</button
				>
				<small>{m.channelBannerNote()}</small>
			</div>
			{#if createError}<p class="error">{createError}</p>{/if}
			<div class="delete-actions">
				<button type="button" class="ghost" onclick={() => (createOpen = false)}
					>{m.cancel()}</button
				>
				<button
					type="button"
					class="primary"
					disabled={creating || !name.trim()}
					onclick={submitCreate}>{creating ? m.channelCreating() : m.channelCreateSubmit()}</button
				>
			</div>
		</div>
	</div>
{/if}

{#if cropFile}
	<AvatarCropper
		file={cropFile}
		aspect={3}
		round={false}
		title={m.cropperBannerTitle()}
		onconfirm={applyBanner}
		oncancel={() => (cropFile = undefined)}
	/>
{/if}
