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
	/**
	 * 「今日のゼンカツ部長」＝ 直前に閉じた日の botたん賞の受賞者。
	 * **毎日ひとりだけが持ち、1日で消える。** 累積は出さない。
	 * プロフィール取得の経路でだけ入る（フィードでは入らない）。
	 */
	zenkatsuChief?: boolean;
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
	/** OGP画像の配信元URL。画像本体はAppViewを経由せず直接読み込む。 */
	image?: string;
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
	selfLabels?: string[];
	moderationLabels?: string[];
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
	/** 投稿後に編集された（AppView が cid 変化を観測した）か。UI の「編集済み」バッジ用。 */
	edited?: boolean;
	deleted?: boolean;
	unavailableReason?: 'moderation-policy' | 'processing-failed';
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
export type BookmarkSubjectType = 'post' | 'news' | 'diary';
export type BookmarkFolderView = {
	id: string;
	name: string;
	isDefault: boolean;
	count: number;
	createdAt: string;
	updatedAt: string;
};
export type BookmarkFoldersView = {
	folders: BookmarkFolderView[];
	folderLimit: number;
	bookmarkLimit: number;
	lastFolderId?: string;
	lastFolderUpdatedAt?: string;
};
export type BookmarkStateView = { subjectUri: string; folderId?: string; createdAt?: string };
export type BookmarkItemView = {
	id: string;
	folderId: string;
	subjectUri: string;
	createdAt: string;
	content:
		| { kind: 'post'; post: PostView }
		| { kind: 'news'; news: NewsView }
		| { kind: 'diary'; diary: DiaryView }
		| { kind: 'unavailable'; subjectType: BookmarkSubjectType; subjectUri: string };
};
export type BookmarksPage = {
	items: BookmarkItemView[];
	cursor?: string;
	hasMore: boolean;
	botActor?: ActorView;
};
/**
 * 全肯定ニュースの「動的枠」。関心ジャンルが近い記事を items とは別枠で受け取る。
 * items は時系列のままなので、未読判定（items[0] が最新）はこの追加に影響されない。
 */
export type RecommendedNewsView = NewsView & {
	/** 「おすすめの理由：〜」に出す関心ジャンル。keyword は移行中の旧APIとの互換用。 */
	reason?: { genre?: string; keyword?: string };
};
export type NewsPage = Page<NewsView> & {
	recommended?: RecommendedNewsView[];
};
export type ProfileFeedFilter = 'posts' | 'replies' | 'media' | 'reactions';
export type ProfileDetail = ActorView & {
	postCount: number;
	/** 当日だけ true。非公開の生年月日・生年・月日は返らない。 */
	isBirthday?: boolean;
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
	/** プロフィールUIに表示する興味テーマの候補。表示側で3件をランダム選出する。 */
	interestKeywords?: string[];
	/** 名刺の更新日（= 分析の更新日時）。 */
	cardUpdatedAt?: string;
};
export type ProfileNewsReactionItem = { kind: 'news'; news: NewsView };
/**
 * こっそり投稿に対するリアクション。作者も本文も辿れないので、リアクションタブでは
 * 中身の代わりにこれが返る。黙って消すと「押したはずのものが無い」になるため、
 * 時系列の位置は保ったままプレースホルダとして描く。
 */
