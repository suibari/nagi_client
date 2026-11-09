<script lang="ts">
	import ArticleTitleInput from './ArticleTitleInput.svelte';
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
	import ActorBadges from './ActorBadges.svelte';
	import PostDeleteDialog from './PostDeleteDialog.svelte';
	import ReportDialog from './ReportDialog.svelte';
	import { ownCrosspost } from '$lib/crosspost/target.svelte';
	import { createPost, deletePost, preparePostDraft, updatePost } from '$lib/atproto/records';
	import { isAppviewOwnedUri } from '$lib/post/appview-uri';
	import ImageGallery from './ImageGallery.svelte';
	import TrilinesCard from './TrilinesCard.svelte';
	import { deleteTrilinesDiary } from '$lib/trilines/records';
	import VideoPlayer from './VideoPlayer.svelte';
	import { MAX_IMAGE_COUNT, type ImageAttachment, type PostEditImage } from '$lib/images';
	import type { LinkCardDraft } from '$lib/atproto/records';
	import LinkCard from './LinkCard.svelte';
	import { articleMedia } from '$lib/blog/articleMedia';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	import { APPVIEW_URL, ensureRecord } from '$lib/api/appview';
	import ComposerEditor from './ComposerEditor.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import { QuotePick } from '$lib/post/quote-pick.svelte';
	import { postSubmissionErrorMessage } from '$lib/post/submission-error';
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
	import { tick, untrack } from 'svelte';
	import { computeBlobCid } from '$lib/atproto/cid';
	import {
		blobKey,
		fillInlineImageAlts,
		imageMarkdown,
		inlineImageAlts,
		inlineImageState,
		inlineImageUrl,
		pruneInlineImages,
	} from '$lib/blog/inlineImages';
	import {
		postFollow,
		postHref,
		postPageHref,
		scrollToElement,
	} from '$lib/feed/post-follow.svelte';
	import PostImageEditor from './PostImageEditor.svelte';
	import PostVideoEditor, { type ExistingVideoEdit } from './PostVideoEditor.svelte';
	import type { VideoAttachment } from '$lib/video-attachment.svelte';
	import type { PostVideoEdit } from '$lib/atproto/records';
	import LinkCardEditor from './LinkCardEditor.svelte';
	import { extractTitle, IMAGE_LINE } from '$lib/atproto/markdown';
	import { usesPlainTextarea, type ComposerEmbeds } from './composer-embeds';
	import { hasStandardSiteScope } from '$lib/standardsite/preferences';
	import {
		deleteStandardSiteDocument,
		updateStandardSiteDocument,
	} from '$lib/standardsite/document';
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
		editTitle = $bindable(''),
		editBusy = $bindable(false),
		externalTitleEditor = false,
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
		editTitle?: string;
		editBusy?: boolean;
		/** ブログの見出し位置でタイトルを編集する場合に指定。 */
		externalTitleEditor?: boolean;
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
	// どちらのボタンでコンポーザーを開いたか。引用は composeMode とは別枠のスロットで、
	// 返信中に Nagi のスレッドURLを貼れば「返信＋引用」になる（レコードは両立できる）。
	let composeMode = $state<'reply' | 'quote'>();
	const quotePick = new QuotePick();
	let composeText = $state('');
	let posting = $state(false);
	let postError = $state('');
	let attachments = $state<ImageAttachment[]>([]);
	let linkCards = $state<LinkCardDraft[]>([]);
	let mentions = $state<MentionSelection[]>([]);
	let emojis = $state<EmojiSelection[]>([]);
	// 編集は返信/引用と違い、下に新しい吹き出しを出さず、この投稿の吹き出し内でその場編集する。
	let editText = $state('');
	let editingArticle = $derived(
		Boolean(post.article || post.uri.includes('/site.standard.document/')),
	);
	// standard.site の document として保存された記事。リンクカードを本文の行ごとに置けるので
	// 通常投稿の4枚の上限を掛けない（com.suibari.nagi.post のままの旧記事は4枚まで）。
	let editingDocument = $derived(post.uri.includes('/site.standard.document/'));
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
	let editComposer = $state<{ insertBlock: (text: string) => void }>();
	/**
	 * 記事の編集で、画像（id ごと）が本文に書かれるときの URL。既存の画像は AppView の
	 * URL から、足した画像は手元で計算した CID から作る。外した画像の行を本文から消すのと、
	 * 保存前に添付の無い画像行を落とすのに使う。
	 */
	let editImageUrls = $state<Record<string, string>>({});
	let editSeenImageIds = new Set<string>();
	$effect(() => {
		const current = editImages;
		const ids = new Set(current.map((image) => image.id));
		const removed = [...editSeenImageIds].filter((id) => !ids.has(id));
		const added = current.filter((image) => !editSeenImageIds.has(image.id));
		editSeenImageIds = ids;
		if (!untrack(() => editing && editingArticle)) return;
		for (const id of removed) {
			const url = editImageUrls[id];
			if (!url) continue;
			editText = untrack(() => editText)
				.split('\n')
				.filter((line) => IMAGE_LINE.exec(line)?.[2] !== url)
				.join('\n');
		}
		const did = post.author.did;
		for (const image of added) {
			if (image.kind !== 'new') continue;
			void computeBlobCid(image.blob).then((cid) => {
				if (!editImages.some((item) => item.id === image.id)) return;
				const url = inlineImageUrl(did, cid);
				editImageUrls[image.id] = url;
				editComposer?.insertBlock(imageMarkdown(image.alt, url));
			});
		}
	});
	/**
	 * standard.site の記事の編集では、URL だけの行のリンクカードと本文の画像を入力欄の中
	 * （行の下）に見せる。Android の素の textarea では重ねられないので従来の一覧に出す。
	 */
	const editInlineEmbeds = $derived(editingDocument && !usesPlainTextarea());
	let editLinkCardEditor = $state<{ remove: (uri: string) => void }>();
	let editLinkCardLoading = $state<string[]>([]);
	const removeEditInlineCard = (uri: string) => editLinkCardEditor?.remove(uri);
	let editEmbeds = $derived.by((): ComposerEmbeds | undefined => {
		if (!editInlineEmbeds) return undefined;
		const images: Record<string, string> = {};
		for (const image of editImages) {
			const key = editImageUrls[image.id] && blobKey(editImageUrls[image.id]);
			if (key) images[key] = image.previewUrl;
		}
		return {
			cards: editLinkCards.map(({ uri, title, description, previewUrl }) => ({
				uri,
				title,
				description,
				previewUrl,
				loading: editLinkCardLoading.includes(uri),
			})),
			images,
			disabled: editBusy,
			onremovecard: removeEditInlineCard,
		};
	});
	/**
	 * 本文の画像行と画像の対応（Composer と同じ）。入力欄の中に出した画像は下の一覧に出さず、
	 * alt も本文の `![alt](url)` に合わせる。行を消した画像は保存しない。
	 */
	const editImageKey = (image: PostEditImage) =>
		editImageUrls[image.id] ? blobKey(editImageUrls[image.id]) : undefined;
	let editPlacedImages = $derived(inlineImageAlts(editText));
	let editSeenImageKeys = $state<string[]>([]);
	let editSeenImages = $derived(new Set([...editSeenImageKeys, ...editPlacedImages.keys()]));
	const editImageState = (image: PostEditImage) =>
		editInlineEmbeds
			? inlineImageState(editImageKey(image), editPlacedImages, editSeenImages)
			: 'listed';
	let editHiddenImageIds = $derived(
		new Set(
			editImages.filter((image) => editImageState(image) !== 'listed').map((image) => image.id),
		),
	);
	$effect(() => {
		if (!editInlineEmbeds) return;
		const seen = untrack(() => editSeenImageKeys);
		const fresh = [...editPlacedImages.keys()].filter((key) => !seen.includes(key));
		if (fresh.length) editSeenImageKeys = [...seen, ...fresh];
		const current = untrack(() => editImages);
		// 初めて本文に見えた画像は、添付にだけある alt を先に本文の行へ移す（消さないため）。
		if (fresh.length) {
			const moved = new Map<string, string>();
			for (const image of current) {
				const key = editImageKey(image);
				if (key && fresh.includes(key) && image.alt) moved.set(key, image.alt);
			}
			const source = untrack(() => editText);
			const filled = moved.size ? fillInlineImageAlts(source, moved) : source;
			if (filled !== source) {
				editText = filled;
				return;
			}
		}
		const alts = editPlacedImages;
		const next = current.map((image) => {
			const key = editImageKey(image);
			const alt = key ? alts.get(key) : undefined;
			return alt === undefined || alt === image.alt ? image : { ...image, alt };
		});
		if (next.some((image, index) => image !== current[index])) editImages = next;
	});
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
	let composeContentWarningValid = $derived(validContentWarningSyntax(composeText));
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
		postError = '';
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
	function cancelComposer() {
		composeMode = undefined;
		composeText = '';
		attachments = [];
		linkCards = [];
		mentions = [];
		emojis = [];
		quotePick.clear();
	}
	function startEdit() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		editError = '';
		editTitle = editingArticle ? (extractTitle(post.text) ?? '') : '';
		const prefix = editingArticle ? (post.text.match(/^# [^\n]+\n*/)?.[0] ?? '') : '';
		const offset = new TextEncoder().encode(prefix).length;
		const facets = post.facets
			?.filter((facet) => facet.index.byteStart >= offset)
			.map((facet) => ({
				...facet,
				index: { byteStart: facet.index.byteStart - offset, byteEnd: facet.index.byteEnd - offset },
			}));
		const restored = restorePostEditState(post.text.slice(prefix.length), facets);
		editText = restored.text;
		editMentions = restored.mentions;
		editEmojis = restored.emojis;
		editImageProcessing = false;
		const appViewOrigins = [new URL(APPVIEW_URL, 'http://localhost').origin];
		editImageUrls = {};
		editSeenImageKeys = [];
		for (const [sourceIndex, image] of (post.images ?? []).entries()) {
			const key = blobKey(image.url, appViewOrigins);
			if (!key) continue;
			const slash = key.lastIndexOf('/');
			editImageUrls[`${post.cid}-${sourceIndex}`] = inlineImageUrl(
				key.slice(0, slash),
				key.slice(slash + 1),
			);
		}
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
	/**
	 * 投稿の編集・削除に standard.site の記事を追従させる。
	 * 権限が無い／記事化していない場合は黙って何もしない（Nagi 側の操作は成立している）。
	 */
	async function syncStandardSiteDocument(rkey: string, text?: string) {
		if (post.uri.includes('/site.standard.document/')) return;
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
			// タグは渡さない。記事のタグは投稿モーダルの記事メタ欄で決まるもので、
			// 本文の facet からは復元できないため、本文編集では触らずに残す。
			await updateStandardSiteDocument(rkey, {
				...(extractTitle(text) ? { title: extractTitle(text) } : {}),
				markdown: text,
			});
		} catch {
			// 記事側の同期失敗で Nagi の編集・削除を巻き戻すことはしない。
		}
	}

	async function submitEdit() {
		const match =
			/^at:\/\/[^/]+\/(com\.suibari\.nagi\.post|site\.standard\.document)\/([^/]+)$/.exec(post.uri);
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
		const heading = editingArticle ? `# ${editTitle.trim()}\n\n` : '';
		const shift = <T extends { start: number; end: number }>(items: T[]) =>
			items.map((item) => ({
				...item,
				start: item.start + heading.length,
				end: item.end + heading.length,
			}));
		// 添付に無い Nagi の画像行は保存しない（存在しない blob を指す画像になる）。
		// 記事の本文から行を消した画像は保存しない。
		const savedImages = editImages.filter((image) => editImageState(image) !== 'detached');
		const knownImages = new Set(
			savedImages.flatMap((image) => {
				const key = editImageUrls[image.id] && blobKey(editImageUrls[image.id]);
				return key ? [key] : [];
			}),
		);
		const editBody = editingArticle ? pruneInlineImages(editText, knownImages) : editText;
		const draft = preparePostDraft(
			heading + editBody,
			undefined,
			undefined,
			[],
			editLinkCards,
			shift(editMentions),
			shift(editEmojis),
			false,
			false,
			false,
			[],
			undefined,
			{ article: editingDocument },
		);
		if (editingArticle && !editTitle.trim()) {
			editError = m.articleTitleRequired();
			return;
		}
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
			// standard.site の記事にしてある投稿なら本文を追従させる。記事化していない
			// 投稿では何も起きない（編集をきっかけに勝手に公開はしない）。
			void syncStandardSiteDocument(match[2], draft.text);
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
		// 引用ボタン経路ではこの投稿そのものが引用元。返信中はURL貼り付けで付けた
		// 引用（あれば）がそのまま乗るので、返信と引用が同居する。
		const quotedPost = mode === 'quote' ? post : quotePick.post;
		const quoteRef = mode === 'quote' ? subject : quotePick.ref;
		const draft = preparePostDraft(
			composeText,
			reply,
			quoteRef,
			attachments,
			linkCards,
			mentions,
			emojis,
			// こっそりは「共有TLに出すか」ではなく「どこに保存するか」の設定なので、
			// スレッドルートだけの所有にはできず、返信にも引き継ぐ。
			mode === 'reply' && replyIsKossori,
		);
		const optimisticId = optimisticPosts.add(draft, $session.did, {
			...(mode === 'reply' ? { replyParent: post } : {}),
			...(quotedPost ? { quote: quotedPost } : {}),
			threadKossori: mode === 'reply' ? Boolean(post.threadKossori ?? post.kossori) : false,
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
		emojis = [];
		composeMode = undefined;
		quotePick.clear();
		try {
			// 返信・引用はNagi内の投稿文脈を参照するため、Blueskyへはクロスポストしない。
			const created = await createPost(draft);
			optimisticPosts.markCreated(optimisticId, created);
			// 画面に出せない投稿（検索タブなど）では、postFollow が導線へ切り替える。
			postFollow.settle(created.uri, postHref(created.uri));
			// こっそりは PDS に取りに行く相手が居ないので、AppView への即時反映は不要。
			if (!draft.kossori) await ensureRecord(created.uri, created.cid).catch(() => undefined);
			await Promise.resolve(onposted?.()).catch(() => undefined);
		} catch (error) {
			optimisticPosts.remove(optimisticId);
			postFollow.fail();
			postError = postSubmissionErrorMessage(error);
			await tick();
			scrollToElement(postRow);
		} finally {
			posting = false;
		}
	}
	async function removePost() {
		if (deleting) return;
		const rkey = post.uri.split('/').pop();
		if (!rkey) {
			deleteError = m.deletePostFailed();
			return;
		}
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
			// 記事にしてある投稿なら standard.site 側も消す。こっそりは記事化できないので空振りする。
			void syncStandardSiteDocument(rkey);
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
						<!-- 画像ボタンから動画も選べる。ブログとこっそりは動画を持てないので画像だけ。 -->
						<PostImageEditor
							bind:this={editImageEditor}
							bind:images={editImages}
							hiddenIds={editHiddenImageIds}
							bind:video={editNewVideo}
							allowVideo={!editingArticle && !isAppviewOwnedUri(post.uri)}
							maxCount={editingArticle ? Infinity : MAX_IMAGE_COUNT}
							hasVideo={Boolean(editExistingVideo || editNewVideo)}
							bind:processing={editImageProcessing}
							disabled={editBusy}
						/>
					{/snippet}
					{#if editingArticle && !externalTitleEditor}
						<ArticleTitleInput bind:value={editTitle} disabled={editBusy} />
					{/if}
					<ComposerEditor
						bind:this={editComposer}
						mode={editingArticle ? 'blog' : 'rich'}
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
						embeds={editEmbeds}
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
						bind:this={editLinkCardEditor}
						text={editText}
						bind:cards={editLinkCards}
						bind:dismissedUrls={editDismissedUrls}
						bind:loading={editLinkCardLoading}
						disabled={editBusy}
						article={editingDocument}
						inline={editInlineEmbeds}
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
				<TrilinesCard post={trilines} clampTall={clampTallImages} />
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
		{#if postError}<p class="error" role="alert">{postError}</p>{/if}
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
