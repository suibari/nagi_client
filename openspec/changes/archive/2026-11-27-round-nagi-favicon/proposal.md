# Nagi の favicon を角丸にする

## Why

ブラウザのタブに表示される Nagi のアイコンは四角く、姉妹アプリの Nagi Space は角が丸い。Nagi の絵柄を使い、輪郭を Nagi Space に揃える。

## What Changes

- Nagi のブラウザ用 favicon の四隅を透明にし、画像の一辺に対する角丸半径を Nagi Space と同じ 21.875% にする。

## Capabilities

### New Capabilities

### Modified Capabilities

- `seo-deployment` にブラウザ用 favicon の要件 SEO-09 を追加する。

## Impact

共通 HTML テンプレート `src/app.html` から favicon 専用の静的 PNG を配信する。対象はブラウザ用 favicon。ホーム画面・PWA 用アイコンと、README・アプリ画面・共有画像で使う既存素材は対象外とする。
