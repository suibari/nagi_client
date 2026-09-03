<script lang="ts">
	import type { ChannelSelection, EmojiSelection, MentionSelection } from '$lib/atproto/facets';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { guestPosts } from '$lib/guest-posts/guest-posts.svelte';
	import { postFollowNotice } from '$lib/feed/post-follow.svelte';
	import {
		getComposerMode,
		resetComposerMode,
		setComposerMode,
		type ComposerMode,
	} from '$lib/post/composer-mode';
	import ComposerEditor from './ComposerEditor.svelte';
	import PostModalShell from './PostModalShell.svelte';
	import Icon from './shell/Icon.svelte';

	let { open, onclose }: { open: boolean; onclose: () => void } = $props();
	let mode = $state<ComposerMode>('simple');
	let wasOpen = $state(false);
	let text = $state('');
	let mentions = $state<MentionSelection[]>([]);
	let channels = $state<ChannelSelection[]>([]);
	let emojis = $state<EmojiSelection[]>([]);
	let busy = $state(false);
	let error = $state('');
	let agreed = $state(false);
	const graphemes = $derived(
		[...new Intl.Segmenter(i18n.locale, { granularity: 'grapheme' }).segment(text)].length,
	);
	const canSubmit = $derived(Boolean(text.trim()) && agreed && graphemes <= 3_000);

	$effect(() => {
		if (open === wasOpen) return;
		wasOpen = open;
		if (!open) return;
		mode = getComposerMode();
		try {
			agreed = localStorage.getItem('nagi.guest-ai-consent.v1') === '1';
		} catch {
			agreed = false;
		}
	});

	async function submit() {
		if (busy || !canSubmit) return;
		busy = true;
		error = '';
		try {
			try {
				localStorage.setItem('nagi.guest-ai-consent.v1', '1');
			} catch {
				// 同意状態を保存できなくても、この送信についての明示同意は成立している。
			}
			const id = await guestPosts.create(text, i18n.locale === 'en' ? 'en' : 'ja');
			text = '';
			mentions = [];
			channels = [];
			emojis = [];
			mode = resetComposerMode();
			onclose();
			postFollowNotice.show(`/feed#guest-post-${id}`);
		} catch {
			error = m.guestPostSaveFailed();
		} finally {
			busy = false;
		}
	}
</script>

<PostModalShell
	bind:mode
	{open}
	sending={busy}
	title={m.guestPostTitle()}
	{onclose}
	onmodechange={setComposerMode}
>
	<section class="composer guest-composer" class:rich={mode === 'rich'}>
		<ComposerEditor
			bind:value={text}
			bind:mentions
			bind:channels
			bind:emojis
			mentionSuggestionsEnabled={false}
			channelSuggestionsEnabled={false}
			emojiPickerEnabled={false}
			contentWarningEnabled={false}
			placeholder={m.composerPlaceholder()}
			ariaLabel={m.composerAria()}
			disabled={busy}
			{mode}
			onsubmit={() => void submit()}
		/>
		<label class="guest-consent">
			<input type="checkbox" bind:checked={agreed} disabled={busy} />
			<span
				>{m.guestPostConsentBefore()}<a href="/terms" target="_blank" rel="noreferrer noopener"
					>{m.termsLink()}</a
				>{m.guestPostConsentAnd()}<a href="/privacy" target="_blank" rel="noreferrer noopener"
					>{m.privacyLink()}</a
				>{m.guestPostConsentAfter()}</span
			>
		</label>
		<div class="composer-foot">
			<button
				class="scope-button guest-scope"
				type="button"
				disabled
				aria-label={`${m.guestPostScope()}: ${m.guestPostScopeDetail()}`}
				title={m.guestPostScopeDetail()}
			>
				<Icon name="hide" size={15} />
				<span>{m.guestPostScope()}</span>
			</button>
			<div class="composer-status"><span>{graphemes} / 3000</span></div>
			<div class="composer-submit-actions">
				<button
					class="submit-primary"
					class:requirements-missing={!busy && !canSubmit}
					type="button"
					disabled={busy || !canSubmit}
					aria-label={busy ? m.guestPostSaving() : m.guestPostSubmit()}
					title={busy ? m.guestPostSaving() : m.guestPostSubmit()}
					onclick={() => void submit()}
				>
					{#if busy}<span class="submit-spinner" aria-hidden="true"></span>
					{:else}<Icon name="send" size={18} />{/if}
					<span>{busy ? m.guestPostSaving() : m.guestPostSubmit()}</span>
				</button>
			</div>
		</div>
		<p class="guest-scope-detail"><Icon name="info" size={14} />{m.guestPostScopeDetail()}</p>
		{#if error}<p class="error" role="alert">{error}</p>{/if}
	</section>
</PostModalShell>

<style>
	.guest-composer {
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-height: 0;
	}
	.guest-composer.rich {
		flex: 1;
	}
	.guest-consent {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		color: var(--text-muted);
		font-size: 0.78rem;
		line-height: 1.5;
	}
	.guest-consent input {
		margin-top: 3px;
		accent-color: var(--accent);
	}
	.guest-scope:disabled {
		opacity: 1;
		cursor: default;
	}
	.submit-primary.requirements-missing {
		border-color: var(--line-strong);
		background: var(--surface-2);
		color: var(--text-faint);
		opacity: 1;
	}
	.guest-scope-detail {
		display: flex;
		align-items: center;
		gap: 5px;
		margin: 0;
		color: var(--text-muted);
		font-size: 0.75rem;
	}
	.error {
		margin: 0;
		color: var(--danger);
	}
</style>
