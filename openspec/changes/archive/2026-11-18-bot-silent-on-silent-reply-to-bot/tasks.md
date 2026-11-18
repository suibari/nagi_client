# Tasks

## 1. クライアント

- [x] 1.1 送信時、返信先がbotたん（`isBot`）かつサイレントリプライONなら `botSilent: true` を渡す。通常投稿・こっそり投稿の両方でレコード（入力）に載ることをテストで確認する
- [x] 1.2 返信先がbotたんのとき、サイレントリプライのボタンの説明文（tooltip・aria-label）をbotたんも返信しない旨の文言にする（ja/en）

## 2. 検証と文書

- [x] 2.1 POST-10の各シナリオを単体テストで確認し、型検査・テストを通す
- [x] 2.2 主仕様（post-composer の機能一覧とPOST-10）と design.md を実装と一致させ、OpenSpecのstrict検証を実行する

## Workflow follow-up

- 完了後、主仕様への反映を確認してchangeをarchiveする。
