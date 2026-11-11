# AppView通信・AT Protocolレコード

## Purpose

通信の認証境界、公開レコード、リッチテキスト・embed、型の意味を定義する。

この仕様は導入時点の実装・コメントから復元した現状の基準である。根拠と詳細な設計判断は [design.md](design.md)、確認された不整合は [known-gaps.md](../../known-gaps.md) を参照する。記載するシナリオは確認条件であり、今回すべての外部サービスを実行検証したという意味ではない。

## Requirements

### Requirement: API-01 通信経路と認可エラー

認証を要するAppView通信は利用者のPDSへのatproto-proxyを使い、未ログインまたはauth:noneではAppViewへ直接取得しなければならない（MUST）。独自getServiceAuth経路を復活させない。HTTPステータス・エラーコードを保持し、401/403とscope/permission由来の400を認可エラーとして識別する。

#### Scenario: 認証付き取得

- **WHEN** セッションがあり本人情報を必要とする
- **THEN** PDS経由でviewerを伝える

#### Scenario: 開発用直接通信

- **WHEN** devかつPUBLIC_APPVIEW_DIRECT=true
- **THEN** 同一originのVite proxyを使いx-viewer-didを渡す。本番ではこの経路を有効にしない

### Requirement: API-02 公開フォールバック

公開フォールバックを指定した取得だけは、認証・認可の拒否時に匿名取得を試みなければならない（MUST）。これは公開直後のpermission setキャッシュとの互換策であり、認証必須API全般の迂回ではない。本人専用情報が消えた結果を権限付与済みとみなさない。

#### Scenario: 公開コレクションの認可待ち

- **WHEN** 認証付きgetが403になる
- **THEN** 公開内容は表示し、本人専用のdrawStatusなどは未確認扱いにする

#### Scenario: 一般の通信エラー

- **WHEN** 公開フォールバック対象で通信障害が起きる
- **THEN** 認可拒否と同一の理由に書き換えない

### Requirement: API-03 公開PDS解決と外部レコード

公開レコードの読み取りはdid:plc/did:webからPDSを解決し、認証不要のgetRecord/listRecordsで行わなければならない（MUST）。App Linksは本人がcurateしたcollection・キーパスだけを表示し、repeat配列の展開上限を守る。

#### Scenario: 外部アプリの連携表示

- **WHEN** プロフィール所有者がApp Linksを設定する
- **THEN** 指定されたレコードと宣言済みフィールドから描画する

#### Scenario: レコード不存在

- **WHEN** 公開getRecordの対象が無い
- **THEN** 不存在を返し、プロフィール全体を停止させない

### Requirement: API-04 レコード書き込みと取り込み

公開投稿は本人のPDS、こっそり投稿はAppViewを正本として扱わなければならない（MUST）。PDS書き込み後はensureRecordで即時取り込みを補助し、その失敗で保存済み操作を巻き戻さない。削除時は取得できれば削除前CIDを保持して通知し、CIDの取得失敗だけで削除を止めない。

#### Scenario: firehoseの停止

- **WHEN** 自分の公開レコードを作成または更新する
- **THEN** ensureRecordで現在状態の取得を促す

#### Scenario: こっそり投稿

- **WHEN** AppView正本への保存が完了する
- **THEN** 本人PDSからのensureRecordを要求しない

### Requirement: API-05 リッチテキストの位置と安全な描画

facetはUTF-8バイト範囲で保存し、入力欄の文字位置と混同してはならない（MUST）。見出し追加やCWの区切り操作時は選択位置を補正する。コードフェンスの中は記法・リンクを解釈しない。自動リンク・画像のURLから危険なschemeを描画可能にしない。

#### Scenario: 日本語と絵文字を含む本文編集

- **WHEN** 保存facetを編集入力へ戻す
- **THEN** mention位置と名前付きMarkdownリンクを復元する

#### Scenario: CW区切りの移動

- **WHEN** 選択範囲を||で囲む、解除する、別範囲へ移す
- **THEN** 既存の1組を扱い、mention等の範囲を壊さない

### Requirement: API-06 embedの組み立てと互換読み取り

画像・動画・引用の読み書きはpost-embedの共通規則に従わなければならない（MUST）。引用ありはquote、画像と動画はgallery、画像だけはimages、動画だけはvideoとし、galleryは画像→動画の順にする。記事本文のCIDはCIDv1/raw/sha2-256で計算し、公開前にPDSの結果と照合する。

#### Scenario: 画像と動画の併用

- **WHEN** 引用なしで両方を添付する
- **THEN** galleryに画像、動画の順で保存する

#### Scenario: 本文CID不一致

- **WHEN** ローカルで計算した画像CIDとuploadBlobのCIDが異なる
- **THEN** 壊れた画像URLを公開する前に送信を止める

### Requirement: API-07 型に記録された契約

APIのoptional項目、本人にだけ返る項目、合成URI、時刻、ページング、旧レスポンスの意味は同分野のdesign.mdのsrc/lib/api/types.ts出典を保持しなければならない（MUST）。型に値が存在しないことをゼロ・未読・公開許可と読み替えない。サーバ実装はこのリポジトリで検証済みとは扱わない。

#### Scenario: 旧レスポンス

- **WHEN** 新規optionalフィールドが無い
- **THEN** 対応する機能の未確認・互換フォールバック規則を使う

### Requirement: API-08 サジェストの競合制御

mention・タグ・絵文字等の先行入力検索は共通のdebounce、queryキャッシュ、古い応答の排除を使わなければならない（MUST）。設定された場合は最初の1文字を即時検索し、待機中は前回候補を新しいqueryで絞ってちらつきを抑える。

#### Scenario: 検索中の追加入力

- **WHEN** 先のqueryの応答が後から返る
- **THEN** 現在queryの候補を古い結果で上書きしない
