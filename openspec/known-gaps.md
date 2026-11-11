# 仕様判断・残課題・確認境界

利用者が確認した現行仕様と、コードから確認できた状態を記録する。仕様判断の確定と、コード・コメントへの反映完了を区別する。原文は [導入時コメント原文](reference/comment-snapshot/README.md) に保存する。行番号付き出典は採録コミットの固定位置を指す。

| 項目   | 確定した扱い                                          | コード・コメントの扱い                                               |
| ------ | ----------------------------------------------------- | -------------------------------------------------------------------- |
| GAP-01 | Bluesky投稿の権限はcreate限定。削除権限を追加しない。 | 削除を試みる処理が残る。後続の実装修正で扱う。                       |
| GAP-02 | publicationはユーザー別URL。共通URLは旧仕様。         | 古い説明は削減対象。旧データ互換の必要性とは分ける。                 |
| GAP-03 | Nagi内でBlueskyスレッドを閲覧できる。                 | 外部でしか見られないという説明は削減対象。                           |
| GAP-04 | 自分のクロスポスト済み投稿へ返信・引用できる。        | 現行ボタンの経路を確認済み。未使用の旧処理を現行機能として扱わない。 |
| GAP-05 | 設計案・PoCと現行動作の保証を区別する。               | 外部リポジトリの実装は未確認。                                       |
| GAP-06 | チャンネルは廃止済みでハッシュタグへ統合。            | 旧リンク・旧設定の互換は保持。古い機能説明は更新・削減対象。         |
| GAP-07 | 配信はadapter-staticとVercel Functions。              | 古いadapter-autoの説明は削減対象。                                   |

現在の作業では仕様書と説明文を更新し、アプリコード・依存関係・既存コメントは変更していない。

## GAP-01

### Blueskyのcreate限定権限と削除による補償

- 出典: [oauth/client.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/oauth/client.ts#L9)、[Composer.svelte](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L840)、[crosspost/bluesky.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L271)。
- コメントの不一致: OAuth側は「作成だけで更新・削除は一切行わない」と説明する。一方、投稿側はNagi保存失敗時に先行Blueskyコピーを削除して巻き戻すと説明する。
- 実装で確認: `CROSSPOST_SCOPE` は `?action=create`。通常投稿保存失敗時と分割投稿途中失敗時には `deleteBlueskyPosts()` を呼び、削除失敗はconsoleへ記録して継続する。
- 確定方針: Bluesky投稿の要求権限はcreateのみに限定する。不用意な削除権限を持たないことを優先し、後始末を成立させるために権限を拡張しない。
- 現行実装の残課題: 作成限定scopeと削除の試行が共存している。削除は拒否されうるため、コピーが残る可能性がある。旧セッションに広い権限が残っている場合もあるため、「必ず削除に失敗する」とは断定しない。
- 未確認: 実際のPDSでの削除拒否、旧全操作scopeを持つセッションとの差、コピー残存時の利用者体験。
- 後続の扱い: 削除を前提にした補償処理を、create限定の方針へ整合させる。途中まで作成されたコピーの扱いと利用者への案内は実装修正時に定義する。現時点では削除試行を除去したとは扱わない。

## GAP-02

### standard.siteのpublication URLの古い説明

- 出典: [standardsite/types.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/standardsite/types.ts#L7)、同ファイルの `nagiPublicationUrl`、[publication.ts](../src/lib/standardsite/publication.ts)、[repo.ts](../src/lib/standardsite/repo.ts)。
- コメントの不一致: `NAGI_PUBLIC_ORIGIN` の説明に全ユーザー共通URLが残る。直下の新しい説明と関数はユーザー別 `/blog/<did>` とする。
- 実装で確認: 現行URLは `https://nagi.suibari.com/blog/<did>`、旧共通originは `LEGACY_PUBLICATION_URL` として読み取り・移行に残る。documentを先に修正してからpublicationを更新する。
- 確定仕様: ユーザー別URLが現行仕様。全ユーザー共通URLの説明は旧仕様として現行の説明から除く。旧データの読み取り・移行コードは、説明が古いことだけを理由に削除しない。

## GAP-03

### Blueskyスレッドは外部表示だけ、という古い説明

- 出典: [bsky/links.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/links.ts#L1)、[bsky/thread.ts](../src/lib/bsky/thread.ts)、[BskyThreadUnit.svelte](../src/lib/components/bsky/BskyThreadUnit.svelte)、[threadルート](../src/routes/thread/[did]/[rkey]/+page.svelte)。
- コメントの不一致: links.tsにはプロフィールやスレッドを作り込まずbsky.appで開いてもらうとあるが、現在はNagi内にもBlueskyスレッド取得・表示の経路がある。
- 確定仕様: Nagi内でBlueskyスレッドを閲覧できる。DIDに基づく外部リンクも提供するが、外部表示しかできないという旧説明は削減対象とする。

## GAP-04

### クロスポスト済み投稿への返信・引用

- 確定仕様: 自分のクロスポスト済み投稿には、Bluesky側のコピーへの返信・引用として続けられる。コピーの存在・権限・CW等の条件は [BSKY-04](specs/bluesky-integration/spec.md#bsky-04) に従う。他人の投稿への対応拡張を意味しない。
- 現行経路: [ChatBubble.svelte](../src/lib/components/ChatBubble.svelte) のボタンは `openComposer()` → [composerHost](../src/lib/post/composer-host.svelte.ts) の `openReply()` / `openQuote()` → [Composer.svelte](../src/lib/components/Composer.svelte) へ進む。`ownCrosspost()` が本人の既存コピーを確認する。
- 調査の訂正: ChatBubbleに残る `submitPost()` は呼び出しがなく、その中の「返信・引用はクロスポストしない」という説明を現行の入口差と判断したのは誤りだった。未使用処理とそのコメントは後続の整理対象であり、現行の振る舞いの根拠にはしない。
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
- 確定仕様: チャンネルは廃止済みでハッシュタグへ統合されている。READMEの主な機能もハッシュタグの説明に更新した。旧URLや保存済みchannelタブの互換は維持する。

## GAP-07

### 完全SPA・adapter-auto等の旧テンプレート説明

- 出典: [card/render.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L28)、[vite.config.ts](../vite.config.ts)、[api/spa.ts](../api/spa.ts)。
- コメントには「完全SPA」「サーバーランタイムが無い」やadapter-autoの案内が残るが、現行構成はadapter-staticによるプリレンダとSPAフォールバック、Vercel Functionsの併用である。
- 確定仕様: adapter-staticで公開HTMLとSPA fallbackを生成し、名刺の保存PNGはブラウザCanvas、OGPはVercel Functionsで生成する。古いadapter-autoの案内と完全SPAという説明は削減対象とする。
- 未反映: 今回は古いコードコメントや依存パッケージを削除していない。不要依存の除去とコメント削減は別途、実際の利用箇所を確認して扱う。
