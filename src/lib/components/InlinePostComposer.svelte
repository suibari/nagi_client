<script lang="ts">
	import type { MentionSelection } from '$lib/atproto/facets';
	import type { LinkCardDraft } from '$lib/atproto/records';
	import type { ImageAttachment } from '$lib/images';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { myProfile } from '$lib/profile/me.svelte';
	import Avatar from './Avatar.svelte';
	import ComposerEditor from './ComposerEditor.svelte';
	import ImageAttachmentEditor from './ImageAttachmentEditor.svelte';
	import LinkCardEditor from './LinkCardEditor.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		id,
		label,
		placeholder,
		text = $bindable(),
		mentions = $bindable(),
		attachments = $bindable(),
		linkCards = $bindable(),
		busy = false,
		error = '',
		onsubmit,
		oncancel,
	}: {
		id: string;
		label: string;
		placeholder: string;
		text: string;
		mentions: MentionSelection[];
		attachments: ImageAttachment[];
		linkCards: LinkCardDraft[];
		busy?: boolean;
		error?: string;
		onsubmit: () => void;
		oncancel: () => void;
	} = $props();

	let empty = $derived(!text.trim() && !attachments.length && !linkCards.length);
</script>

<div class="post-row mine composer-row">
	<a href={`/profile/${$session?.did}`} aria-label={m.myProfileAria()}
		><Avatar actor={myProfile.current} /></a
	>
	<section class="bubble post-composer">
		<label for={id}>{label}</label>
		<ComposerEditor {id} bind:value={text} bind:mentions {placeholder} disabled={busy} {onsubmit} />
		<ImageAttachmentEditor bind:attachments disabled={busy} />
		<LinkCardEditor {text} bind:cards={linkCards} disabled={busy} />
		<div class="post-composer-foot">
			{#if error}<span class="error" role="alert">{error}</span>{/if}
			<button
				class="ghost icon-action"
				type="button"
				disabled={busy}
				aria-label={m.cancel()}
				title={m.cancel()}
				onclick={oncancel}><Icon name="cancel" size={18} /></button
			>
			<button
				class="primary icon-action primary-icon"
				type="button"
				disabled={busy || empty}
				aria-label={busy ? m.composerSubmitting() : m.composerSubmit()}
				title={busy ? m.composerSubmitting() : m.composerSubmit()}
				onclick={onsubmit}><Icon name={busy ? 'refresh' : 'send'} size={18} /></button
			>
		</div>
	</section>
</div>
