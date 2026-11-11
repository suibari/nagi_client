# blog-publication：設計判断・コメント出典

この文書は初期仕様化時点のコメント原文を保存する設計資料である。現在の振る舞い・検証条件は [spec.md](spec.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/blog/articleMedia.ts

<!-- source: src/lib/blog/articleMedia.ts:7 -->

### [src/lib/blog/articleMedia.ts:7](../../../src/lib/blog/articleMedia.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 本文の上に出すヘッダー画像。 */
```

<!-- source: src/lib/blog/articleMedia.ts:9 -->

### [src/lib/blog/articleMedia.ts:9](../../../src/lib/blog/articleMedia.ts#L9)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 本文に置かれず、カバーにもしなかった画像。本文の後ろにまとめる。 */
```

<!-- source: src/lib/blog/articleMedia.ts:11 -->

### [src/lib/blog/articleMedia.ts:11](../../../src/lib/blog/articleMedia.ts#L11)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 本文の URL だけの行に置かれていないリンクカード。本文の後ろにまとめる。 */
```

<!-- source: src/lib/blog/articleMedia.ts:15 -->

### [src/lib/blog/articleMedia.ts:15](../../../src/lib/blog/articleMedia.ts#L15)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 記事の画像とリンクカードを、本文の行に置かれたもの（RichText がその位置に出す）と
 * それ以外に分ける。本文に置かれていない画像のうち先頭がカバー（本文内画像に対応する
 * 前の記事との互換。standard.site の coverImage も「1枚目の画像」）。
 * フィードと記事ページで同じ見た目にするため、両方ここを通す。
 *
 * appViewOrigins は AppView が返す画像 URL のオリジン（本文の URL と照合キーをそろえる）。
 */
```

## src/lib/blog/articleText.ts

<!-- source: src/lib/blog/articleText.ts:5 -->

### [src/lib/blog/articleText.ts:5](../../../src/lib/blog/articleText.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** タイトル行を除いた本文。 */
```

<!-- source: src/lib/blog/articleText.ts:7 -->

### [src/lib/blog/articleText.ts:7](../../../src/lib/blog/articleText.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 本文の前に落とした部分（タイトル行と続く空白）。facet のバイト位置をずらすのに使う。 */
```

<!-- source: src/lib/blog/articleText.ts:13 -->

### [src/lib/blog/articleText.ts:13](../../../src/lib/blog/articleText.ts#L13)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 記事の Markdown をタイトルと本文に分ける。記事は先頭の `# ` 行がタイトル。
 *
 * 訳文はモデルが `# ` を落とすことがあるので、原文に見出しがあった場合（headingExpected）は
 * 先頭の空でない行をタイトルとして扱う。そうしないとタイトルが本文の頭に重複して出る。
 */
```

## src/lib/blog/directory.ts

<!-- source: src/lib/blog/directory.ts:81 -->

### [src/lib/blog/directory.ts:81](../../../src/lib/blog/directory.ts#L81)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 公開ブログ一覧に、各 standard.site document が持つタグと概要を付ける。 */
```

## src/lib/blog/directoryTranslations.ts

<!-- source: src/lib/blog/directoryTranslations.ts:7 -->

### [src/lib/blog/directoryTranslations.ts:7](../../../src/lib/blog/directoryTranslations.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * ブログ一覧のカードに出す訳。一覧は全記事を一度に並べるので、記事ごとに翻訳を生成させると
 * 長文の生成が並んでしまう。ここでは AppView のキャッシュだけを引き、無ければ原文のまま出す。
 * 英訳は取り込み時に事前生成されているので、英語ならほぼ揃う。ほかの言語は誰かが記事を開いて
 * 訳したあとから一覧にも出る。
 */
```

<!-- source: src/lib/blog/directoryTranslations.ts:30 -->

### [src/lib/blog/directoryTranslations.ts:30](../../../src/lib/blog/directoryTranslations.ts#L30)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 訳文からカードのタイトルと概要を作る。訳されるのは記事本文（先頭の `# ` 行がタイトル）なので、
 * レコードに別の概要が書かれていても、訳では本文の冒頭を概要にする（buildBlogDirectoryItem と同じ長さ）。
 */
```

## src/lib/blog/inlineImages.ts

<!-- source: src/lib/blog/inlineImages.ts:4 -->

### [src/lib/blog/inlineImages.ts:4](../../../src/lib/blog/inlineImages.ts#L4)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 記事本文に書く画像の URL。Nagi の公開オリジンから AppView の blob プロキシへ
 * 転送する（vercel.json の rewrite）。standard.site の他のリーダーでもそのまま表示でき、
 * PDS を移転しても URL が変わらない。
 */
```

<!-- source: src/lib/blog/inlineImages.ts:15 -->

### [src/lib/blog/inlineImages.ts:15](../../../src/lib/blog/inlineImages.ts#L15)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * blob の URL から「DID/CID」の照合キーを取り出す。本文の URL（Nagi の公開オリジン）と
 * AppView が返す画像の URL（AppView 相対や AppView のオリジン）を同じキーにそろえる。
 * Nagi の blob 以外の URL は undefined（外部の画像は本文に読み込まない）。
 */
```

<!-- source: src/lib/blog/inlineImages.ts:38 -->

### [src/lib/blog/inlineImages.ts:38](../../../src/lib/blog/inlineImages.ts#L38)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 本文に1行画像として置かれている blob の照合キー。 */
```

<!-- source: src/lib/blog/inlineImages.ts:43 -->

### [src/lib/blog/inlineImages.ts:43](../../../src/lib/blog/inlineImages.ts#L43)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 本文に1行画像として置かれている blob の照合キーと、その行の alt（`![alt](url)`）。
 * 記事の入力欄では alt を本文の行で持つので、添付の alt をこれに合わせる。
 */
```

<!-- source: src/lib/blog/inlineImages.ts:57 -->

### [src/lib/blog/inlineImages.ts:57](../../../src/lib/blog/inlineImages.ts#L57)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 本文の画像行のうち alt が空のものへ、添付の alt（照合キーごと）を入れる。
 * 以前の記事は alt を添付だけに持つことがあり、本文の alt に揃える前に移しておく。
 */
```

<!-- source: src/lib/blog/inlineImages.ts:73 -->

### [src/lib/blog/inlineImages.ts:73](../../../src/lib/blog/inlineImages.ts#L73)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 画像の alt の上限（書記素）。添付の入力欄と同じ。 */
```

<!-- source: src/lib/blog/inlineImages.ts:83 -->

### [src/lib/blog/inlineImages.ts:83](../../../src/lib/blog/inlineImages.ts#L83)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 記事の入力欄で、本文の行に置いた画像の扱い。placed は今の本文にある照合キー、seen は
 * この編集中に一度でも本文にあった照合キー。
 * - 本文にある画像は入力欄の中に出すので、下の一覧には出さない
 * - 行を消した画像（seen にあって placed に無い）は一覧にも投稿にも出さない。添付は
 *   残しておき、元に戻すで行が戻れば画像も戻る
 * - 一度も本文に無かった画像（行単位の配置に対応する前の記事の画像など）は一覧に残す
 */
```

<!-- source: src/lib/blog/inlineImages.ts:100 -->

### [src/lib/blog/inlineImages.ts:100](../../../src/lib/blog/inlineImages.ts#L100)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** `![alt](url)` の alt に入れられない文字（改行と閉じ角括弧）を落とす。 */
```

<!-- source: src/lib/blog/inlineImages.ts:105 -->

### [src/lib/blog/inlineImages.ts:105](../../../src/lib/blog/inlineImages.ts#L105)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * Nagi の blob を指す画像行のうち、known（DID/CID）に無いものを本文から落とす。
 * 下書きは画像を保存しないので、戻した本文には添付の無い画像行が残りうる。
 * Nagi 以外の URL の画像行はそのまま残す。
 */
```

## src/lib/components/BlogCard.svelte

<!-- source: src/lib/components/BlogCard.svelte:15 -->

### [src/lib/components/BlogCard.svelte:15](../../../src/lib/components/BlogCard.svelte#L15)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 一覧が AppView のキャッシュから引いた訳文。無ければ原文を出す。 */
```

<!-- source: src/lib/components/BlogCard.svelte:59 -->

### [src/lib/components/BlogCard.svelte:59](../../../src/lib/components/BlogCard.svelte#L59)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
<!-- ブログを選ぶときの手がかり。数は出さず、どんな気持ちが届いているかだけを見せる。
		     一覧は公開キャッシュなので、ここでは付け外しさせない（記事を開いてから）。 -->
```

## src/lib/components/BlogModal.svelte

<!-- source: src/lib/components/BlogModal.svelte:12 -->

### [src/lib/components/BlogModal.svelte:12](../../../src/lib/components/BlogModal.svelte#L12)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
	 * ブログモーダル。ポストモーダルとは別の Composer を持ち、書きかけもこちらだけに残る。
	 *
	 * ポストモーダルと同じく、開いていない間も Composer を破棄しない（閉じて開き直すだけで
	 * 添付画像のプレビューと書きかけが失われないように）。マウントは +layout.svelte 側で
	 * 初めて開いたときに行い、以後はリロードまで残す。
	 */
```

<!-- source: src/lib/components/BlogModal.svelte:75 -->

### [src/lib/components/BlogModal.svelte:75](../../../src/lib/components/BlogModal.svelte#L75)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// 変換中の削除・置換は、実際の本文削除として扱わない。
```

## src/lib/standardsite/cache.ts

<!-- source: src/lib/standardsite/cache.ts:1 -->

### [src/lib/standardsite/cache.ts:1](../../../src/lib/standardsite/cache.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 解決済み publication の at-URI キャッシュ。listRecords を毎投稿で叩かないためのもので、
 * DID ごとに持つ。消えても listRecords で作り直せる（正しさは PDS 側が持つ）。
 * records.ts からも参照するため、依存を持たない単独モジュールに切っている。
 */
```

<!-- source: src/lib/standardsite/cache.ts:6 -->

### [src/lib/standardsite/cache.ts:6](../../../src/lib/standardsite/cache.ts#L6)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// v3: Nagi の記事公開では showInDiscover=true を保証する方針へ変えたため、既存キャッシュを
// 一度捨てて publication を再確認し、過去の false / 未設定レコードを次回公開時に補正する。
// v4: basicTheme（Nagi の配色）を既存 publication へ補うため、もう一度確認し直す。
// v5: publication.url をユーザーごとの /blog/<did> へ移すため、既存の publication を確認し直す。
```

<!-- source: src/lib/standardsite/cache.ts:33 -->

### [src/lib/standardsite/cache.ts:33](../../../src/lib/standardsite/cache.ts#L33)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// キャッシュできなくても listRecords で引き直せる。
```

<!-- source: src/lib/standardsite/cache.ts:37 -->

### [src/lib/standardsite/cache.ts:37](../../../src/lib/standardsite/cache.ts#L37)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 全データ削除のあと、消えた publication を指し続けないための後始末。 */
```

## src/lib/standardsite/commonmark.ts

<!-- source: src/lib/standardsite/commonmark.ts:4 -->

### [src/lib/standardsite/commonmark.ts:4](../../../src/lib/standardsite/commonmark.ts#L4)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * Nagi の本文（独自 Markdown + facet）を、standard.site の他のリーダーが同じ見た目で
 * 描ける GFM へ書き出す。
 *
 * Nagi の記法は CommonMark と次の点が違うので、元の文字列をそのまま載せるとずれる。
 * - 段落内の改行をそのまま改行として表示する（CommonMark ではスペースになる）
 * - リンク・メンション・タグは facet で持ち、本文には記法が無い
 * - `<b>` や `+ 項目`、行頭の `####` などは Nagi では文字のまま
 *
 * そこで Nagi のパーサで一度ブロックに分け、そこから組み立て直す。文字はすべて
 * エスケープするので、Nagi で記法として解釈されなかった文字は外でも文字のまま出る。
 */
```

<!-- source: src/lib/standardsite/commonmark.ts:59 -->

### [src/lib/standardsite/commonmark.ts:59](../../../src/lib/standardsite/commonmark.ts#L59)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** リストの項目は1行。続き行に見える字下げを作らないよう、改行は空白にする。 */
```

<!-- source: src/lib/standardsite/commonmark.ts:62 -->

### [src/lib/standardsite/commonmark.ts:62](../../../src/lib/standardsite/commonmark.ts#L62)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 同じリンク先の連続した run を1つの [label](url) にまとめて書く。 */
```

<!-- source: src/lib/standardsite/commonmark.ts:79 -->

### [src/lib/standardsite/commonmark.ts:79](../../../src/lib/standardsite/commonmark.ts#L79)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 段落内の改行は CommonMark のハード改行（行末の `\`）にする。各行の頭は記法に見えないよう守る。 */
```

<!-- source: src/lib/standardsite/commonmark.ts:108 -->

### [src/lib/standardsite/commonmark.ts:108](../../../src/lib/standardsite/commonmark.ts#L108)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * インラインで意味を持つ ASCII 記号を `\` でエスケープする。`!` は直後の `[` を
 * エスケープすれば画像にならないので触らない。`#` は行頭だけなので guardLineStart で扱う。
 */
```

<!-- source: src/lib/standardsite/commonmark.ts:114 -->

### [src/lib/standardsite/commonmark.ts:114](../../../src/lib/standardsite/commonmark.ts#L114)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 行頭でだけブロック記法になる文字（`#` `-` `+` `=` `1.`）と、
 * 字下げ（4つ以上でコードブロックになる）を無害にする。`>` は escapeText 済み。
 */
```

<!-- source: src/lib/standardsite/commonmark.ts:127 -->

### [src/lib/standardsite/commonmark.ts:127](../../../src/lib/standardsite/commonmark.ts#L127)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** リンク先に括弧や空白が入っていても壊れないよう、山括弧で囲む。 */
```

## src/lib/standardsite/document.ts

<!-- source: src/lib/standardsite/document.ts:26 -->

### [src/lib/standardsite/document.ts:26](../../../src/lib/standardsite/document.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 投稿の tag facet を document.tags へ。lexicon が「先頭に # を付けるな」と明記している。
 * 呼び出し元によって facet の型が composer 由来／AppView 由来で異なるので、
 * 構造だけを見る緩い型で受けて中で絞り込む。
 */
```

<!-- source: src/lib/standardsite/document.ts:46 -->

### [src/lib/standardsite/document.ts:46](../../../src/lib/standardsite/document.ts#L46)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 投稿を standard.site の記事として公開する。
 * document の rkey には元の Nagi 投稿の rkey をそのまま使う（どちらも key: tid）。
 * これで対応表を持たずに編集・削除を追従できる。
 */
```

<!-- source: src/lib/standardsite/document.ts:68 -->

### [src/lib/standardsite/document.ts:68](../../../src/lib/standardsite/document.ts#L68)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 既存の記事を投稿の編集に追従させる。まだ記事化されていない投稿なら何もしない
 * （編集をきっかけに勝手に公開しない）。site / publishedAt / 未知フィールドは保持する。
 */
```

<!-- source: src/lib/standardsite/document.ts:90 -->

### [src/lib/standardsite/document.ts:90](../../../src/lib/standardsite/document.ts#L90)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// 既存の site は信用しない。初期実装が他アプリの publication を掴んでいたことがあるため、
	// 常に Nagi の publication へ張り直す（編集をきっかけに自己修復させる）。
```

<!-- source: src/lib/standardsite/document.ts:95 -->

### [src/lib/standardsite/document.ts:95](../../../src/lib/standardsite/document.ts#L95)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// 本文から見出しが取れなかった編集では、いま付いているタイトルを残す。
```

<!-- source: src/lib/standardsite/document.ts:99 -->

### [src/lib/standardsite/document.ts:99](../../../src/lib/standardsite/document.ts#L99)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// nagi を渡さない呼び出しでも、既存の facet・添付を引き継いでから組み立てる
	// （content の書き出しは facet を使い、nagi は丸ごと上書きされるため）。
```

<!-- source: src/lib/standardsite/document.ts:112 -->

### [src/lib/standardsite/document.ts:112](../../../src/lib/standardsite/document.ts#L112)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// description と textContent は markdown から作り直せるので、本文が消えたら落とす。
	// tags / coverImage / bskyPostRef は本文からは導けず、記事の公開時に一度だけ決まる。
	// 本文編集の追従（ChatBubble の syncStandardSiteDocument）はこれらを渡さないので、
	// ここで消すと編集のたびにヘッダー画像とタグが黙って失われる。
```

<!-- source: src/lib/standardsite/document.ts:129 -->

### [src/lib/standardsite/document.ts:129](../../../src/lib/standardsite/document.ts#L129)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 投稿の削除に追従して記事も消す。記事化していない投稿では何も起きない。 */
```

## src/lib/standardsite/preferences.ts

<!-- source: src/lib/standardsite/preferences.ts:3 -->

### [src/lib/standardsite/preferences.ts:3](../../../src/lib/standardsite/preferences.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 現在のセッションに、ログイン時必須の site.standard.* 書き込み権限が付与されているか。 */
```

<!-- source: src/lib/standardsite/preferences.ts:6 -->

### [src/lib/standardsite/preferences.ts:6](../../../src/lib/standardsite/preferences.ts#L6)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * その投稿を「ブログとしても出す」候補に載せてよいか。
 * 記事は公開レコードとして外部から読まれるので、Nagi のタイムラインに出さない投稿
 * （こっそり投稿）は対象外にする。長さでは絞らない。
 */
```

## src/lib/standardsite/publication.ts

<!-- source: src/lib/standardsite/publication.ts:26 -->

### [src/lib/standardsite/publication.ts:26](../../../src/lib/standardsite/publication.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** Nagi プロフィールから publication の表示情報を組み立てる。 */
```

<!-- source: src/lib/standardsite/publication.ts:37 -->

### [src/lib/standardsite/publication.ts:37](../../../src/lib/standardsite/publication.ts#L37)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * publication を用意して at-URI を返す。無ければ作る（初回ブログ投稿時の遅延作成）。
 * 表示情報は Nagi プロフィールから取り、アバターの BlobRef は同一リポジトリなので再利用する。
 *
 * 探索は必ず findNagiPublication を通す。repo には blento.app など他アプリの
 * publication も同居しうるので、先頭 1 件を採ると他人のブログに記事をぶら下げてしまう。
 */
```

<!-- source: src/lib/standardsite/publication.ts:56 -->

### [src/lib/standardsite/publication.ts:56](../../../src/lib/standardsite/publication.ts#L56)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// Nagi では記事として公開する選択自体を発見フィードへの掲載同意として扱う。
		// 過去の設定が false / 未設定でも、次に記事を公開するときに ON へ揃える。
		// 配色も同じ機会に Nagi の既定へ揃える（Bluesky の記事カードのボタン色になる）。
```

<!-- source: src/lib/standardsite/publication.ts:87 -->

### [src/lib/standardsite/publication.ts:87](../../../src/lib/standardsite/publication.ts#L87)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * publication の表示情報と設定を書き戻す。未知の将来フィールドは保持する。
 * prefs を省略すると既存の preferences をそのまま残す。
 * 書き戻す対象は Nagi の publication のみ（他アプリのレコードは触らない）。
 */
```

<!-- source: src/lib/standardsite/publication.ts:117 -->

### [src/lib/standardsite/publication.ts:117](../../../src/lib/standardsite/publication.ts#L117)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// description / icon はプロフィール側で空にされたら落とす。
```

<!-- source: src/lib/standardsite/publication.ts:130 -->

### [src/lib/standardsite/publication.ts:130](../../../src/lib/standardsite/publication.ts#L130)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 共通 url（移行前）の publication をユーザーごとの url へ移す。
 * document の path は url からの相対なので、先に document を直してから url を変える。
 * document の途中で失敗したら url は古いまま残り、次の呼び出しでやり直せる。
 */
```

<!-- source: src/lib/standardsite/publication.ts:159 -->

### [src/lib/standardsite/publication.ts:159](../../../src/lib/standardsite/publication.ts#L159)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * サインイン時に一度だけ、移行前の publication と記事を今の形へ直す。
 * 次に記事を書くまで待つと、それまで standard.site の検証が通らないままになるため。
 * 権限不足などで失敗したら印を付けず、次回のサインインでやり直す。
 */
```

<!-- source: src/lib/standardsite/publication.ts:172 -->

### [src/lib/standardsite/publication.ts:172](../../../src/lib/standardsite/publication.ts#L172)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * publication の現在の版への強参照。Bluesky のティーザーの associatedRefs に固定する。
 * 後で publication を書き換えても、Bluesky は固定した版でカードを出し続ける。
 */
```

<!-- source: src/lib/standardsite/publication.ts:188 -->

### [src/lib/standardsite/publication.ts:188](../../../src/lib/standardsite/publication.ts#L188)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 既存の Nagi publication がある場合だけ、現在のプロフィールを反映する。
 * プロフィール編集をきっかけにブログ公開を勝手に有効化しないため、新規作成はしない。
 */
```

## src/lib/standardsite/record.test.ts

<!-- source: src/lib/standardsite/record.test.ts:19 -->

### [src/lib/standardsite/record.test.ts:19](../../../src/lib/standardsite/record.test.ts#L19)

分類: 検証・再現条件。対応仕様: [blog-publication](spec.md#requirements)。

```text
// publication.url（/blog/<did>）からの相対。
```

## src/lib/standardsite/record.ts

<!-- source: src/lib/standardsite/record.ts:18 -->

### [src/lib/standardsite/record.ts:18](../../../src/lib/standardsite/record.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** BlobRef が coverImage として使えるサイズか。 */
```

<!-- source: src/lib/standardsite/record.ts:31 -->

### [src/lib/standardsite/record.ts:31](../../../src/lib/standardsite/record.ts#L31)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// publication.url（/blog/<did>）からの相対。連結すると /blog/<did>/<rkey> になる。
```

<!-- source: src/lib/standardsite/record.ts:34 -->

### [src/lib/standardsite/record.ts:34](../../../src/lib/standardsite/record.ts#L34)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// Nagi の原文と facet は nagi に残す（AppView と編集はこちらを読む）。
		// content には他のリーダー向けに書き出した GFM を置く。打ち消し線（~~）を使うので
		// flavor は gfm。
```

## src/lib/standardsite/repo.ts

<!-- source: src/lib/standardsite/repo.ts:17 -->

### [src/lib/standardsite/repo.ts:17](../../../src/lib/standardsite/repo.ts#L17)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * site.standard.* は Nagi 専用のコレクションではない。同じ repo に blento.app など
 * ほかのアプリが作った publication / document が同居しうるので、
 * 「Nagi が作ったものだけ」を必ず絞り込んでから読み書きする。
 * 判別は publication.url が Nagi の公開オリジンかどうかで行う。
 *
 * records.ts からも使うため、records.ts に依存しないモジュールに切り出している
 * （publication.ts は Nagi プロフィールを読むので records.ts に依存する）。
 */
```

<!-- source: src/lib/standardsite/repo.ts:41 -->

### [src/lib/standardsite/repo.ts:41](../../../src/lib/standardsite/repo.ts#L41)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** Nagi の publication か。移行前の共通 url と、この DID 用の url のどちらも認める。 */
```

<!-- source: src/lib/standardsite/repo.ts:47 -->

### [src/lib/standardsite/repo.ts:47](../../../src/lib/standardsite/repo.ts#L47)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 移行前の共通 url のままか。 */
```

<!-- source: src/lib/standardsite/repo.ts:73 -->

### [src/lib/standardsite/repo.ts:73](../../../src/lib/standardsite/repo.ts#L73)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * この DID の「Nagi の」publication を探す。key が tid なので 'self' 固定にできず、
 * ほかのアプリのレコードとも同居するため、url で照合する。Nagi は1件しか作らない。
 */
```

<!-- source: src/lib/standardsite/repo.ts:97 -->

### [src/lib/standardsite/repo.ts:97](../../../src/lib/standardsite/repo.ts#L97)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 移行前の document を今の形へ直した値を返す。直す所が無ければ undefined。
 * - path を publication.url からの相対（/<rkey>）へ
 * - Nagi の原文を nagi.text へ移し、content には書き出した GFM を置く
 */
```

<!-- source: src/lib/standardsite/repo.ts:131 -->

### [src/lib/standardsite/repo.ts:131](../../../src/lib/standardsite/repo.ts#L131)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * Nagi の publication に属する document を今の形へそろえる。
 * publication.url をユーザーごとへ変えたときに呼ぶ（path の基準が変わるため）。
 * 途中で失敗しても、次の呼び出しで残りを直せる（直し済みは migratedDocument が飛ばす）。
 */
```

<!-- source: src/lib/standardsite/repo.ts:156 -->

### [src/lib/standardsite/repo.ts:156](../../../src/lib/standardsite/repo.ts#L156)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * 全データ削除から呼ぶ、Nagi が作った standard.site レコードだけの掃除。
 * ほかのアプリの publication / document は残す。
 */
```

<!-- source: src/lib/standardsite/repo.ts:166 -->

### [src/lib/standardsite/repo.ts:166](../../../src/lib/standardsite/repo.ts#L166)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// document は site が Nagi の publication を指しているものだけ消す。
```

## src/lib/standardsite/theme.test.ts

<!-- source: src/lib/standardsite/theme.test.ts:6 -->

### [src/lib/standardsite/theme.test.ts:6](../../../src/lib/standardsite/theme.test.ts#L6)

分類: 検証・再現条件。対応仕様: [blog-publication](spec.md#requirements)。

```text
// WCAG 2.x の相対輝度。Bluesky の記事カードと同じ基準で accent の組を確かめる。
```

<!-- source: src/lib/standardsite/theme.test.ts:27 -->

### [src/lib/standardsite/theme.test.ts:27](../../../src/lib/standardsite/theme.test.ts#L27)

分類: 検証・再現条件。対応仕様: [blog-publication](spec.md#requirements)。

```text
// PDS は DAG-CBOR のキー順で返す。
```

## src/lib/standardsite/types.ts

<!-- source: src/lib/standardsite/types.ts:3 -->

### [src/lib/standardsite/types.ts:3](../../../src/lib/standardsite/types.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** markdown を document.content の open union に載せるための lexicon（markpub.at）。 */
```

<!-- source: src/lib/standardsite/types.ts:7 -->

### [src/lib/standardsite/types.ts:7](../../../src/lib/standardsite/types.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * publication.url は「document.path と連結して canonical URL を作るためのベース」と
 * lexicon に明記されている。ユーザーごとの publication でも url は Nagi 本体で共通にし、
 * name / description / icon で個人を表す。ローカル開発でも本番の公開 URL を書く
 * （レコードは恒久的で、localhost を指しても意味がないため）。
 */
```

<!-- source: src/lib/standardsite/types.ts:15 -->

### [src/lib/standardsite/types.ts:15](../../../src/lib/standardsite/types.ts#L15)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * ユーザーごとの publication.url。standard.site の検証は url の
 * `/.well-known/site.standard.publication`（パス付きならその後ろにパス）を引くので、
 * 全員で同じ url を共有すると1件しか答えられない。ユーザーごとのパスにして、
 * `/.well-known/site.standard.publication/blog/<did>` で各自の publication を返す。
 * document.path はこの url からの相対（`/<rkey>`）になり、canonical URL は従来と同じ
 * `/blog/<did>/<rkey>` のまま変わらない。
 */
```

<!-- source: src/lib/standardsite/types.ts:25 -->

### [src/lib/standardsite/types.ts:25](../../../src/lib/standardsite/types.ts#L25)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 移行前の publication.url（全員共通のオリジン）。読み取りでは引き続き Nagi のものと認める。 */
```

<!-- source: src/lib/standardsite/types.ts:37 -->

### [src/lib/standardsite/types.ts:37](../../../src/lib/standardsite/types.ts#L37)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * publication.basicTheme。Bluesky の記事カードはボタンに accent / accentForeground を使い、
 * 両者のコントラスト比が 4.5 未満だと黙って既定色へ戻す。Nagi の主ボタン
 * （tokens.css の --accent / --text-on-accent、比は約6.3）と同じ組み合わせにしている。
 * background / foreground はカードではまだ使われないが、lexicon 上は必須。
 */
```

<!-- source: src/lib/standardsite/types.ts:53 -->

### [src/lib/standardsite/types.ts:53](../../../src/lib/standardsite/types.ts#L53)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
 * PDS から読んだ basicTheme が Nagi の配色か。DAG-CBOR はキー順を並べ替えて返すので、
 * JSON 文字列ではなく色の値で比べる。
 */
```

<!-- source: src/lib/standardsite/types.ts:89 -->

### [src/lib/standardsite/types.ts:89](../../../src/lib/standardsite/types.ts#L89)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** コメントを追える Bluesky 投稿。Nagi ではティーザー投稿を指す。 */
```

<!-- source: src/lib/standardsite/types.ts:93 -->

### [src/lib/standardsite/types.ts:93](../../../src/lib/standardsite/types.ts#L93)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 投稿1件を standard.site の記事として書き出すための入力。 */
```

<!-- source: src/lib/standardsite/types.ts:95 -->

### [src/lib/standardsite/types.ts:95](../../../src/lib/standardsite/types.ts#L95)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
	 * Nagi のリッチテキスト・添付。正本の文書内に保存する。
	 * 原文の text は buildRecord が markdown から入れる（facet の位置はこの原文が基準）。
	 */
```

<!-- source: src/lib/standardsite/types.ts:107 -->

### [src/lib/standardsite/types.ts:107](../../../src/lib/standardsite/types.ts#L107)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** Nagi 投稿の rkey。document の rkey にもそのまま使う。 */
```

<!-- source: src/lib/standardsite/types.ts:110 -->

### [src/lib/standardsite/types.ts:110](../../../src/lib/standardsite/types.ts#L110)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 生の markdown（Nagi 投稿の text そのもの）。 */
```

<!-- source: src/lib/standardsite/types.ts:113 -->

### [src/lib/standardsite/types.ts:113](../../../src/lib/standardsite/types.ts#L113)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/**
	 * 記事のタグ。省略すると、既存レコードのタグをそのまま残す
	 * （本文編集での追従がタグを消してしまわないようにするため）。
	 */
```

<!-- source: src/lib/standardsite/types.ts:118 -->

### [src/lib/standardsite/types.ts:118](../../../src/lib/standardsite/types.ts#L118)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** 1枚目の画像の BlobRef。1MB 以下のときだけ渡す。 */
```

<!-- source: src/lib/standardsite/types.ts:120 -->

### [src/lib/standardsite/types.ts:120](../../../src/lib/standardsite/types.ts#L120)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
/** Bluesky へティーザーを出したときだけ、その投稿への強参照。 */
```

## src/routes/blog/+page.svelte

<!-- source: src/routes/blog/+page.svelte:20 -->

### [src/routes/blog/+page.svelte:20](../../../src/routes/blog/+page.svelte#L20)

分類: ツール指示（削除対象外）。対応仕様: [blog-publication](spec.md#requirements)。

```text
// svelte-ignore state_referenced_locally -- prerender seed; onMount enriches it with document tags
```

<!-- source: src/routes/blog/+page.svelte:46 -->

### [src/routes/blog/+page.svelte:46](../../../src/routes/blog/+page.svelte#L46)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// カードの自動翻訳。キャッシュ済みの訳だけを引く（理由は fetchCachedBlogTranslations）。
	// 記事の言語は一覧に載らないので、原文と同じ言語の訳はそもそもキャッシュに無いことに任せる。
```

<!-- source: src/routes/blog/+page.svelte:49 -->

### [src/routes/blog/+page.svelte:49](../../../src/routes/blog/+page.svelte#L49)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// 再読込で同じ並びが返ってきたときに引き直さないよう、URI の並びを文字列で持つ。
```

## src/routes/blog/+page.ts

<!-- source: src/routes/blog/+page.ts:12 -->

### [src/routes/blog/+page.ts:12](../../../src/routes/blog/+page.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// タグは hydration 後に各 document から補う。静的 HTML にも記事そのものは残す。
```

## src/routes/blog/[did]/[rkey]/+page.svelte

<!-- source: src/routes/blog/[did]/[rkey]/+page.svelte:29 -->

### [src/routes/blog/[did]/[rkey]/+page.svelte:29](../../../src/routes/blog/[did]/[rkey]/+page.svelte#L29)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// プリレンダHTMLには紹介を残し、認証確認中は GuestHero の CSS で隠す。
```

<!-- source: src/routes/blog/[did]/[rkey]/+page.svelte:31 -->

### [src/routes/blog/[did]/[rkey]/+page.svelte:31](../../../src/routes/blog/[did]/[rkey]/+page.svelte#L31)

分類: ツール指示（削除対象外）。対応仕様: [blog-publication](spec.md#requirements)。

```text
// svelte-ignore state_referenced_locally -- prerender snapshot; onMount refreshes viewer-specific state
```

<!-- source: src/routes/blog/[did]/[rkey]/+page.svelte:68 -->

### [src/routes/blog/[did]/[rkey]/+page.svelte:68](../../../src/routes/blog/[did]/[rkey]/+page.svelte#L68)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// 記事本文の自動翻訳。プリレンダの HTML は原文のまま残し（検索・OGP 用）、
	// AppView のスレッドが読めて langs と cid が揃ってから訳文へ差し替える。
	// AppView は日本語などの記事を取り込み時に英訳しているので、英語ならキャッシュから返る。
```

<!-- source: src/routes/blog/[did]/[rkey]/+page.svelte:104 -->

### [src/routes/blog/[did]/[rkey]/+page.svelte:104](../../../src/routes/blog/[did]/[rkey]/+page.svelte#L104)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// facet のバイト位置は原文のもの。訳文には当てない。
```

<!-- source: src/routes/blog/[did]/[rkey]/+page.svelte:121 -->

### [src/routes/blog/[did]/[rkey]/+page.svelte:121](../../../src/routes/blog/[did]/[rkey]/+page.svelte#L121)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// 本文に `![alt](url)` で置いた画像・URL だけの行に置いたリンクカードはその位置に出す。
	// 残りの画像の先頭はヘッダー、それ以外とカードは本文の後ろにまとめる（フィードと共通）。
```

<!-- source: src/routes/blog/[did]/[rkey]/+page.svelte:190 -->

### [src/routes/blog/[did]/[rkey]/+page.svelte:190](../../../src/routes/blog/[did]/[rkey]/+page.svelte#L190)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
<!-- standard.site の document 検証。プリレンダの記事は SPA 関数（og/html.ts）を通らないので、ここでも出す。 -->
```

## src/routes/blog/[did]/[rkey]/+page.ts

<!-- source: src/routes/blog/[did]/[rkey]/+page.ts:50 -->

### [src/routes/blog/[did]/[rkey]/+page.ts:50](../../../src/routes/blog/[did]/[rkey]/+page.ts#L50)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// 記事本体は prerender で残し、画像や著者情報も取得できれば HTML に含める。
	// AppView が一時的に読めなくても記事本文の公開は続ける。
```

<!-- source: src/routes/blog/[did]/[rkey]/+page.ts:60 -->

### [src/routes/blog/[did]/[rkey]/+page.ts:60](../../../src/routes/blog/[did]/[rkey]/+page.ts#L60)

分類: 仕様・設計の根拠。対応仕様: [blog-publication](spec.md#requirements)。

```text
// 旧記事や PDS の一時エラーではタグ欄だけを省く。
```

## tests/e2e/blog-reactions.spec.ts

<!-- source: tests/e2e/blog-reactions.spec.ts:41 -->

### [tests/e2e/blog-reactions.spec.ts:41](../../../tests/e2e/blog-reactions.spec.ts#L41)

分類: 検証・再現条件。対応仕様: [blog-publication](spec.md#requirements)。

```text
// 数は出さない。付け外しもさせない（一覧は公開キャッシュ）。
```
