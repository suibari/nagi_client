# 認証・セッション・姉妹アプリ連携

## Purpose

OAuthの復元、権限の追加、デプロイ先のorigin、姉妹アプリへの遷移を定義する。

この仕様は導入時点の実装・コメントから復元した現状の基準である。根拠と詳細な設計判断は [design.md](design.md)、確認された不整合は [known-gaps.md](../../known-gaps.md) を参照する。記載するシナリオは確認条件であり、今回すべての外部サービスを実行検証したという意味ではない。

## Requirements

### Requirement: AUTH-01 正規originと遅延初期化

クライアントは本番では https://nagi.suibari.com、Vercel Previewでは VERCEL_BRANCH_URL の固定ブランチoriginをOAuthの基準にしなければならない（MUST）。client_idは /client-metadata.json、callbackは /oauth/callback とする。Previewのホスト指定が無い・不正なら構成エラーとする。IndexedDBを開くOAuthクライアントはブラウザ内だけで生成し、共有する。

#### Scenario: Previewの固有URLから開く

- **WHEN** loopback以外の非正規originで認証を開始する
- **THEN** pathname・query・hashを保って正規originへ移動する

#### Scenario: 静的生成

- **WHEN** ブラウザのlocationが無い
- **THEN** OAuthクライアントを生成しない

### Requirement: AUTH-02 復元と初回描画

認証の真実源はIndexedDBのOAuthセッションでなければならない（MUST）。localStorageの既往サインインmarkerは初回ヒーローのちらつき抑止と復元補助にだけ使い、認可の証拠にしてはならない。通信だけのrefresh失敗ではmarkerから復元を試み、元の分類可能なエラーを保持する。

#### Scenario: サインイン済みの再訪

- **WHEN** 非同期の復元がまだ終わっていない
- **THEN** 静的な未ログイン向けヒーローを初回描画から隠し、確認後に状態を確定する

#### Scenario: ストレージ利用不可

- **WHEN** markerの読み書きが失敗する
- **THEN** markerの失敗だけではOAuthの成否を変えない

### Requirement: AUTH-03 最小権限と既存スコープ維持

Nagi namespaceは公開permission setを基準とし、別namespace・blob・新機能の互換用権限は明示する必要がある（MUST）。standard.siteは基本権限、Blueskyの作成と閲覧は同じオプトインとする。再認可では既存の有効化状態を落とさない。Bluesky投稿の要求権限はcreate限定とする。削除の補償処理との不整合は [known-gaps.md](../../known-gaps.md#gap-01) に記録する。

#### Scenario: 追加機能の認可

- **WHEN** Bluesky連携を有効化して再認可する
- **THEN** 既存オプトインを含むscopeを要求し、戻った後に実際の付与を確認する

#### Scenario: 旧PDS

- **WHEN** rpcのaudを旧方式で照合するPDSを使う
- **THEN** 互換用のaud=*を使い、includeに重複したaudを付けない

### Requirement: AUTH-04 端末オプトインの確定

オプトインは端末フラグと実際の付与スコープの両方を必要としなければならない（MUST）。リダイレクト前のpendingだけでは有効にしない。書き込み権限と後から追加された閲覧権限は別々に判定する。旧セッションの広いscopeとの互換のため、既存の付与判定はaction/audを除いたスコープ名で比較する。

#### Scenario: 認可キャンセル

- **WHEN** pendingは残るが必要scopeが付与されていない
- **THEN** 有効化を確定しない

#### Scenario: 書き込みのみ付与された旧セッション

- **WHEN** クロスポスト権限はあるが閲覧権限が無い
- **THEN** Blueskyフィードを閲覧可能とみなさない

### Requirement: AUTH-05 サインアウト順序

サインアウトは有効なセッションが必要な端末Push解除を先に試み、その失敗にかかわらずセッション終了を進めなければならない（MUST）。アカウント作成はBluesky Entrywayから開始し、対応するPDSには表示言語を引き継ぐ。

#### Scenario: Push解除失敗

- **WHEN** 解除APIが失敗してからサインアウトする
- **THEN** サインアウト自体を完了する

### Requirement: AUTH-06 姉妹アプリへのヒントとチケット

閲覧者DIDのヒントは許可したcanonical originだけに付け、既存didを尊重しなければならない（MUST）。60秒有効のSSOチケットはクリック時に取得し、失敗時はDIDヒント付きの通常OAuth導線へ戻す。修飾キー操作はブラウザに任せ、新規タブは同期で開いてopenerを切る。

#### Scenario: 無関係な外部リンク

- **WHEN** 許可origin以外へ移動する
- **THEN** 閲覧者DIDを付加しない

#### Scenario: チケット取得の403

- **WHEN** permission setの反映待ちで取得できない
- **THEN** 元のリンクを壊さずDIDヒント経路で移動する
