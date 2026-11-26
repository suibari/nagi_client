## MODIFIED Requirements

### Requirement: AUTH-06 姉妹アプリへのヒントとチケット

閲覧者DIDのヒントは許可したcanonical originだけに付け、既存didを尊重しなければならない（MUST）。許可するoriginは、botたんのお部屋（https://room.bot-tan.com）とNagi Space（https://space.nagi.suibari.com）とする。60秒有効のSSOチケットはクリック時に取得し、失敗時はDIDヒント付きの通常OAuth導線へ戻す。修飾キー操作はブラウザに任せ、新規タブは同期で開いてopenerを切る。

#### Scenario: 無関係な外部リンク

- **WHEN** 許可origin以外へ移動する
- **THEN** 閲覧者DIDを付加しない

#### Scenario: チケット取得の403

- **WHEN** permission setの反映待ちで取得できない
- **THEN** 元のリンクを壊さずDIDヒント経路で移動する

#### Scenario: Nagi Space へのリンク

- **WHEN** ログイン中の閲覧者が、投稿内の Nagi Space の URL（リンクカードや本文のリンク）を開く
- **THEN** URL に閲覧者の DID ヒント（`?did=`）が付き、Nagi Space はハンドルの入力を省いて認可へ進む
