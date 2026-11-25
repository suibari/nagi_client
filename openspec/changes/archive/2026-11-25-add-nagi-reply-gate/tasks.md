# Tasks

## 1. lexicon・AppView（別リポジトリ）

- [x] 1.1 `orca worktree create` でAppViewの作業ツリーを用意し、`packages/nagi-lexicon` の `com.suibari.nagi.post` と記事の `nagi` 拡張に `replyGate`（`"bot" | "nobody"`）を追加する。型生成とlexiconのテストが通ることを確認する
- [x] 1.2 取り込みで親投稿の `replyGate` に反する返信を表示用データから除外し、通知も出さないようにする。nobody・bot・本人・botたんの組み合わせのテストが通ることを確認する
- [x] 1.3 `createKossoriPost` で反する返信を拒否する。拒否と許可のテストが通ることを確認する
- [x] 1.4 PostViewに閲覧者が返信できるかどうかを追加し、テストで確認する
- [ ] 1.5 AppViewを本番へ反映する（lexiconの公開 `lex:publish` を含む）

## 2. クライアント

- [x] 2.1 返信できる人の保存・復元を追加し（`localStorage`、失敗時は「誰でも」）、ユニットテストで確認する
- [x] 2.2 `postSilentFlags` を返信できる人とサイレントリプライから `botSilent`・`silentReply`・`replyGate` を決める形に改め、POST-10・POST-12の全シナリオのユニットテストが通ることを確認する
- [x] 2.3 `records.ts` の投稿・こっそり投稿・記事の書き込みに `replyGate` を加え、テストで確認する
- [x] 2.4 `PostScopeDialog` に返信できる人の3択と、返信時のサイレントリプライのトグルを追加する。編集では出さない。i18n（ja/en）を追加する
- [x] 2.5 `Composer` の送信ボタン横のトグル2つを撤去し、公開範囲ボタンに制限中の表示を足す
- [x] 2.6 投稿表示でPostViewの値に従って返信ボタンを出し分ける（FEED-11）
- [x] 2.7 `pnpm test`・`pnpm check`・関連するE2Eを確認する

## 3. 仕様書の同期

- [x] 3.1 `post-composer`・`feed-thread`・`appview-protocol` のspec.mdとdesign.mdを実装と一致させる（post-composer D7の更新を含む）
- [x] 3.2 `npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive` と `node openspec/tools/comment-catalog.mjs --check` が通ることを確認する

## 4. 3行日記への拡張（利用者確認、2026-11-25）

- [x] 4.1 `com.suibari.trilinesat.diary` に `replyGate` を追加し、投稿形への射影で引き継ぐ。lexiconのテストで確認する
- [x] 4.2 日記の返信不可で他人の返信とbotたんの返信ジョブを受け付けないことを結合テストで確認する（制限なしの日記ではジョブが積まれることも確かめる）
- [x] 4.3 3行日記の入力で通常の投稿と同じ選択を使い、日記レコードに書く。ユニットテストとE2Eで確認する

## 実施記録

- 1.2〜1.4：使い捨てのローカルDB（`nagi_reply_gate_test`）で `applyMutation` と `createKossoriPost` を通す結合テスト `replyGate.postgres.test.ts` の6件が成功。返信が親投稿より先に届く場合も確かめた。bot側も `decideNagiReplyJob` と `onNagiPost` で同じ判定をする。AppViewのunitテスト（521件成功、postgres系は環境変数がなくskip）とbotサーバーのテスト（116件成功）も通った。
- 2.7：`pnpm test` は全件成功。`pnpm check` は既存のテストファイルにある `@types/node` 未解決の23件だけで、今回の変更ファイルにエラーはない。E2Eは公開範囲モーダルの新しいspec `reply-gate.spec.ts` を含む関連72件が成功。`feed-interactions` のスワイプの1件が一度だけ失敗し、単独の再実行では成功した。FEED-11の返信ボタンの出し分けにはE2Eを書いていない。

## Workflow follow-up

- 主仕様（POST-10・POST-12・FEED-11・API-12）とdesign.mdは実装と同時に同期済みのため、アーカイブでは差分仕様を再適用していない。
- 1.5（AppViewの本番反映とlexiconの公開 `lex:publish`・`lex:publish:trilinesat`）は利用者が実施する。アーカイブの時点では未実施。クライアントの本番反映はAppViewの後に行う。
