<script lang="ts">
	import { onDestroy } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session, signIn } from '$lib/oauth/session.svelte';
	import { grantedOptIns } from '$lib/optin/scope-optin';
	import type { VideoErrorCode } from '$lib/video';
	import { VideoAttachment } from '$lib/video-attachment.svelte';
	import ContentWarningMask from './ContentWarningMask.svelte';
	import Spinner from './Spinner.svelte';
	import Icon from './shell/Icon.svelte';

	let {
		video = $bindable(),
		disabled = false,
		contentWarningEnabled = true,
	}: {
		video: VideoAttachment | undefined;
		disabled?: boolean;
		/** 編集では、CW 運用で始まった投稿にしか CW を付けられない。 */
		contentWarningEnabled?: boolean;
	} = $props();
	let tracked: VideoAttachment | undefined;

	// 外された・差し替えられた動画は送信を止め、プレビューの URL を解放する。
	$effect(() => {
		if (tracked && tracked !== video) tracked.dispose();
		tracked = video;
	});
	onDestroy(() => tracked?.dispose());

	const errorMessages: Record<VideoErrorCode, () => string> = {
		type: m.videoErrorType,
		size: m.videoErrorSize,
		duration: m.videoErrorDuration,
		metadata: m.videoErrorMetadata,
		limit: m.videoErrorLimit,
		scope: m.videoErrorScope,
		upload: m.videoErrorUpload,
		processing: m.videoErrorProcessing,
		aborted: m.videoErrorUpload,
		duplicate: m.videoErrorDuplicate,
	};
	const status = $derived.by(() => {
		if (!video) return '';
		if (video.status === 'preparing') return m.videoPreparing();
		if (video.status === 'uploading') return m.videoUploading({ progress: video.progress });
		if (video.status === 'processing') return m.videoProcessing();
		if (video.status === 'finishing') return m.videoFinishing();
		if (video.status === 'ready') return m.videoReady();
		return '';
	});
	// 送り直して直るのは通信と変換の失敗だけ。形式や長さの誤りは選び直してもらう。
	const retryable = $derived(
		video?.error === 'upload' || video?.error === 'processing' || video?.error === 'aborted',
	);

	function setAlt(alt: string) {
		if (!video) return;
		video.alt = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(alt)]
			.slice(0, 1000)
			.map((segment) => segment.segment)
			.join('');
	}

	function retry() {
		if (!video) return;
		const next = new VideoAttachment(video.file);
		next.alt = video.alt;
		next.contentWarning = video.contentWarning;
		video = next;
		void next.start();
	}

	// 投稿モーダルは閉じても Composer を残すので、閉じるだけなら送信は続く。
	// 失われるのは再読み込みとタブを閉じたときだけなので、そこで離脱確認を出す。
	function beforeunload(event: BeforeUnloadEvent) {
		if (!video?.inFlight) return;
		event.preventDefault();
		event.returnValue = m.videoLeaveWarning();
	}

	async function reauthorize() {
		if (!$session) return;
		await signIn($session.did, { ...(await grantedOptIns()), refreshPermissions: true });
	}
</script>

<svelte:window onbeforeunload={beforeunload} />

{#if video}
	<div class="video-attachment">
		<!-- 添付欄は高さが限られていてスクロールする。状態はプレビューの上に重ね、
		     スクロールしなくても進み具合が見えるようにする。 -->
		<div
			class="video-attachment-preview"
			style:aspect-ratio={video.aspectRatio
				? `${video.aspectRatio.width} / ${video.aspectRatio.height}`
				: '16 / 9'}
		>
			{#if video.contentWarning}
				<ContentWarningMask kind="image" interactive={false}>
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={video.previewUrl} muted preload="metadata"></video>
				</ContentWarningMask>
			{:else}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={video.previewUrl} muted preload="metadata" playsinline></video>
			{/if}
			<button
				class="attachment-remove"
				type="button"
				aria-label={m.videoRemove()}
				{disabled}
				onclick={() => (video = undefined)}><Icon name="close" size={16} /></button
			>
			{#if video.status === 'error' && video.error}
				<div class="video-attachment-status failed" role="alert">
					<span class="video-attachment-message"
						><Icon name="warning" size={14} />{errorMessages[video.error]()}</span
					>
					{#if video.error === 'scope'}
						<button type="button" onclick={() => void reauthorize()}>{m.videoReauthorize()}</button>
					{:else if retryable}
						<button type="button" {disabled} onclick={retry}>{m.videoRetry()}</button>
					{/if}
				</div>
			{:else}
				<div class="video-attachment-status" class:done={video.ready} aria-live="polite">
					<span class="video-attachment-message">
						{#if video.ready}<Icon name="check" size={14} />{:else}<Spinner
								inline
								size="sm"
								decorative
							/>{/if}
						{status}
					</span>
					{#if !video.ready}
						<!-- % が分かるのは送信中だけ。確認・変換・仕上げは終わりの見えないバーにする。
						     value に undefined を渡しても value="0" が残るので、要素ごと分ける。 -->
						{#if video.status === 'uploading'}
							<progress max="100" value={video.progress}></progress>
						{:else}
							<progress></progress>
						{/if}
					{/if}
				</div>
			{/if}
		</div>
		{#if contentWarningEnabled}
			<button
				class="ghost attachment-cw"
				class:active={video.contentWarning}
				type="button"
				aria-pressed={video.contentWarning}
				{disabled}
				onclick={() => video && (video.contentWarning = !video.contentWarning)}
				><Icon name="warning" size={16} /><span>{m.contentWarningImage()}</span></button
			>
		{/if}
		<label>
			<span>{m.videoAltLabel()}</span>
			<input
				type="text"
				value={video.alt}
				maxlength="10000"
				{disabled}
				oninput={(event) => setAlt((event.currentTarget as HTMLInputElement).value)}
				placeholder={m.videoAltPlaceholder()}
			/>
		</label>
		<p class="video-attachment-note">{m.videoServiceNote()}</p>
	</div>
{/if}

<style>
	.video-attachment {
		display: grid;
		gap: 8px;
		margin-top: 8px;
	}
	.video-attachment-preview {
		position: relative;
		width: min(100%, 280px);
		max-height: 158px;
		overflow: hidden;
		border-radius: 12px;
		background: #000;
	}
	.video-attachment-preview video {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.video-attachment-preview :global(.cw-mask) {
		height: 100%;
	}
	.video-attachment-status {
		position: absolute;
		inset: auto 0 0;
		display: grid;
		gap: 5px;
		padding: 7px 9px 8px;
		background: rgb(0 0 0 / 72%);
		color: white;
		font-size: 12px;
	}
	.video-attachment-status.done {
		padding-block: 5px;
	}
	.video-attachment-status.failed {
		background: rgb(120 20 20 / 88%);
	}
	.video-attachment-message {
		display: flex;
		gap: 6px;
		align-items: center;
		line-height: 1.35;
	}
	.video-attachment-status progress {
		width: 100%;
		height: 4px;
		accent-color: var(--accent);
	}
	.video-attachment-status button {
		justify-self: start;
		padding: 3px 9px;
		border: 1px solid rgb(255 255 255 / 70%);
		border-radius: 999px;
		background: transparent;
		color: white;
		font-size: 12px;
	}
	.video-attachment label {
		display: grid;
		gap: 4px;
		font-size: 13px;
	}
	.video-attachment-note {
		margin: 0;
		color: var(--text-muted);
		font-size: 12px;
	}
	.video-attachment > button {
		justify-self: start;
	}
</style>
