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
/** 固定 Bluemoji Lexicon に準拠したカスタム絵文字ビュー。 */
export type BluemojiFacetFormats = {
	$type: 'blue.moji.richtext.facet#formats_v0';
	png_128?: string;
	webp_128?: string;
	gif_128?: string;
	apng_128?: boolean;
	lottie?: boolean;
};
export type EmojiView = {
	uri: string;
	cid: string;
	did: string;
	name: string;
	alt?: string;
	url: string;
	mediaType: `image/${string}` | 'application/lottie+zip';
	/** 他クライアントでも本文内Bluemojiを描画できる、公式richtext facet用スナップショット。 */
	formats?: BluemojiFacetFormats;
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
export type PostImage = {
	url: string;
	alt: string;
	contentWarning?: boolean;
	aspectRatio?: AspectRatio;
};
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
	submittedBy?: ActorView;
	unavailable?: boolean;
};
export type NewsSubmissionPreview = {
	articleId: string;
	url: string;
	title: string;
	sourceName: string;
	sourceUrl: string;
	publishedAt?: string;
	image?: string;
};
export type NewsSubmissionState =
	'pending' | 'processing' | 'approved' | 'rejected' | 'failed' | 'cancelled';
export type NewsSubmissionItem = {
	uri: string;
	cid: string;
	url: string;
	title: string;
	status: NewsSubmissionState;
	reasonCode?: string;
	requestedAt: string;
	finishedAt?: string;
};
export type PostView = {
	uri: string;
	cid: string;
	author: ActorView;
	text: string;
	facets?: Facet[];
	contentWarning?: { byteStart: number; byteEnd: number };
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
	cwRestricted?: boolean;
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
/**
 * 会話グループ化ビュー。共有TL(group モード)でのみ付き、1スレッドを
 * 「ルート + 最新数件のバブル」に畳んで表示する。bot返信もバブルとして時刻順に含む。
 */
/** 会話グループ内の1バブル。depth はルートからの返信ホップ数(root=0, 直リプ=1, ...)。 */
export type ConversationBubble = { post: PostView; depth: number };
export type ConversationView = {
	/** スレッドルートURI。dedup/マージ/DOMキーの安定キー。 */
	threadRootUri: string;
	/** スレッドの起点。常に先頭に表示する。 */
	root: PostView;
	/** ルート以降の共有可視バブル（時刻昇順・bot返信含む・最大3件・深さ付き）。 */
	bubbles: ConversationBubble[];
	/** ルートと最新群の間に畳まれた件数。0 なら区切りを出さない。 */
	hiddenCount: number;
	/** 共有可視バブルの総数（root 含む）。1 なら単独投稿。 */
	totalCount: number;
	/** 代表(最新の人間投稿)が botたんの返信を待っている状態。返信 indexed 済みなら付かない。 */
	awaitingBotReply?: 'pending' | 'processing' | 'failed';
};
export type FeedItem = PostView & {
	replyParent?: PostView;
	botReply?: PostView;
	botReplyState?: BotReplyState;
	/** group モード時のみ。会話ブロックとして描画するためのデータ。 */
	conversation?: ConversationView;
};
export type Page<T> = { items: T[]; cursor?: string; hasMore: boolean; botActor?: ActorView };
/**
 * my Nagi の「リスト動向」。1人 / 1チャンネルにつき最新1件しか来ないので、
 * 活発な相手が枠を埋め尽くさない。ページングは無く、続きは既存のTLへ送る。
 */
export type MyNagiListUser = { actor: ActorView; post: FeedItem };
export type MyNagiChannel = { channel: ChannelView; post: FeedItem };
export type MyNagiView = { listUsers: MyNagiListUser[]; channels: MyNagiChannel[] };
export type TimelinePage = Page<FeedItem>;
export type CommunityAffirmationView = {
	uri: string;
	cid: string;
	summary: string;
	createdAt: string;
	reactions: ReactionView[];
	images?: PostImage[];
	linkCards?: LinkCardView[];
};
export type CommunityAffirmationPage = Page<CommunityAffirmationView>;
/** 本人だけが取得できる、ホームに表示するユーザーの非公開一覧。 */
export type PrivateListView = { members: ActorView[]; limit: 200 };
export type NewsPage = Page<NewsView>;
export type ProfileFeedFilter = 'posts' | 'replies' | 'media' | 'reactions';
export type ProfileDetail = ActorView & {
	postCount: number;
	firstPostAt?: string;
	joinedAt?: string;
	/** botたんの自動分析コメント。閲覧者の言語に合わせた本文（無ければ undefined）。 */
	comment?: string;
	/**
	 * 名刺カード用の短いひとこと。閲覧者の言語に合わせた本文。
	 * 分析が v1 プロンプト時代のままの相手では付かないので、名刺側は comment から詰める。
	 */
	tagline?: string;
	/** 名刺カードに載せる、ユーザーを表すハッシュタグ3つ（'#' は含まない）。 */
	tags?: string[];
	/** 名刺の更新日（= 分析の更新日時）。 */
	cardUpdatedAt?: string;
};
export type ProfileNewsReactionItem = { kind: 'news'; news: NewsView };
export type ProfileFeedItem = FeedItem | ProfileNewsReactionItem;
export type ProfilePage = { profile: ProfileDetail; feed: Page<FeedItem> };
export type ProfileReactionPage = {
	profile: ProfileDetail;
	feed: Page<ProfileFeedItem>;
};
export type ThreadView = {
	post: FeedItem;
	replies: FeedItem[];
	botActor?: ActorView;
};
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
	/** その日の具体的な出来事を表すUnicode絵文字3つ。旧レコードは1つの場合がある。 */
	emoji?: string;
	/** 日記生成の材料にした、返信を含むNagiポスト数。 */
	postCount?: number;
	langs?: string[];
	createdAt: string;
	indexedAt: string;
};
export type DiaryPage = { items: DiaryView[]; cursor?: string; hasMore: boolean };
export type NotificationView = {
	id: string;
	/** 'analysis' は名刺（自動分析）の更新。actor は常に botたん、post も diary も付かない。 */
	type: 'reply' | 'reaction' | 'mention' | 'diary' | 'analysis';
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
	/**
	 * 自分がこの CH をミュートしているか。ミュート済み CH は一覧・検索から消えるが URL 直打ち
	 * では開けるので、そのページで解除できるように getChannel だけが返す。
	 */
	viewerMuted?: boolean;
	/**
	 * 自分がこの CH に参加（購読）しているか。my Nagi の「参加中チャンネル」枠の対象になる。
	 * ミュートと同じく本人にしか意味のない情報なので、サインアウト時は付かない。
	 */
	viewerSubscribed?: boolean;
};
export type ChannelsPage = { channels: ChannelView[]; cursor?: string; hasMore: boolean };
/** ミュート対象の種別。actor は相手の DID、channel はチャンネルの AT-URI を指す。 */
export type MuteSubjectType = 'actor' | 'channel';
/** 自分のミュート一覧。AppView は本人のリクエストにしか返さない。 */
export type MutesView = { actors: ActorView[]; channels: ChannelView[] };

