import { SUPPORTED_VIDEO_TYPES } from './video';

/** ファイル選択の accept。動画を受け付ける入口では動画の形式も足す。 */
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
export const MEDIA_ACCEPT = `${IMAGE_ACCEPT},${SUPPORTED_VIDEO_TYPES.join(',')}`;

/**
 * 画像ボタンで選ばれたファイルの振り分け。動画は1本だけで、画像とは同時に付けない
 * （Bluesky と同じ）。ポストモーダルと投稿編集の両方がこの規則を使う。
 */
export type MediaSelection =
	| { kind: 'images'; files: File[] }
	| { kind: 'video'; file: File }
	| { kind: 'error'; reason: 'video-count' | 'video-with-images' };

export function isVideoFile(file: Pick<File, 'type'>) {
	return file.type.startsWith('video/');
}

export function splitMediaSelection(
	files: File[],
	options: { allowVideo: boolean; hasImages: boolean },
): MediaSelection {
	const videos = options.allowVideo ? files.filter(isVideoFile) : [];
	if (!videos.length) return { kind: 'images', files };
	if (videos.length > 1) return { kind: 'error', reason: 'video-count' };
	if (videos.length !== files.length || options.hasImages)
		return { kind: 'error', reason: 'video-with-images' };
	return { kind: 'video', file: videos[0] };
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
