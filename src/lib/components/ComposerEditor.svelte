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

	let {
		value = $bindable(''),
		mentions = $bindable<MentionSelection[]>([]),
		channels = $bindable<ChannelSelection[]>([]),
		emojis = $bindable<EmojiSelection[]>([]),
		channelSuggestionsEnabled = false,
		id,
		placeholder,
		ariaLabel,
		disabled = false,
		contentWarningEnabled = true,
		mode = 'rich',
		onsubmit,
		onpaste,
		tools,
	}: {
		value?: string;
		mentions?: MentionSelection[];
		channels?: ChannelSelection[];
		emojis?: EmojiSelection[];
		channelSuggestionsEnabled?: boolean;
		id?: string;
		placeholder?: string;
		ariaLabel?: string;
		disabled?: boolean;
		contentWarningEnabled?: boolean;
		/**
		 * simple（あっさり）はプレビュータブと文字装飾を畳み、本文・画像・CW だけにする。
		 * 返信や引用の InlinePostComposer は従来どおり rich のまま。
		 */
		mode?: 'simple' | 'rich';
		onsubmit?: () => void;
		onpaste?: (event: ClipboardEvent) => void;
		tools?: Snippet;
	} = $props();

	let preview = $state(false);
	let editor = $state<{
		applyMarkdown: (format: MarkdownFormat) => void;
		applyContentWarning: () => void;
		insertAtCaret: (text: string) => void;
		insertEmoji: (emoji: string | EmojiView) => void;
	}>();
	let emojiPickerOpen = $state(false);
	let emojiButton = $state<HTMLButtonElement>();
	// あっさりへ戻したときにプレビューのまま固まらないようにする。
	$effect(() => {
		if (mode === 'simple' && preview) preview = false;
	});
	let hasSelection = $state(false);
	// 投稿時と同じ変換をかけ、[ラベル](URL)・生URL・メンションが facet になった状態を見せる
	let parsed = $derived(preview ? parsePostText(value, mentions, channels, emojis) : undefined);
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

{#if mode === 'rich'}
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
{#if preview}
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
<div class="composer-write" hidden={preview}>
	<MentionTextarea
		bind:this={editor}
		bind:value
		bind:mentions
		bind:channels
		bind:emojis
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
			<button
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
				onclick={() => (emojiPickerOpen = !emojiPickerOpen)}><Icon name="emoji" size={17} /></button
			>
			{#if contentWarningEnabled}<button
					class="icon-action content-warning-tool"
					class:active={contentWarning.status === 'valid'}
					type="button"
					disabled={disabled || !hasSelection || contentWarning.status === 'invalid'}
					aria-label={m.contentWarningSet()}
					title={m.contentWarningSet()}
					onmousedown={(event) => event.preventDefault()}
					onclick={() => editor?.applyContentWarning()}><Icon name="warning" size={17} /></button
				>{/if}
			{#if mode === 'rich'}
				<MarkdownPalette {disabled} onformat={(format) => editor?.applyMarkdown(format)} />
			{/if}
		</div>
	</div>
</div>
<QuickEmojiPalette
	bind:open={emojiPickerOpen}
	anchor={emojiButton}
	select={(emoji) => editor?.insertEmoji(emoji)}
	ariaLabel={m.insertEmojiPickerAria()}
	choiceAriaLabel={(emoji) => m.insertEmojiChoiceAria({ emoji })}
/>
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
		min-height: 84px;
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