// ---------------------------------------------------------------------------
// 端末をまたいで同期する設定（既読位置・お気に入り絵文字）
// ---------------------------------------------------------------------------
/** my Nagi のドットを持つセクション。既読位置はセクションごとに1つ。 */
export type ReadPositionSection = 'bot' | 'community' | 'list' | 'channels' | 'news';
/** 「ここまで読んだ」位置。新旧は (indexedAt, uri) の辞書順で比較する。 */
export type RemoteReadPosition = { section: ReadPositionSection; indexedAt: string; uri: string };
/** お気に入り絵文字1つ。localStorage の ReactionChoice と同じ形をそのまま預ける。 */
export type EmojiFavorite =
	{ kind: 'unicode'; emoji: string } | { kind: 'custom'; emoji: EmojiView };
/**
 * フィードのタブ1枚の種別。
 * list / custom は「入れ物」で、どれを指すかは source が持つ（list はいまホームだけ、
 * custom はいま全肯定だけ）。将来ユーザーが定義したカスタムフィードも custom に入る。
 */
export type FeedTabKind = 'list' | 'global' | 'custom' | 'channel' | 'search';
/** list / custom が指す組み込みの中身。ユーザー定義のフィードは将来 uri で指す。 */
export type FeedTabSource = 'home' | 'affirmation';
/**
 * フィードのタブ1枚。種別ごとの union にせずフラットに持つのは、lexicon で
 * タグ付き union を表しづらく、将来の種別追加を optional の追加で吸収したいため。
 */
