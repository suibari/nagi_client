<script lang="ts">
	import { onDestroy } from 'svelte';
	import { parsePostText } from '$lib/atproto/facets';
	import type { LinkCardDraft } from '$lib/atproto/records';
	import { getLinkMetadata, getLinkThumbnail } from '$lib/api/appview';
	import { m } from '$lib/i18n/i18n.svelte';

	let {
		text,
		cards = $bindable(),
		disabled = false,
	}: { text: string; cards: LinkCardDraft[]; disabled?: boolean } = $props();
	let loading = $state<string[]>([]);
	let urls = $derived(parsePostText(text).urls);
	const dismissed = new Set<string>();
	const previews = new Set<string>();
	let previousUrls = new Set<string>();

	$effect(() => {
		const currentUrls = new Set(urls);
		for (const uri of previousUrls) {
			if (!currentUrls.has(uri)) dismissed.delete(uri);
		}
		previousUrls = currentUrls;
		const candidates = urls.filter(
			(uri) =>
				!dismissed.has(uri) && !cards.some((card) => card.uri === uri) && !loading.includes(uri),
		);
		if (!candidates.length || cards.length >= 4) return;
		const timer = window.setTimeout(() => {
			for (const uri of candidates) {
				if (cards.length >= 4 || dismissed.has(uri) || !urls.includes(uri)) break;
				void add(uri);
			}
		}, 700);
		return () => window.clearTimeout(timer);
	});

	$effect(() => {
		const current = new Set(cards.flatMap((card) => (card.previewUrl ? [card.previewUrl] : [])));
		for (const preview of previews) {
			if (!current.has(preview)) {
				URL.revokeObjectURL(preview);
				previews.delete(preview);
			}
		}
		for (const preview of current) previews.add(preview);
	});
	onDestroy(() => previews.forEach((preview) => URL.revokeObjectURL(preview)));

	async function add(uri: string) {
		if (cards.some((card) => card.uri === uri) || loading.includes(uri)) return;
		cards = [...cards, { uri, title: new URL(uri).hostname }];
		loading = [...loading, uri];
		try {
			let metadata = await getLinkMetadata(uri);
			let thumbnail: Blob | undefined;
			let previewUrl: string | undefined;
			if (metadata.image) {
				try {
					thumbnail = await getLinkThumbnail(metadata.image);
					previewUrl = URL.createObjectURL(thumbnail);
				} catch {
					const fallback = await getLinkMetadata(uri, true).catch(() => undefined);
					if (fallback?.image) {
						try {
							thumbnail = await getLinkThumbnail(fallback.image);
							previewUrl = URL.createObjectURL(thumbnail);
							metadata = fallback;
						} catch {
							// Give up after the Cardyb fallback also fails.
						}
					}
				}
			}
			cards = cards.map((card) =>
				card.uri === uri
					? {
							uri,
							title: metadata.title,
							description: metadata.description,
							thumbnail,
							previewUrl,
						}
					: card,
			);
			if (previewUrl && !cards.some((card) => card.previewUrl === previewUrl))
				URL.revokeObjectURL(previewUrl);
		} catch {
			// Keep the hostname fallback so metadata failure never blocks posting.
		} finally {
			loading = loading.filter((item) => item !== uri);
		}
	}

	function remove(uri: string) {
		if (urls.includes(uri)) dismissed.add(uri);
		cards = cards.filter((card) => card.uri !== uri);
		loading = loading.filter((item) => item !== uri);
	}
</script>

{#if cards.length}
	<div class="link-card-editor">
		<div class="link-card-previews">
			{#each cards as card}
				<article class="link-card-preview" class:loading={loading.includes(card.uri)}>
					{#if card.previewUrl}<img src={card.previewUrl} alt="" />{/if}
					<span>
						<strong>{card.title}</strong>
						{#if card.description}<span>{card.description}</span>{/if}
						<small>{loading.includes(card.uri) ? m.linkCardLoading() : card.uri}</small>
					</span>
					<button
						type="button"
						class="link-card-remove"
						{disabled}
						aria-label={m.linkCardRemove()}
						title={m.linkCardRemove()}
						onclick={() => remove(card.uri)}>×</button
					>
				</article>
			{/each}
		</div>
	</div>
{/if}
