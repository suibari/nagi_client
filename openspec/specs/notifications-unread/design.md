# 通知・Web Push・既読位置：設計判断

## この文書の役割

[spec.md](spec.md) が定める振る舞いについて、課題・採用判断・理由と制約を説明する。実装の行番号に依存せず、判断が変わるときに更新する。原文にない過去の議論や、採用されなかった案を推測で補わない。

## 設計判断

### D1: 購読の意思とサーバー登録を別状態にする

**課題**：端末に有効な購読があっても、AppViewの行だけが失われたり一時的に再登録が失敗したりする。

**採用判断**：subscribedとregisteredを分け、起動・復帰時に冪等な再登録を行う。

**理由と制約**：一時障害で利用者のONの意思をOFFにしない。端末で解除成功なら表示はOFFを保ち、失効したサーバー行は配信時の失敗でも掃除される。

### D2: SWは新旧の混在を前提に薄くする

**課題**：サーバーだけ先に更新されることや、古いSWが端末に残ることがある。

**採用判断**：payloadはoptionalな値とフォールバックで受け、判断をできるだけサーバーへ寄せる。

**理由と制約**：tag欠落時にtypeを使うと同種通知が静かに置き換わった過去の障害があるため、一意なtagを作る。重複より通知の消失を避ける。

### D3: 既読は表示した事実からだけ進める

**課題**：取得後に到着した未表示通知や、既読化前に出した古い件数取得を取り込むと表示が戻ったり未読が消えたりする。

**採用判断**：seenAtを表示済み最新createdAtに限定し、件数応答を世代管理する。画面の未読基準は開いた時点で凍結する。

**理由と制約**：通知件数はサーバreadAtを正本とし、セクション位置はindexedAtとuriで前進のみ。未初期化端末は現在位置を基準にして過去全件を未読にしない。

### D4: 同期する範囲と本人境界を明示する

**課題**：ニュース・フィード・guestを一つの既読へまとめると、別の情報や別アカウントまで読んだことになる。

**採用判断**：セクションとDIDごとに状態を共有し、同期対象だけpreferencesへ接続する。

**理由と制約**：guestは端末内へ閉じ、remote取り込みをそのまま送り返さない。全削除時はメモリ上のインスタンスも破棄し、削除したキーの復活を防ぐ。

### D5: 通知件数はセッション公開前に優先取得する

**課題**：通知ポーリングの購読開始をレイアウトで前へ動かすだけでは、モジュール初期化時からsessionを購読しているプロフィール等の通信が先行する。

**採用判断**：レイアウトのonMountでは通知の起動登録を最初に行う。OAuth復元時の`rememberSession()`は、通常のstoreへ公開する前に`onOAuthSessionReady()`の同期フックを呼ぶ。通知側は復元済みセッションを明示して`getUnreadCount()`を起動し、結果を待たずにセッション公開へ進める。OAuth層から通知APIへの依存を作らない。

**理由と制約**：通知取得の応答待ちを初期表示の条件にすると通信障害でアプリ全体が止まるため、制御するのは開始順だけとする。セッションの同一性で優先起動と通常購読の二重送信を防ぎ、セッション変更と既読化の世代を進めて古い件数や再試行を破棄する。ログアウト後に以前の既読更新が完了しても次の利用者のバッジを消さない。件数は永続化せず、認可も変更しない。ネットワークの送信・応答到着順と本番の表示時間は保証しない。

