# 仕様判断・残課題・確認境界

利用者が確認した現行仕様と、コードから確認できた状態を記録する。仕様判断の確定と、コード・コメントへの反映完了を区別する。原文は [導入時コメント原文](reference/comment-snapshot/README.md) に保存する。行番号付き出典は採録コミットの固定位置を指す。

| 項目   | 確定した扱い                                               | コード・コメントの扱い                                            |
| ------ | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| GAP-01 | 2026-11-21に作成と削除へ方針変更。自動の巻き戻しはしない。 | 解消。Nagi保存後に投稿する順序へ改めた。削除は利用者の操作だけ。  |
| GAP-02 | publicationはユーザー別URL。共通URLは旧仕様。              | 解消。古い説明を更新した。旧データの読み取り・移行コードは残す。  |
| GAP-03 | Nagi内でBlueskyスレッドを閲覧できる。                      | 解消。外部でしか見られないという説明を更新した。                  |
| GAP-04 | 自分のクロスポスト済み投稿へ返信・引用できる。             | 解消。未使用の旧処理 `submitPost()` を削除した。                  |
| GAP-05 | 設計案・PoCと現行動作の保証を区別する。                    | 外部リポジトリの実装は未確認。                                    |
| GAP-06 | チャンネルは廃止済みでハッシュタグへ統合。                 | 解消。古い機能説明を更新した。旧リンク・旧設定の互換は保持する。  |
| GAP-07 | 配信はadapter-staticとVercel Functions。                   | 解消。adapter-autoと完全SPAの説明を削除・更新した。依存は未整理。 |

GAP-01はアプリコードの修正で解消した。GAP-02・03・04・06・07はコードコメントの更新と未使用処理の削除で解消した（2026-11-12）。GAP-05は外部実装の確認境界として残る。

## 通知の初回取得順

