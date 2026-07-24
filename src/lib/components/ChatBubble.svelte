<script lang="ts">
	import type { PostView } from '$lib/api/types';
	import ReactionBar from './ReactionBar.svelte';
	import Avatar from './Avatar.svelte';
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
	import type { ImageAttachment } from '$lib/images';
	import type { LinkCardDraft } from '$lib/atproto/records';
	import LinkCard from './LinkCard.svelte';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	import ComposerEditor from './ComposerEditor.svelte';
	import InlinePostComposer from './InlinePostComposer.svelte';
	import { restorePostEditState, type MentionSelection } from '$lib/atproto/facets';
	import {
		languagePreferences,
		normalizeSupportedLanguage,
	} from '$lib/i18n/languagePreferences.svelte';
	import { buildExternalTranslationUrl } from '$lib/i18n/translationProviders';
	import { tick } from 'svelte';
	import { postFollowNotice } from '$lib/feed/post-follow.svelte';
	let {
		post,
		ondeleted,
		onposted,
		displayOnly = false,
		canPin = false,
		pinned = false,
		pinBusy = false,
		ontogglepin,
	}: {
		post: PostView;
		ondeleted?: (uri: string) => void;
		onposted?: () => void | Promise<void>;
		/** ニュースコメント等、投稿と同じ見た目だけを使う読み取り専用表示。 */
		displayOnly?: boolean;
		/** チャンネル作成者向け。投稿者に関係なく、この投稿をピン操作できる。 */
		canPin?: boolean;
		pinned?: boolean;
		pinBusy?: boolean;
		ontogglepin?: (post: PostView) => void | Promise<void>;
	} = $props();
	let expanded = $state(false);
	let overflowing = $state(false);
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
	let kossoriBusy = $state(false);
	// 編集は返信/引用と違い、下に新しい吹き出しを出さず、この投稿の吹き出し内でその場編集する。
	let editing = $state(false);
	let editText = $state('');
	let editMentions = $state<MentionSelection[]>([]);
	let editBusy = $state(false);
	let editError = $state('');
	let postRow: HTMLDivElement;
	let mine = $derived($session?.did === post.author.did);
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
			composeMode = mode;
		}
	}
	function cancelComposer() {
		composeMode = undefined;
		composeText = '';
		attachments = [];
		linkCards = [];
		mentions = [];
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
		editing = true;
	}
	function cancelEdit() {
		editing = false;
		editText = '';
		editMentions = [];
		editError = '';
	}
	const postHref = (uri: string) => {
		const [did, , rkey] = uri.slice('at://'.length).split('/');
		return `/thread/${did}/${rkey}`;
	};
	const scrollBehavior = (): ScrollBehavior =>
		window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
	function scrollTo(element?: Element | null) {
		element?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
	}
	async function submitEdit() {
		const match = /^at:\/\/[^/]+\/(com\.suibari\.nagi\.post)\/([^/]+)$/.exec(post.uri);
		if (!editText.trim() || editBusy || !$session) return;
		if (!match) {
			editError = m.editPostFailed();
			return;
		}
		// 編集は本文（text/facets/langs）だけ差し替え、createdAt・embed 等は既存値を保持する。
		const draft = preparePostDraft(editText, undefined, undefined, [], [], editMentions);
		editBusy = true;
		editError = '';
		try {
			await updatePost(match[2], draft);
			// 楽観反映: このカードの本文/facets を差し替え「編集済み」を立てる。AppView が
			// putRecord を取り込むと同じ内容へ収束するため、即時 refresh は呼ばない
			// （取り込み前は旧本文が返り楽観反映を打ち消してしまうため）。
			post.text = draft.text;
			post.facets = draft.facets as PostView['facets'];
			post.edited = true;
			editing = false;
			editText = '';
			editMentions = [];
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
			!$session
		)
			return;
		const mode = composeMode;
		postFollowNotice.clear();
		const subject = { uri: post.uri, cid: post.cid };
		// ネスト返信でも最初のルートを維持することで、公開範囲を含むスレッド設定を
		// 途中の返信が上書きしないようにする。引用は新しいスレッドなので継承しない。
		const reply =
			mode === 'reply' ? { root: post.reply?.root ?? subject, parent: subject } : undefined;
		// 返信は親の所属チャンネルを継承する（Misskey 同様、返信も CH TL に並ぶ）。
		// 引用は通常投稿として扱い、引用元の CH には入れない。
		const inheritedChannel =
			mode === 'reply' && post.channel?.cid
				? { uri: post.channel.uri, cid: post.channel.cid }
				: undefined;
		const draft = preparePostDraft(
			composeText,
			reply,
			mode === 'quote' ? subject : undefined,
			attachments,
			linkCards,
			mentions,
			// こっそりはスレッドルートだけが所有するため、返信レコードへ複製しない。
			false,
			inheritedChannel,
		);
		const optimisticId = optimisticPosts.add(draft, $session.did, {
			...(mode === 'reply' ? { replyParent: post } : {}),
			...(mode === 'quote' ? { quote: post } : {}),
			...(inheritedChannel && post.channel ? { channel: post.channel } : {}),
			threadKossori:
				mode === 'reply' ? Boolean(post.threadKossori ?? post.kossori ?? post.channelOnly) : false,
		});
		posting = true;
		postError = '';
		composeText = '';
		attachments = [];
		linkCards = [];
		mentions = [];
		composeMode = undefined;
		await tick();
		const optimisticTarget = document.querySelector(`[data-optimistic-key="${optimisticId}"]`);
		const followedImmediately = Boolean(optimisticTarget);
		scrollTo(optimisticTarget);
		try {
			// 返信・引用はNagi内の投稿文脈を参照するため、Blueskyへはクロスポストしない。
			const response = await createPost(draft);
			optimisticPosts.markCreated(optimisticId, response.data);
			await Promise.resolve(onposted?.()).catch(() => undefined);
			if (!followedImmediately) {
				// フィルター外の投稿で画面を自動遷移すると閲覧中の文脈を失うため、
				// 明示的な導線だけを提示し、移動するかはユーザーに委ねる。
				postFollowNotice.show(postHref(response.data.uri));
			}
		} catch (error) {
			optimisticPosts.remove(optimisticId);
			postError = error instanceof Error ? error.message : m.postFailed();
			await tick();
			scrollTo(postRow);
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

<div class="post-row" class:mine class:bot={post.isBot} bind:this={postRow}>
	<a href={`/profile/${post.author.did}`} aria-label={m.viewProfileAria()}
		><Avatar actor={post.author} /></a
	>
	<div class="bubble" class:sending={optimistic}>
		<div class="meta">
			<div class="meta-author">
				<a href={`/profile/${post.author.did}`}>{post.author.displayName ?? post.author.handle}</a>
				<div class="meta-badges"><ActorBadges actor={post.author} /></div>
			</div>
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
			{#if post.edited}<span class="edited-badge" aria-label={m.editedBadgeAria()}
					>{m.editedBadge()}</span
				>{/if}
		</div>
		{#if editing}
			<div class="inline-edit">
				<ComposerEditor
					id={`edit-${post.cid}`}
					bind:value={editText}
					bind:mentions={editMentions}
					placeholder={m.editPlaceholder()}
					disabled={editBusy}
					onsubmit={() => void submitEdit()}
				/>
				<div class="post-composer-foot">
					{#if editError}<span class="error" role="alert">{editError}</span>{/if}
					<button
						class="primary icon-action primary-icon"
						type="button"
						disabled={editBusy || !editText.trim()}
						aria-label={editBusy ? m.composerSubmitting() : m.composerSubmit()}
						title={editBusy ? m.composerSubmitting() : m.composerSubmit()}
						onclick={() => void submitEdit()}
						><Icon name={editBusy ? 'refresh' : 'send'} size={18} /></button
					>
				</div>
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
				onoverflowchange={(value) => (overflowing = value)}
			/>
			{#if overflowing || expanded}<button class="read" onclick={() => (expanded = !expanded)}
					>{expanded ? m.readLess() : m.readMore()}</button
				>{/if}
		{/if}{#if post.images?.length}<ImageGallery
				images={post.images}
			/>{/if}{#if post.linkCards?.length}<div class="link-cards">
				{#each post.linkCards as card}<LinkCard {card} />{/each}
			</div>{/if}{#if post.quote?.kind === 'post'}<QuoteCard post={post.quote.post} />
		{:else if post.quote?.kind === 'news'}<NewsQuoteCard news={post.quote.news} />{/if}
		{#if !displayOnly}{#if optimistic}
				<div class="post-sending" role="status" aria-live="polite">
					<span class="typing" aria-hidden="true"><i></i><i></i><i></i></span>
					<span>{m.postSending()}</span>
				</div>
			{:else}
				<ReactionBar uri={post.uri} cid={post.cid} reactions={post.reactions} />
			{/if}{/if}
		{#if !displayOnly && !post.deleted && !optimistic}
			<div class="post-actions">
				<button
					class="ghost"
					class:active={composeMode === 'reply'}
					type="button"
					aria-label={m.replyPost()}
					title={m.replyPost()}
					onclick={() => openComposer('reply')}><Icon name="reply" size={17} /></button
				>
				{#if canTranslateExternally}<button
						class="ghost"
						type="button"
						aria-label={m.translateExternally()}
						title={m.translateExternally()}
						onclick={openExternalTranslation}><Icon name="language" size={17} /></button
					>{/if}
				{#if post.isBot}<button
						class="ghost"
						class:active={composeMode === 'quote'}
						type="button"
						aria-label={m.quotePost()}
						title={m.quotePost()}
						onclick={() => openComposer('quote')}><Icon name="quote" size={17} /></button
					>{/if}
				{#if canPin}<button
						class="ghost"
						class:active={pinned}
						type="button"
						disabled={pinBusy}
						aria-pressed={pinned}
						aria-label={pinned ? m.channelUnpinPost() : m.channelPinPost()}
						title={pinned ? m.channelUnpinPost() : m.channelPinPost()}
						onclick={() => void ontogglepin?.(post)}><Icon name="pin" size={17} /></button
					>{/if}
				{#if mine}<button
						class="ghost"
						class:active={editing}
						type="button"
						aria-label={m.editPostAria()}
						title={m.editPost()}
						onclick={() => (editing ? cancelEdit() : startEdit())}
						><Icon name="edit" size={17} /></button
					>{/if}
				{#if mine && topLevel}<button
						class="ghost"
						class:active={post.kossori}
						type="button"
						disabled={kossoriBusy}
						aria-pressed={Boolean(post.kossori)}
						aria-label={post.kossori ? m.kossoriDisableAria() : m.kossoriEnableAria()}
						title={post.kossori ? m.kossoriDisable() : m.kossoriEnable()}
						onclick={toggleKossori}><Icon name="hide" size={17} /></button
					>{/if}
				{#if mine}<button
						class="ghost danger"
						type="button"
						aria-label={m.deletePostAria()}
						title={m.deletePost()}
						onclick={() => {
							deleteError = '';
							deleteOpen = true;
						}}><Icon name="trash" size={17} /></button
					>{/if}
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
		bind:attachments
		bind:linkCards
		busy={posting}
		error={postError}
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
		margin-left: 0.4rem;
		color: var(--text-muted);
		font-size: 0.75rem;
	}
	.inline-edit {
		margin-top: 0.35rem;
	}
</style>
