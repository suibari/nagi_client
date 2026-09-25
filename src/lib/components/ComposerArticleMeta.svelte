<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		ImageProcessingError,
		MAX_COVER_IMAGE_BLOB_SIZE,
		processImage,
		releaseImage,
		type ImageAttachment,
	} from '$lib/images';
	import Icon from './shell/Icon.svelte';

	/**
	 * ブログモードの記事メタ欄。
	 *
	 * ヘッダー画像は独立した state を持たず、添付画像の先頭をそのまま使う。
	 * standard.site の coverImage が「1枚目の画像」なので、ここで別枠に持つと
	 * 投稿本文の添付と二重管理になり、順番を入れ替えたときに食い違う。
	 * ただし記事のカバーは lexicon で 1MB 未満と決まっているため、
	 * 通常の添付（2MB）より強い上限で圧縮し直して先頭へ入れる。
	 */
	let {
		attachments = $bindable<ImageAttachment[]>([]),
		tags = $bindable<string[]>([]),
		disabled = false,
	}: {
		attachments?: ImageAttachment[];
		tags?: string[];
		disabled?: boolean;
	} = $props();

	/** lexicon の site.standard.document#tags は 1 件 128 graphemes まで。 */
	const TAG_MAX_GRAPHEMES = 128;

	let input = $state<HTMLInputElement>();
	let processing = $state(false);
	let error = $state('');
	let dragging = $state(false);
	let tagDraft = $state('');
	let tagError = $state('');
	/**
	 * 狭い画面では本文が潰れないよう畳み、広い画面では常に開いた1枚のパネルにする。
	 * CSS で開かせることはできない（閉じた details は子の display を上書きしても開かない）
	 * ので、幅の判定はここで持って open を動かす。
	 */
	let open = $state(true);
	$effect(() => {
		const media = window.matchMedia('(min-width: 768px)');
		const update = () => (open = media.matches);
		update();
		media.addEventListener('change', update);
		return () => media.removeEventListener('change', update);
	});

	const header = $derived(attachments[0]);
	function setHeaderAlt(alt: string) {
		const limited = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(alt)]
			.slice(0, 1000)
			.map((segment) => segment.segment)
			.join('');
		attachments = attachments.map((item, index) =>
			index === 0 ? { ...item, alt: limited } : item,
		);
	}

	async function useAsHeader(file: File) {
		if (processing || disabled) return;
		error = '';
		processing = true;
		try {
			const next = await processImage(file, undefined, MAX_COVER_IMAGE_BLOB_SIZE);
			const [previous, ...rest] = attachments;
			attachments = [next, ...rest];
			// 差し替えで画面から外れた画像の Object URL は、ここで解放しておく。
			if (previous) releaseImage(previous);
		} catch (cause) {
			error =
				cause instanceof ImageProcessingError && cause.code === 'type'
					? m.postImageTypeError({ name: file.name })
					: cause instanceof ImageProcessingError && cause.code === 'input-size'
						? m.postImageInputSizeError({ name: file.name })
						: m.postImageCompressError({ name: file.name });
		} finally {
			processing = false;
		}
	}

	function removeHeader() {
		const [previous, ...rest] = attachments;
		if (!previous) return;
		attachments = rest;
		releaseImage(previous);
	}

	function drop(event: DragEvent) {
		dragging = false;
		const file = [...(event.dataTransfer?.files ?? [])].find((item) =>
			item.type.startsWith('image/'),
		);
		if (file) void useAsHeader(file);
	}

	function commitTag() {
		const value = tagDraft.trim().replace(/^#+/, '').trim();
		tagDraft = '';
		if (!value) return;
		const length = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value)]
			.length;
		if (length > TAG_MAX_GRAPHEMES) {
			tagError = m.articleTagLimit();
			return;
		}
		tagError = '';
		if (!tags.includes(value)) tags = [...tags, value];
	}
</script>

