<script lang="ts">
	import { tagFavorites } from '$lib/tag-favorites/tag-favorites.svelte';
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { composerHost } from '$lib/post/composer-host.svelte';
	import Avatar from './Avatar.svelte';
	import QuoteCard from './QuoteCard.svelte';
	import PostModerationGuard from './PostModerationGuard.svelte';
	import NewsQuoteCard from './NewsQuoteCard.svelte';
	import { untrack } from 'svelte';
	import {
		blobRefCid,
		createPost,
		createRadioRecord,
		preparePostDraft,
		uploadPostAssets,
	} from '$lib/atproto/records';
	import { hasRadioScope } from '$lib/radio/share';
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
	import { usesPlainTextarea, type ComposerEmbeds } from './composer-embeds';
	import {
		crosspostArticleToBluesky,
		crosspostDraftBlock,
		type CrosspostTarget,
	} from '$lib/crosspost/bluesky';
	import {
		checkCrosspostTarget,
		goneCrossposts,
		ownCrosspost,
		type CrosspostTargetState,
	} from '$lib/crosspost/target.svelte';
	import { crosspostContentWarningBlock } from '$lib/crosspost/content-warning';
	import { getCrosspostEnabled, hasCrosspostScope } from '$lib/crosspost/preferences';
	import { crosspostAfterPost } from '$lib/crosspost/after-post';
	import { m } from '$lib/i18n/i18n.svelte';
	import { MAX_IMAGE_COUNT, type ImageAttachment } from '$lib/images';
	import ImageAttachmentEditor from './ImageAttachmentEditor.svelte';
	import ImageAttachmentPicker from './ImageAttachmentPicker.svelte';
	import VideoAttachmentEditor from './VideoAttachmentEditor.svelte';
	import type { VideoAttachment } from '$lib/video-attachment.svelte';
	import LinkCardEditor from './LinkCardEditor.svelte';
	import type { LinkCardDraft } from '$lib/atproto/records';
	import { session } from '$lib/oauth/session.svelte';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	import { postFollow, postPageHref } from '$lib/feed/post-follow.svelte';
	import { ensureRecord } from '$lib/api/appview';
	import ComposerEditor from './ComposerEditor.svelte';
	import { isAppviewOwnedUri } from '$lib/post/appview-uri';
	import ComposerQuoteEditor from './ComposerQuoteEditor.svelte';
	import { QuotePick } from '$lib/post/quote-pick.svelte';
	import PostScopeDialog from './PostScopeDialog.svelte';
	import Icon from './shell/Icon.svelte';
	import type { EmojiSelection, MentionSelection } from '$lib/atproto/facets';
	import {
		drafts,
		DraftStorageError,
		type ComposerSnapshot,
		type DraftSaveTarget,
	} from '$lib/drafts/drafts.svelte';
	import DraftListDialog from './DraftListDialog.svelte';
	import { articleCardUrls, extractTitle, IMAGE_LINE } from '$lib/atproto/markdown';
	import { httpUrl } from '$lib/atproto/facets';
	import { hasStandardSiteScope } from '$lib/standardsite/preferences';
	import { grantedOptIns } from '$lib/optin/scope-optin';
	import { signIn } from '$lib/oauth/session.svelte';
	import { NAGI_PUBLIC_ORIGIN } from '$lib/standardsite/types';
	import {
		publishStandardSiteDocument,
		updateStandardSiteDocument,
		tagsFromFacets,
		usableAsCoverImage,
	} from '$lib/standardsite/document';
	import { getPublicationRef } from '$lib/standardsite/publication';
	import ComposerArticleMeta from './ComposerArticleMeta.svelte';
	import { isPlainPostMode, isWideComposer, type ComposerMode } from '$lib/post/composer-mode';
	import { hasContentWarning, validContentWarningSyntax } from '$lib/atproto/contentWarning';
	import { postSubmissionErrorMessage } from '$lib/post/submission-error';
	import {
		restorePostScope,
		scopeAfterExternalEligibility,
		scopeForPublicReply,
		setLastPostScope,
		type PostScope,
	} from '$lib/post/scope';
	let {
		onposted,
		onsendingchange,
		ontextinput,
		oncompositionchange,
		defaultScope = 'feed',
		mode = 'simple',
		publishingPreferencesVersion = 0,
		text = $bindable(''),
		submittable = $bindable(false),
	}: {
		onposted: (uri: string) => void | Promise<void>;
		onsendingchange?: (sending: boolean) => void;
		ontextinput?: (event: InputEvent) => void;
		oncompositionchange?: (composing: boolean) => void;
		defaultScope?: PostScope;
		mode?: ComposerMode;
		publishingPreferencesVersion?: number;
		/** ポストおたすけが書きかけを読むためだけに外へ出す。 */
		text?: string;
		/** モーダルヘッダーなど、コンポーザ外の送信ボタンへ状態を渡す。 */
		submittable?: boolean;
	} = $props();
	/*
		返信・引用の文脈はポストモーダルのもの。ブログモーダルの Composer は別インスタンスなので、
		ポストモーダル側で返信先を選んでもブログの書きかけに混ざらないよう見ない。
	*/
	const replyTarget = $derived(mode === 'blog' ? undefined : composerHost.replyTarget);
	const quoteTarget = $derived(mode === 'blog' ? undefined : composerHost.quoteTarget);
	let busy = $state(false);
	let error = $state('');
	let warning = $state('');
	let attachments = $state<ImageAttachment[]>([]);
	// 動画は1本まで、画像と併用できる。添付した時点で送信と変換が始まる。
	let video = $state<VideoAttachment>();
	let linkCards = $state<LinkCardDraft[]>([]);
	let mentions = $state<MentionSelection[]>([]);
	let emojis = $state<EmojiSelection[]>([]);
	// defaultScope はこの Composer インスタンスの初期値。ユーザー操作後は追従させない。
	let scope = $state<PostScope>(untrack(() => defaultScope));
	let scopeDialogOpen = $state(false);
	let dismissedUrls = $state<string[]>([]);
	// Nagi のスレッドURLを貼ったときだけ引き取る引用スロット。本文には URL を入れない。
	const quotePick = new QuotePick();
	let draftListOpen = $state(false);
	let draftError = $state('');
	let draftSaveStatus = $state<'idle' | 'saving' | 'saved'>('idle');
	let activeDraftTarget = $state<DraftSaveTarget>();
	let lastSavedDraftKey = $state('');
	let pendingRestoreId = $state<string | null>(null);
	let loadedDid = $state<string | undefined>(undefined);
	let crosspostReady = $state(false);
	let botSilent = $state(false);
	let silentReply = $state(false);
	let selfLabels = $state<string[]>([]);
	/**
	 * 添付した画像・動画をまとめてぼかすか。CWメニューの1項目で切り替える。
	 * レコードは従来どおり画像・動画ごとの contentWarning なので、下の $effect で全件へ揃える。
	 */
	let mediaWarning = $state(false);
	let publishingLoadVersion = 0;
	let draftSaveInFlight = false;
	let draftSaveTask: Promise<boolean> | undefined;
	let pendingAutoSave = false;
	// こっそりでは画像ピッカー自体をマウントしないので、バインドが付いたり外れたりする。
	let imagePicker = $state<{ handlePaste: (event: ClipboardEvent) => void }>();
	let composerEditor = $state<{ insertBlock: (text: string) => void }>();
	/**
	 * ブログ本文に差し込んだ画像の CID（添付の id ごと）。本文の URL に CID が要るが、
	 * アップロードは投稿時なので手元で計算しておき、投稿時に PDS の値と照合する。
	 */
	let inlineCids = $state<Record<string, string>>({});
	let seenAttachmentIds = new Set<string>();
	// ブログでは、ピッカーで足した画像をキャレット位置へ `![](url)` として差し込む。
	// 外した画像は本文の行も消す（行だけ残ると、投稿時に参照先の無い画像になる）。
	$effect(() => {
		const current = attachments;
		const ids = new Set(current.map((image) => image.id));
		const did = $session?.did;
		for (const id of seenAttachmentIds) {
			if (ids.has(id) || !inlineCids[id] || !did) continue;
			const url = inlineImageUrl(did, inlineCids[id]);
			text = untrack(() => text)
				.split('\n')
				.filter((line) => !(IMAGE_LINE.exec(line)?.[2] === url))
				.join('\n');
			const { [id]: _removed, ...rest } = inlineCids;
			inlineCids = rest;
		}
		const added = current.filter((image) => !seenAttachmentIds.has(image.id));
		seenAttachmentIds = ids;
		if (!untrack(() => blog) || !did) return;
		for (const image of added) {
			if (image.header) continue;
			void computeBlobCid(image.blob).then((cid) => {
				// 計算中に外された画像は差し込まない。
				if (!attachments.some((item) => item.id === image.id)) return;
				inlineCids = { ...inlineCids, [image.id]: cid };
				composerEditor?.insertBlock(imageMarkdown(image.alt, inlineImageUrl(did, cid)));
			});
		}
	});

	let empty = $derived(!text.trim() && !attachments.length && !video && !linkCards.length);
	/** 動画の変換が終わるまでは投稿させない（blob がまだ無い）。 */
	const videoPending = $derived(Boolean(video && !video.ready));
	let draftSaveable = $derived(Boolean(text.trim() || linkCards.length || quotePick.ref));
	let draftKey = $derived(
		JSON.stringify({
			text,
			mentions,
			emojis: emojis.map(({ start, end, emoji }) => ({ start, end, uri: emoji.uri })),
			linkCards: linkCards.map(({ uri, title, description }) => ({ uri, title, description })),
			dismissedUrls,
			quoteUri: quotePick.ref?.uri,
		}),
	);
	/**
	 * ブログでは、URL だけの行に置いたリンクカードと本文の画像を入力欄の中（行の下）に見せる。
	 * Android の素の textarea では重ねられないので、従来どおり入力欄の下の一覧に出す。
	 */
	const inlineEmbeds = $derived(mode === 'blog' && !usesPlainTextarea());
	let linkCardEditor = $state<{ remove: (uri: string) => void }>();
	let linkCardLoading = $state<string[]>([]);
	const removeInlineCard = (uri: string) => linkCardEditor?.remove(uri);
	let editorEmbeds = $derived.by((): ComposerEmbeds | undefined => {
		if (!inlineEmbeds) return undefined;
		const did = $session?.did;
		const images: Record<string, string> = {};
		if (did)
			for (const image of attachments) {
				const cid = inlineCids[image.id];
				const key = cid && blobKey(inlineImageUrl(did, cid));
				if (key) images[key] = image.previewUrl;
			}
		return {
			cards: linkCards.map(({ uri, title, description, previewUrl }) => ({
				uri,
				title,
				description,
				previewUrl,
				loading: linkCardLoading.includes(uri),
			})),
			images,
			disabled: busy,
			onremovecard: removeInlineCard,
		};
	});
	/**
	 * 本文の画像行と添付の対応。入力欄の中に出した画像は下の一覧に出さず、alt も本文の
	 * `![alt](url)`（入力欄の「ALT」で直す）に合わせる。行を消した画像は投稿しない
	 * （inlineImageState 参照）。添付は残すので、元に戻すで行が戻れば画像も戻る。
	 */
	const attachmentKey = (image: ImageAttachment) => {
		const did = $session?.did;
		const cid = inlineCids[image.id];
		return did && cid ? blobKey(inlineImageUrl(did, cid)) : undefined;
	};
	let placedImages = $derived(inlineImageAlts(text));
	let seenImageKeys = $state<string[]>([]);
	// 今の本文の行も数えて、行に置いた直後に一瞬だけ一覧へ出ることがないようにする。
	let seenImages = $derived(new Set([...seenImageKeys, ...placedImages.keys()]));
	const imageState = (image: ImageAttachment) =>
		inlineEmbeds ? inlineImageState(attachmentKey(image), placedImages, seenImages) : 'listed';
	let hiddenAttachmentIds = $derived(
		new Set(attachments.filter((image) => imageState(image) !== 'listed').map((image) => image.id)),
	);
	$effect(() => {
		if (!inlineEmbeds) return;
		const seen = untrack(() => seenImageKeys);
		const fresh = [...placedImages.keys()].filter((key) => !seen.includes(key));
		if (fresh.length) seenImageKeys = [...seen, ...fresh];
		const current = untrack(() => attachments);
		// 初めて本文に見えた画像は、添付にだけある alt を先に本文の行へ移す（消さないため）。
		if (fresh.length) {
			const moved = new Map<string, string>();
			for (const image of current) {
				const key = attachmentKey(image);
				if (key && fresh.includes(key) && image.alt) moved.set(key, image.alt);
			}
			const source = untrack(() => text);
			const filled = moved.size ? fillInlineImageAlts(source, moved) : source;
			if (filled !== source) {
				text = filled;
				return;
			}
		}
		const alts = placedImages;
		const next = current.map((image) => {
			const key = attachmentKey(image);
			const alt = key ? alts.get(key) : undefined;
			return alt === undefined || alt === image.alt ? image : { ...image, alt };
		});
		if (next.some((image, index) => image !== current[index])) attachments = next;
	});
	// 入力欄の中に出しているカードは、下の一覧の有無に数えない。
	let listedLinkCards = $derived.by(() => {
		if (!inlineEmbeds) return linkCards;
		const placed = new Set(articleCardUrls(text));
		return linkCards.filter((card) => !placed.has(httpUrl(card.uri) ?? card.uri));
	});
	let hasEmbeds = $derived(
		Boolean(
			attachments.filter(
				(image) => !(mode === 'blog' && image.header) && !hiddenAttachmentIds.has(image.id),
			).length ||
			video ||
			listedLinkCards.length ||
			quotePick.pending ||
			quotePick.post ||
			quotePick.error,
		),
	);
	$effect(() => {
		submittable =
			!busy &&
			!empty &&
			!videoPending &&
			(blog || graphemes <= 3000) &&
			!articleTitleMissing &&
			contentWarningValid &&
			articleReady &&
			!articleBlockedReason &&
			!kossoriReplyBlockedReason &&
			!radioScopeBlocked &&
			!(scope === 'external' && !externalEligible);
	});

	// --- 外部への同時投稿 ---------------------------------------------------------
	// Bluesky クロスポストは投稿範囲ゲージの3段階目（既定は OFF）。
	// standard.site への記事公開は「どこまで届けるか」ではなく「何を書くか」なので、
	// ゲージではなく投稿モーダルの書き方タブ（ブログ）が担う。
	let standardSiteReady = $state(false);
	let publishingReadinessLoaded = $state(false);
	let articleTitle = $state('');
	let articleTags = $state<string[]>([]);
	let reauthorizingArticle = $state(false);
	const kossori = $derived(scope === 'kossori');
	const blog = $derived(mode === 'blog');
	// こっそりは画像とリンクカードを持てない。blob は参照レコードのある PDS でしか
	// 保持されず、こっそり投稿にはその参照レコードが無いので、いずれ壊れた画像になる。
	// 切り替えた時点で添付を落とす（そのまま投稿できてしまうと黙って消える）。
	$effect(() => {
		if (!kossori) return;
		if (attachments.length) attachments = [];
		if (video) video = undefined;
		if (linkCards.length) linkCards = [];
	});
	// ブログは standard.site の document になり、動画を載せる場所が無い。
	$effect(() => {
		if (blog && video) video = undefined;
	});
	const hasMedia = $derived(Boolean(attachments.length || video));
	// 後から足した画像・動画にも同じ設定を効かせる。添付が無くなったら設定も戻す。
	$effect(() => {
		if (!hasMedia) {
			if (mediaWarning) mediaWarning = false;
			return;
		}
		const flag = mediaWarning;
		if (attachments.some((image) => Boolean(image.contentWarning) !== flag))
			attachments = attachments.map((image) => ({ ...image, contentWarning: flag || undefined }));
		if (video && video.contentWarning !== flag) video.contentWarning = flag;
	});
	const hasContentWarningSetting = $derived(
		hasContentWarning(text) ||
			attachments.some((image) => image.contentWarning) ||
			Boolean(video?.contentWarning),
	);
	const contentWarningValid = $derived(validContentWarningSyntax(text));
	/**
	 * CW が Bluesky への投稿を止めるか。画像のぼかしは、Bluesky でもぼかされるラベルが
	 * 付いていれば通す（判定は crosspost/content-warning.ts の1か所）。
	 */
	const crosspostCwBlock = $derived(
		crosspostContentWarningBlock({
			text,
			mediaWarning:
				attachments.some((image) => image.contentWarning) || Boolean(video?.contentWarning),
			labels: selfLabels,
		}),
	);
	/**
	 * 返信・引用の相手。Bluesky にも続けられるのは、自分のクロスポスト済みの投稿1件だけ
	 * （他人のクロスポストへは続けない）。Bluesky 側では、そのコピーへの返信・引用として出す。
	 * 返信と引用を同時にするときは、両方を Bluesky で揃えられないので外へは出さない。
	 */
	const quoting = $derived(quotePick.active || Boolean(quoteTarget));
	const hasThreadTarget = $derived(quoting || Boolean(replyTarget));
	const crosspostTargetPost = $derived(replyTarget?.post ?? quoteTarget?.post ?? quotePick.post);
	const crosspostTargetRef = $derived(
		hasThreadTarget && !(quoting && replyTarget)
			? ownCrosspost(crosspostTargetPost, $session?.did)
			: undefined,
	);
	/** コピーがまだ Bluesky にあるか。消えていたら同時投稿を止める（孤立した返信を作らない）。 */
	let crosspostTargetState = $state<CrosspostTargetState>('checking');
	$effect(() => {
		// 同じ返信先でも、モーダルを開き直したらコピーを確かめ直す。
		publishingPreferencesVersion;
		const quote = quoting;
		const post = crosspostTargetPost;
		const ref = crosspostTargetRef;
		if (!post || !ref || !crosspostReady) return;
		crosspostTargetState = 'checking';
		let cancelled = false;
		void checkCrosspostTarget(post.uri, ref, quote ? 'quote' : 'reply').then((state) => {
			if (!cancelled) crosspostTargetState = state;
		});
		return () => {
			cancelled = true;
		};
	});
	/**
	 * Bluesky にも出せる条件。
	 *
	 * 返信・引用は、自分のクロスポスト済みの投稿に続けるときだけ外へ出せる。それ以外は
	 * Bluesky 側に返信先・引用先が無く、参照が黙って消える。
	 * 記事化は引用・返信では別に止める（articleBlockedReason）。CW 付きの記事も同じ。
	 */
	const externalEligible = $derived(
		crosspostReady &&
			!crosspostCwBlock &&
			(!hasThreadTarget || (Boolean(crosspostTargetRef) && crosspostTargetState === 'ok')),
	);
	const externalDisabledReason = $derived(
		!crosspostReady
			? m.postScopeExternalUnavailable()
			: crosspostCwBlock === 'text'
				? m.crosspostDisabledTextWarning()
				: crosspostCwBlock === 'media'
					? m.crosspostDisabledMediaWarning()
					: !hasThreadTarget
						? ''
						: crosspostTargetPost && goneCrossposts.has(crosspostTargetPost.uri)
							? m.crosspostTargetGone()
							: !crosspostTargetRef
								? m.crosspostTargetNotOwn()
								: crosspostTargetState === 'checking'
									? m.crosspostTargetChecking()
									: crosspostTargetState === 'gone'
										? m.crosspostTargetGone()
										: crosspostTargetState === 'failed'
											? m.crosspostTargetCheckFailed()
											: '',
	);
	/**
	 * 本文先頭の「# 見出し」はタイトルそのもの。タイトルの真実源は常に本文側に置き、
	 * 入力欄は「まだ本文に見出しが無いときの書き口」として使う。
	 * すでに見出しがある本文では、その文字列を読み取り専用で映すだけにする
	 * （2箇所で別々に編集できると、どちらが記事のタイトルか決まらなくなる）。
	 */
	const headingTitle = $derived(blog ? extractTitle(text.trim()) : undefined);
	const articleTitleMissing = $derived(blog && !(headingTitle ?? articleTitle).trim());
	/** 送信時に本文の先頭へ差し込む見出し行。本文が既に見出しで始まるなら不要。 */
	const articleHeading = $derived(
		blog && !headingTitle && articleTitle.trim() ? `# ${articleTitle.trim()}\n\n` : '',
	);
	/** ブログとして出す準備が整っているか。権限が無い間は投稿させない。 */
	const articleReady = $derived(!blog || standardSiteReady);
	/**
	 * ブログにできない投稿をブログタブのまま出そうとしている理由。
	 *
	 * document は公開レコードとして外から読まれるので、Nagi の共有TLに出さない投稿
	 * （こっそり）、外部コピーを作らない投稿（CW）、本文に現れない参照を
	 * 持つ投稿（引用）は記事にできない（standardsite/preferences.ts の
	 * isArticleCandidate と同じ線引き）。
	 *
	 * 以前はこれらを黙って「記事にしない」で済ませていたが、ブログタブを選んだままでも
	 * 投稿が通ってしまい、記事が作られないことがユーザーから見えなかった。理由を出して
	 * 送信を止める。
	 */
	const articleBlockedReason = $derived(
		!blog
			? ''
			: kossori
				? m.postScopeKossoriArticle()
				: hasContentWarningSetting
					? m.articleContentWarningDisabled()
					: quotePick.active || quoteTarget || replyTarget
						? m.articleQuoteDisabled()
						: '',
	);
	/** ブログとして standard.site に出す投稿か。記事フラグと公開の判定はこれ1本。 */
	const publishesArticle = $derived(blog && !articleBlockedReason);
	// 通常投稿の上限判定と、ブログの現在文字数表示に使う。
	let graphemes = $derived(
		[...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(articleHeading + text)]
			.length,
	);
	/**
	 * こっそりスレッドへの返信か。
	 *
	 * こっそりは「共有TLに出すか」ではなく「PDS と AppView のどちらに保存するか」を
	 * 決める設定なので、スレッドの途中で切り替えられない。ここで固定しないと、
	 * こっそりスレッドへの返信だけが PDS の公開レコードとして書き出されてしまう。
	 *
	 * 判定はスレッドルートの URI（AppView 発行なら必ずこっそり）。移行前のこっそり投稿は
	 * URI から分からないので、直接の返信のときに post.kossori で補う。
	 */
	const kossoriThread = $derived.by(() => {
		const target = replyTarget;
		if (!target) return false;
		return isAppviewOwnedUri(target.root.uri) || Boolean(target.post.kossori);
	});
	$effect(() => {
		if (kossoriThread && scope !== 'kossori') scope = 'kossori';
	});
	/**
	 * こっそりではないスレッドへの返信か。AppView はこっそりスレッドの外にこっそり投稿を
	 * 置かせない（createKossoriPost が 400 "Reply root is not a kossori post" を返す）。
	 *
	 * 前回値や画面既定でこっそりが選ばれたまま公開投稿へ返信すると、送信してから
	 * 「通信状態を確認」と出て失敗していた。返信先が付いた時点でまだ何も書いていなければ
	 * フィードへ切り替え、書きかけなら黙って公開範囲を広げず送信を止めて理由を出す。
	 */
	const publicReply = $derived(Boolean(replyTarget) && !kossoriThread);
	$effect(() => {
		if (!publicReply) return;
		untrack(() => {
			const next = scopeForPublicReply(scope, !empty);
			if (next !== scope) scope = next;
		});
	});
	const kossoriReplyBlockedReason = $derived(
		kossori && publicReply ? m.postScopeKossoriPublicReply() : '',
	);
	// ブログは公開レコードとして外から読まれるので、こっそりにはできない
	// （standardsite/preferences.ts の isArticleCandidate と同じ線引き）。
	$effect(() => {
		if (blog && scope === 'kossori') scope = 'feed';
	});
	// 外部に出せない状態に変わったら黙って1段階狭める（意図せぬ公開を作らない）。
	// OAuth scope の再確認中は前回値を保持し、利用不能だと確定してからだけ狭める。
	$effect(() => {
		// 返信先のコピーを確かめている間は、前回の「Blueskyにも」を保ったまま待つ。
		const next = scopeAfterExternalEligibility(
			scope,
			publishingReadinessLoaded && !(crosspostTargetRef && crosspostTargetState === 'checking'),
			externalEligible,
		);
		if (next !== scope) scope = next;
	});

	$effect(() => {
		const did = $session?.did;
		if (did === loadedDid) return;
		loadedDid = did;
		activeDraftTarget = undefined;
		lastSavedDraftKey = '';
		draftSaveStatus = 'idle';
		void drafts.load(did);
	});

	$effect(() => {
		const key = draftKey;
		const did = $session?.did;
		if (!isWideComposer(mode) || !did || !text.trim() || key === lastSavedDraftKey) {
			if (draftSaveStatus !== 'saving')
				draftSaveStatus = key === lastSavedDraftKey && Boolean(key) ? 'saved' : 'idle';
			return;
		}
		if (draftSaveStatus !== 'saving') draftSaveStatus = 'idle';
		const timer = setTimeout(() => void startDraftSave(key, draftSnapshot()), 1500);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		const did = $session?.did;
		const preferencesVersion = publishingPreferencesVersion;
		const loadVersion = ++publishingLoadVersion;
		crosspostReady = false;
		standardSiteReady = false;
		publishingReadinessLoaded = false;
		void Promise.all([
			did && getCrosspostEnabled() ? hasCrosspostScope().catch(() => false) : false,
			did ? hasStandardSiteScope().catch(() => false) : false,
		]).then(([crosspostGranted, standardSiteGranted]) => {
			if (
				$session?.did !== did ||
				publishingPreferencesVersion !== preferencesVersion ||
				publishingLoadVersion !== loadVersion
			)
				return;
			crosspostReady = crosspostGranted;
			standardSiteReady = standardSiteGranted;
			publishingReadinessLoaded = true;
		});
	});

	function clearComposer() {
		text = '';
		attachments = [];
		video = undefined;
		linkCards = [];
		mentions = [];
		emojis = [];
		dismissedUrls = [];
		quotePick.clear();
		if (mode !== 'blog') composerHost.clearAllTargets();
		scope = restorePostScope(defaultScope);
		articleTitle = '';
		articleTags = [];
		botSilent = false;
		silentReply = false;
		selfLabels = [];
		mediaWarning = false;
		activeDraftTarget = undefined;
		lastSavedDraftKey = '';
		draftSaveStatus = 'idle';
	}

	function draftSnapshot(): ComposerSnapshot {
		return {
			text,
			// 画像Blobは現在のAppView下書き形式に含めない。本文などの保存は継続する。
			attachments: [],
			linkCards,
			mentions,
			emojis,
			dismissedUrls,
			quoteUri: quotePick.ref?.uri,
		};
	}

	async function persistDraft(key: string, snapshot: ComposerSnapshot): Promise<boolean> {
		const currentSession = $session;
		if (!currentSession || busy || !draftSaveable) return false;
		if (draftSaveInFlight) {
			pendingAutoSave = true;
			return false;
		}
		draftSaveInFlight = true;
		draftSaveStatus = 'saving';
		draftError = '';
		try {
			const saved = await drafts.save(currentSession.did, snapshot, activeDraftTarget);
			if ($session?.did !== currentSession.did) return false;
			activeDraftTarget = { id: saved.id, createdAt: saved.createdAt };
			lastSavedDraftKey = key;
			draftSaveStatus = draftKey === key ? 'saved' : 'idle';
			return true;
		} catch (e) {
			draftSaveStatus = 'idle';
			draftError =
				e instanceof DraftStorageError && e.code === 'limit'
					? m.draftLimitReached({ max: 30 })
					: e instanceof DraftStorageError && e.code === 'images'
						? m.draftImagesUnsupported()
						: m.draftSaveFailed();
			return false;
		} finally {
			draftSaveInFlight = false;
			if (pendingAutoSave) {
				pendingAutoSave = false;
				if (isWideComposer(mode) && text.trim() && draftKey !== lastSavedDraftKey)
					void startDraftSave(draftKey, draftSnapshot());
			}
		}
	}

	function startDraftSave(key: string, snapshot: ComposerSnapshot): Promise<boolean> {
		if (draftSaveInFlight) {
			pendingAutoSave = true;
			return draftSaveTask ?? Promise.resolve(false);
		}
		const task = persistDraft(key, snapshot);
		draftSaveTask = task;
		void task.finally(() => {
			if (draftSaveTask === task) draftSaveTask = undefined;
		});
		return task;
	}

	async function finishDraftSaves() {
		while (draftSaveTask) {
			const task = draftSaveTask;
			await task.catch(() => false);
			if (draftSaveTask === task) break;
		}
	}

	async function saveDraft() {
		if (!draftSaveable) return false;
		return startDraftSave(draftKey, draftSnapshot());
	}

	async function restoreDraft(id: string) {
		if (!empty) {
			pendingRestoreId = id;
			return;
		}
		await finishDraftSaves();
		pendingRestoreId = null;
		const draft = await drafts.restore(id);
		if (!draft) return;
		activeDraftTarget = undefined;
		lastSavedDraftKey = '';
		draftSaveStatus = 'idle';
		draftListOpen = false;
		draftError = '';
		// previewUrl は保存していないので、blob から作り直す。解放は
		// ImageAttachmentEditor / LinkCardEditor の既存ライフサイクルに任せる。
		text = draft.text;
		mentions = [...draft.mentions];
		emojis = [...(draft.emojis ?? [])];
		attachments = draft.images.map((image) => ({
			...image,
			previewUrl: URL.createObjectURL(image.blob),
		}));
		// 画像ごとにCWを選べた頃の下書きは、1枚でも付いていれば全件をぼかす側へ寄せる。
		mediaWarning = draft.images.some((image) => image.contentWarning);
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
		await finishDraftSaves();
		clearComposer();
		await restoreDraft(id);
	}

	export async function submit() {
		if (
			empty ||
			videoPending ||
			(!blog && graphemes > 3000) ||
			busy ||
			!$session ||
			articleTitleMissing ||
			!contentWarningValid ||
			!articleReady ||
			articleBlockedReason ||
			kossoriReplyBlockedReason ||
			radioScopeBlocked ||
			(scope === 'external' && !externalEligible)
		)
			return;
		// ラジオの引用先は投稿するこの時点で作る（キャンセルしたら何も残らない）。
		// 同じ回は rkey が同じなので、何度ポストしてもレコードは1つ。
		let radioRef: { uri: string; cid: string } | undefined;
		if (quoteTarget?.radio) {
			busy = true;
			error = '';
			try {
				radioRef = await createRadioRecord(quoteTarget.radio.slotKey);
			} catch {
				error = m.radioQuoteFailed();
				return;
			} finally {
				busy = false;
			}
		}
		const wantsCrosspost = scope === 'external' && externalEligible;
		const target: CrosspostTarget = {};
		if (crosspostTargetRef && replyTarget)
			target.reply = { root: crosspostTargetRef.threadRoot, parent: crosspostTargetRef.tail };
		else if (crosspostTargetRef && quoting) target.quote = crosspostTargetRef.root;
		// 投稿本文はここで確定するので、クリア前にタイトルを解決しておく。
		const article = publishesArticle ? { title: (headingTitle ?? articleTitle).trim() } : undefined;
		// ブログのタイトルは本文の先頭見出しとして保存する。こうしておくと Nagi の
		// タイムラインでも記事のタイトルが見出しとして読めるし、編集で本文を直せば
		// 記事側のタイトルも extractTitle でそのまま追従する。
		// 下書きから戻した本文などで、添付の無い Nagi の画像行が残っていたら落とす
		// （書き出すと、他のリーダーでは存在しない blob を指す壊れた画像になる）。
		// 記事の本文から行を消した画像は投稿しない。
		const postedAttachments = attachments.filter((image) => imageState(image) !== 'detached');
		const knownInline = new Set(
			postedAttachments.flatMap((image) =>
				inlineCids[image.id] ? [`${$session.did}/${inlineCids[image.id]}`] : [],
			),
		);
		const body = `${articleHeading}${blog ? pruneInlineImages(text, knownInline) : text}`;
		// メンション・チャンネル・絵文字の選択は text 上の文字オフセットなので、
		// 先頭へ見出しを差し込んだぶんだけずらしてから facet 化させる。
		const shift = <T extends { start: number; end: number }>(list: T[]) =>
			articleHeading
				? list.map((item) => ({
						...item,
						start: item.start + articleHeading.length,
						end: item.end + articleHeading.length,
					}))
				: list;
		const reply = replyTarget ? { root: replyTarget.root, parent: replyTarget.parent } : undefined;
		const replyPost = replyTarget?.post;
		const quotedPost = quoteTarget?.post ?? quotePick.post;
		const quoteRef =
			radioRef ?? (quoteTarget ? { uri: quoteTarget.uri, cid: quoteTarget.cid } : quotePick.ref);
		const draft = preparePostDraft(
			body,
			reply,
			quoteRef,
			postedAttachments,
			linkCards,
			shift(mentions),
			shift(emojis),
			kossori,
			reply ? false : botSilent,
			reply ? silentReply : false,
			selfLabels,
			video?.toRecord(),
			{ article: Boolean(article) },
		);
		// preparePostDraft の引数はすでに多いので、記事フラグは組み立て後に足す。
		if (article) draft.article = true;
		const optimisticId = optimisticPosts.add(draft, $session.did, {
			...(replyPost && { replyParent: replyPost }),
			...(quotedPost && { quote: quotedPost }),
			threadKossori: kossori,
			...(article && {
				articleTags: [...new Set([...tagsFromFacets(draft.facets), ...articleTags])],
			}),
		});
		// 表示中のフィードに楽観カードが出たらそこへ、確定したらその投稿へ画面を寄せる。
		// 出せないフィード（検索タブなど）や投稿できない画面では導線へ切り替わる。
		postFollow.begin(optimisticId, {
			...(reply ? { threadRootUri: reply.root.uri } : {}),
		});
		busy = true;
		onsendingchange?.(true);
		error = '';
		warning = '';
		draftError = '';
		try {
			const assets = await uploadPostAssets(draft);
			// 本文に書いた URL の CID が、PDS の付けた CID と一致するか確かめる。
			// 食い違うと本文の画像が存在しない blob を指すので、公開前に止める。
			if (article) {
				const uploaded = new Set(assets.images.map((image) => blobRefCid(image.image)));
				for (const key of knownInline) {
					if (!uploaded.has(key.slice(key.lastIndexOf('/') + 1)))
						throw new Error(m.articleInlineImageMismatch());
				}
			}
			// coverImage は lexicon で 1MB 未満。ヘッダーは圧縮済みだが、本文の画像が先頭の
			// ときは超えうるので、そのときはカバーを付けない（記事自体は出す）。
			const firstImage = assets.images[0]?.image;
			const cover = firstImage && usableAsCoverImage(firstImage) ? firstImage : undefined;
			const created = article
				? await publishStandardSiteDocument({
						title: article.title,
						markdown: draft.text,
						publishedAt: draft.createdAt,
						tags: [...new Set([...tagsFromFacets(draft.facets), ...articleTags])],
						...(cover ? { coverImage: cover } : {}),
						nagi: {
							facets: draft.facets,
							langs: draft.langs,
							...(assets.images.length
								? { embed: { $type: 'com.suibari.nagi.post#images', images: assets.images } }
								: {}),
							linkCards: assets.cards,
							...(draft.botSilent ? { botSilent: true } : {}),
						},
						...(draft.labels ? { labels: draft.labels } : {}),
					})
				: await createPost(draft, assets);
			optimisticPosts.markCreated(optimisticId, created);
			// タグパレットの「最近使った」。投稿に成功したタグだけを積む。
			tagFavorites.recordUsed([...tagsFromFacets(draft.facets), ...(article ? articleTags : [])]);
			postFollow.settle(created.uri, postPageHref({ uri: created.uri, article: draft.article }));
			// こっそりは AppView が正本なので、PDS から取り直させる ensureRecord は呼ばない。
			if (!draft.kossori) await ensureRecord(created.uri, created.cid).catch(() => undefined);
			if (wantsCrosspost && !article && !draft.kossori && !crosspostDraftBlock(draft))
				warning = (await crosspostAfterPost(draft, assets, target, created.uri)) ?? warning;
			const rkey = created.uri.slice(created.uri.lastIndexOf('/') + 1);
			// 記事の canonical URL。standard.site の document.path と同じ組み立て方。
			const articleUrl = `${NAGI_PUBLIC_ORIGIN}/blog/${$session.did}/${rkey}`;
			// 記事の Bluesky ティーザーは、Nagi の URL を載せるので投稿の後に出す。
			// 失敗しても記事は成立しているので、エラーではなく警告として伝える。
			let bskyPostRef: { uri: string; cid: string } | undefined;
			if (wantsCrosspost && article && !draft.cwRestricted && !draft.quote) {
				if (!getCrosspostEnabled() || !(await hasCrosspostScope()))
					warning = m.crosspostPermissionMissing();
				else
					try {
						// 記事はリンク付きの投稿通知とリンクカードを1件出す。
						// document と publication の強参照を添えると、Bluesky が記事カードで出す。
						// 取れなければ通常のリンクカードで出す（ティーザー自体は止めない）。
						const publicationRef = await getPublicationRef().catch(() => undefined);
						bskyPostRef = await crosspostArticleToBluesky(draft, assets, {
							url: articleUrl,
							title: article.title,
							teaser: m.articleCrosspostText(),
							...(publicationRef
								? { associatedRefs: [{ uri: created.uri, cid: created.cid }, publicationRef] }
								: {}),
						});
					} catch (e) {
						warning = e instanceof Error ? e.message : m.crosspostFailed();
					}
			}
			if (article && bskyPostRef) {
				await updateStandardSiteDocument(rkey, { markdown: draft.text, bskyPostRef }).catch(
					(cause) => {
						warning = cause instanceof Error ? cause.message : m.standardSiteFailed();
					},
				);
			}
			// 返信の範囲はスレッドで決まる（こっそりスレッドは固定、公開スレッドはこっそり不可）ので、
			// 次の新規投稿の既定として残さない。
			if (!replyTarget) setLastPostScope(scope);
			// 投稿開始前から進行中だった自動保存を待ち、その保存分も確実に片付ける。
			await finishDraftSaves();
			const savedDraftId = activeDraftTarget?.id;
			if (savedDraftId) await drafts.remove(savedDraftId).catch(() => undefined);
			clearComposer();
			await Promise.resolve(onposted(created.uri)).catch(() => undefined);
		} catch (e) {
			optimisticPosts.remove(optimisticId);
			postFollow.fail();
			error = postSubmissionErrorMessage(e);
		} finally {
			busy = false;
			onsendingchange?.(false);
		}
	}

	const scopeLabel = $derived(
		scope === 'kossori'
			? m.postScopeKossoriShort()
			: scope === 'external'
				? m.postScopeBlueskyShort()
				: m.postScopeFeedShort(),
	);
	const scopeIcon = $derived(
		scope === 'kossori' ? 'hide' : scope === 'external' ? 'bluesky' : 'home',
	);

	/** 記事の書き込み権限が無いときに、その場で追加の認可を取りに行く。 */
	/*
		botたんラジオの引用は、投稿するときに本人の repo へ公開レコードを書く。その権限は
		ラジオの引用で初めて要るので、無い人には投稿前に再認可を案内する（既存機能には影響しない）。
	*/
	let radioScopeReady = $state<boolean | undefined>(undefined);
	$effect(() => {
		const radio = quoteTarget?.radio;
		if (!radio) {
			radioScopeReady = undefined;
			return;
		}
		let cancelled = false;
		radioScopeReady = undefined;
		void hasRadioScope().then((ready) => {
			if (!cancelled) radioScopeReady = ready;
		});
		return () => {
			cancelled = true;
		};
	});
	const radioScopeBlocked = $derived(Boolean(quoteTarget?.radio) && radioScopeReady !== true);

	async function authorizeArticle() {
		if (!$session || reauthorizingArticle) return;
		reauthorizingArticle = true;
		try {
			await signIn($session.did, { ...(await grantedOptIns()), refreshPermissions: true });
		} finally {
			reauthorizingArticle = false;
		}
	}
