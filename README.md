# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.16.3 create --template minimal --types ts --add tailwindcss="plugins:none" --install npm nagi-client
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## 横幅が可変なレイアウトの実装ルール

スマートフォンで長い URL や空白のない文字列がカードを押し広げないよう、次のルールを守ります。

- `flex` / `grid` 内の可変幅の子要素と、その内側にある可変幅コンテナには `min-inline-size: 0` を指定する。
- 可変幅の grid 列には `1fr` ではなく `minmax(0, 1fr)` を使う。
- 本文やタイトルなど、内容を読める必要がある文字列には `overflow-wrap: anywhere` を使う。
- URL、ホスト名、ハンドルなど、一行で表示するメタ情報には `overflow: hidden`、`text-overflow: ellipsis`、`white-space: nowrap` を組み合わせる。
- `body` の `overflow-x` は画面全体の横スクロールを抑える最後の安全策であり、子要素のはみ出しを隠すための修正には使わない。
- 変更時は 320px、375px、600px の表示幅で、長い URL と空白のない文字列を入れ、カードとページの `scrollWidth` が `clientWidth` を超えないことを確認する。
