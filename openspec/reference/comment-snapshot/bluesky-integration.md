# Bluesky閲覧・クロスポスト：導入時コメント原文

この文書は基準コミット `24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf` に固定した履歴資料であり、現行コードの行番号一覧ではない。現在の要件は [spec.md](../../specs/bluesky-integration/spec.md)、判断理由は [design.md](../../specs/bluesky-integration/design.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/bsky/agent.ts

<!-- source: src/lib/bsky/agent.ts:10 -->

### [src/lib/bsky/agent.ts:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/agent.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * Bluesky の AppView への入口。ユーザーの PDS へ atproto-proxy 付きで投げる（A案）。
 * Nagi の AppView は Bluesky のコンテンツを中継も保存もしない。
 * 権限は Bluesky 連携のオプトインで付く（BLUESKY_VIEW_SCOPES）。
 */
```

<!-- source: src/lib/bsky/agent.ts:17 -->

### [src/lib/bsky/agent.ts:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/agent.ts#L17)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** ハンドルの解決だけは認証の要らない公開 API を使う（PDS 経由だと rpc 権限がもう1つ要る）。 */
```

<!-- source: src/lib/bsky/agent.ts:21 -->

### [src/lib/bsky/agent.ts:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/agent.ts#L21)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** フィードタブの指し先。ホームタイムライン（フォロー中）はフィードジェネレータを持たない。 */
```

<!-- source: src/lib/bsky/agent.ts:27 -->

### [src/lib/bsky/agent.ts:27](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/agent.ts#L27)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** Bluesky アプリの「フォロー中」の表示設定（返信・リポスト・引用を隠すか）。 */
```

<!-- source: src/lib/bsky/agent.ts:50 -->

### [src/lib/bsky/agent.ts:50](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/agent.ts#L50)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * 本人の Bluesky 側の設定（モデレーション・保存済みフィード・フォロー中の表示設定）。
 * 購読ラベラーを atproto-accept-labelers に載せないと AppView がそのラベルを返さないので、
 * フィードを引く前に必ず済ませる。セッション中は使い回す（Bluesky 側で設定を変えたら再読み込みで反映）。
 */
```

<!-- source: src/lib/bsky/agent.ts:59 -->

### [src/lib/bsky/agent.ts:59](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/agent.ts#L59)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 定義が引けなくてもラベル値そのものでの判定は効くので、フィードは止めない。
```

<!-- source: src/lib/bsky/agent.ts:67 -->

### [src/lib/bsky/agent.ts:67](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/agent.ts#L67)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 失敗を握ったままにすると、一度落ちたら再読み込みまで直らない。
```

<!-- source: src/lib/bsky/agent.ts:76 -->

### [src/lib/bsky/agent.ts:76](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/agent.ts#L76)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** Fetch replies through the same authenticated PDS proxy and subscribed labelers as the feed. */
```

<!-- source: src/lib/bsky/agent.ts:93 -->

### [src/lib/bsky/agent.ts:93](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/agent.ts#L93)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * 表示設定で絞り込むと1ページがほとんど空になることがある（返信を隠す設定で返信の多いTLなど）。
 * この件数に届くまで続きを読む。上限回数で打ち切り、残りは無限スクロールに任せる。
 */
```

<!-- source: src/lib/bsky/agent.ts:107 -->

### [src/lib/bsky/agent.ts:107](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/agent.ts#L107)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 同じカーソルが返ってくるフィードがある。続きが無いのに無限に引き続けないよう止める。
```

<!-- source: src/lib/bsky/agent.ts:115 -->

### [src/lib/bsky/agent.ts:115](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/agent.ts#L115)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 絞り込むのはホームタイムラインだけ。カスタムフィードの中身はフィード側が決めている
	// （Bluesky アプリもフォロー中の表示設定をカスタムフィードには掛けない）。
```

<!-- source: src/lib/bsky/agent.ts:151 -->

### [src/lib/bsky/agent.ts:151](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/agent.ts#L151)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** Bluesky で保存（ピン留め含む）しているフィード。リストやタイムラインは対象外。 */
```

<!-- source: src/lib/bsky/agent.ts:166 -->

### [src/lib/bsky/agent.ts:166](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/agent.ts#L166)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 貼り付けられた bsky.app の URL / AT-URI からフィードを引く。見つからなければ undefined。 */
```

<!-- source: src/lib/bsky/agent.ts:180 -->

### [src/lib/bsky/agent.ts:180](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/agent.ts#L180)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 自分の投稿にいいねした人。数は返さず、先頭の数人だけ。 */
```

## src/lib/bsky/conversation.ts

<!-- source: src/lib/bsky/conversation.ts:18 -->

### [src/lib/bsky/conversation.ts:18](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/conversation.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** Keep feed order, group replies by root, and preserve the attribution of independent reposts. */
```

<!-- source: src/lib/bsky/conversation.ts:82 -->

### [src/lib/bsky/conversation.ts:82](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/conversation.ts#L82)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** A feed can contain only the root; replies are supplied by getPostThread, independently of feed filtering. */
```

## src/lib/bsky/feed.svelte.ts

<!-- source: src/lib/bsky/feed.svelte.ts:7 -->

### [src/lib/bsky/feed.svelte.ts:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/feed.svelte.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** Bluesky のフィード状態。カスタムフィードは提供元の順序・入れ替えをそのまま反映する。 */
```

<!-- source: src/lib/bsky/feed.svelte.ts:34 -->

### [src/lib/bsky/feed.svelte.ts:34](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/feed.svelte.ts#L34)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 先頭から取り直す。読み込み中に呼ばれたら、古い応答は捨てる。 */
```

<!-- source: src/lib/bsky/feed.svelte.ts:54 -->

### [src/lib/bsky/feed.svelte.ts:54](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/feed.svelte.ts#L54)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 先頭ページを更新する。バックグラウンドの失敗は次回に再試行する。 */
```

<!-- source: src/lib/bsky/feed.svelte.ts:63 -->

### [src/lib/bsky/feed.svelte.ts:63](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/feed.svelte.ts#L63)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// カスタムフィードは非時系列・総入れ替えもあるため、古い結果と混ぜない。
			// カーソルも同じ取得結果のものへ更新する。
```

<!-- source: src/lib/bsky/feed.svelte.ts:86 -->

### [src/lib/bsky/feed.svelte.ts:86](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/feed.svelte.ts#L86)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 表示中の投稿を残し、次のポーリングで再試行する。
```

<!-- source: src/lib/bsky/feed.svelte.ts:132 -->

### [src/lib/bsky/feed.svelte.ts:132](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/feed.svelte.ts#L132)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** ページをまたいで同じ投稿が来るフィードがある。先に来た方を残す。 */
```

<!-- source: src/lib/bsky/feed.svelte.ts:142 -->

### [src/lib/bsky/feed.svelte.ts:142](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/feed.svelte.ts#L142)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** XRPC のエラー文は英語の内部表現なので、画面には出さずコンソールに残す。 */
```

## src/lib/bsky/links.ts

<!-- source: src/lib/bsky/links.ts:1 -->

### [src/lib/bsky/links.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/links.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * Bluesky のフィード・投稿・ユーザーを bsky.app のどこへ飛ばすか。
 * Nagi は Bluesky のプロフィールやスレッドを作り込まず、見たいときは bsky.app で開いてもらう。
 * URL は DID で組む。ハンドルは変わるし、handle.invalid のこともある。
 */
```

<!-- source: src/lib/bsky/links.ts:9 -->

### [src/lib/bsky/links.ts:9](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/links.ts#L9)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** AppView の parseFeedTabs と同じ形。片方だけ緩いと保存で弾かれる。 */
```

<!-- source: src/lib/bsky/links.ts:25 -->

### [src/lib/bsky/links.ts:25](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/links.ts#L25)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** DID とハンドルはパスにそのまま置ける文字だけでできている。それ以外は念のためエンコードする。 */
```

<!-- source: src/lib/bsky/links.ts:32 -->

### [src/lib/bsky/links.ts:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/links.ts#L32)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** at://did/app.bsky.feed.post/rkey → bsky.app の投稿ページ。形が違えば著者のプロフィールへ。 */
```

<!-- source: src/lib/bsky/links.ts:46 -->

### [src/lib/bsky/links.ts:46](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/links.ts#L46)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * 貼り付けられたフィードの指定を読む。bsky.app の URL か AT-URI を受け付ける。
 * actor がハンドルのときは呼び出し側で DID に解決する（ここはネットワークを使わない）。
 */
```

## src/lib/bsky/mapView.ts

<!-- source: src/lib/bsky/mapView.ts:13 -->

### [src/lib/bsky/mapView.ts:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/mapView.ts#L13)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * Bluesky の FeedViewPost を、Nagi の表示部品（ImageGallery / VideoPlayer / LinkCard / Avatar）が
 * 受け取れる形へ落とす。Nagi の PostView には寄せない — ThreadUnit やリアクション UI が
 * bsky の URI を Nagi AppView へ投げる経路を作らないため。
 *
 * いいねの数・リポスト数・返信数はここで捨てる（Nagi は数を出さない）。
 */
```

<!-- source: src/lib/bsky/mapView.ts:58 -->

### [src/lib/bsky/mapView.ts:58](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/mapView.ts#L58)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** モデレーション判定にそのまま渡す元のビュー。 */
```

<!-- source: src/lib/bsky/mapView.ts:63 -->

### [src/lib/bsky/mapView.ts:63](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/mapView.ts#L63)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 同じ投稿が別の人のリポストで2回来るので、uri だけでは DOM キーにならない。 */
```

<!-- source: src/lib/bsky/mapView.ts:67 -->

### [src/lib/bsky/mapView.ts:67](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/mapView.ts#L67)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** Conversation context included by the feed API; each post retains its own moderation view. */
```

<!-- source: src/lib/bsky/mapView.ts:71 -->

### [src/lib/bsky/mapView.ts:71](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/mapView.ts#L71)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
	 * 返信なら、その返信先の情報。フォロー中の表示設定（返信を隠す・フォロー外への返信を隠す）の
	 * 判定に使う。返信先が削除・ブロックで見えないときは parentDid が無い。
	 */
```

<!-- source: src/lib/bsky/mapView.ts:103 -->

### [src/lib/bsky/mapView.ts:103](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/mapView.ts#L103)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * 埋め込みは $type で見分ける。@atproto/api の isView 系ガードは「未知の $type」側の
 * 開いた型へ絞り込んでしまい、フィールドに触れないため。
 */
```

<!-- source: src/lib/bsky/mapView.ts:121 -->

### [src/lib/bsky/mapView.ts:121](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/mapView.ts#L121)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// サムネイルが無い動画もある。VideoPlayer は thumbnail を必須で取るので空にしておく。
```

<!-- source: src/lib/bsky/mapView.ts:152 -->

### [src/lib/bsky/mapView.ts:152](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/mapView.ts#L152)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 引用の中の引用は1段で止める。中のメディアだけは見せる。
```

<!-- source: src/lib/bsky/mapView.ts:170 -->

### [src/lib/bsky/mapView.ts:170](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/mapView.ts#L170)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// フィード・リスト・スターターパックなどの埋め込みは出さない。
```

<!-- source: src/lib/bsky/mapView.ts:175 -->

### [src/lib/bsky/mapView.ts:175](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/mapView.ts#L175)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 引用先の viewRecord（あれば）。モデレーションも引用先のラベルを見るので共有する。 */
```

## src/lib/bsky/moderation.ts

<!-- source: src/lib/bsky/moderation.ts:10 -->

### [src/lib/bsky/moderation.ts:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/moderation.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * Bluesky の投稿の見せ方。判定は Bluesky のラベルと、本人が Bluesky 側で選んだモデレーション設定
 * （購読ラベラー・成人向けの可否・ミュートワードなど）に従う。Nagi の自動判定は Bluesky の投稿には
 * 掛かっていないので、Nagi のモデレーション設定は使わない。
 *
 * 例外は年齢。Nagi で成人と確認できていない人には、Bluesky 側の設定に関わらず成人向けを出さない
 * （Nagi の AppView が未成年へ成人向けを返さないのと同じ線引きをクライアントで引く）。
 */
```

<!-- source: src/lib/bsky/moderation.ts:23 -->

### [src/lib/bsky/moderation.ts:23](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/moderation.ts#L23)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 投稿全体を注意で覆う。 */
```

<!-- source: src/lib/bsky/moderation.ts:25 -->

### [src/lib/bsky/moderation.ts:25](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/moderation.ts#L25)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 画像・動画だけを覆う。 */
```

<!-- source: src/lib/bsky/moderation.ts:29 -->

### [src/lib/bsky/moderation.ts:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/moderation.ts#L29)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 引用先のラベルも見る。成人向けの投稿を引用しただけの投稿から中身が見えてしまうため。 */
```

## src/lib/bsky/thread.ts

<!-- source: src/lib/bsky/thread.ts:11 -->

### [src/lib/bsky/thread.ts:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/thread.ts#L11)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** Flatten all reply branches, preserving each post's moderation data. Counts never assume missing replies are visible. */
```

<!-- source: src/lib/bsky/thread.ts:41 -->

### [src/lib/bsky/thread.ts:41](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/thread.ts#L41)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** Bound parallel requests and share snapshots between the same thread's normal/repost cards. Owned by the OAuth context. */
```

<!-- source: src/lib/bsky/thread.ts:77 -->

### [src/lib/bsky/thread.ts:77](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/thread.ts#L77)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// Pending requests are retained for deduplication; evict settled snapshots first.
```

## src/lib/bsky/timelineFilter.ts

<!-- source: src/lib/bsky/timelineFilter.ts:3 -->

### [src/lib/bsky/timelineFilter.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/timelineFilter.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * Bluesky アプリの「フォロー中」の表示設定。getTimeline はこれを反映せずに返し、
 * 絞り込みはクライアントの仕事になっている。hideRepliesByLikeCount は古い設定なので見ない。
 */
```

<!-- source: src/lib/bsky/timelineFilter.ts:14 -->

### [src/lib/bsky/timelineFilter.ts:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bsky/timelineFilter.ts#L14)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * 本人の投稿と、本人あての返信は設定に関わらず残す（自分の書いたものが消えると混乱する）。
 * フォロー外への返信は、返信先が本人・投稿者自身（自分のスレッドの続き）・フォロー中なら残す。
 */
```

## src/lib/components/bsky/BskyFeedShell.svelte

<!-- source: src/lib/components/bsky/BskyFeedShell.svelte:20 -->

### [src/lib/components/bsky/BskyFeedShell.svelte:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/bsky/BskyFeedShell.svelte#L20)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
	 * Bluesky のフィードタブの中身。権限が無ければ Bluesky 連携の再認可へ案内する
	 * （クロスポストと同じオプトインで、スイッチは増やさない）。
	 * preview は設定画面のプレビュー用で、先頭の数件だけを出して続きを読まない。
	 */
```

<!-- source: src/lib/components/bsky/BskyFeedShell.svelte:36 -->

### [src/lib/components/bsky/BskyFeedShell.svelte:36](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/bsky/BskyFeedShell.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 再試行ボタンで増やし、下の effect をやり直させる。 */
```

<!-- source: src/lib/components/bsky/BskyFeedShell.svelte:43 -->

### [src/lib/components/bsky/BskyFeedShell.svelte:43](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/bsky/BskyFeedShell.svelte#L43)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 指し先は cacheKey に含まれている。feedRef は描画のたびに作り直される
		// オブジェクトなので、依存に入れると同じタブでも読み込み直してしまう。
```

<!-- source: src/lib/components/bsky/BskyFeedShell.svelte:60 -->

### [src/lib/components/bsky/BskyFeedShell.svelte:60](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/bsky/BskyFeedShell.svelte#L60)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 本人のモデレーション設定が読めないまま出すと、隠すべき投稿が出てしまう。
```

<!-- source: src/lib/components/bsky/BskyFeedShell.svelte:87 -->

### [src/lib/components/bsky/BskyFeedShell.svelte:87](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/bsky/BskyFeedShell.svelte#L87)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** ナビの再押下（pageRefresh）から呼ぶ。 */
```

<!-- source: src/lib/components/bsky/BskyFeedShell.svelte:91 -->

### [src/lib/components/bsky/BskyFeedShell.svelte:91](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/bsky/BskyFeedShell.svelte#L91)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** アカウントが変わったらキャッシュごと捨てる。 */
```

## src/lib/components/bsky/BskyPostCard.svelte

<!-- source: src/lib/components/bsky/BskyPostCard.svelte:17 -->

### [src/lib/components/bsky/BskyPostCard.svelte:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/bsky/BskyPostCard.svelte#L17)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
	 * Bluesky の投稿1件。閲覧専用で、いいね・リポスト・返信の操作は置かない。
	 * 著者・日時・カードは bsky.app を新しいタブで開く（Nagi はユーザーやスレッドを作り込まない）。
	 *
	 * いいねは数を出さない。Nagi のリアクションと同じく、誰がいいねしたかは投稿者本人にだけ見せ、
	 * それも最大5人まで。
	 */
```

<!-- source: src/lib/components/bsky/BskyPostCard.svelte:51 -->

### [src/lib/components/bsky/BskyPostCard.svelte:51](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/bsky/BskyPostCard.svelte#L51)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 自分の投稿だけ、画面に入ったときに一度だけ引く。フィードを開いただけで全件ぶん叩かない。
```

## src/lib/components/bsky/BskyRichText.svelte

<!-- source: src/lib/components/bsky/BskyRichText.svelte:7 -->

### [src/lib/components/bsky/BskyRichText.svelte:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/bsky/BskyRichText.svelte#L7)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
	 * Bluesky の本文。Nagi の RichText は Markdown を解釈するので使わない（Bluesky の本文に
	 * `*` や `#` があっても装飾ではない）。リンク・メンション・タグの facet だけを見る。
	 * メンションとタグは bsky.app へ飛ばす。
	 */
```

## src/lib/crosspost/bluesky.test.ts

<!-- source: src/lib/crosspost/bluesky.test.ts:52 -->

### [src/lib/crosspost/bluesky.test.ts:52](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.test.ts#L52)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// ZWJ 連結絵文字は1グラフェムで25バイト。200個ならグラフェム上限には遠いが
		// 5000バイトあるので、バイト上限のほうが先に効く。
```

<!-- source: src/lib/crosspost/bluesky.test.ts:79 -->

### [src/lib/crosspost/bluesky.test.ts:79](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.test.ts#L79)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 区切り候補の位置が URL の内側に来るケース。URL を割らずに手前で切る。
```

<!-- source: src/lib/crosspost/bluesky.test.ts:87 -->

### [src/lib/crosspost/bluesky.test.ts:87](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.test.ts#L87)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// URL が途中で切れていたら、断片だけが現れる。
```

<!-- source: src/lib/crosspost/bluesky.test.ts:100 -->

### [src/lib/crosspost/bluesky.test.ts:100](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.test.ts#L100)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 2つ目のチャンクの先頭からの相対位置になっている。
```

<!-- source: src/lib/crosspost/bluesky.test.ts:105 -->

### [src/lib/crosspost/bluesky.test.ts:105](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.test.ts#L105)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 1チャンクに収まらない長さの facet は、切った時点で意味を失うので落とす。
```

<!-- source: src/lib/crosspost/bluesky.test.ts:286 -->

### [src/lib/crosspost/bluesky.test.ts:286](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.test.ts#L286)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 通知文の「Nagi」だけが記事へのリンクになっている。
```

<!-- source: src/lib/crosspost/bluesky.test.ts:349 -->

### [src/lib/crosspost/bluesky.test.ts:349](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.test.ts#L349)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** facet のバイト範囲を、文字列の slice に使える文字インデックスへ直す。 */
```

## src/lib/crosspost/bluesky.ts

<!-- source: src/lib/crosspost/bluesky.ts:10 -->

### [src/lib/crosspost/bluesky.ts:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** Bluesky の投稿上限。app.bsky.feed.post#text の maxGraphemes / maxLength。 */
```

<!-- source: src/lib/crosspost/bluesky.ts:13 -->

### [src/lib/crosspost/bluesky.ts:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L13)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** app.bsky.embed.external#thumb の maxSize。超える blob を載せるとレコードごと弾かれる。 */
```

<!-- source: src/lib/crosspost/bluesky.ts:15 -->

### [src/lib/crosspost/bluesky.ts:15](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L15)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** クロスポストであることの目印。Bluesky 側botたんはこれを見て反応をスキップする。 */
```

<!-- source: src/lib/crosspost/bluesky.ts:42 -->

### [src/lib/crosspost/bluesky.ts:42](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L42)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * 300 グラフェム / 3000 バイトに収まるようテキストを分割する。
 * 改行 > 空白 > グラフェム境界の順で区切り、URL やメンションの facet を
 * またぐ位置では切らない（切れる場所が無いときだけ facet を諦めて強制分割）。
 *
 * `reserved` は、呼び出し元があとから末尾に足す文字列のぶんの席取り。
 * 記事のリンクカード用抜粋で、省略記号のぶんを確保するために使う。
 */
```

<!-- source: src/lib/crosspost/bluesky.ts:87 -->

### [src/lib/crosspost/bluesky.ts:87](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L87)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// どこで切っても facet を割ってしまう場合（極端に長い URL など）は
			// 上限位置で強制的に切り、収まらない facet は落とす。
```

<!-- source: src/lib/crosspost/bluesky.ts:92 -->

### [src/lib/crosspost/bluesky.ts:92](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L92)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 前後の空白を落としてからチャンクを確定する。
```

<!-- source: src/lib/crosspost/bluesky.ts:124 -->

### [src/lib/crosspost/bluesky.ts:124](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L124)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 動画は video.bsky.app が PDS へ置いた blob なので、Bluesky 側でもそのまま再生できる。
	// Bluesky には画像と動画を混ぜる embed が無いので、両方あるときは動画だけを送る。
```

<!-- source: src/lib/crosspost/bluesky.ts:148 -->

### [src/lib/crosspost/bluesky.ts:148](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L148)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * Bluesky に作成する本文チャンクと embed を組み立てる。
 * app.bsky.feed.post は embed があれば空の text を許可するため、画像または
 * リンクカードだけの投稿では空文字のチャンクを1件用意する。
 */
```

<!-- source: src/lib/crosspost/bluesky.ts:157 -->

### [src/lib/crosspost/bluesky.ts:157](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L157)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 公式 Bluemoji facet は相互運用のため残し、Nagi の正確な rkey 解決用参照だけ外す。
```

<!-- source: src/lib/crosspost/bluesky.ts:169 -->

### [src/lib/crosspost/bluesky.ts:169](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L169)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 組み立て済みの下書きについて、CW がクロスポストを止めるか。 */
```

<!-- source: src/lib/crosspost/bluesky.ts:182 -->

### [src/lib/crosspost/bluesky.ts:182](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L182)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** Bluesky 側で続ける先。返信ならコピーへの返信、引用ならコピーの引用として出す。 */
```

<!-- source: src/lib/crosspost/bluesky.ts:188 -->

### [src/lib/crosspost/bluesky.ts:188](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L188)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 作ったコピー。ref は Nagi の投稿レコードの crosspost にそのまま入れ、posts は巻き戻し用の全件。 */
```

<!-- source: src/lib/crosspost/bluesky.ts:194 -->

### [src/lib/crosspost/bluesky.ts:194](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L194)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 引用は先頭の1件にだけ付ける。画像・動画・リンクカードと一緒なら recordWithMedia にする。 */
```

<!-- source: src/lib/crosspost/bluesky.ts:201 -->

### [src/lib/crosspost/bluesky.ts:201](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L201)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * Nagi の投稿を Bluesky にも投稿する。
 * 300 文字を超える場合は分割し、2件目以降は直前の投稿へのリプライで芋づるに繋ぐ。
 * blob は Nagi 投稿でアップロード済みのものを使い回す（同一リポジトリ・同一サイズ上限）。
 *
 * target を渡すと、自分のクロスポスト済みの投稿への返信・引用として Bluesky でも続ける。
 * 途中で失敗したら、作った分は消してから投げる（Bluesky に半端なスレッドを残さない）。
 */
```

<!-- source: src/lib/crosspost/bluesky.ts:214 -->

### [src/lib/crosspost/bluesky.ts:214](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L214)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// こっそり投稿と、Bluesky では伏せられない CW を含む投稿はクロスポストしない。
```

<!-- source: src/lib/crosspost/bluesky.ts:270 -->

### [src/lib/crosspost/bluesky.ts:270](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L270)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 作ったコピーを消す。Nagi の投稿が作れなかったときの巻き戻し用で、失敗は握る。 */
```

<!-- source: src/lib/crosspost/bluesky.ts:283 -->

### [src/lib/crosspost/bluesky.ts:283](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L283)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * Bluesky のコピーがまだあるか。自分の PDS に聞く（1件ずつ getRecord）。
 * 無い（RecordNotFound）なら false、確かめられなかったら例外。
 */
```

<!-- source: src/lib/crosspost/bluesky.ts:308 -->

### [src/lib/crosspost/bluesky.ts:308](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L308)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * 記事の抜粋を作るために、本文先頭のタイトル行（h1）を落とす。
 * タイトルは誘導リンクのカード側に出るので、抜粋に重ねて入れない。
 * h2 以下は本文の一部なので残す。facet のオフセットは落としたぶん前へ詰める。
 */
```

<!-- source: src/lib/crosspost/bluesky.ts:331 -->

### [src/lib/crosspost/bluesky.ts:331](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L331)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * 記事本文に置いた画像の行（`![alt](url)`）を落とす。Bluesky の抜粋では記法のまま
 * 見えてしまうため。画像行は facet を持たないので、後ろの facet をずらすだけでよい。
 */
```

<!-- source: src/lib/crosspost/bluesky.ts:340 -->

### [src/lib/crosspost/bluesky.ts:340](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L340)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 落とした行（直後の改行ごと）の元のバイト位置と、そこまでに落とした累計バイト数。
```

<!-- source: src/lib/crosspost/bluesky.ts:366 -->

### [src/lib/crosspost/bluesky.ts:366](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L366)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * ブログの投稿通知と「Nagi」のリンク facet、リンクカード用の抜粋を組み立てる。
 * 通知文は呼び出し元が翻訳済みで渡す。
 */
```

<!-- source: src/lib/crosspost/bluesky.ts:404 -->

### [src/lib/crosspost/bluesky.ts:404](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L404)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
	 * 記事の site.standard.document と publication への強参照。Bluesky の AppView は
	 * external.associatedRefs に固定された版を読んで、出典・著者・読了時間つきのカードを出す
	 * （URL から記事を探しには行かない）。document が site で指す publication も必ず含める。
	 */
```

<!-- source: src/lib/crosspost/bluesky.ts:412 -->

### [src/lib/crosspost/bluesky.ts:412](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L412)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** ティーザーのリンクカード。associatedRefs が無ければ通常のリンクカードになる。 */
```

<!-- source: src/lib/crosspost/bluesky.ts:434 -->

### [src/lib/crosspost/bluesky.ts:434](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L434)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * ブログとして書いた投稿を Bluesky に1件だけ出す。
 *
 * 記事を crosspostToBluesky に流すと 300 グラフェムごとの分割連投になり、
 * Bluesky のタイムラインが1本の記事で埋まってしまう。代わりにリンク付きの
 * 投稿通知と記事のリンクカードを1件投稿する。
 * 本文全体は Nagi と standard.site の document が持つ。
 */
```

<!-- source: src/lib/crosspost/bluesky.ts:447 -->

### [src/lib/crosspost/bluesky.ts:447](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L447)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// CW 付きはブログにできない（記事のリーダーではぼかしもラベルも効く保証が無い）ので、
	// ティーザーも cwRestricted で一律に止める。
```

<!-- source: src/lib/crosspost/bluesky.ts:455 -->

### [src/lib/crosspost/bluesky.ts:455](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/bluesky.ts#L455)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 画像は本文添付にせず、誘導リンクのカードのサムネイルとして使う。
	// 「読みに行く先がある」ことを見た目でも示したいため。
	// ヘッダー画像は 1MB 未満に圧縮しているが、通常の画像ピッカー（2MB まで）から
	// 入れた1枚目が先頭に来ることもあるので、上限を超える blob はサムネを諦める
	// （付けたまま投稿するとレコードごと弾かれ、ティーザー自体が出ない）。
```

## src/lib/crosspost/content-warning.test.ts

<!-- source: src/lib/crosspost/content-warning.test.ts:9 -->

### [src/lib/crosspost/content-warning.test.ts:9](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/content-warning.test.ts#L9)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// ラベルを付けても本文の伏せ字は Bluesky で伏せられない。
```

## src/lib/crosspost/content-warning.ts

<!-- source: src/lib/crosspost/content-warning.ts:3 -->

### [src/lib/crosspost/content-warning.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/content-warning.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * Bluesky が画像・動画をぼかすセルフラベル。クロスポストへ引き継ぐのもこの集合だけ。
 * Nagi で選べるのは sexual と graphic-media だが、旧データの porn・nudity も同じ扱いにする。
 */
```

<!-- source: src/lib/crosspost/content-warning.ts:9 -->

### [src/lib/crosspost/content-warning.ts:9](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/content-warning.ts#L9)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** CW がクロスポストを止める理由。止めないときは undefined。 */
```

<!-- source: src/lib/crosspost/content-warning.ts:12 -->

### [src/lib/crosspost/content-warning.ts:12](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/content-warning.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * Nagi で伏せたものを、伏せられない場所へは出さない。
 *
 * CW（本文の伏せ字・画像のぼかし）は Nagi 独自の機能で、Bluesky では効かない。
 * - 本文の伏せ字は Bluesky に相当する仕組みが無いので、常に止める。
 * - 画像・動画のぼかしは、Bluesky がぼかすセルフラベルが付いていれば同等に伏せられるので通す。
 *   ラベルが無ければ素のまま出てしまうので止める。
 *
 * ブログ（standard.site）はリーダーがラベルを解釈する保証が無いので、ここではなく
 * cwRestricted で CW 付きを一律に止めている。
 */
```

## src/lib/crosspost/preferences.ts

<!-- source: src/lib/crosspost/preferences.ts:10 -->

### [src/lib/crosspost/preferences.ts:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/preferences.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// クロスポスト固有の入口。実体は optin/scope-optin.ts（standard.site と共通）。
// 呼び出し側の差分を増やさないため、従来の関数名をそのまま残している。
```

<!-- source: src/lib/crosspost/preferences.ts:19 -->

### [src/lib/crosspost/preferences.ts:19](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/preferences.ts#L19)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** 現在のセッションに Bluesky への書き込み権限が付与されているか。 */
```

## src/lib/crosspost/target.svelte.ts

<!-- source: src/lib/crosspost/target.svelte.ts:4 -->

### [src/lib/crosspost/target.svelte.ts:4](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/target.svelte.ts#L4)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * Bluesky 側のコピーが消えていた投稿。Nagi はその削除を知る手段が無い（AppView は Bluesky の
 * 投稿を見ていない）ので、返信・引用の画面で確かめて分かったものをこの端末に覚えておく。
 * Nagi のレコードは書き換えない（書き換えると AppView が「編集」と見なすため）。
 */
```

<!-- source: src/lib/crosspost/target.svelte.ts:23 -->

### [src/lib/crosspost/target.svelte.ts:23](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/target.svelte.ts#L23)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 生成時に一度だけ読む。$derived の中から has() が呼ばれるので、読むたびに $state を書き換えてはいけない。
```

<!-- source: src/lib/crosspost/target.svelte.ts:32 -->

### [src/lib/crosspost/target.svelte.ts:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/target.svelte.ts#L32)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 上限を設けて古いものから捨てる。消えたコピーを延々と覚え続けない。
```

<!-- source: src/lib/crosspost/target.svelte.ts:37 -->

### [src/lib/crosspost/target.svelte.ts:37](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/target.svelte.ts#L37)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 覚えられなくても、このタブの中では効く。
```

<!-- source: src/lib/crosspost/target.svelte.ts:44 -->

### [src/lib/crosspost/target.svelte.ts:44](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/target.svelte.ts#L44)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
 * 自分のクロスポスト済みの投稿か。返信・引用を Bluesky にも続けられるのはこれだけ
 * （他人のクロスポストへは続けない。相手が Nagi で書いたものに Bluesky で反応が付くのを避ける）。
 */
```

<!-- source: src/lib/crosspost/target.svelte.ts:59 -->

### [src/lib/crosspost/target.svelte.ts:59](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/crosspost/target.svelte.ts#L59)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** コピーがまだあるか確かめる。消えていたら覚えて、ラベルもこの端末では外す。 */
```

## src/routes/dev/e2e/crosspost/+page.svelte

<!-- source: src/routes/dev/e2e/crosspost/+page.svelte:7 -->

### [src/routes/dev/e2e/crosspost/+page.svelte:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/e2e/crosspost/+page.svelte#L7)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
	 * Bluesky への続き（自分のクロスポストへの返信・引用）の確認用。
	 * 仮のセッションは Bluesky への書き込み権限を持つ。PDS への呼び出しはネットワーク越しなので e2e で差し替える。
	 */
```

## src/routes/settings/crosspost/+page.svelte

<!-- source: src/routes/settings/crosspost/+page.svelte:21 -->

### [src/routes/settings/crosspost/+page.svelte:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/crosspost/+page.svelte#L21)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/**
	 * Bluesky 連携。クロスポストとフィードの閲覧は同じオプトイン（再認可1回）で権限が付く。
	 * スイッチは「Blueskyにも」ボタンの1つだけで、フィードはタブ設定から足す。
	 * 閲覧の権限は後から足したので、クロスポストだけ許可済みの人には再認可を案内する。
	 */
```

<!-- source: src/routes/settings/crosspost/+page.svelte:96 -->

### [src/routes/settings/crosspost/+page.svelte:96](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/crosspost/+page.svelte#L96)

分類: 仕様・設計の根拠。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
<!-- 使える状態になるまでは説明だけ出し、中身の無い空の面を置かない。 -->
```

## tests/e2e/bsky-feed-tab-dialog.spec.ts

<!-- source: tests/e2e/bsky-feed-tab-dialog.spec.ts:3 -->

### [tests/e2e/bsky-feed-tab-dialog.spec.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/bsky-feed-tab-dialog.spec.ts#L3)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// タブ追加ダイアログの Bluesky フィード選択。保存済みフィードが多いとダイアログが max-height を
// 超え、flex の子が縮む。overflow を持つ要素は高さ0まで縮められるので、スクロールさせたい
// 保存済み一覧以外（フォロー中の選択肢・URL 入力など）がつぶれていないかを実レイアウトで測る。
```

<!-- source: tests/e2e/bsky-feed-tab-dialog.spec.ts:21 -->

### [tests/e2e/bsky-feed-tab-dialog.spec.ts:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/bsky-feed-tab-dialog.spec.ts#L21)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// Nagi AppView 宛ては空の一覧で返す。このテストが見るのはダイアログの見た目だけ。
```

<!-- source: tests/e2e/bsky-feed-tab-dialog.spec.ts:40 -->

### [tests/e2e/bsky-feed-tab-dialog.spec.ts:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/bsky-feed-tab-dialog.spec.ts#L40)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// Bluesky 連携の権限を持つセッションを差し込み、PDS 経由の app.bsky.* をここで返す。
```

<!-- source: tests/e2e/bsky-feed-tab-dialog.spec.ts:82 -->

### [tests/e2e/bsky-feed-tab-dialog.spec.ts:82](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/bsky-feed-tab-dialog.spec.ts#L82)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/* @vite-ignore */
```

<!-- source: tests/e2e/bsky-feed-tab-dialog.spec.ts:101 -->

### [tests/e2e/bsky-feed-tab-dialog.spec.ts:101](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/bsky-feed-tab-dialog.spec.ts#L101)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/** ダイアログの直下の子のうち、中身より低く描かれている（つぶれている）もの。 */
```

<!-- source: tests/e2e/bsky-feed-tab-dialog.spec.ts:105 -->

### [tests/e2e/bsky-feed-tab-dialog.spec.ts:105](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/bsky-feed-tab-dialog.spec.ts#L105)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// 保存済み一覧だけはスクロールさせる前提なので、縮んでよい。
```

<!-- source: tests/e2e/bsky-feed-tab-dialog.spec.ts:123 -->

### [tests/e2e/bsky-feed-tab-dialog.spec.ts:123](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/bsky-feed-tab-dialog.spec.ts#L123)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// ボタン自体は縮まず、入れ物のリストに切り取られる形でつぶれるので、入れ物の側を測る。
```

<!-- source: tests/e2e/bsky-feed-tab-dialog.spec.ts:126 -->

### [tests/e2e/bsky-feed-tab-dialog.spec.ts:126](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/bsky-feed-tab-dialog.spec.ts#L126)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// あふれた分は保存済み一覧の中でスクロールする。
```

## tests/e2e/bsky-thread.spec.ts

<!-- source: tests/e2e/bsky-thread.spec.ts:45 -->

### [tests/e2e/bsky-thread.spec.ts:45](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/bsky-thread.spec.ts#L45)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/* @vite-ignore */
```

<!-- source: tests/e2e/bsky-thread.spec.ts:46 -->

### [tests/e2e/bsky-thread.spec.ts:46](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/bsky-thread.spec.ts#L46)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/* @vite-ignore */
```

<!-- source: tests/e2e/bsky-thread.spec.ts:47 -->

### [tests/e2e/bsky-thread.spec.ts:47](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/bsky-thread.spec.ts#L47)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
/* @vite-ignore */
```

## tests/e2e/crosspost-thread.spec.ts

<!-- source: tests/e2e/crosspost-thread.spec.ts:74 -->

### [tests/e2e/crosspost-thread.spec.ts:74](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/crosspost-thread.spec.ts#L74)

分類: 検証・再現条件。対応仕様: [bluesky-integration](../../specs/bluesky-integration/spec.md#requirements)。

```text
// Bluesky のコピーが先にでき、その参照を入れて Nagi の投稿を作る。
```
