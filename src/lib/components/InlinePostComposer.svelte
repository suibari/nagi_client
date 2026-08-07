<script lang="ts">
	import type { ChannelSelection, EmojiSelection, MentionSelection } from '$lib/atproto/facets';
	import type { LinkCardDraft } from '$lib/atproto/records';
	import type { ImageAttachment } from '$lib/images';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import { myProfile } from '$lib/profile/me.svelte';
	import Avatar from './Avatar.svelte';
	import AvatarLink from './AvatarLink.svelte';
	import ComposerEditor from './ComposerEditor.svelte';
	import ComposerQuoteEditor from './ComposerQuoteEditor.svelte';
	import ImageAttachmentEditor from './ImageAttachmentEditor.svelte';
	import LinkCardEditor from './LinkCardEditor.svelte';
	import type { QuotePick } from '$lib/post/quote-pick.svelte';
	import Icon from './shell/Icon.svelte';
	import { validContentWarningSyntax } from '$lib/atproto/contentWarning';
	import type { PostScope } from '$lib/post/scope';

	let {
		id,
		label,
		placeholder,
		text = $bindable(),
		mentions = $bindable(),
		channels = $bindable<ChannelSelection[]>([]),
		emojis = $bindable<EmojiSelection[]>([]),
		channelSuggestionsEnabled = false,
		attachments = $bindable(),
		linkCards = $bindable(),
		quote,
		busy = false,
		error = '',
		scope = 'feed',
		channelName,
		onsubmit,
		oncancel,
	}: {
		id: string;
		label: string;
		placeholder: string;
		text: string;
		mentions: MentionSelection[];
		channels?: ChannelSelection[];
		emojis?: EmojiSelection[];
		channelSuggestionsEnabled?: boolean;
		attachments: ImageAttachment[];
		linkCards: LinkCardDraft[];
		/** 渡したときだけ、Nagi のスレッドURL貼り付けで引用を付けられる。 */
		quote?: QuotePick;
		busy?: boolean;
		error?: string;
		scope?: PostScope;
		channelName?: string;
		onsubmit: () => void;
		oncancel: () => void;
	} = $props();

	let empty = $derived(!text.trim() && !attachments.length && !linkCards.length);
	let contentWarningValid = $derived(validContentWarningSyntax(text));
	let imageEditor: { handlePaste: (event: ClipboardEvent) => void } | undefined;

	const scopeLabel = $derived(
		scope === 'kossori'
			? m.postScopeKossoriShort()
			: channelName
				? channelName
				: m.postScopeFeedShort(),
	);
	const scopeIcon = $derived(
		scope === 'kossori' ? 'hide' : channelName ? 'hash' : 'home',
	);
</script>

<div class="post-row mine composer-row">
	{#if $session?.did}
		<AvatarLink actor={{ ...myProfile.current, did: $session.did }} ariaLabel={m.myProfileAria()} />
	{:else}
		<Avatar actor={myProfile.current} />
	{/if}
	<section class="bubble post-composer">
		<label for={id}>{label}</label>
		{#snippet editorTools()}
			<ImageAttachmentEditor bind:this={imageEditor} bind:attachments disabled={busy} />
		{/snippet}
		<ComposerEditor
			{id}
			bind:value={text}
			bind:mentions
			bind:channels
			bind:emojis
			{channelSuggestionsEnabled}
			{placeholder}
			disabled={busy}
			mode="simple"
			{onsubmit}
			onpaste={(event) => {
				quote?.handlePaste(event, $session?.did);
				imageEditor?.handlePaste(event);
			}}
			tools={editorTools}
		/>
		<LinkCardEditor {text} bind:cards={linkCards} disabled={busy} />
		{#if quote}<ComposerQuoteEditor {quote} disabled={busy} />{/if}
		<div class="post-composer-foot">
			<button
				class="scope-button"
				type="button"
				disabled
				aria-label={m.postScopeOpenAria({ scope: scopeLabel })}
				title={m.postScopeOpenAria({ scope: scopeLabel })}
			>
				<Icon name={scopeIcon} size={15} />
				<span>{scopeLabel}</span>
			</button>
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
				disabled={busy || empty || !contentWarningValid}
				aria-label={busy ? m.composerSubmitting() : m.composerSubmit()}
				title={busy ? m.composerSubmitting() : m.composerSubmit()}
				onclick={onsubmit}><Icon name={busy ? 'refresh' : 'send'} size={18} /></button
			>
		</div>
	</section>
</div>
