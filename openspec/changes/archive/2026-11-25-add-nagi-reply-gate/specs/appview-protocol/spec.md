# Spec Delta

## ADDED Requirements

### Requirement: API-12 返信の制限の取り込み

AppViewは、投稿の `replyGate` に反する直接の返信を表示用データに取り込んではならない（MUST NOT）。スレッド・フィード・通知のいずれにも出さない。`"nobody"` は投稿者本人の返信だけを、`"bot"` は投稿者本人とbotたんの返信だけを受け付ける。こっそり返信の作成では、反する返信を拒否する。PostViewには、閲覧者がその投稿へ返信できるかどうかを含める。

#### Scenario: 返信不可の投稿への他人の返信

- **WHEN** `replyGate: "nobody"` の投稿へ、他の利用者の返信レコードが届く
- **THEN** AppViewはその返信をスレッド・フィード・通知に出さない

#### Scenario: botたんのみの投稿へのbotたんの返信

- **WHEN** `replyGate: "bot"` の投稿へ、botたんの返信が届く
- **THEN** 通常どおり取り込んで表示する

#### Scenario: こっそり返信の拒否

- **WHEN** `replyGate` に反するこっそり返信の作成を求められる
- **THEN** AppViewは作成を拒否する
