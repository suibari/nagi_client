# seo-deployment：設計判断・コメント出典

この文書は初期仕様化時点のコメント原文を保存する設計資料である。現在の振る舞い・検証条件は [spec.md](spec.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## api/_ogp.ts

<!-- source: api/_ogp.ts:1 -->

### [api/_ogp.ts:1](../../../api/_ogp.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * OGP 画像関数どうしで共有する取得・整形処理。
 * `_` 始まりのファイルは Vercel の関数として公開されない。
 */
```

<!-- source: api/_ogp.ts:60 -->

### [api/_ogp.ts:60](../../../api/_ogp.ts#L60)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// AppView のプロフィール画像は自前の blob proxy 相対URLだけを正規経路とする。
	// DB値を任意URLとして画像レンダラーに取得させない（SSRF 防止）。
```

<!-- source: api/_ogp.ts:76 -->

### [api/_ogp.ts:76](../../../api/_ogp.ts#L76)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * ImageResponse の既定フォントは Regular しか持たず、太字指定が効かない。
 * カードに載る文字だけを Noto Sans JP からサブセット取得する（@vercel/og の動的読込と同じ方式）。
 * 取れなければ既定フォントで描く。
 */
```

<!-- source: api/_ogp.ts:84 -->

### [api/_ogp.ts:84](../../../api/_ogp.ts#L84)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// TTF を返させるための古い Safari の UA。satori は WOFF2 を読めない。
```

## api/_profile-card-image.ts

<!-- source: api/_profile-card-image.ts:10 -->

### [api/_profile-card-image.ts:10](../../../api/_profile-card-image.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * Bluesky の画像 CDN は `@jpeg` 指定で元画像の形式によらず JPEG を返す。
 * blob proxy の URL から did / cid を取り出して組み立てる。
 */
```

<!-- source: api/_profile-card-image.ts:50 -->

### [api/_profile-card-image.ts:50](../../../api/_profile-card-image.ts#L50)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * ImageResponse は WebP を読み込めても、最終的な SVG -> PNG 変換で画像を描画できない。
 * JPEG / PNG はそのまま data URI にし、それ以外（WebP など）は Bluesky CDN の JPEG で代替する。
 * 画像変換ライブラリ（sharp）を関数バンドルに含めないための構成。
 */
```

## api/advent-card.tsx

<!-- source: api/advent-card.tsx:19 -->

### [api/advent-card.tsx:19](../../../api/advent-card.tsx#L19)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * アドカレのクリスマスカードの共有画像。アプリ内のカード（AdventCard.svelte）と同じ構図で、
 * 寸法は 1200x630 のときの値をそのまま px で持つ（アプリ側は cqw で同じ比率）。
 */
```

<!-- source: api/advent-card.tsx:24 -->

### [api/advent-card.tsx:24](../../../api/advent-card.tsx#L24)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** tokens.css の --advent-* と同じ値。共有画像は閲覧者のテーマに左右されない。 */
```

<!-- source: api/advent-card.tsx:46 -->

### [api/advent-card.tsx:46](../../../api/advent-card.tsx#L46)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** static/advent/bot-santa.png の比率（420x519）。 */
```

<!-- source: api/advent-card.tsx:53 -->

### [api/advent-card.tsx:53](../../../api/advent-card.tsx#L53)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// シェアした人が英語で見ていれば、画像も英語にする。
```

<!-- source: api/advent-card.tsx:61 -->

### [api/advent-card.tsx:61](../../../api/advent-card.tsx#L61)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// まだ開いていない日は AppView が返さない。先回りした URL では中身を出さない。
```

<!-- source: api/advent-card.tsx:113 -->

### [api/advent-card.tsx:113](../../../api/advent-card.tsx#L113)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/* 写真の右端をカードの地へ溶かす（satori は mask-image を持たない）。 */
```

<!-- source: api/advent-card.tsx:128 -->

### [api/advent-card.tsx:128](../../../api/advent-card.tsx#L128)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// satori は inset を持たない。
```

<!-- source: api/advent-card.tsx:226 -->

### [api/advent-card.tsx:226](../../../api/advent-card.tsx#L226)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// カードは選んだあと変わらない。名前・アバターの変更だけ、1日で追いつけばよい。
```

## api/post-card.tsx

<!-- source: api/post-card.tsx:41 -->

### [api/post-card.tsx:41](../../../api/post-card.tsx#L41)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** アプリの既定でぼかす自己ラベル（src/lib/moderation/preferences.svelte.ts と同じ）。 */
```

<!-- source: api/post-card.tsx:44 -->

### [api/post-card.tsx:44](../../../api/post-card.tsx#L44)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** 共有先のプレビューに出すと困る投稿は、本文の代わりに定型文だけを載せる。 */
```

<!-- source: api/post-card.tsx:55 -->

### [api/post-card.tsx:55](../../../api/post-card.tsx#L55)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** `:bottan-nagi:` のような絵文字ショートコードは画像にできないので落とす。 */
```

<!-- source: api/post-card.tsx:58 -->

### [api/post-card.tsx:58](../../../api/post-card.tsx#L58)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** ポストは改行も文面の一部なので残し、空行と行内の連続空白だけを詰める。 */
```

<!-- source: api/post-card.tsx:63 -->

### [api/post-card.tsx:63](../../../api/post-card.tsx#L63)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// 記事本文の画像行（![alt](url)）はカードに文字として出さない。
```

<!-- source: api/post-card.tsx:65 -->

### [api/post-card.tsx:65](../../../api/post-card.tsx#L65)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// lineClamp が改行位置で切ると改行が欠け字形で描かれるので、行数はここで先に揃える。
```

<!-- source: api/post-card.tsx:108 -->

### [api/post-card.tsx:108](../../../api/post-card.tsx#L108)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// こっそり投稿は誰が書いたかも外へ出さず、サイト共通の画像に倒す。
```

<!-- source: api/post-card.tsx:122 -->

### [api/post-card.tsx:122](../../../api/post-card.tsx#L122)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// CSS の省略記号は字形が欠けるので、はみ出す前に文字数で切る。
```

<!-- source: api/post-card.tsx:197 -->

### [api/post-card.tsx:197](../../../api/post-card.tsx#L197)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// satori は break-all だと改行を空白扱いにする。
```

## api/spa.ts

<!-- source: api/spa.ts:33 -->

### [api/spa.ts:33](../../../api/spa.ts#L33)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// `vercel dev` だけのフォールバック。デプロイ環境では信頼済みの VERCEL_URL を必ず使い、
	// 外部入力の Host ヘッダーを fetch 先にしない（SSRF 防止）。
```

<!-- source: api/spa.ts:40 -->

### [api/spa.ts:40](../../../api/spa.ts#L40)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// 本文のない SPA shell だけを検索から除外する。ブログの生成済み HTML は
	// Vercel のファイル配信が優先され、この関数を通らないため索引可能なまま。
	// vercel.json の /blog/* ヘッダでは生成済み記事まで noindex になる。
```

<!-- source: api/spa.ts:77 -->

### [api/spa.ts:77](../../../api/spa.ts#L77)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// Vercel の静的 shell 取得だけが失敗した場合は従来の /200 へ戻す。
		// 通常は到達しないが、OGP補助の一時障害を固定HTMLより優先しない。
```

## src/app.d.ts

<!-- source: src/app.d.ts:1 -->

### [src/app.d.ts:1](../../../src/app.d.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
```

<!-- source: src/app.d.ts:7 -->

### [src/app.d.ts:7](../../../src/app.d.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// interface Error {}
		// interface Locals {}
```

<!-- source: src/app.d.ts:10 -->

### [src/app.d.ts:10](../../../src/app.d.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** ルートが返した検索向けメタデータ。無い＝索引させない。 */
```

<!-- source: src/app.d.ts:13 -->

### [src/app.d.ts:13](../../../src/app.d.ts#L13)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// interface PageState {}
		// interface Platform {}
```

## src/lib/og/html.js

<!-- source: src/lib/og/html.js:33 -->

### [src/lib/og/html.js:33](../../../src/lib/og/html.js#L33)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * adapter-static が作った SPA shell は全URLで同一なので、動的ページだけ画像メタを差し替える。
 * script を足さないため、SvelteKit が生成した CSP hash は変更不要。
 */
```

<!-- source: src/lib/og/html.js:38 -->

### [src/lib/og/html.js:38](../../../src/lib/og/html.js#L38)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// v2 は WebP アバターを直接埋め込んでいた旧画像の長期キャッシュを回避する。
```

<!-- source: src/lib/og/html.js:43 -->

### [src/lib/og/html.js:43](../../../src/lib/og/html.js#L43)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * standard.site の記事ページであることを示す。Bluesky は投稿欄に貼られた URL の HTML から
 * これを読み、document と publication の強参照を投稿へ埋めて記事カードで表示する。
 */
```

<!-- source: src/lib/og/html.js:55 -->

### [src/lib/og/html.js:55](../../../src/lib/og/html.js#L55)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** ポスト・ブログの共有リンクには、本文やタイトルを載せた専用カードを出す。 */
```

## src/lib/og/html.ts

<!-- source: src/lib/og/html.ts:40 -->

### [src/lib/og/html.ts:40](../../../src/lib/og/html.ts#L40)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * adapter-static が作った SPA shell は全URLで同一なので、動的ページだけ画像メタを差し替える。
 * script を足さないため、SvelteKit が生成した CSP hash は変更不要。
 */
```

<!-- source: src/lib/og/html.ts:45 -->

### [src/lib/og/html.ts:45](../../../src/lib/og/html.ts#L45)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// v2 は WebP アバターを直接埋め込んでいた旧画像の長期キャッシュを回避する。
```

<!-- source: src/lib/og/html.ts:50 -->

### [src/lib/og/html.ts:50](../../../src/lib/og/html.ts#L50)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * standard.site の記事ページであることを示す。Bluesky は投稿欄に貼られた URL の HTML から
 * これを読み、document と publication の強参照を投稿へ埋めて記事カードで表示する。
 */
```

<!-- source: src/lib/og/html.ts:62 -->

### [src/lib/og/html.ts:62](../../../src/lib/og/html.ts#L62)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** ポスト・ブログの共有リンクには、本文やタイトルを載せた専用カードを出す。 */
```

<!-- source: src/lib/og/html.ts:70 -->

### [src/lib/og/html.ts:70](../../../src/lib/og/html.ts#L70)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * アドカレのカードのリンク（/advent?day=N）。画像はその日のカードそのもの。
 * 本文は AppView を引かずに作れる範囲（日付）だけにする。
 */
```

<!-- source: src/lib/og/html.ts:104 -->

### [src/lib/og/html.ts:104](../../../src/lib/og/html.ts#L104)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** `?day=` の読み取り。1〜25 以外は無視する。 */
```

<!-- source: src/lib/og/html.ts:111 -->

### [src/lib/og/html.ts:111](../../../src/lib/og/html.ts#L111)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** カードの年（JST）。1月のうちは前年のカレンダーを指す。 */
```

## src/lib/routing/vercel-rewrites.test.ts

<!-- source: src/lib/routing/vercel-rewrites.test.ts:1 -->

### [src/lib/routing/vercel-rewrites.test.ts:1](../../../src/lib/routing/vercel-rewrites.test.ts#L1)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// 静的ソース検査は Vitest の Node 環境で実行する。
```

<!-- source: src/lib/routing/vercel-rewrites.test.ts:6 -->

### [src/lib/routing/vercel-rewrites.test.ts:6](../../../src/lib/routing/vercel-rewrites.test.ts#L6)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * adapter-static は SPA を 200.html ひとつに畳む。Vercel はそれを自動で拾わないので、
 * 「アプリ専用ルートだけ vercel.json から 200.html へ流し、未知のURLは404にする」
 * （vite.config.ts）。つまり **ルートを足して rewrites に書き忘れると、そのURLは
 * 直リンクとリロードで 404 になる**。画面遷移では踏めないので、気づくのは公開後になる。
 * ここで routes ディレクトリと vercel.json を突き合わせて、その取りこぼしを止める。
 *
 * ルートは3種類ある。混ぜると検索インデックスが静かに壊れるので区別する。
 *
 * - `'all'`  … 実体のHTMLが必ず出る（`/about` など）。rewrite は不要
 * - `'entries'` … `entries()` が列挙した分だけHTMLが出る（`/news/[rkey]`）。
 *                 原則 rewrite 不要。未生成ブログだけ noindex を返す API へフォールバックする
 * - `false`  … 常に 200.html の殻。rewrite と noindex ヘッダの両方が要る
 */
```

<!-- source: src/lib/routing/vercel-rewrites.test.ts:32 -->

### [src/lib/routing/vercel-rewrites.test.ts:32](../../../src/lib/routing/vercel-rewrites.test.ts#L32)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * `/global` は中身がクローラ向けに描かれていないので、意図して seo を持たない
 * （= noindex のまま）。暗黙の穴にせず、名前で見えるようにしておく。
 */
```

<!-- source: src/lib/routing/vercel-rewrites.test.ts:53 -->

### [src/lib/routing/vercel-rewrites.test.ts:53](../../../src/lib/routing/vercel-rewrites.test.ts#L53)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// グループ化ルート (group) はURLに現れない。
```

<!-- source: src/lib/routing/vercel-rewrites.test.ts:60 -->

### [src/lib/routing/vercel-rewrites.test.ts:60](../../../src/lib/routing/vercel-rewrites.test.ts#L60)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** SvelteKit の [param] を、パターン照合用の具体的なセグメントに置き換える。 */
```

<!-- source: src/lib/routing/vercel-rewrites.test.ts:63 -->

### [src/lib/routing/vercel-rewrites.test.ts:63](../../../src/lib/routing/vercel-rewrites.test.ts#L63)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** Vercel の :param / :path* を正規表現にする。:path* は親パスそのものにも当たる。 */
```

<!-- source: src/lib/routing/vercel-rewrites.test.ts:81 -->

### [src/lib/routing/vercel-rewrites.test.ts:81](../../../src/lib/routing/vercel-rewrites.test.ts#L81)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// 走査そのものが壊れたときに、0件を「全部通った」と読み違えないようにする。
```

<!-- source: src/lib/routing/vercel-rewrites.test.ts:96 -->

### [src/lib/routing/vercel-rewrites.test.ts:96](../../../src/lib/routing/vercel-rewrites.test.ts#L96)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// 200.html は中身の無い殻。どのURLで拾われても同じものが見えるので、載せない。
```

<!-- source: src/lib/routing/vercel-rewrites.test.ts:104 -->

### [src/lib/routing/vercel-rewrites.test.ts:104](../../../src/lib/routing/vercel-rewrites.test.ts#L104)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// Vercel は既存 HTML を rewrites より優先する。未生成ブログは直リンクを
		// 維持するため /api/spa へ送り、API の応答だけ noindex にする（api/_spa.test.ts）。
		// /200 への直接転送は索引可能な空ページになるため許可しない。
		// パス全体への noindex ヘッダも、生成済み記事を巻き込むので許可しない。
```

<!-- source: src/lib/routing/vercel-rewrites.test.ts:126 -->

### [src/lib/routing/vercel-rewrites.test.ts:126](../../../src/lib/routing/vercel-rewrites.test.ts#L126)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// seo を返さないページは layout が noindex を出す。プリレンダしたのに seo を
		// 付け忘れると、中身のあるHTMLを自分で検索から締め出すことになる（`/global` の事故）。
```

<!-- source: src/lib/routing/vercel-rewrites.test.ts:146 -->

### [src/lib/routing/vercel-rewrites.test.ts:146](../../../src/lib/routing/vercel-rewrites.test.ts#L146)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// static/sitemap.xml とルートが両方あると build/sitemap.xml の取り合いになる。
```

## src/lib/seo/prerendered.test.ts

<!-- source: src/lib/seo/prerendered.test.ts:5 -->

### [src/lib/seo/prerendered.test.ts:5](../../../src/lib/seo/prerendered.test.ts#L5)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * ビルド成果物そのものを見るテスト。
 *
 * Playwright の webServer は `npm run dev` で、プリレンダを通らない（playwright.config.ts）。
 * つまり E2E はハイドレーション**後**の DOM しか見られず、**クローラが受け取る HTML**を
 * 誰も検証していなかった。ここがその穴を塞ぐ。
 *
 * `build/` が無ければ丸ごとスキップする。CI では `npm run build && npm test` の順に流すこと。
 */
```

<!-- source: src/lib/seo/prerendered.test.ts:19 -->

### [src/lib/seo/prerendered.test.ts:19](../../../src/lib/seo/prerendered.test.ts#L19)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** <script> を除いた本文テキスト。中身があるか＝殻でないかを見る。 */
```

<!-- source: src/lib/seo/prerendered.test.ts:34 -->

### [src/lib/seo/prerendered.test.ts:34](../../../src/lib/seo/prerendered.test.ts#L34)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// 殻には robots メタも <title> も無い（ssr:false で生成されるので layout の
		// <svelte:head> が動かない）。これを索引から外しているのは vercel.json の
		// X-Robots-Tag だけ —— だからこそ SPA ルートのヘッダは消してはいけない。
```

<!-- source: src/lib/seo/prerendered.test.ts:44 -->

### [src/lib/seo/prerendered.test.ts:44](../../../src/lib/seo/prerendered.test.ts#L44)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// 未サインインの TOP はランディング。セッション待ちのゲートに入れると、ここがスピナーだけになる。
```

<!-- source: src/lib/seo/prerendered.test.ts:60 -->

### [src/lib/seo/prerendered.test.ts:60](../../../src/lib/seo/prerendered.test.ts#L60)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// AppView が落ちている／まだ listIndexableNews を持っていないビルドでは記事が0件になる。
		// そのとき中身の無い一覧を index,follow で出すのは noindex より悪いので、
		// +page.ts が noindex へ落とす。ここではその対応関係そのものを固定する。
```

<!-- source: src/lib/seo/prerendered.test.ts:70 -->

### [src/lib/seo/prerendered.test.ts:70](../../../src/lib/seo/prerendered.test.ts#L70)

分類: 検証・再現条件。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// 索引対象 ⇒ 中身がある、という一方向の含意。これが崩れると空ページが検索に載る。
```

## src/lib/seo/seo.ts

<!-- source: src/lib/seo/seo.ts:1 -->

### [src/lib/seo/seo.ts:1](../../../src/lib/seo/seo.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** 正規URLの基点。canonical と sitemap が同じ綴りを使うための唯一の出どころ。 */
```

<!-- source: src/lib/seo/seo.ts:4 -->

### [src/lib/seo/seo.ts:4](../../../src/lib/seo/seo.ts#L4)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * ページ単位の検索向けメタデータ。ルートの `load()` が返し、`+layout.svelte` が読む。
 *
 * **これを返すこと自体が「このページは索引してよい」の合図**で、返さないページには
 * layout が `noindex` を出す。以前はパスの完全一致表を layout が持っていたが、
 * その形だと動的ルートを載せられず、ルートを足したときに表への追記を忘れる。
 * 判定をページ側のデータに移したことで、索引対象は「中身を持って返せたページ」と
 * 同義になり、空の殻が索引される経路が構造的に無くなる。
 */
```

<!-- source: src/lib/seo/seo.ts:16 -->

### [src/lib/seo/seo.ts:16](../../../src/lib/seo/seo.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** 絶対URL。重複URLを1本へ寄せるため、必ず正規の綴りを入れる。`absolute()` を使う。 */
```

<!-- source: src/lib/seo/seo.ts:18 -->

### [src/lib/seo/seo.ts:18](../../../src/lib/seo/seo.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
	 * 既定は index,follow。canonical は出したいが索引はさせたくないページ
	 * （ページ送りの2ページ目など）でだけ指定する。
	 */
```

<!-- source: src/lib/seo/seo.ts:25 -->

### [src/lib/seo/seo.ts:25](../../../src/lib/seo/seo.ts#L25)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** サイト内パスから canonical 用の絶対URLを作る。 */
```

## src/lib/seo/sitemap.ts

<!-- source: src/lib/seo/sitemap.ts:1 -->

### [src/lib/seo/sitemap.ts:1](../../../src/lib/seo/sitemap.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * sitemap.xml に載せる静的パス。動的なニュース記事は fetchIndexableNews() が足す。
 *
 * ここを配列として切り出してあるのは、`sitemap.xml/+server.ts` を実行しなくても
 * 「sitemap に書いたパスが本当にプリレンダされているか」をテストで突き合わせられるようにするため。
 * 実体の無いURLを sitemap に載せると、クローラは404を踏み、以後クロール頻度が落ちる。
 */
```

## src/routes/sitemap.xml/+server.ts

<!-- source: src/routes/sitemap.xml/+server.ts:7 -->

### [src/routes/sitemap.xml/+server.ts:7](../../../src/routes/sitemap.xml/+server.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
 * sitemap.xml をビルド時に生成する。
 *
 * ルートとして置いているのは、`static/` に手で置くと記事が増えても更新されないため。
 * `client-metadata.json/+server.ts` と同じく `prerender = true` なので、adapter-static でも
 * ビルド成果物に含まれる（ビルドスクリプトも prebuild フックも増やさない）。
 *
 * 記事一覧は prerender の `entries()` と**同じ** `fetchIndexableNews()` から取る。
 * 別々に取ると「sitemap にあるが実体が無いURL」が生まれ、クローラが404を踏む。
 */
```

<!-- source: src/routes/sitemap.xml/+server.ts:19 -->

### [src/routes/sitemap.xml/+server.ts:19](../../../src/routes/sitemap.xml/+server.ts#L19)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** 文字参照が要る文字はURLに出ないはずだが、sitemap を壊さないために最低限は通す。 */
```

<!-- source: src/routes/sitemap.xml/+server.ts:26 -->

### [src/routes/sitemap.xml/+server.ts:26](../../../src/routes/sitemap.xml/+server.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/** 規約とポリシーだけは本文の最終更新日が分かる。残りは嘘を書かず lastmod を省く。 */
```

## vite.config.ts

<!-- source: vite.config.ts:6 -->

### [vite.config.ts:6](../../../vite.config.ts#L6)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// defineConfig は vitest/config のもの（vite の型を包含し、test ブロックを足せる）。
```

<!-- source: vite.config.ts:10 -->

### [vite.config.ts:10](../../../vite.config.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// mode は任意名に変更できるため、開発サーバーか本番ビルドかは command で判定する。
```

<!-- source: vite.config.ts:18 -->

### [vite.config.ts:18](../../../vite.config.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// 本番は https ホスト（appview・PDS・bsky.social）のみに接続するが、dev では
	// ローカル appview に http://localhost で接続する（XRPC も blob 画像も）ため、
	// dev のときだけ connect-src / img-src で許可する。
```

<!-- source: vite.config.ts:25 -->

### [vite.config.ts:25](../../../vite.config.ts#L25)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// ブラウザからローカル AppView を直接参照すると、svelte-kit sync が生成した本番用
		// CSP を開発サーバーが再利用した際に拒否される。開発時は同一オリジンへ寄せ、
		// Vite が AppView へ転送することで CSP の生成タイミングに依存させない。
```

<!-- source: vite.config.ts:42 -->

### [vite.config.ts:42](../../../vite.config.ts#L42)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
```

<!-- source: vite.config.ts:47 -->

### [vite.config.ts:47](../../../vite.config.ts#L47)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
				// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
				// See https://svelte.dev/docs/kit/adapters for more information about adapters.
				// index.html は検索向けにプリレンダリングしたトップページとして残す。
				// アプリ専用ルートだけ vercel.json から 200.html へ流し、未知のURLは404にする。
```

<!-- source: vite.config.ts:55 -->

### [vite.config.ts:55](../../../vite.config.ts#L55)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// entries() の列挙後に記事が削除されたり、プリレンダー側で AppView の
					// 取得に失敗するとブログ記事が404になる。記事だけをスキップし、
					// 未生成のブログは既存の /api/spa フォールバックで表示する。
					// 他のページの404やサーバーエラーは設定ミスを隠さないよう失敗させる。
```

<!-- source: vite.config.ts:66 -->

### [vite.config.ts:66](../../../vite.config.ts#L66)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
					 * ニュースのパーマリンクは、AppView から取った一覧で entries() を組み立てる。
					 * AppView が落ちている（あるいはまだこのエンドポイントを持っていない）ビルドでは
					 * 0件になり、SvelteKit は「プリレンダ対象なのに一度も到達しなかったルート」として
					 * ビルドを落とす。ニュースの一時的な不調でサイト全体のデプロイを止めたくないので、
					 * **このルートだけ**警告に落とす。
					 *
					 * 他のルートが未到達なら従来どおり失敗させる —— それはリンク漏れか設定ミスで、
					 * 黙って通すとそのURLが 404 のまま公開される。
					 */
```

<!-- source: vite.config.ts:85 -->

### [vite.config.ts:85](../../../vite.config.ts#L85)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
/**
					 * ブログ記事の <link rel="site.standard.document" href="at://..."> は Bluesky が
					 * 記事カードを作るための目印で、クロール先ではない。crawler は <link> の href も
					 * URL として解決しようとして at:// で落ちるので、at:// だけを見逃す。
					 * rel に external を足しても crawler は飛ばすが、Bluesky 側がその形を読むかは
					 * 保証が無いため、mochott など既存実装と同じ単独の rel のままにしている。
					 */
```

<!-- source: vite.config.ts:98 -->

### [vite.config.ts:98](../../../vite.config.ts#L98)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// Content-Security-Policy を <meta> タグとして出力する。hash モードにより
				// SvelteKit が自身のインラインbootstrap scriptをビルド毎にハッシュ化するため、
				// 古いハッシュを手書きせずとも script-src を 'self' に保てる。atproto は任意の
				// PDS/OAuth ホストへ接続するため connect-src/img-src で https: を許可する。
				// frame-ancestors はヘッダ限定のため vercel.json の X-Frame-Options で対応。
```

<!-- source: vite.config.ts:108 -->

### [vite.config.ts:108](../../../vite.config.ts#L108)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// heic-to/csp は eval 不要のデコーダーを blob Worker で実行する。
```

<!-- source: vite.config.ts:111 -->

### [vite.config.ts:111](../../../vite.config.ts#L111)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// OAuth ループバックは localhost を拒否するため dev はページを 127.0.0.1 で開く。
						// appview も 127.0.0.1 で開くケースに備え、localhost と 127.0.0.1 の両方を許可する。
```

<!-- source: vite.config.ts:116 -->

### [vite.config.ts:116](../../../vite.config.ts#L116)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// 動画は video.bsky.app の HLS を再生する。hls.js は MSE の blob: URL を使い、
						// 投稿前のプレビューも添付ファイルの blob: URL で見せる。
```

<!-- source: vite.config.ts:131 -->

### [vite.config.ts:131](../../../vite.config.ts#L131)

分類: 仕様・設計の根拠。対応仕様: [seo-deployment](spec.md#requirements)。

```text
// 対象は UI を持たない純ロジック（facet 計算・URL 解釈・レコード組み立てなど）。
		// コンポーネントは jsdom を足すまで対象外なので、拾うのは .ts のテストだけにする。
```
