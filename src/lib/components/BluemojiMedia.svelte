<script lang="ts">
	import { onMount } from 'svelte';
	import wasmUrl from '@lottiefiles/dotlottie-web/dotlottie-player.wasm?url';
	import { resolveEmojiUrl, displayEmojiName } from '$lib/atproto/bluemoji';
	import type { EmojiView } from '$lib/api/types';

	let {
		emoji,
		class: className = '',
		loading = 'lazy',
		onunavailable,
	}: {
		emoji: EmojiView;
		class?: string;
		loading?: 'eager' | 'lazy';
		onunavailable?: () => void;
	} = $props();

	let host = $state<HTMLSpanElement>();
	let canvas = $state<HTMLCanvasElement>();
	let nearViewport = $state(false);
	const label = $derived(emoji.alt ?? displayEmojiName(emoji.name));
	const lottie = $derived(emoji.mediaType === 'application/lottie+zip');

	onMount(() => {
		if (loading === 'eager') {
			nearViewport = true;
			return;
		}
		if (nearViewport || !host) return;
		if (!('IntersectionObserver' in window)) {
			nearViewport = true;
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				nearViewport = true;
				observer.disconnect();
			},
			{ rootMargin: '120px' },
		);
		observer.observe(host);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!nearViewport || !lottie || !canvas) return;
		const target = canvas;
		const reduced = matchMedia('(prefers-reduced-motion: reduce)');
		let visible = false;
		let destroyed = false;
		let player: import('@lottiefiles/dotlottie-web').DotLottie | undefined;

		const syncPlayback = () => {
			if (!player) return;
			if (reduced.matches || !visible) {
				player.pause();
				if (reduced.matches) player.setFrame(0);
			} else {
				player.play();
			}
		};
		const observer = new IntersectionObserver(
			(entries) => {
				visible = entries.some((entry) => entry.isIntersecting);
				syncPlayback();
			},
			{ rootMargin: '80px' },
		);
		observer.observe(target);
		reduced.addEventListener('change', syncPlayback);

		void import('@lottiefiles/dotlottie-web')
			.then(({ DotLottie }) => {
				if (destroyed) return;
				DotLottie.setWasmUrl(wasmUrl);
				player = new DotLottie({
					canvas: target,
					src: resolveEmojiUrl(emoji.url),
					autoplay: false,
					loop: true,
					layout: { fit: 'contain', align: [0.5, 0.5] },
					renderConfig: { devicePixelRatio: Math.min(devicePixelRatio, 2) },
				});
				player.addEventListener('load', syncPlayback);
				player.addEventListener('loadError', () => onunavailable?.());
			})
			.catch(() => onunavailable?.());

		return () => {
			destroyed = true;
			observer.disconnect();
			reduced.removeEventListener('change', syncPlayback);
			player?.destroy();
		};
	});
</script>

<span bind:this={host} class={`bluemoji-media ${className}`} title={displayEmojiName(emoji.name)}>
	{#if lottie}
		{#if nearViewport}<canvas bind:this={canvas} aria-label={label}>{label}</canvas>{/if}
	{:else if nearViewport}
		<img src={resolveEmojiUrl(emoji.url)} alt={label} {loading} onerror={onunavailable} />
	{/if}
</span>
