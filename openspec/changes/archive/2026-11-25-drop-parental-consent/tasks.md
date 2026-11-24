# Tasks

## 1. AppView（別リポジトリ、先に公開）

- [x] 1.1 `declareBirthDate` から18歳未満の保護者同意の検証を外し、`parental_consent_at` を書かない。関連テストを更新する
- [x] 1.2 lexiconの型の `parentalConsent` の説明を、受け付けるが使わない旨に改める
- [x] 1.3 （Open Questionsの決定による）既存の `parental_consent_at` を消すマイグレーションを追加する
- [x] 1.4 AppViewを公開する

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

- AppViewの変更は [PR #181](https://github.com/suibari/bot-tan-core/pull/181) でマージ済み。実装コミット `a721b9e1` は、[2026-11-25のバックエンドの本番デプロイ](../2026-11-25-crosspost-long-post-teaser/tasks.md) に含まれる `d735919e` の祖先であることを確認した。デプロイスクリプトは共有パッケージに差分があるとAppViewを再起動してからlexiconを公開する。
- 1.3のSQL（`0106_nagi_drop_parental_consent.sql`）は手動適用用。通常のデプロイでは実行されず、本番DBへの適用有無は未確認。作業は運営者が扱う。本番アカウントでの生年月日の申告も未検証。
- AppViewの検証削除は既存の純粋関数テストとビルドで確認した。DBを通す申告のテストは追加していない。
- 主仕様（AUTH-07、MOD-01）とdesign.md（moderation-privacy D1a）は実装と同時に手で同期済み。archiveは `archive --skip-specs` で行う。
- `pnpm check` は `@types/node` が無い環境由来の既存エラーで失敗する（追加テストの `node:fs` で1件増えて20件）。
