# 画面基盤・レイアウト・操作・開発検証：導入時コメント原文

この文書は基準コミット `24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf` に固定した履歴資料であり、現行コードの行番号一覧ではない。現在の要件は [spec.md](../../specs/ui-platform/spec.md)、判断理由は [design.md](../../specs/ui-platform/design.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## .gitignore

<!-- source: .gitignore:3 -->

### [.gitignore:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/.gitignore#L3)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
# Output
```

<!-- source: .gitignore:13 -->

### [.gitignore:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/.gitignore#L13)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
# OS
```

<!-- source: .gitignore:17 -->

### [.gitignore:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/.gitignore#L17)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
# Env
```

<!-- source: .gitignore:23 -->

### [.gitignore:23](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/.gitignore#L23)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
# Vite
```

<!-- source: .gitignore:27 -->

### [.gitignore:27](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/.gitignore#L27)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
# カード背景の原本（変換して static/card-art/*.webp にしたもの）。配信もビルドもしない。
```

## src/app.html

<!-- source: src/app.html:11 -->

### [src/app.html:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/app.html#L11)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- PWA: ホーム画面追加で standalone 起動。iOS の Web Push は standalone 必須。 -->
```

<!-- source: src/app.html:13 -->

### [src/app.html:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/app.html#L13)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- PWA の起動時から OS の配色に合うステータスバーを選ばせる。
		     保存済みのアプリ内テーマがある場合は theme-init.js が両方を上書きする。 -->
```

## src/hooks.server.ts

<!-- source: src/hooks.server.ts:4 -->

### [src/hooks.server.ts:4](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/hooks.server.ts#L4)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
 * prerender 済みのブログ記事は Vercel が静的ファイルとして返し、api/spa を通らない。
 * app.html 固定の OGP 画像のままにならないよう、生成時に記事カードへ差し替える。
 */
```

## src/lib/about/samples.ts

<!-- source: src/lib/about/samples.ts:6 -->

### [src/lib/about/samples.ts:6](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/about/samples.ts#L6)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
 * /about で、サインインしないと見られない機能（感情グラフ・年表・名刺）を
 * 「どう見えるか」だけ伝えるための架空のユーザー。実在の人・投稿・ニュースは使わない。
 * ハンドルは example.com（予約ドメイン）にして、誰かのアカウントと重ならないようにする。
 */
```

<!-- source: src/lib/about/samples.ts:13 -->

### [src/lib/about/samples.ts:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/about/samples.ts#L13)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 名刺の Avatar は相対パスに APPVIEW_URL を前置するので、絶対 URL で渡す。 */
```

<!-- source: src/lib/about/samples.ts:49 -->

### [src/lib/about/samples.ts:49](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/about/samples.ts#L49)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** サーバと同じく古い順。年表は「はじまりから今へ」読む。 */
```

<!-- source: src/lib/about/samples.ts:77 -->

### [src/lib/about/samples.ts:77](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/about/samples.ts#L77)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 年表の news は表示言語の原題を1つだけ持つ。架空の見出しで、リンク先もない。
```

<!-- source: src/lib/about/samples.ts:94 -->

### [src/lib/about/samples.ts:94](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/about/samples.ts#L94)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 毎回同じ形のグラフになるよう、乱数は種つきにする。 */
```

<!-- source: src/lib/about/samples.ts:116 -->

### [src/lib/about/samples.ts:116](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/about/samples.ts#L116)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 初期表示で開いておく日。その日の投稿は手で書いて、読んで分かる1日にする。 */
```

<!-- source: src/lib/about/samples.ts:144 -->

### [src/lib/about/samples.ts:144](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/about/samples.ts#L144)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 1日の区切り（22時）より前に置く。後ろだと翌日扱いになり、横バーの端で点が切れる。
```

<!-- source: src/lib/about/samples.ts:154 -->

### [src/lib/about/samples.ts:154](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/about/samples.ts#L154)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
 * 今日から1年ぶんの気分。日付が今日基準なので、描画はクライアントだけで行うこと
 * （プリレンダ時の日付と食い違わないように）。
 */
```

<!-- source: src/lib/about/samples.ts:180 -->

### [src/lib/about/samples.ts:180](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/about/samples.ts#L180)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 書かない日もある。空白があるほうが本物らしい。
```

<!-- source: src/lib/about/samples.ts:182 -->

### [src/lib/about/samples.ts:182](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/about/samples.ts#L182)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// ゆるい波（季節）と、日ごとのゆらぎ。
```

<!-- source: src/lib/about/samples.ts:207 -->

### [src/lib/about/samples.ts:207](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/about/samples.ts#L207)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 読んだ人からの絵文字。数は出さない（数を追わせない見せ方に合わせる）。 */
```

<!-- source: src/lib/about/samples.ts:211 -->

### [src/lib/about/samples.ts:211](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/about/samples.ts#L211)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** /about で「Nagi でのやりとり」を一場面だけ見せる。 */
```

<!-- source: src/lib/about/samples.ts:238 -->

### [src/lib/about/samples.ts:238](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/about/samples.ts#L238)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 押して試せる絵文字。数は出さない。 */
```

<!-- source: src/lib/about/samples.ts:242 -->

### [src/lib/about/samples.ts:242](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/about/samples.ts#L242)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** ランディングの「ゆるくつながる」で、絵文字を押して試してもらう投稿（架空のユーザー）。 */
```

## src/lib/actions/portal.ts

<!-- source: src/lib/actions/portal.ts:1 -->

### [src/lib/actions/portal.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/actions/portal.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
 * モーダル、ポップオーバー、候補一覧などを document.body 直下へ移す。
 * overflow や mask を持つカルーセル／カードの子孫に浮遊UIを残さないための共通入口。
 */
```

## src/lib/components/ActionMenu.svelte

<!-- source: src/lib/components/ActionMenu.svelte:175 -->

### [src/lib/components/ActionMenu.svelte:175](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ActionMenu.svelte#L175)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 右寄せの自分の吹き出しでも、メニューを画面外へ押し出さない。 */
```

## src/lib/components/BirthdayBalloons.svelte

<!-- source: src/lib/components/BirthdayBalloons.svelte:2 -->

### [src/lib/components/BirthdayBalloons.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/BirthdayBalloons.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 配置は固定し、開くたびに画面全体へ均等に出るようにする。 */
```

## src/lib/components/Bubbles.svelte

<!-- source: src/lib/components/Bubbles.svelte:2 -->

### [src/lib/components/Bubbles.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Bubbles.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 水面から上がってくる泡（/about のヒーロー、参加の締め）。位置は面に対する割合で、
	 * 文字の上にかからない場所に置く。wide は2列のときだけ出す泡（1列に積むと文字の裏に入る位置）。
	 */
```

## src/lib/components/Button.svelte

<!-- source: src/lib/components/Button.svelte:2 -->

### [src/lib/components/Button.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Button.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 文字付きの操作ボタン。アプリ中の「押すもの」の見た目はここにだけ持つ。
	 *
	 * - primary: その画面でいちばん進めたい操作。1画面に1つを目安にする。
	 * - secondary: 並ぶ控えの操作（キャンセル・閉じる・もっと見る など）。
	 * - ghost: 文中や密な場所の軽い操作。枠を持たない。
	 * - danger: 取り消せない削除などの確定。
	 *
	 * href を渡すとリンク（a）として描く。ボタン風のリンクも同じ見た目にするため。
	 * アイコンだけのボタン・タブ・メニュー項目・トグルは形が違うので、ここでは扱わない。
	 */
```

<!-- source: src/lib/components/Button.svelte:21 -->

### [src/lib/components/Button.svelte:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Button.svelte#L21)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 親の幅いっぱいに広げる。 */
```

## src/lib/components/Confetti.svelte

<!-- source: src/lib/components/Confetti.svelte:10 -->

### [src/lib/components/Confetti.svelte:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Confetti.svelte#L10)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** AAR と100%コンプだけ、画面下の複数地点から全画面へ飛ばす。 */
```

<!-- source: src/lib/components/Confetti.svelte:24 -->

### [src/lib/components/Confetti.svelte:24](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Confetti.svelte#L24)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- 1地点から横へ引き伸ばさず、左右と中央の3つの噴射口で画面全体を自然に覆う。 -->
```

## src/lib/components/DemoReactionButton.svelte

<!-- source: src/lib/components/DemoReactionButton.svelte:2 -->

### [src/lib/components/DemoReactionButton.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/DemoReactionButton.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 紹介用の見本に置く、押せる絵文字。押すと本物のリアクションと同じ演出
	 * （でか絵文字＋花火）だけを出す。記録はどこにも書かない（API も PDS も呼ばない）。
	 * 押した見た目は手元でだけ切り替わり、ページを離れれば消える。
	 */
```

<!-- source: src/lib/components/DemoReactionButton.svelte:32 -->

### [src/lib/components/DemoReactionButton.svelte:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/DemoReactionButton.svelte#L32)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 外すときは演出を出さない。本物の ReactionBar と同じふるまい。
```

## src/lib/components/DraftListDialog.svelte

<!-- source: src/lib/components/DraftListDialog.svelte:23 -->

### [src/lib/components/DraftListDialog.svelte:23](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/DraftListDialog.svelte#L23)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// サムネイル用の object URL はこのダイアログが所有する（Composer 側の
	// previewUrl とは別物なので、閉じるときにここで解放する）。
```

<!-- source: src/lib/components/DraftListDialog.svelte:128 -->

### [src/lib/components/DraftListDialog.svelte:128](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/DraftListDialog.svelte#L128)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- 1回目はゴミ箱、押すと「削除する？」に変わって2回目で消す。確認中だけ危険の色にする。 -->
```

## src/lib/components/GuestHero.svelte

<!-- source: src/lib/components/GuestHero.svelte:3 -->

### [src/lib/components/GuestHero.svelte:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/GuestHero.svelte#L3)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 未ログインの人に見せる紹介。フィードの冒頭と、ブログ・ニュースの個別記事の上に同じ形で置き、
	 * 「Nagiのことを知る」と「参加する」への導線を持つ。
	 * 特徴を言葉で並べるより、投稿 → botたんの返信 → 絵文字 の流れを一度見せるほうが伝わるので、
	 * 中身は動くやりとりの見本にする。キャッチコピーと3本柱はランディング（`/`）と揃え、
	 * ここでは1行ずつに縮める。
	 */
```

<!-- source: src/lib/components/GuestHero.svelte:23 -->

### [src/lib/components/GuestHero.svelte:23](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/GuestHero.svelte#L23)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- 置き先のページはどれも自前の h1（フィード見出し・記事タイトル）を持つので h2 にする。 -->
```

<!-- source: src/lib/components/GuestHero.svelte:46 -->

### [src/lib/components/GuestHero.svelte:46](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/GuestHero.svelte#L46)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ハイドレーションより前にも適用し、事前生成HTMLのちらつきを防ぐ。 */
```

## src/lib/components/HandleInput.svelte

<!-- source: src/lib/components/HandleInput.svelte:8 -->

### [src/lib/components/HandleInput.svelte:8](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/HandleInput.svelte#L8)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// サジェスト付きの単一行 handle 入力。ログイン画面用。候補はメンション入力と
	// 同じ ActorSuggestionList で描画するので見た目・a11y が揃う。検索元は Nagi
	// 非依存の公開 Bsky AppView（searchActorsTypeahead）。
```

<!-- source: src/lib/components/HandleInput.svelte:24 -->

### [src/lib/components/HandleInput.svelte:24](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/HandleInput.svelte#L24)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 候補非表示中に Enter を押したとき（フォーム送信）。 */
```

<!-- source: src/lib/components/HandleInput.svelte:37 -->

### [src/lib/components/HandleInput.svelte:37](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/HandleInput.svelte#L37)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 入力前・確定後にドロップダウン（スケルトンや「候補なし」を含む）を出さないための開閉。
```

<!-- source: src/lib/components/HandleInput.svelte:63 -->

### [src/lib/components/HandleInput.svelte:63](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/HandleInput.svelte#L63)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 候補が出ていない状態の Enter は素直にフォーム送信。
			// IME 変換確定中（isComposing）は誤爆させない。
```

<!-- source: src/lib/components/HandleInput.svelte:71 -->

### [src/lib/components/HandleInput.svelte:71](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/HandleInput.svelte#L71)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 応答待ちの絞り込みで候補が減ると activeIndex が末尾を追い越すことがある。
```

<!-- source: src/lib/components/HandleInput.svelte:109 -->

### [src/lib/components/HandleInput.svelte:109](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/HandleInput.svelte#L109)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 親のフォームレイアウト（例: .auth-card label のグリッド）で幅いっぱいに広げる。 */
```

## src/lib/components/JoinFinale.svelte

<!-- source: src/lib/components/JoinFinale.svelte:2 -->

### [src/lib/components/JoinFinale.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/JoinFinale.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 参加の締め（「はじめてみませんか」）。/about とランディングの末尾で同じものを使う。
	 * 泡の面に botたんを置き、「Nagiをはじめる」に触れると喜び、押すと一度跳ねてから登録へ進む。
	 * 愛着を持ってもらう最初の一歩。待たせすぎると「もたついた」になるので遷移は 0.5 秒だけ遅らせ、
	 * 新しいタブで開く操作と演出を切っている人はすぐ進める。
	 *
	 * 2つ目のリンクだけ置き場所で変える（/about はログイン、ランディングは /about）。
	 * サインイン前にだけ意味があるので、出し分けは呼び出し側が持つ。
	 */
```

<!-- source: src/lib/components/JoinFinale.svelte:21 -->

### [src/lib/components/JoinFinale.svelte:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/JoinFinale.svelte#L21)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 中央の botたんの左右に置く。
```

<!-- source: src/lib/components/JoinFinale.svelte:47 -->

### [src/lib/components/JoinFinale.svelte:47](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/JoinFinale.svelte#L47)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// ブラウザの「戻る」でキャッシュから戻ったときは、座った姿からやり直す。
```

<!-- source: src/lib/components/JoinFinale.svelte:61 -->

### [src/lib/components/JoinFinale.svelte:61](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/JoinFinale.svelte#L61)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- 2枚とも読み込んでおき、重ねて切り替える。喜ぶ瞬間に画像の読み込みを待たせない。 -->
```

## src/lib/components/KossoriReactionBubble.svelte

<!-- source: src/lib/components/KossoriReactionBubble.svelte:19 -->

### [src/lib/components/KossoriReactionBubble.svelte:19](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/KossoriReactionBubble.svelte#L19)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// AppView→クライアントの順でデプロイする間、旧レスポンスには emoji が無い。
	// その短い期間は従来どおり案内文だけを出し、空のリアクション枠にはしない。
```

## src/lib/components/MomentSample.svelte

<!-- source: src/lib/components/MomentSample.svelte:2 -->

### [src/lib/components/MomentSample.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/MomentSample.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * Nagi でのやりとりを一場面だけ見せる見本（架空のユーザー）。
	 * 投稿 → botたんの返信 → 読んだ人からの絵文字、の流れで体験のイメージを伝える。
	 * 実物の ChatBubble はセッションやリアクション操作に依存するので、見た目だけ似せた静的な描画にする。
	 *
	 * 画面に入ったら、その流れをフィードと同じ動き（吹き出しがアバターから生える →
	 * 入力中 → 返信 → 絵文字のスタンプ）で一度だけ再生する。順番は CSS の animation-delay で作り、
	 * ここでは見えた時点で一時停止を解くだけにする。演出を切っている人や JS が動かない環境では、
	 * 最後の状態が静止して見える。
	 *
	 * 再生のあとは絵文字を押せる。押すと本物と同じでか絵文字＋花火が出るが、見た目だけで
	 * どこにも記録しない（DemoReactionButton）。
	 */
```

<!-- source: src/lib/components/MomentSample.svelte:40 -->

### [src/lib/components/MomentSample.svelte:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/MomentSample.svelte#L40)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// ReactionStamp と同じ12方向の火花。
```

<!-- source: src/lib/components/MomentSample.svelte:80 -->

### [src/lib/components/MomentSample.svelte:80](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/MomentSample.svelte#L80)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- 入力中と返信を同じ升に重ねる。升の高さは返信が決めるので、入れ替わっても下が動かない。 -->
```

## src/lib/components/PageHeader.svelte

<!-- source: src/lib/components/PageHeader.svelte:2 -->

### [src/lib/components/PageHeader.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PageHeader.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * ページの見出し。どのページも「タイトル（h1）→ 説明 → 本文」の同じ形で始める。
	 * 右に置く操作（「ニュースを追加」「今日の一枚」など）は actions に渡す。
	 * 見た目は base.css の .page-header にだけ持つ。
	 */
```

<!-- source: src/lib/components/PageHeader.svelte:18 -->

### [src/lib/components/PageHeader.svelte:18](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PageHeader.svelte#L18)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 見出しの読み上げを、表示と変えたいときだけ渡す。 */
```

<!-- source: src/lib/components/PageHeader.svelte:21 -->

### [src/lib/components/PageHeader.svelte:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PageHeader.svelte#L21)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 見出しの上に添える小さな文脈（例: 「スレッド」）。 */
```

## src/lib/components/PostDeleteDialog.svelte

<!-- source: src/lib/components/PostDeleteDialog.svelte:16 -->

### [src/lib/components/PostDeleteDialog.svelte:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PostDeleteDialog.svelte#L16)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 投稿以外（ニュースなど）を消すときの見出しと説明。省略時は投稿用の文言。 */
```

## src/lib/components/SegmentedControl.svelte

<!-- source: src/lib/components/SegmentedControl.svelte:2 -->

### [src/lib/components/SegmentedControl.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/SegmentedControl.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 少数の選択肢から1つを選ぶ切り替え（例: システム設定 / ライト / ダーク）。
	 * 中身はラジオボタンなので、矢印キーでの移動と読み上げはブラウザに任せる。
	 */
```

## src/lib/components/SettingRow.svelte

<!-- source: src/lib/components/SettingRow.svelte:2 -->

### [src/lib/components/SettingRow.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/SettingRow.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 設定の1行。左に項目名と説明、右に操作（トグル・切り替え・セレクトなど）を置く。
	 * 配色の見本のように幅が要る中身は children に渡すと、項目名の下に全幅で並ぶ。
	 * control には項目名と説明の id を渡すので、操作の aria-labelledby / aria-describedby に使う。
	 */
```

## src/lib/components/SettingsPage.svelte

<!-- source: src/lib/components/SettingsPage.svelte:2 -->

### [src/lib/components/SettingsPage.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/SettingsPage.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 設定の各ページの枠。設定トップと同じ列幅で、見出しと「設定に戻る」を揃える。
	 * 中身は SettingsSection（面）と SettingRow（行）で組む。
	 */
```

<!-- source: src/lib/components/SettingsPage.svelte:20 -->

### [src/lib/components/SettingsPage.svelte:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/SettingsPage.svelte#L20)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 戻り先を設定トップ以外にしたいとき（例: フィードから来たタブ設定）。null で出さない。 */
```

## src/lib/components/SettingsSection.svelte

<!-- source: src/lib/components/SettingsSection.svelte:2 -->

### [src/lib/components/SettingsSection.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/SettingsSection.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 設定ページの中の1まとまり。見出しの下に1枚の面を置き、行（SettingRow）を細い線で区切って並べる。
	 * plain を付けると面を持たない（一覧や見本など、自前の見た目を持つ中身のため）。
	 * level={3} は plain なセクションの中に置く小分け。見出しが h3 になり、控えめな見た目になる。
	 */
```

## src/lib/components/Spinner.svelte

<!-- source: src/lib/components/Spinner.svelte:16 -->

### [src/lib/components/Spinner.svelte:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/Spinner.svelte#L16)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 既定値を props に置くと初期化時の言語で固定されるため、描画時に解決して言語切替へ追従させる。
```

## src/lib/components/SuggestionList.svelte

<!-- source: src/lib/components/SuggestionList.svelte:6 -->

### [src/lib/components/SuggestionList.svelte:6](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/SuggestionList.svelte#L6)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 候補ドロップダウンの器。listbox の a11y・アクティブ行・確定操作をここに集約し、
	// 行の中身だけを呼び出し側の snippet に任せる（@メンション・#タグ・:絵文字で共通）。
	// 検索中はスケルトンを出す: 結果0件と「まだ探している」が同じ見た目だと、
	// 遅いのか該当が無いのか分からない。
```

## src/lib/components/ToggleSwitch.svelte

<!-- source: src/lib/components/ToggleSwitch.svelte:11 -->

### [src/lib/components/ToggleSwitch.svelte:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ToggleSwitch.svelte#L11)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 見える項目名。設定の行（SettingRow）では行の項目名を labelledby で指して省く。 */
```

<!-- source: src/lib/components/ToggleSwitch.svelte:36 -->

### [src/lib/components/ToggleSwitch.svelte:36](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ToggleSwitch.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 設定行の慣習に合わせ、ラベルを左・スイッチを右端に置く。 */
```

## src/lib/components/interaction-motion.test.ts

<!-- source: src/lib/components/interaction-motion.test.ts:75 -->

### [src/lib/components/interaction-motion.test.ts:75](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/interaction-motion.test.ts#L75)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 判定は非同期なので、投稿直後に結果は出ない。ポーリングで追いかけるのはやめ、
	// 次に開いたときの墓標だけで「削除された」と「保存を拒否された」を区別する。
```

<!-- source: src/lib/components/interaction-motion.test.ts:85 -->

### [src/lib/components/interaction-motion.test.ts:85](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/interaction-motion.test.ts#L85)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 「投稿の正本はあなたのPDSに残っています」は投稿者本人にしか成り立たない。
	// スレッド内の他人の返信や引用先で出ると、事実と違う案内になる。
```

## src/lib/components/landing/Landing.svelte

<!-- source: src/lib/components/landing/Landing.svelte:2 -->

### [src/lib/components/landing/Landing.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/landing/Landing.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 未サインインの TOP（`/`）。アプリの殻（左ナビ・右レール・投稿ボタン）は外し、
	 * 体験と「ふつうのSNSとの違い」を上から順に伝える。
	 *
	 * 構成は「ヒーロー → 循環の輪 → 3本柱 → いまのNagi（実投稿） → 締め」。
	 * 3本柱は「書く → つながる → 振り返る → また書きたくなる」と巡るので、輪で全体を見せてから
	 * 番号付きで1本ずつ見せ、最後に1へ戻る導線で輪を閉じる。
	 * 違いは比較表にせず、柱ごとに「ふつうのSNSなら」を薄い1行で添え、見出しで Nagi の場合を言い、
	 * すぐ横の実物（やりとり・絵文字・グラフ）で見せる。説明は1文に抑える。
	 * 参加の導線はヒーローと締めの2か所。タイムラインそのものは `/feed` にある。
	 *
	 * プリレンダHTMLにはこのページが入る（検索エンジンと初回訪問者向け）。サインイン済みの人には
	 * 一瞬も見せたくないので、認証確認中は html[data-oauth-pending] で隠してスピナーにする。
	 */
```

<!-- source: src/lib/components/landing/Landing.svelte:29 -->

### [src/lib/components/landing/Landing.svelte:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/landing/Landing.svelte#L29)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// m.* はロケールを読むアクセサ。関数のまま持ち、テンプレートで呼んで言語切り替えに追従させる。
```

<!-- source: src/lib/components/landing/Landing.svelte:61 -->

### [src/lib/components/landing/Landing.svelte:61](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/landing/Landing.svelte#L61)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 感情グラフは「今日までの1年」を描くので、日付がビルド時とずれないようクライアントでだけ組む。
```

<!-- source: src/lib/components/landing/Landing.svelte:101 -->

### [src/lib/components/landing/Landing.svelte:101](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/landing/Landing.svelte#L101)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- 3本柱は循環している（書く → つながる → 振り返る → また書く）。先に輪で全体を見せ、
	     各柱は番号付きで「文 ⇔ 実物」を左右交互に並べる。最後に1へ戻る導線を置いて輪を閉じる。 -->
```

<!-- source: src/lib/components/landing/Landing.svelte:138 -->

### [src/lib/components/landing/Landing.svelte:138](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/landing/Landing.svelte#L138)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- プリレンダ時は日付が決まらないので、高さだけ確保してガタつきを抑える。 -->
```

## src/lib/components/landing/LandingCycle.svelte

<!-- source: src/lib/components/landing/LandingCycle.svelte:2 -->

### [src/lib/components/landing/LandingCycle.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/landing/LandingCycle.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 3本柱が「書く → つながる → 振り返る → また書く」と循環していることを見せる輪。
	 * 輪の上の3点は下の各柱へのリンクで、中央に「また書きたくなる」を置く。
	 * 矢印は時計回りの円弧で、点の手前で切って重ならないようにする。装飾なので読み上げからは外し、
	 * 意味はリンクの並び（1 → 2 → 3）と中央の文で伝える。
	 *
	 * 普段は落ち着いた無彩色にしておき、カーソルを当てた（フォーカスした）点と、そこから次へ
	 * 向かう矢印だけをじわっとアクセント色にする。「振り返る」では「書く」へ戻る矢印と中央の文も
	 * 灯り、輪が閉じることを見せる。矢印の先端は marker だと色の遷移に乗らないので、
	 * 弧と同じグループに自前の山形を描き、グループの色ごと切り替える。
	 */
```

<!-- source: src/lib/components/landing/LandingCycle.svelte:19 -->

### [src/lib/components/landing/LandingCycle.svelte:19](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/landing/LandingCycle.svelte#L19)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 点の手前で弧を切る角度。点の円（半径 32px 相当）にかからない程度。 */
```

<!-- source: src/lib/components/landing/LandingCycle.svelte:40 -->

### [src/lib/components/landing/LandingCycle.svelte:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/landing/LandingCycle.svelte#L40)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 時計回りの接線方向（角度 + 90°）へ向けた山形を、弧の終点に置く。
```

## src/lib/components/landing/LandingLivePosts.svelte

<!-- source: src/lib/components/landing/LandingLivePosts.svelte:2 -->

### [src/lib/components/landing/LandingLivePosts.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/landing/LandingLivePosts.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * ランディングの「いまのNagi」。公開タイムラインの実投稿を数件だけ、読むための形で並べる。
	 * 選び方は showcase-posts.ts（伏せる必要のある投稿は出さない）。
	 *
	 * 実物の ThreadUnit はリアクション・返信・メニューなどサインイン前提の操作を持つので、
	 * ここでは本文・画像・botたんの返信・絵文字だけを描く。絵文字は押せるが演出だけで、
	 * どこにも記録しない（DemoReactionButton）。届いた絵文字の数は出さない。
	 *
	 * 中身は今この瞬間のタイムラインなので、プリレンダには含めずクライアントで取る。
	 * 取れるまでは高さだけ確保して、下のブロックがガタつかないようにする。
	 */
```

<!-- source: src/lib/components/landing/LandingLivePosts.svelte:27 -->

### [src/lib/components/landing/LandingLivePosts.svelte:27](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/landing/LandingLivePosts.svelte#L27)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 広い画面は2列なので、偶数件にそろえて右下を空けない（4件か2件。1件しかなければ1件）。 */
```

## src/lib/components/landing/LandingReactionSample.svelte

<!-- source: src/lib/components/landing/LandingReactionSample.svelte:2 -->

### [src/lib/components/landing/LandingReactionSample.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/landing/LandingReactionSample.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 「ゆるくつながる」の見本。架空のユーザーの投稿1件に、押せる絵文字を並べる。
	 * 押すと本物と同じでか絵文字＋花火が出るが、どこにも記録しない（DemoReactionButton）。
	 * 数は出さない。いいね数の代わりに「絵文字が届く」ことを、触って分かってもらう。
	 */
```

## src/lib/components/shell/Icon.svelte

<!-- source: src/lib/components/shell/Icon.svelte:60 -->

### [src/lib/components/shell/Icon.svelte:60](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/Icon.svelte#L60)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 重ねた札。ゼンカツ（全肯定カード）の入口に使う。
```

<!-- source: src/lib/components/shell/Icon.svelte:73 -->

### [src/lib/components/shell/Icon.svelte:73](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/Icon.svelte#L73)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 画像の枠に再生ボタン。画像と動画のどちらも選べる追加ボタンに使う。
```

<!-- source: src/lib/components/shell/Icon.svelte:81 -->

### [src/lib/components/shell/Icon.svelte:81](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/Icon.svelte#L81)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- botたん・Nagi は線画PNGなので、透過をマスクに使って他のアイコンと同じ currentColor で塗る -->
```

## src/lib/components/shell/NavBadge.svelte

<!-- source: src/lib/components/shell/NavBadge.svelte:3 -->

### [src/lib/components/shell/NavBadge.svelte:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/NavBadge.svelte#L3)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// ストアは props として受ける（ローカル変数に取り出すと初期値しか捕まえられない）。
```

## src/lib/components/shell/PostButton.svelte

<!-- source: src/lib/components/shell/PostButton.svelte:6 -->

### [src/lib/components/shell/PostButton.svelte:6](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/PostButton.svelte#L6)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 左サイドバー内の投稿ボタン（PC・タブレット）。
	 *
	 * 浮かせず列の中に置く。position: fixed で外から重ねると、サイドバーの幅・余白を
	 * 数値で推測することになり、アカウントカードと幅も間隔も揃わなかった。
	 * スマホはサイドバーごと消えるので、そちらは PostFab（浮かぶ＋ボタン）が担当する。
	 */
```

<!-- source: src/lib/components/shell/PostButton.svelte:22 -->

### [src/lib/components/shell/PostButton.svelte:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/PostButton.svelte#L22)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 色・形・ホバーは Button に任せ、ここではサイドバーの中での置き方だけを持つ。 */
```

<!-- source: src/lib/components/shell/PostButton.svelte:24 -->

### [src/lib/components/shell/PostButton.svelte:24](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/PostButton.svelte#L24)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* アカウントカード（.account-card）と同じ左右マージンで縦を揃える。 */
```

<!-- source: src/lib/components/shell/PostButton.svelte:28 -->

### [src/lib/components/shell/PostButton.svelte:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/PostButton.svelte#L28)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- tablet: アイコンレールになるのでラベルを畳んで丸にする --- */
```

## src/lib/components/shell/SidebarBotFeature.svelte

<!-- source: src/lib/components/shell/SidebarBotFeature.svelte:14 -->

### [src/lib/components/shell/SidebarBotFeature.svelte:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/SidebarBotFeature.svelte#L14)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 右サイドバーの botたん枠。botたんラジオと botたんニュースのうち新しい方を1つだけ出す。
	 * ラジオはレイアウトが取得済み（サインイン時のみ）なので、ここではニュースだけ取る。
	 */
```

<!-- source: src/lib/components/shell/SidebarBotFeature.svelte:19 -->

### [src/lib/components/shell/SidebarBotFeature.svelte:19](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/SidebarBotFeature.svelte#L19)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 右サイドバーは 1180px 未満で CSS により消える（shell.css）。見えない幅では取得しない。
```

<!-- source: src/lib/components/shell/SidebarBotFeature.svelte:21 -->

### [src/lib/components/shell/SidebarBotFeature.svelte:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/SidebarBotFeature.svelte#L21)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// ニュースは1日最大4回の公開なので、頻繁に取り直す必要はない。
```

<!-- source: src/lib/components/shell/SidebarBotFeature.svelte:35 -->

### [src/lib/components/shell/SidebarBotFeature.svelte:35](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/SidebarBotFeature.svelte#L35)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 既読は進めない（ここで進めると /news の未読が見ないうちに消える）。順位づけにだけ使う。
```

<!-- source: src/lib/components/shell/SidebarBotFeature.svelte:38 -->

### [src/lib/components/shell/SidebarBotFeature.svelte:38](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/SidebarBotFeature.svelte#L38)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 取れなかったときはラジオだけ（あれば）出す。次のポーリングで取り直す。
```

<!-- source: src/lib/components/shell/SidebarBotFeature.svelte:42 -->

### [src/lib/components/shell/SidebarBotFeature.svelte:42](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/SidebarBotFeature.svelte#L42)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// アカウント・言語が変わったら取り直す。
```

<!-- source: src/lib/components/shell/SidebarBotFeature.svelte:64 -->

### [src/lib/components/shell/SidebarBotFeature.svelte:64](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/SidebarBotFeature.svelte#L64)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 新しい方。同時刻ならラジオ（サインイン中だけ届く、本人向けの枠なので優先する）。 */
```

## src/lib/components/shell/SidebarRight.svelte

<!-- source: src/lib/components/shell/SidebarRight.svelte:7 -->

### [src/lib/components/shell/SidebarRight.svelte:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/SidebarRight.svelte#L7)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- 右サイドバーは 1100px 未満で消える。検索ボックスはそのため PC 専用
     （スマホから使えないのは許容した判断）。 -->
```

## src/lib/components/shell/SidebarSearch.svelte

<!-- source: src/lib/components/shell/SidebarSearch.svelte:7 -->

### [src/lib/components/shell/SidebarSearch.svelte:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/SidebarSearch.svelte#L7)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 右サイドバー上端の検索ボックス。結果は全部 /search に見せるので、ここは入口だけ持つ
	// （サジェストは出さない）。右サイドバーは shell.css の 1179px 以下で display:none に
	// なるため、PC 幅でのみ現れる。
```

<!-- source: src/lib/components/shell/SidebarSearch.svelte:11 -->

### [src/lib/components/shell/SidebarSearch.svelte:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/SidebarSearch.svelte#L11)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// /search に居るときは検索した言葉を残す。別ページへ移ったら消える。
	// prerender 中は url.searchParams を読めない（このコンポーネントはレイアウト＝全ページに乗る）
	// ので、参照は $effect の中だけに置く。エフェクトはブラウザでしか走らない。
```

<!-- source: src/lib/components/shell/SidebarSearch.svelte:27 -->

### [src/lib/components/shell/SidebarSearch.svelte:27](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/SidebarSearch.svelte#L27)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// IME 変換確定の Enter で送信しない。確定後の Enter は form の submit に任せる。
```

## src/lib/components/shell/nav.ts

<!-- source: src/lib/components/shell/nav.ts:10 -->

### [src/lib/components/shell/nav.ts:10](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
 * ナビ項目に重ねる未読表示。ドットと数値バッジで真実源が違う（既読ウォーターマーク /
 * サーバーの readAt）ので、「0 なら非表示」の件数1本に揃えて見た目だけ style で
 * 切り替える。描画は NavBadge.svelte に集約。
 */
```

<!-- source: src/lib/components/shell/nav.ts:16 -->

### [src/lib/components/shell/nav.ts:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 0 なら非表示。dot は 1 以上で点灯するだけで数は出さない。 */
```

<!-- source: src/lib/components/shell/nav.ts:26 -->

### [src/lib/components/shell/nav.ts:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** badge とは別の知らせを、アイコンの点で重ねたいとき（カードの未ドロー）。 */
```

<!-- source: src/lib/components/shell/nav.ts:29 -->

### [src/lib/components/shell/nav.ts:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L29)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 未読バッジの表示テキスト。3桁以上は "99+" に丸める。 */
```

<!-- source: src/lib/components/shell/nav.ts:31 -->

### [src/lib/components/shell/nav.ts:31](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L31)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// サインイン済みは TOP（`/`）がフィード。未サインインの TOP はランディングなので、
// フィードの項目は navHref で `/feed` に差し替える。my Nagi は廃止した。
```

<!-- source: src/lib/components/shell/nav.ts:35 -->

### [src/lib/components/shell/nav.ts:35](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L35)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** フィードの置き場所。未サインインの `/` はランディング。 */
```

<!-- source: src/lib/components/shell/nav.ts:37 -->

### [src/lib/components/shell/nav.ts:37](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L37)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** ナビ項目の実際のリンク先。フィードだけがサインイン状態で変わる。 */
```

<!-- source: src/lib/components/shell/nav.ts:52 -->

### [src/lib/components/shell/nav.ts:52](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L52)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// アクティビティ（日記 / 感情グラフ / 年表の3タブ）。URL は通知の ?date= と互換のため /diary のまま。
```

<!-- source: src/lib/components/shell/nav.ts:59 -->

### [src/lib/components/shell/nav.ts:59](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L59)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 全肯定カード（ニュース / カードリスト / ゼンカツ！の3タブ）。
```

<!-- source: src/lib/components/shell/nav.ts:72 -->

### [src/lib/components/shell/nav.ts:72](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L72)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// アドベントカレンダー。12/1〜1/7 だけメニューに出す（ページはいつでも開ける）。
```

<!-- source: src/lib/components/shell/nav.ts:79 -->

### [src/lib/components/shell/nav.ts:79](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L79)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 読み込んだ時点の暦で決める。メニューの出し入れは年2回なので、日をまたいだタブは再読込で追従する。 */
```

<!-- source: src/lib/components/shell/nav.ts:84 -->

### [src/lib/components/shell/nav.ts:84](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L84)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** PC の区切りも含めた表示順。グループを足せば区切り線も自動で増える。 */
```

<!-- source: src/lib/components/shell/nav.ts:92 -->

### [src/lib/components/shell/nav.ts:92](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L92)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** スマホで常に見せる、利用頻度の高い入口。 */
```

<!-- source: src/lib/components/shell/nav.ts:95 -->

### [src/lib/components/shell/nav.ts:95](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L95)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** スマホのボトムシート。将来の項目追加はこの配列へ集約する。 */
```

<!-- source: src/lib/components/shell/nav.ts:102 -->

### [src/lib/components/shell/nav.ts:102](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L102)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** カード未プレイ・未ドロー・年表更新・アドカレのいずれかで、スマホのメニューに1つの点を出す。 */
```

<!-- source: src/lib/components/shell/nav.ts:107 -->

### [src/lib/components/shell/nav.ts:107](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L107)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** `/feed`（未サインインのフィード）と旧フィード URL（`/global` `/affirmation` は互換ルート）もフィード扱い。 */
```

<!-- source: src/lib/components/shell/nav.ts:109 -->

### [src/lib/components/shell/nav.ts:109](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L109)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
 * フィード（`/`）は完全一致か旧フィード URL のときだけ。前方一致にすると全ページで active になってしまう。
 */
```

<!-- source: src/lib/components/shell/nav.ts:118 -->

### [src/lib/components/shell/nav.ts:118](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L118)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
 * いま開いているページのナビ項目をもう一度押したときの「開き直して」の合図。
 * SvelteKit は同一 URL への遷移を捨てるので、これが無いと最新を取り直す導線が
 * デスクトップに一つも無くなる。X / Instagram / Threads
 * と同じ「アクティブなタブ再タップ＝先頭へ戻って再取得」に揃える。
 * 購読するのは再取得を持っているページだけでよく、それ以外は先頭スクロールだけになる。
 */
```

<!-- source: src/lib/components/shell/nav.ts:127 -->

### [src/lib/components/shell/nav.ts:127](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L127)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** ナビ項目のクリック。アクティブなら遷移を止めて、先頭スクロール＋再取得へ回す。 */
```

<!-- source: src/lib/components/shell/nav.ts:129 -->

### [src/lib/components/shell/nav.ts:129](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/shell/nav.ts#L129)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 修飾キー付き（新しいタブで開く等）はブラウザに任せる。
```

## src/lib/components/suggestion-list.test.ts

<!-- source: src/lib/components/suggestion-list.test.ts:1 -->

### [src/lib/components/suggestion-list.test.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/suggestion-list.test.ts#L1)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 静的ソース検査は Vitest の Node 環境で実行する。
```

## src/lib/components/textarea-caret.ts

<!-- source: src/lib/components/textarea-caret.ts:1 -->

### [src/lib/components/textarea-caret.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/textarea-caret.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** textarea と同じ折り返しをする不可視ミラーから、キャレットの画面座標を得る。 */
```

## src/lib/dnd/ghost.ts

<!-- source: src/lib/dnd/ghost.ts:1 -->

### [src/lib/dnd/ghost.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/ghost.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
 * ドラッグ中に指（ポインタ）へ追従する半透明のコピーを作る。
 * 元のタイル／行は grid や flex のレイアウトに縛られているので動かせない。body 直下に
 * position: fixed のクローンを置いて、そちらを動かす。
 *
 * 既知の制限: Lottie カスタム絵文字の <canvas> は cloneNode してもピクセルが
 * 複製されないため、ゴーストが空になる。静止画への差し替えは将来の改善余地。
 */
```

<!-- source: src/lib/dnd/ghost.ts:24 -->

### [src/lib/dnd/ghost.ts:24](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/ghost.ts#L24)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// クローンした中身がタブ順に混ざらないようにする。
```

## src/lib/dnd/sortable.svelte.ts

<!-- source: src/lib/dnd/sortable.svelte.ts:3 -->

### [src/lib/dnd/sortable.svelte.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
 * 並び替え（ドラッグ＆ドロップ）の共通実装。お気に入り絵文字・投稿画像・フィードのタブが
 * これを使う。以前はコンポーネントごとに同じコードを持っていて、同じ不具合も持っていた。
 *
 * 不具合の中身と、ここでの直し方:
 *
 * 1. ドラッグ中に勝手にドロップ扱いになる
 *    ポインタキャプチャを「掴んだ行そのもの」に張っていたのが原因。並べ替えると
 *    keyed each が DOM ノードを動かし、その拍子にキャプチャが外れて lostpointercapture が
 *    飛ぶ。それをドロップとして扱っていたので、指を離していないのに並び替えが終わっていた。
 *    → キャプチャは**並び替えで動かないコンテナ**に張る。終了は pointerup / pointercancel
 *      だけで判断し、lostpointercapture は無視する。
 *
 * 2. 掴み直しが要る
 *    キャプチャがコンテナにあるので、指が行の外へ出ても move は届き続ける。
 */
```

<!-- source: src/lib/dnd/sortable.svelte.ts:22 -->

### [src/lib/dnd/sortable.svelte.ts:22](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 現在の並び。常に最新を返すこと。 */
```

<!-- source: src/lib/dnd/sortable.svelte.ts:24 -->

### [src/lib/dnd/sortable.svelte.ts:24](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L24)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 並べ替えの反映。呼び出し側が items を差し替え、必要なら保存する。 */
```

<!-- source: src/lib/dnd/sortable.svelte.ts:26 -->

### [src/lib/dnd/sortable.svelte.ts:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** ゴーストに付けるクラス名。見た目は呼び出し側の CSS が持つ。 */
```

<!-- source: src/lib/dnd/sortable.svelte.ts:28 -->

### [src/lib/dnd/sortable.svelte.ts:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L28)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * ドラッグ開始と見なす移動量(px)。同じ場所でタップも受ける UI（絵文字タイル）は
	 * これを効かせ、専用ハンドルがある UI は 0 でよい。
	 */
```

<!-- source: src/lib/dnd/sortable.svelte.ts:33 -->

### [src/lib/dnd/sortable.svelte.ts:33](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L33)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 指定すると、このセレクタに一致する要素からしかドラッグを始めない。 */
```

<!-- source: src/lib/dnd/sortable.svelte.ts:35 -->

### [src/lib/dnd/sortable.svelte.ts:35](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L35)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** しきい値未満で離したとき＝タップ。 */
```

<!-- source: src/lib/dnd/sortable.svelte.ts:37 -->

### [src/lib/dnd/sortable.svelte.ts:37](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L37)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 移動後の読み上げ文（1始まりの位置）。 */
```

<!-- source: src/lib/dnd/sortable.svelte.ts:42 -->

### [src/lib/dnd/sortable.svelte.ts:42](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L42)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 行／タイルに必ず付ける属性。コンテナから掴んだ要素を引くのに使う。 */
```

<!-- source: src/lib/dnd/sortable.svelte.ts:104 -->

### [src/lib/dnd/sortable.svelte.ts:104](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L104)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// タイル内のボタン（削除など）はドラッグにもタップ選択にも巻き込まない。
```

<!-- source: src/lib/dnd/sortable.svelte.ts:113 -->

### [src/lib/dnd/sortable.svelte.ts:113](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L113)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// キャプチャはコンテナに張る。行に張ると、並べ替えで DOM が動いた拍子に外れる。
```

<!-- source: src/lib/dnd/sortable.svelte.ts:115 -->

### [src/lib/dnd/sortable.svelte.ts:115](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L115)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// しきい値なし（専用ハンドル）ならその場で開始する。
```

<!-- source: src/lib/dnd/sortable.svelte.ts:132 -->

### [src/lib/dnd/sortable.svelte.ts:132](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L132)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// ゴーストは pointer-events: none なので、下にある行が取れる。
```

<!-- source: src/lib/dnd/sortable.svelte.ts:147 -->

### [src/lib/dnd/sortable.svelte.ts:147](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L147)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// しきい値まで動かなかった＝タップ。
```

<!-- source: src/lib/dnd/sortable.svelte.ts:170 -->

### [src/lib/dnd/sortable.svelte.ts:170](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L170)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** ドラッグ中に、その行を「落とす先」として光らせるか。 */
```

<!-- source: src/lib/dnd/sortable.svelte.ts:174 -->

### [src/lib/dnd/sortable.svelte.ts:174](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L174)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
		 * コンテナに付ける action。ここでポインタ操作をすべて受ける。
		 * `use:sortable.container` のように使う。
		 */
```

<!-- source: src/lib/dnd/sortable.svelte.ts:195 -->

### [src/lib/dnd/sortable.svelte.ts:195](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L195)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
		 * 矢印キーでの並び替え。動かせたら true（呼び出し側が preventDefault する）。
		 * ポインタを使わない人にはこちらが唯一の手段なので、全コンポーネントで同じ操作にする。
		 */
```

<!-- source: src/lib/dnd/sortable.svelte.ts:213 -->

### [src/lib/dnd/sortable.svelte.ts:213](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/dnd/sortable.svelte.ts#L213)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 並べ替えでフォーカスを失わないよう、動かした行の掴みどころへ戻す。 */
```

## src/lib/index.ts

<!-- source: src/lib/index.ts:1 -->

### [src/lib/index.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/index.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// place files you want to import through the `$lib` alias in this folder.
```

## src/lib/landing/showcase-posts.ts

<!-- source: src/lib/landing/showcase-posts.ts:4 -->

### [src/lib/landing/showcase-posts.ts:4](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/landing/showcase-posts.ts#L4)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
 * ランディングの「いまのNagi」に並べる実投稿を、公開TLの1ページから選ぶ。
 *
 * 初めて来た人がいきなり目にする場所なので、本文を伏せる必要のあるもの
 * （CW・ラベル・こっそり）と、文脈が分からないもの（返信・引用・ブログ）は外す。
 * 体験の見本としては「書く → botたんが受け止める → 絵文字が届く」が見えてほしいので、
 * botたんの返信が付いた投稿だけを候補にし、絵文字の種類が多いものを優先する（1人1件まで）。
 * 画像・動画は絵文字が集まりやすく、Nagi らしさが伝わるので候補に残す。
 *
 * セルフラベルは、表示設定で伏せる対象になるもの（NSFW）だけを外す。botたんの返信には
 * 必ず ai-generated が付くので、ラベルの有無だけで外すと1件も残らない。
 */
```

<!-- source: src/lib/landing/showcase-posts.ts:39 -->

### [src/lib/landing/showcase-posts.ts:39](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/landing/showcase-posts.ts#L39)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 会話グループ表示なら直下の bot 返信、そうでなければ botReply。 */
```

<!-- source: src/lib/landing/showcase-posts.ts:57 -->

### [src/lib/landing/showcase-posts.ts:57](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/landing/showcase-posts.ts#L57)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 数は画面に出さない。並べ替えにだけ使う。
```

<!-- source: src/lib/landing/showcase-posts.ts:60 -->

### [src/lib/landing/showcase-posts.ts:60](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/landing/showcase-posts.ts#L60)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 同じ人ばかり並ぶと「いまのNagi」に見えないので、1人1件にする。
```

## src/lib/layout/floating-menu.ts

<!-- source: src/lib/layout/floating-menu.ts:23 -->

### [src/lib/layout/floating-menu.ts:23](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/layout/floating-menu.ts#L23)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
 * body 直下へ portal した fixed メニューを、表示中のブラウザ領域へ収める。
 * visualViewport の offset も受け取れるので、モバイルの表示領域移動にも追従できる。
 */
```

## src/lib/layout/mobile-overflow.test.ts

<!-- source: src/lib/layout/mobile-overflow.test.ts:1 -->

### [src/lib/layout/mobile-overflow.test.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/layout/mobile-overflow.test.ts#L1)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 静的ソース検査は Vitest の Node 環境で実行する。
```

## src/lib/polling.ts

<!-- source: src/lib/polling.ts:1 -->

### [src/lib/polling.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/polling.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
 * タブが見えている間だけ走るポーリング。バックグラウンドのタブで無駄に叩かないための
 * visibility ガードと、復帰時に interval を待たない即時実行をここにまとめる。
 * 戻り値（解除関数）をそのまま onMount の cleanup に返して使う。
 */
```

<!-- source: src/lib/polling.ts:13 -->

### [src/lib/polling.ts:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/polling.ts#L13)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// タブ切り替えでは visibilitychange と focus の両方が発火するので、直近の実行から
	// 間もない再発火は捨てて1回にまとめる。
```

<!-- source: src/lib/polling.ts:26 -->

### [src/lib/polling.ts:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/polling.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 別アプリからの復帰では focus しか出ないことがあるため、両方を購読する。
```

## src/lib/utils/url.ts

<!-- source: src/lib/utils/url.ts:1 -->

### [src/lib/utils/url.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/utils/url.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
 * 与えられた URL / パスが Nagi アプリ内のページ（内部ページ）であるか判定する。
 * - 相対パス（例: '/profile/xxx'）
 * - 現在の origin (window.location.origin) または同一オリジンと一致する絶対URL
 */
```

<!-- source: src/lib/utils/url.ts:20 -->

### [src/lib/utils/url.ts:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/utils/url.ts#L20)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
 * 内部URLである場合、SvelteKitのアプリ内遷移（SPA遷移）用に相対パス（例: '/profile/xxx'）へ変換して返す。
 * 内部URLでない場合は undefined を返す。
 */
```

## src/routes/+layout.svelte

<!-- source: src/routes/+layout.svelte:58 -->

### [src/routes/+layout.svelte:58](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L58)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// サインインの動線そのものを塞がないページでは投稿ボタンを出さない。
```

<!-- source: src/routes/+layout.svelte:60 -->

### [src/routes/+layout.svelte:60](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L60)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 未サインインの TOP はランディング。アプリの殻（ナビ・右レール・投稿ボタン）を外して全幅で見せる。
	// プリレンダ時もセッションが無いのでこちらになり、HTML にナビが混ざらない。
```

<!-- source: src/routes/+layout.svelte:72 -->

### [src/routes/+layout.svelte:72](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L72)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 紹介ページは、機能の見本を横に並べて見せたいので右レールを畳んで本文を広げる。
	// 左のナビは残す（ログイン後に設定から来た人の帰り道になる）。
```

<!-- source: src/routes/+layout.svelte:84 -->

### [src/routes/+layout.svelte:84](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L84)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 画面を移ったら投稿の追従は打ち切る。移った先で急に画面が動くほうが戸惑う。
```

<!-- source: src/routes/+layout.svelte:93 -->

### [src/routes/+layout.svelte:93](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L93)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 未サインイン中に引いた当日カードは、OAuth復元後ただちに同日の通常枠へ移す。
	// 成功するまで端末側を消さないので、通信失敗でカードが失われることはない。
```

<!-- source: src/routes/+layout.svelte:111 -->

### [src/routes/+layout.svelte:111](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L111)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// ミュート一覧はサインインごとに1回だけ読み、サインアウトで捨てる。
```

<!-- source: src/routes/+layout.svelte:127 -->

### [src/routes/+layout.svelte:127](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L127)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// ホームリストは本人だけの非公開状態。サインアウト時は同じtickで破棄し、
	// 次の利用者へ前セッションの一覧を見せない。
```

<!-- source: src/routes/+layout.svelte:136 -->

### [src/routes/+layout.svelte:136](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L136)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// プッシュ購読の状態同期。ブラウザ側の PushSubscription と AppView 側の購読行という
	// 2つの真実を突き合わせる処理なので、特定のページではなくセッション確立に紐付ける。
	// 以前これを /settings/notifications の $effect に置いていたため、そのページを開くまで
	// 「端末は購読済みだがサーバーに行が無い」不整合が直らず、通知が届かない端末を
	// ユーザーが自力で見つけられなかった。ここに置くことで起動のたびに自己修復される。
	// refreshPushState() は非対応環境と多重実行を自分でガードするので呼び放しでよい。
```

<!-- source: src/routes/+layout.svelte:148 -->

### [src/routes/+layout.svelte:148](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L148)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 端末をまたぐ設定（既読位置・お気に入り絵文字・コンテンツ表示など）の同期。ミュートや
	// ホームリストと同じくセッション確立に紐付ける。同期できない端末（permission-set が
	// 古い等）では静かに localStorage 単独へ落ちるので、結果を待つ必要はない。
```

<!-- source: src/routes/+layout.svelte:157 -->

### [src/routes/+layout.svelte:157](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L157)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// よく使われるリアクションパレットは、本文表示を妨げないアイドル時間に準備する。
	// ローカル候補だけでも即時表示できるため、失敗時は次回オープン時の再試行に任せる。
```

<!-- source: src/routes/+layout.svelte:165 -->

### [src/routes/+layout.svelte:165](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L165)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 同期の完了を待ってから読む。先に読むと、初回同期の和集合を
			// この保存で上書きしてしまう。
```

<!-- source: src/routes/+layout.svelte:198 -->

### [src/routes/+layout.svelte:198](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L198)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// プリレンダリングは日本語で固定し、hydration 完了後に端末の言語設定へ追従する。
```

<!-- source: src/routes/+layout.svelte:200 -->

### [src/routes/+layout.svelte:200](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L200)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// フィードのタブ構成を localStorage から読む。プリレンダでは既定タブのままなので、
		// ここで一度読まないと、サインインしない人のカスタムが永久に反映されない
		// （サインイン後は syncPreferences が DID スコープで読み直す）。
```

<!-- source: src/routes/+layout.svelte:206 -->

### [src/routes/+layout.svelte:206](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L206)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 再サインイン（クロスポスト権限の追加同意）から戻ってきた場合の確定処理。
```

<!-- source: src/routes/+layout.svelte:209 -->

### [src/routes/+layout.svelte:209](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L209)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 未読通知バッジのポーリング開始（session の変化には内部で追従する）。
```

<!-- source: src/routes/+layout.svelte:211 -->

### [src/routes/+layout.svelte:211](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L211)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 長時間開いたPC、スリープ復帰、オフライン復帰でもPush endpointを自己修復する。
		// capability経路ならOAuth refreshが一時的に失敗していても同じinstallationだけ更新できる。
```

<!-- source: src/routes/+layout.svelte:238 -->

### [src/routes/+layout.svelte:238](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L238)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
				 * 初回はプロフィール登録を挟まず、Bluesky のプロフィールをそのまま写して始めてもらう。
				 * 変えたくなったら設定から変えられる。まず「Nagiのはじめかた」で使ってみてもらう。
				 */
```

<!-- source: src/routes/+layout.svelte:249 -->

### [src/routes/+layout.svelte:249](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L249)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 移行前の standard.site 記事を、検証できる形（ユーザーごとの url）へ直す。
				// 端末ごとに一度だけ。失敗しても次のサインインでやり直すので握りつぶす。
```

<!-- source: src/routes/+layout.svelte:277 -->

### [src/routes/+layout.svelte:277](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L277)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- 姉妹アプリ（botたんのお部屋）宛のリンクは、クリック時に SSO チケットを取って
     遷移させる。href に埋めるとチケットが失効するため、ここで横取りする。
     取得に失敗したら href の ?did= がそのまま使われる。 -->
```

<!-- source: src/routes/+layout.svelte:286 -->

### [src/routes/+layout.svelte:286](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L286)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- ページ遷移時に本文位置と幅が動かないよう、すべてのルートで同じシェルを使う。
	     例外は紹介ページだけで、左ナビの位置はそのまま右レールのぶん本文を広げる。 -->
```

<!-- source: src/routes/+layout.svelte:296 -->

### [src/routes/+layout.svelte:296](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L296)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- 投稿はページごとではなくアプリ全体の1つの入口に統一する。Composer は
     PostModal の中で常時マウントしたままにする（添付画像を失わないため）。 -->
```

<!-- source: src/routes/+layout.svelte:305 -->

### [src/routes/+layout.svelte:305](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L305)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- ブログは別モーダル。初めて開いたときにマウントし、書きかけを保つためリロードまで残す。 -->
```

<!-- source: src/routes/+layout.svelte:309 -->

### [src/routes/+layout.svelte:309](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L309)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- 記念日はその日しか来ないので、どの画面にいても受け取れるよう常駐させる。 -->
```

<!-- source: src/routes/+layout.svelte:315 -->

### [src/routes/+layout.svelte:315](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+layout.svelte#L315)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- 本文のハッシュタグの右クリック／長押しメニュー。どの画面のタグからも開くので常駐させる。 -->
```

## src/routes/+page.svelte

<!-- source: src/routes/+page.svelte:2 -->

### [src/routes/+page.svelte:2](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/+page.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * TOP。サインイン済みならフィード、未サインインならランディング。
	 * プリレンダ時はセッションが無いのでランディングが HTML に入る（検索エンジンと初回訪問者向け）。
	 * 認証確認中のランディングは Landing 側の CSS で隠す。
	 * 未サインインのタイムラインと端末保存の投稿は `/feed` にある。
	 */
```

## src/routes/about/+page.svelte

<!-- source: src/routes/about/+page.svelte:21 -->

### [src/routes/about/+page.svelte:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/about/+page.svelte#L21)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// m.* はロケールを読むアクセサ。文字列に展開せず関数のまま持ち、
	// テンプレートで呼ぶことで言語切り替えに追従させる。
```

<!-- source: src/routes/about/+page.svelte:31 -->

### [src/routes/about/+page.svelte:31](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/about/+page.svelte#L31)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * 機能のカテゴリ。十数個を平らに並べると「羅列」に見えて、どれも同じ重みの
	 * 設定項目のように読めてしまうので、意味のまとまりごとに見出しと色を与える。
	 * 色だけだと何の色か分からないため、必ず見出しとセットで出す。
	 */
```

<!-- source: src/routes/about/+page.svelte:40 -->

### [src/routes/about/+page.svelte:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/about/+page.svelte#L40)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 「選ばれる理由」。ここで語ったものは下の機能一覧には重ねない。
	// ゲスト向けカード（GuestHero）も同じ4本柱を短くして並べる。
```

<!-- source: src/routes/about/+page.svelte:48 -->

### [src/routes/about/+page.svelte:48](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/about/+page.svelte#L48)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 「Nagiでのひととき」。見本のやりとりを、書く → 受け止められる → 絵文字 → 振り返る の順に読ませる。
```

<!-- source: src/routes/about/+page.svelte:60 -->

### [src/routes/about/+page.svelte:60](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/about/+page.svelte#L60)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 一覧で圧倒しないよう、1項目 = アイコン + 見出し + 1行。詳細は各設定ページに任せ、
	// href がある項目は全体をリンクにする。
	// 並びは「人とつながる → 残る → 自分で決める → 外へ」。こっそりを先頭に置くと
	// Nagi 全体がこっそり前提の場所に見えるので、つながる機能の後に置く。
```

<!-- source: src/routes/about/+page.svelte:159 -->

### [src/routes/about/+page.svelte:159](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/about/+page.svelte#L159)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/**
	 * サインインしないと見られない機能を、架空ユーザーのサンプルで見せる。
	 * 実物のコンポーネントをそのまま使うので、見た目が本物とずれない。
	 */
```

<!-- source: src/routes/about/+page.svelte:170 -->

### [src/routes/about/+page.svelte:170](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/about/+page.svelte#L170)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** サインイン済みなら、本人のものへの導線を出す。 */
```

<!-- source: src/routes/about/+page.svelte:201 -->

### [src/routes/about/+page.svelte:201](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/about/+page.svelte#L201)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 感情グラフは「今日までの1年」を描くので、日付がビルド時とずれないようクライアントでだけ組む。
```

<!-- source: src/routes/about/+page.svelte:210 -->

### [src/routes/about/+page.svelte:210](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/about/+page.svelte#L210)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 水面から上がってくる泡。ヒーローは右のイラストの周りと列の間に置く。
```

<!-- source: src/routes/about/+page.svelte:218 -->

### [src/routes/about/+page.svelte:218](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/about/+page.svelte#L218)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 参加導線はサインイン前にだけ意味がある。$oauthReady を待つのは、
	// 復元中に一瞬 CTA が出て消えるのを避けるため。
```

<!-- source: src/routes/about/+page.svelte:223 -->

### [src/routes/about/+page.svelte:223](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/about/+page.svelte#L223)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!--
	構成は「ヒーロー → 理由 → ひととき → 見本（サンプル付き） → 機能一覧 → はじめかた → AT Protocol → 締め」。
	枠（罫線で囲んだカード）はほぼ使わない。まとまりは余白と見出しで作り、色は面ではなく
	アイコンと小見出しに置く。囲むのは「画面の見本」を本文と見分けるためのサンプルだけ。
-->
```

<!-- source: src/routes/about/+page.svelte:229 -->

### [src/routes/about/+page.svelte:229](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/about/+page.svelte#L229)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- 未サインインで来る導線（ホームの「Nagiのことを知る」）があるので、
	     戻り先はログイン状態で出し分ける。 -->
```

<!-- source: src/routes/about/+page.svelte:330 -->

### [src/routes/about/+page.svelte:330](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/about/+page.svelte#L330)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- プリレンダ時は日付が決まらないので、高さだけ確保してガタつきを抑える。 -->
```

<!-- source: src/routes/about/+page.svelte:404 -->

### [src/routes/about/+page.svelte:404](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/about/+page.svelte#L404)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
<!-- 表ではなく「従来」と「Nagi」の2列のリストで対比させる。狭幅では縦に積む。 -->
```

## src/routes/dev/e2e/diary-navigation/+page.svelte

<!-- source: src/routes/dev/e2e/diary-navigation/+page.svelte:9 -->

### [src/routes/dev/e2e/diary-navigation/+page.svelte:9](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/e2e/diary-navigation/+page.svelte#L9)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// Keep the mock session across navigation to the real diary route.
```

## src/routes/dev/interactions/+page.ts

<!-- source: src/routes/dev/interactions/+page.ts:4 -->

### [src/routes/dev/interactions/+page.ts:4](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/interactions/+page.ts#L4)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** APIやPDSへ書き込まず、インタラクション演出だけを再生する開発専用ページ。 */
```

## src/routes/settings/app-links/+page.svelte

<!-- source: src/routes/settings/app-links/+page.svelte:49 -->

### [src/routes/settings/app-links/+page.svelte:49](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L49)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** repeat 展開する配列のキーパス（未使用時は ''）。 */
```

<!-- source: src/routes/settings/app-links/+page.svelte:51 -->

### [src/routes/settings/app-links/+page.svelte:51](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L51)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** レコードから検出した repeat 候補配列。 */
```

<!-- source: src/routes/settings/app-links/+page.svelte:104 -->

### [src/routes/settings/app-links/+page.svelte:104](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L104)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** repeat の有無に応じてフィールド候補を組み立てる（repeat 時は配列の先頭要素を走査）。 */
```

<!-- source: src/routes/settings/app-links/+page.svelte:114 -->

### [src/routes/settings/app-links/+page.svelte:114](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L114)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 既存の選択状態・順序を維持しつつ作成
```

<!-- source: src/routes/settings/app-links/+page.svelte:119 -->

### [src/routes/settings/app-links/+page.svelte:119](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L119)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 既に存在していた順序を保つ
```

<!-- source: src/routes/settings/app-links/+page.svelte:125 -->

### [src/routes/settings/app-links/+page.svelte:125](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L125)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 新たに検出されたリーフを追加
```

<!-- source: src/routes/settings/app-links/+page.svelte:140 -->

### [src/routes/settings/app-links/+page.svelte:140](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L140)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** リスト展開トグル。ON で配列候補を検出し先頭を repeat に採用、OFF で単一表示へ戻す。 */
```

<!-- source: src/routes/settings/app-links/+page.svelte:151 -->

### [src/routes/settings/app-links/+page.svelte:151](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L151)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/** 展開対象の配列を切り替える（候補が複数あるとき）。 */
```

<!-- source: src/routes/settings/app-links/+page.svelte:159 -->

### [src/routes/settings/app-links/+page.svelte:159](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L159)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 未追加の（＝すでに編集中でない）discovery 候補。
```

<!-- source: src/routes/settings/app-links/+page.svelte:166 -->

### [src/routes/settings/app-links/+page.svelte:166](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L166)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// アプリ内で「メタ」っぽいコレクションを避けて代表を選ぶ。
```

<!-- source: src/routes/settings/app-links/+page.svelte:176 -->

### [src/routes/settings/app-links/+page.svelte:176](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L176)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// discovery はコレクション単位ではなくアプリ単位でまとめる（同じ favicon が並ぶのを防ぎ、
	// favicon 解決も 1 アプリ 1 回でレート制限に収める）。favicon が解決したものだけ表示。
```

<!-- source: src/routes/settings/app-links/+page.svelte:206 -->

### [src/routes/settings/app-links/+page.svelte:206](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L206)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 既存カードのプレビュー用にレコードを先読み。
```

<!-- source: src/routes/settings/app-links/+page.svelte:208 -->

### [src/routes/settings/app-links/+page.svelte:208](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L208)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// discovery 候補の favicon を裏で解決。
```

<!-- source: src/routes/settings/app-links/+page.svelte:210 -->

### [src/routes/settings/app-links/+page.svelte:210](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L210)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// ?edit=<collection> があれば該当連携を開く。
```

<!-- source: src/routes/settings/app-links/+page.svelte:226 -->

### [src/routes/settings/app-links/+page.svelte:226](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L226)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// アプリ（ホーム URL）単位で一意化してから解決する。
```

<!-- source: src/routes/settings/app-links/+page.svelte:246 -->

### [src/routes/settings/app-links/+page.svelte:246](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L246)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// favicon 自動取得（未設定時）。
```

<!-- source: src/routes/settings/app-links/+page.svelte:284 -->

### [src/routes/settings/app-links/+page.svelte:284](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L284)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// push した生オブジェクトではなく、$state 配列がラップしたプロキシ要素を辿って渡す。
		// 生参照経由のミューテーションはリアクティブに反映されない（UI が「取得中…」のまま固まる）。
```

<!-- source: src/routes/settings/app-links/+page.svelte:309 -->

### [src/routes/settings/app-links/+page.svelte:309](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L309)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// プレビュー用ビュー（putRecord せず、選択中フィールドを実レコードに適用して即時反映）。
```

<!-- source: src/routes/settings/app-links/+page.svelte:524 -->

### [src/routes/settings/app-links/+page.svelte:524](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L524)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* .settings-detail は display:grid で、この枠はグリッドアイテム。既定の min-width:auto だと、
	   折り返せない長い URL の min-content 幅が列を突き破る。0 に下げて内側の省略(ellipsis)を効かせる。 */
```

<!-- source: src/routes/settings/app-links/+page.svelte:666 -->

### [src/routes/settings/app-links/+page.svelte:666](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/app-links/+page.svelte#L666)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ネイティブ select はダークモードで option が読めなくなりがちなので配色を明示する。 */
```

## src/routes/styles/base.css

<!-- source: src/routes/styles/base.css:12 -->

### [src/routes/styles/base.css:12](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/base.css#L12)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* Android Chrome では clip がスクロール境界を作らず、内側の横カルーセルの
	   scrollWidth が html へ伝播することがある。root 自身を横スクロール境界にする。 */
```

<!-- source: src/routes/styles/base.css:17 -->

### [src/routes/styles/base.css:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/base.css#L17)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 短いページと長いページを行き来しても、中央のシェル位置を動かさない。 */
```

<!-- source: src/routes/styles/base.css:21 -->

### [src/routes/styles/base.css:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/base.css#L21)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* body の描画だけは切り、縦スクロールは scrollingElement の html に一本化する。 */
```

<!-- source: src/routes/styles/base.css:77 -->

### [src/routes/styles/base.css:77](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/base.css#L77)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* アイコンだけの塗りボタン（.icon-action.primary-icon）用。文字付きのボタンは Button を使う。 */
```

<!-- source: src/routes/styles/base.css:91 -->

### [src/routes/styles/base.css:91](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/base.css#L91)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- Button（lib/components/Button.svelte）---
 * 文字付きの操作ボタンの見た目はここだけに持つ。置き場所ごとの差は余白・幅だけにして、
 * 色・形・ホバーは各所で上書きしない。 */
```

<!-- source: src/routes/styles/base.css:242 -->

### [src/routes/styles/base.css:242](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/base.css#L242)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- PageHeader（lib/components/PageHeader.svelte）---
 * どのページも同じ大きさ・余白の見出しで始める。右の操作は見出しの行の中央に揃える。 */
```

<!-- source: src/routes/styles/base.css:299 -->

### [src/routes/styles/base.css:299](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/base.css#L299)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 開発用ページの簡易見出し。本番のページは PageHeader を使う。 */
```

<!-- source: src/routes/styles/base.css:397 -->

### [src/routes/styles/base.css:397](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/base.css#L397)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 章の切れ目に罫線を引く。規約・ポリシーは章が多いので、見出しの大きさだけでは
   どこで話が変わったのか目で追えない。 */
```

<!-- source: src/routes/styles/base.css:405 -->

### [src/routes/styles/base.css:405](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/base.css#L405)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 目次から飛んだとき、モバイルの固定ヘッダーに見出しが潜らないようにする。 */
```

<!-- source: src/routes/styles/base.css:423 -->

### [src/routes/styles/base.css:423](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/base.css#L423)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* Tailwind の preflight が ol/ul のマーカーと余白を落とすので、.post-text と同じく
   明示的に戻す。規約・ポリシーは箇条書きが主役なので点が見えないと読めない。 */
```

<!-- source: src/routes/styles/base.css:451 -->

### [src/routes/styles/base.css:451](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/base.css#L451)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 冒頭の要点まとめ。全文を読まない人にも最低限そこだけは伝わるようにする。 */
```

<!-- source: src/routes/styles/base.css:469 -->

### [src/routes/styles/base.css:469](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/base.css#L469)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 目次。章数が多いので、どこに何が書いてあるか最初に見せる。 */
```

<!-- source: src/routes/styles/base.css:500 -->

### [src/routes/styles/base.css:500](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/base.css#L500)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 見落とすと困ることを囲む枠。.callout.warn は誤解しやすい点（こっそり投稿は
   秘密ではない、など）に使う。 */
```

<!-- source: src/routes/styles/base.css:519 -->

### [src/routes/styles/base.css:519](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/base.css#L519)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 規約・ポリシーの表。狭い画面でも本文側を横スクロールさせないよう、表だけを
   スクロールさせる入れ物に包む前提のスタイル。 */
```

## src/routes/styles/components.css

<!-- source: src/routes/styles/components.css:1 -->

### [src/routes/styles/components.css:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* Markdown の文字組みはフィード・ブログ・入力プレビューで共有する。 */
```

<!-- source: src/routes/styles/components.css:13 -->

### [src/routes/styles/components.css:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L13)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ブログ本文とブログ入力だけ、長文向けの文字組みに切り替える。 */
```

<!-- source: src/routes/styles/components.css:20 -->

### [src/routes/styles/components.css:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L20)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- welcome / composer --- */
```

<!-- source: src/routes/styles/components.css:29 -->

### [src/routes/styles/components.css:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L29)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
	投稿フォームはポストモーダル専用。以前はタイムラインに直接置いていたので
	thread-unit と同じカード（枠・影・吹き出し）を被せていたが、モーダルの中では
	外枠が二重になるだけなので持たない。
*/
```

<!-- source: src/routes/styles/components.css:39 -->

### [src/routes/styles/components.css:39](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L39)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
	「あっさり」は本文の量に合わせて伸びるが、キーボードが出てモーダルの高さが足りなく
	なったら本文だけが縮み、入力欄の中でスクロールする（ツール列と送信まわりは残す）。
*/
```

<!-- source: src/routes/styles/components.css:68 -->

### [src/routes/styles/components.css:68](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L68)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 返信・引用ターゲット表示 (他人のコンテンツ) */
```

<!-- source: src/routes/styles/components.css:131 -->

### [src/routes/styles/components.css:131](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L131)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
	「しっかり」は長文用。パネルの高さを固定して本文だけを内側でスクロールさせ、
	ツールバーと送信ボタンを常に見える位置に留める（本文の量に合わせてモーダルが
	伸びる作りだと、長く書くほど送信ボタンが画面外へ逃げていく）。
	長文エディタの一般的な作法で、Bluesky の長文投稿や Mastodon の作成欄も同じ。
*/
```

<!-- source: src/routes/styles/components.css:147 -->

### [src/routes/styles/components.css:147](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L147)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 本文 168px と直下のツール列を、embed の量に関係なく確保する。 */
```

<!-- source: src/routes/styles/components.css:156 -->

### [src/routes/styles/components.css:156](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L156)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 高さはパネルが決め、本文は入力欄の中でスクロールする。 */
```

<!-- source: src/routes/styles/components.css:190 -->

### [src/routes/styles/components.css:190](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L190)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
	「ブログ」は「しっかり」に記事メタ欄を足したモード。.composer.rich も同時に付くので、
	本文まわりの縦積みと高さ固定はそちらの規則がそのまま効く。ここでは本文と
	メタ欄の並べ方だけを決める。

	.composer-body / .composer-main は、ブログ以外では display:contents で畳み、
	従来どおり .composer 直下の縦積みに見せる（既存レイアウトに触らないため）。
*/
```

<!-- source: src/routes/styles/components.css:209 -->

### [src/routes/styles/components.css:209](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L209)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
		縦積みのときは本文とメタ欄を一緒にスクロールさせる。ここで flex に高さを
		取り合わせると、背の高いメタ欄が本文の領域へ食い込んでしまう。
	*/
```

<!-- source: src/routes/styles/components.css:219 -->

### [src/routes/styles/components.css:219](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L219)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 本文は余った高さを引き取るが、メタ欄を押し潰さない範囲で伸びる。 */
```

<!-- source: src/routes/styles/components.css:224 -->

### [src/routes/styles/components.css:224](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L224)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* メタ欄は自分の内容ぶんの高さを保つ（縮めると本文の上に溢れて重なる）。 */
```

<!-- source: src/routes/styles/components.css:255 -->

### [src/routes/styles/components.css:255](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L255)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 送信を止めている理由は、ただのヒントと見分けが付くようにする。 */
```

<!-- source: src/routes/styles/components.css:276 -->

### [src/routes/styles/components.css:276](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L276)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* botたんラジオの引用で、公開レコードを書く権限が無いとき。記事の権限案内と同じ見た目。 */
```

<!-- source: src/routes/styles/components.css:294 -->

### [src/routes/styles/components.css:294](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L294)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 広い画面では本文の右に記事メタ欄を置く。2ペインプレビューは blog では出ない。 */
```

<!-- source: src/routes/styles/components.css:300 -->

### [src/routes/styles/components.css:300](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L300)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 列ごとに独立してスクロールさせるので、外側のスクロールは戻す。 */
```

<!-- source: src/routes/styles/components.css:307 -->

### [src/routes/styles/components.css:307](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L307)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* メタ欄は本文の高さを奪わず、はみ出すぶんだけ自分の中でスクロールする。 */
```

<!-- source: src/routes/styles/components.css:339 -->

### [src/routes/styles/components.css:339](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L339)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 「参加する」の下に添える、機能紹介(about)への控えめな導線リンク。 */
```

<!-- source: src/routes/styles/components.css:361 -->

### [src/routes/styles/components.css:361](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L361)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
	入力欄（ComposerInput の CodeMirror）。投稿の本文（.post-text）と同じ文字の大きさ・
	行の高さ・字詰めで組み、見出しの大きさや箇条書きの「•」、引用の罫線まで投稿後の
	見た目に揃える。記法の文字（`**` や `## `）は薄く残す。
	CodeMirror が実行時に差し込む既定のスタイルに勝つよう、.mention-textarea から指定する。
*/
```

<!-- source: src/routes/styles/components.css:387 -->

### [src/routes/styles/components.css:387](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L387)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* iOS Safari の入力フォーカス時の自動拡大を防ぐ。 */
```

<!-- source: src/routes/styles/components.css:398 -->

### [src/routes/styles/components.css:398](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L398)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* Android で CodeMirror の代わりに使う素の textarea。文字組みは .cm-content に揃える。 */
```

<!-- source: src/routes/styles/components.css:448 -->

### [src/routes/styles/components.css:448](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L448)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
	記事の入力欄で、URL だけの行・画像行の下に重ねるリンクカードと画像（composer-embeds.ts）。
	投稿後の記事ページ（.post-inline-card / .post-inline-image）と同じ位置に見せる。
	本文の字組み（行の高さ・折り返し）を持ち込まないよう、ここで戻す。
*/
```

<!-- source: src/routes/styles/components.css:471 -->

### [src/routes/styles/components.css:471](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L471)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 画像の左下に重ねる「ALT」。押すと画像の下に alt の入力欄を開く。 */
```

<!-- source: src/routes/styles/components.css:490 -->

### [src/routes/styles/components.css:490](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L490)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* alt が空のときは点線にして、まだ書いていないと分かるようにする。 */
```

<!-- source: src/routes/styles/components.css:540 -->

### [src/routes/styles/components.css:540](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L540)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 投稿の ul/ol と同じ字下げ。マーカーは左の余白へぶら下げる。 */
```

<!-- source: src/routes/styles/components.css:653 -->

### [src/routes/styles/components.css:653](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L653)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 検索中／該当なしの一言。候補行と同じ内側余白に揃える。 */
```

<!-- source: src/routes/styles/components.css:660 -->

### [src/routes/styles/components.css:660](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L660)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 検索中のスケルトン。行の骨格だけ先に出して「探している」ことを見せる。 */
```

<!-- source: src/routes/styles/components.css:739 -->

### [src/routes/styles/components.css:739](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L739)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
	投稿範囲は必ず左端、送信は必ず右端で対にする。以前は狭い画面で折り返して
	投稿範囲だけが1行を占めていたので、ここでは折り返さず文字数の方を削る。
*/
```

<!-- source: src/routes/styles/components.css:751 -->

### [src/routes/styles/components.css:751](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L751)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 現在の投稿範囲。押すと投稿範囲モーダル（ゲージ）が開く。 */
```

<!-- source: src/routes/styles/components.css:759 -->

### [src/routes/styles/components.css:759](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L759)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 送信ボタンを右端へ押しやり、投稿範囲を左端に固定する。 */
```

<!-- source: src/routes/styles/components.css:786 -->

### [src/routes/styles/components.css:786](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L786)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 文字数。詰まってきたら真っ先に削ってよい要素なので縮小を許す。 */
```

<!-- source: src/routes/styles/components.css:812 -->

### [src/routes/styles/components.css:812](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L812)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 色と形は Button。隣の 44px の丸ボタンと高さだけ揃える。 */
```

<!-- source: src/routes/styles/components.css:824 -->

### [src/routes/styles/components.css:824](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L824)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 狭い画面では文字数を落として、投稿範囲と送信の対だけを残す。 */
```

<!-- source: src/routes/styles/components.css:830 -->

### [src/routes/styles/components.css:830](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L830)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* standard.site ブログ用のタイトル・公開情報。 */
```

<!-- source: src/routes/styles/components.css:1209 -->

### [src/routes/styles/components.css:1209](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1209)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- feed & thread units --- */
```

<!-- source: src/routes/styles/components.css:1225 -->

### [src/routes/styles/components.css:1225](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1225)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* Long author names must not set the minimum width of the conversation track. */
```

<!-- source: src/routes/styles/components.css:1229 -->

### [src/routes/styles/components.css:1229](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1229)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* New arrivals speak from the avatar. Both feed sources and optimistic posts share this motion. */
```

<!-- source: src/routes/styles/components.css:1274 -->

### [src/routes/styles/components.css:1274](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1274)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
 * 年表の節目が、スクロールで1件ずつ姿を現す。
 *
 * **opacity: 0 は from の中にしか書かない。** base.css の prefers-reduced-motion は
 * 全要素へ `animation: none !important` を当てるので、要素の基底状態を透明にすると
 * 演出を切っている人には永久に見えないままになる（.feed-entering と同じ約束）。
 */
```

<!-- source: src/routes/styles/components.css:1348 -->

### [src/routes/styles/components.css:1348](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1348)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* カバー画像など吹き出しの縁まで広げる要素が同じ値で打ち消せるよう、余白は変数で持つ。 */
```

<!-- source: src/routes/styles/components.css:1378 -->

### [src/routes/styles/components.css:1378](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1378)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 自分の投稿・投稿フォームは右揃えのチャット風。しっぽも左右反転する */
```

<!-- source: src/routes/styles/components.css:1523 -->

### [src/routes/styles/components.css:1523](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1523)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* リプライ／引用フォーム（InlinePostComposer）は親投稿の下に、自分側の吹き出しとして
   ぶら下がる。トップレベルの投稿欄はモーダルへ移ったので、吹き出しはこちらだけが使う。 */
```

<!-- source: src/routes/styles/components.css:1566 -->

### [src/routes/styles/components.css:1566](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1566)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 送信などの円形アイコンボタンは 38×38・padding:0 が前提（通常コンポーザと同じ）。
   上のテキストボタン用 padding が効くと内容領域が潰れてアイコンが中心からずれるため、
   icon-action は padding:0 を保つ。 */
```

<!-- source: src/routes/styles/components.css:1660 -->

### [src/routes/styles/components.css:1660](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1660)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* バッジのトーン。どれを付けるかは lib/badges/badges.ts が決める */
```

<!-- source: src/routes/styles/components.css:1665 -->

### [src/routes/styles/components.css:1665](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1665)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 今日のゼンカツ部長：前日の botたん賞。**1日で消える**ので、ここだけ少し華やかにしてよい */
```

<!-- source: src/routes/styles/components.css:1671 -->

### [src/routes/styles/components.css:1671](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1671)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 称号：日記でもらう。次の日記が書かれるまで維持される */
```

<!-- source: src/routes/styles/components.css:1692 -->

### [src/routes/styles/components.css:1692](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1692)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* Lv.100+：Bluesky 側のラベルが頭打ちになる先なので、ここだけ特別扱い */
```

<!-- source: src/routes/styles/components.css:1706 -->

### [src/routes/styles/components.css:1706](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1706)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 投稿本文（Markdown 描画）。RichText が出すブロック要素をまとめて受ける */
```

<!-- source: src/routes/styles/components.css:1708 -->

### [src/routes/styles/components.css:1708](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1708)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 折りたたみ時の表示行数。TranslateToggle が同じ値を読んで溢れを判定する */
```

<!-- source: src/routes/styles/components.css:1730 -->

### [src/routes/styles/components.css:1730](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1730)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
	入力した空行は本文と同じ高さで維持する。見出しの余白は入力欄と共通の padding で足す。
*/
```

<!-- source: src/routes/styles/components.css:1765 -->

### [src/routes/styles/components.css:1765](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1765)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
	ブログとして書かれた投稿（レコードの article: true）。
	本文先頭の「# 見出し」を記事タイトルとして、1枚目の画像をヘッダーとして見せる。
	先頭が見出しなだけの通常投稿は post.article を持たないので、ここには入らない。
*/
```

<!-- source: src/routes/styles/components.css:1811 -->

### [src/routes/styles/components.css:1811](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1811)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 吹き出し背景と同色にならないよう、本文色を薄く重ねる */
```

<!-- source: src/routes/styles/components.css:1851 -->

### [src/routes/styles/components.css:1851](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1851)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* Reddit風の深さインデント。--reply-indent 段(直リプ=0段)ぶん左に寄せる。既存箇所は未設定=0。 */
```

<!-- source: src/routes/styles/components.css:1854 -->

### [src/routes/styles/components.css:1854](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1854)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 会話グループでルートと最新群の間に畳んだ件数を出す区切り。押すとスレッド全体へ。 */
```

<!-- source: src/routes/styles/components.css:1871 -->

### [src/routes/styles/components.css:1871](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1871)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 投稿後の追従スクロールは発言単位（.post-row）でも寄せるので、同じ余白を持たせる。 */
```

<!-- source: src/routes/styles/components.css:1878 -->

### [src/routes/styles/components.css:1878](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1878)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 入力フォームはアバター分の幅を使い、スマホでも十分な入力領域を確保する。 */
```

<!-- source: src/routes/styles/components.css:1897 -->

### [src/routes/styles/components.css:1897](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1897)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* botたん pending / failed states */
```

<!-- source: src/routes/styles/components.css:1955 -->

### [src/routes/styles/components.css:1955](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L1955)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- reactions --- */
```

<!-- source: src/routes/styles/components.css:2030 -->

### [src/routes/styles/components.css:2030](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2030)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* body 直下へポータルするため、各モーダルより上の共通レイヤーに置く。 */
```

<!-- source: src/routes/styles/components.css:2148 -->

### [src/routes/styles/components.css:2148](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2148)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- クイックパレットの連続選択 / ドラッグ --- */
```

<!-- source: src/routes/styles/components.css:2152 -->

### [src/routes/styles/components.css:2152](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2152)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 画像のネイティブドラッグがポインタドラッグを乗っ取らないようにする。 */
```

<!-- source: src/routes/styles/components.css:2163 -->

### [src/routes/styles/components.css:2163](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2163)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ドラッグ中はゴーストが本体なので、:active の拡大は打ち消す。 */
```

<!-- source: src/routes/styles/components.css:2167 -->

### [src/routes/styles/components.css:2167](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2167)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 差し込み位置のキャレット。末尾追加は最後のタイルの右side に出る。 */
```

<!-- source: src/routes/styles/components.css:2303 -->

### [src/routes/styles/components.css:2303](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2303)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* display 指定があると hidden 属性が効かなくなるので明示的に消す */
```

<!-- source: src/routes/styles/components.css:2323 -->

### [src/routes/styles/components.css:2323](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2323)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* カスタムタブはパネル自体に余白があるので、検索結果側の余白を重ねない */
```

<!-- source: src/routes/styles/components.css:2402 -->

### [src/routes/styles/components.css:2402](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2402)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ドラッグ中にページがスクロールへ持っていかれないようにする。 */
```

<!-- source: src/routes/styles/components.css:2439 -->

### [src/routes/styles/components.css:2439](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2439)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* クイックパレット（141）より上に出す必要がある。 */
```

<!-- source: src/routes/styles/components.css:2477 -->

### [src/routes/styles/components.css:2477](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2477)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 正方形セルは崩さず、その中でアスペクト比を保つ（横長は縦が縮む）。 */
```

<!-- source: src/routes/styles/components.css:2490 -->

### [src/routes/styles/components.css:2490](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2490)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 高さだけ揃え、横長の絵文字は横長のまま出す。min-width は読み込み前の潰れ防止。 */
```

<!-- source: src/routes/styles/components.css:2525 -->

### [src/routes/styles/components.css:2525](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2525)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- custom emoji settings --- */
```

<!-- source: src/routes/styles/components.css:2561 -->

### [src/routes/styles/components.css:2561](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2561)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* お気に入り：リアクションパレット（.reaction-quick-picker）と同じ寸法で並べる */
```

<!-- source: src/routes/styles/components.css:2597 -->

### [src/routes/styles/components.css:2597](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2597)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* パレットの「すべてのリアクション」（.reaction-show-all）と同じ形の行 */
```

<!-- source: src/routes/styles/components.css:2623 -->

### [src/routes/styles/components.css:2623](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2623)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 「絵文字をつくる」：えもじあっとへの入口 */
```

<!-- source: src/routes/styles/components.css:2664 -->

### [src/routes/styles/components.css:2664](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2664)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* My絵文字 */
```

<!-- source: src/routes/styles/components.css:2719 -->

### [src/routes/styles/components.css:2719](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2719)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* AIでつくる */
```

<!-- source: src/routes/styles/components.css:2766 -->

### [src/routes/styles/components.css:2766](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2766)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 透過したまま、縦横比どおりに出す（横長の絵文字も縮めない） */
```

<!-- source: src/routes/styles/components.css:2796 -->

### [src/routes/styles/components.css:2796](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2796)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 登録ボタンは横いっぱいに伸ばさない */
```

<!-- source: src/routes/styles/components.css:2812 -->

### [src/routes/styles/components.css:2812](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L2812)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- images --- */
```

<!-- source: src/routes/styles/components.css:3081 -->

### [src/routes/styles/components.css:3081](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3081)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* body 直下へポータル化した画像ビューを、既存のダイアログやパレットより前面に保つ。 */
```

<!-- source: src/routes/styles/components.css:3165 -->

### [src/routes/styles/components.css:3165](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3165)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- media grid (プロフィール／チャンネルのメディアタブ) --- */
```

<!-- source: src/routes/styles/components.css:3166 -->

### [src/routes/styles/components.css:3166](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3166)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 1画像1タイル。タイル全体が投稿へのリンクなので、中に操作要素は置かない。 */
```

<!-- source: src/routes/styles/components.css:3227 -->

### [src/routes/styles/components.css:3227](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3227)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- profile --- */
```

<!-- source: src/routes/styles/components.css:3333 -->

### [src/routes/styles/components.css:3333](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3333)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- avatar settings / cropper --- */
```

<!-- source: src/routes/styles/components.css:3361 -->

### [src/routes/styles/components.css:3361](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3361)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 別モーダル（作成ダイアログ .draft-backdrop = 110）の上に重ねてトリミングできるようにする。 */
```

<!-- source: src/routes/styles/components.css:3513 -->

### [src/routes/styles/components.css:3513](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3513)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- notifications --- */
```

<!-- source: src/routes/styles/components.css:3526 -->

### [src/routes/styles/components.css:3526](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3526)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 未読は全コンポーネント共通で「左のアクセントバー（背景変更なし）」のみで示す。
   アクセントバー（inset 3px 0 0）を表示する際は、バーとコンテンツの間に必ず内側余白（padding-inline-start: 12px）を確保すること。 */
```

<!-- source: src/routes/styles/components.css:3567 -->

### [src/routes/styles/components.css:3567](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3567)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 自動翻訳で本文を差し替えたことを示す小さな見出し。TranslateToggle の .label と揃える。 */
```

<!-- source: src/routes/styles/components.css:3621 -->

### [src/routes/styles/components.css:3621](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3621)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- hero (logged-out landing) --- */
```

<!-- source: src/routes/styles/components.css:3622 -->

### [src/routes/styles/components.css:3622](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3622)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 水面の色の面に載せる。ブランドの色はこの面と、アイコン・「参加する」にだけ置く。 */
```

<!-- source: src/routes/styles/components.css:3630 -->

### [src/routes/styles/components.css:3630](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3630)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 共通の .eyebrow は大文字・広い字間の飾りラベル。ここでは文として読ませる。 */
```

<!-- source: src/routes/styles/components.css:3646 -->

### [src/routes/styles/components.css:3646](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3646)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 3本柱を1行ずつ。中央揃えの見出しの下で、行頭のアイコンが縦にそろうよう左寄せの塊にする。 */
```

<!-- source: src/routes/styles/components.css:3669 -->

### [src/routes/styles/components.css:3669](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3669)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* やりとりの見本。面の上で白い吹き出しが浮くよう、返信の吹き出しだけ一段濃くする。 */
```

<!-- source: src/routes/styles/components.css:3700 -->

### [src/routes/styles/components.css:3700](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3700)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- Nagi でのやりとりの見本（/about） --- */
```

<!-- source: src/routes/styles/components.css:3771 -->

### [src/routes/styles/components.css:3771](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3771)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 見本の絵文字は押せる（演出だけ。DemoReactionButton）。粒の形は li が持ち、ボタンは透明にする。 */
```

<!-- source: src/routes/styles/components.css:3805 -->

### [src/routes/styles/components.css:3805](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3805)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- やりとりの見本の再生（GuestHero・/about 共通） ---
 * 投稿が生える → botたんが入力中 → 返信が生える → 絵文字がスタンプで届く、を一度だけ流す。
 * 動きはフィードの bubble-sprout と ReactionStamp に合わせる。画面に入るまでは一時停止で
 * 待たせ（from の状態＝見えない）、.is-playing で動き出す。opacity: 0 は from にだけ書き、
 * 演出を切った人（animation: none）には最後の状態が見えるようにする。 */
```

<!-- source: src/routes/styles/components.css:3971 -->

### [src/routes/styles/components.css:3971](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3971)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* JS が動かないと再生が始まらないので、最後の状態で止めておく。 */
```

<!-- source: src/routes/styles/components.css:3982 -->

### [src/routes/styles/components.css:3982](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3982)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 共通の animation: none で入力中とスタンプが出しっぱなしにならないよう消す。 */
```

<!-- source: src/routes/styles/components.css:3997 -->

### [src/routes/styles/components.css:3997](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L3997)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- small screens --- */
```

<!-- source: src/routes/styles/components.css:4045 -->

### [src/routes/styles/components.css:4045](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4045)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* モバイルでは従来の3段構成を保つため、デスクトップ用の内側ラッパーを
	   グリッド配置上だけ展開する。 */
```

<!-- source: src/routes/styles/components.css:4280 -->

### [src/routes/styles/components.css:4280](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4280)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- categorized settings --- */
```

<!-- source: src/routes/styles/components.css:4281 -->

### [src/routes/styles/components.css:4281](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4281)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 設定トップ。グループごとに1枚の面にまとめ、項目は細い線で区切った行にする。
   1項目ずつ枠で囲むと、10個並んだときに重く、まとまりも見えなくなる。 */
```

<!-- source: src/routes/styles/components.css:4295 -->

### [src/routes/styles/components.css:4295](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4295)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 見出しは設定全体で2段。h2（設定トップのグループ・各ページのセクション）は本文色で一段強く、
   h3（セクション内の小分け）は控えめな灰色にする。面の上の見出しが同じ強さで並ぶと、
   親子関係が読み取れなくなるため。 */
```

<!-- source: src/routes/styles/components.css:4370 -->

### [src/routes/styles/components.css:4370](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4370)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- 設定の各ページ（SettingsPage / SettingsSection / SettingRow）---
   設定トップと同じ列幅。まとまりごとに1枚の面を置き、項目は「名前と説明｜右の操作」の行で並べる。 */
```

<!-- source: src/routes/styles/components.css:4420 -->

### [src/routes/styles/components.css:4420](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4420)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* セクションの中に小分けのセクションを並べるとき、親の説明・小分け同士の間を少し空ける。 */
```

<!-- source: src/routes/styles/components.css:4462 -->

### [src/routes/styles/components.css:4462](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4462)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 狭い幅では、切り替えとセレクトを項目名の下に全幅で置く（トグルは右に残す）。 */
```

<!-- source: src/routes/styles/components.css:4496 -->

### [src/routes/styles/components.css:4496](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4496)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- SegmentedControl --- */
```

<!-- source: src/routes/styles/components.css:4550 -->

### [src/routes/styles/components.css:4550](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4550)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- about page --- */
```

<!-- source: src/routes/styles/components.css:4551 -->

### [src/routes/styles/components.css:4551](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4551)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 構成: ヒーロー → 理由 → 見本（サンプル） → 機能一覧 → はじめかた → AT Protocol → 締め。
   右レールを畳んだ広い本文（.shell-wide）で使う。まとまりは罫線で囲まず、余白と見出しで作る。
   色は面ではなく、アイコン・小見出し・数字にだけ置く。
   幅の切り替えは画面幅ではなく本文幅で決める（左ナビの有無で本文幅が大きく変わるため）。 */
```

<!-- source: src/routes/styles/components.css:4592 -->

### [src/routes/styles/components.css:4592](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4592)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* アイコン + 小見出し。ヒーローと見本の見出しの上に置く。 */
```

<!-- source: src/routes/styles/components.css:4613 -->

### [src/routes/styles/components.css:4613](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4613)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- hero --- */
```

<!-- source: src/routes/styles/components.css:4614 -->

### [src/routes/styles/components.css:4614](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4614)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 枠は付けず、凪いだ水面のような淡いティールの面だけで区切る。グラデーションは重ねない。 */
```

<!-- source: src/routes/styles/components.css:4630 -->

### [src/routes/styles/components.css:4630](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4630)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 水面から上がってくる泡。Nagi の目印として、ヒーローと締めの面にだけ置く。
   色はブランドの1色、塗りと輪の2種類だけ。面の端で切れないよう内側に置き、
   読み込み時に一度だけ浮かび上がって、あとは止まっている。装飾なので内容にはかけない。 */
```

<!-- source: src/routes/styles/components.css:4696 -->

### [src/routes/styles/components.css:4696](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4696)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 背景は透過済みで、どのテーマの地にもそのまま載る。脚の途中で切れている下端だけ薄く消す
   （ランディングのヒーローと同じ）。色ではなくアルファの指定なので生の #000 でよい。 */
```

<!-- source: src/routes/styles/components.css:4735 -->

### [src/routes/styles/components.css:4735](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4735)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- 選ばれる理由 --- */
```

<!-- source: src/routes/styles/components.css:4736 -->

### [src/routes/styles/components.css:4736](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4736)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 枠なしで4列（中幅は2列）。アイコンは丸に載せず、ブランド色の線だけで置く。 */
```

<!-- source: src/routes/styles/components.css:4785 -->

### [src/routes/styles/components.css:4785](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4785)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- Nagiでのひととき --- */
```

<!-- source: src/routes/styles/components.css:4786 -->

### [src/routes/styles/components.css:4786](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4786)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* やりとりの見本と、それを読む順番（書く → 受け止められる → 絵文字 → 振り返る）を並べる。 */
```

<!-- source: src/routes/styles/components.css:4835 -->

### [src/routes/styles/components.css:4835](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4835)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- 見本（サンプル付き） --- */
```

<!-- source: src/routes/styles/components.css:4836 -->

### [src/routes/styles/components.css:4836](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4836)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* サインインしないと見られない機能は、説明だけでは伝わらない。実物のコンポーネントを
   架空ユーザーのデータで描く。広い本文では文と見本を左右に置き、1行ごとに左右を入れ替える。 */
```

<!-- source: src/routes/styles/components.css:4869 -->

### [src/routes/styles/components.css:4869](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4869)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 見本は「画面の一部」なので、ここだけは面を立てる。罫線ではなく影で浮かせる。 */
```

<!-- source: src/routes/styles/components.css:4907 -->

### [src/routes/styles/components.css:4907](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4907)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 見本が文より広い列を取るよう、入れ替える行は列幅も入れ替える。 */
```

<!-- source: src/routes/styles/components.css:4914 -->

### [src/routes/styles/components.css:4914](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4914)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 見本（年表など）は文よりずっと縦に長い。中央揃えだと文が宙に浮くので、
	   上に揃えて、見本を読み進めるあいだ文を追従させる。 */
```

<!-- source: src/routes/styles/components.css:4926 -->

### [src/routes/styles/components.css:4926](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4926)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- 機能一覧 --- */
```

<!-- source: src/routes/styles/components.css:4927 -->

### [src/routes/styles/components.css:4927](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L4927)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 十数個を平らに並べると「羅列」に見えるので、カテゴリごとの列に分ける。
   各項目はアイコン + 見出し + 1行で、罫線では囲まない。カテゴリ色は列見出しの点とアイコンにだけ使う。 */
```

<!-- source: src/routes/styles/components.css:5028 -->

### [src/routes/styles/components.css:5028](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5028)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- はじめかた --- */
```

<!-- source: src/routes/styles/components.css:5029 -->

### [src/routes/styles/components.css:5029](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5029)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ページ内で唯一、地の色を変えた帯にする。番号どうしを点線でつなぎ、順番を図で見せる。 */
```

<!-- source: src/routes/styles/components.css:5081 -->

### [src/routes/styles/components.css:5081](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5081)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 番号の中心どうしを結ぶ点線。次の項目の番号の手前で止める。 */
```

<!-- source: src/routes/styles/components.css:5092 -->

### [src/routes/styles/components.css:5092](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5092)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- AT Protocol 比較 --- */
```

<!-- source: src/routes/styles/components.css:5093 -->

### [src/routes/styles/components.css:5093](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5093)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 表にせず「従来」と「Nagi」を2列のリストで対比する。Nagi 側だけ色の縦線を添える。 */
```

<!-- source: src/routes/styles/components.css:5159 -->

### [src/routes/styles/components.css:5159](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5159)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- 締め --- */
```

<!-- source: src/routes/styles/components.css:5160 -->

### [src/routes/styles/components.css:5160](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5160)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ヒーローと同じ水面の面と泡で、ページの最初と最後を揃える。
   「botたんが待っています」を言葉だけにしないよう、入力補助と同じ座ったbotたんを置く。 */
```

<!-- source: src/routes/styles/components.css:5179 -->

### [src/routes/styles/components.css:5179](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5179)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 元絵 264px の 1/3。ドット絵は整数分の1で縮めないと線がにじむ。 */
```

<!-- source: src/routes/styles/components.css:5216 -->

### [src/routes/styles/components.css:5216](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5216)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- フッター --- */
```

<!-- source: src/routes/styles/components.css:5217 -->

### [src/routes/styles/components.css:5217](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5217)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 右レールを畳んでいるので、suibari.com のロゴと規約リンクはここで常に出す。 */
```

<!-- source: src/routes/styles/components.css:5264 -->

### [src/routes/styles/components.css:5264](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5264)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- 設定の入力・保存行 ---
   入力欄は面の行の中に全幅で置き、保存ボタンと「保存しました」は面の下に並べる。 */
```

<!-- source: src/routes/styles/components.css:5297 -->

### [src/routes/styles/components.css:5297](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5297)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 返信の確率。いまの値を行の右に大きく出し、スライダーは行の下に全幅で置く。 */
```

<!-- source: src/routes/styles/components.css:5317 -->

### [src/routes/styles/components.css:5317](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5317)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ---- チャンネル機能 ---- */
```

<!-- source: src/routes/styles/components.css:5421 -->

### [src/routes/styles/components.css:5421](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5421)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 新規作成ダイアログのフォーム行（draft-dialog 内で使う） */
```

<!-- source: src/routes/styles/components.css:5445 -->

### [src/routes/styles/components.css:5445](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5445)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ---------------------------------------------------------------
 * 名刺カード（BusinessCard.svelte）
 * 見た目は $lib/card/render.ts（Canvas 版・共有画像用）と対。片方だけ直すとズレる。
 * こちらはテーマ追従、あちらはライト固定という違いだけが意図的な差。
 * --------------------------------------------------------------- */
```

<!-- source: src/routes/styles/components.css:5454 -->

### [src/routes/styles/components.css:5454](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5454)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* QR を外したぶん横に間延びするので、読みやすい幅で止める。 */
```

<!-- source: src/routes/styles/components.css:5456 -->

### [src/routes/styles/components.css:5456](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5456)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* flex/grid の子になったとき、中身の幅までトラックが広がるのを防ぐ
	   （長いハンドルでカードごと横に伸びていた）。 */
```

<!-- source: src/routes/styles/components.css:5468 -->

### [src/routes/styles/components.css:5468](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5468)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
 * 左端のブランドバー。Canvas 版は上から下へ accent→decorative の縦グラデーション。
 * border-image / border-box グラデーションで代用すると、幅4pxの帯がグラデーション全体の
 * ごく一部しか通らず単色に見えてしまうので、専用の要素を敷いて縦方向に効かせる。
 */
```

<!-- source: src/routes/styles/components.css:5500 -->

### [src/routes/styles/components.css:5500](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5500)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 名刺ではアバターが主役。既存の .avatar.large(76px) より一段大きく見せる。 */
```

<!-- source: src/routes/styles/components.css:5511 -->

### [src/routes/styles/components.css:5511](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5511)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 省略記号を効かせるには、縮められる指定と min-*: 0 の両方が要る。 */
```

<!-- source: src/routes/styles/components.css:5518 -->

### [src/routes/styles/components.css:5518](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5518)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 長い表示名でカードを横に広げない。 */
```

<!-- source: src/routes/styles/components.css:5574 -->

### [src/routes/styles/components.css:5574](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5574)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* tagline は最大120文字。Canvas 版も5行で止めるので揃える。 */
```

<!-- source: src/routes/styles/components.css:5604 -->

### [src/routes/styles/components.css:5604](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5604)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
 * プロフィールのアバター。名刺を持っている人は、周りを光がうねうね回る。
 * 「押せる」ことを示すのが目的なので、名刺が無いユーザーには付けない（+page.svelte 側で分岐）。
 */
```

<!-- source: src/routes/styles/components.css:5620 -->

### [src/routes/styles/components.css:5620](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5620)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 回る光の帯。radial マスクでリング状に抜く。 */
```

<!-- source: src/routes/styles/components.css:5639 -->

### [src/routes/styles/components.css:5639](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5639)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
 * 2枚目を逆回転・低速で重ねると、明るいところが行ったり来たりして「うねり」に見える。
 * 1枚だけだと等速で回るだけの輪になる。
 */
```

<!-- source: src/routes/styles/components.css:5668 -->

### [src/routes/styles/components.css:5668](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5668)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 動きが苦手な人には回さない。名刺があること自体は静止したリングで伝わる。 */
```

<!-- source: src/routes/styles/components.css:5676 -->

### [src/routes/styles/components.css:5676](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5676)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 名刺の拡大モーダル。既存ダイアログと同じ手書き規約（backdrop + role="dialog"）。 */
```

<!-- source: src/routes/styles/components.css:5716 -->

### [src/routes/styles/components.css:5716](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5716)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
 * botたんの長文分析。名刺には短い tagline しか載らないので全文はここで読む。
 * 見た目は元のプロフィール表示と同じ botたんの吹き出し（ChatBubble）に戻してある。
 */
```

<!-- source: src/routes/styles/components.css:5733 -->

### [src/routes/styles/components.css:5733](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5733)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* アバターホバーで出る名刺ポップオーバー。 */
```

<!-- source: src/routes/styles/components.css:5745 -->

### [src/routes/styles/components.css:5745](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5745)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ---- フィードのタブ設定（/settings/feed-tabs） ---- */
```

<!-- source: src/routes/styles/components.css:5762 -->

### [src/routes/styles/components.css:5762](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5762)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ドラッグ中にページがスクロールへ持っていかれないようにする。 */
```

<!-- source: src/routes/styles/components.css:5771 -->

### [src/routes/styles/components.css:5771](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5771)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 行のゴーストは絵文字タイル用の見た目を打ち消して、行のまま追従させる。 */
```

<!-- source: src/routes/styles/components.css:5776 -->

### [src/routes/styles/components.css:5776](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5776)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ドラッグ中に指へ追従するコピー。実体の行と同じ見た目で、当たり判定だけ外す。 */
```

<!-- source: src/routes/styles/components.css:5796 -->

### [src/routes/styles/components.css:5796](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5796)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* min-width:0 が無いと、フレックスの最小サイズが効いて名前が1文字ずつ縦に折れる。 */
```

<!-- source: src/routes/styles/components.css:5801 -->

### [src/routes/styles/components.css:5801](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5801)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 親の文字揃えに依存させず、並べ替え行のラベルを読みやすく保つ。 */
```

<!-- source: src/routes/styles/components.css:5817 -->

### [src/routes/styles/components.css:5817](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5817)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* アイコンと削除ボタンは潰さない。潰れると中身が縦に折れる。 */
```

<!-- source: src/routes/styles/components.css:5868 -->

### [src/routes/styles/components.css:5868](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5868)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* プレビュー。実物と同じ .feed-tabs を使うので、sticky だけ打ち消す。 */
```

<!-- source: src/routes/styles/components.css:5870 -->

### [src/routes/styles/components.css:5870](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5870)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 横並びのタブ名を grid の min-content 幅として親へ伝えない。
	   ここが縮められないと、タブが多い利用者だけ設定カードから行全体がはみ出し、
	   デスクトップでは右サイドバーが削除ボタンのクリックを覆ってしまう。 */
```

<!-- source: src/routes/styles/components.css:5926 -->

### [src/routes/styles/components.css:5926](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5926)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* プレビューの投稿は読むためではなく雰囲気を見るためのもの。操作は無効にする。 */
```

<!-- source: src/routes/styles/components.css:5934 -->

### [src/routes/styles/components.css:5934](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5934)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* Emoji is a full center-pane page, with the palette above creation and management. */
```

<!-- source: src/routes/styles/components.css:5981 -->

### [src/routes/styles/components.css:5981](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5981)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- landing（未サインインの TOP） --- */
```

<!-- source: src/routes/styles/components.css:5982 -->

### [src/routes/styles/components.css:5982](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5982)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* アプリの殻を外した全幅のページ。/about と同じ部品（見出し・見本）を使い、
   面で区切るのはヒーローと締めだけにする。文は短く、違いは実物で見せる。 */
```

<!-- source: src/routes/styles/components.css:5998 -->

### [src/routes/styles/components.css:5998](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L5998)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 認証確認中はランディングを隠し、スピナーだけを出す。サインイン済みの人に一瞬も見せない。
   ハイドレーションより前にも効くよう、auth-init.js が付ける属性で切り替える。 */
```

<!-- source: src/routes/styles/components.css:6041 -->

### [src/routes/styles/components.css:6041](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L6041)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ヒーロー：キャッチコピーと botたん。 */
```

<!-- source: src/routes/styles/components.css:6094 -->

### [src/routes/styles/components.css:6094](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L6094)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 背景は透過済みで、どのテーマの地にもそのまま載る。脚の途中で切れている下端だけ薄く消す。
   色ではなくアルファの指定なので生の #000 でよい。 */
```

<!-- source: src/routes/styles/components.css:6123 -->

### [src/routes/styles/components.css:6123](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L6123)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 3本柱：文と実物を並べ、行ごとに左右を入れ替える。 */
```

<!-- source: src/routes/styles/components.css:6143 -->

### [src/routes/styles/components.css:6143](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L6143)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ふつうのSNSの場合は、薄く小さく1行だけ。主役は下の見出し。 */
```

<!-- source: src/routes/styles/components.css:6198 -->

### [src/routes/styles/components.css:6198](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L6198)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ゆるくつながる：押して試せる投稿1件。 */
```

<!-- source: src/routes/styles/components.css:6229 -->

### [src/routes/styles/components.css:6229](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L6229)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* いまのNagi：実投稿を読むための形で並べる。広い画面では2列で、左右のカードの高さをそろえる。 */
```

<!-- source: src/routes/styles/components.css:6275 -->

### [src/routes/styles/components.css:6275](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L6275)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 長い投稿と返信は数行で切る。続きはスレッドで読める。 */
```

<!-- source: src/routes/styles/components.css:6353 -->

### [src/routes/styles/components.css:6353](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L6353)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 循環の輪：書く → つながる → 振り返る → また書く。点は下の各柱へのリンク。
   普段は無彩色。カーソルを当てた点と、そこから次へ向かう矢印だけがじわっと色づく。 */
```

<!-- source: src/routes/styles/components.css:6362 -->

### [src/routes/styles/components.css:6362](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L6362)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 輪の矢印だけを全面に広げる。点や中央のアイコンの svg には効かせない。 */
```

<!-- source: src/routes/styles/components.css:6388 -->

### [src/routes/styles/components.css:6388](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L6388)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 灯った矢印は点線が進む向きへ少し流れて、次へ向かうことを示す。 */
```

<!-- source: src/routes/styles/components.css:6494 -->

### [src/routes/styles/components.css:6494](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/components.css#L6494)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 3本目のあとに置き、1へ戻る導線で輪を閉じる。 */
```

## src/routes/styles/shell.css

<!-- source: src/routes/styles/shell.css:1 -->

### [src/routes/styles/shell.css:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L1)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* App shell: 3-column responsive layout (tomarigi-style) */
```

<!-- source: src/routes/styles/shell.css:18 -->

### [src/routes/styles/shell.css:18](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L18)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 紹介ページ（/about）だけは右レールを外し、そのぶん本文を広げる。
   シェル全体の幅と左ナビの位置は他のページと同じなので、遷移しても左側は動かない。 */
```

<!-- source: src/routes/styles/shell.css:24 -->

### [src/routes/styles/shell.css:24](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L24)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- sidebars --- */
```

<!-- source: src/routes/styles/shell.css:76 -->

### [src/routes/styles/shell.css:76](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L76)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 未読バッジはアイコンの右上に重ねる。色は tokens.css のテーマ追従トークンのみ使用。 */
```

<!-- source: src/routes/styles/shell.css:138 -->

### [src/routes/styles/shell.css:138](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L138)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* account card at the bottom of the left sidebar */
```

<!-- source: src/routes/styles/shell.css:197 -->

### [src/routes/styles/shell.css:197](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L197)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* right sidebar */
```

<!-- source: src/routes/styles/shell.css:201 -->

### [src/routes/styles/shell.css:201](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L201)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 検索ボックス。ルーペを入力欄の内側に重ねる（padding で文字の開始位置をずらす）。 */
```

<!-- source: src/routes/styles/shell.css:227 -->

### [src/routes/styles/shell.css:227](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L227)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* フォーカスリングは base.css の :focus-visible が全体に効いているので指定しない。 */
```

<!-- source: src/routes/styles/shell.css:269 -->

### [src/routes/styles/shell.css:269](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L269)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- feed tabs --- */
```

<!-- source: src/routes/styles/shell.css:314 -->

### [src/routes/styles/shell.css:314](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L314)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/*
 * タブを増やせるので、4本以上は等分をやめて横スクロールにする。
 * 収まるうちは余白を分け合ってバーいっぱいに広げ（左に寄って右が空かないように）、
 * 収まらなくなったときだけ文字幅のまま横へ流す。
 */
```

<!-- source: src/routes/styles/shell.css:334 -->

### [src/routes/styles/shell.css:334](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L334)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ＋ はスクロールしても必ず手が届く位置に貼り付けておく。 */
```

<!-- source: src/routes/styles/shell.css:345 -->

### [src/routes/styles/shell.css:345](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L345)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 余白で伸ばすのはタブだけ。＋ まで伸びると、右端に間延びしたボタンが残る。 */
```

<!-- source: src/routes/styles/shell.css:352 -->

### [src/routes/styles/shell.css:352](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L352)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* チャンネルタブから元のチャンネルページへ。バナーや追加ボタンは向こうにある。 */
```

<!-- source: src/routes/styles/shell.css:364 -->

### [src/routes/styles/shell.css:364](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L364)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- mobile top bar & bottom nav (hidden on desktop) --- */
```

<!-- source: src/routes/styles/shell.css:370 -->

### [src/routes/styles/shell.css:370](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L370)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- compact desktop: keep the full sidebar, hide the right rail --- */
```

<!-- source: src/routes/styles/shell.css:381 -->

### [src/routes/styles/shell.css:381](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L381)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- tablet: icon rail --- */
```

<!-- source: src/routes/styles/shell.css:416 -->

### [src/routes/styles/shell.css:416](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L416)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- mobile: single column + bottom nav --- */
```

<!-- source: src/routes/styles/shell.css:421 -->

### [src/routes/styles/shell.css:421](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L421)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* sticky な .mobile-top は .shell の外側に積まれるので、100dvh のままだと
		   中身が短くてもヘッダ高の分だけ縦に動いてしまう */
```

<!-- source: src/routes/styles/shell.css:471 -->

### [src/routes/styles/shell.css:471](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L471)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 5項目でも縮められるように、コンテンツ幅より小さくなることを許す。 */
```

<!-- source: src/routes/styles/shell.css:486 -->

### [src/routes/styles/shell.css:486](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L486)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 長いラベル（英語の Notifications など）は折り返さず省略する。 */
```

<!-- source: src/routes/styles/shell.css:501 -->

### [src/routes/styles/shell.css:501](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/shell.css#L501)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 5項目が並ぶ細い端末ではラベルをもう一段小さくする。 */
```

## src/routes/styles/tokens.css

<!-- source: src/routes/styles/tokens.css:1 -->

### [src/routes/styles/tokens.css:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L1)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ---------------------------------------------------------------
 * Design tokens — the only file where raw colors may appear.
 * Explicit data-theme values override the operating-system setting.
 * --------------------------------------------------------------- */
```

<!-- source: src/routes/styles/tokens.css:7 -->

### [src/routes/styles/tokens.css:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L7)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ゼンカツのプレイ画面は、サイトのテーマに関わらず黒系で統一する。 */
```

<!-- source: src/routes/styles/tokens.css:16 -->

### [src/routes/styles/tokens.css:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L16)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* パネル面。surface より一段手前に出す（結果画面の枠はすべてこの面に乗る）。 */
```

<!-- source: src/routes/styles/tokens.css:18 -->

### [src/routes/styles/tokens.css:18](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L18)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* コンボは追い風と別の色で示す。追い風が定常なのに対し、コンボは見つけもの。 */
```

<!-- source: src/routes/styles/tokens.css:21 -->

### [src/routes/styles/tokens.css:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L21)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* アドベントカレンダーも夜のツリーとして、サイトのテーマに関わらず同じ色で描く。
	   カードの PNG（api/advent-card.tsx の ADVENT_COLOR）と同じ値にそろえる。 */
```

<!-- source: src/routes/styles/tokens.css:45 -->

### [src/routes/styles/tokens.css:45](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L45)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* supplied palette */
```

<!-- source: src/routes/styles/tokens.css:54 -->

### [src/routes/styles/tokens.css:54](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L54)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* semantic: surfaces */
```

<!-- source: src/routes/styles/tokens.css:66 -->

### [src/routes/styles/tokens.css:66](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L66)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* semantic: content */
```

<!-- source: src/routes/styles/tokens.css:75 -->

### [src/routes/styles/tokens.css:75](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L75)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* semantic: lines & focus */
```

<!-- source: src/routes/styles/tokens.css:80 -->

### [src/routes/styles/tokens.css:80](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L80)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* semantic: brand and interaction */
```

<!-- source: src/routes/styles/tokens.css:87 -->

### [src/routes/styles/tokens.css:87](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L87)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 塗りボタンのホバー。accent-strong は明るいテーマで暗くなり文字が沈むので、
	   どのテーマでもアクセントを白へ寄せて明るくする（文字とのコントラストも上がる）。 */
```

<!-- source: src/routes/styles/tokens.css:95 -->

### [src/routes/styles/tokens.css:95](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L95)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* semantic: badges — bot はブランド色、超ポジティブLvはティアごとに別系統の色相 */
```

<!-- source: src/routes/styles/tokens.css:98 -->

### [src/routes/styles/tokens.css:98](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L98)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 称号（日記でもらう）。ティア色と混ざらないよう緑系にする */
```

<!-- source: src/routes/styles/tokens.css:109 -->

### [src/routes/styles/tokens.css:109](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L109)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* Lv.100+ は Bluesky 側のラベルが頭打ちになる先。特別扱いでグラデーションにする */
```

<!-- source: src/routes/styles/tokens.css:114 -->

### [src/routes/styles/tokens.css:114](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L114)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* semantic: states */
```

<!-- source: src/routes/styles/tokens.css:122 -->

### [src/routes/styles/tokens.css:122](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L122)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 危険ボタンのホバー。濃い文字色へ少し寄せる（明るいテーマでは暗く、暗いテーマでは明るくなり、
	   どちらでも文字とのコントラストが上がる）。 */
```

<!-- source: src/routes/styles/tokens.css:126 -->

### [src/routes/styles/tokens.css:126](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L126)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 日記の感情グラフ。明るい気分は暖色、落ち込みは寒色、帯と中央値は無彩色。 */
```

<!-- source: src/routes/styles/tokens.css:130 -->

### [src/routes/styles/tokens.css:130](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L130)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 帯のグラデーション。沈んだ（-5）→ 明るい（+5）。参考: 気分記録アプリの5段階の色。 */
```

<!-- source: src/routes/styles/tokens.css:137 -->

### [src/routes/styles/tokens.css:137](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L137)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* about の機能カードのカテゴリ色。列見出しの小さな点にだけ使い、4系統を見分けさせる。
	   Nagi の落ち着いた調子を壊さないよう彩度は低めに揃える。 */
```

<!-- source: src/routes/styles/tokens.css:144 -->

### [src/routes/styles/tokens.css:144](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L144)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* bubbles: 自分は青、リスト内はミント、botたんは水色。枠線は共通にする。 */
```

<!-- source: src/routes/styles/tokens.css:154 -->

### [src/routes/styles/tokens.css:154](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L154)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* semantic: panels — outer surfaces recede so bubbles and content remain primary */
```

<!-- source: src/routes/styles/tokens.css:160 -->

### [src/routes/styles/tokens.css:160](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L160)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* elevation */
```

<!-- source: src/routes/styles/tokens.css:164 -->

### [src/routes/styles/tokens.css:164](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L164)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* layout */
```

<!-- source: src/routes/styles/tokens.css:167 -->

### [src/routes/styles/tokens.css:167](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L167)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* semantic: 全肯定カード — レアリティの枠色と、属性のアイコン色 */
```

<!-- source: src/routes/styles/tokens.css:180 -->

### [src/routes/styles/tokens.css:180](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L180)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- カード背景画像の調整ノブ（AffirmationCard の .card-art / .card-art-veil） --- */
```

<!-- source: src/routes/styles/tokens.css:181 -->

### [src/routes/styles/tokens.css:181](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L181)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ベールの一番薄いところ。絵をどこまで見せるか。上げるほど文字が読みやすく絵が沈む。 */
```

<!-- source: src/routes/styles/tokens.css:183 -->

### [src/routes/styles/tokens.css:183](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L183)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 図鑑の升目では文字が小さいので、絵そのものを薄くする。 */
```

<!-- source: src/routes/styles/tokens.css:185 -->

### [src/routes/styles/tokens.css:185](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L185)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* フレーバー欄の帯。背景ありのときだけ半透明にして下の絵を透かす。 */
```

<!-- source: src/routes/styles/tokens.css:187 -->

### [src/routes/styles/tokens.css:187](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L187)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 絵のどこを見せるか。カード比より縦長の画像を用意したときだけ効く（cover の切り取り位置）。 */
```

<!-- source: src/routes/styles/tokens.css:196 -->

### [src/routes/styles/tokens.css:196](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L196)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* radii and spacing: content surfaces use this fixed scale */
```

<!-- source: src/routes/styles/tokens.css:216 -->

### [src/routes/styles/tokens.css:216](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L216)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* supplied palette */
```

<!-- source: src/routes/styles/tokens.css:283 -->

### [src/routes/styles/tokens.css:283](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L283)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 日記の感情グラフ。明るい気分は暖色、落ち込みは寒色、帯と中央値は無彩色。 */
```

<!-- source: src/routes/styles/tokens.css:323 -->

### [src/routes/styles/tokens.css:323](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L323)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- カード背景画像の調整ノブ（AffirmationCard の .card-art / .card-art-veil） --- */
```

<!-- source: src/routes/styles/tokens.css:324 -->

### [src/routes/styles/tokens.css:324](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L324)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ベールの一番薄いところ。絵をどこまで見せるか。上げるほど文字が読みやすく絵が沈む。 */
```

<!-- source: src/routes/styles/tokens.css:326 -->

### [src/routes/styles/tokens.css:326](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L326)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 図鑑の升目では文字が小さいので、絵そのものを薄くする。 */
```

<!-- source: src/routes/styles/tokens.css:328 -->

### [src/routes/styles/tokens.css:328](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L328)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* フレーバー欄の帯。背景ありのときだけ半透明にして下の絵を透かす。 */
```

<!-- source: src/routes/styles/tokens.css:330 -->

### [src/routes/styles/tokens.css:330](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L330)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 絵のどこを見せるか。カード比より縦長の画像を用意したときだけ効く（cover の切り取り位置）。 */
```

<!-- source: src/routes/styles/tokens.css:406 -->

### [src/routes/styles/tokens.css:406](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L406)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 日記の感情グラフ。明るい気分は暖色、落ち込みは寒色、帯と中央値は無彩色。 */
```

<!-- source: src/routes/styles/tokens.css:445 -->

### [src/routes/styles/tokens.css:445](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L445)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* --- カード背景画像の調整ノブ（AffirmationCard の .card-art / .card-art-veil） --- */
```

<!-- source: src/routes/styles/tokens.css:446 -->

### [src/routes/styles/tokens.css:446](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L446)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ベールの一番薄いところ。絵をどこまで見せるか。上げるほど文字が読みやすく絵が沈む。 */
```

<!-- source: src/routes/styles/tokens.css:448 -->

### [src/routes/styles/tokens.css:448](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L448)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 図鑑の升目では文字が小さいので、絵そのものを薄くする。 */
```

<!-- source: src/routes/styles/tokens.css:450 -->

### [src/routes/styles/tokens.css:450](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L450)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* フレーバー欄の帯。背景ありのときだけ半透明にして下の絵を透かす。 */
```

<!-- source: src/routes/styles/tokens.css:452 -->

### [src/routes/styles/tokens.css:452](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L452)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* 絵のどこを見せるか。カード比より縦長の画像を用意したときだけ効く（cover の切り取り位置）。 */
```

<!-- source: src/routes/styles/tokens.css:465 -->

### [src/routes/styles/tokens.css:465](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/styles/tokens.css#L465)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
/* ---------------------------------------------------------------
 * Color themes
 * data-theme controls brightness; data-palette controls hue. Keep
 * those axes independent so every palette supports system/light/dark.
 * --------------------------------------------------------------- */
```

## tests/e2e/diary-navigation.spec.ts

<!-- source: tests/e2e/diary-navigation.spec.ts:33 -->

### [tests/e2e/diary-navigation.spec.ts:33](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/diary-navigation.spec.ts#L33)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// Return the old entry only if the UI actually requests a range containing it.
```

<!-- source: tests/e2e/diary-navigation.spec.ts:134 -->

### [tests/e2e/diary-navigation.spec.ts:134](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/diary-navigation.spec.ts#L134)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// A date takes precedence even when the URL also requests Chronicle.
```

<!-- source: tests/e2e/diary-navigation.spec.ts:138 -->

### [tests/e2e/diary-navigation.spec.ts:138](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/diary-navigation.spec.ts#L138)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// One selection is shared by the month calendar and the mood graph.
```

<!-- source: tests/e2e/diary-navigation.spec.ts:150 -->

### [tests/e2e/diary-navigation.spec.ts:150](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/diary-navigation.spec.ts#L150)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// Coming back from the chronicle keeps the month that was open (the date is dropped).
```

<!-- source: tests/e2e/diary-navigation.spec.ts:156 -->

### [tests/e2e/diary-navigation.spec.ts:156](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/diary-navigation.spec.ts#L156)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// Reproduce the original same-route navigation from a Chronicle entry.
```

<!-- source: tests/e2e/diary-navigation.spec.ts:164 -->

### [tests/e2e/diary-navigation.spec.ts:164](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/diary-navigation.spec.ts#L164)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// Deselecting on the mood graph keeps the month; selecting on the calendar brings the date back.
```

<!-- source: tests/e2e/diary-navigation.spec.ts:172 -->

### [tests/e2e/diary-navigation.spec.ts:172](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/diary-navigation.spec.ts#L172)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// Clicking inside the detail keeps the day; clicking outside or pressing Escape clears it.
```

<!-- source: tests/e2e/diary-navigation.spec.ts:182 -->

### [tests/e2e/diary-navigation.spec.ts:182](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/diary-navigation.spec.ts#L182)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// Month navigation.
```

<!-- source: tests/e2e/diary-navigation.spec.ts:219 -->

### [tests/e2e/diary-navigation.spec.ts:219](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/diary-navigation.spec.ts#L219)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 1年の投稿数 [1,4,5,9,10,12,19,20,32] を3等分すると 12件は「中」。
```

<!-- source: tests/e2e/diary-navigation.spec.ts:260 -->

### [tests/e2e/diary-navigation.spec.ts:260](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/diary-navigation.spec.ts#L260)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 気分は感情グラフのステータス行（日付見出し）側に出す。気分がない日は日付だけ。
```

## tests/e2e/guest-hero.spec.ts

<!-- source: tests/e2e/guest-hero.spec.ts:11 -->

### [tests/e2e/guest-hero.spec.ts:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/guest-hero.spec.ts#L11)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 初回描画を認証ストアの起動前で止め、事前生成HTMLそのものを検証する。
```

## tests/e2e/tag-palette.spec.ts

<!-- source: tests/e2e/tag-palette.spec.ts:20 -->

### [tests/e2e/tag-palette.spec.ts:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/tag-palette.spec.ts#L20)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// AppView は空で返す（設定同期も「サーバー未保存」になる）。
```

<!-- source: tests/e2e/tag-palette.spec.ts:51 -->

### [tests/e2e/tag-palette.spec.ts:51](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/tag-palette.spec.ts#L51)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// お気に入り済みの diary は「最近使った」に重ねて出さない。
```

<!-- source: tests/e2e/tag-palette.spec.ts:66 -->

### [tests/e2e/tag-palette.spec.ts:66](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/tag-palette.spec.ts#L66)

分類: 検証・再現条件。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// 直後にそのまま打ち続けられる（後ろに空白を補っている）。
```

## tsconfig.json

<!-- source: tsconfig.json:16 -->

### [tsconfig.json:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tsconfig.json#L16)

分類: 仕様・設計の根拠。対応仕様: [ui-platform](../../specs/ui-platform/spec.md#requirements)。

```text
// Path aliases are handled by https://svelte.dev/docs/kit/configuration#alias
	// except $lib which is handled by https://svelte.dev/docs/kit/configuration#files
	//
	// To make changes to top-level options such as include and exclude, we recommend extending
	// the generated config; see https://svelte.dev/docs/kit/configuration#typescript
```
