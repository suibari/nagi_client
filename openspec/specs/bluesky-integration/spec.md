# Bluesky閲覧・クロスポスト

## Purpose

BlueskyとNagiのデータ境界、連携時の安全条件と外部コピーを定義する。

この仕様は導入時点の実装・コメントから復元した現状の基準である。根拠と詳細な設計判断は [design.md](design.md)、確認された不整合は [known-gaps.md](../../known-gaps.md) を参照する。記載するシナリオは確認条件であり、今回すべての外部サービスを実行検証したという意味ではない。

## Requirements

### Requirement: BSKY-01 データ境界

Blueskyは本人PDSのatproto-proxyから取得し、Nagi AppViewを中継・保存先にしてはならない（MUST）。独自の表示型へ変換し、Nagi PostViewへの変換でBluesky URIをNagiリアクションAPIに渡す経路を作らない。いいね・返信・リポスト数は捨てる。

#### Scenario: Bluesky投稿の描画

- **WHEN** フィードと会話を取得する
- **THEN** 表示部品だけを再利用し、Nagiの書き込み操作を付けない

### Requirement: BSKY-02 設定・ラベラー・年齢

フィード取得前にBluesky側の設定と購読ラベラーを読み、atproto-accept-labelersへ反映しなければならない（MUST）。モデレーションはBluesky設定に従うが、Nagiで成人確認できない人には引用先・作者のラベルも含めて成人向けを隠す。ラベラー定義取得失敗だけでフィードを停止しない。

#### Scenario: 引用先だけ成人向け

- **WHEN** Nagiで成人未確認の人が引用を見る
- **THEN** 引用元・作者のラベルを含め判定して隠す

#### Scenario: 設定取得の一時失敗

- **WHEN** 初回の読み込みが落ちる
- **THEN** 失敗Promiseを固定せず再取得できる

### Requirement: BSKY-03 提供元の順序とページング

カスタムフィードは提供元の順序・総入替をそのまま反映し、更新結果を古い並びと混ぜてはならない（MUST）。ホームの返信・リポスト等の表示設定はカスタムフィードへ適用しない。重複は先着を残し、同じcursorで無限取得しない。バックグラウンド失敗では表示済み内容を残す。

#### Scenario: 非時系列フィードの更新

- **WHEN** 新しい先頭ページとcursorが返る
- **THEN** 両者を同じ結果に置き換える

#### Scenario: フィルタで空ページ

- **WHEN** ホームの設定で投稿が除外される
- **THEN** 必要数まで上限付きで続きを読み、残りを無限スクロールに任せる

### Requirement: BSKY-04 クロスポストの可否

外部連携はオプトイン・実際の権限・対象の存在を確認しなければならない（MUST）。kossoriと本文CWは送信しない。メディアCWはBlueskyがぼかすself-labelがある場合だけ許可する。通常Composerの返信・引用は本人の既存コピーを1つ参照できる場合に限り、返信と引用の同時外部化は許可しない。

#### Scenario: コピー削除済み

- **WHEN** 自分のクロスポストへの返信を外部にも出そうとする
- **THEN** 孤立した返信を作らず送信を止める

#### Scenario: メディアCWのみ

- **WHEN** 対応ラベルが無い画像を外部へ出そうとする
- **THEN** ぼかしが失われるのでブロックする

### Requirement: BSKY-05 分割と埋め込み

本文は300graphemesかつ3000bytes以内へ分割し、改行→空白→grapheme境界を優先しなければならない（MUST）。可能な限りURL・mention facetをまたがず、分割先のbyte位置を直す。画像と動画の混在はBlueskyでは動画だけにする。via=Nagiで外部botの二重返信を避ける。

#### Scenario: 長い日本語投稿

- **WHEN** Nagiの本文がBluesky上限を超える
- **THEN** byte数とgrapheme数の両方を守るスレッドを作る

#### Scenario: 巨大facet

- **WHEN** facetを避けると分割できない
- **THEN** 必要な箇所だけfacetを諦めて強制分割する

### Requirement: BSKY-06 作成順序と補償の限界

通常のコピーはNagi保存より先に作り、その強参照を最初のNagiレコードへ含めなければならない（MUST）。外部作成失敗は警告としてNagi投稿を続ける。Nagi作成失敗時は外部コピー削除を試みるが、create限定scopeでは成功保証が無い。記事ティーザーは公開URLが要るため記事作成後に出し、失敗で記事を巻き戻さない。

#### Scenario: Bluesky側の作成失敗

- **WHEN** 通常コピーを作れない
- **THEN** Nagi投稿は続けて警告を伝える

#### Scenario: Nagi側の作成失敗

- **WHEN** コピー作成後にNagi保存が失敗する
- **THEN** 実装の削除試行と権限不整合を区別し、削除完了を保証しない

### Requirement: BSKY-07 外部リンクと表示経路

外部リンクは変更されうるhandleでなくDIDで組み立てなければならない（MUST）。フィードURL/AT-URIの受理規則を保存側と揃え、表示時の引用は1段で止める。ハンドル解決だけは公開APIを使う。Nagi内のBlueskyスレッド表示と外部bsky.appリンクを区別する。

#### Scenario: handle.invalidのユーザー

- **WHEN** 外部プロフィールリンクを作る
- **THEN** DIDを使って有効な経路を作る
