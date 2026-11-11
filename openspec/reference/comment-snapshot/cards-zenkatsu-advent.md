# 全肯定カード・ゼンカツ・アドベント・名刺：導入時コメント原文

この文書は基準コミット `24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf` に固定した履歴資料であり、現行コードの行番号一覧ではない。現在の要件は [spec.md](../../specs/cards-zenkatsu-advent/spec.md)、判断理由は [design.md](../../specs/cards-zenkatsu-advent/design.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/advent/advent.ts

<!-- source: src/lib/advent/advent.ts:3 -->

### [src/lib/advent/advent.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * アドベントカレンダー（12/1〜12/25）の表示まわりの純粋な計算。
 * 日付の区切りは AppView と同じ JST 0:00（カードの 4:00 境界ではない）。
 */
```

<!-- source: src/lib/advent/advent.ts:11 -->

### [src/lib/advent/advent.ts:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L11)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** JST の暦。 */
```

<!-- source: src/lib/advent/advent.ts:17 -->

### [src/lib/advent/advent.ts:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L17)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** その年の 12/day JST 0:00。 */
```

<!-- source: src/lib/advent/advent.ts:22 -->

### [src/lib/advent/advent.ts:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** いまの暦の年（JST）。1月のうちは前年のカレンダーを指す。 */
```

<!-- source: src/lib/advent/advent.ts:28 -->

### [src/lib/advent/advent.ts:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L28)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** メニューに出す期間。12/1 0:00 〜 1/7 いっぱい（JST）。それ以外はページだけ残す。 */
```

<!-- source: src/lib/advent/advent.ts:34 -->

### [src/lib/advent/advent.ts:34](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L34)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 公開済みの最新の日（0〜25）。 */
```

<!-- source: src/lib/advent/advent.ts:46 -->

### [src/lib/advent/advent.ts:46](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L46)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** `?day=3` の読み取り。範囲外や数字以外は無視する。 */
```

<!-- source: src/lib/advent/advent.ts:53 -->

### [src/lib/advent/advent.ts:53](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L53)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 通知の reasonUri（at://did/advent/2026-12-03）から日付を取り出す。 */
```

<!-- source: src/lib/advent/advent.ts:59 -->

### [src/lib/advent/advent.ts:59](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L59)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * ツリーの段。下から 6・5・4・4・3・2 個で 24 日、てっぺんの星が 25 日。
 * 日付は飾りを電飾でつなぐ順（段ごとに左右を折り返す）に並べる。
 */
```

<!-- source: src/lib/advent/advent.ts:64 -->

### [src/lib/advent/advent.ts:64](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L64)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 段の高さ（%）。下から。 */
```

<!-- source: src/lib/advent/advent.ts:66 -->

### [src/lib/advent/advent.ts:66](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L66)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 木の頂点と裾（%）。SVG の形と合わせる。 */
```

<!-- source: src/lib/advent/advent.ts:70 -->

### [src/lib/advent/advent.ts:70](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L70)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 星（25日）の位置。 */
```

<!-- source: src/lib/advent/advent.ts:75 -->

### [src/lib/advent/advent.ts:75](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L75)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** その高さでの木の半幅（%）。 */
```

<!-- source: src/lib/advent/advent.ts:80 -->

### [src/lib/advent/advent.ts:80](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L80)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 25 日ぶんの飾りの位置。x, y は木の箱に対する % 。 */
```

<!-- source: src/lib/advent/advent.ts:86 -->

### [src/lib/advent/advent.ts:86](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L86)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 端の飾りが枝からはみ出さないよう、半幅の 8 割に収める。
```

<!-- source: src/lib/advent/advent.ts:98 -->

### [src/lib/advent/advent.ts:98](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L98)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 電飾のパス（SVG の viewBox 0 0 100 100、preserveAspectRatio="none" 前提）。 */
```

<!-- source: src/lib/advent/advent.ts:105 -->

### [src/lib/advent/advent.ts:105](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L105)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 同じ段は少したわませ、段をまたぐところはそのまま上る。
```

<!-- source: src/lib/advent/advent.ts:121 -->

### [src/lib/advent/advent.ts:121](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L121)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * カードのリンク。OGP はこの URL から引いたカードの画像になる。
 * 英語で見ている人のシェアは、画像も英語にする（lang=en）。日本語は既定なので付けない。
 */
```

<!-- source: src/lib/advent/advent.ts:129 -->

### [src/lib/advent/advent.ts:129](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/advent.ts#L129)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** カードの持ち主（自分）のときだけ、まだ開封演出を見ていない日を古い順に。 */
```

## src/lib/advent/notice.svelte.ts

<!-- source: src/lib/advent/notice.svelte.ts:7 -->

### [src/lib/advent/notice.svelte.ts:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/notice.svelte.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * アドカレのメニューのバッジ（新しいカードが開いた）と、既読・開封済みの状態。
 *
 * 既読は AppView の preferences（adventRead）に持つ。専用の XRPC を作らないのは、
 * OAuth の権限を増やすと既存の利用者全員に再認可を求めることになるため。
 */
```

<!-- source: src/lib/advent/notice.svelte.ts:14 -->

### [src/lib/advent/notice.svelte.ts:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/notice.svelte.ts#L14)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 最後に取れたカレンダー。ページを開いたときの初回描画に使う。 */
```

<!-- source: src/lib/advent/notice.svelte.ts:43 -->

### [src/lib/advent/notice.svelte.ts:43](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/notice.svelte.ts#L43)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * ページを開いたときの既読の読み込み。開封演出を出すかどうかは、サーバーの既読を
 * 読めてから決める（読めないまま出すと、別の端末で見た手紙をもう一度開けることになる）。
 */
```

<!-- source: src/lib/advent/notice.svelte.ts:74 -->

### [src/lib/advent/notice.svelte.ts:74](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/notice.svelte.ts#L74)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 端末内では既読にしたまま。次に開いたときにもう一度送る。
```

<!-- source: src/lib/advent/notice.svelte.ts:79 -->

### [src/lib/advent/notice.svelte.ts:79](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/notice.svelte.ts#L79)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** カレンダーを画面に出した。開いている最新の日まで既読にする。 */
```

<!-- source: src/lib/advent/notice.svelte.ts:86 -->

### [src/lib/advent/notice.svelte.ts:86](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/notice.svelte.ts#L86)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 自分のカードの開封演出を見終えた。 */
```

<!-- source: src/lib/advent/notice.svelte.ts:98 -->

### [src/lib/advent/notice.svelte.ts:98](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/notice.svelte.ts#L98)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// メニューに出していない時期は、バッジのための取得もしない。
```

<!-- source: src/lib/advent/notice.svelte.ts:106 -->

### [src/lib/advent/notice.svelte.ts:106](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/notice.svelte.ts#L106)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 次の日が開いたら（0:00）取り直す。日をまたいで開きっぱなしのタブ向け。
```

<!-- source: src/lib/advent/notice.svelte.ts:112 -->

### [src/lib/advent/notice.svelte.ts:112](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/notice.svelte.ts#L112)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 取れないときはバッジを付けない（未読と断定しない）。
```

<!-- source: src/lib/advent/notice.svelte.ts:122 -->

### [src/lib/advent/notice.svelte.ts:122](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/advent/notice.svelte.ts#L122)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// タブに戻るたびに取り直すと多すぎる。カードは1日1枚なので5分あければ足りる。
```

## src/lib/card/cache.svelte.ts

<!-- source: src/lib/card/cache.svelte.ts:5 -->

### [src/lib/card/cache.svelte.ts:5](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/cache.svelte.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * did → 名刺データの遅延キャッシュ。
 *
 * タイムラインの ActorView には名刺の項目（tagline / tags / 更新日）が入っていない。
 * ホバーのたびに getProfile を叩くと同じ相手で何度も往復するので、did 単位で1回だけ
 * 取得して使い回す。件数は「ホバーした相手の数」で頭打ちなので上限は設けない。
 *
 * 言語を切り替えると tagline / tags の中身が変わるため、キーには locale も含める。
 */
```

<!-- source: src/lib/card/cache.svelte.ts:17 -->

### [src/lib/card/cache.svelte.ts:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/cache.svelte.ts#L17)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 取得中の Promise。同じ did に複数回ホバーしても往復は1回で済ませる。 */
```

<!-- source: src/lib/card/cache.svelte.ts:22 -->

### [src/lib/card/cache.svelte.ts:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/cache.svelte.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 取得済みなら即返す。ホバー直後の1フレーム目から中身を出すために使う。 */
```

<!-- source: src/lib/card/cache.svelte.ts:36 -->

### [src/lib/card/cache.svelte.ts:36](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/cache.svelte.ts#L36)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// フィードは要らないので最小件数だけ取る（プロフィール本体が目的）。
```

<!-- source: src/lib/card/cache.svelte.ts:42 -->

### [src/lib/card/cache.svelte.ts:42](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/cache.svelte.ts#L42)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 失敗はキャッシュしない。次にホバーしたときに再試行させる。
```

## src/lib/card/data.ts

<!-- source: src/lib/card/data.ts:3 -->

### [src/lib/card/data.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/data.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 名刺カード1枚を描くのに必要な、すべてのデータ。
 *
 * DOM 版（BusinessCard.svelte）と Canvas 版（render.ts）で実装が2本に分かれるので、
 * 入力だけはここに集約して両者が同じものを見るようにする。ProfileDetail をそのまま
 * 渡さないのは、ダミーデータ（fixtures.ts）でデザインを詰められるようにするため。
 */
```

<!-- source: src/lib/card/data.ts:14 -->

### [src/lib/card/data.ts:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/data.ts#L14)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** APPVIEW_URL を前置していない、生の avatar 値（相対パス or 絶対URL）。 */
```

<!-- source: src/lib/card/data.ts:16 -->

### [src/lib/card/data.ts:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/data.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** ユーザーを表すハッシュタグ（'#' は含まない）。最大3つに丸めて渡す。 */
```

<!-- source: src/lib/card/data.ts:18 -->

### [src/lib/card/data.ts:18](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/data.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** ホバーUI専用。Canvas画像や通常の名刺DOMでは描画しない興味テーマ候補。 */
```

<!-- source: src/lib/card/data.ts:20 -->

### [src/lib/card/data.ts:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/data.ts#L20)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** botたんの紹介文。名刺の主役なので必ず何か入る（欠損時は comment から詰める）。 */
```

<!-- source: src/lib/card/data.ts:22 -->

### [src/lib/card/data.ts:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/data.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** Nagi 登録日（ISO）。 */
```

<!-- source: src/lib/card/data.ts:24 -->

### [src/lib/card/data.ts:24](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/data.ts#L24)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 名刺更新日（= 分析の更新日時, ISO）。 */
```

<!-- source: src/lib/card/data.ts:26 -->

### [src/lib/card/data.ts:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/data.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** QR に載せるプロフィール URL。 */
```

<!-- source: src/lib/card/data.ts:30 -->

### [src/lib/card/data.ts:30](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/data.ts#L30)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 名刺に載せるタグの上限。これを超えると横1行に収まらない。 */
```

<!-- source: src/lib/card/data.ts:33 -->

### [src/lib/card/data.ts:33](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/data.ts#L33)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * tagline が無い相手（v1 プロンプト時代の分析のまま）では、長文コメントの頭を詰めて使う。
 * 生成される tagline の上限（120文字）に合わせる。文の途中で切れても「…」で止める。
 */
```

<!-- source: src/lib/card/data.ts:40 -->

### [src/lib/card/data.ts:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/data.ts#L40)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 改行は名刺では意味を持たないので潰す。
```

<!-- source: src/lib/card/data.ts:46 -->

### [src/lib/card/data.ts:46](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/data.ts#L46)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * プロフィールから名刺データを組み立てる。
 * 分析がまだ無い（tagline も comment も空）なら undefined を返し、呼び出し側は名刺を出さない。
 */
```

## src/lib/card/design.js

<!-- source: src/lib/card/design.js:1 -->

### [src/lib/card/design.js:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/design.js#L1)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 共有用プロフィールカード（Canvas PNG / OGP）の固定デザイン値。
 * 両レンダラーは描画APIが異なるため、座標・寸法・色だけは必ずここを正とする。
 * 保存用 PNG の寸法とそれに伴う座標は saved-design.ts で上書きする。
 */
```

<!-- source: src/lib/card/design.js:11 -->

### [src/lib/card/design.js:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/design.js#L11)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 写真に撮っても読み取れるよう、約49モジュールで1セル約4pxを確保する。 */
```

<!-- source: src/lib/card/design.js:14 -->

### [src/lib/card/design.js:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/design.js#L14)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 右下のブランドロゴとクワイエットゾーンが重ならない位置。 */
```

<!-- source: src/lib/card/design.js:21 -->

### [src/lib/card/design.js:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/design.js#L21)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 透明余白を除いた suibari_logo.png の比率（737:158）。 */
```

<!-- source: src/lib/card/design.js:29 -->

### [src/lib/card/design.js:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/design.js#L29)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** tokens.css のライトテーマ相当。共有画像は閲覧者のテーマに左右されない。 */
```

## src/lib/card/design.ts

<!-- source: src/lib/card/design.ts:1 -->

### [src/lib/card/design.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/design.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 共有用プロフィールカード（Canvas PNG / OGP）の固定デザイン値。
 * 両レンダラーは描画APIが異なるため、座標・寸法・色だけは必ずここを正とする。
 * 保存用 PNG の寸法とそれに伴う座標は saved-design.ts で上書きする。
 */
```

<!-- source: src/lib/card/design.ts:13 -->

### [src/lib/card/design.ts:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/design.ts#L13)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 写真に撮っても読み取れるよう、約49モジュールで1セル約4pxを確保する。 */
```

<!-- source: src/lib/card/design.ts:16 -->

### [src/lib/card/design.ts:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/design.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 右下のブランドロゴとクワイエットゾーンが重ならない位置。 */
```

<!-- source: src/lib/card/design.ts:24 -->

### [src/lib/card/design.ts:24](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/design.ts#L24)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 透明余白を除いた suibari_logo.png の比率（737:158）。 */
```

<!-- source: src/lib/card/design.ts:34 -->

### [src/lib/card/design.ts:34](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/design.ts#L34)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** tokens.css のライトテーマ相当。共有画像は閲覧者のテーマに左右されない。 */
```

## src/lib/card/fixtures.ts

<!-- source: src/lib/card/fixtures.ts:3 -->

### [src/lib/card/fixtures.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/fixtures.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 名刺デザインを詰めるためのダミーデータ。/dev/name-card から使う。
 *
 * 「標準的な1件」だけでは崩れる条件が見つからないので、レイアウトが壊れやすい入力を
 * 並べてある。Gemini も DB も起動せずにここだけで確認しきれるのが狙い。
 */
```

<!-- source: src/lib/card/fixtures.ts:10 -->

### [src/lib/card/fixtures.ts:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/fixtures.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * static/ にある既存画像。アバターのアスペクト比による見え方の違いを確かめるのに使う。
 * `.avatar img` は object-fit: cover なので、非正方形でも短辺を円に合わせて
 * 長辺を上下（左右）対称に切り落とす＝中身がずれることはない。それを目で確認するための材料。
 */
```

<!-- source: src/lib/card/fixtures.ts:16 -->

### [src/lib/card/fixtures.ts:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/fixtures.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 381x464。やや縦長。 */
```

<!-- source: src/lib/card/fixtures.ts:18 -->

### [src/lib/card/fixtures.ts:18](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/fixtures.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 512x512。完全な正方形。実際のユーザーアバターは AvatarCropper を通るので必ずこの形。 */
```

<!-- source: src/lib/card/fixtures.ts:20 -->

### [src/lib/card/fixtures.ts:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/fixtures.ts#L20)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 1200x630。極端な横長(1.9:1)。cover の切り取りが一番はっきり出る。 */
```

<!-- source: src/lib/card/fixtures.ts:28 -->

### [src/lib/card/fixtures.ts:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/fixtures.ts#L28)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 同一オリジンの static/ を使う（ダミーで実 PDS を叩かないため）。
	// cardFixtures() で location.origin を前置する。別オリジンのアバターで
	// canvas 汚染を確かめたいときは「実データ」モードを使うこと。
```

<!-- source: src/lib/card/fixtures.ts:66 -->

### [src/lib/card/fixtures.ts:66](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/fixtures.ts#L66)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 5行の折り返し制御と、Canvas 側の省略記号を確認する。ちょうど120文字。
```

<!-- source: src/lib/card/fixtures.ts:77 -->

### [src/lib/card/fixtures.ts:77](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/fixtures.ts#L77)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// モデルが指示を無視して長く返したときに、5行目で「…」に落ちるかを見る。
```

<!-- source: src/lib/card/fixtures.ts:175 -->

### [src/lib/card/fixtures.ts:175](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/fixtures.ts#L175)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * dev サーバーのポートは環境で変わるので、アバターと profileUrl は呼び出し時に
 * 実際のオリジンへ差し替える（QR を読んだ先が手元の dev サーバーになる）。
 */
```

<!-- source: src/lib/card/fixtures.ts:184 -->

### [src/lib/card/fixtures.ts:184](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/fixtures.ts#L184)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// '/' 始まりのままだと AppView の blob プロキシ宛と解釈されるので、
			// static/ の実体を指す絶対 URL に直す（フィクスチャごとの画像を保つ）。
```

## src/lib/card/qr.js

<!-- source: src/lib/card/qr.js:3 -->

### [src/lib/card/qr.js:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/qr.js#L3)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 中央に Nagi アイコンを重ねるぶんだけ復元力が要るので、誤り訂正は最高レベルにする。
 * これでコード面積の約30%まで欠損を許容できる。
 */
```

<!-- source: src/lib/card/qr.js:11 -->

### [src/lib/card/qr.js:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/qr.js#L11)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** Canvas版とOGP版が同じQR内容・セル寸法・クワイエットゾーンを使うための共通データ。 */
```

## src/lib/card/qr.ts

<!-- source: src/lib/card/qr.ts:4 -->

### [src/lib/card/qr.ts:4](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/qr.ts#L4)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * QR のモジュール行列。true が黒。
 *
 * QR は共有画像（render.ts の Canvas）にしか出さない。画面上ではカードを押せば
 * プロフィールへ行けるので、DOM 側に QR を置いても飾り以上の意味がない。
 */
```

<!-- source: src/lib/card/qr.ts:12 -->

### [src/lib/card/qr.ts:12](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/qr.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 中央に Nagi アイコンを重ねるぶんだけ復元力が要るので、誤り訂正は最高レベルにする。
 * これでコード面積の約30%まで欠損を許容できる。
 */
```

<!-- source: src/lib/card/qr.ts:27 -->

### [src/lib/card/qr.ts:27](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/qr.ts#L27)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** SVGのviewBoxで使える、黒モジュールをまとめたパス。 */
```

<!-- source: src/lib/card/qr.ts:31 -->

### [src/lib/card/qr.ts:31](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/qr.ts#L31)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** Canvas版とOGP版が同じQR内容・セル寸法・クワイエットゾーンを使うための共通データ。 */
```

## src/lib/card/render.ts

<!-- source: src/lib/card/render.ts:28 -->

### [src/lib/card/render.ts:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L28)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 名刺カードを PNG 画像として描く。
 *
 * nagi_client は adapter-static の完全 SPA でサーバーランタイムが無いため、画像生成は
 * ブラウザの Canvas で行う。保存・共有用 PNG は名刺（91 × 55 mm）と同じ比率の
 * 1274x770 にし、OGP 用の寸法は design.ts に保持する。
 *
 * ⚠ この関数は BusinessCard.svelte（DOM 版）と同じ見た目を手で再現している。片方だけ
 *    直すとズレるので、レイアウトを変えるときは必ず両方を直し、/dev/name-card で並べて確認すること。
 *    ただし、QR と suibari.com のブランドロゴは共有用の PNG 版にだけ描画する。
 *
 * ⚠ テーマは追従させない。共有された画像は相手のテーマで見られるので、
 *    閲覧者ごとに色が変わると「送ったものと違う絵」になる。ライト基調で固定する。
 */
```

<!-- source: src/lib/card/render.ts:55 -->

### [src/lib/card/render.ts:55](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L55)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// Web フォントの読み込み前に描くと measureText がフォールバック幅を返し、
	// 折り返し位置が実際の描画とズレる。
```

<!-- source: src/lib/card/render.ts:77 -->

### [src/lib/card/render.ts:77](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L77)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 右上から差す淡いブランドグラデーション。名刺の「表面」らしさを出すだけの飾り。
```

<!-- source: src/lib/card/render.ts:84 -->

### [src/lib/card/render.ts:84](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L84)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 左端のブランドバー。
```

<!-- source: src/lib/card/render.ts:96 -->

### [src/lib/card/render.ts:96](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L96)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * アバターを読む。AppView の blob プロキシは別オリジンなので、crossOrigin を付けないと
 * canvas が汚染されて toBlob が SecurityError になる（/api/blob には CORS が効いている）。
 * 読めなかったときは undefined を返し、DOM 版と同じイニシャル円にフォールバックする。
 */
```

<!-- source: src/lib/card/render.ts:128 -->

### [src/lib/card/render.ts:128](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L128)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// アスペクト比を保ったまま円を埋める（CSS の object-fit: cover 相当）。
```

<!-- source: src/lib/card/render.ts:137 -->

### [src/lib/card/render.ts:137](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L137)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// DOM 版の .business-card .avatar は 92px / font-size 36px。同じ比率にする。
```

<!-- source: src/lib/card/render.ts:152 -->

### [src/lib/card/render.ts:152](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L152)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** Avatar.svelte と同じフォールバック規則。 */
```

<!-- source: src/lib/card/render.ts:156 -->

### [src/lib/card/render.ts:156](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L156)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * アバター右の3行（名前・ハンドル・タグ）の縦位置。
 * DOM 版は `align-items: center` なので、こちらもアバターの中心に対して積み木ごと
 * centering する。上端揃えにすると DOM と見比べたときにズレる。
 */
```

<!-- source: src/lib/card/render.ts:193 -->

### [src/lib/card/render.ts:193](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L193)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 名前・ハンドルの下、アバターの右横に並べる。 */
```

<!-- source: src/lib/card/render.ts:207 -->

### [src/lib/card/render.ts:207](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L207)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 3つでも収まらないほど長いタグが来たら、はみ出す前に打ち切る。
```

<!-- source: src/lib/card/render.ts:219 -->

### [src/lib/card/render.ts:219](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L219)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// QR と重ならない幅で折り返す。
```

<!-- source: src/lib/card/render.ts:247 -->

### [src/lib/card/render.ts:247](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L247)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// QR の周りに白い余白（クワイエットゾーン）が無いと読み取れない。
	// 規格が要求するのは4モジュールぶんなので、px 直値ではなくセル幅から出す。
```

<!-- source: src/lib/card/render.ts:267 -->

### [src/lib/card/render.ts:267](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L267)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 隣接セルの隙間を無くすため切り上げる。
```

<!-- source: src/lib/card/render.ts:272 -->

### [src/lib/card/render.ts:272](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L272)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 中央の Nagi アイコン。誤り訂正 high なのでこの程度の欠損は復元できる。
```

<!-- source: src/lib/card/render.ts:302 -->

### [src/lib/card/render.ts:302](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L302)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** static/ 配信の画像は同一オリジンなので canvas を汚染しない。 */
```

<!-- source: src/lib/card/render.ts:314 -->

### [src/lib/card/render.ts:314](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L314)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 日本語には単語境界が無いので、CSS のような自動折り返しが使えない。
 * 空白があれば単語単位、無ければ1文字ずつ詰めて幅で折る。
 */
```

<!-- source: src/lib/card/render.ts:333 -->

### [src/lib/card/render.ts:333](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L333)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 最終行に到達。入るところまで入れて省略記号で締める。
```

<!-- source: src/lib/card/render.ts:344 -->

### [src/lib/card/render.ts:344](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L344)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 幅に収まらなければ末尾を削って「…」を付ける。 */
```

<!-- source: src/lib/card/render.ts:373 -->

### [src/lib/card/render.ts:373](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L373)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 画像の色はテーマ非追従で固定するが、日付と文言は作った本人の言語に合わせる
// （名刺を書き出すのは常に閲覧者自身なので、その人の読める表記が正しい）。
```

<!-- source: src/lib/card/render.ts:385 -->

### [src/lib/card/render.ts:385](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/render.ts#L385)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// アバターの CORS 設定が外れると toBlob が null を返す（canvas 汚染）。
			// 静かに握り潰すと「保存を押しても何も起きない」になるので必ず投げる。
```

## src/lib/card/saved-design.ts

<!-- source: src/lib/card/saved-design.ts:1 -->

### [src/lib/card/saved-design.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/saved-design.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 保存・共有用 PNG は日本の一般的な名刺（91 × 55 mm）と同じ比率にする。 */
```

<!-- source: src/lib/card/saved-design.ts:6 -->

### [src/lib/card/saved-design.ts:6](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/card/saved-design.ts#L6)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 1 mm あたり14px。整数寸法のまま 91:55 の比率を保つ。
```

## src/lib/cards/anniversary-reward.svelte.ts

<!-- source: src/lib/cards/anniversary-reward.svelte.ts:6 -->

### [src/lib/cards/anniversary-reward.svelte.ts:6](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/anniversary-reward.svelte.ts#L6)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 記念日カードの受け取り。ガチャと違って本人の操作を待たず、記念日にログインした時点で
 * 自動的に受け取ってモーダルを開く（記念日は1日しか来ないので、気づかず終わるのが一番惜しい）。
 *
 * 同じ日に複数の記念日が重なる（ハロウィン + ユーザー記念日など）ことがあるので、
 * 受け取ったぶんはキューに積んで**1枚ずつ順番に**出す。モーダルを重ねない方針は
 * ReactionCardRewardHost と同じ。
 */
```

<!-- source: src/lib/cards/anniversary-reward.svelte.ts:15 -->

### [src/lib/cards/anniversary-reward.svelte.ts:15](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/anniversary-reward.svelte.ts#L15)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** いま開いているカード。undefined なら何も出していない。 */
```

<!-- source: src/lib/cards/anniversary-reward.svelte.ts:19 -->

### [src/lib/cards/anniversary-reward.svelte.ts:19](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/anniversary-reward.svelte.ts#L19)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** まだ見せていないぶん。current を閉じるとここから次を出す。 */
```

<!-- source: src/lib/cards/anniversary-reward.svelte.ts:22 -->

### [src/lib/cards/anniversary-reward.svelte.ts:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/anniversary-reward.svelte.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 受け取り済みの記念日の並び。真偽値ではなく中身で覚えるのは、JST 4:00 をまたいで
	 * 別の記念日が現れたときにもう一度受け取れるようにするため（アプリを開きっぱなしの人がいる）。
	 */
```

<!-- source: src/lib/cards/anniversary-reward.svelte.ts:44 -->

### [src/lib/cards/anniversary-reward.svelte.ts:44](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/anniversary-reward.svelte.ts#L44)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 背景画像を先に読み込ませる。記念日モーダルは一発勝負の演出なので、
	 * 画像が間に合わないと文字だけのカードがめくれてしまう。
	 */
```

<!-- source: src/lib/cards/anniversary-reward.svelte.ts:53 -->

### [src/lib/cards/anniversary-reward.svelte.ts:53](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/anniversary-reward.svelte.ts#L53)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 未受領ぶんをまとめて受け取る。サーバは冪等なので二重送信でも増えないが、
	 * モーダルが二度開くのは事故なので #claimed でも止める。
	 */
```

<!-- source: src/lib/cards/anniversary-reward.svelte.ts:67 -->

### [src/lib/cards/anniversary-reward.svelte.ts:67](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/anniversary-reward.svelte.ts#L67)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 既に受け取り済みだった（別タブなど）ときは、もう一度祝い直さない。
```

<!-- source: src/lib/cards/anniversary-reward.svelte.ts:73 -->

### [src/lib/cards/anniversary-reward.svelte.ts:73](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/anniversary-reward.svelte.ts#L73)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 失敗したら次のポーリングでやり直せるようにする。pendingAnniversary は
			// サーバ側に残っているので、取りこぼしにはならない。
```

<!-- source: src/lib/cards/anniversary-reward.svelte.ts:82 -->

### [src/lib/cards/anniversary-reward.svelte.ts:82](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/anniversary-reward.svelte.ts#L82)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 表示中のカードを閉じ、残りがあれば次を出す。 */
```

## src/lib/cards/bot-actor.ts

<!-- source: src/lib/cards/bot-actor.ts:4 -->

### [src/lib/cards/bot-actor.ts:4](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/bot-actor.ts#L4)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// フィードと同じアカウント情報を使い、複数の総評間で取得を共有する。
```

## src/lib/cards/bot-sprites.test.ts

<!-- source: src/lib/cards/bot-sprites.test.ts:4 -->

### [src/lib/cards/bot-sprites.test.ts:4](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/bot-sprites.test.ts#L4)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * botたんの立ち絵は、表情を差し替えても**寸法が変わってはいけない**。
 *
 * 以前は sitting が 228x320、petted が 384x384 で、同じ CSS 幅を当てると
 * 切り替えた瞬間にキャラが縮み、接地位置も跳ねていた。2枚は同じキャンバスに
 * 同じ足元位置で描いてある前提なので、その前提が崩れたらここで落とす。
 */
```

<!-- source: src/lib/cards/bot-sprites.test.ts:13 -->

### [src/lib/cards/bot-sprites.test.ts:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/bot-sprites.test.ts#L13)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** PNG の IHDR から幅と高さを読む（デコード不要）。 */
```

## src/lib/cards/celebration.ts

<!-- source: src/lib/cards/celebration.ts:8 -->

### [src/lib/cards/celebration.ts:8](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/celebration.ts#L8)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** カード裏を見せて期待を溜める時間。 */
```

<!-- source: src/lib/cards/celebration.ts:10 -->

### [src/lib/cards/celebration.ts:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/celebration.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** タメ中に順番に通過する演出色。 */
```

<!-- source: src/lib/cards/celebration.ts:12 -->

### [src/lib/cards/celebration.ts:12](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/celebration.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 1色ぶんを見せる時間。Nは昇格色を持たないので0。 */
```

<!-- source: src/lib/cards/celebration.ts:14 -->

### [src/lib/cards/celebration.ts:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/celebration.ts#L14)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** Vibration API に渡す「振動、休止、振動…」のミリ秒列。 */
```

<!-- source: src/lib/cards/celebration.ts:19 -->

### [src/lib/cards/celebration.ts:19](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/celebration.ts#L19)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 抽選開始から公開の瞬間まで、約0.5秒ごとに強くなる鼓動を作る。
 * 最後の振動が chargeMs ちょうどで終わるため、長い演出でも途中で途切れない。
 */
```

<!-- source: src/lib/cards/celebration.ts:48 -->

### [src/lib/cards/celebration.ts:48](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/celebration.ts#L48)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 抽選演出のレアリティ別契約。
 * 強さの調整箇所をダイアログのタイマー・CSS・振動処理へ分散させない。
 */
```

<!-- source: src/lib/cards/celebration.ts:82 -->

### [src/lib/cards/celebration.ts:82](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/celebration.ts#L82)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 4色×2秒の昇格後、CRT収束と完全暗転に2.5秒を使う。
```

<!-- source: src/lib/cards/celebration.ts:95 -->

### [src/lib/cards/celebration.ts:95](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/celebration.ts#L95)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 1枚引く直前の所持数から、今回初めて越えた10%刻みの節目を返す。
 * 冪等な当日再取得や重複カードでは、お祝いを再発火させない。
 */
```

<!-- source: src/lib/cards/celebration.ts:125 -->

### [src/lib/cards/celebration.ts:125](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/celebration.ts#L125)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** Nは追加演出なし。R以上はレア度ごとの粒量を Confetti 側で段階化する。 */
```

## src/lib/cards/collection.svelte.ts

<!-- source: src/lib/cards/collection.svelte.ts:9 -->

### [src/lib/cards/collection.svelte.ts:9](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L9)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 直近の取得が失敗したか。文言は表示側が決めるので、ここは事実だけ持つ。 */
```

<!-- source: src/lib/cards/collection.svelte.ts:11 -->

### [src/lib/cards/collection.svelte.ts:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L11)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 失敗の理由。空なら表示側の既定文言を使う。 */
```

<!-- source: src/lib/cards/collection.svelte.ts:13 -->

### [src/lib/cards/collection.svelte.ts:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L13)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 最後に取得できた時刻。refreshSelfIfStale の間引きに使う。 */
```

<!-- source: src/lib/cards/collection.svelte.ts:15 -->

### [src/lib/cards/collection.svelte.ts:15](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L15)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * コレクション未取得のまま引いたときの drawStatus。空の view をでっち上げると
	 * ensure() が「取得済み」と誤認して図鑑が 0枚のまま固まるので、別枠で持つ。
	 */
```

<!-- source: src/lib/cards/collection.svelte.ts:22 -->

### [src/lib/cards/collection.svelte.ts:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** どちらかの取得枠が残っている間の再取得の下限間隔。 */
```

<!-- source: src/lib/cards/collection.svelte.ts:25 -->

### [src/lib/cards/collection.svelte.ts:25](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L25)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 全肯定カードのコレクションを DID 単位で共有する。TOP の FAB（drawStatus だけ要る）と
 * プロフィールのカードタブ（図鑑ぜんぶ要る）が同じ getCards の結果を見るためのもので、
 * これが無いと同じ 30 枚を二重に取りに行き、しかも「TOP で引いたのにカードタブでは
 * まだ引けることになっている」というズレが出る。
 *
 * drawStatus は viewer === actor のときしか付いてこないので、セッションが変わったら
 * 全部捨てる（他人のぶんも viewer 依存の情報を含みうるので部分的に残さない）。
 */
```

<!-- source: src/lib/cards/collection.svelte.ts:36 -->

### [src/lib/cards/collection.svelte.ts:36](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L36)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * $state にしておく。OAuth の復元はレイアウトの初回描画より遅れて終わるので、普通のフィールドだと
	 * その前に評価した $derived / $effect（ナビの未ドロー点など）が自分の DID を追跡できず、止まったままになる。
	 */
```

<!-- source: src/lib/cards/collection.svelte.ts:58 -->

### [src/lib/cards/collection.svelte.ts:58](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L58)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 自分の本日のドロー状況。未取得のうちは undefined。 */
```

<!-- source: src/lib/cards/collection.svelte.ts:64 -->

### [src/lib/cards/collection.svelte.ts:64](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L64)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * FAB の表示条件。「取得済み」かつ「引ける」ときだけ true にする（fail closed）。
	 * 未取得や、権限切れで公開フォールバックに落ちて drawStatus が消えた場合は出さない。
	 * どのみちその状態では drawCard()（auth 必須）も通らないので、出しても押せない。
	 */
```

<!-- source: src/lib/cards/collection.svelte.ts:73 -->

### [src/lib/cards/collection.svelte.ts:73](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L73)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 新AppViewの状態が確認できた場合だけ有効にする（旧応答ではfail closed）。 */
```

<!-- source: src/lib/cards/collection.svelte.ts:77 -->

### [src/lib/cards/collection.svelte.ts:77](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L77)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 本日ぶんの未受領の記念日。自動モーダルの発火条件そのものなので、コレクションを
	 * 取得できていないうちは空にしておく（fail closed。どのみち受け取り API も通らない）。
	 */
```

<!-- source: src/lib/cards/collection.svelte.ts:85 -->

### [src/lib/cards/collection.svelte.ts:85](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L85)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 既存呼び出しとの互換名。通常のmy Nagi枠を指す。 */
```

<!-- source: src/lib/cards/collection.svelte.ts:102 -->

### [src/lib/cards/collection.svelte.ts:102](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L102)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 未取得なら取る。取得済み・取得中なら何もしない。 */
```

<!-- source: src/lib/cards/collection.svelte.ts:110 -->

### [src/lib/cards/collection.svelte.ts:110](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L110)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 明示的に取り直す。 */
```

<!-- source: src/lib/cards/collection.svelte.ts:116 -->

### [src/lib/cards/collection.svelte.ts:116](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L116)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 自分のぶんだけ、必要なときに取り直す。復帰のたびに叩かないよう条件を絞る。
	 * - 未取得 → 取る
	 * - どちらかの枠を引ける状態で 60 秒以上経っている → 取る（別タブで引いた場合を拾う）
	 * - 引けない状態で nextDrawAt を過ぎた → 取る（JST 4:00 の境界をまたいだ）
	 */
```

<!-- source: src/lib/cards/collection.svelte.ts:148 -->

### [src/lib/cards/collection.svelte.ts:148](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L148)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 図鑑は本人認証の PDS を待たずに表示する。再取得中のドロー状態は保持する。
```

<!-- source: src/lib/cards/collection.svelte.ts:177 -->

### [src/lib/cards/collection.svelte.ts:177](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L177)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 直近で控えを書き損ねたぶんを拾い直す。待たずに投げる。
```

<!-- source: src/lib/cards/collection.svelte.ts:196 -->

### [src/lib/cards/collection.svelte.ts:196](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L196)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * ドロー結果を反映する。通常枠とリアクション枠を含むdrawStatusを丸ごと同期する。
	 * コレクション未取得のまま TOP で引いたときも、drawStatus だけは持っておく。
	 */
```

<!-- source: src/lib/cards/collection.svelte.ts:202 -->

### [src/lib/cards/collection.svelte.ts:202](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L202)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 引いたことを本人の PDS へ控える。リアクションの subject に要るのと、ニュースに出すため。
		// 所持そのものは AppView が権威なので、失敗しても手札は減らない。次に開いたときに拾う。
```

<!-- source: src/lib/cards/collection.svelte.ts:209 -->

### [src/lib/cards/collection.svelte.ts:209](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L209)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * ドローの控えを PDS へ書く。**所持の権威ではない**ので、失敗しても握り潰してよい。
	 * 記念日は同じ日に複数ありうるので、受け取った枚数ぶん書く。
	 */
```

<!-- source: src/lib/cards/collection.svelte.ts:224 -->

### [src/lib/cards/collection.svelte.ts:224](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L224)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 次に getCards したときの unmirroredDraws が拾う（直近2日だけ）。
```

<!-- source: src/lib/cards/collection.svelte.ts:229 -->

### [src/lib/cards/collection.svelte.ts:229](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L229)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * カード 1 枚を差し替える（botたんコメントが後から届いたときにも使う）。
	 * 並びは AppView が返した順のまま。図鑑の升目が動くと「どこが空いているか」が
	 * 毎回変わってしまうので、ここで並べ替えは絶対にしない。
	 */
```

<!-- source: src/lib/cards/collection.svelte.ts:237 -->

### [src/lib/cards/collection.svelte.ts:237](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L237)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 記念日カードは図鑑の升目を持たない別枠。cards 側に混ぜると ownedCount が動いて
		// コンプ率が変わってしまうので、必ずこちらに入れる。
```

<!-- source: src/lib/cards/collection.svelte.ts:264 -->

### [src/lib/cards/collection.svelte.ts:264](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/collection.svelte.ts#L264)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 記念日カードを受け取ったあとの反映。受け取った枚数ぶんを足したうえで、
	 * pendingAnniversary を空にして自動モーダルの再発火を止める
	 * （サーバも冪等だが、次の getCards まで待つとモーダルが二度出る）。
	 */
```

## src/lib/cards/draw-notice.svelte.ts

<!-- source: src/lib/cards/draw-notice.svelte.ts:5 -->

### [src/lib/cards/draw-notice.svelte.ts:5](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/draw-notice.svelte.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 今日の一枚（my Nagi 枠）がまだ引けるときに 1。ナビの「カードゲーム」に点を出すのに使う。
 * ゼンカツの「未プレイ」とは別の知らせなので、ストアも分けて持つ。
 * 取得は AnniversaryCardHost の ensure() に任せ、ここは日付境界をまたいだ取り直しだけを受け持つ
 * （カードの入口をフィードから外したので、そこにあった5分ポーリングをこちらへ移した）。
 */
```

## src/lib/cards/guest-draw.svelte.ts

<!-- source: src/lib/cards/guest-draw.svelte.ts:79 -->

### [src/lib/cards/guest-draw.svelte.ts:79](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/guest-draw.svelte.ts#L79)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** サインイン後、同日の通常枠へ同じカードを移す。成功するまでローカル結果は消さない。 */
```

## src/lib/cards/reaction-reward.svelte.ts

<!-- source: src/lib/cards/reaction-reward.svelte.ts:34 -->

### [src/lib/cards/reaction-reward.svelte.ts:34](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/reaction-reward.svelte.ts#L34)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 連続リアクションでも最初の取得結果を上書きしないよう、サーバ呼び出しを直列化する。
```

<!-- source: src/lib/cards/reaction-reward.svelte.ts:48 -->

### [src/lib/cards/reaction-reward.svelte.ts:48](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/reaction-reward.svelte.ts#L48)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 2枚目以降のリアクションでは、取得済みカードを何度も開かない。
```

## src/lib/cards/share-board.test.ts

<!-- source: src/lib/cards/share-board.test.ts:19 -->

### [src/lib/cards/share-board.test.ts:19](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/share-board.test.ts#L19)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 60枚でも10秒以内に流し終える。
```

## src/lib/cards/share-board.ts

<!-- source: src/lib/cards/share-board.ts:3 -->

### [src/lib/cards/share-board.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/share-board.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 吸い込み演出の1枚ぶん。 */
```

<!-- source: src/lib/cards/share-board.ts:8 -->

### [src/lib/cards/share-board.ts:8](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/share-board.ts#L8)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** この1枚が着いたときに足す Ƶ。 */
```

<!-- source: src/lib/cards/share-board.ts:10 -->

### [src/lib/cards/share-board.ts:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/share-board.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 演出の開始からの遅れ。 */
```

<!-- source: src/lib/cards/share-board.ts:17 -->

### [src/lib/cards/share-board.ts:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/share-board.ts#L17)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 1枚ごとに間隔を縮める割合。最初はゆっくり、だんだん加速する。 */
```

<!-- source: src/lib/cards/share-board.ts:19 -->

### [src/lib/cards/share-board.ts:19](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/share-board.ts#L19)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 飛ぶ時間。レアほど少しだけ長く見せる。 */
```

<!-- source: src/lib/cards/share-board.ts:28 -->

### [src/lib/cards/share-board.ts:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/share-board.ts#L28)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * 置いたカードを1枚ずつに展開して、飛ばす順と時刻を決める。
 * 枚数が多いと何十秒も待たせることになるので、間隔を等比で縮めて最後は一気に流す。
 */
```

<!-- source: src/lib/cards/share-board.ts:54 -->

### [src/lib/cards/share-board.ts:54](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/share-board.ts#L54)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 1枚が Ƶ 欄に着いたときの振動。N は軽く、SR 以上ははっきり分かるように。 */
```

<!-- source: src/lib/cards/share-board.ts:70 -->

### [src/lib/cards/share-board.ts:70](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/cards/share-board.ts#L70)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * ヘルプに出すレート。AppView の ZENNY_PER_CARD / CARD_SHELF_AAR_PRICE（shared-configs）の写し。
 * 値はボードの price / zenny が正で、ここは説明にしか使わない。
 */
```

## src/lib/components/ActorHoverCard.svelte

<!-- source: src/lib/components/ActorHoverCard.svelte:6 -->

### [src/lib/components/ActorHoverCard.svelte:6](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ActorHoverCard.svelte#L6)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * アバターホバーで出る名刺ポップオーバー。
	 *
	 * 位置決めは ReactionBar.svelte の絵文字ピッカーと同じく anchor の
	 * getBoundingClientRect() から。position: fixed なのでスクロール量の補正は要らない。
	 */
```

<!-- source: src/lib/components/ActorHoverCard.svelte:20 -->

### [src/lib/components/ActorHoverCard.svelte:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ActorHoverCard.svelte#L20)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** カード自体にマウスが乗ったら閉じるのを止める（ヒステリシス）。 */
```

<!-- source: src/lib/components/ActorHoverCard.svelte:25 -->

### [src/lib/components/ActorHoverCard.svelte:25](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ActorHoverCard.svelte#L25)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// モーダルの top layer 内にも表示できるよう、起点と同じダイアログへ置く。
```

<!-- source: src/lib/components/ActorHoverCard.svelte:46 -->

### [src/lib/components/ActorHoverCard.svelte:46](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ActorHoverCard.svelte#L46)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 下に出すのが基本。はみ出すならアバターの上へ反転する。
```

<!-- source: src/lib/components/ActorHoverCard.svelte:53 -->

### [src/lib/components/ActorHoverCard.svelte:53](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ActorHoverCard.svelte#L53)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// アバターの左端に合わせ、右にはみ出すぶんだけ引き戻す。
```

<!-- source: src/lib/components/ActorHoverCard.svelte:61 -->

### [src/lib/components/ActorHoverCard.svelte:61](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ActorHoverCard.svelte#L61)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// カードの実寸・画面・祖先スクロールの変化に追従する。
```

## src/lib/components/AdventCalendar.svelte

<!-- source: src/lib/components/AdventCalendar.svelte:9 -->

### [src/lib/components/AdventCalendar.svelte:9](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventCalendar.svelte#L9)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * アドカレの本体。データの取り方（本番の AppView / 開発用のモック）から切り離してある。
	 *
	 * openedDays が null のあいだは、開封演出を出すかどうかを決めない（既読の読み込み待ち）。
	 */
```

<!-- source: src/lib/components/AdventCalendar.svelte:25 -->

### [src/lib/components/AdventCalendar.svelte:25](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventCalendar.svelte#L25)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** `?day=N` で開いたときのカード。 */
```

<!-- source: src/lib/components/AdventCalendar.svelte:27 -->

### [src/lib/components/AdventCalendar.svelte:27](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventCalendar.svelte#L27)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 開封演出を見終えた（または飛ばした）自分のカードの日。 */
```

<!-- source: src/lib/components/AdventCalendar.svelte:29 -->

### [src/lib/components/AdventCalendar.svelte:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventCalendar.svelte#L29)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 拡大表示の日が変わった（URL の ?day= を合わせる）。 */
```

<!-- source: src/lib/components/AdventCalendar.svelte:36 -->

### [src/lib/components/AdventCalendar.svelte:36](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventCalendar.svelte#L36)

分類: ツール指示（削除対象外）。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// svelte-ignore state_referenced_locally
```

<!-- source: src/lib/components/AdventCalendar.svelte:47 -->

### [src/lib/components/AdventCalendar.svelte:47](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventCalendar.svelte#L47)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 何枚も溜まっていたら、いちばん新しい1枚だけ手紙で開ける（毎回開け続けさせない）。
```

## src/lib/components/AdventCard.svelte

<!-- source: src/lib/components/AdventCard.svelte:6 -->

### [src/lib/components/AdventCard.svelte:6](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventCard.svelte#L6)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * アドカレのクリスマスカードの表面。Make it a Quote のように、左にアバター写真、
	 * 右に見出しと botたんの一言。共有用の PNG（api/advent-card.tsx）と同じ構図にしてある。
	 *
	 * 文字は cqw で指定し、カードの幅に合わせて画像のように拡大縮小させる。
	 */
```

<!-- source: src/lib/components/AdventCard.svelte:56 -->

### [src/lib/components/AdventCard.svelte:56](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventCard.svelte#L56)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 金の縁は写真より手前に重ねる（写真が左端まで敷かれるため）。 */
```

<!-- source: src/lib/components/AdventCard.svelte:73 -->

### [src/lib/components/AdventCard.svelte:73](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventCard.svelte#L73)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 写真の右端をカードの地へ溶かす。 */
```

<!-- source: src/lib/components/AdventCard.svelte:132 -->

### [src/lib/components/AdventCard.svelte:132](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventCard.svelte#L132)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 右下の botたんに重ならない幅。 */
```

## src/lib/components/AdventCardDialog.svelte

<!-- source: src/lib/components/AdventCardDialog.svelte:18 -->

### [src/lib/components/AdventCardDialog.svelte:18](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventCardDialog.svelte#L18)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** カードの拡大表示。リンク（OGP はこのカードの画像）を Nagi / Bluesky へシェアできる。 */
```

<!-- source: src/lib/components/AdventCardDialog.svelte:26 -->

### [src/lib/components/AdventCardDialog.svelte:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventCardDialog.svelte#L26)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 手紙の開封演出から来たとき。カードが下から浮かび上がる動きを省く。 */
```

<!-- source: src/lib/components/AdventCardDialog.svelte:101 -->

### [src/lib/components/AdventCardDialog.svelte:101](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventCardDialog.svelte#L101)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- スマホ幅ではカードの文字が小さくなるので、読める大きさでも添える。 -->
```

## src/lib/components/AdventLetter.svelte

<!-- source: src/lib/components/AdventLetter.svelte:8 -->

### [src/lib/components/AdventLetter.svelte:8](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventLetter.svelte#L8)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 自分が選ばれたカードを、手紙を開ける演出で見せる（1枚につき1回だけ）。
	 * 封筒が届く → ふたが開く → カードが出てくる → onfinish でカードの拡大表示へ。
	 * 動きを減らす設定のときは演出を飛ばしてすぐ拡大表示へ進む。
	 */
```

<!-- source: src/lib/components/AdventLetter.svelte:30 -->

### [src/lib/components/AdventLetter.svelte:30](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventLetter.svelte#L30)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 押さなくても少し待てば開く。
```

<!-- source: src/lib/components/AdventLetter.svelte:127 -->

### [src/lib/components/AdventLetter.svelte:127](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventLetter.svelte#L127)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 前のポケット。左右と下から三角を合わせた形で、カードの下半分を隠す。 */
```

## src/lib/components/AdventTree.svelte

<!-- source: src/lib/components/AdventTree.svelte:13 -->

### [src/lib/components/AdventTree.svelte:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventTree.svelte#L13)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 大きなクリスマスツリー。下から 1 日、てっぺんの星が 25 日。
	 * 開いた日の飾りには選ばれた人のアバターが入り、押すとカードが開く。
	 */
```

<!-- source: src/lib/components/AdventTree.svelte:33 -->

### [src/lib/components/AdventTree.svelte:33](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventTree.svelte#L33)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 枝の層。上から重ねて、裾の広いもみの木にする。 */
```

<!-- source: src/lib/components/AdventTree.svelte:42 -->

### [src/lib/components/AdventTree.svelte:42](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AdventTree.svelte#L42)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 裾を少し波打たせて、ただの三角にしない。
```

## src/lib/components/AffirmationCard.svelte

<!-- source: src/lib/components/AffirmationCard.svelte:12 -->

### [src/lib/components/AffirmationCard.svelte:12](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L12)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** grid = コレクション一覧、full = ドロー演出や詳細で1枚だけ大きく出すとき。 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:14 -->

### [src/lib/components/AffirmationCard.svelte:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L14)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** ゲストが今引いた1枚など、所持化前でも表面を見せる表示専用フラグ。 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:16 -->

### [src/lib/components/AffirmationCard.svelte:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L16)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** ゼンカツのお題と一致する属性を、カード面で示す。 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:20 -->

### [src/lib/components/AffirmationCard.svelte:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L20)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 属性は絵文字1つで表す（イラスト枠を持たない構成なので、ここが唯一の絵柄）。 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:29 -->

### [src/lib/components/AffirmationCard.svelte:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L29)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * カード面のレアリティ表記。ロケールに関わらず英語で統一する（トレカの表記慣習に寄せる）。
	 * 内部の識別子は短縮形（N/R/SR/UR/AAR）のままで、ここは表示専用。
	 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:53 -->

### [src/lib/components/AffirmationCard.svelte:53](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L53)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 知らない属性のカードでも描画を止めない（アイコンと同じく空で出す）。
```

<!-- source: src/lib/components/AffirmationCard.svelte:55 -->

### [src/lib/components/AffirmationCard.svelte:55](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L55)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 図鑑番号。段内の通し番号がそのままコレクションでの配置位置なので、
	 * この番号を見れば「何番目の枠のカードか」が分かる。
	 * レアリティは枠のデザインと配置位置で示すので、カード面には出さない。
	 *
	 * 記念日カードは図鑑の枠を持たず、id には西暦*100+slot が入っていて番号として読めない。
	 * 代わりに「何年ぶんの1枚か」を出す（同じ記念日でも年が違えば別のカード）。
	 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:68 -->

### [src/lib/components/AffirmationCard.svelte:68](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L68)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 未所持カードでは背景を出さない。何のカードかを伏せる演出のほうが優先。
```

<!-- source: src/lib/components/AffirmationCard.svelte:80 -->

### [src/lib/components/AffirmationCard.svelte:80](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L80)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!--
			背景は background-image ではなく img で敷く。記念日カードのモーダルは一発勝負の
			演出なので、読み込みを eager に指定できるほうが確実。装飾なので alt は空。
		-->
```

<!-- source: src/lib/components/AffirmationCard.svelte:125 -->

### [src/lib/components/AffirmationCard.svelte:125](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L125)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 未所持。枠と番号は見せて「どこが空いているか」を分からせ、中身は伏せる。 -->
```

<!-- source: src/lib/components/AffirmationCard.svelte:141 -->

### [src/lib/components/AffirmationCard.svelte:141](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L141)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 遊戯王リスペクトの縦長。イラスト枠が無いぶんフレーバーに面積を割く。 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:156 -->

### [src/lib/components/AffirmationCard.svelte:156](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L156)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 背景つきカード。イラスト枠を持たない構成のまま、絵をカード全面に敷いて文字を上に乗せる。
	 *
	 * ここで一番大事なのは「絵が見える面積を確保する」こと。フレーバー欄は元々 flex:1 で
	 * カードの中央から下を丸ごと占有していて、そのままだとキャラの顔が完全に隠れる。
	 * 背景があるときだけ内容ぶんの高さに縮めて下端へ寄せ、中央を絵のために空ける。
	 * 濃さと位置のノブは tokens.css に集約する（絵ごとに最適値が変わるため）。
	 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:164 -->

### [src/lib/components/AffirmationCard.svelte:164](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L164)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 絵はカードいっぱいに敷く。ずらして置くと必ずどこかに地の色の帯ができるので、
	 * inset は 0 に固定する。絵の中の「どこを見せるか」を寄せたいときは、
	 * カード比（59:86）より縦長の画像を用意して --card-art-position で選ぶ
	 * （cover が溢れたぶんを切るので、この方法なら隙間が出ない）。
	 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:179 -->

### [src/lib/components/AffirmationCard.svelte:179](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L179)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 図鑑の升目は文字が小さく、絵をそのまま出すと名前もフレーバーも潰れる。 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:195 -->

### [src/lib/components/AffirmationCard.svelte:195](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L195)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 背景の上に文字を出す。z-index を持たない子は絵に隠れてしまう。 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:200 -->

### [src/lib/components/AffirmationCard.svelte:200](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L200)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 中央を絵に明け渡す。margin-block-start:auto でフレーバーと ATK/DEF を下端へ寄せ、
	 * flex:1 を外して内容ぶんの高さにする（元の版はここが伸びて絵を全部覆っていた）。
	 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:210 -->

### [src/lib/components/AffirmationCard.svelte:210](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L210)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 帯の下地を薄くしたぶん、名前と数値は縁取りで背景から浮かせる。 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:274 -->

### [src/lib/components/AffirmationCard.svelte:274](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L274)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 種族名が長いときはこちらを削る（レアリティ表記は省略させない）。 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:283 -->

### [src/lib/components/AffirmationCard.svelte:283](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L283)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * レアリティ表記。枠のデザインと同じ色にして、文字と枠の対応が一目で付くようにする。
	 * "All-Affirmation Rare" が最長なので、狭い升目では折り返させる（省略はしない）。
	 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:327 -->

### [src/lib/components/AffirmationCard.svelte:327](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L327)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 同種を引き直した回数。世界に1枚という建て付けなので枚数ではなく「重ねた回数」。 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:340 -->

### [src/lib/components/AffirmationCard.svelte:340](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L340)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* --- 属性ごとのアイコン色 --- */
```

<!-- source: src/lib/components/AffirmationCard.svelte:360 -->

### [src/lib/components/AffirmationCard.svelte:360](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L360)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* --- レアリティ演出。N は無地、上がるほど枠が主張する --- */
```

<!-- source: src/lib/components/AffirmationCard.svelte:388 -->

### [src/lib/components/AffirmationCard.svelte:388](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L388)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * UR / AAR は箔押し。border-image は角丸に追従しないので、2枚重ねの background で
	 * 枠だけグラデーションにする（padding-box に本体色、border-box に箔）。
	 * container-type がスタッキングコンテキストを作るので、疑似要素を z-index:-1 で
	 * 敷く方法は使えない。
	 */
```

<!-- source: src/lib/components/AffirmationCard.svelte:454 -->

### [src/lib/components/AffirmationCard.svelte:454](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AffirmationCard.svelte#L454)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* --- 未所持 --- */
```

## src/lib/components/AnniversaryCardHost.svelte

<!-- source: src/lib/components/AnniversaryCardHost.svelte:11 -->

### [src/lib/components/AnniversaryCardHost.svelte:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AnniversaryCardHost.svelte#L11)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 「どの記念日か」で受け取り済みを覚える。ブール1個で覚えると、アプリを開いたまま
	 * JST 4:00 をまたいで別の記念日が現れたときに二度と受け取れなくなる。
	 */
```

<!-- source: src/lib/components/AnniversaryCardHost.svelte:22 -->

### [src/lib/components/AnniversaryCardHost.svelte:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AnniversaryCardHost.svelte#L22)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// コレクションを持っていないと pendingAnniversary が分からないので、まずそれを取る。
	// CardDrawEntry と同じ共有ストアなので、両方あっても取得は1回で済む。
```

<!-- source: src/lib/components/AnniversaryCardHost.svelte:28 -->

### [src/lib/components/AnniversaryCardHost.svelte:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AnniversaryCardHost.svelte#L28)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 受け取りは pending を見て自動で走らせる。DID を覚えて1回だけ、という形にしないのは、
	 * CardDrawEntry の5分ポーリング（refreshSelfIfStale）が日付境界をまたいで取り直したとき、
	 * その結果をそのまま拾いたいから。
	 */
```

<!-- source: src/lib/components/AnniversaryCardHost.svelte:40 -->

### [src/lib/components/AnniversaryCardHost.svelte:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AnniversaryCardHost.svelte#L40)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 記念日カードは抽選ではないので DrawCardResult を持っていないが、CardDetailDialog の
	 * 演出（裏→表のフリップ、NEW CARD、コンフェッティ）はこの型で駆動している。
	 * 受け取り＝常に新規なので、その形に組み直して渡す。
	 */
```

<!-- source: src/lib/components/AnniversaryCardHost.svelte:50 -->

### [src/lib/components/AnniversaryCardHost.svelte:50](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AnniversaryCardHost.svelte#L50)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 控えの書き込みはこの経路を通らない（claim 側で済んでいる）ので、
					// 演出のためだけに型を満たす。
```

## src/lib/components/BusinessCard.svelte

<!-- source: src/lib/components/BusinessCard.svelte:7 -->

### [src/lib/components/BusinessCard.svelte:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCard.svelte#L7)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 名刺カードの DOM 表現。
	 *
	 * ⚠ 見た目は $lib/card/render.ts（Canvas 版・共有画像用）と対になっている。
	 *    レイアウトを変えるときは必ず両方直し、/dev/name-card で並べて確認すること。
	 *    意図的な差は3つだけ:
	 *      - こちらはテーマ追従、あちらはライト固定
	 *      - QR はこちらには出さない。画面上ではカードを押せばプロフィールへ行けるので、
	 *        QR は「画像として配られた先」でしか意味を持たない。
	 *      - suibari.com のブランドロゴは共有用の PNG にだけ出す。
	 */
```

<!-- source: src/lib/components/BusinessCard.svelte:26 -->

### [src/lib/components/BusinessCard.svelte:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCard.svelte#L26)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** compact はプロフィールヘッダーとホバーカード用。full は拡大モーダル用。 */
```

<!-- source: src/lib/components/BusinessCard.svelte:28 -->

### [src/lib/components/BusinessCard.svelte:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCard.svelte#L28)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 渡すとカード全体がボタンになる（タップで拡大）。 */
```

<!-- source: src/lib/components/BusinessCard.svelte:30 -->

### [src/lib/components/BusinessCard.svelte:30](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCard.svelte#L30)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** ホバー表示だけが6タグへ差し替える。通常の名刺とPNGは data.tags の3件を保つ。 */
```

<!-- source: src/lib/components/BusinessCard.svelte:60 -->

### [src/lib/components/BusinessCard.svelte:60](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCard.svelte#L60)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- アバターを主役にし、その横に名前・ハンドル・タグを縦に積む。
	     3行ぶんの高さがアバターと釣り合うので、頭とタグの間に余白が空かない。 -->
```

<!-- source: src/lib/components/BusinessCard.svelte:73 -->

### [src/lib/components/BusinessCard.svelte:73](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCard.svelte#L73)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- botたんのセリフだが、ユーザーの名刺なので botたんのアバターは出さず文字だけで表す。 -->
```

<!-- source: src/lib/components/BusinessCard.svelte:84 -->

### [src/lib/components/BusinessCard.svelte:84](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCard.svelte#L84)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- onclick の有無で要素そのものを変える。svelte:element だと Svelte が button だと
     静的に判定できず、a11y の警告を消すために role を手で足すことになる。 -->
```

## src/lib/components/BusinessCardDialog.svelte

<!-- source: src/lib/components/BusinessCardDialog.svelte:12 -->

### [src/lib/components/BusinessCardDialog.svelte:12](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCardDialog.svelte#L12)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 名刺の拡大表示と共有。
	 * ダイアログは既存の手書き規約に合わせる（CardDetailDialog.svelte が手本）:
	 * backdrop + role="dialog" aria-modal、Escape、背景クリック、開いたら閉じるへ focus。
	 */
```

<!-- source: src/lib/components/BusinessCardDialog.svelte:24 -->

### [src/lib/components/BusinessCardDialog.svelte:24](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCardDialog.svelte#L24)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
		 * botたんの長文分析。名刺には短い tagline しか載らないので、全文はここで読ませる。
		 * 名刺そのものは画像に焼かれるが、この長文は画像には入らない。
		 */
```

<!-- source: src/lib/components/BusinessCardDialog.svelte:29 -->

### [src/lib/components/BusinessCardDialog.svelte:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCardDialog.svelte#L29)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 吹き出しに出す botたん本人。無ければ表示名だけのフォールバックを使う。 */
```

<!-- source: src/lib/components/BusinessCardDialog.svelte:34 -->

### [src/lib/components/BusinessCardDialog.svelte:34](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCardDialog.svelte#L34)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 元のプロフィール表示と同じく、合成 PostView にして botたんの吹き出しで見せる
	// （NewsCard.svelte と同じ手）。名刺は本人のものなので、botたんのアバターが出るのは
	// この分析欄だけ。
```

<!-- source: src/lib/components/BusinessCardDialog.svelte:63 -->

### [src/lib/components/BusinessCardDialog.svelte:63](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCardDialog.svelte#L63)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 生成した PNG。保存と共有で使い回す（毎回描き直さない）。 */
```

<!-- source: src/lib/components/BusinessCardDialog.svelte:109 -->

### [src/lib/components/BusinessCardDialog.svelte:109](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCardDialog.svelte#L109)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 画像ごと共有できる端末では画像を渡す。できなければ URL のコピーに落とす。
```

<!-- source: src/lib/components/BusinessCardDialog.svelte:118 -->

### [src/lib/components/BusinessCardDialog.svelte:118](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCardDialog.svelte#L118)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 共有シートを閉じただけの AbortError は失敗ではない（NewsCard.svelte と同じ扱い）。
```

<!-- source: src/lib/components/BusinessCardDialog.svelte:148 -->

### [src/lib/components/BusinessCardDialog.svelte:148](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCardDialog.svelte#L148)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 保存・共有されるのはこの PNG。DOM 版との差はここで見比べられる。 -->
```

<!-- source: src/lib/components/BusinessCardDialog.svelte:166 -->

### [src/lib/components/BusinessCardDialog.svelte:166](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BusinessCardDialog.svelte#L166)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 名刺に載るのは短い tagline だけ。分析の全文はここで読ませる。 -->
```

## src/lib/components/CardBack.svelte

<!-- source: src/lib/components/CardBack.svelte:2 -->

### [src/lib/components/CardBack.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardBack.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 全肯定カードの裏面。親の箱いっぱいに広がるので、大きさと角丸は親が決める
	 * （border-radius: inherit）。FAB と、引いた瞬間のフリップ演出の両方がこれを使う。
	 * 「押す前に見えているもの」と「めくれるもの」が同じ絵であることに意味があるので、
	 * 片方だけ変えないこと。
	 */
```

<!-- source: src/lib/components/CardBack.svelte:9 -->

### [src/lib/components/CardBack.svelte:9](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardBack.svelte#L9)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** botたんの大きさ。親の幅に対する割合で指定する。 */
```

<!-- source: src/lib/components/CardBack.svelte:11 -->

### [src/lib/components/CardBack.svelte:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardBack.svelte#L11)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 内枠。小さく描くときは線が団子になるので落とす。 */
```

<!-- source: src/lib/components/CardBack.svelte:28 -->

### [src/lib/components/CardBack.svelte:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardBack.svelte#L28)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 小さく描くときは親が --card-back-border を細くする。 */
```

<!-- source: src/lib/components/CardBack.svelte:33 -->

### [src/lib/components/CardBack.svelte:33](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardBack.svelte#L33)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* トレカの裏面によくある内枠。これがあるだけで「?」より格段にカードに見える。 */
```

<!-- source: src/lib/components/CardBack.svelte:37 -->

### [src/lib/components/CardBack.svelte:37](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardBack.svelte#L37)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* inset の % は上下が高さ基準・左右が幅基準で不揃いになる。margin の % は
		   すべて幅基準なので、縦長のカードでも枠の余白が四辺で揃う。 */
```

<!-- source: src/lib/components/CardBack.svelte:43 -->

### [src/lib/components/CardBack.svelte:43](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardBack.svelte#L43)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* botたんは線画 PNG なので、透過をマスクにして裏面の地色に馴染む一色で塗る。 */
```

## src/lib/components/CardCollection.svelte

<!-- source: src/lib/components/CardCollection.svelte:23 -->

### [src/lib/components/CardCollection.svelte:23](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardCollection.svelte#L23)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 自分のプロフィールか。ドローボタンは自分のときだけ出す。 */
```

<!-- source: src/lib/components/CardCollection.svelte:29 -->

### [src/lib/components/CardCollection.svelte:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardCollection.svelte#L29)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 引いた直後の演出。開いているカードは opened で持つ。
```

<!-- source: src/lib/components/CardCollection.svelte:31 -->

### [src/lib/components/CardCollection.svelte:31](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardCollection.svelte#L31)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// モーダルで開いているカード（引いた直後 / 一覧からタップ の両方）。
```

<!-- source: src/lib/components/CardCollection.svelte:33 -->

### [src/lib/components/CardCollection.svelte:33](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardCollection.svelte#L33)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// カード詳細を閉じたあとに出す。モーダルを二重に重ねないため別状態で待機させる。
```

<!-- source: src/lib/components/CardCollection.svelte:37 -->

### [src/lib/components/CardCollection.svelte:37](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardCollection.svelte#L37)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// コレクションは cardCollections が DID ごとに 1 度だけ取る。フィードの FAB と同じ
	// 実体を見ているので、TOP で引いた直後にここへ来ても drawStatus がズレない。
```

<!-- source: src/lib/components/CardCollection.svelte:48 -->

### [src/lib/components/CardCollection.svelte:48](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardCollection.svelte#L48)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 並びは AppView が返した順（= カード定義 JSON の順）をそのまま使い、**絶対に並べ替えない**。
	 * 各カードが図鑑の決まった枠に収まることで、「どこが空いているか」が毎回同じ位置で分かる。
	 * 所持順やレアリティ順に寄せると、1枚引くたびに全部の位置がずれて図鑑にならない。
	 */
```

<!-- source: src/lib/components/CardCollection.svelte:54 -->

### [src/lib/components/CardCollection.svelte:54](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardCollection.svelte#L54)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 記念日カードは図鑑の升目を持たない別枠。コンプ率の分母にも分子にも入らないので、
	 * ownedCount / totalCount には触らず、一覧の一番下に独立したセクションで並べる。
	 */
```

<!-- source: src/lib/components/CardCollection.svelte:98 -->

### [src/lib/components/CardCollection.svelte:98](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardCollection.svelte#L98)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * モーダルを閉じたら、開いていたカード（コメント込み）をコレクションへ反映する。
	 * 見返しで開いたときも、待っている間にコメントが届いていれば一覧へ書き戻る。
	 */
```

<!-- source: src/lib/components/CardCollection.svelte:157 -->

### [src/lib/components/CardCollection.svelte:157](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardCollection.svelte#L157)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 所持カードはタップで詳細モーダル。botたんのコメントはそこでだけ読む
						     （一覧に出すと図鑑の升目が高さバラバラになり、配置が読めなくなる）。 -->
```

<!-- source: src/lib/components/CardCollection.svelte:209 -->

### [src/lib/components/CardCollection.svelte:209](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardCollection.svelte#L209)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 図鑑の続きではなく別の棚だと分かるように、線で切ってから並べる。 */
```

<!-- source: src/lib/components/CardCollection.svelte:288 -->

### [src/lib/components/CardCollection.svelte:288](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardCollection.svelte#L288)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* カードそのものがボタン。ボタンの既定の見た目は全部落とす。 */
```

## src/lib/components/CardDetailDialog.svelte

<!-- source: src/lib/components/CardDetailDialog.svelte:14 -->

### [src/lib/components/CardDetailDialog.svelte:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L14)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 時刻表示。日付境界は JST 4:00 だが、表示は閲覧者のローカル時刻に合わせる。 */
```

<!-- source: src/lib/components/CardDetailDialog.svelte:34 -->

### [src/lib/components/CardDetailDialog.svelte:34](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L34)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 表示するカード。draw があるときはその結果のカード。 */
```

<!-- source: src/lib/components/CardDetailDialog.svelte:36 -->

### [src/lib/components/CardDetailDialog.svelte:36](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** コメント生成待ちのポーリング先（= 所有者の DID）。 */
```

<!-- source: src/lib/components/CardDetailDialog.svelte:38 -->

### [src/lib/components/CardDetailDialog.svelte:38](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L38)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 引いた直後だけ渡す。無ければ所持カードを見返しているだけ（演出なし）。 */
```

<!-- source: src/lib/components/CardDetailDialog.svelte:40 -->

### [src/lib/components/CardDetailDialog.svelte:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L40)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** ゲスト抽選など、まだ所持化されていない当選カードの表面を見せる。 */
```

<!-- source: src/lib/components/CardDetailDialog.svelte:42 -->

### [src/lib/components/CardDetailDialog.svelte:42](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L42)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
		 * 渡すと「コレクションを見る」リンクを出す。図鑑の外（フィードの FAB）から
		 * 引いたときだけ使う。カードタブから開いたときは自分自身への導線になるので渡さない。
		 */
```

<!-- source: src/lib/components/CardDetailDialog.svelte:50 -->

### [src/lib/components/CardDetailDialog.svelte:50](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L50)

分類: ツール指示（削除対象外）。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// ダイアログ表示中に draw が差し替わることはなく、別結果は親の key で再マウントされる。
	// svelte-ignore state_referenced_locally
```

<!-- source: src/lib/components/CardDetailDialog.svelte:53 -->

### [src/lib/components/CardDetailDialog.svelte:53](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L53)

分類: ツール指示（削除対象外）。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 初回ドローはタメてから裏 → 表。見返し・当日分の再表示は最初から表。
	// svelte-ignore state_referenced_locally
```

<!-- source: src/lib/components/CardDetailDialog.svelte:57 -->

### [src/lib/components/CardDetailDialog.svelte:57](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L57)

分類: ツール指示（削除対象外）。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 表示中のカード。コメントが届いたら差し替える編集可能なコピー。
	// svelte-ignore state_referenced_locally
```

<!-- source: src/lib/components/CardDetailDialog.svelte:60 -->

### [src/lib/components/CardDetailDialog.svelte:60](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L60)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 待っても届かなかった状態。「…」のまま放置せず、その旨を出す。
```

<!-- source: src/lib/components/CardDetailDialog.svelte:69 -->

### [src/lib/components/CardDetailDialog.svelte:69](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L69)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** おすそわけボードで受け取ったカードの「〜からもらった」。 */
```

<!-- source: src/lib/components/CardDetailDialog.svelte:77 -->

### [src/lib/components/CardDetailDialog.svelte:77](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L77)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// ja/en どちらかが埋まればコメントは届いたとみなす（片方だけ生成される事故に強くする）。
```

<!-- source: src/lib/components/CardDetailDialog.svelte:79 -->

### [src/lib/components/CardDetailDialog.svelte:79](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L79)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 初回の実ドローだけを祝う。当日カードの冪等再取得では演出を繰り返さない。
```

<!-- source: src/lib/components/CardDetailDialog.svelte:83 -->

### [src/lib/components/CardDetailDialog.svelte:83](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L83)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 「NEW CARD」の演出は図鑑を1枠埋めたことのお祝い。記念日カードは図鑑の外にあり、
	 * 見出しも「記念日おめでとう」のほうが伝えたいことなので、こちらは出さずに見出しを見せる。
	 */
```

<!-- source: src/lib/components/CardDetailDialog.svelte:105 -->

### [src/lib/components/CardDetailDialog.svelte:105](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L105)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// botたんコメントは bot_server が非同期で書き込むので、届くまで getCards で取り直す。
		// 引いた直後だけでなく「コメントがまだ無い所持カードを開いたとき」も拾いに行くので、
		// 演出中に間に合わなくても、あとから開き直せば読める。
```

<!-- source: src/lib/components/CardDetailDialog.svelte:110 -->

### [src/lib/components/CardDetailDialog.svelte:110](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L110)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// Gemini の生成待ちなので、演出の尺より十分長く待つ。
```

<!-- source: src/lib/components/CardDetailDialog.svelte:126 -->

### [src/lib/components/CardDetailDialog.svelte:126](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L126)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 一時的な失敗は無視して次のポーリングに任せる。
```

<!-- source: src/lib/components/CardDetailDialog.svelte:202 -->

### [src/lib/components/CardDetailDialog.svelte:202](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L202)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- フォントファイルは再配布せず、指定文言だけを描画したマスクで字形を使う。 -->
```

<!-- source: src/lib/components/CardDetailDialog.svelte:234 -->

### [src/lib/components/CardDetailDialog.svelte:234](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L234)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- botたんのひとこと。カードのフレーバーとは別に、引いたその人へ向けた言葉。 -->
```

<!-- source: src/lib/components/CardDetailDialog.svelte:241 -->

### [src/lib/components/CardDetailDialog.svelte:241](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L241)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!--
						「考え中」を出すのは、実際にコメントを取り直しているときだけ
						（ポーリングの条件と同じ）。actor が無い＝他人の札を見ているので、
						こちらへ向けた言葉は最初から存在しない。出すと永久に点が回る。
					-->
```

<!-- source: src/lib/components/CardDetailDialog.svelte:253 -->

### [src/lib/components/CardDetailDialog.svelte:253](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L253)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 記念日は抽選枠を消費しないので「次に引ける時刻」を出さない。 -->
```

<!-- source: src/lib/components/CardDetailDialog.svelte:321 -->

### [src/lib/components/CardDetailDialog.svelte:321](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L321)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 演出中の暗い幕の上に浮かべるので、ここだけ幕に合わせた半透明の配色にする。 */
```

<!-- source: src/lib/components/CardDetailDialog.svelte:336 -->

### [src/lib/components/CardDetailDialog.svelte:336](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L336)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 「どっとじ」で描いた完成画像をマスクにし、フォント本体をブラウザへ再配布しない。 */
```

<!-- source: src/lib/components/CardDetailDialog.svelte:445 -->

### [src/lib/components/CardDetailDialog.svelte:445](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L445)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* --- 裏 → 表のフリップ（引いた直後だけ） --- */
```

<!-- source: src/lib/components/CardDetailDialog.svelte:536 -->

### [src/lib/components/CardDetailDialog.svelte:536](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L536)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 枠線・地色・botたんは CardBack 側。ここは角丸だけ渡す（CardBack が inherit する）。 */
```

<!-- source: src/lib/components/CardDetailDialog.svelte:545 -->

### [src/lib/components/CardDetailDialog.svelte:545](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L545)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* レアリティが高いほど、表になった瞬間の光を強くする。見返しでは光らせない。 */
```

<!-- source: src/lib/components/CardDetailDialog.svelte:598 -->

### [src/lib/components/CardDetailDialog.svelte:598](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L598)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* --- botたんの吹き出し --- */
```

<!-- source: src/lib/components/CardDetailDialog.svelte:616 -->

### [src/lib/components/CardDetailDialog.svelte:616](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDetailDialog.svelte#L616)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 吹き出しの尻尾（カード側＝上を向く）。 */
```

## src/lib/components/CardDrawBanner.svelte

<!-- source: src/lib/components/CardDrawBanner.svelte:50 -->

### [src/lib/components/CardDrawBanner.svelte:50](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawBanner.svelte#L50)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* /cards のタブの上に置く帯。ゲームの手順とは別の「今日の一回」なので、タブより上に独立させる。 */
```

<!-- source: src/lib/components/CardDrawBanner.svelte:137 -->

### [src/lib/components/CardDrawBanner.svelte:137](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawBanner.svelte#L137)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 読み始めを邪魔しないよう長く静止し、周期の終わりだけ1回転して存在を知らせる。 */
```

## src/lib/components/CardDrawEntry.svelte

<!-- source: src/lib/components/CardDrawEntry.svelte:24 -->

### [src/lib/components/CardDrawEntry.svelte:24](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawEntry.svelte#L24)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** banner: /cards のタブの上に置く帯。fab: 画面右下の浮きボタン（開発用に残している）。 */
```

<!-- source: src/lib/components/CardDrawEntry.svelte:42 -->

### [src/lib/components/CardDrawEntry.svelte:42](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawEntry.svelte#L42)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 記念日の受け取りは AnniversaryCardHost が自動で開くのが主導線で、こちらは保険。
	 * うっかり閉じた・自動で開けなかったときに、その日のうちなら取りに戻れるようにしておく
	 * （記念日は1日しか来ないので、逃したときのやり直しが効かないのが一番まずい）。
	 */
```

<!-- source: src/lib/components/CardDrawEntry.svelte:102 -->

### [src/lib/components/CardDrawEntry.svelte:102](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawEntry.svelte#L102)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 記念日があるときは抽選より先に受け取らせる。開いたモーダルは Host が出す。
```

<!-- source: src/lib/components/CardDrawEntry.svelte:121 -->

### [src/lib/components/CardDrawEntry.svelte:121](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawEntry.svelte#L121)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// drawCard は抽選済みの日には同じカードを返すので、「見る」入口にも共用できる。
```

## src/lib/components/CardDrawFab.svelte

<!-- source: src/lib/components/CardDrawFab.svelte:17 -->

### [src/lib/components/CardDrawFab.svelte:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawFab.svelte#L17)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 下部に一時通知（PostFollowNotice）が出ている間だけ true。モバイルで 1 段上げる。 */
```

<!-- source: src/lib/components/CardDrawFab.svelte:25 -->

### [src/lib/components/CardDrawFab.svelte:25](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawFab.svelte#L25)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// /dev/cards では複数並べるので、aria-describedby の参照先が衝突しないようにする。
```

<!-- source: src/lib/components/CardDrawFab.svelte:29 -->

### [src/lib/components/CardDrawFab.svelte:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawFab.svelte#L29)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 見た目は浮遊するカードそのもの。操作要素としては button を保ち、押した先の
     フリップ演出と同じ CardBack を見せて、何が起きるかを押す前から伝える。 -->
```

<!-- source: src/lib/components/CardDrawFab.svelte:62 -->

### [src/lib/components/CardDrawFab.svelte:62](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawFab.svelte#L62)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* .mobile-nav(20)・.feed-tabs(15) より上、絵文字ピッカー(29/30)・一時通知(40)・
		   各種モーダル(100〜120) より下。下部を占める UI が開いている間は譲る。 */
```

<!-- source: src/lib/components/CardDrawFab.svelte:68 -->

### [src/lib/components/CardDrawFab.svelte:68](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawFab.svelte#L68)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 縦長カードとラベルを .side-footer（高さは概ね 53〜76px）の上へ置く。 */
```

<!-- source: src/lib/components/CardDrawFab.svelte:70 -->

### [src/lib/components/CardDrawFab.svelte:70](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawFab.svelte#L70)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* ビューポートの隅まで飛ばすと読んでいる列から遠いので、.shell（最大 1240px）の
		   右端あたりに張り付ける。狭い画面では max() で 24px に落ちる。 */
```

<!-- source: src/lib/components/CardDrawFab.svelte:95 -->

### [src/lib/components/CardDrawFab.svelte:95](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawFab.svelte#L95)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 遊戯王リスペクトの 59/86。AffirmationCard と同じ比率にして図鑑の 1 枚に見せる。 */
```

<!-- source: src/lib/components/CardDrawFab.svelte:134 -->

### [src/lib/components/CardDrawFab.svelte:134](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawFab.svelte#L134)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* ドロー中は浮遊を止め、スピナーと重なる裏面の絵だけ引っ込める。 */
```

<!-- source: src/lib/components/CardDrawFab.svelte:188 -->

### [src/lib/components/CardDrawFab.svelte:188](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawFab.svelte#L188)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* --- tablet: 右サイドバーが無いので隅でよい --- */
```

<!-- source: src/lib/components/CardDrawFab.svelte:196 -->

### [src/lib/components/CardDrawFab.svelte:196](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawFab.svelte#L196)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* --- mobile: .mobile-nav（fixed, 68px + safe-area）を必ず avoid する。
	       基準値は .post-follow-notice と揃える。
	       この幅では右下が投稿ボタン（.post-fab）の定位置なので、こちらは左へ逃がす。 --- */
```

<!-- source: src/lib/components/CardDrawFab.svelte:216 -->

### [src/lib/components/CardDrawFab.svelte:216](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawFab.svelte#L216)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 一時通知はこの幅だと画面幅いっぱいに出るので、その上へ逃がす。 */
```

<!-- source: src/lib/components/CardDrawFab.svelte:222 -->

### [src/lib/components/CardDrawFab.svelte:222](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardDrawFab.svelte#L222)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 380px 以下は必ずモバイル幅なので、左寄せのまま余白だけ詰める。 */
```

## src/lib/components/CardItemReactions.svelte

<!-- source: src/lib/components/CardItemReactions.svelte:8 -->

### [src/lib/components/CardItemReactions.svelte:8](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardItemReactions.svelte#L8)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * ゼンカツの記録とカードニュースに付けるリアクション行。
	 *
	 * subject は本人の repo にある `com.suibari.nagi.zenkatsu` / `com.suibari.nagi.cardGet`
	 * そのもの。投稿・ニュースとまったく同じ経路なので、通知も従来どおり飛ぶ。
	 *
	 * **送信者は持ち主にだけ出す。** 誰が誰に反応したかを第三者が追えないよう、AppView は
	 * リアクター一覧を subject の持ち主にしか返さない。表示側も投稿（`ChatBubble`）と同じく、
	 * subject の repo（at://<did>/...）が閲覧者本人のときだけリアクターを出す。
	 */
```

## src/lib/components/CardNewsList.svelte

<!-- source: src/lib/components/CardNewsList.svelte:15 -->

### [src/lib/components/CardNewsList.svelte:15](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardNewsList.svelte#L15)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 全肯定カードのニュース。R以上のドローと、ゼンカツのハイライトだけが並ぶ。
	 * ゼンカツを全件流すとニュースの約8割がゼンカツになり、レアドローが埋もれるため。
	 */
```

<!-- source: src/lib/components/CardNewsList.svelte:41 -->

### [src/lib/components/CardNewsList.svelte:41](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardNewsList.svelte#L41)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 拡大表示。**他人のカードなので `draw` も `actor` も渡さない**
	 * （ドロー演出は自分が引いた瞬間のもので、botたんコメントは持ち主にしか出ない）。
	 */
```

<!-- source: src/lib/components/CardNewsList.svelte:89 -->

### [src/lib/components/CardNewsList.svelte:89](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardNewsList.svelte#L89)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- comboFound はゼンカツの回そのもの。中身は同じで、見出しだけが変わる。 -->
```

<!-- source: src/lib/components/CardNewsList.svelte:171 -->

### [src/lib/components/CardNewsList.svelte:171](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardNewsList.svelte#L171)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 世界初の発見だけは、ニュースの中で一段強い見出しにする。 */
```

<!-- source: src/lib/components/CardNewsList.svelte:176 -->

### [src/lib/components/CardNewsList.svelte:176](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardNewsList.svelte#L176)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 拡大表示のトリガ。カードの寸法は親の li が決めるので、ボタン側は素通しにする。 */
```

## src/lib/components/CardShareBoard.svelte

<!-- source: src/lib/components/CardShareBoard.svelte:14 -->

### [src/lib/components/CardShareBoard.svelte:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardShareBoard.svelte#L14)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * おすそわけボード（bsky-affirmative-bot の docs/zenkatsu.md 13章）。
	 * だぶったカードを置いて Ƶ をもらい、まだ持っていないカードを Ƶ で受け取る。
	 *
	 * 置いたときの気持ちよさは「1枚ずつ数えられる」ことから来るので、まとめて置いても
	 * カードを1枚ずつ Ƶ 欄へ吸い込ませ、着いた瞬間に数字を上げる。
	 */
```

<!-- source: src/lib/components/CardShareBoard.svelte:29 -->

### [src/lib/components/CardShareBoard.svelte:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardShareBoard.svelte#L29)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 演出中は表示用の残高を実際の残高から遅らせて、着いたカードのぶんだけ足していく。
```

<!-- source: src/lib/components/CardShareBoard.svelte:34 -->

### [src/lib/components/CardShareBoard.svelte:34](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardShareBoard.svelte#L34)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 受け取ったカードはカード詳細ダイアログで開く（botたんのコメントもそこで待つ）。
```

<!-- source: src/lib/components/CardShareBoard.svelte:93 -->

### [src/lib/components/CardShareBoard.svelte:93](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardShareBoard.svelte#L93)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** カードを1枚ずつ Ƶ 欄へ飛ばす。返り値の Promise は最後の1枚が着いたら解決する。 */
```

<!-- source: src/lib/components/CardShareBoard.svelte:124 -->

### [src/lib/components/CardShareBoard.svelte:124](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardShareBoard.svelte#L124)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 上へふくらむ弧。中間点を持ち上げて、縮みながら吸い込まれる。
```

<!-- source: src/lib/components/CardShareBoard.svelte:167 -->

### [src/lib/components/CardShareBoard.svelte:167](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardShareBoard.svelte#L167)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 所持枚数が減ったので、図鑑のキャッシュも取り直す。
```

<!-- source: src/lib/components/CardShareBoard.svelte:205 -->

### [src/lib/components/CardShareBoard.svelte:205](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardShareBoard.svelte#L205)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 図鑑と同じく、未所持で手に入らないカードは伏せたまま。受け取れるカードだけ表面を見せる。 -->
```

<!-- source: src/lib/components/CardShareBoard.svelte:393 -->

### [src/lib/components/CardShareBoard.svelte:393](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardShareBoard.svelte#L393)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* ゼンカツの「あそびかた」と同じ見た目にそろえる。 */
```

<!-- source: src/lib/components/CardShareBoard.svelte:467 -->

### [src/lib/components/CardShareBoard.svelte:467](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardShareBoard.svelte#L467)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 受け取る（primary）と寄付（secondary）は、タイルの幅いっぱいに並べる。 */
```

## src/lib/components/CardShareHelp.svelte

<!-- source: src/lib/components/CardShareHelp.svelte:11 -->

### [src/lib/components/CardShareHelp.svelte:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardShareHelp.svelte#L11)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** おすそわけボードのしくみ。画面の短い説明文に入りきらない決まりごとをここに置く。 */
```

<!-- source: src/lib/components/CardShareHelp.svelte:18 -->

### [src/lib/components/CardShareHelp.svelte:18](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardShareHelp.svelte#L18)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 開いた瞬間に「×」が光るのを避ける。読み始めは本文から。
```

<!-- source: src/lib/components/CardShareHelp.svelte:43 -->

### [src/lib/components/CardShareHelp.svelte:43](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardShareHelp.svelte#L43)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// ::backdrop を押すと target はダイアログ自身になる。ゼンカツのヘルプと同じく背景で閉じる。
```

<!-- source: src/lib/components/CardShareHelp.svelte:193 -->

### [src/lib/components/CardShareHelp.svelte:193](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/CardShareHelp.svelte#L193)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* base.css が ul の記号を落としているので、ここで戻す（箇条書きに見えないと章が効かない）。 */
```

## src/lib/components/NewsCard.svelte

<!-- source: src/lib/components/NewsCard.svelte:32 -->

### [src/lib/components/NewsCard.svelte:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsCard.svelte#L32)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 前回ニュース一覧を見た時点より新しいか。カード左端にマークを出す。 */
```

<!-- source: src/lib/components/NewsCard.svelte:34 -->

### [src/lib/components/NewsCard.svelte:34](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsCard.svelte#L34)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
		 * 動的枠の「おすすめの理由」に出す関心ジャンル。指定しなければラベル行ごと出ない
		 * （一覧・検索・プロフィール・カルーセルは従来どおり）。
		 */
```

<!-- source: src/lib/components/NewsCard.svelte:39 -->

### [src/lib/components/NewsCard.svelte:39](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsCard.svelte#L39)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** OGP画像を配信元から直接読み込む。ニュースページでだけ有効にする。 */
```

<!-- source: src/lib/components/NewsCard.svelte:41 -->

### [src/lib/components/NewsCard.svelte:41](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsCard.svelte#L41)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 外側のセクション内に置くときは、カード自身の枠と影を持たせない。 */
```

<!-- source: src/lib/components/NewsCard.svelte:43 -->

### [src/lib/components/NewsCard.svelte:43](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsCard.svelte#L43)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** カルーセルなど高さを揃える表示では、タイトルを2行に収める。 */
```

<!-- source: src/lib/components/NewsCard.svelte:45 -->

### [src/lib/components/NewsCard.svelte:45](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsCard.svelte#L45)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
		 * この記事の Nagi 内ページ（`/news/<rkey>`）。渡すと見出しがそのリンクになる。
		 * 一覧からパーマリンクへ内部リンクが張られ、検索エンジンが sitemap 以外の
		 * 経路でも記事ページへ辿り着ける。
		 */
```

<!-- source: src/lib/components/NewsCard.svelte:65 -->

### [src/lib/components/NewsCard.svelte:65](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsCard.svelte#L65)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// コメントは登録後にワーカーが付けるので、付くまでは吹き出しを出さない。
```

<!-- source: src/lib/components/NewsCard.svelte:67 -->

### [src/lib/components/NewsCard.svelte:67](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsCard.svelte#L67)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// ユーザーが追加したニュースは審査なしで即時掲載する。自動モデレーションで札が
	// 付いたものは、投稿と同じ表示設定に従ってカード全体を伏せる（または出さない）。
```

<!-- source: src/lib/components/NewsCard.svelte:71 -->

### [src/lib/components/NewsCard.svelte:71](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsCard.svelte#L71)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// プリレンダとハイドレーション直後は JST・日本語で固定し、マウント後に閲覧者の
	// ロケールとタイムゾーンへ切り替える。固定しないとビルド(UTC)と閲覧者(JST)で
	// 時刻表示が9時間ずれ、全カードが静かに描き変わる。
```

<!-- source: src/lib/components/NewsCard.svelte:125 -->

### [src/lib/components/NewsCard.svelte:125](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsCard.svelte#L125)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 「記事を読む」ボタンは置かない。記事へはサムネイルから飛べるので、
		     サムネイルを出さない一覧（検索・プロフィールなど）のために配信元名を記事リンクにする。 -->
```

<!-- source: src/lib/components/NewsCard.svelte:168 -->

### [src/lib/components/NewsCard.svelte:168](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsCard.svelte#L168)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 主要アクションは「読む」ではなく、自分の話を書く「コメントする」（ニュースの引用投稿）。 -->
```

<!-- source: src/lib/components/NewsCard.svelte:231 -->

### [src/lib/components/NewsCard.svelte:231](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsCard.svelte#L231)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* おすすめの理由は、カードの頭に添える小さな注記。色はアイコンだけに留める。 */
```

<!-- source: src/lib/components/NewsCard.svelte:253 -->

### [src/lib/components/NewsCard.svelte:253](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsCard.svelte#L253)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 外枠を復活させず、未読だけ左のアクセントバーで示す。 */
```

<!-- source: src/lib/components/NewsCard.svelte:254 -->

### [src/lib/components/NewsCard.svelte:254](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsCard.svelte#L254)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* CWの包みを挟んでも、フッターを下端へ寄せる縦並びを保つ（カルーセルの高さ揃え）。 */
```

## src/lib/components/ProfileWebsiteCard.svelte

<!-- source: src/lib/components/ProfileWebsiteCard.svelte:20 -->

### [src/lib/components/ProfileWebsiteCard.svelte:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ProfileWebsiteCard.svelte#L20)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// website は補助情報なので、取得失敗でプロフィール本体をエラーにしない。
```

## src/lib/components/ZenkatsuBoard.svelte

<!-- source: src/lib/components/ZenkatsuBoard.svelte:31 -->

### [src/lib/components/ZenkatsuBoard.svelte:31](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L31)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 属性名はカード面と同じ訳語を使う（「追い風: dark」と生で出さない）。 */
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:41 -->

### [src/lib/components/ZenkatsuBoard.svelte:41](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L41)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * ゼンカツ！の盤面。お題 → プレイ → その日の記録（新着順）。
	 *
	 * **スコアも順位も出さない。** 出した札と botたんの総評だけを並べる。順位を出した瞬間に
	 * 下位を黙って否定することになり、全肯定と正面から衝突する（docs/zenkatsu.md 1章）。
	 */
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:49 -->

### [src/lib/components/ZenkatsuBoard.svelte:49](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L49)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 知らない属性の値でも盤面ごと落とさず、おすすめ属性の行だけ出さない。
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:55 -->

### [src/lib/components/ZenkatsuBoard.svelte:55](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L55)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 見ている日付。undefined なら今日。 */
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:65 -->

### [src/lib/components/ZenkatsuBoard.svelte:65](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L65)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 記録の札をタップしたときの拡大表示。**他人の札なので `draw` も `actor` も渡さない**
	 * （ドロー演出は自分が引いた瞬間のもので、botたんコメントは持ち主にしか出ない）。
	 */
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:78 -->

### [src/lib/components/ZenkatsuBoard.svelte:78](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L78)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * @param next  追加読み込みのカーソル。
	 * @param quiet 取り直している間も今の記録を出したままにする（「…」で画面を潰さない）。
	 */
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:105 -->

### [src/lib/components/ZenkatsuBoard.svelte:105](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L105)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// PDS の応答が止まってもプレイ情報の表示を待ち続けない。
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:138 -->

### [src/lib/components/ZenkatsuBoard.svelte:138](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L138)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// お題の無い応答は取得失敗として扱う。盤面はお題を前提に描くので、受け取ると描画ごと落ちる。
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:140 -->

### [src/lib/components/ZenkatsuBoard.svelte:140](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L140)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 日付・セッションが変わったあとの古い応答や、viewer を消す遅い公開応答は使わない。
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:161 -->

### [src/lib/components/ZenkatsuBoard.svelte:161](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L161)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// ログイン済みでページ遷移した場合も、お題は PDS/OAuth の応答を待たずに表示する。
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:171 -->

### [src/lib/components/ZenkatsuBoard.svelte:171](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L171)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 取得済みの条件（日付＋見ている人）。
	 *
	 * OAuth の復元は **盤面を出したあとに**終わる。素で load() を呼び直すと、一度出した
	 * お題が「…」に戻り、ログインしている人だけ数秒の空白を見ることになる。お題は公開
	 * 情報で未ログインの取得と同じものが返るので、ここは静かに差し替える。日付を変えた
	 * ときは別の日を取りに行くので、今までどおり画面を伏せる。
	 */
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:193 -->

### [src/lib/components/ZenkatsuBoard.svelte:193](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L193)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 手札の定義は図鑑（getCards）から引く。playable は「どれを何枚出せるか」だけを持つ。
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:204 -->

### [src/lib/components/ZenkatsuBoard.svelte:204](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L204)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 出せるものを先に、クールダウン中は後ろへ。図鑑の順は崩さない。
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:224 -->

### [src/lib/components/ZenkatsuBoard.svelte:224](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L224)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 提出後の再取得が失敗しても、成功した提出を再送させない。
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:253 -->

### [src/lib/components/ZenkatsuBoard.svelte:253](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L253)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!--
	ロゴはページの顔なので、読み込みを待たずに出す（空白から始めない）。
	ロゴの下に何のゲームかを一言と、流れを一行で置く。初見の人がここで足を止めないように。
-->
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:337 -->

### [src/lib/components/ZenkatsuBoard.svelte:337](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L337)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 開発時のみ。1日1回のロックを外すのではなく、消して出し直す（本物の経路を毎回通す）。 -->
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:396 -->

### [src/lib/components/ZenkatsuBoard.svelte:396](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L396)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 提出後の一覧再取得中も、カットインと総評の画面を維持する。 -->
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:411 -->

### [src/lib/components/ZenkatsuBoard.svelte:411](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L411)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
			 * 提出直後の再取得は総評の生成より早い。ゲーム側はそれを待ってから閉じるので、
			 * **閉じたときにもう一度引く**。ここを抜かすと記録欄が「考えているよ…」のまま残る。
			 */
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:435 -->

### [src/lib/components/ZenkatsuBoard.svelte:435](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L435)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* ロゴは原寸 1671x941。縦幅で効かせて、狭い画面でも溢れないようにする。 */
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:454 -->

### [src/lib/components/ZenkatsuBoard.svelte:454](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L454)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* お題はこのページの焦点。枠で囲って、周りの説明文から切り離す。 */
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:474 -->

### [src/lib/components/ZenkatsuBoard.svelte:474](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L474)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* どの日を見ているかを必ず出す。前の日を開いたまま今日だと思い込めてしまう。 */
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:488 -->

### [src/lib/components/ZenkatsuBoard.svelte:488](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L488)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 「そんなとき？」はお題の一部。色を変えると別の情報に見えるので、
	 * 行を変えるだけにして地続きに読ませる。
	 */
```

<!-- source: src/lib/components/ZenkatsuBoard.svelte:577 -->

### [src/lib/components/ZenkatsuBoard.svelte:577](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBoard.svelte#L577)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 拡大表示のトリガ。カードの寸法は親の li が決めるので、ボタン側は素通しにする。 */
```

## src/lib/components/ZenkatsuBonus.svelte

<!-- source: src/lib/components/ZenkatsuBonus.svelte:46 -->

### [src/lib/components/ZenkatsuBonus.svelte:46](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBonus.svelte#L46)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// Depend on identity/count, not on poll object or translated labels: neither should replay a bonus.
```

<!-- source: src/lib/components/ZenkatsuBonus.svelte:68 -->

### [src/lib/components/ZenkatsuBonus.svelte:68](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBonus.svelte#L68)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!--
	ボーナスは1件ずつ出るが、**出たものは消えない**。演出が終わった時点で、成立した全項目が
	説明文つきのまま一覧として残る。最後の1件だけが大きく、残りが小さなチップに潰れると、
	何が起きたのかを後から見通せない。
-->
```

<!-- source: src/lib/components/ZenkatsuBonus.svelte:169 -->

### [src/lib/components/ZenkatsuBonus.svelte:169](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBonus.svelte#L169)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 未公開の行は場所も取らない。1件ずつ下へ伸びて「積み上がる」ように見せる。 */
```

<!-- source: src/lib/components/ZenkatsuBonus.svelte:179 -->

### [src/lib/components/ZenkatsuBonus.svelte:179](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuBonus.svelte#L179)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 今出た行だけ左に色の柱を立てる。完了後は平らな一覧に戻し、全項目を対等に見せる。 */
```

## src/lib/components/ZenkatsuDevReset.svelte

<!-- source: src/lib/components/ZenkatsuDevReset.svelte:7 -->

### [src/lib/components/ZenkatsuDevReset.svelte:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuDevReset.svelte#L7)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 開発専用。今日のぶんを消して、もう一度ゼンカツを出せるようにする。
	 *
	 * 1日1回のロックを環境変数で外すのではなく「消して出し直す」形にしているのは、
	 * 所持・クールダウン・当日判定・採点・コンボ・総評という**本物の経路を毎回まるごと通す**ため。
	 * ロックを殺してしまうと、検証したい当の制約が効いていない状態で試すことになる。
	 *
	 * `dev` はビルド時に決まるので、本番バンドルにはこのボタンごと残らない。
	 * AppView 側も開発モードでなければルートを登録しないので、二重に閉じている。
	 */
```

<!-- source: src/lib/components/ZenkatsuDevReset.svelte:41 -->

### [src/lib/components/ZenkatsuDevReset.svelte:41](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuDevReset.svelte#L41)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 開発用なので、本番の意匠に混ざらないよう意図的に浮かせる。 */
```

## src/lib/components/ZenkatsuFlow.svelte

<!-- source: src/lib/components/ZenkatsuFlow.svelte:4 -->

### [src/lib/components/ZenkatsuFlow.svelte:4](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuFlow.svelte#L4)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * ゲームの流れを一行で。「えらぶ → BONUS → 総評」。
	 *
	 * 語はプレイ画面の進行バーと共有している。盤面とあそびかたで先に覚えた言葉が、
	 * そのままプレイ中の見出しとして出てくる。
	 */
```

<!-- source: src/lib/components/ZenkatsuFlow.svelte:42 -->

### [src/lib/components/ZenkatsuFlow.svelte:42](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuFlow.svelte#L42)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 矢印は区切り。読み上げには要らない。 */
```

## src/lib/components/ZenkatsuHelp.svelte

<!-- source: src/lib/components/ZenkatsuHelp.svelte:12 -->

### [src/lib/components/ZenkatsuHelp.svelte:12](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuHelp.svelte#L12)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 開いた瞬間に「×」が光るのを避ける。読み始めは本文から。
```

<!-- source: src/lib/components/ZenkatsuHelp.svelte:37 -->

### [src/lib/components/ZenkatsuHelp.svelte:37](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuHelp.svelte#L37)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
		 * ::backdrop を押すと、target はダイアログ自身になる（中身なら中身の要素）。
		 * アプリの他のモーダルは背景クリックで閉じるので、ネイティブ dialog でも揃える。
		 */
```

<!-- source: src/lib/components/ZenkatsuHelp.svelte:49 -->

### [src/lib/components/ZenkatsuHelp.svelte:49](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuHelp.svelte#L49)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!--
			まず流れを一行で。章を読まなくても「えらぶ → BONUS → 総評」だけは持ち帰れるようにする。
			語はプレイ画面の進行バーと共有していて、ここで覚えた言葉がそのまま画面に出てくる。
		-->
```

<!-- source: src/lib/components/ZenkatsuHelp.svelte:178 -->

### [src/lib/components/ZenkatsuHelp.svelte:178](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuHelp.svelte#L178)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* base.css が ul の記号を落としているので、ここで戻す（箇条書きに見えないと章が効かない）。 */
```

## src/lib/components/ZenkatsuMarks.svelte

<!-- source: src/lib/components/ZenkatsuMarks.svelte:5 -->

### [src/lib/components/ZenkatsuMarks.svelte:5](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuMarks.svelte#L5)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 記録に添える「何が起きたか」。ニュースタブと、ゼンカツの今日の記録で共用する。
	 *
	 * **得点は出さない。** 出すのは追い風の枚数と、成立したコンボの名前だけ。
	 * コンボを公開するのは、4060通りを自力で総当たりするのが現実的でないから。
	 * 誰かが出したものが見えることで、攻略がコミュニティに伝わる。
	 */
```

<!-- source: src/lib/components/ZenkatsuMarks.svelte:19 -->

### [src/lib/components/ZenkatsuMarks.svelte:19](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuMarks.svelte#L19)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** combos のうち、その回が世界初だったぶん。ニュースからだけ渡る。 */
```

<!-- source: src/lib/components/ZenkatsuMarks.svelte:52 -->

### [src/lib/components/ZenkatsuMarks.svelte:52](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuMarks.svelte#L52)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * クラス名に接頭辞を付けているのは、`.mark` が base.css の**36x36アイコン用**
	 * グローバルクラスだから。素の `.mark` を使うと固定サイズと背景を持っていかれ、
	 * scoped スタイルでは打ち消せずにピルが正方形に潰れる。
	 */
```

<!-- source: src/lib/components/ZenkatsuMarks.svelte:58 -->

### [src/lib/components/ZenkatsuMarks.svelte:58](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuMarks.svelte#L58)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* flex アイテムは既定で縮む。CJK は min-content が1文字なので、これが無いと縦に潰れる。 */
```

<!-- source: src/lib/components/ZenkatsuMarks.svelte:70 -->

### [src/lib/components/ZenkatsuMarks.svelte:70](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuMarks.svelte#L70)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* コンボは追い風より目立たせる。見つけたこと自体が出来事なので。 */
```

<!-- source: src/lib/components/ZenkatsuMarks.svelte:75 -->

### [src/lib/components/ZenkatsuMarks.svelte:75](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuMarks.svelte#L75)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 世界初はニュースの見出しでも言うので、ピル側は縁取りだけにして重ねすぎない。 */
```

## src/lib/components/ZenkatsuNote.svelte

<!-- source: src/lib/components/ZenkatsuNote.svelte:5 -->

### [src/lib/components/ZenkatsuNote.svelte:5](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuNote.svelte#L5)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 作者の意図。**最初は畳んでおく。** 他人の意図を先に読むと、札だけを見て自分なりに
	 * 解釈する楽しみが消えるので、読む人が自分で開くまで本文は出さない。
	 * 翻訳も開いてから始める（畳んだままの意図で生成枠を使わない）。
	 */
```

<!-- source: src/lib/components/ZenkatsuNote.svelte:69 -->

### [src/lib/components/ZenkatsuNote.svelte:69](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuNote.svelte#L69)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 訳文・原文の本文は投稿用の文字サイズを持つので、意図欄の大きさへ戻す。 */
```

## src/lib/components/ZenkatsuPlay.svelte

<!-- source: src/lib/components/ZenkatsuPlay.svelte:44 -->

### [src/lib/components/ZenkatsuPlay.svelte:44](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L44)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 作者の意図（任意）。提出に失敗して select へ戻っても消さない。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:58 -->

### [src/lib/components/ZenkatsuPlay.svelte:58](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L58)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 最後の1枚が botたんの手に着いた。ここから受け取りの余韻に入る。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:67 -->

### [src/lib/components/ZenkatsuPlay.svelte:67](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L67)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 提出の結果（追い風の枚数と、成立したコンボ）。
	 *
	 * コンボは隠し要素なので**定義をクライアントへ配らない**。成立したものだけがサーバから
	 * 降りてくるので、ここへ溜めて review 段で出す。
	 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:74 -->

### [src/lib/components/ZenkatsuPlay.svelte:74](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L74)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 初期表示専用。提出済みの結果を開く場合も同じ総評画面を使う。
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:95 -->

### [src/lib/components/ZenkatsuPlay.svelte:95](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L95)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 非対応環境でもプレイは続ける。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:101 -->

### [src/lib/components/ZenkatsuPlay.svelte:101](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L101)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
		 * showModal() は最初のフォーカス可能な要素（＝ヘッダーの閉じる）へ焦点を移す。
		 * 開いた瞬間に「やめる」が光って見えるので、器そのものへ逃がして画面から始める。
		 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:114 -->

### [src/lib/components/ZenkatsuPlay.svelte:114](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L114)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 振動の停止が非対応でも閉じられる。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:128 -->

### [src/lib/components/ZenkatsuPlay.svelte:128](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L128)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
		 * 短く始めて、だんだん間隔を空ける。
		 *
		 * 生成は実測 3.2秒ほどで終わるので、一定 2.5秒で回すと「出来ているのに最大2.5秒
		 * 待たされる」時間が毎回乗る。最初を短くすれば出来た直後に拾えるし、
		 * 長引いたときは間隔が伸びるので無駄打ちも増えない。
		 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:142 -->

### [src/lib/components/ZenkatsuPlay.svelte:142](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L142)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 追い風とコンボは総評より先に確定しているので、見つけた時点で受け取る。
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:152 -->

### [src/lib/components/ZenkatsuPlay.svelte:152](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L152)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 索引・総評を待って再取得する。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:215 -->

### [src/lib/components/ZenkatsuPlay.svelte:215](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L215)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!--
				出口はひとつに見せる。提出後はリザルト側に大きな「おわる」が出るので、
				ヘッダーは×に退く（読み上げ名は変えない）。
			-->
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:245 -->

### [src/lib/components/ZenkatsuPlay.svelte:245](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L245)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- おすすめ属性はここ1箇所にまとめる。お題のすぐ下なら、選ぶ前に必ず目に入る。 -->
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:297 -->

### [src/lib/components/ZenkatsuPlay.svelte:297](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L297)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 札を並べた直後に書けるよう、スロットの真下に置く（フッターは固定なので入れない）。 -->
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:370 -->

### [src/lib/components/ZenkatsuPlay.svelte:370](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L370)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!--
				提出は「渡す」場面。札が下から舞い上がって扇に開き、botたんが受け取る。
				受け取り切るまで総評へ進まないので、出した手応えが必ず1回挟まる。
			-->
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:393 -->

### [src/lib/components/ZenkatsuPlay.svelte:393](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L393)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 受け取った顔を見せてから総評へ。すぐ切り替えると渡した実感が残らない。
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:434 -->

### [src/lib/components/ZenkatsuPlay.svelte:434](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L434)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 出した札 → BONUS → 総評。3つとも同じ幅の柱に乗せて、縦に1本通す。 -->
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:536 -->

### [src/lib/components/ZenkatsuPlay.svelte:536](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L536)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
		 * 寸法のものさし。パネル幅・角丸・縦の間は**この4つだけ**を使う。
		 * 場当たりの 10px / 14px / 20px / 24px が混ざると、揃っていないことが先に目に入る。
		 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:579 -->

### [src/lib/components/ZenkatsuPlay.svelte:579](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L579)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* プログラムから当てる焦点。輪郭は出さない（キーボード移動は中の要素が受け持つ）。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:643 -->

### [src/lib/components/ZenkatsuPlay.svelte:643](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L643)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 「そんなとき？」はお題の続き。色を変えず、行を変えるだけで地続きに読ませる。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:777 -->

### [src/lib/components/ZenkatsuPlay.svelte:777](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L777)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 16px 未満だと iOS がフォーカス時に拡大する。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:795 -->

### [src/lib/components/ZenkatsuPlay.svelte:795](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L795)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 最終行がスティッキーなフッターの下に潜らないよう、footer のぶんを空けておく。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:884 -->

### [src/lib/components/ZenkatsuPlay.svelte:884](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L884)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 光は中心へ集める。botたんの手もとが渡し先だと分かる位置に置く。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:902 -->

### [src/lib/components/ZenkatsuPlay.svelte:902](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L902)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 狭い画面でも札は読める大きさを保つ。渡しているものが見えないと演出が成立しない。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:905 -->

### [src/lib/components/ZenkatsuPlay.svelte:905](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L905)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 扇に開く。--turn は中央を0とした左右の位置。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:934 -->

### [src/lib/components/ZenkatsuPlay.svelte:934](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L934)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 結果は「出した札 → BONUS → 総評」を**同じ幅の柱**に積む。
	 * 中央揃え（justify-content: center）は使わない。縦に伸びたとき上が切れる。
	 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:970 -->

### [src/lib/components/ZenkatsuPlay.svelte:970](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L970)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 吹き出しは BONUS と同じ枠。botたんはその左上の縁に腰かける。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:974 -->

### [src/lib/components/ZenkatsuPlay.svelte:974](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L974)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 挿絵は枠の上辺に腰かける。またぐのは足元だけにして、見出しに被せない。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:977 -->

### [src/lib/components/ZenkatsuPlay.svelte:977](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L977)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 高さで効かせる。上に空ける量（padding-top）と同じ物差しでないと、被りがずれる。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:996 -->

### [src/lib/components/ZenkatsuPlay.svelte:996](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L996)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 吹き出しの尻尾。挿絵の真下に向ける。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:1021 -->

### [src/lib/components/ZenkatsuPlay.svelte:1021](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L1021)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 選択段と同じ終わり方にする。画面の下端がどちらも1本のバーで閉じる。 */
```

<!-- source: src/lib/components/ZenkatsuPlay.svelte:1168 -->

### [src/lib/components/ZenkatsuPlay.svelte:1168](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuPlay.svelte#L1168)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 集中線は中心から放射させる。横に流すと、画面の外へ持っていかれる向きに見える。 */
```

## src/lib/components/ZenkatsuRecord.svelte

<!-- source: src/lib/components/ZenkatsuRecord.svelte:8 -->

### [src/lib/components/ZenkatsuRecord.svelte:8](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuRecord.svelte#L8)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 未発見のコンボはサーバーから中身が返らない。 */
```

## src/lib/components/ZenkatsuRecordShelf.svelte

<!-- source: src/lib/components/ZenkatsuRecordShelf.svelte:14 -->

### [src/lib/components/ZenkatsuRecordShelf.svelte:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuRecordShelf.svelte#L14)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * レコードタブの表示部分。取得は呼び出し側に任せ、モックでも同じ見た目で確かめられるようにする。
	 *
	 * 一覧を縦に積むとトロフィーが増えるほど画面が流れていくので、
	 * - トロフィーは「種類ごとのメダル1枚＋獲得回数」に畳み、選んだメダルの履歴をモーダルで開く
	 * - コンボは全種類ぶんのマス目（未発見は伏せ札）に図鑑番号順で並べ、選んだ1つだけモーダルで詳しく出す。
	 *   伏せ札を選ぶと、サーバが渡してくれたぶんのヒント（枚数、見つかっていれば謎かけ）を出す
	 * という「棚」の形にしている。
	 */
```

<!-- source: src/lib/components/ZenkatsuRecordShelf.svelte:28 -->

### [src/lib/components/ZenkatsuRecordShelf.svelte:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuRecordShelf.svelte#L28)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 獲得条件ガイドと同じ並び。debut は廃止前の履歴があるときだけ出す。 */
```

<!-- source: src/lib/components/ZenkatsuRecordShelf.svelte:64 -->

### [src/lib/components/ZenkatsuRecordShelf.svelte:64](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuRecordShelf.svelte#L64)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// サーバーが新しい賞を足しても、表示が追いつくまで消えないようにする。
```

<!-- source: src/lib/components/ZenkatsuRecordShelf.svelte:87 -->

### [src/lib/components/ZenkatsuRecordShelf.svelte:87](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuRecordShelf.svelte#L87)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** まだ見つかっていないコンボの数。中身は伏せられている。 */
```

<!-- source: src/lib/components/ZenkatsuRecordShelf.svelte:90 -->

### [src/lib/components/ZenkatsuRecordShelf.svelte:90](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuRecordShelf.svelte#L90)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 棚に並べる順。伏せ札が届いていれば発見済みと混ぜて図鑑番号順にする。
	 * 伏せ札を返さない古い AppView では、発見順の後ろに番号なしの伏せ札を足すだけにする。
	 */
```

<!-- source: src/lib/components/ZenkatsuRecordShelf.svelte:263 -->

### [src/lib/components/ZenkatsuRecordShelf.svelte:263](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuRecordShelf.svelte#L263)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 世界で誰かが見つけたコンボには印を付け、狙いどころが一目でわかるようにする。 -->
```

<!-- source: src/lib/components/ZenkatsuRecordShelf.svelte:364 -->

### [src/lib/components/ZenkatsuRecordShelf.svelte:364](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuRecordShelf.svelte#L364)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 発見率を円グラフの輪で見せる。中の数字は見つけた数。 */
```

<!-- source: src/lib/components/ZenkatsuRecordShelf.svelte:436 -->

### [src/lib/components/ZenkatsuRecordShelf.svelte:436](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuRecordShelf.svelte#L436)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* --- メダルケース --- */
```

<!-- source: src/lib/components/ZenkatsuRecordShelf.svelte:557 -->

### [src/lib/components/ZenkatsuRecordShelf.svelte:557](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuRecordShelf.svelte#L557)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* --- コンボ図鑑（スタンプ帳） --- */
```

<!-- source: src/lib/components/ZenkatsuRecordShelf.svelte:596 -->

### [src/lib/components/ZenkatsuRecordShelf.svelte:596](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuRecordShelf.svelte#L596)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 図鑑番号。右上は★と👀が使うので左上に置く。 */
```

<!-- source: src/lib/components/ZenkatsuRecordShelf.svelte:611 -->

### [src/lib/components/ZenkatsuRecordShelf.svelte:611](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuRecordShelf.svelte#L611)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 構成札をトランプの手札のように扇形に重ねる。色はスロットの代表属性。 */
```

<!-- source: src/lib/components/ZenkatsuRecordShelf.svelte:628 -->

### [src/lib/components/ZenkatsuRecordShelf.svelte:628](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuRecordShelf.svelte#L628)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 伏せ札は裏向きの札。必要な枚数だけ並ぶ。 */
```

<!-- source: src/lib/components/ZenkatsuRecordShelf.svelte:678 -->

### [src/lib/components/ZenkatsuRecordShelf.svelte:678](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ZenkatsuRecordShelf.svelte#L678)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 1スロットに複数あるのは「どちらでもよい」。 */
```

## src/lib/zenkatsu/notice.ts

<!-- source: src/lib/zenkatsu/notice.ts:5 -->

### [src/lib/zenkatsu/notice.ts:5](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/zenkatsu/notice.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** JST の午前4時を境にしたプレイ日。 */
```

<!-- source: src/lib/zenkatsu/notice.ts:50 -->

### [src/lib/zenkatsu/notice.ts:50](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/zenkatsu/notice.ts#L50)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 認証や通信に失敗した状態で未プレイと断定しない。
```

## src/routes/advent/+page.svelte

<!-- source: src/routes/advent/+page.svelte:39 -->

### [src/routes/advent/+page.svelte:39](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/advent/+page.svelte#L39)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 既読と開封済みは、ログインの状態が決まってから読む。ゲストは手紙を出さない。
```

<!-- source: src/routes/advent/+page.svelte:57 -->

### [src/routes/advent/+page.svelte:57](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/advent/+page.svelte#L57)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 読めないときは手紙を出さない（開けたかどうか分からないまま出さない）。
```

<!-- source: src/routes/advent/+page.svelte:61 -->

### [src/routes/advent/+page.svelte:61](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/advent/+page.svelte#L61)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 画面に出した日まで既読にして、メニューのバッジを消す。
```

## src/routes/affirmation/+page.svelte

<!-- source: src/routes/affirmation/+page.svelte:3 -->

### [src/routes/affirmation/+page.svelte:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/affirmation/+page.svelte#L3)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 昔からの全肯定フィードの URL。いまは `/feed?tab=affirmation`（kind: custom）と同じ中身で、
	// ブックマークや外部リンクのために残してある。
```

## src/routes/cards/+page.svelte

<!-- source: src/routes/cards/+page.svelte:12 -->

### [src/routes/cards/+page.svelte:12](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/cards/+page.svelte#L12)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * 全肯定カードのページ。5タブで役割を分ける。
	 * - あそぶ: ゼンカツ！の今日のお題・プレイ・記録
	 * - おすそわけ: だぶったカードを置いて Ƶ をもらい、持っていないカードを受け取る
	 * - ニュース: 今この瞬間の出来事（レアドローと、ゼンカツの珍しい回）
	 * - レコード: 見つけたコンボ・受け取ったトロフィー
	 * - マイデッキ: 自分のカード図鑑
	 *
	 * 遊ぶ・交換するの「手を動かす」タブを左に、眺めるタブを右に寄せる。
	 * ゼンカツを先頭に置く。**1日1回しかできない**のはこのタブだけで、
	 * 遅れて気づくほど損をする。ニュースとデッキはいつ見ても同じものが見られる。
	 */
```

<!-- source: src/routes/cards/+page.svelte:32 -->

### [src/routes/cards/+page.svelte:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/cards/+page.svelte#L32)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 「カードが届きました」通知からはおすそわけタブへ直接来る（?tab=board）。
```

<!-- source: src/routes/cards/+page.svelte:37 -->

### [src/routes/cards/+page.svelte:37](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/cards/+page.svelte#L37)

分類: 仕様・設計の根拠。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- 今日の一枚はフィードではなくここから引く。引けるものが無い日は何も描かない。 -->
```

## src/routes/dev/advent/+page.svelte

<!-- source: src/routes/dev/advent/+page.svelte:6 -->

### [src/routes/dev/advent/+page.svelte:6](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/advent/+page.svelte#L6)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * アドカレ（ツリー・カード・手紙の開封演出）を AppView なしで確かめるページ。
	 * 開いた日数を変えるとツリーの埋まり方を、「自分のカード」を押すと手紙の演出を見られる。
	 * アバターは Nagi のアイコンを借りる（一部はアバターなしの見た目を確かめる）。
	 */
```

## src/routes/dev/cards/+page.svelte

<!-- source: src/routes/dev/cards/+page.svelte:10 -->

### [src/routes/dev/cards/+page.svelte:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/cards/+page.svelte#L10)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * カードまわりの見た目をまとめて確認するための開発専用ページ（/dev/cards）。
	 * 本番では +page.ts が 404 を投げる。
	 *
	 * その日ぶんを引いてしまうと FAB もドロー演出も二度と見られなくなるので、
	 * サーバーにもセッションにも触らないモックだけでここに並べる。カード定義は
	 * AppView 側の cards_v1.json（別リポジトリ）にあるため、代表ぶんを手書きで持つ。
	 */
```

<!-- source: src/routes/dev/cards/+page.svelte:58 -->

### [src/routes/dev/cards/+page.svelte:58](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/cards/+page.svelte#L58)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 記念日カード。段 0・card_number = 西暦*100+slot・レアリティは常に UR、というサーバー側の
	 * 組み立て（shared-configs の buildAnniversaryCardDef）をここでは手で真似ている。
	 * art つきの1枚（ハロウィン）で背景の見え方を、art なしの1枚で従来の見た目を確認する。
	 */
```

<!-- source: src/routes/dev/cards/+page.svelte:133 -->

### [src/routes/dev/cards/+page.svelte:133](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/cards/+page.svelte#L133)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// --- FAB ---------------------------------------------------------------
```

<!-- source: src/routes/dev/cards/+page.svelte:139 -->

### [src/routes/dev/cards/+page.svelte:139](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/cards/+page.svelte#L139)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// --- CardDetailDialog --------------------------------------------------
```

<!-- source: src/routes/dev/cards/+page.svelte:155 -->

### [src/routes/dev/cards/+page.svelte:155](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/cards/+page.svelte#L155)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 演出をやり直すための再マウント用キー。
```

<!-- source: src/routes/dev/cards/+page.svelte:207 -->

### [src/routes/dev/cards/+page.svelte:207](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/cards/+page.svelte#L207)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// commentJa/En を入れないので「考え中」の吹き出しが出る。実際に getCards を
				// 叩きに行って失敗し続け、60 秒後に cardCommentNotReady へ落ちる。
```

<!-- source: src/routes/dev/cards/+page.svelte:226 -->

### [src/routes/dev/cards/+page.svelte:226](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/cards/+page.svelte#L226)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 記念日は受け取り＝常に新規。NEW CARD の代わりに見出しが出る分岐を通る。
```

<!-- source: src/routes/dev/cards/+page.svelte:229 -->

### [src/routes/dev/cards/+page.svelte:229](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/cards/+page.svelte#L229)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 見本ページなので固定でよい（PDS への控えはここからは書かない）。
```

<!-- source: src/routes/dev/cards/+page.svelte:324 -->

### [src/routes/dev/cards/+page.svelte:324](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/cards/+page.svelte#L324)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
<!-- size-full は inline-size: min(100%, 300px) なので、幅の決まった器に入れないと
	     aspect-ratio から高さを解けず、隣の節へはみ出す。器は必ず固定幅で置く。 -->
```

<!-- source: src/routes/dev/cards/+page.svelte:399 -->

### [src/routes/dev/cards/+page.svelte:399](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/cards/+page.svelte#L399)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* main は minmax(0, 600px)。中身が min-content で押し広げるとシェルごと横に
		   はみ出すので、この節より内側は必ず幅 0 まで縮められるようにしておく。 */
```

<!-- source: src/routes/dev/cards/+page.svelte:434 -->

### [src/routes/dev/cards/+page.svelte:434](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/cards/+page.svelte#L434)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* fixed を打ち消してインラインで並べるためのコンテナ。 */
```

<!-- source: src/routes/dev/cards/+page.svelte:465 -->

### [src/routes/dev/cards/+page.svelte:465](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/cards/+page.svelte#L465)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/* 器の幅を固定して、size-full の min(100%, 300px) を確定値にする。 */
```

## src/routes/dev/cards/+page.ts

<!-- source: src/routes/dev/cards/+page.ts:4 -->

### [src/routes/dev/cards/+page.ts:4](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/cards/+page.ts#L4)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
 * カードまわりの見た目を、サーバーもセッションも無しで一覧するための開発用ページ。
 * dev はビルド時に false へ畳まれるので、本番ビルドでは必ず 404 になる。
 */
```

## src/routes/dev/e2e/zenkatsu/+page.svelte

<!-- source: src/routes/dev/e2e/zenkatsu/+page.svelte:29 -->

### [src/routes/dev/e2e/zenkatsu/+page.svelte:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/e2e/zenkatsu/+page.svelte#L29)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// ?restore: OAuth の復元は本番では盤面より遅れて終わる。その順序を再現して、
		// 復元に伴う取り直しが一度出したお題を消さないことを確かめられるようにする。
```

## src/routes/dev/record/+page.svelte

<!-- source: src/routes/dev/record/+page.svelte:11 -->

### [src/routes/dev/record/+page.svelte:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/record/+page.svelte#L11)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/**
	 * レコードタブ（ZenkatsuRecordShelf）をAppViewなしで確かめるページ。
	 * モックはブラウザ内だけで描画し、どこにも送信しない。
	 */
```

<!-- source: src/routes/dev/record/+page.svelte:69 -->

### [src/routes/dev/record/+page.svelte:69](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/record/+page.svelte#L69)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/** 見つけた n 種のあとから total 種目までの伏せ札。3つおきに「世界で発見済み」にする。 */
```

## tests/e2e/card-draw-notice.spec.ts

<!-- source: tests/e2e/card-draw-notice.spec.ts:10 -->

### [tests/e2e/card-draw-notice.spec.ts:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/card-draw-notice.spec.ts#L10)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// OAuth の復元はレイアウトの初回描画より遅れて終わる（?restore で再現する）。
	// その順序でも、今日の一枚が未ドローならナビの「カードゲーム」に点が付くこと。
```

## tests/e2e/zenkatsu.spec.ts

<!-- source: tests/e2e/zenkatsu.spec.ts:65 -->

### [tests/e2e/zenkatsu.spec.ts:65](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L65)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// カットインでは botたんが受け取り手として立つ。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:99 -->

### [tests/e2e/zenkatsu.spec.ts:99](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L99)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 提出に失敗しても、書いた意図は消さない。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:121 -->

### [tests/e2e/zenkatsu.spec.ts:121](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L121)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
	 * 総評は提出より遅れて載る。盤面が提出直後に引く1回では間に合わず、
	 * ゲーム側のポーリングが先に受け取る。閉じたあとに引き直せているかを、この時間差で見る。
	 */
```

<!-- source: tests/e2e/zenkatsu.spec.ts:187 -->

### [tests/e2e/zenkatsu.spec.ts:187](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L187)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// Leave the board loading long enough to cover the cut-in transition.
```

<!-- source: tests/e2e/zenkatsu.spec.ts:245 -->

### [tests/e2e/zenkatsu.spec.ts:245](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L245)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 作者の意図は前後の空白を落として、提出と同じレコードに入る。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:247 -->

### [tests/e2e/zenkatsu.spec.ts:247](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L247)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 翻訳の原文判定に使うので、投稿と同じく投稿言語の設定を書く。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:255 -->

### [tests/e2e/zenkatsu.spec.ts:255](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L255)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 閉じたあとの記録欄に総評が載っていること（提出直後の再取得だけだと「考えているよ…」で止まる）。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:258 -->

### [tests/e2e/zenkatsu.spec.ts:258](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L258)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 作者の意図は最初は畳んでおき、開いたときだけ本文を出す。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:320 -->

### [tests/e2e/zenkatsu.spec.ts:320](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L320)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 畳んだままの意図で生成枠を使わない。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:327 -->

### [tests/e2e/zenkatsu.spec.ts:327](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L327)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 意図はただのテキスト欄なので、訳文の改行もそのまま出す。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:366 -->

### [tests/e2e/zenkatsu.spec.ts:366](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L366)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// パネルの中を押しても閉じない。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:369 -->

### [tests/e2e/zenkatsu.spec.ts:369](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L369)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// ::backdrop（パネルの外）は閉じる。アプリの他のモーダルと同じ挙動。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:400 -->

### [tests/e2e/zenkatsu.spec.ts:400](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L400)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 既定はゼンカツタブ。この検証はニュース側なので開き直す（このテストはロケールを固定しない）。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:448 -->

### [tests/e2e/zenkatsu.spec.ts:448](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L448)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 演出が終わったら、成立した全項目が説明文つきで**同時に**残っていること。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:484 -->

### [tests/e2e/zenkatsu.spec.ts:484](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L484)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
/*
		 * お題が出たあとに「…」へ戻った回数を数える。web-first assertion は条件が揃うまで
		 * 待つので、消えて戻る往復をまたいで通ってしまう。画面を細かく見張って捕まえる。
		 */
```

<!-- source: tests/e2e/zenkatsu.spec.ts:499 -->

### [tests/e2e/zenkatsu.spec.ts:499](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L499)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 復元後の取り直しだけを遅くして、その最中の盤面を見えるようにする。本番でもこの
		// 2回目はログイン中の経路（PDS プロキシ）を通るので、1回目より確実に遅い。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:520 -->

### [tests/e2e/zenkatsu.spec.ts:520](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L520)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 復元に伴う取り直しは起きていて、viewer 付きの盤面に静かに入れ替わる。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:523 -->

### [tests/e2e/zenkatsu.spec.ts:523](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L523)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// その間、一度出したお題は消えない。ここが「…」に戻ると、ログインしている人だけが
	// 復元を待つ数秒のあいだ、空の盤面を見ることになる。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:540 -->

### [tests/e2e/zenkatsu.spec.ts:540](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L540)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// ナビの未プレイ表示もサインイン時に認証付きで取りに来るので、回数ではなく種類で数える。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:564 -->

### [tests/e2e/zenkatsu.spec.ts:564](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L564)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 盤面がマウントされる前にログイン済みにする（ページ遷移時と同じ順序）。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:687 -->

### [tests/e2e/zenkatsu.spec.ts:687](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L687)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// ナビの未プレイ表示もサインイン時に認証付きで取りに来るので、盤面の分だけを
		// 止めようとせず、release までの認証付き取得をすべて止める。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:865 -->

### [tests/e2e/zenkatsu.spec.ts:865](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L865)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 世界初の発見は、ゼンカツの回そのものだが見出しが変わる。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:869 -->

### [tests/e2e/zenkatsu.spec.ts:869](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L869)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 世界初の印は、成立した2つのうち pioneer のぶんだけに付く。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:872 -->

### [tests/e2e/zenkatsu.spec.ts:872](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L872)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 既存のリアクションが並び、絵文字を足す導線がある。
```

<!-- source: tests/e2e/zenkatsu.spec.ts:877 -->

### [tests/e2e/zenkatsu.spec.ts:877](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/zenkatsu.spec.ts#L877)

分類: 検証・再現条件。対応仕様: [cards-zenkatsu-advent](../../specs/cards-zenkatsu-advent/spec.md#requirements)。

```text
// 札をタップすると拡大表示が開く。
```
