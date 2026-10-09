/**
 * 動画添付。変換と配信は Bluesky の動画サービス（video.bsky.app）に任せる。
 *
 * 1. getUploadLimits で残り枠を確かめる（service auth の aud は video.bsky.app）
 * 2. uploadVideo へ送る（service auth の aud は利用者の PDS。サービスが代わりに uploadBlob する）
 * 3. getJobStatus を待ち、PDS に置かれた mp4 の blob を受け取る
 *
 * 再生は video.bsky.app/watch/{did}/{cid}/playlist.m3u8（AppView がビューで返す）。
 * Bluesky の投稿から参照されていない blob でも配信される（2026-10-09 実測）。
 */

export const VIDEO_SERVICE = 'https://video.bsky.app';
const VIDEO_SERVICE_DID = 'did:web:video.bsky.app';
/** app.bsky.embed.video と同じ上限。Nagi の lexicon もこれに揃えている。 */
export const MAX_VIDEO_SIZE = 100_000_000;
export const MAX_VIDEO_DURATION_SECONDS = 180;
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mpeg'];
const JOB_POLL_INTERVAL_MS = 1_500;
const JOB_TIMEOUT_MS = 10 * 60_000;

/** AppView の blueskyVideoUrls と同じ形。編集直後の楽観反映に使う。 */
export function blueskyVideoUrls(did: string, cid: string) {
	const base = `${VIDEO_SERVICE}/watch/${encodeURIComponent(did)}/${encodeURIComponent(cid)}`;
	return { playlist: `${base}/playlist.m3u8`, thumbnail: `${base}/thumbnail.jpg` };
}

export type VideoErrorCode =
	| 'type'
	| 'size'
	| 'duration'
	| 'metadata'
	| 'limit'
	| 'scope'
	| 'upload'
	| 'processing'
	| 'aborted';

export class VideoUploadError extends Error {
	constructor(
		message: string,
		readonly code: VideoErrorCode,
		readonly detail?: string,
	) {
		super(message);
	}
}

export type VideoBlobRef = {
	$type: 'blob';
	ref: { $link: string };
	mimeType: string;
	size: number;
};

export type VideoMetadata = {
	duration: number;
	aspectRatio: { width: number; height: number };
};

/**
 * 送信の段階。送信中だけは実際に送ったバイト数で % が出せる。
 * 変換側の progress は「その段階の中での進み」で、エンコード中は 0 のまま動かず、
 * PDS への保存に入ると 70 へ飛ぶ（2026-10-09 実測）。全体の % としては使えないので、
 * 段階（変換中・仕上げ中）だけを伝える。
 */
export type UploadPhase =
	{ phase: 'uploading'; progress: number } | { phase: 'processing' } | { phase: 'finishing' };

/** getJobStatus の state を表示上の段階へ寄せる。PDS へ保存している段階だけ「仕上げ中」。 */
export function phaseOfJobState(state: string | undefined): 'processing' | 'finishing' {
	return state === 'JOB_STATE_UPLOADING' ? 'finishing' : 'processing';
}

/** 送る前に弾けるものは、ここで弾く（MIME と大きさ）。 */
export function checkVideoFile(file: Pick<File, 'type' | 'size'>) {
	if (!SUPPORTED_VIDEO_TYPES.includes(file.type))
		throw new VideoUploadError('Unsupported video type', 'type');
	if (file.size > MAX_VIDEO_SIZE) throw new VideoUploadError('Video is too large', 'size');
}

export function checkVideoMetadata(metadata: VideoMetadata) {
	if (!Number.isFinite(metadata.duration) || metadata.duration <= 0)
		throw new VideoUploadError('Video duration is unavailable', 'metadata');
	if (metadata.duration > MAX_VIDEO_DURATION_SECONDS)
		throw new VideoUploadError('Video is too long', 'duration');
}

