# Design

## Context

目的と合意事項は[提案](proposal.md)、確認条件は差分仕様（[bluesky-integration](specs/bluesky-integration/spec.md)・[auth-session](specs/auth-session/spec.md)・[notifications-unread](specs/notifications-unread/spec.md)）に記す。

現在のBluesky閲覧は`src/lib/bsky/agent.ts`が本人PDSへatproto-proxy付きで投げ、`mapView.ts`がNagiの表示部品向けの型へ変換している。`BskyPostCard.svelte`は閲覧専用で、操作は自分の投稿のいいねした人の表示（最大5人）だけである。OAuthのscopeは`CROSSPOST_SCOPE`（`repo:app.bsky.feed.post?action=create`）と閲覧用のrpc群（`BLUESKY_VIEW_SCOPES`）を同じオプトインで要求する。

参考にした先行実装として、利用者が以前作ったBlueskyクライアントSkyPutter（`suibari/bsky_skyputter_pwa`）がある。通知一覧はブラウザから`listNotifications`／`updateSeen`を直接呼び、いいね等もPDSへ直接書き込んでいた。件数表示とログイン権限（`transition:generic`）はNagiの方針と異なるため引き継がない。

## Goals / Non-Goals

Bluesky投稿への基本的なやり取り（いいね・リポスト・返信・引用・削除）と、その結果として届く反応の確認（通知タブ）、身を守る手段（ミュート・通報・返信と引用の許可）をNagi内で行えるようにする。Nagi AppViewはBlueskyのデータを中継・保存しない境界を保つ。

ブロック・フォロー・Bluesky内のプロフィール画面・DM・Push通知（[bluesky-push](../2026-11-22-bluesky-push/proposal.md)）は扱わない。

## Decisions

### D1: 操作は本人PDSへ直接書き、Nagi AppViewを通さない

いいね・リポスト・返信・threadgate・postgateは`com.atproto.repo`のレコード操作として本人PDSへ書く。ミュート・ブックマーク・通報・通知はBluesky AppViewのRPCを、閲覧と同じatproto-proxy付きで呼ぶ（通報はBlueskyのモデレーションサービスを宛先にする）。Nagi AppViewにBlueskyのURIや操作の記録を送らないので、BSKY-01の境界は変わらない。ただしプライバシーポリシーに書いた、Bluesky連携で求める権限の範囲と外部への送信先（Blueskyのモデレーションへの通報）は実装と合わなくなるため、change bluesky-pushの改定であわせて直した。

表示型には`likedByMe`に加えて`repostedByMe`と、取り消しに必要な自分のレコードのURI（`viewer.like`／`viewer.repost`）を持たせる。件数は従来どおり変換時に捨てる。

### D2: 押したらすぐ切り替え、投稿単位で状態を揃える

いいね・リポストは楽観的に表示を切り替え、失敗で戻す。同じ投稿がリポストで複数表示されうるため（mapViewのkeyはuriと別）、状態は投稿のURIを鍵にした小さなストアで持ち、各カードはそれを参照する。処理中の鍵を持って連打による重複作成を防ぐ。

### D3: 返信・引用の投稿先は相手の投稿で決める

返信・引用の相手がBluesky投稿のときは、ポストモーダルの中にBluesky専用の入力欄（`BskyComposer`）を出す。既存のNagi投稿向けの返信・引用（`composerHost.openReply`／`openQuote`、PostViewを受け取る）とは入口を分け、BskyPostCardViewを受け取る`openBskyReply`／`openBskyQuote`を設ける。

当初はNagiのComposerにモードを足す案だったが、実装では同じモーダルの中に別の部品として置いた。NagiのComposerはこっそり・記事・下書きの自動保存・投稿範囲などを1つの状態で扱っており、Bluesky専用のときにそれらをすべて止めるより、入力欄・画像・リンクカードの部品だけを共有するほうが、Nagiの下書きへ誤って書き込む経路を作らずに済むためである。NagiのComposerはその間も隠したまま残し、Nagi側の書きかけと添付を保つ。

