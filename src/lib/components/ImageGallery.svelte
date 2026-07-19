<script lang="ts">
	import { tick } from 'svelte';
	import type { PostImage } from '$lib/api/types';
	import { APPVIEW_URL } from '$lib/api/appview';
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';

	let { images }: { images: PostImage[] } = $props();
	let active = $state<number>();
	let opener = $state<HTMLButtonElement>();
	let closeButton = $state<HTMLButtonElement>();
	const resolve = (url: string) => (url.startsWith('/') ? APPVIEW_URL + url : url);

	async function open(index: number, button: HTMLButtonElement) {
		opener = button;
		active = index;
		await tick();
		closeButton?.focus();
	}

	async function close() {
		active = undefined;
		await tick();
		opener?.focus();
	}

	function move(offset: number) {
		if (active === undefined) return;
		active = (active + offset + images.length) % images.length;
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') void close();
		if (event.key === 'ArrowLeft' && images.length > 1) move(-1);
		if (event.key === 'ArrowRight' && images.length > 1) move(1);
		if (event.key === 'Tab') {
			const controls = [
				...(event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('button'),
			];
			const first = controls[0];
			const last = controls.at(-1);
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last?.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first?.focus();
			}
		}
	}
</script>

<div class="images" class:single={images.length === 1} data-count={images.length}>
	{#each images as image, index}
		<button
			class="image-tile"
			type="button"
			aria-label={image.alt || m.postImageOpen({ index: index + 1 })}
			onclick={(event) => void open(index, event.currentTarget)}
		>
			<img
				src={resolve(image.url)}
				alt={image.alt}
				loading="lazy"
				style:aspect-ratio={image.aspectRatio
					? `${image.aspectRatio.width} / ${image.aspectRatio.height}`
					: undefined}
			/>
		</button>
	{/each}
</div>

{#if active !== undefined}
	<div
		class="image-viewer"
		role="dialog"
		aria-modal="true"
		aria-label={m.postImageViewer()}
		tabindex="-1"
		onkeydown={keydown}
		onclick={(event) => event.target === event.currentTarget && void close()}
	>
		<button
			bind:this={closeButton}
			class="viewer-close"
			type="button"
			aria-label={m.postImageClose()}
			onclick={() => void close()}><Icon name="close" /></button
		>
		{#if images.length > 1}
			<button
				class="viewer-nav previous"
				type="button"
				aria-label={m.postImagePrevious()}
				onclick={() => move(-1)}><Icon name="chevron" /></button
			>
		{/if}
		<img src={resolve(images[active].url)} alt={images[active].alt} />
		{#if images.length > 1}
			<span class="viewer-count">{active + 1}/{images.length}</span>
			<button
				class="viewer-nav next"
				type="button"
				aria-label={m.postImageNext()}
				onclick={() => move(1)}><Icon name="chevron" /></button
			>
		{/if}
	</div>
{/if}
