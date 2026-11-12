# Tasks

## 1. AppView（別リポジトリ）

- [x] 1.1 AppViewの作業ツリーを `orca worktree create` で用意し、投稿更新時に編集済み・翻訳・bot判定・通知を再実行している箇所を特定する。確認結果をこのchangeのdesign.mdのContextへ追記して完了とする
- [x] 1.2 内容フィールドの差分だけで編集と判定するよう変更し、`crosspost` だけの更新が編集にならないテストと、本文を含む更新が編集になるテストが通ることを確認する
- [x] 1.3 lexiconの全フィールドが「内容」か「付帯」に分類済みであることを検証するテストを追加し、未分類フィールドがあると失敗することを確認する
- [x] 1.4 返信・引用の取り込みが親投稿のCIDの一致を必須にしていないことを確認し、結果をdesign.mdのRisksへ追記する
- [x] 1.5 AppViewを本番へ反映する。本番での投稿確認は行わず、使い捨てのローカルDB（`nagi_edit_test`）で `applyMutation` を通す結合テスト `postEditIngest.postgres.test.ts` に置き換えた。参照だけの追記で `edited`・判定・翻訳が保たれ、本文の変更では編集になることを確認し、変更前のコードでは前者が失敗することも確かめた

## 2. クライアントの送信順序

- [x] 2.1 `records.ts` に、作成済みのNagi投稿へ `crosspost` を `swapRecord` 付きで追記し、競合時は読み直して1回だけ再試行する処理を追加する。成功・競合後成功・再失敗のユニットテストが通ることを確認する
- [x] 2.2 `crosspostToBluesky` から失敗時の削除を外し、途中まで作成した分を結果として返せるようにする。途中失敗で削除APIを呼ばないユニットテストが通ることを確認する
- [x] 2.3 Composerの通常投稿を「Nagi保存 → Bluesky作成 → 参照追記」の順に改め、各失敗時の警告文言をi18nに追加する。BSKY-06の5シナリオに対応するテストが通ることを確認する
- [x] 2.4 `deleteBlueskyPosts` と関連する説明コメントを削除し、`grep -rn deleteBlueskyPosts src` が0件になることを確認する
- [x] 2.5 `pnpm test`・`pnpm check`・E2Eを確認する。`pnpm test` は全件成功。`pnpm check` は今回の変更と無関係な `@types/node` 未解決の19件だけが残る。E2Eはクロスポストの9件（保存順序、Nagi保存失敗、分割の途中失敗、参照追記の失敗を含む）を含む124件が成功し、事前生成HTMLを前提とするguest-heroの4件だけが開発サーバーでは失敗する

## 3. 仕様書の同期

- [x] 3.1 `bluesky-integration/design.md` のD4を新しい順序と理由（D1・D2）に書き換え、`appview-protocol/design.md` に編集判定の判断を追加する
- [x] 3.2 `known-gaps.md` のGAP-01を解消済みとして更新し、一覧表の「コード・コメントの扱い」を実装済みの状態に直す
- [x] 3.3 `npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive` と `node openspec/tools/comment-catalog.mjs --check` が通ることを確認する

## Workflow follow-up

- 主仕様（BSKY-06・API-09）は実装と同時に手で同期済み。本番での動作確認は行わない方針とし、クライアントの本番反映後に `archive --skip-specs` でarchiveする。
- 実装中に、投稿成功後の警告がモーダルと一緒に閉じて見えない既存の不具合を見つけた。BSKY-06の「警告で伝える」を満たすため、投稿完了の案内（PostFollowNotice）に警告を載せるよう直した。
