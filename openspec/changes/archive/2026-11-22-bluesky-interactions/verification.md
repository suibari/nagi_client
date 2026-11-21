# Verification

2026-11-21に、作業ブランチ `suibari/plan-bluesky-interactions-notifications` で確認した。外部リポジトリnagi-lexiconの変更は、Orcaのワークツリー `bsky-affirmative-bot/bluesky-interaction-scopes`（ブランチ `suibari/bluesky-interaction-scopes`）で行った。

## 自動テスト

| 対象         | コマンド                                                                         | 結果                                                                                  |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 単体テスト   | `npx vitest run`                                                                 | 134ファイル・841件通過（9件skip）                                                     |
| 型・Svelte   | `npm run check`                                                                  | 23件のエラー。すべて今回触っていないテストの`node:fs`等の型定義不足で、変更前から同数 |
| ビルド       | `npm run build`                                                                  | 成功。SEO用の索引取得はローカルのAppViewが無いため失敗の記録のみ                      |
| 操作テスト   | `npx playwright test`                                                            | 185件通過・6件失敗・1件skip                                                           |
| nagi-lexicon | `pnpm build && pnpm test`（packages/nagi-lexicon）                               | 19件通過                                                                              |
| 仕様形式     | `npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive` | 24件すべて通過                                                                        |
| 文書のリンク | `node openspec/tools/comment-catalog.mjs --check`                                | 通過                                                                                  |

操作テストの失敗6件は、今回触っていない2ファイルのものである。`chronicle.spec.ts`は画面の文言が年表の改修で「year」から「month」に変わったのに追従していない。`guest-hero.spec.ts`は事前生成したHTMLを前提にしており、開発サーバーでは表示されない。変更前のコードで同じテストを流して確かめてはいない。

## 追加・更新した確認

- `tests/e2e/bsky-interactions.spec.ts`（14件）：いいね・リポストの付け外しと書き込む内容、件数とラベルの文字を出さないこと、失敗時に戻すこと、旧セッションで再認可を案内して書き込まないこと、返信・引用がBlueskyにだけ投稿されNagiの投稿・下書き保存が起きないこと、相手の投稿が消えていたら入力を残して止めること、書きかけの破棄の確認、Nagi経由の自分の投稿だけを削除できること、作者・スレッドのミュート、ブックマーク、Blueskyの公式モデレーションへの通報、引用に付ける返信と引用の制限、返信では返信の制限を出さないこと、後からの設定変更。
- `tests/e2e/crosspost-thread.spec.ts`（コピー削除の4件を追加）：既定ではコピーを消さないこと、選んだら分割分を末尾から全件消すこと、消せなかった分を知らせること、権限の無いセッションには選択肢を出さないこと。
- `tests/e2e/bsky-notifications.spec.ts`（6件）：タブの出し分け、Blueskyの未読の印、どちらのタブで既読にするか、いいねを1件ずつ件数なしで出すこと、対象外の種類と成人向けを出さないこと、会話をその場に開くこと、取得の失敗で一覧を消さないこと。
- 単体テスト：権限のaction判定（`scope-optin.test.ts`）、要求する権限（`client.test.ts`）、件数を持たない表示型（`mapView.test.ts`）、いいね・リポストの状態（`interactions.svelte.test.ts`）、分割コピーの辿り方（`crosspost-chain.test.ts`）、削除を呼べる場所の固定（`delete-paths.test.ts`）、通知の変換（`notifications.test.ts`）、threadgate／postgate（`gates.test.ts`）、クロスポスト後の設定付与（`after-post.test.ts`）。
- クライアントとnagi-lexiconの権限定義が一致することを、両方を読み込む一時的なテストで確かめた（リポジトリには残していない）。

## 確認していないこと

すべてモックのセッションとPDS・AppViewの応答で確かめた。本物のPDSとBluesky AppView、本番OAuthでは確認していない。主な境界は [known-gaps.md](../../../known-gaps.md) の「Blueskyの操作・通知タブの確認境界」に記す。スマホ幅の画面は、操作列・メニュー・返信と引用の入力欄・通知タブをPlaywrightの画面写真で目視した。
