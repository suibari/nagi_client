<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { APPVIEW_URL, getChannels } from '$lib/api/appview';
	import { createChannel } from '$lib/atproto/records';
	import { deletedChannels } from '$lib/channels/optimistic.svelte';
	import type { ChannelView } from '$lib/api/types';
	import AvatarCropper from '$lib/components/AvatarCropper.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { m, relativeTime } from '$lib/i18n/i18n.svelte';

	let channels = $state<ChannelView[]>([]);
	let cursor = $state<string | undefined>(undefined);
	let hasMore = $state(false);
	let loading = $state(false);
	let error = $state('');

	// 新規作成ダイアログの状態。
	let createOpen = $state(false);
	let name = $state('');
	let description = $state('');
	let bannerBlob = $state<Blob | null>(null);
	let bannerPreview = $state<string>();
	let cropFile = $state<File>();
	let creating = $state(false);
	let createError = $state('');

	const resolve = (url?: string) => (url?.startsWith('/') ? APPVIEW_URL + url : url);
	// at://<did>/<collection>/<rkey> → /channels/<did>/<rkey>
	const channelHref = (uri: string) => {
		const rest = uri.slice('at://'.length).split('/');
		return `/channels/${rest[0]}/${rest[2]}`;
	};
	// 更新日時は「最新投稿時刻（なければ作成日時）」の相対表示。
	const updatedAt = (c: ChannelView) => relativeTime(c.lastPostAt ?? c.createdAt);
	// 削除直後は取り込み反映まで API がまだ返すので、楽観的に除外する。
	let visibleChannels = $derived(channels.filter((c) => !deletedChannels.has(c.uri)));

	async function load() {
		loading = true;
		error = '';
		try {
			const page = await getChannels();
			channels = page.channels;
			cursor = page.cursor;
			hasMore = page.hasMore;
		} catch (e) {
			error = e instanceof Error ? e.message : m.loadFailed();
		} finally {
			loading = false;
		}
	}
	async function loadMore() {
		if (!cursor || loading) return;
		loading = true;
		try {
			const page = await getChannels(cursor);
			channels = [...channels, ...page.channels];
			cursor = page.cursor;
			hasMore = page.hasMore;
		} catch (e) {
			error = e instanceof Error ? e.message : m.loadFailed();
		} finally {
			loading = false;
		}
	}
	// 閲覧は未認証（AppView 直読み）なのでセッション復元を待つ必要はない。
	onMount(load);

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

<section class="channels-list" aria-busy={loading}>
	{#if loading && !channels.length}
		<div class="timeline-loading" role="status" aria-label={m.loading()}>
			<span class="spinner" aria-hidden="true"></span>
		</div>
	{:else if error && !channels.length}
		<div class="state error">
			{error}<button class="icon-action" type="button" aria-label={m.retry()} onclick={load}
				><Icon name="refresh" size={18} /></button
			>
		</div>
	{:else if !visibleChannels.length}
		<div class="state">{m.channelsEmpty()}</div>
	{:else}
		{#each visibleChannels as channel (channel.uri)}
			<a class="channel-card" href={channelHref(channel.uri)}>
				<span class="channel-card-media">
					{#if channel.banner}
						<img src={resolve(channel.banner)} alt="" loading="lazy" />
					{/if}
				</span>
				<span class="channel-card-name">{channel.name}</span>
				<span class="channel-card-foot">
					{#if channel.description}<span class="channel-card-desc">{channel.description}</span>{/if}
					<span class="channel-card-updated">{m.channelUpdatedAt({ time: updatedAt(channel) })}</span>
				</span>
			</a>
		{/each}
		{#if hasMore}
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
				<label class="avatar-select"
					>{m.selectImage()}<input
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onchange={selectBanner}
					/></label
				>
				<small>{m.channelBannerNote()}</small>
			</div>
			{#if createError}<p class="error">{createError}</p>{/if}
			<div class="delete-actions">
				<button type="button" class="ghost" onclick={() => (createOpen = false)}>{m.cancel()}</button
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
