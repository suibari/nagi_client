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
export type StrongRef = { uri: string; cid: string };
export type NewsView = {
	uri: string;
	cid: string;
	articleId: string;
	url: string;
	title: string;
	sourceName?: string;
	sourceUrl?: string;
	publishedAt?: string;
	botComment: string;
	lang: 'ja' | 'en';
	createdAt: string;
	indexedAt: string;
	reactions: ReactionView[];
	unavailable?: boolean;
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
	reply?: { root: StrongRef; parent: StrongRef };
	images?: PostImage[];
	linkCards?: LinkCardView[];
	quote?: { kind: 'post'; post: PostView } | { kind: 'news'; news: NewsView };
	reactions: ReactionView[];
	isBot: boolean;
	isAffirmation: boolean;
	/** このレコード自身のこっそり値。新規データではスレッドルートだけが持つ。 */
	kossori?: boolean;
	/** ルート投稿から解決した、スレッド全体の有効なこっそり状態。 */
	threadKossori?: boolean;
	/** 所属チャンネル（あれば）。バッジ表示・返信時の継承元に使う。 */
	channel?: { uri: string; cid: string; name?: string };
	/** CH 限定投稿（グローバル非表示）か。 */
	channelOnly?: boolean;
	/** 投稿後に編集された（AppView が cid 変化を観測した）か。UI の「編集済み」バッジ用。 */
	edited?: boolean;
	deleted?: boolean;
	/** Client-only state; never returned by the AppView API. */
	optimisticState?: 'sending' | 'indexing';
	/** Client-only stable DOM key used while an optimistic post changes URI/CID. */
	optimisticKey?: string;
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
	/** botたんの自動分析コメント。閲覧者の言語に合わせた本文（無ければ undefined）。 */
	comment?: string;
};
export type ProfileNewsReactionItem = { kind: 'news'; news: NewsView };
export type ProfileFeedItem = FeedItem | ProfileNewsReactionItem;
export type ProfilePage = { profile: ProfileDetail; feed: Page<FeedItem> };
export type ProfileReactionPage = {
	profile: ProfileDetail;
	feed: Page<ProfileFeedItem>;
};
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
/** ユーザーが作るチャンネルのビュー。banner は AppView の blob プロキシへの相対パス。 */
export type ChannelView = {
	uri: string;
	cid: string;
	did: string;
	name: string;
	description?: string;
	banner?: string;
	createdAt: string;
	indexedAt: string;
	/** 最新投稿時刻（活動順・過疎判定用）。投稿ゼロなら付かない。 */
	lastPostAt?: string;
	/** PDS のチャンネルレコードに保存された参照。取得不能でも解除に使う。 */
	pinnedPostRef?: StrongRef;
	/** 非削除かつこのチャンネル所属であることを確認済みのピン投稿。 */
	pinnedPost?: PostView;
};
export type ChannelsPage = { channels: ChannelView[]; cursor?: string; hasMore: boolean };
