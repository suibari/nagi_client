<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		APPVIEW_URL,
		ApiRequestError,
		getChannel,
		getChannelTimeline,
		setChannelSubscription,
	} from '$lib/api/appview';
	import { deleteChannel, setChannelPinnedPost, updateChannel } from '$lib/atproto/records';
	import { createdChannels, deletedChannels } from '$lib/channels/optimistic.svelte';
	import { Feed, feedKey } from '$lib/feed/feed.svelte';
	import { rememberChannelLabel } from '$lib/feed-tabs/labels.svelte';
	import type { ChannelView, PostView } from '$lib/api/types';
	import ThreadUnit from '$lib/components/ThreadUnit.svelte';
	import BotReplyStatus from '$lib/components/BotReplyStatus.svelte';
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { followPostedScroll } from '$lib/feed/post-follow.svelte';
	import { postedSignal } from '$lib/feed/posted-signal.svelte';
	import AvatarCropper from '$lib/components/AvatarCropper.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { mutes } from '$lib/mute/mutes.svelte';
	import { startVisiblePolling } from '$lib/polling';
	import { m, relativeTime } from '$lib/i18n/i18n.svelte';

	const CHANNEL = 'com.suibari.nagi.channel';
	let did = $derived(page.params.did);
	let rkey = $derived(page.params.rkey);
	let uri = $derived(`at://${did}/${CHANNEL}/${rkey}`);

	let channel = $state<ChannelView>();
	let headError = $state('');
	let feed = $state<Feed>();
	const CREATED_CHANNEL_RETRY_DELAYS = [0, 500, 1_000, 1_500, 2_000, 3_000, 5_000, 7_000];
	const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	async function loadChannel(target: string, cancelled: () => boolean) {
		const created = createdChannels.get(target);
		if (created) channel = created;
		for (const delay of created ? CREATED_CHANNEL_RETRY_DELAYS : [0]) {
			if (delay) await wait(delay);
			if (cancelled() || target !== currentUri) return;
			try {
				const res = await getChannel(target);
				if (cancelled() || target !== currentUri) return;
				channel = res.channel;
				// フィードのタブに並んでいる場合の表示名をここで更新しておく
				// （タブ側の label スナップショットは同期対象なので触らない）。
				rememberChannelLabel(res.channel.uri, res.channel.name);
				headError = '';
				createdChannels.remove(target);
				return;
			} catch (e) {
				if (
					created &&
					e instanceof ApiRequestError &&
					e.status === 404 &&
					delay !== CREATED_CHANNEL_RETRY_DELAYS.at(-1)
				)
					continue;
				if (cancelled() || target !== currentUri) return;
				channel = undefined;
				createdChannels.remove(target);
				headError = e instanceof Error ? e.message : m.loadFailed();
				return;
			}
		}
	}

	// CH の投稿はこっそりでも表示するが、別画面で送信中の楽観投稿まで混ざらないよう
	// 所属チャンネルだけは一致させる。
	// 閲覧は未認証（AppView 直読み）なのでセッション復元を待つ必要はない。
	let currentUri = '';
	$effect(() => {
		if (uri !== currentUri) {
			let cancelled = false;
			currentUri = uri;
			channel = undefined;
			headError = '';
			const target = uri;
			void loadChannel(target, () => cancelled);
			const nextFeed = new Feed(
				(cursor) => getChannelTimeline(target, cursor),
				(item) => item.channel?.uri === target,
			);
			feed = nextFeed;
			void nextFeed.load();
			return () => {
				cancelled = true;
			};
		}
	});

	let isOwner = $derived(Boolean($session && channel && channel.did === $session.did));
	// ストアが読めていればそちらを、まだならサーバが付けた viewerMuted を使う（直リンク対策）。
	let muted = $derived(
		channel ? (mutes.loaded ? mutes.hasChannel(channel.uri) : Boolean(channel.viewerMuted)) : false,
	);
	async function toggleMute() {
		if (!channel) return;
		headError = '';
		try {
			await mutes.toggleChannel(channel);
		} catch {
			headError = m.muteUpdateFailed();
		}
	}
	// 参加状態はサーバの viewerSubscribed が真実源。押した直後だけ楽観的に上書きし、
	// 失敗したら戻す（ミュートのストアほど広く参照されないので、ここだけで持つ）。
	let subscribedOverride = $state<boolean | undefined>(undefined);
	let subscribeBusy = $state(false);
	let subscribed = $derived(subscribedOverride ?? Boolean(channel?.viewerSubscribed));
	// CH を移動したら前のページの楽観状態を持ち越さない。
	$effect(() => {
		void channel?.uri;
		subscribedOverride = undefined;
	});
	async function toggleSubscription() {
		if (!channel || subscribeBusy) return;
		const next = !subscribed;
		subscribeBusy = true;
		subscribedOverride = next;
		headError = '';
		try {
			await setChannelSubscription(channel.uri, next);
		} catch (e) {
			subscribedOverride = !next;
			headError = e instanceof Error ? e.message : m.channelJoinFailed();
		} finally {
			subscribeBusy = false;
		}
	}
	let composerChannel = $derived(
		channel ? { uri: channel.uri, cid: channel.cid, name: channel.name } : undefined,
	);
	// ポストモーダルは +layout に常駐しているので、「いま見ているフィード」がこの CH で
	// あることを渡してやる必要がある（ルートパラメータからは cid が取れない）。
	$effect(() => {
		if (composerChannel) composerHost.setChannel(composerChannel);
		else composerHost.clearChannel();
	});
	const resolve = (url?: string) => (url?.startsWith('/') ? APPVIEW_URL + url : url);

	let editOpen = $state(false);
	let editName = $state('');
	let editDescription = $state('');
	// undefined=既存画像を維持、null=削除、Blob=差し替え。
	let editBanner = $state<Blob | null | undefined>(undefined);
	let editBannerPreview = $state<string>();
	let localBannerUrl = $state<string>();
	let cropFile = $state<File>();
	let editing = $state(false);
	let editError = $state('');
	let bannerInput = $state<HTMLInputElement>();
	function revokeEditPreview() {
		// 既存バナーが楽観表示用 blob URL の場合は channel 側が所有するため、ここでは破棄しない。
		if (editBanner instanceof Blob && editBannerPreview?.startsWith('blob:'))
			URL.revokeObjectURL(editBannerPreview);
	}
	function openEdit() {
		if (!channel || !isOwner) return;
		revokeEditPreview();
		editName = channel.name;
		editDescription = channel.description ?? '';
		editBanner = undefined;
		editBannerPreview = resolve(channel.banner);
		editError = '';
		editOpen = true;
	}
	function closeEdit() {
		if (editing) return;
		revokeEditPreview();
		editBannerPreview = undefined;
		cropFile = undefined;
		editOpen = false;
	}
	function selectBanner(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			editError = m.imageTypeError();
			return;
		}
		if (file.size > 25_000_000) {
			editError = m.imageSizeError();
			return;
		}
		editError = '';
		cropFile = file;
	}
	function applyBanner(blob: Blob) {
		revokeEditPreview();
		editBanner = blob;
		editBannerPreview = URL.createObjectURL(blob);
		cropFile = undefined;
	}
	function removeBanner() {
		revokeEditPreview();
		editBanner = null;
		editBannerPreview = undefined;
	}
	async function submitEdit() {
		const targetRkey = rkey;
		if (!channel || !isOwner || editing || !editName.trim() || !targetRkey) return;
		editing = true;
		editError = '';
		const name = editName.trim();
		const description = editDescription.trim();
		try {
			const response = await updateChannel(targetRkey, {
				name,
				description: description || undefined,
				banner: editBanner,
			});
			const updated: ChannelView = {
				...channel,
				cid: response.data.cid,
				name,
			};
			if (description) updated.description = description;
			else delete updated.description;
			if (editBanner === null) {
				delete updated.banner;
				if (localBannerUrl) URL.revokeObjectURL(localBannerUrl);
				localBannerUrl = undefined;
			} else if (editBanner instanceof Blob) {
				if (localBannerUrl) URL.revokeObjectURL(localBannerUrl);
				localBannerUrl = URL.createObjectURL(editBanner);
				updated.banner = localBannerUrl;
			}
			channel = updated;
			revokeEditPreview();
			editBannerPreview = undefined;
			editOpen = false;
		} catch (e) {
			editError = e instanceof Error ? e.message : m.channelEditFailed();
		} finally {
			editing = false;
		}
	}

	let pinBusy = $state(false);
	let pinError = $state('');
	async function savePinnedPost(post?: PostView) {
		const targetRkey = rkey;
		if (!channel || !isOwner || pinBusy || !targetRkey) return;
		pinBusy = true;
		pinError = '';
		const ref = post ? { uri: post.uri, cid: post.cid } : undefined;
		try {
			const response = await setChannelPinnedPost(targetRkey, ref);
			const updated: ChannelView = { ...channel, cid: response.data.cid };
			if (ref && post) {
				updated.pinnedPostRef = ref;
				updated.pinnedPost = post;
			} else {
				delete updated.pinnedPostRef;
				delete updated.pinnedPost;
			}
			channel = updated;
		} catch (e) {
			pinError = e instanceof Error ? e.message : m.channelPinFailed();
		} finally {
			pinBusy = false;
		}
	}
	function togglePinnedPost(post: PostView) {
		return savePinnedPost(channel?.pinnedPostRef?.uri === post.uri ? undefined : post);
	}
	function onPostDeleted(postUri: string) {
		feed?.removePost(postUri);
		if (channel?.pinnedPost?.uri === postUri) {
			const updated = { ...channel };
			delete updated.pinnedPost;
			channel = updated;
		}
	}

	let deleteOpen = $state(false);
	let deleting = $state(false);
	let deleteError = $state('');
	async function removeChannel() {
		if (deleting || !rkey) return;
		deleting = true;
		deleteError = '';
		try {
			await deleteChannel(rkey);
			// 取り込み反映まで getChannels がまだ返すので、一覧側で楽観的に除外する。
			deletedChannels.add(uri);
			deleteOpen = false;
			await goto('/channels');
		} catch (e) {
			deleteError = e instanceof Error ? e.message : m.channelDeleteFailed();
		} finally {
			deleting = false;
		}
	}

	const STALE_MS = 3 * 60 * 1000;
	let isCreatedJustNow = $derived(Boolean(createdChannels.get(uri)));
	let isCreatedRecently = $derived(
		Boolean(
			channel &&
				(isCreatedJustNow ||
					(isOwner && Date.now() - new Date(channel.createdAt).valueOf() < STALE_MS)),
		),
	);
	let isAwaitingInitialBotPost = $derived(
		Boolean(isCreatedRecently && feed && !feed.loading && !feed.visibleItems.length),
	);

	onMount(() => {
		const base = startVisiblePolling(() => feed?.refresh(), 30_000, { onReturn: true });
		// 投稿直後は AppView 取り込み前のため、即時 refresh だけでは楽観投稿を
		// reconcile できない。反映されるまで短い間隔で追従する。
		const fast = startVisiblePolling(() => feed?.refresh(), 3_000, {
			when: () =>
				Boolean(
					feed?.hasOptimistic() ||
						feed?.hasPendingFor($session?.did) ||
						isAwaitingInitialBotPost,
				),
		});
		return () => {
			base();
			fast();
			revokeEditPreview();
			// この CH を離れたら投稿先の文脈も落とす。残すと別ページからの投稿が
			// この CH に入ってしまう。
			composerHost.clearChannel();
			if (localBannerUrl) URL.revokeObjectURL(localBannerUrl);
		};
	});

	// ポストモーダルからの投稿を拾う。
	let seenPosted = untrack(() => postedSignal.count);
	$effect(() => {
		if (postedSignal.count === seenPosted) return;
		seenPosted = postedSignal.count;
		void feed?.refresh();
	});
	// 投稿直後の画面追従。楽観カード → 確定カードで DOM が入れ替わる。
	followPostedScroll(() => feed?.visibleItems);
