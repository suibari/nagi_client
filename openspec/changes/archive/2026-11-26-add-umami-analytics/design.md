# Design

## Context

Nagiは `ssr = false` のSvelteKit SPAで、`+layout.ts` から `injectAnalytics()` でVercel Web Analyticsを読み込んでいる。CSPはSvelteKitのhashモードで、`script-src` は `'self'` だけを許可する。`connect-src` は任意のPDSへ接続するため `https:` を許可している。仕様書にはアクセス解析の要件がなく、送信内容はプライバシーポリシーにだけ書かれている。

Umami Cloudのトラッカーは `https://cloud.umami.is/script.js` で配られ、`gateway.umami.is` へイベントを送る。SPAの経路変化を自動で記録する。訪問者の判定には、サイトID・IPアドレス・User-Agent・毎月替わるソルトのハッシュを使う。IPアドレスはセッションの記録に保存されない。

## Goals / Non-Goals

ページ遷移の経路・滞在時間・入口ページを確認できるようにする。今のプライバシーポリシーの方針（Cookieを使わない、広告事業者へ渡さない、利用者個人と結び付けない）を保つ。

Vercelの撤去、ニュースページ専用のカスタムイベント、Core Web Vitalsやエラーの収集は対象外とする。

## Decisions

### D1: スクリプトはUmami Cloudから直接読み込む

`script-src` に `https://cloud.umami.is` を加え、トラッカーを配信元から読み込む。イベントは `connect-src https:` の範囲で `gateway.umami.is` へ直接送られる。

自サイト経由で中継する案は採らない。広告ブロッカーに止められにくくなる利点はあるが、中継するとUmamiから見える送信元IPがVercelのものになる。訪問者の判定と地域の推定が崩れないよう、利用者のIPを転送するFunctionを別に用意する必要が出る。Bluesky経由の閲覧が中心のNagiでは、ブロッカーによる取りこぼしを許容し、構成を単純にする。併用期間にVercel（自サイト経由で配信）より少なく出る差は、この取りこぼしとして読む。

### D2: 本番かつサイトIDがあるときだけ読み込む

開発サーバでは読み込まない。`PUBLIC_UMAMI_WEBSITE_ID` が空なら読み込まず、アカウント作成前にデプロイしても何も送らない。`data-domains` で本番のホスト名に限り、プレビューデプロイの閲覧を本番の集計に混ぜない。

### D3: クエリとハッシュを送らない

`data-exclude-search` と `data-exclude-hash` を有効にする。`/search` の検索語や、OAuthのコールバックに付く応答値を解析に残さないためである。その代わりUTMパラメータとクエリで区別するページ（`/advent?day=` など）の内訳は失う。ニュースの記事はパスで区別できるため、今回の目的には影響しない。参照元（`document.referrer`）は送られるので、BlueskyとGoogleの流入は区別できる。

### D4: アカウントと結び付けない

`umami.identify()` と `data-distinct-id` は使わない。ログイン中でも、解析の訪問者とDIDを結び付けない。

### D5: Do Not Trackを尊重する

`data-do-not-track` を有効にする。Vercel Web AnalyticsはDNTを見ないため併用期間は扱いが揃わないが、追加する送信先については利用者の意思表示を優先する。

### D6: OAuth診断は両方へ送る

`reportOAuthDiagnostic` は、Vercelの `track()` に加えて `window.umami?.track()` を呼ぶ。トラッカーが読み込まれていない場合（開発・DNT・ブロッカー）は何もしない。送る項目は今と同じで、Umamiの上限（文字列500字、プロパティ50件）に収まる。

## Risks / Trade-offs

- Umami Cloudの無料枠（月のイベント数）を超えると記録が止まる。Vercelの無料枠（月5万）に収まっている現状なら、無料枠が月10万の場合は余裕がある。上限は契約時に公式の料金ページで確かめる。
- 外部スクリプトを `script-src` に加えるため、配信元が改ざんされた場合の影響範囲が広がる。Umamiは版を固定したURLとSRIを提供していないので、配信元を1ホストに限ることで抑える。

## Migration Plan

運営者がUmami Cloudでサイトを登録し、VercelのProduction環境変数に `PUBLIC_UMAMI_WEBSITE_ID` を設定してから再デプロイする。プライバシーポリシーの改訂は計測開始と同じデプロイで公開する。戻すときは環境変数を空にして再デプロイすれば送信が止まる。
