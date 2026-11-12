# 絵文字・タグ・生成UI：導入時コメント原文

この文書は基準コミット `24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf` に固定した履歴資料であり、現行コードの行番号一覧ではない。現在の要件は [spec.md](../../specs/emoji-tags/spec.md)、判断理由は [design.md](../../specs/emoji-tags/design.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/components/EmojiFavoritesEditor.svelte

<!-- source: src/lib/components/EmojiFavoritesEditor.svelte:25 -->

### [src/lib/components/EmojiFavoritesEditor.svelte:25](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiFavoritesEditor.svelte#L25)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 取得中・失敗中も端末のキャッシュを表示し、再試行が成功したら読み直す。
```

<!-- source: src/lib/components/EmojiFavoritesEditor.svelte:59 -->

### [src/lib/components/EmojiFavoritesEditor.svelte:59](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiFavoritesEditor.svelte#L59)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
<!-- リアクションパレット（QuickEmojiPalette）と同じ6列・同じタイルで見せ、並びをそのまま確かめられるようにする -->
```

## src/lib/components/EmojiGeneratePanel.svelte

<!-- source: src/lib/components/EmojiGeneratePanel.svelte:34 -->

### [src/lib/components/EmojiGeneratePanel.svelte:34](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiGeneratePanel.svelte#L34)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** /dev/emoji-generate がモックを差し込むため。既定は AppView と PDS。 */
```

<!-- source: src/lib/components/EmojiGeneratePanel.svelte:38 -->

### [src/lib/components/EmojiGeneratePanel.svelte:38](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiGeneratePanel.svelte#L38)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 描いている途中だけ見に行く間隔。1枚30〜45秒なので、これより細かくしても変わらない。 */
```

<!-- source: src/lib/components/EmojiGeneratePanel.svelte:49 -->

### [src/lib/components/EmojiGeneratePanel.svelte:49](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiGeneratePanel.svelte#L49)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 登録中・登録済みの生成の id。候補は登録しても1日残るので、二重登録を防ぐ。 */
```

<!-- source: src/lib/components/EmojiGeneratePanel.svelte:52 -->

### [src/lib/components/EmojiGeneratePanel.svelte:52](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiGeneratePanel.svelte#L52)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
	 * 生成ごとの rkey。失敗して押し直しても同じ rkey で書くので、応答だけ失われていても
	 * 別の絵文字が増えない。
	 */
```

<!-- source: src/lib/components/EmojiGeneratePanel.svelte:57 -->

### [src/lib/components/EmojiGeneratePanel.svelte:57](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiGeneratePanel.svelte#L57)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
	 * 生成ごとの登録フォーム。名前・説明は botたんの案を初期値にし、直してもよい。
	 * 一覧を読み直しても入力が消えないよう、生成の id で持つ。
	 */
```

<!-- source: src/lib/components/EmojiGeneratePanel.svelte:63 -->

### [src/lib/components/EmojiGeneratePanel.svelte:63](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiGeneratePanel.svelte#L63)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 一覧を読んだら、まだフォームの無い生成に botたんの案を入れる（描画中には書き換えない）。 */
```

<!-- source: src/lib/components/EmojiGeneratePanel.svelte:70 -->

### [src/lib/components/EmojiGeneratePanel.svelte:70](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiGeneratePanel.svelte#L70)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
	 * 画面は1枚だけ。描いている途中の依頼（pending）と、最新の結果（latest）を重ねて見せる。
	 * 新しい結果が出ると AppView が前の結果を消すので、一覧は多くても2件。
	 */
```

<!-- source: src/lib/components/EmojiGeneratePanel.svelte:96 -->

### [src/lib/components/EmojiGeneratePanel.svelte:96](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiGeneratePanel.svelte#L96)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 描いている途中のあいだだけ見に行く。完了後に画面を開いたときは1回読めば足りる
```

<!-- source: src/lib/components/EmojiGeneratePanel.svelte:115 -->

### [src/lib/components/EmojiGeneratePanel.svelte:115](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiGeneratePanel.svelte#L115)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** again は「もう一度描いてもらう」。同じプロンプトでも描くたびにスタイルが変わる。 */
```

<!-- source: src/lib/components/EmojiGeneratePanel.svelte:136 -->

### [src/lib/components/EmojiGeneratePanel.svelte:136](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiGeneratePanel.svelte#L136)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 候補は data URL で届く。fetch(data:) は CSP の connect-src に掛かりうるので自前で戻す。 */
```

<!-- source: src/lib/components/EmojiGeneratePanel.svelte:145 -->

### [src/lib/components/EmojiGeneratePanel.svelte:145](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiGeneratePanel.svelte#L145)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 名前と説明は botたん（gemma）の案が入っている。絵文字名は重複してよい。 */
```

<!-- source: src/lib/components/EmojiGeneratePanel.svelte:154 -->

### [src/lib/components/EmojiGeneratePanel.svelte:154](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiGeneratePanel.svelte#L154)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 128px の透過 PNG なので、processEmojiImage を通さずそのまま登録できる
```

<!-- source: src/lib/components/EmojiGeneratePanel.svelte:244 -->

### [src/lib/components/EmojiGeneratePanel.svelte:244](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiGeneratePanel.svelte#L244)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
<!-- 描き直している間は、前の絵の上にスピナーを重ねる。描き終えたら差し替わる -->
```

<!-- source: src/lib/components/EmojiGeneratePanel.svelte:281 -->

### [src/lib/components/EmojiGeneratePanel.svelte:281](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiGeneratePanel.svelte#L281)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
<!-- 描けなかったときは絵が無いので、ボタンだけを出す -->
```

## src/lib/components/EmojiPicker.svelte

<!-- source: src/lib/components/EmojiPicker.svelte:36 -->

### [src/lib/components/EmojiPicker.svelte:36](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiPicker.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** keepOpen は Shift+クリックの連続選択。呼び出し側がパレットを閉じずに続ける。 */
```

<!-- source: src/lib/components/EmojiPicker.svelte:39 -->

### [src/lib/components/EmojiPicker.svelte:39](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiPicker.svelte#L39)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 設定画面から「お気に入りに追加する絵文字」を選ぶときは false。 */
```

<!-- source: src/lib/components/EmojiPicker.svelte:46 -->

### [src/lib/components/EmojiPicker.svelte:46](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiPicker.svelte#L46)

分類: ツール指示（削除対象外）。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// パレットを開いた時点のお気に入りを編集対象にし、並び替えのたびに保存する。
	// svelte-ignore state_referenced_locally -- showFavorites は開いている間変わらない
```

<!-- source: src/lib/components/EmojiPicker.svelte:78 -->

### [src/lib/components/EmojiPicker.svelte:78](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiPicker.svelte#L78)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** Web Component のクリック直前に控えた Shift 状態（連続選択の判定用）。 */
```

<!-- source: src/lib/components/EmojiPicker.svelte:81 -->

### [src/lib/components/EmojiPicker.svelte:81](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiPicker.svelte#L81)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 検索欄は Unicode とカスタムのタブで共有し、語があればどちらのタブでも同じ結果を出す。
```

<!-- source: src/lib/components/EmojiPicker.svelte:97 -->

### [src/lib/components/EmojiPicker.svelte:97](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiPicker.svelte#L97)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 打鍵ごとに叩かないよう少し待つ。
```

<!-- source: src/lib/components/EmojiPicker.svelte:99 -->

### [src/lib/components/EmojiPicker.svelte:99](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiPicker.svelte#L99)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 検索: 名前と意味で探し、カスタム絵文字を Unicode 絵文字より上に並べる。
```

<!-- source: src/lib/components/EmojiPicker.svelte:130 -->

### [src/lib/components/EmojiPicker.svelte:130](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiPicker.svelte#L130)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 一覧: 検索語が無いときのカスタムタブ。本人分はPDSキャッシュ、他ユーザー分はAppView。
```

<!-- source: src/lib/components/EmojiPicker.svelte:219 -->

### [src/lib/components/EmojiPicker.svelte:219](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiPicker.svelte#L219)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// Web Component 側は shadow DOM 内で stopPropagation するので、修飾キーは
		// capture フェーズ（shadow の委譲ハンドラより先に走る）で控えておく。
```

<!-- source: src/lib/components/EmojiPicker.svelte:244 -->

### [src/lib/components/EmojiPicker.svelte:244](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiPicker.svelte#L244)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// emoji-click は shadow DOM 内から修飾キー無しで、しかも IndexedDB を待った後に
			// 非同期発火する。Shift の連続選択を判定するため、クリックと同じタスクで来る
			// emoji-click-sync を優先して使い、Shift 状態はそこで確定させる。
```

<!-- source: src/lib/components/EmojiPicker.svelte:257 -->

### [src/lib/components/EmojiPicker.svelte:257](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiPicker.svelte#L257)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// emoji-click-sync が来ない版へのフォールバック。こちらは非同期なので
			// 連打すると Shift 状態を取り違えうるが、選択自体は必ず成立させる。
```

<!-- source: src/lib/components/EmojiPicker.svelte:265 -->

### [src/lib/components/EmojiPicker.svelte:265](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiPicker.svelte#L265)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 検索と頻出履歴は Nagi 側で Unicode・カスタム共通に扱うため内蔵UIを隠す。
```

<!-- source: src/lib/components/EmojiPicker.svelte:356 -->

### [src/lib/components/EmojiPicker.svelte:356](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/EmojiPicker.svelte#L356)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
<!-- カスタム絵文字を常に先に並べる。それぞれの中は名前の一致 → 意味の近さの順。 -->
```

## src/lib/components/QuickEmojiPalette.svelte

<!-- source: src/lib/components/QuickEmojiPalette.svelte:72 -->

### [src/lib/components/QuickEmojiPalette.svelte:72](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L72)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** サーバーの検索結果（名前 + 意味）。どの検索語に対する結果かも持つ。 */
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:81 -->

### [src/lib/components/QuickEmojiPalette.svelte:81](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L81)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// ドラッグでお気に入りを編集したら、開いた時点のスナップショットで
	// localStorage を上書きさせない（下の prepareReactionPalette 参照）。
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:86 -->

### [src/lib/components/QuickEmojiPalette.svelte:86](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L86)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// カスタム絵文字を常に先に並べる。それぞれの中は名前の一致 → 意味の近さの順（AppView が決める）。
	// 応答待ちの間は、手元の Unicode 検索（名前の一致だけ）を即座に出しておく。
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:118 -->

### [src/lib/components/QuickEmojiPalette.svelte:118](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L118)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 手元の Unicode 検索を出したままにする。次の入力で再試行する。
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:163 -->

### [src/lib/components/QuickEmojiPalette.svelte:163](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L163)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 開いている最中には候補を差し替えない。検証・候補取得結果は次回表示から使う。
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:167 -->

### [src/lib/components/QuickEmojiPalette.svelte:167](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L167)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// ドラッグで編集した後は、開いた時点のスナップショットで巻き戻さない。
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:180 -->

### [src/lib/components/QuickEmojiPalette.svelte:180](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L180)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// Shift+クリックのヒントとドラッグは、マウス相当のポインタを持つ端末だけの機能。
	// この $effect は位置計算より先に宣言する（estimateQuickHeight がヒント行の
	// 高さを見込むため、初回の推定に間に合わせる必要がある）。
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:225 -->

### [src/lib/components/QuickEmojiPalette.svelte:225](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L225)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// ドラッグでお気に入りの行数が変わるたびにポップオーバーが跳ねないよう、
		// 初回の測定は追跡しない。代わりに開き直すまで位置は固定される。
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:260 -->

### [src/lib/components/QuickEmojiPalette.svelte:260](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L260)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** keepOpen は Shift+クリック。Discord と同じく閉じずに続けて選べる。 */
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:268 -->

### [src/lib/components/QuickEmojiPalette.svelte:268](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L268)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 同じタイルを連打してもアニメを再生し直すため、いったん外してから付け直す。
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:288 -->

### [src/lib/components/QuickEmojiPalette.svelte:288](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L288)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
	 * ドロップ位置を「お気に入り配列の何番目に差し込むか」に直す。
	 * タイルの右半分に落としたらその次。末尾タイルの右半分＝末尾追加になる。
	 */
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:297 -->

### [src/lib/components/QuickEmojiPalette.svelte:297](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L297)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
	 * 「最近使った」からお気に入りへはコピー（履歴 localStorage は触らない）。
	 * お気に入りからバーへドロップすると外す。お気に入り同士は並び替え。
	 */
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:314 -->

### [src/lib/components/QuickEmojiPalette.svelte:314](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L314)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 自分を抜いた分、後ろ向きの移動先はひとつ手前にずれる。
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:337 -->

### [src/lib/components/QuickEmojiPalette.svelte:337](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L337)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** キーボードだけの利用者がお気に入りを外せる唯一の経路。並び替えは設定画面へ。 */
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:348 -->

### [src/lib/components/QuickEmojiPalette.svelte:348](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L348)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
	 * どのタイルのどちら側に差し込まれるかを示すキャレット。
	 * ドロップ位置が末尾（最後のタイルの右）のときだけ 'after' になる。
	 */
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:357 -->

### [src/lib/components/QuickEmojiPalette.svelte:357](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L357)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 自分の位置に戻すだけのドロップにはキャレットを出さない。
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:386 -->

### [src/lib/components/QuickEmojiPalette.svelte:386](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L386)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// ドラッグ直後の互換 click でリアクションを飛ばさない。
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:489 -->

### [src/lib/components/QuickEmojiPalette.svelte:489](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L489)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
<!-- お気に入りタイルの説明。ドラッグできない環境でも Delete は使える。 -->
```

<!-- source: src/lib/components/QuickEmojiPalette.svelte:494 -->

### [src/lib/components/QuickEmojiPalette.svelte:494](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/QuickEmojiPalette.svelte#L494)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
<!--
					ドロップ先は検索 input に重ねる。行を足すとお気に入りの増減と合わせて
					高さが変わり、estimateQuickHeight とズレてポップオーバーが飛ぶ。
					ここなら常に同じ位置に出るので狙いやすくもある。
				-->
```

## src/lib/components/SortableEmojiGrid.svelte

<!-- source: src/lib/components/SortableEmojiGrid.svelte:15 -->

### [src/lib/components/SortableEmojiGrid.svelte:15](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/SortableEmojiGrid.svelte#L15)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
		 * しきい値未満のポインタ操作＝タップ。ドラッグ中は発火しない。
		 * event は Shift+クリックの連続選択判定のために渡す（受け取らなくてよい）。
		 */
```

<!-- source: src/lib/components/SortableEmojiGrid.svelte:24 -->

### [src/lib/components/SortableEmojiGrid.svelte:24](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/SortableEmojiGrid.svelte#L24)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// タップ（リアクション）とドラッグ（並び替え）を同じタイルで受けるためのしきい値。
```

## src/lib/components/TagContextMenu.svelte

<!-- source: src/lib/components/TagContextMenu.svelte:16 -->

### [src/lib/components/TagContextMenu.svelte:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TagContextMenu.svelte#L16)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
	 * 本文のハッシュタグの右クリック／長押しメニュー。レイアウトに1つだけ置く。
	 * お気に入り・フィードのタブ・ミュートの切り替えと、タグの投稿一覧への移動ができる。
	 */
```

<!-- source: src/lib/components/TagContextMenu.svelte:42 -->

### [src/lib/components/TagContextMenu.svelte:42](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TagContextMenu.svelte#L42)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 下に入らなければ指の上へ出す（長押しの指でメニューが隠れないように）。
```

<!-- source: src/lib/components/TagContextMenu.svelte:93 -->

### [src/lib/components/TagContextMenu.svelte:93](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TagContextMenu.svelte#L93)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 同期の取り込みが済んでから書く。先に書くと、同期前の一覧で新しい updatedAt を
	// 付けてしまい、サーバー側の値を上書きする（タブ設定画面と同じ理由）。
```

## src/lib/components/TagMuteSection.svelte

<!-- source: src/lib/components/TagMuteSection.svelte:10 -->

### [src/lib/components/TagMuteSection.svelte:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TagMuteSection.svelte#L10)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
	 * ミュートしたハッシュタグの追加と一覧。ミュート設定とタグ設定の両方に置く。
	 * 読み込み（mutes.load）は置く側のページが面倒を見る。
	 */
```

<!-- source: src/lib/components/TagMuteSection.svelte:19 -->

### [src/lib/components/TagMuteSection.svelte:19](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TagMuteSection.svelte#L19)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 失敗の文言。空文字で消す。 */
```

## src/lib/components/TagPalette.svelte

<!-- source: src/lib/components/TagPalette.svelte:8 -->

### [src/lib/components/TagPalette.svelte:8](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TagPalette.svelte#L8)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
	 * 投稿画面の「#」から開くタグパレット。お気に入り絵文字のパレットと同じく、
	 * 上にお気に入り、下に最近使ったタグを並べる。タップで本文へ `#tag ` を挿入する。
	 * 「最近使った」の ☆ からお気に入りへ登録できる（外すのは右クリックメニューか設定画面）。
	 */
```

<!-- source: src/lib/components/TagPalette.svelte:72 -->

### [src/lib/components/TagPalette.svelte:72](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TagPalette.svelte#L72)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 挿入したら入力欄へ戻す（挿入側がフォーカスするので、ボタンへは戻さない）。 */
```

## src/lib/emoji/emojiDrag.svelte.ts

<!-- source: src/lib/emoji/emojiDrag.svelte.ts:3 -->

### [src/lib/emoji/emojiDrag.svelte.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/emojiDrag.svelte.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * ドロップ先。DOM 側は `data-emoji-drop="<kind>"` と、必要なら
 * `data-emoji-drop-index="<n>"` を置くだけでよい。要素の親子関係を問わないので、
 * 「最近使った」から「お気に入り」のようにコンテナをまたぐドラッグが書ける。
 *
 * index を持つゾーンでは、要素の左右どちら側にポインタがあるかを after で返す。
 * 「一番右のタイルの右半分＝末尾に追加」を表現するために要る。
 */
```

<!-- source: src/lib/emoji/emojiDrag.svelte.ts:14 -->

### [src/lib/emoji/emojiDrag.svelte.ts:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/emojiDrag.svelte.ts#L14)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** タップ（＝即リアクション）と区別するための移動量。 */
```

<!-- source: src/lib/emoji/emojiDrag.svelte.ts:16 -->

### [src/lib/emoji/emojiDrag.svelte.ts:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/emojiDrag.svelte.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
	 * 既定では touch を弾く。クイックパレットのお気に入りグリッドは
	 * overflow-y: auto でスクロールするため、ドラッグに必要な
	 * touch-action: none を敷くとスクロールが死ぬ。
	 */
```

<!-- source: src/lib/emoji/emojiDrag.svelte.ts:31 -->

### [src/lib/emoji/emojiDrag.svelte.ts:31](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/emojiDrag.svelte.ts#L31)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// ドラッグ直後は互換 click が飛んでくる。並び替えた瞬間にリアクションが
	// 実行されないよう、次のタスクまでこのフラグでクリックを弾く。
```

<!-- source: src/lib/emoji/emojiDrag.svelte.ts:77 -->

### [src/lib/emoji/emojiDrag.svelte.ts:77](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/emojiDrag.svelte.ts#L77)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** pointerdown。この時点ではまだドラッグせず、閾値を超えるまで待つ。 */
```

<!-- source: src/lib/emoji/emojiDrag.svelte.ts:110 -->

### [src/lib/emoji/emojiDrag.svelte.ts:110](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/emojiDrag.svelte.ts#L110)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** pointerup / pointercancel / lostpointercapture 共通。 */
```

## src/lib/emoji/emojiSearch.ts

<!-- source: src/lib/emoji/emojiSearch.ts:10 -->

### [src/lib/emoji/emojiSearch.ts:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/emojiSearch.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 投稿欄の `:` 補完の1行。カスタム絵文字の後ろに Unicode 絵文字が続く。 */
```

<!-- source: src/lib/emoji/emojiSearch.ts:16 -->

### [src/lib/emoji/emojiSearch.ts:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/emojiSearch.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** カスタム絵文字。Unicode 絵文字より常に上に並べる。 */
```

<!-- source: src/lib/emoji/emojiSearch.ts:23 -->

### [src/lib/emoji/emojiSearch.ts:23](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/emojiSearch.ts#L23)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * 絵文字の意味検索。AppView が名前の一致 → 意味の近さの順に並べた結果を、
 * カスタム絵文字 → Unicode 絵文字の順で返す。
 *
 * 本人の絵文字は AppView にも載っているが、作った直後はまだ取り込まれていないことがある。
 * そこで本人 PDS のキャッシュから名前で一致したもののうち、AppView の結果に無いものを先頭に足す。
 *
 * AppView が落ちていても、本人の絵文字と手元の Unicode 検索（名前の一致だけ）で返す。
 */
```

<!-- source: src/lib/emoji/emojiSearch.ts:43 -->

### [src/lib/emoji/emojiSearch.ts:43](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/emojiSearch.ts#L43)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// AppView と同じく、名前の区切り（- _ 空白）の違いは無視する（bottan で :bot-tan_duel:）。
```

<!-- source: src/lib/emoji/emojiSearch.ts:87 -->

### [src/lib/emoji/emojiSearch.ts:87](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/emojiSearch.ts#L87)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// AppView に届かないときは手元の名前一致だけで出す。これも失敗したら検索失敗として投げる。
```

## src/lib/emoji/favorites.ts

<!-- source: src/lib/emoji/favorites.ts:10 -->

### [src/lib/emoji/favorites.ts:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/favorites.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * お気に入り絵文字パレット。真実源はアカウント（AppView）で、localStorage は
 * その端末のキャッシュ。同期できない端末（permission-set が古い等）では
 * localStorage 単独で従来どおり動く。
 *
 * 同期が有効なあいだはキーに DID を付ける。旧 v1 キーは DID で分かれておらず、
 * 1台で複数アカウントを使うと相手の一覧を引き継いでしまうため。
 */
```

<!-- source: src/lib/emoji/favorites.ts:24 -->

### [src/lib/emoji/favorites.ts:24](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/favorites.ts#L24)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 同期が有効な DID。sync 層が設定する。undefined なら未サインイン/未同期。 */
```

<!-- source: src/lib/emoji/favorites.ts:30 -->

### [src/lib/emoji/favorites.ts:30](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/favorites.ts#L30)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 同期のスコープを切り替える。アカウント切替とサインアウトで呼ぶ。 */
```

<!-- source: src/lib/emoji/favorites.ts:40 -->

### [src/lib/emoji/favorites.ts:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/favorites.ts#L40)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// v1 は生の配列。updatedAt を持たないので、初回同期の和集合でしか使わない。
```

<!-- source: src/lib/emoji/favorites.ts:53 -->

### [src/lib/emoji/favorites.ts:53](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/favorites.ts#L53)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 配列の順序がそのまま表示順。並び替えは配列を差し替えて保存する。 */
```

<!-- source: src/lib/emoji/favorites.ts:55 -->

### [src/lib/emoji/favorites.ts:55](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/favorites.ts#L55)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// DID スコープへ移行済みでもキャッシュがまだ無い端末では、旧キーの内容を見せる
	// （初回同期が終わるまでパレットが空に見えないように）。
```

<!-- source: src/lib/emoji/favorites.ts:62 -->

### [src/lib/emoji/favorites.ts:62](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/favorites.ts#L62)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 同期用に、この端末が持っている値と最終更新時刻をそのまま返す。 */
```

<!-- source: src/lib/emoji/favorites.ts:71 -->

### [src/lib/emoji/favorites.ts:71](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/favorites.ts#L71)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// ストレージが使えなくてもリアクション自体は動かす。
```

<!-- source: src/lib/emoji/favorites.ts:82 -->

### [src/lib/emoji/favorites.ts:82](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/favorites.ts#L82)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * サーバーから受け取った内容をこの端末へ書き戻す。編集ではないので push しない
 * （送り返すと updatedAt だけが進み続ける）。
 */
```

<!-- source: src/lib/emoji/favorites.ts:101 -->

### [src/lib/emoji/favorites.ts:101](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/favorites.ts#L101)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * 2つの一覧の和集合。先に渡した方の順序を保ち、片方にしか無いものを末尾へ足す。
 * 初回同期でしか使わない: 単純な後勝ちだと、サーバーが空の状態で端末Aと端末Bが
 * 別々の一覧を持っていたとき、後から同期した側の一覧が移行の瞬間に消えてしまう。
 */
```

<!-- source: src/lib/emoji/favorites.ts:122 -->

### [src/lib/emoji/favorites.ts:122](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/favorites.ts#L122)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * 既にお気に入りなら並びを変えず何もしない。新規は末尾に足す。
 * 満杯のときも元の配列をそのまま返す（末尾に足してから slice すると、
 * 足したはずの絵文字自身が切り捨てられて無言の no-op になる）。
 */
```

<!-- source: src/lib/emoji/favorites.ts:134 -->

### [src/lib/emoji/favorites.ts:134](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/favorites.ts#L134)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * 指定位置に差し込む。既にお気に入りなら並びを変えず何もしない。
 * 満杯のときは元の配列をそのまま返すので、呼び出し側は参照の同一性で
 * 「入らなかった」ことを判定できる（末尾を黙って切り捨てない）。
 */
```

## src/lib/emoji/reactionUsage.ts

<!-- source: src/lib/emoji/reactionUsage.ts:60 -->

### [src/lib/emoji/reactionUsage.ts:60](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/reactionUsage.ts#L60)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// v1 保存済みのお気に入りは mediaType が無い。旧APIが返した値はすべて画像だったため移行する。
```

<!-- source: src/lib/emoji/reactionUsage.ts:89 -->

### [src/lib/emoji/reactionUsage.ts:89](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/reactionUsage.ts#L89)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// Reactions remain available when storage is disabled.
```

<!-- source: src/lib/emoji/reactionUsage.ts:105 -->

### [src/lib/emoji/reactionUsage.ts:105](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/reactionUsage.ts#L105)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 一時的な通信・サーバー障害ではローカル履歴を消さない。次回表示時に再試行する。
```

<!-- source: src/lib/emoji/reactionUsage.ts:113 -->

### [src/lib/emoji/reactionUsage.ts:113](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/reactionUsage.ts#L113)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 保存済みカスタム絵文字をAppViewで再解決し、規格外・削除済みだけを取り除く。 */
```

<!-- source: src/lib/emoji/reactionUsage.ts:140 -->

### [src/lib/emoji/reactionUsage.ts:140](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/reactionUsage.ts#L140)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 検証を待つ間に選ばれた絵文字や使用回数を古いスナップショットで巻き戻さない。
```

<!-- source: src/lib/emoji/reactionUsage.ts:164 -->

### [src/lib/emoji/reactionUsage.ts:164](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/reactionUsage.ts#L164)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// Fall through to the v1 migration.
```

<!-- source: src/lib/emoji/reactionUsage.ts:210 -->

### [src/lib/emoji/reactionUsage.ts:210](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/reactionUsage.ts#L210)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 履歴の上限は最新順で適用する。使用回数順だと新しい絵文字が脱落する。
```

<!-- source: src/lib/emoji/reactionUsage.ts:321 -->

### [src/lib/emoji/reactionUsage.ts:321](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/reactionUsage.ts#L321)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// PDS取得に失敗してもAppViewの公開候補は利用できる。
```

<!-- source: src/lib/emoji/reactionUsage.ts:337 -->

### [src/lib/emoji/reactionUsage.ts:337](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/reactionUsage.ts#L337)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 起動直後の一時的な通信失敗をセッション中ずっと空候補として固定しない。
```

<!-- source: src/lib/emoji/reactionUsage.ts:358 -->

### [src/lib/emoji/reactionUsage.ts:358](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/reactionUsage.ts#L358)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 履歴とお気に入りの検証結果は利用できるようにし、候補一覧だけ次回再試行する。
```

## src/lib/emoji/unicodeSearch.ts

<!-- source: src/lib/emoji/unicodeSearch.ts:4 -->

### [src/lib/emoji/unicodeSearch.ts:4](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/unicodeSearch.ts#L4)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * emoji-picker-element 内蔵の検索は使わず、ここで自前に検索する。
 * ライブラリ側は2文字未満のクエリ・トークンを捨てるため「炎」のような
 * 1文字の日本語では引けず、また ja データには英語キーワードが無いので
 * "fire" でも引けないため。
 */
```

<!-- source: src/lib/emoji/unicodeSearch.ts:19 -->

### [src/lib/emoji/unicodeSearch.ts:19](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/unicodeSearch.ts#L19)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 一致した項目の種類。値がそのままスコアの重みになる（小さいほど良い）。
```

<!-- source: src/lib/emoji/unicodeSearch.ts:29 -->

### [src/lib/emoji/unicodeSearch.ts:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/unicodeSearch.ts#L29)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** コードポイント数。同点時に単体の絵文字を ZWJ 合字より前に出すために使う。 */
```

<!-- source: src/lib/emoji/unicodeSearch.ts:31 -->

### [src/lib/emoji/unicodeSearch.ts:31](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/unicodeSearch.ts#L31)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** FIELD_* を添字とする、正規化済みキーワード。 */
```

<!-- source: src/lib/emoji/unicodeSearch.ts:35 -->

### [src/lib/emoji/unicodeSearch.ts:35](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/unicodeSearch.ts#L35)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** NFKC + 小文字化 + ひらがな→カタカナ（「ねこ」と「ネコ」を同一視する）。 */
```

<!-- source: src/lib/emoji/unicodeSearch.ts:52 -->

### [src/lib/emoji/unicodeSearch.ts:52](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/unicodeSearch.ts#L52)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * ja/en 双方のデータを突き合わせて検索用インデックスを作る。
 * 両者は同じ絵文字集合・同じ order を持つので emoji 文字列で結合できる。
 */
```

<!-- source: src/lib/emoji/unicodeSearch.ts:94 -->

### [src/lib/emoji/unicodeSearch.ts:94](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/unicodeSearch.ts#L94)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * 一致の質をスコア化する。完全一致 < 前方一致 < 部分一致、
 * 同じ種類なら 表示名 < ショートコード < タグ の順に良い。一致しなければ undefined。
 */
```

<!-- source: src/lib/emoji/unicodeSearch.ts:108 -->

### [src/lib/emoji/unicodeSearch.ts:108](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/unicodeSearch.ts#L108)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// その種類で完全一致、これ以上は良くならない
```

<!-- source: src/lib/emoji/unicodeSearch.ts:116 -->

### [src/lib/emoji/unicodeSearch.ts:116](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/unicodeSearch.ts#L116)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** クエリ全体での一致を優先し、無ければ語ごとの AND 一致（英数クエリのみ）で拾う。 */
```

<!-- source: src/lib/emoji/unicodeSearch.ts:128 -->

### [src/lib/emoji/unicodeSearch.ts:128](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/unicodeSearch.ts#L128)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 語をばらした一致は、クエリ全体での一致より必ず後ろに置く。
```

<!-- source: src/lib/emoji/unicodeSearch.ts:139 -->

### [src/lib/emoji/unicodeSearch.ts:139](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/emoji/unicodeSearch.ts#L139)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 英数クエリは空白区切りに意味があるので語ごとにも見る。
	// 日本語は語が分かち書きされないのでクエリ全体だけで判断する。
```

## src/lib/tag-favorites/list.ts

<!-- source: src/lib/tag-favorites/list.ts:3 -->

### [src/lib/tag-favorites/list.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/list.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** お気に入りタグの上限と1つの長さ。AppView の TAG_FAVORITES_LIMIT / TAG_FAVORITE_MAX_LENGTH と揃える。 */
```

<!-- source: src/lib/tag-favorites/list.ts:6 -->

### [src/lib/tag-favorites/list.ts:6](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/list.ts#L6)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 最近使ったタグの上限。端末ローカルの履歴なので、パレットに収まる程度で十分。 */
```

<!-- source: src/lib/tag-favorites/list.ts:9 -->

### [src/lib/tag-favorites/list.ts:9](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/list.ts#L9)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 保存できる正規形にする。空・長すぎ・空白入りは undefined。 */
```

<!-- source: src/lib/tag-favorites/list.ts:16 -->

### [src/lib/tag-favorites/list.ts:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/list.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 正規化し、空と重複を落として上限で切る。並びは先勝ち。 */
```

<!-- source: src/lib/tag-favorites/list.ts:32 -->

### [src/lib/tag-favorites/list.ts:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/list.ts#L32)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * 末尾に足す。既にあれば並びを変えず、満杯なら元の配列をそのまま返す
 * （呼び出し側は参照の同一性で「入らなかった」ことを判定できる）。
 */
```

<!-- source: src/lib/tag-favorites/list.ts:47 -->

### [src/lib/tag-favorites/list.ts:47](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/list.ts#L47)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** index の要素を1つ前（-1）/後ろ（+1）へ動かす。端なら元の配列。 */
```

<!-- source: src/lib/tag-favorites/list.ts:56 -->

### [src/lib/tag-favorites/list.ts:56](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/list.ts#L56)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 今回使ったタグを先頭へ積む（本文の出現順を保つ）。 */
```

## src/lib/tag-favorites/tag-favorites.svelte.ts

<!-- source: src/lib/tag-favorites/tag-favorites.svelte.ts:13 -->

### [src/lib/tag-favorites/tag-favorites.svelte.ts:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/tag-favorites.svelte.ts#L13)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * お気に入りタグと最近使ったタグ。
 *
 * お気に入りは真実源がアカウント（AppView）で、localStorage はその端末のキャッシュ。
 * 同期できない端末では localStorage 単独で動く（お気に入り絵文字・タブ構成と同じ作り）。
 * 最近使ったタグは端末ごとの履歴で、同期しない。
 *
 * パレット・右クリックメニュー・設定画面で状態を共有するので、リアクティブな singleton を持つ。
 * このモジュールのトップレベルで localStorage に触らないこと（prerender 時に Node で評価される）。
 */
```

<!-- source: src/lib/tag-favorites/tag-favorites.svelte.ts:35 -->

### [src/lib/tag-favorites/tag-favorites.svelte.ts:35](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/tag-favorites.svelte.ts#L35)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** アカウント切替とサインアウトで呼ぶ。 */
```

<!-- source: src/lib/tag-favorites/tag-favorites.svelte.ts:69 -->

### [src/lib/tag-favorites/tag-favorites.svelte.ts:69](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/tag-favorites.svelte.ts#L69)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// ストレージが使えなくても、そのセッションのあいだは $state 側で動く。
```

<!-- source: src/lib/tag-favorites/tag-favorites.svelte.ts:73 -->

### [src/lib/tag-favorites/tag-favorites.svelte.ts:73](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/tag-favorites.svelte.ts#L73)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 同期用に、この端末が持っている値と最終更新時刻をそのまま返す。 */
```

<!-- source: src/lib/tag-favorites/tag-favorites.svelte.ts:78 -->

### [src/lib/tag-favorites/tag-favorites.svelte.ts:78](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/tag-favorites.svelte.ts#L78)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * サーバーから受け取った内容をこの端末へ書き戻す。編集ではないので push しない
 * （送り返すと updatedAt だけが進み続ける）。表示中のスコープなら画面にも反映する。
 */
```

<!-- source: src/lib/tag-favorites/tag-favorites.svelte.ts:92 -->

### [src/lib/tag-favorites/tag-favorites.svelte.ts:92](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/tag-favorites.svelte.ts#L92)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** localStorage から読み直す。browser でのみ呼ぶこと。 */
```

<!-- source: src/lib/tag-favorites/tag-favorites.svelte.ts:107 -->

### [src/lib/tag-favorites/tag-favorites.svelte.ts:107](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/tag-favorites.svelte.ts#L107)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 入らなかった（満杯・不正）ときは false。既にあれば true。 */
```

<!-- source: src/lib/tag-favorites/tag-favorites.svelte.ts:132 -->

### [src/lib/tag-favorites/tag-favorites.svelte.ts:132](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/tag-favorites.svelte.ts#L132)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 投稿に成功したときに、その投稿で使ったタグを履歴へ積む。 */
```

## src/lib/tag-favorites/tag-menu.svelte.ts

<!-- source: src/lib/tag-favorites/tag-menu.svelte.ts:1 -->

### [src/lib/tag-favorites/tag-menu.svelte.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/tag-menu.svelte.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * 本文のハッシュタグを右クリック／長押ししたときのメニュー。画面に1つだけ置く
 * （TagContextMenu をレイアウトにマウントする）ので、開く側はここへ座標とタグを渡すだけ。
 */
```

<!-- source: src/lib/tag-favorites/tag-menu.svelte.ts:9 -->

### [src/lib/tag-favorites/tag-menu.svelte.ts:9](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/tag-menu.svelte.ts#L9)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** 閉じたときにフォーカスを戻す先。 */
```

<!-- source: src/lib/tag-favorites/tag-menu.svelte.ts:33 -->

### [src/lib/tag-favorites/tag-menu.svelte.ts:33](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tag-favorites/tag-menu.svelte.ts#L33)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * タグのリンクに付ける action。マウスは右クリック（contextmenu）、タッチとペンは長押しで開く。
 * iOS Safari は長押しで contextmenu を出さないので、タイマーで自前に判定する。
 * Android は長押しでも contextmenu が来るが、同じタグを開き直すだけなので二重には見えない。
 * 長押しで開いたあとの click はリンク遷移（と親の投稿タップ）にしない。
 */
```

## src/lib/tags.ts

<!-- source: src/lib/tags.ts:1 -->

### [src/lib/tags.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tags.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
 * ハッシュタグの正規形。先頭の # / ＃ を除いた小文字で、AppView の保存・検索・ミュートと同じ。
 * 表示用に原文ケースを残したいとき（プロフィールのタグなど）は使わないこと。
 */
```

<!-- source: src/lib/tags.ts:12 -->

### [src/lib/tags.ts:12](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/tags.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/** タグの投稿一覧（/search のタグモード）へのリンク。 */
```

## src/routes/dev/emoji-generate/+page.svelte

<!-- source: src/routes/dev/emoji-generate/+page.svelte:5 -->

### [src/routes/dev/emoji-generate/+page.svelte:5](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/emoji-generate/+page.svelte#L5)

分類: 検証・再現条件。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
/**
	 * 「botたんに描いてもらう」タブ（EmojiGeneratePanel）を AppView なしで確かめるページ。
	 * 候補の絵は canvas で描いたモックで、依頼も登録もブラウザ内だけで完結し、どこにも送信しない。
	 */
```

<!-- source: src/routes/dev/emoji-generate/+page.svelte:47 -->

### [src/routes/dev/emoji-generate/+page.svelte:47](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/emoji-generate/+page.svelte#L47)

分類: 検証・再現条件。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 画面は最新の結果1件と、描いている途中の依頼1件を重ねて見せる。
		// ?state=fresh で初めての依頼（前の絵なし）、?state=failed で描けなかった結果を確かめられる。
```

## src/routes/emoji/+page.svelte

<!-- source: src/routes/emoji/+page.svelte:26 -->

### [src/routes/emoji/+page.svelte:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/emoji/+page.svelte#L26)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 既定は左端の「絵文字をつくる」。通知などからはクエリでほかのタブを直接開ける。
	// 廃止した「画像から作成」「まとめて作成」（single / batch）は、代わりになる「絵文字をつくる」へ寄せる。
```

<!-- source: src/routes/emoji/+page.svelte:60 -->

### [src/routes/emoji/+page.svelte:60](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/emoji/+page.svelte#L60)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 権限の更新などでページを離れても、戻ったときに同じタブを開けるよう URL に残す。
```

<!-- source: src/routes/emoji/+page.svelte:65 -->

### [src/routes/emoji/+page.svelte:65](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/emoji/+page.svelte#L65)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// えもじあっとで保存して戻ってきたときに、新しい絵文字が並ぶようにする。
```

## src/routes/settings/emoji-favorites/+page.svelte

<!-- source: src/routes/settings/emoji-favorites/+page.svelte:1 -->

### [src/routes/settings/emoji-favorites/+page.svelte:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/emoji-favorites/+page.svelte#L1)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
<!-- Legacy URL; +page.ts redirects to /emoji. -->
```

## src/routes/settings/emoji/+page.svelte

<!-- source: src/routes/settings/emoji/+page.svelte:1 -->

### [src/routes/settings/emoji/+page.svelte:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/emoji/+page.svelte#L1)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
<!-- Legacy URL; +page.ts redirects to /emoji. -->
```

## src/routes/settings/tags/+page.svelte

<!-- source: src/routes/settings/tags/+page.svelte:20 -->

### [src/routes/settings/tags/+page.svelte:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/tags/+page.svelte#L20)

分類: 仕様・設計の根拠。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// 同期の取り込みが済むまで編集させない。先に触ると、同期前の一覧に新しい updatedAt が付き、
	// サーバー側の値を上書きしてしまう（タブ設定画面と同じ理由）。
```

## tests/e2e/emoji-permissions.spec.ts

<!-- source: tests/e2e/emoji-permissions.spec.ts:35 -->

### [tests/e2e/emoji-permissions.spec.ts:35](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/emoji-permissions.spec.ts#L35)

分類: 検証・再現条件。対応仕様: [emoji-tags](../../specs/emoji-tags/spec.md#requirements)。

```text
// @ts-expect-error Vite resolves the browser module.
```
