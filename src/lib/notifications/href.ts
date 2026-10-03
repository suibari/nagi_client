import type { NotificationView } from '$lib/api/types';
import { postPageHref } from '$lib/feed/post-follow.svelte';

/** 投稿以外の通知は専用画面へ、投稿は記事・返信の種類に合うページへ。 */
export function notificationHref(item: NotificationView, viewerDid?: string): string {
	if (item.type === 'diary') return `/diary${item.diary ? `?date=${item.diary.date}` : ''}`;
	if (item.type === 'analysis') return viewerDid ? `/profile/${viewerDid}` : '/notifications';
	const collection = item.subjectUri.slice('at://'.length).split('/')[1];
	if (
		item.cardSubject ||
		collection === 'com.suibari.nagi.cardGet' ||
		collection === 'com.suibari.nagi.zenkatsu'
	)
		return '/cards';
	// 付随する post が別の投稿を指す場合、その記事属性で subject の行き先を変えない。
	return postPageHref(item.post?.uri === item.subjectUri ? item.post : { uri: item.subjectUri });
}
