# Tasks

## 1. 実装

- [x] 1.1 `src/lib/sso/links.ts` の `SSO_APPS` に Nagi Space を加え、チケットの受け口をアプリごとに持たせ、受け口の無いアプリ宛のクリックを横取りしない（完了の確認：`src/lib/sso/links.test.ts` で、Nagi Space の URL に DID ヒントが付き、無関係な URL には付かないこと、Nagi Space 宛のクリックでチケットを取得せず、お部屋宛では取得することが通る）
- [x] 1.2 主仕様の AUTH-06 と `design.md` の D4（チケットを使う先の規則）を同期する（完了の確認：`openspec validate --all --strict` が通る）

## 2. 外部（参考）

- Nagi AppView の `PASSPORT_AUDIENCES` には加えない（Nagi Space はチケットを使わない）。
