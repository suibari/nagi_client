# 検索・OGP・静的配信・デプロイ

## Purpose

中身のあるページだけを索引し、非公開情報を共有画像へ出さず、静的配信とOAuthを両立する。

この仕様は導入時点の実装・コメントから復元した現状の基準である。根拠と詳細な設計判断は [design.md](design.md)、確認された不整合は [known-gaps.md](../../known-gaps.md) を参照する。記載するシナリオは確認条件であり、今回すべての外部サービスを実行検証したという意味ではない。

## Requirements

### Requirement: SEO-01 索引への明示同意

ルートloadのPageSeoを索引可能の合図とし、無ければlayoutはnoindexを出さなければならない（MUST）。canonicalとsitemapのoriginは共通値にし、空のSPA shellはX-Robots-Tagで索引から除く。生成済みblog HTMLまで一律noindexにしない。

#### Scenario: データの無いページ

- **WHEN** loadがPageSeoを返さない
- **THEN** パスの許可表だけでindexしない

#### Scenario: 生成済み記事とshell

- **WHEN** 同じ/blog配下へアクセスする
- **THEN** 実体HTMLとフォールバックshellの索引可否を分ける

### Requirement: SEO-02 sitemapとlastmod

sitemapはprerenderルートで生成し、実体のある静的パスと共通の動的索引集合を使わなければならない（MUST）。規約・ポリシー以外は根拠の無いlastmodを捏造しない。URLはXMLとして必要なエスケープをする。

#### Scenario: 記事集合の生成

- **WHEN** entriesとsitemapを作る
- **THEN** 同じ取得結果を使い存在しないURLを増やさない

### Requirement: SEO-03 OGPの非公開境界

こっそり投稿は作者情報も外へ出さずサイト共通画像へ戻さなければならない（MUST）。既定でぼかすラベル等の投稿は本文でなく定型文を出す。shortcodeと画像行を文字として載せず、改行は保ちながら行数・文字数で欠けを避ける。

#### Scenario: こっそり共有URL

- **WHEN** 投稿カード画像を要求する
- **THEN** 本文・名前・アバターを出さない

#### Scenario: 未開封の未来アドベント

- **WHEN** 公開前の日をURLで指定する
- **THEN** その日のカード内容を先に表示しない

### Requirement: SEO-04 SSRFと画像形式

SPA shellのfetch先は信頼済みVERCEL_URLとし、外部Host入力を取得先へ使ってはならない（MUST）。OGPプロフィール画像は自前blob proxy相対URLを正規経路とし、任意DB URLをレンダラーへ取得させない。WebP等は許可されたDID/CIDからBluesky CDN JPEGを作り、変換ライブラリを追加しない。

#### Scenario: 細工したHost

- **WHEN** 外部入力のHostヘッダーで関数を呼ぶ
- **THEN** そのホストをfetch先に採用しない

#### Scenario: WebPアバター

- **WHEN** OGPのSVG→PNGで直接描画できない形式を受ける
- **THEN** DID/CID対応のJPEG経路へ代替する

### Requirement: SEO-05 静的配信と限定フォールバック

index.htmlは検索向けトップ、アプリ専用ルートは200.html、未知URLは404にしなければならない（MUST）。未生成blogは/api/spaへ戻し、blogの消失や取得失敗による限定的404だけを許容する。ニュース未到達とat://検証リンクは限定例外とし、他のエラーまで握らない。

#### Scenario: 未知URL

- **WHEN** 定義も実体も無いページへアクセスする
- **THEN** 汎用SPA成功にせず404にする

#### Scenario: shell取得失敗

- **WHEN** Vercel静的shellの補助取得が落ちる
- **THEN** 既存の/200フォールバックへ戻す

### Requirement: SEO-06 CSPと開発proxy

CSPはhashモードでbootstrapに追従し、任意PDS/OAuthのHTTPSと動画等の必要blob利用を許可しなければならない（MUST）。HTTP loopbackとローカルAppViewは開発時だけ許可し、開発ブラウザは127.0.0.1で開く。開発判定は任意名のmodeでなくcommandを使う。

#### Scenario: sync後の開発起動

- **WHEN** 本番用CSPの生成物がある
- **THEN** 同一origin Vite proxyでAppView通信と画像を扱う

#### Scenario: HEICやHLS

- **WHEN** blob WorkerやMSEを使う
- **THEN** 必要なworker/media CSPに沿って動作する

### Requirement: SEO-07 記事検証と共有HTML

動的shellのメタ差し替えではscriptを増やさず生成CSP hashを維持しなければならない（MUST）。standard.site検証linkはプリレンダとSPA補助の両方へ出す。アドベント画像はlang=enを引き継ぎ、共有画像の配色は閲覧者テーマに左右させない。

#### Scenario: Blueskyへ記事URLを貼る

- **WHEN** 記事HTMLを取得する
- **THEN** document/publicationを識別できる検証情報を含む

#### Scenario: 英語のカード共有

- **WHEN** lang=en付きのリンクを共有する
- **THEN** OGPも英語にする
