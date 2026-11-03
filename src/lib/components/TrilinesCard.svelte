<script lang="ts">
	import type { PostView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import { trilinesEntryUrl } from '$lib/trilines/records';
	import ImageGallery from './ImageGallery.svelte';

	/**
	 * 3行日記（com.suibari.trilinesat.diary）の本文。行ごとに番号を振り、その行の画像を下に添える。
	 * 画像は AppView が行の順に images へまとめ、行からは imageIndex で指している。
	 */
	let {
		post,
		clampTall = false,
	}: { post: PostView & { trilines: NonNullable<PostView['trilines']> }; clampTall?: boolean } =
		$props();
</script>

<div class="trilines-card">
	<ol class="trilines-card-lines">
		{#each post.trilines.lines as line, index (index)}
			{@const image = line.imageIndex === undefined ? undefined : post.images?.[line.imageIndex]}
			<li>
				<span class="trilines-card-number" aria-hidden="true">{index + 1}</span>
				<div class="trilines-card-line">
					<p>{line.text}</p>
					{#if image}<ImageGallery images={[image]} {clampTall} />{/if}
				</div>
			</li>
		{/each}
	</ol>
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
		align-items: flex-start;
		gap: 8px;
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
		flex: 1;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}
	.trilines-card-line p {
		margin: 0;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
	}
	.trilines-card-link {
		align-self: flex-start;
		color: var(--text-muted);
		font-size: 12px;
	}
</style>
