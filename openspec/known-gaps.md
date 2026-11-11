# コメントと実装の不整合・確認境界

導入時点の実装を変えずに記録した。ここでの「確定」はコードから確認できた現状を指す。改善方針の承認や動作変更を意味しない。原文は [導入時コメント原文](reference/comment-snapshot/README.md) に分離して保存した。以下の行番号付きリンクは採録コミットの固定位置を示し、現行コードの位置を示すものではない。

## GAP-01

### Blueskyのcreate限定権限と削除による補償

- 出典: [oauth/client.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/oauth/client.ts#L9)、[Composer.svelte](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L840)、[crosspost/bluesky.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L271)。
- コメントの不一致: OAuth側は「作成だけで更新・削除は一切行わない」と説明する。一方、投稿側はNagi保存失敗時に先行Blueskyコピーを削除して巻き戻すと説明する。
- 実装で確認: `CROSSPOST_SCOPE` は `?action=create`。通常投稿保存失敗時と分割投稿途中失敗時には `deleteBlueskyPosts()` を呼び、削除失敗はconsoleへ記録して継続する。
- 基準仕様: 作成限定scopeの要求と削除の試行が共存している。削除成功は保証しない。コピーが残る可能性がある。
- 未確認: 実際のPDSでの削除拒否、旧全操作scopeを持つセッションとの差、コピー残存時の利用者体験。
- 後続で決めること: 権限と補償のどちらを変更するか。今回はコード・権限・コメントを変えない。

## GAP-02

### standard.siteのpublication URLの古い説明

- 出典: [standardsite/types.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/standardsite/types.ts#L7)、同ファイルの `nagiPublicationUrl`、[publication.ts](../src/lib/standardsite/publication.ts)、[repo.ts](../src/lib/standardsite/repo.ts)。
- コメントの不一致: `NAGI_PUBLIC_ORIGIN` の説明に全ユーザー共通URLが残る。直下の新しい説明と関数はユーザー別 `/blog/<did>` とする。
- 実装で確認: 現行URLは `https://nagi.suibari.com/blog/<did>`、旧共通originは `LEGACY_PUBLICATION_URL` として読み取り・移行に残る。documentを先に修正してからpublicationを更新する。
- 基準仕様: 現行ユーザー別URLと旧形式の移行を採用。共通URLの説明は旧経緯の出典であり、新規作成の要件としては採用しない。

## GAP-03

### Blueskyスレッドは外部表示だけ、という古い説明

- 出典: [bsky/links.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/links.ts#L1)、[bsky/thread.ts](../src/lib/bsky/thread.ts)、[BskyThreadUnit.svelte](../src/lib/components/bsky/BskyThreadUnit.svelte)、[threadルート](../src/routes/thread/[did]/[rkey]/+page.svelte)。
- コメントの不一致: links.tsにはプロフィールやスレッドを作り込まずbsky.appで開いてもらうとあるが、現在はNagi内にもBlueskyスレッド取得・表示の経路がある。
- 基準仕様: DIDに基づく外部リンク生成の意図は維持する。スレッドの内部表示が無いという説明は現在の機能制約として採用しない。

## GAP-04

### クロスポストできる返信・引用の入口差

- 出典: [Composer.svelte](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L378)、[ChatBubble.svelte](../src/lib/components/ChatBubble.svelte)、[news/quote.svelte.ts](../src/lib/news/quote.svelte.ts)。
- 実装で確認: 通常Composerは「本人のクロスポスト済み投稿を1つ参照」「コピー存在確認」等の条件で返信または引用をBlueskyへ継続できる。一方、吹き出し内の返信・引用やニュース引用には外部同時投稿しない経路がある。
- 基準仕様: 返信・引用を一律に外部禁止または一律に許可とはしない。入口別条件を維持する。
- 後続で決めること: 入口ごとの違いを統一するか。現段階では既存経路を変更しない。

## GAP-05

### 既存設計メモはサーバ実装の現状保証ではない

- [emoji-generation-design.md](../docs/emoji-generation-design.md) はGPU・ワーカー・複数候補等を含む設計案。現在のクライアントコメントは「進行中＋最新結果」の表示を説明している。旧案の候補数やGPU運用値をクライアントの現行要件へ自動転記しない。
- [bot-tan-radio-poc.md](../docs/bot-tan-radio-poc.md) は日付付きのPoC・実測記録。未確認と記載された英語公開等を本番保証へ昇格させない。
- AppViewのSQL、年齢強制、permission setの公開状態、botの生成判断、外部PDS・動画サービス・CDNの挙動は、クライアントの契約・コメント上の前提として記録した。この作業では別リポジトリや本番へアクセスして再検証していない。

## GAP-06

### READMEの旧チャンネル説明と現行のタグ統合

- 出典: [README.md](../README.md) の主な機能、[旧チャンネルルート](../src/routes/channels/[did]/[rkey]/+page.ts)、[feed-tabs/normalize.ts](../src/lib/feed-tabs/normalize.ts)。
- 実装で確認: 旧channelタブはhashtagへ移行し、旧URLはチャンネル名のタグページへ送る。新たなチャンネル取得APIは使わない。
- 基準仕様: タグへの統合と旧リンク互換を採用する。README全体の表現整理は後続とし、今回の既存README変更は仕様書への入口追加だけに限定する。

## GAP-07

### 完全SPA・adapter-auto等の旧テンプレート説明

- 出典: [card/render.ts](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L28)、[vite.config.ts](../vite.config.ts)、[api/spa.ts](../api/spa.ts)。
- コメントには「完全SPA」「サーバーランタイムが無い」やadapter-autoの案内が残るが、現行構成はadapter-staticによるプリレンダとSPAフォールバック、Vercel Functionsの併用である。
- 基準仕様: 名刺の保存PNGはブラウザCanvas、OGPはVercel Functionsで生成する。旧説明を根拠にサーバー関数の不存在やadapter-auto採用を要件にしない。
