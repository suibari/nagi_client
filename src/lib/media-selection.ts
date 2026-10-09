import { SUPPORTED_VIDEO_TYPES } from './video';

/** ファイル選択の accept。動画を受け付ける入口では動画の形式も足す。 */
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
export const MEDIA_ACCEPT = `${IMAGE_ACCEPT},${SUPPORTED_VIDEO_TYPES.join(',')}`;

/**
 * 画像ボタンで選ばれたファイルの振り分け。画像（4枚まで）と動画（1本まで）は同じ投稿に
 * 混ぜてよい。ポストモーダルと投稿編集の両方がこの規則を使う。
 */
export type MediaSelection =
	{ kind: 'media'; images: File[]; video?: File } | { kind: 'error'; reason: 'video-count' };

export function isVideoFile(file: Pick<File, 'type'>) {
	return file.type.startsWith('video/');
}

export function splitMediaSelection(
	files: File[],
	options: { allowVideo: boolean; hasVideo: boolean },
): MediaSelection {
	if (!options.allowVideo) return { kind: 'media', images: files };
	const videos = files.filter(isVideoFile);
	if (videos.length > (options.hasVideo ? 0 : 1)) return { kind: 'error', reason: 'video-count' };
	const images = files.filter((file) => !isVideoFile(file));
	return { kind: 'media', images, ...(videos.length ? { video: videos[0] } : {}) };
}

/** 貼り付けから拾うファイル。動画を受け付けない入口では画像だけ。 */
export function pastedMediaFiles(data: DataTransfer, allowVideo: boolean): File[] {
	const accepts = (type: string) =>
		type.startsWith('image/') || (allowVideo && type.startsWith('video/'));
	const itemFiles = [...data.items]
		.filter((item) => item.kind === 'file' && accepts(item.type))
		.flatMap((item) => {
			const file = item.getAsFile();
			return file ? [file] : [];
		});
	return itemFiles.length ? itemFiles : [...data.files].filter((file) => accepts(file.type));
}
