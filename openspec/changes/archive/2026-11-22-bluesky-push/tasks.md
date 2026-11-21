# Tasks

## 1. 方針の確認

- [x] 1.1 ブロックした相手・ブロックされた相手からの操作を配信しない方針を利用者と合意した（2026-11-21）。

## 2. AppView（`bsky-affirmative-bot/guillemot/apps/nagi_appview`）

- [x] 2.1 Bluesky用の種類別の設定を、既存の通知設定のAPIで保存・取得できるようにする（既定オフのカテゴリ。design D6）。lexiconに定義を足す。
- [x] 2.2 Bluesky用のJetstream受信を、今の取り込みと別の接続で追加する。有効化した利用者のDIDだけをメモリに持ち、上限を超えたら古いイベントを捨てる。
- [x] 2.3 宛先の判定（design D1）、重複の除外、本人の操作の除外、ブロックの判定（design D3、問い合わせ失敗時は配信しない）を実装し、単体テストで確認する。
- [x] 2.4 文面の組み立て（公開APIとメモリキャッシュ）、年齢保護、種類別の設定の判定、既存のPush配信への接続を実装する。Blueskyのデータをデータベースに保存しないことを確認する。

## 3. クライアント

- [x] 3.1 通知設定にBlueskyのPushの有効化と種類別の切り替えを追加する。Bluesky連携をしていない利用者には出さない。ミュートが反映されないことを説明に書く。
- [x] 3.2 Service Workerで、Blueskyの通知を開いたときに通知タブへ移動する（payloadのurlをそのまま使うので変更は不要だった）。アプリのバッジはBlueskyのPushでは増やさない。旧payloadとの互換（NOTIFY-04）を保つ。

## 4. 文書と検証

- [x] 4.1 プライバシーポリシーに、Pushのために公開されているBlueskyの操作を監視することを追記し、版を上げる（MOD-05）。
- [x] 4.2 主仕様（notifications-unread・bluesky-integration）・design.md・known-gaps.mdを実装と一致させる。ミュートを反映しない制約を明記する。
- [x] 4.3 AppViewのテスト、クライアントの`npm run check`・Vitest・`npm run build`を実行し、verification.mdに記録する。本番Jetstreamでの配信確認とモックでの確認を区別する。
- [x] 4.4 `npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive`を実行する。
