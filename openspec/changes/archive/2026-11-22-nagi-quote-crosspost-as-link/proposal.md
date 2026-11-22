# Proposal

## Why

Nagi投稿のURLを単独で貼ると引用になる（POST-07）。一方、Nagi投稿の引用は、引用先が自分のクロスポスト済み投稿でない限りBlueskyへクロスポストできない（BSKY-04）。この2つが重なり、「Nagiの投稿をBlueskyで紹介する」というありふれた使い方ができない。

クロスポストを止めている理由は、Bluesky側に引用先のレコードが無く、引用が黙って消えるためである。ニュースの引用（NEWS-03）も同じ理由で止めている。しかし引用先はNagiの公開URLで指すことができ、OGPもこっそり・ラベルの境界を守っている（SEO-03）。そのため、レコードを引用できなくてもリンクカードとして残せる。

さらに、他人の投稿のURLを単独で貼ると、URLが消えて「引用できません」と出る。Nagiだけの投稿でも、他人の投稿のリンクを貼れない。

## What Changes

2026-11-22に利用者と合意した方針は次のとおり。

- **Nagiの引用は、Blueskyではリンクカードにする**：Nagi側は従来どおり引用のまま。クロスポストのとき、引用先が自分のクロスポスト済み投稿でコピーを参照できる場合は、従来どおりコピーを引用する。それ以外は引用先の公開URLのリンクカード（`app.bsky.embed.external`）にする。画像・動画もある場合、Blueskyではexternalとメディアを同時に付けられない。このときはメディアを埋め込み、URLは本文の末尾にリンクとして入れる。
- **ニュース・ラジオの引用もクロスポストできる**：NEWS-03の「Blueskyへ同時投稿してはならない」を外す。ニュースのリンク先はNagiのニュースページ（`/news/{rkey}`）とする。Nagiへの誘導とサインアップの動線を兼ねるためで、元記事のURLにはしない。ラジオのリンク先は曲ページ（RADIO-04の共有と同じURL）とする。
- **引用先がこっそりの場合は従来どおりクロスポストできない**：Bluesky上に開けないリンクが出るだけになるため。
- **他人のNagi投稿は、リンクの文字だけにする**：引用を本人とbotたんに限っているのは、日本のSNSでは引用が攻撃と受け取られることがあり、トラブルを防ぐためである。問題は相手の本文を自分の投稿の中に見せることにあるので、引用の制限は変えない。ただし他人の投稿のURLを単独で貼った場合も、URLを消さずにリンクとして本文へ残す。他人の投稿のURLにはリンクカードを付けず、Nagi側・Blueskyのクロスポスト側のどちらでもリンクの文字だけを出す。リンクとしてBlueskyへ持ち出すことは許可する。

対象外とするもの：

- 返信と引用の同時外部化（BSKY-04の制限はそのまま）。
- Bluesky投稿への返信・引用（BSKY-09）。もともとBlueskyにだけ投稿するので変わらない。
- 引用を許可する相手（本人とbotたん）の範囲。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `bluesky-integration`：BSKY-04（引用があってもクロスポストできる条件）とBSKY-05（引用の埋め込み）を改める。
- `post-composer`：POST-07で、引用できない投稿のURLをリンクとして残し、他人のNagi投稿のURLにカードを付けないことを定める。
- `news-chronicle`：NEWS-03のBluesky同時投稿の禁止を外す。

## Impact

- クライアント：`src/lib/components/Composer.svelte`のクロスポスト可否（`externalEligible`）、`src/lib/crosspost/bluesky.ts`の埋め込み組み立て、`src/lib/post/quote-pick.svelte.ts`と`quote-url.ts`の貼り付け処理、`src/lib/components/LinkCardEditor.svelte`と`src/lib/atproto/facets.ts`のカード対象URL、使われていなかった`src/lib/news/quote.svelte.ts`（`NewsQuote`）の削除。
- 外部リポジトリ：Nagi AppViewとlexiconの変更は無い。リンクカードのメタデータ取得は既存のAppView APIを使う。
- 既存データ：変わらない。既に作られたクロスポストにも影響しない。
