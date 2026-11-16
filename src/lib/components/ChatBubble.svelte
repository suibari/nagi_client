<script lang="ts">
	import type { ActorView, PostView } from '$lib/api/types';
	import type { BookmarkSubjectType } from '$lib/api/types';
	import ReactionBar from './ReactionBar.svelte';
	import AvatarLink from './AvatarLink.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { privateList } from '$lib/private-list/private-list.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import TranslateToggle from './TranslateToggle.svelte';
	import Icon from './shell/Icon.svelte';
	import QuoteCard from './QuoteCard.svelte';
	import NewsQuoteCard from './NewsQuoteCard.svelte';
	import RadioQuoteCard from '$lib/radio/RadioQuoteCard.svelte';
	import ActorBadges from './ActorBadges.svelte';
	import PostDeleteDialog from './PostDeleteDialog.svelte';
	import ReportDialog from './ReportDialog.svelte';
	import { ownCrosspost } from '$lib/crosspost/target.svelte';
	import { deletePost, preparePostDraft, updatePost } from '$lib/atproto/records';
	import { isAppviewOwnedUri } from '$lib/post/appview-uri';
	import ImageGallery from './ImageGallery.svelte';
	import TrilinesCard from './TrilinesCard.svelte';
	import { deleteTrilinesDiary } from '$lib/trilines/records';
	import VideoPlayer from './VideoPlayer.svelte';
	import { MAX_IMAGE_COUNT, type PostEditImage } from '$lib/images';
	import type { LinkCardDraft } from '$lib/atproto/records';
	import LinkCard from './LinkCard.svelte';
	import { articleMedia } from '$lib/blog/articleMedia';
	import { APPVIEW_URL } from '$lib/api/appview';
	import ComposerEditor from './ComposerEditor.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import {
		httpUrl,
		restorePostEditState,
		type EmojiSelection,
		type MentionSelection,
	} from '$lib/atproto/facets';
	import {
		languagePreferences,
		normalizeSupportedLanguage,
	} from '$lib/i18n/languagePreferences.svelte';
	import { buildExternalTranslationUrl } from '$lib/i18n/translationProviders';
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { postPageHref } from '$lib/feed/post-follow.svelte';
	import PostImageEditor from './PostImageEditor.svelte';
	import PostVideoEditor, { type ExistingVideoEdit } from './PostVideoEditor.svelte';
	import type { VideoAttachment } from '$lib/video-attachment.svelte';
	import type { PostVideoEdit } from '$lib/atproto/records';
	import LinkCardEditor from './LinkCardEditor.svelte';
	import {
		hasContentWarning,
		parseContentWarning,
		validContentWarningSyntax,
	} from '$lib/atproto/contentWarning';
	import BookmarkActions from './BookmarkActions.svelte';
	import ActionMenu from './ActionMenu.svelte';
	import ContentWarningMask from './ContentWarningMask.svelte';
	import { contentModerationDisplay } from '$lib/moderation/preferences.svelte';
	import { automaticModerationReasons } from '$lib/moderation/reasons';
	import { trackPostSeen } from '$lib/post/seen';
	import PostUnavailableNotice from './PostUnavailableNotice.svelte';
	let {
		post = $bindable(),
		botActor,
		ondeleted,
		onposted,
		displayOnly = false,
		managementOnly = false,
		editing = $bindable(false),
		editBusy = $bindable(false),
		hideTimestamp = false,
		clampLines,
		maxImages,
		maxLinkCards,
		collapsible = true,
		bookmarkSubject,
		localGuest = false,
		translatedText,
		permalinkHref,
	}: {
		post: PostView;
		/** ニュース引用ブロックの botたんヘッダーに使う実データ。 */
		botActor?: ActorView;
		ondeleted?: (uri: string) => void;
		onposted?: () => void | Promise<void>;
		/** ニュースコメント等、投稿と同じ見た目だけを使う読み取り専用表示。 */
		displayOnly?: boolean;
		/** ブログ本文を別に表示するページ向けの編集・削除 UI。 */
		managementOnly?: boolean;
		editing?: boolean;
		editBusy?: boolean;
		/** APIのローリング更新などで信頼できる日時が無い読み取り専用表示に使う。 */
		hideTimestamp?: boolean;
		/** 省略時の表示行数。未指定時は CSS の 6 行。 */
		clampLines?: number;
		/** 画像の初期表示枚数上限。未指定時は制限なし。 */
		maxImages?: number;
		/** リンクカードの初期表示枚数上限。未指定時は制限なし。 */
		maxLinkCards?: number;
		/** falseなら本文を最初から全表示し、「続きを読む」を出さない。 */
		collapsible?: boolean;
		/** 読み取り専用の実体（日記）だけが明示する。合成コメントには渡さない。 */
		bookmarkSubject?: { kind: BookmarkSubjectType; uri: string };
		/** 端末だけにある未サインイン投稿。プロフィール導線を作らず専用アイコンを使う。 */
		localGuest?: boolean;
		/** AppViewを使わない開発プレビュー向けの訳文。 */
		translatedText?: string;
		/** 記事内コメントなど、投稿時刻のリンク先を現在のページに保つ。 */
		permalinkHref?: string;
	} = $props();
	let expanded = $state(false);
	let overflowing = $state(false);
	let showAllImages = $state(false);
	let showAllLinkCards = $state(false);
	let deleteOpen = $state(false);
	/** 運営に伝えるダイアログ。'reaction' は自分の投稿に付いたリアクションを伝えるとき。 */
	let reportOpen = $state<'post' | 'reaction'>();
	let deleting = $state(false);
	let deleteError = $state('');
	// 編集は返信/引用と違い、下に新しい吹き出しを出さず、この投稿の吹き出し内でその場編集する。
	// ブログは執筆ページで編集する（BLOG-07）ので、ここに来るのは通常の投稿だけ。
	let editText = $state('');
	let editMentions = $state<MentionSelection[]>([]);
	let editEmojis = $state<EmojiSelection[]>([]);
	let editImages = $state<PostEditImage[]>([]);
	// 編集前から付いていた動画（外すと undefined）と、編集で付け直した動画。
	let editExistingVideo = $state<ExistingVideoEdit>();
	let editNewVideo = $state<VideoAttachment>();
	const editVideoPending = $derived(Boolean(editNewVideo && !editNewVideo.ready));
	/** 編集中の画像・動画をまとめてぼかすか。CWメニューの1項目で、全件へ揃えて保存する。 */
	let editMediaWarning = $state(false);
	const editHasMedia = $derived(Boolean(editImages.length || editExistingVideo || editNewVideo));
	$effect(() => {
		if (!editing) return;
		const flag = editMediaWarning;
		if (editImages.some((image) => Boolean(image.contentWarning) !== flag))
			editImages = editImages.map((image) => ({ ...image, contentWarning: flag || undefined }));
		if (editExistingVideo && Boolean(editExistingVideo.contentWarning) !== flag)
			editExistingVideo = { ...editExistingVideo, contentWarning: flag || undefined };
		if (editNewVideo && editNewVideo.contentWarning !== flag) editNewVideo.contentWarning = flag;
	});
	let editLinkCards = $state<LinkCardDraft[]>([]);
	let editDismissedUrls = $state<string[]>([]);
	let editImageProcessing = $state(false);
	let editError = $state('');
	let editImageEditor = $state<{ handlePaste: (event: ClipboardEvent) => void }>();
	let editLinkCardLoading = $state<string[]>([]);
	let reactionPickerOpen = $state(false);
	let contentRevealed = $state(false);
	let reactionButton = $state<HTMLButtonElement>();
	let postRow: HTMLDivElement;
	let mine = $derived(localGuest || $session?.did === post.author.did);
	let isBlogPost = $derived(post.article || post.uri.includes('/site.standard.document/'));
	/**
	 * ブログとして書かれた投稿は記事ページと同じ見た目にする。本文の行に置いた画像・リンクカードは
	 * その位置に出し、残りの画像の先頭を本文の上のヘッダー、それ以外を本文の後ろに出す。
	 * 先頭が見出しなだけの通常投稿と取り違えないよう、判定は post.article（と standard.site の
	 * document）だけを見る。
	 */
	let blogMedia = $derived(
		isBlogPost && !editing
			? articleMedia(post.text, post.images, post.linkCards, [
					new URL(APPVIEW_URL, 'http://localhost').origin,
				])
			: undefined,
	);
	let articleHeader = $derived(blogMedia?.cover);
	// 自分のクロスポストにだけ付ける目印。返信・引用を Bluesky にも続けられることが分かるように。
	// 他人のクロスポストには付けない（AppView も作者本人にしか参照を返さない）。
	let showsCrosspostLabel = $derived(Boolean(ownCrosspost(post, $session?.did)) && !isBlogPost);
	// 3行日記は行ごとに画像を添えるので、本文下のギャラリーには出さない。
	let trilines = $derived(post.trilines ? { ...post, trilines: post.trilines } : undefined);
	// ヘッダーや本文に出した画像は本文下のギャラリーから外す（同じ画像を二度出さない）。
	let bodyImages = $derived(blogMedia ? blogMedia.looseImages : post.images);
	let bodyLinkCards = $derived(blogMedia ? blogMedia.looseLinkCards : post.linkCards);
	const resolveAsset = (url: string) => (url.startsWith('/') ? APPVIEW_URL + url : url);
	let hasTallImage = $derived(
		Boolean(
			bodyImages?.some((img) => !img.aspectRatio || img.aspectRatio.height > img.aspectRatio.width),
		),
	);
	let visibleImages = $derived(
		maxImages && !showAllImages ? bodyImages?.slice(0, maxImages) : bodyImages,
	);
	let imageToggleable = $derived(
		Boolean(maxImages && bodyImages && (bodyImages.length > maxImages || hasTallImage)),
	);
	let clampTallImages = $derived(Boolean(maxImages && !showAllImages && hasTallImage));
	let visibleLinkCards = $derived(
		maxLinkCards && !showAllLinkCards ? bodyLinkCards?.slice(0, maxLinkCards) : bodyLinkCards,
	);
	let linkCardToggleable = $derived(
		Boolean(maxLinkCards && bodyLinkCards && bodyLinkCards.length > maxLinkCards),
	);
	let moderationDisplay = $derived(contentModerationDisplay(post));
	let moderationWarningText = $derived(
		moderationDisplay.reason === 'automatic'
			? m.moderationAutomaticWarning()
			: moderationDisplay.reason === 'selfNsfw'
				? m.moderationSelfNsfwWarning()
				: m.moderationSelfAiWarning(),
	);
	let moderationReasons = $derived(
		moderationDisplay.reason === 'automatic'
			? automaticModerationReasons(post.moderationLabels)
			: [],
	);
	let topLevel = $derived(!post.reply);
	/**
	 * この投稿への返信がこっそりスレッドに入るか。
	 *
	 * こっそりは「共有TLに出すかどうか」ではなく「どこに保存するか」を決めるので、
	 * 返信レコードにも必ず引き継ぐ必要がある。引き継ぎ損ねると、こっそりスレッドへの
	 * 返信だけが PDS の公開レコードとして書き出されてしまう。
	 *
	 * 判定はスレッドルートの URI で行う。threadKossori は CH 限定と合流していて、
	 * 保存先の判断には使えない（CH 限定はこっそりではない）。ルートが PDS 上にある
	 * 移行前のこっそり投稿だけは URI から分からないので、直接の返信のときに post.kossori で補う。
	 */
	let replyIsKossori = $derived(
		isAppviewOwnedUri(post.reply?.root.uri ?? post.uri) || Boolean(post.kossori),
	);
	let optimistic = $derived(Boolean(post.optimisticState));
	// リンクは URI から組む。こっそり投稿の URI は著者ではなく AppView の DID 配下なので、
	// author.did から組むとスレッドを開けない。
	let threadHref = $derived(permalinkHref ?? postPageHref(post));
	// 外国語の投稿にだけ「選択したプロバイダーで翻訳」ボタンを出す。
	let translateSourceLang = $derived(normalizeSupportedLanguage(post.langs?.[0]));
	let canTranslateExternally = $derived(
		Boolean(post.text?.trim()) &&
			Boolean(translateSourceLang) &&
			translateSourceLang !== languagePreferences.translationLanguage,
	);
	// 他人の投稿（botたんを含む）は運営に伝えられる。自分の投稿は、他人が付けたリアクションを伝えられる。
	// 端末保存のゲスト投稿は運営の手が届かないので出さない。
	let canReportPost = $derived(Boolean($session) && !mine && !managementOnly);
	let canReportReactions = $derived(
		Boolean($session) &&
			!localGuest &&
			$session?.did === post.author.did &&
			(post.reactions ?? []).some((reaction) =>
				reaction.reactors.some((actor) => actor.did !== $session?.did),
			),
	);
	let hasSecondaryActions = $derived(
		canTranslateExternally || mine || canReportPost || canReportReactions,
	);
	let editHasContent = $derived(
		Boolean(
			editText.trim() ||
			editImages.length ||
			editExistingVideo ||
			editNewVideo ||
			editLinkCards.length ||
			post.quote,
		),
	);
	let editContentWarningValid = $derived(validContentWarningSyntax(editText));
	function runSecondaryAction(
		closeMenu: (restoreFocus?: boolean) => void,
		action: () => void,
		focusAfter: 'trigger' | 'editor' | 'none' = 'trigger',
	) {
		closeMenu(focusAfter === 'trigger');
		action();
		void tick().then(() => {
			if (focusAfter === 'editor')
				postRow
					?.querySelector<HTMLElement>('.composer-input .cm-content, textarea.composer-input')
					?.focus();
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
		const defaultScope = replyIsKossori ? 'kossori' : 'feed';
		if (mode === 'reply') {
			composerHost.openReply(post, defaultScope);
		} else {
			composerHost.openQuote(post, defaultScope);
		}
	}
	function toggleReactionPicker() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		reactionPickerOpen = !reactionPickerOpen;
	}
	/** ブログは執筆ページで編集する（BLOG-07）。 */
	function openBlogEditor() {
		void goto(`/write/${post.uri.slice(post.uri.lastIndexOf('/') + 1)}`);
	}
	function startEdit() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		editError = '';
		const restored = restorePostEditState(post.text, post.facets);
		editText = restored.text;
		editMentions = restored.mentions;
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
		editLinkCards = (post.linkCards ?? []).map((card, sourceIndex) => ({
			id: `${post.cid}-link-${sourceIndex}`,
			sourceIndex,
			uri: card.uri,
			title: card.title,
			description: card.description,
			previewUrl: card.thumb,
		}));
		editExistingVideo = post.video
			? {
					thumbnail: post.video.thumbnail,
					alt: post.video.alt ?? '',
					...(post.video.contentWarning ? { contentWarning: true } : {}),
				}
			: undefined;
		editNewVideo = undefined;
		// 画像ごとにCWを選べた頃の投稿は、1枚でも付いていれば全件をぼかす側へ寄せる。
		editMediaWarning = Boolean(
			post.images?.some((image) => image.contentWarning) || post.video?.contentWarning,
		);
		editDismissedUrls = [];
		editing = true;
	}
	function cancelEdit() {
		if (editBusy) return;
		editing = false;
		editText = '';
		editEmojis = [];
		editMentions = [];
		editImages = [];
		editExistingVideo = undefined;
		editNewVideo = undefined;
		editLinkCards = [];
		editDismissedUrls = [];
		editImageProcessing = false;
		editError = '';
	}
	function handleEditKeydown(event: KeyboardEvent) {
		// メンション等の候補が開いている場合、Esc はまず候補を閉じるために使われる。
		if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing || editBusy) return;
		event.preventDefault();
		cancelEdit();
	}
	function editEscape(node: HTMLElement) {
		node.addEventListener('keydown', handleEditKeydown);
		return {
			destroy: () => node.removeEventListener('keydown', handleEditKeydown),
		};
	}
	async function submitEdit() {
		const match = /^at:\/\/[^/]+\/(com\.suibari\.nagi\.post)\/([^/]+)$/.exec(post.uri);
		if (
			!editHasContent ||
			!editContentWarningValid ||
			editImageProcessing ||
			editVideoPending ||
			editBusy ||
			!$session
		)
			return;
		if (!match) {
			editError = m.editPostFailed();
			return;
		}
		const savedImages = editImages;
		const draft = preparePostDraft(
			editText,
			undefined,
			undefined,
			[],
			editLinkCards,
			editMentions,
			editEmojis,
		);
		if (
			!post.cwRestricted &&
			(hasContentWarning(draft.text) ||
				editImages.some((image) => image.contentWarning) ||
				editExistingVideo?.contentWarning ||
				editNewVideo?.contentWarning)
		) {
			editError = m.contentWarningEditForbidden();
			return;
		}
		const newVideoRecord = editNewVideo?.toRecord();
		const videoEdit: PostVideoEdit | undefined = newVideoRecord
			? { kind: 'new', record: newVideoRecord, contentWarning: newVideoRecord.contentWarning }
			: editExistingVideo
				? {
						kind: 'keep',
						alt: editExistingVideo.alt,
						contentWarning: editExistingVideo.contentWarning,
					}
				: post.video
					? { kind: 'remove' }
					: undefined;
		editBusy = true;
		editError = '';
		try {
			// 旧チャンネル投稿の channel は updatePost が元レコードから引き継ぐ。
			const result = await updatePost(match[2], draft, savedImages, {
				collection: match[1],
				...(videoEdit ? { video: videoEdit } : {}),
			});
			// 楽観反映: このカードの本文/facets/画像を差し替え「編集済み」を立てる。AppView が
			// putRecord を取り込むと同じ内容へ収束するため、即時 refresh は呼ばない
			// （取り込み前は旧本文が返り楽観反映を打ち消してしまうため）。
			post.text = draft.text;
			post.cid = result.response.data.cid;
			post.facets = draft.facets as PostView['facets'];
			const parsedContentWarning = parseContentWarning(draft.text);
			post.contentWarning =
				parsedContentWarning.status === 'valid' ? parsedContentWarning.range : undefined;
			post.langs = draft.langs;
			post.images = result.imageViews?.length ? result.imageViews : undefined;
			if (result.videoView !== undefined) post.video = result.videoView ?? undefined;
			post.linkCards = result.linkCardViews.length ? result.linkCardViews : undefined;
			post.edited = true;
			editing = false;
			editText = '';
			editMentions = [];
			editEmojis = [];
			editImages = [];
			editExistingVideo = undefined;
			editNewVideo = undefined;
			editLinkCards = [];
			editDismissedUrls = [];
			editImageProcessing = false;
		} catch (error) {
			editError = error instanceof Error ? error.message : m.editPostFailed();
		} finally {
			editBusy = false;
		}
	}
	async function removePost() {
		if (deleting) return;
		deleting = true;
		deleteError = '';
		try {
			if (trilines) {
				// 3行日記の正本は TriLinesAt と共有の日記レコード。Nagi の投稿ではない。
				await deleteTrilinesDiary(post.uri, post.cid);
				deleteOpen = false;
				ondeleted?.(post.uri);
				return;
			}
			// こっそりは PDS に正本が無いので AppView 側の手続きへ振り分ける（deletePost が判定）。
			await deletePost(post.uri, post.cid);
			deleteOpen = false;
			ondeleted?.(post.uri);
		} catch (error) {
			deleteError = error instanceof Error ? error.message : m.deletePostFailed();
		} finally {
			deleting = false;
		}
	}
