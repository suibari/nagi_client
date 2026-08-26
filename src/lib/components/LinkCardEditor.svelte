<script lang="ts">
	import { onDestroy } from 'svelte';
	import { parsePostText } from '$lib/atproto/facets';
	import type { LinkCardDraft } from '$lib/atproto/records';
	import { getLinkMetadata, getLinkThumbnail } from '$lib/api/appview';
	import { m } from '$lib/i18n/i18n.svelte';
	import { createSortable } from '$lib/dnd/sortable.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		text,
		cards = $bindable(),
		// ユーザーが × で消した URL。下書きに保存して復元時の再取得を防ぐため公開している。
		dismissedUrls = $bindable([]),
		disabled = false,
	}: {
		text: string;
		cards: LinkCardDraft[];
		dismissedUrls?: string[];
		disabled?: boolean;
	} = $props();
	let loading = $state<string[]>([]);
	let urls = $derived(parsePostText(text).urls);
	const previews = new Set<string>();
	const hydrationAttempted = new Set<string>();
	let previousUrls = new Set<string>();

	const sortableItems = $derived(cards.map((card) => ({ ...card, id: card.id ?? card.uri })));

	const sortable = createSortable<LinkCardDraft & { id: string }>({
		items: () => sortableItems,
		commit: (next) => (cards = next),
		ghostClass: 'attachment-drag-ghost',
		handleSelector: '.attachment-drag-handle',
		announce: (position) => m.postImageMoved({ position }),
		disabled: () => disabled,
	});

	function keydown(event: KeyboardEvent, id: string) {
		if (!sortable.moveByKey(id, event.key)) return;
		event.preventDefault();
		sortable.refocus(id, '.attachment-drag-handle');
	}

	$effect(() => {
		const currentUrls = new Set(urls);
		// 本文から URL 自体が消えたら「消した」記録も忘れる。書き戻しは差分があるときだけ
		// 行う（この effect は dismissedUrls を読むので、無条件の代入はループになる）。
		const kept = dismissedUrls.filter((uri) => !previousUrls.has(uri) || currentUrls.has(uri));
		if (kept.length !== dismissedUrls.length) dismissedUrls = kept;
		previousUrls = currentUrls;
		const candidates = urls.filter(
			(uri) =>
				!kept.includes(uri) && !cards.some((card) => card.uri === uri) && !loading.includes(uri),
		);
		if (!candidates.length || cards.length >= 4) return;
		const timer = window.setTimeout(() => {
			for (const uri of candidates) {
				if (cards.length >= 4 || dismissedUrls.includes(uri) || !urls.includes(uri)) break;
				void add(uri);
			}
		}, 700);
		return () => window.clearTimeout(timer);
	});

	$effect(() => {
		// AppView下書きはサムネイルBlobを持たない。保存済みタイトル・説明を先に表示したまま、
		// URLから画像を一度だけ再取得する。失敗時も既存テキストは維持する。
		const candidates = cards.filter(
			(card) => !card.previewUrl && !hydrationAttempted.has(card.uri),
		);
		for (const card of candidates) {
			hydrationAttempted.add(card.uri);
			void hydrate(card.uri);
		}
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
		const id =
			typeof crypto !== 'undefined' && crypto.randomUUID
				? crypto.randomUUID()
				: `${uri}-${Date.now()}`;
		cards = [...cards, { id, uri, title: new URL(uri).hostname }];
		hydrationAttempted.add(uri);
		await hydrate(uri);
	}

	async function hydrate(uri: string) {
		if (loading.includes(uri)) return;
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
							...card,
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
		if (urls.includes(uri) && !dismissedUrls.includes(uri)) dismissedUrls = [...dismissedUrls, uri];
		cards = cards.filter((card) => card.uri !== uri);
		loading = loading.filter((item) => item !== uri);
	}
</script>

{#if cards.length}
	<div class="link-card-editor" use:sortable.container>
		<div class="link-card-previews">
			{#each cards as card, index (card.id ?? card.uri)}
				<article
					class="link-card-preview"
					class:loading={loading.includes(card.uri)}
					class:dragging={sortable.draggingId === (card.id ?? card.uri)}
					class:drop-target={sortable.isDropTarget(card.id ?? card.uri)}
					data-sortable-id={card.id ?? card.uri}
				>
					<button
						class="attachment-drag-handle"
						type="button"
						disabled={disabled || cards.length < 2}
						aria-label={m.postImageReorder({ index: index + 1 })}
						title={m.postImageReorder({ index: index + 1 })}
						onkeydown={(event) => keydown(event, card.id ?? card.uri)}
					>
						<Icon name="drag" size={17} />
					</button>
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
		<span class="visually-hidden" aria-live="polite">{sortable.announcement}</span>
	</div>
{/if}
