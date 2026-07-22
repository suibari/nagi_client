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
	navFeed: 'フィード',
	navGlobal: 'グローバル',
	navAffirmation: '全肯定',
	navNotifications: '通知',
	navSettings: '設定',
	mainNavAria: 'メインナビゲーション',
	feedTabsAria: 'フィード切り替え',

	// sidebar footer / about page intro
	aboutBeforeLink: 'Nagiに投稿すると、',
	aboutLinkText: '全肯定botたん',
	aboutAfterLink:
		'があなたの言葉をまるごと受け止めて返信してくれます。どんな気持ちも、まずここで凪ぎますように。',
	termsLink: '利用規約',
	privacyLink: 'プライバシーポリシー',
	aboutLink: 'Nagiについて',

	// about page — Nagi ならではの機能一覧
	aboutFeaturesHeading: 'Nagiでできること',
	aboutFeaturesLead: 'Blueskyとは少し違う、Nagiならではの機能です。',
	aboutBotTitle: 'botたんが返信します',
	aboutBotBody:
		'投稿すると、全肯定botたんがあなたの言葉を受け止めて返信します。返信を書いている間はその様子も表示されます。',
	aboutNoLikesTitle: 'いいねもフォローもありません',
	aboutNoLikesBody:
		'数で評価されることも、フォロー関係に縛られることもありません。みんなの投稿がひとつのタイムラインに流れます。',
	aboutReactionTitle: '絵文字リアクション',
	aboutReactionBody:
		'好きな絵文字でリアクションできます。だれがリアクションしたかもアイコンで見えます。',
	aboutCustomEmojiTitle: 'カスタム絵文字',
	aboutCustomEmojiBody:
		'自分だけの絵文字を登録できます。登録した絵文字はNagiのみんながリアクションに使えます。',
	aboutCustomEmojiLink: 'カスタム絵文字を登録する',
	aboutMarkdownTitle: 'Markdown記法が使えます',
	aboutMarkdownBody:
		'見出し・箇条書き・番号付きリスト・引用・太字・斜体・打ち消しが使えます。投稿欄のプレビュータブで仕上がりを確認できます。',
	aboutLongPostTitle: '3000文字まで書けます',
	aboutLongPostBody:
		'ひとつの投稿に3000文字まで書けます。長くなった気持ちも、区切らずそのまま置いていけます。',
	aboutTranslateTitle: '自動で翻訳されます',
	aboutTranslateBody:
		'ほかの言語の投稿は、あなたの言語に自動で翻訳されて表示されます。原文もその場で開けます。翻訳先の言語は、初期設定ではブラウザの言語で、設定から変更できます。',
	aboutTranslateLink: '翻訳言語を設定する',
	aboutCrosspostTitle: 'Blueskyへのクロスポスト',
	aboutCrosspostBody:
		'Nagiへの投稿をBlueskyにも同時に投稿できます。300文字を超える投稿は、Blueskyでは分割されてスレッドになります。',
	aboutCrosspostLink: 'クロスポストを設定する',
	aboutProfileTitle: 'Bluesky とは別のプロフィール',
	aboutProfileBody:
		'Nagiの表示名・自己紹介・アイコンはBlueskyとは独立しています。ここだけの姿でいられます。',
	aboutProfileLink: 'プロフィールを編集する',
	aboutDataTitle: 'データはあなたのものです',
	aboutDataBody:
		'投稿はあなた自身のPDSに保存されます。ログインはOAuthなので、パスワードをNagiが受け取ることはありません。いつでも全データを削除できます。',
	aboutDataLink: '全データを削除する',

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
	composerTabsAria: '入力とプレビューの切り替え',
	composerTabWrite: '書く',
	composerTabPreview: 'プレビュー',
	composerPreviewEmpty: 'ここに書式のプレビューが出ます',
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
	composerKossori: 'こっそり',
	composerKossoriAria: 'こっそり投稿（グローバル・全肯定タイムラインには載せません）',

	// drafts
	draftSave: '下書きに保存',
	draftSaveFailed: '下書きを保存できませんでした',
	draftLimitReached: (p: { max: number }) => `下書きは${p.max}件まで保存できます`,
	draftListOpen: '下書き一覧',
	draftListTitle: '下書き',
	draftListClose: '下書き一覧を閉じる',
	draftListEmpty: '保存した下書きはありません',
	draftRestore: '復元',
	draftRestoreOverwrite: '編集中の内容は破棄されます。下書きを復元しますか？',
	draftDelete: '下書きを削除',
	draftDeleteConfirm: '削除する',
	draftImagesOnly: (p: { count: number }) => `画像${p.count}枚の下書き`,
	draftLinkOnly: 'リンクのみの下書き',
	draftLocalOnlyNote: '下書きはこの端末にのみ保存され、他の端末とは同期しません。',
	draftsClearedNote: 'この端末に保存した下書きも削除されます。',

	// post bubble
	viewProfileAria: 'プロフィールを見る',
	botBadge: 'Botたん',
	superPositiveBadge: (p: { level: number }) => `超ポジティブ Lv.${p.level}`,
	superPositiveBadgeAria: (p: { level: number }) => `超ポジティブ レベル${p.level}`,
	titleBadge: (p: { title: string }) => `称号: ${p.title}`,
	titleBadgeAria: (p: { title: string }) => `日記でもらった称号「${p.title}」`,
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
	kossoriBadge: 'こっそり',
	kossoriBadgeAria: 'こっそり投稿（グローバル・全肯定タイムラインには表示されません）',
	kossoriEnable: 'こっそりにする',
	kossoriEnableAria: 'この投稿をこっそりにする',
	kossoriDisable: '公開に戻す',
	kossoriDisableAria: 'この投稿を公開に戻す',
	kossoriToggleFailed: 'こっそり設定を変更できませんでした',
	translating: '翻訳中…',
	translationLabel: '自動翻訳',
	showOriginalText: '原文を表示',
	hideOriginalText: '原文を閉じる',
	translationFailed: '翻訳を表示できませんでした',
	translationRetry: '再試行',
	translateExternally: '選んだ翻訳サービスで開く',
	openInExternalTranslator: (p: { provider: string }) => `${p.provider}で開く`,

	// thread unit (bot reply states)
	botThinking: 'Botたんが返信を考えています…',
	botWaiting: 'Botたんが返信の準備をしています…',
	botLongWait: '通常より時間がかかっています。しばらくしてからもう一度ご覧ください。',
	botFailed: 'エラーのため、Botたんが返信できませんでした。',
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
	emojiTabUnicode: '絵文字',
	emojiTabCustom: 'カスタム',
	emojiCustomEmpty: 'カスタム絵文字が見つかりません',
	emojiUnicodeEmpty: '絵文字が見つかりません',
	emojiSearchFailed: '絵文字を読み込めませんでした',

	// custom emoji settings
	emojiSettingsTitle: 'カスタム絵文字',
	emojiSettingsDescription: '自分の絵文字を登録して、みんなで使う',
	emojiSettingsNote:
		'登録した絵文字はあなたのPDSにBluemoji（blue.moji.collection.item）として保存され、Nagiのみんながリアクションに使えます。',
	emojiUploadNote: 'PNG・WebP・GIF・APNG。長辺128pxに縮小します（GIF・APNGは128KBまで）。',
	emojiNameLabel: '絵文字名（半角英数字、_と-）',
	emojiAltLabel: '説明（任意）',
	emojiUpload: '登録する',
	emojiUploaded: '絵文字を登録しました',
	emojiDeleted: '絵文字を削除しました',
	emojiMineTitle: '登録した絵文字',
	emojiMineEmpty: 'まだ絵文字を登録していません。',
	emojiNameInvalid: '半角英数字・アンダースコア・ハイフンで1〜32文字にしてください',
	emojiNameTaken: 'この名前の絵文字はすでに登録されています',
	emojiTypeError: 'PNG、WebP、GIF、APNGの画像を選択してください',
	emojiInputSizeError: '画像のサイズが大きすぎます',
	emojiAnimatedSizeError: 'アニメーション画像は128KB以下にしてください',
	emojiCompressError: '画像を変換できませんでした',
	emojiUploadFailed: '絵文字を登録できませんでした',
	emojiDeleteFailed: '絵文字を削除できませんでした',
	emojiLoadFailed: '絵文字を読み込めませんでした',

	// home
	heroEyebrow: 'AT PROTOCOLでつながる、全肯定SNS',
	heroTitle: 'やさしい言葉が凪ぐ場所',
	heroBody:
		'いいねの数も、フォロー関係もありません。他人の目を気にせず、自由にアウトプットできるSNSです。',
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
	// 絵文字を文中に挟むため前後で分割している
	notifReactedWithPrefix: 'さんが',
	notifReactedWithSuffix: 'でリアクションしました',
	notifMentionedSuffix: 'さんがあなたをメンションしました',
	notifDiarySuffix: 'さんが今日の日記を書いてくれました',
	notifUnreadBadgeAria: (p: { count: number }) => `未読通知 ${p.count} 件`,

	// thread page
	threadEyebrow: '会話',
	threadTitle: 'スレッド',

	// profile
	profileTabPosts: '投稿',
	profileTabReplies: '返信',
	profileTabMedia: 'メディア',
	profileTabReactions: 'リアクション',
	profileTabDiary: '日記',
	profileTabsAria: 'プロフィールのタブ',
	profileEdit: 'プロフィールを編集',
	profilePostsUnit: (_p: { count: number }) => '投稿',
	profileJoinedSince: (p: { date: string }) => `${p.date}から`,
	profileEmptyPosts: 'まだ投稿がありません。',
	profileEmptyReactions: 'まだリアクションがありません。',

	// diary
	diaryEmptyMonth: 'この月の日記はまだありません。',
	diaryFetchFailed: '日記を取得できません',
	diaryPrevMonth: '前の月',
	diaryNextMonth: '次の月',
	diaryPickDate: '日記のある日を選ぶと本文が読めます。',
	diaryTitleLabel: (p: { title: string }) => `今日の称号: ${p.title}`,
	diaryDayAria: (p: { date: string }) => `${p.date}の日記`,
	diaryAbout: 'botたんが、その日の投稿をもとに書いてくれた日記です。',

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
	settingsAboutDescription: 'Nagiでできること、利用規約、プライバシー',
	settingsDeleteTitle: '全データ削除',
	settingsDeleteDescription: 'Nagiに保存されたデータを完全に削除',
	signOutDescription: 'この端末からアカウントをサインアウト',
	settingsNotificationsTitle: '通知',
	settingsNotificationsDescription: 'デバイスへのプッシュ通知',
	pushLegend: 'プッシュ通知',
	pushHelp:
		'返信・メンション・リアクション・日記をこの端末にプッシュ通知します。アプリを閉じていても届きます。',
	pushEnableLabel: 'この端末で通知を受け取る',
	pushDeviceNote: 'この設定は、この端末でのみ有効です。',
	pushSignInRequired: 'プッシュ通知を有効にするにはサインインが必要です。',
	pushUnsupported: 'この端末・ブラウザはプッシュ通知に対応していません。',
	pushBlocked:
		'通知がブラウザ側でブロックされています。サイトの通知設定を「許可」に変更してください。',
	pushIosInstallNote:
		'iPhone・iPad では、共有メニューから「ホーム画面に追加」してアプリとして起動すると、プッシュ通知を有効にできます。',
	settingsCrosspostTitle: 'Blueskyクロスポスト',
	settingsCrosspostDescription: 'Nagiへの投稿をBlueskyにも投稿',
	crosspostLegend: 'Blueskyクロスポスト',
	crosspostHelp:
		'Nagiのタイムラインへの投稿を、Blueskyにも同時に投稿します。スレッドへの返信は対象外です。',
	crosspostSplitNote:
		'300文字を超える投稿は、Blueskyでは複数の投稿に分割され、スレッドとして繋がります。',
	crosspostDeviceNote: 'この設定は、この端末でのみ有効です。',
	crosspostBotNote: 'クロスポストされた投稿には、Bluesky側のBotたんは返信しません。',
	crosspostEnableLabel: 'Blueskyにもクロスポストする',
	crosspostReauthNote: '有効にするには、Blueskyへの投稿権限を追加するための再ログインが必要です。',
	crosspostReauthSubmit: '再ログインして有効にする',
	crosspostReauthPending: '移動しています…',
	crosspostSignInRequired: 'クロスポストを設定するにはログインしてください。',
	crosspostFailed: 'Blueskyへのクロスポストに失敗しました',
	crosspostWarning: (p: { reason: string }) =>
		`Nagiには投稿しましたが、Blueskyへのクロスポストに失敗しました: ${p.reason}`,
	themeLegend: '表示テーマ',
	themeHelp: 'この端末で使用する配色を選択します。',
	optionSystem: 'システム設定',
	themeLight: 'ライト',
	themeDark: 'ダーク',
	languageLegend: 'UI言語 / UI language',
	languageHelp: 'この端末で、Nagiの画面表示に使う言語です。',
	localeJa: '日本語',
	localeEn: 'English',
	postLanguageLegend: '投稿言語',
	postLanguageHelp:
		'あなたの投稿につける言語です。Botたんもこの言語で返信します。次回以降の投稿に適用されます。',
	postLanguageLabel: '投稿言語を選択',
	translationLanguageLegend: '翻訳言語',
	translationLanguageHelp: 'ほかの言語の投稿を、自動でこの言語に翻訳して表示します。',
	translationLanguageLabel: '翻訳言語を選択',
	autoTranslateLegend: '自動翻訳',
	autoTranslateHelp: 'ほかの言語の投稿を、開いたときに自動で翻訳して表示します。',
	autoTranslateLabel: '自動翻訳を有効にする',
	translationProviderLegend: '翻訳プロバイダー',
	translationProviderHelp:
		'投稿の翻訳ボタンや、自動翻訳が失敗したときに開く外部の翻訳サービスです。',
	translationProviderLabel: '翻訳プロバイダーを選択',
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
