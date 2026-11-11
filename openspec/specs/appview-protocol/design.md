# appview-protocol：設計判断・コメント出典

この文書は初期仕様化時点のコメント原文を保存する設計資料である。現在の振る舞い・検証条件は [spec.md](spec.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/api/appview.ts

<!-- source: src/lib/api/appview.ts:55 -->

### [src/lib/api/appview.ts:55](../../../src/lib/api/appview.ts#L55)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// AppView へのアクセスはユーザ自身の PDS 経由でプロキシする（atproto-proxy ヘッダー）。
// 自前 getServiceAuth を廃止したことで、未更新セルフホスト PDS の aud params 検証
// （format:did で fragment を却下）を回避できる。scope チェックは proxy ヘッダーの
// fragment aud で granted scope と一致し、トークン発行は PDS 内部処理（aud は PDS の
// バージョンに応じ fragment/bare、サーバ serviceAuth.ts は両方受理）。
// 未ログイン閲覧と auth:'none' は AppView へ直接取得する（開発時だけ Vite 経由）。
```

<!-- source: src/lib/api/appview.ts:62 -->

### [src/lib/api/appview.ts:62](../../../src/lib/api/appview.ts#L62)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 開発専用: PUBLIC_APPVIEW_DIRECT=true のとき、ログイン中でも PDS プロキシを介さず
// Vite の同一オリジンプロキシから local AppView へ転送する。viewerDid は
// x-viewer-did ヘッダーで渡し、appview 側の APPVIEW_DEV_TRUST_VIEWER=true で信用させる。
```

<!-- source: src/lib/api/appview.ts:66 -->

### [src/lib/api/appview.ts:66](../../../src/lib/api/appview.ts#L66)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 開発時は Vite の同一オリジンプロキシを使う。これにより本番用 CSP が生成済みでも、
// ブラウザからローカル AppView への通信と画像取得を拒否されない。
```

<!-- source: src/lib/api/appview.ts:76 -->

### [src/lib/api/appview.ts:76](../../../src/lib/api/appview.ts#L76)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** AppView が返したHTTPステータスとエラーコードを、呼び出し側で判定できる形で保持する。 */
```

<!-- source: src/lib/api/appview.ts:88 -->

### [src/lib/api/appview.ts:88](../../../src/lib/api/appview.ts#L88)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 既存セッションの権限更新で回復できる認証・認可エラー。サービス未設定とは区別する。 */
```

<!-- source: src/lib/api/appview.ts:99 -->

### [src/lib/api/appview.ts:99](../../../src/lib/api/appview.ts#L99)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// セッションがあり認証を要する呼び出しは PDS 経由プロキシ、それ以外は appview 直 fetch。
```

<!-- source: src/lib/api/appview.ts:108 -->

### [src/lib/api/appview.ts:108](../../../src/lib/api/appview.ts#L108)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ローカル開発: Vite の同一オリジンプロキシ経由。ログイン中は viewerDid を dev ヘッダーで渡す。
```

<!-- source: src/lib/api/appview.ts:143 -->

### [src/lib/api/appview.ts:143](../../../src/lib/api/appview.ts#L143)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * ログイン中は認証付き（PDS プロキシ経由 = viewerDid が AppView へ届く）で取得し、
 * 認証だけが拒否されたら公開取得へ落とす。permission-set を publish しても認可サーバの
 * キャッシュが最大24h残るため、これが無いと publish 直後に該当画面が丸ごと壊れる。
 * 公開コンテンツを返すエンドポイント専用（ミュート等のビューア依存部分が効かなくなるだけ）。
 */
```

<!-- source: src/lib/api/appview.ts:221 -->

### [src/lib/api/appview.ts:221](../../../src/lib/api/appview.ts#L221)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * ニュース1件。`/news/<rkey>` がプリレンダ済みでないとき（公開直後）だけ使う。
 *
 * `auth: 'none'` にしているのは、ビルドからも匿名で叩くため。PDS プロキシを通さないので
 * OAuth スコープの追加がいらず、24時間の認可キャッシュにも引っかからない。
 */
```

<!-- source: src/lib/api/appview.ts:234 -->

### [src/lib/api/appview.ts:234](../../../src/lib/api/appview.ts#L234)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** パーマリンクの「似ているニュース」。公開コンテンツなので AppView 直読み。 */
```

<!-- source: src/lib/api/appview.ts:242 -->

### [src/lib/api/appview.ts:242](../../../src/lib/api/appview.ts#L242)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * パーマリンクの「みんなのコメント」（そのニュースを引用した投稿）。
 * ログイン中は本人のこっそり投稿とミュートを反映させたいので認証付きで取りに行く。
 */
```

<!-- source: src/lib/api/appview.ts:254 -->

### [src/lib/api/appview.ts:254](../../../src/lib/api/appview.ts#L254)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 索引対象ニュースの列挙。ビルドが prerender の entries と sitemap を作るために叩く。 */
```

<!-- source: src/lib/api/appview.ts:265 -->

### [src/lib/api/appview.ts:265](../../../src/lib/api/appview.ts#L265)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** ブログタブで公開を選んだ投稿。静的記事ページと sitemap の生成に使う。 */
```

<!-- source: src/lib/api/appview.ts:281 -->

### [src/lib/api/appview.ts:281](../../../src/lib/api/appview.ts#L281)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * こっそり投稿は PDS レコードにせず AppView にだけ置く。よって createRecord ではなく
 * この手続きを通し、ensureRecord も呼ばない（PDS に取りに行く相手が居ない）。
 * 返る URI は著者 DID を含まない AppView 発行のもの。
 */
```

<!-- source: src/lib/api/appview.ts:324 -->

### [src/lib/api/appview.ts:324](../../../src/lib/api/appview.ts#L324)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** こっそり投稿の削除。PDS に控えが無いので、これで本文は完全に消える。 */
```

<!-- source: src/lib/api/appview.ts:343 -->

### [src/lib/api/appview.ts:343](../../../src/lib/api/appview.ts#L343)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// タグ投稿の検索。将来のキーワード検索も同じ /search 画面・同系エンドポイントへ相乗りできるよう
// tag を明示パラメータにする。
```

<!-- source: src/lib/api/appview.ts:353 -->

### [src/lib/api/appview.ts:353](../../../src/lib/api/appview.ts#L353)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 検索の出し分け。一致(exact) と botたんの気まぐれ(semantic)。未指定は従来のハイブリッド。
```

<!-- source: src/lib/api/appview.ts:356 -->

### [src/lib/api/appview.ts:356](../../../src/lib/api/appview.ts#L356)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 自由文キーワード検索。tag 検索と同じ /search 画面に相乗り。
```

<!-- source: src/lib/api/appview.ts:367 -->

### [src/lib/api/appview.ts:367](../../../src/lib/api/appview.ts#L367)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ニュースの自由文検索（意味検索＋語彙一致）。公開コンテンツなので AppView 直読み。
```

<!-- source: src/lib/api/appview.ts:388 -->

### [src/lib/api/appview.ts:388](../../../src/lib/api/appview.ts#L388)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 選ばれた投稿にぶら下がる返信を、通常タイムラインと同じ会話単位で返す。 */
```

<!-- source: src/lib/api/appview.ts:390 -->

### [src/lib/api/appview.ts:390](../../../src/lib/api/appview.ts#L390)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 分析コメント・名刺データの表示言語。省略による日本語フォールバックを防ぐため必須。 */
```

<!-- source: src/lib/api/appview.ts:422 -->

### [src/lib/api/appview.ts:422](../../../src/lib/api/appview.ts#L422)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 日記は本人だけが読む。日記ページから自分の DID で呼ぶ。
 * 年間グラフは from/to を1組で渡す。moods を付けると感情グラフの点も返る。
 */
```

<!-- source: src/lib/api/appview.ts:443 -->

### [src/lib/api/appview.ts:443](../../../src/lib/api/appview.ts#L443)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 感情グラフの点（自分の投稿の気分）を直す。valence を省くと botたん（LLM）の値に戻す。
 * 返りの mood が無ければ、戻した結果グラフから外れた（中立だった・採点し直し待ち）ということ。
 */
```

<!-- source: src/lib/api/appview.ts:478 -->

### [src/lib/api/appview.ts:478](../../../src/lib/api/appview.ts#L478)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 自分年表。1ページ＝1年ぶんで、cursor は次に返す年（"2025"）。
 * 日記と同じく本人専用なので auth は 'required'（他人の DID を渡すとサーバが 403 を返す）。
 */
```

<!-- source: src/lib/api/appview.ts:511 -->

### [src/lib/api/appview.ts:511](../../../src/lib/api/appview.ts#L511)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 投稿欄の #タグ候補。既存タグを前方一致で返す（q は # を除いた入力）。公開情報なので AppView 直読み。
```

<!-- source: src/lib/api/appview.ts:524 -->

### [src/lib/api/appview.ts:524](../../../src/lib/api/appview.ts#L524)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ログイン画面のサジェスト用。ログイン時点ではまだ Nagi ユーザーですらないため、
// Nagi AppView を経由せず未認証で叩ける公開 Bsky AppView を直接叩く。
```

<!-- source: src/lib/api/appview.ts:542 -->

### [src/lib/api/appview.ts:542](../../../src/lib/api/appview.ts#L542)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 名前に加えて意味でも探す。q が必要。1ページだけ返す（cursor は無い）。 */
```

<!-- source: src/lib/api/appview.ts:544 -->

### [src/lib/api/appview.ts:544](../../../src/lib/api/appview.ts#L544)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** semantic のとき、Unicode 絵文字も unicode に入れて返す。 */
```

<!-- source: src/lib/api/appview.ts:546 -->

### [src/lib/api/appview.ts:546](../../../src/lib/api/appview.ts#L546)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** semantic のとき、名前の一致度が同じならこのリポジトリの絵文字を先に並べる。 */
```

<!-- source: src/lib/api/appview.ts:592 -->

### [src/lib/api/appview.ts:592](../../../src/lib/api/appview.ts#L592)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ミュートは非公開情報なので必ず認証必須（公開フォールバックは付けない）。
```

<!-- source: src/lib/api/appview.ts:602 -->

### [src/lib/api/appview.ts:602](../../../src/lib/api/appview.ts#L602)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ホームリストは非公開情報。公開フォールバックや viewer DID パラメータを追加しないこと。
```

<!-- source: src/lib/api/appview.ts:677 -->

### [src/lib/api/appview.ts:677](../../../src/lib/api/appview.ts#L677)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 同期する設定（既読位置・お気に入り絵文字）。既読位置は閲覧履歴そのものなので、
// ミュートと同じく公開フォールバックは付けず必ず認証必須で叩く。
```

<!-- source: src/lib/api/appview.ts:693 -->

### [src/lib/api/appview.ts:693](../../../src/lib/api/appview.ts#L693)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * ポストおたすけ。書きかけの本文から botたんのひとことを生成する。
 * 本文を URL に載せないよう procedure で送り、本人の日記を材料にするので認証必須。
 */
```

<!-- source: src/lib/api/appview.ts:714 -->

### [src/lib/api/appview.ts:714](../../../src/lib/api/appview.ts#L714)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 3行日記の「botたんに相談」。日記の日付の0時から今まで（from〜to）の本人の投稿から、
 * 空いている行の候補を作る。入力済みの行はそのまま返る。投稿はしない。
 */
```

<!-- source: src/lib/api/appview.ts:729 -->

### [src/lib/api/appview.ts:729](../../../src/lib/api/appview.ts#L729)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// カードの所持状況は公開情報。自分の drawStatus と未反映の控えだけ認証付きで返る。
// 図鑑は publicOnly で先に出し、本人向け情報は requireViewer であとから補う。
```

<!-- source: src/lib/api/appview.ts:743 -->

### [src/lib/api/appview.ts:743](../../../src/lib/api/appview.ts#L743)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * アドベントカレンダー。公開済みのカードだけが返る公開情報なので、ログイン中でも
 * PDS を経由せず直接取る（OAuth の権限を増やさないため）。既読は preferences が持つ。
 */
```

<!-- source: src/lib/api/appview.ts:756 -->

### [src/lib/api/appview.ts:756](../../../src/lib/api/appview.ts#L756)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * ゼンカツ！の、ある1日のお題と全回答（新着順）。
 *
 * 記録は公開情報なので未認証でも読めるが、認証していれば viewer（提出済みか・今日出せる札）が
 * 付く。既定は権限不足なら公開取得へ落とす。盤面は publicOnly でお題を先に出し、
 * requireViewer で認証エラーを受け取って再認可を案内する。
 */
```

<!-- source: src/lib/api/appview.ts:780 -->

### [src/lib/api/appview.ts:780](../../../src/lib/api/appview.ts#L780)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * **開発専用**: 今日のゼンカツ提出を消して、もう一度出せるようにする。
 *
 * ゼンカツは1日1回なので、そのままでは総評や演出を1日1度しか確かめられない。
 * AppView 側は開発モードでないとルート自体を登録しないので、本番では 404 になる。
 */
```

<!-- source: src/lib/api/appview.ts:793 -->

### [src/lib/api/appview.ts:793](../../../src/lib/api/appview.ts#L793)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** レコード。自分が成立させたコンボと5種類のトロフィー（旧賞の履歴も含む）。要認証。 */
```

<!-- source: src/lib/api/appview.ts:801 -->

### [src/lib/api/appview.ts:801](../../../src/lib/api/appview.ts#L801)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 全肯定カードのニュース（R以上のドローと、ゼンカツのハイライト）。公開情報。
 *
 * 認証していれば自分の押したリアクションが `reactedByMe` で返るので、既定は認証付きで取る。
 * 権限が足りない古いセッションは公開取得へ落ちるだけで、一覧そのものは読める。
 */
```

<!-- source: src/lib/api/appview.ts:815 -->

### [src/lib/api/appview.ts:815](../../../src/lib/api/appview.ts#L815)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** DID の無い端末に、通常枠と同じ抽選ロジックで当日の1枚を返す。 */
```

<!-- source: src/lib/api/appview.ts:823 -->

### [src/lib/api/appview.ts:823](../../../src/lib/api/appview.ts#L823)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 通常枠またはリアクション枠のカードを1枚引く。同じ枠への再送は冪等。
 * source=anniversary は抽選ではなく、その日が記念日なら未受領ぶんをまとめて受け取る
 * （1日1回の枠を消費しない。結果は result.cards に全部入る）。
 */
```

<!-- source: src/lib/api/appview.ts:840 -->

### [src/lib/api/appview.ts:840](../../../src/lib/api/appview.ts#L840)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 通報・フィードバックの理由。AppView の REPORT_REASONS と揃えること。 */
```

<!-- source: src/lib/api/appview.ts:842 -->

### [src/lib/api/appview.ts:842](../../../src/lib/api/appview.ts#L842)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 投稿（botたんの投稿を含む）や、投稿に付いたリアクションを運営に伝える。
 * reactor を付けると「この投稿にこの人が付けたリアクション」の通報になる。運営の Discord にだけ届く。
 */
```

<!-- source: src/lib/api/appview.ts:857 -->

### [src/lib/api/appview.ts:857](../../../src/lib/api/appview.ts#L857)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * おすそわけボード。図鑑のカードごとの「ある／ない」と、置ける枚数・Ƶ 残高を返す。
 * はじめて開いたときに Ƶ が配られる（welcomeGranted）。要認証。
 */
```

<!-- source: src/lib/api/appview.ts:868 -->

### [src/lib/api/appview.ts:868](../../../src/lib/api/appview.ts#L868)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** だぶったカードをボードに置いて Ƶ を受け取る。mode=all は全部のカードを3枚まで減らす。 */
```

<!-- source: src/lib/api/appview.ts:879 -->

### [src/lib/api/appview.ts:879](../../../src/lib/api/appview.ts#L879)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * まだ持っていないカードを Ƶ で受け取る。price は画面に出ていた額で、
 * それより高くなっていたら out_of_stock（ボードの AAR が取られ、botたんの額に戻った）。
 */
```

<!-- source: src/lib/api/appview.ts:890 -->

### [src/lib/api/appview.ts:890](../../../src/lib/api/appview.ts#L890)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * botたんに絵文字を描いてもらう。描き終えると通知が届くので、待たずに画面を離れてよい。
 * 未完了の依頼は1人1件で、重なると already_active。
 */
```

<!-- source: src/lib/api/appview.ts:908 -->

### [src/lib/api/appview.ts:908](../../../src/lib/api/appview.ts#L908)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 姉妹アプリへ「サインイン済みのまま」移動するための短命チケットを取得する。
 * 発行対象は AppView が検証した viewerDid 固定で、こちらから DID は渡さない。
 */
```

<!-- source: src/lib/api/appview.ts:1008 -->

### [src/lib/api/appview.ts:1008](../../../src/lib/api/appview.ts#L1008)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 任意アプリ連携のフィールド選択補助。publish 済み Lexicon のスキーマを AppView 経由で解決する
// （DNS TXT 解決はブラウザ不可のためサーバ側で行う）。未解決なら resolved:false。認証不要。
```

<!-- source: src/lib/api/appview.ts:1017 -->

### [src/lib/api/appview.ts:1017](../../../src/lib/api/appview.ts#L1017)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// アプリの favicon を解決する（連携設定時に1回呼び、結果 URL をレコードへ保存）。認証不要。
```

## src/lib/api/types.ts

<!-- source: src/lib/api/types.ts:7 -->

### [src/lib/api/types.ts:7](../../../src/lib/api/types.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** botたん本人か。PostView.isBot はこれと同じ判定の投稿単位版。 */
```

<!-- source: src/lib/api/types.ts:9 -->

### [src/lib/api/types.ts:9](../../../src/lib/api/types.ts#L9)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 超ポジティブLv（Bluesky と共通のカウンタ。100以上もそのまま表示する） */
```

<!-- source: src/lib/api/types.ts:11 -->

### [src/lib/api/types.ts:11](../../../src/lib/api/types.ts#L11)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * 現在の称号（Bluesky と共通）。次の日記が書かれるまで維持される。
	 * UI 言語で出し分けるので両方来る。
	 */
```

<!-- source: src/lib/api/types.ts:16 -->

### [src/lib/api/types.ts:16](../../../src/lib/api/types.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * 「今日のゼンカツ部長」＝ 直前に閉じた日の botたん賞の受賞者。
	 * **毎日ひとりだけが持ち、1日で消える。** 累積は出さない。
	 * プロフィール取得の経路でだけ入る（フィードでは入らない）。
	 */
```

<!-- source: src/lib/api/types.ts:23 -->

### [src/lib/api/types.ts:23](../../../src/lib/api/types.ts#L23)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 固定 Bluemoji Lexicon に準拠したカスタム絵文字ビュー。 */
```

<!-- source: src/lib/api/types.ts:40 -->

### [src/lib/api/types.ts:40](../../../src/lib/api/types.ts#L40)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 他クライアントでも本文内Bluemojiを描画できる、公式richtext facet用スナップショット。 */
```

<!-- source: src/lib/api/types.ts:43 -->

### [src/lib/api/types.ts:43](../../../src/lib/api/types.ts#L43)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 絵文字の意味検索（searchEmojis の semantic + includeUnicode）が返す Unicode 絵文字。 */
```

<!-- source: src/lib/api/types.ts:64 -->

### [src/lib/api/types.ts:64](../../../src/lib/api/types.ts#L64)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** video.bsky.app が配信する HLS とサムネイル。 */
```

<!-- source: src/lib/api/types.ts:83 -->

### [src/lib/api/types.ts:83](../../../src/lib/api/types.ts#L83)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** OGP画像の配信元URL。画像本体はAppViewを経由せず直接読み込む。 */
```

<!-- source: src/lib/api/types.ts:86 -->

### [src/lib/api/types.ts:86](../../../src/lib/api/types.ts#L86)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** botたんのひとこと。ユーザーが追加した直後はまだ無く、空文字で届く。 */
```

<!-- source: src/lib/api/types.ts:88 -->

### [src/lib/api/types.ts:88](../../../src/lib/api/types.ts#L88)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 自動モデレーションの札。付いていればカード全体を CW で伏せる。 */
```

<!-- source: src/lib/api/types.ts:96 -->

### [src/lib/api/types.ts:96](../../../src/lib/api/types.ts#L96)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * 話しやすさ 0〜4（専門知識なしで話せる・経験や好みにつながる・成功体験がなくても
	 * 答えられる・意見の正しさを争いにくい、の該当数）。右サイドバーの1件選定に使う。
	 */
```

<!-- source: src/lib/api/types.ts:102 -->

### [src/lib/api/types.ts:102](../../../src/lib/api/types.ts#L102)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 検索公開を選んだブログ投稿の、ビルド時に使う公開スナップショット。 */
```

<!-- source: src/lib/api/types.ts:109 -->

### [src/lib/api/types.ts:109](../../../src/lib/api/types.ts#L109)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 一覧の公開キャッシュから引くので、送り主も自分の反応も入らない絵文字だけ。 */
```

<!-- source: src/lib/api/types.ts:133 -->

### [src/lib/api/types.ts:133](../../../src/lib/api/types.ts#L133)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** Bluesky に同時投稿したコピーへの参照。root は先頭、tail は分割の末尾、threadRoot は Bluesky 上のスレッドの先頭。 */
```

<!-- source: src/lib/api/types.ts:138 -->

### [src/lib/api/types.ts:138](../../../src/lib/api/types.ts#L138)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** Bluesky に同時投稿したコピー。AppView は作者本人にだけ返す。 */
```

<!-- source: src/lib/api/types.ts:161 -->

### [src/lib/api/types.ts:161](../../../src/lib/api/types.ts#L161)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** このレコード自身のこっそり値。新規データではスレッドルートだけが持つ。 */
```

<!-- source: src/lib/api/types.ts:163 -->

### [src/lib/api/types.ts:163](../../../src/lib/api/types.ts#L163)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** ルート投稿から解決した、スレッド全体の有効なこっそり状態。 */
```

<!-- source: src/lib/api/types.ts:165 -->

### [src/lib/api/types.ts:165](../../../src/lib/api/types.ts#L165)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * ブログとして書かれた投稿。本文先頭の見出しをタイトル、1枚目の画像を
	 * ヘッダーとして記事の体裁で描画する。先頭が見出しなだけの通常投稿と
	 * 区別するために、推測ではなくレコードの値をそのまま使う。
	 */
```

<!-- source: src/lib/api/types.ts:171 -->

### [src/lib/api/types.ts:171](../../../src/lib/api/types.ts#L171)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * TriLinesAt の3行日記（URI は com.suibari.trilinesat.diary）。行の画像は images の添字で指す。
	 * 本文の text は行を改行でつないだもので、検索・翻訳用。表示はこちらを使う。
	 */
```

<!-- source: src/lib/api/types.ts:176 -->

### [src/lib/api/types.ts:176](../../../src/lib/api/types.ts#L176)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 投稿後に編集された（AppView が cid 変化を観測した）か。UI の「編集済み」バッジ用。 */
```

<!-- source: src/lib/api/types.ts:180 -->

### [src/lib/api/types.ts:180](../../../src/lib/api/types.ts#L180)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** Client-only state; never returned by the AppView API. */
```

<!-- source: src/lib/api/types.ts:182 -->

### [src/lib/api/types.ts:182](../../../src/lib/api/types.ts#L182)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** Client-only stable DOM key used while an optimistic post changes URI/CID. */
```

<!-- source: src/lib/api/types.ts:186 -->

### [src/lib/api/types.ts:186](../../../src/lib/api/types.ts#L186)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 会話グループ化ビュー。共有TL(group モード)でのみ付き、1スレッドを
 * 「ルート + 最新数件のバブル」に畳んで表示する。bot返信もバブルとして時刻順に含む。
 */
```

<!-- source: src/lib/api/types.ts:190 -->

### [src/lib/api/types.ts:190](../../../src/lib/api/types.ts#L190)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 会話グループ内の1バブル。depth はルートからの返信ホップ数(root=0, 直リプ=1, ...)。 */
```

<!-- source: src/lib/api/types.ts:193 -->

### [src/lib/api/types.ts:193](../../../src/lib/api/types.ts#L193)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** スレッドルートURI。dedup/マージ/DOMキーの安定キー。 */
```

<!-- source: src/lib/api/types.ts:195 -->

### [src/lib/api/types.ts:195](../../../src/lib/api/types.ts#L195)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** スレッドの起点。常に先頭に表示する。 */
```

<!-- source: src/lib/api/types.ts:197 -->

### [src/lib/api/types.ts:197](../../../src/lib/api/types.ts#L197)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** ルート以降の共有可視バブル（時刻昇順・bot返信含む・最大3件・深さ付き）。 */
```

<!-- source: src/lib/api/types.ts:199 -->

### [src/lib/api/types.ts:199](../../../src/lib/api/types.ts#L199)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** ルートと最新群の間に畳まれた件数。0 なら区切りを出さない。 */
```

<!-- source: src/lib/api/types.ts:201 -->

### [src/lib/api/types.ts:201](../../../src/lib/api/types.ts#L201)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 共有可視バブルの総数（root 含む）。1 なら単独投稿。 */
```

<!-- source: src/lib/api/types.ts:203 -->

### [src/lib/api/types.ts:203](../../../src/lib/api/types.ts#L203)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 代表(最新の人間投稿)が botたんの返信を待っている状態。返信 indexed 済みなら付かない。 */
```

<!-- source: src/lib/api/types.ts:210 -->

### [src/lib/api/types.ts:210](../../../src/lib/api/types.ts#L210)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** group モード時のみ。会話ブロックとして描画するためのデータ。 */
```

<!-- source: src/lib/api/types.ts:215 -->

### [src/lib/api/types.ts:215](../../../src/lib/api/types.ts#L215)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 本人だけが取得できる、ホームに表示するユーザーの非公開一覧。 */
```

<!-- source: src/lib/api/types.ts:251 -->

### [src/lib/api/types.ts:251](../../../src/lib/api/types.ts#L251)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 全肯定ニュースの「動的枠」。関心ジャンルが近い記事を items とは別枠で受け取る。
 * items は時系列のままなので、未読判定（items[0] が最新）はこの追加に影響されない。
 */
```

<!-- source: src/lib/api/types.ts:256 -->

### [src/lib/api/types.ts:256](../../../src/lib/api/types.ts#L256)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 「おすすめの理由：〜」に出す関心ジャンル。keyword は移行中の旧APIとの互換用。 */
```

<!-- source: src/lib/api/types.ts:265 -->

### [src/lib/api/types.ts:265](../../../src/lib/api/types.ts#L265)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 当日だけ true。非公開の生年月日・生年・月日は返らない。 */
```

<!-- source: src/lib/api/types.ts:269 -->

### [src/lib/api/types.ts:269](../../../src/lib/api/types.ts#L269)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** botたんの自動分析コメント。閲覧者の言語に合わせた本文（無ければ undefined）。 */
```

<!-- source: src/lib/api/types.ts:271 -->

### [src/lib/api/types.ts:271](../../../src/lib/api/types.ts#L271)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * 名刺カード用の短いひとこと。閲覧者の言語に合わせた本文。
	 * 分析が v1 プロンプト時代のままの相手では付かないので、名刺側は comment から詰める。
	 */
```

<!-- source: src/lib/api/types.ts:276 -->

### [src/lib/api/types.ts:276](../../../src/lib/api/types.ts#L276)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 名刺カードに載せる、ユーザーを表すハッシュタグ3つ（'#' は含まない）。 */
```

<!-- source: src/lib/api/types.ts:278 -->

### [src/lib/api/types.ts:278](../../../src/lib/api/types.ts#L278)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** プロフィールUIに表示する興味テーマの候補。表示側で3件をランダム選出する。 */
```

<!-- source: src/lib/api/types.ts:280 -->

### [src/lib/api/types.ts:280](../../../src/lib/api/types.ts#L280)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 名刺の更新日（= 分析の更新日時）。 */
```

<!-- source: src/lib/api/types.ts:284 -->

### [src/lib/api/types.ts:284](../../../src/lib/api/types.ts#L284)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * こっそり投稿に対するリアクション。作者も本文も辿れないので、リアクションタブでは
 * 中身の代わりにこれが返る。黙って消すと「押したはずのものが無い」になるため、
 * 時系列の位置は保ったままプレースホルダとして描く。
 */
```

<!-- source: src/lib/api/types.ts:293 -->

### [src/lib/api/types.ts:293](../../../src/lib/api/types.ts#L293)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 元投稿を伏せたまま、本人が押したリアクションだけを表示する。 */
```

<!-- source: src/lib/api/types.ts:308 -->

### [src/lib/api/types.ts:308](../../../src/lib/api/types.ts#L308)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** botたんが書いた1日分の日記。ポストではないのでタイムラインには出ない。 */
```

<!-- source: src/lib/api/types.ts:312 -->

### [src/lib/api/types.ts:312](../../../src/lib/api/types.ts#L312)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 日記の対象ユーザーの DID。 */
```

<!-- source: src/lib/api/types.ts:314 -->

### [src/lib/api/types.ts:314](../../../src/lib/api/types.ts#L314)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** "YYYY-MM-DD"（本人のローカル日付） */
```

<!-- source: src/lib/api/types.ts:319 -->

### [src/lib/api/types.ts:319](../../../src/lib/api/types.ts#L319)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 日記生成の材料にした、返信を含むNagiポスト数。 */
```

<!-- source: src/lib/api/types.ts:321 -->

### [src/lib/api/types.ts:321](../../../src/lib/api/types.ts#L321)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** その日のリアクション・返信・引用で、本人から多く関わった相手（最大10人）。 */
```

<!-- source: src/lib/api/types.ts:323 -->

### [src/lib/api/types.ts:323](../../../src/lib/api/types.ts#L323)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 11人目以降の関わった相手がいる。 */
```

<!-- source: src/lib/api/types.ts:329 -->

### [src/lib/api/types.ts:329](../../../src/lib/api/types.ts#L329)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 感情グラフの点1つ（投稿1件）。getDiaries の期間指定に moods を付けたときだけ返る。
 * 気分が読み取れた投稿だけで、中立（告知・事実共有など）は含まない。
 */
```

<!-- source: src/lib/api/types.ts:335 -->

### [src/lib/api/types.ts:335](../../../src/lib/api/types.ts#L335)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** その投稿が入る日記の日付。前日22時の直後〜当日22時で区切る（日記と同じ）。 */
```

<!-- source: src/lib/api/types.ts:338 -->

### [src/lib/api/types.ts:338](../../../src/lib/api/types.ts#L338)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** -5（深く落ち込んでいる）〜 +5（最高に嬉しい）。0 は含まない。本人が直していればその値。 */
```

<!-- source: src/lib/api/types.ts:340 -->

### [src/lib/api/types.ts:340](../../../src/lib/api/types.ts#L340)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 本人が setPostMood で直した値なら true。 */
```

<!-- source: src/lib/api/types.ts:342 -->

### [src/lib/api/types.ts:342](../../../src/lib/api/types.ts#L342)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 本文の冒頭（最大200字）。 */
```

<!-- source: src/lib/api/types.ts:351 -->

### [src/lib/api/types.ts:351](../../../src/lib/api/types.ts#L351)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** moods を要求したときだけ。 */
```

<!-- source: src/lib/api/types.ts:353 -->

### [src/lib/api/types.ts:353](../../../src/lib/api/types.ts#L353)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 期間内でまだ採点されていない投稿の数（導入直後のバックフィル中）。 */
```

<!-- source: src/lib/api/types.ts:355 -->

### [src/lib/api/types.ts:355](../../../src/lib/api/types.ts#L355)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * moods の date を切ったタイムゾーン（IANA 名）。期間の最後の日の値。
	 * 端末のタイムゾーンと違うことがあるので、1日の中の位置はこれで計算する。
	 */
```

<!-- source: src/lib/api/types.ts:360 -->

### [src/lib/api/types.ts:360](../../../src/lib/api/types.ts#L360)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 区切りの時刻（期間の最後の日の値）。旧 AppView は返さない（22時）。 */
```

<!-- source: src/lib/api/types.ts:362 -->

### [src/lib/api/types.ts:362](../../../src/lib/api/types.ts#L362)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * 点のある日ごとの窓。期間の途中で区切りの設定が変わることがあるので日ごとに持つ。
	 * 旧 AppView は返さない（moodTimezone と moodDayStartHour から計算する）。
	 */
```

<!-- source: src/lib/api/types.ts:368 -->

### [src/lib/api/types.ts:368](../../../src/lib/api/types.ts#L368)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** この瞬間は含まない。 */
```

<!-- source: src/lib/api/types.ts:370 -->

### [src/lib/api/types.ts:370](../../../src/lib/api/types.ts#L370)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** この瞬間までを含む。 */
```

<!-- source: src/lib/api/types.ts:377 -->

### [src/lib/api/types.ts:377](../../../src/lib/api/types.ts#L377)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 本人専用の「botたんラジオ」。現在の放送枠だけ取得できる。 */
```

<!-- source: src/lib/api/types.ts:385 -->

### [src/lib/api/types.ts:385](../../../src/lib/api/types.ts#L385)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 新APIの曲ページとジャケット。旧APIとの併用期間は省略可能。 */
```

<!-- source: src/lib/api/types.ts:392 -->

### [src/lib/api/types.ts:392](../../../src/lib/api/types.ts#L392)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * ポストが引用したbotたんラジオの1回（com.suibari.nagi.radio）。中身は AppView が本人の
 * 放送履歴から引く。公開をやめた・放送が見つからないときは unavailable だけが立つ。
 */
```

<!-- source: src/lib/api/types.ts:416 -->

### [src/lib/api/types.ts:416](../../../src/lib/api/types.ts#L416)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 自分年表の1件。
 *
 * **固定文言の kind（nagi_joined など）は、サーバが ja/en を作らない。** ラベルは
 * $lib/chronicle/chronicle.ts が i18n から引くので、いま選んでいる言語に追従する。
 * titleJa/titleEn が入るのは LLM が書いた highlight と news_context だけ。
 */
```

<!-- source: src/lib/api/types.ts:429 -->

### [src/lib/api/types.ts:429](../../../src/lib/api/types.ts#L429)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 日記から抜いたその月の出来事。**年表の主役。** */
```

<!-- source: src/lib/api/types.ts:431 -->

### [src/lib/api/types.ts:431](../../../src/lib/api/types.ts#L431)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** そのころ世の中では。月ごとに1件で全員共通。まとめの下に紐づけて出す。 */
```

<!-- source: src/lib/api/types.ts:434 -->

### [src/lib/api/types.ts:434](../../../src/lib/api/types.ts#L434)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 決定論的に導出した安定キー。keyed each と、ページをまたいだ重複排除に使う。 */
```

<!-- source: src/lib/api/types.ts:437 -->

### [src/lib/api/types.ts:437](../../../src/lib/api/types.ts#L437)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** "YYYY-MM-DD"。JST 4:00 始まりで丸めてある。 */
```

<!-- source: src/lib/api/types.ts:443 -->

### [src/lib/api/types.ts:443](../../../src/lib/api/types.ts#L443)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** highlight の由来。/diary?date= へ飛ばす。 */
```

<!-- source: src/lib/api/types.ts:445 -->

### [src/lib/api/types.ts:445](../../../src/lib/api/types.ts#L445)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** anniversary_card / first_card_* のとき。 */
```

<!-- source: src/lib/api/types.ts:447 -->

### [src/lib/api/types.ts:447](../../../src/lib/api/types.ts#L447)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** news_context のとき。 */
```

<!-- source: src/lib/api/types.ts:453 -->

### [src/lib/api/types.ts:453](../../../src/lib/api/types.ts#L453)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 古いAppViewとの移行互換性のため省略可能。 */
```

<!-- source: src/lib/api/types.ts:457 -->

### [src/lib/api/types.ts:457](../../../src/lib/api/types.ts#L457)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 次に返す年（"2025"）。これ以上さかのぼれないときは省略する。 */
```

<!-- source: src/lib/api/types.ts:463 -->

### [src/lib/api/types.ts:463](../../../src/lib/api/types.ts#L463)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 'analysis' は名刺（自動分析）の更新。actor は常に botたん、post も diary も付かない。 */
```

<!-- source: src/lib/api/types.ts:464 -->

### [src/lib/api/types.ts:464](../../../src/lib/api/types.ts#L464)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 'gift' はおすそわけボードに置いたカードが届いた。actor は受け取った人、cardSubject にカードが入る。 */
```

<!-- source: src/lib/api/types.ts:465 -->

### [src/lib/api/types.ts:465](../../../src/lib/api/types.ts#L465)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 'emoji' は依頼した絵文字の生成が終わった（失敗も含む）。actor は常に botたん。 */
```

<!-- source: src/lib/api/types.ts:466 -->

### [src/lib/api/types.ts:466](../../../src/lib/api/types.ts#L466)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 'chronicle' は年表に週のトピックが載った。actor は常に botたん、post も diary も付かない。 */
```

<!-- source: src/lib/api/types.ts:467 -->

### [src/lib/api/types.ts:467](../../../src/lib/api/types.ts#L467)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 'mood' は始めたばかりの人の最初の気持ちが感情グラフに載った。actor は常に botたん。 */
```

<!-- source: src/lib/api/types.ts:468 -->

### [src/lib/api/types.ts:468](../../../src/lib/api/types.ts#L468)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 'advent' はアドベントカレンダーのカードに選ばれた。reasonUri の末尾が日付（at://did/advent/2026-12-03）。 */
```

<!-- source: src/lib/api/types.ts:482 -->

### [src/lib/api/types.ts:482](../../../src/lib/api/types.ts#L482)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** type が 'diary' のときの日記本体。post は付かない。 */
```

<!-- source: src/lib/api/types.ts:484 -->

### [src/lib/api/types.ts:484](../../../src/lib/api/types.ts#L484)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** type が 'reaction' のときの、押された絵文字。まとめた通知では最後に押された1つ。 */
```

<!-- source: src/lib/api/types.ts:486 -->

### [src/lib/api/types.ts:486](../../../src/lib/api/types.ts#L486)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * type が 'reaction' のときの、まとめた絵文字すべて（押された順）。
	 * AppView は同じ相手・同じ対象への反応を、最初の反応から5分間で1件にまとめる。
	 * これを返さない古い AppView では reaction だけを使う。
	 */
```

<!-- source: src/lib/api/types.ts:492 -->

### [src/lib/api/types.ts:492](../../../src/lib/api/types.ts#L492)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * subject がゼンカツの提出・ドローの控えのときの中身。
	 * どちらも投稿ではないので post には入らない。これが無いと
	 * 「リアクションされた」とだけ出て、何にされたのか分からなくなる。
	 */
```

<!-- source: src/lib/api/types.ts:503 -->

### [src/lib/api/types.ts:503](../../../src/lib/api/types.ts#L503)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 通知が指している、全肯定カードまわりの対象。 */
```

<!-- source: src/lib/api/types.ts:506 -->

### [src/lib/api/types.ts:506](../../../src/lib/api/types.ts#L506)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** gift はおすそわけボードのカードが届いた通知。cards に届いた1枚が入る。 */
```

<!-- source: src/lib/api/types.ts:508 -->

### [src/lib/api/types.ts:508](../../../src/lib/api/types.ts#L508)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** type=zenkatsu のとき。 */
```

<!-- source: src/lib/api/types.ts:511 -->

### [src/lib/api/types.ts:511](../../../src/lib/api/types.ts#L511)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 出した札、または引いた1枚。 */
```

<!-- source: src/lib/api/types.ts:515 -->

### [src/lib/api/types.ts:515](../../../src/lib/api/types.ts#L515)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 既存ハッシュタグの候補。tag は正規形（# を除いた小文字）、count はそのタグの投稿数。 */
```

<!-- source: src/lib/api/types.ts:518 -->

### [src/lib/api/types.ts:518](../../../src/lib/api/types.ts#L518)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** ミュート対象の種別。actor は相手の DID、tag はハッシュタグ（# を除いた小文字）を指す。 */
```

<!-- source: src/lib/api/types.ts:520 -->

### [src/lib/api/types.ts:520](../../../src/lib/api/types.ts#L520)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 自分のミュート一覧。AppView は本人のリクエストにしか返さない。 */
```

<!-- source: src/lib/api/types.ts:523 -->

### [src/lib/api/types.ts:523](../../../src/lib/api/types.ts#L523)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ---------------------------------------------------------------------------
// 端末をまたいで同期する設定（既読位置・お気に入り絵文字）
// ---------------------------------------------------------------------------
```

<!-- source: src/lib/api/types.ts:526 -->

### [src/lib/api/types.ts:526](../../../src/lib/api/types.ts#L526)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 既読位置を同期するセクション。既読位置はセクションごとに1つ。
 * bot / community / list / channels は廃止した my Nagi のもので、サーバー互換のため型に残す。
 */
```

<!-- source: src/lib/api/types.ts:531 -->

### [src/lib/api/types.ts:531](../../../src/lib/api/types.ts#L531)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 「ここまで読んだ」位置。新旧は (indexedAt, uri) の辞書順で比較する。 */
```

<!-- source: src/lib/api/types.ts:533 -->

### [src/lib/api/types.ts:533](../../../src/lib/api/types.ts#L533)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** お気に入り絵文字1つ。localStorage の ReactionChoice と同じ形をそのまま預ける。 */
```

<!-- source: src/lib/api/types.ts:536 -->

### [src/lib/api/types.ts:536](../../../src/lib/api/types.ts#L536)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * フィードのタブ1枚の種別。
 * list / custom は「入れ物」で、どれを指すかは source が持つ（list はいまホームだけ、
 * custom はいま全肯定だけ）。将来ユーザーが定義したカスタムフィードも custom に入る。
 */
```

<!-- source: src/lib/api/types.ts:542 -->

### [src/lib/api/types.ts:542](../../../src/lib/api/types.ts#L542)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** list / custom が指す組み込みの中身。 */
```

<!-- source: src/lib/api/types.ts:543 -->

### [src/lib/api/types.ts:543](../../../src/lib/api/types.ts#L543)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** bsky の following は Bluesky のホームタイムライン（フォロー中）で、uri の代わりにこれで指す。 */
```

<!-- source: src/lib/api/types.ts:545 -->

### [src/lib/api/types.ts:545](../../../src/lib/api/types.ts#L545)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * フィードのタブ1枚。種別ごとの union にせずフラットに持つのは、lexicon で
 * タグ付き union を表しづらく、将来の種別追加を optional の追加で吸収したいため。
 */
```

<!-- source: src/lib/api/types.ts:552 -->

### [src/lib/api/types.ts:552](../../../src/lib/api/types.ts#L552)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** kind が list / custom のときの参照先（list=home, custom=affirmation）。 */
```

<!-- source: src/lib/api/types.ts:554 -->

### [src/lib/api/types.ts:554](../../../src/lib/api/types.ts#L554)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** kind==='search' は自由文の保存クエリ、kind==='hashtag' はタグ（# を除いた小文字）。 */
```

<!-- source: src/lib/api/types.ts:556 -->

### [src/lib/api/types.ts:556](../../../src/lib/api/types.ts#L556)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** kind==='bsky' のときの app.bsky.feed.generator の AT-URI。 */
```

<!-- source: src/lib/api/types.ts:558 -->

### [src/lib/api/types.ts:558](../../../src/lib/api/types.ts#L558)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 表示名のスナップショット。権威は query / uri 側で、これは初回描画用。 */
```

<!-- source: src/lib/api/types.ts:562 -->

### [src/lib/api/types.ts:562](../../../src/lib/api/types.ts#L562)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 年ごとの既読内容ハッシュ。 */
```

<!-- source: src/lib/api/types.ts:564 -->

### [src/lib/api/types.ts:564](../../../src/lib/api/types.ts#L564)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 今年のアドカレの既読。旧 AppView は返さない。 */
```

<!-- source: src/lib/api/types.ts:568 -->

### [src/lib/api/types.ts:568](../../../src/lib/api/types.ts#L568)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 省略＝このアカウントのお気に入りがまだ一度も同期されていない（初回同期の合図）。 */
```

<!-- source: src/lib/api/types.ts:571 -->

### [src/lib/api/types.ts:571](../../../src/lib/api/types.ts#L571)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 省略＝まだ一度もタブをカスタムしていない。クライアントは既定タブを使う。 */
```

<!-- source: src/lib/api/types.ts:573 -->

### [src/lib/api/types.ts:573](../../../src/lib/api/types.ts#L573)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** お気に入りタグ（# なし小文字、表示順）。旧 AppView は返さない。 */
```

<!-- source: src/lib/api/types.ts:575 -->

### [src/lib/api/types.ts:575](../../../src/lib/api/types.ts#L575)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 省略＝このアカウントのお気に入りタグがまだ一度も同期されていない。 */
```

<!-- source: src/lib/api/types.ts:577 -->

### [src/lib/api/types.ts:577](../../../src/lib/api/types.ts#L577)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** botたんからの返信確率（0〜100%）。 */
```

<!-- source: src/lib/api/types.ts:579 -->

### [src/lib/api/types.ts:579](../../../src/lib/api/types.ts#L579)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 省略＝未設定。botたんは表示名で呼ぶ。 */
```

<!-- source: src/lib/api/types.ts:585 -->

### [src/lib/api/types.ts:585](../../../src/lib/api/types.ts#L585)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 省略＝まだ一度も保存していない（すべて既定）。旧 AppView も返さない。 */
```

<!-- source: src/lib/api/types.ts:590 -->

### [src/lib/api/types.ts:590](../../../src/lib/api/types.ts#L590)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * 年齢確認の状態。本人にだけ返る（他人の分は引けない）。
	 * declared が false なら未申告＝未成年扱い。
	 */
```

<!-- source: src/lib/api/types.ts:597 -->

### [src/lib/api/types.ts:597](../../../src/lib/api/types.ts#L597)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 申告済みなら本人が確認できるよう返る。改定前からの既存ユーザーは未申告なので省略。 */
```

<!-- source: src/lib/api/types.ts:600 -->

### [src/lib/api/types.ts:600](../../../src/lib/api/types.ts#L600)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 日記の1日の区切り。旧 AppView は返さない（そのときは設定画面に項目を出さない）。 */
```

<!-- source: src/lib/api/types.ts:603 -->

### [src/lib/api/types.ts:603](../../../src/lib/api/types.ts#L603)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 日記の「1日」を決める設定。AppView の本人用の設定にだけあり、公開されない。 */
```

<!-- source: src/lib/api/types.ts:605 -->

### [src/lib/api/types.ts:605](../../../src/lib/api/types.ts#L605)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** Nagi を開いたときに送ったこの端末（または別の端末）のタイムゾーン。 */
```

<!-- source: src/lib/api/types.ts:607 -->

### [src/lib/api/types.ts:607](../../../src/lib/api/types.ts#L607)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 本人が選んだタイムゾーン。あれば自動より優先する。 */
```

<!-- source: src/lib/api/types.ts:609 -->

### [src/lib/api/types.ts:609](../../../src/lib/api/types.ts#L609)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 本人が選んだ区切りの時刻（18〜23, 0〜6）。 */
```

<!-- source: src/lib/api/types.ts:611 -->

### [src/lib/api/types.ts:611](../../../src/lib/api/types.ts#L611)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 今開いている日に使っている設定。effectiveFrom はその設定が有効になった日。 */
```

<!-- source: src/lib/api/types.ts:613 -->

### [src/lib/api/types.ts:613](../../../src/lib/api/types.ts#L613)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** まだ有効になっていない変更。effectiveFrom の日の日記から反映される。 */
```

<!-- source: src/lib/api/types.ts:627 -->

### [src/lib/api/types.ts:627](../../../src/lib/api/types.ts#L627)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 通知設定のカテゴリ。⚠ nagi-lexicon の NOTIFICATION_PREFERENCE_CATEGORIES と対。
 * botInteraction は「botたんからの返信・メンション・リアクション」。人からの同じ種別とは別に扱う。
 */
```

<!-- source: src/lib/api/types.ts:641 -->

### [src/lib/api/types.ts:641](../../../src/lib/api/types.ts#L641)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 季節の特別なお知らせ（アドベントカレンダーなど期間限定の催し）。複数の通知種別を束ねる。 */
```

<!-- source: src/lib/api/types.ts:643 -->

### [src/lib/api/types.ts:643](../../../src/lib/api/types.ts#L643)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** Bluesky の app.bsky.notification.defs#preference と同じ形。list=通知欄、push=プッシュ通知。 */
```

<!-- source: src/lib/api/types.ts:645 -->

### [src/lib/api/types.ts:645](../../../src/lib/api/types.ts#L645)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 省略したカテゴリは list / push とも true。 */
```

<!-- source: src/lib/api/types.ts:650 -->

### [src/lib/api/types.ts:650](../../../src/lib/api/types.ts#L650)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** この端末のタイムゾーン（IANA 名）。手動で選んでいる間は送らない。 */
```

<!-- source: src/lib/api/types.ts:652 -->

### [src/lib/api/types.ts:652](../../../src/lib/api/types.ts#L652)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 日記の1日の区切り。timezone: null で自動に戻す。送った項目だけを変える。 */
```

<!-- source: src/lib/api/types.ts:654 -->

### [src/lib/api/types.ts:654](../../../src/lib/api/types.ts#L654)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 表示した年のハッシュ。現在の内容と一致する版だけ保存される。 */
```

<!-- source: src/lib/api/types.ts:656 -->

### [src/lib/api/types.ts:656](../../../src/lib/api/types.ts#L656)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 送った項目だけを進める。既読の日は戻らず、開封済みの日は消えない。 */
```

<!-- source: src/lib/api/types.ts:660 -->

### [src/lib/api/types.ts:660](../../../src/lib/api/types.ts#L660)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** emojiFavorites を送るときは必須。保存済みより古ければサーバは書き込まない。 */
```

<!-- source: src/lib/api/types.ts:663 -->

### [src/lib/api/types.ts:663](../../../src/lib/api/types.ts#L663)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** feedTabs を送るときは必須。保存済みより古ければサーバは書き込まない。 */
```

<!-- source: src/lib/api/types.ts:666 -->

### [src/lib/api/types.ts:666](../../../src/lib/api/types.ts#L666)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** tagFavorites を送るときは必須。保存済みより古ければサーバは書き込まない。 */
```

<!-- source: src/lib/api/types.ts:668 -->

### [src/lib/api/types.ts:668](../../../src/lib/api/types.ts#L668)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** botたんからの返信確率（0〜100%）。送らなければ変更しない。 */
```

<!-- source: src/lib/api/types.ts:670 -->

### [src/lib/api/types.ts:670](../../../src/lib/api/types.ts#L670)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * botたんに呼んでほしい名前。空文字で登録を解除して表示名に戻す。
	 * 送らなければ変更しない。他の項目と違い後勝ちで、updatedAt は不要。
	 */
```

<!-- source: src/lib/api/types.ts:679 -->

### [src/lib/api/types.ts:679](../../../src/lib/api/types.ts#L679)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 全カテゴリ分を丸ごと置き換える。 */
```

<!-- source: src/lib/api/types.ts:681 -->

### [src/lib/api/types.ts:681](../../../src/lib/api/types.ts#L681)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** notificationPreferences を送るときは必須。保存済みより古ければサーバは書き込まない。 */
```

<!-- source: src/lib/api/types.ts:685 -->

### [src/lib/api/types.ts:685](../../../src/lib/api/types.ts#L685)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * 生年月日の申告（YYYY-MM-DD）。設定できるのは1度だけで、2度目は 409 になる。
	 * 18歳未満なら parentalConsent: true が必須。
	 */
```

<!-- source: src/lib/api/types.ts:712 -->

### [src/lib/api/types.ts:712](../../../src/lib/api/types.ts#L712)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ---------------------------------------------------------------------------
// 全肯定カード（1日1回引けるトレカ）
// ---------------------------------------------------------------------------
```

<!-- source: src/lib/api/types.ts:715 -->

### [src/lib/api/types.ts:715](../../../src/lib/api/types.ts#L715)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** N < R < SR < UR < AAR(All-Affirmation Rare)。 */
```

<!-- source: src/lib/api/types.ts:718 -->

### [src/lib/api/types.ts:718](../../../src/lib/api/types.ts#L718)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * カード1枚。未所持でも定義部分は返るので、コレクションは常に全30枠を描ける。
 * ja/en 双方が入っているのは、ロケール切替を再フェッチ無しで効かせるため。
 */
```

<!-- source: src/lib/api/types.ts:723 -->

### [src/lib/api/types.ts:723](../../../src/lib/api/types.ts#L723)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * 段内の通し番号。カードの同一性は (volume, id) の組で決まる。表示は v1-001 形式。
	 * 記念日カード（volume = 0）では 西暦*100 + slot が入るので、カード面には year を出す。
	 */
```

<!-- source: src/lib/api/types.ts:728 -->

### [src/lib/api/types.ts:728](../../../src/lib/api/types.ts#L728)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** カード段（初段=1）。 */
```

<!-- source: src/lib/api/types.ts:741 -->

### [src/lib/api/types.ts:741](../../../src/lib/api/types.ts#L741)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 以下は owned のときだけ入る。 */
```

<!-- source: src/lib/api/types.ts:743 -->

### [src/lib/api/types.ts:743](../../../src/lib/api/types.ts#L743)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 引いた瞬間に botたんが付けたコメント。生成中は未定義。 */
```

<!-- source: src/lib/api/types.ts:746 -->

### [src/lib/api/types.ts:746](../../../src/lib/api/types.ts#L746)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 同じカードを引いた回数（初回=1）。 */
```

<!-- source: src/lib/api/types.ts:750 -->

### [src/lib/api/types.ts:750](../../../src/lib/api/types.ts#L750)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** おすそわけボードから受け取ったカードのとき、「〜からもらった」の相手。 */
```

<!-- source: src/lib/api/types.ts:752 -->

### [src/lib/api/types.ts:752](../../../src/lib/api/types.ts#L752)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** カード面に敷く背景画像のベース名。`/card-art/{art}.webp` を引く。無ければ文字だけのカード。 */
```

<!-- source: src/lib/api/types.ts:754 -->

### [src/lib/api/types.ts:754](../../../src/lib/api/types.ts#L754)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 記念日カードなら true。図鑑とは別枠に置き、コンプ率にも数えない。 */
```

<!-- source: src/lib/api/types.ts:756 -->

### [src/lib/api/types.ts:756](../../../src/lib/api/types.ts#L756)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 記念日カードのみ。何年ぶんの1枚か。図鑑番号の代わりにこれを出す。 */
```

<!-- source: src/lib/api/types.ts:759 -->

### [src/lib/api/types.ts:759](../../../src/lib/api/types.ts#L759)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 「〜からもらった」の相手。kind=bot は botたんの分（ボードに無い AAR）、anonymous は提供者が退会済み。
 * kind=user のときだけ did と名前が入る。
 */
```

<!-- source: src/lib/api/types.ts:768 -->

### [src/lib/api/types.ts:768](../../../src/lib/api/types.ts#L768)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** おすそわけボードのカード1種。在庫の枚数と提供者は見せない（ある／ないだけ）。 */
```

<!-- source: src/lib/api/types.ts:771 -->

### [src/lib/api/types.ts:771](../../../src/lib/api/types.ts#L771)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** ボードに1枚以上ある。AAR は botたんの分があるので常に true。 */
```

<!-- source: src/lib/api/types.ts:773 -->

### [src/lib/api/types.ts:773](../../../src/lib/api/types.ts#L773)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 受け取るのに払う Ƶ。ボードに無い AAR は botたんの額（600）。 */
```

<!-- source: src/lib/api/types.ts:775 -->

### [src/lib/api/types.ts:775](../../../src/lib/api/types.ts#L775)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 置いたときにもらえる Ƶ（1枚あたり）。 */
```

<!-- source: src/lib/api/types.ts:777 -->

### [src/lib/api/types.ts:777](../../../src/lib/api/types.ts#L777)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 自分が今置ける枚数（手元に3枚を残し、ゼンカツでお休み中の在庫は除く）。 */
```

<!-- source: src/lib/api/types.ts:779 -->

### [src/lib/api/types.ts:779](../../../src/lib/api/types.ts#L779)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 未所持で在庫があり、残高が足りる。 */
```

<!-- source: src/lib/api/types.ts:784 -->

### [src/lib/api/types.ts:784](../../../src/lib/api/types.ts#L784)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 今回はじめての Ƶ を配ったときだけ、その額。 */
```

<!-- source: src/lib/api/types.ts:793 -->

### [src/lib/api/types.ts:793](../../../src/lib/api/types.ts#L793)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** このカードで受け取った Ƶ（1枚あたり × 枚数）。 */
```

<!-- source: src/lib/api/types.ts:799 -->

### [src/lib/api/types.ts:799](../../../src/lib/api/types.ts#L799)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** my_nagi と reaction は1日1回の抽選枠、anniversary は記念日に配られる特別枠。 */
```

<!-- source: src/lib/api/types.ts:801 -->

### [src/lib/api/types.ts:801](../../../src/lib/api/types.ts#L801)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** その日が記念日で、まだ受け取っていない1枚。 */
```

<!-- source: src/lib/api/types.ts:806 -->

### [src/lib/api/types.ts:806](../../../src/lib/api/types.ts#L806)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** モーダルを開く前に先読みするための背景画像名。 */
```

<!-- source: src/lib/api/types.ts:814 -->

### [src/lib/api/types.ts:814](../../../src/lib/api/types.ts#L814)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 本日の2つの取得枠。自分のコレクションを見ているときだけ返る。 */
```

<!-- source: src/lib/api/types.ts:816 -->

### [src/lib/api/types.ts:816](../../../src/lib/api/types.ts#L816)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 旧AppView互換。通常枠の状態。 */
```

<!-- source: src/lib/api/types.ts:818 -->

### [src/lib/api/types.ts:818](../../../src/lib/api/types.ts#L818)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 次に引ける時刻（ISO8601）。JST 4:00 が境界。 */
```

<!-- source: src/lib/api/types.ts:822 -->

### [src/lib/api/types.ts:822](../../../src/lib/api/types.ts#L822)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 段階配備中の旧AppView応答では未定義。 */
```

<!-- source: src/lib/api/types.ts:828 -->

### [src/lib/api/types.ts:828](../../../src/lib/api/types.ts#L828)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 図鑑の枚数。**記念日カードは含まない**（コンプ率を動かさないため）。 */
```

<!-- source: src/lib/api/types.ts:832 -->

### [src/lib/api/types.ts:832](../../../src/lib/api/types.ts#L832)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 所持している記念日カード。図鑑とは別枠で、取得の古い順。 */
```

<!-- source: src/lib/api/types.ts:834 -->

### [src/lib/api/types.ts:834](../../../src/lib/api/types.ts#L834)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 本日ぶんの未受領の記念日。自分のコレクションを見ているときだけ返る。 */
```

<!-- source: src/lib/api/types.ts:836 -->

### [src/lib/api/types.ts:836](../../../src/lib/api/types.ts#L836)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * まだ PDS に控えを書いていないドロー。自分のコレクションを見ているときだけ返る。
	 *
	 * ドローは AppView 側で先に確定するので、そのあとの createRecord が失敗すると控えだけが
	 * 欠ける（オフライン、PDS 落ち、アプリを閉じた）。正しさではなく遅延の問題なので、
	 * 次に開いたときにここを順に書けばよい。過去ぶんもここから埋まる。
	 */
```

<!-- source: src/lib/api/types.ts:845 -->

### [src/lib/api/types.ts:845](../../../src/lib/api/types.ts#L845)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 控えがまだ無いドロー1件。 */
```

<!-- source: src/lib/api/types.ts:855 -->

### [src/lib/api/types.ts:855](../../../src/lib/api/types.ts#L855)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** true ならその枠は引き済みで、返っているのはその枠のカード。 */
```

<!-- source: src/lib/api/types.ts:858 -->

### [src/lib/api/types.ts:858](../../../src/lib/api/types.ts#L858)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** true の間は botたんコメントを生成中。getCards で取り直す。 */
```

<!-- source: src/lib/api/types.ts:861 -->

### [src/lib/api/types.ts:861](../../../src/lib/api/types.ts#L861)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * この1枚を引いた日（JST 4:00 始まりの "YYYY-MM-DD"）。PDS へ控えを書くときの rkey に使う。
	 * 日付境界の計算をクライアントに二重定義しないよう、サーバが返したものをそのまま使う。
	 */
```

<!-- source: src/lib/api/types.ts:866 -->

### [src/lib/api/types.ts:866](../../../src/lib/api/types.ts#L866)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * source=anniversary のみ。同じ日に複数の記念日が重なることがあるので、今回受け取った
	 * ぶんを全部返す。card はこの先頭と同じ。
	 */
```

<!-- source: src/lib/api/types.ts:873 -->

### [src/lib/api/types.ts:873](../../../src/lib/api/types.ts#L873)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 通常カードと同じ JST 4:00 境界。これを越えたローカル結果は破棄する。 */
```

<!-- source: src/lib/api/types.ts:877 -->

### [src/lib/api/types.ts:877](../../../src/lib/api/types.ts#L877)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ゼンカツ！（1日1回、お題に手持ちのカード1〜3枚で答える遊び）
```

<!-- source: src/lib/api/types.ts:879 -->

### [src/lib/api/types.ts:879](../../../src/lib/api/types.ts#L879)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** その日のお題。初回アクセス時に確定し、以後は動かない。 */
```

<!-- source: src/lib/api/types.ts:886 -->

### [src/lib/api/types.ts:886](../../../src/lib/api/types.ts#L886)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 追い風の属性。その日「噛み合う」札を決める主軸。 */
```

<!-- source: src/lib/api/types.ts:888 -->

### [src/lib/api/types.ts:888](../../../src/lib/api/types.ts#L888)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 追い風の種族（任意）。持っていない人が出るので副次的な扱い。 */
```

<!-- source: src/lib/api/types.ts:892 -->

### [src/lib/api/types.ts:892](../../../src/lib/api/types.ts#L892)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 記録に出す1件。**スコアも順位も含まない**（全肯定なので勝敗を作らない）。
 * 出した札と botたんの総評だけ。
 */
```

<!-- source: src/lib/api/types.ts:903 -->

### [src/lib/api/types.ts:903](../../../src/lib/api/types.ts#L903)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** true の間は総評を生成中。取り直すと入る。 */
```

<!-- source: src/lib/api/types.ts:905 -->

### [src/lib/api/types.ts:905](../../../src/lib/api/types.ts#L905)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * 作者の意図。モデレーション判定が済んだものだけが来る。
	 * 他人の解釈を先に見せないよう、最初は畳んで出す。
	 */
```

<!-- source: src/lib/api/types.ts:910 -->

### [src/lib/api/types.ts:910](../../../src/lib/api/types.ts#L910)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** note の言語（レコードの langs）。投稿の langs と同じく翻訳の要否に使う。 */
```

<!-- source: src/lib/api/types.ts:912 -->

### [src/lib/api/types.ts:912](../../../src/lib/api/types.ts#L912)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** その日の追い風に乗っていた枚数。**得点ではない**（得点は隠しで表示しない）。 */
```

<!-- source: src/lib/api/types.ts:914 -->

### [src/lib/api/types.ts:914](../../../src/lib/api/types.ts#L914)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 成立したコンボ。成立したものだけがサーバから来る（未発見のぶんは送られない）。 */
```

<!-- source: src/lib/api/types.ts:916 -->

### [src/lib/api/types.ts:916](../../../src/lib/api/types.ts#L916)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * 提出レコードに付いたリアクション。
	 * subject は本人の repo にある `com.suibari.nagi.zenkatsu` そのものなので、
	 * 投稿・ニュースとまったく同じ経路で付く。AppView 未更新でも落ちないよう任意。
	 */
```

<!-- source: src/lib/api/types.ts:925 -->

### [src/lib/api/types.ts:925](../../../src/lib/api/types.ts#L925)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 記録に出す、成立したコンボの要約。 */
```

<!-- source: src/lib/api/types.ts:934 -->

### [src/lib/api/types.ts:934](../../../src/lib/api/types.ts#L934)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 今日出せる札1種。 */
```

<!-- source: src/lib/api/types.ts:938 -->

### [src/lib/api/types.ts:938](../../../src/lib/api/types.ts#L938)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 在庫のうち、今日出せる枚数。0 なら全部クールダウン中。 */
```

<!-- source: src/lib/api/types.ts:940 -->

### [src/lib/api/types.ts:940](../../../src/lib/api/types.ts#L940)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** available が 0 のとき、いちばん早く戻る1枚があと何日でおきるか。 */
```

<!-- source: src/lib/api/types.ts:947 -->

### [src/lib/api/types.ts:947](../../../src/lib/api/types.ts#L947)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 1回に出せる最大枚数。**下限は無い**（1枚でもよい）。 */
```

<!-- source: src/lib/api/types.ts:956 -->

### [src/lib/api/types.ts:956](../../../src/lib/api/types.ts#L956)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** ニュース1件。レアドローとゼンカツのハイライトが同じ列に並ぶ。 */
```

<!-- source: src/lib/api/types.ts:960 -->

### [src/lib/api/types.ts:960](../../../src/lib/api/types.ts#L960)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * `comboFound` は「そのコンボを世界で最初に成立させた回」。
	 * ゼンカツの回であることは `zenkatsu` と同じなので中身の作りは変わらず、
	 * **見出しだけが変わる**。サーバは同じ提出を `zenkatsu` としては返さない
	 * （同じ uri の項目が2つ並ぶと一覧のキーが重複する）。
	 */
```

<!-- source: src/lib/api/types.ts:975 -->

### [src/lib/api/types.ts:975](../../../src/lib/api/types.ts#L975)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** type=zenkatsu のとき。作者の意図（判定済みのものだけ）。 */
```

<!-- source: src/lib/api/types.ts:977 -->

### [src/lib/api/types.ts:977](../../../src/lib/api/types.ts#L977)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** type=zenkatsu のとき。note の言語。 */
```

<!-- source: src/lib/api/types.ts:979 -->

### [src/lib/api/types.ts:979](../../../src/lib/api/types.ts#L979)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * type=zenkatsu のとき。成立したコンボ。
	 * ニュースに出すのは、**攻略がコミュニティに伝わる道**にするため。
	 * 未成立のぶんはサーバから送られないので、これで定義が漏れることはない。
	 */
```

<!-- source: src/lib/api/types.ts:985 -->

### [src/lib/api/types.ts:985](../../../src/lib/api/types.ts#L985)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * type=comboFound のとき。`combos` のうち、**この回が世界初だったぶんだけ**。
	 * 索引した時点のスナップショットなので、発見者が後からレコードを消しても
	 * マイデッキ側の pioneer 判定（最古の未削除提出）とずれることがある。
	 */
```

<!-- source: src/lib/api/types.ts:991 -->

### [src/lib/api/types.ts:991](../../../src/lib/api/types.ts#L991)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** type=zenkatsu のとき。追い風に乗っていた枚数。**得点ではない。** */
```

<!-- source: src/lib/api/types.ts:993 -->

### [src/lib/api/types.ts:993](../../../src/lib/api/types.ts#L993)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** ニュース項目に付いたリアクション。subject は uri/cid の実レコード。 */
```

<!-- source: src/lib/api/types.ts:1001 -->

### [src/lib/api/types.ts:1001](../../../src/lib/api/types.ts#L1001)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** マイデッキに出す、成立させたことのあるコンボ1件。 */
```

<!-- source: src/lib/api/types.ts:1009 -->

### [src/lib/api/types.ts:1009](../../../src/lib/api/types.ts#L1009)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** スロットごとの構成札。1スロットに複数あるのは「どちらでもよい」という意味。 */
```

<!-- source: src/lib/api/types.ts:1012 -->

### [src/lib/api/types.ts:1012](../../../src/lib/api/types.ts#L1012)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 世界で最初に見つけた人。 */
```

<!-- source: src/lib/api/types.ts:1025 -->

### [src/lib/api/types.ts:1025](../../../src/lib/api/types.ts#L1025)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * まだ出していないコンボの伏せ札。名前も構成札も伏せ、手がかりだけ届く。
 * 謎かけは世界で誰かが見つけたあとにだけ入る。
 */
```

<!-- source: src/lib/api/types.ts:1032 -->

### [src/lib/api/types.ts:1032](../../../src/lib/api/types.ts#L1032)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 必要な枚数（スロット数）。 */
```

<!-- source: src/lib/api/types.ts:1034 -->

### [src/lib/api/types.ts:1034](../../../src/lib/api/types.ts#L1034)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 世界で誰かがもう見つけているか。 */
```

<!-- source: src/lib/api/types.ts:1040 -->

### [src/lib/api/types.ts:1040](../../../src/lib/api/types.ts#L1040)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 存在するコンボの総数。未発見のぶんは中身を伏せる。 */
```

<!-- source: src/lib/api/types.ts:1043 -->

### [src/lib/api/types.ts:1043](../../../src/lib/api/types.ts#L1043)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 未発見ぶんの伏せ札。図鑑番号順。伏せ札を返さない古い AppView では無い。 */
```

<!-- source: src/lib/api/types.ts:1048 -->

### [src/lib/api/types.ts:1048](../../../src/lib/api/types.ts#L1048)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** botたんに頼んだ絵文字の生成。候補は透過 PNG の data URL で、1日で消える。 */
```

<!-- source: src/lib/api/types.ts:1052 -->

### [src/lib/api/types.ts:1052](../../../src/lib/api/types.ts#L1052)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 絵文字に書く文字（botたんの解釈）。 */
```

<!-- source: src/lib/api/types.ts:1054 -->

### [src/lib/api/types.ts:1054](../../../src/lib/api/types.ts#L1054)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 登録名と説明の案（botたんが付ける）。そのまま登録に使う。絵文字名は重複してよい。 */
```

<!-- source: src/lib/api/types.ts:1059 -->

### [src/lib/api/types.ts:1059](../../../src/lib/api/types.ts#L1059)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** queued のときだけ。自分より前にある依頼の数。 */
```

<!-- source: src/lib/api/types.ts:1069 -->

### [src/lib/api/types.ts:1069](../../../src/lib/api/types.ts#L1069)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * アドベントカレンダーのカード1枚（nagi-lexicon の AdventCardView と対）。
 * 選んだ時点の見出しと一言を持ち、元のポストが後から消えても変わらない。
 */
```

<!-- source: src/lib/api/types.ts:1075 -->

### [src/lib/api/types.ts:1075](../../../src/lib/api/types.ts#L1075)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 1〜25。 */
```

<!-- source: src/lib/api/types.ts:1078 -->

### [src/lib/api/types.ts:1078](../../../src/lib/api/types.ts#L1078)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 元のポスト。消えていれば付かない。 */
```

<!-- source: src/lib/api/types.ts:1088 -->

### [src/lib/api/types.ts:1088](../../../src/lib/api/types.ts#L1088)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 公開済みの最新の日（0 = まだ開いていない）。 */
```

<!-- source: src/lib/api/types.ts:1090 -->

### [src/lib/api/types.ts:1090](../../../src/lib/api/types.ts#L1090)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 次の日が開く時刻。12/25 が開いたあとは付かない。 */
```

<!-- source: src/lib/api/types.ts:1097 -->

### [src/lib/api/types.ts:1097](../../../src/lib/api/types.ts#L1097)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 開封演出を見終えた自分のカードの日。 */
```

## src/lib/api/useTypeaheadSearch.svelte.ts

<!-- source: src/lib/api/useTypeaheadSearch.svelte.ts:3 -->

### [src/lib/api/useTypeaheadSearch.svelte.ts:3](../../../src/lib/api/useTypeaheadSearch.svelte.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 連続入力をまとめる待ち時間。 */
```

<!-- source: src/lib/api/useTypeaheadSearch.svelte.ts:5 -->

### [src/lib/api/useTypeaheadSearch.svelte.ts:5](../../../src/lib/api/useTypeaheadSearch.svelte.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 最初の1文字だけ即時検索する。 */
```

<!-- source: src/lib/api/useTypeaheadSearch.svelte.ts:7 -->

### [src/lib/api/useTypeaheadSearch.svelte.ts:7](../../../src/lib/api/useTypeaheadSearch.svelte.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * 応答待ちの間、前回結果を絞り込んで見せるための判定（stale-narrowing）。
	 * 与えないと打鍵のたびにリストが空になって出直すため、候補がちらつく。
	 */
```

<!-- source: src/lib/api/useTypeaheadSearch.svelte.ts:12 -->

### [src/lib/api/useTypeaheadSearch.svelte.ts:12](../../../src/lib/api/useTypeaheadSearch.svelte.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** クエリ結果キャッシュの保持件数。 */
```

<!-- source: src/lib/api/useTypeaheadSearch.svelte.ts:18 -->

### [src/lib/api/useTypeaheadSearch.svelte.ts:18](../../../src/lib/api/useTypeaheadSearch.svelte.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 候補サジェスト（@メンション / #タグ / :絵文字）のフェッチ・デバウンス・レース制御を
 * まとめた runes ファクトリ。検索関数を注入できるので、メンション・タグ（Nagi AppView）・
 * ログイン画面（公開 Bsky AppView）で同じロジックを使い回せる。
 * activeIndex やキーボード操作はホスト固有なので持たせない。
 *
 * 体感速度のための仕掛けは3つ:
 * - 直近クエリの結果をメモリに持ち、打ち直し/バックスペースはリクエスト無しで即描画する。
 *   ログイン中の候補取得は PDS プロキシ経由（DPoP 付き）で HTTP キャッシュが当てにならず、
 *   ここが実質の主キャッシュになる。
 * - 前クエリの前方一致拡張なら、応答待ちの間は前回結果を絞って見せる（matches）。
 * - 新しい打鍵で前のリクエストを abort し、往復を無駄に重ねない。
 */
```

<!-- source: src/lib/api/useTypeaheadSearch.svelte.ts:38 -->

### [src/lib/api/useTypeaheadSearch.svelte.ts:38](../../../src/lib/api/useTypeaheadSearch.svelte.ts#L38)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 現在 items に映っている結果のクエリ。stale-narrowing の起点。 */
```

<!-- source: src/lib/api/useTypeaheadSearch.svelte.ts:47 -->

### [src/lib/api/useTypeaheadSearch.svelte.ts:47](../../../src/lib/api/useTypeaheadSearch.svelte.ts#L47)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// Map は挿入順なので、あふれたら最古から捨てる。
```

<!-- source: src/lib/api/useTypeaheadSearch.svelte.ts:70 -->

### [src/lib/api/useTypeaheadSearch.svelte.ts:70](../../../src/lib/api/useTypeaheadSearch.svelte.ts#L70)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 前のクエリを伸ばした入力なら、応答が来るまで前回結果を絞って見せる。
```

<!-- source: src/lib/api/useTypeaheadSearch.svelte.ts:89 -->

### [src/lib/api/useTypeaheadSearch.svelte.ts:89](../../../src/lib/api/useTypeaheadSearch.svelte.ts#L89)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// abort は後続の検索が状態を持っているので、ここでは何も触らない。
```

<!-- source: src/lib/api/useTypeaheadSearch.svelte.ts:107 -->

### [src/lib/api/useTypeaheadSearch.svelte.ts:107](../../../src/lib/api/useTypeaheadSearch.svelte.ts#L107)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// キャッシュは残す。同じ Composer で候補を開き直したときに即出したい。
```

## src/lib/atproto/appLinks.ts

<!-- source: src/lib/atproto/appLinks.ts:1 -->

### [src/lib/atproto/appLinks.ts:1](../../../src/lib/atproto/appLinks.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 任意 Atmosphere アプリ連携。プロフィール所有者本人が「どの collection の・どのキーを出すか」を
 * 自分の PDS の com.suibari.nagi.appLinks（rkey=self）に curate する。表示側は対象 DID の PDS を
 * 直読みして描画する（バックエンド非依存）。
 *
 * 描画の役割（値/日時/リンク/画像）はレコードの実値から自動判別するので、ユーザーが設定するのは
 * 「どのフィールドを表示するか」だけ。設定は表示するキーパスの宣言のみを保存する。
 */
```

<!-- source: src/lib/atproto/appLinks.ts:19 -->

### [src/lib/atproto/appLinks.ts:19](../../../src/lib/atproto/appLinks.ts#L19)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 保存する連携設定。fields は「表示するキーパス」の宣言のみ。 */
```

<!-- source: src/lib/atproto/appLinks.ts:25 -->

### [src/lib/atproto/appLinks.ts:25](../../../src/lib/atproto/appLinks.ts#L25)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * 1レコード内で、このキーパスが指す配列の各要素を1行として展開する（例 "cards"）。
	 * 省略時は単一表示。指定時、fields の path は配列の各要素からの相対パスになる。
	 */
```

<!-- source: src/lib/atproto/appLinks.ts:36 -->

### [src/lib/atproto/appLinks.ts:36](../../../src/lib/atproto/appLinks.ts#L36)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** repeat 配列を展開して並べるときの最大件数。 */
```

<!-- source: src/lib/atproto/appLinks.ts:45 -->

### [src/lib/atproto/appLinks.ts:45](../../../src/lib/atproto/appLinks.ts#L45)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// discovery の候補から除外する既知コレクション（Bluesky / Nagi / Bluemoji）。
```

<!-- source: src/lib/atproto/appLinks.ts:74 -->

### [src/lib/atproto/appLinks.ts:74](../../../src/lib/atproto/appLinks.ts#L74)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 自分の連携設定を読む。未設定なら空配列。 */
```

<!-- source: src/lib/atproto/appLinks.ts:91 -->

### [src/lib/atproto/appLinks.ts:91](../../../src/lib/atproto/appLinks.ts#L91)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 自分の連携設定を保存する。 */
```

<!-- source: src/lib/atproto/appLinks.ts:107 -->

### [src/lib/atproto/appLinks.ts:107](../../../src/lib/atproto/appLinks.ts#L107)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 自分の repo にある collection の一覧（既知の bsky/nagi を除外）。連携先の候補サジェスト用。 */
```

<!-- source: src/lib/atproto/appLinks.ts:115 -->

### [src/lib/atproto/appLinks.ts:115](../../../src/lib/atproto/appLinks.ts#L115)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 自分の repo の指定 collection の最新1件を取得（設定画面のプレビュー用）。 */
```

<!-- source: src/lib/atproto/appLinks.ts:129 -->

### [src/lib/atproto/appLinks.ts:129](../../../src/lib/atproto/appLinks.ts#L129)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 自分の PDS ベース URL（blob URL 生成用）。 */
```

<!-- source: src/lib/atproto/appLinks.ts:134 -->

### [src/lib/atproto/appLinks.ts:134](../../../src/lib/atproto/appLinks.ts#L134)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ---- 値からの役割判別・整形 -------------------------------------------------
```

<!-- source: src/lib/atproto/appLinks.ts:149 -->

### [src/lib/atproto/appLinks.ts:149](../../../src/lib/atproto/appLinks.ts#L149)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * blob の CID 文字列を取り出す。生JSON表現（listRecords の raw fetch）は ref.$link、
 * @atproto/api の Agent 経由では ref が CID インスタンス（toString で CID 文字列）になる。両対応。
 */
```

<!-- source: src/lib/atproto/appLinks.ts:168 -->

### [src/lib/atproto/appLinks.ts:168](../../../src/lib/atproto/appLinks.ts#L168)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** キーパスと実値から描画役割を判別する。表示できない型は null。 */
```

<!-- source: src/lib/atproto/appLinks.ts:190 -->

### [src/lib/atproto/appLinks.ts:190](../../../src/lib/atproto/appLinks.ts#L190)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** flatten キーパスで値を取り出す。"a.b[0].c" 形式に対応。 */
```

<!-- source: src/lib/atproto/appLinks.ts:203 -->

### [src/lib/atproto/appLinks.ts:203](../../../src/lib/atproto/appLinks.ts#L203)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ---- レコードの走査（設定画面のフィールド候補） ----------------------------
```

<!-- source: src/lib/atproto/appLinks.ts:207 -->

### [src/lib/atproto/appLinks.ts:207](../../../src/lib/atproto/appLinks.ts#L207)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** レコード本体を再帰的に走査し、表示可能なリーフ（役割付き）の一覧を返す。配列は先頭のみ。 */
```

<!-- source: src/lib/atproto/appLinks.ts:232 -->

### [src/lib/atproto/appLinks.ts:232](../../../src/lib/atproto/appLinks.ts#L232)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** repeat 展開の候補になる配列（要素がプレーンオブジェクトの配列）。 */
```

<!-- source: src/lib/atproto/appLinks.ts:239 -->

### [src/lib/atproto/appLinks.ts:239](../../../src/lib/atproto/appLinks.ts#L239)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * レコードを浅く走査し、repeat 展開に使える「要素がオブジェクトの配列」を候補として集める。
 * Linkat の cards のようなリスト型フィールドを検出する用途。表示可能なリーフが多い順に並べる。
 */
```

<!-- source: src/lib/atproto/appLinks.ts:265 -->

### [src/lib/atproto/appLinks.ts:265](../../../src/lib/atproto/appLinks.ts#L265)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** サンプル値の短い表示文字列。 */
```

<!-- source: src/lib/atproto/appLinks.ts:272 -->

### [src/lib/atproto/appLinks.ts:272](../../../src/lib/atproto/appLinks.ts#L272)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 初期選択するコアフィールドのパス集合: 画像blob・代表テキスト1つ・~At日時。
 * 代表テキストは createdAt 等を除いた最初の value 文字列。
 */
```

<!-- source: src/lib/atproto/appLinks.ts:292 -->

### [src/lib/atproto/appLinks.ts:292](../../../src/lib/atproto/appLinks.ts#L292)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ---- 表示用ビューの構築（プロフィール・設定プレビュー共通） ----------------
```

<!-- source: src/lib/atproto/appLinks.ts:295 -->

### [src/lib/atproto/appLinks.ts:295](../../../src/lib/atproto/appLinks.ts#L295)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 1レコード（または repeat 展開時の1要素）分の表示内容。 */
```

<!-- source: src/lib/atproto/appLinks.ts:302 -->

### [src/lib/atproto/appLinks.ts:302](../../../src/lib/atproto/appLinks.ts#L302)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 単一表示なら1件、repeat 展開なら配列要素ごとに1件。 */
```

<!-- source: src/lib/atproto/appLinks.ts:306 -->

### [src/lib/atproto/appLinks.ts:306](../../../src/lib/atproto/appLinks.ts#L306)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** fields 宣言＋1レコード（または1要素）から表示内容を組む。画像は getBlob URL にする。 */
```

<!-- source: src/lib/atproto/appLinks.ts:330 -->

### [src/lib/atproto/appLinks.ts:330](../../../src/lib/atproto/appLinks.ts#L330)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 1連携の設定＋実レコードから表示用ビューを組み立てる。
 * link.repeat があれば、その配列の各要素を1件として展開する（fields は要素相対パス）。
 */
```

<!-- source: src/lib/atproto/appLinks.ts:361 -->

### [src/lib/atproto/appLinks.ts:361](../../../src/lib/atproto/appLinks.ts#L361)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** appUri から favicon を解決する。失敗時は undefined。 */
```

<!-- source: src/lib/atproto/appLinks.ts:370 -->

### [src/lib/atproto/appLinks.ts:370](../../../src/lib/atproto/appLinks.ts#L370)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * NSID から アプリの Web サイト URL を推定する（favicon の取得元／カードのリンク先）。
 * lexicon の authority は深いサブドメインになりがちで favicon を持たないことが多いので、
 * 登録可能ドメイン（先頭2セグメントを逆順）を使う。例: fm.teal.alpha.feed.play → https://teal.fm 。
 */
```

<!-- source: src/lib/atproto/appLinks.ts:381 -->

### [src/lib/atproto/appLinks.ts:381](../../../src/lib/atproto/appLinks.ts#L381)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 対象 DID のプロフィールに表示する連携カードを構築する。config と対象レコードを対象 DID の
 * PDS から直読みして組み立てる。1連携の取得失敗は握りつぶして他を出す。
 */
```

<!-- source: src/lib/atproto/appLinks.ts:398 -->

### [src/lib/atproto/appLinks.ts:398](../../../src/lib/atproto/appLinks.ts#L398)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// repeat 配列が空など、表示すべき中身が無いカードは出さない。
```

## src/lib/atproto/bluemoji.ts

<!-- source: src/lib/atproto/bluemoji.ts:8 -->

### [src/lib/atproto/bluemoji.ts:8](../../../src/lib/atproto/bluemoji.ts#L8)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** Bluemoji の絵文字定義レコード。カスタム絵文字はユーザー自身の PDS に置く。 */
```

<!-- source: src/lib/atproto/bluemoji.ts:10 -->

### [src/lib/atproto/bluemoji.ts:10](../../../src/lib/atproto/bluemoji.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** Nagi で作成した Bluemoji を識別する、同じ rkey のサイドカーレコード。 */
```

<!-- source: src/lib/atproto/bluemoji.ts:12 -->

### [src/lib/atproto/bluemoji.ts:12](../../../src/lib/atproto/bluemoji.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** ラスタ形式は長辺 128px。1 ページに多数並ぶため blob も小さく保つ。 */
```

<!-- source: src/lib/atproto/bluemoji.ts:20 -->

### [src/lib/atproto/bluemoji.ts:20](../../../src/lib/atproto/bluemoji.ts#L20)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 入力形式は Bluemoji の保存形式とは独立させる。
```

<!-- source: src/lib/atproto/bluemoji.ts:41 -->

### [src/lib/atproto/bluemoji.ts:41](../../../src/lib/atproto/bluemoji.ts#L41)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** blob の mimeType と formats_v0 のフィールド名の対応。 */
```

<!-- source: src/lib/atproto/bluemoji.ts:49 -->

### [src/lib/atproto/bluemoji.ts:49](../../../src/lib/atproto/bluemoji.ts#L49)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 絵文字名を rkey にすると、同名の旧形式レコードが PDS に残っている場合に create が
 * 衝突する。Bluemoji は key:any なので、名前とは独立した十分にランダムなキーを使う。
 */
```

<!-- source: src/lib/atproto/bluemoji.ts:92 -->

### [src/lib/atproto/bluemoji.ts:92](../../../src/lib/atproto/bluemoji.ts#L92)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// Files 経由など MIME が空／汎用になる場合だけ拡張子で補う。
```

<!-- source: src/lib/atproto/bluemoji.ts:108 -->

### [src/lib/atproto/bluemoji.ts:108](../../../src/lib/atproto/bluemoji.ts#L108)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// プレビューと登録で同じ変換結果を使い、HEICを二重にデコードしない。
```

<!-- source: src/lib/atproto/bluemoji.ts:113 -->

### [src/lib/atproto/bluemoji.ts:113](../../../src/lib/atproto/bluemoji.ts#L113)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// まとめて選択した高解像度写真を同時展開しない。
```

<!-- source: src/lib/atproto/bluemoji.ts:141 -->

### [src/lib/atproto/bluemoji.ts:141](../../../src/lib/atproto/bluemoji.ts#L141)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 絵文字用に画像を整える。アルファチャンネルは canvas も WebP も保持するので、
 * 透過PNGは透過のまま扱える。アニメーション（GIF/APNG）は canvas を通すと 1 コマ目に
 * 潰れてしまうので再エンコードせず、サイズ超過なら拒否する。
 */
```

<!-- source: src/lib/atproto/bluemoji.ts:165 -->

### [src/lib/atproto/bluemoji.ts:165](../../../src/lib/atproto/bluemoji.ts#L165)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// すでに 128px 以下で軽いなら再エンコードしない。非可逆WebPは透過の輪郭に
	// にじみが出ることがあるので、元のPNG/WebPをそのまま使えるならその方がきれい。
```

<!-- source: src/lib/atproto/bluemoji.ts:388 -->

### [src/lib/atproto/bluemoji.ts:388](../../../src/lib/atproto/bluemoji.ts#L388)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 本人PDSを優先し、使い切った後だけAppViewから他ユーザー分を取得する。 */
```

<!-- source: src/lib/atproto/bluemoji.ts:432 -->

### [src/lib/atproto/bluemoji.ts:432](../../../src/lib/atproto/bluemoji.ts#L432)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 本人PDSの絵文字はAppView障害や429から独立して利用できるようにする。
```

<!-- source: src/lib/atproto/bluemoji.ts:443 -->

### [src/lib/atproto/bluemoji.ts:443](../../../src/lib/atproto/bluemoji.ts#L443)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 同じ操作の再試行では rkey を保持する。応答だけ失われても別の絵文字を作らない。
```

<!-- source: src/lib/atproto/bluemoji.ts:464 -->

### [src/lib/atproto/bluemoji.ts:464](../../../src/lib/atproto/bluemoji.ts#L464)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * options.aiGenerated は botたん（画像生成）が描いた絵文字。投稿と同じ ai-generated セルフラベルを付ける
 * （blue.moji.collection.item の labels）。
 */
```

<!-- source: src/lib/atproto/bluemoji.ts:547 -->

### [src/lib/atproto/bluemoji.ts:547](../../../src/lib/atproto/bluemoji.ts#L547)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// applyWrites は原子的。本体とサイドカーが揃っていれば保存自体は成功している。
```

<!-- source: src/lib/atproto/bluemoji.ts:572 -->

### [src/lib/atproto/bluemoji.ts:572](../../../src/lib/atproto/bluemoji.ts#L572)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 前回、本体削除後にサイドカーの削除だけ失敗した場合も再試行できるようにする。
```

<!-- source: src/lib/atproto/bluemoji.ts:582 -->

### [src/lib/atproto/bluemoji.ts:582](../../../src/lib/atproto/bluemoji.ts#L582)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 他アプリ作成分と導入前の Nagi 作成分にはサイドカーがない。
```

<!-- source: src/lib/atproto/bluemoji.ts:588 -->

### [src/lib/atproto/bluemoji.ts:588](../../../src/lib/atproto/bluemoji.ts#L588)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** リアクションレコードに載せる参照。formats は AppView がインデックスから補う。 */
```

## src/lib/atproto/cid.test.ts

<!-- source: src/lib/atproto/cid.test.ts:6 -->

### [src/lib/atproto/cid.test.ts:6](../../../src/lib/atproto/cid.test.ts#L6)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 空バイト列の raw CID（よく知られた値）。
```

## src/lib/atproto/cid.ts

<!-- source: src/lib/atproto/cid.ts:3 -->

### [src/lib/atproto/cid.ts:3](../../../src/lib/atproto/cid.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** RFC 4648 の base32（小文字・パディング無し）。multibase の 'b'。 */
```

<!-- source: src/lib/atproto/cid.ts:20 -->

### [src/lib/atproto/cid.ts:20](../../../src/lib/atproto/cid.ts#L20)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * blob の CID を手元で計算する。atproto の blob は CIDv1・raw コーデック（0x55）・
 * sha2-256 で、PDS の uploadBlob が返す ref と同じ値になる。
 * 記事本文に画像の URL を書くには CID が要るが、アップロードは投稿時まで遅らせたい
 * （下書きのまま放置すると、参照の無い blob は PDS に消される）ので、先に計算する。
 */
```

## src/lib/atproto/contentWarning.test.ts

<!-- source: src/lib/atproto/contentWarning.test.ts:54 -->

### [src/lib/atproto/contentWarning.test.ts:54](../../../src/lib/atproto/contentWarning.test.ts#L54)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 「未入力」は入力途中でもありうるので、構文チェックだけは通す。
```

<!-- source: src/lib/atproto/contentWarning.test.ts:86 -->

### [src/lib/atproto/contentWarning.test.ts:86](../../../src/lib/atproto/contentWarning.test.ts#L86)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// CW は1組しか持てないので、別範囲を選んだら既存を外して付け替える。
```

<!-- source: src/lib/atproto/contentWarning.test.ts:102 -->

### [src/lib/atproto/contentWarning.test.ts:102](../../../src/lib/atproto/contentWarning.test.ts#L102)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 元の facet は '||隠す|| ' の後ろから始まる。表示では '||' 2組ぶん詰まる。
```

## src/lib/atproto/contentWarning.ts

<!-- source: src/lib/atproto/contentWarning.ts:61 -->

### [src/lib/atproto/contentWarning.ts:61](../../../src/lib/atproto/contentWarning.ts#L61)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 選択範囲を || で囲む。既存CW内を選んだ場合は解除し、別範囲なら既存の1組を移動する。
 */
```

<!-- source: src/lib/atproto/contentWarning.ts:98 -->

### [src/lib/atproto/contentWarning.ts:98](../../../src/lib/atproto/contentWarning.ts#L98)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * CWボタンによる区切りの追加・削除・移動後も、メンションなどの選択範囲を保持する。
 * 開始位置は直前への挿入に追従し、終了位置は直後への挿入を範囲に含めない。
 */
```

<!-- source: src/lib/atproto/contentWarning.ts:131 -->

### [src/lib/atproto/contentWarning.ts:131](../../../src/lib/atproto/contentWarning.ts#L131)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 表示用に || を除き、facet のUTF-8範囲も4バイト分補正する。
 */
```

<!-- source: src/lib/atproto/contentWarning.ts:161 -->

### [src/lib/atproto/contentWarning.ts:161](../../../src/lib/atproto/contentWarning.ts#L161)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 区切りだけを指すfacetは表示文字が残らないため捨てる。
```

## src/lib/atproto/facets.test.ts

<!-- source: src/lib/atproto/facets.test.ts:5 -->

### [src/lib/atproto/facets.test.ts:5](../../../src/lib/atproto/facets.test.ts#L5)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** facet の index は UTF-8 バイト。テストの意図を「何バイト目か」で書けるようにする。 */
```

<!-- source: src/lib/atproto/facets.test.ts:20 -->

### [src/lib/atproto/facets.test.ts:20](../../../src/lib/atproto/facets.test.ts#L20)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// URL の正規化でオリジンだけの URL には末尾スラッシュが付く。
```

<!-- source: src/lib/atproto/facets.test.ts:33 -->

### [src/lib/atproto/facets.test.ts:33](../../../src/lib/atproto/facets.test.ts#L33)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 'こんにちは ' は 3バイト×5 + 半角空白。
```

<!-- source: src/lib/atproto/facets.test.ts:61 -->

### [src/lib/atproto/facets.test.ts:61](../../../src/lib/atproto/facets.test.ts#L61)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 本文からは記法が消え、ラベルだけが残る。
```

<!-- source: src/lib/atproto/facets.test.ts:152 -->

### [src/lib/atproto/facets.test.ts:152](../../../src/lib/atproto/facets.test.ts#L152)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 選択後にハンドルを打ち替えた状況。位置だけで facet を作ると別人を指してしまう。
```

## src/lib/atproto/facets.ts

<!-- source: src/lib/atproto/facets.ts:3 -->

### [src/lib/atproto/facets.ts:3](../../../src/lib/atproto/facets.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 本文に置く1行の画像。URL は http(s) に限る（javascript: などを描画側へ渡さない）。 */
```

<!-- source: src/lib/atproto/facets.ts:34 -->

### [src/lib/atproto/facets.ts:34](../../../src/lib/atproto/facets.ts#L34)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** sourceIndex[i] は text[i] が入力のどの位置から来たか。入力欄の装飾で記法の文字を見分けるのに使う。 */
```

<!-- source: src/lib/atproto/facets.ts:39 -->

### [src/lib/atproto/facets.ts:39](../../../src/lib/atproto/facets.ts#L39)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** Markdown リンクを除いた、自動リンクカードの候補。 */
```

<!-- source: src/lib/atproto/facets.ts:56 -->

### [src/lib/atproto/facets.ts:56](../../../src/lib/atproto/facets.ts#L56)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// Bluesky detectFacets のタグ本体クラス: 先頭のゼロ幅系を除外し、数字のみのタグを弾く。
```

<!-- source: src/lib/atproto/facets.ts:77 -->

### [src/lib/atproto/facets.ts:77](../../../src/lib/atproto/facets.ts#L77)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 行が URL だけで出来ていれば、その URL（リンクカードの照合キー）を返す。
 * 記事本文で「その位置にリンクカードを置く」書き方として使う。
 * 末尾の句読点を落とさないと URL にならない行は文の一部とみなし、カードにしない。
 * 返す URL は parsePostText の cardUrls と同じ正規化なので、カードの uri とそのまま照合できる。
 */
```

<!-- source: src/lib/atproto/facets.ts:89 -->

### [src/lib/atproto/facets.ts:89](../../../src/lib/atproto/facets.ts#L89)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 保存済み本文と facet を Composer が再解釈できる編集入力へ戻す。
 * facet の位置は UTF-8 バイト単位なので、文字列へ戻しながら mention の文字位置を組み直す。
 * 名前付きリンクは保存時に Markdown 記法が本文から除かれるため、[label](url) へ復元する。
 */
```

<!-- source: src/lib/atproto/facets.ts:143 -->

### [src/lib/atproto/facets.ts:143](../../../src/lib/atproto/facets.ts#L143)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 壊れたバイト境界の facet は復元対象にせず、本文をそのまま残す。
```

<!-- source: src/lib/atproto/facets.ts:222 -->

### [src/lib/atproto/facets.ts:222](../../../src/lib/atproto/facets.ts#L222)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 入力の from 以降の連続した文字列をそのまま本文へ写す。 */
```

<!-- source: src/lib/atproto/facets.ts:310 -->

### [src/lib/atproto/facets.ts:310](../../../src/lib/atproto/facets.ts#L310)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// Bluesky の detectFacets に倣う: # の後ろが数字のみ/ゼロ幅は不可、末尾の
			// 句読点は tag から除く。tag 値は原文ケースを保持し、小文字化は保存/URL 側で行う。
```

<!-- source: src/lib/atproto/facets.ts:333 -->

### [src/lib/atproto/facets.ts:333](../../../src/lib/atproto/facets.ts#L333)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 1行だけの画像（記事本文の `![alt](https://…)`）は名前付きリンクにせず、
			// 記法のまま本文へ残す。描画側（parseRichText）が画像ブロックとして読む。
```

## src/lib/atproto/handle.ts

<!-- source: src/lib/atproto/handle.ts:1 -->

### [src/lib/atproto/handle.ts:1](../../../src/lib/atproto/handle.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 先頭の @ / 全角＠(U+FF20) を除去し、前後空白を落とし小文字化する。
// handle は大小文字を区別しないので lower 正規化は安全。ユーザーが
// `@yourname.bsky.social` のように入力しても解決できるようにする。
```

## src/lib/atproto/markdown.test.ts

<!-- source: src/lib/atproto/markdown.test.ts:80 -->

### [src/lib/atproto/markdown.test.ts:80](../../../src/lib/atproto/markdown.test.ts#L80)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 記法マーカーは本文から落ちる。
```

<!-- source: src/lib/atproto/markdown.test.ts:118 -->

### [src/lib/atproto/markdown.test.ts:118](../../../src/lib/atproto/markdown.test.ts#L118)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// javascript: を href にしないことは、他人の投稿を描画するうえでの前提。
```

<!-- source: src/lib/atproto/markdown.test.ts:192 -->

### [src/lib/atproto/markdown.test.ts:192](../../../src/lib/atproto/markdown.test.ts#L192)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 閉じフェンスが無ければ最後までコード。
```

<!-- source: src/lib/atproto/markdown.test.ts:208 -->

### [src/lib/atproto/markdown.test.ts:208](../../../src/lib/atproto/markdown.test.ts#L208)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 行の途中の画像記法や http(s) 以外は画像にしない。
```

<!-- source: src/lib/atproto/markdown.test.ts:245 -->

### [src/lib/atproto/markdown.test.ts:245](../../../src/lib/atproto/markdown.test.ts#L245)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// カードが無いときは段落として出せるよう、行のリンクも runs に残す。
```

<!-- source: src/lib/atproto/markdown.test.ts:247 -->

### [src/lib/atproto/markdown.test.ts:247](../../../src/lib/atproto/markdown.test.ts#L247)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 既定（タイムラインなど）では段落の区切り方を変えない。
```

## src/lib/atproto/markdown.ts

<!-- source: src/lib/atproto/markdown.ts:15 -->

### [src/lib/atproto/markdown.ts:15](../../../src/lib/atproto/markdown.ts#L15)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** ハッシュタグ facet の tag（原文ケース）。右クリック／長押しのメニューで使う。 */
```

<!-- source: src/lib/atproto/markdown.ts:18 -->

### [src/lib/atproto/markdown.ts:18](../../../src/lib/atproto/markdown.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** gap は直前のブロックとの間にあった空行の数（無ければ省略）。 */
```

<!-- source: src/lib/atproto/markdown.ts:23 -->

### [src/lib/atproto/markdown.ts:23](../../../src/lib/atproto/markdown.ts#L23)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

````text
/** フェンス（``` / ~~~）で囲んだコード。中身は記法もリンクも解釈しない。 */
````

<!-- source: src/lib/atproto/markdown.ts:25 -->

### [src/lib/atproto/markdown.ts:25](../../../src/lib/atproto/markdown.ts#L25)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 水平線。data-block^='h' の見出し用 CSS に掛からないよう hr ではなく rule と呼ぶ。 */
```

<!-- source: src/lib/atproto/markdown.ts:27 -->

### [src/lib/atproto/markdown.ts:27](../../../src/lib/atproto/markdown.ts#L27)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * 1行だけの画像（`![alt](https://…)`）。描画側が投稿の添付画像と照合して出すので、
	 * ここでは URL を検証せず受け取るだけにする。
	 */
```

<!-- source: src/lib/atproto/markdown.ts:32 -->

### [src/lib/atproto/markdown.ts:32](../../../src/lib/atproto/markdown.ts#L32)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * URL だけの行（記事本文のリンクカード位置）。parseRichText に cardLines を渡したときだけ作る。
	 * url はカードの照合キー。カードが無いときに段落として出せるよう runs も持つ。
	 */
```

<!-- source: src/lib/atproto/markdown.ts:47 -->

### [src/lib/atproto/markdown.ts:47](../../../src/lib/atproto/markdown.ts#L47)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 元テキストの文字位置を保持したブロック本文。map[i] は text[i] の元位置（-1 は挿入した改行）。 */
```

<!-- source: src/lib/atproto/markdown.ts:55 -->

### [src/lib/atproto/markdown.ts:55](../../../src/lib/atproto/markdown.ts#L55)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * facet のバイト範囲を文字インデックスへ変換する。RichText が持っていた検証をそのまま踏襲し、
 * 重なり・範囲外を捨て、http(s) 以外の URI はリンクにしない（javascript: の実行を防ぐ）。
 */
```

<!-- source: src/lib/atproto/markdown.ts:97 -->

### [src/lib/atproto/markdown.ts:97](../../../src/lib/atproto/markdown.ts#L97)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 外へ書き出す用。閲覧者ごとの装飾も内部パス化もせず、公開オリジンの絶対 URL にする。
```

<!-- source: src/lib/atproto/markdown.ts:106 -->

### [src/lib/atproto/markdown.ts:106](../../../src/lib/atproto/markdown.ts#L106)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// カスタム絵文字は書き出し先で描けないので、元の文字列（:name:）のまま残す。
```

<!-- source: src/lib/atproto/markdown.ts:172 -->

### [src/lib/atproto/markdown.ts:172](../../../src/lib/atproto/markdown.ts#L172)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// marks 配列の参照を共有し、同一装飾かつ同一リンクの連続文字を 1 つの run にまとめる
```

<!-- source: src/lib/atproto/markdown.ts:216 -->

### [src/lib/atproto/markdown.ts:216](../../../src/lib/atproto/markdown.ts#L216)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 閉じデリミタを探す。空の内容と、空白に隣接する（＝装飾意図でない）閉じ記号は無視する。 */
```

<!-- source: src/lib/atproto/markdown.ts:235 -->

### [src/lib/atproto/markdown.ts:235](../../../src/lib/atproto/markdown.ts#L235)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 表示される文字の範囲（piece 上の位置）と、その範囲に掛かる装飾を受け取る。 */
```

<!-- source: src/lib/atproto/markdown.ts:258 -->

### [src/lib/atproto/markdown.ts:258](../../../src/lib/atproto/markdown.ts#L258)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// コード内では他の記法を解釈しない
```

<!-- source: src/lib/atproto/markdown.ts:304 -->

### [src/lib/atproto/markdown.ts:304](../../../src/lib/atproto/markdown.ts#L304)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// エスケープ等で分断された、装飾もリンクも同じ run を最後にまとめる
```

<!-- source: src/lib/atproto/markdown.ts:322 -->

### [src/lib/atproto/markdown.ts:322](../../../src/lib/atproto/markdown.ts#L322)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 行の範囲（元テキストの文字位置）をつないで 1 つのブロック本文にする。 */
```

<!-- source: src/lib/atproto/markdown.ts:347 -->

### [src/lib/atproto/markdown.ts:347](../../../src/lib/atproto/markdown.ts#L347)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 段落を打ち切って新しいブロックを始める行か。 */
```

<!-- source: src/lib/atproto/markdown.ts:358 -->

### [src/lib/atproto/markdown.ts:358](../../../src/lib/atproto/markdown.ts#L358)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 行単位で切り出したブロック。body / items は記法マーカーを除いた本文の範囲。
 * gap は直前のブロックとの間にあった空行の数で、表示ではその行数ぶんの余白にする。
 */
```

<!-- source: src/lib/atproto/markdown.ts:366 -->

### [src/lib/atproto/markdown.ts:366](../../../src/lib/atproto/markdown.ts#L366)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** fences は開き・閉じのフェンス行（閉じが無ければ開きだけ）。 */
```

<!-- source: src/lib/atproto/markdown.ts:369 -->

### [src/lib/atproto/markdown.ts:369](../../../src/lib/atproto/markdown.ts#L369)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** alt は ![ と ] の間の範囲。 */
```

<!-- source: src/lib/atproto/markdown.ts:387 -->

### [src/lib/atproto/markdown.ts:387](../../../src/lib/atproto/markdown.ts#L387)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ブロックの境目にある空行は段落へ含めず、次のブロックの gap として数える。
	// 段落に含めると pre-wrap の空行とブロック間の余白が二重になり、
	// 箇条書きの直後だけ間が大きく空いてしまう。
```

<!-- source: src/lib/atproto/markdown.ts:403 -->

### [src/lib/atproto/markdown.ts:403](../../../src/lib/atproto/markdown.ts#L403)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// CommonMark と同じく、閉じフェンスが無ければ文書の終わりまでをコードにする。
```

<!-- source: src/lib/atproto/markdown.ts:498 -->

### [src/lib/atproto/markdown.ts:498](../../../src/lib/atproto/markdown.ts#L498)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// それ以外はブロック記法が現れるまでを 1 段落にまとめ、改行は pre-wrap に任せる
```

<!-- source: src/lib/atproto/markdown.ts:507 -->

### [src/lib/atproto/markdown.ts:507](../../../src/lib/atproto/markdown.ts#L507)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 段落末尾の空行は次のブロックとの間の余白として扱う
```

<!-- source: src/lib/atproto/markdown.ts:524 -->

### [src/lib/atproto/markdown.ts:524](../../../src/lib/atproto/markdown.ts#L524)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 指定すると、リンクをこのオリジン基準の装飾なし絶対 URL で返す（commonmark 書き出し用）。 */
```

<!-- source: src/lib/atproto/markdown.ts:526 -->

### [src/lib/atproto/markdown.ts:526](../../../src/lib/atproto/markdown.ts#L526)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
		 * URL だけの行を card ブロックにする（記事本文用）。
		 * 通常の投稿では段落の区切り方を変えないよう、既定では切り出さない。
		 */
```

<!-- source: src/lib/atproto/markdown.ts:537 -->

### [src/lib/atproto/markdown.ts:537](../../../src/lib/atproto/markdown.ts#L537)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 表示されないブロック（中身が空の段落など）の余白は、次に表示するブロックへ持ち越す
```

<!-- source: src/lib/atproto/markdown.ts:568 -->

### [src/lib/atproto/markdown.ts:568](../../../src/lib/atproto/markdown.ts#L568)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 先頭のブロックの前の空行は余白にしない
```

<!-- source: src/lib/atproto/markdown.ts:587 -->

### [src/lib/atproto/markdown.ts:587](../../../src/lib/atproto/markdown.ts#L587)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 入力欄をその場で装飾するための注釈。parseRichText と同じ規則で解析し、記法の文字を
 * 消さずに位置を残す。
 * - lines: 各行のブロック種別（ブロックの境目の空行は undefined）
 * - marks: 各文字に掛かる装飾。null は表示で消える記法の文字（`**` や `## ` など）
 */
```

<!-- source: src/lib/atproto/markdown.ts:609 -->

### [src/lib/atproto/markdown.ts:609](../../../src/lib/atproto/markdown.ts#L609)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// フェンス行は記法、中身はコードとして色を付ける。
```

<!-- source: src/lib/atproto/markdown.ts:640 -->

### [src/lib/atproto/markdown.ts:640](../../../src/lib/atproto/markdown.ts#L640)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 本文の先頭が `# 見出し` ならタイトルとして取り出す。
 * standard.site の document.title は必須なので、これが無いときは投稿側で入力を促す。
 */
```

<!-- source: src/lib/atproto/markdown.ts:654 -->

### [src/lib/atproto/markdown.ts:654](../../../src/lib/atproto/markdown.ts#L654)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 記事本文で、行の位置にリンクカードを置く URL（URL だけの行）を本文順に返す。
 * コードブロックの中の URL は含めない。
 */
```

<!-- source: src/lib/atproto/markdown.ts:665 -->

### [src/lib/atproto/markdown.ts:665](../../../src/lib/atproto/markdown.ts#L665)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 記事本文で、行の位置に埋め込みを出す行（URL だけの行と `![alt](url)` の行）を本文順に返す。
 * start / end はその行の先頭・末尾の文字位置。入力欄で行の下にカードや画像を重ねて見せるのに使う。
 * コードブロックの中の行は含めない。
 */
```

<!-- source: src/lib/atproto/markdown.ts:685 -->

### [src/lib/atproto/markdown.ts:685](../../../src/lib/atproto/markdown.ts#L685)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 通知の 1 行プレビュー向けに、記法マーカーを落とした素のテキストを返す。 */
```

## src/lib/atproto/pds.ts

<!-- source: src/lib/atproto/pds.ts:1 -->

### [src/lib/atproto/pds.ts:1](../../../src/lib/atproto/pds.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 任意 DID の PDS をブラウザから解決し、未認証で公開レコードを読むためのヘルパ。
 * `com.atproto.repo.listRecords` / `getRecord` は公開エンドポイントなので認証不要で叩ける。
 * サーバ側 `apps/nagi_appview/src/util/pds.ts` + `services/emoji.ts:fetchEmojiRecord` の
 * クライアント版（DID ドキュメント解決は plc.directory / did:web well-known を fetch）。
 *
 * 注意: クライアント直読みは対象 PDS の CORS 設定に依存する。主要 PDS（bsky.network 系）は
 * com.atproto.repo.* に CORS を許可しているが、一部セルフホスト PDS では失敗しうる。
 */
```

<!-- source: src/lib/atproto/pds.ts:16 -->

### [src/lib/atproto/pds.ts:16](../../../src/lib/atproto/pds.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 解決した PDS ベース URL を DID ごとにキャッシュ（プロフィール表示のたびに DID 解決しない）。
```

<!-- source: src/lib/atproto/pds.ts:27 -->

### [src/lib/atproto/pds.ts:27](../../../src/lib/atproto/pds.ts#L27)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** did:web:example.com[:sub:path] → その DID ドキュメント URL。 */
```

<!-- source: src/lib/atproto/pds.ts:44 -->

### [src/lib/atproto/pds.ts:44](../../../src/lib/atproto/pds.ts#L44)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** DID から PDS のベース URL を解決する。did:plc は plc.directory、did:web は well-known。 */
```

<!-- source: src/lib/atproto/pds.ts:65 -->

### [src/lib/atproto/pds.ts:65](../../../src/lib/atproto/pds.ts#L65)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 対象 DID の PDS から、指定 collection のレコードを新しい順に取得（未認証）。 */
```

<!-- source: src/lib/atproto/pds.ts:76 -->

### [src/lib/atproto/pds.ts:76](../../../src/lib/atproto/pds.ts#L76)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// listRecords は既定（reverse=false）で rkey 降順＝新しい順に返る（リファレンス PDS は
		// orderBy(key, reverse ? 'asc' : 'desc')）。TID rkey のアプリなら降順＝新しい順＝最新が先頭。
```

<!-- source: src/lib/atproto/pds.ts:85 -->

### [src/lib/atproto/pds.ts:85](../../../src/lib/atproto/pds.ts#L85)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 対象 DID の PDS から単一レコードを取得（未認証）。存在しなければ null。 */
```

## src/lib/atproto/post-embed.ts

<!-- source: src/lib/atproto/post-embed.ts:5 -->

### [src/lib/atproto/post-embed.ts:5](../../../src/lib/atproto/post-embed.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** com.suibari.nagi.post#image の中身（$type を除く）。 */
```

<!-- source: src/lib/atproto/post-embed.ts:15 -->

### [src/lib/atproto/post-embed.ts:15](../../../src/lib/atproto/post-embed.ts#L15)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 投稿の embed を型によらず均した中身。 */
```

<!-- source: src/lib/atproto/post-embed.ts:22 -->

### [src/lib/atproto/post-embed.ts:22](../../../src/lib/atproto/post-embed.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 投稿レコードの embed から画像・動画・引用を取り出す。生レコードを読むときはここを通す
 * （AppView の nagiPostMedia と同じ役割）。
 *
 * メディアの置き場所は embed の型ごとに違う:
 * - `#images`  … `images`
 * - `#video`   … embed 自体が動画
 * - `#gallery` … `items` に `#image` / `#video` が混ざる
 * - `#quote`   … `record` と、任意の `images` / `video`
 *
 * 過去のレコードが残るので、読み手はこの4通りを扱い続ける。形はこれ以上増やさないこと。
 * 知らない型の embed は undefined を返す（書き換えると中身を失うため）。
 */
```

<!-- source: src/lib/atproto/post-embed.ts:51 -->

### [src/lib/atproto/post-embed.ts:51](../../../src/lib/atproto/post-embed.ts#L51)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 動画は1本まで。崩れたレコードでも先頭だけ使う。
```

<!-- source: src/lib/atproto/post-embed.ts:69 -->

### [src/lib/atproto/post-embed.ts:69](../../../src/lib/atproto/post-embed.ts#L69)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 画像・動画・引用から投稿の embed を組み立てる。どの型で書くかの規則はここだけが持つ:
 * 引用あり→`#quote`、画像と動画→`#gallery`、画像だけ→`#images`、動画だけ→`#video`。
 * `#gallery` の items は画像→動画の順に並べる（AppView のビューもこの順で返す）。
 */
```

## src/lib/atproto/records.test.ts

<!-- source: src/lib/atproto/records.test.ts:524 -->

### [src/lib/atproto/records.test.ts:524](../../../src/lib/atproto/records.test.ts#L524)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ゼンカツの提出とドローの控え。どちらも本人の repo にあるので、
			// アカウントデータの削除で必ず消えること。
```

<!-- source: src/lib/atproto/records.test.ts:528 -->

### [src/lib/atproto/records.test.ts:528](../../../src/lib/atproto/records.test.ts#L528)

分類: 検証・再現条件。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ラジオの公開。消せば引用カードも出なくなる。
```

## src/lib/atproto/records.ts

<!-- source: src/lib/atproto/records.ts:32 -->

### [src/lib/atproto/records.ts:32](../../../src/lib/atproto/records.ts#L32)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// チャンネルは廃止したが、全データ削除で過去に作ったレコードを消せるよう一覧に残す。
```

<!-- source: src/lib/atproto/records.ts:55 -->

### [src/lib/atproto/records.ts:55](../../../src/lib/atproto/records.ts#L55)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 書き込み直後に AppView へ「PDS の現在状態を取りに来い」と伝える。
 *
 * 取り込みは本来 firehose 経由だが、上流が止まっている間は次の reconcile まで反映されない。
 * 自分の操作だけはこの経路で確実に通す。失敗しても firehose と reconcile が拾うので握り潰す。
 */
```

<!-- source: src/lib/atproto/records.ts:69 -->

### [src/lib/atproto/records.ts:69](../../../src/lib/atproto/records.ts#L69)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * レコードを消し、消えた事実を AppView へ伝える。
 *
 * ensureRecord は lexicon 上 cid が必須だが、削除後の PDS からは取れない。呼び出し側が
 * 持っていなければ消す前に読んでおく（AppView は URI で引くので、値は削除直前のもので足りる）。
 * cid が取れなくても削除自体は続行し、その場合の反映は reconcile に委ねる。
 */
```

<!-- source: src/lib/atproto/records.ts:123 -->

### [src/lib/atproto/records.ts:123](../../../src/lib/atproto/records.ts#L123)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 投稿編集時に、元レコードのサムネイル BlobRef を再利用するための位置。 */
```

<!-- source: src/lib/atproto/records.ts:133 -->

### [src/lib/atproto/records.ts:133](../../../src/lib/atproto/records.ts#L133)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * Bluesky に同時投稿したコピーへの参照。Nagi の投稿より先に Bluesky へ出し、作成時のレコードに
	 * 入れる（後から書き足すと AppView が「編集」と見なし、翻訳や判定をやり直してしまう）。
	 */
```

<!-- source: src/lib/atproto/records.ts:139 -->

### [src/lib/atproto/records.ts:139](../../../src/lib/atproto/records.ts#L139)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** video.bsky.app で変換済みの動画。画像と併用できる（引用なしなら #gallery で書く）。 */
```

<!-- source: src/lib/atproto/records.ts:142 -->

### [src/lib/atproto/records.ts:142](../../../src/lib/atproto/records.ts#L142)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** こっそりモード。共有フィードには表示せず、本人のプロフィールや検索で確認できる。 */
```

<!-- source: src/lib/atproto/records.ts:144 -->

### [src/lib/atproto/records.ts:144](../../../src/lib/atproto/records.ts#L144)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * 作成時からCW運用の投稿。CW（本文の伏せ字・画像のぼかし）は Nagi 独自で、外では効く保証が無い。
	 * そのためブログ（standard.site）・検索向けの公開はしない。CW は後から付け外しできない。
	 * Bluesky へのクロスポストは、Bluesky でも伏せられるかで別に判定する
	 * （crosspost/content-warning.ts）。
	 */
```

<!-- source: src/lib/atproto/records.ts:151 -->

### [src/lib/atproto/records.ts:151](../../../src/lib/atproto/records.ts#L151)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** botたんサイレント機能。true の投稿には botたんが返信しない。 */
```

<!-- source: src/lib/atproto/records.ts:153 -->

### [src/lib/atproto/records.ts:153](../../../src/lib/atproto/records.ts#L153)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** サイレントリプライ。true の返信は直接の返信先へ通知しない。 */
```

<!-- source: src/lib/atproto/records.ts:155 -->

### [src/lib/atproto/records.ts:155](../../../src/lib/atproto/records.ts#L155)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** セルフラベル (com.atproto.label.defs#selfLabels) */
```

<!-- source: src/lib/atproto/records.ts:157 -->

### [src/lib/atproto/records.ts:157](../../../src/lib/atproto/records.ts#L157)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
	 * ブログとして書いた投稿。タイトル（本文先頭の見出し）とヘッダー画像
	 * （1枚目の添付）を持つ記事として描画してよい、という印。
	 * 内容そのものは本文と添付に入っているので、レコードにはこの真偽値だけ載せる。
	 */
```

<!-- source: src/lib/atproto/records.ts:165 -->

### [src/lib/atproto/records.ts:165](../../../src/lib/atproto/records.ts#L165)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** com.suibari.nagi.post#video の中身（$type を除く）。 */
```

<!-- source: src/lib/atproto/records.ts:173 -->

### [src/lib/atproto/records.ts:173](../../../src/lib/atproto/records.ts#L173)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 通常投稿に付けられるリンクカードの上限。記事は本文の行ごとに置けるので上限を掛けない。 */
```

<!-- source: src/lib/atproto/records.ts:267 -->

### [src/lib/atproto/records.ts:267](../../../src/lib/atproto/records.ts#L267)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** Create the initial profile without overwriting another tab's saved profile. */
```

<!-- source: src/lib/atproto/records.ts:286 -->

### [src/lib/atproto/records.ts:286](../../../src/lib/atproto/records.ts#L286)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// A concurrent tab may have created it after our read.
```

<!-- source: src/lib/atproto/records.ts:293 -->

### [src/lib/atproto/records.ts:293](../../../src/lib/atproto/records.ts#L293)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 初回サインインで Nagi プロフィールを Bluesky のプロフィールから作る。登録画面は挟まない
 * （まず使ってもらい、変えたくなったら設定から変えてもらう）。アバターは同じ repo の blob なので
 * そのまま参照できる。別タブが先に作っていたら上書きせず、作らなかったことを返す。
 */
```

<!-- source: src/lib/atproto/records.ts:361 -->

### [src/lib/atproto/records.ts:361](../../../src/lib/atproto/records.ts#L361)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 投稿に添付する blob をアップロードした結果。Bluesky クロスポストでも
 * 同じ blobRef を使い回すため、レコード作成とは分けて公開している。
 */
```

<!-- source: src/lib/atproto/records.ts:373 -->

### [src/lib/atproto/records.ts:373](../../../src/lib/atproto/records.ts#L373)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 動画は添付した時点で送ってあるので、ここでは draft の値をそのまま運ぶ。 */
```

<!-- source: src/lib/atproto/records.ts:421 -->

### [src/lib/atproto/records.ts:421](../../../src/lib/atproto/records.ts#L421)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 投稿を作る。返り値は経路によらず `{ uri, cid }` に揃える。こっそりは PDS レコードでは
 * ないので createRecord のレスポンス形（`.data`）を通せないため。
 */
```

<!-- source: src/lib/atproto/records.ts:431 -->

### [src/lib/atproto/records.ts:431](../../../src/lib/atproto/records.ts#L431)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// こっそりは PDS に置かない。本文は AppView だけが持ち、URI も著者 DID を含まない
	// AppView 発行のものになる。画像とリンクカードは扱わない（blob は参照レコードのある
	// PDS でしか保持されず、こっそりにはその参照レコードが無いため）。
```

<!-- source: src/lib/atproto/records.ts:463 -->

### [src/lib/atproto/records.ts:463](../../../src/lib/atproto/records.ts#L463)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// kossori はここへ来ない（上で AppView 経路へ分岐済み）。
```

<!-- source: src/lib/atproto/records.ts:467 -->

### [src/lib/atproto/records.ts:467](../../../src/lib/atproto/records.ts#L467)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// ニュース記事そのものは引用カードで描画し、本文中の別URLだけがここへ入る。
```

<!-- source: src/lib/atproto/records.ts:480 -->

### [src/lib/atproto/records.ts:480](../../../src/lib/atproto/records.ts#L480)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 投稿を削除する。こっそりは PDS に正本が無いので AppView の手続きを通す。
 * 通常の投稿は従来どおり PDS のレコードを消して AppView へ伝える。
 *
 * こっそり⇄公開の後からの切り替えは無い。保管場所が PDS と AppView で分かれており、
 * 移し替えると URI が変わってリアクションやブックマークが外れるため、投稿時に確定させる。
 */
```

<!-- source: src/lib/atproto/records.ts:503 -->

### [src/lib/atproto/records.ts:503](../../../src/lib/atproto/records.ts#L503)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 編集で動画をどうするか。keep は既存の blob のまま alt と CW だけ書き直す。
 * new は添付し直した動画（video.bsky.app で変換済み）。
 */
```

<!-- source: src/lib/atproto/records.ts:512 -->

### [src/lib/atproto/records.ts:512](../../../src/lib/atproto/records.ts#L512)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** BlobRef（JSON の $link でも CID オブジェクトでも）から CID 文字列を取り出す。 */
```

<!-- source: src/lib/atproto/records.ts:527 -->

### [src/lib/atproto/records.ts:527](../../../src/lib/atproto/records.ts#L527)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 既存投稿の本文・画像・リンクカードを編集する。既存の画像とカードサムネイルは
 * getRecord した BlobRef を再利用し、新規 Blob だけアップロードする。
 * createdAt・reply・kossori・旧チャンネルの所属等のフィールドは保持する。
 */
```

<!-- source: src/lib/atproto/records.ts:564 -->

### [src/lib/atproto/records.ts:564](../../../src/lib/atproto/records.ts#L564)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 画像・動画は既存 embed を均した値に編集を当て、最後に embed を1回だけ組み立て直す。
	// 型の遷移（#images ⇄ #gallery ⇄ #video、#quote 内の付け外し）は buildPostEmbed に任せる。
```

<!-- source: src/lib/atproto/records.ts:790 -->

### [src/lib/atproto/records.ts:790](../../../src/lib/atproto/records.ts#L790)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// カスタム絵文字では emoji はフォールバックテキスト（":name:"）。
```

<!-- source: src/lib/atproto/records.ts:820 -->

### [src/lib/atproto/records.ts:820](../../../src/lib/atproto/records.ts#L820)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * botたんラジオの1回を公開する。rkey を slotKey にするので、同じ回を何度ポストしても
 * レコードは1つ。曲とDJコメントは書かず、AppView が本人の放送履歴から引く。
 */
```

<!-- source: src/lib/atproto/records.ts:870 -->

### [src/lib/atproto/records.ts:870](../../../src/lib/atproto/records.ts#L870)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 壊れた、または別レコードを指すサイドカーから無関係な Bluemoji を消さない。
```

<!-- source: src/lib/atproto/records.ts:879 -->

### [src/lib/atproto/records.ts:879](../../../src/lib/atproto/records.ts#L879)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 本体を個別削除済みなら、孤立したサイドカーの掃除だけ続ける。
```

<!-- source: src/lib/atproto/records.ts:889 -->

### [src/lib/atproto/records.ts:889](../../../src/lib/atproto/records.ts#L889)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// Nagi がユーザー自身の PDS に作る公開レコードはここですべて消す。
	// コレクションを追加したときは回帰テストの期待値も更新し、全データ削除から漏らさない。
```

<!-- source: src/lib/atproto/records.ts:907 -->

### [src/lib/atproto/records.ts:907](../../../src/lib/atproto/records.ts#L907)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// standard.site は Nagi 専用のコレクションではなく、他アプリ（blento.app など）の
	// publication / document が同居しうる。コレクションごと消さず、Nagi が作った分だけ消す。
	// 権限が無いユーザーでは listRecords/deleteRecord が失敗するため、事前に判定する。
```

<!-- source: src/lib/atproto/records.ts:937 -->

### [src/lib/atproto/records.ts:937](../../../src/lib/atproto/records.ts#L937)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/** 作者の意図の上限。**AppView の validateRecord（300字・3000バイト）と揃えること。** */
```

<!-- source: src/lib/atproto/records.ts:941 -->

### [src/lib/atproto/records.ts:941](../../../src/lib/atproto/records.ts#L941)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * ゼンカツ！の提出。**rkey はお題の日付そのもの。**
 *
 * こうすると repo 側でも「1日1本」が構造的に決まる（同じ rkey は上書きしかできない）。
 * ただし AppView は先着のみを索引し、消して出し直しても通さないので、上書きは効かない。
 *
 * 所持していない札・クールダウン中の札を書いても AppView が照合して索引しない。
 * つまりこの経路でズルはできないが、無駄弾を撃たないようクライアント側でも選択肢を絞ること。
 */
```

<!-- source: src/lib/atproto/records.ts:956 -->

### [src/lib/atproto/records.ts:956](../../../src/lib/atproto/records.ts#L956)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 作者の意図は任意。空なら項目ごと書かない（AppView は note の有無で判定待ちを決める）。
```

<!-- source: src/lib/atproto/records.ts:968 -->

### [src/lib/atproto/records.ts:968](../../../src/lib/atproto/records.ts#L968)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 言語は意図の翻訳の原文判定に使う。投稿と同じく投稿言語の設定を書く。
```

<!-- source: src/lib/atproto/records.ts:976 -->

### [src/lib/atproto/records.ts:976](../../../src/lib/atproto/records.ts#L976)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * ドローの控えの rkey。
 *
 * **サーバ側 `cardGetRkey()`（shared-configs/src/cards.ts）と同じ綴りでなければならない。**
 * リポジトリが分かれているので共有できない。ズレると「控えたのに索引されない」が
 * エラーも出ないまま起きる。片方を変えるときは必ず両方直すこと。
 */
```

<!-- source: src/lib/atproto/records.ts:991 -->

### [src/lib/atproto/records.ts:991](../../../src/lib/atproto/records.ts#L991)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * ドローの控えを PDS に書く。**権威ではない。**
 *
 * 引いた結果を決めるのは AppView で、これは「引いた」という控え。AppView は card_draws と
 * 突き合わせて一致しないものを索引しないので、ここに嘘を書いても意味は無い。
 * 控えを置く理由は、リアクションの subject が実在の PDS レコードを要るから。
 *
 * 記念日カードは同じ日に複数ありうるので、card_number に入っている slot まで rkey に含める。
 */
```

<!-- source: src/lib/atproto/records.ts:1007 -->

### [src/lib/atproto/records.ts:1007](../../../src/lib/atproto/records.ts#L1007)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 記念日カードの card_number は 西暦*100 + slot。slot だけを取り出す。
```

<!-- source: src/lib/atproto/records.ts:1026 -->

### [src/lib/atproto/records.ts:1026](../../../src/lib/atproto/records.ts#L1026)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
/**
 * 控えを書き損ねたぶんを拾い直す（getCards の unmirroredDraws を渡す）。
 *
 * **履歴の埋め戻しではない。** AppView が返すのは直近2日ぶんだけで、それより前のドローは
 * 控えを持たないまま終わる。ニュースは「今この瞬間の出来事」なので、何ヶ月も前のドローを
 * 後から控えても誰も見ないし、利用者が頼んでいない書き込みを本人の repo へ大量に撃つことになる。
 *
 * ここが拾うのは「引いた直後の書き込みが失敗した」ぶん（オフライン、PDS 落ち、
 * アプリを閉じた）。UR や AAR の日にこれが起きるとニュースに出ないまま終わってしまう。
 */
```

<!-- source: src/lib/atproto/records.ts:1050 -->

### [src/lib/atproto/records.ts:1050](../../../src/lib/atproto/records.ts#L1050)

分類: 仕様・設計の根拠。対応仕様: [appview-protocol](spec.md#requirements)。

```text
// 1件失敗しても残りは試す。窓の内側なら次回もまた出てくる。
```
