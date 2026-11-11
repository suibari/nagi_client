# radio：設計判断・コメント出典

この文書は初期仕様化時点のコメント原文を保存する設計資料である。現在の振る舞い・検証条件は [spec.md](spec.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/radio/RadioContent.svelte

<!-- source: src/lib/radio/RadioContent.svelte:50 -->

### [src/lib/radio/RadioContent.svelte:50](../../../src/lib/radio/RadioContent.svelte#L50)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
<!-- ニュース（NewsSidebarContent）と同じ操作行。主ボタンはポスト、共有はアイコンで。 -->
```

<!-- source: src/lib/radio/RadioContent.svelte:74 -->

### [src/lib/radio/RadioContent.svelte:74](../../../src/lib/radio/RadioContent.svelte#L74)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/* 正方形のジャケットを切り抜かず、画像全体を見せる。 */
```

<!-- source: src/lib/radio/RadioContent.svelte:137 -->

### [src/lib/radio/RadioContent.svelte:137](../../../src/lib/radio/RadioContent.svelte#L137)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/* ニュースの操作行（.news-actions）と同じ寸法。サイドバー幅に1行で収める。 */
```

## src/lib/radio/RadioPlaylist.svelte

<!-- source: src/lib/radio/RadioPlaylist.svelte:9 -->

### [src/lib/radio/RadioPlaylist.svelte:9](../../../src/lib/radio/RadioPlaylist.svelte#L9)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/**
	 * ラジオ履歴を「DJブース＋レコード棚」で見せる。
	 *
	 * 1曲ごとにコメント全文を並べると画面が文字で埋まるので、コメントはブースの吹き出し1か所だけに出す。
	 * 棚のジャケットにホバー（またはフォーカス）するとその曲を試聴するように吹き出しが切り替わり、
	 * クリックで針を落とす（固定する）。指を離すと固定中の曲に戻る。最初は最新の曲に針が乗っている。
	 */
```

<!-- source: src/lib/radio/RadioPlaylist.svelte:26 -->

### [src/lib/radio/RadioPlaylist.svelte:26](../../../src/lib/radio/RadioPlaylist.svelte#L26)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/** 放送は日本時間で区切っているので、日付の束ねも日本時間で行う。 */
```

<!-- source: src/lib/radio/RadioPlaylist.svelte:55 -->

### [src/lib/radio/RadioPlaylist.svelte:55](../../../src/lib/radio/RadioPlaylist.svelte#L55)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/** ジャケットが無い曲は、曲名から決まる色のスリーブを作る（同じ曲はいつも同じ色）。 */
```

<!-- source: src/lib/radio/RadioPlaylist.svelte:117 -->

### [src/lib/radio/RadioPlaylist.svelte:117](../../../src/lib/radio/RadioPlaylist.svelte#L117)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
<!-- ニュース一覧のカード（NewsCard）と同じ操作行。曲のページへのリンクは右端へ。 -->
```

<!-- source: src/lib/radio/RadioPlaylist.svelte:204 -->

### [src/lib/radio/RadioPlaylist.svelte:204](../../../src/lib/radio/RadioPlaylist.svelte#L204)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/* スリーブから顔を出すレコードが画面の外へはみ出さないように。clip ならブースの sticky は効いたまま。 */
```

<!-- source: src/lib/radio/RadioPlaylist.svelte:208 -->

### [src/lib/radio/RadioPlaylist.svelte:208](../../../src/lib/radio/RadioPlaylist.svelte#L208)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/* --- DJブース --- */
```

<!-- source: src/lib/radio/RadioPlaylist.svelte:244 -->

### [src/lib/radio/RadioPlaylist.svelte:244](../../../src/lib/radio/RadioPlaylist.svelte#L244)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/* 溝を同心円の縞で描く。ラベルの色は曲ごとに変わる。 */
```

<!-- source: src/lib/radio/RadioPlaylist.svelte:355 -->

### [src/lib/radio/RadioPlaylist.svelte:355](../../../src/lib/radio/RadioPlaylist.svelte#L355)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/* 吹き出しは一定の高さに収め、長いコメントだけ中でスクロールさせる（ブースが画面を覆わないように）。 */
```

<!-- source: src/lib/radio/RadioPlaylist.svelte:385 -->

### [src/lib/radio/RadioPlaylist.svelte:385](../../../src/lib/radio/RadioPlaylist.svelte#L385)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/* ニュース一覧のカードの操作行（.news-actions）と同じ寸法。 */
```

<!-- source: src/lib/radio/RadioPlaylist.svelte:419 -->

### [src/lib/radio/RadioPlaylist.svelte:419](../../../src/lib/radio/RadioPlaylist.svelte#L419)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/* --- レコード棚 --- */
```

<!-- source: src/lib/radio/RadioPlaylist.svelte:424 -->

### [src/lib/radio/RadioPlaylist.svelte:424](../../../src/lib/radio/RadioPlaylist.svelte#L424)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/* カセットのラベル風の日付見出し。 */
```

<!-- source: src/lib/radio/RadioPlaylist.svelte:503 -->

### [src/lib/radio/RadioPlaylist.svelte:503](../../../src/lib/radio/RadioPlaylist.svelte#L503)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/* スリーブの後ろに隠れたレコード。ホバーや再生中にすっと顔を出す。 */
```

<!-- source: src/lib/radio/RadioPlaylist.svelte:564 -->

### [src/lib/radio/RadioPlaylist.svelte:564](../../../src/lib/radio/RadioPlaylist.svelte#L564)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/* 再生中のスリーブにだけ出るイコライザー。 */
```

## src/lib/radio/RadioQuoteCard.svelte

<!-- source: src/lib/radio/RadioQuoteCard.svelte:9 -->

### [src/lib/radio/RadioQuoteCard.svelte:9](../../../src/lib/radio/RadioQuoteCard.svelte#L9)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/**
	 * ポストが引用したbotたんラジオ。ニュースの引用（NewsQuoteCard）と同じ枠で、
	 * botたんの吹き出しにDJコメント、その下に曲のカードを出す。
	 */
```

<!-- source: src/lib/radio/RadioQuoteCard.svelte:26 -->

### [src/lib/radio/RadioQuoteCard.svelte:26](../../../src/lib/radio/RadioQuoteCard.svelte#L26)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
<!-- 吹き出しとカードの並びは NewsQuoteCard とそろえる。 -->
```

<!-- source: src/lib/radio/RadioQuoteCard.svelte:36 -->

### [src/lib/radio/RadioQuoteCard.svelte:36](../../../src/lib/radio/RadioQuoteCard.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/* .bubble のしっぽ（::before が left: -8px）が切れないよう左に逃がす。 */
```

<!-- source: src/lib/radio/RadioQuoteCard.svelte:41 -->

### [src/lib/radio/RadioQuoteCard.svelte:41](../../../src/lib/radio/RadioQuoteCard.svelte#L41)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/* 正方形のジャケットを切り抜かず、画像全体を見せる（RadioContent と同じ）。 */
```

## src/lib/radio/notice.test.ts

<!-- source: src/lib/radio/notice.test.ts:45 -->

### [src/lib/radio/notice.test.ts:45](../../../src/lib/radio/notice.test.ts#L45)

分類: 検証・再現条件。対応仕様: [radio](spec.md#requirements)。

```text
// 別端末で既読になった状態を復帰時に反映する。
```

## src/lib/radio/radio.svelte.ts

<!-- source: src/lib/radio/radio.svelte.ts:45 -->

### [src/lib/radio/radio.svelte.ts:45](../../../src/lib/radio/radio.svelte.ts#L45)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/** 起動・ログインと画面復帰で取得する。開きっぱなしでの定期取得はしない。 */
```

## src/lib/radio/share.ts

<!-- source: src/lib/radio/share.ts:10 -->

### [src/lib/radio/share.ts:10](../../../src/lib/radio/share.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/** いま表示している言語のDJコメント。 */
```

<!-- source: src/lib/radio/share.ts:14 -->

### [src/lib/radio/share.ts:14](../../../src/lib/radio/share.ts#L14)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/** ラジオの公開レコードを書く権限があるか。無ければポストモーダルで再認可を案内する。 */
```

<!-- source: src/lib/radio/share.ts:17 -->

### [src/lib/radio/share.ts:17](../../../src/lib/radio/share.ts#L17)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/** ラジオの1回を引用してポストする。ニュースの「コメント」（quoteNews）と同じ扱い。 */
```

<!-- source: src/lib/radio/share.ts:26 -->

### [src/lib/radio/share.ts:26](../../../src/lib/radio/share.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/**
 * 曲ページを共有シートで、無ければクリップボードへ。ニュースの共有（shareNews）と同じ扱いで、
 * クリップボードへコピーしたときだけ true。共有シートを閉じただけなら false、それ以外は throw。
 */
```

## src/lib/radio/song-card.ts

<!-- source: src/lib/radio/song-card.ts:12 -->

### [src/lib/radio/song-card.ts:12](../../../src/lib/radio/song-card.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [radio](spec.md#requirements)。

```text
/** 新しい曲リンクと、移行前のYouTube履歴の両方を表示する。 */
```

## src/routes/dev/radio/+page.svelte

<!-- source: src/routes/dev/radio/+page.svelte:6 -->

### [src/routes/dev/radio/+page.svelte:6](../../../src/routes/dev/radio/+page.svelte#L6)

分類: 検証・再現条件。対応仕様: [radio](spec.md#requirements)。

```text
/**
	 * botたんラジオのプレイリスト表示（RadioPlaylist）をAppViewなしで確かめるページ。
	 * 「いまの表示」に切り替えると、本番の /radio と同じ並べ方と見比べられる。
	 * ジャケットは last.fm の画像を1枚だけ借り、残りはジャケットなしの見た目を確かめる。
	 */
```

<!-- source: src/routes/dev/radio/+page.svelte:36 -->

### [src/routes/dev/radio/+page.svelte:36](../../../src/routes/dev/radio/+page.svelte#L36)

分類: 検証・再現条件。対応仕様: [radio](spec.md#requirements)。

```text
// 1日2〜3枠、新しい順。
```
