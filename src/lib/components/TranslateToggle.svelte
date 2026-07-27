<script lang="ts">
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import {
		languageName,
		languagePreferences,
		normalizeSupportedLanguage,
	} from '$lib/i18n/languagePreferences.svelte';
	import {
		buildExternalTranslationUrl,
		translationProviderName,
	} from '$lib/i18n/translationProviders';
	import type { Facet } from '$lib/api/types';
	import RichText from './RichText.svelte';
	import { isTranslationCandidate, postTranslations } from '$lib/i18n/postTranslations.svelte';

	let {
		uri,
		text,
		langs,
		facets,
		deleted = false,
		collapsed = false,
		disabled = false,
		onoverflowchange,
	}: {
		uri: string;
		text: string;
		langs?: string[];
		facets?: Facet[];
		deleted?: boolean;
		collapsed?: boolean;
		disabled?: boolean;
		onoverflowchange?: (overflowing: boolean) => void;
	} = $props();
	let body = $state<HTMLElement>();
	let originalExpanded = $state(false);
	let translationEligible = $derived(
		!disabled &&
			languagePreferences.autoTranslate &&
			isTranslationCandidate(
				{ uri, text, langs, facets, deleted },
				languagePreferences.translationLanguage,
			),
	);
	let translation = $derived(
		translationEligible
			? postTranslations.entry(uri, languagePreferences.translationLanguage)
			: undefined,
	);
	let translated = $derived(translation?.status === 'translated' ? translation.text : '');
	let busy = $derived(translationEligible && (!translation || translation.status === 'loading'));
	let englishFallback = $derived(
		translation?.status === 'loading' ? translation.english : undefined,
	);
	let failed = $derived(translation?.status === 'failed');
	let targetLanguageName = $derived(
		languageName(languagePreferences.translationLanguage, i18n.locale),
	);

	// 内蔵翻訳が失敗した時のフォールバック用に、選択中プロバイダーの外部翻訳URLを組む。
	let fallbackProvider = $derived(languagePreferences.translationProvider);
	let fallbackUrl = $derived.by(() => {
		if (!text.trim()) return '';
		return buildExternalTranslationUrl(fallbackProvider, {
			text,
			from: normalizeSupportedLanguage(langs?.[0]),
			to: languagePreferences.translationLanguage,
		});
	});

	$effect(() => {
		const targetLang = languagePreferences.translationLanguage;
		void uri;
		void targetLang;
		originalExpanded = false;
		if (!translationEligible || translation) return;
		postTranslations.ensure({ uri, text, langs, facets, deleted });
	});

	function retry() {
		void postTranslations.retry({ uri, text, langs, facets, deleted });
	}

	// 文字数ではなく実際の行数で「続きを読む」の要否を決める。
	// overflow: hidden でも scrollHeight は全文の高さを返すので、
	// 折りたたみ中／展開中どちらでも同じ判定になる。
	$effect(() => {
		const target = body;
		if (!target || translated || busy) {
			onoverflowchange?.(false);
			return;
		}
		void text;
		const measure = () => {
			const style = getComputedStyle(target);
			const lines = Number.parseFloat(style.getPropertyValue('--clamp-lines')) || 6;
			const lineHeight =
				Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.75;
			onoverflowchange?.(target.scrollHeight > lineHeight * lines + 1);
		};
		measure();
		if (!('ResizeObserver' in window)) return;
		const observer = new ResizeObserver(measure);
		observer.observe(target);
		return () => observer.disconnect();
	});
</script>

<div class="translation" aria-live="polite">
	{#if busy}
		{#if englishFallback}
			<div class="translated">
				<p class="label">{m.translatingTo({ language: targetLanguageName })}</p>
				<div class="post-text text">
					<RichText
						text={englishFallback.text}
						facets={englishFallback.original ? facets : undefined}
					/>
				</div>
			</div>
		{:else}
			<p class="status">{m.translatingTo({ language: targetLanguageName })}</p>
		{/if}
	{:else if translated}
		<div class="translated">
			<p class="label">{m.translationLabel()}</p>
			<div class="post-text text"><RichText text={translated} /></div>
		</div>
		<button
			class="original-toggle"
			type="button"
			aria-expanded={originalExpanded}
			onclick={() => (originalExpanded = !originalExpanded)}
			>{originalExpanded ? m.hideOriginalText() : m.showOriginalText()}</button
		>
		{#if originalExpanded}
			<div class="original separated">
				<div class="post-text"><RichText {text} {facets} /></div>
			</div>
		{/if}
	{:else if failed}
		<div class="fallback">
			<p class="status">{m.translationFailed()}</p>
			<div class="fallback-actions">
				<button class="fallback-link" type="button" onclick={retry}>{m.translationRetry()}</button>
				{#if fallbackUrl}<a
						class="fallback-link"
						href={fallbackUrl}
						target="_blank"
						rel="noopener noreferrer"
						>{m.openInExternalTranslator({
							provider: translationProviderName(fallbackProvider),
						})}</a
					>{/if}
			</div>
		</div>
	{/if}
	{#if !translated && !busy}
		<div class="original" class:separated={busy || failed}>
			<div class="post-text" class:collapsed bind:this={body}>
				{#if deleted}<p>{m.postDeleted()}</p>{:else}<RichText {text} {facets} />{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.original.separated {
		margin-top: 0.55rem;
		padding-top: 0.55rem;
		border-top: 1px solid var(--line);
	}

	.translation p {
		margin: 0;
	}

	.translation .label,
	.translation .status {
		color: var(--text-muted);
		font-size: 0.75rem;
	}

	.translation .text {
		margin-top: 0.2rem;
		white-space: pre-wrap;
	}

	.original-toggle {
		margin-top: 0.35rem;
		padding: 0;
		border: 0;
		background: none;
		color: var(--accent-strong);
		font-size: 0.75rem;
	}

	.original-toggle:hover {
		text-decoration: underline;
	}

	.fallback-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.2rem;
	}

	.fallback-link {
		padding: 0;
		border: 0;
		background: none;
		color: var(--accent-strong);
		font-size: 0.75rem;
	}

	.fallback-link:hover {
		text-decoration: underline;
	}

	.original > :last-child {
		margin-top: 0.2rem;
	}
</style>
