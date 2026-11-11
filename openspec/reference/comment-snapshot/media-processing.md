# 画像・GIF・動画・リンクカード：導入時コメント原文

この文書は基準コミット `24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf` に固定した履歴資料であり、現行コードの行番号一覧ではない。現在の要件は [spec.md](../../specs/media-processing/spec.md)、判断理由は [design.md](../../specs/media-processing/design.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/components/AppLinkCard.svelte

<!-- source: src/lib/components/AppLinkCard.svelte:20 -->

### [src/lib/components/AppLinkCard.svelte:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AppLinkCard.svelte#L20)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 単一表示（従来レイアウト）は 1 レコードのときだけ。複数はコンパクトなリスト行で並べる。
```

<!-- source: src/lib/components/AppLinkCard.svelte:310 -->

### [src/lib/components/AppLinkCard.svelte:310](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AppLinkCard.svelte#L310)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/* ネスト flex 内で長文が縮まずカードを押し広げるのを防ぐ（省略記号を効かせる）。 */
```

<!-- source: src/lib/components/AppLinkCard.svelte:317 -->

### [src/lib/components/AppLinkCard.svelte:317](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AppLinkCard.svelte#L317)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/* repeat 展開時のリスト行。1要素=小サムネ+フィールドの詰まった1行。 */
```

## src/lib/components/AvatarCropper.svelte

<!-- source: src/lib/components/AvatarCropper.svelte:10 -->

### [src/lib/components/AvatarCropper.svelte:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AvatarCropper.svelte#L10)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// アスペクト比（幅/高さ）。1=正方形（アバター）、3=横長（チャンネルバナー）など。
```

<!-- source: src/lib/components/AvatarCropper.svelte:12 -->

### [src/lib/components/AvatarCropper.svelte:12](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AvatarCropper.svelte#L12)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 見た目。アバターは円形、バナーは角丸の矩形。
```

<!-- source: src/lib/components/AvatarCropper.svelte:23 -->

### [src/lib/components/AvatarCropper.svelte:23](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AvatarCropper.svelte#L23)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// ビューポートは幅を基準に、高さをアスペクト比から決める。
```

<!-- source: src/lib/components/AvatarCropper.svelte:97 -->

### [src/lib/components/AvatarCropper.svelte:97](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AvatarCropper.svelte#L97)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// viewportW と outW の比。viewportH:outH も同じ比なので単一 ratio で足りる。
```

## src/lib/components/ImageAttachmentEditor.svelte

<!-- source: src/lib/components/ImageAttachmentEditor.svelte:13 -->

### [src/lib/components/ImageAttachmentEditor.svelte:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ImageAttachmentEditor.svelte#L13)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 記事の入力欄の中に出している画像など、一覧に出さない添付の id。
```

<!-- source: src/lib/components/ImageAttachmentEditor.svelte:26 -->

### [src/lib/components/ImageAttachmentEditor.svelte:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ImageAttachmentEditor.svelte#L26)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 一覧に出している添付だけを並べ替え、出していない添付の位置はそのままにする。 */
```

## src/lib/components/ImageAttachmentPicker.svelte

<!-- source: src/lib/components/ImageAttachmentPicker.svelte:28 -->

### [src/lib/components/ImageAttachmentPicker.svelte:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ImageAttachmentPicker.svelte#L28)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 画像の上限。ブログは standard.site に上限が無いので Infinity を渡す。 */
```

<!-- source: src/lib/components/ImageAttachmentPicker.svelte:30 -->

### [src/lib/components/ImageAttachmentPicker.svelte:30](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ImageAttachmentPicker.svelte#L30)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** allowVideo のとき、選んだ動画（1本まで）をここへ入れる。画像と併用できる。 */
```

<!-- source: src/lib/components/ImageAttachmentPicker.svelte:36 -->

### [src/lib/components/ImageAttachmentPicker.svelte:36](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ImageAttachmentPicker.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 画像が上限で、動画もこれ以上足せないときだけボタンを止める。 */
```

<!-- source: src/lib/components/ImageAttachmentPicker.svelte:103 -->

### [src/lib/components/ImageAttachmentPicker.svelte:103](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ImageAttachmentPicker.svelte#L103)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 画像と一緒に入っている HTML や代替テキストを本文へ貼り付けない。
```

## src/lib/components/LinkCard.svelte

<!-- source: src/lib/components/LinkCard.svelte:18 -->

### [src/lib/components/LinkCard.svelte:18](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/LinkCard.svelte#L18)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// カードの URI が http(s) の場合のみリンクにする。細工された javascript: URI は
	// クリック不能なプレーンカードとして描画する。
	// 姉妹アプリ宛なら did ヒントを足す（それ以外の URL は素通り）。
```

## src/lib/components/LinkCardEditor.svelte

<!-- source: src/lib/components/LinkCardEditor.svelte:16 -->

### [src/lib/components/LinkCardEditor.svelte:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/LinkCardEditor.svelte#L16)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// ユーザーが × で消した URL。下書きに保存して復元時の再取得を防ぐため公開している。
```

<!-- source: src/lib/components/LinkCardEditor.svelte:19 -->

### [src/lib/components/LinkCardEditor.svelte:19](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/LinkCardEditor.svelte#L19)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 記事本文。カードは URL だけの行に置いたものだけを作り、本文の行ごとに出せるので
		// 通常投稿の4枚の上限も掛けない（文中の URL はリンクのまま）。
```

<!-- source: src/lib/components/LinkCardEditor.svelte:22 -->

### [src/lib/components/LinkCardEditor.svelte:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/LinkCardEditor.svelte#L22)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 記事の入力欄が URL 行の下にカードを重ねて見せるとき。行に置いたカードは一覧に出さず、
		// 行に置かれていないもの（URL 行を消した後に残ったカードなど）だけを並べる。
```

<!-- source: src/lib/components/LinkCardEditor.svelte:25 -->

### [src/lib/components/LinkCardEditor.svelte:25](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/LinkCardEditor.svelte#L25)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 取得中の URL。入力欄に重ねたカードにも「取得中」を出せるよう公開している。
```

<!-- source: src/lib/components/LinkCardEditor.svelte:50 -->

### [src/lib/components/LinkCardEditor.svelte:50](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/LinkCardEditor.svelte#L50)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 並べ替えるのは一覧に出しているカードだけ。行に置いたカードの位置は本文が決める。
```

<!-- source: src/lib/components/LinkCardEditor.svelte:66 -->

### [src/lib/components/LinkCardEditor.svelte:66](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/LinkCardEditor.svelte#L66)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 本文から URL 自体が消えたら「消した」記録も忘れる。書き戻しは差分があるときだけ
		// 行う（この effect は dismissedUrls を読むので、無条件の代入はループになる）。
```

<!-- source: src/lib/components/LinkCardEditor.svelte:70 -->

### [src/lib/components/LinkCardEditor.svelte:70](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/LinkCardEditor.svelte#L70)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 記事では、カードは URL だけの行の位置に出す。行を消したらカードも外す（残すと入力欄の下の
		// 一覧に移り、記事の末尾に出てしまう）。開いた時点で行に無かった古い記事のカードは、
		// 一度も previousUrls に入らないので残る。
```

<!-- source: src/lib/components/LinkCardEditor.svelte:96 -->

### [src/lib/components/LinkCardEditor.svelte:96](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/LinkCardEditor.svelte#L96)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// AppView下書きはサムネイルBlobを持たない。保存済みタイトル・説明を先に表示したまま、
		// URLから画像を一度だけ再取得する。失敗時も既存テキストは維持する。
```

<!-- source: src/lib/components/LinkCardEditor.svelte:108 -->

### [src/lib/components/LinkCardEditor.svelte:108](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/LinkCardEditor.svelte#L108)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 編集時の既存カードは AppView の相対 URL、新規取得分だけが解放対象の Object URL。
```

<!-- source: src/lib/components/LinkCardEditor.svelte:152 -->

### [src/lib/components/LinkCardEditor.svelte:152](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/LinkCardEditor.svelte#L152)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// Give up after the Cardyb fallback also fails.
```

<!-- source: src/lib/components/LinkCardEditor.svelte:172 -->

### [src/lib/components/LinkCardEditor.svelte:172](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/LinkCardEditor.svelte#L172)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// Keep the hostname fallback so metadata failure never blocks posting.
```

<!-- source: src/lib/components/LinkCardEditor.svelte:178 -->

### [src/lib/components/LinkCardEditor.svelte:178](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/LinkCardEditor.svelte#L178)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 入力欄に重ねたカードの × からも呼ぶ。 */
```

## src/lib/components/MediaGrid.svelte

<!-- source: src/lib/components/MediaGrid.svelte:47 -->

### [src/lib/components/MediaGrid.svelte:47](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/MediaGrid.svelte#L47)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
<!-- タイル自体がリンクなので、マスクは操作させない（リンクの中にボタンを置けない）。
					     解除はスレッドを開いた先の ImageGallery でやってもらう。 -->
```

## src/lib/components/PostImageEditor.svelte

<!-- source: src/lib/components/PostImageEditor.svelte:36 -->

### [src/lib/components/PostImageEditor.svelte:36](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostImageEditor.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 記事の入力欄の中に出している画像など、一覧に出さない画像の id。 */
```

<!-- source: src/lib/components/PostImageEditor.svelte:38 -->

### [src/lib/components/PostImageEditor.svelte:38](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostImageEditor.svelte#L38)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 画像の上限。記事は standard.site に上限が無いので Infinity を渡す。 */
```

<!-- source: src/lib/components/PostImageEditor.svelte:40 -->

### [src/lib/components/PostImageEditor.svelte:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostImageEditor.svelte#L40)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** allowVideo のとき、選んだ動画（1本まで）をここへ入れる。画像と併用できる。 */
```

<!-- source: src/lib/components/PostImageEditor.svelte:43 -->

### [src/lib/components/PostImageEditor.svelte:43](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostImageEditor.svelte#L43)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 編集前からの動画も含め、動画が付いている。付いている間は動画を足せない。 */
```

<!-- source: src/lib/components/PostImageEditor.svelte:49 -->

### [src/lib/components/PostImageEditor.svelte:49](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostImageEditor.svelte#L49)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 画像が上限で、動画もこれ以上足せないときだけボタンを止める。 */
```

<!-- source: src/lib/components/PostImageEditor.svelte:53 -->

### [src/lib/components/PostImageEditor.svelte:53](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostImageEditor.svelte#L53)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 一覧に出している画像だけを並べ替え、出していない画像の位置はそのままにする。 */
```

## src/lib/components/PostVideoEditor.svelte

<!-- source: src/lib/components/PostVideoEditor.svelte:2 -->

### [src/lib/components/PostVideoEditor.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostVideoEditor.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 編集開始時に投稿へ付いていた動画。blob は PDS のレコード側にあるので、alt と CW だけ持つ。 */
```

## src/lib/components/VideoAttachmentEditor.svelte

<!-- source: src/lib/components/VideoAttachmentEditor.svelte:22 -->

### [src/lib/components/VideoAttachmentEditor.svelte:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/VideoAttachmentEditor.svelte#L22)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 外された・差し替えられた動画は送信を止め、プレビューの URL を解放する。
```

<!-- source: src/lib/components/VideoAttachmentEditor.svelte:50 -->

### [src/lib/components/VideoAttachmentEditor.svelte:50](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/VideoAttachmentEditor.svelte#L50)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 送り直して直るのは通信と変換の失敗だけ。形式や長さの誤りは選び直してもらう。
```

<!-- source: src/lib/components/VideoAttachmentEditor.svelte:72 -->

### [src/lib/components/VideoAttachmentEditor.svelte:72](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/VideoAttachmentEditor.svelte#L72)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 投稿モーダルは閉じても Composer を残すので、閉じるだけなら送信は続く。
	// 失われるのは再読み込みとタブを閉じたときだけなので、そこで離脱確認を出す。
```

<!-- source: src/lib/components/VideoAttachmentEditor.svelte:90 -->

### [src/lib/components/VideoAttachmentEditor.svelte:90](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/VideoAttachmentEditor.svelte#L90)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
<!-- 添付欄は高さが限られていてスクロールする。状態はプレビューの上に重ね、
		     スクロールしなくても進み具合が見えるようにする。 -->
```

<!-- source: src/lib/components/VideoAttachmentEditor.svelte:100 -->

### [src/lib/components/VideoAttachmentEditor.svelte:100](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/VideoAttachmentEditor.svelte#L100)

分類: ツール指示（削除対象外）。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
<!-- svelte-ignore a11y_media_has_caption -->
```

<!-- source: src/lib/components/VideoAttachmentEditor.svelte:104 -->

### [src/lib/components/VideoAttachmentEditor.svelte:104](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/VideoAttachmentEditor.svelte#L104)

分類: ツール指示（削除対象外）。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
<!-- svelte-ignore a11y_media_has_caption -->
```

<!-- source: src/lib/components/VideoAttachmentEditor.svelte:140 -->

### [src/lib/components/VideoAttachmentEditor.svelte:140](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/VideoAttachmentEditor.svelte#L140)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
<!-- % が分かるのは送信中だけ。確認・変換・仕上げは終わりの見えないバーにする。
						     value に undefined を渡しても value="0" が残るので、要素ごと分ける。 -->
```

## src/lib/components/VideoPlayer.svelte

<!-- source: src/lib/components/VideoPlayer.svelte:2 -->

### [src/lib/components/VideoPlayer.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/VideoPlayer.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 同時に鳴らさない。新しく再生が始まったら、前の動画を止める。 */
```

<!-- source: src/lib/components/VideoPlayer.svelte:23 -->

### [src/lib/components/VideoPlayer.svelte:23](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/VideoPlayer.svelte#L23)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 縦長の動画で TL が埋まらないよう、横幅を縮めて高さを抑える。
```

<!-- source: src/lib/components/VideoPlayer.svelte:51 -->

### [src/lib/components/VideoPlayer.svelte:51](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/VideoPlayer.svelte#L51)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// MSE があるブラウザでは hls.js を使う。Chrome は canPlayType で HLS に 'maybe' を返すが、
		// 組み込みの HLS 再生は video.cdn.bsky.app へのリダイレクトを挟むと失敗する（2026-10-10 実測）。
		// 組み込み再生は MSE の無い環境（古い iPhone の Safari）だけに残す。
```

<!-- source: src/lib/components/VideoPlayer.svelte:97 -->

### [src/lib/components/VideoPlayer.svelte:97](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/VideoPlayer.svelte#L97)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
<!-- 字幕は今回扱わないので track は持たない。 -->
```

<!-- source: src/lib/components/VideoPlayer.svelte:98 -->

### [src/lib/components/VideoPlayer.svelte:98](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/VideoPlayer.svelte#L98)

分類: ツール指示（削除対象外）。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
<!-- svelte-ignore a11y_media_has_caption -->
```

<!-- source: src/lib/components/VideoPlayer.svelte:107 -->

### [src/lib/components/VideoPlayer.svelte:107](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/VideoPlayer.svelte#L107)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// hls.js が付いているときは、そちらの ERROR で判断する（MSE の一時的な失敗で止めない）。
```

## src/lib/gif-compression-codec.ts

<!-- source: src/lib/gif-compression-codec.ts:54 -->

### [src/lib/gif-compression-codec.ts:54](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/gif-compression-codec.ts#L54)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 待ち時間を優先し、2MB以下になった時点で追加の高画質化試行は行わない。
```

<!-- source: src/lib/gif-compression-codec.ts:60 -->

### [src/lib/gif-compression-codec.ts:60](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/gif-compression-codec.ts#L60)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 最終試行は最小設定へ飛び、従来の到達可能範囲を維持する。
```

## src/lib/gif-compression-core.ts

<!-- source: src/lib/gif-compression-core.ts:6 -->

### [src/lib/gif-compression-core.ts:6](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/gif-compression-core.ts#L6)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// フレームを間引かず、色数と寸法だけを品質の高い順に段階調整する。
```

<!-- source: src/lib/gif-compression-core.ts:18 -->

### [src/lib/gif-compression-core.ts:18](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/gif-compression-core.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 入力と上限の比から、最初から成功しやすい縮小率を選ぶ。 */
```

<!-- source: src/lib/gif-compression-core.ts:25 -->

### [src/lib/gif-compression-core.ts:25](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/gif-compression-core.ts#L25)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 直前の出力サイズを使い、効果が足りない設定を飛ばして次の縮小率を選ぶ。 */
```

<!-- source: src/lib/gif-compression-core.ts:40 -->

### [src/lib/gif-compression-core.ts:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/gif-compression-core.ts#L40)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// これを超えるGIFはデコードだけで数百MBを消費し得るため、端末保護を優先して止める。
```

<!-- source: src/lib/gif-compression-core.ts:57 -->

### [src/lib/gif-compression-core.ts:57](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/gif-compression-core.ts#L57)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** Worker内で使うRGBAのバイリニア縮小。GIFの透過もalpha値として補間する。 */
```

<!-- source: src/lib/gif-compression-core.ts:92 -->

### [src/lib/gif-compression-core.ts:92](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/gif-compression-core.ts#L92)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// GIFの透過は二値なので、alphaは補間せず最近傍の0/255を維持する。
```

## src/lib/gif-compression.test.ts

<!-- source: src/lib/gif-compression.test.ts:84 -->

### [src/lib/gif-compression.test.ts:84](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/gif-compression.test.ts#L84)

分類: 検証・再現条件。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 上限以下になった時点で、高画質化のための追加試行は行わない。
```

## src/lib/images.ts

<!-- source: src/lib/images.ts:6 -->

### [src/lib/images.ts:6](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/images.ts#L6)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/**
 * ブログのヘッダー画像の上限。site.standard.document#coverImage は
 * lexicon で 1MB 未満と決まっているので、通常の添付より強く圧縮する。
 */
```

<!-- source: src/lib/images.ts:15 -->

### [src/lib/images.ts:15](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/images.ts#L15)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/**
	 * ブログのヘッダー画像。記事では先頭（attachments[0]）にだけ置き、本文には差し込まない。
	 * standard.site の coverImage は「1枚目の画像」なので、位置と印の両方で表す。
	 */
```

## src/lib/media-selection.ts

<!-- source: src/lib/media-selection.ts:3 -->

### [src/lib/media-selection.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/media-selection.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** ファイル選択の accept。動画を受け付ける入口では動画の形式も足す。 */
```

<!-- source: src/lib/media-selection.ts:7 -->

### [src/lib/media-selection.ts:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/media-selection.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/**
 * 画像ボタンで選ばれたファイルの振り分け。画像（4枚まで）と動画（1本まで）は同じ投稿に
 * 混ぜてよい。ポストモーダルと投稿編集の両方がこの規則を使う。
 */
```

<!-- source: src/lib/media-selection.ts:29 -->

### [src/lib/media-selection.ts:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/media-selection.ts#L29)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 貼り付けから拾うファイル。動画を受け付けない入口では画像だけ。 */
```

## src/lib/media/youtube.ts

<!-- source: src/lib/media/youtube.ts:3 -->

### [src/lib/media/youtube.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/media/youtube.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** YouTube の動画 URL から、安全に embed へ渡せる動画 ID だけを取り出す。 */
```

## src/lib/video-attachment.svelte.ts

<!-- source: src/lib/video-attachment.svelte.ts:17 -->

### [src/lib/video-attachment.svelte.ts:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video-attachment.svelte.ts#L17)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/**
 * 投稿に添付する動画1本。添付した時点で video.bsky.app への送信と変換を始め、
 * 終わるまで投稿ボタンを止める（status が 'ready' になるまで blob は無い）。
 */
```

<!-- source: src/lib/video-attachment.svelte.ts:42 -->

### [src/lib/video-attachment.svelte.ts:42](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video-attachment.svelte.ts#L42)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 送信か変換の途中。ページを離れると失われる。 */
```

<!-- source: src/lib/video-attachment.svelte.ts:74 -->

### [src/lib/video-attachment.svelte.ts:74](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video-attachment.svelte.ts#L74)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 外したときに呼ぶ。送信中なら止め、プレビューの URL を解放する。 */
```

<!-- source: src/lib/video-attachment.svelte.ts:80 -->

### [src/lib/video-attachment.svelte.ts:80](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video-attachment.svelte.ts#L80)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** レコードへ書く形。ready でなければ undefined。 */
```

## src/lib/video.ts

<!-- source: src/lib/video.ts:1 -->

### [src/lib/video.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/**
 * 動画添付。変換と配信は Bluesky の動画サービス（video.bsky.app）に任せる。
 *
 * 1. getUploadLimits で残り枠を確かめる（service auth の aud は video.bsky.app）
 * 2. uploadVideo へ送る（service auth の aud は利用者の PDS。サービスが代わりに uploadBlob する）
 * 3. getJobStatus を待ち、PDS に置かれた mp4 の blob を受け取る
 *
 * 再生は video.bsky.app/watch/{did}/{cid}/playlist.m3u8（AppView がビューで返す）。
 * Bluesky の投稿から参照されていない blob でも配信される（2026-10-09 実測）。
 */
```

<!-- source: src/lib/video.ts:14 -->

### [src/lib/video.ts:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L14)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** Bluesky の動画アップロード上限（300MB）。 */
```

<!-- source: src/lib/video.ts:21 -->

### [src/lib/video.ts:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L21)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** AppView の blueskyVideoUrls と同じ形。編集直後の楽観反映に使う。 */
```

<!-- source: src/lib/video.ts:61 -->

### [src/lib/video.ts:61](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L61)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/**
 * 送信の段階。送信中だけは実際に送ったバイト数で % が出せる。
 * 変換側の progress は「その段階の中での進み」で、エンコード中は 0 のまま動かず、
 * PDS への保存に入ると 70 へ飛ぶ（2026-10-09 実測）。全体の % としては使えないので、
 * 段階（変換中・仕上げ中）だけを伝える。
 */
```

<!-- source: src/lib/video.ts:70 -->

### [src/lib/video.ts:70](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L70)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** getJobStatus の state を表示上の段階へ寄せる。PDS へ保存している段階だけ「仕上げ中」。 */
```

<!-- source: src/lib/video.ts:75 -->

### [src/lib/video.ts:75](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L75)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 送る前に弾けるものは、ここで弾く（MIME と大きさ）。 */
```

<!-- source: src/lib/video.ts:89 -->

### [src/lib/video.ts:89](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L89)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** <video> に読ませて長さと縦横を取る。デコードできない動画はここで落ちる。 */
```

<!-- source: src/lib/video.ts:124 -->

### [src/lib/video.ts:124](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L124)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** PDS が service auth を拒んだのが権限不足かどうか。古いセッションは再認可で直る。 */
```

<!-- source: src/lib/video.ts:172 -->

### [src/lib/video.ts:172](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L172)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/**
 * uploadVideo の応答から jobStatus を取り出す。lexicon では { jobStatus } で包まれるが、
 * 実際のサービスは平らな形で返す（2026-10-09 実測）。409（同じ動画の再送）も jobId を返す。
 */
```

<!-- source: src/lib/video.ts:197 -->

### [src/lib/video.ts:197](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L197)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** 変換が終わるまで getJobStatus を見る。完了すると PDS に置かれた blob が返る。 */
```

<!-- source: src/lib/video.ts:219 -->

### [src/lib/video.ts:219](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L219)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 一時的な通信エラーは次の問い合わせで回復する。
```

<!-- source: src/lib/video.ts:238 -->

### [src/lib/video.ts:238](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L238)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/** XHR で送る。fetch では送信の進捗が取れないため。 */
```

<!-- source: src/lib/video.ts:263 -->

### [src/lib/video.ts:263](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L263)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/**
 * 動画を video.bsky.app に送り、変換済み mp4 の blob を受け取る。
 * pdsUrl は利用者の PDS（OAuth の token info の aud）。
 */
```

<!-- source: src/lib/video.ts:304 -->

### [src/lib/video.ts:304](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L304)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 409 は同じ動画を以前にも送ったとき。サービスは変換し直さず、前回の blob を返す。
```

<!-- source: src/lib/video.ts:321 -->

### [src/lib/video.ts:321](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L321)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 前回の投稿を消していると、PDS 側の blob も消えていて、投稿の保存が BlobNotFound で
	// 失敗する（2026-10-10 実例）。投稿ボタンを押す前に、ここで理由を出して止める。
```

<!-- source: src/lib/video.ts:328 -->

### [src/lib/video.ts:328](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/video.ts#L328)

分類: 仕様・設計の根拠。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/**
 * PDS にその blob がまだあるか。getBlob は本体まで返すので、応答の見出しだけ見て切る。
 * 投稿から参照されていない一時 blob も「無い」扱いになるが、その場合も投稿は保存できない。
 */
```

## tests/e2e/video.spec.ts

<!-- source: tests/e2e/video.spec.ts:111 -->

### [tests/e2e/video.spec.ts:111](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/video.spec.ts#L111)

分類: 検証・再現条件。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 動画を付けている間も画像は足せるが、2本目の動画は選べない。
```

<!-- source: tests/e2e/video.spec.ts:141 -->

### [tests/e2e/video.spec.ts:141](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/video.spec.ts#L141)

分類: 検証・再現条件。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// mockServices より後に登録したルートが優先される。送信の応答と変換の段階をテスト側で進める。
```

<!-- source: tests/e2e/video.spec.ts:177 -->

### [tests/e2e/video.spec.ts:177](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/video.spec.ts#L177)

分類: 検証・再現条件。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 送信中にページを離れようとすると、ブラウザの離脱確認が出る。
```

<!-- source: tests/e2e/video.spec.ts:205 -->

### [tests/e2e/video.spec.ts:205](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/video.spec.ts#L205)

分類: 検証・再現条件。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 同じ動画の再送。サービスは 409 と前回の blob を返すが、PDS からは消えている。
```

<!-- source: tests/e2e/video.spec.ts:272 -->

### [tests/e2e/video.spec.ts:272](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/video.spec.ts#L272)

分類: 検証・再現条件。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// 動画が付いている間も画像は足せるが、2本目の動画は選べない。
```

<!-- source: tests/e2e/video.spec.ts:300 -->

### [tests/e2e/video.spec.ts:300](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/video.spec.ts#L300)

分類: 検証・再現条件。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
/**
 * video.bsky.app と同じ形の HLS を返す。実物は断片を video.cdn.bsky.app へ 302 するが、
 * Playwright はモックしたリダイレクトの行き先を再び横取りできないので、断片は直接返す。
 */
```

<!-- source: tests/e2e/video.spec.ts:349 -->

### [tests/e2e/video.spec.ts:349](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/video.spec.ts#L349)

分類: 検証・再現条件。対応仕様: [media-processing](../../specs/media-processing/spec.md#requirements)。

```text
// MSE（hls.js）で再生している。Chrome は canPlayType で HLS に 'maybe' を返すが、
	// 組み込み再生は本番の video.cdn.bsky.app へのリダイレクトで失敗した（2026-10-10）。
```
