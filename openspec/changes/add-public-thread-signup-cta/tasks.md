# Tasks

## 1. 仕様と設計

- [x] 1.1 上流 main の投稿詳細とニュース・ブログ個別ページの既存導線を照合し、差分仕様を `openspec validate add-public-thread-signup-cta --strict` で検証する。

## 2. 投稿詳細

- [x] 2.1 投稿詳細に共通の `GuestHero` を配置し、公開投稿・認証の条件、既存ログイン画面への遷移、ログイン済みの会話表示をPlaywrightで検証する。
- [x] 2.2 主仕様・設計に反映し、既知の不整合を確認する。型検査・単体テスト・OpenSpec文書の整合性を検証する。
