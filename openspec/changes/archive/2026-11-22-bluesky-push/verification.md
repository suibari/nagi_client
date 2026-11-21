# Verification

2026-11-21に確認した。クライアントは作業ブランチ `suibari/plan-bluesky-interactions-notifications`、AppViewとnagi-lexiconはOrcaのワークツリー `bsky-affirmative-bot/bluesky-push`（ブランチ `suibari/bluesky-push`）で変更した。

## 自動テスト

| 対象                     | コマンド                                                                         | 結果                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| AppViewの単体テスト      | `npx tsx --test $(ls test/*.test.ts \| grep -v postgres)`（apps/nagi_appview）   | 519件通過・0件失敗                                                                          |
| AppViewのビルド          | `pnpm build`（apps/nagi_appview）                                                | 成功                                                                                        |
| nagi-lexicon             | `pnpm build && pnpm test`（packages/nagi-lexicon）                               | 18件通過                                                                                    |
| クライアントの単体テスト | `npx vitest run`                                                                 | 135ファイル・853件通過                                                                      |
| 型・Svelte               | `npm run check`                                                                  | 23件のエラー。すべて今回触っていないテストの型定義不足で、変更前から同数                    |
| ビルド                   | `npm run build`                                                                  | 成功                                                                                        |
| 操作テスト               | `npx playwright test`                                                            | 187件通過・6件失敗・1件skip。失敗は以前からの`chronicle.spec.ts`と`guest-hero.spec.ts`の6件 |
| 仕様形式                 | `npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive` | 24件すべて通過                                                                              |
| 文書のリンク             | `node openspec/tools/comment-catalog.mjs --check`                                | 通過                                                                                        |

PostgreSQLを使うAppViewのテスト（`*.postgres.test.ts`）は、使い捨てのデータベースを用意していないため流していない。

## 追加した確認

- AppView `test/blueskyPushTargets.test.ts`：いいね・リポスト・フォローの宛先、Pushを有効にしていない人と本人の操作を除くこと、返信・引用・メンションを兼ねた投稿で1件だけにすること、`recordWithMedia`の引用とセルフラベル、作成以外のイベントを無視すること、tagと開く先。
- AppView `test/notificationPreferences.test.ts`：Blueskyのカテゴリは未設定ならPushしないこと、Nagiの通知欄の絞り込みに入れないこと。
- クライアント `src/lib/notifications/preferences.test.ts`：BlueskyのPushの既定オフと保存の形。
- クライアント `tests/e2e/bsky-push-settings.spec.ts`：Bluesky連携をしている人にだけ設定を出し、6種類とも初期はオフで、ミュートが反映されない旨を表示し、切り替えるとpushだけを保存すること。

## 確認していないこと

自作のJetstream proxyからの実際の受信、本物のWeb Pushの配信と端末での表示、公開APIでのブロック判定・表示名・本文の取得は、本番の環境で確かめていない。配信を組み立てて送る部分（`deliver`）は、通知設定・年齢・購読をデータベースから読むため、単体テストでは通していない。詳細は [known-gaps.md](../../../known-gaps.md) の「BlueskyのPushの確認境界」に記す。
