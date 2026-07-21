<script module lang="ts">
	const requests = new Map<string, Promise<string>>();
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { translatePost } from '$lib/api/appview';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		languagePreferences,
		normalizeSupportedLanguage,
	} from '$lib/i18n/languagePreferences.svelte';
	import type { Facet } from '$lib/api/types';
	import RichText from './RichText.svelte';

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
	let root: HTMLDivElement;
	let body = $state<HTMLParagraphElement>();
	let visible = $state(false);
	let translated = $state('');
	let busy = $state(false);
	let failed = $state(false);
	let originalExpanded = $state(false);

	function requestTranslation(postUri: string, targetLang: string): Promise<string> {
		const key = `${postUri}\n${targetLang}`;
		const existing = requests.get(key);
		if (existing) return existing;
		const request = translatePost(postUri, targetLang)
			.then((response) => response.text)
			.catch((error) => {
				requests.delete(key);
				throw error;
			});
		requests.set(key, request);
		return request;
	}

	onMount(() => {
		if (!('IntersectionObserver' in window)) {
			visible = true;
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					visible = true;
					observer.disconnect();
				}
			},
			{ rootMargin: '200px' },
		);
		observer.observe(root);
		return () => observer.disconnect();
	});

	$effect(() => {
		const targetLang = languagePreferences.translationLanguage;
		const sourceLang = normalizeSupportedLanguage(langs?.[0]);
		originalExpanded = false;
		if (
			disabled ||
			!visible ||
			deleted ||
			!text.trim() ||
			!sourceLang ||
			sourceLang === targetLang
		) {
			translated = '';
			busy = false;
			failed = false;
			return;
		}

		let current = true;
		translated = '';
		busy = true;
		failed = false;
		requestTranslation(uri, targetLang)
			.then((result) => {
				if (current) translated = result;
			})
			.catch(() => {
				if (current) failed = true;
			})
			.finally(() => {
				if (current) busy = false;
			});
		return () => {
			current = false;
		};
	});

	// 文字数ではなく実際の行数で「続きを読む」の要否を決める。
	// overflow: hidden でも scrollHeight は全文の高さを返すので、
	// 折りたたみ中／展開中どちらでも同じ判定になる。
	$effect(() => {
		const target = body;
		if (!target) {
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

<div class="translation" bind:this={root} aria-live="polite">
	{#if busy}
		<p class="status">{m.translating()}</p>
	{:else if translated}
		<div class="translated">
			<p class="label">{m.translationLabel()}</p>
			<p class="text">{translated}</p>
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
				<p class:collapsed><RichText {text} {facets} /></p>
			</div>
		{/if}
	{:else if failed}
		<p class="status">{m.translationFailed()}</p>
	{/if}
	{#if !translated}
		<div class="original" class:separated={busy || failed}>
			<p class:collapsed bind:this={body}>
				{#if deleted}{m.postDeleted()}{:else}<RichText {text} {facets} />{/if}
			</p>
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

	.original > :last-child {
		margin-top: 0.2rem;
	}
</style>
