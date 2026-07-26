<script lang="ts">
	import { createPost, preparePostDraft, uploadPostAssets } from '$lib/atproto/records';
	import { crosspostToBluesky } from '$lib/crosspost/bluesky';
	import { getCrosspostEnabled, hasCrosspostScope } from '$lib/crosspost/preferences';
	import { m } from '$lib/i18n/i18n.svelte';
	import type { ImageAttachment } from '$lib/images';
	import ImageAttachmentEditor from './ImageAttachmentEditor.svelte';
	import LinkCardEditor from './LinkCardEditor.svelte';
	import type { LinkCardDraft } from '$lib/atproto/records';
	import { session } from '$lib/oauth/session.svelte';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	import ComposerEditor from './ComposerEditor.svelte';
	import Icon from './shell/Icon.svelte';
	import Avatar from './Avatar.svelte';
	import { myProfile } from '$lib/profile/me.svelte';
	import type { MentionSelection } from '$lib/atproto/facets';
	import { drafts } from '$lib/drafts/drafts.svelte';
	import { DraftStorageError } from '$lib/drafts/storage';
	import DraftListDialog from './DraftListDialog.svelte';
	import { extractTitle } from '$lib/atproto/markdown';
	import {
		getStandardSiteEnabled,
		hasStandardSiteScope,
		isArticleCandidate,
	} from '$lib/standardsite/preferences';
	import {
		publishStandardSiteDocument,
		tagsFromFacets,
		usableAsCoverImage,
	} from '$lib/standardsite/document';
	// channel を渡すとチャンネル投稿になる（CH ページから使う）。CH 限定は kossori（目アイコン）で表現。
	let {
		onposted,
		channel,
	}: {
		onposted: () => void | Promise<void>;
		channel?: { uri: string; cid: string; name?: string };
	} = $props();
	let text = $state('');
	let busy = $state(false);
	let error = $state('');
	let warning = $state('');
	let attachments = $state<ImageAttachment[]>([]);
	let linkCards = $state<LinkCardDraft[]>([]);
	let mentions = $state<MentionSelection[]>([]);
	let kossori = $state(false);
	let dismissedUrls = $state<string[]>([]);
	let draftListOpen = $state(false);
	let draftError = $state('');
	let pendingRestoreId = $state<string | null>(null);
	let loadedDid = $state<string | undefined>(undefined);
	let crosspostReady = $state(false);
	let imageEditor: { handlePaste: (event: ClipboardEvent) => void } | undefined;

	let empty = $derived(!text.trim() && !attachments.length && !linkCards.length);
	let graphemes = $derived(
		[...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(text)].length,
	);

	// --- standard.site（ブログとしての公開）へのオプトイン --------------------
	// 権限はサインイン時にまとめて渡し、機能の有効化は設定ページ、投稿ごとの ON/OFF は
	// こっそりモードと同じアイコンボタンで行う。既定は常に OFF。
	let standardSiteReady = $state(false);
	let standardSite = $state(false);
	let articleTitle = $state('');
	const articleCandidate = $derived(isArticleCandidate({ kossori, channel }));
	const willCrosspost = $derived(crosspostReady && !channel && !kossori && !standardSite);
	// 本文先頭の見出しをタイトルに使う。無いときだけ入力欄を出す。
	const headingTitle = $derived(standardSite ? extractTitle(text.trim()) : undefined);
	const needsArticleTitle = $derived(standardSiteReady && standardSite && !headingTitle);
	const articleTitleMissing = $derived(needsArticleTitle && !articleTitle.trim());
	// こっそり／チャンネル投稿に切り替わったら黙って落とす（意図せぬ公開を作らない）。
	$effect(() => {
		if (!articleCandidate && standardSite) standardSite = false;
	});

	$effect(() => {
		const did = $session?.did;
		if (did !== loadedDid) {
			loadedDid = did;
			void drafts.load(did);
			crosspostReady = false;
			standardSiteReady = false;
			if (did && getCrosspostEnabled()) {
				void hasCrosspostScope().then((granted) => {
					if ($session?.did === did) crosspostReady = granted;
				});
			}
			if (did && getStandardSiteEnabled()) {
				void hasStandardSiteScope().then((granted) => {
					if ($session?.did === did) standardSiteReady = granted;
				});
			}
		}
	});

	function clearComposer() {
		text = '';
		attachments = [];
		linkCards = [];
		mentions = [];
		dismissedUrls = [];
		kossori = false;
		standardSite = false;
		articleTitle = '';
	}

	async function saveDraft() {
		if (empty || busy || !$session) return;
		draftError = '';
		try {
			await drafts.save($session.did, { text, attachments, linkCards, mentions, dismissedUrls });
			clearComposer();
		} catch (e) {
			draftError =
				e instanceof DraftStorageError && e.code === 'limit'
					? m.draftLimitReached({ max: 30 })
					: m.draftSaveFailed();
		}
	}

	async function restoreDraft(id: string) {
		if (!empty) {
			pendingRestoreId = id;
			return;
		}
		pendingRestoreId = null;
		const draft = await drafts.restore(id);
		if (!draft) return;
		draftListOpen = false;
		draftError = '';
		// previewUrl は保存していないので、blob から作り直す。解放は
		// ImageAttachmentEditor / LinkCardEditor の既存ライフサイクルに任せる。
		text = draft.text;
		mentions = [...draft.mentions];
		attachments = draft.images.map((image) => ({
			...image,
			previewUrl: URL.createObjectURL(image.blob),
		}));
		linkCards = draft.linkCards.map((card) => ({
			...card,
			previewUrl: card.thumbnail ? URL.createObjectURL(card.thumbnail) : undefined,
		}));
		dismissedUrls = [...draft.dismissedUrls];
	}

	async function confirmRestore() {
		const id = pendingRestoreId;
		if (!id) return;
		clearComposer();
		await restoreDraft(id);
	}

	async function submit() {
		if (empty || busy || !$session || articleTitleMissing) return;
		// 投稿本文はここで確定するので、クリア前にタイトルを解決しておく。
		const article = standardSite ? { title: (headingTitle ?? articleTitle).trim() } : undefined;
		const draft = preparePostDraft(
			text,
			undefined,
			undefined,
			attachments,
			linkCards,
			mentions,
			kossori,
			channel ? { uri: channel.uri, cid: channel.cid } : undefined,
		);
		const optimisticId = optimisticPosts.add(draft, $session.did, {
			...(channel && { channel }),
			threadKossori: kossori,
		});
		busy = true;
		error = '';
		warning = '';
		draftError = '';
		clearComposer();
		try {
			const assets = await uploadPostAssets(draft);
			const response = await createPost(draft, assets);
			optimisticPosts.markCreated(optimisticId, response.data);
			// Bluesky へのクロスポストは失敗しても Nagi の投稿は成立しているので、
			// エラーではなく警告として伝える。
			// ブログとして出す投稿はクロスポストしない。クロスポストは 300 グラフェムごとの
			// 分割スレッドなので、長文記事だと Bluesky 側が連投で埋まってしまう。
			if (!article && getCrosspostEnabled() && (await hasCrosspostScope())) {
				try {
					await crosspostToBluesky(draft, assets);
				} catch (e) {
					warning = e instanceof Error ? e.message : m.crosspostFailed();
				}
			}
			// standard.site も同じ扱い。document の rkey は Nagi 投稿の rkey を使い回す。
			if (article) {
				try {
					const uri = response.data.uri;
					const cover = assets.images[0]?.image;
					await publishStandardSiteDocument({
						rkey: uri.slice(uri.lastIndexOf('/') + 1),
						title: article.title,
						markdown: draft.text,
						publishedAt: draft.createdAt,
						tags: tagsFromFacets(draft.facets),
						...(usableAsCoverImage(cover) ? { coverImage: cover } : {}),
					});
				} catch (e) {
					warning = e instanceof Error ? e.message : m.standardSiteFailed();
				}
			}
			await Promise.resolve(onposted()).catch(() => undefined);
		} catch (e) {
			optimisticPosts.remove(optimisticId);
			error = e instanceof Error ? e.message : m.postFailed();
		} finally {
			busy = false;
		}
	}