投稿処理はクロスポストの`crosspostToBluesky`が持つ分割・facet・埋め込み・`via`を再利用し、返信先の`reply.root`／`reply.parent`と引用の`embed.record`を渡す。画像は既存の処理でPDSへ送り、Nagiの投稿は作らない。投稿の直前に相手の投稿を`getPostThread`で確かめ、削除済み・返信不可・引用不可なら入力を残して止める。Blueskyは返信先が消えていても返信レコードを受け付けるため、孤立した返信を作らないための確認である。分割の途中で失敗したときは、同じ内容を送り直すと重複するので、入力を閉じて途中まで投稿できたことを伝える。

最初の版では、Bluesky専用の入力欄に動画・メディアCW（self-label）を出していない。BSKY-09のメディアCWの条件に触れないよう、ぼかしを付ける手段自体を持たない形にした。必要になったらクロスポストと同じ条件で足す。

こっそり・本文CW・Nagiのタグ等は意味を持たないため、このモードでは表示しない。Bluesky専用モードの内容は下書き（POST-06）に保存しない（2026-11-21に合意）。下書きはNagi AppViewに保存されるため、保存すると本文と返信先のBluesky URIがNagi AppViewに残り、BSKY-01の境界に触れるからである。代わりに、本文や添付がある状態で閉じようとしたら破棄の確認を出し、書いた内容を黙って失わないようにする。

### D4: 削除権限は持つが、使う場面を絞る

GAP-01では「不用意な削除権限を持たない」ことを優先して作成のみとしたが、Nagiから返信できるようになると誤った投稿を消せない不便が大きい。そこで2026-11-21に、Bluesky投稿の権限を作成と削除に広げると決めた。更新（putRecord）は使う場面がないため要求しない。

代わりに、UIで削除の対象にするのはレコードに`via: "Nagi"`を持つ投稿だけにする。`via`は非標準のフィールドで改ざんを防ぐ仕組みではないが、Nagiの外で書いた投稿を誤って消す導線を作らないための目印としては十分である。失敗時の自動巻き戻しを行わない方針（BSKY-06）は維持し、削除は利用者が確認したときだけ行う。

### D5: 通知タブはBluesky側の既読を正本にする

Nagiの通知の既読はNagi AppViewのreadAtが正本（NOTIFY-01）、Blueskyの通知の既読はBluesky側のseenAtが正本である。正本が違うものを1つの一覧に混ぜると、どちらかの既読がずれるため、タブで分ける。

Blueskyの`listNotifications`は通知を1件ずつ返し、グループ化は公式アプリのクライアント側で行っている。Nagiではグループ化せずそのまま並べ、件数の表現を作らない。ミュート・ブロックはBluesky側で除外済みのものが返るので、Nagi側で追加の判定は要らない。ラベルと年齢の判定は既存の`bskyPostDisplay`を使う。

いいね・リポストの通知は対象の投稿の本文を持たないため、`app.bsky.feed.getPosts`で対象の投稿をまとめて引き、ラベルごと添える。このために閲覧の権限へ`getPosts`のrpcを足した。年齢の保護で隠す投稿に付いた通知は、行ごと出さない。

通知を押したときは、その投稿の会話を通知の下にその場で開く（フィードと同じ`BskyThreadUnit`を使う）。Bluesky投稿だけを表示する独立した画面は持っていないため、別の画面へ移るより、通知の流れの中で読んで返信・いいねできるほうが自然と判断した。フォローの通知は、プロフィールを今までどおりbsky.appで開く。

自分のクロスポストのコピーへの通知から、元のNagi投稿へ移る操作は持たない（2026-11-21に見送り）。通知を押せばBlueskyの会話がその場に開き、自分のコピーの本文と相手の返信を読んで返信できるため、元のNagi投稿へ移って得られるのはNagi側のリアクションを見ることくらいで、便利さが小さい。逆引きにはConstellationの被リンク索引（`com.suibari.nagi.post` の `crosspost.root.uri` を対象のURIで引く）を使えばクライアントだけで実現できる見込みがあり、要望があればその案かAppViewの引き当てAPIを検討する。その場合は第三者サービスへの通信になるので、プライバシーポリシーへの記載も合わせて検討する。

