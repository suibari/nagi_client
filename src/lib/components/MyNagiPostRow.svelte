<script lang="ts">
	import type { ActorView, PostView } from '$lib/api/types';
	import { i18n, m, relativeTime } from '$lib/i18n/i18n.svelte';
	import Avatar from './Avatar.svelte';
	import ChatBubble from './ChatBubble.svelte';
	import Icon from './shell/Icon.svelte';
	import { languageName, languagePreferences } from '$lib/i18n/languagePreferences.svelte';
	import { isTranslationCandidate, postTranslations } from '$lib/i18n/postTranslations.svelte';

	/**
	 * my Nagi の各セクションで使う、投稿1件の表示。
	 *
	 * 畳んでいる間は「誰が・いつ・何を書いたか」だけの1行。押すとその場で開き、
	 * 全文・リアクション・返信までできる（ChatBubble をそのまま埋める）。
	 * my Nagi の中で完結させたいので、スレッドページへは飛ばさない。
	 */
	let {
		post,
		actor,
		caption,
		botActor,
		open = false,
		onopenchange,
		ondeleted,
	}: {
		post: PostView;
		/** 見出しに出す相手。省略時は投稿者本人。 */
		actor?: ActorView;
		/** 相手名の代わりに出す文字列（チャンネル名など）。 */
		caption?: string;
		botActor?: ActorView;
		/** 開閉は親が持つ（画面全体で同時に開くのは1件だけにするため）。 */
		open?: boolean;
		onopenchange?: (open: boolean) => void;
		ondeleted?: (uri: string) => void;
	} = $props();

	const author = $derived(actor ?? post.author);
	let translationEligible = $derived(
		languagePreferences.autoTranslate &&
			isTranslationCandidate(post, languagePreferences.translationLanguage),
	);
	let translation = $derived(
		translationEligible
			? postTranslations.entry(post.uri, languagePreferences.translationLanguage)
			: undefined,
	);
	let targetLanguageName = $derived(
		languageName(languagePreferences.translationLanguage, i18n.locale),
	);
	let previewText = $derived(
		!translationEligible || translation?.status === 'failed'
			? post.text
			: translation?.status === 'translated'
				? translation.text
				: translation?.status === 'loading' && translation.english
					? translation.english.text
					: m.translatingTo({ language: targetLanguageName }),
	);

	$effect(() => {
		const target = languagePreferences.translationLanguage;
		void target;
		if (!translationEligible || translation) return;
		postTranslations.ensure(post);
	});
</script>

<div class="my-nagi-post" class:open>
	<button
		class="my-nagi-post-summary"
		type="button"
		aria-expanded={open}
		onclick={() => onopenchange?.(!open)}
	>
		<Avatar actor={author} size="small" />
		<span class="my-nagi-post-head">
			<span class="my-nagi-post-name">{caption ?? author.displayName ?? author.handle}</span>
			<time>{relativeTime(post.createdAt)}</time>
			<span class="my-nagi-post-caret" class:open aria-hidden="true">
				<Icon name="chevron" size={15} />
			</span>
		</span>
		{#if !open}
			<span class="my-nagi-post-text">
				{#if previewText.trim()}{previewText}{:else}<span class="muted">{m.myNagiNoText()}</span
					>{/if}
			</span>
		{/if}
	</button>
	{#if open}
		<div class="my-nagi-post-detail">
			<ChatBubble {post} {botActor} {ondeleted} />
		</div>
	{/if}
</div>

<style>
	.my-nagi-post {
		min-width: 0;
	}

	.my-nagi-post-summary {
		display: grid;
		/* minmax(0, 1fr) にしないと、長い本文で列が広がって右へはみ出す。 */
		grid-template-columns: auto minmax(0, 1fr);
		gap: 2px 10px;
		width: 100%;
		padding: 9px 4px;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-align: start;
		cursor: pointer;
	}

	.my-nagi-post-summary :global(.avatar) {
		grid-row: span 2;
	}

	/* 開いているときはアバターと本文を ChatBubble 側に譲るので、見出しだけの1行にする。 */
	.my-nagi-post.open .my-nagi-post-summary {
		grid-template-columns: auto minmax(0, 1fr);
	}

	.my-nagi-post-summary:hover .my-nagi-post-name {
		text-decoration: underline;
	}

	.my-nagi-post-head {
		display: flex;
		align-items: baseline;
		gap: 8px;
		min-width: 0;
	}

	.my-nagi-post-name {
		overflow: hidden;
		color: var(--text-strong);
		font-size: 0.8rem;
		font-weight: 800;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.my-nagi-post-head time {
		flex: 0 0 auto;
		margin-inline-start: auto;
		color: var(--text-faint);
		font-size: 0.72rem;
	}

	.my-nagi-post-caret {
		flex: 0 0 auto;
		display: grid;
		place-items: center;
		align-self: center;
		color: var(--text-faint);
		transform: rotate(90deg);
		transition: transform 0.18s ease;
	}

	.my-nagi-post-caret.open {
		transform: rotate(270deg);
	}

	/* 畳んでいるときの本文は2行まで。続きは開いて読む。 */
	.my-nagi-post-text {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		color: var(--text-muted);
		font-size: 0.84rem;
		line-height: 1.6;
		overflow-wrap: anywhere;
		white-space: pre-line;
	}

	.my-nagi-post-detail {
		min-width: 0;
		padding: 0 4px 10px;
	}

	.muted {
		color: var(--text-faint);
	}

	@media (prefers-reduced-motion: reduce) {
		.my-nagi-post-caret {
			transition: none;
		}
	}
</style>