</script>

<div class="post-row mine composer-row composer-card">
	<a href={`/profile/${$session?.did}`} aria-label={m.myProfileAria()}
		><Avatar actor={myProfile.current} /></a
	>
	<section class="bubble composer">
		{#snippet editorTools()}
			<ImageAttachmentEditor bind:this={imageEditor} bind:attachments disabled={busy} />
		{/snippet}
		<ComposerEditor
			bind:value={text}
			bind:mentions
			placeholder={m.composerPlaceholder()}
			ariaLabel={m.composerAria()}
			disabled={busy}
			onsubmit={submit}
			onpaste={(event) => imageEditor?.handlePaste(event)}
			tools={editorTools}
		/>
		<LinkCardEditor {text} bind:cards={linkCards} bind:dismissedUrls disabled={busy} />
		{#if needsArticleTitle}
			<!-- 本文の先頭が見出しでないときだけ。standard.site の document.title は必須。 -->
			<div class="composer-article">
				<label class="composer-article-title">
					<span>{m.standardSiteTitleLabel()}</span>
					<input
						type="text"
						bind:value={articleTitle}
						maxlength="200"
						disabled={busy}
						placeholder={m.standardSiteTitlePlaceholder()}
					/>
				</label>
				<p class="composer-article-note">{m.standardSiteTitleHint()}</p>
			</div>
		{/if}
		<div class="composer-foot">
			<div class="composer-status">
				<span>{graphemes} / 3000</span>
				{#if willCrosspost}
					<span class="composer-crosspost" title={m.crosspostComposerStatus()}
						>{m.crosspostComposerStatus()}</span
					>
				{/if}
			</div>
			<!-- チャンネル投稿は記事にしないので、CH の投稿欄ではボタンごと出さない。
			     こっそりに切り替えたときは押せなくなるだけにして、位置は動かさない。 -->
			{#if standardSiteReady && !channel}
				<button
					class="icon-action article-toggle"
					class:active={standardSite}
					type="button"
					disabled={busy || !articleCandidate}
					aria-pressed={standardSite}
					aria-label={m.standardSiteComposerLabel()}
					title={m.standardSiteComposerLabel()}
					onclick={() => (standardSite = !standardSite)}><Icon name="newspaper" size={18} /></button
				>
			{/if}
			<button
				class="icon-action kossori-toggle"
				class:active={kossori}
				type="button"
				disabled={busy}
				aria-pressed={kossori}
				aria-label={channel ? m.composerChannelOnly() : m.composerKossoriAria()}
				title={channel ? m.composerChannelOnly() : m.composerKossoriAria()}
				onclick={() => (kossori = !kossori)}><Icon name="hide" size={18} /></button
			>
			{#if drafts.count}
				<button
					class="icon-action draft-open"
					type="button"
					disabled={busy}
					aria-label={m.draftListOpen()}
					title={m.draftListOpen()}
					onclick={() => (draftListOpen = true)}
					><Icon name="draft" size={18} /><span class="draft-count">{drafts.count}</span></button
				>
			{/if}
			<button
				class="icon-action draft-save"
				type="button"
				disabled={busy || empty}
				aria-label={m.draftSave()}
				title={m.draftSave()}
				onclick={saveDraft}><Icon name="draft" size={18} /></button
			><button
				class="submit icon-action primary-icon"
				type="button"
				disabled={busy || empty || articleTitleMissing}
				aria-label={busy ? m.composerSubmitting() : m.composerSubmit()}
				title={busy ? m.composerSubmitting() : m.composerSubmit()}
				onclick={submit}><Icon name={busy ? 'refresh' : 'send'} size={18} /></button
			>
		</div>
		{#if error}<p class="error">{error}</p>{/if}{#if draftError}<p class="error">
				{draftError}
			</p>{/if}{#if warning}<p class="error">
				{m.crosspostWarning({ reason: warning })}
			</p>{/if}
	</section>
</div>
{#if draftListOpen}
	<DraftListDialog onrestore={restoreDraft} onclose={() => (draftListOpen = false)} />
{/if}
{#if pendingRestoreId}
	<div class="draft-backdrop" role="presentation">
		<div class="draft-dialog draft-confirm" role="dialog" aria-modal="true">
			<p>{m.draftRestoreOverwrite()}</p>
			<div class="delete-actions">
				<button type="button" class="ghost" onclick={() => (pendingRestoreId = null)}
					>{m.cancel()}</button
				>
				<button type="button" class="danger" onclick={confirmRestore}>{m.draftRestore()}</button>
			</div>
		</div>
	</div>
{/if}
