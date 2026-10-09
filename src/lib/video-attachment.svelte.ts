import { get } from 'svelte/store';
import { Agent } from '@atproto/api';
import { session } from '$lib/oauth/session.svelte';
import {
	checkVideoFile,
	checkVideoMetadata,
	readVideoMetadata,
	uploadVideo,
	VideoUploadError,
	type VideoBlobRef,
	type VideoErrorCode,
} from './video';

export type VideoAttachmentStatus =
	'preparing' | 'uploading' | 'processing' | 'finishing' | 'ready' | 'error';

/**
 * 投稿に添付する動画1本。添付した時点で video.bsky.app への送信と変換を始め、
 * 終わるまで投稿ボタンを止める（status が 'ready' になるまで blob は無い）。
 */
export class VideoAttachment {
	readonly id = crypto.randomUUID();
	readonly previewUrl: string;
	status = $state<VideoAttachmentStatus>('preparing');
	progress = $state(0);
	error = $state<VideoErrorCode>();
	errorDetail = $state<string>();
	blob = $state<VideoBlobRef>();
	alt = $state('');
	contentWarning = $state(false);
	aspectRatio = $state<{ width: number; height: number }>();
	readonly #controller = new AbortController();

	constructor(readonly file: File) {
		this.previewUrl = URL.createObjectURL(file);
	}

	get ready() {
		return this.status === 'ready' && Boolean(this.blob);
	}

	/** 送信か変換の途中。ページを離れると失われる。 */
	get inFlight() {
		return ['preparing', 'uploading', 'processing', 'finishing'].includes(this.status);
	}

	async start() {
		try {
			checkVideoFile(this.file);
			const metadata = await readVideoMetadata(this.file);
			checkVideoMetadata(metadata);
			this.aspectRatio = metadata.aspectRatio;
			const current = get(session);
			if (!current) throw new VideoUploadError('Authentication required', 'upload');
			const pdsUrl = (await current.getTokenInfo()).aud;
			this.status = 'uploading';
			this.blob = await uploadVideo(new Agent(current), current.did, pdsUrl, this.file, {
				signal: this.#controller.signal,
				onPhase: (phase) => {
					this.status = phase.phase;
					if (phase.phase === 'uploading') this.progress = phase.progress;
				},
			});
			this.status = 'ready';
			this.progress = 100;
		} catch (cause) {
			if (this.#controller.signal.aborted) return;
			this.status = 'error';
			this.error = cause instanceof VideoUploadError ? cause.code : 'upload';
			this.errorDetail = cause instanceof VideoUploadError ? cause.detail : undefined;
		}
	}

	/** 外したときに呼ぶ。送信中なら止め、プレビューの URL を解放する。 */
	dispose() {
		this.#controller.abort();
		URL.revokeObjectURL(this.previewUrl);
	}

	/** レコードへ書く形。ready でなければ undefined。 */
	toRecord() {
		if (!this.blob) return undefined;
		return {
			video: this.blob,
			...(this.alt ? { alt: this.alt } : {}),
			...(this.contentWarning ? { contentWarning: true } : {}),
			...(this.aspectRatio ? { aspectRatio: this.aspectRatio } : {}),
		};
	}
}
