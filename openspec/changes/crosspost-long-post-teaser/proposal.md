# Proposal

## Why

Nagiの投稿は最大3000文字まで書けるが、Blueskyへのクロスポストは300graphemesごとに分割し、返信でつないだスレッドとして出している（BSKY-05）。長い投稿ほどBlueskyのタイムラインを1本で埋め、読む側は続きを返信で辿る必要がある。全文の正本はNagiにあるので、Bluesky側は「冒頭と続きへの導線」で足りる。

Blueskyの長文投稿サービスmochottは、2026-11にこの形を採用した。Bluesky投稿には冒頭だけを書いて末尾を「…もっと見る」のリンクにし、さらに投稿レコードへ全文レコードへの強参照（`site.mochott.longPost`）を入れる。対応クライアント（ZonePane v49など）はこの目印を読んで、その場で全文を展開する。ブログ記事については、Nagiはすでに分割せず1件のティーザーを出している（BLOG-04）。

change [crosspost-after-nagi-save](../crosspost-after-nagi-save/proposal.md) で、BlueskyのコピーはNagi保存後に作る順序になった。コピーを作る時点でNagi投稿のURIとCIDが分かっているので、Bluesky側にNagiのURLと強参照を載せられる。この change では非対象として「別のchangeで扱う」としていた。

## What Changes

2026-11-24に利用者と合意した方針は次のとおり。

### フェーズ1：冒頭＋「…もっと見る」の1件にする

- **クロスポストは分割しない**：Nagi投稿のBlueskyコピーは常に1件にする。本文が300graphemes・3000bytesに収まれば、従来どおり全文を出す。超える場合は、上限に収まる冒頭の末尾に「…もっと見る」を付け、「もっと見る」にNagiのスレッドページ（`https://nagi.suibari.com/thread/{did}/{rkey}`）へのリンクを張る。文言はmochottに合わせる。
- **冒頭の切り方は従来の分割と同じ**：改行→空白→grapheme境界の順に区切り、URL・mention facetをまたがない。
- **埋め込みは従来どおり**：画像・動画・リンクカード・引用はその1件に付ける。画像付きの引用で引用先のURLを本文の末尾へ足す場合（BSKY-05）は、冒頭を切ってもURLを残す。
- **コピー参照**：コピーが1件なので、Nagi投稿の`crosspost`は`root`と`tail`が同じ投稿を指す。lexiconとAppViewは変わらない。既に分割で作られたコピー（`root`と`tail`が違う）も従来どおり扱う。
- **Bluesky投稿への返信・引用（BSKY-09）は分割を続ける**：Nagi投稿を作らないので、続きを置く場所が無いためである。

### フェーズ2：機械が読める目印 `com.suibari.nagi.longPost`

- **書く**：フェーズ1で本文を省略したときだけ、Blueskyコピーのレコードに追加フィールド`com.suibari.nagi.longPost`（Nagi投稿への強参照）を入れる。全文がBlueskyに載っているときは入れない。形と意味はmochottの`site.mochott.longPost`に揃える。
- **CIDは「クロスポストした時点の版」**：コピーを作った後でNagi投稿へ`crosspost`を追記するため、Nagi投稿のCIDは必ず1つ進む。強参照のCIDはコピー作成時に参照したNagi投稿の版とし、その旨をlexiconに明記する。Nagiは「編集済み」の判定にこのCIDを使わず、AppViewの判定（API-09）に従う。
- **読む**：NagiのBlueskyタブで、作者と同じリポジトリのNagi投稿を指す目印を持つ投稿には「全文を表示」を出す。押すとNagi AppViewからその投稿を取得し、その場で全文を表示する。取得できない場合は冒頭のまま理由を伝える。「もっと見る」のリンクは常に使える。

対象外とするもの：

- mochottの目印（`site.mochott.longPost`）の読み取り。読むだけで済むが、範囲を広げないため今回は見送る（2026-11-24に合意）。
- Bluesky公式アプリでの拡張カード（`associatedRefs`）。通常投稿はstandard.siteのdocumentを持たないため。
- 既に分割で作られたコピーの作り直し。
- ブログ記事のティーザー（BLOG-04）。すでに1件で出している。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `bluesky-integration`：BSKY-05（クロスポストを分割せず冒頭＋続きの導線にする）、BSKY-06（分割の途中失敗がクロスポストでは起きなくなる）を改め、BSKY-16（長文の目印の書き込みと読み取り）を追加する。

## Impact

- クライアント：`src/lib/crosspost/bluesky.ts`（冒頭の組み立て、クロスポストとBluesky専用投稿の経路の分岐、目印の書き込み）、`src/lib/crosspost/after-post.ts`と`src/lib/components/Composer.svelte`（Nagi投稿のURIとCIDを渡す）、`src/lib/components/bsky/BskyPostCard.svelte`と`src/lib/bsky/mapView.ts`（目印の読み取りと全文の表示）、i18n。
- 外部リポジトリ（bsky-affirmative-bot）：`packages/nagi-lexicon`に`com.suibari.nagi.longPost`を追加し、`com.atproto.lexicon.schema`として公開する。AppViewの取り込みは変わらない（Blueskyの投稿を見ていないため）。
- 既存データ：変わらない。既存の分割コピーへの返信・引用・削除は従来どおり動く。
- 権限：変わらない（Bluesky投稿のcreateとdelete）。