ナビゲーションの未読バッジはNagiの通知だけを数え、Blueskyの未読は通知画面のBlueskyタブに印として示す（2026-11-21に合意）。バッジの正本をNagi AppViewのreadAtに保ち、起動時の優先取得（NOTIFY-06）にBlueskyへの問い合わせを混ぜないためである。

### D6: 再認可は操作しようとしたときに案内する

既存の連携利用者は閲覧用のscopeしか持たない。起動時に一斉に再認可を求めると閲覧まで止まって見えるため、操作のボタンを押したときに初めて案内する（AUTH-08）。付与の判定はAUTH-04と同じく、action／audを除いたスコープ名と実際の付与で行う。

### D7: 操作列はアイコン4つに絞り、それ以外は「…」に入れる

タイムラインを文字やボタンで埋めないため（2026-11-21に合意）、操作列は返信・リポスト・引用・いいねのアイコンだけにする。Blueskyで開く・ブックマーク・スレッドのミュート・作者のミュート・通報・返信と引用の設定・削除は「…」のメニューに入れる。Nagiの投稿ではブックマークが操作列のアイコンにあるが、Blueskyの投稿はメニューの項目にした。Blueskyの投稿にはNagiのフォルダが無く、付け外しだけで済むため、操作列に並べる理由が弱い。作者のミュートと通報は自分の投稿には出さず、返信と引用の設定と削除はNagi経由の自分の投稿にだけ出す。

返信と引用の許可（threadgate／postgate）は、Blueskyへの返信・引用の入力欄では折りたたんだ欄に、Nagiのクロスポストでは投稿範囲の画面で「Bluesky」を選んだときに出す。threadgateはスレッドの先頭にだけ効くので、返信として投稿するときは返信できる人を選ばせない。後から変えるときは、update権限を持たないので付いている設定を消して作り直す。公式アプリで組んだ複数条件やリストの返信制限はNagiの選択肢に無いので、選び直さない限り残す。

通報はBlueskyの公式モデレーションサービスを宛先にして`createReport`を送る。利用者が購読している別のラベラーへは送らない。

## Risks / Trade-offs

- `via`による削除対象の判定は自己申告であり、Nagi以外のクライアントが`via: "Nagi"`を書けばNagiから消せる。どちらも本人の投稿なので被害はない。
- 削除権限を持つことで、Nagiの不具合が本人のBluesky投稿を消すおそれが生まれる。削除の呼び出しは明示操作の経路だけに置き、テストで他の経路から呼ばれないことを確認する。
- 返信と引用の許可の後からの変更は、threadgate／postgateのレコードの作成と削除で行う（更新権限を要求しないため、変更は削除して作り直す）。

## Spec Integration Notes

主仕様へ反映するときは、bluesky-integrationの機能概要（「閲覧」から「閲覧と操作」へ）、機能一覧、主な利用の流れ、参照資料を更新する。auth-sessionとnotifications-unreadの機能一覧にも追加要件を載せる。known-gaps.mdのGAP-01には、作成のみの方針を2026-11-21に改めた経緯を追記する。導入時のコメント原文と台帳は書き換えない。

## References

| 資料                                                                                         | 参照する理由                            |
| -------------------------------------------------------------------------------------------- | --------------------------------------- |
| [AT Protocol — Permissions](https://atproto.com/specs/permission)                            | repoのactionの絞り方とrpcの宛先         |
| [Bluesky — Thread gates / Post gates](https://docs.bsky.app/docs/advanced-guides/moderation) | 返信と引用の制限レコードの意味          |
| [Bluesky HTTP API Reference](https://docs.bsky.app/docs/category/http-reference)             | 通知・ミュート・ブックマーク・通報のRPC |

外部資料のリンク先と内容は実装時に確認し、確認日を主仕様の参照資料へ記す。
