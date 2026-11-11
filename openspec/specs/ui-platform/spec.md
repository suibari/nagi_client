# 画面基盤・レイアウト・操作・開発検証

## Purpose

共通シェル、アクセシビリティ、初回表示、共通操作と開発用プレビューを定義する。

この仕様は導入時点の実装・コメントから復元した現状の基準である。根拠と詳細な設計判断は [design.md](design.md)、確認された不整合は [known-gaps.md](../../known-gaps.md) を参照する。記載するシナリオは確認条件であり、今回すべての外部サービスを実行検証したという意味ではない。

## Requirements

### Requirement: UI-01 入口と初回表示

未サインインの/はランディング、サインイン済みの/はフィード、未サインインのフィードと端末投稿は/feedに置かなければならない（MUST）。認証確認中は静的ヒーローのちらつきを抑え、公開ページの見出し等をOAuthゲート内のspinnerだけに置き換えない。

#### Scenario: 初回訪問

- **WHEN** 静的トップを未ログインで開く
- **THEN** 検索と利用者にランディング本文を返す

#### Scenario: 再訪の復元待ち

- **WHEN** 以前サインインした端末で開く
- **THEN** 判定前に不要な未ログイン導線を点滅させない

### Requirement: UI-02 細い画面と長文

flex/gridの可変幅要素へmin-inline-size:0、可変grid列へminmax(0,1fr)を使わなければならない（MUST）。読む本文はoverflow-wrap:anywhere、一行メタ情報はellipsisで処理する。bodyのoverflow-xだけで子の崩れを隠さない。320/375/600pxで長URLと空白なし文字列のoverflowを確認する。

#### Scenario: 長いホスト名

- **WHEN** 320px幅でカードを表示する
- **THEN** カード・ページのscrollWidthをclientWidth以下に保つ

#### Scenario: ネストしたflex

- **WHEN** 名刺や連携カードのメタ情報が長い
- **THEN** 可変子が縮み省略が効く

### Requirement: UI-03 モーダル・portal・フォーカス

モーダルやメニューは表示領域とvisualViewportの移動へ収まり、背景クリック・Esc・戻りフォーカスを各操作の意味に合わせなければならない（MUST）。候補メニューのEscを外側モーダル終了に優先し、portalした補助UIだけで本文入力フォーカスを奪わない。

#### Scenario: ソフトキーボード表示

- **WHEN** 入力モーダルから補助UIを開く
- **THEN** 表示領域内に置きキーボードを不用意に閉じない

#### Scenario: 候補表示中のEsc

- **WHEN** mention候補を開いてEscを押す
- **THEN** まず候補を閉じる

### Requirement: UI-04 共通並べ替え

並べ替えのpointer captureは移動しないコンテナに張り、keyed要素のDOM移動で終了してはならない（MUST）。pointerup/pointercancelを終了として扱い、lostpointercaptureは並べ替え確定に使わない。閾値未満はtap、ドラッグ中はtapを発火しない。ghostはbody直下へ置き終了時に片付ける。

#### Scenario: 掴んだ行の移動

- **WHEN** ドラッグでkeyed eachのDOM順が変わる
- **THEN** 掴み直さず連続して並べ替えられる

#### Scenario: 閾値未満の操作

- **WHEN** 少し触って離す
- **THEN** ドラッグ確定ではなく指定されたtapとして扱う

### Requirement: UI-05 動きを減らす設定と読み上げ

reduced-motionでは装飾animationを停止しても内容・操作・状態が残らなければならない（MUST）。意味の無い装飾は読み上げから外し、対話版だけにrole/tabindexを付ける。iOS入力の自動ズームを避ける文字サイズと、スクリーンリーダー用の状態文言を維持する。

#### Scenario: animation無効

- **WHEN** 年表や新着を描画する
- **THEN** 透明な基底状態によって内容を失わない

#### Scenario: 非対話マスク

- **WHEN** リンク内タイルの警告表示を出す
- **THEN** 入れ子buttonを作らず解除はスレッドの操作へ任せる

### Requirement: UI-06 サンプルとランディングの非送信

開発用モックとランディングのデモ反応はAPI・PDS・AppViewへの実投稿を伴ってはならない（MUST）。実データの公開見本はCW・ラベル・こっそり・文脈が必要な返信や引用等を除外する。aboutは架空データを実コンポーネントで示し、色による分類には見出しを併記する。

#### Scenario: デモの絵文字を押す

- **WHEN** ランディングでリアクションを試す
- **THEN** 演出だけを表示して記録しない

#### Scenario: 公開TLからの見本

- **WHEN** 見本候補にラベル付き投稿がある
- **THEN** 初訪問で露出させず候補から外す

### Requirement: UI-07 pollingとナビ

共通pollは見えるタブで動かし、復帰時はintervalを待たず実行できる必要がある（MUST）。解除関数をcleanupへ渡す。ナビのdotと件数badgeは正本を混同せず表示だけ共有し、0は非表示、3桁は99+、カード未ドローは未プレイと別表示とする。

#### Scenario: 背景タブ

- **WHEN** visibilityがhiddenになる
- **THEN** 不要な定期通信を抑える

#### Scenario: 大きい未読件数

- **WHEN** 100以上の通知がある
- **THEN** 99+で表示する

### Requirement: UI-08 検証とコメントの位置付け

純ロジックのVitestと操作のPlaywrightを使い分け、テストコメントに残る再現条件をdesign.mdへ保持しなければならない（MUST）。ツール抑制コメント、型reference、空interface例、CSS区切りは利用者の動作要件に昇格させない。今回の基準化ではコードと既存コメントを変更しない。

#### Scenario: コメント削減の後続作業

- **WHEN** svelte-ignoreや@vite-ignore等を見つける
- **THEN** 仕様文へ移しただけで削除せずツール上の必要性を確認する

#### Scenario: 文書だけの変更

- **WHEN** 今回のOpenSpec基準化を検証する
- **THEN** 出典の完全性、リンク、仕様形式、既存ソースの不変を確認する
