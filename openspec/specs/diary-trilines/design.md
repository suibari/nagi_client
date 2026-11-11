# diary-trilines：設計判断・コメント出典

この文書は初期仕様化時点のコメント原文を保存する設計資料である。現在の振る舞い・検証条件は [spec.md](spec.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/components/DiaryCalendar.svelte

<!-- source: src/lib/components/DiaryCalendar.svelte:16 -->

### [src/lib/components/DiaryCalendar.svelte:16](../../../src/lib/components/DiaryCalendar.svelte#L16)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 年間のコミットグラフ（日記を書いた日の草）。
	 * selected は日記ページが持ち、URL の ?date= と月カレンダー・感情グラフで共有する。
	 * anchorDate はページを開いたときの日付で、表示する1年の範囲だけを決める
	 * （選択を外しても範囲が今年へ飛ばないように、選択とは分けてある）。
	 *
	 * 月間アクティビティに埋め込むときは、取得済みの data と範囲 graph を親から受け取り、
	 * 詳細表示は親に任せる。highlightMonth の月を枠で示す。
	 */
```

<!-- source: src/lib/components/DiaryCalendar.svelte:78 -->

### [src/lib/components/DiaryCalendar.svelte:78](../../../src/lib/components/DiaryCalendar.svelte#L78)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 表示月を変えたら、その月が見える位置まで送る。
```

<!-- source: src/lib/components/DiaryCalendar.svelte:343 -->

### [src/lib/components/DiaryCalendar.svelte:343](../../../src/lib/components/DiaryCalendar.svelte#L343)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/* 月間アクティビティで表示中の月。草の色は変えず、外側の線だけで示す。 */
```

## src/lib/components/DiaryDayDetail.svelte

<!-- source: src/lib/components/DiaryDayDetail.svelte:7 -->

### [src/lib/components/DiaryDayDetail.svelte:7](../../../src/lib/components/DiaryDayDetail.svelte#L7)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 日記1日ぶんの見出し（日付・称号・関わった人）と、botたんの日記の吹き出し。
	 * 月間アクティビティと年間アクティビティで使う。
	 * summary はホバー中の日も含めた見出し用、entry は選択中の日で吹き出しに出す。
	 */
```

<!-- source: src/lib/components/DiaryDayDetail.svelte:21 -->

### [src/lib/components/DiaryDayDetail.svelte:21](../../../src/lib/components/DiaryDayDetail.svelte#L21)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 月間アクティビティでは日付を感情グラフの見出しに任せるので出さない。 */
```

## src/lib/components/DiaryMoodChart.svelte

<!-- source: src/lib/components/DiaryMoodChart.svelte:22 -->

### [src/lib/components/DiaryMoodChart.svelte:22](../../../src/lib/components/DiaryMoodChart.svelte#L22)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 日記ページの「感情グラフ」タブ。投稿ごとの気分（-5〜+5）を、日ごとの中央50%の帯と
	 * 中央値の線で見せる。日付を押すと、その日の点（投稿）と日記へのリンクを表示する。
	 * selected と anchorDate の役割は DiaryCalendar と同じ（選択はタブ間で共有する）。
	 *
	 * 月間アクティビティに埋め込むときは、取得済みの data と表示する日 days を親から受け取る。
	 * そのときは横幅いっぱいに収めて（ズームなし）、日ごとの投稿一覧は親の詳細欄に任せる。
	 * 埋め込みでは、ステータス行がその日の見出しを兼ね、直下に1日の気分の横バーを出す。
	 * 何も選んでいないときは fallbackDate（親が詳細欄に出している日）を見出しにする。
	 *
	 * 単独表示（/about・ランディングのサンプル）でも、ステータス行の下に同じ横バーを出し、
	 * その下にその日の投稿の縦タイムラインを置く（実際の画面と同じ並び）。
	 * 横バーの点を押すと、縦タイムラインの該当の行へ移る。
	 */
```

<!-- source: src/lib/components/DiaryMoodChart.svelte:49 -->

### [src/lib/components/DiaryMoodChart.svelte:49](../../../src/lib/components/DiaryMoodChart.svelte#L49)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
		 * サインイン前の /about で見せるサンプル。渡されたらAPIを叩かず、これをグラフにする。
		 * 投稿の行はリンクにせず、日記への導線も出さない（どちらも実在しない）。
		 */
```

<!-- source: src/lib/components/DiaryMoodChart.svelte:64 -->

### [src/lib/components/DiaryMoodChart.svelte:64](../../../src/lib/components/DiaryMoodChart.svelte#L64)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 横バーの点を押したとき。親が該当の投稿の行へ移る。 */
```

<!-- source: src/lib/components/DiaryMoodChart.svelte:106 -->

### [src/lib/components/DiaryMoodChart.svelte:106](../../../src/lib/components/DiaryMoodChart.svelte#L106)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 埋め込み（1か月）は横幅いっぱいに割り付ける。測れるまでは既定の段で描く。
```

<!-- source: src/lib/components/DiaryMoodChart.svelte:114 -->

### [src/lib/components/DiaryMoodChart.svelte:114](../../../src/lib/components/DiaryMoodChart.svelte#L114)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 1日の帯。中央50%（第1〜第3四分位）を、両端の丸いバーで描く。
	 * 値が1つしかない日（-3 だけの日など）は高さが0になるので、バーの幅ぶんの丸として出す。
	 * 拡大してもバーは太くしすぎない（8px まで）。細いほうが日ごとの並びが読みやすい。
	 */
```

<!-- source: src/lib/components/DiaryMoodChart.svelte:139 -->

### [src/lib/components/DiaryMoodChart.svelte:139](../../../src/lib/components/DiaryMoodChart.svelte#L139)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 投稿のない日で線を切る。帯と同じく、その日の中央値だけを結ぶ。 */
```

<!-- source: src/lib/components/DiaryMoodChart.svelte:222 -->

### [src/lib/components/DiaryMoodChart.svelte:222](../../../src/lib/components/DiaryMoodChart.svelte#L222)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 本人が点を直したら、表示中の点とキャッシュの両方を差し替える。 */
```

<!-- source: src/lib/components/DiaryMoodChart.svelte:228 -->

### [src/lib/components/DiaryMoodChart.svelte:228](../../../src/lib/components/DiaryMoodChart.svelte#L228)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 開いたときは選択中の日を中央に、無ければ今日（右端）を見せる。 */
```

<!-- source: src/lib/components/DiaryMoodChart.svelte:239 -->

### [src/lib/components/DiaryMoodChart.svelte:239](../../../src/lib/components/DiaryMoodChart.svelte#L239)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** anchorX（スクロール領域内の横位置）にある日を動かさずに段を変える。 */
```

<!-- source: src/lib/components/DiaryMoodChart.svelte:250 -->

### [src/lib/components/DiaryMoodChart.svelte:250](../../../src/lib/components/DiaryMoodChart.svelte#L250)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// Ctrl/⌘ + ホイール（トラックパッドのピンチも同じイベントで来る）で拡大・縮小。
	// ページのズームを止めるには passive: false で preventDefault する必要がある。
```

<!-- source: src/lib/components/DiaryMoodChart.svelte:269 -->

### [src/lib/components/DiaryMoodChart.svelte:269](../../../src/lib/components/DiaryMoodChart.svelte#L269)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * グラフの外を押したら選択を外す。開いている投稿一覧と日記リンクの中（本文を選んだり
	 * リンクを押したりする場所）、ズーム、タブは除く。タブを除かないと、日記タブへ
	 * 切り替えた瞬間に選択が消えて日付を引き継げない。Esc でも外せる。
	 * 埋め込みのときは親（月間アクティビティ）が同じことをする。
	 */
```

<!-- source: src/lib/components/DiaryMoodChart.svelte:298 -->

### [src/lib/components/DiaryMoodChart.svelte:298](../../../src/lib/components/DiaryMoodChart.svelte#L298)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 単独表示で横バーの点を押したとき。その日を選び、縦タイムラインの行へ移って光らせる。 */
```

<!-- source: src/lib/components/DiaryMoodChart.svelte:382 -->

### [src/lib/components/DiaryMoodChart.svelte:382](../../../src/lib/components/DiaryMoodChart.svelte#L382)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
<!-- 値の高さで色が決まるよう、グラフ全体の縦軸に1本だけ張る（userSpaceOnUse）。 -->
```

<!-- source: src/lib/components/DiaryMoodChart.svelte:403 -->

### [src/lib/components/DiaryMoodChart.svelte:403](../../../src/lib/components/DiaryMoodChart.svelte#L403)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
<!-- 1か月だけなので、月の目盛りの代わりに 1・8・15・22・29 日を置く。 -->
```

## src/lib/components/MonthlyActivity.svelte

<!-- source: src/lib/components/MonthlyActivity.svelte:28 -->

### [src/lib/components/MonthlyActivity.svelte:28](../../../src/lib/components/MonthlyActivity.svelte#L28)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 月間アクティビティ。月カレンダー（色相は気分、濃淡は投稿量）と、その月の感情グラフを
	 * 日記の上に並べ、どちらで日付を選んでも同じ日を指す。
	 * 選んだ日の botたんの日記と、その日の投稿の気分を詳細欄に出す。
	 *
	 * データの取得範囲は従来どおり1年ぶんを共有する。
	 * month と selected は日記ページが持ち、URL の ?month= / ?date= に書き戻す。
	 */
```

<!-- source: src/lib/components/MonthlyActivity.svelte:52 -->

### [src/lib/components/MonthlyActivity.svelte:52](../../../src/lib/components/MonthlyActivity.svelte#L52)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** AppView が気分の日付を切った区切り。横バーと投稿の時刻をこれで揃える。 */
```

<!-- source: src/lib/components/MonthlyActivity.svelte:100 -->

### [src/lib/components/MonthlyActivity.svelte:100](../../../src/lib/components/MonthlyActivity.svelte#L100)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 本人が点を直したら、表示中の月とキャッシュ済みの月の両方を差し替える。 */
```

<!-- source: src/lib/components/MonthlyActivity.svelte:107 -->

### [src/lib/components/MonthlyActivity.svelte:107](../../../src/lib/components/MonthlyActivity.svelte#L107)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 別の月の日（URL から）を選んだら、その月へ移る。
```

<!-- source: src/lib/components/MonthlyActivity.svelte:119 -->

### [src/lib/components/MonthlyActivity.svelte:119](../../../src/lib/components/MonthlyActivity.svelte#L119)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 詳細欄の外を押したら選択を外す（感情グラフ単体のときと同じ操作感）。
	 * 日付を押す場所・詳細欄・月送り・タブは除く。Esc でも外せる。
	 */
```

<!-- source: src/lib/components/MonthlyActivity.svelte:144 -->

### [src/lib/components/MonthlyActivity.svelte:144](../../../src/lib/components/MonthlyActivity.svelte#L144)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 月途中でも月末までの枠を確保し、各日の横位置を固定する。
```

<!-- source: src/lib/components/MonthlyActivity.svelte:157 -->

### [src/lib/components/MonthlyActivity.svelte:157](../../../src/lib/components/MonthlyActivity.svelte#L157)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 何も選んでいないときは、その月のいちばん新しい日記を見せておく。 */
```

<!-- source: src/lib/components/MonthlyActivity.svelte:168 -->

### [src/lib/components/MonthlyActivity.svelte:168](../../../src/lib/components/MonthlyActivity.svelte#L168)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** その日の投稿一覧の開閉。日記がある日は日記を主役にして閉じておく。 */
```

<!-- source: src/lib/components/MonthlyActivity.svelte:174 -->

### [src/lib/components/MonthlyActivity.svelte:174](../../../src/lib/components/MonthlyActivity.svelte#L174)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 横バーの点を押したら、その投稿の行へ移る。
	 * ホバー中の別の日の点だった場合は、先にその日を選んでから移る。
	 */
```

<!-- source: src/lib/components/MonthlyActivity.svelte:259 -->

### [src/lib/components/MonthlyActivity.svelte:259](../../../src/lib/components/MonthlyActivity.svelte#L259)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
<!-- 日付・気分の投稿数・中央値は感情グラフのステータス行が見出しとして出す。
				     ここには日記側の総投稿数（気分が読み取れない投稿も含む）だけを残す。 -->
```

## src/lib/components/MoodCalendar.svelte

<!-- source: src/lib/components/MoodCalendar.svelte:8 -->

### [src/lib/components/MoodCalendar.svelte:8](../../../src/lib/components/MoodCalendar.svelte#L8)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 月間アクティビティの月カレンダー。背景色は気分の中央値、右下のドットは投稿量（0〜3個）。
	 * ドットの段階は、受け取った日記（1年ぶん）の投稿数を3等分して決める。正確な件数はラベルと詳細欄に出す。
	 * 気分のない日は無地にし、
	 * 選んだ日は感情グラフと共有する。
	 * 読み込み中は格子を薄めてスピナーを重ね、取得中であることを示す。
	 */
```

<!-- source: src/lib/components/MoodCalendar.svelte:222 -->

### [src/lib/components/MoodCalendar.svelte:222](../../../src/lib/components/MoodCalendar.svelte#L222)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/* box-shadow はボタン共通の指定に負けるので、選択の輪は outline で描く。 */
```

<!-- source: src/lib/components/MoodCalendar.svelte:268 -->

### [src/lib/components/MoodCalendar.svelte:268](../../../src/lib/components/MoodCalendar.svelte#L268)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/* 件数が分からない日は白抜きにして、投稿なし（ドットなし）と区別する。 */
```

## src/lib/components/MoodDayBar.svelte

<!-- source: src/lib/components/MoodDayBar.svelte:16 -->

### [src/lib/components/MoodDayBar.svelte:16](../../../src/lib/components/MoodDayBar.svelte#L16)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 1日（前の区切り〜その日の区切り。既定は前日22時〜当日22時）の気分の流れを1本の横バーにする。
	 * 投稿の間は気分を時間で補間したグラデーションでつなぎ、投稿の位置に点を置く。
	 * 点を押すと onjump で親に知らせ、縦タイムラインの該当の投稿へ移る。
	 */
```

<!-- source: src/lib/components/MoodDayBar.svelte:29 -->

### [src/lib/components/MoodDayBar.svelte:29](../../../src/lib/components/MoodDayBar.svelte#L29)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** AppView から受け取った区切り。無ければ端末の時刻の22時区切り。 */
```

<!-- source: src/lib/components/MoodDayBar.svelte:37 -->

### [src/lib/components/MoodDayBar.svelte:37](../../../src/lib/components/MoodDayBar.svelte#L37)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 0・6・12・18時の目盛り。両端（区切り）は日の境目なので線だけにする。 */
```

<!-- source: src/lib/components/MoodDayBar.svelte:49 -->

### [src/lib/components/MoodDayBar.svelte:49](../../../src/lib/components/MoodDayBar.svelte#L49)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** ラベル付きの投稿は、本文を読み上げにも出さない（本文側は PostModerationGuard が隠す）。 */
```

## src/lib/components/MoodDayPosts.svelte

<!-- source: src/lib/components/MoodDayPosts.svelte:23 -->

### [src/lib/components/MoodDayPosts.svelte:23](../../../src/lib/components/MoodDayPosts.svelte#L23)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 1日ぶんの感情の点（投稿）を縦のタイムラインで並べる。感情グラフと月間アクティビティの詳細欄で使う。
	 * 左のレールは、各投稿の気分から次の投稿の気分へ補間したグラデーション（横バーと同じ考え方）。
	 * 時間の比率では並べず、長い空白（GAP_HOURS 以上）は行間を広げて「〜」で示す。
	 * preview（/about のサンプル）では投稿が実在しないのでリンクにしない。
	 *
	 * onchange を渡すと、値を押して直せる（botたんの読み取りが本人の解釈と違うことがあるため）。
	 * 保存できたら onchange で差し替えを親へ返す。next が無ければグラフから外れた点。
	 */
```

<!-- source: src/lib/components/MoodDayPosts.svelte:42 -->

### [src/lib/components/MoodDayPosts.svelte:42](../../../src/lib/components/MoodDayPosts.svelte#L42)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** AppView から受け取った区切り。時刻はその日のタイムゾーンで出す（横バーと揃える）。 */
```

<!-- source: src/lib/components/MoodDayPosts.svelte:274 -->

### [src/lib/components/MoodDayPosts.svelte:274](../../../src/lib/components/MoodDayPosts.svelte#L274)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/* 自分の点から次の行の点まで伸ばす。次の行の点は、この行の下端 + 次の行の --dot-top。 */
```

<!-- source: src/lib/components/MoodDayPosts.svelte:354 -->

### [src/lib/components/MoodDayPosts.svelte:354](../../../src/lib/components/MoodDayPosts.svelte#L354)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/* 本人が直した値は塗りにして、botたんの読み取り（枠だけ）と見分ける。 */
```

## src/lib/components/TrilinesCard.svelte

<!-- source: src/lib/components/TrilinesCard.svelte:19 -->

### [src/lib/components/TrilinesCard.svelte:19](../../../src/lib/components/TrilinesCard.svelte#L19)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 3行日記（com.suibari.trilinesat.diary）の本文。行ごとに番号を振り、その行の画像を下に添える。
	 * 画像は AppView が行の順に images へまとめ、行からは imageIndex で指している。
	 *
	 * 翻訳は投稿と同じ仕組み（postTranslations）で、行を改行でつないだ post.text を訳す。
	 * 訳文の行数が元と合えば行の体裁のまま差し替え、合わなければ訳文を一続きで出す。
	 */
```

<!-- source: src/lib/components/TrilinesCard.svelte:34 -->

### [src/lib/components/TrilinesCard.svelte:34](../../../src/lib/components/TrilinesCard.svelte#L34)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 送信中の楽観表示など、まだ訳せない状態。 */
```

<!-- source: src/lib/components/TrilinesCard.svelte:36 -->

### [src/lib/components/TrilinesCard.svelte:36](../../../src/lib/components/TrilinesCard.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** APIを使わない表示確認などで、訳文を直接描画する。 */
```

<!-- source: src/lib/components/TrilinesCard.svelte:50 -->

### [src/lib/components/TrilinesCard.svelte:50](../../../src/lib/components/TrilinesCard.svelte#L50)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 最終訳を待つ間、英訳キャッシュがあれば先に出す（TranslateToggle と同じ）。
```

<!-- source: src/lib/components/TrilinesCard.svelte:116 -->

### [src/lib/components/TrilinesCard.svelte:116](../../../src/lib/components/TrilinesCard.svelte#L116)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
<!-- 訳文の行数が元と合わないときは行に割り振らず、画像は訳文の下にまとめる。 -->
```

## src/lib/diary/calendar.ts

<!-- source: src/lib/diary/calendar.ts:15 -->

### [src/lib/diary/calendar.ts:15](../../../src/lib/diary/calendar.ts#L15)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 現在週を右端に置き、その左へ52週を並べる。 */
```

<!-- source: src/lib/diary/calendar.ts:31 -->

### [src/lib/diary/calendar.ts:31](../../../src/lib/diary/calendar.ts#L31)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 古い日記へのリンクでは、その日までの1年を表示する。 */
```

<!-- source: src/lib/diary/calendar.ts:40 -->

### [src/lib/diary/calendar.ts:40](../../../src/lib/diary/calendar.ts#L40)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 月初を含む週へラベルを置く。左端が月途中なら、その月も左端に表示する。 */
```

<!-- source: src/lib/diary/calendar.ts:64 -->

### [src/lib/diary/calendar.ts:64](../../../src/lib/diary/calendar.ts#L64)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 投稿量のドット段階。0 は投稿なし、1〜3 は少・中・多。 */
```

<!-- source: src/lib/diary/calendar.ts:67 -->

### [src/lib/diary/calendar.ts:67](../../../src/lib/diary/calendar.ts#L67)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * 投稿のあった日の件数を3等分する境目 [少の上限, 中の上限]。
 * 人によって投稿の多さが違うので、固定の件数ではなくその人の分布で区切る。
 */
```

<!-- source: src/lib/diary/calendar.ts:80 -->

### [src/lib/diary/calendar.ts:80](../../../src/lib/diary/calendar.ts#L80)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 件数をドット段階に変える。件数が分からない日は undefined。 */
```

<!-- source: src/lib/diary/calendar.ts:94 -->

### [src/lib/diary/calendar.ts:94](../../../src/lib/diary/calendar.ts#L94)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** その日を含む月。"YYYY-MM"。 */
```

<!-- source: src/lib/diary/calendar.ts:97 -->

### [src/lib/diary/calendar.ts:97](../../../src/lib/diary/calendar.ts#L97)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 今日の月。 */
```

<!-- source: src/lib/diary/calendar.ts:106 -->

### [src/lib/diary/calendar.ts:106](../../../src/lib/diary/calendar.ts#L106)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 月を delta だけずらす。 */
```

<!-- source: src/lib/diary/calendar.ts:113 -->

### [src/lib/diary/calendar.ts:113](../../../src/lib/diary/calendar.ts#L113)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 月の最終日 "YYYY-MM-DD"。 */
```

<!-- source: src/lib/diary/calendar.ts:119 -->

### [src/lib/diary/calendar.ts:119](../../../src/lib/diary/calendar.ts#L119)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * 月間アクティビティで取得する1年の範囲。表示月がまるごと入るように選ぶ。
 * 今年の範囲に月初が入っていればそのまま、外れていれば月末を右端にした1年にする。
 */
```

<!-- source: src/lib/diary/calendar.ts:131 -->

### [src/lib/diary/calendar.ts:131](../../../src/lib/diary/calendar.ts#L131)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * 月カレンダーのマス。日曜始まりで、前後の月のはみ出しを含めて7日ずつの週に切る
 * （コミットグラフと同じ曜日の並び）。
 */
```

## src/lib/diary/mood.test.ts

<!-- source: src/lib/diary/mood.test.ts:45 -->

### [src/lib/diary/mood.test.ts:45](../../../src/lib/diary/mood.test.ts#L45)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 点は時刻順に並べ直す。
```

<!-- source: src/lib/diary/mood.test.ts:93 -->

### [src/lib/diary/mood.test.ts:93](../../../src/lib/diary/mood.test.ts#L93)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// ローカル時刻で書く（日記の22時区切りは端末のタイムゾーン）。
```

<!-- source: src/lib/diary/mood.test.ts:100 -->

### [src/lib/diary/mood.test.ts:100](../../../src/lib/diary/mood.test.ts#L100)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 前日22時が 0
```

<!-- source: src/lib/diary/mood.test.ts:127 -->

### [src/lib/diary/mood.test.ts:127](../../../src/lib/diary/mood.test.ts#L127)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 0:00 → 1:00 は 20 分刻みで +5 → -5 に落ちる。
```

<!-- source: src/lib/diary/mood.test.ts:130 -->

### [src/lib/diary/mood.test.ts:130](../../../src/lib/diary/mood.test.ts#L130)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 1:00 → 18:00 は -5 のまま（中間点を置かない）。
```

<!-- source: src/lib/diary/mood.test.ts:144 -->

### [src/lib/diary/mood.test.ts:144](../../../src/lib/diary/mood.test.ts#L144)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 18 時間を 20 分刻み → 中間点 53 個 + 両端の投稿 + 0 と 1。
```

<!-- source: src/lib/diary/mood.test.ts:159 -->

### [src/lib/diary/mood.test.ts:159](../../../src/lib/diary/mood.test.ts#L159)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// AppView の moodDiaryDate と同じ境界（2026-08-01T13:00Z は Tokyo の 8/1 22:00）。
```

<!-- source: src/lib/diary/mood.test.ts:170 -->

### [src/lib/diary/mood.test.ts:170](../../../src/lib/diary/mood.test.ts#L170)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 2026-11-01 は New York の夏時間終了日。22時 EDT → 22時 EST の 25 時間。
```

<!-- source: src/lib/diary/mood.test.ts:184 -->

### [src/lib/diary/mood.test.ts:184](../../../src/lib/diary/mood.test.ts#L184)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 2時区切りの 8/1 は 8/1 02:00〜8/2 02:00（JST）。
```

<!-- source: src/lib/diary/mood.test.ts:192 -->

### [src/lib/diary/mood.test.ts:192](../../../src/lib/diary/mood.test.ts#L192)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 設定が変わった日は 28 時間（8/1 22:00 〜 8/3 02:00 JST）。
```

<!-- source: src/lib/diary/mood.test.ts:210 -->

### [src/lib/diary/mood.test.ts:210](../../../src/lib/diary/mood.test.ts#L210)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 窓の無い日は moodTimezone と moodDayStartHour で計算する。
```

<!-- source: src/lib/diary/mood.test.ts:227 -->

### [src/lib/diary/mood.test.ts:227](../../../src/lib/diary/mood.test.ts#L227)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 22時区切りは 0・6・12・18時がそれぞれ 2/24, 8/24, 14/24, 20/24。
```

<!-- source: src/lib/diary/mood.test.ts:232 -->

### [src/lib/diary/mood.test.ts:232](../../../src/lib/diary/mood.test.ts#L232)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 2時区切りは 6・12・18・0時の順。
```

<!-- source: src/lib/diary/mood.test.ts:236 -->

### [src/lib/diary/mood.test.ts:236](../../../src/lib/diary/mood.test.ts#L236)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 0時区切りは両端の0時を出さない。
```

## src/lib/diary/mood.ts

<!-- source: src/lib/diary/mood.ts:5 -->

### [src/lib/diary/mood.ts:5](../../../src/lib/diary/mood.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 投稿時刻の昇順。 */
```

<!-- source: src/lib/diary/mood.ts:12 -->

### [src/lib/diary/mood.ts:12](../../../src/lib/diary/mood.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 線形補間の分位点。sorted は昇順で、空でないこと。 */
```

<!-- source: src/lib/diary/mood.ts:20 -->

### [src/lib/diary/mood.ts:20](../../../src/lib/diary/mood.ts#L20)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * 日ごとに「中央50%の帯」と中央値を出す。平均ではなく幅で見せるのは、同じ日に
 * 明るい投稿と落ち込んだ投稿が混ざるのが普通だから（平均すると 0 付近に潰れる）。
 */
```

<!-- source: src/lib/diary/mood.ts:46 -->

### [src/lib/diary/mood.ts:46](../../../src/lib/diary/mood.ts#L46)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * 点を1つ差し替える。next が無ければ取り除く（AIの値に戻したら中立だった、など）。
 * 投稿の日付は変わらないので、日ごとの並びは summarizeMoodDays に任せる。
 */
```

<!-- source: src/lib/diary/mood.ts:60 -->

### [src/lib/diary/mood.ts:60](../../../src/lib/diary/mood.ts#L60)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 本人が選べる値。0 は中立（グラフに載らない）なので選ばせない。 */
```

<!-- source: src/lib/diary/mood.ts:63 -->

### [src/lib/diary/mood.ts:63](../../../src/lib/diary/mood.ts#L63)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 1日あたりの横幅（px）。いちばん小さい段で1年がおおむね1画面に収まる。 */
```

<!-- source: src/lib/diary/mood.ts:73 -->

### [src/lib/diary/mood.ts:73](../../../src/lib/diary/mood.ts#L73)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * 中央値の色。感情グラフの帯と同じ5段の色（-5 → +5 を 0/.25/.5/.75/1 に置いた
 * --mood-scale-1..5）の間を線形に混ぜる。CSS では
 * `color-mix(in srgb, var(--mood-scale-{from}), var(--mood-scale-{to}) {percent}%)` にする。
 */
```

<!-- source: src/lib/diary/mood.ts:90 -->

### [src/lib/diary/mood.ts:90](../../../src/lib/diary/mood.ts#L90)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 区切りの時刻の既定値。AppView が区切りを返さないとき（旧 AppView）に使う。 */
```

<!-- source: src/lib/diary/mood.ts:94 -->

### [src/lib/diary/mood.ts:94](../../../src/lib/diary/mood.ts#L94)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** AppView が返す、1日の窓（`DiaryPage.moodDayWindows` の1件）。 */
```

<!-- source: src/lib/diary/mood.ts:103 -->

### [src/lib/diary/mood.ts:103](../../../src/lib/diary/mood.ts#L103)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * 日記の1日をどう区切るか。AppView から受け取った値をまとめたもの。
 * - windows: 点のある日ごとの窓。あればこれをそのまま使う（設定が途中で変わった日も正しく描ける）。
 * - timeZone / startHour: windows に無い日の計算に使う。旧 AppView は timeZone だけ返す。
 */
```

<!-- source: src/lib/diary/mood.ts:114 -->

### [src/lib/diary/mood.ts:114](../../../src/lib/diary/mood.ts#L114)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** getDiaries の結果から MoodClock を作る。 */
```

<!-- source: src/lib/diary/mood.ts:129 -->

### [src/lib/diary/mood.ts:129](../../../src/lib/diary/mood.ts#L129)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** その瞬間の、timeZone の UTC からのずれ（ミリ秒）。 */
```

<!-- source: src/lib/diary/mood.ts:153 -->

### [src/lib/diary/mood.ts:153](../../../src/lib/diary/mood.ts#L153)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** timeZone の壁時計で date の hour 時ちょうどの瞬間。夏時間の切り替わりも2回測って合わせる。 */
```

<!-- source: src/lib/diary/mood.ts:161 -->

### [src/lib/diary/mood.ts:161](../../../src/lib/diary/mood.ts#L161)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 不正なタイムゾーン名なら undefined（端末のタイムゾーンに戻す）。 */
```

<!-- source: src/lib/diary/mood.ts:180 -->

### [src/lib/diary/mood.ts:180](../../../src/lib/diary/mood.ts#L180)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 1つの設定での、date の日の終わり。夕方区切りは当日、朝区切りは翌日の区切り（AppView と同じ）。 */
```

<!-- source: src/lib/diary/mood.ts:187 -->

### [src/lib/diary/mood.ts:187](../../../src/lib/diary/mood.ts#L187)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * date（YYYY-MM-DD）の日記の1日。AppView が窓を返していればそれを使い、無ければ
 * timeZone（無ければ端末）と startHour（無ければ22時）で計算する。
 */
```

<!-- source: src/lib/diary/mood.ts:219 -->

### [src/lib/diary/mood.ts:219](../../../src/lib/diary/mood.ts#L219)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** その日の中での位置（0 = 前の区切り、1 = その日の区切り）。範囲外は端に寄せる。 */
```

<!-- source: src/lib/diary/mood.ts:225 -->

### [src/lib/diary/mood.ts:225](../../../src/lib/diary/mood.ts#L225)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * 横バーの目盛り（0・6・12・18時）。窓の中にある時刻だけを、その日のタイムゾーンの壁時計で置く。
 * 区切りそのもの（両端）とその近くは線と重なるので出さない。設定が変わった日は窓が
 * 24時間でないので、同じ時刻が2回出ることもある。
 */
```

<!-- source: src/lib/diary/mood.ts:244 -->

### [src/lib/diary/mood.ts:244](../../../src/lib/diary/mood.ts#L244)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 投稿の時刻の表示。横バーと同じタイムゾーンで出し、バー上の位置と食い違わないようにする。 */
```

<!-- source: src/lib/diary/mood.ts:255 -->

### [src/lib/diary/mood.ts:255](../../../src/lib/diary/mood.ts#L255)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * 1日の気分の流れを、グラデーションの停止点にする。
 * - 隣り合う投稿の間は、valence を時間で線形に補間する（投稿のない時間も感情は続いていたとみなす）。
 * - 最初の投稿より前・最後の投稿より後は、その投稿の気分のまま端まで伸ばす。
 * - 同じ分の投稿は平均して1点にまとめる（瞬間的な縞にしない）。
 * - 補間するのは色ではなく valence。色どうしを直接混ぜると、+5 と -5 の間が濁って
 *   スケールの途中の色（黄・緑・青）を通らないので、stepMinutes ごとに中間点を置く。
 */
```

<!-- source: src/lib/diary/mood.ts:310 -->

### [src/lib/diary/mood.ts:310](../../../src/lib/diary/mood.ts#L310)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 2つの気分の間を補間した停止点（縦タイムラインの1区間ぶん）。 */
```

<!-- source: src/lib/diary/mood.ts:319 -->

### [src/lib/diary/mood.ts:319](../../../src/lib/diary/mood.ts#L319)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 停止点を CSS の linear-gradient にする。停止点が1つなら単色。 */
```

<!-- source: src/lib/diary/mood.ts:329 -->

### [src/lib/diary/mood.ts:329](../../../src/lib/diary/mood.ts#L329)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 縦タイムラインの行の id。横バーの点から該当の行へ移るのに使う。 */
```

## src/lib/diary/timezone.ts

<!-- source: src/lib/diary/timezone.ts:3 -->

### [src/lib/diary/timezone.ts:3](../../../src/lib/diary/timezone.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * 自動検出では使わないタイムゾーン。Firefox の耐フィンガープリンティングなどは、本当の場所を
 * 隠すために UTC を返す。AppView も同じ条件で捨てるが、無駄に送らないようこちらでも弾く。
 */
```

<!-- source: src/lib/diary/timezone.ts:9 -->

### [src/lib/diary/timezone.ts:9](../../../src/lib/diary/timezone.ts#L9)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** この端末のタイムゾーン。取れなければ undefined。 */
```

<!-- source: src/lib/diary/timezone.ts:18 -->

### [src/lib/diary/timezone.ts:18](../../../src/lib/diary/timezone.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * Nagi を開いたときに AppView へ送るタイムゾーン。送らないなら undefined。
 * - 旧 AppView（diaryDay を返さない）には送らない。
 * - 本人が手動で選んでいる間は送らない（設定画面でそう説明している）。
 * - すでに同じ値が届いていれば送らない。
 */
```

## src/lib/trilines/date.ts

<!-- source: src/lib/trilines/date.ts:1 -->

### [src/lib/trilines/date.ts:1](../../../src/lib/trilines/date.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * 3行日記の「日」。TriLinesAt と同じく、端末のローカル時刻の正午から翌日の正午までを1日とする
 * （夜更かしして日付をまたいでも、その日の日記として数える）。
 * 夏時間で正午の位置がずれないよう、時間の足し算ではなく暦で計算する。
 * 真実源は TriLinesAt の src/lib/diaryDate.ts。
 */
```

<!-- source: src/lib/trilines/date.ts:22 -->

### [src/lib/trilines/date.ts:22](../../../src/lib/trilines/date.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * 「botたんに相談」で材料にする投稿の期間 [from, to)。日記の日付の0時から今まで。
 *
 * 日記の日付は正午区切りだが、材料まで正午で切ると、夜に書いたときにその日の午前中の
 * 出来事が入らない。日付は正午区切りのまま決め、材料はその日付の朝から拾う。
 * 日付をまたいだ深夜（正午前）に書いたときは、前日の0時から今までになる（最大で約36時間）。
 */
```

## src/lib/trilines/records.ts

<!-- source: src/lib/trilines/records.ts:10 -->

### [src/lib/trilines/records.ts:10](../../../src/lib/trilines/records.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * TriLinesAt の3行日記（com.suibari.trilinesat.diary）の読み書き。
 *
 * 正本は本人の PDS。TriLinesAt と Nagi のどちらから書いても同じレコードになり、
 * Nagi の AppView は Jetstream で取り込んで投稿として表示する。
 * Nagi の投稿（com.suibari.nagi.post）への複製は作らない。
 */
```

<!-- source: src/lib/trilines/records.ts:18 -->

### [src/lib/trilines/records.ts:18](../../../src/lib/trilines/records.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** TriLinesAt のグローバルフィードを Constellation で集めるための固定バックリンク先。 */
```

<!-- source: src/lib/trilines/records.ts:23 -->

### [src/lib/trilines/records.ts:23](../../../src/lib/trilines/records.ts#L23)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** lexicon の line.image は 1MB まで。processImage の上限に渡す。 */
```

<!-- source: src/lib/trilines/records.ts:26 -->

### [src/lib/trilines/records.ts:26](../../../src/lib/trilines/records.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 編集中の行の画像。既存は PDS 上の BlobRef をそのまま使い回す。 */
```

<!-- source: src/lib/trilines/records.ts:40 -->

### [src/lib/trilines/records.ts:40](../../../src/lib/trilines/records.ts#L40)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** Nagi に投稿として出すか。TriLinesAt からはオプトイン、Nagi から書いた日記は常に true。 */
```

<!-- source: src/lib/trilines/records.ts:51 -->

### [src/lib/trilines/records.ts:51](../../../src/lib/trilines/records.ts#L51)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 投稿できる状態か。TriLinesAt と同じく3行すべてが書かれていて、どの行も上限以内。 */
```

<!-- source: src/lib/trilines/records.ts:62 -->

### [src/lib/trilines/records.ts:62](../../../src/lib/trilines/records.ts#L62)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * レコードの lines を組み立てる。空の行は詰める（TriLinesAt も空行は保存しない）。
 * 画像だけの行は作れない（lexicon で text が必須の行に、本文の無い画像を置かない）。
 */
```

<!-- source: src/lib/trilines/records.ts:91 -->

### [src/lib/trilines/records.ts:91](../../../src/lib/trilines/records.ts#L91)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 日記の書き込み権限があるか。導入前にログインした人は再認可が要る。 */
```

<!-- source: src/lib/trilines/records.ts:106 -->

### [src/lib/trilines/records.ts:106](../../../src/lib/trilines/records.ts#L106)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * Nagi から書く日記のレコード。Nagi で書いた時点で Nagi に公開するので shareToNagi を必ず付ける
 * （AppView は印の無い日記を取り込まない）。TriLinesAt の「みんなの日記」にも載るよう hubRef も付ける。
 */
```

<!-- source: src/lib/trilines/records.ts:155 -->

### [src/lib/trilines/records.ts:155](../../../src/lib/trilines/records.ts#L155)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 行だけを書き換える。作成日時・共有先などほかの値は元のまま残す。 */
```

<!-- source: src/lib/trilines/records.ts:191 -->

### [src/lib/trilines/records.ts:191](../../../src/lib/trilines/records.ts#L191)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** Bluesky へ共有した投稿を日記へ書き戻す。日記が途中で編集されていたら諦める。 */
```

<!-- source: src/lib/trilines/records.ts:208 -->

### [src/lib/trilines/records.ts:208](../../../src/lib/trilines/records.ts#L208)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * 今日（正午区切り）の日記をもう書いているか。新しい順に数件だけ見る。
 * 投稿は止めず、警告を出すのに使う。読めなければ「書いていない」として扱う。
 */
```

<!-- source: src/lib/trilines/records.ts:230 -->

### [src/lib/trilines/records.ts:230](../../../src/lib/trilines/records.ts#L230)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** TriLinesAt の日記ページ。 */
```

## src/lib/trilines/share.ts

<!-- source: src/lib/trilines/share.ts:13 -->

### [src/lib/trilines/share.ts:13](../../../src/lib/trilines/share.ts#L13)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * Bluesky へ共有する本文。TriLinesAt の共有と同じ形（見出し・3行・日記ページへのリンク・
 * #TriLinesAt）にし、どちらから書いても同じ見た目の投稿になるようにする。
 */
```

<!-- source: src/lib/trilines/share.ts:45 -->

### [src/lib/trilines/share.ts:45](../../../src/lib/trilines/share.ts#L45)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 日記を Bluesky にも投稿する。画像は日記でアップロード済みの blob を使い回す。 */
```

<!-- source: src/lib/trilines/share.ts:58 -->

### [src/lib/trilines/share.ts:58](../../../src/lib/trilines/share.ts#L58)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// レコードの行は空行を詰めてあるので、下書きも同じ順に詰めて縦横比を引く。
```

## src/lib/trilines/translation.ts

<!-- source: src/lib/trilines/translation.ts:1 -->

### [src/lib/trilines/translation.ts:1](../../../src/lib/trilines/translation.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
 * 3行日記の訳文を行に戻す。AppView は行を改行でつないだ本文をまとめて訳すので、
 * 訳文の行数が元の行数と一致したときだけ行ごとに対応づける。
 * 一致しない（モデルが行をまとめた・分けた）ときは undefined を返し、呼び出し側は訳文を一続きで出す。
 */
```

## src/routes/dev/e2e/trilines/+page.svelte

<!-- source: src/routes/dev/e2e/trilines/+page.svelte:10 -->

### [src/routes/dev/e2e/trilines/+page.svelte:10](../../../src/routes/dev/e2e/trilines/+page.svelte#L10)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// ?noscope=1 で、3行日記の権限を持たない旧ログインを再現する。
```

## src/routes/diary/+page.svelte

<!-- source: src/routes/diary/+page.svelte:16 -->

### [src/routes/diary/+page.svelte:16](../../../src/routes/diary/+page.svelte#L16)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 日記は本人だけのページ。通知から ?date=YYYY-MM-DD で該当日を開く。
```

<!-- source: src/routes/diary/+page.svelte:22 -->

### [src/routes/diary/+page.svelte:22](../../../src/routes/diary/+page.svelte#L22)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 選択中の日。月カレンダー・感情グラフで共有し、?date= に書き戻す
	 * （タブを切り替えても同じ日を開いたまま・再読込や共有にも耐える）。
	 */
```

<!-- source: src/routes/diary/+page.svelte:27 -->

### [src/routes/diary/+page.svelte:27](../../../src/routes/diary/+page.svelte#L27)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 表示する月。?month= ?? ?date= の月 ?? 今月。選択を外しても月は動かさない
	 * （外した瞬間に今月へ飛ぶと、見ていた月が消えてしまう）。
	 */
```

<!-- source: src/routes/diary/+page.svelte:38 -->

### [src/routes/diary/+page.svelte:38](../../../src/routes/diary/+page.svelte#L38)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 年表の見出し「〜の日記」に出す本人の名前。
```

<!-- source: src/routes/diary/+page.svelte:43 -->

### [src/routes/diary/+page.svelte:43](../../../src/routes/diary/+page.svelte#L43)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 表示するタブ。?tab= で共有・再読込に耐える。
	 * **?date= が来ているときに年表は開かない。** 通知からの日付ディープリンクは
	 * その日の日記を開く導線なので、年表を初期表示にすると行き先が変わってしまう。
	 * 以前あった感情グラフのタブ（?tab=mood）は月間アクティビティに統合したので、
	 * 古いリンクは月間アクティビティで開く。
	 */
```

<!-- source: src/routes/diary/+page.svelte:61 -->

### [src/routes/diary/+page.svelte:61](../../../src/routes/diary/+page.svelte#L61)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** URL に書く ?month=。今月と、?date= から分かる月は省く。 */
```

<!-- source: src/routes/diary/+page.svelte:85 -->

### [src/routes/diary/+page.svelte:85](../../../src/routes/diary/+page.svelte#L85)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// URL → 選択。年表の「この日の日記を見る」など、同じページ内の遷移で ?date= が変わったとき。
```

<!-- source: src/routes/diary/+page.svelte:95 -->

### [src/routes/diary/+page.svelte:95](../../../src/routes/diary/+page.svelte#L95)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// URL → 月。戻る・進むや、同じページ内のリンクで ?month= が変わったとき。
```

<!-- source: src/routes/diary/+page.svelte:104 -->

### [src/routes/diary/+page.svelte:104](../../../src/routes/diary/+page.svelte#L104)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 選択・月 → URL。日付を押したら ?date=、月を送ったら ?month= を書き換える
	// （年表タブでは持たない）。
```

<!-- source: src/routes/diary/+page.svelte:112 -->

### [src/routes/diary/+page.svelte:112](../../../src/routes/diary/+page.svelte#L112)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 日付付きの年表リンクから開いた後も、月や日付の操作は月間画面に留める。
```

<!-- source: src/routes/diary/+page.svelte:124 -->

### [src/routes/diary/+page.svelte:124](../../../src/routes/diary/+page.svelte#L124)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// OAuth 復元は非同期なので oauthReady を待ってから、未ログインならログインへ回す。
```

<!-- source: src/routes/diary/+page.svelte:130 -->

### [src/routes/diary/+page.svelte:130](../../../src/routes/diary/+page.svelte#L130)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 日記の吹き出しに出す botたんの名前・アイコンは、プロフィール取得の付属情報から借りる。
	// 取れなくても DiaryDayDetail 側の仮の botたんで表示できるので、失敗は握りつぶす。
```

## src/routes/settings/diary/+page.svelte

<!-- source: src/routes/settings/diary/+page.svelte:15 -->

### [src/routes/settings/diary/+page.svelte:15](../../../src/routes/settings/diary/+page.svelte#L15)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 選べる区切り（夕方から翌朝の順）。AppView の DIARY_DAY_START_HOURS と同じ。 */
```

<!-- source: src/routes/settings/diary/+page.svelte:24 -->

### [src/routes/settings/diary/+page.svelte:24](../../../src/routes/settings/diary/+page.svelte#L24)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 旧 AppView は diaryDay を返さない。そのときは項目を出さない。 */
```

<!-- source: src/routes/settings/diary/+page.svelte:36 -->

### [src/routes/settings/diary/+page.svelte:36](../../../src/routes/settings/diary/+page.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** 選べるタイムゾーン。今の値が一覧に無くても選択肢に残す。 */
```

<!-- source: src/routes/settings/diary/+page.svelte:66 -->

### [src/routes/settings/diary/+page.svelte:66](../../../src/routes/settings/diary/+page.svelte#L66)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/**
	 * 「◯月◯日の日記から反映されます」。予約中の変更があればその日。保存した直後は、
	 * 今開いている日から有効になった場合もその日を出す（まだその日の日記は書かれていない）。
	 */
```

<!-- source: src/routes/settings/diary/+page.svelte:106 -->

### [src/routes/settings/diary/+page.svelte:106](../../../src/routes/settings/diary/+page.svelte#L106)

分類: 仕様・設計の根拠。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 自動に戻したときは、この端末の値もすぐ伝える（次に開くのを待たない）。
```

## tests/e2e/mood-edit.spec.ts

<!-- source: tests/e2e/mood-edit.spec.ts:7 -->

### [tests/e2e/mood-edit.spec.ts:7](../../../tests/e2e/mood-edit.spec.ts#L7)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
/** setPostMood の返事を順に差し替える。null は権限不足（古いセッション）。 */
```

<!-- source: tests/e2e/mood-edit.spec.ts:68 -->

### [tests/e2e/mood-edit.spec.ts:68](../../../tests/e2e/mood-edit.spec.ts#L68)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 0 は中立の意味になるので選べない。
```

<!-- source: tests/e2e/mood-edit.spec.ts:103 -->

### [tests/e2e/mood-edit.spec.ts:103](../../../tests/e2e/mood-edit.spec.ts#L103)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 保存できなかったので、値は botたんのまま。
```

## tests/e2e/trilines.spec.ts

<!-- source: tests/e2e/trilines.spec.ts:75 -->

### [tests/e2e/trilines.spec.ts:75](../../../tests/e2e/trilines.spec.ts#L75)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 相談中にポストおたすけの吹き出しは出さない。
```

<!-- source: tests/e2e/trilines.spec.ts:78 -->

### [tests/e2e/trilines.spec.ts:78](../../../tests/e2e/trilines.spec.ts#L78)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// TriLinesAt でも公開されることを伝え、公開範囲はゲージで選ぶ（こっそりは選べない）。
```

<!-- source: tests/e2e/trilines.spec.ts:89 -->

### [tests/e2e/trilines.spec.ts:89](../../../tests/e2e/trilines.spec.ts#L89)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 相談の説明はボタンのツールチップに入れる。
```

<!-- source: tests/e2e/trilines.spec.ts:101 -->

### [tests/e2e/trilines.spec.ts:101](../../../tests/e2e/trilines.spec.ts#L101)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 材料は日記の日付の0時から今まで（21時に書けば、その日の朝の出来事も入る）。
```

<!-- source: tests/e2e/trilines.spec.ts:104 -->

### [tests/e2e/trilines.spec.ts:104](../../../tests/e2e/trilines.spec.ts#L104)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 相談しただけでは投稿しない。
```

<!-- source: tests/e2e/trilines.spec.ts:167 -->

### [tests/e2e/trilines.spec.ts:167](../../../tests/e2e/trilines.spec.ts#L167)

分類: 検証・再現条件。対応仕様: [diary-trilines](spec.md#requirements)。

```text
// 3行とも書けていても、権限が無ければ送信できない。
```
