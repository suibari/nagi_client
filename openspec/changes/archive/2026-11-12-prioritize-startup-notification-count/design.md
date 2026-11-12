# Design

## Context

動機と範囲は[proposal.md](proposal.md)を参照する。`+layout.svelte`は他のnoticeを開始した後で`startUnreadPolling()`を呼ぶ。通知ポーリングはsession購読で即時取得するが、`myProfile`などはモジュール初期化時に購読済みなので、同じsession公開に対して先にAPIを呼ぶ。プロフィール完了をawaitする直列待ちは存在しない。「画面上で最後に見える」という報告の通信所要時間やPDS内の処理順は未実測で、開始順だけで全原因が解消するとは断定しない。

現行主仕様は初回取得の優先順位を規定していないため、仕様との不一致ではなく新要件として扱う。known-gapsに存在しない違反を追加しない。

## Goals / Non-Goals

認証復元後のAPI呼び出し開始順を制御し、通知が他の初回取得の後ろへ回る構造を取り除く。ブラウザのネットワーク送信順・応答到着順の保証、認証復元自体の短縮、既読仕様やPush配信の変更は対象外とする。

## Decisions

### D1: セッション公開前の優先起動経路を用意する

`session.set`の後で呼んだり、onMount内の呼び出し位置だけを動かしたりしても、既存のモジュール初期化時の購読より前に取得を開始できない。セッションを復元した時点で、一般購読者へ公開する前に通知取得を開始できる小さい起動経路を設ける。OAuth層は通知APIを直接importせず、通知側が登録する同期フック等で依存循環を避ける。通信には確定したOAuthセッションを明示的に渡し、まだ公開されていないグローバルstoreから推測しない。通知以外のAPIの認証経路は維持する。

`+layout.svelte`では通知の起動登録を他のnotice開始と`initOAuth()`より前へ置く。既にセッションがある場合にも初回取得を一度開始し、通常のログイン、ログアウト追従も保つ。起動経路とsession購読で同じ初回取得を二重に送らない。

### D2: 応答待ちを初期表示の条件にしない

優先起動は通信開始順だけに適用する。通知取得をawaitしてからsessionを公開すると遅延や障害でアプリ全体が止まるので採用しない。通知の正常応答は既存のunreadCount経由で全ナビとPWAへ伝える。ローカル件数キャッシュはサーバreadAtとの整合と保存データの追加を伴うため、この変更には含めない。

### D3: セッション境界と既読世代を維持する

起動時取得でもDIDと世代を捕捉し、アカウント切替、ログアウト、既読化前の古い応答を無視する。同一DIDの起動時二重取得を防ぎつつ、復帰・Push・60秒取得・失敗時の既存再試行を維持する。認可を追加せず、件数・認証情報を新たに永続化しない。

### D4: 公式実装から確認できた範囲

2026-11-12に公開ソースを確認した。

- [Bluesky未読Provider](https://github.com/bluesky-social/social-app/blob/main/src/state/queries/notifications/unread.tsx)はhasSession成立時のeffectでcheckUnreadを即時呼び、以降30秒間隔で確認する。[Web起動](https://github.com/bluesky-social/social-app/blob/main/src/App.web.tsx)は通知Providerをアプリ共通階層に置く。フィード完了を待たず起動する構造だが、全APIより先の送信や最初の応答は保証していない。件数は通知ページから数え、Nagiの件数専用APIとは異なる。
- [Mastodon Web UI](https://github.com/mastodon/mastodon/blob/main/app/javascript/mastodon/features/ui/index.jsx)もcomponentDidMountで通知を取得するが、ホーム取得のdispatchが先にある。

したがって「起動時から通知を並行取得する」例は確認できるが、「一般のアプリは通知が必ず最初」は確認できない。実機の表示順と本番配布版の通信計測は行っていない。外部ソースは比較根拠であり、Nagiの仕様の正本にはしない。

## Risks / Trade-offs

- 通信の完了順は回線とPDS/AppView次第 → 開始順の保証と、他の応答を保留した状態でバッジが更新されることを別々に検証する。
- 優先起動と通常購読が重複する → 同じセッションの初回取得回数をテストする。
- ログアウト後の旧応答や再試行が混入する → 遅延応答を使ったDID・世代のテストを行う。
- 既存E2Eのsession直接注入では本番起動順を保証できない → OAuth復元相当の経路を含む起動テストで呼び出し順を検証し、本番の表示時間の実測とは区別する。

## Migration Plan

利用者の合意後に実装・検証し、主仕様と設計へ反映する。API・保存データの移行は不要。問題時は起動順変更を戻せる。導入時の[固定履歴](../../../reference/comment-snapshot/notifications-unread.md)は書き換えない。