export type ProfileKossoriReactionItem = {
	kind: 'kossori';
	reactionUri: string;
	reactedAt: string;
	/** 元投稿を伏せたまま、本人が押したリアクションだけを表示する。 */
	emoji: string;
	bluemoji?: EmojiView;
};
export type ProfileFeedItem = FeedItem | ProfileNewsReactionItem | ProfileKossoriReactionItem;
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
	/** 日記生成の材料にした、返信を含むNagiポスト数。 */
	postCount?: number;
	/** その日のリアクション・返信・引用で、本人から多く関わった相手（最大10人）。 */
	involvedActors?: ActorView[];
	/** 11人目以降の関わった相手がいる。 */
	involvedActorsHasMore?: boolean;
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
	/**
	 * subject がゼンカツの提出・ドローの控えのときの中身。
	 * どちらも投稿ではないので post には入らない。これが無いと
	 * 「リアクションされた」とだけ出て、何にされたのか分からなくなる。
	 */
	cardSubject?: NotificationCardSubject;
	subjectUri: string;
	reasonUri: string;
	createdAt: string;
	readAt?: string;
};
/** 通知が指している、全肯定カードまわりの対象。 */
export type NotificationCardSubject = {
	uri: string;
	type: 'cardGet' | 'zenkatsu';
	/** type=zenkatsu のとき。 */
	themeJa?: string;
	themeEn?: string;
	/** 出した札、または引いた1枚。 */
	cards: CardView[];
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
	languagePreferences?: SyncedLanguagePreferences;
	languagePreferencesUpdatedAt?: string;
	moderationPreferences?: SyncedModerationPreferences;
	moderationPreferencesUpdatedAt?: string;
	lastBookmarkFolderId?: string;
	lastBookmarkFolderUpdatedAt?: string;
	/**
	 * 年齢確認の状態。本人にだけ返る（他人の分は引けない）。
	 * declared が false なら未申告＝未成年扱い。
	 */
	ageAssurance?: {
		isAdult: boolean;
		declared: boolean;
		/** 申告済みなら本人が確認できるよう返る。改定前からの既存ユーザーは未申告なので省略。 */
		birthDate?: string;
	};
};
export type SyncedLanguagePreferences = {
	post: string;
	translation: string;
	provider: 'kagi' | 'deepl' | 'google';
	autoTranslate: boolean;
};
export type SyncedModerationPreferences = {
	automatic: 'warn' | 'hide' | 'ignore';
	selfAi: 'warn' | 'hide' | 'ignore';
	selfNsfw: 'warn' | 'hide' | 'ignore';
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
	languagePreferences?: SyncedLanguagePreferences;
	languagePreferencesUpdatedAt?: string;
	moderationPreferences?: SyncedModerationPreferences;
	moderationPreferencesUpdatedAt?: string;
	lastBookmarkFolderId?: string | null;
	lastBookmarkFolderUpdatedAt?: string;
	/**
	 * 生年月日の申告（YYYY-MM-DD）。設定できるのは1度だけで、2度目は 409 になる。
	 * 18歳未満なら parentalConsent: true が必須。
	 */
	birthDate?: string;
	parentalConsent?: boolean;
};

