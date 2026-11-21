<script lang="ts">
	import type { EmojiSelection, MentionSelection } from '$lib/atproto/facets';
	import { preparePostDraft, type LinkCardDraft } from '$lib/atproto/records';
	import { checkBskyTarget, type BskyTargetStatus } from '$lib/bsky/agent';
	import { postToBluesky } from '$lib/bsky/compose';
	import { bskyPostUrl } from '$lib/bsky/links';
	import { CrosspostPartialError } from '$lib/crosspost/bluesky';
	import { postFollowNotice } from '$lib/feed/post-follow.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { MAX_IMAGE_COUNT, type ImageAttachment } from '$lib/images';
	import { composerHost, type BskyComposeTarget } from '$lib/post/composer-host.svelte';
	import { postSubmissionErrorMessage } from '$lib/post/submission-error';
	import Avatar from '../Avatar.svelte';
	import Button from '../Button.svelte';
	import ComposerEditor from '../ComposerEditor.svelte';
	import ImageAttachmentEditor from '../ImageAttachmentEditor.svelte';
	import ImageAttachmentPicker from '../ImageAttachmentPicker.svelte';
	import LinkCardEditor from '../LinkCardEditor.svelte';
	import PostDeleteDialog from '../PostDeleteDialog.svelte';
	import Spinner from '../Spinner.svelte';
	import Icon from '../shell/Icon.svelte';

	/**
	 * Bluesky 投稿への返信・引用（BSKY-09）。Bluesky にだけ投稿し、Nagi の投稿と下書きは作らない。
	 * こっそり・CW・Nagi の絵文字のように Bluesky で意味を持たないものは出さない。
	 */
	let {
		target,
		submittable = $bindable(false),
		onsendingchange,
	}: {
		target: BskyComposeTarget;
		submittable?: boolean;
		onsendingchange?: (sending: boolean) => void;
	} = $props();

	let text = $state('');
	let mentions = $state<MentionSelection[]>([]);
	let emojis = $state<EmojiSelection[]>([]);
	let attachments = $state<ImageAttachment[]>([]);
	let linkCards = $state<LinkCardDraft[]>([]);
	let dismissedUrls = $state<string[]>([]);
	let linkCardLoading = $state<string[]>([]);
	let imageProcessing = $state(false);
	let busy = $state(false);
	let error = $state('');
	let discardOpen = $state(false);
	let imagePicker = $state<ImageAttachmentPicker>();

	const reply = $derived(target.kind === 'reply');
	const viewer = $derived(target.post.raw.viewer);
	const blockedMessage = $derived(
		reply && viewer?.replyDisabled
			? m.bskyReplyDisabled()
			: !reply && viewer?.embeddingDisabled
				? m.bskyQuoteDisabled()
				: '',
	);
	const graphemes = $derived(
		[...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(text)].length,
	);
	const hasContent = $derived(Boolean(text.trim() || attachments.length || linkCards.length));
	const dirty = $derived(hasContent || mentions.length > 0);
	// 引用は本文なしでも埋め込みだけで成り立つ。返信は何か書く必要がある。
	const canPost = $derived(reply ? hasContent : true);
	$effect(() => {
		submittable = canPost && !blockedMessage && !busy && !imageProcessing && graphemes <= 3000;
	});

	const statusMessage = (status: BskyTargetStatus) =>
		status === 'gone'
			? m.bskyTargetGone()
			: status === 'reply-disabled'
				? m.bskyReplyDisabled()
				: m.bskyQuoteDisabled();

	function reset() {
		text = '';
		mentions = [];
		emojis = [];
		attachments = [];
		linkCards = [];
		dismissedUrls = [];
		error = '';
	}

	export async function submit() {
		if (!submittable) return;
		busy = true;
		onsendingchange?.(true);
		error = '';
		try {
			const status = await checkBskyTarget(target.post.uri, target.kind);
			if (status !== 'ok') {
				error = statusMessage(status);
				return;
			}
			const draft = preparePostDraft(
				text,
				undefined,
				undefined,
				attachments,
				linkCards,
				mentions,
				emojis,
			);
			const created = await postToBluesky(draft, target);
			reset();
			composerHost.hide();
			postFollowNotice.showBluesky(bskyPostUrl(created.uri) ?? target.post.url ?? '');
		} catch (cause) {
			if (cause instanceof CrosspostPartialError) {
				// 途中まで投稿できている。同じ内容で送り直すと重複するので、閉じて伝える。
				reset();
				composerHost.hide();
				const first = cause.posts[0];
				postFollowNotice.showBluesky(
					bskyPostUrl(first.uri) ?? target.post.url ?? '',
					m.bskyPostPartial(),
				);
				return;
			}
			console.warn('[BskyComposer] post failed', cause);
			error = postSubmissionErrorMessage(cause);
		} finally {
			busy = false;
			onsendingchange?.(false);
		}
	}

	/** 閉じる操作。書きかけがあれば破棄してよいか確かめる。 */
	export function requestClose() {
		if (busy) return;
		if (dirty) discardOpen = true;
		else composerHost.hide();
	}

	function discard() {
		discardOpen = false;
		reset();
		composerHost.hide();
	}
