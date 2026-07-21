<script lang="ts">
	import { createPost, preparePostDraft } from '$lib/atproto/records';
	import { m } from '$lib/i18n/i18n.svelte';
	import type { ImageAttachment } from '$lib/images';
	import ImageAttachmentEditor from './ImageAttachmentEditor.svelte';
	import LinkCardEditor from './LinkCardEditor.svelte';
	import type { LinkCardDraft } from '$lib/atproto/records';
	import { session } from '$lib/oauth/session.svelte';
	import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';
	import MentionTextarea from './MentionTextarea.svelte';
	import Icon from './shell/Icon.svelte';
	import Avatar from './Avatar.svelte';
	import { myProfile } from '$lib/profile/me.svelte';
	import type { MentionSelection } from '$lib/atproto/facets';
	let { onposted }: { onposted: () => void | Promise<void> } = $props();
	let text = $state('');
	let busy = $state(false);
	let error = $state('');
	let attachments = $state<ImageAttachment[]>([]);
	let linkCards = $state<LinkCardDraft[]>([]);
	let mentions = $state<MentionSelection[]>([]);
	async function submit() {
		if ((!text.trim() && !attachments.length && !linkCards.length) || busy || !$session) return;
		const draft = preparePostDraft(text, undefined, undefined, attachments, linkCards, mentions);
		const optimisticId = optimisticPosts.add(draft, $session.did);
		busy = true;
		error = '';
		text = '';
		attachments = [];
		linkCards = [];
		mentions = [];
		try {
			const response = await createPost(draft);
			optimisticPosts.markCreated(optimisticId, response.data);
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
		<MentionTextarea
			bind:value={text}
			bind:mentions
			placeholder={m.composerPlaceholder()}
			ariaLabel={m.composerAria()}
			disabled={busy}
		/>
		<ImageAttachmentEditor bind:attachments disabled={busy} />
		<LinkCardEditor {text} bind:cards={linkCards} disabled={busy} />
		<div class="composer-foot">
			<span
				>{[...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(text)].length} / 3000</span
			><button
				class="submit icon-action primary-icon"
				type="button"
				disabled={busy || (!text.trim() && !attachments.length && !linkCards.length)}
				aria-label={busy ? m.composerSubmitting() : m.composerSubmit()}
				title={busy ? m.composerSubmitting() : m.composerSubmit()}
				onclick={submit}><Icon name={busy ? 'refresh' : 'send'} size={18} /></button
			>
		</div>
		{#if error}<p class="error">{error}</p>{/if}
	</section>
</div>
