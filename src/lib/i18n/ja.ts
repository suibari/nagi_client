// Source-of-truth message catalog. en.ts must define exactly these keys
// with the same signatures (enforced via the Messages type).
export const ja = {
	// brand
	appTitle: 'Nagi — やさしい言葉が凪ぐ場所',
	appDescription: 'すべての声を受け止める、AT Protocol上のSNS',

	// common
	loading: '読み込み中…',
	retry: 'もう一度',
	loadMore: 'さらに読む',
	loadFailed: '読み込めませんでした',
	login: 'ログイン',
	cancel: 'キャンセル',

	// nav
	navGlobal: 'グローバル',
	navAffirmation: '全肯定',
	navNotifications: '通知',
	navSettings: '設定',
	mainNavAria: 'メインナビゲーション',
	feedTabsAria: 'フィード切り替え',

	// sidebar
	aboutTitle: '🌿 Nagiについて',
	aboutBeforeLink: 'Nagiに投稿すると、',
	aboutLinkText: '全肯定botたん',
	aboutAfterLink:
		'があなたの言葉をまるごと受け止めて返信してくれます。どんな気持ちも、まずここで凪ぎますように。',
	tabsGuideTitle: '🗂️ タブのつかいかた',
	tabsGuideBody:
		'「グローバル」にはみんなの投稿が流れます。「全肯定」には、botたんがとくに強く肯定した投稿が集まります。',
	termsLink: '利用規約',
	privacyLink: 'プライバシーポリシー',

	// account card / mobile header
	myProfileAria: '自分のプロフィール',
	meFallback: 'わたし',
	signOut: 'ログアウト',
	loginHint: 'Blueskyアカウントで参加できます',
	profileLink: 'プロフィール',

	// composer
	composerPlaceholder: 'いま、どんな気持ち？',
	composerAria: '投稿内容',
	composerSubmit: '投稿する',
	composerSubmitting: '送信中…',
	postSending: '送信中…',
	postFailed: '投稿できませんでした',
	postImageAdd: '画像を追加',
	postImageProcessing: '画像を処理中…',
	postImageRemove: '画像を削除',
	postImageAltLabel: '画像の説明（任意）',
	postImageAltPlaceholder: '画像の内容を説明してください',
	postImageCountError: '画像は4枚まで添付できます',
	postImageTypeError: (p: { name: string }) => `${p.name}: JPEG・PNG・WebP・GIFを選択してください`,
	postImageInputSizeError: (p: { name: string }) => `${p.name}: 25MB以下の画像を選択してください`,
	postGifSizeError: (p: { name: string }) => `${p.name}: GIFは2MB以下にしてください`,
	postImageCompressError: (p: { name: string }) => `${p.name}: 画像を2MB以下に圧縮できませんでした`,
	imageProcessFailedNamed: (p: { name: string }) => `${p.name}: 画像を処理できませんでした`,
	postImageOpen: (p: { index: number }) => `${p.index}枚目の画像を拡大`,
	postImageViewer: '画像の拡大表示',
	postImageClose: '拡大表示を閉じる',
	postImagePrevious: '前の画像',
	postImageNext: '次の画像',
	linkCardLoading: 'リンク情報を取得中…',
	linkCardRemove: 'リンクカードを削除',

	// post bubble
	viewProfileAria: 'プロフィールを見る',
	botBadge: 'Botたん',
	postDeleted: 'この投稿は削除されました',
	readMore: '続きを読む',
	readLess: '閉じる',
	replyPost: '返信',
	quotePost: '引用',
	replyComposerLabel: '返信を作成',
	quoteComposerLabel: '引用ポストを作成',
	replyPlaceholder: '返信を書く',
	quotePlaceholder: 'コメントを書く',
	deletePost: '削除',
	deletePostAria: 'この投稿を削除',
	deletePostTitle: '投稿を削除しますか？',
	deletePostConfirmation: '削除した投稿は元に戻せません。',
	deletePostConfirm: '削除する',
	deletingPost: '削除中…',
	deletePostFailed: '投稿を削除できませんでした',
	translating: '翻訳中…',
	translationLabel: '自動翻訳',
	originalTextLabel: '元の文章',
	showOriginalText: '原文を表示',
	hideOriginalText: '原文を閉じる',
	translationFailed: '翻訳を表示できませんでした',

	// thread unit (bot reply states)
	botThinking: 'Botたんが返信を考えています…',
	botMissed: 'Botたんの返信はまだ届いていないようです',
	botSkipped: 'Botたんは今回お休みしました',

	// reactions
	reactWithAria: (p: { emoji: string }) => `${p.emoji} でリアクション`,
	viewProfileOfAria: (p: { name: string }) => `${p.name}のプロフィールを見る`,
	moreReactorsAria: 'ほかにもリアクションした人がいます',
	addReactionAria: 'リアクションを追加',
	closeEmojiAria: '絵文字パレットを閉じる',
	emojiPickerAria: 'リアクションを選択',
	emojiFavoritesLabel: 'よく使う絵文字',
	emojiSearchLabel: '絵文字を検索',

	// home
	heroEyebrow: 'AT Protocolでつながる、やさしい場所',
	heroTitle: '言葉が、静かに届く。',
	heroBody: 'ここでは、どんな声もまず受け止めます。',
	welcomeTitle: 'Nagiへようこそ',
	welcomeBody: 'タイムラインは誰でも読めます。参加すると投稿やリアクションができます。',
	joinCta: '参加する',
	feedWaiting: '波が届くのを待っています…',
	feedEmpty: 'まだ静かな海です。最初の言葉を待っています。',

	// affirmation
	affirmationEmpty: 'botたんがとくに強く肯定した投稿が、ここに集まります。',

	// notifications — name-first suffix pattern; works because both locales put
	// the actor name first (revisit if a third locale is ever added)
	notifFetchFailed: '通知を取得できません',
	notifEmpty: 'まだ通知はありません。',
	notifRepliedSuffix: 'さんが返信しました',
	notifReactedSuffix: 'さんがリアクションしました',

	// thread page
	threadEyebrow: '会話',
	threadTitle: 'スレッド',

	// profile
	profileTabPosts: '投稿',
	profileTabReplies: '返信',
	profileTabMedia: 'メディア',
	profileTabReactions: 'リアクション',
	profileTabsAria: 'プロフィールのタブ',
	profileEdit: 'プロフィールを編集',
	profilePostsUnit: (_p: { count: number }) => '投稿',
	profileJoinedSince: (p: { date: string }) => `${p.date}から`,
	profileEmptyPosts: 'まだ投稿がありません。',
	profileEmptyReactions: 'まだリアクションがありません。',

	// login
	loginTitle: 'Nagiに参加する',
	loginBody:
		'BlueskyまたはAT Protocolのハンドルでログインします。パスワードをNagiが受け取ることはありません。',
	loginHandleLabel: 'ハンドル',
	loginSubmit: 'OAuthでログイン',
	loginRedirecting: '移動しています…',
	loginBrowse: 'ログインせずに見る',

	// onboarding
	onboardingBody:
		'ここは、言葉をまず受け止める場所です。公開タイムラインへの投稿は誰でも読むことができます。',
	onboardingSetupProfile: 'プロフィールを設定する',

	// oauth callback
	oauthLoggingIn: 'ログインしています…',
	oauthBody: '認証が完了するとタイムラインへ戻ります。',
	oauthErrorTitle: 'ログインできませんでした',
	backToTimeline: 'タイムラインへ戻る',

	// settings
	backToSettings: '設定に戻る',
	settingsProfileTitle: 'プロフィール',
	settingsProfileDescription: '表示名、自己紹介、アバター',
	settingsAppearanceTitle: '外観',
	settingsAppearanceDescription: '表示テーマと配色',
	settingsLanguageTitle: '言語',
	settingsLanguageDescription: '表示、投稿、翻訳に使う言語',
	settingsAboutTitle: 'Nagiについて',
	settingsAboutDescription: 'アプリの説明、利用規約、プライバシー',
	settingsDeleteTitle: '全データ削除',
	settingsDeleteDescription: 'Nagiに保存されたデータを完全に削除',
	themeLegend: '表示テーマ',
	themeHelp: 'この端末で使用する配色を選択します。',
	optionSystem: 'システム設定',
	themeLight: 'ライト',
	themeDark: 'ダーク',
	languageLegend: '言語 / Language',
	languageHelp: 'この端末で使用する表示言語を選択します。',
	localeJa: '日本語',
	localeEn: 'English',
	postLanguageLegend: '投稿言語',
	postLanguageHelp: 'Botたんが返信に使用する言語を選択します。次回以降の投稿に適用されます。',
	postLanguageLabel: '投稿言語を選択',
	translationLanguageLegend: '翻訳言語',
	translationLanguageHelp: '投稿を自動翻訳して表示する言語を選択します。',
	translationLanguageLabel: '翻訳言語を選択',
	optionBrowser: 'ブラウザの設定',
	profileSettingsTitle: 'プロフィール設定',
	profileSettingsNote:
		'NagiのプロフィールはBlueskyのプロフィールとは独立しています。ここで変更・保存しても、Bluesky側のプロフィールには反映されません。',
	onboardingLoadedNote:
		'Blueskyのプロフィールを初期値として読み込みました。内容を確認して保存してください。',
	loginRequired: '設定を変更するにはログインしてください。',
	currentAvatarAlt: '現在のアバター',
	selectImage: '画像を選択',
	remove: '削除',
	avatarNote: 'JPEG・PNG・WebP。選択後に正方形へトリミングします。',
	displayNameLabel: '表示名',
	bioLabel: '自己紹介',
	save: '保存',
	saving: '保存中…',
	saved: '保存しました',
	saveFailed: '保存できませんでした',
	profileLoadFailed: 'プロフィールを読み込めませんでした',
	imageTypeError: 'JPEG、PNG、WebPの画像を選択してください',
	imageSizeError: '25MB以下の画像を選択してください',
	deleteDataWarning:
		'Nagiの投稿、リアクション、プロフィールとAppView上の関連データを完全に削除します。この操作は取り消せません。',
	deleteDataInstruction: '続行するには、次の文字を入力してください。',
	deleteDataPhrase: 'Nagiの全データを削除',
	deleteDataButton: '全データを削除する',
	deleteDataDialogTitle: '本当に全データを削除しますか？',
	deleteDataDialogBody: '削除後にデータを復元することはできません。完了するとログアウトします。',
	deleteDataConfirm: '完全に削除する',
	deleteDataDeleting: '削除中…',
	deleteDataFailed: '全データを削除できませんでした',
	deleteDataLoginRequired: 'データを削除するにはログインしてください。',

	// avatar cropper
	cropperTitle: 'アバターをトリミング',
	cropperDragAria: '画像をドラッグして位置を調整',
	cropperZoom: '拡大',
	confirm: '決定',
	processing: '処理中…',
	imageProcessFailed: '画像を処理できませんでした',
	imageCompressFailed: '画像を1MB以下に圧縮できませんでした',
} satisfies Record<string, string | ((...args: never[]) => string)>;

export type Messages = typeof ja;
