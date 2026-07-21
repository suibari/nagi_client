<script lang="ts">
	import { parsePostText, type MentionSelection } from '$lib/atproto/facets';
	import { m } from '$lib/i18n/i18n.svelte';
	import MentionTextarea from './MentionTextarea.svelte';
	import RichText from './RichText.svelte';

	let {
		value = $bindable(''),
		mentions = $bindable<MentionSelection[]>([]),
		id,
		placeholder,
		ariaLabel,
		disabled = false,
		onsubmit,
	}: {
		value?: string;
		mentions?: MentionSelection[];
		id?: string;
		placeholder?: string;
		ariaLabel?: string;
		disabled?: boolean;
		onsubmit?: () => void;
	} = $props();

	let preview = $state(false);
	// 投稿時と同じ変換をかけ、[ラベル](URL)・生URL・メンションが facet になった状態を見せる
	let parsed = $derived(preview ? parsePostText(value, mentions) : undefined);
</script>

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
{#if preview}
	<div class="post-text composer-preview">
		{#if parsed?.text.trim()}<RichText text={parsed.text} facets={parsed.facets} />{:else}<p
				class="muted"
			>
				{m.composerPreviewEmpty()}
			</p>{/if}
	</div>
{:else}
	<MentionTextarea bind:value bind:mentions {id} {placeholder} {ariaLabel} {disabled} {onsubmit} />
{/if}

<style>
	.composer-tabs {
		display: flex;
		gap: 4px;
		margin-bottom: 6px;
	}

	.composer-tabs button {
		padding: 3px 11px;
		border: 0;
		border-radius: var(--radius-pill);
		background: none;
		color: var(--text-muted);
		font-size: 12px;
		font-weight: 700;
	}

	.composer-tabs button.active {
		background: var(--accent-soft);
		color: var(--accent-strong);
	}

	.composer-preview {
		min-height: 84px;
		padding: 10px;
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
		background: var(--bg-inset);
	}

	.composer-preview .muted {
		margin: 0;
		color: var(--text-muted);
	}
</style>
