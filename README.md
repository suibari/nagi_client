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

## 横幅が可変なレイアウトの実装ルール

スマートフォンで長い URL や空白のない文字列がカードを押し広げないよう、次のルールを守ります。

- `flex` / `grid` 内の可変幅の子要素と、その内側にある可変幅コンテナには `min-inline-size: 0` を指定する。
- 可変幅の grid 列には `1fr` ではなく `minmax(0, 1fr)` を使う。
- 本文やタイトルなど、内容を読める必要がある文字列には `overflow-wrap: anywhere` を使う。
- URL、ホスト名、ハンドルなど、一行で表示するメタ情報には `overflow: hidden`、`text-overflow: ellipsis`、`white-space: nowrap` を組み合わせる。
- `body` の `overflow-x` は画面全体の横スクロールを抑える最後の安全策であり、子要素のはみ出しを隠すための修正には使わない。
- 変更時は 320px、375px、600px の表示幅で、長い URL と空白のない文字列を入れ、カードとページの `scrollWidth` が `clientWidth` を超えないことを確認する。