export type DraftLinkCard = { uri: string; title: string; description?: string };
export type DraftContent = {
	text: string;
	mentions: Array<{ start: number; end: number; did: string; handle: string }>;
	channels: Array<{ start: number; end: number; uri: string; name: string }>;
	emojis: Array<{ start: number; end: number; uri: string }>;
	linkCards: DraftLinkCard[];
	dismissedUrls: string[];
	quoteUri?: string;
};
export type DraftView = DraftContent & { id: string; createdAt: string; updatedAt: string };
export type DraftSummary = {
	id: string;
	text: string;
	linkCardCount: number;
	createdAt: string;
	updatedAt: string;
};
export type DraftsView = { drafts: DraftSummary[]; limit: number };

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
	/**
	 * 段内の通し番号。カードの同一性は (volume, id) の組で決まる。表示は v1-001 形式。
	 * 記念日カード（volume = 0）では 西暦*100 + slot が入るので、カード面には year を出す。
	 */
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
	/** カード面に敷く背景画像のベース名。`/card-art/{art}.webp` を引く。無ければ文字だけのカード。 */
	art?: string;
	/** 記念日カードなら true。図鑑とは別枠に置き、コンプ率にも数えない。 */
	anniversary?: boolean;
	/** 記念日カードのみ。何年ぶんの1枚か。図鑑番号の代わりにこれを出す。 */
	year?: number;
};
/** my_nagi と reaction は1日1回の抽選枠、anniversary は記念日に配られる特別枠。 */
export type CardDrawSource = 'my_nagi' | 'reaction' | 'anniversary';
/** その日が記念日で、まだ受け取っていない1枚。 */
export type PendingAnniversary = {
	slot: number;
	nameJa: string;
	nameEn: string;
	/** モーダルを開く前に先読みするための背景画像名。 */
	art?: string;
};
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
	/** 図鑑の枚数。**記念日カードは含まない**（コンプ率を動かさないため）。 */
	ownedCount: number;
	totalCount: number;
	drawStatus?: CardDrawStatus;
	/** 所持している記念日カード。図鑑とは別枠で、取得の古い順。 */
	anniversaryCards?: CardView[];
	/** 本日ぶんの未受領の記念日。自分のコレクションを見ているときだけ返る。 */
	pendingAnniversary?: PendingAnniversary[];
	/**
	 * まだ PDS に控えを書いていないドロー。自分のコレクションを見ているときだけ返る。
	 *
	 * ドローは AppView 側で先に確定するので、そのあとの createRecord が失敗すると控えだけが
	 * 欠ける（オフライン、PDS 落ち、アプリを閉じた）。正しさではなく遅延の問題なので、
	 * 次に開いたときにここを順に書けばよい。過去ぶんもここから埋まる。
	 */
	unmirroredDraws?: UnmirroredDraw[];
};
/** 控えがまだ無いドロー1件。 */
export type UnmirroredDraw = {
	drawDate: string;
	source: CardDrawSource;
	volume: number;
	id: number;
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
	/**
	 * この1枚を引いた日（JST 4:00 始まりの "YYYY-MM-DD"）。PDS へ控えを書くときの rkey に使う。
	 * 日付境界の計算をクライアントに二重定義しないよう、サーバが返したものをそのまま使う。
	 */
	drawDate: string;
	/**
	 * source=anniversary のみ。同じ日に複数の記念日が重なることがあるので、今回受け取った
	 * ぶんを全部返す。card はこの先頭と同じ。
	 */
	cards?: CardView[];
};
export type GuestCardDrawResult = DrawCardResult & {
	/** 通常カードと同じ JST 4:00 境界。これを越えたローカル結果は破棄する。 */
	expiresAt: string;
};

// ゼンカツ！（1日1回、お題に手持ちのカード1〜3枚で答える遊び）
export type ZenkatsuTone = 'neta' | 'sunao';
/** その日のお題。初回アクセス時に確定し、以後は動かない。 */
export type ZenkatsuThemeView = {
	volume: number;
	id: number;
	themeDate: string;
	textJa: string;
	textEn: string;
	/** 追い風の属性。その日「噛み合う」札を決める主軸。 */
	attribute: CardAttribute;
	/** 追い風の種族（任意）。持っていない人が出るので副次的な扱い。 */
	raceJa?: string;
	tone: ZenkatsuTone;
};
/**
 * 記録に出す1件。**スコアも順位も含まない**（全肯定なので勝敗を作らない）。
 * 出した札と botたんの総評だけ。
 */
