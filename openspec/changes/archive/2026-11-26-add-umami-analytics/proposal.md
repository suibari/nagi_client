# Proposal

## Why

Nagiへの流入はBlueskyが最も多く、次がGoogle検索である。検索からニュースページへ来た人がその後どのページへ進み、どのくらい読んだかを知りたいが、無料のVercel Web Analyticsではページ単位の集計しか得られない。ページ間の遷移、滞在時間、入口ページと離脱ページの組み合わせは分からず、表示期間も1か月に限られる。HobbyプランではOAuth診断のカスタムイベントも記録されていない可能性がある。

## What Changes

- Cookieを使わないUmami Cloudを、本番環境のアクセス解析に加える。ページ遷移の経路、セッションごとの滞在時間、入口ページを確認できるようにする。
- 当面はVercel Web Analyticsと併用し、両方の数値を見比べる。Vercelを外す判断は別のchangeで扱う。
- URLのクエリ文字列とハッシュはUmamiへ送らない。検索語やOAuthの応答値を解析に残さないためである。参照元のページは送る。
- 利用者のDIDやアカウントを解析の訪問者と結び付けない。
- ブラウザがDo Not Trackを送っている場合はUmamiへ送らない。
- OAuth診断のカスタムイベントは、VercelとUmamiの両方へ送る。
- プライバシーポリシー（日英）の外部送信先とアクセス解析の記述にUmamiを加え、更新日を改める。

## Capabilities

### New Capabilities

### Modified Capabilities

- `seo-deployment`：アクセス解析の送信先・送信内容・読み込み条件を要件として新設する（SEO-08）。CSPのscript-srcにUmami Cloudの配信元を加える。

## Impact

`src/routes/+layout.ts` での解析スクリプトの読み込み、`vite.config.ts` のCSP、`src/lib/oauth/diagnostics.ts`、プライバシーポリシー（`src/routes/privacy/`）と `src/lib/legal/meta.ts`、環境変数 `PUBLIC_UMAMI_WEBSITE_ID` が対象。Umami Cloudのアカウント作成とサイト登録は運営者が行う。AppViewとbotは対象外。
