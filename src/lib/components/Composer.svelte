<script lang="ts">
	import { untrack } from 'svelte';
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
	import { postFollow, postHref } from '$lib/feed/post-follow.svelte';
	import { ensureRecord } from '$lib/api/appview';
	import ComposerEditor from './ComposerEditor.svelte';
	import ComposerQuoteEditor from './ComposerQuoteEditor.svelte';
	import { QuotePick } from '$lib/post/quote-pick.svelte';
	import PostScopeDialog from './PostScopeDialog.svelte';
	import Icon from './shell/Icon.svelte';
	import {
		validChannelSelections,
		type ChannelSelection,
		type EmojiSelection,
		type MentionSelection,
	} from '$lib/atproto/facets';
	import { drafts } from '$lib/drafts/drafts.svelte';
	import { DraftStorageError } from '$lib/drafts/storage';
	import DraftListDialog from './DraftListDialog.svelte';
	import { extractTitle } from '$lib/atproto/markdown';
	import { getStandardSiteEnabled, hasStandardSiteScope } from '$lib/standardsite/preferences';
	import {
		publishStandardSiteDocument,
		tagsFromFacets,
		usableAsCoverImage,
	} from '$lib/standardsite/document';
	import { hasContentWarning, validContentWarningSyntax } from '$lib/atproto/contentWarning';
	import {
		getExternalTarget,
		setLastPostScope,
		type ExternalTarget,
		type PostScope,
	} from '$lib/post/scope';
	// channel を渡すとチャンネル投稿になる（CH ページから使う）。CH 限定は投稿範囲の
	// 「こっそり」で表現する（レコード上は kossori）。
	let {
		onposted,
		onsendingchange,
		channel,
		defaultScope = 'feed',
		mode = 'simple',
		publishingPreferencesVersion = 0,
	}: {
		onposted: (uri: string) => void | Promise<void>;
		onsendingchange?: (sending: boolean) => void;
		channel?: { uri: string; cid: string; name?: string };
		defaultScope?: PostScope;
		mode?: 'simple' | 'rich';
		publishingPreferencesVersion?: number;
	} = $props();
	let text = $state('');
	let busy = $state(false);
	let error = $state('');
	let warning = $state('');
	let attachments = $state<ImageAttachment[]>([]);
	let linkCards = $state<LinkCardDraft[]>([]);
	let mentions = $state<MentionSelection[]>([]);
	let channels = $state<ChannelSelection[]>([]);
	let emojis = $state<EmojiSelection[]>([]);
	// defaultScope はこの Composer インスタンスの初期値。ユーザー操作後は追従させない。
	let scope = $state<PostScope>(untrack(() => defaultScope));
	let scopeDialogOpen = $state(false);
	let dismissedUrls = $state<string[]>([]);
	// Nagi のスレッドURLを貼ったときだけ引き取る引用スロット。本文には URL を入れない。
	const quotePick = new QuotePick();
	let draftListOpen = $state(false);
	let draftError = $state('');
	let pendingRestoreId = $state<string | null>(null);
	let loadedDid = $state<string | undefined>(undefined);
	let crosspostReady = $state(false);
	let botSilent = $state(false);
	let publishingLoadVersion = 0;
	let imageEditor: { handlePaste: (event: ClipboardEvent) => void } | undefined;

	let empty = $derived(!text.trim() && !attachments.length && !linkCards.length);
	let graphemes = $derived(
		[...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(text)].length,
	);

	// --- 外部への同時投稿（Bluesky / standard.site）------------------------------
	// 権限はサインイン時にまとめて渡し、機能の有効化と「どちらに出すか」は設定ページ、
	// 投稿ごとの ON/OFF は投稿範囲ゲージの3段階目で行う。既定は常に OFF。
	let standardSiteReady = $state(false);
	let externalTarget = $state<ExternalTarget>('bluesky');
	let articleTitle = $state('');
	const kossori = $derived(scope === 'kossori');
	const selectedChannel = $derived(validChannelSelections(text, channels)[0]);
	const effectiveChannel = $derived(
		channel ??
			(selectedChannel
				? {
						uri: selectedChannel.uri,
						cid: selectedChannel.cid,
						name: selectedChannel.name,
					}
				: undefined),
	);
	const hasContentWarningSetting = $derived(
		hasContentWarning(text) || attachments.some((image) => image.contentWarning),
	);
	const contentWarningValid = $derived(validContentWarningSyntax(text));
	const externalReady = $derived(externalTarget === 'bluesky' ? crosspostReady : standardSiteReady);
	/**
	 * 外部にも出せる条件。Bluesky（クロスポスト）と standard.site（記事化）で
	 * 元々別々に書かれていたが、条件は「チャンネル投稿でない・CW が無い」で一致するため
	 * 1本にまとめている。こっそりとの排他はゲージの構造そのものが担保する。
	 *
	 * 引用付きも外部へは出せない。Bluesky の embed には Nagi のレコードを載せられず
	 * （crosspost/bluesky.ts の buildEmbed は images / external のみ）、記事化しても
	 * 引用は本文に現れないため、どちらも参照が黙って消える。
	 */
	const externalEligible = $derived(
		externalReady && !effectiveChannel && !hasContentWarningSetting && !quotePick.active,
	);
	const externalDisabledReason = $derived(
		!externalReady
			? m.postScopeExternalUnavailable()
			: effectiveChannel
				? m.postScopeExternalChannel()
				: hasContentWarningSetting
					? m.crosspostDisabledContentWarning()
					: quotePick.active
						? m.quoteExternalDisabled()
						: '',
	);
	const standardSite = $derived(scope === 'external' && externalTarget === 'standardSite');
	// 本文先頭の見出しをタイトルに使う。無いときだけ入力欄を出す。
	const headingTitle = $derived(standardSite ? extractTitle(text.trim()) : undefined);
	const needsArticleTitle = $derived(standardSite && externalEligible && !headingTitle);
	const articleTitleMissing = $derived(needsArticleTitle && !articleTitle.trim());
	// 外部に出せない状態に変わったら黙って1段階狭める（意図せぬ公開を作らない）。
	$effect(() => {
		if (scope === 'external' && !externalEligible) scope = 'feed';
	});

	$effect(() => {
		const did = $session?.did;
		if (did === loadedDid) return;
		loadedDid = did;
		void drafts.load(did);
	});

	$effect(() => {
		const did = $session?.did;
		const preferencesVersion = publishingPreferencesVersion;
		const loadVersion = ++publishingLoadVersion;
		crosspostReady = false;
		standardSiteReady = false;
		externalTarget = getExternalTarget();
		if (did && getCrosspostEnabled()) {
			void hasCrosspostScope().then((granted) => {
				if (
					$session?.did === did &&
					publishingPreferencesVersion === preferencesVersion &&
					publishingLoadVersion === loadVersion
				)
					crosspostReady = granted;
			});
		}
		if (did && getStandardSiteEnabled()) {
			void hasStandardSiteScope().then((granted) => {
				if (
					$session?.did === did &&
					publishingPreferencesVersion === preferencesVersion &&
					publishingLoadVersion === loadVersion
				)
					standardSiteReady = granted;
			});
		}
	});

	function clearComposer() {
		text = '';
		attachments = [];
		linkCards = [];
		mentions = [];
		channels = [];
		emojis = [];
		dismissedUrls = [];
		quotePick.clear();
		scope = defaultScope;
		articleTitle = '';
		botSilent = false;
	}

	async function saveDraft() {
		if (empty || busy || !$session) return;
		draftError = '';
		try {
			await drafts.save($session.did, {
				text,
				attachments,
				linkCards,
				mentions,
				channels,
				emojis,
				dismissedUrls,
				quoteUri: quotePick.ref?.uri,
			});
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
		channels = [...(draft.channels ?? [])];
		emojis = [...(draft.emojis ?? [])];
		attachments = draft.images.map((image) => ({
			...image,
			previewUrl: URL.createObjectURL(image.blob),
		}));
		linkCards = draft.linkCards.map((card) => ({
			...card,
			previewUrl: card.thumbnail ? URL.createObjectURL(card.thumbnail) : undefined,
		}));
		dismissedUrls = [...draft.dismissedUrls];
		quotePick.restore(draft.quoteUri, $session?.did);
	}

	async function confirmRestore() {
		const id = pendingRestoreId;
		if (!id) return;
		clearComposer();
		await restoreDraft(id);
	}

	async function submit() {
		if (empty || busy || !$session || articleTitleMissing || !contentWarningValid) return;
		const wantsExternal = scope === 'external' && externalEligible;
		// 投稿本文はここで確定するので、クリア前にタイトルを解決しておく。
		const article =
			wantsExternal && externalTarget === 'standardSite' && !hasContentWarningSetting
				? { title: (headingTitle ?? articleTitle).trim() }
				: undefined;
		const quotedPost = quotePick.post;
		const draft = preparePostDraft(
			text,
			undefined,
			quotePick.ref,
			attachments,
			linkCards,
			mentions,
			channels,
			emojis,
			kossori,
			effectiveChannel ? { uri: effectiveChannel.uri, cid: effectiveChannel.cid } : undefined,
			false,
			botSilent,
		);
		const optimisticId = optimisticPosts.add(draft, $session.did, {
			...(quotedPost && { quote: quotedPost }),
			...(effectiveChannel && { channel: effectiveChannel }),
			threadKossori: kossori,
		});
		// 表示中のフィードに楽観カードが出たらそこへ、確定したらその投稿へ画面を寄せる。
		// 出せないフィード（検索タブなど）や投稿できない画面では導線へ切り替わる。
		postFollow.begin(optimisticId);
		busy = true;
		onsendingchange?.(true);
		error = '';
		warning = '';
		draftError = '';
		try {
			const assets = await uploadPostAssets(draft);
			const response = await createPost(draft, assets);
			optimisticPosts.markCreated(optimisticId, response.data);
			postFollow.settle(response.data.uri, postHref(response.data.uri));
			await ensureRecord(response.data.uri, response.data.cid).catch(() => undefined);
			// Bluesky へのクロスポストは失敗しても Nagi の投稿は成立しているので、
			// エラーではなく警告として伝える。
			// ブログとして出す投稿はクロスポストしない。クロスポストは 300 グラフェムごとの
			// 分割スレッドなので、長文記事だと Bluesky 側が連投で埋まってしまう。
			// 引用はNagi内のレコードを参照するため、Blueskyへはクロスポストしない
			// （返信・引用の既存方針と同じ）。scope 側でも外部を選べなくしてある。
			if (
				wantsExternal &&
				externalTarget === 'bluesky' &&
				!draft.kossori &&
				!draft.channel &&
				!draft.cwRestricted &&
				!draft.quote &&
				!article
			) {
				if (!getCrosspostEnabled() || !(await hasCrosspostScope()))
					warning = m.crosspostPermissionMissing();
				else
					try {
						await crosspostToBluesky(draft, assets);
					} catch (e) {
						warning = e instanceof Error ? e.message : m.crosspostFailed();
					}
			}
			// standard.site も同じ扱い。document の rkey は Nagi 投稿の rkey を使い回す。
			if (article && !draft.cwRestricted && !draft.quote) {
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
			setLastPostScope(scope);
			clearComposer();
			await Promise.resolve(onposted(response.data.uri)).catch(() => undefined);
		} catch (e) {
			optimisticPosts.remove(optimisticId);
			postFollow.fail();
			error = e instanceof Error ? e.message : m.postFailed();
		} finally {
			busy = false;
			onsendingchange?.(false);
		}
	}

	const scopeLabel = $derived(
		scope === 'kossori'
			? m.postScopeKossoriShort()
			: scope === 'external'
				? externalTarget === 'bluesky'
					? m.postScopeBlueskyShort()
					: m.postScopeStandardSiteShort()
				: effectiveChannel
					? (effectiveChannel.name ?? m.postScopeChannelShort())
					: m.postScopeFeedShort(),
	);
	const scopeIcon = $derived(
		scope === 'kossori'
			? 'hide'
			: scope === 'external'
				? externalTarget === 'bluesky'
					? 'bluesky'
					: 'newspaper'
				: effectiveChannel
					? 'hash'
					: 'home',
	);
</script>

<!--
	モーダル専用なので、以前タイムラインとの一体感のために付けていた吹き出し
	（.post-row.mine / .bubble のアクセント枠としっぽ）とアバターは持たない。
-->
<section class="composer" class:rich={mode === 'rich'}>
	{#snippet editorTools()}
		<ImageAttachmentEditor bind:this={imageEditor} bind:attachments disabled={busy} />
	{/snippet}
	<ComposerEditor
		bind:value={text}
		bind:mentions
		bind:channels
		bind:emojis
		channelSuggestionsEnabled={!channel}
		placeholder={m.composerPlaceholder()}
		ariaLabel={m.composerAria()}
		disabled={busy}
		{mode}
		onsubmit={() => submit()}
		onpaste={(event) => {
			// Nagi のスレッドURL単体なら引用として引き取る（そのとき本文へは入らない）。
			// それ以外は素通しするので、画像ペーストは従来どおり動く。
			quotePick.handlePaste(event, $session?.did);
			imageEditor?.handlePaste(event);
		}}
		tools={editorTools}
	/>
	<LinkCardEditor {text} bind:cards={linkCards} bind:dismissedUrls disabled={busy} />
	<ComposerQuoteEditor quote={quotePick} disabled={busy} />
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
		<button
			class="scope-button"
			type="button"
			disabled={busy}
			aria-haspopup="dialog"
			aria-expanded={scopeDialogOpen}
			aria-label={m.postScopeOpenAria({ scope: scopeLabel })}
			title={m.postScopeOpenAria({ scope: scopeLabel })}
			onclick={() => (scopeDialogOpen = true)}
		>
			<Icon name={scopeIcon} size={15} />
			<span>{scopeLabel}</span>
		</button>
		<div class="composer-status">
			<span>{graphemes} / 3000</span>
		</div>
		{#if mode === 'rich'}
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
			>
		{/if}
		<div class="composer-submit-actions">
			<button
				class="icon-action bot-silent-toggle"
				class:active={botSilent}
				type="button"
				disabled={busy}
				aria-label={botSilent ? m.botSilentDisableTooltip() : m.botSilentEnableTooltip()}
				aria-pressed={botSilent}
				title={botSilent ? m.botSilentDisableTooltip() : m.botSilentEnableTooltip()}
				onclick={() => (botSilent = !botSilent)}
			>
				<Icon name="bot-off" size={18} />
			</button>
			<button
				class="submit-primary"
				type="button"
				disabled={busy || empty || articleTitleMissing || !contentWarningValid}
				aria-label={busy ? m.composerSubmitting() : m.composerSubmitNagi()}
				title={busy ? m.composerSubmitting() : m.composerSubmitNagi()}
				onclick={() => submit()}
			>
				{#if busy}<span class="submit-spinner" aria-hidden="true"></span>
				{:else}<Icon name="send" size={18} />{/if}
				<span>{busy ? m.composerSubmitting() : m.composerSubmitNagiShort()}</span>
			</button>
		</div>
	</div>
	{#if error}<p class="error">{error}</p>{/if}{#if draftError}<p class="error">
			{draftError}
		</p>{/if}{#if warning}<p class="error">
			{m.crosspostWarning({ reason: warning })}
		</p>{/if}
</section>
{#if scopeDialogOpen}
	<PostScopeDialog
		{scope}
		{externalTarget}
		{externalEligible}
		{externalDisabledReason}
		channelName={effectiveChannel?.name}
		onselect={(next) => {
			scope = next;
			setLastPostScope(next);
		}}
		onclose={() => (scopeDialogOpen = false)}
	/>
{/if}
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