</script>

<!-- data-post-uri は投稿後の追従スクロールの目印。カード単位ではなく発言単位で寄せる。 -->
<div
	class="post-row"
	class:management-only={managementOnly}
	class:article={isBlogPost}
	class:mine
	class:bot={post.isBot}
	class:list-member={!mine && !post.isBot && privateList.has(post.author.did)}
	class:moderation-hidden={moderationDisplay.hidden}
	data-post-uri={post.uri}
	bind:this={postRow}
	use:trackPostSeen={{
		uri: post.uri,
		viewerDid: $session?.did,
		disabled: optimistic || localGuest,
	}}
>
	{#if !managementOnly}
		{#if localGuest}
			<span class="guest-avatar" aria-hidden="true"><Icon name="hide" size={22} /></span>
		{:else}
			<!-- ホバーで名刺、クリックで従来どおりプロフィールへ。 -->
			<AvatarLink actor={post.author} />
		{/if}
	{/if}
	<div
		class="bubble"
		class:sending={optimistic}
		class:bubble-sending={post.optimisticState === 'sending'}
		class:bubble-created={post.optimisticState === 'indexing'}
	>
		{#if !managementOnly}
			{#if articleHeader}
				<div class="post-article-cover">
					<ContentWarningMask
						kind="content"
						active={moderationDisplay.warn}
						bind:revealed={contentRevealed}
						title={moderationWarningText}
						reasons={moderationReasons}
					>
						<img
							class="post-header-image"
							src={resolveAsset(articleHeader.url)}
							alt={articleHeader.alt}
							style={articleHeader.aspectRatio
								? `aspect-ratio: ${articleHeader.aspectRatio.width} / ${articleHeader.aspectRatio.height}`
								: undefined}
						/>
					</ContentWarningMask>
				</div>
			{/if}
			<div class="meta">
				<div class="meta-author-line">
					{#if localGuest}
						<span>{m.guestPostAuthor()}</span>
					{:else}
						<a href={`/profile/${post.author.did}`}
							>{post.author.displayName ?? post.author.handle}</a
						>
						<div class="meta-badges"><ActorBadges actor={post.author} /></div>
					{/if}
				</div>
				{#if !hideTimestamp || post.edited || isBlogPost || showsCrosspostLabel}
					<div class="meta-time">
						<!-- ブログの印は日時と同じ控えめな行に置く。カバー画像の上に札を重ねない。 -->
						{#if isBlogPost}<span class="post-blog-label"
								><Icon name="newspaper" size={14} />{m.blogTitle()}</span
							>{/if}
						{#if trilines}<span class="post-blog-label"
								><Icon name="edit" size={14} />{m.trilinesLabel()}</span
							>{/if}
						{#if showsCrosspostLabel}<span class="post-blog-label" title={m.crosspostLabelHint()}
								><Icon name="bluesky" size={14} />{m.crosspostLabel()}</span
							>{/if}
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
		{/if}
		<ContentWarningMask
			kind="content"
			active={moderationDisplay.warn}
			bind:revealed={contentRevealed}
			title={moderationWarningText}
			reasons={moderationReasons}
		>
			{#if editing}
				<div class="inline-edit" use:editEscape>
					{#snippet editTools()}
						<!-- 画像ボタンから動画も選べる。こっそりは動画を持てないので画像だけ。 -->
						<PostImageEditor
							bind:this={editImageEditor}
							bind:images={editImages}
							bind:video={editNewVideo}
							allowVideo={!isAppviewOwnedUri(post.uri)}
							maxCount={MAX_IMAGE_COUNT}
							hasVideo={Boolean(editExistingVideo || editNewVideo)}
							bind:processing={editImageProcessing}
							disabled={editBusy}
						/>
					{/snippet}
					<ComposerEditor
						mode="rich"
						id={`edit-${post.cid}`}
						bind:value={editText}
						bind:mentions={editMentions}
						bind:emojis={editEmojis}
						placeholder={m.editPlaceholder()}
						disabled={editBusy}
						contentWarningEnabled={Boolean(post.cwRestricted)}
						mediaWarningEnabled
						bind:mediaWarning={editMediaWarning}
						hasMedia={editHasMedia}
						onsubmit={() => void submitEdit()}
						onpaste={(event) => editImageEditor?.handlePaste(event)}
						tools={editTools}
					/>
					<PostVideoEditor
						bind:existing={editExistingVideo}
						bind:video={editNewVideo}
						disabled={editBusy}
					/>
					<LinkCardEditor
						text={editText}
						bind:cards={editLinkCards}
						bind:dismissedUrls={editDismissedUrls}
						bind:loading={editLinkCardLoading}
						disabled={editBusy}
					/>
					<div class="post-composer-foot">
						{#if editError}<span class="error" role="alert">{editError}</span>{/if}
						<button
							class="ghost icon-action"
							type="button"
							disabled={editBusy}
							aria-label={m.cancel()}
							title={m.cancel()}
							onclick={cancelEdit}><Icon name="cancel" size={18} /></button
						>
						<button
							class="primary icon-action primary-icon"
							type="button"
							disabled={editBusy ||
								editImageProcessing ||
								editVideoPending ||
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
			{:else if !managementOnly && post.deleted}
				<PostUnavailableNotice reason={post.unavailableReason} authorDid={post.author.did} />
			{:else if !managementOnly && trilines}
				<TrilinesCard
					post={trilines}
					clampTall={clampTallImages}
					disabled={optimistic}
					{translatedText}
				/>
			{:else if !managementOnly}
				{#snippet collapseToggle()}
					{#if collapsible && (overflowing || expanded)}<button
							class="read"
							onclick={() => (expanded = !expanded)}
							>{expanded ? m.readLess() : m.readMore()}</button
						>{/if}
				{/snippet}
				<TranslateToggle
					uri={post.uri}
					cid={post.cid}
					text={post.text}
					langs={post.langs}
					facets={post.facets}
					collapsed={collapsible && !expanded}
					disabled={optimistic}
					{clampLines}
					images={blogMedia ? post.images : undefined}
					linkCards={blogMedia ? (post.linkCards ?? []) : undefined}
					onoverflowchange={(value) => (overflowing = value)}
					{collapseToggle}
					{translatedText}
				/>
			{/if}{#if !managementOnly && !editing && !trilines && visibleImages?.length}
				<ImageGallery images={visibleImages} clampTall={clampTallImages} />
				{#if imageToggleable}<button class="read" onclick={() => (showAllImages = !showAllImages)}
						>{showAllImages ? m.readLess() : m.showAllMedia()}</button
					>{/if}{/if}{#if !managementOnly && !editing && post.video}<VideoPlayer
					video={post.video}
				/>{/if}{#if !managementOnly && visibleLinkCards?.length}<div class="link-cards">
					{#each visibleLinkCards as card}<LinkCard {card} />{/each}
				</div>
				{#if linkCardToggleable}<button
						class="read"
						onclick={() => (showAllLinkCards = !showAllLinkCards)}
						>{showAllLinkCards ? m.readLess() : m.showAllMedia()}</button
					>{/if}{/if}{#if !managementOnly && post.quote?.kind === 'post'}<QuoteCard
					post={post.quote.post}
				/>
			{:else if !managementOnly && post.quote?.kind === 'news'}<NewsQuoteCard
					news={post.quote.news}
					{botActor}
				/>
			{:else if !managementOnly && post.quote?.kind === 'radio'}<RadioQuoteCard
					radio={post.quote.radio}
					{botActor}
				/>{/if}
		</ContentWarningMask>
		{#if !managementOnly && !displayOnly}{#if post.optimisticState === 'sending'}
				<div class="post-sending" role="status" aria-live="polite">
					<span class="typing" aria-hidden="true"><i></i><i></i><i></i></span>
					<span>{m.postSending()}</span>
				</div>
			{:else if post.optimisticState === 'indexing'}
				<div class="post-sending post-created" role="status" aria-live="polite">
					<span class="post-created-check" aria-hidden="true">✓</span>
					<span>{m.postCreated()}</span>
				</div>
			{:else}
				<ReactionBar
					uri={post.uri}
					cid={post.cid}
					reactions={post.reactions}
					showReactors={mine}
					bind:pickerOpen={reactionPickerOpen}
					pickerAnchor={reactionButton}
				/>
			{/if}{/if}
		{#if !displayOnly && !post.deleted && !optimistic}
			<div class="post-actions">
				{#if !managementOnly}
					<button
						class="ghost timeline-action"
						class:active={composerHost.open && composerHost.replyTarget?.post.cid === post.cid}
						type="button"
						aria-label={m.replyPost()}
						title={m.replyPost()}
						onclick={() => openComposer('reply')}><Icon name="reply" size={17} /></button
					>
					{#if post.isBot || mine}<button
							class="ghost timeline-action"
							class:active={composerHost.open && composerHost.quoteTarget?.post?.cid === post.cid}
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
					<BookmarkActions subject={{ kind: 'post', uri: post.uri }} />
				{/if}
				{#if hasSecondaryActions}
					<ActionMenu
						label={m.morePostActions()}
						icon="moreHorizontal"
						align={mine ? 'start' : 'end'}
					>
						{#snippet menu(closeMenu)}
							{#if !managementOnly && canTranslateExternally}
								<button
									role="menuitem"
									onclick={() => runSecondaryAction(closeMenu, openExternalTranslation)}
								>
									<Icon name="language" size={17} />
									<span>{m.translateExternally()}</span>
								</button>
							{/if}
							{#if mine}
								<button
									role="menuitem"
									class:active={editing}
									onclick={() =>
										trilines
											? runSecondaryAction(
													closeMenu,
													() => composerHost.openTrilinesEdit(post),
													'none',
												)
											: isBlogPost
												? runSecondaryAction(closeMenu, openBlogEditor, 'none')
												: runSecondaryAction(
														closeMenu,
														editing ? cancelEdit : startEdit,
														editing ? 'trigger' : 'editor',
													)}
								>
									<Icon name="edit" size={17} />
									<span>{trilines ? m.trilinesEdit() : editing ? m.cancel() : m.editPost()}</span>
								</button>
							{/if}
							{#if mine}
								<button
									class="danger"
									role="menuitem"
									onclick={() =>
										runSecondaryAction(
											closeMenu,
											() => {
												deleteError = '';
												deleteOpen = true;
											},
											'none',
										)}
								>
									<Icon name="trash" size={17} />
									<span>{trilines ? m.trilinesDelete() : m.deletePost()}</span>
								</button>
							{/if}
							{#if canReportPost || canReportReactions}
								<button
									role="menuitem"
									onclick={() =>
										runSecondaryAction(
											closeMenu,
											() => (reportOpen = canReportPost ? 'post' : 'reaction'),
											'none',
										)}
								>
									<Icon name="flag" size={17} />
									<span
										>{canReportPost
											? post.isBot
												? m.reportMenuBot()
												: m.reportMenuPost()
											: m.reportMenuReaction()}</span
									>
								</button>
							{/if}
						{/snippet}
					</ActionMenu>
				{/if}
			</div>
		{/if}
		{#if displayOnly && bookmarkSubject && !post.deleted}
			<div class="post-actions bookmark-only-actions">
				<BookmarkActions subject={bookmarkSubject} />
			</div>
		{/if}
	</div>
</div>
{#if reportOpen}
	<ReportDialog
		{post}
		reactions={reportOpen === 'reaction' ? post.reactions : undefined}
		onclose={() => (reportOpen = undefined)}
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
	.post-blog-label {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: var(--text-muted);
	}

	.post-row.management-only {
		display: block;
		margin: 16px 0;
	}
	.management-only > .bubble {
		width: 100%;
		max-width: none;
		padding: 0;
		border: 0;
		background: transparent;
	}

	.management-only > .bubble::before,
	.management-only > .bubble::after {
		display: none;
	}
	.guest-avatar {
		display: grid;
		place-items: center;
		flex: 0 0 40px;
		width: 40px;
		height: 40px;
		border: 1px solid var(--line);
		border-radius: 50%;
		background: var(--surface-2);
		color: var(--text-muted);
	}
	.post-row.moderation-hidden {
		display: none;
	}
	.bubble.sending {
		border-style: dashed;
	}
	.post-sending {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 8px;
		color: var(--text-muted);
		font-size: 0.8125rem;
	}
	.post-created {
		color: var(--accent-strong);
		font-weight: 700;
	}
	.post-created-check {
		display: inline-grid;
		place-items: center;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--accent-soft);
	}
	.edited-badge {
		color: var(--text-mute);
		font-size: 11px;
	}
	.inline-edit {
		margin-top: 4px;
	}
	.cw-restricted-note {
		margin: 8px 0 0;
		color: var(--text-muted);
		font-size: 0.75rem;
	}
</style>
