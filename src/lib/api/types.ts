export type ActorView = {
	did: string;
	handle: string;
	displayName?: string;
	description?: string;
	avatar?: string;
	/** 超ポジティブLv（Bluesky と共通のカウンタ。100以上もそのまま表示する） */
	superPositiveLevel?: number;
};
/** カスタム絵文字（blue.moji.collection.item）のビュー。url は AppView の blob プロキシ。 */
export type EmojiView = {
	uri: string;
	cid: string;
	did: string;
	name: string;
	alt?: string;
	url: string;
};
export type ReactionView = {
	emoji: string;
	bluemoji?: EmojiView;
	reactors: ActorView[];
	hasMoreReactors?: boolean;
	reactedByMe?: boolean;
	viewerReactionUri?: string;
};
export type AspectRatio = { width: number; height: number };
export type PostImage = { url: string; alt: string; aspectRatio?: AspectRatio };
export type Facet = { index: { byteStart: number; byteEnd: number }; features: unknown[] };
export type LinkCardView = { uri: string; title: string; description?: string; thumb?: string };
export type PostView = {
	uri: string;
	cid: string;
	author: ActorView;
	text: string;
	facets?: Facet[];
	langs?: string[];
	createdAt: string;
	indexedAt: string;
	reply?: { root?: string; parent: string };
	images?: PostImage[];
	linkCards?: LinkCardView[];
	quote?: PostView;
	reactions: ReactionView[];
	isBot: boolean;
	isAffirmation: boolean;
	deleted?: boolean;
	/** Client-only state; never returned by the AppView API. */
	optimisticState?: 'sending' | 'indexing';
};
export type BotReplyState = 'pending' | 'processing' | 'posted' | 'failed';
export type FeedItem = PostView & {
	replyParent?: PostView;
	botReply?: PostView;
	botReplyState?: BotReplyState;
};
export type Page<T> = { items: T[]; cursor?: string; hasMore: boolean; botActor?: ActorView };
export type TimelinePage = Page<FeedItem>;
export type ProfileFeedFilter = 'posts' | 'replies' | 'media' | 'reactions';
export type ProfileDetail = ActorView & {
	postCount: number;
	firstPostAt?: string;
	joinedAt?: string;
};
export type ProfilePage = { profile: ProfileDetail; feed: Page<FeedItem> };
export type ThreadView = { post: PostView; replies: PostView[] };
export type NotificationView = {
	id: string;
	type: 'reply' | 'reaction' | 'mention';
	actor: ActorView;
	post?: PostView;
	/** type が 'reaction' のときの、押された絵文字。 */
	reaction?: { emoji: string; bluemoji?: EmojiView };
	subjectUri: string;
	reasonUri: string;
	createdAt: string;
	readAt?: string;
};
export type SearchActorsResult = { actors: ActorView[] };
