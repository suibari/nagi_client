# AppView通信・AT Protocolレコード

## Purpose

### 機能概要

画面とデータ基盤をつなぐ共通の仕組みである。Nagi AppViewから表示用データを取得し、利用者のPDSへ公開レコードを保存する。投稿・プロフィール等の画面が、認証方法やAT Protocolのデータ形式を個別に組み立てずに利用できることを目的とする。

AppViewは表示用の集約サーバー、PDSは本人の公開データの保存先である。こっそり投稿はAppViewに保存し、公開レコードと保存先を分ける。

### 機能一覧

| 機能                       | 役割・利用者ができること                                  | 詳細要件                              |
| -------------------------- | --------------------------------------------------------- | ------------------------------------- |
| AppView API通信            | 認証の有無に応じてPDSプロキシと公開取得を切り替える。     | [API-01](#api-01) / [API-02](#api-02) |
| 公開PDSの読み取り          | DIDから保存先を解決して公開レコードを読む。               | [API-03](#api-03)                     |
| レコードの作成・更新・削除 | PDSへの保存とAppViewへの取り込み補助を行う。              | [API-04](#api-04)                     |
| リッチテキスト             | 本文、Markdown、mention、リンク等の位置を保存・復元する。 | [API-05](#api-05)                     |
| メディアと参照             | 画像・動画・引用のembedと画像CIDを共通規則で組み立てる。  | [API-06](#api-06)                     |
| APIデータ契約              | 省略可能な値や本人専用の値の意味を定義する。              | [API-07](#api-07)                     |
| 先行入力検索               | 入力中の候補取得をまとめ、古い検索結果の上書きを防ぐ。    | [API-08](#api-08)                     |

### 主な利用の流れ

1. 画面が必要なデータと認証の要否を指定する。
2. 共通通信層が経路を選び、レスポンスまたは分類可能なエラーを返す。
3. 公開データの変更はPDSへ保存し、AppViewに即時取り込みを依頼する。
4. 画面は返された型と可視性の契約に従って描画する。

この文書は現行クライアントの振る舞いを整理する。設計判断は [design.md](design.md)、導入時の証跡は [コメント原文](../../reference/comment-snapshot/appview-protocol.md)、既知の不整合は [known-gaps.md](../../known-gaps.md) に分けて記録する。シナリオは確認条件であり、全外部環境での実行合格を示すものではない。

## Requirements

<a id="api-01"></a>

### Requirement: API-01 通信経路と認可エラー

認証を要するAppView通信は利用者のPDSへのatproto-proxyを使い、未ログインまたはauth:noneではAppViewへ直接取得しなければならない（MUST）。独自getServiceAuth経路を復活させない。HTTPステータス・エラーコードを保持し、401/403とscope/permission由来の400を認可エラーとして識別する。

#### Scenario: 認証付き取得

- **WHEN** セッションがあり本人情報を必要とする
- **THEN** PDS経由でviewerを伝える

#### Scenario: 開発用直接通信

- **WHEN** devかつPUBLIC_APPVIEW_DIRECT=true
- **THEN** 同一originのVite proxyを使いx-viewer-didを渡す。本番ではこの経路を有効にしない

<a id="api-02"></a>

### Requirement: API-02 公開フォールバック

公開フォールバックを指定した取得だけは、認証・認可の拒否時に匿名取得を試みなければならない（MUST）。これは公開直後のpermission setキャッシュとの互換策であり、認証必須API全般の迂回ではない。本人専用情報が消えた結果を権限付与済みとみなさない。

#### Scenario: 公開コレクションの認可待ち

- **WHEN** 認証付きgetが403になる
- **THEN** 公開内容は表示し、本人専用のdrawStatusなどは未確認扱いにする

#### Scenario: 一般の通信エラー

- **WHEN** 公開フォールバック対象で通信障害が起きる
- **THEN** 認可拒否と同一の理由に書き換えない

<a id="api-03"></a>

### Requirement: API-03 公開PDS解決と外部レコード

公開レコードの読み取りはdid:plc/did:webからPDSを解決し、認証不要のgetRecord/listRecordsで行わなければならない（MUST）。App Linksは本人がcurateしたcollection・キーパスだけを表示し、repeat配列の展開上限を守る。

#### Scenario: 外部アプリの連携表示

- **WHEN** プロフィール所有者がApp Linksを設定する
- **THEN** 指定されたレコードと宣言済みフィールドから描画する

#### Scenario: レコード不存在

- **WHEN** 公開getRecordの対象が無い
- **THEN** 不存在を返し、プロフィール全体を停止させない

<a id="api-04"></a>

### Requirement: API-04 レコード書き込みと取り込み

公開投稿は本人のPDS、こっそり投稿はAppViewを正本として扱わなければならない（MUST）。PDS書き込み後はensureRecordで即時取り込みを補助し、その失敗で保存済み操作を巻き戻さない。削除時は取得できれば削除前CIDを保持して通知し、CIDの取得失敗だけで削除を止めない。

#### Scenario: firehoseの停止

- **WHEN** 自分の公開レコードを作成または更新する
- **THEN** ensureRecordで現在状態の取得を促す

#### Scenario: こっそり投稿

- **WHEN** AppView正本への保存が完了する
- **THEN** 本人PDSからのensureRecordを要求しない

<a id="api-05"></a>

### Requirement: API-05 リッチテキストの位置と安全な描画

facetはUTF-8バイト範囲で保存し、入力欄の文字位置と混同してはならない（MUST）。見出し追加やCWの区切り操作時は選択位置を補正する。コードフェンスの中は記法・リンクを解釈しない。自動リンク・画像のURLから危険なschemeを描画可能にしない。

#### Scenario: 日本語と絵文字を含む本文編集

- **WHEN** 保存facetを編集入力へ戻す
- **THEN** mention位置と名前付きMarkdownリンクを復元する

#### Scenario: CW区切りの移動

- **WHEN** 選択範囲を||で囲む、解除する、別範囲へ移す
- **THEN** 既存の1組を扱い、mention等の範囲を壊さない

<a id="api-06"></a>

### Requirement: API-06 embedの組み立てと互換読み取り

画像・動画・引用の読み書きはpost-embedの共通規則に従わなければならない（MUST）。引用ありはquote、画像と動画はgallery、画像だけはimages、動画だけはvideoとし、galleryは画像→動画の順にする。記事本文のCIDはCIDv1/raw/sha2-256で計算し、公開前にPDSの結果と照合する。

#### Scenario: 画像と動画の併用

- **WHEN** 引用なしで両方を添付する
- **THEN** galleryに画像、動画の順で保存する

#### Scenario: 本文CID不一致

- **WHEN** ローカルで計算した画像CIDとuploadBlobのCIDが異なる
- **THEN** 壊れた画像URLを公開する前に送信を止める

<a id="api-07"></a>

### Requirement: API-07 型に記録された契約

APIのoptional項目、本人にだけ返る項目、合成URI、時刻、ページング、旧レスポンスの意味は[導入時原文資料](../../reference/comment-snapshot/appview-protocol.md)のsrc/lib/api/types.ts出典を保持しなければならない（MUST）。型に値が存在しないことをゼロ・未読・公開許可と読み替えない。サーバ実装はこのリポジトリで検証済みとは扱わない。

#### Scenario: 旧レスポンス

- **WHEN** 新規optionalフィールドが無い
- **THEN** 対応する機能の未確認・互換フォールバック規則を使う

<a id="api-08"></a>

### Requirement: API-08 サジェストの競合制御

mention・タグ・絵文字等の先行入力検索は共通のdebounce、queryキャッシュ、古い応答の排除を使わなければならない（MUST）。設定された場合は最初の1文字を即時検索し、待機中は前回候補を新しいqueryで絞ってちらつきを抑える。

#### Scenario: 検索中の追加入力

- **WHEN** 先のqueryの応答が後から返る
- **THEN** 現在queryの候補を古い結果で上書きしない

## 参照資料

### 外部資料

| 資料                                                             | この機能で参照する理由                       |
| ---------------------------------------------------------------- | -------------------------------------------- |
| [AT Protocol — HTTP API (XRPC)](https://atproto.com/specs/xrpc)  | API呼び出し、プロキシとHTTPエラーの前提      |
| [AT Protocol — Repository](https://atproto.com/specs/repository) | PDSに保存する公開レコードと参照関係          |
| [AT Protocol — DID](https://atproto.com/specs/did)               | アカウント識別とPDS解決の前提                |
| [AT Protocol — Blobs](https://atproto.com/specs/blob)            | 添付のBlobRef、CID、参照レコードと保持の関係 |

リンクの到達先と対象を2026-11-11に確認した。外部の説明は更新されるため、本リポジトリ固有の制約と外部仕様を区別する。現行実装の基準はこの文書の要件とし、外部仕様への追従で振る舞いを変える場合は差分を記録する。

### 関連する内部資料

- [設計判断](design.md)：採用理由、互換条件、失敗時の考え方。
- [導入時コメント原文](../../reference/comment-snapshot/appview-protocol.md)：基準コミットの出典を全件保存した履歴資料。
- [認証・セッション・姉妹アプリ連携](../auth-session/spec.md)：連携する機能の要件。
- [投稿・編集入力・下書き](../post-composer/spec.md)：連携する機能の要件。
- [モデレーション・年齢・通報](../moderation-privacy/spec.md)：連携する機能の要件。
