import type {
	AppBskyFeedDefs,
	AppBskyNotificationListNotifications,
	ModerationOpts,
} from '@atproto/api';
import { toActor, toPostCard, type BskyActor, type BskyPostCardView } from './mapView';
import { bskyPostDisplay } from './moderation';

/** Nagi の通知タブに出す Bluesky の通知の種類（NOTIFY-07）。これ以外は出さない。 */
export const BSKY_NOTIFICATION_REASONS = [
	'reply',
	'mention',
	'quote',
	'like',
	'repost',
	'follow',
] as const;
export type BskyNotificationReason = (typeof BSKY_NOTIFICATION_REASONS)[number];

type Notification = AppBskyNotificationListNotifications.Notification;

export type BskyNotificationView = {
	/** 通知そのもののレコード（返信の投稿、いいね、フォローなど）。 */
	id: string;
	reason: BskyNotificationReason;
	actor: BskyActor;
	createdAt: string;
	isRead: boolean;
	/**
	 * 返信・メンション・引用では相手の投稿、いいね・リポストでは自分の投稿。
	 * 消えている・取得できないときは無い。
	 */
	post?: BskyPostCardView;
};

const isShown = (reason: string): reason is BskyNotificationReason =>
	(BSKY_NOTIFICATION_REASONS as readonly string[]).includes(reason);

export function isBskyNotificationVisible(
	item: BskyNotificationView,
	moderation: ModerationOpts,
	viewer: { isAdult: boolean },
): boolean {
	return !item.post || !bskyPostDisplay(item.post.raw, moderation, viewer).hidden;
}

/** 通知に添えて見せる投稿の URI。相手の投稿か、反応の付いた自分の投稿か。 */
export function notificationPostUri(notification: Notification): string | undefined {
	switch (notification.reason) {
		case 'reply':
		case 'mention':
		case 'quote':
			return notification.uri;
		case 'like':
		case 'repost':
			return notification.reasonSubject;
		default:
			return undefined;
	}
}

/**
 * Bluesky の通知を、対象の種類だけに絞って表示用へ変換する。
 * Bluesky の公式アプリのような「ほか N 人」のまとめは作らず、1件ずつのまま返す。
 */
export function toBskyNotifications(
	notifications: Notification[],
	posts: Map<string, AppBskyFeedDefs.PostView>,
): BskyNotificationView[] {
	return notifications.flatMap((notification) => {
		if (!isShown(notification.reason)) return [];
		const uri = notificationPostUri(notification);
		const post = uri ? posts.get(uri) : undefined;
		return [
			{
				id: notification.uri,
				reason: notification.reason,
				actor: toActor(notification.author),
				createdAt: notification.indexedAt,
				isRead: notification.isRead,
				...(post ? { post: toPostCard(post) } : {}),
			},
		];
	});
}
