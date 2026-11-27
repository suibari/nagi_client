# favicon の角丸の設計

## Context

共通 HTML の `rel="icon"` は 96 × 96 px の `nagi_icon.png` を指す。この PNG は四隅まで不透明で、ログイン画面やプロフィール共有カードからも参照される。

## Goals / Non-Goals

ブラウザ用 favicon に共通の形状を適用する。適用範囲は [提案](proposal.md) に記す。

## Decisions

既存の 96 × 96 px の PNG を元に、角の透明度だけを加工した favicon 専用 PNG を `static/` に置く。共通 HTML の `rel="icon"` から参照し、プリレンダと SPA フォールバックの双方に反映する。専用ファイルにすると、既存 PNG を参照する画面やカードにも角丸が波及するのを防げる。透過 PNG の静的配信で完結するため、生成用の実行時依存は要らない。

Nagi Space の SVG は 512 × 512 の座標系で矩形の `rx` が 112 で、favicon はその SVG から生成される。この比率を使うと Nagi の 96 px 画像では半径 21 px になる。境界の画素に中間の透明度を付けて、縮小表示でも輪郭が滑らかになるようにする。[Nagi Space の元画像](https://github.com/suibari/nagi_space/blob/78889fcc33af040db14facd036b1181d049307b1/static/icons/icon.svg) [favicon の生成処理](https://github.com/suibari/nagi_space/blob/78889fcc33af040db14facd036b1181d049307b1/scripts/build-icons.mjs)

## Risks / Trade-offs

ブラウザに旧 favicon がキャッシュされている場合、新しいファイル名を使うことで更新済み HTML から別の画像として取得できる。新しい HTML と画像は同じビルドで配信し、画像の取得と表示を確認する。Nagi Space の参照は設計時に固定し、閲覧時の外部通信は発生しない。

## Migration Plan

静的 PNG と共通 HTML の参照を同じリリースに含める。切り戻す場合は既存 PNG へ参照を戻す。
