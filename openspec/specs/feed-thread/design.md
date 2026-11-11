# feed-thread：設計判断・コメント出典

この文書は初期仕様化時点のコメント原文を保存する設計資料である。現在の振る舞い・検証条件は [spec.md](spec.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/components/ChatBubble.svelte

<!-- source: src/lib/components/ChatBubble.svelte:109 -->

### [src/lib/components/ChatBubble.svelte:109](../../../src/lib/components/ChatBubble.svelte#L109)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** ニュース引用ブロックの botたんヘッダーに使う実データ。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:113 -->

### [src/lib/components/ChatBubble.svelte:113](../../../src/lib/components/ChatBubble.svelte#L113)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** ニュースコメント等、投稿と同じ見た目だけを使う読み取り専用表示。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:115 -->

### [src/lib/components/ChatBubble.svelte:115](../../../src/lib/components/ChatBubble.svelte#L115)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** ブログ本文を別に表示するページ向けの編集・削除 UI。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:120 -->

### [src/lib/components/ChatBubble.svelte:120](../../../src/lib/components/ChatBubble.svelte#L120)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** ブログの見出し位置でタイトルを編集する場合に指定。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:122 -->

### [src/lib/components/ChatBubble.svelte:122](../../../src/lib/components/ChatBubble.svelte#L122)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** APIのローリング更新などで信頼できる日時が無い読み取り専用表示に使う。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:124 -->

### [src/lib/components/ChatBubble.svelte:124](../../../src/lib/components/ChatBubble.svelte#L124)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 省略時の表示行数。未指定時は CSS の 6 行。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:126 -->

### [src/lib/components/ChatBubble.svelte:126](../../../src/lib/components/ChatBubble.svelte#L126)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 画像の初期表示枚数上限。未指定時は制限なし。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:128 -->

### [src/lib/components/ChatBubble.svelte:128](../../../src/lib/components/ChatBubble.svelte#L128)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** リンクカードの初期表示枚数上限。未指定時は制限なし。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:130 -->

### [src/lib/components/ChatBubble.svelte:130](../../../src/lib/components/ChatBubble.svelte#L130)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** falseなら本文を最初から全表示し、「続きを読む」を出さない。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:132 -->

### [src/lib/components/ChatBubble.svelte:132](../../../src/lib/components/ChatBubble.svelte#L132)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 読み取り専用の実体（日記）だけが明示する。合成コメントには渡さない。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:134 -->

### [src/lib/components/ChatBubble.svelte:134](../../../src/lib/components/ChatBubble.svelte#L134)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 端末だけにある未サインイン投稿。プロフィール導線を作らず専用アイコンを使う。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:136 -->

### [src/lib/components/ChatBubble.svelte:136](../../../src/lib/components/ChatBubble.svelte#L136)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** AppViewを使わない開発プレビュー向けの訳文。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:138 -->

### [src/lib/components/ChatBubble.svelte:138](../../../src/lib/components/ChatBubble.svelte#L138)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 記事内コメントなど、投稿時刻のリンク先を現在のページに保つ。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:146 -->

### [src/lib/components/ChatBubble.svelte:146](../../../src/lib/components/ChatBubble.svelte#L146)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 運営に伝えるダイアログ。'reaction' は自分の投稿に付いたリアクションを伝えるとき。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:150 -->

### [src/lib/components/ChatBubble.svelte:150](../../../src/lib/components/ChatBubble.svelte#L150)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// どちらのボタンでコンポーザーを開いたか。引用は composeMode とは別枠のスロットで、
	// 返信中に Nagi のスレッドURLを貼れば「返信＋引用」になる（レコードは両立できる）。
```

<!-- source: src/lib/components/ChatBubble.svelte:161 -->

### [src/lib/components/ChatBubble.svelte:161](../../../src/lib/components/ChatBubble.svelte#L161)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 編集は返信/引用と違い、下に新しい吹き出しを出さず、この投稿の吹き出し内でその場編集する。
```

<!-- source: src/lib/components/ChatBubble.svelte:166 -->

### [src/lib/components/ChatBubble.svelte:166](../../../src/lib/components/ChatBubble.svelte#L166)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// standard.site の document として保存された記事。リンクカードを本文の行ごとに置けるので
	// 通常投稿の4枚の上限を掛けない（com.suibari.nagi.post のままの旧記事は4枚まで）。
```

<!-- source: src/lib/components/ChatBubble.svelte:172 -->

### [src/lib/components/ChatBubble.svelte:172](../../../src/lib/components/ChatBubble.svelte#L172)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 編集前から付いていた動画（外すと undefined）と、編集で付け直した動画。
```

<!-- source: src/lib/components/ChatBubble.svelte:176 -->

### [src/lib/components/ChatBubble.svelte:176](../../../src/lib/components/ChatBubble.svelte#L176)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 編集中の画像・動画をまとめてぼかすか。CWメニューの1項目で、全件へ揃えて保存する。 */
```

<!-- source: src/lib/components/ChatBubble.svelte:194 -->

### [src/lib/components/ChatBubble.svelte:194](../../../src/lib/components/ChatBubble.svelte#L194)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * 記事の編集で、画像（id ごと）が本文に書かれるときの URL。既存の画像は AppView の
	 * URL から、足した画像は手元で計算した CID から作る。外した画像の行を本文から消すのと、
	 * 保存前に添付の無い画像行を落とすのに使う。
	 */
```

<!-- source: src/lib/components/ChatBubble.svelte:227 -->

### [src/lib/components/ChatBubble.svelte:227](../../../src/lib/components/ChatBubble.svelte#L227)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * standard.site の記事の編集では、URL だけの行のリンクカードと本文の画像を入力欄の中
	 * （行の下）に見せる。Android の素の textarea では重ねられないので従来の一覧に出す。
	 */
```

<!-- source: src/lib/components/ChatBubble.svelte:255 -->

### [src/lib/components/ChatBubble.svelte:255](../../../src/lib/components/ChatBubble.svelte#L255)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * 本文の画像行と画像の対応（Composer と同じ）。入力欄の中に出した画像は下の一覧に出さず、
	 * alt も本文の `![alt](url)` に合わせる。行を消した画像は保存しない。
	 */
```

<!-- source: src/lib/components/ChatBubble.svelte:279 -->

### [src/lib/components/ChatBubble.svelte:279](../../../src/lib/components/ChatBubble.svelte#L279)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 初めて本文に見えた画像は、添付にだけある alt を先に本文の行へ移す（消さないため）。
```

<!-- source: src/lib/components/ChatBubble.svelte:307 -->

### [src/lib/components/ChatBubble.svelte:307](../../../src/lib/components/ChatBubble.svelte#L307)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * ブログとして書かれた投稿は記事ページと同じ見た目にする。本文の行に置いた画像・リンクカードは
	 * その位置に出し、残りの画像の先頭を本文の上のヘッダー、それ以外を本文の後ろに出す。
	 * 先頭が見出しなだけの通常投稿と取り違えないよう、判定は post.article（と standard.site の
	 * document）だけを見る。
	 */
```

<!-- source: src/lib/components/ChatBubble.svelte:321 -->

### [src/lib/components/ChatBubble.svelte:321](../../../src/lib/components/ChatBubble.svelte#L321)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 自分のクロスポストにだけ付ける目印。返信・引用を Bluesky にも続けられることが分かるように。
	// 他人のクロスポストには付けない（AppView も作者本人にしか参照を返さない）。
```

<!-- source: src/lib/components/ChatBubble.svelte:324 -->

### [src/lib/components/ChatBubble.svelte:324](../../../src/lib/components/ChatBubble.svelte#L324)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 3行日記は行ごとに画像を添えるので、本文下のギャラリーには出さない。
```

<!-- source: src/lib/components/ChatBubble.svelte:326 -->

### [src/lib/components/ChatBubble.svelte:326](../../../src/lib/components/ChatBubble.svelte#L326)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// ヘッダーや本文に出した画像は本文下のギャラリーから外す（同じ画像を二度出さない）。
```

<!-- source: src/lib/components/ChatBubble.svelte:362 -->

### [src/lib/components/ChatBubble.svelte:362](../../../src/lib/components/ChatBubble.svelte#L362)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * この投稿への返信がこっそりスレッドに入るか。
	 *
	 * こっそりは「共有TLに出すかどうか」ではなく「どこに保存するか」を決めるので、
	 * 返信レコードにも必ず引き継ぐ必要がある。引き継ぎ損ねると、こっそりスレッドへの
	 * 返信だけが PDS の公開レコードとして書き出されてしまう。
	 *
	 * 判定はスレッドルートの URI で行う。threadKossori は CH 限定と合流していて、
	 * 保存先の判断には使えない（CH 限定はこっそりではない）。ルートが PDS 上にある
	 * 移行前のこっそり投稿だけは URI から分からないので、直接の返信のときに post.kossori で補う。
	 */
```

<!-- source: src/lib/components/ChatBubble.svelte:377 -->

### [src/lib/components/ChatBubble.svelte:377](../../../src/lib/components/ChatBubble.svelte#L377)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// リンクは URI から組む。こっそり投稿の URI は著者ではなく AppView の DID 配下なので、
	// author.did から組むとスレッドを開けない。
```

<!-- source: src/lib/components/ChatBubble.svelte:380 -->

### [src/lib/components/ChatBubble.svelte:380](../../../src/lib/components/ChatBubble.svelte#L380)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 外国語の投稿にだけ「選択したプロバイダーで翻訳」ボタンを出す。
```

<!-- source: src/lib/components/ChatBubble.svelte:387 -->

### [src/lib/components/ChatBubble.svelte:387](../../../src/lib/components/ChatBubble.svelte#L387)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 他人の投稿（botたんを含む）は運営に伝えられる。自分の投稿は、他人が付けたリアクションを伝えられる。
	// 端末保存のゲスト投稿は運営の手が届かないので出さない。
```

<!-- source: src/lib/components/ChatBubble.svelte:521 -->

### [src/lib/components/ChatBubble.svelte:521](../../../src/lib/components/ChatBubble.svelte#L521)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 画像ごとにCWを選べた頃の投稿は、1枚でも付いていれば全件をぼかす側へ寄せる。
```

<!-- source: src/lib/components/ChatBubble.svelte:543 -->

### [src/lib/components/ChatBubble.svelte:543](../../../src/lib/components/ChatBubble.svelte#L543)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// メンション等の候補が開いている場合、Esc はまず候補を閉じるために使われる。
```

<!-- source: src/lib/components/ChatBubble.svelte:554 -->

### [src/lib/components/ChatBubble.svelte:554](../../../src/lib/components/ChatBubble.svelte#L554)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * 投稿の編集・削除に standard.site の記事を追従させる。
	 * 権限が無い／記事化していない場合は黙って何もしない（Nagi 側の操作は成立している）。
	 */
```

<!-- source: src/lib/components/ChatBubble.svelte:570 -->

### [src/lib/components/ChatBubble.svelte:570](../../../src/lib/components/ChatBubble.svelte#L570)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// タイトルは本文先頭の見出しから引き直す。無ければ既存のタイトルを残す。
			// タグは渡さない。記事のタグは投稿モーダルの記事メタ欄で決まるもので、
			// 本文の facet からは復元できないため、本文編集では触らずに残す。
```

<!-- source: src/lib/components/ChatBubble.svelte:578 -->

### [src/lib/components/ChatBubble.svelte:578](../../../src/lib/components/ChatBubble.svelte#L578)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 記事側の同期失敗で Nagi の編集・削除を巻き戻すことはしない。
```

<!-- source: src/lib/components/ChatBubble.svelte:605 -->

### [src/lib/components/ChatBubble.svelte:605](../../../src/lib/components/ChatBubble.svelte#L605)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 添付に無い Nagi の画像行は保存しない（存在しない blob を指す画像になる）。
		// 記事の本文から行を消した画像は保存しない。
```

<!-- source: src/lib/components/ChatBubble.svelte:659 -->

### [src/lib/components/ChatBubble.svelte:659](../../../src/lib/components/ChatBubble.svelte#L659)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 旧チャンネル投稿の channel は updatePost が元レコードから引き継ぐ。
```

<!-- source: src/lib/components/ChatBubble.svelte:664 -->

### [src/lib/components/ChatBubble.svelte:664](../../../src/lib/components/ChatBubble.svelte#L664)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 楽観反映: このカードの本文/facets/画像を差し替え「編集済み」を立てる。AppView が
			// putRecord を取り込むと同じ内容へ収束するため、即時 refresh は呼ばない
			// （取り込み前は旧本文が返り楽観反映を打ち消してしまうため）。
```

<!-- source: src/lib/components/ChatBubble.svelte:688 -->

### [src/lib/components/ChatBubble.svelte:688](../../../src/lib/components/ChatBubble.svelte#L688)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// standard.site の記事にしてある投稿なら本文を追従させる。記事化していない
			// 投稿では何も起きない（編集をきっかけに勝手に公開はしない）。
```

<!-- source: src/lib/components/ChatBubble.svelte:708 -->

### [src/lib/components/ChatBubble.svelte:708](../../../src/lib/components/ChatBubble.svelte#L708)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// ネスト返信でも最初のルートを維持することで、公開範囲を含むスレッド設定を
		// 途中の返信が上書きしないようにする。引用は新しいスレッドなので継承しない。
```

<!-- source: src/lib/components/ChatBubble.svelte:712 -->

### [src/lib/components/ChatBubble.svelte:712](../../../src/lib/components/ChatBubble.svelte#L712)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 引用ボタン経路ではこの投稿そのものが引用元。返信中はURL貼り付けで付けた
		// 引用（あれば）がそのまま乗るので、返信と引用が同居する。
```

<!-- source: src/lib/components/ChatBubble.svelte:724 -->

### [src/lib/components/ChatBubble.svelte:724](../../../src/lib/components/ChatBubble.svelte#L724)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// こっそりは「共有TLに出すか」ではなく「どこに保存するか」の設定なので、
			// スレッドルートだけの所有にはできず、返信にも引き継ぐ。
```

<!-- source: src/lib/components/ChatBubble.svelte:733 -->

### [src/lib/components/ChatBubble.svelte:733](../../../src/lib/components/ChatBubble.svelte#L733)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 楽観カード →（サーバー確定後）本物のカード、と2段階で入れ替わるので、追従先は
		// postFollow に預けて描画のたびに引き直してもらう。ここで一度寄せるだけでは、
		// 差し替わった先（会話カードの中の自分の返信）を見失う。
```

<!-- source: src/lib/components/ChatBubble.svelte:749 -->

### [src/lib/components/ChatBubble.svelte:749](../../../src/lib/components/ChatBubble.svelte#L749)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 返信・引用はNagi内の投稿文脈を参照するため、Blueskyへはクロスポストしない。
```

<!-- source: src/lib/components/ChatBubble.svelte:752 -->

### [src/lib/components/ChatBubble.svelte:752](../../../src/lib/components/ChatBubble.svelte#L752)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 画面に出せない投稿（検索タブなど）では、postFollow が導線へ切り替える。
```

<!-- source: src/lib/components/ChatBubble.svelte:754 -->

### [src/lib/components/ChatBubble.svelte:754](../../../src/lib/components/ChatBubble.svelte#L754)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// こっそりは PDS に取りに行く相手が居ないので、AppView への即時反映は不要。
```

<!-- source: src/lib/components/ChatBubble.svelte:778 -->

### [src/lib/components/ChatBubble.svelte:778](../../../src/lib/components/ChatBubble.svelte#L778)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 3行日記の正本は TriLinesAt と共有の日記レコード。Nagi の投稿ではない。
```

<!-- source: src/lib/components/ChatBubble.svelte:784 -->

### [src/lib/components/ChatBubble.svelte:784](../../../src/lib/components/ChatBubble.svelte#L784)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// こっそりは PDS に正本が無いので AppView 側の手続きへ振り分ける（deletePost が判定）。
```

<!-- source: src/lib/components/ChatBubble.svelte:786 -->

### [src/lib/components/ChatBubble.svelte:786](../../../src/lib/components/ChatBubble.svelte#L786)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 記事にしてある投稿なら standard.site 側も消す。こっそりは記事化できないので空振りする。
```

<!-- source: src/lib/components/ChatBubble.svelte:798 -->

### [src/lib/components/ChatBubble.svelte:798](../../../src/lib/components/ChatBubble.svelte#L798)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!-- data-post-uri は投稿後の追従スクロールの目印。カード単位ではなく発言単位で寄せる。 -->
```

<!-- source: src/lib/components/ChatBubble.svelte:819 -->

### [src/lib/components/ChatBubble.svelte:819](../../../src/lib/components/ChatBubble.svelte#L819)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!-- ホバーで名刺、クリックで従来どおりプロフィールへ。 -->
```

<!-- source: src/lib/components/ChatBubble.svelte:863 -->

### [src/lib/components/ChatBubble.svelte:863](../../../src/lib/components/ChatBubble.svelte#L863)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!-- ブログの印は日時と同じ控えめな行に置く。カバー画像の上に札を重ねない。 -->
```

<!-- source: src/lib/components/ChatBubble.svelte:907 -->

### [src/lib/components/ChatBubble.svelte:907](../../../src/lib/components/ChatBubble.svelte#L907)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!-- 画像ボタンから動画も選べる。ブログとこっそりは動画を持てないので画像だけ。 -->
```

## src/lib/components/FeedHome.svelte

<!-- source: src/lib/components/FeedHome.svelte:2 -->

### [src/lib/components/FeedHome.svelte:2](../../../src/lib/components/FeedHome.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * フィードの画面。サインイン済みの TOP（`/`）と、誰でも開ける `/feed` が同じものを描く。
	 * 未サインインの TOP はランディング（landing/Landing.svelte）に譲り、
	 * タイムラインと端末保存の投稿は `/feed` で見せる。
	 * 投稿は左下／右下の FAB からポストモーダルで行う（+layout.svelte に常駐）。
	 * 今日のカードはゼンカツ（/cards）から引く。フィードに置くと毎日開く義務のように見えるため。
	 */
```

<!-- source: src/lib/components/FeedHome.svelte:17 -->

### [src/lib/components/FeedHome.svelte:17](../../../src/lib/components/FeedHome.svelte#L17)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!-- 見出しは $oauthReady のゲートの外に置く。ゲートの中だとプリレンダ結果がスピナーだけになる。
     並び（見出し → フィード）は guest-posts/privacy.test.ts が固定している。 -->
```

## src/lib/components/FeedPeek.svelte

<!-- source: src/lib/components/FeedPeek.svelte:17 -->

### [src/lib/components/FeedPeek.svelte:17](../../../src/lib/components/FeedPeek.svelte#L17)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * スワイプ中に隣から入ってくるタブの中身。キャッシュ済みなら先頭の数件をそのまま描き、
	 * 未取得ならこの時点で読み込みを始める（指を離す頃には出ていることが多い）。
	 * 見せるだけなので操作は受けない（呼び出し側で inert）。
	 */
```

<!-- source: src/lib/components/FeedPeek.svelte:24 -->

### [src/lib/components/FeedPeek.svelte:24](../../../src/lib/components/FeedPeek.svelte#L24)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 未ログインのホームはサインインへ送るので、中身は覗かせない。
```

<!-- source: src/lib/components/FeedPeek.svelte:27 -->

### [src/lib/components/FeedPeek.svelte:27](../../../src/lib/components/FeedPeek.svelte#L27)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 生成は読み込みを伴う副作用なので $derived には置かない（FeedShell と同じ）。
```

<!-- source: src/lib/components/FeedPeek.svelte:48 -->

### [src/lib/components/FeedPeek.svelte:48](../../../src/lib/components/FeedPeek.svelte#L48)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 覗き見なので失敗は黙って待機表示のまま。切り替えた先で本体がエラーを出す。
```

## src/lib/components/FeedShell.svelte

<!-- source: src/lib/components/FeedShell.svelte:18 -->

### [src/lib/components/FeedShell.svelte:18](../../../src/lib/components/FeedShell.svelte#L18)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * フィード1本の描画。タブ（ホーム/グローバル/カスタム/チャンネル/検索）はすべて
	 * これに spec を渡すだけで、取得経路の違いは resolveFeedTab が吸収する。
	 *
	 * spec.key ごとに Feed インスタンスをキャッシュするので、タブを行き来しても
	 * 読み込み位置とスクロール位置が残る（profile ページと同じ作り）。
	 */
```

<!-- source: src/lib/components/FeedShell.svelte:31 -->

### [src/lib/components/FeedShell.svelte:31](../../../src/lib/components/FeedShell.svelte#L31)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 生成は副作用（load を走らせる）なので $derived には置かない。
```

<!-- source: src/lib/components/FeedShell.svelte:46 -->

### [src/lib/components/FeedShell.svelte:46](../../../src/lib/components/FeedShell.svelte#L46)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 投稿直後の画面追従。楽観カード → 確定カードで DOM が入れ替わるので、
	// 並びが変わるたびに追従先を引き直す。
```

<!-- source: src/lib/components/FeedShell.svelte:50 -->

### [src/lib/components/FeedShell.svelte:50](../../../src/lib/components/FeedShell.svelte#L50)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// ポストモーダルからの投稿を拾う。楽観投稿は optimisticPosts が既に反映しているので、
	// ここはサーバー側の確定データ（botたんの返信予定など）へ寄せるための更新。
```

<!-- source: src/lib/components/FeedShell.svelte:59 -->

### [src/lib/components/FeedShell.svelte:59](../../../src/lib/components/FeedShell.svelte#L59)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 削除は今見ているタブだけでなく、キャッシュしている全タブへ伝播させる。 */
```

<!-- source: src/lib/components/FeedShell.svelte:63 -->

### [src/lib/components/FeedShell.svelte:63](../../../src/lib/components/FeedShell.svelte#L63)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 現在のタブを取り直す。ナビの再タップ（pageRefresh）から呼ぶ。 */
```

<!-- source: src/lib/components/FeedShell.svelte:67 -->

### [src/lib/components/FeedShell.svelte:67](../../../src/lib/components/FeedShell.svelte#L67)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * アカウントが変わったらキャッシュごと捨てる（本人向けフィードが混ざらないように）。
	 * spec.key には DID が入っているので、捨てたあと自然に取り直される。
	 */
```

<!-- source: src/lib/components/FeedShell.svelte:89 -->

### [src/lib/components/FeedShell.svelte:89](../../../src/lib/components/FeedShell.svelte#L89)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!-- 歓迎カードを必ずタブ直下に置き、その次に端末保存スレッドを通常フィードと同じ列で並べる。 -->
```

## src/lib/components/FeedSurface.svelte

<!-- source: src/lib/components/FeedSurface.svelte:30 -->

### [src/lib/components/FeedSurface.svelte:30](../../../src/lib/components/FeedSurface.svelte#L30)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** スワイプ中に隣から覗かせる中身。既定はキャッシュから描く FeedPeek。 */
```

<!-- source: src/lib/components/FeedSurface.svelte:36 -->

### [src/lib/components/FeedSurface.svelte:36](../../../src/lib/components/FeedSurface.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// Every activation uses the same refresh path, including returning to a cached tab.
```

<!-- source: src/lib/components/FeedSurface.svelte:86 -->

### [src/lib/components/FeedSurface.svelte:86](../../../src/lib/components/FeedSurface.svelte#L86)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/*
	 * スワイプの見た目。指に合わせて今のフィード（track）を横へずらし、空いた側から
	 * 隣のタブ（peek）を並走させる。離したら最後まで流してから URL を切り替えるか、元へ戻す。
	 * 止まっている間は transform を外す（中の position: fixed を壊さないため）。
	 */
```

<!-- source: src/lib/components/FeedSurface.svelte:94 -->

### [src/lib/components/FeedSurface.svelte:94](../../../src/lib/components/FeedSurface.svelte#L94)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** idle → drag →（settle で戻る | commit で流して切り替え → reveal で peek を消す）→ idle */
```

<!-- source: src/lib/components/FeedSurface.svelte:107 -->

### [src/lib/components/FeedSurface.svelte:107](../../../src/lib/components/FeedSurface.svelte#L107)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// モバイルの上部ヘッダは sticky なので、その下から覗かせる。
```

<!-- source: src/lib/components/FeedSurface.svelte:124 -->

### [src/lib/components/FeedSurface.svelte:124](../../../src/lib/components/FeedSurface.svelte#L124)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 先が無い側はゴムのように重くして、行き止まりだと分かるようにする。
```

<!-- source: src/lib/components/FeedSurface.svelte:154 -->

### [src/lib/components/FeedSurface.svelte:154](../../../src/lib/components/FeedSurface.svelte#L154)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 新しいタブが描かれた後で track を戻し、上に被せていた peek を短く溶かす。
```

<!-- source: src/lib/components/FeedSurface.svelte:221 -->

### [src/lib/components/FeedSurface.svelte:221](../../../src/lib/components/FeedSurface.svelte#L221)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/* ずらしている間だけ、はみ出した track でページが横スクロールしないようにする。 */
```

## src/lib/components/FeedTabsView.svelte

<!-- source: src/lib/components/FeedTabsView.svelte:2 -->

### [src/lib/components/FeedTabsView.svelte:2](../../../src/lib/components/FeedTabsView.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// フィードの唯一の画面（TOP の `/` に置く）。どのタブを出すかは `?tab=<id>` だけで決まる。
	// タブ構成はユーザー設定（$lib/feed-tabs）で、/settings/feed-tabs から編集する。
	// `/global` と `/affirmation` は昔の URL の互換として残してあり、中身はここと同じ。
	// `page.url.searchParams` はプリレンダ中に読めないので、親が $oauthReady の後でだけ描く。
```

<!-- source: src/lib/components/FeedTabsView.svelte:19 -->

### [src/lib/components/FeedTabsView.svelte:19](../../../src/lib/components/FeedTabsView.svelte#L19)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** TOP のヒーローが出ているときは、FeedShell の歓迎カードを重ねて出さない。 */
```

<!-- source: src/lib/components/FeedTabsView.svelte:34 -->

### [src/lib/components/FeedTabsView.svelte:34](../../../src/lib/components/FeedTabsView.svelte#L34)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// アカウントが変わったらキャッシュを捨てる。spec.key に DID が入っているだけでは、
	// 前のアカウントぶんのフィードがキャッシュに残り続ける。
```

<!-- source: src/lib/components/FeedTabsView.svelte:51 -->

### [src/lib/components/FeedTabsView.svelte:51](../../../src/lib/components/FeedTabsView.svelte#L51)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// ナビの「フィード」をもう一度押したときの取り直し。
```

<!-- source: src/lib/components/FeedTabsView.svelte:64 -->

### [src/lib/components/FeedTabsView.svelte:64](../../../src/lib/components/FeedTabsView.svelte#L64)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!-- ハッシュタグタブは閲覧専用。ミュートなどの操作はタグのページ側に置く。 -->
```

## src/lib/components/InlineRuns.svelte

<!-- source: src/lib/components/InlineRuns.svelte:35 -->

### [src/lib/components/InlineRuns.svelte:35](../../../src/lib/components/InlineRuns.svelte#L35)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/* 本文の絵文字は文字サイズの2倍に揃え、横長画像の比率も保つ。 */
```

<!-- source: src/lib/components/InlineRuns.svelte:36 -->

### [src/lib/components/InlineRuns.svelte:36](../../../src/lib/components/InlineRuns.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/* 長押しでタグのメニューを開くので、iOS のリンクプレビューと文字選択を出さない。 */
```

## src/lib/components/NewsQuoteCard.svelte

<!-- source: src/lib/components/NewsQuoteCard.svelte:24 -->

### [src/lib/components/NewsQuoteCard.svelte:24](../../../src/lib/components/NewsQuoteCard.svelte#L24)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!--
			botたんのコメントは吹き出しで出す。ニュース一覧（NewsCard）は ChatBubble を使って
			いるのに、引用のときだけ素のテキストで出ていて見え方が揃っていなかった。
			ここは既に ChatBubble の中なので、入れ子にせず共通の .bubble だけを借りる。
			話し手と時刻は QuoteFrame のヘッダーが出しているので重複させない。
		-->
```

<!-- source: src/lib/components/NewsQuoteCard.svelte:37 -->

### [src/lib/components/NewsQuoteCard.svelte:37](../../../src/lib/components/NewsQuoteCard.svelte#L37)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/* .bubble のしっぽ（::before が left: -8px）が切れないよう左に逃がす。 */
```

## src/lib/components/PostUnavailableNotice.svelte

<!-- source: src/lib/components/PostUnavailableNotice.svelte:22 -->

### [src/lib/components/PostUnavailableNotice.svelte:22](../../../src/lib/components/PostUnavailableNotice.svelte#L22)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 「あなたのPDS」は投稿者本人にしか成り立たない。スレッド内の他人の返信や引用先でも
	// 出てしまわないよう、ここで絞る。ゲスト投稿には PDS が無いので mine 相当は使わない。
```

## src/lib/components/QuoteCard.svelte

<!-- source: src/lib/components/QuoteCard.svelte:17 -->

### [src/lib/components/QuoteCard.svelte:17](../../../src/lib/components/QuoteCard.svelte#L17)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 3行日記は行ごとに画像を添えて描くので、本文と画像ギャラリーの代わりに日記の体裁で出す。
```

## src/lib/components/ReactionBar.svelte

<!-- source: src/lib/components/ReactionBar.svelte:33 -->

### [src/lib/components/ReactionBar.svelte:33](../../../src/lib/components/ReactionBar.svelte#L33)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 同じ投稿を複数箇所に表示するとき、楽観的な反応状態を共有する。 */
```

<!-- source: src/lib/components/ReactionBar.svelte:36 -->

### [src/lib/components/ReactionBar.svelte:36](../../../src/lib/components/ReactionBar.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** リアクション先の本人にだけ送信者を見せる。呼び出し元で所有者確認した場合のみ有効化する。 */
```

<!-- source: src/lib/components/ReactionBar.svelte:38 -->

### [src/lib/components/ReactionBar.svelte:38](../../../src/lib/components/ReactionBar.svelte#L38)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 履歴など、リアクションの表示だけを許可して追加・解除をさせない場所。 */
```

<!-- source: src/lib/components/ReactionBar.svelte:42 -->

### [src/lib/components/ReactionBar.svelte:42](../../../src/lib/components/ReactionBar.svelte#L42)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * カード枠を解放できる subject。**AppView の `isEligibleReactionCardTrigger` と対。**
	 *
	 * ゼンカツの提出とドローの控えにもリアクションは付くが、枠は開かない
	 * （開くとゲームが自分で供給を生み、レアリティ・インフレが速まる。docs/zenkatsu.md 8.6）。
	 * ここで絞らないと、サーバが 400 を返すたびに報酬のエラートーストが出る。
	 */
```

<!-- source: src/lib/components/ReactionBar.svelte:54 -->

### [src/lib/components/ReactionBar.svelte:54](../../../src/lib/components/ReactionBar.svelte#L54)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// The appview only learns about reactions via jetstream (a few seconds behind),
	// so we keep an optimistic local copy and ignore prop-driven resets for a while
	// after a local toggle — otherwise the next feed refresh would undo the click.
```

<!-- source: src/lib/components/ReactionBar.svelte:58 -->

### [src/lib/components/ReactionBar.svelte:58](../../../src/lib/components/ReactionBar.svelte#L58)

分類: ツール指示（削除対象外）。対応仕様: [feed-thread](spec.md#requirements)。

```text
// svelte-ignore state_referenced_locally -- initial snapshot; kept in sync by the $effect below
```

<!-- source: src/lib/components/ReactionBar.svelte:90 -->

### [src/lib/components/ReactionBar.svelte:90](../../../src/lib/components/ReactionBar.svelte#L90)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// カスタム絵文字は同じ :name: でも作者ごとに別物なので、item の URI で区別する。
```

<!-- source: src/lib/components/ReactionBar.svelte:97 -->

### [src/lib/components/ReactionBar.svelte:97](../../../src/lib/components/ReactionBar.svelte#L97)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// Shift+クリックの連続リアクションを取りこぼさないよう、直列化して順に流す。
	// 早期 return で捨てると、同じ絵文字の on→off が viewerReactionUri 未確定のまま
	// 削除に入って無言で失敗する。
```

<!-- source: src/lib/components/ReactionBar.svelte:131 -->

### [src/lib/components/ReactionBar.svelte:131](../../../src/lib/components/ReactionBar.svelte#L131)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 楽観表示用の自分。受け取った本人だけが送信者を見る仕様なので、
		// 他人の投稿への更新では自分のActor情報もリアクター配列へ足さない。
```

<!-- source: src/lib/components/ReactionBar.svelte:191 -->

### [src/lib/components/ReactionBar.svelte:191](../../../src/lib/components/ReactionBar.svelte#L191)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 新規追加では楽観描画されたリアクションボタンを待ち、その中央へ着地させる。
				// 既存ボタンの押下時も同じ基準を使い、パレットの「＋」位置へは出さない。
```

<!-- source: src/lib/components/ReactionBar.svelte:201 -->

### [src/lib/components/ReactionBar.svelte:201](../../../src/lib/components/ReactionBar.svelte#L201)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// リアクション自体の成功を確定してから、独立したカード報酬を請求する。
				// 報酬側の一時失敗で、PDSに作成済みのリアクションを巻き戻してはいけない。
```

## src/lib/components/ReactionStamp.svelte

<!-- source: src/lib/components/ReactionStamp.svelte:56 -->

### [src/lib/components/ReactionStamp.svelte:56](../../../src/lib/components/ReactionStamp.svelte#L56)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/* 透明度は transform の強い easing から分離し、消えていく過程を確実に見せる。 */
```

<!-- source: src/lib/components/ReactionStamp.svelte:137 -->

### [src/lib/components/ReactionStamp.svelte:137](../../../src/lib/components/ReactionStamp.svelte#L137)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/* 共通の animation:none で静止した巨大絵文字が残り、突然消える状態を避ける。 */
```

## src/lib/components/ReplyToViewerMark.svelte

<!-- source: src/lib/components/ReplyToViewerMark.svelte:6 -->

### [src/lib/components/ReplyToViewerMark.svelte:6](../../../src/lib/components/ReplyToViewerMark.svelte#L6)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!--
	自分への返信の吹き出しの上に置く一行。チャットアプリの「返信先」と同じ位置に出す。
	背景や縁の色は「誰の発言か」を表しているので使わず、文字で伝える。
-->
```

<!-- source: src/lib/components/ReplyToViewerMark.svelte:21 -->

### [src/lib/components/ReplyToViewerMark.svelte:21](../../../src/lib/components/ReplyToViewerMark.svelte#L21)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/* 吹き出しの左端に揃える: アバター(40px) + 間隔(12px) + 少し内側へ。 */
```

## src/lib/components/RichText.svelte

<!-- source: src/lib/components/RichText.svelte:11 -->

### [src/lib/components/RichText.svelte:11](../../../src/lib/components/RichText.svelte#L11)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * images は本文の `![alt](url)` を差し込むための添付画像。本文に書かれた URL が
	 * この投稿の添付と同じ blob を指すときだけ表示する（任意の外部画像は読み込まない）。
	 * 渡されなければ画像行は何も出さない（タイムラインでは添付はギャラリー側に出る）。
	 *
	 * linkCards は記事本文用。渡したときだけ URL だけの行をその位置のリンクカードにする
	 * （画像と同じく、カードの中身は投稿の linkCards から URL で引く）。カードの無い URL 行は
	 * 普通の段落として出す。渡さなければ段落の区切り方も含めて従来どおり。
	 */
```

<!-- source: src/lib/components/RichText.svelte:35 -->

### [src/lib/components/RichText.svelte:35](../../../src/lib/components/RichText.svelte#L35)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 行の URL は httpUrl で正規化済みなので、カード側も同じ形にそろえて引く。
```

<!-- source: src/lib/components/RichText.svelte:62 -->

### [src/lib/components/RichText.svelte:62](../../../src/lib/components/RichText.svelte#L62)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!--
	data-block は元の markdown のブロック種別。見出しは投稿内では h3〜h5 に落として
	いる（ページ見出しとの階層衝突を避けるため）ので、これが無いと「# 見出し」由来か
	「### 見出し」由来かを CSS から区別できない。記事タイトルの装飾で使う。
	.post-gap は入力にあったブロック間の空行ぶんの余白（.post-text がその行数だけ空ける）。
-->
```

## src/lib/components/ThreadUnit.svelte

<!-- source: src/lib/components/ThreadUnit.svelte:34 -->

### [src/lib/components/ThreadUnit.svelte:34](../../../src/lib/components/ThreadUnit.svelte#L34)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 別枠で表示済みの投稿など、このURIの吹き出しだけを通常タイムラインから省く。 */
```

<!-- source: src/lib/components/ThreadUnit.svelte:36 -->

### [src/lib/components/ThreadUnit.svelte:36](../../../src/lib/components/ThreadUnit.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 前回このフィードを見た時点より新しいスレッドか。カード全体に1本だけマークを出す。 */
```

<!-- source: src/lib/components/ThreadUnit.svelte:38 -->

### [src/lib/components/ThreadUnit.svelte:38](../../../src/lib/components/ThreadUnit.svelte#L38)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 新着スレッドの吹き出しをアバターから登場させる。 */
```

<!-- source: src/lib/components/ThreadUnit.svelte:40 -->

### [src/lib/components/ThreadUnit.svelte:40](../../../src/lib/components/ThreadUnit.svelte#L40)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 既存スレッドへ後着した返信を発言単位で登場させる。 */
```

<!-- source: src/lib/components/ThreadUnit.svelte:42 -->

### [src/lib/components/ThreadUnit.svelte:42](../../../src/lib/components/ThreadUnit.svelte#L42)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** false なら botたんの返信を折りたたまない（botたんのプロフィールの返信タブなど）。 */
```

<!-- source: src/lib/components/ThreadUnit.svelte:78 -->

### [src/lib/components/ThreadUnit.svelte:78](../../../src/lib/components/ThreadUnit.svelte#L78)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// Local optimistic replies override a fetched snapshot immediately.
```

<!-- source: src/lib/components/ThreadUnit.svelte:100 -->

### [src/lib/components/ThreadUnit.svelte:100](../../../src/lib/components/ThreadUnit.svelte#L100)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 会話グループ(group モード)では待機状態は conversation.awaitingBotReply が持つ。
```

<!-- source: src/lib/components/ThreadUnit.svelte:110 -->

### [src/lib/components/ThreadUnit.svelte:110](../../../src/lib/components/ThreadUnit.svelte#L110)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// こっそり投稿の URI は著者ではなく AppView の DID 配下なので、リンクは URI から組む。
```

<!-- source: src/lib/components/ThreadUnit.svelte:226 -->

### [src/lib/components/ThreadUnit.svelte:226](../../../src/lib/components/ThreadUnit.svelte#L226)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/* 省略中の .thread-gap（「N件のやりとり」）と同じ控えめな見た目にそろえる。 */
```

<!-- source: src/lib/components/ThreadUnit.svelte:232 -->

### [src/lib/components/ThreadUnit.svelte:232](../../../src/lib/components/ThreadUnit.svelte#L232)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/* 畳んだボタンは返信の吹き出しの代わりに立つので、上の間隔は .thread-reply の分だけにする。 */
```

<!-- source: src/lib/components/ThreadUnit.svelte:247 -->

### [src/lib/components/ThreadUnit.svelte:247](../../../src/lib/components/ThreadUnit.svelte#L247)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/* 展開後は吹き出しの下に付くので、吹き出し同士と同じ 8px だけ離す。 */
```

## src/lib/components/TranslateToggle.svelte

<!-- source: src/lib/components/TranslateToggle.svelte:44 -->

### [src/lib/components/TranslateToggle.svelte:44](../../../src/lib/components/TranslateToggle.svelte#L44)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** APIを使わない表示確認などで、訳文を直接描画する。 */
```

<!-- source: src/lib/components/TranslateToggle.svelte:46 -->

### [src/lib/components/TranslateToggle.svelte:46](../../../src/lib/components/TranslateToggle.svelte#L46)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** Markdown として描画しない（ゼンカツの作者の意図など、入力がただのテキスト欄のもの）。 */
```

<!-- source: src/lib/components/TranslateToggle.svelte:48 -->

### [src/lib/components/TranslateToggle.svelte:48](../../../src/lib/components/TranslateToggle.svelte#L48)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 記事本文の行に置いた画像・リンクカードをその位置に出す（RichText にそのまま渡す）。 */
```

<!-- source: src/lib/components/TranslateToggle.svelte:85 -->

### [src/lib/components/TranslateToggle.svelte:85](../../../src/lib/components/TranslateToggle.svelte#L85)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 内蔵翻訳が失敗した時のフォールバック用に、選択中プロバイダーの外部翻訳URLを組む。
```

<!-- source: src/lib/components/TranslateToggle.svelte:96 -->

### [src/lib/components/TranslateToggle.svelte:96](../../../src/lib/components/TranslateToggle.svelte#L96)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 翻訳可否やキャッシュ状態の変化はこちらだけで扱い、原文の開閉状態には触れない。
```

<!-- source: src/lib/components/TranslateToggle.svelte:106 -->

### [src/lib/components/TranslateToggle.svelte:106](../../../src/lib/components/TranslateToggle.svelte#L106)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 文字数ではなく実際の行数で「続きを読む」の要否を決める。
	// overflow: hidden でも scrollHeight は全文の高さを返すので、
	// 折りたたみ中／展開中どちらでも同じ判定になる。
```

## src/lib/components/feed-tabs/AddFeedTabDialog.svelte

<!-- source: src/lib/components/feed-tabs/AddFeedTabDialog.svelte:23 -->

### [src/lib/components/feed-tabs/AddFeedTabDialog.svelte:23](../../../src/lib/components/feed-tabs/AddFeedTabDialog.svelte#L23)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * タブの追加。種別を選ぶ1段目と、タグ／検索語入力／Bluesky フィード選択の2段目からなる。
	 * 「リスト」「カスタム」は中身が1つずつしか無いので、種別を選んだ時点で確定する。
	 */
```

<!-- source: src/lib/components/feed-tabs/AddFeedTabDialog.svelte:38 -->

### [src/lib/components/feed-tabs/AddFeedTabDialog.svelte:38](../../../src/lib/components/feed-tabs/AddFeedTabDialog.svelte#L38)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 検索は自由文だけに絞ったので、迷いやすい検索を一番下に置く。
```

<!-- source: src/lib/components/feed-tabs/AddFeedTabDialog.svelte:55 -->

### [src/lib/components/feed-tabs/AddFeedTabDialog.svelte:55](../../../src/lib/components/feed-tabs/AddFeedTabDialog.svelte#L55)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// Bluesky のフィードは Nagi の外の中身なので最後に置く。ログインしていないと読めない。
```

<!-- source: src/lib/components/feed-tabs/AddFeedTabDialog.svelte:68 -->

### [src/lib/components/feed-tabs/AddFeedTabDialog.svelte:68](../../../src/lib/components/feed-tabs/AddFeedTabDialog.svelte#L68)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** list / custom は中身が1つなので、既にあるなら選ばせない。 */
```

<!-- source: src/lib/components/feed-tabs/AddFeedTabDialog.svelte:87 -->

### [src/lib/components/feed-tabs/AddFeedTabDialog.svelte:87](../../../src/lib/components/feed-tabs/AddFeedTabDialog.svelte#L87)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 組み込みタブは id を固定にして `/feed?tab=global` を端末間で安定させる。
```

<!-- source: src/lib/components/feed-tabs/AddFeedTabDialog.svelte:91 -->

### [src/lib/components/feed-tabs/AddFeedTabDialog.svelte:91](../../../src/lib/components/feed-tabs/AddFeedTabDialog.svelte#L91)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// --- ハッシュタグタブ -----------------------------------------------------
```

<!-- source: src/lib/components/feed-tabs/AddFeedTabDialog.svelte:101 -->

### [src/lib/components/feed-tabs/AddFeedTabDialog.svelte:101](../../../src/lib/components/feed-tabs/AddFeedTabDialog.svelte#L101)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// --- 検索タブ -------------------------------------------------------------
```

<!-- source: src/lib/components/feed-tabs/AddFeedTabDialog.svelte:103 -->

### [src/lib/components/feed-tabs/AddFeedTabDialog.svelte:103](../../../src/lib/components/feed-tabs/AddFeedTabDialog.svelte#L103)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 検索は自由文だけ。先頭に # を打ったらタグの意図とみなし、ハッシュタグの入力へ移す。
```

<!-- source: src/lib/components/feed-tabs/AddFeedTabDialog.svelte:121 -->

### [src/lib/components/feed-tabs/AddFeedTabDialog.svelte:121](../../../src/lib/components/feed-tabs/AddFeedTabDialog.svelte#L121)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// --- Bluesky フィードタブ ---------------------------------------------------
	// 権限は Bluesky 連携（クロスポストと同じオプトイン）で付く。無ければ再認可へ案内する。
```

<!-- source: src/lib/components/feed-tabs/AddFeedTabDialog.svelte:157 -->

### [src/lib/components/feed-tabs/AddFeedTabDialog.svelte:157](../../../src/lib/components/feed-tabs/AddFeedTabDialog.svelte#L157)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** Bluesky のホームタイムライン（フォロー中）。保存済みフィードとは別に、いつでも選べる。 */
```

<!-- source: src/lib/components/feed-tabs/AddFeedTabDialog.svelte:191 -->

### [src/lib/components/feed-tabs/AddFeedTabDialog.svelte:191](../../../src/lib/components/feed-tabs/AddFeedTabDialog.svelte#L191)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!-- 背景クリックで閉じる。アプリの他のモーダルと同じ扱い。 -->
```

<!-- source: src/lib/components/feed-tabs/AddFeedTabDialog.svelte:354 -->

### [src/lib/components/feed-tabs/AddFeedTabDialog.svelte:354](../../../src/lib/components/feed-tabs/AddFeedTabDialog.svelte#L354)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/*
	 * ダイアログは max-height 付きの縦 flex。.feed-tab-kinds は overflow を持つので、
	 * あふれると高さ0近くまで縮められる。フォロー中の1件は縮めず、あふれた分は
	 * 保存済み一覧（.bsky-saved-feeds）のスクロールだけで受け持つ。
	 */
```

## src/lib/components/feed-tabs/FeedTabPreview.svelte

<!-- source: src/lib/components/feed-tabs/FeedTabPreview.svelte:11 -->

### [src/lib/components/feed-tabs/FeedTabPreview.svelte:11](../../../src/lib/components/feed-tabs/FeedTabPreview.svelte#L11)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * 設定中のタブ構成がフィードでどう見えるか。上は実物と同じマークアップのタブバー
	 * （押しても遷移せず、下のプレビュー対象が変わるだけ）、下は選択中タブの実データ。
	 */
```

<!-- source: src/lib/components/feed-tabs/FeedTabPreview.svelte:22 -->

### [src/lib/components/feed-tabs/FeedTabPreview.svelte:22](../../../src/lib/components/feed-tabs/FeedTabPreview.svelte#L22)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// プレビューで取得したフィードは使い回す。タブを行き来するたびに叩かない。
```

<!-- source: src/lib/components/feed-tabs/FeedTabPreview.svelte:25 -->

### [src/lib/components/feed-tabs/FeedTabPreview.svelte:25](../../../src/lib/components/feed-tabs/FeedTabPreview.svelte#L25)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// Bluesky のフィードは Nagi の Feed では読まないので、プレビューも BskyFeedShell に任せる。
```

<!-- source: src/lib/components/feed-tabs/FeedTabPreview.svelte:36 -->

### [src/lib/components/feed-tabs/FeedTabPreview.svelte:36](../../../src/lib/components/feed-tabs/FeedTabPreview.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// ウォーターマークは渡さない。設定画面を開いただけで各フィードが既読になる。
```

## src/lib/components/feed-tabs/FeedTabSortList.svelte

<!-- source: src/lib/components/feed-tabs/FeedTabSortList.svelte:6 -->

### [src/lib/components/feed-tabs/FeedTabSortList.svelte:6](../../../src/lib/components/feed-tabs/FeedTabSortList.svelte#L6)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * 縦1列の並び替えリスト。行の中にボタンが載るので、ドラッグの起点はハンドルだけに
	 * 絞る（行全体を掴めると、削除を押したいだけの操作が並び替えになる）。
	 */
```

## src/lib/components/shell/FeedTabs.svelte

<!-- source: src/lib/components/shell/FeedTabs.svelte:11 -->

### [src/lib/components/shell/FeedTabs.svelte:11](../../../src/lib/components/shell/FeedTabs.svelte#L11)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * フィードのタブバー。並び・出し入れ・追加はユーザー設定（$lib/feed-tabs）で決まる。
	 * 末尾の ＋ から /settings/feed-tabs へ。
	 */
```

<!-- source: src/lib/components/shell/FeedTabs.svelte:17 -->

### [src/lib/components/shell/FeedTabs.svelte:17](../../../src/lib/components/shell/FeedTabs.svelte#L17)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 昔の URL（/global, /affirmation）から来たときも、対応するタブを光らせる。
```

<!-- source: src/lib/components/shell/FeedTabs.svelte:30 -->

### [src/lib/components/shell/FeedTabs.svelte:30](../../../src/lib/components/shell/FeedTabs.svelte#L30)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// ホームは本人のリストなので、未ログインではサインインへ送る（従来どおり）。
```

<!-- source: src/lib/components/shell/FeedTabs.svelte:36 -->

### [src/lib/components/shell/FeedTabs.svelte:36](../../../src/lib/components/shell/FeedTabs.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 4本以上でスクロールに切り替える。3本以下は今までどおり等分幅のまま。
```

<!-- source: src/lib/components/shell/FeedTabs.svelte:42 -->

### [src/lib/components/shell/FeedTabs.svelte:42](../../../src/lib/components/shell/FeedTabs.svelte#L42)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 選択中のタブが画面外にあると、どこを見ているのか分からなくなる。
```

<!-- source: src/lib/components/shell/FeedTabs.svelte:51 -->

### [src/lib/components/shell/FeedTabs.svelte:51](../../../src/lib/components/shell/FeedTabs.svelte#L51)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!-- 設定から戻るときは設定ハブではなく、いま見ていたフィードへ返す。 -->
```

## src/lib/feed-tabs/feed-tabs.svelte.ts

<!-- source: src/lib/feed-tabs/feed-tabs.svelte.ts:5 -->

### [src/lib/feed-tabs/feed-tabs.svelte.ts:5](../../../src/lib/feed-tabs/feed-tabs.svelte.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * フィードのタブ構成。真実源はアカウント（AppView）で、localStorage はその端末の
 * キャッシュ。同期できない端末（permission-set が古い等）では localStorage 単独で動く。
 *
 * お気に入り絵文字（$lib/emoji/favorites）とほぼ同じ作りだが、タブバーは常時
 * マウントされているのでリアクティブな singleton を持つ点だけ違う。
 *
 * 重要: このモジュールのトップレベルで localStorage / window に触らないこと。
 * `/global` は prerender=true で、ビルド時に Node で評価される。
 */
```

<!-- source: src/lib/feed-tabs/feed-tabs.svelte.ts:19 -->

### [src/lib/feed-tabs/feed-tabs.svelte.ts:19](../../../src/lib/feed-tabs/feed-tabs.svelte.ts#L19)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 同期が有効な DID。sync 層が設定する。undefined なら未サインイン/未同期。 */
```

<!-- source: src/lib/feed-tabs/feed-tabs.svelte.ts:25 -->

### [src/lib/feed-tabs/feed-tabs.svelte.ts:25](../../../src/lib/feed-tabs/feed-tabs.svelte.ts#L25)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 同期のスコープを切り替える。アカウント切替とサインアウトで呼ぶ。 */
```

<!-- source: src/lib/feed-tabs/feed-tabs.svelte.ts:46 -->

### [src/lib/feed-tabs/feed-tabs.svelte.ts:46](../../../src/lib/feed-tabs/feed-tabs.svelte.ts#L46)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 同期用に、この端末が持っている値と最終更新時刻をそのまま返す。 */
```

<!-- source: src/lib/feed-tabs/feed-tabs.svelte.ts:55 -->

### [src/lib/feed-tabs/feed-tabs.svelte.ts:55](../../../src/lib/feed-tabs/feed-tabs.svelte.ts#L55)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// ストレージが使えなくても、そのセッションのあいだは $state 側で動く。
```

<!-- source: src/lib/feed-tabs/feed-tabs.svelte.ts:59 -->

### [src/lib/feed-tabs/feed-tabs.svelte.ts:59](../../../src/lib/feed-tabs/feed-tabs.svelte.ts#L59)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * サーバーから受け取った内容をこの端末へ書き戻す。編集ではないので push しない
 * （送り返すと updatedAt だけが進み続ける）。
 */
```

<!-- source: src/lib/feed-tabs/feed-tabs.svelte.ts:68 -->

### [src/lib/feed-tabs/feed-tabs.svelte.ts:68](../../../src/lib/feed-tabs/feed-tabs.svelte.ts#L68)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 既定値のまま初期化する。プリレンダでもここが評価されるため。 */
```

<!-- source: src/lib/feed-tabs/feed-tabs.svelte.ts:70 -->

### [src/lib/feed-tabs/feed-tabs.svelte.ts:70](../../../src/lib/feed-tabs/feed-tabs.svelte.ts#L70)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** この端末（このアカウント）が一度でもカスタムしたか。未設定なら既定を出しているだけ。 */
```

<!-- source: src/lib/feed-tabs/feed-tabs.svelte.ts:73 -->

### [src/lib/feed-tabs/feed-tabs.svelte.ts:73](../../../src/lib/feed-tabs/feed-tabs.svelte.ts#L73)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** localStorage から読み直す。browser でのみ呼ぶこと。 */
```

<!-- source: src/lib/feed-tabs/feed-tabs.svelte.ts:85 -->

### [src/lib/feed-tabs/feed-tabs.svelte.ts:85](../../../src/lib/feed-tabs/feed-tabs.svelte.ts#L85)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** ?tab= が無い / 消えたタブを指しているときに開くタブ。 */
```

<!-- source: src/lib/feed-tabs/feed-tabs.svelte.ts:90 -->

### [src/lib/feed-tabs/feed-tabs.svelte.ts:90](../../../src/lib/feed-tabs/feed-tabs.svelte.ts#L90)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** ユーザーの編集。localStorage へ書き、サーバーへも押し上げる。 */
```

<!-- source: src/lib/feed-tabs/feed-tabs.svelte.ts:100 -->

### [src/lib/feed-tabs/feed-tabs.svelte.ts:100](../../../src/lib/feed-tabs/feed-tabs.svelte.ts#L100)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** サーバー由来の反映。push はしない。 */
```

## src/lib/feed-tabs/normalize.test.ts

<!-- source: src/lib/feed-tabs/normalize.test.ts:56 -->

### [src/lib/feed-tabs/normalize.test.ts:56](../../../src/lib/feed-tabs/normalize.test.ts#L56)

分類: 検証・再現条件。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 名前のスナップショットが無いチャンネルはタグにできないので落とす。
```

<!-- source: src/lib/feed-tabs/normalize.test.ts:64 -->

### [src/lib/feed-tabs/normalize.test.ts:64](../../../src/lib/feed-tabs/normalize.test.ts#L64)

分類: 検証・再現条件。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 変換後に同じタグになったタブは先の1枚だけ残る。
```

## src/lib/feed-tabs/normalize.ts

<!-- source: src/lib/feed-tabs/normalize.ts:16 -->

### [src/lib/feed-tabs/normalize.ts:16](../../../src/lib/feed-tabs/normalize.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * 他人が書いた JSON として扱う。サーバー（AppView の parseFeedTabs）と同じルールで
 * 落とす — 片方だけ緩いと、弾かれずに入った値で描画側が落ちる。
 *
 * 直すのではなく捨てる方針。壊れた1枚のために全部を既定へ戻すと、その端末の設定が
 * 黙って消えるので、読める分だけ残す。
 */
```

<!-- source: src/lib/feed-tabs/normalize.ts:31 -->

### [src/lib/feed-tabs/normalize.ts:31](../../../src/lib/feed-tabs/normalize.ts#L31)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// list / custom は今それぞれ1つずつしか無いので、未知の source（将来のクライアントが
	// 書いたもの）は素通しせず既定へ寄せる。
```

<!-- source: src/lib/feed-tabs/normalize.ts:40 -->

### [src/lib/feed-tabs/normalize.ts:40](../../../src/lib/feed-tabs/normalize.ts#L40)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// Bluesky のホームタイムラインは uri を持たず source: following で指す（AppView と同じ規則）。
```

<!-- source: src/lib/feed-tabs/normalize.ts:51 -->

### [src/lib/feed-tabs/normalize.ts:51](../../../src/lib/feed-tabs/normalize.ts#L51)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * 廃止した形のタブを hashtag タブへ寄せる。AppView も読み書きのたびに同じ変換をするが、
 * この端末の localStorage に残った分はここで直す。
 *  - channel タブ → チャンネル名（label のスナップショット）の hashtag タブ。名前が無ければ落とす。
 *  - queryKind: 'tag' の search タブ → hashtag タブ。
 */
```

<!-- source: src/lib/feed-tabs/normalize.ts:71 -->

### [src/lib/feed-tabs/normalize.ts:71](../../../src/lib/feed-tabs/normalize.ts#L71)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * 保存・描画の直前に必ず通す。重複除去・id 採番・上限を担保する。
 * 空になった場合だけ既定へ落とす（タブが1本も無いフィードは操作不能になるため）。
 */
```

<!-- source: src/lib/feed-tabs/normalize.ts:87 -->

### [src/lib/feed-tabs/normalize.ts:87](../../../src/lib/feed-tabs/normalize.ts#L87)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// id が無い / 重なるものは採番し直す。?tab= で引くタブが一意に決まらないため。
```

## src/lib/feed-tabs/resolve.ts

<!-- source: src/lib/feed-tabs/resolve.ts:21 -->

### [src/lib/feed-tabs/resolve.ts:21](../../../src/lib/feed-tabs/resolve.ts#L21)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * タブ1枚を「どう取ってどう出すか」に落としたもの。取得経路は既存の XRPC を
 * そのまま指すだけで、新しい経路は作らない — こっそり投稿の扱いを含む可視性は
 * すべてサーバー側の既存クエリが決めており、タブ化で変わってはいけない。
 */
```

<!-- source: src/lib/feed-tabs/resolve.ts:27 -->

### [src/lib/feed-tabs/resolve.ts:27](../../../src/lib/feed-tabs/resolve.ts#L27)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** Feed インスタンスのキャッシュキー。同じキーなら同じ取得結果とみなす。 */
```

<!-- source: src/lib/feed-tabs/resolve.ts:33 -->

### [src/lib/feed-tabs/resolve.ts:33](../../../src/lib/feed-tabs/resolve.ts#L33)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 未ログイン向けの案内を出すタブ（従来の `/feed`）。 */
```

<!-- source: src/lib/feed-tabs/resolve.ts:35 -->

### [src/lib/feed-tabs/resolve.ts:35](../../../src/lib/feed-tabs/resolve.ts#L35)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 401/403 のときに再ログイン導線を出すタブ（ホームだけ）。 */
```

<!-- source: src/lib/feed-tabs/resolve.ts:37 -->

### [src/lib/feed-tabs/resolve.ts:37](../../../src/lib/feed-tabs/resolve.ts#L37)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** ハッシュタグタブのとき、タグの投稿一覧（/search）へ渡すタグ。 */
```

<!-- source: src/lib/feed-tabs/resolve.ts:39 -->

### [src/lib/feed-tabs/resolve.ts:39](../../../src/lib/feed-tabs/resolve.ts#L39)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * Bluesky のフィードタブ。中身は BskyFeedShell が PDS 経由で読むので、
	 * 呼び出し側はこれがあれば FeedShell ではなくそちらを描画する。
	 */
```

<!-- source: src/lib/feed-tabs/resolve.ts:46 -->

### [src/lib/feed-tabs/resolve.ts:46](../../../src/lib/feed-tabs/resolve.ts#L46)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** タブバー・設定画面・プレビューで共通の表示名。 */
```

<!-- source: src/lib/feed-tabs/resolve.ts:66 -->

### [src/lib/feed-tabs/resolve.ts:66](../../../src/lib/feed-tabs/resolve.ts#L66)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * ホームは本人向けなので、認可が足りないときだけ文言を差し替える。
 * MainFeed が持っていた分岐をここへ移した（タブ化で呼び出し元が増えたため）。
 */
```

<!-- source: src/lib/feed-tabs/resolve.ts:85 -->

### [src/lib/feed-tabs/resolve.ts:85](../../../src/lib/feed-tabs/resolve.ts#L85)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * タブ記述子を実行仕様へ。did はキャッシュキーと「ホームを本人向けに引くか」の判定に使う。
 * onAuthError は FeedShell の state を更新するためのコールバック。
 */
```

<!-- source: src/lib/feed-tabs/resolve.ts:97 -->

### [src/lib/feed-tabs/resolve.ts:97](../../../src/lib/feed-tabs/resolve.ts#L97)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 未ログインではホームリストが無いので、従来どおりグローバルを見せる。
```

<!-- source: src/lib/feed-tabs/resolve.ts:126 -->

### [src/lib/feed-tabs/resolve.ts:126](../../../src/lib/feed-tabs/resolve.ts#L126)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 今は全肯定だけ。ユーザー定義のカスタムフィードもここに入る予定。
```

<!-- source: src/lib/feed-tabs/resolve.ts:140 -->

### [src/lib/feed-tabs/resolve.ts:140](../../../src/lib/feed-tabs/resolve.ts#L140)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 楽観投稿は本文のタグを解釈しないと一致を判定できないので出さない。
```

<!-- source: src/lib/feed-tabs/resolve.ts:142 -->

### [src/lib/feed-tabs/resolve.ts:142](../../../src/lib/feed-tabs/resolve.ts#L142)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// タグの投稿は時系列で並ぶので、チャンネルタブと同じく未読を持てる。
```

<!-- source: src/lib/feed-tabs/resolve.ts:152 -->

### [src/lib/feed-tabs/resolve.ts:152](../../../src/lib/feed-tabs/resolve.ts#L152)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 意味検索(semantic)は Ollama への往復が走る。タブは開くたびに叩かれるので
				// 一致(exact)に固定する。あいまい検索が要るときは /search へ。
```

<!-- source: src/lib/feed-tabs/resolve.ts:155 -->

### [src/lib/feed-tabs/resolve.ts:155](../../../src/lib/feed-tabs/resolve.ts#L155)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 検索結果に楽観投稿を混ぜても一致するとは限らないので出さない。
```

<!-- source: src/lib/feed-tabs/resolve.ts:157 -->

### [src/lib/feed-tabs/resolve.ts:157](../../../src/lib/feed-tabs/resolve.ts#L157)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 結果の並びが安定しないため未読の意味がない（/search も渡していない）。
```

<!-- source: src/lib/feed-tabs/resolve.ts:168 -->

### [src/lib/feed-tabs/resolve.ts:168](../../../src/lib/feed-tabs/resolve.ts#L168)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 取得は BskyFeedShell が持つ。Nagi の Feed がここを叩くことはない。
```

## src/lib/feed-tabs/types.ts

<!-- source: src/lib/feed-tabs/types.ts:5 -->

### [src/lib/feed-tabs/types.ts:5](../../../src/lib/feed-tabs/types.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** タブ数の上限。 */
```

<!-- source: src/lib/feed-tabs/types.ts:18 -->

### [src/lib/feed-tabs/types.ts:18](../../../src/lib/feed-tabs/types.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * list / custom が今指せる中身。どちらも1つずつしか無いので、追加ダイアログは
 * 種別を選んだ時点でこれを既定として入れる（将来ここが複数になったら選択肢を出す）。
 */
```

<!-- source: src/lib/feed-tabs/types.ts:27 -->

### [src/lib/feed-tabs/types.ts:27](../../../src/lib/feed-tabs/types.ts#L27)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 何も設定していない人が見るタブ。今日の見た目（ホーム/グローバル/全肯定）と同じ。 */
```

<!-- source: src/lib/feed-tabs/types.ts:34 -->

### [src/lib/feed-tabs/types.ts:34](../../../src/lib/feed-tabs/types.ts#L34)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * 「同じ中身のタブか」の判定キー。id はランダムなので重複判定には使えない
 * （同じタグを2回追加したら別 id の同じタブが並んでしまう）。
 */
```

<!-- source: src/lib/feed-tabs/types.ts:54 -->

### [src/lib/feed-tabs/types.ts:54](../../../src/lib/feed-tabs/types.ts#L54)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * 組み込みタブの固定 id。`/feed?tab=global` を端末間で安定させたいので、
 * ランダム採番せずこの表から採る。ここに無いタブ（hashtag / search）は newTabId。
 */
```

<!-- source: src/lib/feed-tabs/types.ts:65 -->

### [src/lib/feed-tabs/types.ts:65](../../../src/lib/feed-tabs/types.ts#L65)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * hashtag / search / bsky タブの id。衝突しても normalize が採番し直すので短くてよい。
 * プリレンダ（Node）でも通るよう crypto が無ければ Math.random に落ちる。
 */
```

## src/lib/feed/cache.ts

<!-- source: src/lib/feed/cache.ts:1 -->

### [src/lib/feed/cache.ts:1](../../../src/lib/feed/cache.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** Shared LRU for feed state. The owning shell chooses the cache lifetime. */
```

<!-- source: src/lib/feed/cache.ts:13 -->

### [src/lib/feed/cache.ts:13](../../../src/lib/feed/cache.ts#L13)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** Read without creating or touching recency (swipe previews must not evict the shown feed). */
```

## src/lib/feed/entry-motion.svelte.ts

<!-- source: src/lib/feed/entry-motion.svelte.ts:1 -->

### [src/lib/feed/entry-motion.svelte.ts:1](../../../src/lib/feed/entry-motion.svelte.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** Both feed sources use the same short-lived arrival state. Initial pages stay still. */
```

<!-- source: src/lib/feed/entry-motion.svelte.ts:12 -->

### [src/lib/feed/entry-motion.svelte.ts:12](../../../src/lib/feed/entry-motion.svelte.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// Retain arrivals from overlapping refreshes until their animation finishes.
```

## src/lib/feed/feed-caches.ts

<!-- source: src/lib/feed/feed-caches.ts:7 -->

### [src/lib/feed/feed-caches.ts:7](../../../src/lib/feed/feed-caches.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * タブごとのフィード状態。FeedShell / BskyFeedShell と、スワイプ中に隣のタブを
 * 覗かせる FeedPeek が同じものを見る。生成は読み込みを伴うので get 系は副作用あり。
 */
```

## src/lib/feed/feed.svelte.ts

<!-- source: src/lib/feed/feed.svelte.ts:11 -->

### [src/lib/feed/feed.svelte.ts:11](../../../src/lib/feed/feed.svelte.ts#L11)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * マージ/DOMキー用の安定キー。会話グループでは代表 uri が新リプライで変わっても
 * threadRootUri は不変なので、同スレッドの二重表示を防げる。
 */
```

<!-- source: src/lib/feed/feed.svelte.ts:16 -->

### [src/lib/feed/feed.svelte.ts:16](../../../src/lib/feed/feed.svelte.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** アイテムが内包する全投稿（会話バブル・返信元・bot返信を含む）。楽観突合・author記憶に使う。 */
```

<!-- source: src/lib/feed/feed.svelte.ts:21 -->

### [src/lib/feed/feed.svelte.ts:21](../../../src/lib/feed/feed.svelte.ts#L21)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** feedPosts の uri 版。 */
```

<!-- source: src/lib/feed/feed.svelte.ts:24 -->

### [src/lib/feed/feed.svelte.ts:24](../../../src/lib/feed/feed.svelte.ts#L24)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 楽観返信を会話カードの末尾バブルとして足す。depth は返信元バブルのひとつ下。 */
```

<!-- source: src/lib/feed/feed.svelte.ts:42 -->

### [src/lib/feed/feed.svelte.ts:42](../../../src/lib/feed/feed.svelte.ts#L42)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 新着リプライ・自分の投稿があるスレッドを、サーバーが返した位置へ挿し直す。 */
```

<!-- source: src/lib/feed/feed.svelte.ts:47 -->

### [src/lib/feed/feed.svelte.ts:47](../../../src/lib/feed/feed.svelte.ts#L47)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 後ろから挿すことで、移動するスレッド同士もサーバー順になる。
```

<!-- source: src/lib/feed/feed.svelte.ts:50 -->

### [src/lib/feed/feed.svelte.ts:50](../../../src/lib/feed/feed.svelte.ts#L50)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// loadMore で足したアイテムはページ1に居ない＝より古いので、後ろ扱いにする。
```

<!-- source: src/lib/feed/feed.svelte.ts:57 -->

### [src/lib/feed/feed.svelte.ts:57](../../../src/lib/feed/feed.svelte.ts#L57)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * Shared feed state for timeline/affirmation/profile tabs.
 * refresh() merges page 1 by thread key, moving threads with new replies to the
 * server order while updating reactions and bot replies in place.
 */
```

<!-- source: src/lib/feed/feed.svelte.ts:85 -->

### [src/lib/feed/feed.svelte.ts:85](../../../src/lib/feed/feed.svelte.ts#L85)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 既読基準はこのインスタンスを作った時点で凍結する。load() は画面ごとに複数回
		// 走る（onMount + oauthReady）ので、凍結を load() 側に置くとマークが即消える。
```

<!-- source: src/lib/feed/feed.svelte.ts:89 -->

### [src/lib/feed/feed.svelte.ts:89](../../../src/lib/feed/feed.svelte.ts#L89)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * 楽観投稿を「会話カードへ合流させる返信」と「単独カードとして先頭へ出すもの」に振り分ける。
	 * 既にサーバー側のアイテムに含まれているものは捨てる（次の reconcile で消える）。
	 * 返信を単独カードにすると、確定した瞬間にそれが消えて元スレッドは元の位置のまま——
	 * つまり「返信したらスレッドごと消えた」ように見えるので、合流させる。
	 */
```

<!-- source: src/lib/feed/feed.svelte.ts:99 -->

### [src/lib/feed/feed.svelte.ts:99](../../../src/lib/feed/feed.svelte.ts#L99)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// group 形式ならスレッド内のどのバブルへの返信でも同じカードへ合流できる。
		// group 非対応の応答も混ざり得るため、全形式について「今見えている投稿」を引ける
		// ようにしておく。reply.root だけを見ると、通常形式のカードやネスト返信を拾えない。
```

<!-- source: src/lib/feed/feed.svelte.ts:117 -->

### [src/lib/feed/feed.svelte.ts:117](../../../src/lib/feed/feed.svelte.ts#L117)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 通常形式では会話バブルへ変換できないので、返信元つきの単独カードで先頭へ出す。
				// ホームは通常「返信を単独表示しない」が、画面内で今返信したものだけは例外。
```

<!-- source: src/lib/feed/feed.svelte.ts:127 -->

### [src/lib/feed/feed.svelte.ts:127](../../../src/lib/feed/feed.svelte.ts#L127)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 合流したスレッドは最新の活動になったので、サーバーの並びに先回りして先頭へ出す。
```

<!-- source: src/lib/feed/feed.svelte.ts:140 -->

### [src/lib/feed/feed.svelte.ts:140](../../../src/lib/feed/feed.svelte.ts#L140)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * 未読マーク対象か。マークはスレッド単位（カード1枚に1本）なので、判定も代表投稿
	 * （＝そのスレッドの最新の人間投稿）で行う。楽観カードと自分の投稿には付けない。
	 */
```

<!-- source: src/lib/feed/feed.svelte.ts:170 -->

### [src/lib/feed/feed.svelte.ts:170](../../../src/lib/feed/feed.svelte.ts#L170)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 表示した最新分までを既読にする。未読マークは凍結した基準で判定するので消えない。
```

<!-- source: src/lib/feed/feed.svelte.ts:211 -->

### [src/lib/feed/feed.svelte.ts:211](../../../src/lib/feed/feed.svelte.ts#L211)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 確定URIへ更新済みの楽観投稿は既に登場演出を済ませているため、再演出しない。
```

<!-- source: src/lib/feed/feed.svelte.ts:214 -->

### [src/lib/feed/feed.svelte.ts:214](../../../src/lib/feed/feed.svelte.ts#L214)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// スレッドキーでマージし、代表（最新の人間投稿）が変わったスレッドは
			// サーバー順へ移動する。リアクションやbot返信だけの更新では位置を変えない。
```

<!-- source: src/lib/feed/feed.svelte.ts:245 -->

### [src/lib/feed/feed.svelte.ts:245](../../../src/lib/feed/feed.svelte.ts#L245)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// background refresh failures stay silent; the next tick retries
```

<!-- source: src/lib/feed/feed.svelte.ts:253 -->

### [src/lib/feed/feed.svelte.ts:253](../../../src/lib/feed/feed.svelte.ts#L253)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// ルート削除はスレッドを非共有化するので、会話ごと除去。
```

<!-- source: src/lib/feed/feed.svelte.ts:279 -->

### [src/lib/feed/feed.svelte.ts:279](../../../src/lib/feed/feed.svelte.ts#L279)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 投稿直後は bot の返信完了後もリアクションの到着を短い間隔で確認する。 */
```

<!-- source: src/lib/feed/feed.svelte.ts:288 -->

### [src/lib/feed/feed.svelte.ts:288](../../../src/lib/feed/feed.svelte.ts#L288)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** true while one of `did`'s recent posts is still waiting for botたん */
```

## src/lib/feed/gestures.ts

<!-- source: src/lib/feed/gestures.ts:3 -->

### [src/lib/feed/gestures.ts:3](../../../src/lib/feed/gestures.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** Horizontal drag in progress (px from the touch start). Called at most once per frame. */
```

<!-- source: src/lib/feed/gestures.ts:5 -->

### [src/lib/feed/gestures.ts:5](../../../src/lib/feed/gestures.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** Finger lifted after a horizontal drag. `velocity` is px/ms, signed like dx. */
```

<!-- source: src/lib/feed/gestures.ts:7 -->

### [src/lib/feed/gestures.ts:7](../../../src/lib/feed/gestures.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** The drag was interrupted (touchcancel, second finger, disabled mid-way). */
```

<!-- source: src/lib/feed/gestures.ts:13 -->

### [src/lib/feed/gestures.ts:13](../../../src/lib/feed/gestures.ts#L13)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * Whether a release completes the tab switch: far enough, or a quick flick.
 * Returns the tab direction (1 = next, -1 = previous) or 0 to snap back.
 */
```

<!-- source: src/lib/feed/gestures.ts:25 -->

### [src/lib/feed/gestures.ts:25](../../../src/lib/feed/gestures.ts#L25)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** One recognizer for both sources; nested media, controls and horizontal scrollers own their gestures. */
```

<!-- source: src/lib/feed/gestures.ts:29 -->

### [src/lib/feed/gestures.ts:29](../../../src/lib/feed/gestures.ts#L29)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** Recent samples for release velocity. */
```

<!-- source: src/lib/feed/gestures.ts:68 -->

### [src/lib/feed/gestures.ts:68](../../../src/lib/feed/gestures.ts#L68)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// Preserve browser edge navigation.
```

<!-- source: src/lib/feed/gestures.ts:84 -->

### [src/lib/feed/gestures.ts:84](../../../src/lib/feed/gestures.ts#L84)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// Vertical gestures belong entirely to the browser, including pull-to-refresh.
```

<!-- source: src/lib/feed/gestures.ts:108 -->

### [src/lib/feed/gestures.ts:108](../../../src/lib/feed/gestures.ts#L108)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// A quick flick can end before the throttled frame fires; deliver it first.
```

## src/lib/feed/media-tiles.ts

<!-- source: src/lib/feed/media-tiles.ts:3 -->

### [src/lib/feed/media-tiles.ts:3](../../../src/lib/feed/media-tiles.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * メディアグリッドの1マス。1投稿に複数画像があれば、その枚数ぶんのタイルになる。
 * 動画はサムネイルを image に入れた1マスで、video を立てて再生アイコンを重ねる。
 * 画像と動画が混ざった投稿は、画像→動画の順に並べる（スレッドでの表示順と同じ）。
 */
```

<!-- source: src/lib/feed/media-tiles.ts:10 -->

### [src/lib/feed/media-tiles.ts:10](../../../src/lib/feed/media-tiles.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * フィードをタイル列に均す。メディアグリッドは group=false で取得するので、
 * 各 FeedItem は自分自身が画像を持つ投稿であり、会話バブルまで潜る必要はない。
 */
```

<!-- source: src/lib/feed/media-tiles.ts:33 -->

### [src/lib/feed/media-tiles.ts:33](../../../src/lib/feed/media-tiles.ts#L33)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** DOMキー。楽観投稿が確定して uri が変わったらタイルごと差し替わってよい。 */
```

## src/lib/feed/optimistic-posts.svelte.ts

<!-- source: src/lib/feed/optimistic-posts.svelte.ts:8 -->

### [src/lib/feed/optimistic-posts.svelte.ts:8](../../../src/lib/feed/optimistic-posts.svelte.ts#L8)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 動画は添付した時点で変換が済んでいるので、投稿前から配信先の URL が決まる。 */
```

## src/lib/feed/post-follow.svelte.ts

<!-- source: src/lib/feed/post-follow.svelte.ts:7 -->

### [src/lib/feed/post-follow.svelte.ts:7](../../../src/lib/feed/post-follow.svelte.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * 投稿したあと、その投稿・返信へ画面を追従させるための状態。
 *
 * 投稿は「楽観カード → サーバー確定カード」と2段階で DOM が入れ替わり、会話グループでは
 * 確定時にスレッドカードごと位置が変わる。そのため送信直後に一度 scrollIntoView するだけでは
 * 追いつけず、差し替わった先を見失う（返信したスレッドが消えたように見える原因のひとつ）。
 * ここでは追従先を状態として持ち、リストが変わるたびに引き直す。
 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:16 -->

### [src/lib/feed/post-follow.svelte.ts:16](../../../src/lib/feed/post-follow.svelte.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 楽観カードの識別子。確定 uri が入るまではこれで DOM を探す。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:18 -->

### [src/lib/feed/post-follow.svelte.ts:18](../../../src/lib/feed/post-follow.svelte.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** createPost が通ったあとの実 uri。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:20 -->

### [src/lib/feed/post-follow.svelte.ts:20](../../../src/lib/feed/post-follow.svelte.ts#L20)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 追従先を出せなかったときに見せる導線。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:22 -->

### [src/lib/feed/post-follow.svelte.ts:22](../../../src/lib/feed/post-follow.svelte.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 会話グループのマージキー。Feed.refresh でサーバー順へ戻す対象にする。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:28 -->

### [src/lib/feed/post-follow.svelte.ts:28](../../../src/lib/feed/post-follow.svelte.ts#L28)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 投稿の AT-URI からスレッドページの相対 URL へ。追従できなかったときの導線に使う。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:31 -->

### [src/lib/feed/post-follow.svelte.ts:31](../../../src/lib/feed/post-follow.svelte.ts#L31)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 3行日記はコレクションが違うので、スレッドページへ印を付けて渡す（URL の形は投稿と揃える）。
```

<!-- source: src/lib/feed/post-follow.svelte.ts:37 -->

### [src/lib/feed/post-follow.svelte.ts:37](../../../src/lib/feed/post-follow.svelte.ts#L37)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** スレッドページで、ルートが3行日記であることを表すクエリ。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:41 -->

### [src/lib/feed/post-follow.svelte.ts:41](../../../src/lib/feed/post-follow.svelte.ts#L41)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** スレッドページの URL からルートの AT-URI を組み立てる。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:47 -->

### [src/lib/feed/post-follow.svelte.ts:47](../../../src/lib/feed/post-follow.svelte.ts#L47)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 記事として公開されたルート投稿は、本文と会話を一緒に読めるブログページへ。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:67 -->

### [src/lib/feed/post-follow.svelte.ts:67](../../../src/lib/feed/post-follow.svelte.ts#L67)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 追い続ける上限。AppView の取り込みが遅れても、いつまでも画面を動かさない。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:69 -->

### [src/lib/feed/post-follow.svelte.ts:69](../../../src/lib/feed/post-follow.svelte.ts#L69)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 確定してからこの時間だけ待って、まだどこにも出ていなければ導線に切り替える。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:74 -->

### [src/lib/feed/post-follow.svelte.ts:74](../../../src/lib/feed/post-follow.svelte.ts#L74)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 直前に寄せたノード。同じノードへ二度寄せない（ユーザーのスクロールを奪わないため）。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:90 -->

### [src/lib/feed/post-follow.svelte.ts:90](../../../src/lib/feed/post-follow.svelte.ts#L90)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * 送信開始。楽観カードが出たらそこへ、サーバーが確定したらその投稿へ画面を寄せる。
	 * threadRootUri は返信のときだけ渡す（Feed.refresh の並べ直し対象になる）。
	 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:100 -->

### [src/lib/feed/post-follow.svelte.ts:100](../../../src/lib/feed/post-follow.svelte.ts#L100)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** createPost が通った。ここで初めて実 uri と導線が決まる。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:110 -->

### [src/lib/feed/post-follow.svelte.ts:110](../../../src/lib/feed/post-follow.svelte.ts#L110)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 表示中の画面に出せない投稿（検索タブ・通知画面など）は追従しようがないので、
		// 少し待ってから導線だけ出す。楽観カードへ既に寄せてあるなら何も出さない。
```

<!-- source: src/lib/feed/post-follow.svelte.ts:119 -->

### [src/lib/feed/post-follow.svelte.ts:119](../../../src/lib/feed/post-follow.svelte.ts#L119)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 投稿自体が失敗した。追従も導線も出さない。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:121 -->

### [src/lib/feed/post-follow.svelte.ts:121](../../../src/lib/feed/post-follow.svelte.ts#L121)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 画面を移ったなどで追従をやめる。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:123 -->

### [src/lib/feed/post-follow.svelte.ts:123](../../../src/lib/feed/post-follow.svelte.ts#L123)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 確定した投稿へ寄せ終わった。 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:134 -->

### [src/lib/feed/post-follow.svelte.ts:134](../../../src/lib/feed/post-follow.svelte.ts#L134)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * 投稿1件の DOM。カードと内側のバブルが同じ uri を持つ場面があるので、内側
 * （＝ドキュメント順で最後の一致）を選ぶ。返信したときにカードの先頭ではなく
 * 自分の発言そのものへ寄るようにするため。
 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:148 -->

### [src/lib/feed/post-follow.svelte.ts:148](../../../src/lib/feed/post-follow.svelte.ts#L148)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * 投稿直後の画面追従。deps（描画中のリスト）が変わるたびに追従先を引き直し、
 * 楽観カード → 確定カードの順に画面を寄せる。寄せるのは実質2回だけで、同じノードへは
 * 二度寄せない（ポーリング更新のたびに画面を引き戻さないため）。
 */
```

<!-- source: src/lib/feed/post-follow.svelte.ts:168 -->

### [src/lib/feed/post-follow.svelte.ts:168](../../../src/lib/feed/post-follow.svelte.ts#L168)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 楽観カードの外＝サーバーが返した確定表示。ここまで来たら追従は終わり。
```

## src/lib/feed/posted-signal.svelte.ts

<!-- source: src/lib/feed/posted-signal.svelte.ts:1 -->

### [src/lib/feed/posted-signal.svelte.ts:1](../../../src/lib/feed/posted-signal.svelte.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * 投稿完了の合図。
 *
 * Composer が各ページにインラインで置かれていた頃は `onposted` を直接渡せたが、
 * ポストモーダルは +layout.svelte に1つだけ常駐するため、投稿できたことを
 * 表示中のフィードへ伝える経路が要る。カウンタを1つ増やすだけの最小の仕組みにして、
 * 各ページは $effect でこれを購読して自分の feed.refresh() を呼ぶ。
 *
 * なお optimisticPosts は元からグローバルで Feed.visibleItems が合流させるので、
 * 投稿直後の表示自体はこの合図が無くても成立する。ここでの refresh は
 * サーバ側の確定データ（botたんの返信予定など）へ寄せるためのもの。
 */
```

## src/lib/feed/unread.svelte.ts

<!-- source: src/lib/feed/unread.svelte.ts:3 -->

### [src/lib/feed/unread.svelte.ts:3](../../../src/lib/feed/unread.svelte.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// フィードは端末ローカルの既読基準だけを持つ。ナビにドットは出さない（グローバルTLは
// 常に更新されるのでドットが光り続けて煩わしい）ため unread ストアは購読しない。
// タブごとに読んだ位置は別なので、キーも分ける。
```

<!-- source: src/lib/feed/unread.svelte.ts:10 -->

### [src/lib/feed/unread.svelte.ts:10](../../../src/lib/feed/unread.svelte.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * タブごとのウォーターマーク。追加できるタブ（チャンネル）は数が決まらないので、
 * 使われたぶんだけ遅延で作る。上の3本は既存キーをそのまま返す — キー文字列を
 * 変えるとその端末の既読が全部リセットされる。
 */
```

## src/lib/thread/bot-reply-collapse.ts

<!-- source: src/lib/thread/bot-reply-collapse.ts:9 -->

### [src/lib/thread/bot-reply-collapse.ts:9](../../../src/lib/thread/bot-reply-collapse.ts#L9)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** Only direct bot replies to another person's top-level post are candidates. Replies with media stay visible. */
```

<!-- source: src/lib/thread/bot-reply-collapse.ts:41 -->

### [src/lib/thread/bot-reply-collapse.ts:41](../../../src/lib/thread/bot-reply-collapse.ts#L41)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** Short-lived, shared checks. Invalidation also prevents an old request from repopulating the cache. */
```

## src/lib/thread/preview.ts

<!-- source: src/lib/thread/preview.ts:1 -->

### [src/lib/thread/preview.ts:1](../../../src/lib/thread/preview.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** Shared timeline rule: keep the root and the last three replies. */
```

## src/lib/thread/reply-to-viewer.test.ts

<!-- source: src/lib/thread/reply-to-viewer.test.ts:50 -->

### [src/lib/thread/reply-to-viewer.test.ts:50](../../../src/lib/thread/reply-to-viewer.test.ts#L50)

分類: 検証・再現条件。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 親が手元に無いと URI からは作者が分からないので、出さないほうへ倒れる。
```

## src/lib/thread/reply-to-viewer.ts

<!-- source: src/lib/thread/reply-to-viewer.ts:3 -->

### [src/lib/thread/reply-to-viewer.ts:3](../../../src/lib/thread/reply-to-viewer.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * 閲覧者の投稿へ直接返信した、他の人の発言か。フィードで「あなたへ」の目印を出すかを決める。
 *
 * 親の作者は同じカードに並ぶ投稿から引く。こっそり投稿の URI は AppView の DID 配下にあって
 * 作者を指さないので、URI から読むのは親がカードに無いときだけにする。その場合こっそりの親は
 * 閲覧者と一致せず、目印が出ないほうへ倒れる。
 *
 * botたんの返信も人の返信と同じく扱う。誰からでも自分宛てなら同じ目印にそろえる。
 */
```

## src/lib/thread/replyIndent.ts

<!-- source: src/lib/thread/replyIndent.ts:1 -->

### [src/lib/thread/replyIndent.ts:1](../../../src/lib/thread/replyIndent.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** タイムラインとスレッドページで共通の、返信深度から見た目の段数への変換。 */
```

<!-- source: src/lib/thread/replyIndent.ts:6 -->

### [src/lib/thread/replyIndent.ts:6](../../../src/lib/thread/replyIndent.ts#L6)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * reply.parent をたどり、ルートからの返信ホップ数を返す。
 * 欠けた親や循環した参照があっても表示を止めず、取得できた範囲の深度を使う。
 */
```

## src/routes/channels/+page.svelte

<!-- source: src/routes/channels/+page.svelte:5 -->

### [src/routes/channels/+page.svelte:5](../../../src/routes/channels/+page.svelte#L5)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!-- load がリダイレクトするので、ここが見えるのは遷移を待つ一瞬だけ。 -->
```

## src/routes/channels/+page.ts

<!-- source: src/routes/channels/+page.ts:3 -->

### [src/routes/channels/+page.ts:3](../../../src/routes/channels/+page.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// チャンネルはハッシュタグへ統合して廃止した。一覧の代わりは検索（タグ・自由文）。
```

## src/routes/channels/[did]/[rkey]/+page.svelte

<!-- source: src/routes/channels/[did]/[rkey]/+page.svelte:5 -->

### [src/routes/channels/[did]/[rkey]/+page.svelte:5](../../../src/routes/channels/[did]/[rkey]/+page.svelte#L5)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!-- load がリダイレクトするので、ここが見えるのは遷移を待つ一瞬だけ。 -->
```

## src/routes/channels/[did]/[rkey]/+page.ts

<!-- source: src/routes/channels/[did]/[rkey]/+page.ts:5 -->

### [src/routes/channels/[did]/[rkey]/+page.ts:5](../../../src/routes/channels/[did]/[rkey]/+page.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
 * チャンネルはハッシュタグへ統合して廃止した。外に貼られた旧リンクは、チャンネル名の
 * タグページへ送る（AppView は旧チャンネル投稿をチャンネル名のタグとして返す）。
 * AppView にチャンネルを引く API はもう無いので、名前は作成者の PDS から直接読む。
 */
```

## src/routes/dev/e2e/reply-to-viewer/+page.svelte

<!-- source: src/routes/dev/e2e/reply-to-viewer/+page.svelte:8 -->

### [src/routes/dev/e2e/reply-to-viewer/+page.svelte:8](../../../src/routes/dev/e2e/reply-to-viewer/+page.svelte#L8)

分類: 検証・再現条件。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * 「あなたへ」の目印の確認用。人とbotたんからの自分への返信・他の人への返信・自分の自己返信を
	 * 通常カードと会話カードの両方で並べる。サインイン済みなら本物のセッションの DID を使う。
	 */
```

## src/routes/feed/+page.svelte

<!-- source: src/routes/feed/+page.svelte:2 -->

### [src/routes/feed/+page.svelte:2](../../../src/routes/feed/+page.svelte#L2)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * フィード。サインイン済みの人は TOP（`/`）でも同じものを見る。
	 * 未サインインの TOP はランディングなので、タイムラインと端末保存の投稿（ゲスト投稿）はここで見せる。
	 * `?tab=<id>` のクエリは FeedTabsView が読む。
	 */
```

## src/routes/feed/+page.ts

<!-- source: src/routes/feed/+page.ts:12 -->

### [src/routes/feed/+page.ts:12](../../../src/routes/feed/+page.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 中身はその時々のタイムラインで、プリレンダ HTML には見出ししか残らない。
		// 空に近いページを索引に載せないよう noindex にし、sitemap にも入れない。
```

## src/routes/global/+page.svelte

<!-- source: src/routes/global/+page.svelte:3 -->

### [src/routes/global/+page.svelte:3](../../../src/routes/global/+page.svelte#L3)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 昔からの公開グローバルTLの URL。クローラ向けにプリレンダを維持したいので
	// `/feed?tab=global` へ寄せず独立したルートのまま、中身だけ FeedShell に揃える。
```

## src/routes/search/+page.svelte

<!-- source: src/routes/search/+page.svelte:31 -->

### [src/routes/search/+page.svelte:31](../../../src/routes/search/+page.svelte#L31)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 自由文検索(?q=)を優先。無ければタグ検索(?tag=、小文字で正規化して保存側と一致)。
```

<!-- source: src/routes/search/+page.svelte:36 -->

### [src/routes/search/+page.svelte:36](../../../src/routes/search/+page.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// タグのミュート。このページ自体はミュート中でも今までどおり見える（開いたタグなので）。
	// 効くのはTL・検索など、ほかの場所に流れてくる投稿のほう。
```

<!-- source: src/routes/search/+page.svelte:50 -->

### [src/routes/search/+page.svelte:50](../../../src/routes/search/+page.svelte#L50)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 自由文モードは対象ごとにタブを分ける。意味検索のある対象は「一致」→
	// 「botたんの気まぐれ」の順に縦に並べ、一致側には見出しを付けない。
```

<!-- source: src/routes/search/+page.svelte:67 -->

### [src/routes/search/+page.svelte:67](../../../src/routes/search/+page.svelte#L67)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 投稿は Feed に載せる（楽観投稿の突合・削除反映・ページングが乗るため）。
```

<!-- source: src/routes/search/+page.svelte:70 -->

### [src/routes/search/+page.svelte:70](../../../src/routes/search/+page.svelte#L70)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// タグモードは従来どおり投稿1本。
```

<!-- source: src/routes/search/+page.svelte:72 -->

### [src/routes/search/+page.svelte:72](../../../src/routes/search/+page.svelte#L72)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 投稿以外は FeedItem ではないので素の配列で持つ。
```

<!-- source: src/routes/search/+page.svelte:85 -->

### [src/routes/search/+page.svelte:85](../../../src/routes/search/+page.svelte#L85)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 描画用の「そのタブの結果が揃ったか」。未取得と0件を区別するために要る（投稿タブは Feed の
	// loading があるので使わない）。
```

<!-- source: src/routes/search/+page.svelte:101 -->

### [src/routes/search/+page.svelte:101](../../../src/routes/search/+page.svelte#L101)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// タブを自分で選んだらもう自動で移動しない。
```

<!-- source: src/routes/search/+page.svelte:105 -->

### [src/routes/search/+page.svelte:105](../../../src/routes/search/+page.svelte#L105)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 取得済みの記録。$state にすると読み書きが同じエフェクト内で回るので素の値で持つ。
```

<!-- source: src/routes/search/+page.svelte:142 -->

### [src/routes/search/+page.svelte:142](../../../src/routes/search/+page.svelte#L142)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * 一致は公開タブぶん先に読む。埋め込みを使わない（＝Ollama を叩かない）ので安く、
	 * タブに件数を出して「別のタブに当たりがある」と分かるようにするために必要。
	 * これが無いと、既定のポストタブが0件なだけで「ヒットしない」に見えてしまう。
	 */
```

<!-- source: src/routes/search/+page.svelte:183 -->

### [src/routes/search/+page.svelte:183](../../../src/routes/search/+page.svelte#L183)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/** 気まぐれ側は埋め込み生成が要るので、開いたタブのぶんだけ遅れて読む。 */
```

<!-- source: src/routes/search/+page.svelte:227 -->

### [src/routes/search/+page.svelte:227](../../../src/routes/search/+page.svelte#L227)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 閲覧は未認証（AppView 直読み）なのでセッション復元を待たない。
```

<!-- source: src/routes/search/+page.svelte:260 -->

### [src/routes/search/+page.svelte:260](../../../src/routes/search/+page.svelte#L260)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// タブごとの一致ヒット数。0件のタブと当たりのあるタブを見分けるために出す。
```

<!-- source: src/routes/search/+page.svelte:275 -->

### [src/routes/search/+page.svelte:275](../../../src/routes/search/+page.svelte#L275)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 自分でタブを選ぶ前に限り、当たりのあるタブへ寄せる。「ユーザーはいるのに検索して
	// ヒットしない」と見えてしまう事故を防ぐのが目的。
```

<!-- source: src/routes/search/+page.svelte:291 -->

### [src/routes/search/+page.svelte:291](../../../src/routes/search/+page.svelte#L291)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 一致セクションだけ新着が効く。気まぐれは並びがスコア依存で揺れるので自動更新しない。
```

<!-- source: src/routes/search/+page.svelte:342 -->

### [src/routes/search/+page.svelte:342](../../../src/routes/search/+page.svelte#L342)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!-- 気まぐれセクションの見出し。空でも「気まぐれには何もなかった」と分かるよう常に出す。 -->
```

<!-- source: src/routes/search/+page.svelte:406 -->

### [src/routes/search/+page.svelte:406](../../../src/routes/search/+page.svelte#L406)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!-- 下の気まぐれセクションに到達できなくなるので無限スクロールにしない。 -->
```

<!-- source: src/routes/search/+page.svelte:519 -->

### [src/routes/search/+page.svelte:519](../../../src/routes/search/+page.svelte#L519)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
<!-- タグ検索モード（従来どおり投稿のみ・タブなし） -->
```

<!-- source: src/routes/search/+page.svelte:587 -->

### [src/routes/search/+page.svelte:587](../../../src/routes/search/+page.svelte#L587)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/* 件数。0件のタブは薄くして「当たりがあるタブ」を目で追えるようにする。 */
```

<!-- source: src/routes/search/+page.svelte:614 -->

### [src/routes/search/+page.svelte:614](../../../src/routes/search/+page.svelte#L614)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/* 結果リストの続き。行と同じ幅で、枠を持たない軽い操作にする。 */
```

## src/routes/settings/feed-tabs/+page.svelte

<!-- source: src/routes/settings/feed-tabs/+page.svelte:19 -->

### [src/routes/settings/feed-tabs/+page.svelte:19](../../../src/routes/settings/feed-tabs/+page.svelte#L19)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * フィードのタブ構成。編集は即保存（送信側で 1.5s デバウンスされる）。
	 * draft はストアのコピーで、並び替え中の中間状態を持つためだけに存在する。
	 */
```

<!-- source: src/routes/settings/feed-tabs/+page.svelte:26 -->

### [src/routes/settings/feed-tabs/+page.svelte:26](../../../src/routes/settings/feed-tabs/+page.svelte#L26)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * タブバーの ＋ から来たときは、設定ハブではなく見ていたフィードへ返す。
	 * 戻り先はフィードのページだけに限る（任意の内部 URL を通すと、設定から入った人が
	 * 「フィードに戻る」で知らない場所へ飛ぶ）。
	 */
```

<!-- source: src/routes/settings/feed-tabs/+page.svelte:32 -->

### [src/routes/settings/feed-tabs/+page.svelte:32](../../../src/routes/settings/feed-tabs/+page.svelte#L32)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// TOP（`/`）がフィード。前方一致だと全 URL が通るので、`/` と `/?…` だけを許す。
```

<!-- source: src/routes/settings/feed-tabs/+page.svelte:42 -->

### [src/routes/settings/feed-tabs/+page.svelte:42](../../../src/routes/settings/feed-tabs/+page.svelte#L42)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// アカウント同期の取り込みが済んでから読む。先に読むと、同期前の構成を編集して
	// 上書きしてしまう（お気に入り絵文字と同じ理由）。
```

<!-- source: src/routes/settings/feed-tabs/+page.svelte:57 -->

### [src/routes/settings/feed-tabs/+page.svelte:57](../../../src/routes/settings/feed-tabs/+page.svelte#L57)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
/**
	 * 名前の下に出す種別。組み込みタブは名前と種別が同じ語になってしまうので
	 * （「グローバル / グローバル」）、代わりに中身の説明を出す。
	 */
```

## src/routes/thread/[did]/[rkey]/+page.svelte

<!-- source: src/routes/thread/[did]/[rkey]/+page.svelte:47 -->

### [src/routes/thread/[did]/[rkey]/+page.svelte:47](../../../src/routes/thread/[did]/[rkey]/+page.svelte#L47)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 楽観返信は時系列の末尾に置く。先頭に積むと、サーバーが取り込んだ瞬間に本来の位置
	// （下）へ飛んでしまい、書いたばかりの返信を見失う。
```

<!-- source: src/routes/thread/[did]/[rkey]/+page.svelte:65 -->

### [src/routes/thread/[did]/[rkey]/+page.svelte:65](../../../src/routes/thread/[did]/[rkey]/+page.svelte#L65)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 投稿直後の画面追従。楽観返信 → 確定した返信で DOM が入れ替わるので、
	// 返信リストが変わるたびに追従先を引き直す。
```

<!-- source: src/routes/thread/[did]/[rkey]/+page.svelte:79 -->

### [src/routes/thread/[did]/[rkey]/+page.svelte:79](../../../src/routes/thread/[did]/[rkey]/+page.svelte#L79)

分類: 仕様・設計の根拠。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 投稿直後は AppView に投稿が見えてから bot ジョブが作られるまで短い差があり得る。
			// ジョブがまだ無い最初の応答でも、直近3分のスレッドは高速更新を続ける。
```

## tests/e2e/feed-interactions.spec.ts

<!-- source: tests/e2e/feed-interactions.spec.ts:144 -->

### [tests/e2e/feed-interactions.spec.ts:144](../../../tests/e2e/feed-interactions.spec.ts#L144)

分類: 検証・再現条件。対応仕様: [feed-thread](spec.md#requirements)。

```text
// Exercise both grouped conversations and the legacy parent/reply layout.
```

## tests/e2e/reply-to-viewer.spec.ts

<!-- source: tests/e2e/reply-to-viewer.spec.ts:16 -->

### [tests/e2e/reply-to-viewer.spec.ts:16](../../../tests/e2e/reply-to-viewer.spec.ts#L16)

分類: 検証・再現条件。対応仕様: [feed-thread](spec.md#requirements)。

```text
// 会話カードの自己返信と他の人宛ての返信には出さず、botたんと人からの自分宛てにだけ出す。
```