/** <video> に読ませて長さと縦横を取る。デコードできない動画はここで落ちる。 */
export function readVideoMetadata(file: Blob): Promise<VideoMetadata> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const video = document.createElement('video');
		const done = () => {
			clearTimeout(timer);
			video.removeAttribute('src');
			video.load();
			URL.revokeObjectURL(url);
		};
		const timer = setTimeout(() => {
			done();
			reject(new VideoUploadError('Timed out reading video metadata', 'metadata'));
		}, 15_000);
		video.preload = 'metadata';
		video.muted = true;
		video.onloadedmetadata = () => {
			const metadata = {
				duration: video.duration,
				aspectRatio: { width: video.videoWidth, height: video.videoHeight },
			};
			done();
			if (!metadata.aspectRatio.width || !metadata.aspectRatio.height)
				reject(new VideoUploadError('Video has no picture', 'metadata'));
			else resolve(metadata);
		};
		video.onerror = () => {
			done();
			reject(new VideoUploadError('Could not read video', 'metadata'));
		};
		video.src = url;
	});
}

/** PDS が service auth を拒んだのが権限不足かどうか。古いセッションは再認可で直る。 */
export function isMissingScopeError(error: unknown) {
	const text = [(error as { error?: unknown })?.error, (error as { message?: unknown })?.message]
		.filter((value): value is string => typeof value === 'string')
		.join(' ');
	return /scope/i.test(text);
}

export type ServiceAuthAgent = {
	com: {
		atproto: {
			server: {
				getServiceAuth(params: {
					aud: string;
					lxm: string;
					exp?: number;
				}): Promise<{ data: { token: string } }>;
			};
		};
	};
};

async function serviceAuth(agent: ServiceAuthAgent, aud: string, lxm: string) {
	try {
		const { data } = await agent.com.atproto.server.getServiceAuth({
			aud,
			lxm,
			exp: Math.floor(Date.now() / 1000) + 30 * 60,
		});
		return data.token;
	} catch (cause) {
		throw new VideoUploadError(
			'Could not get service auth',
			isMissingScopeError(cause) ? 'scope' : 'upload',
			cause instanceof Error ? cause.message : undefined,
		);
	}
}

type JobStatus = {
	jobId?: string;
	state?: string;
	progress?: number;
	blob?: VideoBlobRef;
	error?: string;
	message?: string;
};

/**
 * uploadVideo の応答から jobStatus を取り出す。lexicon では { jobStatus } で包まれるが、
 * 実際のサービスは平らな形で返す（2026-10-09 実測）。409（同じ動画の再送）も jobId を返す。
 */
export function jobStatusOf(body: unknown): JobStatus | undefined {
	if (!body || typeof body !== 'object') return undefined;
	const wrapped = (body as { jobStatus?: unknown }).jobStatus;
	const status = (wrapped && typeof wrapped === 'object' ? wrapped : body) as JobStatus;
	return typeof status.jobId === 'string' ? status : undefined;
}

const delay = (ms: number, signal?: AbortSignal) =>
	new Promise<void>((resolve, reject) => {
		if (signal?.aborted) return reject(new VideoUploadError('Aborted', 'aborted'));
		const timer = setTimeout(resolve, ms);
		signal?.addEventListener(
			'abort',
			() => {
				clearTimeout(timer);
				reject(new VideoUploadError('Aborted', 'aborted'));
			},
			{ once: true },
		);
	});

/** 変換が終わるまで getJobStatus を見る。完了すると PDS に置かれた blob が返る。 */
export async function waitForVideoJob(
	jobId: string,
	options: {
		fetch?: typeof fetch;
		signal?: AbortSignal;
		onState?: (state: string) => void;
		intervalMs?: number;
		timeoutMs?: number;
	} = {},
): Promise<VideoBlobRef> {
	const fetcher = options.fetch ?? fetch;
	const deadline = Date.now() + (options.timeoutMs ?? JOB_TIMEOUT_MS);
	const url = new URL('/xrpc/app.bsky.video.getJobStatus', VIDEO_SERVICE);
	url.searchParams.set('jobId', jobId);
	while (Date.now() < deadline) {
		let status: JobStatus | undefined;
		try {
			const response = await fetcher(url, { signal: options.signal });
			if (response.ok) status = jobStatusOf(await response.json());
		} catch (cause) {
			if (options.signal?.aborted) throw new VideoUploadError('Aborted', 'aborted');
			// 一時的な通信エラーは次の問い合わせで回復する。
			void cause;
		}
		if (status?.state === 'JOB_STATE_COMPLETED') {
			if (status.blob?.ref?.$link) return status.blob;
			throw new VideoUploadError('Processed video has no blob', 'processing');
		}
		if (status?.state === 'JOB_STATE_FAILED')
			throw new VideoUploadError(
				'Video processing failed',
				'processing',
				status.message ?? status.error,
			);
		if (typeof status?.state === 'string') options.onState?.(status.state);
		await delay(options.intervalMs ?? JOB_POLL_INTERVAL_MS, options.signal);
	}
	throw new VideoUploadError('Video processing timed out', 'processing');
}