export type ZenkatsuSubmissionView = {
	uri: string;
	cid: string;
	author: ActorView;
	cards: CardView[];
	commentJa?: string;
	commentEn?: string;
	/** true の間は総評を生成中。取り直すと入る。 */
	commentPending: boolean;
	/** その日の追い風に乗っていた枚数。**得点ではない**（得点は隠しで表示しない）。 */
	tailwindCount: number;
	/** 成立したコンボ。成立したものだけがサーバから来る（未発見のぶんは送られない）。 */
	combos: ZenkatsuSubmissionCombo[];
	/**
	 * 提出レコードに付いたリアクション。
	 * subject は本人の repo にある `com.suibari.nagi.zenkatsu` そのものなので、
	 * 投稿・ニュースとまったく同じ経路で付く。AppView 未更新でも落ちないよう任意。
	 */
	reactions?: ReactionView[];
	createdAt: string;
	indexedAt: string;
};
/** 記録に出す、成立したコンボの要約。 */
export type ZenkatsuSubmissionCombo = {
	volume: number;
	id: number;
	nameJa: string;
	nameEn: string;
	descJa: string;
	descEn: string;
};
/** 今日出せる札1種。 */
export type ZenkatsuPlayableCard = {
	volume: number;
	id: number;
	/** 在庫のうち、今日出せる枚数。0 なら全部おやすみ中。 */
	available: number;
	/** available が 0 のとき、いちばん早く戻る1枚があと何日でおきるか。 */
	restingDays?: number;
};
export type ZenkatsuViewerState = {
	submitted: boolean;
	submissionUri?: string;
	playable: ZenkatsuPlayableCard[];
	/** 1回に出せる最大枚数。**下限は無い**（1枚でもよい）。 */
	maxCards: number;
};
export type ZenkatsuFeed = {
	theme: ZenkatsuThemeView;
	submissions: ZenkatsuSubmissionView[];
	cursor?: string;
	viewer?: ZenkatsuViewerState;
};
/** ニュース1件。レアドローとゼンカツのハイライトが同じ列に並ぶ。 */
export type CardNewsItem = {
	uri: string;
	cid: string;
	/**
	 * `comboFound` は「そのコンボを世界で最初に成立させた回」。
	 * ゼンカツの回であることは `zenkatsu` と同じなので中身の作りは変わらず、
	 * **見出しだけが変わる**。サーバは同じ提出を `zenkatsu` としては返さない
	 * （同じ uri の項目が2つ並ぶと一覧のキーが重複する）。
	 */
	type: 'cardGet' | 'zenkatsu' | 'comboFound';
	author: ActorView;
	at: string;
	card?: CardView;
	cards?: CardView[];
	themeJa?: string;
	themeEn?: string;
	commentJa?: string;
	commentEn?: string;
	/**
	 * type=zenkatsu のとき。成立したコンボ。
	 * ニュースに出すのは、**攻略がコミュニティに伝わる道**にするため。
	 * 未成立のぶんはサーバから送られないので、これで定義が漏れることはない。
	 */
	combos?: ZenkatsuSubmissionCombo[];
	/**
	 * type=comboFound のとき。`combos` のうち、**この回が世界初だったぶんだけ**。
	 * 索引した時点のスナップショットなので、発見者が後からレコードを消しても
	 * マイデッキ側の pioneer 判定（最古の未削除提出）とずれることがある。
	 */
	pioneerCombos?: ZenkatsuSubmissionCombo[];
	/** type=zenkatsu のとき。追い風に乗っていた枚数。**得点ではない。** */
	tailwindCount?: number;
	/** ニュース項目に付いたリアクション。subject は uri/cid の実レコード。 */
	reactions?: ReactionView[];
};
export type CardNewsFeed = {
	items: CardNewsItem[];
	cursor?: string;
};

/** マイデッキに出す、成立させたことのあるコンボ1件。 */
export type ZenkatsuComboView = {
	volume: number;
	id: number;
	nameJa: string;
	nameEn: string;
	descJa: string;
	descEn: string;
	/** スロットごとの構成札。1スロットに複数あるのは「どちらでもよい」という意味。 */
	slots: CardView[][];
	firstPlayedDate: string;
	/** 世界で最初に見つけた人。 */
	pioneer?: ActorView;
	isPioneer: boolean;
};
export type ZenkatsuTrophyView = {
	kind: string;
	themeDate: string;
	themeJa?: string;
	themeEn?: string;
	submissionUri: string;
	commentJa?: string;
	commentEn?: string;
};
export type ZenkatsuDeckView = {
	/** 存在するコンボの総数。未発見のぶんは中身を伏せる。 */
	comboTotal: number;
	combos: ZenkatsuComboView[];
	trophies: ZenkatsuTrophyView[];
};