</script>

<!--
	モーダル専用なので、以前タイムラインとの一体感のために付けていた吹き出し
	（.post-row.mine / .bubble のアクセント枠としっぽ）とアバターは持たない。
-->
<section class="composer" class:rich={isWideComposer(mode)} class:blog>
	{#snippet editorTools()}
		<!-- こっそりは画像を持てない。セルフラベルも統合CWメニュー側で無効にする。 -->
		{#if !kossori}
			<!-- 画像ボタンから動画も選べる。ブログには動画を載せる場所が無いので画像だけ。 -->
			<!-- ブログは standard.site の document に枚数の上限が無いので、Nagi でも絞らない。 -->
			<ImageAttachmentPicker
				bind:this={imagePicker}
				bind:attachments
				bind:video
				allowVideo={!blog}
				maxCount={blog ? Infinity : MAX_IMAGE_COUNT}
				disabled={busy}
			/>
		{/if}
	{/snippet}

	{#if replyTarget || quoteTarget}
		<div class="composer-target-box">
			{#if replyTarget}
				<div class="composer-target-card reply">
					<div class="composer-target-header">
						<div class="composer-target-badge">
							<Icon name="reply" size={14} />
							<span>{m.replyTargetLabel()}</span>
							<span class="composer-target-sub">@{replyTarget.post.author.handle}</span>
						</div>
						<button
							type="button"
							class="composer-target-remove icon-action"
							disabled={busy}
							aria-label={m.replyRemove()}
							title={m.replyRemove()}
							onclick={() => composerHost.clearReply()}
						>
							<Icon name="close" size={16} />
						</button>
					</div>
					<div class="composer-target-body">
						<Avatar actor={replyTarget.post.author} size="small" />
						<div class="composer-target-content">
							<div class="composer-target-meta">
								<span class="name"
									>{replyTarget.post.author.displayName || replyTarget.post.author.handle}</span
								>
							</div>
							<PostModerationGuard post={replyTarget.post}>
								<p class="composer-target-text">{replyTarget.post.text}</p>
							</PostModerationGuard>
						</div>
					</div>
				</div>
			{:else if quoteTarget}
				<div class="composer-target-card quote">
					<div class="composer-target-header">
						<div class="composer-target-badge">
							<Icon name="quote" size={14} />
							<span>{m.quoteTargetLabel()}</span>
							{#if quoteTarget.post}
								<span class="composer-target-sub">@{quoteTarget.post.author.handle}</span>
							{/if}
						</div>
						<button
							type="button"
							class="composer-target-remove icon-action"
							disabled={busy}
							aria-label={m.quoteRemove()}
							title={m.quoteRemove()}
							onclick={() => composerHost.clearQuote()}
						>
							<Icon name="close" size={16} />
						</button>
					</div>
					<div class="composer-target-body">
						{#if quoteTarget.post}
							<Avatar actor={quoteTarget.post.author} size="small" />
							<div class="composer-target-content">
								<div class="composer-target-meta">
									<span class="name"
										>{quoteTarget.post.author.displayName || quoteTarget.post.author.handle}</span
									>
								</div>
								<PostModerationGuard post={quoteTarget.post}>
									<p class="composer-target-text">{quoteTarget.post.text}</p>
								</PostModerationGuard>
							</div>
						{:else if quoteTarget.news}
							<div class="composer-target-content">
								<div class="composer-target-meta">
									<span class="name">{quoteTarget.news.sourceName || 'News'}</span>
								</div>
								<p class="composer-target-text">{quoteTarget.news.title}</p>
							</div>
						{:else if quoteTarget.radio}
							<div class="composer-target-content">
								<div class="composer-target-meta">
									<span class="name">{m.radioQuoteLabel()}</span>
								</div>
								<p class="composer-target-text">
									{quoteTarget.radio.artist} - {quoteTarget.radio.title}
								</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/if}
	{#if quoteTarget?.radio && radioScopeReady === false}
		<!-- 送信ボタンが押せない理由になるので、引用先のすぐ下に出す（引用欄は高さを絞っているので外に置く）。 -->
		<div class="composer-radio-permission">
			<p>{m.radioReauthNote()}</p>
			<Button
				variant="secondary"
				size="sm"
				type="button"
				disabled={reauthorizingArticle}
				onclick={authorizeArticle}
			>
				{reauthorizingArticle ? m.standardSiteReauthPending() : m.standardSiteReauthSubmit()}
			</Button>
		</div>
	{/if}

	<div class="composer-body">
		<div class="composer-main">
			{#if blog}
				<!-- タイトルは送信時に本文先頭の「# 見出し」になる（submit の articleHeading）。 -->
				<label class="composer-article-title">
					<span class="visually-hidden">{m.standardSiteTitleLabel()}</span>
					<input
						type="text"
						value={headingTitle ?? articleTitle}
						oninput={(event) => (articleTitle = event.currentTarget.value)}
						maxlength="200"
						disabled={busy}
						readonly={Boolean(headingTitle)}
						placeholder={m.standardSiteTitlePlaceholder()}
					/>
				</label>
				<p class="composer-article-note" class:blocked={Boolean(articleBlockedReason)}>
					<!-- 何か書き始めるまでは急かさない。空のまま投稿しようとした時点で理由を出す。 -->
					{articleBlockedReason ||
						(articleTitleMissing && !empty ? m.articleTitleRequired() : m.standardSiteTitleHint())}
				</p>
				{#if publishingReadinessLoaded && !standardSiteReady}
					<!--
						記事メタ欄の中に置くと、狭い画面では畳まれていて見えない。
						送信ボタンが押せない理由になるので、本文の隣に常に出す。
					-->
					<div class="composer-article-permission">
						<p>{m.standardSiteReauthNote()}</p>
						<Button
							variant="secondary"
							size="sm"
							type="button"
							disabled={reauthorizingArticle}
							onclick={authorizeArticle}
						>
							{reauthorizingArticle ? m.standardSiteReauthPending() : m.standardSiteReauthSubmit()}
						</Button>
					</div>
				{/if}
			{/if}
			<ComposerEditor
				bind:this={composerEditor}
				{ontextinput}
				{oncompositionchange}
				bind:value={text}
				bind:mentions
				bind:emojis
				placeholder={m.composerPlaceholder()}
				ariaLabel={m.composerAria()}
				disabled={busy}
				contentWarningLabelsEnabled={!kossori}
				bind:selfLabels
				mediaWarningEnabled={!kossori}
				bind:mediaWarning
				{hasMedia}
				{mode}
				embeds={editorEmbeds}
				onsubmit={() => submit()}
				onpaste={(event) => {
					// Nagi のスレッドURL単体なら引用として引き取る（そのとき本文へは入らない）。
					// それ以外は素通しするので、画像ペーストは従来どおり動く。
					// ブログは引用を持てない（記事にできなくなる）ので、URLのまま本文へ入れて
					// 通常のリンクカードとして扱わせる。
					if (isPlainPostMode(mode)) quotePick.handlePaste(event, $session?.did);
					imagePicker?.handlePaste(event);
				}}
				tools={editorTools}
			/>
			<!-- URL取得や Object URL の管理を途切れさせないため、空の間も子はマウントしておく。 -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex (スクロール領域をキーボードでも操作可能にする) -->
			<div
				class="composer-embeds"
				role="region"
				tabindex={hasEmbeds ? 0 : undefined}
				aria-label={m.composerEmbedsAria()}
				hidden={!hasEmbeds}
			>
				{#if !kossori}
					<ImageAttachmentEditor
						bind:attachments
						disabled={busy}
						hideFirst={blog && Boolean(attachments[0]?.header)}
						hiddenIds={hiddenAttachmentIds}
					/>
					<VideoAttachmentEditor bind:video disabled={busy} />
					<LinkCardEditor
						bind:this={linkCardEditor}
						{text}
						bind:cards={linkCards}
						bind:dismissedUrls
						bind:loading={linkCardLoading}
						disabled={busy}
						article={blog}
						inline={inlineEmbeds}
					/>
				{/if}
				<ComposerQuoteEditor quote={quotePick} disabled={busy} />
			</div>
		</div>
		{#if blog}
			<ComposerArticleMeta bind:attachments bind:tags={articleTags} disabled={busy} />
		{/if}
	</div>
	<div class="composer-foot">
		<button
			class="scope-button"
			type="button"
			disabled={busy || kossoriThread}
			aria-haspopup="dialog"
			aria-expanded={scopeDialogOpen}
			aria-label={m.postScopeOpenAria({ scope: scopeLabel })}
			title={kossoriThread
				? m.postScopeKossoriDetail()
				: m.postScopeOpenAria({ scope: scopeLabel })}
			onclick={() => (scopeDialogOpen = true)}
		>
			<Icon name={scopeIcon} size={15} />
			<span>{scopeLabel}</span>
		</button>
		<div class="composer-status">
			<span>{graphemes}{blog ? '' : ' / 3000'}</span>
		</div>
		<div class="draft-control">
			<button
				class="icon-action draft-open"
				type="button"
				disabled={busy}
				aria-label={m.draftListOpen()}
				title={m.draftListOpen()}
				onclick={() => (draftListOpen = true)}
				><Icon name="draft" size={18} />{#if drafts.count}<span class="draft-count"
						>{drafts.count}</span
					>{/if}</button
			>
			{#if isWideComposer(mode) && draftSaveStatus !== 'idle'}
				<span class="draft-save-status" aria-live="polite">
					{draftSaveStatus === 'saving' ? m.draftSaving() : m.draftSaved()}
				</span>
			{/if}
		</div>
		<div class="composer-submit-actions">
			{#if replyTarget}
				<button
					class="icon-action bot-silent-toggle"
					class:active={silentReply}
					type="button"
					disabled={busy}
					aria-label={silentReply ? m.silentReplyDisableTooltip() : m.silentReplyEnableTooltip()}
					aria-pressed={silentReply}
					title={silentReply ? m.silentReplyDisableTooltip() : m.silentReplyEnableTooltip()}
					onclick={() => (silentReply = !silentReply)}
				>
					<Icon name="bellOff" size={18} />
				</button>
			{:else}
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
			{/if}
			<Button
				variant="primary"
				class="submit-primary"
				type="button"
				disabled={!submittable}
				aria-label={busy ? m.composerSubmitting() : m.composerSubmitNagi()}
				title={busy
					? m.composerSubmitting()
					: videoPending
						? m.videoNotReady()
						: m.composerSubmitNagi()}
				onclick={() => submit()}
			>
				{#if busy}<Spinner inline size="sm" decorative />
				{:else}<Icon name="send" size={18} />{/if}
				<span>{busy ? m.composerSubmitting() : m.composerSubmitNagiShort()}</span>
			</Button>
		</div>
	</div>
	<!-- Bluesky には画像と動画を混ぜる embed が無いので、動画だけを送る（crosspost/bluesky.ts の buildEmbed）。 -->
	{#if scope === 'external' && video && attachments.length}<p class="draft-image-note">
			{m.crosspostVideoOnly()}
		</p>{/if}
	{#if attachments.length}<p class="draft-image-note">
			{m.draftImagesUnsupported()}
		</p>{/if}
	{#if kossoriReplyBlockedReason}<p class="error" role="status">
			{kossoriReplyBlockedReason}
		</p>{/if}
	{#if error}<p class="error" role="alert">{error}</p>{/if}{#if draftError}<p class="error">
			{draftError}
		</p>{/if}{#if warning}<p class="error">
			{m.postedWithWarning({ reason: warning })}
		</p>{/if}
</section>
{#if scopeDialogOpen}
	<PostScopeDialog
		{scope}
		{externalEligible}
		{externalDisabledReason}
		kossoriDisabled={blog || publicReply}
		kossoriDisabledReason={blog
			? m.postScopeKossoriArticle()
			: publicReply
				? m.postScopeKossoriPublicReply()
				: ''}
		onselect={(next) => {
			scope = next;
			setLastPostScope(next);
		}}
		onclose={() => (scopeDialogOpen = false)}
	/>
{/if}
{#if draftListOpen}
	<DraftListDialog
		cansave={draftSaveable && !busy}
		onsavecurrent={async () => {
			if (await saveDraft()) draftListOpen = false;
		}}
		onrestore={restoreDraft}
		onclose={() => (draftListOpen = false)}
	/>
{/if}
{#if pendingRestoreId}
	<!-- 背景クリックは取り消し扱い。他の確認ダイアログと同じ。 -->
	<div
		class="draft-backdrop"
		role="presentation"
		onclick={(event) => event.target === event.currentTarget && (pendingRestoreId = null)}
	>
		<div class="draft-dialog draft-confirm" role="dialog" aria-modal="true">
			<p>{m.draftRestoreOverwrite()}</p>
			<div class="delete-actions">
				<Button variant="secondary" type="button" onclick={() => (pendingRestoreId = null)}
					>{m.cancel()}</Button
				>
				<Button variant="danger" type="button" onclick={confirmRestore}>{m.draftRestore()}</Button>
			</div>
		</div>
	</div>
{/if}
