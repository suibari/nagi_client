# Tasks

## 1. lexicon・AppView・bot（別リポジトリ）

- [x] 1.1 lexiconに `com.suibari.nagi.getRecommended` を追加し、タブの `source` に `recommended` を加える
- [x] 1.2 AppViewの `parseFeedTabs` と旧タブの変換で `recommended` を受け付け、`affirmation` を `recommended` に読み替える。読み替えのテストが通ることを確認する
- [x] 1.3 興味ベクトルの表（`actor_interest_probes` 仮称）を追加し、botの分析ジョブ（`source: 'bluesky'`）で返信を除く直近10件の埋め込みを保存する。Nagiの埋め込み済み投稿が5件以上になったら削除する処理とテストを用意する
- [x] 1.4 `getRecommended` を実装する。可視性条件は `timelineVisibilityFilters` を共有し、候補（興味の最近傍距離が閾値以内、または本人とbotたんを除く5人以上の反応）、botたんの投稿の除外、1人1日1件の代表選び（興味に近い投稿の中で近い順→反応人数→新しさ）、新しい順のページングをテストで確認する
- [ ] 1.5 AppView・botを本番へ反映する（未実施）

## 2. クライアント

- [x] 2.1 タブの型・既定・組み込みid・正規化を `recommended` に変え、`affirmation` の読み替えと重複除去のテストを追加する
- [x] 2.2 `resolve.ts` におすすめの取得仕様（`getRecommended`、楽観表示なし、未読位置、未サインインの案内）を追加し、テストを更新する
- [x] 2.3 `/affirmation` と `?tab=affirmation` がおすすめを開くようにする
- [x] 2.4 i18n（タブ名「おすすめ / For you」、空表示）とタブ追加ダイアログを更新し、全肯定の文言で使われなくなったものを整理する
- [x] 2.5 `pnpm test`・`pnpm check`・E2Eを確認する

## 3. 仕様書の同期

- [x] 3.1 `feed-thread` と `appview-protocol` のspec/designを実装と一致させる
- [x] 3.2 `npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive` と `node openspec/tools/comment-catalog.mjs --check` が通ることを確認する

## 実装メモ

- 1.3 興味ベクトルの表は `nagi.actor_interest_probes`（手動適用用の記録は `packages/database/drizzle/0107_nagi_actor_interest_probes.sql`）。削除は `NagiThemeWorker` のtickで行う。
- 1.4 NOT EXISTS版は遅かったため、日の境界で区切って窓関数で選ぶ形に改めた（design.md D5）。使い捨てDB（`nagi_recommended_test`）で `recommended.postgres.test.ts` の5件が通る。
- 2.5 `pnpm test` は全件成功。`pnpm check` は今回の変更と無関係な `@types/node` 未解決の23件だけが残る。E2Eはフィードのタブ・スワイプ・タブ一覧を含む51件が成功。
- 開発DBでの確認は `apps/nagi_appview/scripts/previewRecommended.ts`（読み取り専用の接続でしか動かない）。
