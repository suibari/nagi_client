# Tasks

## 1. AppView（別リポジトリ、先に公開）

- [x] 1.1 `declareBirthDate` から18歳未満の保護者同意の検証を外し、`parental_consent_at` を書かない。関連テストを更新する
- [x] 1.2 lexiconの型の `parentalConsent` の説明を、受け付けるが使わない旨に改める
- [x] 1.3 （Open Questionsの決定による）既存の `parental_consent_at` を消すマイグレーションを追加する
- [ ] 1.4 AppViewを公開する

## 2. クライアント

- [x] 2.1 ログイン画面から年齢の告知を外し、`loginAgeNotice` を削除する
- [x] 2.2 ゲスト投稿の同意文から保護者の同意を外す（ja・en）
- [x] 2.3 申告フォームから保護者の同意のスイッチ、`parentalConsent` の送信、`consent_required` の分岐と文言を削除する
- [x] 2.4 利用規約（要約・第2条）とプライバシーポリシー（第5節の段落・第10節）から保護者の同意を外す（ja・en）
- [x] 2.5 `LEGAL_LAST_UPDATED` を更新する

## 3. テストと仕様の同期

- [x] 3.1 ログイン画面・ゲスト投稿・申告フォーム・規約・ポリシーに保護者の同意の記述が無いことをテストで確かめる
- [x] 3.2 ログイン画面（iPhone 13・iPhone SE相当）と申告フォームのスクリーンショットを確認する
- [x] 3.3 `pnpm test`・`pnpm check` を確認する
- [x] 3.4 主仕様（auth-session・moderation-privacy の spec.md・design.md）を同期し、`openspec validate --all --strict` と `comment-catalog.mjs --check` を通す

## Workflow follow-up

- AppViewの変更は `bsky-affirmative-bot` の `suibari/drop-parental-consent` ブランチ。1.3は手動適用用のSQL（`0106_nagi_drop_parental_consent.sql`）として記録した。本番DBへの適用と1.4の公開は運営者が行う。
- AppViewの検証削除は既存の純粋関数テストとビルドで確認した。DBを通す申告のテストは追加していない。
- 主仕様（AUTH-07、MOD-01）とdesign.md（moderation-privacy D1a）は実装と同時に手で同期済み。archiveは `archive --skip-specs` で行う。
- `pnpm check` は `@types/node` が無い環境由来の既存エラーで失敗する（追加テストの `node:fs` で1件増えて20件）。
