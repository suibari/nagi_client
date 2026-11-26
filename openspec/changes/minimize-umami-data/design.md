# Design

## Context

現行のUmamiは自動計測の共通項目として現在URL、参照元とタイトルを組み立てる。OAuth診断を名前とデータで送る呼び出しも同じ共通項目を使う。クエリとハッシュの設定はパス内の値やページタイトルに作用しない。参照元への適用は版による差があり、上流v3.5.0は初回参照元を正規化し、v2.19.0は外部参照元をそのまま保持する。Cloudの配信版は未確認。 [上流v3.5.0](https://github.com/umami-software/umami/blob/v3.5.0/src/tracker/index.ts#L333-L371) [上流v2.19.0](https://github.com/umami-software/umami/blob/v2.19.0/src/tracker/index.js#L207-L217)

## Goals / Non-Goals

入口、遷移、滞在の集計に必要なルート種別と参照元を保ち、現在と直前ページの動的な値、本文由来のタイトル、例外本文を計測に含めない。変更範囲はUmamiへの計測データと対応する日英の説明。既存画面、Vercel Web Analytics、CSP・配備、既に保管されたデータの処理は対象外。

## Decisions

### 自動計測を無効にして許可項目を明示する

トラッカーに `data-auto-track="false"` を指定し、SvelteKitの `afterNavigate` で初回とページ遷移を検知する。クエリ・ハッシュだけの変化はページビューに数えない。同じルート種別の別ページへの移動は同じ分類で数える。初回の外部参照元はHTTP(S)のオリジンだけを抽出し、アプリ内の遷移は直前のルートIDを使う。URLと参照元のアプリ内部分はルート定義の文字列を使い、パラメーターの実値を組み込まない。識別できない現在ルートの閲覧は省く。

`umami.track({...})` へ `website`、`hostname`、`language`、`screen`、正規化済みの `url` と `referrer` を明示する。OAuth診断には固定名と既存の分類値・状態項目を加える。SDK読み込み前の初回閲覧は読み込み後に送る。失敗やブロック時は計測を省き、操作を続けられるようにする。既存のDNT設定を維持し、スクリプト取得や計測は有効条件に従う。PR #252に読み込み条件の修正があるため、両PRを合わせても条件が保たれることを確認する。

[Umami公式のトラッカー設定](https://docs.umami.is/docs/tracker-configuration) [Umami公式の送信関数](https://docs.umami.is/docs/tracker-functions) [SvelteKit公式のafterNavigate](https://svelte.dev/docs/kit/$app-navigation#afterNavigate)

### 送信前フックとの比較

`data-before-send` の変換は自動計測を維持したまま差分を減らせる。フックを実行する版であることが送信の前提となるため、稼働中のCloudトラッカーの版が未確認の状態では、v2.0から文書化された自動計測の無効化と明示送信を採用する。第三者スクリプトがNagiのページ権限で実行されるという既存の信頼境界は別に残る。

## Risks / Trade-offs

各ニュース記事と各ブログ記事は個別URLからルート単位の集計へ変わる。トラッカーの準備が遅れた初回閲覧では、計測時刻に読み込みの遅延が含まれ得る。集計や保持のCloud固有挙動は実配信で未確認。
