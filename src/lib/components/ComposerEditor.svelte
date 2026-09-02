<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		parsePostText,
		type ChannelSelection,
		type EmojiSelection,
		type MentionSelection,
	} from '$lib/atproto/facets';
	import { m } from '$lib/i18n/i18n.svelte';
	import MarkdownPalette, { type MarkdownFormat } from './MarkdownPalette.svelte';
	import MentionTextarea from './MentionTextarea.svelte';
	import RichText from './RichText.svelte';
	import Icon from './shell/Icon.svelte';
	import { parseContentWarning } from '$lib/atproto/contentWarning';
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
		realtimePreviewEnabled = false,
		onsubmit,
		onpaste,
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
		 * simple（あっさり）はプレビュータブと文字装飾を畳み、本文・画像・CW だけにする。
		 * 返信や引用の InlinePostComposer は従来どおり rich のまま。
		 */
		mode?: 'simple' | 'rich';
		/** ポストモーダルの広幅時だけ、入力とプレビューを常時並べる。 */
		realtimePreviewEnabled?: boolean;
		onsubmit?: () => void;
		onpaste?: (event: ClipboardEvent) => void;
		tools?: Snippet;
	} = $props();

	let preview = $state(false);
	let realtimePreview = $state(false);
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
	// あっさりへ戻したときにプレビューのまま固まらないようにする。
	$effect(() => {
		if (mode === 'simple' && preview) preview = false;
	});
	$effect(() => {
		if (!realtimePreviewEnabled || mode !== 'rich') {
			realtimePreview = false;
			return;
		}
		const media = window.matchMedia('(min-width: 1024px)');
		const update = () => (realtimePreview = media.matches);
		update();
		media.addEventListener('change', update);
		return () => media.removeEventListener('change', update);
	});
	let hasSelection = $state(false);
	// 投稿時と同じ変換をかけ、[ラベル](URL)・生URL・メンションが facet になった状態を見せる
	let parsed = $derived(
		preview || realtimePreview ? parsePostText(value, mentions, channels, emojis) : undefined,
	);
	let contentWarning = $derived(parseContentWarning(parsed?.text ?? value));
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

{#if mode === 'rich' && !realtimePreview}
	<div class="composer-tabs" role="tablist" aria-label={m.composerTabsAria()}>
		<button
			type="button"
			role="tab"
			aria-selected={!preview}
			class:active={!preview}
			onclick={() => (preview = false)}>{m.composerTabWrite()}</button
		>
		<button
			type="button"
			role="tab"
			aria-selected={preview}
			class:active={preview}
			onclick={() => (preview = true)}>{m.composerTabPreview()}</button
		>
	</div>
{/if}
<div class="composer-editor-panes" class:realtime-preview={realtimePreview}>
	{#if preview || realtimePreview}
		<div class="post-text composer-preview">
			{#if parsed?.text.trim()}<RichText text={parsed.text} facets={parsed.facets} />{:else}<p
					class="muted"
				>
					{m.composerPreviewEmpty()}
				</p>{/if}
		</div>
	{/if}
	<!--
		プレビュー中も入力UIを破棄しない。tools 内の画像・リンクカードエディタが
		一時的なアンマウントで Object URL を解放し、復帰後に再読込できなくなるのを防ぐ。
	-->
	<div class="composer-write" hidden={preview && !realtimePreview}>
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
						title={contentWarningLabelsEnabled
							? m.contentWarningMenuTitle()
							: m.contentWarningSet()}
						aria-haspopup={contentWarningLabelsEnabled ? 'menu' : undefined}
						aria-expanded={contentWarningLabelsEnabled ? contentWarningPickerOpen : undefined}
						onmousedown={(event) => event.preventDefault()}
						onclick={() => {
							if (contentWarningLabelsEnabled) contentWarningPickerOpen = !contentWarningPickerOpen;
							else editor?.applyContentWarning();
						}}><Icon name="warning" size={17} /></button
					>{/if}
				{#if mode === 'rich'}
					<MarkdownPalette {disabled} onformat={(format) => editor?.applyMarkdown(format)} />
				{/if}
			</div>
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
	.composer-tabs {
		display: flex;
		gap: 4px;
		margin-bottom: 6px;
	}

	.composer-tabs button {
		min-height: 28px;
		padding: 3px 10px;
		border: 1px solid transparent;
		border-radius: var(--r-sm);
		background: none;
		color: var(--text-muted);
		font-size: 12px;
		font-weight: 700;
	}

	.composer-tabs button.active {
		border-color: var(--line-strong);
		background: var(--surface-2);
		color: var(--text);
	}

	.composer-preview {
		min-height: 168px;
		padding: 10px;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--surface-2);
	}

	.composer-preview .muted {
		margin: 0;
		color: var(--text-muted);
	}

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
