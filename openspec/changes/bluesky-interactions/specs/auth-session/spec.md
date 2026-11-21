# Spec Delta

## MODIFIED Requirements

### Requirement: AUTH-03 最小権限と既存スコープ維持

Nagi namespaceは公開permission setを基準とし、別namespace・blob・新機能の互換用権限は明示する必要がある（MUST）。standard.siteは基本権限、Blueskyの閲覧と操作は同じオプトインとする。再認可では既存の有効化状態を落とさない。Bluesky投稿の要求権限は作成と削除とし、更新は要求しない。いいね・リポスト・返信と引用の許可設定は、付け外しに必要な範囲だけを要求する。ブロック・フォローの権限は要求してはならない（MUST NOT）。

#### Scenario: 追加機能の認可

- **WHEN** Bluesky連携を有効化して再認可する
- **THEN** 既存オプトインを含むscopeを要求し、戻った後に実際の付与を確認する

#### Scenario: 旧PDS

- **WHEN** rpcのaudを旧方式で照合するPDSを使う
- **THEN** 互換用のaud=*を使い、includeに重複したaudを付けない

#### Scenario: 要求しない権限

- **WHEN** Bluesky連携のscopeを組み立てる
- **THEN** Bluesky投稿のupdate、ブロック、フォローの権限を含めない

## ADDED Requirements

### Requirement: AUTH-08 Bluesky操作権限の再認可

Bluesky連携を以前に有効化したセッションが操作の権限を持たない場合、閲覧はそのまま使えるようにし、操作しようとしたときに再認可へ案内しなければならない（MUST）。操作の権限は閲覧の権限と別に、実際の付与scopeで判定する（AUTH-04）。再認可を求めるために閲覧を止めてはならない。

#### Scenario: 旧セッションでいいね

- **WHEN** 閲覧の権限だけを持つセッションでBluesky投稿のいいねを押す
- **THEN** 状態を変えずに、再認可が必要なことと再認可の操作を示す

#### Scenario: 再認可のキャンセル

- **WHEN** 再認可の画面で利用者がキャンセルする
- **THEN** 閲覧は今までどおり使え、操作の権限は付与されていないものとして扱う