change [prioritize-startup-notification-count](changes/archive/2026-11-12-prioritize-startup-notification-count/proposal.md)で、通知件数取得をOAuthセッションの通常公開より先に開始する実装へ変更した（[NOTIFY-06](specs/notifications-unread/spec.md#notify-06)）。変更前の主仕様は初回取得の優先順位を規定しておらず、既存要件への違反ではなく新要件として追加した。OAuth復元・API通信・ナビバッジの描画を組み合わせたモック検証と、本番での通信・表示時間の実測は区別する。本番の認証済み環境での実測は未確認。

## GAP-01

### Blueskyのcreate限定権限と削除による補償

- 出典: [oauth/client.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/oauth/client.ts#L9)、[Composer.svelte](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L840)、[crosspost/bluesky.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L271)。
- コメントの不一致: OAuth側は「作成だけで更新・削除は一切行わない」と説明する。一方、投稿側はNagi保存失敗時に先行Blueskyコピーを削除して巻き戻すと説明する。
- 実装で確認: `CROSSPOST_SCOPE` は `?action=create`。通常投稿保存失敗時と分割投稿途中失敗時には `deleteBlueskyPosts()` を呼び、削除失敗はconsoleへ記録して継続する。
- 確定方針: Bluesky投稿の要求権限はcreateのみに限定する。不用意な削除権限を持たないことを優先し、後始末を成立させるために権限を拡張しない。
- 解消（2026-11-12）: change [crosspost-after-nagi-save](changes/archive/2026-11-25-crosspost-after-nagi-save/proposal.md) で、通常投稿もNagi保存後にBlueskyへ投稿し、コピーの参照を投稿へ追記する順序へ改めた。`deleteBlueskyPosts()` を削除し、分割投稿の途中失敗でも作成済みの分を削除しない。途中までのコピーと参照追記の失敗は警告で伝える（[BSKY-06](specs/bluesky-integration/spec.md#bsky-06)）。前提として、AppViewは見える内容が変わらない更新を編集とみなさない（[API-09](specs/appview-protocol/spec.md#api-09)）。AppViewとクライアントの変更は本番反映済み。本番での投稿操作は未検証。
- 方針変更（2026-11-21）: change [bluesky-interactions](changes/archive/2026-11-22-bluesky-interactions/proposal.md) で、Nagiから書いたBluesky投稿を消せるよう、Bluesky投稿の権限を作成と削除に広げた（[BSKY-06](specs/bluesky-integration/spec.md#bsky-06)、[AUTH-03](specs/auth-session/spec.md#auth-03)）。updateは要求しない。削除の操作を出すのは`via: "Nagi"`を持つ自分の投稿と、利用者が選んだクロスポストのコピーだけで（[BSKY-10](specs/bluesky-integration/spec.md#bsky-10)）、失敗時に自動で消して巻き戻すことは引き続きしない。上の「create限定」の確定方針は、この時点で置き換えた。
- 解消前の状態（記録として残す）: 作成限定scopeと削除の試行が共存し、削除は拒否されうるためコピーが残る可能性があった。実際のPDSでの削除拒否や旧全操作scopeのセッションとの差は、確認しないまま解消した。

## GAP-02

### standard.siteのpublication URLの古い説明

- 出典: [standardsite/types.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/standardsite/types.ts#L7)、同ファイルの `nagiPublicationUrl`、[publication.ts](../src/lib/standardsite/publication.ts)、[repo.ts](../src/lib/standardsite/repo.ts)。
- コメントの不一致: `NAGI_PUBLIC_ORIGIN` の説明に全ユーザー共通URLが残る。直下の新しい説明と関数はユーザー別 `/blog/<did>` とする。
- 実装で確認: 現行URLは `https://nagi.suibari.com/blog/<did>`、旧共通originは `LEGACY_PUBLICATION_URL` として読み取り・移行に残る。documentを先に修正してからpublicationを更新する。
- 確定仕様: ユーザー別URLが現行仕様。全ユーザー共通URLの説明は旧仕様として現行の説明から除く。旧データの読み取り・移行コードは、説明が古いことだけを理由に削除しない。`NAGI_PUBLIC_ORIGIN` の説明は2026-11-12に更新した。

## GAP-03

### Blueskyスレッドは外部表示だけ、という古い説明

- 出典: [bsky/links.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/links.ts#L1)、[bsky/thread.ts](../src/lib/bsky/thread.ts)、[BskyThreadUnit.svelte](../src/lib/components/bsky/BskyThreadUnit.svelte)、[threadルート](../src/routes/thread/[did]/[rkey]/+page.svelte)。
- コメントの不一致: links.tsにはプロフィールやスレッドを作り込まずbsky.appで開いてもらうとあるが、現在はNagi内にもBlueskyスレッド取得・表示の経路がある。
- 確定仕様: Nagi内でBlueskyスレッドを閲覧できる。DIDに基づく外部リンクも提供するが、外部表示しかできないという旧説明は2026-11-12に `bsky/links.ts` から除いた。

## GAP-04

### クロスポスト済み投稿への返信・引用

- 確定仕様: 自分のクロスポスト済み投稿には、Bluesky側のコピーへの返信・引用として続けられる。コピーの存在・権限・CW等の条件は [BSKY-04](specs/bluesky-integration/spec.md#bsky-04) に従う。他人の投稿への対応拡張を意味しない。
- 現行経路: [ChatBubble.svelte](../src/lib/components/ChatBubble.svelte) のボタンは `openComposer()` → [composerHost](../src/lib/post/composer-host.svelte.ts) の `openReply()` / `openQuote()` → [Composer.svelte](../src/lib/components/Composer.svelte) へ進む。`ownCrosspost()` が本人の既存コピーを確認する。
- 調査の訂正: ChatBubbleに残る `submitPost()` は呼び出しがなく、その中の「返信・引用はクロスポストしない」という説明を現行の入口差と判断したのは誤りだった。未使用処理とそのコメントは2026-11-12に削除した。ChatBubbleの `onposted` 引数は呼び出し元が残るが、内部からは呼ばれなくなった。呼び出し元を含む整理は別途扱う。
- 引用の更新: change [nagi-quote-crosspost-as-link](changes/archive/2026-11-22-nagi-quote-crosspost-as-link/proposal.md)（2026-11-22）で、コピーの無い引用先（本人の投稿・botたんの投稿・ニュース・ラジオ）も、Bluesky側では引用先のページのリンクとして出せるようにした。コピーの引用は上記の条件を満たす場合だけ使う。返信の条件は変わらない。

## GAP-05

### 既存設計メモはサーバ実装の現状保証ではない

- [emoji-generation-design.md](../docs/emoji-generation-design.md) はGPU・ワーカー・複数候補等を含む設計案。現在のクライアントコメントは「進行中＋最新結果」の表示を説明している。旧案の候補数やGPU運用値をクライアントの現行要件へ自動転記しない。
- [bot-tan-radio-poc.md](../docs/bot-tan-radio-poc.md) は日付付きのPoC・実測記録。未確認と記載された英語公開等を本番保証へ昇格させない。
- AppViewのSQL、年齢強制、permission setの公開状態、botの生成判断、外部PDS・動画サービス・CDNの挙動は、クライアントの契約・コメント上の前提として記録した。この作業では別リポジトリや本番へアクセスして再検証していない。

## GAP-06

### READMEの旧チャンネル説明と現行のタグ統合

- 出典: [README.md](../README.md) の主な機能、[旧チャンネルルート](../src/routes/channels/[did]/[rkey]/+page.ts)、[feed-tabs/normalize.ts](../src/lib/feed-tabs/normalize.ts)。
- 実装で確認: 旧channelタブはhashtagへ移行し、旧URLはチャンネル名のタグページへ送る。新たなチャンネル取得APIは使わない。
- 確定仕様: チャンネルは廃止済みでハッシュタグへ統合されている。READMEの主な機能もハッシュタグの説明に更新した。旧URLや保存済みchannelタブの互換は維持する。現行機能としてチャンネルを説明していたコードコメントは2026-11-12にハッシュタグの説明へ更新した。

## GAP-07

### 完全SPA・adapter-auto等の旧テンプレート説明

- 出典: [card/render.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L28)、[vite.config.ts](../vite.config.ts)、[api/spa.ts](../api/spa.ts)。
- コメントには「完全SPA」「サーバーランタイムが無い」やadapter-autoの案内が残るが、現行構成はadapter-staticによるプリレンダとSPAフォールバック、Vercel Functionsの併用である。
- 確定仕様: adapter-staticで公開HTMLとSPA fallbackを生成し、名刺の保存PNGはブラウザCanvas、OGPはVercel Functionsで生成する。古いadapter-autoの案内と完全SPAという説明は削減対象とする。
- 反映状況（2026-11-12）: `vite.config.ts` のadapter-autoの案内を削除し、`card/render.ts` の「完全SPA」の説明を現行構成に合わせた。不要依存の除去は、実際の利用箇所を確認して別途扱う。

## カードニュースの表示対象

change [card-news-ultra-rare-threshold](changes/archive/2026-11-14-card-news-ultra-rare-threshold/proposal.md)で、取得ニュースをクライアント側でUR・AARに限定した（[CARD-10](specs/cards-zenkatsu/spec.md#card-10)）。従来のR以上というコードコメントは表示条件の説明として整理した。導入時の固定原文は変更しない。AppViewのニュース選定・配信データは別リポジトリのため未確認であり、サーバ側でR・SRの配信を停止したことは意味しない。クライアントの動作確認はモック応答によるものとし、本番での配信確認と区別する。

## ブログ下書き保存後の離脱確認

change [fix-blog-draft-leave-warning](changes/archive/2026-11-16-fix-blog-draft-leave-warning/proposal.md)で、BLOG-07の離脱確認を下書きからの復元可能性に基づく判定へ変更し、POST-06にタイトル・タグの保存を追加した。クライアントは保存応答に保持された内容と現在の入力を照合し、画像が失われる場合は理由を示して確認する。旧APIが追加メタデータを捨てた場合は保存済みと扱わず、警告を維持する。

別リポジトリのOrcaワークツリー `/home/suibari/orca/workspaces/bsky-affirmative-bot/blog-draft-metadata`（`suibari/blog-draft-metadata`）で下書きAPI・lexiconの保持／返却も実装した。入力検証、HTTPと使い捨てPostgresの往復・所有者分離、およびChromiumからの保存と別ページでの復元を確認した。本番の認証経路での往復とデプロイは未実施であり、API側を先に反映する必要がある。検証の詳細はchangeの [verification.md](changes/archive/2026-11-16-fix-blog-draft-leave-warning/verification.md) に記録する。

## 外部共有受信と初回の投稿範囲

change [add-web-share-target](changes/archive/2026-11-25-add-web-share-target/proposal.md)でWeb Share Targetのテキスト・URL・画像受信を実装した（POST-11）。Service WorkerからIndexedDBへ保存し、通常投稿へ確認後に取り込む。下書きAPIは引き続き画像blobを保存しない。

調査時、Composerの初回生成が保存済みの前回scopeを復元せず、呼び出し元のdefaultScopeだけを使う不一致を確認した。POST-01に合わせて初回も`restorePostScope`で前回値を優先するよう修正した。共有画像がこっそりの意図を自動で広げないことを操作テストで確認する。

検証結果と環境の境界はchangeの [verification.md](changes/archive/2026-11-25-add-web-share-target/verification.md)に記す。2026-11-25に本番配信のmanifestとService Workerで共有受信の設定を確認した。OSの外部アプリの共有一覧から選ぶ実機確認と、本番OAuthを経由する取り込みは未実施。

## 保護者同意の廃止と既存データ

[drop-parental-consent](changes/archive/2026-11-25-drop-parental-consent/tasks.md) のクライアントとAppViewの変更は、2026-11-25までに本番反映済み（[AUTH-07](specs/auth-session/spec.md#auth-07)、[MOD-01](specs/moderation-privacy/spec.md#mod-01)）。AppViewは新たな同意日時の記録を行わない。既存の同意日時を消去するSQL（`0106_nagi_drop_parental_consent.sql`）は手動適用用で、本番DBへの適用有無は未確認。認証済みの本番環境での生年月日の申告も未検証。

## 3行日記の画像貼り付けと圧縮エラーの表示

[paste-trilines-line-image](changes/archive/2026-11-20-paste-trilines-line-image/proposal.md) で、画像選択と同じ行画像処理を本文欄の貼り付けからも使うようにした（[DIARY-05](specs/diary-trilines/spec.md#diary-05)）。この処理の圧縮上限は900,000バイトで、レコードの上限である1MB以内に収まる。圧縮失敗時は通常投稿用の文言を共有しており、画像選択と貼り付けのどちらでも「2MB以下に圧縮できませんでした」と表示される。文言と実際の上限の不一致は既存の課題として残る。

Chromiumの操作テストで Ctrl+V による画像とテキストの貼り付け、差し替え、圧縮失敗時の保持、処理中の保存制御を確認し、モックPDSへの新規保存で画像が対象行に入ることを確認した。本番認証環境での保存は未確認。

## Blueskyの操作・通知タブの確認境界

change [bluesky-interactions](changes/archive/2026-11-22-bluesky-interactions/proposal.md) で、Bluesky投稿へのいいね・リポスト・返信・引用・削除・ミュート・返信と引用の許可・ブックマーク・通報と、通知画面のBlueskyタブを実装した（BSKY-08〜14、AUTH-08、NOTIFY-07）。検証はモックのセッションとPDS応答によるもので、本物のPDSとBluesky AppViewでの確認は未実施である。特に次は本番で確かめていない。

- `repo:app.bsky.feed.post?action=create&action=delete` のように複数のactionを並べた権限を、実際のPDSが受け付けて付与するか。
- 本番OAuthでの再認可の流れと、旧セッションからの移行。
- 通報が公式モデレーションサービスに届くこと、threadgate／postgateがBluesky公式アプリでも効いて見えること。

Blueskyへの返信・引用の入力欄には、最初の版では動画とメディアのself-labelを付ける手段が無い。投稿した返信はフィードの会話の再取得（30秒ごと）まで表示に出ない。

`@atproto/api`の`getPreferences`は、新形式の保存フィード設定がないときに`putPreferences`を呼ぶ。Nagiは設定の書き込み権限を要求していないため、通知バッジの修正に合わせて、SDKの変換結果を読み取りにだけ使うようにした。書き込みを拒否するモックでも通知を取得できることを確認した。

検証の詳細はchangeの [verification.md](changes/archive/2026-11-22-bluesky-interactions/verification.md) に記す。

Blueskyタブの未読の印は、以前は通知一覧と異なるAPIの未読総数を参照していたため、タブに表示できる未読がなくても残り得た。また、一覧で非表示の通知が先頭にある場合も、その通知の時刻まで既読にしていた。NOTIFY-07に合わせ、印と既読の上限を通知タブの表示条件に揃えた。

その後も、本番のアカウントでBlueskyタブを開いて戻ると印が戻る症状が残った。Bluesky AppViewは`seenAt > indexedAt`で既読を判定するのに、Nagiは表示した最新の通知の`indexedAt`をそのまま`seenAt`として送っていた。このため先頭の1件が未読に残っていた。atprotoの実装（`packages/bsky/src/views/index.ts`）で判定式を確かめ、送る時刻を1ミリ秒進めた。e2eのモックも同じ判定で既読を返すようにした。本番アカウントでの解消の確認は未実施。

## BlueskyのPushの確認境界

change [bluesky-push](changes/archive/2026-11-22-bluesky-push/proposal.md) で、BlueskyのPush（NOTIFY-08・09）をクライアントとAppView（別リポジトリ、Orcaのワークツリー `bsky-affirmative-bot/bluesky-push`、ブランチ `suibari/bluesky-push`）に実装した。AppViewの宛先判定と文面は単体テストで、クライアントの設定画面はモックの操作テストで確かめた。次は未確認である。

- 自作のJetstream proxyからの実際の受信と、Blueskyの全投稿・いいねを受けたときのAppViewの負荷。
- 本物のPush配信（端末への表示）と、通知を開いてBlueskyタブへ移ること。
- 公開APIでのブロック判定・表示名・本文の取得が、本番の量で詰まらないか。

設計上の制約として、Blueskyでミュートした相手からもPushが届く（2026-11-21に許容）。返信などに後から付いた成人向けのラベルは、Pushの本文の判定に反映できない。AppViewが止まっていた間の操作はPushされない。

プライバシーポリシーには、BlueskyのPushのための受信と公開APIの参照、Bluesky連携で求める権限の範囲、Blueskyのモデレーションへの通報を追記し、更新日を2026-11-21に改めた（MOD-05）。権限の範囲の記述は、change bluesky-interactionsで広げた権限に追いついていなかったため、あわせて直した。

## フィードの画像上スワイプ

change [allow-feed-swipe-on-images](changes/archive/2026-11-22-allow-feed-swipe-on-images/proposal.md) で、FEED-08のメディア除外を見直し、画像の拡大用タイル上でも横スワイプでタブ移動できるようにした（2026-11-22に合意）。従来は画像タイルがbuttonのため共通認識器で除外されており、従来仕様との不一致ではなく操作対象の変更である。横ドラッグ後は画像を誤って開かず、通常タップと縦スクロールを維持する。警告操作・動画・音声・通常の操作部品・内部スクロール・拡大ビューは保護する。

検証結果と実機での確認境界はchangeの [verification.md](changes/archive/2026-11-22-allow-feed-swipe-on-images/verification.md) に記す。

## 投稿の添付メディアを使う共有画像

[post-attachment-ogp](changes/archive/2026-11-24-post-attachment-ogp/proposal.md) で、通常投稿のスレッドURLから取得するカード画像に公開可能な添付を使うようにした。 [SEO-03](specs/seo-deployment/spec.md#seo-03)

ローカルのHTTP環境でスレッドHTMLの共有画像URLを取得し、本番AppViewの公開投稿から画像（`/api/blob/…`、WebP）と動画サムネイル（`/api/video/…/thumbnail.jpg`、JPEG）を返せることを確認した。こっそりの検証データでは、添付の取得を行わずサイト共通画像へ誘導した。個別CW、ラベル、削除、取得失敗、公開条件が変わった場合の再取得はモックテストで確認した。

本番のスレッドHTMLが新しい画像URLを指し、添付画像を返すことを確認済み。Bluesky・Xなど外部サービスの表示は未確認。外部サービスで保存済みのカードは、そのサービスの保存期間に従う。

### ブログ編集欄のカード画像と取得上限

本番の投稿OGPが1,184,358バイトのWebPを返し、別リポジトリのAppViewと共用するリンクカード取得処理で同じURLが上限の1,000,000バイトを超えて413になることを確認した。ブログ編集欄ではカードのメタデータを取得できても画像だけが欠ける。編集欄の取得経路に、Nagiの投稿OGPを1 MB以内に縮小して使う処理を追加した。 [MEDIA-06の設計](specs/media-processing/design.md#d4-リンク情報の取得失敗で執筆を止めない)

## 著者別ブログURLの配信設定

ブログ公開の設計書では `/blog/<did>` の扱いを Vercel の rewrite と記載していた。リポジトリの配信設定では redirect として定義され、移動先は `/profile/<did>`。配信設定に合わせて設計書の説明を更新した。 [BLOG-07の設計](specs/blog-publication/design.md#d5-作成と編集を1つの執筆ページにまとめる) [Vercelの配信設定](../vercel.json)

## 個別ページのNagi紹介のテスト

公開投稿詳細へNagi紹介を追加する際、ブログの紹介を記事の前に期待する単体テストが残っていた。記事とコメントの後ろに紹介を表示するブログの現行仕様に合わせてテストを更新した。 [BLOG-08](specs/blog-publication/spec.md#blog-08) [FEED-12](specs/feed-thread/spec.md#feed-12)

## Bluesky連携設定の案内

Bluesky連携設定の日本語・英語の説明に、現行のクロスポスト仕様と異なる案内が残っている。文言は [日本語辞書](../src/lib/i18n/ja.ts) と [英語辞書](../src/lib/i18n/en.ts) の `crosspostHelp` と `crosspostSplitNote` で確認した。

- 返信は対象外と案内しているが、本人のクロスポスト済み投稿に既存コピーがある場合、Blueskyへ返信を続けられる。 [BSKY-04](specs/bluesky-integration/spec.md#bsky-04)
- 長文はBlueskyで複数投稿に分割すると案内しているが、Nagiのクロスポストでは冒頭と「もっと見る」のリンクを1件投稿する。Bluesky専用の返信・引用では分割する。 [BSKY-05](specs/bluesky-integration/spec.md#bsky-05)

## 登録計測の確認範囲

[track-signup-funnel](changes/track-signup-funnel/design.md) は登録OAuthを経たNagiプロフィール初回保存を集計する。EntrywayのOAuth結果にはAT Protocolアカウントの新規作成有無が含まれないため、既存のAT Protocolアカウントで初めてNagiプロフィールを作成した場合も、登録経路を通れば計上される。Umami Cloudでの集計と本番Entrywayでの往復は未確認。