**比較資料**：[Bluesky公式の未読Provider](https://github.com/bluesky-social/social-app/blob/main/src/state/queries/notifications/unread.tsx)はセッション確立時に即時確認する。[Mastodon Web UI](https://github.com/mastodon/mastodon/blob/main/app/javascript/mastodon/features/ui/index.jsx)も起動時に通知を取得するが、ホーム取得のdispatchが先にある（2026-11-12公開ソース確認）。起動時の並行取得の参考であり、一般のアプリが通知を必ず最初に取得する根拠ではない。

### D6: Blueskyの通知はタブで分け、Bluesky側の既読を正本にする

**課題**：Nagiの通知の既読はNagi AppViewのreadAtが正本で、Blueskyの通知の既読はBluesky側のseenAtが正本である。1つの一覧に混ぜると、どちらかの既読がずれる。

**採用判断**：通知画面にNagiとBlueskyのタブを分け、それぞれのタブが見えているときだけ、表示した最新分まで既読にする。Blueskyの通知はグループ化せず1件ずつ並べ、件数の表現を作らない。いいね・リポストの対象投稿は`getPosts`で引いてラベルごと添え、年齢の保護で隠す投稿に付いた通知は行ごと出さない。通知を押すと、その投稿の会話をその場に開く。ナビのバッジはNagiの通知だけを数え、Blueskyの未読はタブの印で示す。

Blueskyタブの印は、通知一覧APIの先頭ページにある未読行を、一覧と同じ種別・表示条件で絞って判定する。対象外の通知を含みうる未読総数を使うと、タブに表示できる未読がなくても印が残るためである。復帰やタブ切替で再確認し、取得に失敗した場合は直前に確認した状態を保持する。

Bluesky AppViewは、記録したseenAtより厳密に前の通知だけを既読と判定する。表示した最新の通知の時刻をそのまま送ると、その1件が未読に残り、タブを離れるたびに印が戻る。そのため、送る時刻は表示した最新の通知の時刻に1ミリ秒を足した値にする。現在時刻を送ると、取得後に届いた未表示の通知まで既読になるので使わない。

**理由と制約**：ミュート・ブロックはBluesky側で除外済みの一覧が返るので、Nagi側では判定しない。Bluesky投稿だけを表示する独立した画面は持たないため、別画面へ移らずに読んで返信できる形にした。バッジにBlueskyを混ぜないのは、起動時の優先取得（D5）にBlueskyへの問い合わせを入れないためでもある。自分のクロスポストのコピーへの通知から元のNagi投稿へ移る操作は持たない。必要になったら、Constellationの被リンク索引による逆引きかAppViewのAPIを検討する。

### D7: BlueskyのPushはAppViewが公開された操作から作る

**課題**：Nagiのログインはブラウザだけで完結するOAuthで、AppViewは本人の認証情報を持たない。そのためBlueskyの通知を本人として取得してPushすることはできない。

**採用判断**：利用者が以前作ったSkyPutterと同じく、AppViewがJetstreamを受信し、Pushを有効にした利用者宛ての返信・メンション・引用・いいね・リポスト・フォローを見つけて1件ずつ送る。受信はNagiの取り込みとは別の接続で、botと同じ自作のproxyへ向ける。設定は通知設定の同じ行に既定オフのカテゴリとして持ち、Pushの購読はNagiと共用する。tagはイベントのレコードのURIで一意にし、開いた先はBlueskyタブとする。

**理由と制約**：proxyはcursorを上流へ渡さないので、AppViewが止まっていた間のPushは送らない。Pushは取りこぼしても通知タブで確かめられるので許容する。ミュートは本人の認証なしに取得できないので反映しない（2026-11-21に許容）。ブロックは公開APIで確かめ、確かめられなければ送らない。表示名・本文は公開APIから引くだけで保存しない。成人確認できない人には、セルフラベル・作者のラベル・対象投稿のラベルのいずれかが成人向けなら本文を入れない。返信などのラベルは投稿直後にはまだ付いていないことが多いので、後から付いたラベルは反映できない。アプリのバッジはNagiの通知だけを数えるので、BlueskyのPushでは増やさない。

## 実装の入口

現在のコードを調べるための入口。行番号は管理せず、ファイル内の処理名・責務で探す。ファイル移動時はこの一覧を更新する。

| ファイル                                                                                                            | 探す処理・責務                          |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| [src/lib/notifications/push.svelte.ts](../../../src/lib/notifications/push.svelte.ts)                               | 購読と修復                              |
| [src/service-worker.ts](../../../src/service-worker.ts)                                                             | 受信・クリック・購読更新                |
| [src/lib/notifications/unread.svelte.ts](../../../src/lib/notifications/unread.svelte.ts)                           | 件数と世代管理、優先起動                |
| [src/lib/unread/watermark.svelte.ts](../../../src/lib/unread/watermark.svelte.ts)                                   | 位置の比較と凍結ビュー                  |
| [src/lib/unread/sections.svelte.ts](../../../src/lib/unread/sections.svelte.ts)                                     | DID別セクションの共有                   |
| [src/routes/notifications/+page.svelte](../../../src/routes/notifications/+page.svelte)                             | Nagi／Blueskyのタブと既読の出し分け     |
| [src/lib/components/bsky/BskyNotificationList.svelte](../../../src/lib/components/bsky/BskyNotificationList.svelte) | Blueskyの通知の一覧と既読               |
| [src/routes/settings/notifications/+page.svelte](../../../src/routes/settings/notifications/+page.svelte)           | BlueskyのPushの種類別の設定             |
| [src/lib/notifications/preferences.ts](../../../src/lib/notifications/preferences.ts)                               | BlueskyのPushの既定オフの判定と保存の形 |

- [src/routes/+layout.svelte](../../../src/routes/+layout.svelte)：onMountでの通知ポーリングの先行起動と破棄。
- [src/lib/oauth/session.svelte.ts](../../../src/lib/oauth/session.svelte.ts)：onOAuthSessionReadyとrememberSessionの公開前フック。
- [src/lib/api/appview.ts](../../../src/lib/api/appview.ts)：getUnreadCountの明示的セッション引き渡し。
- AppView（別リポジトリ `bsky-affirmative-bot/apps/nagi_appview`）の `services/blueskyPush.ts`・`services/blueskyPushTargets.ts`：BlueskyのPushの受信・宛先判定・配信。

## 出典と変更時の扱い

- [導入時コメント原文](../../reference/comment-snapshot/notifications-unread.md)は、基準コミット `24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf` の固定資料である。原文内の行番号はそのコミットだけを指す。
- [機械可読台帳](../../comment-catalog.json)に元ファイル・行範囲・原文・SHA-256を保持する。コメント削減後も履歴として残し、現在のコードに合わせて書き換えない。
- [既知の不整合](../../known-gaps.md)に現在の要件と旧説明の違いを記録する。改善が実装済みとは扱わない。
- 振る舞いの変更はspec.md、判断の変更はこの文書へ反映する。原文資料は増補・修正する現行設計書として使わない。
