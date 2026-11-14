# 仕様判断・残課題・確認境界

利用者が確認した現行仕様と、コードから確認できた状態を記録する。仕様判断の確定と、コード・コメントへの反映完了を区別する。原文は [導入時コメント原文](reference/comment-snapshot/README.md) に保存する。行番号付き出典は採録コミットの固定位置を指す。

| 項目   | 確定した扱い                                          | コード・コメントの扱い                                            |
| ------ | ----------------------------------------------------- | ----------------------------------------------------------------- |
| GAP-01 | Bluesky投稿の権限はcreate限定。削除権限を追加しない。 | 解消。Nagi保存後に投稿する順序へ改め、削除処理を除去した。        |
| GAP-02 | publicationはユーザー別URL。共通URLは旧仕様。         | 解消。古い説明を更新した。旧データの読み取り・移行コードは残す。  |
| GAP-03 | Nagi内でBlueskyスレッドを閲覧できる。                 | 解消。外部でしか見られないという説明を更新した。                  |
| GAP-04 | 自分のクロスポスト済み投稿へ返信・引用できる。        | 解消。未使用の旧処理 `submitPost()` を削除した。                  |
| GAP-05 | 設計案・PoCと現行動作の保証を区別する。               | 外部リポジトリの実装は未確認。                                    |
| GAP-06 | チャンネルは廃止済みでハッシュタグへ統合。            | 解消。古い機能説明を更新した。旧リンク・旧設定の互換は保持する。  |
| GAP-07 | 配信はadapter-staticとVercel Functions。              | 解消。adapter-autoと完全SPAの説明を削除・更新した。依存は未整理。 |

GAP-01はアプリコードの修正で解消した。GAP-02・03・04・06・07はコードコメントの更新と未使用処理の削除で解消した（2026-11-12）。GAP-05は外部実装の確認境界として残る。

## 通知の初回取得順

change [prioritize-startup-notification-count](changes/archive/2026-11-12-prioritize-startup-notification-count/proposal.md)で、通知件数取得をOAuthセッションの通常公開より先に開始する実装へ変更した（[NOTIFY-06](specs/notifications-unread/spec.md#notify-06)）。変更前の主仕様は初回取得の優先順位を規定しておらず、既存要件への違反ではなく新要件として追加した。OAuth復元・API通信・ナビバッジの描画を組み合わせたモック検証と、本番での通信・表示時間の実測は区別する。本番の認証済み環境での実測は未確認。

## GAP-01

### Blueskyのcreate限定権限と削除による補償

- 出典: [oauth/client.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/oauth/client.ts#L9)、[Composer.svelte](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L840)、[crosspost/bluesky.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L271)。
- コメントの不一致: OAuth側は「作成だけで更新・削除は一切行わない」と説明する。一方、投稿側はNagi保存失敗時に先行Blueskyコピーを削除して巻き戻すと説明する。
- 実装で確認: `CROSSPOST_SCOPE` は `?action=create`。通常投稿保存失敗時と分割投稿途中失敗時には `deleteBlueskyPosts()` を呼び、削除失敗はconsoleへ記録して継続する。
- 確定方針: Bluesky投稿の要求権限はcreateのみに限定する。不用意な削除権限を持たないことを優先し、後始末を成立させるために権限を拡張しない。
- 解消（2026-11-12）: change [crosspost-after-nagi-save](changes/crosspost-after-nagi-save/proposal.md) で、通常投稿もNagi保存後にBlueskyへ投稿し、コピーの参照を投稿へ追記する順序へ改めた。`deleteBlueskyPosts()` を削除し、分割投稿の途中失敗でも作成済みの分を削除しない。途中までのコピーと参照追記の失敗は警告で伝える（[BSKY-06](specs/bluesky-integration/spec.md#bsky-06)）。前提として、AppViewは見える内容が変わらない更新を編集とみなさない（[API-09](specs/appview-protocol/spec.md#api-09)）。AppViewは本番反映済み、クライアントは本番反映待ち。
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
- 対象外: ニュース等の引用は本人投稿の既存Blueskyコピーを持たないため、上記の対応対象と混同しない。

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

change [card-news-ultra-rare-threshold](changes/card-news-ultra-rare-threshold/proposal.md)で、取得ニュースをクライアント側でUR・AARに限定した（[CARD-10](specs/cards-zenkatsu/spec.md#card-10)）。従来のR以上というコードコメントは表示条件の説明として整理した。導入時の固定原文は変更しない。AppViewのニュース選定・配信データは別リポジトリのため未確認であり、サーバ側でR・SRの配信を停止したことは意味しない。クライアントの動作確認はモック応答によるものとし、本番での配信確認と区別する。
