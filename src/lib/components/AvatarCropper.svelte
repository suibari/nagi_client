<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';

	let {
		file,
		onconfirm,
		oncancel,
	}: { file: File; onconfirm: (blob: Blob) => void; oncancel: () => void } = $props();
	const viewport = 280;
	let source = $state('');
	let imageWidth = $state(0);
	let imageHeight = $state(0);
	let zoom = $state(1);
	let offsetX = $state(0);
	let offsetY = $state(0);
	let dragging = $state(false);
	let pointerX = 0;
	let pointerY = 0;
	let startX = 0;
	let startY = 0;
	let processing = $state(false);
	let error = $state('');
	let image = $state<HTMLImageElement>();

	let baseScale = $derived(
		imageWidth && imageHeight ? Math.max(viewport / imageWidth, viewport / imageHeight) : 1,
	);
	let scale = $derived(baseScale * zoom);

	function clampOffsets(x = offsetX, y = offsetY) {
		const minX = viewport - imageWidth * scale;
		const minY = viewport - imageHeight * scale;
		offsetX = Math.min(0, Math.max(minX, x));
		offsetY = Math.min(0, Math.max(minY, y));
	}

	function loadImage(event: Event) {
		const target = event.currentTarget as HTMLImageElement;
		imageWidth = target.naturalWidth;
		imageHeight = target.naturalHeight;
		offsetX = (viewport - imageWidth * baseScale) / 2;
		offsetY = (viewport - imageHeight * baseScale) / 2;
	}

	function changeZoom(event: Event) {
		const next = Number((event.currentTarget as HTMLInputElement).value);
		const oldScale = scale;
		const centerX = (viewport / 2 - offsetX) / oldScale;
		const centerY = (viewport / 2 - offsetY) / oldScale;
		zoom = next;
		offsetX = viewport / 2 - centerX * scale;
		offsetY = viewport / 2 - centerY * scale;
		clampOffsets();
	}

	function pointerDown(event: PointerEvent) {
		dragging = true;
		pointerX = event.clientX;
		pointerY = event.clientY;
		startX = offsetX;
		startY = offsetY;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function pointerMove(event: PointerEvent) {
		if (!dragging) return;
		clampOffsets(startX + event.clientX - pointerX, startY + event.clientY - pointerY);
	}

	async function crop() {
		processing = true;
		error = '';
		try {
			const size = 512;
			const canvas = document.createElement('canvas');
			canvas.width = size;
			canvas.height = size;
			const context = canvas.getContext('2d');
			if (!context) throw new Error(m.imageProcessFailed());
			const ratio = size / viewport;
			context.drawImage(
				image!,
				offsetX * ratio,
				offsetY * ratio,
				imageWidth * scale * ratio,
				imageHeight * scale * ratio,
			);
			let quality = 0.9;
			let blob: Blob | null = null;
			do {
				blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
				quality -= 0.1;
			} while (blob && blob.size > 1_000_000 && quality >= 0.4);
			if (!blob || blob.size > 1_000_000) throw new Error(m.imageCompressFailed());
			onconfirm(blob);
		} catch (cause) {
			error = cause instanceof Error ? cause.message : m.imageProcessFailed();
		} finally {
			processing = false;
		}
	}

	onMount(() => {
		source = URL.createObjectURL(file);
		return () => URL.revokeObjectURL(source);
	});
</script>

<div class="cropper-backdrop" role="presentation">
	<div class="cropper-dialog" role="dialog" aria-modal="true" aria-labelledby="cropper-title">
		<h2 id="cropper-title">{m.cropperTitle()}</h2>
		<div
			class="cropper-viewport"
			onpointerdown={pointerDown}
			onpointermove={pointerMove}
			onpointerup={() => (dragging = false)}
			onpointercancel={() => (dragging = false)}
			role="application"
			aria-label={m.cropperDragAria()}
		>
			{#if source}
				<img
					bind:this={image}
					src={source}
					alt=""
					draggable="false"
					onload={loadImage}
					style:width={`${imageWidth * scale}px`}
					style:height={`${imageHeight * scale}px`}
					style:transform={`translate(${offsetX}px, ${offsetY}px)`}
				/>
			{/if}
		</div>
		<label class="cropper-zoom">
			<span>{m.cropperZoom()}</span>
			<input type="range" min="1" max="3" step="0.01" value={zoom} oninput={changeZoom} />
		</label>
		{#if error}<p class="error">{error}</p>{/if}
		<div class="cropper-actions">
			<button type="button" class="ghost" onclick={oncancel}>{m.cancel()}</button>
			<button type="button" class="primary" disabled={processing || !imageWidth} onclick={crop}>
				{processing ? m.processing() : m.confirm()}
			</button>
		</div>
	</div>
</div>
