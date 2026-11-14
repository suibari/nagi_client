# Tasks

## 1. AppView（別リポジトリ）

- [x] 1.1 `drawCard` で `source: "reaction"` を拒否し、drawStatusからリアクション枠を外す。`reactionCardEligibility` と関連テストを整理する
- [x] 1.2 `CARD_SHELF_AAR_PRICE` を300にする。関連テストを更新する
- [x] 1.3 lexiconの `source` の説明に、`reaction` は過去のデータだけに現れる旨を書く
- [x] 1.4 `docs/zenkatsu.md` の供給前提（1.5枚/日）と13.3・13.8の価格の根拠を更新する
- [ ] 1.5 AppViewを公開する（運営者）

## 2. クライアント

- [x] 2.1 `ReactionBar` からリアクション後のドロー呼び出しを外し、`reaction-reward.svelte.ts`・`ReactionCardRewardHost`・`CardReactionGuideDialog` を削除する
- [x] 2.2 `CardDrawEntry`・`CardDrawBanner`・`CardDrawFab`・`CardDetailDialog` から「Next: リアクションでもう一枚！」と関連の分岐を外す
- [x] 2.3 リアクション枠の文言（`cardReaction*`）を ja・en から削除し、「1日最大2枚」のコメントを直す
- [x] 2.4 `BOT_AAR_PRICE` を300にする
- [x] 2.5 `drawCard` の型から `source: 'reaction'` の呼び出しを外す（既存データを読む型の `reaction` は残す）
- [x] 2.6 `/dev/cards` のリアクション枠のモックを整理する

## 3. テストと仕様の同期

- [x] 3.1 リアクションしてもドローを呼ばないこと、ヘルプが300Ƶを示すことをテストで確かめる
- [x] 3.2 カード取得の入口とカード詳細のスクリーンショットを確認する
- [x] 3.3 `pnpm test`・`pnpm check` を確認する
- [x] 3.4 主仕様（cards-zenkatsu の spec.md・design.md）を同期し、`openspec validate --all --strict` と `comment-catalog.mjs --check` を通す

## Workflow follow-up

- AppViewの変更は `bsky-affirmative-bot` の `suibari/drop-reaction-card-draw` ブランチ（worktree `orca/workspaces/bsky-affirmative-bot/drop-reaction-card-draw`）。1.5の公開は運営者が行う。
- AppViewのテストは、`.env` を読ませて全536件中500件が成功した。失敗した5件は `moderationNotify`・`timelineOrder` で、カードとは関係なく、手元の `.env` に由来する。
- 3.2はスマホ幅の `/dev/cards` でカード取得バナーを確認した。おすそわけボードのヘルプは認証が必要なため、`BOT_AAR_PRICE` のテストで確認した。
- 主仕様（CARD-02、CARD-07）と design.md（D2a）は実装と同時に手で同期した。archiveは `archive --skip-specs` で行う。
- `pnpm check` で残るエラーは、`@types/node` が無い環境に由来する既存のもの（19件）。
