<script lang="ts">
	import type { PostView } from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import {
		languageName,
		languagePreferences,
		normalizeSupportedLanguage,
	} from '$lib/i18n/languagePreferences.svelte';
	import { isTranslationCandidate, postTranslations } from '$lib/i18n/postTranslations.svelte';
	import {
		buildExternalTranslationUrl,
		translationProviderName,
	} from '$lib/i18n/translationProviders';
	import { trilinesEntryUrl } from '$lib/trilines/records';
	import { splitTrilinesTranslation } from '$lib/trilines/translation';
	import ImageGallery from './ImageGallery.svelte';
	import Icon from './shell/Icon.svelte';

	/**
	 * 3行日記（com.suibari.trilinesat.diary）の本文。行ごとに番号を振り、その行の画像を下に添える。
	 * 画像は AppView が行の順に images へまとめ、行からは imageIndex で指している。
	 *
	 * 翻訳は投稿と同じ仕組み（postTranslations）で、行を改行でつないだ post.text を訳す。
	 * 訳文の行数が元と合えば行の体裁のまま差し替え、合わなければ訳文を一続きで出す。
	 */
	let {
		post,
		clampTall = false,
		disabled = false,
		translatedText,
	}: {
		post: PostView & { trilines: NonNullable<PostView['trilines']> };
		clampTall?: boolean;
		/** 送信中の楽観表示など、まだ訳せない状態。 */
		disabled?: boolean;
		/** APIを使わない表示確認などで、訳文を直接描画する。 */
		translatedText?: string;
	} = $props();

	let target = $derived(languagePreferences.translationLanguage);
	let eligible = $derived(
		!disabled && languagePreferences.autoTranslate && isTranslationCandidate(post, target),
	);
	let translation = $derived(
		eligible ? postTranslations.entry(post.uri, post.cid, target) : undefined,
	);
	let busy = $derived(
		translatedText === undefined && eligible && (!translation || translation.status === 'loading'),
	);
	// 最終訳を待つ間、英訳キャッシュがあれば先に出す（TranslateToggle と同じ）。
	let shownText = $derived(
		translatedText ??
			(translation?.status === 'translated'
				? translation.text
				: translation?.status === 'loading' && !translation.english?.original
					? translation.english?.text
					: undefined),
	);
	let failed = $derived(translation?.status === 'failed');
	let translatedLines = $derived(
		shownText === undefined
			? undefined
			: splitTrilinesTranslation(shownText, post.trilines.lines.length),
	);
	let originalExpanded = $derived(postTranslations.originalExpanded(post.uri, post.cid, target));
	let targetLanguageName = $derived(languageName(target, i18n.locale));
	let fallbackUrl = $derived(
		buildExternalTranslationUrl(languagePreferences.translationProvider, {
			text: post.text,
			from: normalizeSupportedLanguage(post.langs?.[0]),
			to: target,
		}),
	);
	let images = $derived(
		post.trilines.lines.flatMap((line) => {
			const image = line.imageIndex === undefined ? undefined : post.images?.[line.imageIndex];
			return image ? [image] : [];
		}),
	);

	$effect(() => {
		if (translatedText !== undefined || !eligible || translation) return;
		postTranslations.ensure(post);
	});
</script>

<div class="trilines-card" aria-live="polite">
	{#if busy && shownText === undefined}
		<p class="trilines-card-status">{m.translatingTo({ language: targetLanguageName })}</p>
	{:else if shownText !== undefined}
		<p class="trilines-card-status">
			{busy ? m.translatingTo({ language: targetLanguageName }) : m.translationLabel()}
		</p>
	{:else if failed}
		<div class="trilines-card-fallback">
			<p class="trilines-card-status">{m.translationFailed()}</p>
			<div class="trilines-card-fallback-actions">
				<button
					class="trilines-card-text-button"
					type="button"
					onclick={() => void postTranslations.retry(post)}>{m.translationRetry()}</button
				>
				{#if fallbackUrl}<a
						class="trilines-card-text-button"
						href={fallbackUrl}
						target="_blank"
						rel="noopener noreferrer"
						>{m.openInExternalTranslator({
							provider: translationProviderName(languagePreferences.translationProvider),
						})}</a
					>{/if}
			</div>
		</div>
	{/if}
	{#if shownText !== undefined && !translatedLines}
		<!-- 訳文の行数が元と合わないときは行に割り振らず、画像は訳文の下にまとめる。 -->
		<p class="trilines-card-joined">{shownText}</p>
		{#each images as image, index (index)}
			<ImageGallery images={[image]} {clampTall} />
		{/each}
	{:else}
		<ol class="trilines-card-lines">
			{#each post.trilines.lines as line, index (index)}
				{@const image = line.imageIndex === undefined ? undefined : post.images?.[line.imageIndex]}
				<li>
					<div class="trilines-card-line">
						<span class="trilines-card-number" aria-hidden="true">{index + 1}</span>
						<p>{translatedLines?.[index] ?? line.text}</p>
					</div>
					{#if image}
						<div class="trilines-card-image"><ImageGallery images={[image]} {clampTall} /></div>
					{/if}
				</li>
			{/each}
		</ol>
	{/if}
	{#if shownText !== undefined && !busy}
		<button
			class="trilines-card-text-button trilines-card-original-toggle"
			type="button"
			aria-expanded={originalExpanded}
			onclick={() => postTranslations.toggleOriginal(post.uri, post.cid, target)}
			><Icon name="language" size={14} />
			<span>{originalExpanded ? m.hideOriginalText() : m.showOriginalText()}</span></button
		>
		{#if originalExpanded}
			<p class="trilines-card-original">{post.text}</p>
		{/if}
	{/if}
	<a class="trilines-card-link" href={trilinesEntryUrl(post.uri)} target="_blank" rel="noopener"
		>{m.trilinesOpen()}</a
	>
</div>

<style>
	.trilines-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.trilines-card-lines {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.trilines-card-lines li {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}
	.trilines-card-number {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--surface-2);
		color: var(--text-sub);
		font-size: 11px;
		font-weight: 700;
		line-height: 20px;
		text-align: center;
	}
	.trilines-card-line {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}
	.trilines-card-line p {
		flex: 1;
		min-width: 0;
		margin: 0;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
	}
	.trilines-card-image {
		min-width: 0;
		margin-inline-start: 28px;
	}
	.trilines-card p {
		margin: 0;
	}
	.trilines-card-status {
		color: var(--text-muted);
		font-size: 0.75rem;
	}
	.trilines-card-joined,
	.trilines-card-original {
		overflow-wrap: anywhere;
		white-space: pre-wrap;
	}
	.trilines-card-original {
		padding-top: 8px;
		border-top: 1px solid var(--line);
		color: var(--text-sub);
	}
	.trilines-card-fallback-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}
	.trilines-card-text-button {
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--accent-strong);
		font-size: 0.75rem;
	}
	.trilines-card-text-button:hover {
		text-decoration: underline;
	}
	.trilines-card-link {
		align-self: flex-start;
		color: var(--text-muted);
		font-size: 12px;
	}
</style>