/** XHR で送る。fetch では送信の進捗が取れないため。 */
function postVideo(
	url: URL,
	token: string,
	file: Blob,
	onProgress: (progress: number) => void,
	signal?: AbortSignal,
): Promise<{ status: number; body: unknown }> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', url);
		xhr.setRequestHeader('Authorization', `Bearer ${token}`);
		xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
		xhr.responseType = 'json';
		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
		};
		xhr.onload = () => resolve({ status: xhr.status, body: xhr.response });
		xhr.onerror = () => reject(new VideoUploadError('Video upload failed', 'upload'));
		xhr.onabort = () => reject(new VideoUploadError('Aborted', 'aborted'));
		signal?.addEventListener('abort', () => xhr.abort(), { once: true });
		xhr.send(file);
	});
}

/**
 * 動画を video.bsky.app に送り、変換済み mp4 の blob を受け取る。
 * pdsUrl は利用者の PDS（OAuth の token info の aud）。
 */
export async function uploadVideo(
	agent: ServiceAuthAgent,
	did: string,
	pdsUrl: string,
	file: File,
	options: { signal?: AbortSignal; onPhase?: (phase: UploadPhase) => void } = {},
): Promise<VideoBlobRef> {
	const limitsToken = await serviceAuth(agent, VIDEO_SERVICE_DID, 'app.bsky.video.getUploadLimits');
	const limits = await fetch(new URL('/xrpc/app.bsky.video.getUploadLimits', VIDEO_SERVICE), {
		headers: { Authorization: `Bearer ${limitsToken}` },
		signal: options.signal,
	})
		.then((response) => (response.ok ? response.json() : undefined))
		.catch(() => undefined);
	if (limits && limits.canUpload === false)
		throw new VideoUploadError('Video upload limit reached', 'limit', limits.message);
	if (typeof limits?.remainingDailyBytes === 'number' && file.size > limits.remainingDailyBytes)
		throw new VideoUploadError('Video upload limit reached', 'limit', limits.message);

	const uploadToken = await serviceAuth(
		agent,
		`did:web:${new URL(pdsUrl).host}`,
		'com.atproto.repo.uploadBlob',
	);
	const url = new URL('/xrpc/app.bsky.video.uploadVideo', VIDEO_SERVICE);
	url.searchParams.set('did', did);
	url.searchParams.set('name', `${crypto.randomUUID()}.${extensionOf(file.type)}`);
	options.onPhase?.({ phase: 'uploading', progress: 0 });
	const { status, body } = await postVideo(
		url,
		uploadToken,
		file,
		(progress) => options.onPhase?.({ phase: 'uploading', progress }),
		options.signal,
	);
	const job = jobStatusOf(body);
	// 409 は同じ動画を以前にも送ったとき。返ってきた jobId をそのまま待てばよい。
	if (!job?.jobId || (status >= 400 && status !== 409)) {
		const detail = (body as { message?: string } | null)?.message;
		throw new VideoUploadError('Video upload failed', 'upload', detail);
	}
	if (job.state === 'JOB_STATE_COMPLETED' && job.blob?.ref?.$link) return job.blob;
	options.onPhase?.({ phase: 'processing' });
	return waitForVideoJob(job.jobId, {
		signal: options.signal,
		onState: (state) => options.onPhase?.({ phase: phaseOfJobState(state) }),
	});
}

function extensionOf(type: string) {
	if (type === 'video/quicktime') return 'mov';
	if (type === 'video/webm') return 'webm';
	if (type === 'video/mpeg') return 'mpeg';
	return 'mp4';
}
