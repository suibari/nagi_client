# Bluesky閲覧・クロスポスト

## Purpose

### 機能概要

BlueskyとNagiを併用する利用者が、Blueskyの投稿をタブで読み、希望したNagi投稿をBlueskyにも届けられるようにする。連携は任意であり、Nagiだけの投稿や、伏せた内容を外部へ無意識に公開しない。

閲覧は本人PDSを通じてBlueskyから取得する。Nagi AppViewへBlueskyコンテンツを保存せず、Bluesky上の反応数や操作をNagiの反応と混同しない。

### 機能一覧

| 機能                  | 役割・利用者ができること                           | 詳細要件                                  |
| --------------------- | -------------------------------------------------- | ----------------------------------------- |
| Blueskyフィードの閲覧 | ホーム・保存フィード・指定フィードをタブで読む。   | [BSKY-01](#bsky-01) / [BSKY-03](#bsky-03) |
| 表示設定とラベル      | Blueskyの設定を使い、Nagiでの年齢確認も適用する。  | [BSKY-02](#bsky-02)                       |
| クロスポスト判定      | 公開範囲、権限、CW、返信先の外部コピーを確認する。 | [BSKY-04](#bsky-04)                       |
| 長文の分割・添付      | Blueskyの長さとembed制約へ変換して投稿する。       | [BSKY-05](#bsky-05)                       |
| 保存順序と失敗処理    | Nagiと外部コピーの保存結果を区別して扱う。         | [BSKY-06](#bsky-06)                       |
| 外部リンクとスレッド  | DIDからリンクを組み立て、内部表示と使い分ける。    | [BSKY-07](#bsky-07)                       |

### 主な利用の流れ

1. 利用者がBluesky連携を選び、必要な書き込み・閲覧権限を認可する。
2. 閲覧時は本人の設定と購読ラベラーを読み、フィードを取得する。
3. 投稿時に外部へ出せる条件を確認し、必要なら本文を分割する。
4. 通常コピーはNagi保存前、記事ティーザーは公開後に作り、失敗の影響を利用者へ示す。

この文書は現行クライアントの振る舞いを整理する。設計判断は [design.md](design.md)、導入時の証跡は [コメント原文](../../reference/comment-snapshot/bluesky-integration.md)、既知の不整合は [known-gaps.md](../../known-gaps.md) に分けて記録する。シナリオは確認条件であり、全外部環境での実行合格を示すものではない。

## Requirements

<a id="bsky-01"></a>

### Requirement: BSKY-01 データ境界

Blueskyは本人PDSのatproto-proxyから取得し、Nagi AppViewを中継・保存先にしてはならない（MUST）。独自の表示型へ変換し、Nagi PostViewへの変換でBluesky URIをNagiリアクションAPIに渡す経路を作らない。いいね・返信・リポスト数は捨てる。

#### Scenario: Bluesky投稿の描画

- **WHEN** フィードと会話を取得する
- **THEN** 表示部品だけを再利用し、Nagiの書き込み操作を付けない

<a id="bsky-02"></a>

### Requirement: BSKY-02 設定・ラベラー・年齢

フィード取得前にBluesky側の設定と購読ラベラーを読み、atproto-accept-labelersへ反映しなければならない（MUST）。モデレーションはBluesky設定に従うが、Nagiで成人確認できない人には引用先・作者のラベルも含めて成人向けを隠す。ラベラー定義取得失敗だけでフィードを停止しない。

#### Scenario: 引用先だけ成人向け

- **WHEN** Nagiで成人未確認の人が引用を見る
- **THEN** 引用元・作者のラベルを含め判定して隠す

#### Scenario: 設定取得の一時失敗

- **WHEN** 初回の読み込みが落ちる
- **THEN** 失敗Promiseを固定せず再取得できる

<a id="bsky-03"></a>

### Requirement: BSKY-03 提供元の順序とページング

カスタムフィードは提供元の順序・総入替をそのまま反映し、更新結果を古い並びと混ぜてはならない（MUST）。ホームの返信・リポスト等の表示設定はカスタムフィードへ適用しない。重複は先着を残し、同じcursorで無限取得しない。バックグラウンド失敗では表示済み内容を残す。

#### Scenario: 非時系列フィードの更新

- **WHEN** 新しい先頭ページとcursorが返る
- **THEN** 両者を同じ結果に置き換える

#### Scenario: フィルタで空ページ

- **WHEN** ホームの設定で投稿が除外される
- **THEN** 必要数まで上限付きで続きを読み、残りを無限スクロールに任せる

<a id="bsky-04"></a>

### Requirement: BSKY-04 クロスポストの可否

外部連携はオプトイン・実際の権限・対象の存在を確認しなければならない（MUST）。kossoriと本文CWは送信しない。メディアCWはBlueskyがぼかすself-labelがある場合だけ許可する。返信・引用ボタンから開く共通Composerでは、本人のクロスポスト済み投稿の既存コピーを1つ参照できる場合にBlueskyへ続けられる。返信と引用の同時外部化は許可しない。

#### Scenario: コピー削除済み

- **WHEN** 自分のクロスポストへの返信を外部にも出そうとする
- **THEN** 孤立した返信を作らず送信を止める

#### Scenario: メディアCWのみ

- **WHEN** 対応ラベルが無い画像を外部へ出そうとする
- **THEN** ぼかしが失われるのでブロックする

<a id="bsky-05"></a>

### Requirement: BSKY-05 分割と埋め込み

本文は300graphemesかつ3000bytes以内へ分割し、改行→空白→grapheme境界を優先しなければならない（MUST）。可能な限りURL・mention facetをまたがず、分割先のbyte位置を直す。画像と動画の混在はBlueskyでは動画だけにする。via=Nagiで外部botの二重返信を避ける。

#### Scenario: 長い日本語投稿

- **WHEN** Nagiの本文がBluesky上限を超える
- **THEN** byte数とgrapheme数の両方を守るスレッドを作る

#### Scenario: 巨大facet

- **WHEN** facetを避けると分割できない
- **THEN** 必要な箇所だけfacetを諦めて強制分割する

<a id="bsky-06"></a>

### Requirement: BSKY-06 作成順序と補償の限界

通常のコピーはNagi保存より先に作り、その強参照を最初のNagiレコードへ含めなければならない（MUST）。外部作成失敗は警告としてNagi投稿を続ける。Bluesky投稿の権限はcreate限定とし、コピー削除のために権限を追加してはならない。現行コードにはNagi作成失敗時の削除試行が残るが、その成功は保証しない。方針との未反映差異は [GAP-01](../../known-gaps.md#gap-01) で管理する。記事ティーザーは公開URLが要るため記事作成後に出し、失敗で記事を巻き戻さない。

#### Scenario: Bluesky側の作成失敗

- **WHEN** 通常コピーを作れない
- **THEN** Nagi投稿は続けて警告を伝える

#### Scenario: Nagi側の作成失敗

- **WHEN** コピー作成後にNagi保存が失敗する
- **THEN** 実装の削除試行と権限不整合を区別し、削除完了を保証しない

<a id="bsky-07"></a>

### Requirement: BSKY-07 外部リンクと表示経路

外部リンクは変更されうるhandleでなくDIDで組み立てなければならない（MUST）。フィードURL/AT-URIの受理規則を保存側と揃え、表示時の引用は1段で止める。ハンドル解決だけは公開APIを使う。Nagi内のBlueskyスレッド表示と外部bsky.appリンクを区別する。

#### Scenario: handle.invalidのユーザー

- **WHEN** 外部プロフィールリンクを作る
- **THEN** DIDを使って有効な経路を作る

## 参照資料

### 外部資料

| 資料                                                                          | この機能で参照する理由                         |
| ----------------------------------------------------------------------------- | ---------------------------------------------- |
| [AT Protocol — Permissions](https://atproto.com/specs/permission)             | scope、permission set、repo操作とRPCの認可境界 |
| [AT Protocol — HTTP API (XRPC)](https://atproto.com/specs/xrpc)               | API呼び出し、プロキシとHTTPエラーの前提        |
| [AT Protocol — Labels](https://atproto.com/specs/label)                       | 自己申告・外部判定ラベルと表示判断のデータ表現 |
| [AT Protocol — Images and Video](https://atproto.com/guides/images-and-video) | 画像・動画blobの保存と配信の関係               |

リンクの到達先と対象を2026-11-11に確認した。外部の説明は更新されるため、本リポジトリ固有の制約と外部仕様を区別する。現行実装の基準はこの文書の要件とし、外部仕様への追従で振る舞いを変える場合は差分を記録する。

### 関連する内部資料

- [設計判断](design.md)：採用理由、互換条件、失敗時の考え方。
- [導入時コメント原文](../../reference/comment-snapshot/bluesky-integration.md)：基準コミットの出典を全件保存した履歴資料。
- [認証・セッション・姉妹アプリ連携](../auth-session/spec.md)：連携する機能の要件。
- [投稿・編集入力・下書き](../post-composer/spec.md)：連携する機能の要件。
- [フィード・タブ・スレッド・リアクション](../feed-thread/spec.md)：連携する機能の要件。
- [standard.site記事公開・ブログ表示](../blog-publication/spec.md)：連携する機能の要件。
