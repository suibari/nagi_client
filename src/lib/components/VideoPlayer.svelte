<script lang="ts" module>
	/** 同時に鳴らさない。新しく再生が始まったら、前の動画を止める。 */
	let current: HTMLVideoElement | undefined;
</script>

<script lang="ts">
	import type HlsType from 'hls.js';
	import type { PostVideoView } from '$lib/api/types';
	import { m } from '$lib/i18n/i18n.svelte';
	import ContentWarningMask from './ContentWarningMask.svelte';
	import Icon from './shell/Icon.svelte';

	let { video }: { video: PostVideoView } = $props();
	let revealed = $state(false);
	let playing = $state(false);
	let failed = $state(false);
	let element = $state<HTMLVideoElement>();
	let hls: HlsType | undefined;

	const ratio = $derived(
		video.aspectRatio ? `${video.aspectRatio.width} / ${video.aspectRatio.height}` : '16 / 9',
	);
	// 縦長の動画で TL が埋まらないよう、横幅を縮めて高さを抑える。
	const portrait = $derived(
		Boolean(video.aspectRatio && video.aspectRatio.height > video.aspectRatio.width),
	);

	let playingSource: string | undefined;
	$effect(() => {
		if (video.playlist === playingSource) return;
		playingSource = video.playlist;
		stop();
		revealed = false;
		failed = false;
	});

	$effect(() => {
		if (!playing || !element) return;
		const media = element;
		let cancelled = false;
		void attach(media, () => cancelled);
		return () => {
			cancelled = true;
			hls?.destroy();
			hls = undefined;
			if (current === media) current = undefined;
		};
	});

	async function attach(media: HTMLVideoElement, cancelled: () => boolean) {
		// Safari（iOS 含む）は HLS をそのまま再生できる。それ以外は hls.js を必要なときだけ読む。
		if (media.canPlayType('application/vnd.apple.mpegurl')) {
			media.src = video.playlist;
		} else {
			const { default: Hls } = await import('hls.js');
			if (cancelled()) return;
			if (!Hls.isSupported()) {
				failed = true;
				playing = false;
				return;
			}
			hls = new Hls({ capLevelToPlayerSize: true });
			hls.on(Hls.Events.ERROR, (_event, data) => {
				if (!data.fatal) return;
				failed = true;
				playing = false;
			});
			hls.loadSource(video.playlist);
			hls.attachMedia(media);
		}
		media.play().catch(() => undefined);
	}

	function onplay(event: Event) {
		const media = event.currentTarget as HTMLVideoElement;
		if (current && current !== media) current.pause();
		current = media;
	}

	function stop() {
		playing = false;
	}
</script>

<div class="video-frame" class:portrait style:aspect-ratio={ratio}>
	{#if video.contentWarning && !revealed}
		<ContentWarningMask kind="image" bind:revealed>
			<img src={video.thumbnail} alt="" loading="lazy" />
		</ContentWarningMask>
	{:else if playing}
		<!-- 字幕は今回扱わないので track は持たない。 -->
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			bind:this={element}
			poster={video.thumbnail}
			controls
			playsinline
			aria-label={video.alt || m.videoPlayerLabel()}
			{onplay}
			onerror={() => {
				failed = true;
				playing = false;
			}}
		></video>
	{:else}
		<button
			class="video-preview"
			type="button"
			aria-label={video.alt ? m.videoPlayNamed({ alt: video.alt }) : m.videoPlay()}
			onclick={() => {
				failed = false;
				playing = true;
			}}
		>
			<img src={video.thumbnail} alt="" loading="lazy" />
			<span class="video-play" aria-hidden="true"><Icon name="play" size={26} /></span>
		</button>
		{#if failed}<p class="video-error" role="alert">{m.videoPlaybackFailed()}</p>{/if}
	{/if}
	{#if video.contentWarning && revealed && !playing}
		<button
			class="cw-rehide"
			type="button"
			aria-label={m.contentWarningHide()}
			title={m.contentWarningHide()}
			onclick={() => (revealed = false)}><Icon name="hide" size={16} /></button
		>
	{/if}
</div>

<style>
	.video-frame {
		position: relative;
		width: 100%;
		max-height: 420px;
		margin-top: 8px;
		overflow: hidden;
		border-radius: 12px;
		background: #000;
	}
	.video-frame.portrait {
		width: min(100%, 300px);
	}
	.video-frame :global(.cw-mask) {
		height: 100%;
		min-height: 0;
	}
	.video-frame img,
	.video-frame video {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.video-frame :global(.cw-mask img) {
		object-fit: cover;
	}
	.video-preview {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		background: #181818;
		cursor: pointer;
	}
	.video-preview img {
		position: absolute;
		inset: 0;
	}
	.video-play {
		position: relative;
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		padding-left: 4px;
		border-radius: 50%;
		background: rgb(0 0 0 / 62%);
		color: white;
		box-shadow: 0 2px 8px rgb(0 0 0 / 35%);
	}
	.video-preview:hover .video-play {
		background: rgb(0 0 0 / 78%);
	}
	.video-preview:focus-visible {
		outline: 3px solid var(--accent);
		outline-offset: -3px;
	}
	.video-error {
		position: absolute;
		inset: auto 8px 8px;
		margin: 0;
		padding: 6px 10px;
		border-radius: 8px;
		background: rgb(0 0 0 / 72%);
		color: white;
		font-size: 12px;
	}
</style>
