# Spec Delta

## ADDED Requirements

### Requirement: BSKY-15 Pushのための受信の境界

BSKY-01の例外として、Nagi AppViewはBlueskyの通知のPush（NOTIFY-08）のためにだけ、Pushを有効にした利用者宛ての公開された操作をJetstreamから受信し、配信の文面を作るためにBlueskyの公開APIを参照してよい（MAY）。その場合も、Blueskyの投稿・表示名・操作の記録をデータベースに保存してはならない（MUST NOT）。保存してよいのは、Pushを受け取る種類の設定だけとする。

#### Scenario: Pushのための受信

- **WHEN** Nagi AppViewがPushを有効にした利用者宛てのいいねをJetstreamから受け取る
- **THEN** Pushを配信し、そのいいねや対象投稿の内容をデータベースに保存しない

#### Scenario: Pushを有効にしていない利用者

- **WHEN** Pushを有効にしていない利用者宛ての返信をJetstreamから受け取る
- **THEN** 何も取得・配信しない
