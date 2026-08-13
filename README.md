# Nagi

[Nagi（ナギ）](https://nagi.suibari.com/)は、全肯定botたんが言葉を受け止める、AT
Protocol上の全肯定SNSです。いいねやフォローの数を気にせず、自由に気持ちを投稿できます。

[Nagiについて](https://nagi.suibari.com/about)

## Developing

依存関係をインストールし、開発サーバーを起動します。

```sh
npm run dev

# ブラウザも開く場合
npm run dev -- --open
```

## Building

型チェックと本番ビルド:

```sh
npm run check
npm run build
```

生成物は `npm run preview` で確認できます。

## Vercel Preview

`develop` ブランチの Preview は、Vercel が生成する固定ブランチ URL を OAuth の
`client_id` と callback に自動利用します。現在の固定 URL は
`https://nagi-client-git-develop-suibaris-projects.vercel.app` です。一般には
`<project>-git-develop-<scope>.vercel.app` という形式で、Vercel の Deployment 画面、
GitHub の Preview リンク、またはビルドログの `VERCEL_BRANCH_URL` でも確認できます。

Vercel の Project Settings では次を設定してください。

- Environment Variables で **Automatically expose System Environment Variables** を有効化する。
  `VERCEL_ENV` と `VERCEL_BRANCH_URL` が Preview ビルド時に必要です。
- Preview 環境の `PUBLIC_APPVIEW_URL` を `https://nagi-api.suibari.com` にする。
- Project Settings > Deployment Protection > Vercel Authentication で Preview の保護を
  無効化する。OAuth の認可サーバはVercelへログインできないため、固定ブランチURLの
  `/client-metadata.json` が未認証で `200 application/json` を返す必要があります。
  Vercel既定のPreview URLには公開後も `X-Robots-Tag: noindex` が自動付与されます。

コミット固有 URL から開いた場合は、OAuth state と callback の origin を一致させるため、
同じパスの固定ブランチ URL へ自動的に移動します。本番ビルドは従来どおり
`https://nagi.suibari.com` を使用します。

## 横幅が可変なレイアウトの実装ルール

スマートフォンで長い URL や空白のない文字列がカードを押し広げないよう、次のルールを守ります。

- `flex` / `grid` 内の可変幅の子要素と、その内側にある可変幅コンテナには `min-inline-size: 0` を指定する。
- 可変幅の grid 列には `1fr` ではなく `minmax(0, 1fr)` を使う。
- 本文やタイトルなど、内容を読める必要がある文字列には `overflow-wrap: anywhere` を使う。
- URL、ホスト名、ハンドルなど、一行で表示するメタ情報には `overflow: hidden`、`text-overflow: ellipsis`、`white-space: nowrap` を組み合わせる。
- `body` の `overflow-x` は画面全体の横スクロールを抑える最後の安全策であり、子要素のはみ出しを隠すための修正には使わない。
- 変更時は 320px、375px、600px の表示幅で、長い URL と空白のない文字列を入れ、カードとページの `scrollWidth` が `clientWidth` を超えないことを確認する。
