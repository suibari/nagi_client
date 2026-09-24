<script lang="ts">
	import { composerHost } from '$lib/post/composer-host.svelte';
	import Avatar from './Avatar.svelte';
	import QuoteCard from './QuoteCard.svelte';
	import PostModerationGuard from './PostModerationGuard.svelte';
	import NewsQuoteCard from './NewsQuoteCard.svelte';
	import { untrack } from 'svelte';
	import { createPost, preparePostDraft, uploadPostAssets } from '$lib/atproto/records';
	import { crosspostArticleToBluesky, crosspostToBluesky } from '$lib/crosspost/bluesky';
	import { getCrosspostEnabled, hasCrosspostScope } from '$lib/crosspost/preferences';
	import { m } from '$lib/i18n/i18n.svelte';
	import type { ImageAttachment } from '$lib/images';
	import ImageAttachmentEditor from './ImageAttachmentEditor.svelte';
	import ImageAttachmentPicker from './ImageAttachmentPicker.svelte';
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
	import {
		validChannelSelections,
		type ChannelSelection,
		type EmojiSelection,
		type MentionSelection,
	} from '$lib/atproto/facets';
	import {
		drafts,
		DraftStorageError,
		type ComposerSnapshot,
		type DraftSaveTarget,
	} from '$lib/drafts/drafts.svelte';
	import DraftListDialog from './DraftListDialog.svelte';
	import { extractTitle } from '$lib/atproto/markdown';
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
	import ComposerArticleMeta from './ComposerArticleMeta.svelte';
	import { isWideComposer, type ComposerMode } from '$lib/post/composer-mode';
	import { hasContentWarning, validContentWarningSyntax } from '$lib/atproto/contentWarning';
	import { postSubmissionErrorMessage } from '$lib/post/submission-error';
	import {
		restorePostScope,
		scopeAfterExternalEligibility,
		setLastPostScope,
		type PostScope,
	} from '$lib/post/scope';
	// channel を渡すとチャンネル投稿になる（CH ページから使う）。CH 限定は投稿範囲の
	// 「こっそり」で表現する（レコード上は kossori）。
	let {
		onposted,
		onsendingchange,
		ontextinput,
		oncompositionchange,
		channel,
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
		channel?: { uri: string; cid: string; name?: string };
		defaultScope?: PostScope;
		mode?: ComposerMode;
		publishingPreferencesVersion?: number;
		/** ポストおたすけが書きかけを読むためだけに外へ出す。 */
		text?: string;
		/** モーダルヘッダーなど、コンポーザ外の送信ボタンへ状態を渡す。 */
		submittable?: boolean;
	} = $props();
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
	let draftSaveStatus = $state<'idle' | 'saving' | 'saved'>('idle');
	let activeDraftTarget = $state<DraftSaveTarget>();
	let lastSavedDraftKey = $state('');
	let pendingRestoreId = $state<string | null>(null);
	let loadedDid = $state<string | undefined>(undefined);
	let crosspostReady = $state(false);
	let botSilent = $state(false);
	let silentReply = $state(false);
	let selfLabels = $state<string[]>([]);
	let publishingLoadVersion = 0;
	let draftSaveInFlight = false;
	let draftSaveTask: Promise<boolean> | undefined;
	let pendingAutoSave = false;
	// こっそりでは画像ピッカー自体をマウントしないので、バインドが付いたり外れたりする。
	let imagePicker = $state<{ handlePaste: (event: ClipboardEvent) => void }>();

	let empty = $derived(!text.trim() && !attachments.length && !linkCards.length);
	let draftSaveable = $derived(Boolean(text.trim() || linkCards.length || quotePick.ref));
	let draftKey = $derived(
		JSON.stringify({
			text,
			mentions,
			channels: channels.map(({ start, end, uri, name }) => ({ start, end, uri, name })),
			emojis: emojis.map(({ start, end, emoji }) => ({ start, end, uri: emoji.uri })),
			linkCards: linkCards.map(({ uri, title, description }) => ({ uri, title, description })),
			dismissedUrls,
			quoteUri: quotePick.ref?.uri,
		}),
	);
	let hasEmbeds = $derived(
		Boolean(
			attachments.length - (mode === 'blog' && attachments.length ? 1 : 0) ||
			linkCards.length ||
			quotePick.pending ||
			quotePick.post ||
			quotePick.error,
		),
	);
	$effect(() => {
		submittable =
			!busy &&
			!empty &&
			(blog || graphemes <= 3000) &&
			!articleTitleMissing &&
			contentWarningValid &&
			articleReady &&
			!articleBlockedReason;
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
		if (linkCards.length) linkCards = [];
	});
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
	/**
	 * Bluesky にも出せる条件。
	 *
	 * 引用付きは外部へ出せない。Bluesky の embed には Nagi のレコードを載せられず
	 * （crosspost/bluesky.ts の buildEmbed は images / external のみ）、参照が黙って消える。
	 * 記事化にも同じ条件が要る（引用は記事本文に現れない）ので、判定は1本のまま使う。
	 */
	const externalEligible = $derived(
		crosspostReady &&
			!effectiveChannel &&
			!hasContentWarningSetting &&
			!quotePick.active &&
			!composerHost.replyTarget &&
			!composerHost.quoteTarget,
	);
	const externalDisabledReason = $derived(
		!crosspostReady
			? m.postScopeExternalUnavailable()
			: effectiveChannel
				? m.postScopeExternalChannel()
				: hasContentWarningSetting
					? m.crosspostDisabledContentWarning()
					: quotePick.active
						? m.quoteExternalDisabled()
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
	 * （こっそり・チャンネル）、外部コピーを作らない投稿（CW）、本文に現れない参照を
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
			: effectiveChannel
				? m.articleChannelDisabled()
				: kossori
					? m.postScopeKossoriArticle()
					: hasContentWarningSetting
						? m.articleContentWarningDisabled()
						: quotePick.active || composerHost.quoteTarget || composerHost.replyTarget
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
		const target = composerHost.replyTarget;
		if (!target) return false;
		return isAppviewOwnedUri(target.root.uri) || Boolean(target.post.kossori);
	});
	$effect(() => {
		if (kossoriThread && scope !== 'kossori') scope = 'kossori';
	});
	// ブログは公開レコードとして外から読まれるので、こっそりにはできない
	// （standardsite/preferences.ts の isArticleCandidate と同じ線引き）。
	$effect(() => {
		if (blog && scope === 'kossori') scope = 'feed';
	});
	// 外部に出せない状態に変わったら黙って1段階狭める（意図せぬ公開を作らない）。
	// OAuth scope の再確認中は前回値を保持し、利用不能だと確定してからだけ狭める。
	$effect(() => {
		const next = scopeAfterExternalEligibility(scope, publishingReadinessLoaded, externalEligible);
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
		linkCards = [];
		mentions = [];
		channels = [];
		emojis = [];
		dismissedUrls = [];
		quotePick.clear();
		composerHost.clearAllTargets();
		scope = restorePostScope(defaultScope);
		articleTitle = '';
		articleTags = [];
		botSilent = false;
		silentReply = false;
		selfLabels = [];
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
			channels,
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
		await finishDraftSaves();
		clearComposer();
		await restoreDraft(id);
	}

	export async function submit() {
		if (
			empty ||
			(!blog && graphemes > 3000) ||
			busy ||
			!$session ||
			articleTitleMissing ||
			!contentWarningValid ||
			!articleReady ||
			articleBlockedReason
		)
			return;
		const wantsCrosspost = scope === 'external' && externalEligible;
		// 投稿本文はここで確定するので、クリア前にタイトルを解決しておく。
		const article = publishesArticle ? { title: (headingTitle ?? articleTitle).trim() } : undefined;
		// ブログのタイトルは本文の先頭見出しとして保存する。こうしておくと Nagi の
		// タイムラインでも記事のタイトルが見出しとして読めるし、編集で本文を直せば
		// 記事側のタイトルも extractTitle でそのまま追従する。
		const body = `${articleHeading}${text}`;
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
		const reply = composerHost.replyTarget
			? { root: composerHost.replyTarget.root, parent: composerHost.replyTarget.parent }
			: undefined;
		const replyPost = composerHost.replyTarget?.post;
		const quotedPost = composerHost.quoteTarget?.post ?? quotePick.post;
		const quoteRef = composerHost.quoteTarget
			? { uri: composerHost.quoteTarget.uri, cid: composerHost.quoteTarget.cid }
			: quotePick.ref;
		const draft = preparePostDraft(
			body,
			reply,
			quoteRef,
			attachments,
			linkCards,
			shift(mentions),
			shift(channels),
			shift(emojis),
			kossori,
			effectiveChannel ? { uri: effectiveChannel.uri, cid: effectiveChannel.cid } : undefined,
			reply ? false : botSilent,
			reply ? silentReply : false,
			selfLabels,
		);
		// preparePostDraft の引数はすでに多いので、記事フラグは組み立て後に足す。
		if (article) draft.article = true;
		const optimisticId = optimisticPosts.add(draft, $session.did, {
			...(replyPost && { replyParent: replyPost }),
			...(quotedPost && { quote: quotedPost }),
			...(effectiveChannel && { channel: effectiveChannel }),
			threadKossori: kossori,
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
			const cover = assets.images[0]?.image;
			if (article && cover && !usableAsCoverImage(cover)) throw new Error(m.articleCoverTooLarge());
			const created = article
				? await publishStandardSiteDocument({
					title: article.title, markdown: draft.text, publishedAt: draft.createdAt,
					tags: [...new Set([...tagsFromFacets(draft.facets), ...articleTags])],
					...(cover ? { coverImage: cover } : {}),
					nagi: {
						facets: draft.facets, langs: draft.langs,
						...(assets.images.length ? { embed: { $type: 'com.suibari.nagi.post#images', images: assets.images } } : {}),
						linkCards: assets.cards,
						...(draft.botSilent ? { botSilent: true } : {}),
					},
					...(draft.labels ? { labels: draft.labels } : {}),
				})
				: await createPost(draft, assets);
			optimisticPosts.markCreated(optimisticId, created);
			postFollow.settle(created.uri, postPageHref({ uri: created.uri, article: draft.article }));
			// こっそりは AppView が正本なので、PDS から取り直させる ensureRecord は呼ばない。
			if (!draft.kossori) await ensureRecord(created.uri, created.cid).catch(() => undefined);
			const rkey = created.uri.slice(created.uri.lastIndexOf('/') + 1);
			// 記事の canonical URL。standard.site の document.path と同じ組み立て方。
			const articleUrl = `${NAGI_PUBLIC_ORIGIN}/blog/${$session.did}/${rkey}`;
			// Bluesky へのクロスポストは失敗しても Nagi の投稿は成立しているので、
			// エラーではなく警告として伝える。
			// 引用はNagi内のレコードを参照するため、Blueskyへはクロスポストしない
			// （返信・引用の既存方針と同じ）。scope 側でも外部を選べなくしてある。
			let bskyPostRef: { uri: string; cid: string } | undefined;
			if (
				wantsCrosspost &&
				!draft.kossori &&
				!draft.channel &&
				!draft.cwRestricted &&
				!draft.quote
			) {
				if (!getCrosspostEnabled() || !(await hasCrosspostScope()))
					warning = m.crosspostPermissionMissing();
				else
					try {
						// 記事は分割連投にせず、抜粋と Nagi への誘導リンクだけを1件出す。
						bskyPostRef = article
							? await crosspostArticleToBluesky(draft, assets, {
									url: articleUrl,
									title: article.title,
									teaser: m.articleTeaserSuffix({ url: articleUrl }),
								})
							: await crosspostToBluesky(draft, assets);
					} catch (e) {
						warning = e instanceof Error ? e.message : m.crosspostFailed();
					}
			}
			if (article && bskyPostRef) {
				await updateStandardSiteDocument(rkey, { markdown: draft.text, bskyPostRef })
					.catch((cause) => { warning = cause instanceof Error ? cause.message : m.standardSiteFailed(); });
			}
			setLastPostScope(scope);
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
				: effectiveChannel
					? (effectiveChannel.name ?? m.postScopeChannelShort())
					: m.postScopeFeedShort(),
	);
	const scopeIcon = $derived(
		scope === 'kossori'
			? 'hide'
			: scope === 'external'
				? 'bluesky'
				: effectiveChannel
					? 'hash'
					: 'home',
	);

	/** 記事の書き込み権限が無いときに、その場で追加の認可を取りに行く。 */
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
			<ImageAttachmentPicker bind:this={imagePicker} bind:attachments disabled={busy} />
		{/if}
	{/snippet}

	{#if composerHost.replyTarget || composerHost.quoteTarget}
		<div class="composer-target-box">
			{#if composerHost.replyTarget}
				<div class="composer-target-card reply">
					<div class="composer-target-header">
						<div class="composer-target-badge">
							<Icon name="reply" size={14} />
							<span>{m.replyTargetLabel()}</span>
							<span class="composer-target-sub">@{composerHost.replyTarget.post.author.handle}</span
							>
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
						<Avatar actor={composerHost.replyTarget.post.author} size="small" />
						<div class="composer-target-content">
							<div class="composer-target-meta">
								<span class="name"
									>{composerHost.replyTarget.post.author.displayName ||
										composerHost.replyTarget.post.author.handle}</span
								>
							</div>
							<PostModerationGuard post={composerHost.replyTarget.post}>
								<p class="composer-target-text">{composerHost.replyTarget.post.text}</p>
							</PostModerationGuard>
						</div>
					</div>
				</div>
			{:else if composerHost.quoteTarget}
				<div class="composer-target-card quote">
					<div class="composer-target-header">
						<div class="composer-target-badge">
							<Icon name="quote" size={14} />
							<span>{m.quoteTargetLabel()}</span>
							{#if composerHost.quoteTarget.post}
								<span class="composer-target-sub"
									>@{composerHost.quoteTarget.post.author.handle}</span
								>
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
						{#if composerHost.quoteTarget.post}
							<Avatar actor={composerHost.quoteTarget.post.author} size="small" />
							<div class="composer-target-content">
								<div class="composer-target-meta">
									<span class="name"
										>{composerHost.quoteTarget.post.author.displayName ||
											composerHost.quoteTarget.post.author.handle}</span
									>
								</div>
								<PostModerationGuard post={composerHost.quoteTarget.post}>
									<p class="composer-target-text">{composerHost.quoteTarget.post.text}</p>
								</PostModerationGuard>
							</div>
						{:else if composerHost.quoteTarget.news}
							<div class="composer-target-content">
								<div class="composer-target-meta">
									<span class="name">{composerHost.quoteTarget.news.sourceName || 'News'}</span>
								</div>
								<p class="composer-target-text">{composerHost.quoteTarget.news.title}</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}
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
						<button
							type="button"
							class="ghost"
							disabled={reauthorizingArticle}
							onclick={authorizeArticle}
						>
							{reauthorizingArticle ? m.standardSiteReauthPending() : m.standardSiteReauthSubmit()}
						</button>
					</div>
				{/if}
			{/if}
			<ComposerEditor
				{ontextinput}
				{oncompositionchange}
				bind:value={text}
				bind:mentions
				bind:channels
				bind:emojis
				channelSuggestionsEnabled={!channel}
				placeholder={m.composerPlaceholder()}
				ariaLabel={m.composerAria()}
				disabled={busy}
				contentWarningLabelsEnabled={!kossori}
				bind:selfLabels
				{mode}
				onsubmit={() => submit()}
				onpaste={(event) => {
					// Nagi のスレッドURL単体なら引用として引き取る（そのとき本文へは入らない）。
					// それ以外は素通しするので、画像ペーストは従来どおり動く。
					quotePick.handlePaste(event, $session?.did);
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
					<ImageAttachmentEditor bind:attachments disabled={busy} hideFirst={blog} />
					<LinkCardEditor {text} bind:cards={linkCards} bind:dismissedUrls disabled={busy} />
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
			{#if composerHost.replyTarget}
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
			<button
				class="submit-primary"
				type="button"
				disabled={busy ||
					empty ||
					(!blog && graphemes > 3000) ||
					articleTitleMissing ||
					!contentWarningValid ||
					!articleReady ||
					Boolean(articleBlockedReason)}
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
	{#if attachments.length}<p class="draft-image-note">
			{m.draftImagesUnsupported()}
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
		kossoriDisabled={blog}
		kossoriDisabledReason={blog ? m.postScopeKossoriArticle() : ''}
		channelName={effectiveChannel?.name}
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
				<button type="button" class="ghost" onclick={() => (pendingRestoreId = null)}
					>{m.cancel()}</button
				>
				<button type="button" class="danger" onclick={confirmRestore}>{m.draftRestore()}</button>
			</div>
		</div>
	</div>
{/if}
