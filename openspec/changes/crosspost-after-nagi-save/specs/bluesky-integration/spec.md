# Spec Delta

## MODIFIED Requirements

### Requirement: BSKY-06 作成順序と補償の限界

通常投稿のBlueskyコピーはNagi投稿の保存が成功した後に作り、作成できたコピーの強参照をNagi投稿へ追記しなければならない（MUST）。Nagi保存に失敗したらBlueskyへ何も作らない。Bluesky投稿の権限はcreate限定とし、作成したコピーを削除して巻き戻してはならず、そのために権限を追加してもならない。コピー作成・分割の途中・参照追記のいずれが失敗しても、Nagi投稿は成功のまま扱い、Bluesky側の状態を警告で伝える。記事ティーザーは公開URLが要るため記事作成後に出し、失敗で記事を巻き戻さない。

#### Scenario: Bluesky側の作成失敗

- **WHEN** Nagi保存後に通常コピーを1件も作れない
- **THEN** Nagi投稿は成功のまま表示し、Blueskyへ投稿できなかったことを警告で伝える

#### Scenario: Nagi側の作成失敗

- **WHEN** クロスポストを選んだ投稿のNagi保存が失敗する
- **THEN** Blueskyへは何も作らず、削除も試みずに投稿エラーを伝える

#### Scenario: 分割投稿の途中失敗

- **WHEN** 分割したBluesky投稿の一部だけが作成できた
- **THEN** 作成済みの分を削除せず、Nagi投稿へ参照を追記せず、Blueskyに途中までのコピーが残ったことを警告で伝える

#### Scenario: 参照追記の失敗

- **WHEN** Blueskyのコピーは揃ったが、Nagi投稿へのコピー参照の追記が失敗する
- **THEN** Nagi投稿とBlueskyのコピーは残したまま、Nagi上でBlueskyへの返信・引用を続けられないことを警告で伝える

#### Scenario: 権限の範囲

- **WHEN** クロスポストのためにOAuth権限を要求する
- **THEN** Bluesky投稿についてはcreateだけを要求し、update・deleteを要求しない
