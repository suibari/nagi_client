# Design

## Context

目的と合意事項は[提案](proposal.md)、確認条件は差分仕様（[notifications-unread](specs/notifications-unread/spec.md)・[bluesky-integration](specs/bluesky-integration/spec.md)）に記す。

NagiのPushは、Nagi AppViewが配信を判断し、Service Workerが表示する（NOTIFY-03〜05）。Nagi AppViewのJetstream受信（`guillemot/apps/nagi_appview/src/ingest/jetstream.ts`）は`NAGI_INGEST_COLLECTIONS`、つまりNagiのコレクションだけを対象にしている。

先行実装のSkyPutterのサーバー（`bsky_skyputter_server`）は、自前のJetstreamProxyから`app.bsky.feed.like`・`feed.repost`・`feed.post`・`graph.follow`を受け、登録した利用者のDIDをメモリに持って宛先を判定していた。文面は公開APIの`getProfile`と`getPosts`で組み立て、1件ずつPushしていた。ミュート・ブロック・ラベルは判定していなかった。

## Goals / Non-Goals

SkyPutterと同じ単純な方式で、Pushを有効にした利用者にBlueskyの反応を届ける。保存するのは有効化と種類別の設定だけにする。

ミュートの反映、まとめての配信、DMの通知は行わない。

## Decisions

### D1: 宛先の判定はSkyPutterと同じ規則にする

| 種類       | コレクション            | 宛先                                                   |
| ---------- | ----------------------- | ------------------------------------------------------ |
| いいね     | `app.bsky.feed.like`    | `subject.uri`のDID                                     |
| リポスト   | `app.bsky.feed.repost`  | `subject.uri`のDID                                     |
| フォロー   | `app.bsky.graph.follow` | `subject`                                              |
| 返信       | `app.bsky.feed.post`    | `reply.parent.uri`のDID                                |
| 引用       | `app.bsky.feed.post`    | `embed.record.uri`（`recordWithMedia`の中も含む）のDID |
| メンション | `app.bsky.feed.post`    | facetのmentionのDID                                    |

1つの投稿が返信と引用とメンションを兼ねる場合は、同じ宛先へ重複して送らない（返信→引用→メンションの順で1件にする）。宛先が操作した本人の場合は送らない。SkyPutterは引用の判定で`recordWithMedia`を見ていなかったので、ここで補う。

### D2: ミュートは反映しない

ミュートはBlueskyで非公開の情報で、`app.bsky.graph.getMutes`は本人の認証付きのリクエストにしか返らない。NagiのログインはブラウザだけのOAuthで、AppViewは本人の認証情報を持たないため、配信の瞬間に取得できない。反映するには、(a) confidential clientに切り替えてサーバーがリフレッシュトークンを持つ、(b) クライアントからミュート一覧を同期してAppViewに保存する、のどちらかが要る。(a)は投稿の削除権限まで含む認証情報をサーバーに置くことになり、ログインの仕組みも作り直しになる。(b)は非公開の情報をサーバーに置くことになり、同期の遅れも生じる。2026-11-21に、実装が複雑になることを理由に、まずは反映しない仕様で許容すると決めた。要望があれば(b)を第一候補に検討する。

### D3: ブロックは判定する

ブロックは公開レコードで、公開APIの`app.bsky.graph.getRelationships`で保存なしに判定できる。ブロックした相手・ブロックされた相手からの操作は配信しない（2026-11-21に合意）。ミュートと違い認証も保存も要らず、ブロックした相手の本文が届くのはミュート以上に受け入れにくいためである。判定の問い合わせに失敗したときは、ブロックの可能性を否定できないので配信しない。

### D4: 文面は公開APIで作り、保存しない

表示名は`public.api.bsky.app`の`getProfile`、対象投稿の文とラベルは`getPosts`で取得する。どちらも短時間のメモリキャッシュだけにして、データベースに保存しない。年齢保護は、宛先の利用者がNagiで成人確認できていない場合に、Bluesky公式のラベル（`porn`・`sexual`・`nudity`等）が投稿または作者に付いていれば本文を入れないことで行う。利用者が購読している独自のラベラーは反映しない。

### D5: Jetstreamの受信は今の受信と分ける

Blueskyの全投稿・いいねを受けると、今のNagiのコレクションだけの受信とは量が桁違いになる。Nagiの取り込み（`NAGI_INGEST_COLLECTIONS`）が遅れないよう、Bluesky用の受信は別の接続（できれば別プロセス）にする。処理が詰まったときは古いイベントを捨てる（SkyPutterと同じく上限を設ける）。捨てたぶんのPushは届かないが、通知タブで確認できる。

### D6: 設定はNagiの通知設定と並べて保存する

NOTIFY-01の設定はアカウント単位で、未設定は有効である。Blueskyの種類は初期状態をオフにしたいので、Nagiの種類と同じ「未設定は有効」の規則に乗せず、Bluesky用の有効化フラグと種類別の設定を別に持つ。Pushの購読（端末）はNagiと共用する。

## Risks / Trade-offs

- ミュートした相手からPushが届く。設定画面の説明に明記する。
- Jetstreamの切断・遅延の間に起きた操作はPushされない。再接続時のcursorによる取りこぼしの補填は、Nagiの受信と同じ方法を使えるか実装時に確認する。
- 有名な利用者が有効にすると、いいね1件ごとのPushが非常に多くなる。種類ごとのオフで対処してもらう。

## Spec Integration Notes

主仕様へ反映するときは、notifications-unreadの機能概要・一覧・利用の流れにBlueskyのPushを足し、bluesky-integrationの機能概要のデータ境界の説明に例外を書く。プライバシーポリシーの改定はMOD-05の版の更新とともに行う。

## References

| 資料                                                                                 | 参照する理由                   |
| ------------------------------------------------------------------------------------ | ------------------------------ |
| [Jetstream](https://github.com/bluesky-social/jetstream)                             | 受信するイベントの形式とcursor |
| [Bluesky — Moderation labels](https://docs.bsky.app/docs/advanced-guides/moderation) | 年齢保護で見る公式ラベル       |