<details class="article-meta" bind:open>
	<summary>{m.articleMetaLegend()}</summary>

	<div class="article-meta-body">
		<section class="article-meta-field">
			<span class="article-meta-label">{m.articleHeaderImageLabel()}</span>
			<input
				class="visually-hidden"
				bind:this={input}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				onchange={(event) => {
					const file = event.currentTarget.files?.[0];
					if (file) void useAsHeader(file);
					event.currentTarget.value = '';
				}}
			/>
			<button
				type="button"
				class="article-cover"
				class:dragging
				class:has-image={Boolean(header)}
				{disabled}
				aria-label={header ? m.articleHeaderImageReplace() : m.articleHeaderImageLabel()}
				onclick={() => input?.click()}
				ondragover={(event) => {
					event.preventDefault();
					dragging = true;
				}}
				ondragleave={() => (dragging = false)}
				ondrop={(event) => {
					event.preventDefault();
					drop(event);
				}}
			>
				{#if header}
					<img src={header.previewUrl} alt="" />
				{:else}
					<span class="article-cover-placeholder">
						<Icon name="image" size={22} />
						<span>{m.articleHeaderImageHint()}</span>
					</span>
				{/if}
				{#if processing}<span class="article-cover-spinner" aria-hidden="true"
						><Spinner inline size="sm" decorative /></span
					>{/if}
			</button>
			{#if header}
				<label class="article-cover-alt">
					<span>{m.postImageAltLabel()}</span>
					<input
						type="text"
						value={header.alt}
						maxlength="10000"
						{disabled}
						oninput={(event) => setHeaderAlt(event.currentTarget.value)}
						placeholder={m.postImageAltPlaceholder()}
					/>
				</label>
				<button type="button" class="ghost article-cover-remove" {disabled} onclick={removeHeader}>
					<Icon name="close" size={14} />
					<span>{m.articleHeaderImageRemove()}</span>
				</button>
			{/if}
			{#if error}<p class="error" role="alert">{error}</p>{/if}
		</section>

		<section class="article-meta-field">
			<span class="article-meta-label">{m.articleTagsLabel()}</span>
			{#if tags.length}
				<ul class="article-tags">
					{#each tags as tag (tag)}
						<li class="article-tag">
							<Icon name="hash" size={12} />
							<span>{tag}</span>
							<button
								type="button"
								class="icon-action article-tag-remove"
								{disabled}
								aria-label={m.articleTagRemove({ tag })}
								title={m.articleTagRemove({ tag })}
								onclick={() => (tags = tags.filter((value) => value !== tag))}
							>
								<Icon name="close" size={12} />
							</button>
						</li>
					{/each}
				</ul>
			{/if}
			<input
				class="article-tag-input"
				type="text"
				bind:value={tagDraft}
				{disabled}
				placeholder={m.articleTagsPlaceholder()}
				aria-label={m.articleTagsLabel()}
				onkeydown={(event) => {
					// 変換確定の Enter でタグを作らない（日本語入力で誤爆するため）。
					if (event.key !== 'Enter' || event.isComposing) return;
					event.preventDefault();
					commitTag();
				}}
				onblur={commitTag}
			/>
			{#if tagError}<p class="error" role="alert">{tagError}</p>{/if}
			<p class="article-meta-note">{m.articleTagsHint()}</p>
		</section>

		<section class="article-meta-field">
			<span class="article-meta-label">{m.articlePublishTargetLabel()}</span>
			<p class="article-meta-note">{m.articlePublishTargetValue()}</p>
			<p class="article-meta-note">{m.articleCrosspostTeaserNote()}</p>
		</section>
	</div>
</details>

<style>
	.article-meta {
		min-width: 0;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--surface-2);
	}
	.article-meta summary {
		padding: 10px 12px;
		color: var(--text-sub);
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
	}
	.article-meta-body {
		display: grid;
		gap: 14px;
		min-width: 0;
		padding: 0 12px 12px;
	}
	.article-meta-field {
		display: grid;
		gap: 6px;
		min-width: 0;
	}
	.article-meta-label {
		color: var(--text-sub);
		font-size: 12px;
		font-weight: 700;
	}
	.article-meta-note {
		margin: 0;
		color: var(--text-muted);
		font-size: 11px;
		line-height: 1.5;
	}
	.article-cover {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		min-width: 0;
		/* モバイルで本文を押し潰さないよう、比率と dvh の小さい方で頭打ちにする。 */
		aspect-ratio: 16 / 9;
		max-height: min(240px, 26dvh);
		padding: 0;
		overflow: hidden;
		border: 1px dashed var(--line-strong);
		border-radius: var(--r-sm);
		background: var(--surface-1);
		cursor: pointer;
	}
	.article-cover.dragging {
		border-color: var(--accent);
		background: var(--accent-soft);
	}
	.article-cover.has-image {
		border-style: solid;
	}
	.article-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.article-cover-placeholder {
		display: grid;
		gap: 6px;
		justify-items: center;
		padding: 8px;
		color: var(--text-muted);
		font-size: 11px;
		text-align: center;
		overflow-wrap: anywhere;
	}
	.article-cover-spinner {
		display: grid;
		place-items: center;
		position: absolute;
		inset: 0;
		background: color-mix(in srgb, var(--bg) 60%, transparent);
	}
	.article-cover-alt {
		display: grid;
		gap: 4px;
		color: var(--text-sub);
		font-size: 11px;
	}
	.article-cover-alt input {
		min-width: 0;
		width: 100%;
	}
	.article-cover-remove {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		width: fit-content;
		padding: 4px 8px;
		font-size: 11px;
	}
	.article-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		min-width: 0;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.article-tag {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		min-width: 0;
		padding: 3px 4px 3px 7px;
		border: 1px solid var(--line-strong);
		border-radius: 999px;
		background: var(--surface-1);
		font-size: 11px;
		/* 長いタグでモーダルに横スクロールを作らない。 */
		overflow-wrap: anywhere;
	}
	.article-tag-remove {
		min-width: 18px;
		min-height: 18px;
	}
	.article-tag-input {
		width: 100%;
		min-width: 0;
		padding: 7px 9px;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-sm);
		background: var(--surface-1);
		color: var(--text);
		/* iOS が入力時に自動ズームしない下限。 */
		font-size: 16px;
	}
	@media (min-width: 768px) {
		.article-meta summary {
			display: none;
		}
		.article-meta-body {
			padding-top: 12px;
		}
		.article-tag-input {
			font-size: 13px;
		}
	}
</style>
