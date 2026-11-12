# Tasks

## 1. 実装

- [x] 1.1 `Landing.svelte` と `JoinFinale.svelte` の参加ボタンの移動先を `/login` にする
- [x] 1.2 ログイン画面の「はじめての方」の節から `id="signup"` と、アンカー用の `scroll-margin-top` を外す

## 2. テストと仕様の同期

- [x] 2.1 `privacy.test.ts` の参加リンクの期待値を `/login` に更新し、`/login#signup` を使わないことを確かめる
- [x] 2.2 スマホ幅でランディングからログイン画面を開き、先頭から表示されることをスクリーンショットで確認する
- [x] 2.3 `pnpm test`・`pnpm check` を確認する
- [x] 2.4 主仕様（auth-session の spec.md の機能一覧・AUTH-07、design.md）を同期し、`openspec validate --all --strict` と `comment-catalog.mjs --check` を通す
