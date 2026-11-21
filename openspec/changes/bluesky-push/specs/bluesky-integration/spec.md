# Spec Delta

## MODIFIED Requirements

### Requirement: BSKY-01 データ境界

Blueskyは本人PDSのatproto-proxyから取得し、Nagi AppViewを中継・保存先にしてはならない（MUST）。例外として、Nagi AppViewはBlueskyの通知のPush（NOTIFY-08）のために、Pushを有効にした利用者宛ての公開された操作をJetstreamから受信し、配信の文面を作るためにBlueskyの公開APIを参照してよい。その場合も、Blueskyの投稿・表示名・操作の記録を保存してはならない（MUST NOT）。独自の表示型へ変換し、Nagi PostViewへの変換でBluesky URIをNagiリアクションAPIに渡す経路を作らない。Blueskyへの操作（いいね・リポスト・返信・引用・削除・ミュート・ブックマーク・通報）は本人PDSへ直接行い、Nagiのリアクション・返信の操作と見た目でも区別する。いいね・返信・リポスト・引用の数は取得しても捨て、画面のどこにも件数を出してはならない（MUST NOT）。

#### Scenario: Bluesky投稿の描画

- **WHEN** フィードと会話を取得する
- **THEN** 表示部品だけを再利用し、Nagiのリアクション・返信の操作を付けない
- **AND** Bluesky専用の操作だけを、自分がしたかどうかの状態とともに表示する

#### Scenario: 操作の送信先

- **WHEN** Bluesky投稿にいいね・リポスト・返信などの操作をする
- **THEN** 本人PDSへ送り、Nagi AppViewのAPIへBlueskyのURIを渡さない

#### Scenario: Pushのための受信

- **WHEN** Nagi AppViewがPushを有効にした利用者宛てのいいねをJetstreamから受け取る
- **THEN** Pushを配信し、そのいいねや対象投稿の内容をデータベースに保存しない
