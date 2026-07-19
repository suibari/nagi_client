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

	let {
		uri,
		text,
		langs,
		deleted = false,
		collapsed = false,
	}: {
		uri: string;
		text: string;
		langs?: string[];
		deleted?: boolean;
		collapsed?: boolean;
	} = $props();
	let root: HTMLDivElement;
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
		if (!visible || deleted || !text.trim() || sourceLang === targetLang) {
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
				<p class="label">{m.originalTextLabel()}</p>
				<p class:collapsed>{text}</p>
			</div>
		{/if}
	{:else if failed}
		<p class="status">{m.translationFailed()}</p>
	{/if}
	{#if !translated}
		<div class="original" class:separated={busy || failed}>
			<p class="label">{m.originalTextLabel()}</p>
			<p class:collapsed>{deleted ? m.postDeleted() : text}</p>
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
