# Proposal

## Why

ゼンカツのニュースには現在Rare以上のカード取得が並ぶ。利用者の指定に従い、取得ニュースの表示対象をUltra Rare以上に引き上げる。

## What Changes

- カード取得ニュース（`cardGet`）はUR・AARだけを表示し、Super Rare以下（N・R・SR）を除外する。
- 過去分・追加読み込みにも同じ表示条件を適用する。
- ゼンカツのハイライト（`zenkatsu`）と世界初のコンボ発見（`comboFound`）は、使ったカードのレア度に関わらず従来どおり表示する。
- 抽選・所持・PDS控え・取得演出・ニュース以外の記録は対象外とする。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `cards-zenkatsu`: CARD-10としてカード取得ニュースの表示対象を定める。既存のCARD-03（公開控え）・CARD-06（反応の公開範囲）は維持する。

## Impact

- `src/lib/components/CardNewsList.svelte` の取得結果を表示前に絞り込む。
- `src/lib/api/appview.ts` の古い説明を整理し、ニュース表示の検証を `tests/e2e/zenkatsu.spec.ts` に追加する。
- APIの引数・応答型・依存ライブラリは変更しない。AppViewは別リポジトリであり、サーバ側の選定変更はこのchangeに含めない。
- 主仕様・設計・既知の不整合へ、クライアント表示条件と外部実装の確認境界を反映する。
