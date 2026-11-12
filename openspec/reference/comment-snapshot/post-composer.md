# 投稿・編集入力・下書き：導入時コメント原文

この文書は基準コミット `24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf` に固定した履歴資料であり、現行コードの行番号一覧ではない。現在の要件は [spec.md](../../specs/post-composer/spec.md)、判断理由は [design.md](../../specs/post-composer/design.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/components/Composer.svelte

<!-- source: src/lib/components/Composer.svelte:114 -->

### [src/lib/components/Composer.svelte:114](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L114)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** ポストおたすけが書きかけを読むためだけに外へ出す。 */
```

<!-- source: src/lib/components/Composer.svelte:116 -->

### [src/lib/components/Composer.svelte:116](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L116)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** モーダルヘッダーなど、コンポーザ外の送信ボタンへ状態を渡す。 */
```

<!-- source: src/lib/components/Composer.svelte:119 -->

### [src/lib/components/Composer.svelte:119](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L119)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/*
		返信・引用の文脈はポストモーダルのもの。ブログモーダルの Composer は別インスタンスなので、
		ポストモーダル側で返信先を選んでもブログの書きかけに混ざらないよう見ない。
	*/
```

<!-- source: src/lib/components/Composer.svelte:129 -->

### [src/lib/components/Composer.svelte:129](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L129)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 動画は1本まで、画像と併用できる。添付した時点で送信と変換が始まる。
```

<!-- source: src/lib/components/Composer.svelte:134 -->

### [src/lib/components/Composer.svelte:134](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L134)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// defaultScope はこの Composer インスタンスの初期値。ユーザー操作後は追従させない。
```

<!-- source: src/lib/components/Composer.svelte:138 -->

### [src/lib/components/Composer.svelte:138](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L138)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// Nagi のスレッドURLを貼ったときだけ引き取る引用スロット。本文には URL を入れない。
```

<!-- source: src/lib/components/Composer.svelte:151 -->

### [src/lib/components/Composer.svelte:151](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L151)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * 添付した画像・動画をまとめてぼかすか。CWメニューの1項目で切り替える。
	 * レコードは従来どおり画像・動画ごとの contentWarning なので、下の $effect で全件へ揃える。
	 */
```

<!-- source: src/lib/components/Composer.svelte:160 -->

### [src/lib/components/Composer.svelte:160](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L160)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// こっそりでは画像ピッカー自体をマウントしないので、バインドが付いたり外れたりする。
```

<!-- source: src/lib/components/Composer.svelte:163 -->

### [src/lib/components/Composer.svelte:163](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L163)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * ブログ本文に差し込んだ画像の CID（添付の id ごと）。本文の URL に CID が要るが、
	 * アップロードは投稿時なので手元で計算しておき、投稿時に PDS の値と照合する。
	 */
```

<!-- source: src/lib/components/Composer.svelte:169 -->

### [src/lib/components/Composer.svelte:169](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L169)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// ブログでは、ピッカーで足した画像をキャレット位置へ `![](url)` として差し込む。
	// 外した画像は本文の行も消す（行だけ残ると、投稿時に参照先の無い画像になる）。
```

<!-- source: src/lib/components/Composer.svelte:191 -->

### [src/lib/components/Composer.svelte:191](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L191)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 計算中に外された画像は差し込まない。
```

<!-- source: src/lib/components/Composer.svelte:200 -->

### [src/lib/components/Composer.svelte:200](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L200)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 動画の変換が終わるまでは投稿させない（blob がまだ無い）。 */
```

<!-- source: src/lib/components/Composer.svelte:213 -->

### [src/lib/components/Composer.svelte:213](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L213)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * ブログでは、URL だけの行に置いたリンクカードと本文の画像を入力欄の中（行の下）に見せる。
	 * Android の素の textarea では重ねられないので、従来どおり入力欄の下の一覧に出す。
	 */
```

<!-- source: src/lib/components/Composer.svelte:244 -->

### [src/lib/components/Composer.svelte:244](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L244)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * 本文の画像行と添付の対応。入力欄の中に出した画像は下の一覧に出さず、alt も本文の
	 * `![alt](url)`（入力欄の「ALT」で直す）に合わせる。行を消した画像は投稿しない
	 * （inlineImageState 参照）。添付は残すので、元に戻すで行が戻れば画像も戻る。
	 */
```

<!-- source: src/lib/components/Composer.svelte:256 -->

### [src/lib/components/Composer.svelte:256](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L256)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 今の本文の行も数えて、行に置いた直後に一瞬だけ一覧へ出ることがないようにする。
```

<!-- source: src/lib/components/Composer.svelte:269 -->

### [src/lib/components/Composer.svelte:269](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L269)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 初めて本文に見えた画像は、添付にだけある alt を先に本文の行へ移す（消さないため）。
```

<!-- source: src/lib/components/Composer.svelte:291 -->

### [src/lib/components/Composer.svelte:291](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L291)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 入力欄の中に出しているカードは、下の一覧の有無に数えない。
```

<!-- source: src/lib/components/Composer.svelte:324 -->

### [src/lib/components/Composer.svelte:324](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L324)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// --- 外部への同時投稿 ---------------------------------------------------------
	// Bluesky クロスポストは投稿範囲ゲージの3段階目（既定は OFF）。
	// standard.site への記事公開は「どこまで届けるか」ではなく「何を書くか」なので、
	// ゲージではなく投稿モーダルの書き方タブ（ブログ）が担う。
```

<!-- source: src/lib/components/Composer.svelte:335 -->

### [src/lib/components/Composer.svelte:335](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L335)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// こっそりは画像とリンクカードを持てない。blob は参照レコードのある PDS でしか
	// 保持されず、こっそり投稿にはその参照レコードが無いので、いずれ壊れた画像になる。
	// 切り替えた時点で添付を落とす（そのまま投稿できてしまうと黙って消える）。
```

<!-- source: src/lib/components/Composer.svelte:344 -->

### [src/lib/components/Composer.svelte:344](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L344)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// ブログは standard.site の document になり、動画を載せる場所が無い。
```

<!-- source: src/lib/components/Composer.svelte:349 -->

### [src/lib/components/Composer.svelte:349](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L349)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 後から足した画像・動画にも同じ設定を効かせる。添付が無くなったら設定も戻す。
```

<!-- source: src/lib/components/Composer.svelte:366 -->

### [src/lib/components/Composer.svelte:366](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L366)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * CW が Bluesky への投稿を止めるか。画像のぼかしは、Bluesky でもぼかされるラベルが
	 * 付いていれば通す（判定は crosspost/content-warning.ts の1か所）。
	 */
```

<!-- source: src/lib/components/Composer.svelte:378 -->

### [src/lib/components/Composer.svelte:378](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L378)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * 返信・引用の相手。Bluesky にも続けられるのは、自分のクロスポスト済みの投稿1件だけ
	 * （他人のクロスポストへは続けない）。Bluesky 側では、そのコピーへの返信・引用として出す。
	 * 返信と引用を同時にするときは、両方を Bluesky で揃えられないので外へは出さない。
	 */
```

<!-- source: src/lib/components/Composer.svelte:391 -->

### [src/lib/components/Composer.svelte:391](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L391)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** コピーがまだ Bluesky にあるか。消えていたら同時投稿を止める（孤立した返信を作らない）。 */
```

<!-- source: src/lib/components/Composer.svelte:394 -->

### [src/lib/components/Composer.svelte:394](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L394)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 同じ返信先でも、モーダルを開き直したらコピーを確かめ直す。
```

<!-- source: src/lib/components/Composer.svelte:409 -->

### [src/lib/components/Composer.svelte:409](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L409)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * Bluesky にも出せる条件。
	 *
	 * 返信・引用は、自分のクロスポスト済みの投稿に続けるときだけ外へ出せる。それ以外は
	 * Bluesky 側に返信先・引用先が無く、参照が黙って消える。
	 * 記事化は引用・返信では別に止める（articleBlockedReason）。CW 付きの記事も同じ。
	 */
```

<!-- source: src/lib/components/Composer.svelte:442 -->

### [src/lib/components/Composer.svelte:442](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L442)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * 本文先頭の「# 見出し」はタイトルそのもの。タイトルの真実源は常に本文側に置き、
	 * 入力欄は「まだ本文に見出しが無いときの書き口」として使う。
	 * すでに見出しがある本文では、その文字列を読み取り専用で映すだけにする
	 * （2箇所で別々に編集できると、どちらが記事のタイトルか決まらなくなる）。
	 */
```

<!-- source: src/lib/components/Composer.svelte:450 -->

### [src/lib/components/Composer.svelte:450](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L450)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 送信時に本文の先頭へ差し込む見出し行。本文が既に見出しで始まるなら不要。 */
```

<!-- source: src/lib/components/Composer.svelte:454 -->

### [src/lib/components/Composer.svelte:454](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L454)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** ブログとして出す準備が整っているか。権限が無い間は投稿させない。 */
```

<!-- source: src/lib/components/Composer.svelte:456 -->

### [src/lib/components/Composer.svelte:456](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L456)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * ブログにできない投稿をブログタブのまま出そうとしている理由。
	 *
	 * document は公開レコードとして外から読まれるので、Nagi の共有TLに出さない投稿
	 * （こっそり）、外部コピーを作らない投稿（CW）、本文に現れない参照を
	 * 持つ投稿（引用）は記事にできない（standardsite/preferences.ts の
	 * isArticleCandidate と同じ線引き）。
	 *
	 * 以前はこれらを黙って「記事にしない」で済ませていたが、ブログタブを選んだままでも
	 * 投稿が通ってしまい、記事が作られないことがユーザーから見えなかった。理由を出して
	 * 送信を止める。
	 */
```

<!-- source: src/lib/components/Composer.svelte:479 -->

### [src/lib/components/Composer.svelte:479](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L479)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** ブログとして standard.site に出す投稿か。記事フラグと公開の判定はこれ1本。 */
```

<!-- source: src/lib/components/Composer.svelte:481 -->

### [src/lib/components/Composer.svelte:481](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L481)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 通常投稿の上限判定と、ブログの現在文字数表示に使う。
```

<!-- source: src/lib/components/Composer.svelte:486 -->

### [src/lib/components/Composer.svelte:486](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L486)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * こっそりスレッドへの返信か。
	 *
	 * こっそりは「共有TLに出すか」ではなく「PDS と AppView のどちらに保存するか」を
	 * 決める設定なので、スレッドの途中で切り替えられない。ここで固定しないと、
	 * こっそりスレッドへの返信だけが PDS の公開レコードとして書き出されてしまう。
	 *
	 * 判定はスレッドルートの URI（AppView 発行なら必ずこっそり）。移行前のこっそり投稿は
	 * URI から分からないので、直接の返信のときに post.kossori で補う。
	 */
```

<!-- source: src/lib/components/Composer.svelte:504 -->

### [src/lib/components/Composer.svelte:504](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L504)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * こっそりではないスレッドへの返信か。AppView はこっそりスレッドの外にこっそり投稿を
	 * 置かせない（createKossoriPost が 400 "Reply root is not a kossori post" を返す）。
	 *
	 * 前回値や画面既定でこっそりが選ばれたまま公開投稿へ返信すると、送信してから
	 * 「通信状態を確認」と出て失敗していた。返信先が付いた時点でまだ何も書いていなければ
	 * フィードへ切り替え、書きかけなら黙って公開範囲を広げず送信を止めて理由を出す。
	 */
```

<!-- source: src/lib/components/Composer.svelte:523 -->

### [src/lib/components/Composer.svelte:523](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L523)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// ブログは公開レコードとして外から読まれるので、こっそりにはできない
	// （standardsite/preferences.ts の isArticleCandidate と同じ線引き）。
```

<!-- source: src/lib/components/Composer.svelte:528 -->

### [src/lib/components/Composer.svelte:528](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L528)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 外部に出せない状態に変わったら黙って1段階狭める（意図せぬ公開を作らない）。
	// OAuth scope の再確認中は前回値を保持し、利用不能だと確定してからだけ狭める。
```

<!-- source: src/lib/components/Composer.svelte:531 -->

### [src/lib/components/Composer.svelte:531](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L531)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 返信先のコピーを確かめている間は、前回の「Blueskyにも」を保ったまま待つ。
```

<!-- source: src/lib/components/Composer.svelte:611 -->

### [src/lib/components/Composer.svelte:611](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L611)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 画像Blobは現在のAppView下書き形式に含めない。本文などの保存は継続する。
```

<!-- source: src/lib/components/Composer.svelte:697 -->

### [src/lib/components/Composer.svelte:697](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L697)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// previewUrl は保存していないので、blob から作り直す。解放は
		// ImageAttachmentEditor / LinkCardEditor の既存ライフサイクルに任せる。
```

<!-- source: src/lib/components/Composer.svelte:706 -->

### [src/lib/components/Composer.svelte:706](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L706)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 画像ごとにCWを選べた頃の下書きは、1枚でも付いていれば全件をぼかす側へ寄せる。
```

<!-- source: src/lib/components/Composer.svelte:740 -->

### [src/lib/components/Composer.svelte:740](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L740)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// ラジオの引用先は投稿するこの時点で作る（キャンセルしたら何も残らない）。
		// 同じ回は rkey が同じなので、何度ポストしてもレコードは1つ。
```

<!-- source: src/lib/components/Composer.svelte:760 -->

### [src/lib/components/Composer.svelte:760](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L760)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 投稿本文はここで確定するので、クリア前にタイトルを解決しておく。
```

<!-- source: src/lib/components/Composer.svelte:762 -->

### [src/lib/components/Composer.svelte:762](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L762)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// ブログのタイトルは本文の先頭見出しとして保存する。こうしておくと Nagi の
		// タイムラインでも記事のタイトルが見出しとして読めるし、編集で本文を直せば
		// 記事側のタイトルも extractTitle でそのまま追従する。
		// 下書きから戻した本文などで、添付の無い Nagi の画像行が残っていたら落とす
		// （書き出すと、他のリーダーでは存在しない blob を指す壊れた画像になる）。
		// 記事の本文から行を消した画像は投稿しない。
```

<!-- source: src/lib/components/Composer.svelte:775 -->

### [src/lib/components/Composer.svelte:775](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L775)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// メンション・チャンネル・絵文字の選択は text 上の文字オフセットなので、
		// 先頭へ見出しを差し込んだぶんだけずらしてから facet 化させる。
```

<!-- source: src/lib/components/Composer.svelte:805 -->

### [src/lib/components/Composer.svelte:805](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L805)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// preparePostDraft の引数はすでに多いので、記事フラグは組み立て後に足す。
```

<!-- source: src/lib/components/Composer.svelte:815 -->

### [src/lib/components/Composer.svelte:815](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L815)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 表示中のフィードに楽観カードが出たらそこへ、確定したらその投稿へ画面を寄せる。
		// 出せないフィード（検索タブなど）や投稿できない画面では導線へ切り替わる。
```

<!-- source: src/lib/components/Composer.svelte:827 -->

### [src/lib/components/Composer.svelte:827](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L827)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 本文に書いた URL の CID が、PDS の付けた CID と一致するか確かめる。
			// 食い違うと本文の画像が存在しない blob を指すので、公開前に止める。
```

<!-- source: src/lib/components/Composer.svelte:836 -->

### [src/lib/components/Composer.svelte:836](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L836)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// coverImage は lexicon で 1MB 未満。ヘッダーは圧縮済みだが、本文の画像が先頭の
			// ときは超えうるので、そのときはカバーを付けない（記事自体は出す）。
```

<!-- source: src/lib/components/Composer.svelte:840 -->

### [src/lib/components/Composer.svelte:840](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L840)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/*
			 * 記事以外のクロスポストは、Nagi の投稿より先に Bluesky へ出して、そのコピーへの参照を
			 * 作成時のレコードに入れる（後から書き足すと AppView が「編集」と見なすため）。
			 * Bluesky 側が失敗しても Nagi の投稿は出す（警告にとどめる）。Nagi の投稿が作れなかったら、
			 * 先に出したコピーは消して巻き戻す。
			 */
```

<!-- source: src/lib/components/Composer.svelte:882 -->

### [src/lib/components/Composer.svelte:882](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L882)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// タグパレットの「最近使った」。投稿に成功したタグだけを積む。
```

<!-- source: src/lib/components/Composer.svelte:885 -->

### [src/lib/components/Composer.svelte:885](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L885)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// こっそりは AppView が正本なので、PDS から取り直させる ensureRecord は呼ばない。
```

<!-- source: src/lib/components/Composer.svelte:888 -->

### [src/lib/components/Composer.svelte:888](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L888)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 記事の canonical URL。standard.site の document.path と同じ組み立て方。
```

<!-- source: src/lib/components/Composer.svelte:890 -->

### [src/lib/components/Composer.svelte:890](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L890)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 記事の Bluesky ティーザーは、Nagi の URL を載せるので投稿の後に出す。
			// 失敗しても記事は成立しているので、エラーではなく警告として伝える。
```

<!-- source: src/lib/components/Composer.svelte:898 -->

### [src/lib/components/Composer.svelte:898](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L898)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 記事はリンク付きの投稿通知とリンクカードを1件出す。
						// document と publication の強参照を添えると、Bluesky が記事カードで出す。
						// 取れなければ通常のリンクカードで出す（ティーザー自体は止めない）。
```

<!-- source: src/lib/components/Composer.svelte:921 -->

### [src/lib/components/Composer.svelte:921](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L921)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 返信の範囲はスレッドで決まる（こっそりスレッドは固定、公開スレッドはこっそり不可）ので、
			// 次の新規投稿の既定として残さない。
```

<!-- source: src/lib/components/Composer.svelte:924 -->

### [src/lib/components/Composer.svelte:924](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L924)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 投稿開始前から進行中だった自動保存を待ち、その保存分も確実に片付ける。
```

<!-- source: src/lib/components/Composer.svelte:951 -->

### [src/lib/components/Composer.svelte:951](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L951)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 記事の書き込み権限が無いときに、その場で追加の認可を取りに行く。 */
```

<!-- source: src/lib/components/Composer.svelte:952 -->

### [src/lib/components/Composer.svelte:952](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L952)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/*
		botたんラジオの引用は、投稿するときに本人の repo へ公開レコードを書く。その権限は
		ラジオの引用で初めて要るので、無い人には投稿前に再認可を案内する（既存機能には影響しない）。
	*/
```

<!-- source: src/lib/components/Composer.svelte:985 -->

### [src/lib/components/Composer.svelte:985](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L985)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!--
	モーダル専用なので、以前タイムラインとの一体感のために付けていた吹き出し
	（.post-row.mine / .bubble のアクセント枠としっぽ）とアバターは持たない。
-->
```

<!-- source: src/lib/components/Composer.svelte:991 -->

### [src/lib/components/Composer.svelte:991](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L991)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- こっそりは画像を持てない。セルフラベルも統合CWメニュー側で無効にする。 -->
```

<!-- source: src/lib/components/Composer.svelte:993 -->

### [src/lib/components/Composer.svelte:993](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L993)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- 画像ボタンから動画も選べる。ブログには動画を載せる場所が無いので画像だけ。 -->
```

<!-- source: src/lib/components/Composer.svelte:994 -->

### [src/lib/components/Composer.svelte:994](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L994)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- ブログは standard.site の document に枚数の上限が無いので、Nagi でも絞らない。 -->
```

<!-- source: src/lib/components/Composer.svelte:1098 -->

### [src/lib/components/Composer.svelte:1098](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L1098)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- 送信ボタンが押せない理由になるので、引用先のすぐ下に出す（引用欄は高さを絞っているので外に置く）。 -->
```

<!-- source: src/lib/components/Composer.svelte:1116 -->

### [src/lib/components/Composer.svelte:1116](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L1116)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- タイトルは送信時に本文先頭の「# 見出し」になる（submit の articleHeading）。 -->
```

<!-- source: src/lib/components/Composer.svelte:1130 -->

### [src/lib/components/Composer.svelte:1130](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L1130)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- 何か書き始めるまでは急かさない。空のまま投稿しようとした時点で理由を出す。 -->
```

<!-- source: src/lib/components/Composer.svelte:1135 -->

### [src/lib/components/Composer.svelte:1135](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L1135)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!--
						記事メタ欄の中に置くと、狭い画面では畳まれていて見えない。
						送信ボタンが押せない理由になるので、本文の隣に常に出す。
					-->
```

<!-- source: src/lib/components/Composer.svelte:1172 -->

### [src/lib/components/Composer.svelte:1172](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L1172)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// Nagi のスレッドURL単体なら引用として引き取る（そのとき本文へは入らない）。
					// それ以外は素通しするので、画像ペーストは従来どおり動く。
					// ブログは引用を持てない（記事にできなくなる）ので、URLのまま本文へ入れて
					// 通常のリンクカードとして扱わせる。
```

<!-- source: src/lib/components/Composer.svelte:1181 -->

### [src/lib/components/Composer.svelte:1181](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L1181)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- URL取得や Object URL の管理を途切れさせないため、空の間も子はマウントしておく。 -->
```

<!-- source: src/lib/components/Composer.svelte:1182 -->

### [src/lib/components/Composer.svelte:1182](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L1182)

分類: ツール指示（削除対象外）。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- svelte-ignore a11y_no_noninteractive_tabindex (スクロール領域をキーボードでも操作可能にする) -->
```

<!-- source: src/lib/components/Composer.svelte:1300 -->

### [src/lib/components/Composer.svelte:1300](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L1300)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- Bluesky には画像と動画を混ぜる embed が無いので、動画だけを送る（crosspost/bluesky.ts の buildEmbed）。 -->
```

<!-- source: src/lib/components/Composer.svelte:1345 -->

### [src/lib/components/Composer.svelte:1345](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Composer.svelte#L1345)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- 背景クリックは取り消し扱い。他の確認ダイアログと同じ。 -->
```

## src/lib/components/ComposerArticleMeta.svelte

<!-- source: src/lib/components/ComposerArticleMeta.svelte:14 -->

### [src/lib/components/ComposerArticleMeta.svelte:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerArticleMeta.svelte#L14)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * ブログモードの記事メタ欄。
	 *
	 * ヘッダー画像は独立した state を持たず、header の印を付けた添付画像を先頭に置く。
	 * standard.site の coverImage が「1枚目の画像」なので、ここで別枠に持つと
	 * 投稿本文の添付と二重管理になり、順番を入れ替えたときに食い違う。
	 * 本文に差し込んだ画像（印なし）が先頭にあっても、それはヘッダーとして扱わない。
	 * ただし記事のカバーは lexicon で 1MB 未満と決まっているため、
	 * 通常の添付（2MB）より強い上限で圧縮し直して先頭へ入れる。
	 */
```

<!-- source: src/lib/components/ComposerArticleMeta.svelte:34 -->

### [src/lib/components/ComposerArticleMeta.svelte:34](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerArticleMeta.svelte#L34)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** lexicon の site.standard.document#tags は 1 件 128 graphemes まで。 */
```

<!-- source: src/lib/components/ComposerArticleMeta.svelte:43 -->

### [src/lib/components/ComposerArticleMeta.svelte:43](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerArticleMeta.svelte#L43)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * 狭い画面では本文が潰れないよう畳み、広い画面では常に開いた1枚のパネルにする。
	 * CSS で開かせることはできない（閉じた details は子の display を上書きしても開かない）
	 * ので、幅の判定はここで持って open を動かす。
	 */
```

<!-- source: src/lib/components/ComposerArticleMeta.svelte:57 -->

### [src/lib/components/ComposerArticleMeta.svelte:57](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerArticleMeta.svelte#L57)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 先頭がヘッダーの印を持つときだけヘッダーとして扱う。本文に差し込んだ画像が
	// 先頭に来ても、それはヘッダーではない。
```

<!-- source: src/lib/components/ComposerArticleMeta.svelte:83 -->

### [src/lib/components/ComposerArticleMeta.svelte:83](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerArticleMeta.svelte#L83)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 差し替えで画面から外れた画像の Object URL は、ここで解放しておく。
```

<!-- source: src/lib/components/ComposerArticleMeta.svelte:232 -->

### [src/lib/components/ComposerArticleMeta.svelte:232](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerArticleMeta.svelte#L232)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 変換確定の Enter でタグを作らない（日本語入力で誤爆するため）。
```

<!-- source: src/lib/components/ComposerArticleMeta.svelte:293 -->

### [src/lib/components/ComposerArticleMeta.svelte:293](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerArticleMeta.svelte#L293)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* モバイルで本文を押し潰さないよう、比率と dvh の小さい方で頭打ちにする。 */
```

<!-- source: src/lib/components/ComposerArticleMeta.svelte:364 -->

### [src/lib/components/ComposerArticleMeta.svelte:364](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerArticleMeta.svelte#L364)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* 長いタグでモーダルに横スクロールを作らない。 */
```

<!-- source: src/lib/components/ComposerArticleMeta.svelte:379 -->

### [src/lib/components/ComposerArticleMeta.svelte:379](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerArticleMeta.svelte#L379)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* iOS が入力時に自動ズームしない下限。 */
```

## src/lib/components/ComposerAssistant.svelte

<!-- source: src/lib/components/ComposerAssistant.svelte:8 -->

### [src/lib/components/ComposerAssistant.svelte:8](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L8)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * ポストおたすけ。書き進めているときは具体的な良さを肯定し、未入力・削除時は本人の日記・
	 * 過去の投稿を材料に LLM でひとこと声をかける（生成は AppView の generatePostAssist）。
	 * ×で閉じたらモーダルを閉じるまで出さない。
	 *
	 * ポストモーダルの backdrop は外側クリックで閉じるので、吹き出しは body 直下へ portal し、
	 * 吹き出し以外はクリックを素通しする。reservedHeight はモーダル側で下端の余白に使う。
	 */
```

<!-- source: src/lib/components/ComposerAssistant.svelte:30 -->

### [src/lib/components/ComposerAssistant.svelte:30](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L30)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * 手が止まってから声をかけるまで。書き出しに迷っている未入力は早めに、
	 * 文の途中で考えている入力途中は遮らないよう少し待つ。
	 */
```

<!-- source: src/lib/components/ComposerAssistant.svelte:36 -->

### [src/lib/components/ComposerAssistant.svelte:36](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 生成が速すぎても「…」が一瞬だけ点滅しないよう、最低限見せる時間。 */
```

<!-- source: src/lib/components/ComposerAssistant.svelte:38 -->

### [src/lib/components/ComposerAssistant.svelte:38](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L38)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 生成できなかったとき、吹き出しを消すまでのフェード時間（CSS と揃える）。 */
```

<!-- source: src/lib/components/ComposerAssistant.svelte:40 -->

### [src/lib/components/ComposerAssistant.svelte:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L40)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** なでたリアクションを見せてから、待機姿へ戻るまで。 */
```

<!-- source: src/lib/components/ComposerAssistant.svelte:42 -->

### [src/lib/components/ComposerAssistant.svelte:42](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L42)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 繰り返さないよう AppView へ渡す、直近に言ったことの件数（lexicon の上限）。 */
```

<!-- source: src/lib/components/ComposerAssistant.svelte:60 -->

### [src/lib/components/ComposerAssistant.svelte:60](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L60)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// IME の変換中（スマホでは予測変換の候補を選んでいる間も含む）は新しい生成だけを
	// 止める。すでに出ている bot たんまで隠すと、入力するたびに表示が跳ねてしまう。
```

<!-- source: src/lib/components/ComposerAssistant.svelte:64 -->

### [src/lib/components/ComposerAssistant.svelte:64](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L64)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 閉じたら×も含めて忘れ、次に開いたときにまた手伝えるようにする。
```

<!-- source: src/lib/components/ComposerAssistant.svelte:79 -->

### [src/lib/components/ComposerAssistant.svelte:79](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L79)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 画面幅ではなく入力機器で判定し、マウスで操作するPCにだけなでる操作を出す。
```

<!-- source: src/lib/components/ComposerAssistant.svelte:88 -->

### [src/lib/components/ComposerAssistant.svelte:88](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L88)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 初回クリック時にもすぐ切り替わるよう、表示中のPCでリアクション画像を先読みする。
```

<!-- source: src/lib/components/ComposerAssistant.svelte:106 -->

### [src/lib/components/ComposerAssistant.svelte:106](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L106)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 書き進めた・閉じた・×を押したら、待っている古い書きかけへの問い合わせは捨てる。
```

<!-- source: src/lib/components/ComposerAssistant.svelte:121 -->

### [src/lib/components/ComposerAssistant.svelte:121](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L121)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 次の書きかけへの生成待機中も、考え中の吹き出しは出したままにする。
```

<!-- source: src/lib/components/ComposerAssistant.svelte:132 -->

### [src/lib/components/ComposerAssistant.svelte:132](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L132)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 失敗しても同じ書きかけでは聞き直さない。書き進めればまた声をかける。
```

<!-- source: src/lib/components/ComposerAssistant.svelte:151 -->

### [src/lib/components/ComposerAssistant.svelte:151](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L151)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 生成できないとき（混雑・権限の反映待ちなど）は、書く邪魔をしないよう黙って消える。
```

<!-- source: src/lib/components/ComposerAssistant.svelte:170 -->

### [src/lib/components/ComposerAssistant.svelte:170](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L170)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// ソフトウェアキーボードが出ている間は、その上端へ寄せる。
```

<!-- source: src/lib/components/ComposerAssistant.svelte:224 -->

### [src/lib/components/ComposerAssistant.svelte:224](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L224)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- 押しても本文の入力欄からフォーカスを奪わない（モバイルでキーボードが閉じないように）。 -->
```

<!-- source: src/lib/components/ComposerAssistant.svelte:235 -->

### [src/lib/components/ComposerAssistant.svelte:235](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L235)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- 先に吹き出しを出し、生成を待つ間は「…」で考え中を見せる。 -->
```

<!-- source: src/lib/components/ComposerAssistant.svelte:311 -->

### [src/lib/components/ComposerAssistant.svelte:311](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L311)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* キャラクター側へ向けたしっぽ */
```

<!-- source: src/lib/components/ComposerAssistant.svelte:337 -->

### [src/lib/components/ComposerAssistant.svelte:337](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L337)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* 考え中とセリフで高さが跳ねないよう、2行分を確保して縦中央に置く。 */
```

<!-- source: src/lib/components/ComposerAssistant.svelte:364 -->

### [src/lib/components/ComposerAssistant.svelte:364](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerAssistant.svelte#L364)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* 1つ目の子はスクリーンリーダー用の文言なので、点は2〜4番目。 */
```

## src/lib/components/ComposerEditor.svelte

<!-- source: src/lib/components/ComposerEditor.svelte:52 -->

### [src/lib/components/ComposerEditor.svelte:52](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerEditor.svelte#L52)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** CWメニューに「画像・動画をぼかす」を出すか。画像ごとのCWボタンは持たない。 */
```

<!-- source: src/lib/components/ComposerEditor.svelte:56 -->

### [src/lib/components/ComposerEditor.svelte:56](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerEditor.svelte#L56)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
		 * 入力欄はどのモードでも記法をその場で装飾して見せる（プレビュー欄は持たない）。
		 * simple（あっさり）は文字装飾のボタンだけを畳み、本文・画像・CW に絞る。
		 * rich（しっかり）と blog（ブログ）は文字装飾のボタンも出す。
		 */
```

<!-- source: src/lib/components/ComposerEditor.svelte:67 -->

### [src/lib/components/ComposerEditor.svelte:67](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerEditor.svelte#L67)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 記事本文で、URL 行・画像行の下に重ねて見せるリンクカードと画像。 */
```

<!-- source: src/lib/components/ComposerEditor.svelte:80 -->

### [src/lib/components/ComposerEditor.svelte:80](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerEditor.svelte#L80)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 記事本文の画像のように、独立した1行として差し込む。 */
```

<!-- source: src/lib/components/ComposerEditor.svelte:91 -->

### [src/lib/components/ComposerEditor.svelte:91](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerEditor.svelte#L91)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** ラベルか画像のぼかしを選べるときはメニューを開く。本文だけなら選択範囲へ直接掛ける。 */
```

## src/lib/components/ComposerInput.svelte

<!-- source: src/lib/components/ComposerInput.svelte:65 -->

### [src/lib/components/ComposerInput.svelte:65](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L65)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 記事本文で、URL 行・画像行の下に重ねて見せるリンクカードと画像。 */
```

<!-- source: src/lib/components/ComposerInput.svelte:69 -->

### [src/lib/components/ComposerInput.svelte:69](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L69)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * Android では素の textarea で入力させる。Galaxy（Samsung キーボード）では CodeMirror
	 * （contenteditable）にキーボードが出ない・入力するとタブごと落ちることがあり、
	 * codemirror.net 本体でも再現する。機種は UA から判別できないので Android 全体を対象にする。
	 * 記法のその場装飾はなくなるが、候補・装飾ボタン・CW などの操作は同じ関数を通す。
	 */
```

<!-- source: src/lib/components/ComposerInput.svelte:80 -->

### [src/lib/components/ComposerInput.svelte:80](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L80)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 選択範囲をこのコンポーネントが自分で付け替える変更。差分からの付け替えを二重にしない。 */
```

<!-- source: src/lib/components/ComposerInput.svelte:85 -->

### [src/lib/components/ComposerInput.svelte:85](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L85)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// Composer は最初の1文字を即時検索し、連続入力だけ短くまとめる。
```

<!-- source: src/lib/components/ComposerInput.svelte:98 -->

### [src/lib/components/ComposerInput.svelte:98](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L98)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 名前と意味で探し、カスタム絵文字の後ろに Unicode 絵文字を続ける。
	// 意味で当たった候補は名前に検索語を含まないので、応答待ちの絞り込み（matches）は使わない
	// （使うと打鍵のたびに候補が消える）。前回の候補を出したまま応答を待つ。
```

<!-- source: src/lib/components/ComposerInput.svelte:130 -->

### [src/lib/components/ComposerInput.svelte:130](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L130)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// いま候補を出している方（トークンの種類で決まる）。件数・確定はこれ経由で扱う。
```

<!-- source: src/lib/components/ComposerInput.svelte:141 -->

### [src/lib/components/ComposerInput.svelte:141](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L141)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * 本文を next に置き換え、選択範囲を [anchor, head] にする。変わった区間だけを差し替えるので、
	 * 取り消し（Undo）の単位とキャレット位置が自然に保たれる。
	 */
```

<!-- source: src/lib/components/ComposerInput.svelte:148 -->

### [src/lib/components/ComposerInput.svelte:148](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L148)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 選択位置を付け直すため、描画の反映を待たずに中身を差し替える。
```

<!-- source: src/lib/components/ComposerInput.svelte:187 -->

### [src/lib/components/ComposerInput.svelte:187](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L187)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 利用者の入力を、呼び出し側が見ている InputEvent の形へ直す（下書きアシストの判定用）。 */
```

<!-- source: src/lib/components/ComposerInput.svelte:211 -->

### [src/lib/components/ComposerInput.svelte:211](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L211)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// CodeMirror は更新のたびに外枠の class を組み直すので、属性として渡す
```

<!-- source: src/lib/components/ComposerInput.svelte:225 -->

### [src/lib/components/ComposerInput.svelte:225](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L225)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// Ctrl/Cmd+Enter は投稿送信。候補の Enter 確定より後に判定する。
```

<!-- source: src/lib/components/ComposerInput.svelte:242 -->

### [src/lib/components/ComposerInput.svelte:242](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L242)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 引用や画像として引き取られた貼り付けは本文へ入れない
```

<!-- source: src/lib/components/ComposerInput.svelte:262 -->

### [src/lib/components/ComposerInput.svelte:262](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L262)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 候補の確定や装飾ボタンによる変更では、候補を開き直さない
```

<!-- source: src/lib/components/ComposerInput.svelte:281 -->

### [src/lib/components/ComposerInput.svelte:281](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L281)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 投稿の本文と同じく、日本語の文節で折り返す（word-break: auto-phrase）
```

<!-- source: src/lib/components/ComposerInput.svelte:286 -->

### [src/lib/components/ComposerInput.svelte:286](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L286)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 外から本文が差し替わったとき（投稿後のクリア、下書きの読み込みなど）に取り込む。
```

<!-- source: src/lib/components/ComposerInput.svelte:293 -->

### [src/lib/components/ComposerInput.svelte:293](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L293)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 呼び出し側は中身が変わるたびに新しいオブジェクトを渡す（$derived で組み立てる）。
```

<!-- source: src/lib/components/ComposerInput.svelte:298 -->

### [src/lib/components/ComposerInput.svelte:298](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L298)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// メンション等の選択範囲が変わったら、リンク色の装飾を付け直す。
```

<!-- source: src/lib/components/ComposerInput.svelte:328 -->

### [src/lib/components/ComposerInput.svelte:328](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L328)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** キャレットの画面座標。レイアウト前などで測れないときは入力欄の左上を使う。 */
```

<!-- source: src/lib/components/ComposerInput.svelte:552 -->

### [src/lib/components/ComposerInput.svelte:552](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L552)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * キャレット位置（選択中なら選択範囲を置き換えて）に文字列を差し込む。
	 * 絵文字挿入のように「装飾ではないただの挿入」のための入口で、
	 * メンション/チャンネルの選択範囲の付け替えは insertText がまとめて面倒を見る。
	 */
```

<!-- source: src/lib/components/ComposerInput.svelte:561 -->

### [src/lib/components/ComposerInput.svelte:561](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L561)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 選択範囲があるときは insertText では消せないので、先に本文から取り除く。
```

<!-- source: src/lib/components/ComposerInput.svelte:582 -->

### [src/lib/components/ComposerInput.svelte:582](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L582)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * キャレット位置に1行のブロック（記事本文の画像など）を差し込む。前後の文と
	 * 同じ行にならないよう、必要なら改行を足す。
	 */
```

<!-- source: src/lib/components/ComposerInput.svelte:595 -->

### [src/lib/components/ComposerInput.svelte:595](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L595)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** Unicode は文字として、Bluemoji は :name: と追跡可能な参照範囲として挿入する。 */
```

<!-- source: src/lib/components/ComposerInput.svelte:608 -->

### [src/lib/components/ComposerInput.svelte:608](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L608)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * `#tag ` を差し込む。タグ facet は直前が空白か行頭のときだけ付くので、
	 * 文字に続いていれば空白を補う。後ろに空白が無ければ1つ足して続けて打てるようにする。
	 */
```

<!-- source: src/lib/components/ComposerInput.svelte:674 -->

### [src/lib/components/ComposerInput.svelte:674](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L674)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// タグはテキストだけで facet になるので、選択範囲は持たず置き換えるだけ。
```

<!-- source: src/lib/components/ComposerInput.svelte:695 -->

### [src/lib/components/ComposerInput.svelte:695](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L695)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// Unicode 絵文字は文字そのものなので、参照範囲として追跡しない。
```

<!-- source: src/lib/components/ComposerInput.svelte:714 -->

### [src/lib/components/ComposerInput.svelte:714](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L714)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 候補が出ている間だけ、矢印・Enter・Tab・Esc を候補の操作に使う。
	// 変換中（IME）のキー入力は CodeMirror がここへ渡さない。
```

<!-- source: src/lib/components/ComposerInput.svelte:718 -->

### [src/lib/components/ComposerInput.svelte:718](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L718)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 応答待ちの絞り込みで候補が減ると activeIndex が末尾を追い越すことがある。
```

<!-- source: src/lib/components/ComposerInput.svelte:740 -->

### [src/lib/components/ComposerInput.svelte:740](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L740)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 箇条書きの行末で Enter を押すと次の項目を始め、空の項目で押すと箇条書きを終える。 */
```

<!-- source: src/lib/components/ComposerInput.svelte:763 -->

### [src/lib/components/ComposerInput.svelte:763](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L763)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** textarea のときのキー操作。CodeMirror の keymap と同じ関数へ振り分ける。 */
```

<!-- source: src/lib/components/ComposerInput.svelte:765 -->

### [src/lib/components/ComposerInput.svelte:765](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L765)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 変換中（IME）のキー入力は候補の操作にも送信にも使わない。
```

<!-- source: src/lib/components/ComposerInput.svelte:817 -->

### [src/lib/components/ComposerInput.svelte:817](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerInput.svelte#L817)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!--
		タグは新しく作ることも多いので、既存タグが見つかったときだけ出す。
		「該当なし」やスケルトンを毎回挟むと、打っている途中がうるさい。
	-->
```

## src/lib/components/ComposerQuoteEditor.svelte

<!-- source: src/lib/components/ComposerQuoteEditor.svelte:40 -->

### [src/lib/components/ComposerQuoteEditor.svelte:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ComposerQuoteEditor.svelte#L40)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* 引用カードは本文と同じ見え方のまま、右上に外すボタンだけを重ねる。 */
```

## src/lib/components/ContentWarningPicker.svelte

<!-- source: src/lib/components/ContentWarningPicker.svelte:23 -->

### [src/lib/components/ContentWarningPicker.svelte:23](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ContentWarningPicker.svelte#L23)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 投稿全体のラベルを選ばせるか。こっそり・編集では出さない。 */
```

<!-- source: src/lib/components/ContentWarningPicker.svelte:25 -->

### [src/lib/components/ContentWarningPicker.svelte:25](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ContentWarningPicker.svelte#L25)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 添付した画像・動画をすべてぼかすか。1枚ずつではなく投稿単位で決める。 */
```

<!-- source: src/lib/components/ContentWarningPicker.svelte:56 -->

### [src/lib/components/ContentWarningPicker.svelte:56](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ContentWarningPicker.svelte#L56)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * ラベルとは独立して切り替える。ぼかしは Nagi の中で必ず伏せる（閲覧者の設定で外れない）、
	 * ラベルは Bluesky にも伝わる、と役割が違うので、両方選べば両方効く。
	 */
```

## src/lib/components/GuestPostModal.svelte

<!-- source: src/lib/components/GuestPostModal.svelte:37 -->

### [src/lib/components/GuestPostModal.svelte:37](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/GuestPostModal.svelte#L37)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// ゲストは PDS に書けないのでブログと3行日記のタブを出さない。
		// サインイン中にそれらを選んだ端末でも、どのタブも選ばれていない状態にしない。
```

<!-- source: src/lib/components/GuestPostModal.svelte:56 -->

### [src/lib/components/GuestPostModal.svelte:56](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/GuestPostModal.svelte#L56)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 同意状態を保存できなくても、この送信についての明示同意は成立している。
```

## src/lib/components/InlinePostComposer.svelte

<!-- source: src/lib/components/InlinePostComposer.svelte:44 -->

### [src/lib/components/InlinePostComposer.svelte:44](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/InlinePostComposer.svelte#L44)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 渡したときだけ、Nagi のスレッドURL貼り付けで引用を付けられる。 */
```

## src/lib/components/PostFab.svelte

<!-- source: src/lib/components/PostFab.svelte:5 -->

### [src/lib/components/PostFab.svelte:5](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostFab.svelte#L5)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * スマホ専用の投稿ボタン。この幅では左サイドバーごと消えるので、
	 * 親指の届く右下に浮かせる。PC・タブレットはサイドバー内の PostButton が担当する
	 * （浮かせたままだとサイドバーの幅・余白を推測することになり、揃わない）。
	 * カードFAB はこの幅でだけ左へ逃がしてあるので重ならない。
	 */
```

<!-- source: src/lib/components/PostFab.svelte:26 -->

### [src/lib/components/PostFab.svelte:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostFab.svelte#L26)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* サイドバーが出ている幅では、列の中の PostButton に任せる。 */
```

<!-- source: src/lib/components/PostFab.svelte:33 -->

### [src/lib/components/PostFab.svelte:33](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostFab.svelte#L33)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* .mobile-nav(20)・.feed-tabs(15) より上、絵文字ピッカー(29/30)・一時通知(40)・
			   各種モーダル(100〜120) より下。カードFAB と同じ層。 */
```

<!-- source: src/lib/components/PostFab.svelte:38 -->

### [src/lib/components/PostFab.svelte:38](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostFab.svelte#L38)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* .mobile-nav（fixed, 68px + safe-area）を避ける。基準値はカードFABと揃える。 */
```

## src/lib/components/PostModal.svelte

<!-- source: src/lib/components/PostModal.svelte:22 -->

### [src/lib/components/PostModal.svelte:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModal.svelte#L22)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * ポストモーダル。
	 *
	 * Composer は開いていない間も破棄しない。{#if} で作り直すと ImageAttachmentEditor が
	 * アンマウント時に Object URL を解放してしまい、閉じて開き直しただけで添付画像の
	 * プレビューと書きかけが失われる。
	 * 開閉は表示の切り替えだけで行う。
	 *
	 * ブログはここではなく BlogModal で書く（ポストと行き来する場面がほぼないため）。
	 * Composer も別インスタンスなので、書きかけはそれぞれのモーダルに残る。
	 */
```

<!-- source: src/lib/components/PostModal.svelte:46 -->

### [src/lib/components/PostModal.svelte:46](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModal.svelte#L46)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * 3行日記にできない文脈ではタブごと出さない。3行日記は返信・引用を持てない。
	 * 3行日記を編集するときは、3行日記のタブだけを出す。
	 */
```

<!-- source: src/lib/components/PostModal.svelte:60 -->

### [src/lib/components/PostModal.svelte:60](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModal.svelte#L60)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 書きかけの途中で返信先が付いたときに、選べないタブへ取り残されないようにする。
	// 端末の設定は書き換えない。返信のたびに「3行日記」の選択が失われてしまうため。
```

<!-- source: src/lib/components/PostModal.svelte:67 -->

### [src/lib/components/PostModal.svelte:67](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModal.svelte#L67)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 投稿できたことを表示中のフィードへ伝えるだけ。画面をどこへ寄せるか（寄せられない
	// ときに導線を出すか）は Composer が postFollow へ預けている。
```

<!-- source: src/lib/components/PostModal.svelte:70 -->

### [src/lib/components/PostModal.svelte:70](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModal.svelte#L70)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 日記の編集は端末のタブ設定に触れない。
```

<!-- source: src/lib/components/PostModal.svelte:76 -->

### [src/lib/components/PostModal.svelte:76](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModal.svelte#L76)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 閉じただけなら前回の選択を保ち、投稿できたときだけ postSucceeded で戻す。
```

<!-- source: src/lib/components/PostModal.svelte:88 -->

### [src/lib/components/PostModal.svelte:88](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModal.svelte#L88)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// シェアなどから本文を渡されたら、通常のポストの本文へ移す（書きかけは消さない）。
```

<!-- source: src/lib/components/PostModal.svelte:127 -->

### [src/lib/components/PostModal.svelte:127](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModal.svelte#L127)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!--
		Composer と3行日記の入力欄は、タブを切り替えても破棄しない（書きかけと添付画像を保つため。
		冒頭のコメント参照）。表示だけを切り替える。
	-->
```

<!-- source: src/lib/components/PostModal.svelte:146 -->

### [src/lib/components/PostModal.svelte:146](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModal.svelte#L146)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 変換中の削除・置換は、実際の本文削除として扱わない。
```

## src/lib/components/PostModalShell.svelte

<!-- source: src/lib/components/PostModalShell.svelte:26 -->

### [src/lib/components/PostModalShell.svelte:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModalShell.svelte#L26)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
		 * 出すタブ。ゲスト投稿や返信のように3行日記にできない文脈では絞る。
		 * 選択中のモードがここから外れたら、呼び出し元が mode を戻す。
		 * 空ならタブの代わりに title を見出しとして見せる（ブログモーダル）。
		 */
```

<!-- source: src/lib/components/PostModalShell.svelte:33 -->

### [src/lib/components/PostModalShell.svelte:33](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModalShell.svelte#L33)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** ポストおたすけ欄の高さ。モーダルと重ならないよう表示領域から差し引く。 */
```

<!-- source: src/lib/components/PostModalShell.svelte:42 -->

### [src/lib/components/PostModalShell.svelte:42](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModalShell.svelte#L42)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// ポストモーダルとブログモーダルが同時に DOM にあるので、見出しの id は重ねない。
```

<!-- source: src/lib/components/PostModalShell.svelte:61 -->

### [src/lib/components/PostModalShell.svelte:61](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModalShell.svelte#L61)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/*
		モバイルのソフトウェアキーボードは画面に重なるだけで、100dvh も fixed の inset:0 も
		縮まない（Android Chrome の既定）。そのままだとモーダルの下半分がキーボードの裏に入り、
		ブラウザがカーソルを見せようと画面ごと持ち上げてタブまで上へ逃げる。
		実際に見えている領域（visualViewport）に背景を合わせ、モーダルをその中へ収める。
	*/
```

<!-- source: src/lib/components/PostModalShell.svelte:127 -->

### [src/lib/components/PostModalShell.svelte:127](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModalShell.svelte#L127)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- あっさり・しっかりは「ポスト」のグループとして1つの枠に入れ、ほかとは区切り線で分ける。 -->
```

<!-- source: src/lib/components/PostModalShell.svelte:164 -->

### [src/lib/components/PostModalShell.svelte:164](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModalShell.svelte#L164)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* top と bottom は見えている領域に合わせて差し込む。 */
```

<!-- source: src/lib/components/PostModalShell.svelte:182 -->

### [src/lib/components/PostModalShell.svelte:182](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModalShell.svelte#L182)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* 背景の内側（見えている領域から余白とおたすけ欄を除いた分）に収め、本文を内側でスクロールさせる。 */
```

<!-- source: src/lib/components/PostModalShell.svelte:228 -->

### [src/lib/components/PostModalShell.svelte:228](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModalShell.svelte#L228)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* 狭い画面では閉じる/送信より先に縮む側にする。 */
```

<!-- source: src/lib/components/PostModalShell.svelte:260 -->

### [src/lib/components/PostModalShell.svelte:260](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModalShell.svelte#L260)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* 書き方だけが違うタブの組。枠で囲んで、ひとまとまりに見せる。 */
```

<!-- source: src/lib/components/PostModalShell.svelte:276 -->

### [src/lib/components/PostModalShell.svelte:276](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModalShell.svelte#L276)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* ブログは本文の右に記事メタ欄が並ぶぶんだけ広い。しっかりは本文 1 列なので通常幅のまま。 */
```

<!-- source: src/lib/components/PostModalShell.svelte:305 -->

### [src/lib/components/PostModalShell.svelte:305](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModalShell.svelte#L305)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/*
			閉じる・タブ・投稿ボタンを1行に並べると、狭い端末ではタブが投稿ボタンの裏へ潜る。
			タブの余白を詰め、それでも収まらない幅ではタブの列を横スクロールにする。
		*/
```

<!-- source: src/lib/components/PostModalShell.svelte:321 -->

### [src/lib/components/PostModalShell.svelte:321](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostModalShell.svelte#L321)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* さらに狭い端末では、投稿ボタンのアイコンを外して文言だけにする。 */
```

## src/lib/components/PostScopeDialog.svelte

<!-- source: src/lib/components/PostScopeDialog.svelte:20 -->

### [src/lib/components/PostScopeDialog.svelte:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostScopeDialog.svelte#L20)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** ブログは公開レコードなので、こっそりを選ばせない。 */
```

<!-- source: src/lib/components/PostScopeDialog.svelte:64 -->

### [src/lib/components/PostScopeDialog.svelte:64](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostScopeDialog.svelte#L64)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// ゲージなので左右キーで段階を動かせるようにする。無効な段はまたがずに止める。
```

<!-- source: src/lib/components/PostScopeDialog.svelte:188 -->

### [src/lib/components/PostScopeDialog.svelte:188](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostScopeDialog.svelte#L188)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* ドットの中心（各列の中央）どうしを結ぶ線。両端の余白は 1/6 ずつ。 */
```

## src/lib/components/TrilinesComposer.svelte

<!-- source: src/lib/components/TrilinesComposer.svelte:34 -->

### [src/lib/components/TrilinesComposer.svelte:34](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TrilinesComposer.svelte#L34)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * 3行日記の入力欄。ポストモーダルの「3行日記」タブで Composer の代わりに出す。
	 *
	 * 正本は本人の PDS の com.suibari.trilinesat.diary。TriLinesAt と同じレコードを書くので、
	 * どちらのアプリからでも読める。「botたんに相談」は空いている行だけを下書きで埋め、投稿はしない。
	 */
```

<!-- source: src/lib/components/TrilinesComposer.svelte:48 -->

### [src/lib/components/TrilinesComposer.svelte:48](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TrilinesComposer.svelte#L48)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** タブが選ばれているか。隠れている間は今日の日記の確認や権限の確認をしない。 */
```

<!-- source: src/lib/components/TrilinesComposer.svelte:67 -->

### [src/lib/components/TrilinesComposer.svelte:67](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TrilinesComposer.svelte#L67)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * 公開範囲。日記は PDS の公開レコード（TriLinesAt からも読める）なので、こっそりは選べない。
	 * 「Blueskyにも」は Composer と同じくクロスポストの有効化と権限がそろったときだけ選べる。
	 */
```

<!-- source: src/lib/components/TrilinesComposer.svelte:87 -->

### [src/lib/components/TrilinesComposer.svelte:87](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TrilinesComposer.svelte#L87)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 開いたとき（タブが選ばれたとき）に、今日の日記・権限・Bluesky 連携の状態を読み直す。
```

<!-- source: src/lib/components/TrilinesComposer.svelte:104 -->

### [src/lib/components/TrilinesComposer.svelte:104](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TrilinesComposer.svelte#L104)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 前回の投稿範囲を引き継ぐ。こっそりは日記では選べないので、通常の公開に読み替える。
```

<!-- source: src/lib/components/TrilinesComposer.svelte:109 -->

### [src/lib/components/TrilinesComposer.svelte:109](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TrilinesComposer.svelte#L109)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 編集するときは PDS の正本から行と画像の BlobRef を読み込む（表示用の PostView には BlobRef が無い）。
```

<!-- source: src/lib/components/TrilinesComposer.svelte:207 -->

### [src/lib/components/TrilinesComposer.svelte:207](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TrilinesComposer.svelte#L207)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 待っている間に書かれた行は上書きしない。
```

<!-- source: src/lib/components/TrilinesComposer.svelte:282 -->

### [src/lib/components/TrilinesComposer.svelte:282](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TrilinesComposer.svelte#L282)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!--
				説明は常に出さず、ボタン内のヘルプマークからツールチップで読ませる（モーダルを詰めるため）。
				button の中に別の操作要素は置けないので、マークは飾りにしてボタン自体の hover/focus で出す。
			-->
```

<!-- source: src/lib/components/TrilinesComposer.svelte:297 -->

### [src/lib/components/TrilinesComposer.svelte:297](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TrilinesComposer.svelte#L297)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- 線画をマスクにして文字色で塗る（ほかのアイコンと色をそろえる）。 -->
```

<!-- source: src/lib/components/TrilinesComposer.svelte:409 -->

### [src/lib/components/TrilinesComposer.svelte:409](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TrilinesComposer.svelte#L409)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
<!-- 公開範囲は Composer と同じボタンとゲージ（PostScopeDialog）で選ぶ。 -->
```

<!-- source: src/lib/components/TrilinesComposer.svelte:631 -->

### [src/lib/components/TrilinesComposer.svelte:631](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/TrilinesComposer.svelte#L631)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* 狭い画面ではモーダル上端の送信ボタンを使う（Composer の .composer-foot と同じ扱い）。 */
```

## src/lib/components/composer-decorations.ts

<!-- source: src/lib/components/composer-decorations.ts:24 -->

### [src/lib/components/composer-decorations.ts:24](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-decorations.ts#L24)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** メンション等の選択範囲だけが変わったとき、装飾を組み直させる。 */
```

<!-- source: src/lib/components/composer-decorations.ts:27 -->

### [src/lib/components/composer-decorations.ts:27](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-decorations.ts#L27)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 箇条書きの `- ` を、投稿と同じ「•」に見せる。 */
```

<!-- source: src/lib/components/composer-decorations.ts:51 -->

### [src/lib/components/composer-decorations.ts:51](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-decorations.ts#L51)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// markdown.ts のブロック判定と同じマーカー。行の種別はそちらで判定済みなので、ここでは長さだけを取る。
```

<!-- source: src/lib/components/composer-decorations.ts:55 -->

### [src/lib/components/composer-decorations.ts:55](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-decorations.ts#L55)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 本文を書く前の `- ` だけの行。投稿では箇条書きにならないが、入力中は先に「•」を見せる。
```

<!-- source: src/lib/components/composer-decorations.ts:68 -->

### [src/lib/components/composer-decorations.ts:68](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-decorations.ts#L68)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 箇条書きと引用のマーカーは投稿でも表示されないので、入力欄でも隠して「•」や罫線にする。
		// ひとかたまりで消せるよう atomic にし、Backspace 1 回で普通の行へ戻せるようにする。
```

<!-- source: src/lib/components/composer-decorations.ts:98 -->

### [src/lib/components/composer-decorations.ts:98](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-decorations.ts#L98)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 隠している行頭マーカー（`- ` や `> `）の長さ。隠していない行は 0。 */
```

<!-- source: src/lib/components/composer-decorations.ts:103 -->

### [src/lib/components/composer-decorations.ts:103](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-decorations.ts#L103)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * キャレットを隠したマーカーの手前に置かない。Home やクリックで行頭へ行っても本文の先頭へ寄せ、
 * そこで Backspace を押すとマーカーごと消えて普通の行へ戻る（note と同じ操作感）。
 * 本文の先頭から ← で出るときは、前の行の末尾へ移す。
 */
```

<!-- source: src/lib/components/composer-decorations.ts:134 -->

### [src/lib/components/composer-decorations.ts:134](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-decorations.ts#L134)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * 入力欄の装飾。投稿時と同じ規則（highlightComposerText）で判定し、見出しの大きさや
 * 箇条書きの「•」まで投稿後の見た目に寄せる。記法の文字は `**` や `## ` のように薄く残す。
 */
```

## src/lib/components/composer-embeds.ts

<!-- source: src/lib/components/composer-embeds.ts:17 -->

### [src/lib/components/composer-embeds.ts:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L17)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 入力欄で URL 行の代わりに見せるリンクカード。LinkCardEditor が取得した内容をそのまま渡す。 */
```

<!-- source: src/lib/components/composer-embeds.ts:26 -->

### [src/lib/components/composer-embeds.ts:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * 記事の入力欄に重ねる埋め込み。cards は URL、images は blob の照合キー（DID/CID）から引く。
 * 渡されていない行（カードを × で消した URL、添付の無い画像行）は記法の文字のまま見せる。
 */
```

<!-- source: src/lib/components/composer-embeds.ts:32 -->

### [src/lib/components/composer-embeds.ts:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L32)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** blobKey → プレビューの URL（手元の Object URL か AppView の URL）。 */
```

<!-- source: src/lib/components/composer-embeds.ts:38 -->

### [src/lib/components/composer-embeds.ts:38](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L38)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * Android では入力欄が素の textarea になり（ComposerInput 参照）、埋め込みを重ねられない。
 * そのときはカードを従来どおり入力欄の下の一覧に出す。
 */
```

<!-- source: src/lib/components/composer-embeds.ts:109 -->

### [src/lib/components/composer-embeds.ts:109](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L109)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 入力欄のフォーカスとキャレットを動かさずに消す。
```

<!-- source: src/lib/components/composer-embeds.ts:147 -->

### [src/lib/components/composer-embeds.ts:147](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L147)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// alt は閲覧時に見せる文字ではないので、Bluesky と同じく画像の隅の「ALT」で示して直させる。
```

<!-- source: src/lib/components/composer-embeds.ts:190 -->

### [src/lib/components/composer-embeds.ts:190](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L190)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 行の位置は編集のたびに動くので、押した時点の DOM から引き直す。
```

<!-- source: src/lib/components/composer-embeds.ts:215 -->

### [src/lib/components/composer-embeds.ts:215](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L215)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 投稿画面ごと閉じないよう、ここで止める。
```

<!-- source: src/lib/components/composer-embeds.ts:234 -->

### [src/lib/components/composer-embeds.ts:234](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L234)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** カード・画像に置き換えた行。キャレットはこの中に入らず、1 つの塊として動く。 */
```

<!-- source: src/lib/components/composer-embeds.ts:248 -->

### [src/lib/components/composer-embeds.ts:248](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L248)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 閲覧時（RichText の card ブロック）と同じく、カードがある URL 行は行ごとカードにする。
			// カードの無い行（取得前・× で消した URL）は URL の文字のまま見せる。
```

<!-- source: src/lib/components/composer-embeds.ts:256 -->

### [src/lib/components/composer-embeds.ts:256](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L256)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 画像も閲覧時と同じく、行ごと画像にする。添付の無い行（下書きから戻した本文など）は
			// 記法のまま見せる。
```

<!-- source: src/lib/components/composer-embeds.ts:270 -->

### [src/lib/components/composer-embeds.ts:270](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L270)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * 記事の入力欄で、カードのある URL だけの行をリンクカードに、画像行を画像に置き換える。
 * 投稿後の記事ページ（RichText の card / image ブロック）と同じ見た目にするためのもの。
 * 画像の alt は画像の「ALT」から直し、本文の `![alt](url)` に書き戻す。
 * ブロックの装飾は ViewPlugin から出せないので StateField で持つ。
 */
```

<!-- source: src/lib/components/composer-embeds.ts:295 -->

### [src/lib/components/composer-embeds.ts:295](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L295)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** pos を含むカード・画像の行の範囲。 */
```

<!-- source: src/lib/components/composer-embeds.ts:305 -->

### [src/lib/components/composer-embeds.ts:305](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L305)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * カード・画像の行の直後の行頭で Backspace、直前の行末で Delete を押したとき、改行だけを
 * 消すと隣の行がその行に繋がり、カードや画像が崩れて記法の文字に戻ってしまう。行ごと消す。
 */
```

<!-- source: src/lib/components/composer-embeds.ts:320 -->

### [src/lib/components/composer-embeds.ts:320](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-embeds.ts#L320)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// その行と改行（後ろの行に続く側）を消す。
```

## src/lib/components/composer-improvements.test.ts

<!-- source: src/lib/components/composer-improvements.test.ts:22 -->

### [src/lib/components/composer-improvements.test.ts:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-improvements.test.ts#L22)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// しっかりは本文 1 列になったので、広い画面でもモーダルを広げない
```

<!-- source: src/lib/components/composer-improvements.test.ts:44 -->

### [src/lib/components/composer-improvements.test.ts:44](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-improvements.test.ts#L44)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 見出しは投稿の h3〜h5 と同じ共通変数を使う
```

<!-- source: src/lib/components/composer-improvements.test.ts:54 -->

### [src/lib/components/composer-improvements.test.ts:54](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-improvements.test.ts#L54)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 箇条書きの `- ` は「•」で見せる
```

<!-- source: src/lib/components/composer-improvements.test.ts:71 -->

### [src/lib/components/composer-improvements.test.ts:71](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-improvements.test.ts#L71)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// ゲストはブログと3行日記にできないので、保存済みのそれらは rich へ読み替えて復元する。
```

<!-- source: src/lib/components/composer-improvements.test.ts:85 -->

### [src/lib/components/composer-improvements.test.ts:85](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/composer-improvements.test.ts#L85)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 項目の間やブロックの間に、入力には無い余白を足さない
```

## src/lib/components/content-warning-picker.test.ts

<!-- source: src/lib/components/content-warning-picker.test.ts:7 -->

### [src/lib/components/content-warning-picker.test.ts:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/content-warning-picker.test.ts#L7)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// SSR では位置計算もポータルも走らないので、要素の代わりで足りる。
```

<!-- source: src/lib/components/content-warning-picker.test.ts:13 -->

### [src/lib/components/content-warning-picker.test.ts:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/content-warning-picker.test.ts#L13)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 「画像・動画をぼかす」項目のボタン（開始タグ）と、その中身。 */
```

## src/lib/drafts/drafts.svelte.ts

<!-- source: src/lib/drafts/drafts.svelte.ts:38 -->

### [src/lib/drafts/drafts.svelte.ts:38](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/drafts/drafts.svelte.ts#L38)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// AppView の下書きは通常投稿と同じく4枚まで。記事で5枚目以降があっても、
	// 本文の URL 行から復元時に取り直されるので、保存は先頭の4枚に絞る。
```

<!-- source: src/lib/drafts/drafts.svelte.ts:74 -->

### [src/lib/drafts/drafts.svelte.ts:74](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/drafts/drafts.svelte.ts#L74)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* 成功したものだけ削除する。権限未反映時は端末原本を保持する。 */
```

<!-- source: src/lib/drafts/drafts.svelte.ts:81 -->

### [src/lib/drafts/drafts.svelte.ts:81](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/drafts/drafts.svelte.ts#L81)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/* 新権限が使えない間も旧端末データは消さない。 */
```

<!-- source: src/lib/drafts/drafts.svelte.ts:171 -->

### [src/lib/drafts/drafts.svelte.ts:171](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/drafts/drafts.svelte.ts#L171)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** AppView側は全データ削除済みなので、移行未完了の端末原本だけを消す。 */
```

## src/lib/drafts/storage.ts

<!-- source: src/lib/drafts/storage.ts:3 -->

### [src/lib/drafts/storage.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/drafts/storage.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * AppView同期以前の下書きを読むための互換形式。新規保存には使わない。
 * 画像なしはAppViewへ移行し、画像付きは「旧端末下書き」として復元・削除だけを許可する。
 */
```

<!-- source: src/lib/drafts/storage.ts:22 -->

### [src/lib/drafts/storage.ts:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/drafts/storage.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 所有者 DID。端末を共有しても他アカウントの下書きは見えない。 */
```

<!-- source: src/lib/drafts/storage.ts:26 -->

### [src/lib/drafts/storage.ts:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/drafts/storage.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 本文内Bluemojiの参照範囲。旧下書きでは未定義。 */
```

<!-- source: src/lib/drafts/storage.ts:30 -->

### [src/lib/drafts/storage.ts:30](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/drafts/storage.ts#L30)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** ユーザーが × で消したリンクカードの URL。復元時に再取得させないため。 */
```

<!-- source: src/lib/drafts/storage.ts:32 -->

### [src/lib/drafts/storage.ts:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/drafts/storage.ts#L32)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * 貼り付けでセットした引用元の AT-URI。表示に要る本文・著者は復元時に取り直すので
	 * ここには参照だけ持つ。旧下書きには無い。
	 */
```

<!-- source: src/lib/drafts/storage.ts:70 -->

### [src/lib/drafts/storage.ts:70](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/drafts/storage.ts#L70)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 失敗した接続を握ったままにすると以降ずっと開けなくなる。
```

<!-- source: src/lib/drafts/storage.ts:97 -->

### [src/lib/drafts/storage.ts:97](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/drafts/storage.ts#L97)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 更新日時の新しい順。IndexedDB が使えない環境では空配列。 */
```

<!-- source: src/lib/drafts/storage.ts:116 -->

### [src/lib/drafts/storage.ts:116](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/drafts/storage.ts#L116)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 呼び出し側で $state.snapshot 済みのプレーンなオブジェクトを渡すこと（proxy は構造化複製できない）。
```

<!-- source: src/lib/drafts/storage.ts:125 -->

### [src/lib/drafts/storage.ts:125](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/drafts/storage.ts#L125)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 削除できなくても投稿機能には影響しない。
```

## src/lib/post/appview-uri.ts

<!-- source: src/lib/post/appview-uri.ts:1 -->

### [src/lib/post/appview-uri.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/appview-uri.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * こっそり投稿は PDS ではなく AppView が正本を持つ。その AT-URI は著者ではなく
 * AppView の DID 配下で発行される — 他人のリアクションレコードなどに URI が載っても
 * 著者を辿れないようにするため。
 *
 * よって「URI の authority ＝ 著者の DID」は成り立たない。URI から作者を取り出す処理は
 * 書かず、著者は必ず PostView.author.did を見ること。
 */
```

<!-- source: src/lib/post/appview-uri.ts:11 -->

### [src/lib/post/appview-uri.ts:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/appview-uri.ts#L11)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** AppView が正本を持つレコード（＝PDS に無いので repo 操作の対象にならない）か。 */
```

## src/lib/post/composer-highlight.test.ts

<!-- source: src/lib/post/composer-highlight.test.ts:42 -->

### [src/lib/post/composer-highlight.test.ts:42](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-highlight.test.ts#L42)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// URL の中の _ は斜体の記法として扱わない
```

## src/lib/post/composer-highlight.ts

<!-- source: src/lib/post/composer-highlight.ts:11 -->

### [src/lib/post/composer-highlight.ts:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-highlight.ts#L11)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** facet のバイト範囲を本文の文字位置へ直す。 */
```

<!-- source: src/lib/post/composer-highlight.ts:26 -->

### [src/lib/post/composer-highlight.ts:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-highlight.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * 入力欄の重ね描き用に、入力文字列を行ごとの装飾付き区間へ分ける。
 *
 * 投稿時と同じ parsePostText → parseRichText の規則で判定するので、ここで装飾された
 * 文字は投稿後も同じ装飾で表示される。記法の文字（`**`、`## `、`[`〜`](URL)` など）は
 * 消さずに md-syntax として残し、入力欄の文字位置とキャレットを一致させる。
 */
```

<!-- source: src/lib/post/composer-highlight.ts:49 -->

### [src/lib/post/composer-highlight.ts:49](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-highlight.ts#L49)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 本文へ写らなかった入力の文字（名前付きリンクの括弧と URL）は記法として扱う
```

## src/lib/post/composer-host.svelte.ts

<!-- source: src/lib/post/composer-host.svelte.ts:10 -->

### [src/lib/post/composer-host.svelte.ts:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-host.svelte.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 編集する3行日記。ポストモーダルを3行日記タブだけにして開く。 */
```

<!-- source: src/lib/post/composer-host.svelte.ts:22 -->

### [src/lib/post/composer-host.svelte.ts:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-host.svelte.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * botたんラジオの1回。引用先のレコード（com.suibari.nagi.radio）は投稿するときに作るので、
	 * それまで uri / cid は空。キャンセルすれば何も残らない。
	 */
```

<!-- source: src/lib/post/composer-host.svelte.ts:29 -->

### [src/lib/post/composer-host.svelte.ts:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-host.svelte.ts#L29)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * ポストモーダルの開閉と、「いま見ているフィード」の文脈。
 *
 * モーダルは +layout.svelte に1つだけ常駐する（Composer を {#if} で作り直すと
 * ImageAttachmentEditor がアンマウント時に Object URL を解放してしまい、
 * 添付画像と書きかけが消えるため）。開閉は表示の切り替えだけで行う。
 */
```

<!-- source: src/lib/post/composer-host.svelte.ts:38 -->

### [src/lib/post/composer-host.svelte.ts:38](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-host.svelte.ts#L38)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * ブログモーダルの開閉。ポストモーダルとは別の Composer を持つので、
	 * 書きかけもそれぞれのモーダルで別々に残る。返信・引用の文脈は持たない。
	 */
```

<!-- source: src/lib/post/composer-host.svelte.ts:43 -->

### [src/lib/post/composer-host.svelte.ts:43](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-host.svelte.ts#L43)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** ブログモーダルを一度でも開いたか。開いたあとはリロードまで破棄しない（書きかけを保つため）。 */
```

<!-- source: src/lib/post/composer-host.svelte.ts:45 -->

### [src/lib/post/composer-host.svelte.ts:45](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-host.svelte.ts#L45)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 開いた文脈での既定の投稿範囲。ホームは従来どおりこっそりを既定にする。 */
```

<!-- source: src/lib/post/composer-host.svelte.ts:50 -->

### [src/lib/post/composer-host.svelte.ts:50](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-host.svelte.ts#L50)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * 開くときに本文へ差し込む文（アドカレのシェアなど）。PostModal が受け取って本文へ移し、
	 * すぐに消す。書きかけがあれば消さずに後ろへ足す。
	 */
```

<!-- source: src/lib/post/composer-host.svelte.ts:56 -->

### [src/lib/post/composer-host.svelte.ts:56](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-host.svelte.ts#L56)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 本文を入れた状態で、通常のポストとして開く。URL はリンクカードになる。 */
```

<!-- source: src/lib/post/composer-host.svelte.ts:111 -->

### [src/lib/post/composer-host.svelte.ts:111](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-host.svelte.ts#L111)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** botたんラジオの1回を引用して書く。ニュースの「コメント」と同じ形。 */
```

<!-- source: src/lib/post/composer-host.svelte.ts:154 -->

### [src/lib/post/composer-host.svelte.ts:154](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-host.svelte.ts#L154)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 日記の編集はその場限り。次に開いたときは通常の投稿に戻す。
```

## src/lib/post/composer-host.test.ts

<!-- source: src/lib/post/composer-host.test.ts:31 -->

### [src/lib/post/composer-host.test.ts:31](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-host.test.ts#L31)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 解除ボタン（×ボタン）で clearReply() を実行したときの挙動
```

<!-- source: src/lib/post/composer-host.test.ts:44 -->

### [src/lib/post/composer-host.test.ts:44](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-host.test.ts#L44)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 解除ボタン（×ボタン）で clearQuote() を実行したときの挙動
```

## src/lib/post/composer-mode.test.ts

<!-- source: src/lib/post/composer-mode.test.ts:64 -->

### [src/lib/post/composer-mode.test.ts:64](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-mode.test.ts#L64)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 返信・引用やゲストでは、ポストのグループだけになる。
```

## src/lib/post/composer-mode.ts

<!-- source: src/lib/post/composer-mode.ts:1 -->

### [src/lib/post/composer-mode.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-mode.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * Composer の書き方。
 *
 * - simple（あっさり）: 本文・画像・CW だけの短文向け（記法の装飾は見せるが、装飾ボタンは出さない）
 * - rich（しっかり）:   文字装飾のボタンが付く長文向け
 * - diary（3行日記）:  TriLinesAt の3行日記（com.suibari.trilinesat.diary）を書くモード。
 *                       本文エディタの代わりに3行の入力欄を出す
 * - blog（ブログ）:     rich に記事メタ（タイトル・ヘッダー画像・タグ）を足し、
 *                       standard.site へ記事としても公開するモード。
 *                       ポストと行き来する場面がほぼないので、ポストモーダルのタブではなく
 *                       別のブログモーダル（BlogModal）で書く
 */
```

<!-- source: src/lib/post/composer-mode.ts:17 -->

### [src/lib/post/composer-mode.ts:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-mode.ts#L17)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** ポストモーダルのタブ。ブログは別モーダルなので含めない。 */
```

<!-- source: src/lib/post/composer-mode.ts:22 -->

### [src/lib/post/composer-mode.ts:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-mode.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 端末に残すのはポストモーダルのタブだけ。以前のタブ時代に保存された 'blog' は捨てる。 */
```

<!-- source: src/lib/post/composer-mode.ts:27 -->

### [src/lib/post/composer-mode.ts:27](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-mode.ts#L27)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * 広いエディタ（文字装飾のボタン・下書き自動保存）を使うモードか。
 * 「しっかり」と「ブログ」の共通部分はここで1本にまとめ、
 * blog 固有の分岐だけを mode === 'blog' で書く。3行日記は本文エディタを使わないので含めない。
 */
```

<!-- source: src/lib/post/composer-mode.ts:34 -->

### [src/lib/post/composer-mode.ts:34](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-mode.ts#L34)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * 返信・引用やゲスト投稿のように、本人の PDS へ独立したレコードを作れない文脈でも選べるモード。
 * ブログと3行日記はどちらも返信・引用の文脈を持てない。
 */
```

<!-- source: src/lib/post/composer-mode.ts:40 -->

### [src/lib/post/composer-mode.ts:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-mode.ts#L40)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * タブの見た目上のまとまり。あっさり・しっかりはどちらも「ポスト」の書き方の違いなので
 * 1つのグループに入れ、3行日記は別のものとして分ける。
 * 並びは渡した順を保ち、隣り合う同じグループだけをまとめる。
 */
```

<!-- source: src/lib/post/composer-mode.ts:72 -->

### [src/lib/post/composer-mode.ts:72](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-mode.ts#L72)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 保存できない環境でも、現在のモーダル内での切替はそのまま使える。
```

## src/lib/post/composer-suggestion.ts

<!-- source: src/lib/post/composer-suggestion.ts:22 -->

### [src/lib/post/composer-suggestion.ts:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-suggestion.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// facets.ts と同じく、行頭か空白の直後の # / ＃ だけをハッシュタグとして扱う。
```

<!-- source: src/lib/post/composer-suggestion.ts:32 -->

### [src/lib/post/composer-suggestion.ts:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-suggestion.ts#L32)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 絵文字は意味でも探すので、名前に使えない日本語（:ねこ）も検索語として受ける。
	// 記号は受けない（顔文字の :) や URL の途中を候補にしない）。
```

<!-- source: src/lib/post/composer-suggestion.ts:44 -->

### [src/lib/post/composer-suggestion.ts:44](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/composer-suggestion.ts#L44)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** カスタム絵文字は :name: に、Unicode 絵文字はその文字に置き換える。 */
```

## src/lib/post/labels.ts

<!-- source: src/lib/post/labels.ts:1 -->

### [src/lib/post/labels.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/labels.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * モデレーションラベルの定義と判定。
 *
 * ラベルの出所はAppViewだけ。公開ATプロトコルラベラーは廃止したので、
 * `src` で発行者を絞る処理も、ラベラーDIDのハードコードも持たない。
 */
```

<!-- source: src/lib/post/labels.ts:15 -->

### [src/lib/post/labels.ts:15](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/labels.ts#L15)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * 投稿作成時にユーザーが指定可能なセルフラベル一覧
 */
```

<!-- source: src/lib/post/labels.ts:48 -->

### [src/lib/post/labels.ts:48](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/labels.ts#L48)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * メディアをぼかす対象のラベル。
 * サーバが未成年へ丸ごと出さないラベル（ADULT_LABELS）と同じ集合にしてある。
 */
```

<!-- source: src/lib/post/labels.ts:56 -->

### [src/lib/post/labels.ts:56](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/labels.ts#L56)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 投稿者自身が付けたか（true）、自動判定が付けたか（false）。 */
```

<!-- source: src/lib/post/labels.ts:60 -->

### [src/lib/post/labels.ts:60](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/labels.ts#L60)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 表示に使うラベルを、AppViewが返した2つの配列からまとめる。 */
```

<!-- source: src/lib/post/labels.ts:73 -->

### [src/lib/post/labels.ts:73](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/labels.ts#L73)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * 画像・メディアをぼかす（Blur）対象か判定
 */
```

## src/lib/post/quote-pick.svelte.ts

<!-- source: src/lib/post/quote-pick.svelte.ts:10 -->

### [src/lib/post/quote-pick.svelte.ts:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/quote-pick.svelte.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * コンポーザーの「貼り付けで付く引用」スロット。
 *
 * ポストモーダルと返信インライン欄が同じ挙動を持つので、状態と非同期解決を
 * ここへ集約する（ニュース引用の NewsQuote クラスと同じ切り出し方）。
 * 引用は1件だけ持てる。新しく貼られたら置き換える。
 */
```

<!-- source: src/lib/post/quote-pick.svelte.ts:21 -->

### [src/lib/post/quote-pick.svelte.ts:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/quote-pick.svelte.ts#L21)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 後から届いた解決結果で、より新しい貼り付けを上書きしないための世代番号。 */
```

<!-- source: src/lib/post/quote-pick.svelte.ts:32 -->

### [src/lib/post/quote-pick.svelte.ts:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/quote-pick.svelte.ts#L32)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * 貼り付けが Nagi のスレッドURL単体なら引用として引き取る。
	 *
	 * URL文字列自体は本文へ入れない（preventDefault）。入れてしまうと
	 * LinkCardEditor の自動リンクカード化と競合し、あとから本文を削る処理も要る。
	 * 画像ペーストなど他の貼り付けは素通しする。
	 */
```

<!-- source: src/lib/post/quote-pick.svelte.ts:46 -->

### [src/lib/post/quote-pick.svelte.ts:46](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/quote-pick.svelte.ts#L46)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
	 * 下書きに保存しておいた引用を戻す。保存しているのは AT-URI だけなので、
	 * 表示に要る本文と著者はここで取り直す。復元時点でも権限は改めて判定される
	 * （下書きを寝かせている間に引用元が消えた／条件が変わった場合に備える）。
	 */
```

<!-- source: src/lib/post/quote-pick.svelte.ts:68 -->

### [src/lib/post/quote-pick.svelte.ts:68](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/quote-pick.svelte.ts#L68)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 失敗しても本文へURLは戻さない（クリップボードに残っている）。
				// 代わりに理由を出して、貼り直すか諦めるかを選べるようにする。
```

## src/lib/post/quote-url.ts

<!-- source: src/lib/post/quote-url.ts:11 -->

### [src/lib/post/quote-url.ts:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/quote-url.ts#L11)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * 貼り付けられた文字列が Nagi のスレッドURL（/thread/{did}/{rkey}）なら、その参照先を返す。
 *
 * 「文字列全体が単一URL」のときだけ受ける。本文ごとコピーした文章の中にたまたま
 * スレッドURLが含まれていた場合まで引用へ吸い上げると、入力を奪ってしまうため。
 */
```

<!-- source: src/lib/post/quote-url.ts:20 -->

### [src/lib/post/quote-url.ts:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/quote-url.ts#L20)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 空白を含む＝URL単体ではない。
```

<!-- source: src/lib/post/quote-url.ts:22 -->

### [src/lib/post/quote-url.ts:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/quote-url.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// '//example.com' はプロトコル相対の外部URLなので相対パス扱いしない。
```

<!-- source: src/lib/post/quote-url.ts:26 -->

### [src/lib/post/quote-url.ts:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/quote-url.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 本番からコピーしたURLをローカル／TWAで貼っても通るよう、相対解決の基準は
		// 公開オリジンにしておく（相対パスならどのみち同じ結果になる）。
```

<!-- source: src/lib/post/quote-url.ts:40 -->

### [src/lib/post/quote-url.ts:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/quote-url.ts#L40)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 現在のオリジン（ローカル開発・TWA を含む）と、本番の公開オリジンを内部として扱う。 */
```

<!-- source: src/lib/post/quote-url.ts:50 -->

### [src/lib/post/quote-url.ts:50](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/quote-url.ts#L50)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * スレッドURLから引用対象の投稿を取り、引用してよい相手かを判定する。
 * 引用できるのは自分の投稿と botたんの投稿だけ（吹き出しの引用ボタンと同じ条件）。
 *
 * URL として解釈できないときは undefined を返す（＝引用の話ではない）。
 */
```

<!-- source: src/lib/post/quote-url.ts:65 -->

### [src/lib/post/quote-url.ts:65](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/quote-url.ts#L65)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 下書き復元のように、既に AT-URI を持っている場合の入口。判定は URL 経路と同じ。 */
```

<!-- source: src/lib/post/quote-url.ts:73 -->

### [src/lib/post/quote-url.ts:73](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/quote-url.ts#L73)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// getThread は返信のURIで叩いてもルートを起点にスレッド全体を返すので、
		// 目的の投稿は replies 側にいることがある。削除済みは replies から除かれる。
```

<!-- source: src/lib/post/quote-url.ts:81 -->

### [src/lib/post/quote-url.ts:81](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/quote-url.ts#L81)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// isBot は AppView が付ける（クライアントに bot の DID を持たせない）。
```

## src/lib/post/scope.ts

<!-- source: src/lib/post/scope.ts:1 -->

### [src/lib/post/scope.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/scope.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * 投稿範囲。右へ行くほど届く範囲が広がる排他的な3段階で、投稿範囲モーダルの
 * ゲージUIと1対1で対応する。
 *
 * - kossori: 共有タイムラインに本文を出さない（レコードの `kossori: true`）
 * - feed:    いま見ているフィードに出す。チャンネルページならそのチャンネル投稿になる
 * - external: feed に加えて、Bluesky にもクロスポストする
 *
 * 以前は「こっそりトグル」「standard.site トグル」「Blueskyにも送信ボタン」が
 * 独立して並んでおり、組み合わせの可否がユーザーから見えなかった。1本の軸に
 * まとめることで「広げる/狭める」だけの操作にしている。
 *
 * standard.site への記事公開はこの軸には乗らない。「どこまで届けるか」ではなく
 * 「何を書くか」なので、投稿モーダルの書き方タブ（ブログ）が担っている。
 */
```

<!-- source: src/lib/post/scope.ts:22 -->

### [src/lib/post/scope.ts:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/scope.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 自分とリストの人しか居ない場所。従来のホームタブと同じくこっそりを既定にする。 */
```

<!-- source: src/lib/post/scope.ts:45 -->

### [src/lib/post/scope.ts:45](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/scope.ts#L45)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 保存できなくても投稿自体には影響しない。
```

<!-- source: src/lib/post/scope.ts:49 -->

### [src/lib/post/scope.ts:49](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/scope.ts#L49)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 保存済みの選択を優先し、無ければ呼び出し元の画面別既定値を使う。 */
```

<!-- source: src/lib/post/scope.ts:54 -->

### [src/lib/post/scope.ts:54](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/scope.ts#L54)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * 外部公開権限の確認中は、保存済みの external を feed へ落とさない。
 * 確認が終わって実際に利用不能だと確定した場合だけ安全側へ狭める。
 */
```

<!-- source: src/lib/post/scope.ts:66 -->

### [src/lib/post/scope.ts:66](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/scope.ts#L66)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * そのページで投稿を始めたときの既定の投稿範囲。
 * 端末に前回選択した投稿範囲が保存されている場合はそれを優先し、
 * 未保存の場合はページに応じた既定値（ホーム等はこっそり）を使用する。
 */
```

<!-- source: src/lib/post/scope.ts:75 -->

### [src/lib/post/scope.ts:75](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/scope.ts#L75)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * こっそりではないスレッドへ返信するときの投稿範囲。AppView はこっそりスレッドの外に
 * こっそり投稿を置かせないので、こっそりのままでは送れない。
 *
 * まだ何も書いていなければフィードへ切り替える。書きかけの本文があるときは、
 * こっそりのつもりで書いた内容を黙って公開しないよう、そのまま残して呼び出し側で送信を止める。
 */
```

## src/lib/post/seen.ts

<!-- source: src/lib/post/seen.ts:45 -->

### [src/lib/post/seen.ts:45](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/seen.ts#L45)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 壊れた端末データは空として扱い、次の閲覧で正常な形式へ戻す。
```

<!-- source: src/lib/post/seen.ts:55 -->

### [src/lib/post/seen.ts:55](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/seen.ts#L55)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// localStorage が使えなくても、このタブを開いている間のメモリ記録は維持する。
```

<!-- source: src/lib/post/seen.ts:59 -->

### [src/lib/post/seen.ts:59](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/seen.ts#L59)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 同一アカウントで一度画面内に入った投稿URIか。 */
```

<!-- source: src/lib/post/seen.ts:64 -->

### [src/lib/post/seen.ts:64](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/seen.ts#L64)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** URI単位で記録するため、別セクションの未閲覧投稿まで日時で巻き込まない。 */
```

<!-- source: src/lib/post/seen.ts:76 -->

### [src/lib/post/seen.ts:76](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/seen.ts#L76)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** ChatBubble が実際にビューポートへ入った時点で投稿を既読台帳へ記録する。 */
```

<!-- source: src/lib/post/seen.ts:116 -->

### [src/lib/post/seen.ts:116](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/seen.ts#L116)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** テスト間でモジュール内キャッシュを分離する。 */
```

## src/lib/post/submission-error.ts

<!-- source: src/lib/post/submission-error.ts:5 -->

### [src/lib/post/submission-error.ts:5](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/submission-error.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/** 投稿失敗を、利用者が再試行できる単位まで分類して保持する。 */
```

<!-- source: src/lib/post/submission-error.ts:17 -->

### [src/lib/post/submission-error.ts:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/submission-error.ts#L17)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 画面には再試行の単位しか出さないので、PDS が返した理由はコンソールに残す。
```

<!-- source: src/lib/post/submission-error.ts:26 -->

### [src/lib/post/submission-error.ts:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/post/submission-error.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
/**
 * サーバが内容を見て断った失敗か。AppView の ApiRequestError も @atproto の XRPCError も
 * `status` を持つ。再送しても同じ結果になるので「通信状態を確認」とは出さない。
 * 401（セッション切れ）・408・429 は時間を置けば通りうるので、通信系の扱いに残す。
 */
```

## tests/e2e/post-assist.spec.ts

<!-- source: tests/e2e/post-assist.spec.ts:54 -->

### [tests/e2e/post-assist.spec.ts:54](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/post-assist.spec.ts#L54)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 未入力のまま3秒で、吹き出しを先に出して考え中を見せる。
```

<!-- source: tests/e2e/post-assist.spec.ts:78 -->

### [tests/e2e/post-assist.spec.ts:78](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/post-assist.spec.ts#L78)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 生成がすぐ返っても、考え中は最低限見せてからセリフに替える。
```

<!-- source: tests/e2e/post-assist.spec.ts:83 -->

### [tests/e2e/post-assist.spec.ts:83](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/post-assist.spec.ts#L83)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// PCではbotたんをクリックすると、しばらく喜ぶ姿に切り替わってから元に戻る。
```

<!-- source: tests/e2e/post-assist.spec.ts:91 -->

### [tests/e2e/post-assist.spec.ts:91](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/post-assist.spec.ts#L91)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 入力途中は4秒待つ。前のセリフは考え中に置き換わる。
```

<!-- source: tests/e2e/post-assist.spec.ts:106 -->

### [tests/e2e/post-assist.spec.ts:106](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/post-assist.spec.ts#L106)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 同じ書きかけのままなら聞き直さない。
```

<!-- source: tests/e2e/post-assist.spec.ts:117 -->

### [tests/e2e/post-assist.spec.ts:117](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/post-assist.spec.ts#L117)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// モーダルを閉じて開き直すと、また手伝ってくれる。
```

<!-- source: tests/e2e/post-assist.spec.ts:125 -->

### [tests/e2e/post-assist.spec.ts:125](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/post-assist.spec.ts#L125)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// スマホ幅では吹き出しだけを出す。
```

<!-- source: tests/e2e/post-assist.spec.ts:203 -->

### [tests/e2e/post-assist.spec.ts:203](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/post-assist.spec.ts#L203)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// スマホの予測変換も composition が続いたままになる。同じ状態で狭い画面へ変えても、
	// 吹き出しをキーボード上に出し続ける。
```

<!-- source: tests/e2e/post-assist.spec.ts:236 -->

### [tests/e2e/post-assist.spec.ts:236](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/post-assist.spec.ts#L236)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// OSのIME操作は自動化できないため、ブラウザに同じイベント列を送って確認する。
```

<!-- source: tests/e2e/post-assist.spec.ts:240 -->

### [tests/e2e/post-assist.spec.ts:240](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/post-assist.spec.ts#L240)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// CodeMirror は本文の DOM の書き換えを読み取って入力として扱う
```

<!-- source: tests/e2e/post-assist.spec.ts:251 -->

### [tests/e2e/post-assist.spec.ts:251](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/post-assist.spec.ts#L251)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 変換中に手が止まっても生成しない。
```

<!-- source: tests/e2e/post-assist.spec.ts:260 -->

### [tests/e2e/post-assist.spec.ts:260](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/post-assist.spec.ts#L260)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 変換後の実際の削除は問いかけになる。全削除の空文字も問いかけ。
```

<!-- source: tests/e2e/post-assist.spec.ts:318 -->

### [tests/e2e/post-assist.spec.ts:318](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/post-assist.spec.ts#L318)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// ブログモーダルはタブを持たず、ポストの書きかけも引き継がない。
```

## tests/e2e/post-edit.spec.ts

<!-- source: tests/e2e/post-edit.spec.ts:105 -->

### [tests/e2e/post-edit.spec.ts:105](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/post-edit.spec.ts#L105)

分類: 検証・再現条件。対応仕様: [post-composer](../../specs/post-composer/spec.md#requirements)。

```text
// 開いたままのお気に入り解除も、最新順の履歴に戻す。
```
