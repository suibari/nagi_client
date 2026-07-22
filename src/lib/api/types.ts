export type ActorView = {
	did: string;
	handle: string;
	displayName?: string;
	description?: string;
	avatar?: string;
	/** botたん本人か。PostView.isBot はこれと同じ判定の投稿単位版。 */
	isBot?: boolean;
	/** 超ポジティブLv（Bluesky と共通のカウンタ。100以上もそのまま表示する） */
	superPositiveLevel?: number;
	/**
	 * 現在の称号（Bluesky と共通）。次の日記が書かれるまで維持される。
	 * UI 言語で出し分けるので両方来る。
	 */
	currentTitle?: { ja: string; en: string };
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
export type NewsView = {
	uri: string; cid: string; articleId: string; url: string; title: string;
	sourceName?: string; sourceUrl?: string; publishedAt?: string; botComment: string;
	lang: 'ja' | 'en'; createdAt: string; indexedAt: string; unavailable?: boolean;
};
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
	quote?: { kind: 'post'; post: PostView } | { kind: 'news'; news: NewsView };
	reactions: ReactionView[];
	isBot: boolean;
	isAffirmation: boolean;
	/** こっそりモード。グローバル/全肯定TLには出ず、プロフィール・スレッドでのみ見える。 */
	kossori?: boolean;
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
export type NewsPage = Page<NewsView>;
export type ProfileFeedFilter = 'posts' | 'replies' | 'media' | 'reactions';
export type ProfileDetail = ActorView & {
	postCount: number;
	firstPostAt?: string;
	joinedAt?: string;
};
export type ProfilePage = { profile: ProfileDetail; feed: Page<FeedItem> };
export type ThreadView = { post: PostView; replies: PostView[] };
/** botたんが書いた1日分の日記。ポストではないのでタイムラインには出ない。 */
export type DiaryView = {
	uri: string;
	cid: string;
	/** 日記の対象ユーザーの DID。 */
	subject: string;
	/** "YYYY-MM-DD"（本人のローカル日付） */
	date: string;
	text: string;
	titleJa?: string;
	titleEn?: string;
	langs?: string[];
	createdAt: string;
	indexedAt: string;
};
export type DiaryPage = { items: DiaryView[]; cursor?: string; hasMore: boolean };
export type NotificationView = {
	id: string;
	type: 'reply' | 'reaction' | 'mention' | 'diary';
	actor: ActorView;
	post?: PostView;
	/** type が 'diary' のときの日記本体。post は付かない。 */
	diary?: DiaryView;
	/** type が 'reaction' のときの、押された絵文字。 */
	reaction?: { emoji: string; bluemoji?: EmojiView };
	subjectUri: string;
	reasonUri: string;
	createdAt: string;
	readAt?: string;
};
export type SearchActorsResult = { actors: ActorView[] };