export type FeedTab = {
	id: string;
	kind: FeedTabKind;
	/** kind が list / custom のときの参照先（list=home, custom=affirmation）。 */
	source?: FeedTabSource;
	/** kind==='channel' のチャンネル AT-URI。 */
	uri?: string;
	/** kind==='search' の保存クエリ。 */
	query?: string;
	queryKind?: 'keyword' | 'tag';
	/** 表示名のスナップショット。権威は uri / query 側で、これは初回描画用。 */
	label?: string;
};
export type PreferencesView = {
	readPositions: RemoteReadPosition[];
	emojiFavorites: EmojiFavorite[];
	/** 省略＝このアカウントのお気に入りがまだ一度も同期されていない（初回同期の合図）。 */
	emojiFavoritesUpdatedAt?: string;
	feedTabs: FeedTab[];
	/** 省略＝まだ一度もタブをカスタムしていない。クライアントは既定タブを使う。 */
	feedTabsUpdatedAt?: string;
	/** botたんからの返信確率（0〜100%）。 */
	replyFreq?: number;
	/** 省略＝未設定。botたんは表示名で呼ぶ。 */
	preferredName?: string;
};
export type PutPreferencesInput = {
	readPositions?: RemoteReadPosition[];
	emojiFavorites?: EmojiFavorite[];
	/** emojiFavorites を送るときは必須。保存済みより古ければサーバは書き込まない。 */
	emojiFavoritesUpdatedAt?: string;
	feedTabs?: FeedTab[];
	/** feedTabs を送るときは必須。保存済みより古ければサーバは書き込まない。 */
	feedTabsUpdatedAt?: string;
	/** botたんからの返信確率（0〜100%）。送らなければ変更しない。 */
	replyFreq?: number;
	/**
	 * botたんに呼んでほしい名前。空文字で登録を解除して表示名に戻す。
	 * 送らなければ変更しない。他の項目と違い後勝ちで、updatedAt は不要。
	 */
	preferredName?: string;
};

// ---------------------------------------------------------------------------
// 全肯定カード（1日1回引けるトレカ）
// ---------------------------------------------------------------------------
/** N < R < SR < UR < AAR(All-Affirmation Rare)。 */
export type CardRarity = 'N' | 'R' | 'SR' | 'UR' | 'AAR';
export type CardAttribute = 'light' | 'dark' | 'fire' | 'water' | 'wind' | 'earth';
/**
 * カード1枚。未所持でも定義部分は返るので、コレクションは常に全30枠を描ける。
 * ja/en 双方が入っているのは、ロケール切替を再フェッチ無しで効かせるため。
 */
export type CardView = {
	/** 段内の通し番号。カードの同一性は (volume, id) の組で決まる。表示は v1-001 形式。 */
	id: number;
	/** カード段（初段=1）。 */
	volume: number;
	rarity: CardRarity;
	attribute: CardAttribute;
	atk: number;
	def: number;
	nameJa: string;
	nameEn: string;
	raceJa: string;
	raceEn: string;
	textJa: string;
	textEn: string;
	owned: boolean;
	/** 以下は owned のときだけ入る。 */
	instanceId?: string;
	/** 引いた瞬間に botたんが付けたコメント。生成中は未定義。 */
	commentJa?: string;
	commentEn?: string;
	/** 同じカードを引いた回数（初回=1）。 */
	duplicateCount?: number;
	acquiredAt?: string;
	firstOwnerDid?: string;
};
export type CardDrawSource = 'my_nagi' | 'reaction';
export type CardDrawSlotStatus = {
	canDraw: boolean;
	cardVolume?: number;
	cardId?: number;
};
/** 本日の2つの取得枠。自分のコレクションを見ているときだけ返る。 */
export type CardDrawStatus = {
	/** 旧AppView互換。通常枠の状態。 */
	canDraw: boolean;
	/** 次に引ける時刻（ISO8601）。JST 4:00 が境界。 */
	nextDrawAt: string;
	todayCardVolume?: number;
	todayCardId?: number;
	/** 段階配備中の旧AppView応答では未定義。 */
	myNagi?: CardDrawSlotStatus;
	reaction?: CardDrawSlotStatus;
};
export type CardCollectionView = {
	cards: CardView[];
	ownedCount: number;
	totalCount: number;
	drawStatus?: CardDrawStatus;
};
export type DrawCardResult = {
	card: CardView;
	source: CardDrawSource;
	/** true ならその枠は引き済みで、返っているのはその枠のカード。 */
	alreadyDrawn: boolean;
	isNew: boolean;
	/** true の間は botたんコメントを生成中。getCards で取り直す。 */
	commentPending: boolean;
	drawStatus: CardDrawStatus;
};
