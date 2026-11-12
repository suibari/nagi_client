# ニュース・年表：導入時コメント原文

この文書は基準コミット `24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf` に固定した履歴資料であり、現行コードの行番号一覧ではない。現在の要件は [spec.md](../../specs/news-chronicle/spec.md)、判断理由は [design.md](../../specs/news-chronicle/design.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/chronicle/chronicle.ts

<!-- source: src/lib/chronicle/chronicle.ts:3 -->

### [src/lib/chronicle/chronicle.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/chronicle.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * 年表の見せ方を決める純関数だけを置く。
 * $lib/diary/calendar.ts と同じで、ロジックをコンポーネントから出してテストできるようにする。
 */
```

<!-- source: src/lib/chronicle/chronicle.ts:10 -->

### [src/lib/chronicle/chronicle.ts:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/chronicle.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * 年ごとにまとめる。**サーバが1ページ＝1年を古い順で返すので、通常はページ境界と一致する。**
 * それでも自前でまとめ直すのは、ページをまたいで同じ年が続く場合（将来カーソルを
 * 変えたとき）に見出しが二度出ないようにするため。
 *
 * 並べ替えはしない。サーバが決めた順序（古い順）をそのまま保つ。
 */
```

<!-- source: src/lib/chronicle/chronicle.ts:28 -->

### [src/lib/chronicle/chronicle.ts:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/chronicle.ts#L28)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * 追加ページを既存へ足す。**id で重複を落とす。**
 * 同じ年をもう一度読んだときに行が二重に並ぶのを防ぐ（「はじめて」の記録は
 * どの年窓からも同じ id で出うる）。
 */
```

<!-- source: src/lib/chronicle/chronicle.ts:41 -->

### [src/lib/chronicle/chronicle.ts:41](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/chronicle.ts#L41)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** kind ごとのアイコン名（$lib/components/shell/Icon.svelte の名前）。 */
```

<!-- source: src/lib/chronicle/chronicle.ts:54 -->

### [src/lib/chronicle/chronicle.ts:54](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/chronicle.ts#L54)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * 年表に出す見出し。
 *
 * **LLM が書いた kind だけサーバの文字列を使い、それ以外は i18n から引く。**
 * 固定文言をサーバに作らせると、その行を作った時点の言語で固まってしまう。
 * labels は呼び出し側が m から渡す（このファイルを i18n に依存させないため＝テストが軽い）。
 */
```

<!-- source: src/lib/chronicle/chronicle.ts:72 -->

### [src/lib/chronicle/chronicle.ts:72](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/chronicle.ts#L72)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** ひとこと。LLM が書いた kind にだけ入る。 */
```

<!-- source: src/lib/chronicle/chronicle.ts:83 -->

### [src/lib/chronicle/chronicle.ts:83](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/chronicle.ts#L83)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * その月のニュースを、同じ月の最後の項目の**下に紐づける**ための判定。
 *
 * サーバは news_context を月末の日付で返すので、昇順に並べればその月のまとめの後ろに来る。
 * 表示側はそれを独立した節目ではなく、**直前のまとめに付く一行**として描く
 * （日付も出さない。「8/19 まとめ ＋ その下にこの頃の世間の出来事」という読ませ方）。
 */
```

## src/lib/chronicle/notice.ts

<!-- source: src/lib/chronicle/notice.ts:35 -->

### [src/lib/chronicle/notice.ts:35](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/notice.ts#L35)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** 年全体を読み込めたページだけ既読にする。未表示の年は残す。 */
```

<!-- source: src/lib/chronicle/notice.ts:81 -->

### [src/lib/chronicle/notice.ts:81](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/notice.ts#L81)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* 通信失敗では未読状態を変えない。 */
```

<!-- source: src/lib/chronicle/notice.ts:85 -->

### [src/lib/chronicle/notice.ts:85](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/notice.ts#L85)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 取得中に新しい年ページを読んだ場合、古い取得結果では上書きしない。
```

<!-- source: src/lib/chronicle/notice.ts:101 -->

### [src/lib/chronicle/notice.ts:101](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/notice.ts#L101)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 同じアカウントの別タブで既読にした内容を反映する。
```

## src/lib/chronicle/read-state.test.ts

<!-- source: src/lib/chronicle/read-state.test.ts:76 -->

### [src/lib/chronicle/read-state.test.ts:76](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/read-state.test.ts#L76)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 古い画面からの再送
```

## src/lib/chronicle/read-state.ts

<!-- source: src/lib/chronicle/read-state.ts:8 -->

### [src/lib/chronicle/read-state.ts:8](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/read-state.ts#L8)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** 従来の端末内既読の移行用。新しい既読のハッシュはサーバーが発行する。 */
```

<!-- source: src/lib/chronicle/read-state.ts:55 -->

### [src/lib/chronicle/read-state.ts:55](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/read-state.ts#L55)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* 保存不可でもサーバーから回復する。 */
```

<!-- source: src/lib/chronicle/read-state.ts:68 -->

### [src/lib/chronicle/read-state.ts:68](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/read-state.ts#L68)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* 通信・ストレージが使えなくてもメモリの既読は保持する。 */
```

<!-- source: src/lib/chronicle/read-state.ts:92 -->

### [src/lib/chronicle/read-state.ts:92](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/read-state.ts#L92)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 古い版はサーバーが保存しない。再送し続けず、返された確定値を採用する。
```

<!-- source: src/lib/chronicle/read-state.ts:96 -->

### [src/lib/chronicle/read-state.ts:96](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/read-state.ts#L96)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* 未送信の年は次の閲覧・画面復帰で再送する。 */
```

<!-- source: src/lib/chronicle/read-state.ts:123 -->

### [src/lib/chronicle/read-state.ts:123](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/read-state.ts#L123)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** 元の端末でその年の全項目を読んでいた場合だけ年単位へ移行する。 */
```

<!-- source: src/lib/chronicle/read-state.ts:153 -->

### [src/lib/chronicle/read-state.ts:153](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/read-state.ts#L153)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* 壊れた従来の保存は既読扱いにしない。 */
```

<!-- source: src/lib/chronicle/read-state.ts:156 -->

### [src/lib/chronicle/read-state.ts:156](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/chronicle/read-state.ts#L156)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** 他のタブが保存した既読を取り込む。自分の未送信分は残す。 */
```

## src/lib/components/ChronicleTimeline.svelte

<!-- source: src/lib/components/ChronicleTimeline.svelte:28 -->

### [src/lib/components/ChronicleTimeline.svelte:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L28)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** 見出しに出す本人の名前。取れないうちは節目だけ先に見せる。 */
```

<!-- source: src/lib/components/ChronicleTimeline.svelte:30 -->

### [src/lib/components/ChronicleTimeline.svelte:30](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L30)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** 年表の表紙に添える本人のプロフィール画像。 */
```

<!-- source: src/lib/components/ChronicleTimeline.svelte:32 -->

### [src/lib/components/ChronicleTimeline.svelte:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L32)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
		 * 開発専用（/dev/chronicle）。渡されたらAPIを叩かず、この配列を年表として描く。
		 * 数年ぶんの年表を seed しないと演出を確認できない、という状態を避けるためだけの口。
		 */
```

<!-- source: src/lib/components/ChronicleTimeline.svelte:55 -->

### [src/lib/components/ChronicleTimeline.svelte:55](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L55)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
	 * 固定文言の kind はここで i18n から引く。サーバは kind しか返さないので、
	 * 言語を切り替えると過去の節目のラベルもそのまま追従する。
	 */
```

<!-- source: src/lib/components/ChronicleTimeline.svelte:105 -->

### [src/lib/components/ChronicleTimeline.svelte:105](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L105)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
	 * スクロールで1件ずつ姿を現す演出。
	 *
	 * **要素の基底状態を opacity: 0 にしてはいけない。** base.css の
	 * `prefers-reduced-motion` は `animation: none !important` を全要素に当てるので、
	 * 基底が透明だと演出を切った人には永久に見えないままになる。
	 * opacity: 0 は @keyframes の from にだけ書き、ここでは観測自体を止める。
	 */
```

<!-- source: src/lib/components/ChronicleTimeline.svelte:143 -->

### [src/lib/components/ChronicleTimeline.svelte:143](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L143)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
<!-- ただの「年表」ではなく「〜の年表」。その人のための1冊として読ませる。 -->
```

<!-- source: src/lib/components/ChronicleTimeline.svelte:158 -->

### [src/lib/components/ChronicleTimeline.svelte:158](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L158)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
<!--
							そのころ世の中では。独立した節目ではなく、直前のまとめに**付く一行**として描く。
							日付も出さない（月末に寄せてあるだけで、その日の出来事ではない）。
						-->
```

<!-- source: src/lib/components/ChronicleTimeline.svelte:164 -->

### [src/lib/components/ChronicleTimeline.svelte:164](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L164)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
<!--
								見出しは**記事の原題**をそのまま出す（botたんの言い換えは使わない）。
								news.title はサーバが表示言語に合わせて選んだ値。
							-->
```

<!-- source: src/lib/components/ChronicleTimeline.svelte:190 -->

### [src/lib/components/ChronicleTimeline.svelte:190](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L190)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
<!--
										ひとことは botたんの言葉なので吹き出しで出す。
										アプリの他の場所（リプライ・日記・ニュース）と同じ .bubble を借りる。
										ここは ChatBubble の中ではないが、話し手はレールのアイコンで分かるので
										名前とアバターは重ねない。
									-->
```

<!-- source: src/lib/components/ChronicleTimeline.svelte:201 -->

### [src/lib/components/ChronicleTimeline.svelte:201](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L201)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
<!-- draw は渡さない。過去の1枚を見返すのに、毎回フリップと紙吹雪で祝わせない。 -->
```

<!-- source: src/lib/components/ChronicleTimeline.svelte:279 -->

### [src/lib/components/ChronicleTimeline.svelte:279](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L279)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* 一覧の見出しより大きく、1冊の表紙のように見せる。 */
```

<!-- source: src/lib/components/ChronicleTimeline.svelte:321 -->

### [src/lib/components/ChronicleTimeline.svelte:321](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L321)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* 縦のレール。節目のあいだを1本の線でつなぐ。 */
```

<!-- source: src/lib/components/ChronicleTimeline.svelte:337 -->

### [src/lib/components/ChronicleTimeline.svelte:337](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L337)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* 次の項目のアイコンまで、項目間の gap と上 padding もつなぐ。 */
```

<!-- source: src/lib/components/ChronicleTimeline.svelte:367 -->

### [src/lib/components/ChronicleTimeline.svelte:367](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L367)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* .bubble のしっぽ（::before が left: -8px）が切れないよう左に逃がす。 */
```

<!-- source: src/lib/components/ChronicleTimeline.svelte:383 -->

### [src/lib/components/ChronicleTimeline.svelte:383](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ChronicleTimeline.svelte#L383)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* まとめに付く一行。軸の右側に、控えめに寄せる。 */
```

## src/lib/components/NewsSubmissionDialog.svelte

<!-- source: src/lib/components/NewsSubmissionDialog.svelte:50 -->

### [src/lib/components/NewsSubmissionDialog.svelte:50](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsSubmissionDialog.svelte#L50)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 同じ画面を開いている間はメモリ上のStrongRefで再試行できる。
```

<!-- source: src/lib/components/NewsSubmissionDialog.svelte:91 -->

### [src/lib/components/NewsSubmissionDialog.svelte:91](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsSubmissionDialog.svelte#L91)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 履歴の取得失敗はURL追加フォーム自体を塞がない。
```

<!-- source: src/lib/components/NewsSubmissionDialog.svelte:124 -->

### [src/lib/components/NewsSubmissionDialog.svelte:124](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsSubmissionDialog.svelte#L124)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// URLを貼ったらそのまま読み取る。手入力のときは「読み取る」ボタンか Enter で読む。
```

<!-- source: src/lib/components/NewsSubmissionDialog.svelte:141 -->

### [src/lib/components/NewsSubmissionDialog.svelte:141](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsSubmissionDialog.svelte#L141)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 権限を断られたら、いつもどおり手で貼ってもらう。
```

<!-- source: src/lib/components/NewsSubmissionDialog.svelte:147 -->

### [src/lib/components/NewsSubmissionDialog.svelte:147](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsSubmissionDialog.svelte#L147)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 読み取り後に書き換えたら、古いプレビューのまま追加させない。
```

<!-- source: src/lib/components/NewsSubmissionDialog.svelte:165 -->

### [src/lib/components/NewsSubmissionDialog.svelte:165](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsSubmissionDialog.svelte#L165)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// サーバーは受け付けた時点で掲載するので、一覧をすぐ取り直す。
```

<!-- source: src/lib/components/NewsSubmissionDialog.svelte:542 -->

### [src/lib/components/NewsSubmissionDialog.svelte:542](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsSubmissionDialog.svelte#L542)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* URL欄 */
```

<!-- source: src/lib/components/NewsSubmissionDialog.svelte:666 -->

### [src/lib/components/NewsSubmissionDialog.svelte:666](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsSubmissionDialog.svelte#L666)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* プレビューは一覧のニュースカードと同じ並び */
```

<!-- source: src/lib/components/NewsSubmissionDialog.svelte:731 -->

### [src/lib/components/NewsSubmissionDialog.svelte:731](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/NewsSubmissionDialog.svelte#L731)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* 履歴 */
```

## src/lib/components/chronicle-motion.test.ts

<!-- source: src/lib/components/chronicle-motion.test.ts:1 -->

### [src/lib/components/chronicle-motion.test.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/chronicle-motion.test.ts#L1)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 静的ソース検査は Vitest の Node 環境で実行する（interaction-motion.test.ts と同じ流儀）。
```

<!-- source: src/lib/components/chronicle-motion.test.ts:17 -->

### [src/lib/components/chronicle-motion.test.ts:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/chronicle-motion.test.ts#L17)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// base.css が全要素へ animation: none !important を当てるので、
		// 要素側に opacity: 0 を置くと演出を切っている人には永久に見えない。
```

<!-- source: src/lib/components/chronicle-motion.test.ts:38 -->

### [src/lib/components/chronicle-motion.test.ts:38](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/chronicle-motion.test.ts#L38)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 「8/19 まとめ ＋ その下にこの頃の世間の出来事」という読ませ方。
		// 月まとめのニュースだけは大きなニュースカードにしない。
```

<!-- source: src/lib/components/chronicle-motion.test.ts:51 -->

### [src/lib/components/chronicle-motion.test.ts:51](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/chronicle-motion.test.ts#L51)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 紙吹雪は「いま受け取る」ための演出。年表は静かに読ませる。
```

<!-- source: src/lib/components/chronicle-motion.test.ts:56 -->

### [src/lib/components/chronicle-motion.test.ts:56](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/chronicle-motion.test.ts#L56)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 通知からの /diary?date=YYYY-MM-DD はその日の日記を開く導線。
		// 日付を持てる月間アクティビティだけが ?date= と両立する。
```

<!-- source: src/lib/components/chronicle-motion.test.ts:91 -->

### [src/lib/components/chronicle-motion.test.ts:91](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/chronicle-motion.test.ts#L91)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 名前が取れないうちも空にせず、節目だけ先に見せる。
```

<!-- source: src/lib/components/chronicle-motion.test.ts:100 -->

### [src/lib/components/chronicle-motion.test.ts:100](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/chronicle-motion.test.ts#L100)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 言い換えを焼き付けると、記事の編集とずれるうえ字数超過や揺れも抱え込む。
```

<!-- source: src/lib/components/chronicle-motion.test.ts:105 -->

### [src/lib/components/chronicle-motion.test.ts:105](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/chronicle-motion.test.ts#L105)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 一覧（NewsCard）は ChatBubble、引用だけ素のテキスト、という不揃いを無くす。
```

<!-- source: src/lib/components/chronicle-motion.test.ts:110 -->

### [src/lib/components/chronicle-motion.test.ts:110](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/chronicle-motion.test.ts#L110)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// サーバで ja/en を作ると、その行を作った時点の言語で固まる。
```

## src/lib/news/NewsSidebarContent.svelte

<!-- source: src/lib/news/NewsSidebarContent.svelte:15 -->

### [src/lib/news/NewsSidebarContent.svelte:15](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/NewsSidebarContent.svelte#L15)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
	 * 右サイドバーの botたんニュース。botたんラジオ（RadioContent）と同じ枠・見出し・
	 * タイトル・コメント・リンクカードの並びにそろえ、ニュースだけの操作行を下に足す。
	 */
```

<!-- source: src/lib/news/NewsSidebarContent.svelte:112 -->

### [src/lib/news/NewsSidebarContent.svelte:112](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/NewsSidebarContent.svelte#L112)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* 枠・見出し・文字サイズは RadioContent（sidebar）とそろえる。 */
```

<!-- source: src/lib/news/NewsSidebarContent.svelte:179 -->

### [src/lib/news/NewsSidebarContent.svelte:179](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/NewsSidebarContent.svelte#L179)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/* ラジオに無い、ニュースだけの操作行。サイドバー幅に1行で収める。 */
```

## src/lib/news/actions.ts

<!-- source: src/lib/news/actions.ts:7 -->

### [src/lib/news/actions.ts:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/actions.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * ニュースの操作。ニュース一覧のカード（NewsCard）と右サイドバー（NewsSidebarContent）で
 * 同じ挙動にするため、ここに寄せる。
 */
```

<!-- source: src/lib/news/actions.ts:12 -->

### [src/lib/news/actions.ts:12](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/actions.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** 「コメントする」＝ニュースの引用投稿。未ログインならサインインへ。 */
```

<!-- source: src/lib/news/actions.ts:21 -->

### [src/lib/news/actions.ts:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/actions.ts#L21)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * 共有シートがあればそれで、無ければ記事 URL をクリップボードへ。
 * クリップボードへコピーしたときだけ true（「コピーしました」を出すため）。
 * 共有シートを閉じただけなら false、それ以外の失敗は throw する。
 */
```

## src/lib/news/bot-post.ts

<!-- source: src/lib/news/bot-post.ts:3 -->

### [src/lib/news/bot-post.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/bot-post.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * ニュースに添えた botたんコメントを、ChatBubble へそのまま渡せる PostView に仕立てる。
 * コメントは PDS 上の独立したレコードではないので、uri はニュースのものへ
 * `#bot-comment` を足した合成値にする（リアクションはニュース本体へ付く）。
 */
```

<!-- source: src/lib/news/bot-post.ts:28 -->

### [src/lib/news/bot-post.ts:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/bot-post.ts#L28)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** 記事 URL のうち http(s) のものだけを通す。 */
```

## src/lib/news/image.ts

<!-- source: src/lib/news/image.ts:1 -->

### [src/lib/news/image.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/image.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * OGP画像は配信元からクライアントが直接読む。
 * mixed contentや data:/blob: の混入を避けるため HTTPS だけを表示対象にする。
 */
```

## src/lib/news/indexable.test.ts

<!-- source: src/lib/news/indexable.test.ts:42 -->

### [src/lib/news/indexable.test.ts:42](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/indexable.test.ts#L42)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 同じカーソルを返し続けるサーバに当たっても無限ループにしない。
```

## src/lib/news/indexable.ts

<!-- source: src/lib/news/indexable.ts:4 -->

### [src/lib/news/indexable.ts:4](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/indexable.ts#L4)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * 検索に載せるニュースの集合。prerender の `entries()`、記事ページの `load()`、
 * sitemap.xml が**同じこの関数**を通る。
 *
 * 別々に取ると3者の集合がずれ、「sitemap には載っているが存在しないURL」や
 * 「ビルドされているが sitemap に無い記事」が静かに生まれる。
 */
```

<!-- source: src/lib/news/indexable.ts:12 -->

### [src/lib/news/indexable.ts:12](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/indexable.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * 一度のビルドで索引に載せる上限。
 *
 * botたんは1日最大20件なので、1500 はおよそ2.5か月分。これより古い記事は
 * ビルド対象から外れて 404 になるが、日付の付いたポジティブニュースに検索価値は
 * ほぼ残らないうえ、上限が無いとビルド時間が年々伸び続ける。
 * ビルドが5分を超えるようなら、この値ではなく方式（増分ビルド）を見直すこと。
 */
```

<!-- source: src/lib/news/indexable.ts:22 -->

### [src/lib/news/indexable.ts:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/indexable.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** `at://<did>/com.suibari.nagi.news/<rkey>` の末尾。パーマリンクの識別子。 */
```

<!-- source: src/lib/news/indexable.ts:32 -->

### [src/lib/news/indexable.ts:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/indexable.ts#L32)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** 索引対象の一式。botたんの表示名とアイコンはプリレンダにも焼き込む。 */
```

<!-- source: src/lib/news/indexable.ts:35 -->

### [src/lib/news/indexable.ts:35](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/indexable.ts#L35)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * ページングを畳んで1本の配列にする。ページャを差し替えられるようにしてあるのは、
 * ネットワークなしでテストするため。
 */
```

<!-- source: src/lib/news/indexable.ts:46 -->

### [src/lib/news/indexable.ts:46](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/indexable.ts#L46)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// cursor が進まない実装に当たっても止まるよう、回数でも縛る。
```

<!-- source: src/lib/news/indexable.ts:59 -->

### [src/lib/news/indexable.ts:59](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/indexable.ts#L59)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * ビルド1回につき1度だけ取得する。entries() → load() × 記事数 → sitemap と
 * 三度呼ばれるので、都度取りに行くとビルドがネットワーク待ちになる。
 *
 * **失敗してもビルドを落とさない。** AppView が一時的に落ちていたり、まだこの
 * エンドポイントを持っていない場合は空配列になり、記事ページが生成されないだけで済む
 * （既存ページは無傷）。ここで throw すると、ニュースの不調がサイト全体のデプロイを止める。
 */
```

<!-- source: src/lib/news/indexable.ts:76 -->

### [src/lib/news/indexable.ts:76](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/indexable.ts#L76)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** テスト用。モジュールスコープのメモを捨てる。 */
```

## src/lib/news/order.ts

<!-- source: src/lib/news/order.ts:3 -->

### [src/lib/news/order.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/order.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** 日付見出しにも使う「そのニュースの日時」。botたんの投稿日を優先する。 */
```

<!-- source: src/lib/news/order.ts:7 -->

### [src/lib/news/order.ts:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/order.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * ニュース一覧を日付降順に揃える。
 * 検索（カテゴリタブ）の関連度順や旧APIの推薦スコア順も、表示時は時系列に揃える。
 * 安定ソートなので、同時刻（＝同じ botたんバッチ）内はサーバの indexedAt DESC 順が残る。
 */
```

## src/lib/news/quote.svelte.ts

<!-- source: src/lib/news/quote.svelte.ts:17 -->

### [src/lib/news/quote.svelte.ts:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/quote.svelte.ts#L17)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * ニュースを引用して投稿するときの状態。
 *
 * 引用機能を持つ画面が複数あるので、状態と送信をここに集約する。ボタンと入力欄は DOM 上で
 * 離れた位置に出るため、コンポーネントではなくクラスとして切り出している。
 */
```

<!-- source: src/lib/news/quote.svelte.ts:37 -->

### [src/lib/news/quote.svelte.ts:37](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/quote.svelte.ts#L37)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** 未サインインならログインへ送る。開いている状態でもう一度押したら閉じる。 */
```

<!-- source: src/lib/news/quote.svelte.ts:76 -->

### [src/lib/news/quote.svelte.ts:76](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/quote.svelte.ts#L76)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// ニュース引用もNagi内レコードを参照するため、Blueskyへはクロスポストしない。
```

<!-- source: src/lib/news/quote.svelte.ts:80 -->

### [src/lib/news/quote.svelte.ts:80](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/quote.svelte.ts#L80)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// ニュース一覧に投稿は並ばないので、追従できない代わりに導線を出す。
			// フィードを開いている場合に備えて合図も送る。
```

## src/lib/news/selection.ts

<!-- source: src/lib/news/selection.ts:5 -->

### [src/lib/news/selection.ts:5](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/selection.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** 「おすすめの理由：〜」に出す関心ジャンル。おすすめ以外のカードでは undefined。 */
```

<!-- source: src/lib/news/selection.ts:9 -->

### [src/lib/news/selection.ts:9](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/selection.ts#L9)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * 右サイドバーの候補にする期間。ニュースは6時間ごとのスロットでまとめて公開されるので、
 * 最新の候補からこの幅に入るもの（＝最新スロットぶん）だけを比べる。
 */
```

<!-- source: src/lib/news/selection.ts:18 -->

### [src/lib/news/selection.ts:18](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/selection.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * 右サイドバーに出すニュースを、最新スロットから1件だけ選ぶ。
 *
 * 読んだ人が自分の話としてコメントしやすい記事（talkScore が高い記事）を最優先にし、
 * 同点なら未読 → 関心ジャンルのおすすめ → 新しい順で決める。古い高得点記事が居座らないよう、
 * 最新の候補から6時間以内に絞って比べる。talkScore の無い記事（導入前の承認）は最下位。
 */
```

<!-- source: src/lib/news/selection.ts:30 -->

### [src/lib/news/selection.ts:30](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/selection.ts#L30)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 新着側に紛れたおすすめにも理由ラベルを出すため、おすすめ側の記事に差し替える。
```

<!-- source: src/lib/news/selection.ts:49 -->

### [src/lib/news/selection.ts:49](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/selection.ts#L49)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 安定ソートなので、残りの同点は新しい順のまま。
```

## src/lib/news/unread.svelte.ts

<!-- source: src/lib/news/unread.svelte.ts:6 -->

### [src/lib/news/unread.svelte.ts:6](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/unread.svelte.ts#L6)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * ニュースの既読位置。/news 一覧の未読表示と、右サイドバーの1件選定（未読優先）に使う。
 * ナビにはバッジを出さない（ニュースは急いで読むものではないため）ので、
 * 未読を先回りして調べるポーリングは持たず、画面を開いたときだけ判定する。
 * 既読はアカウント同期する（サーバー側は DID 単位）ので、ローカルのキーも DID で分ける。
 * サインアウト中の閲覧は guest スコープに閉じ込める。
 */
```

<!-- source: src/lib/news/unread.svelte.ts:16 -->

### [src/lib/news/unread.svelte.ts:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/unread.svelte.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** サインイン状態が変わるとキーごと変わるので、その都度いまのウォーターマークを引く。 */
```

<!-- source: src/lib/news/unread.svelte.ts:20 -->

### [src/lib/news/unread.svelte.ts:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/news/unread.svelte.ts#L20)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/** ニュース一覧を開いた時点の既読基準を凍結したビュー。マウントごとに1つ作る。 */
```

## src/routes/dev/chronicle/+page.svelte

<!-- source: src/routes/dev/chronicle/+page.svelte:5 -->

### [src/routes/dev/chronicle/+page.svelte:5](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/chronicle/+page.svelte#L5)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
	 * 年表のスクロール演出を、APIもDBも無しで確かめるためのページ。
	 * reduced-motion を切り替えたときに**要素が消えないこと**もここで見る。
	 */
```

<!-- source: src/routes/dev/chronicle/+page.svelte:14 -->

### [src/routes/dev/chronicle/+page.svelte:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/chronicle/+page.svelte#L14)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// サーバは古い順で返す。年表は「はじまりから今へ」読むもの。
```

<!-- source: src/routes/dev/chronicle/+page.svelte:30 -->

### [src/routes/dev/chronicle/+page.svelte:30](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/chronicle/+page.svelte#L30)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// そのころ世の中では。まとめの下に紐づく一行として描かれる（日付は出ない）。
```

<!-- source: src/routes/dev/chronicle/+page.svelte:35 -->

### [src/routes/dev/chronicle/+page.svelte:35](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/chronicle/+page.svelte#L35)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 年表に出るのは記事の原題（news.title）。titleJa は使わない。
```

<!-- source: src/routes/dev/chronicle/+page.svelte:43 -->

### [src/routes/dev/chronicle/+page.svelte:43](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/chronicle/+page.svelte#L43)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// スクロールさせないと演出が見えないので、上に余白を積む。
```

## src/routes/dev/chronicle/+page.ts

<!-- source: src/routes/dev/chronicle/+page.ts:4 -->

### [src/routes/dev/chronicle/+page.ts:4](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/chronicle/+page.ts#L4)

分類: 検証・再現条件。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * APIを叩かず、年表のスクロール演出だけを再生する開発専用ページ。
 *
 * 数年ぶんの年表を seed しないと確認できない、という状態を避けるために置いている。
 * reduced-motion の切り替えもここで確かめる。
 */
```

## src/routes/news/+page.svelte

<!-- source: src/routes/news/+page.svelte:28 -->

### [src/routes/news/+page.svelte:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/+page.svelte#L28)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// プリレンダで焼いた1ページ目。クローラと初回表示はこれを読む。
	// ハイドレーション後は下の $effect が getPositiveNews で取り直す
	// （リアクション・ミュート・未読はビューアごとに違うため）。
```

<!-- source: src/routes/news/+page.svelte:52 -->

### [src/routes/news/+page.svelte:52](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/+page.svelte#L52)

分類: ツール指示（削除対象外）。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// data.seed は「初期値としてだけ」取り込む。以降はカテゴリ切り替えと
	// ハイドレーション後の再取得が items を置き換えるので、派生にはしない。
	// svelte-ignore state_referenced_locally
```

<!-- source: src/routes/news/+page.svelte:56 -->

### [src/routes/news/+page.svelte:56](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/+page.svelte#L56)

分類: ツール指示（削除対象外）。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// svelte-ignore state_referenced_locally
```

<!-- source: src/routes/news/+page.svelte:65 -->

### [src/routes/news/+page.svelte:65](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/+page.svelte#L65)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 既読基準は画面を開いた時点で凍結する。既読化しても表示中のマークは消えない。
	// 既読はアカウント同期＝DID ごとなので、OAuth の復元が終わるまで凍結を待つ。
```

<!-- source: src/routes/news/+page.svelte:127 -->

### [src/routes/news/+page.svelte:127](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/+page.svelte#L127)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 連続する同日をひとまとめにして日付見出しを出す。日付は botたんの投稿日(createdAt)。
	// items は常に日付降順なので、さらに読み込んでも見出しは重複しない。
```

<!-- source: src/routes/news/+page.svelte:130 -->

### [src/routes/news/+page.svelte:130](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/+page.svelte#L130)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// マウント前は JST 固定・絶対日付で描く。閲覧者のタイムゾーンで日付を切ると
		// ビルド(UTC)と結果が変わり、「今日 / 昨日」はビルド日で固まってしまう。
```

## src/routes/news/+page.ts

<!-- source: src/routes/news/+page.ts:8 -->

### [src/routes/news/+page.ts:8](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/+page.ts#L8)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * プリレンダに焼き込む件数。ハイドレーション後は通常どおり getPositiveNews が
 * 同じ件数を取り直すので、ここは「クローラと初回表示が見る分」だけでよい。
 */
```

<!-- source: src/routes/news/+page.ts:19 -->

### [src/routes/news/+page.ts:19](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/+page.ts#L19)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// listIndexableNews を使う（getPositiveNews ではなく）。理由は2つ:
	// - 成人向けラベルの記事を必ず除外する。未認証ビューアは成人扱いなので、
	//   getPositiveNews をそのまま焼くとクローラに出てしまう
	// - 利用者投稿のニュースには submittedBy（handle・表示名）が付く。PDS 由来の
	//   識別情報なので、検索公開のオプトインが入るまで静的HTMLに載せない
```

<!-- source: src/routes/news/+page.ts:33 -->

### [src/routes/news/+page.ts:33](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/+page.ts#L33)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 取得に失敗したビルド（AppView が未デプロイ・不調）で、中身の無い一覧を
			// 索引させない。空の殻を索引させるのは noindex より悪い。
			// 次に中身の取れたビルドが走れば自動で index へ戻る。
```

## src/routes/news/[rkey]/+page.svelte

<!-- source: src/routes/news/[rkey]/+page.svelte:19 -->

### [src/routes/news/[rkey]/+page.svelte:19](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/[rkey]/+page.svelte#L19)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
	 * 外からこのページへ直接来た人のための動線。記事1本で離脱させず、
	 * Nagi の中でこの話題がどう受け止められたか（みんなのコメント）と、
	 * 次に読める記事（似ているニュース）を記事の下に並べる。
	 * どちらもビューアごとに違う（ミュート・こっそり・年齢）ので、プリレンダせずに
	 * ハイドレーション後に取りに行く。
	 */
```

<!-- source: src/routes/news/[rkey]/+page.svelte:37 -->

### [src/routes/news/[rkey]/+page.svelte:37](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/[rkey]/+page.svelte#L37)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// このページに並ぶのはこのニュースを引用した投稿だけなので、各投稿の引用カードは畳む。
```

<!-- source: src/routes/news/[rkey]/+page.svelte:62 -->

### [src/routes/news/[rkey]/+page.svelte:62](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/[rkey]/+page.svelte#L62)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 補助的な欄なので、取れなければ出さないだけにする。
```

<!-- source: src/routes/news/[rkey]/+page.svelte:67 -->

### [src/routes/news/[rkey]/+page.svelte:67](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/[rkey]/+page.svelte#L67)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// 似ているニュースから別の記事へ移るとコンポーネントが使い回されるので、記事ごとに取り直す。
```

<!-- source: src/routes/news/[rkey]/+page.svelte:80 -->

### [src/routes/news/[rkey]/+page.svelte:80](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/[rkey]/+page.svelte#L80)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// プリレンダHTMLには紹介を残し、認証確認中は GuestHero の CSS で隠す。
```

<!-- source: src/routes/news/[rkey]/+page.svelte:83 -->

### [src/routes/news/[rkey]/+page.svelte:83](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/[rkey]/+page.svelte#L83)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// ここからコメントしたら、その場で一覧に出す。
```

## src/routes/news/[rkey]/+page.ts

<!-- source: src/routes/news/[rkey]/+page.ts:11 -->

### [src/routes/news/[rkey]/+page.ts:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/[rkey]/+page.ts#L11)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
/**
 * プリレンダするパーマリンクの一覧。
 * `load()` と sitemap.xml も同じ fetchIndexableNews() を見るので、三者の集合はずれない。
 */
```

<!-- source: src/routes/news/[rkey]/+page.ts:25 -->

### [src/routes/news/[rkey]/+page.ts:25](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/[rkey]/+page.ts#L25)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// ビルド時は entries() と同じメモから引く（記事ごとに往復しない）。
	// ブラウザでは、まだビルドに含まれていない公開直後の記事をここで取りに行く。
```

<!-- source: src/routes/news/[rkey]/+page.ts:39 -->

### [src/routes/news/[rkey]/+page.ts:39](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/news/[rkey]/+page.ts#L39)

分類: 仕様・設計の根拠。対応仕様: [news-chronicle](../../specs/news-chronicle/spec.md#requirements)。

```text
// botたんのひとことは120〜240字の書き下ろしで、承認時に固定される。
			// meta description にそのまま使える唯一のテキスト（記事本文は保持していない）。
```
