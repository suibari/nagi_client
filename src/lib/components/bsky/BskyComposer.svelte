<script lang="ts">
	import type { MentionSelection } from '$lib/atproto/facets';
	import { preparePostDraft, type LinkCardDraft } from '$lib/atproto/records';
	import { applyBskyGates, checkBskyTarget, type BskyTargetStatus } from '$lib/bsky/agent';
	import { DEFAULT_BSKY_GATES, type BskyGateSettings } from '$lib/bsky/gates';
	import BskyGateControls from './BskyGateControls.svelte';
	import { postToBluesky } from '$lib/bsky/compose';
	import { bskyPostUrl } from '$lib/bsky/links';
	import { CrosspostPartialError } from '$lib/crosspost/bluesky';
	import { postFollowNotice } from '$lib/feed/post-follow.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { MAX_IMAGE_COUNT, type ImageAttachment } from '$lib/images';
	import { session } from '$lib/oauth/session.svelte';
	import { composerHost, type BskyComposeTarget } from '$lib/post/composer-host.svelte';
	import { postSubmissionErrorMessage } from '$lib/post/submission-error';
	import ComposerTargetCard from '../ComposerTargetCard.svelte';
	import Button from '../Button.svelte';
	import ComposerEditor from '../ComposerEditor.svelte';
	import ImageAttachmentEditor from '../ImageAttachmentEditor.svelte';
	import ImageAttachmentPicker from '../ImageAttachmentPicker.svelte';
	import LinkCardEditor from '../LinkCardEditor.svelte';
	import PostDeleteDialog from '../PostDeleteDialog.svelte';
	import Spinner from '../Spinner.svelte';
	import Icon from '../shell/Icon.svelte';

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
	let attachments = $state<ImageAttachment[]>([]);
	let linkCards = $state<LinkCardDraft[]>([]);
	let dismissedUrls = $state<string[]>([]);
	let linkCardLoading = $state<string[]>([]);
	let imageProcessing = $state(false);
	let busy = $state(false);
	let error = $state('');
	let discardOpen = $state(false);
	let gates = $state<BskyGateSettings>({ ...DEFAULT_BSKY_GATES });
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
		attachments = [];
		linkCards = [];
		dismissedUrls = [];
		error = '';
		gates = { ...DEFAULT_BSKY_GATES };
	}

	export async function submit() {
		if (!submittable) return;
		const owner = $session;
		busy = true;
		onsendingchange?.(true);
		error = '';
		try {
			const status = await checkBskyTarget(target.post.uri, target.kind);
			if ($session !== owner) return;
			if (status !== 'ok') {
				error = statusMessage(status);
				return;
			}
			const draft = preparePostDraft(text, undefined, undefined, attachments, linkCards, mentions);
			const created = await postToBluesky(draft, target);
			if ($session !== owner) return;
			// 返信の制限はスレッドの先頭にだけ効く。引用は新しいスレッドの先頭になる。
			const gateWarning = await applyBskyGates(
				{
					replyRoot: reply ? undefined : created.ref.root.uri,
					posts: created.posts.map((post) => post.uri),
				},
				gates,
			).then(
				() => undefined,
				(cause) => {
					console.warn('[BskyComposer] gates failed', cause);
					return m.bskyGatesFailed();
				},
			);
			if ($session !== owner) return;
			reset();
			composerHost.hide();
			postFollowNotice.showBluesky(
				bskyPostUrl(created.ref.root.uri) ?? target.post.url ?? '',
				gateWarning,
			);
		} catch (cause) {
			if ($session !== owner) return;
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
	<ComposerTargetCard kind={target.kind} author={target.post.author}>
		<p class="composer-target-text">{target.post.text}</p>
	</ComposerTargetCard>

	<p class="bsky-destination"><Icon name="bluesky" size={14} />{m.bskyComposeDestination()}</p>

	{#if blockedMessage}
		<p class="error" role="alert">{blockedMessage}</p>
	{:else}
		<div class="composer-write">
			<ComposerEditor
				bind:value={text}
				bind:mentions
				unicodeEmojiOnly
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

	{#if !blockedMessage}
		<details class="bsky-gates-box">
			<summary>{m.bskyGatesTitle()}</summary>
			<BskyGateControls bind:settings={gates} replyApplicable={!reply} disabled={busy} />
		</details>
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
	.bsky-gates-box summary {
		width: fit-content;
		color: var(--text-muted);
		font-size: 12px;
		cursor: pointer;
	}
	.bsky-gates-box[open] summary {
		margin-bottom: 8px;
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
