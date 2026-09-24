<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ChannelSelection, EmojiSelection, MentionSelection } from '$lib/atproto/facets';
	import { m } from '$lib/i18n/i18n.svelte';
	import MarkdownPalette, { type MarkdownFormat } from './MarkdownPalette.svelte';
	import MentionTextarea from './MentionTextarea.svelte';
	import Icon from './shell/Icon.svelte';
	import { parseContentWarning } from '$lib/atproto/contentWarning';
	import { isWideComposer, type ComposerMode } from '$lib/post/composer-mode';
	import type { EmojiView } from '$lib/api/types';
	import QuickEmojiPalette from './QuickEmojiPalette.svelte';
	import ContentWarningPicker from './ContentWarningPicker.svelte';

	let {
		value = $bindable(''),
		mentions = $bindable<MentionSelection[]>([]),
		channels = $bindable<ChannelSelection[]>([]),
		emojis = $bindable<EmojiSelection[]>([]),
		mentionSuggestionsEnabled = true,
		channelSuggestionsEnabled = false,
		emojiPickerEnabled = true,
		id,
		placeholder,
		ariaLabel,
		disabled = false,
		contentWarningEnabled = true,
		contentWarningLabelsEnabled = false,
		selfLabels = $bindable<string[]>([]),
		mode = 'rich',
		onsubmit,
		onpaste,
		ontextinput,
		oncompositionchange,
		tools,
	}: {
		value?: string;
		mentions?: MentionSelection[];
		channels?: ChannelSelection[];
		emojis?: EmojiSelection[];
		mentionSuggestionsEnabled?: boolean;
		channelSuggestionsEnabled?: boolean;
		emojiPickerEnabled?: boolean;
		id?: string;
		placeholder?: string;
		ariaLabel?: string;
		disabled?: boolean;
		contentWarningEnabled?: boolean;
		contentWarningLabelsEnabled?: boolean;
		selfLabels?: string[];
		/**
		 * 入力欄はどのモードでも記法をその場で装飾して見せる（プレビュー欄は持たない）。
		 * simple（あっさり）は文字装飾のボタンだけを畳み、本文・画像・CW に絞る。
		 * rich（しっかり）と blog（ブログ）は文字装飾のボタンも出す。
		 */
		mode?: ComposerMode;
		onsubmit?: () => void;
		onpaste?: (event: ClipboardEvent) => void;
		ontextinput?: (event: InputEvent) => void;
		oncompositionchange?: (composing: boolean) => void;
		tools?: Snippet;
	} = $props();

	let editor = $state<{
		applyMarkdown: (format: MarkdownFormat) => void;
		applyContentWarning: () => void;
		insertAtCaret: (text: string) => void;
		insertEmoji: (emoji: string | EmojiView) => void;
	}>();
	let emojiPickerOpen = $state(false);
	let emojiButton = $state<HTMLButtonElement>();
	let contentWarningPickerOpen = $state(false);
	let contentWarningButton = $state<HTMLButtonElement>();
	let hasSelection = $state(false);
	let contentWarning = $derived(parseContentWarning(value));
	let contentWarningError = $derived(
		contentWarning.status === 'invalid'
			? contentWarning.reason === 'multiple'
				? m.contentWarningMultiple()
				: contentWarning.reason === 'empty'
					? m.contentWarningEmpty()
					: m.contentWarningUnmatched()
			: '',
	);
</script>

<div class="composer-write">
	<MentionTextarea
		bind:this={editor}
		bind:value
		bind:mentions
		bind:channels
		bind:emojis
		{mentionSuggestionsEnabled}
		{channelSuggestionsEnabled}
		{id}
		{placeholder}
		{ariaLabel}
		{disabled}
		{onsubmit}
		{onpaste}
		{ontextinput}
		{oncompositionchange}
		onselectionchange={(selected) => (hasSelection = selected)}
	/>
	<div class="composer-tools" class:with-leading={tools}>
		{#if tools}<div class="composer-tools-leading">{@render tools()}</div>{/if}
		<div class="composer-format-tools">
			{#if emojiPickerEnabled}<button
					bind:this={emojiButton}
					class="icon-action"
					class:active={emojiPickerOpen}
					type="button"
					{disabled}
					aria-label={m.insertEmoji()}
					title={m.insertEmoji()}
					aria-haspopup="dialog"
					aria-expanded={emojiPickerOpen}
					onmousedown={(event) => event.preventDefault()}
					onclick={() => (emojiPickerOpen = !emojiPickerOpen)}
					><Icon name="emoji" size={17} /></button
				>{/if}
			{#if contentWarningEnabled}<button
					bind:this={contentWarningButton}
					class="icon-action content-warning-tool"
					class:active={contentWarning.status === 'valid' || selfLabels.length > 0}
					type="button"
					disabled={disabled ||
						(!contentWarningLabelsEnabled &&
							(!hasSelection || contentWarning.status === 'invalid'))}
					aria-label={contentWarningLabelsEnabled
						? m.contentWarningMenuTitle()
						: m.contentWarningSet()}
					title={contentWarningLabelsEnabled ? m.contentWarningMenuTitle() : m.contentWarningSet()}
					aria-haspopup={contentWarningLabelsEnabled ? 'menu' : undefined}
					aria-expanded={contentWarningLabelsEnabled ? contentWarningPickerOpen : undefined}
					onmousedown={(event) => event.preventDefault()}
					onclick={() => {
						if (contentWarningLabelsEnabled) contentWarningPickerOpen = !contentWarningPickerOpen;
						else editor?.applyContentWarning();
					}}><Icon name="warning" size={17} /></button
				>{/if}
			{#if isWideComposer(mode)}
				<MarkdownPalette {disabled} onformat={(format) => editor?.applyMarkdown(format)} />
			{/if}
		</div>
	</div>
</div>
{#if emojiPickerEnabled}<QuickEmojiPalette
		bind:open={emojiPickerOpen}
		anchor={emojiButton}
		select={(emoji) => editor?.insertEmoji(emoji)}
		ariaLabel={m.insertEmojiPickerAria()}
		choiceAriaLabel={(emoji) => m.insertEmojiChoiceAria({ emoji })}
	/>{/if}
{#if contentWarningEnabled && contentWarningLabelsEnabled}<ContentWarningPicker
		bind:open={contentWarningPickerOpen}
		anchor={contentWarningButton}
		bind:selectedLabels={selfLabels}
		{hasSelection}
		textWarningDisabled={contentWarning.status === 'invalid'}
		{disabled}
		ontextwarning={() => editor?.applyContentWarning()}
	/>{/if}
{#if contentWarningError}<p class="error cw-error" role="alert">{contentWarningError}</p>{/if}

<style>
	.composer-tools {
		display: flex;
		align-items: flex-start;
		justify-content: flex-end;
		gap: 8px;
		min-width: 0;
	}

	.composer-tools.with-leading {
		justify-content: space-between;
	}

	.composer-tools-leading {
		flex: 1;
		min-width: 0;
	}

	.composer-format-tools {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.content-warning-tool.active {
		background: var(--accent-soft);
		color: var(--accent-strong);
	}

	.cw-error {
		margin: 4px 0 0;
		font-size: 0.78rem;
	}
</style>
