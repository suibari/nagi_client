<script lang="ts">
	import type { ActorView, PostView } from '$lib/api/types';
	import ReactionBar from './ReactionBar.svelte';
	import AvatarLink from './AvatarLink.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import TranslateToggle from './TranslateToggle.svelte';
	import Icon from './shell/Icon.svelte';
	import QuoteCard from './QuoteCard.svelte';
	import NewsQuoteCard from './NewsQuoteCard.svelte';
	import ActorBadges from './ActorBadges.svelte';
	import PostDeleteDialog from './PostDeleteDialog.svelte';
	import {
		createPost,
		deleteRecord,
		preparePostDraft,
		setPostKossori,
		updatePost,
	} from '$lib/atproto/records';
	import ImageGallery from './ImageGallery.svelte';
	import type { ImageAttachment, PostEditImage } from '$lib/images';
	import type { LinkCardDraft } from '$lib/atproto/records';
	import LinkCard from './LinkCard.svelte';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	import { ensureRecord } from '$lib/api/appview';
	import ComposerEditor from './ComposerEditor.svelte';
	import InlinePostComposer from './InlinePostComposer.svelte';
	import {
		restorePostEditState,
		validChannelSelections,
		type ChannelSelection,
		type EmojiSelection,
		type MentionSelection,
	} from '$lib/atproto/facets';
	import {
		languagePreferences,
		normalizeSupportedLanguage,
	} from '$lib/i18n/languagePreferences.svelte';
	import { buildExternalTranslationUrl } from '$lib/i18n/translationProviders';
	import { tick } from 'svelte';
	import { postFollow, postHref, scrollToElement } from '$lib/feed/post-follow.svelte';
	import PostImageEditor from './PostImageEditor.svelte';
	import { extractTitle } from '$lib/atproto/markdown';
	import { hasStandardSiteScope } from '$lib/standardsite/preferences';
	import {
		deleteStandardSiteDocument,
		tagsFromFacets,
		updateStandardSiteDocument,
	} from '$lib/standardsite/document';
	import {
		hasContentWarning,
		parseContentWarning,
		validContentWarningSyntax,
	} from '$lib/atproto/contentWarning';
	let {
		post,
		botActor,
		ondeleted,
		onposted,
		displayOnly = false,
		hideTimestamp = false,
		canPin = false,
		pinned = false,
		pinBusy = false,
		ontogglepin,
		clampLines,
		maxImages,
		maxLinkCards,
	}: {
		post: PostView;
		/** ニュース引用ブロックの botたんヘッダーに使う実データ。 */
		botActor?: ActorView;
		ondeleted?: (uri: string) => void;
		onposted?: () => void | Promise<void>;
		/** ニュースコメント等、投稿と同じ見た目だけを使う読み取り専用表示。 */
		displayOnly?: boolean;
		/** APIのローリング更新などで信頼できる日時が無い読み取り専用表示に使う。 */
		hideTimestamp?: boolean;
		/** チャンネル作成者向け。投稿者に関係なく、この投稿をピン操作できる。 */
		canPin?: boolean;
		pinned?: boolean;
		pinBusy?: boolean;
		ontogglepin?: (post: PostView) => void | Promise<void>;
		/** 省略時の表示行数。未指定時は CSS の 6 行。 */
		clampLines?: number;
		/** 画像の初期表示枚数上限。未指定時は制限なし。 */
		maxImages?: number;
		/** リンクカードの初期表示枚数上限。未指定時は制限なし。 */
		maxLinkCards?: number;
	} = $props();
	let expanded = $state(false);
	let overflowing = $state(false);
	let showAllImages = $state(false);
	let showAllLinkCards = $state(false);
	let deleteOpen = $state(false);
	let deleting = $state(false);
	let deleteError = $state('');
	let composeMode = $state<'reply' | 'quote'>();
	let composeText = $state('');
	let posting = $state(false);
	let postError = $state('');
	let attachments = $state<ImageAttachment[]>([]);
	let linkCards = $state<LinkCardDraft[]>([]);
	let mentions = $state<MentionSelection[]>([]);
	let channels = $state<ChannelSelection[]>([]);
	let emojis = $state<EmojiSelection[]>([]);
	let kossoriBusy = $state(false);
	// 編集は返信/引用と違い、下に新しい吹き出しを出さず、この投稿の吹き出し内でその場編集する。
	let editing = $state(false);
	let editText = $state('');
	let editMentions = $state<MentionSelection[]>([]);
	let editChannels = $state<ChannelSelection[]>([]);
	// 編集開始時点の所属。タグ由来（本文の #CH名 から復元できた）かどうかで、
	// タグを消したときに CH から外すかを決める。
	let editOriginalChannel = $state<{ uri: string; cid: string; name?: string }>();
	let editChannelWasTagged = $state(false);
	let editEmojis = $state<EmojiSelection[]>([]);
	let editImages = $state<PostEditImage[]>([]);
	let editImageProcessing = $state(false);
	let editBusy = $state(false);
	let editError = $state('');
	let editImageEditor = $state<{ handlePaste: (event: ClipboardEvent) => void }>();
	let reactionPickerOpen = $state(false);
	let reactionButton = $state<HTMLButtonElement>();
	let actionMenuOpen = $state(false);
	let actionMenuTrigger = $state<HTMLButtonElement>();
	let actionMenu = $state<HTMLDivElement>();
	let postRow: HTMLDivElement;
	let mine = $derived($session?.did === post.author.did);
	let hasTallImage = $derived(
		Boolean(
			post.images?.some(
				(img) => !img.aspectRatio || img.aspectRatio.height > img.aspectRatio.width,
			),
		),
	);
	let visibleImages = $derived(
		maxImages && !showAllImages ? post.images?.slice(0, maxImages) : post.images,
	);
	let imageToggleable = $derived(
		Boolean(
			maxImages &&
				post.images &&
				(post.images.length > maxImages || hasTallImage),
		),
	);
	let clampTallImages = $derived(
		Boolean(maxImages && !showAllImages && hasTallImage),
	);
	let visibleLinkCards = $derived(
		maxLinkCards && !showAllLinkCards ? post.linkCards?.slice(0, maxLinkCards) : post.linkCards,
	);
	let linkCardToggleable = $derived(
		Boolean(maxLinkCards && post.linkCards && post.linkCards.length > maxLinkCards),
	);
	let topLevel = $derived(!post.reply);
	let optimistic = $derived(Boolean(post.optimisticState));
	let threadHref = $derived(`/thread/${post.author.did}/${post.uri.split('/').pop()}`);
	// 外国語の投稿にだけ「選択したプロバイダーで翻訳」ボタンを出す。
	let translateSourceLang = $derived(normalizeSupportedLanguage(post.langs?.[0]));
	let canTranslateExternally = $derived(
		Boolean(post.text?.trim()) &&
			Boolean(translateSourceLang) &&
			translateSourceLang !== languagePreferences.translationLanguage,
	);
	let hasSecondaryActions = $derived(canTranslateExternally || canPin || mine);
	let editHasContent = $derived(
		Boolean(editText.trim() || editImages.length || post.linkCards?.length || post.quote),
	);
	let editContentWarningValid = $derived(validContentWarningSyntax(editText));
	let composeContentWarningValid = $derived(validContentWarningSyntax(composeText));
	$effect(() => {
		if (!actionMenuOpen) return;
		const closeFromOutside = (event: PointerEvent) => {
			const target = event.target as Node;
			if (!actionMenu?.contains(target) && !actionMenuTrigger?.contains(target)) {
				actionMenuOpen = false;
			}
		};
		const closeFromEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			actionMenuOpen = false;
			requestAnimationFrame(() => actionMenuTrigger?.focus());
		};
		document.addEventListener('pointerdown', closeFromOutside);
		document.addEventListener('keydown', closeFromEscape);
		return () => {
			document.removeEventListener('pointerdown', closeFromOutside);
			document.removeEventListener('keydown', closeFromEscape);
		};
	});
	function toggleActionMenu() {
		actionMenuOpen = !actionMenuOpen;
		if (actionMenuOpen) {
			void tick().then(() =>
				actionMenu?.querySelector<HTMLButtonElement>('[role^="menuitem"]')?.focus(),
			);
		}
	}
	function handleActionMenuKeydown(event: KeyboardEvent) {
		const items = [
			...(actionMenu?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? []),
		];
		if (!items.length) return;
		const current = Math.max(0, items.indexOf(document.activeElement as HTMLButtonElement));
		let next: number | undefined;
		if (event.key === 'ArrowDown') next = (current + 1) % items.length;
		if (event.key === 'ArrowUp') next = (current - 1 + items.length) % items.length;
		if (event.key === 'Home') next = 0;
		if (event.key === 'End') next = items.length - 1;
		if (next === undefined) return;
		event.preventDefault();
		items[next]?.focus();
	}
	function runSecondaryAction(
		action: () => void,
		focusAfter: 'trigger' | 'editor' | 'none' = 'trigger',
	) {
		actionMenuOpen = false;
		action();
		void tick().then(() => {
			if (focusAfter === 'trigger') actionMenuTrigger?.focus();
			if (focusAfter === 'editor') postRow?.querySelector<HTMLTextAreaElement>('textarea')?.focus();
		});
	}
	function openExternalTranslation() {
		const url = buildExternalTranslationUrl(languagePreferences.translationProvider, {
			text: post.text,
			from: translateSourceLang,
			to: languagePreferences.translationLanguage,
		});
		window.open(url, '_blank', 'noopener,noreferrer');
	}
	function openComposer(mode: 'reply' | 'quote') {
		if (!$session) {
			location.href = '/login';
			return;
		}
		postError = '';
		if (composeMode === mode) {
			cancelComposer();
		} else {
			if (mode === 'reply') channels = [];
			composeMode = mode;
		}
	}
	function toggleReactionPicker() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		reactionPickerOpen = !reactionPickerOpen;
	}
	function cancelComposer() {
		composeMode = undefined;
		composeText = '';
		attachments = [];
		linkCards = [];
		mentions = [];
		channels = [];
		emojis = [];
	}
	function startEdit() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		editError = '';
		// 所属はスレッドルートが持つので、返信の編集ではチャンネルに一切触れない。
		editOriginalChannel =
			!post.reply && post.channel?.cid
				? { uri: post.channel.uri, cid: post.channel.cid, name: post.channel.name }
				: undefined;
		const restored = restorePostEditState(post.text, post.facets, editOriginalChannel);
		editText = restored.text;
		editMentions = restored.mentions;
		editChannels = restored.channels;
		editChannelWasTagged = restored.channels.length > 0;
		editEmojis = restored.emojis;
		editImageProcessing = false;
		editImages = (post.images ?? []).map((image, sourceIndex) => ({
			kind: 'existing',
			id: `${post.cid}-${sourceIndex}`,
			sourceIndex,
			previewUrl: image.url,
			alt: image.alt,
			contentWarning: image.contentWarning,
			aspectRatio: image.aspectRatio,
		}));
		editing = true;
	}
	function cancelEdit() {
		editing = false;
		editText = '';
		editEmojis = [];
		editMentions = [];
		editChannels = [];
		editOriginalChannel = undefined;
		editChannelWasTagged = false;
		editImages = [];
		editImageProcessing = false;
		editError = '';
	}
	/**
	 * 投稿の編集・削除に standard.site の記事を追従させる。
	 * 権限が無い／記事化していない場合は黙って何もしない（Nagi 側の操作は成立している）。
	 */
	async function syncStandardSiteDocument(
		rkey: string,
		text?: string,
		facets?: PostView['facets'],
	) {
		try {
			if (!(await hasStandardSiteScope())) return;
			if (post.cwRestricted) {
				await deleteStandardSiteDocument(rkey);
				return;
			}
			if (text === undefined) {
				await deleteStandardSiteDocument(rkey);
				return;
			}
			// タイトルは本文先頭の見出しから引き直す。無ければ既存のタイトルを残す。
			await updateStandardSiteDocument(rkey, {
				...(extractTitle(text) ? { title: extractTitle(text) } : {}),
				markdown: text,
				tags: tagsFromFacets(facets ?? []),
			});
		} catch {
			// 記事側の同期失敗で Nagi の編集・削除を巻き戻すことはしない。
		}
	}

	async function submitEdit() {
		const match = /^at:\/\/[^/]+\/(com\.suibari\.nagi\.post)\/([^/]+)$/.exec(post.uri);
		if (!editHasContent || !editContentWarningValid || editImageProcessing || editBusy || !$session)
			return;
		if (!match) {
			editError = m.editPostFailed();
			return;
		}
		// サジェストから選び直したチャンネルが最優先。選択が無いときは、元がタグ由来の
		// 所属なら「タグを消した＝CH から外す」、そうでなければ（CH ページからの投稿）保持する。
		const selectedChannel = validChannelSelections(editText, editChannels)[0];
		const nextChannel = selectedChannel
			? { uri: selectedChannel.uri, cid: selectedChannel.cid, name: selectedChannel.name }
			: editChannelWasTagged
				? undefined
				: editOriginalChannel;
		const draft = preparePostDraft(
			editText,
			undefined,
			undefined,
			[],
			[],
			editMentions,
			editChannels,
			editEmojis,
			false,
			nextChannel ? { uri: nextChannel.uri, cid: nextChannel.cid } : undefined,
		);
		if (
			!post.cwRestricted &&
			(hasContentWarning(draft.text) || editImages.some((image) => image.contentWarning))
		) {
			editError = m.contentWarningEditForbidden();
			return;
		}
		editBusy = true;
		editError = '';
		try {
			// applyChannel: 返信では常に nextChannel が undefined になるため、旧クライアントが
			// 複製した channel が残っていればこの編集で落ちる（ルート所有への正規化）。
			const result = await updatePost(match[2], draft, editImages, { applyChannel: true });
			// 楽観反映: このカードの本文/facets/画像を差し替え「編集済み」を立てる。AppView が
			// putRecord を取り込むと同じ内容へ収束するため、即時 refresh は呼ばない
			// （取り込み前は旧本文が返り楽観反映を打ち消してしまうため）。
			post.text = draft.text;
			post.facets = draft.facets as PostView['facets'];
			const parsedContentWarning = parseContentWarning(draft.text);
			post.contentWarning =
				parsedContentWarning.status === 'valid' ? parsedContentWarning.range : undefined;
			post.langs = draft.langs;
			post.images = result.imageViews?.length ? result.imageViews : undefined;
			post.edited = true;
			// 返信では所属を触らないので、楽観反映もルート（=非返信）のときだけ行う。
			// 配下の返信のバッジは AppView がルートから配り直すので取り込み後に揃う。
			if (!post.reply) {
				post.channel = nextChannel
					? { uri: nextChannel.uri, cid: nextChannel.cid, name: nextChannel.name }
					: undefined;
				if (!nextChannel) post.channelOnly = undefined;
			}
			editing = false;
			editText = '';
			editMentions = [];
			editChannels = [];
			editOriginalChannel = undefined;
			editChannelWasTagged = false;
			editEmojis = [];
			editImages = [];
			editImageProcessing = false;
			// standard.site の記事にしてある投稿なら本文を追従させる。記事化していない
			// 投稿では何も起きない（編集をきっかけに勝手に公開はしない）。
			void syncStandardSiteDocument(match[2], draft.text, draft.facets);
		} catch (error) {
			editError = error instanceof Error ? error.message : m.editPostFailed();
		} finally {
			editBusy = false;
		}
	}
	async function submitPost() {
		if (
			!composeMode ||
			(!composeText.trim() && !attachments.length && !linkCards.length) ||
			posting ||
			!composeContentWarningValid ||
			!$session
		)
			return;
		const mode = composeMode;
		const subject = { uri: post.uri, cid: post.cid };
		// ネスト返信でも最初のルートを維持することで、公開範囲を含むスレッド設定を
		// 途中の返信が上書きしないようにする。引用は新しいスレッドなので継承しない。
		const reply =
			mode === 'reply' ? { root: post.reply?.root ?? subject, parent: subject } : undefined;
		// 所属チャンネルはこっそりと同じくスレッドルートだけが所有する。返信レコードへは
		// 複製せず、AppView が reply.root から解決して CH TL に並べる（返信単位で所属を
		// 持てるように見せない）。引用は新しいスレッドなので引用元の CH には入れない。
		const selectedChannel =
			mode === 'quote' ? validChannelSelections(composeText, channels)[0] : undefined;
		const targetChannel = selectedChannel
			? { uri: selectedChannel.uri, cid: selectedChannel.cid }
			: undefined;
		const draft = preparePostDraft(
			composeText,
			reply,
			mode === 'quote' ? subject : undefined,
			attachments,
			linkCards,
			mentions,
			mode === 'quote' ? channels : [],
			emojis,
			// こっそりはスレッドルートだけが所有するため、返信レコードへ複製しない。
			false,
			targetChannel,
		);
		const optimisticId = optimisticPosts.add(draft, $session.did, {
			...(mode === 'reply' ? { replyParent: post } : {}),
			...(mode === 'quote' ? { quote: post } : {}),
			// 楽観表示のバッジだけは返信でも出す（レコードには持たないが、AppView は
			// ルート由来で channel_uri を埋めるので取り込み後も同じ見え方に収束する）。
			...(mode === 'reply' && post.channel
				? { channel: post.channel }
				: selectedChannel
					? {
							channel: {
								uri: selectedChannel.uri,
								cid: selectedChannel.cid,
								name: selectedChannel.name,
							},
						}
					: {}),
			threadKossori:
				mode === 'reply' ? Boolean(post.threadKossori ?? post.kossori ?? post.channelOnly) : false,
		});
		// 楽観カード →（サーバー確定後）本物のカード、と2段階で入れ替わるので、追従先は
		// postFollow に預けて描画のたびに引き直してもらう。ここで一度寄せるだけでは、
		// 差し替わった先（会話カードの中の自分の返信）を見失う。
		postFollow.begin(optimisticId, {
			...(mode === 'reply' ? { threadRootUri: reply!.root.uri } : {}),
		});
		posting = true;
		postError = '';
		composeText = '';
		attachments = [];
		linkCards = [];
		mentions = [];
		channels = [];
		emojis = [];
		composeMode = undefined;
		try {
			// 返信・引用はNagi内の投稿文脈を参照するため、Blueskyへはクロスポストしない。
			const response = await createPost(draft);
			optimisticPosts.markCreated(optimisticId, response.data);
			// 画面に出せない投稿（検索タブなど）では、postFollow が導線へ切り替える。
			postFollow.settle(response.data.uri, postHref(response.data.uri));
			await ensureRecord(response.data.uri, response.data.cid).catch(() => undefined);
			await Promise.resolve(onposted?.()).catch(() => undefined);
		} catch (error) {
			optimisticPosts.remove(optimisticId);
			postFollow.fail();
			postError = error instanceof Error ? error.message : m.postFailed();
			await tick();
			scrollToElement(postRow);
		} finally {
			posting = false;
		}
	}
	async function removePost() {
		if (deleting) return;
		const match = /^at:\/\/[^/]+\/(com\.suibari\.nagi\.post)\/([^/]+)$/.exec(post.uri);
		if (!match) {
			deleteError = m.deletePostFailed();
			return;
		}
		deleting = true;
		deleteError = '';
		try {
			await deleteRecord(match[1], match[2]);
			// 記事にしてある投稿なら standard.site 側も消す。
			void syncStandardSiteDocument(match[2]);
			deleteOpen = false;
			ondeleted?.(post.uri);
		} catch (error) {
			deleteError = error instanceof Error ? error.message : m.deletePostFailed();
		} finally {
			deleting = false;
		}
	}
	async function toggleKossori() {
		if (kossoriBusy) return;
		const match = /^at:\/\/[^/]+\/(com\.suibari\.nagi\.post)\/([^/]+)$/.exec(post.uri);
		if (!match) {
			postError = m.kossoriToggleFailed();
			return;
		}
		kossoriBusy = true;
		postError = '';
		try {
			await setPostKossori(match[2], !post.kossori);
			await Promise.resolve(onposted?.()).catch(() => undefined);
		} catch (error) {
			postError = error instanceof Error ? error.message : m.kossoriToggleFailed();
		} finally {
			kossoriBusy = false;
		}
	}