</script>

<section class="channel-header">
	<a class="settings-back" href="/channels">← {m.channelsTitle()}</a>
	{#if channel}
		<div class="channel-hero">
			<span class="channel-card-media">
				{#if channel.banner}<img src={resolve(channel.banner)} alt={m.channelBannerAlt()} />{/if}
			</span>
			<h1 class="channel-card-name">{channel.name}</h1>
			{#if isOwner || $session}
				<div class="channel-hero-actions">
					{#if $session}
						<!-- 参加するとこの CH の最新ポストが my Nagi に並ぶ。所有者も参加できる。 -->
						<button
							class="channel-join"
							class:joined={subscribed}
							type="button"
							disabled={subscribeBusy}
							aria-pressed={subscribed}
							onclick={() => void toggleSubscription()}
						>
							<Icon name={subscribed ? 'check' : 'plus'} size={16} />
							<span>{subscribed ? m.channelLeave() : m.channelJoin()}</span>
						</button>
					{/if}
					{#if isOwner}
						<button
							class="channel-hero-action"
							type="button"
							aria-label={m.channelEdit()}
							title={m.channelEdit()}
							onclick={openEdit}><Icon name="edit" size={18} /></button
						>
						<button
							class="channel-hero-action"
							type="button"
							aria-label={m.channelDelete()}
							title={m.channelDelete()}
							onclick={() => (deleteOpen = true)}><Icon name="trash" size={18} /></button
						>
					{:else}
						<!-- ミュートしてもこのページからは今までどおり見える（URL を開いたので）。
						     効くのはCH一覧・CH検索・TL・検索のほう。 -->
						<button
							class="channel-hero-action"
							type="button"
							aria-label={muted ? m.unmuteChannel() : m.muteChannel()}
							title={muted ? m.unmuteChannel() : m.muteChannel()}
							disabled={mutes.isPending(channel.uri)}
							onclick={() => void toggleMute()}><Icon name="hide" size={18} /></button
						>
					{/if}
				</div>
			{/if}
			{#if muted}<span class="channel-muted-badge">{m.mutedBadge()}</span>{/if}
			<span class="channel-card-foot">
				{#if channel.description}<span class="channel-card-desc">{channel.description}</span>{/if}
				<span class="channel-card-updated"
					>{m.channelUpdatedAt({
						time: relativeTime(channel.lastPostAt ?? channel.createdAt),
					})}</span
				>
			</span>
		</div>
	{:else if headError}
		<p class="error">{headError}</p>
	{/if}
</section>

{#if channel?.pinnedPost}
	<section class="channel-pinned" aria-label={m.channelPinnedPost()}>
		<div class="channel-pinned-head">
			<span><Icon name="pin" size={16} />{m.channelPinnedPost()}</span>
		</div>
		<ThreadUnit
			item={channel.pinnedPost}
			canPin={isOwner}
			pinChannelUri={channel.uri}
			pinnedPostUri={channel.pinnedPostRef?.uri}
			{pinBusy}
			ontogglepin={togglePinnedPost}
			ondeleted={onPostDeleted}
			onposted={() => feed?.refresh()}
		/>
	</section>
{:else if isOwner && channel?.pinnedPostRef}
	<section class="channel-pinned channel-pinned-unavailable">
		<div class="channel-pinned-head">
			<span><Icon name="pin" size={16} />{m.channelPinnedPost()}</span>
			<button class="ghost" type="button" disabled={pinBusy} onclick={() => savePinnedPost()}
				>{m.channelUnpinPost()}</button
			>
		</div>
		<p>{m.channelPinnedUnavailable()}</p>
	</section>
{/if}
{#if pinError}<p class="error channel-pin-error" role="alert">{pinError}</p>{/if}

<section class="timeline" aria-busy={feed?.loading}>
	{#if feed}
		{#if feed.loading && !feed.visibleItems.length}
			<div class="timeline-loading" role="status" aria-label={m.feedWaiting()}>
				<span class="spinner" aria-hidden="true"></span>
			</div>
		{:else if feed.error && !feed.visibleItems.length}
			<div class="state error">
				{feed.error}<button
					class="icon-action"
					type="button"
					aria-label={m.retry()}
					title={m.retry()}
					onclick={() => feed?.load()}><Icon name="refresh" size={18} /></button
				>
			</div>
		{:else if !feed.visibleItems.length}
			{#if isAwaitingInitialBotPost}
				<article class="thread-unit">
					<BotReplyStatus
						state="processing"
						createdAt={channel?.createdAt ?? new Date().toISOString()}
						botActor={feed.botActor}
					/>
				</article>
			{:else}
				<div class="state">{m.channelTimelineEmpty()}</div>
			{/if}
		{:else}
			{#each feed.visibleItems as item (feedKey(item))}
				<ThreadUnit
					{item}
					botActor={feed.botActor}
					ondeleted={onPostDeleted}
					onposted={() => feed?.refresh()}
					canPin={isOwner}
					pinChannelUri={channel?.uri}
					pinnedPostUri={channel?.pinnedPostRef?.uri}
					hiddenPostUri={channel?.pinnedPost?.uri}
					{pinBusy}
					ontogglepin={togglePinnedPost}
				/>
			{/each}
			<InfiniteScroll
				hasMore={feed.hasMore}
				loading={feed.loading}
				error={feed.error}
				onload={() => feed?.loadMore()}
			/>
		{/if}
	{/if}
</section>

{#if editOpen}
	<div class="draft-backdrop" role="presentation">
		<div class="draft-dialog" role="dialog" aria-modal="true" aria-label={m.channelEditTitle()}>
			<h2>{m.channelEditTitle()}</h2>
			<label class="field"
				>{m.channelNameLabel()}
				<input bind:value={editName} maxlength="500" placeholder={m.channelNamePlaceholder()} />
			</label>
			<label class="field"
				>{m.channelDescLabel()}
				<textarea
					bind:value={editDescription}
					maxlength="3000"
					rows="3"
					placeholder={m.channelDescPlaceholder()}
				></textarea>
			</label>
			<div class="field">
				<span>{m.channelBannerLabel()}</span>
				{#if editBannerPreview}
					<span class="channel-banner preview"
						><img src={editBannerPreview} alt={m.channelBannerAlt()} /></span
					>
				{/if}
				<div class="channel-banner-actions">
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
					{#if editBannerPreview}
						<button type="button" class="ghost" onclick={removeBanner}
							>{m.channelBannerRemove()}</button
						>
					{/if}
				</div>
				<small>{m.channelBannerNote()}</small>
			</div>
			{#if editError}<p class="error" role="alert">{editError}</p>{/if}
			<div class="delete-actions">
				<button type="button" class="ghost" disabled={editing} onclick={closeEdit}
					>{m.cancel()}</button
				>
				<button
					type="button"
					class="primary"
					disabled={editing || !editName.trim()}
					onclick={submitEdit}>{editing ? m.channelSaving() : m.save()}</button
				>
			</div>
		</div>
	</div>
{/if}

{#if deleteOpen}
	<div class="draft-backdrop" role="presentation">
		<div class="draft-dialog draft-confirm" role="dialog" aria-modal="true">
			<h2>{m.channelDeleteTitle()}</h2>
			<p>{m.channelDeleteConfirmation()}</p>
			{#if deleteError}<p class="error">{deleteError}</p>{/if}
			<div class="delete-actions">
				<button type="button" class="ghost" onclick={() => (deleteOpen = false)}
					>{m.cancel()}</button
				>
				<button type="button" class="danger" disabled={deleting} onclick={removeChannel}
					>{deleting ? m.channelDeleting() : m.channelDeleteConfirm()}</button
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