</script>

<section class="composer bsky-composer">
	<div class="composer-target-box">
		<div class="composer-target-card" class:reply class:quote={!reply}>
			<div class="composer-target-header">
				<div class="composer-target-badge">
					<Icon name={reply ? 'reply' : 'quote'} size={14} />
					<span>{reply ? m.replyTargetLabel() : m.quoteTargetLabel()}</span>
					<span class="composer-target-sub">@{target.post.author.handle}</span>
				</div>
			</div>
			<div class="composer-target-body">
				<Avatar actor={target.post.author} size="small" />
				<div class="composer-target-content">
					<div class="composer-target-meta">
						<span class="name">{target.post.author.displayName ?? target.post.author.handle}</span>
					</div>
					<p class="composer-target-text">{target.post.text}</p>
				</div>
			</div>
		</div>
	</div>

	<p class="bsky-destination"><Icon name="bluesky" size={14} />{m.bskyComposeDestination()}</p>

	{#if blockedMessage}
		<p class="error" role="alert">{blockedMessage}</p>
	{:else}
		<div class="composer-write">
			<ComposerEditor
				bind:value={text}
				bind:mentions
				bind:emojis
				emojiPickerEnabled={false}
				contentWarningEnabled={false}
				placeholder={reply ? m.bskyReplyPlaceholder() : m.bskyQuotePlaceholder()}
				ariaLabel={reply ? m.bskyReplyTitle() : m.bskyQuoteTitle()}
				disabled={busy}
				mode="simple"
				onsubmit={() => void submit()}
				onpaste={(event) => imagePicker?.handlePaste(event)}
			>
				{#snippet tools()}
					<ImageAttachmentPicker
						bind:this={imagePicker}
						bind:attachments
						bind:processing={imageProcessing}
						maxCount={MAX_IMAGE_COUNT}
						disabled={busy}
					/>
				{/snippet}
			</ComposerEditor>
			<div
				class="composer-embeds"
				hidden={!attachments.length && !linkCards.length && !linkCardLoading.length}
			>
				<ImageAttachmentEditor bind:attachments disabled={busy} />
				<LinkCardEditor
					{text}
					bind:cards={linkCards}
					bind:dismissedUrls
					bind:loading={linkCardLoading}
					disabled={busy}
				/>
			</div>
		</div>
	{/if}

	{#if error}<p class="error" role="alert">{error}</p>{/if}

	<div class="composer-foot">
		<div class="composer-status bsky-composer-status">
			<span>{graphemes} / 3000</span>
		</div>
		<div class="composer-submit-actions">
			<Button
				variant="primary"
				class="submit-primary"
				type="button"
				disabled={!submittable}
				aria-label={busy ? m.composerSubmitting() : m.bskyComposeSubmit()}
				title={busy ? m.composerSubmitting() : m.bskyComposeSubmit()}
				onclick={() => void submit()}
			>
				{#if busy}<Spinner inline size="sm" decorative />
				{:else}<Icon name="send" size={18} />{/if}
				<span>{busy ? m.composerSubmitting() : m.bskyComposeSubmitShort()}</span>
			</Button>
		</div>
	</div>
</section>

{#if discardOpen}
	<PostDeleteDialog
		title={m.bskyDiscardTitle()}
		message={m.bskyDiscardBody()}
		confirmLabel={m.bskyDiscardConfirm()}
		onconfirm={discard}
		oncancel={() => (discardOpen = false)}
	/>
{/if}

<style>
	.bsky-destination {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 0;
		color: var(--text-muted);
		font-size: 12px;
	}
	.bsky-composer-status {
		margin-right: auto;
	}
	.error {
		margin: 0;
		color: var(--danger);
		font-size: 13px;
	}
</style>
