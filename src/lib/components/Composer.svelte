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
	let { onposted }: { onposted: () => void | Promise<void> } = $props();
	let text = $state('');
	let busy = $state(false);
	let error = $state('');
	let warning = $state('');
	let attachments = $state<ImageAttachment[]>([]);
	let linkCards = $state<LinkCardDraft[]>([]);
	let mentions = $state<MentionSelection[]>([]);
	let dismissedUrls = $state<string[]>([]);
	let draftListOpen = $state(false);
	let draftError = $state('');
	let pendingRestoreId = $state<string | null>(null);
	let loadedDid = $state<string | undefined>(undefined);

	let empty = $derived(!text.trim() && !attachments.length && !linkCards.length);

	$effect(() => {
		const did = $session?.did;
		if (did !== loadedDid) {
			loadedDid = did;
			void drafts.load(did);
		}
	});

	function clearComposer() {
		text = '';
		attachments = [];
		linkCards = [];
		mentions = [];
		dismissedUrls = [];
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
		if (empty || busy || !$session) return;
		const draft = preparePostDraft(text, undefined, undefined, attachments, linkCards, mentions);
		const optimisticId = optimisticPosts.add(draft, $session.did);
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
			if (getCrosspostEnabled() && (await hasCrosspostScope())) {
				try {
					await crosspostToBluesky(draft, assets);
				} catch (e) {
					warning = e instanceof Error ? e.message : m.crosspostFailed();
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
		<ComposerEditor
			bind:value={text}
			bind:mentions
			placeholder={m.composerPlaceholder()}
			ariaLabel={m.composerAria()}
			disabled={busy}
			onsubmit={submit}
		/>
		<ImageAttachmentEditor bind:attachments disabled={busy} />
		<LinkCardEditor {text} bind:cards={linkCards} bind:dismissedUrls disabled={busy} />
		<div class="composer-foot">
			<span
				>{[...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(text)].length} / 3000</span
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
				disabled={busy || empty}
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
