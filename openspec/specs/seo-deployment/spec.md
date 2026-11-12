# 検索・OGP・静的配信・デプロイ

## Purpose

### 機能概要

公開してよいページを検索やSNSから見つけられるようにし、共有時には内容に合うプレビューを返す配信機能である。中身のある公開記事と、ログイン後にデータを読む空のアプリ画面を区別し、こっそり投稿や保護対象の本文を検索・共有画像へ出さない。

SvelteKitの静的HTMLとSPA fallback、Vercel Functionsを組み合わせる。OAuth用metadataやCSPも配信構成と整合させるが、記事の索引可否と利用者の認可は別の判断である。

### 機能一覧

| 機能                   | 役割・利用者ができること                                | 詳細要件          |
| ---------------------- | ------------------------------------------------------- | ----------------- |
| 索引可能なページの宣言 | 本文を返せたページだけが検索向けメタ情報を持つ。        | [SEO-01](#seo-01) |
| canonicalとsitemap     | 実体のあるURLを統一し、記事集合を共有する。             | [SEO-02](#seo-02) |
| 共有画像               | 投稿・プロフィール・季節カードに応じたOGPを返す。       | [SEO-03](#seo-03) |
| 外部取得の制限         | 画像やshell取得を信頼できる宛先へ限定する。             | [SEO-04](#seo-04) |
| 静的配信とfallback     | 生成済み本文を優先し、アプリ画面と未知URLを分ける。     | [SEO-05](#seo-05) |
| CSPとローカル開発      | 本番の制約と開発proxy、必要なmedia/worker経路を揃える。 | [SEO-06](#seo-06) |
| 記事の検証情報         | 公開URLとstandard.siteレコードの対応をHTMLへ示す。      | [SEO-07](#seo-07) |

### 主な利用の流れ

1. ビルドで公開可能な記事集合を取得し、本文HTMLとsitemapを生成する。
2. 公開URLへのアクセスには生成済みHTMLを優先し、必要なアプリ画面だけshellへ流す。
3. 検索向けメタ情報またはnoindexを返し、共有先には対象に合うOGPを示す。
4. hydration後はアプリとして動作する。外部の補助取得に失敗しても定義した範囲で表示を継続する。

この文書は現行クライアントの振る舞いを整理する。設計判断は [design.md](design.md)、導入時の証跡は [コメント原文](../../reference/comment-snapshot/seo-deployment.md)、既知の不整合は [known-gaps.md](../../known-gaps.md) に分けて記録する。シナリオは確認条件であり、全外部環境での実行合格を示すものではない。

## Requirements

<a id="seo-01"></a>

### Requirement: SEO-01 索引への明示同意

ルートloadのPageSeoを索引可能の合図とし、無ければlayoutはnoindexを出さなければならない（MUST）。canonicalとsitemapのoriginは共通値にし、空のSPA shellはX-Robots-Tagで索引から除く。生成済みblog HTMLまで一律noindexにしない。

#### Scenario: データの無いページ

- **WHEN** loadがPageSeoを返さない
- **THEN** パスの許可表だけでindexしない

#### Scenario: 生成済み記事とshell

- **WHEN** 同じ/blog配下へアクセスする
- **THEN** 実体HTMLとフォールバックshellの索引可否を分ける

<a id="seo-02"></a>

### Requirement: SEO-02 sitemapとlastmod

sitemapはprerenderルートで生成し、実体のある静的パスと共通の動的索引集合を使わなければならない（MUST）。規約・ポリシー以外は根拠の無いlastmodを捏造しない。URLはXMLとして必要なエスケープをする。

#### Scenario: 記事集合の生成

- **WHEN** entriesとsitemapを作る
- **THEN** 同じ取得結果を使い存在しないURLを増やさない

<a id="seo-03"></a>

### Requirement: SEO-03 OGPの非公開境界

こっそり投稿は作者情報も外へ出さずサイト共通画像へ戻さなければならない（MUST）。既定でぼかすラベル等の投稿は本文でなく定型文を出す。shortcodeと画像行を文字として載せず、改行は保ちながら行数・文字数で欠けを避ける。

#### Scenario: こっそり共有URL

- **WHEN** 投稿カード画像を要求する
- **THEN** 本文・名前・アバターを出さない

#### Scenario: 未開封の未来アドベント

- **WHEN** 公開前の日をURLで指定する
- **THEN** その日のカード内容を先に表示しない

<a id="seo-04"></a>

### Requirement: SEO-04 SSRFと画像形式

SPA shellのfetch先は信頼済みVERCEL_URLとし、外部Host入力を取得先へ使ってはならない（MUST）。OGPプロフィール画像は自前blob proxy相対URLを正規経路とし、任意DB URLをレンダラーへ取得させない。WebP等は許可されたDID/CIDからBluesky CDN JPEGを作り、変換ライブラリを追加しない。

#### Scenario: 細工したHost

- **WHEN** 外部入力のHostヘッダーで関数を呼ぶ
- **THEN** そのホストをfetch先に採用しない

#### Scenario: WebPアバター

- **WHEN** OGPのSVG→PNGで直接描画できない形式を受ける
- **THEN** DID/CID対応のJPEG経路へ代替する

<a id="seo-05"></a>

### Requirement: SEO-05 静的配信と限定フォールバック

index.htmlは検索向けトップ、アプリ専用ルートは200.html、未知URLは404にしなければならない（MUST）。未生成blogは/api/spaへ戻し、blogの消失や取得失敗による限定的404だけを許容する。ニュース未到達とat://検証リンクは限定例外とし、他のエラーまで握らない。

#### Scenario: 未知URL

- **WHEN** 定義も実体も無いページへアクセスする
- **THEN** 汎用SPA成功にせず404にする

#### Scenario: shell取得失敗

- **WHEN** Vercel静的shellの補助取得が落ちる
- **THEN** 既存の/200フォールバックへ戻す

<a id="seo-06"></a>

### Requirement: SEO-06 CSPと開発proxy

CSPはhashモードでbootstrapに追従し、任意PDS/OAuthのHTTPSと動画等の必要blob利用を許可しなければならない（MUST）。HTTP loopbackとローカルAppViewは開発時だけ許可し、開発ブラウザは127.0.0.1で開く。開発判定は任意名のmodeでなくcommandを使う。

#### Scenario: sync後の開発起動

- **WHEN** 本番用CSPの生成物がある
- **THEN** 同一origin Vite proxyでAppView通信と画像を扱う

#### Scenario: HEICやHLS

- **WHEN** blob WorkerやMSEを使う
- **THEN** 必要なworker/media CSPに沿って動作する

<a id="seo-07"></a>

### Requirement: SEO-07 記事検証と共有HTML

動的shellのメタ差し替えではscriptを増やさず生成CSP hashを維持しなければならない（MUST）。standard.site検証linkはプリレンダとSPA補助の両方へ出す。アドベント画像はlang=enを引き継ぎ、共有画像の配色は閲覧者テーマに左右させない。

#### Scenario: Blueskyへ記事URLを貼る

- **WHEN** 記事HTMLを取得する
- **THEN** document/publicationを識別できる検証情報を含む

#### Scenario: 英語のカード共有

- **WHEN** lang=en付きのリンクを共有する
- **THEN** OGPも英語にする

## 参照資料

### 外部資料

| 資料                                                                                                                   | この機能で参照する理由                         |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [SvelteKit — adapter-static](https://svelte.dev/docs/kit/adapter-static)                                               | プリレンダとSPA fallbackを組み合わせる配信構成 |
| [Google Search Central — robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) | robots metaとX-Robots-Tagによる索引制御        |
| [Standard.site — Introduction](https://standard.site/docs/introduction/)                                               | publicationとdocumentによる長文公開の全体像    |

リンクの到達先と対象を2026-11-11に確認した。外部の説明は更新されるため、本リポジトリ固有の制約と外部仕様を区別する。現行実装の基準はこの文書の要件とし、外部仕様への追従で振る舞いを変える場合は差分を記録する。

### 関連する内部資料

- [設計判断](design.md)：採用理由、互換条件、失敗時の考え方。
- [導入時コメント原文](../../reference/comment-snapshot/seo-deployment.md)：基準コミットの出典を全件保存した履歴資料。
- [認証・セッション・姉妹アプリ連携](../auth-session/spec.md)：連携する機能の要件。
- [standard.site記事公開・ブログ表示](../blog-publication/spec.md)：連携する機能の要件。
- [ニュース・年表](../news-chronicle/spec.md)：連携する機能の要件。
- [モデレーション・年齢・通報](../moderation-privacy/spec.md)：連携する機能の要件。