</script>

<!-- data-post-uri は投稿後の追従スクロールの目印。カード単位ではなく発言単位で寄せる。 -->
<div
	class="post-row"
	class:mine
	class:bot={post.isBot}
	data-post-uri={post.uri}
	bind:this={postRow}
>
	<!-- ホバーで名刺、クリックで従来どおりプロフィールへ。 -->
	<AvatarLink actor={post.author} />
	<div class="bubble" class:sending={optimistic}>
		<div class="meta">
			<div class="meta-author-line">
				<a href={`/profile/${post.author.did}`}>{post.author.displayName ?? post.author.handle}</a>
				<div class="meta-badges"><ActorBadges actor={post.author} /></div>
			</div>
			{#if !hideTimestamp || post.edited}
				<div class="meta-time">
					{#if !hideTimestamp}
						<time>
							{#if displayOnly}{new Date(post.createdAt).toLocaleString(dateLocale(), {
									month: 'short',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit',
								})}{:else}<a href={threadHref}
									>{new Date(post.createdAt).toLocaleString(dateLocale(), {
										month: 'short',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									})}</a
								>{/if}</time
						>
					{/if}
					{#if post.edited}<span class="edited-badge" aria-label={m.editedBadgeAria()}
							>{m.editedBadge()}</span
						>{/if}
				</div>
			{/if}
		</div>
		{#if editing}
			<div class="inline-edit">
				{#snippet editTools()}
					<PostImageEditor
						bind:this={editImageEditor}
						bind:images={editImages}
						bind:processing={editImageProcessing}
						disabled={editBusy}
						contentWarningEnabled={Boolean(post.cwRestricted)}
					/>
				{/snippet}
				<ComposerEditor
					id={`edit-${post.cid}`}
					bind:value={editText}
					bind:mentions={editMentions}
					bind:channels={editChannels}
					bind:emojis={editEmojis}
					channelSuggestionsEnabled={!post.reply}
					placeholder={m.editPlaceholder()}
					disabled={editBusy}
					contentWarningEnabled={Boolean(post.cwRestricted)}
					onsubmit={() => void submitEdit()}
					onpaste={(event) => editImageEditor?.handlePaste(event)}
					tools={editTools}
				/>
				<div class="post-composer-foot">
					{#if editError}<span class="error" role="alert">{editError}</span>{/if}
					<button
						class="primary icon-action primary-icon"
						type="button"
						disabled={editBusy ||
							editImageProcessing ||
							!editHasContent ||
							!editContentWarningValid}
						aria-label={editBusy ? m.composerSubmitting() : m.composerSubmit()}
						title={editBusy ? m.composerSubmitting() : m.composerSubmit()}
						onclick={() => void submitEdit()}
						><Icon name={editBusy ? 'refresh' : 'send'} size={18} /></button
					>
				</div>
				{#if post.cwRestricted}<p class="cw-restricted-note">
						{m.contentWarningRestricted()}
					</p>{/if}
			</div>
		{:else}
			<TranslateToggle
				uri={post.uri}
				text={post.text}
				langs={post.langs}
				facets={post.facets}
				deleted={post.deleted}
				collapsed={!expanded}
				disabled={optimistic}
				{clampLines}
				onoverflowchange={(value) => (overflowing = value)}
			/>
			{#if overflowing || expanded}<button class="read" onclick={() => (expanded = !expanded)}
					>{expanded ? m.readLess() : m.readMore()}</button
				>{/if}
		{/if}{#if !editing && visibleImages?.length}<ImageGallery
				images={visibleImages}
				clampTall={clampTallImages}
			/>{#if imageToggleable}<button class="read" onclick={() => (showAllImages = !showAllImages)}
					>{showAllImages ? m.readLess() : m.showAllMedia()}</button
				>{/if}{/if}{#if visibleLinkCards?.length}<div class="link-cards">
				{#each visibleLinkCards as card}<LinkCard {card} />{/each}
			</div>
			{#if linkCardToggleable}<button
					class="read"
					onclick={() => (showAllLinkCards = !showAllLinkCards)}
					>{showAllLinkCards ? m.readLess() : m.showAllMedia()}</button
				>{/if}{/if}{#if post.quote?.kind === 'post'}<QuoteCard post={post.quote.post} />
		{:else if post.quote?.kind === 'news'}<NewsQuoteCard news={post.quote.news} {botActor} />{/if}
		{#if !displayOnly}{#if optimistic}
				<div class="post-sending" role="status" aria-live="polite">
					<span class="typing" aria-hidden="true"><i></i><i></i><i></i></span>
					<span>{m.postSending()}</span>
				</div>
			{:else}
				<ReactionBar
					uri={post.uri}
					cid={post.cid}
					reactions={post.reactions}
					bind:pickerOpen={reactionPickerOpen}
					pickerAnchor={reactionButton}
				/>
			{/if}{/if}
		{#if !displayOnly && !post.deleted && !optimistic}
			<div class="post-actions">
				<button
					class="ghost timeline-action"
					class:active={composeMode === 'reply'}
					type="button"
					aria-label={m.replyPost()}
					title={m.replyPost()}
					onclick={() => openComposer('reply')}><Icon name="reply" size={17} /></button
				>
				{#if post.isBot || mine}<button
						class="ghost timeline-action"
						class:active={composeMode === 'quote'}
						type="button"
						aria-label={m.quotePost()}
						title={m.quotePost()}
						onclick={() => openComposer('quote')}><Icon name="quote" size={17} /></button
					>{/if}
				<button
					bind:this={reactionButton}
					class="ghost timeline-action"
					class:active={reactionPickerOpen}
					type="button"
					aria-label={m.addReactionAria()}
					title={m.addReactionAria()}
					aria-expanded={reactionPickerOpen}
					onclick={toggleReactionPicker}
				>
					<Icon name="emojiPlus" size={18} />
				</button>
				{#if hasSecondaryActions}
					<div class="post-action-menu-wrap">
						<button
							bind:this={actionMenuTrigger}
							class="ghost timeline-action"
							class:active={actionMenuOpen}
							type="button"
							aria-label={m.morePostActions()}
							title={m.morePostActions()}
							aria-haspopup="menu"
							aria-expanded={actionMenuOpen}
							onclick={toggleActionMenu}><Icon name="moreHorizontal" size={18} /></button
						>
						{#if actionMenuOpen}
							<div
								bind:this={actionMenu}
								class="post-action-menu"
								role="menu"
								tabindex="-1"
								aria-label={m.morePostActions()}
								onkeydown={handleActionMenuKeydown}
							>
								{#if canTranslateExternally}
									<button
										role="menuitem"
										onclick={() => runSecondaryAction(openExternalTranslation)}
									>
										<Icon name="language" size={17} />
										<span>{m.translateExternally()}</span>
									</button>
								{/if}
								{#if canPin}
									<button
										role="menuitemcheckbox"
										class:active={pinned}
										disabled={pinBusy}
										aria-checked={pinned}
										onclick={() => runSecondaryAction(() => void ontogglepin?.(post))}
									>
										<Icon name="pin" size={17} />
										<span>{pinned ? m.channelUnpinPost() : m.channelPinPost()}</span>
									</button>
								{/if}
								{#if mine}
									<button
										role="menuitem"
										class:active={editing}
										onclick={() =>
											runSecondaryAction(
												editing ? cancelEdit : startEdit,
												editing ? 'trigger' : 'editor',
											)}
									>
										<Icon name="edit" size={17} />
										<span>{editing ? m.cancel() : m.editPost()}</span>
									</button>
								{/if}
								{#if mine && topLevel}
									<button
										role="menuitemcheckbox"
										class:active={post.kossori}
										disabled={kossoriBusy}
										aria-checked={Boolean(post.kossori)}
										onclick={() => runSecondaryAction(() => void toggleKossori())}
									>
										<Icon name="hide" size={17} />
										<span>{post.kossori ? m.kossoriDisable() : m.kossoriEnable()}</span>
									</button>
								{/if}
								{#if mine}
									<button
										class="danger"
										role="menuitem"
										onclick={() =>
											runSecondaryAction(() => {
												deleteError = '';
												deleteOpen = true;
											}, 'none')}
									>
										<Icon name="trash" size={17} />
										<span>{m.deletePost()}</span>
									</button>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
		{#if postError && !composeMode}<p class="error" role="alert">{postError}</p>{/if}
	</div>
</div>
{#if composeMode && !displayOnly}
	<!-- リプライ／引用も「自分のアバター＋吹き出し」で、投稿後のカードと同じ並びに見せる -->
	<InlinePostComposer
		id={`compose-${post.cid}`}
		label={composeMode === 'reply' ? m.replyComposerLabel() : m.quoteComposerLabel()}
		placeholder={composeMode === 'reply' ? m.replyPlaceholder() : m.quotePlaceholder()}
		bind:text={composeText}
		bind:mentions
		bind:channels
		bind:emojis
		channelSuggestionsEnabled={composeMode === 'quote'}
		bind:attachments
		bind:linkCards
		busy={posting}
		error={postError}
		scope={post.kossori ? 'kossori' : 'feed'}
		channelName={post.channel?.name}
		onsubmit={() => void submitPost()}
		oncancel={cancelComposer}
	/>
{/if}
{#if deleteOpen}
	<PostDeleteDialog
		busy={deleting}
		error={deleteError}
		onconfirm={() => void removePost()}
		oncancel={() => (deleteOpen = false)}
	/>
{/if}

<style>
	.bubble.sending {
		border-style: dashed;
	}
	.bubble.sending::before,
	.bubble.sending::after {
		display: none;
	}
	.post-sending {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.45rem;
		color: var(--text-muted);
		font-size: 0.8125rem;
	}
	.edited-badge {
		color: var(--text-mute);
		font-size: 11px;
	}
	.inline-edit {
		margin-top: 0.35rem;
	}
	.cw-restricted-note {
		margin: 7px 0 0;
		color: var(--text-muted);
		font-size: 0.75rem;
	}
</style>
