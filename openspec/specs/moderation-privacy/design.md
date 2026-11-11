# moderation-privacy：設計判断・コメント出典

この文書は初期仕様化時点のコメント原文を保存する設計資料である。現在の振る舞い・検証条件は [spec.md](spec.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/components/AgeAssuranceForm.svelte

<!-- source: src/lib/components/AgeAssuranceForm.svelte:23 -->

### [src/lib/components/AgeAssuranceForm.svelte:23](../../../src/lib/components/AgeAssuranceForm.svelte#L23)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
// 18歳未満のときだけ保護者同意を訊く。日付が未入力のうちは出さない。
```

<!-- source: src/lib/components/AgeAssuranceForm.svelte:27 -->

### [src/lib/components/AgeAssuranceForm.svelte:27](../../../src/lib/components/AgeAssuranceForm.svelte#L27)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** "2008-09-02" を表示用に整形する。パースできない値はそのまま出す。 */
```

<!-- source: src/lib/components/AgeAssuranceForm.svelte:48 -->

### [src/lib/components/AgeAssuranceForm.svelte:48](../../../src/lib/components/AgeAssuranceForm.svelte#L48)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
// 一度登録すると変更できないので、送信の前に必ず確認を挟む。
```

<!-- source: src/lib/components/AgeAssuranceForm.svelte:67 -->

### [src/lib/components/AgeAssuranceForm.svelte:67](../../../src/lib/components/AgeAssuranceForm.svelte#L67)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
<!--
	年齢は AppView のアカウントに紐づくので、未ログインでは何も出さない。
	置き場所を増やしても安全なように、ガードは各ページではなくここに持たせる。
-->
```

## src/lib/components/AgeConfirmDialog.svelte

<!-- source: src/lib/components/AgeConfirmDialog.svelte:13 -->

### [src/lib/components/AgeConfirmDialog.svelte:13](../../../src/lib/components/AgeConfirmDialog.svelte#L13)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** 表示用に整形済みの生年月日。 */
```

## src/lib/components/ContentWarningMask.svelte

<!-- source: src/lib/components/ContentWarningMask.svelte:19 -->

### [src/lib/components/ContentWarningMask.svelte:19](../../../src/lib/components/ContentWarningMask.svelte#L19)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** 見出しの下に1行ずつ出す理由（自動モデレーションの判定理由など）。 */
```

<!-- source: src/lib/components/ContentWarningMask.svelte:42 -->

### [src/lib/components/ContentWarningMask.svelte:42](../../../src/lib/components/ContentWarningMask.svelte#L42)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
<!-- role/tabindex are both present only for the interactive variant. -->
```

<!-- source: src/lib/components/ContentWarningMask.svelte:43 -->

### [src/lib/components/ContentWarningMask.svelte:43](../../../src/lib/components/ContentWarningMask.svelte#L43)

分類: ツール指示（削除対象外）。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
```

<!-- source: src/lib/components/ContentWarningMask.svelte:190 -->

### [src/lib/components/ContentWarningMask.svelte:190](../../../src/lib/components/ContentWarningMask.svelte#L190)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/* 理由は文の途中で折り返さないよう1行ずつ置く。狭い幅で読みにくくなるため。 */
```

## src/lib/components/ReportDialog.svelte

<!-- source: src/lib/components/ReportDialog.svelte:17 -->

### [src/lib/components/ReportDialog.svelte:17](../../../src/lib/components/ReportDialog.svelte#L17)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/**
	 * 投稿（botたんの投稿を含む）や、自分の投稿に付いたリアクションを運営に伝える。
	 * 届くのは運営の Discord だけで、相手には知らされない。
	 */
```

<!-- source: src/lib/components/ReportDialog.svelte:27 -->

### [src/lib/components/ReportDialog.svelte:27](../../../src/lib/components/ReportDialog.svelte#L27)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** 渡したときはリアクションの通報になる（自分の投稿に付いたもの）。 */
```

<!-- source: src/lib/components/ReportDialog.svelte:36 -->

### [src/lib/components/ReportDialog.svelte:36](../../../src/lib/components/ReportDialog.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** 誰が・どの絵文字を付けたか。自分のリアクションは選べない。 */
```

<!-- source: src/lib/components/ReportDialog.svelte:81 -->

### [src/lib/components/ReportDialog.svelte:81](../../../src/lib/components/ReportDialog.svelte#L81)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
// botたんの投稿は「返答へのFB」が主な用途なので最初から選んでおく。相手が1人ならそれも選んでおく。
```

## src/lib/legal/meta.ts

<!-- source: src/lib/legal/meta.ts:1 -->

### [src/lib/legal/meta.ts:1](../../../src/lib/legal/meta.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/**
 * 利用規約・プライバシーポリシーの最終更新日。
 * 4ファイル（Terms/Privacy の ja/en）に同じ日付を散らすと必ずずれるので1箇所に置く。
 * 本文を実質的に変更したときだけ更新すること。動的サイトマップもこの値を使う。
 */
```

<!-- source: src/lib/legal/meta.ts:16 -->

### [src/lib/legal/meta.ts:16](../../../src/lib/legal/meta.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** 連絡先。規約・ポリシー・通報導線から参照する。 */
```

## src/lib/moderation/age.svelte.ts

<!-- source: src/lib/moderation/age.svelte.ts:3 -->

### [src/lib/moderation/age.svelte.ts:3](../../../src/lib/moderation/age.svelte.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/**
 * 年齢確認の状態。
 *
 * 生年月日は入力しなくても利用を始められる（その場合は未成年として扱う）。
 * あとから1度だけ設定でき、以後は変更できない。成人向けコンテンツを見るために
 * 年齢を上書きされないようにするため。
 *
 * 実際の出し分けはサーバが行う（AppView が未成年へ成人向けを返さない）。
 * ここが持つのは「なぜ見えないのか」を説明し、申告の導線を出すための状態だけ。
 */
```

<!-- source: src/lib/moderation/age.svelte.ts:15 -->

### [src/lib/moderation/age.svelte.ts:15](../../../src/lib/moderation/age.svelte.ts#L15)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** 未取得。ログイン前・同期前。 */
```

<!-- source: src/lib/moderation/age.svelte.ts:18 -->

### [src/lib/moderation/age.svelte.ts:18](../../../src/lib/moderation/age.svelte.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** 生年月日を申告済みか。false なら未申告＝未成年扱い。 */
```

<!-- source: src/lib/moderation/age.svelte.ts:20 -->

### [src/lib/moderation/age.svelte.ts:20](../../../src/lib/moderation/age.svelte.ts#L20)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** 申告した生年月日（YYYY-MM-DD）。本人にだけ返る。未申告なら undefined。 */
```

<!-- source: src/lib/moderation/age.svelte.ts:38 -->

### [src/lib/moderation/age.svelte.ts:38](../../../src/lib/moderation/age.svelte.ts#L38)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** 本人が設定画面で確認するための値。他人には見えない。 */
```

<!-- source: src/lib/moderation/age.svelte.ts:42 -->

### [src/lib/moderation/age.svelte.ts:42](../../../src/lib/moderation/age.svelte.ts#L42)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** 申告を促すべきか。未申告のユーザーにだけ導線を出す。 */
```

<!-- source: src/lib/moderation/age.svelte.ts:48 -->

### [src/lib/moderation/age.svelte.ts:48](../../../src/lib/moderation/age.svelte.ts#L48)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** getPreferences のレスポンスから取り込む。設定同期と同じ経路に相乗りしている。 */
```

<!-- source: src/lib/moderation/age.svelte.ts:67 -->

### [src/lib/moderation/age.svelte.ts:67](../../../src/lib/moderation/age.svelte.ts#L67)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
// 同期できない端末では未申告扱いのまま。表示制御はサーバがやるので実害はない。
```

<!-- source: src/lib/moderation/age.svelte.ts:76 -->

### [src/lib/moderation/age.svelte.ts:76](../../../src/lib/moderation/age.svelte.ts#L76)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** 18歳以上かどうかをクライアント側でも判定する（同意チェックの出し分け用）。 */
```

<!-- source: src/lib/moderation/age.svelte.ts:84 -->

### [src/lib/moderation/age.svelte.ts:84](../../../src/lib/moderation/age.svelte.ts#L84)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/**
 * 生年月日を申告する。1度だけ。サーバが真実源なので、返ってきた確定値で状態を更新する。
 */
```

<!-- source: src/lib/moderation/age.svelte.ts:98 -->

### [src/lib/moderation/age.svelte.ts:98](../../../src/lib/moderation/age.svelte.ts#L98)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
// すでに申告済み。サーバの値を取り直して画面を実態に合わせる。
```

## src/lib/moderation/preferences.svelte.ts

<!-- source: src/lib/moderation/preferences.svelte.ts:1 -->

### [src/lib/moderation/preferences.svelte.ts:1](../../../src/lib/moderation/preferences.svelte.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/**
 * ラベル付きコンテンツの見せ方の設定。
 *
 * 未成年に成人向けを見せない強制はサーバ側が行う。ここでは成人ユーザーの表示設定を
 * DID ごとの端末キャッシュへ即時保存し、ログイン中は preferences API と同期する。
 */
```

<!-- source: src/lib/moderation/preferences.svelte.ts:63 -->

### [src/lib/moderation/preferences.svelte.ts:63](../../../src/lib/moderation/preferences.svelte.ts#L63)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
// ストレージが使えなくても、現在のタブでは設定を適用する。
```

<!-- source: src/lib/moderation/preferences.svelte.ts:81 -->

### [src/lib/moderation/preferences.svelte.ts:81](../../../src/lib/moderation/preferences.svelte.ts#L81)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** サインイン状態が変わったら、表示へ使う端末キャッシュを切り替える。 */
```

<!-- source: src/lib/moderation/preferences.svelte.ts:104 -->

### [src/lib/moderation/preferences.svelte.ts:104](../../../src/lib/moderation/preferences.svelte.ts#L104)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
// 旧値はアカウントを識別できないため、最初のログイン先へ一度だけ移す。
```

<!-- source: src/lib/moderation/preferences.svelte.ts:107 -->

### [src/lib/moderation/preferences.svelte.ts:107](../../../src/lib/moderation/preferences.svelte.ts#L107)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
// 壊れた旧値は既定値へフォールバックする。
```

<!-- source: src/lib/moderation/preferences.svelte.ts:123 -->

### [src/lib/moderation/preferences.svelte.ts:123](../../../src/lib/moderation/preferences.svelte.ts#L123)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** サーバー側が新しいとき、その確定値を通知なしで採用する。 */
```

<!-- source: src/lib/moderation/preferences.svelte.ts:147 -->

### [src/lib/moderation/preferences.svelte.ts:147](../../../src/lib/moderation/preferences.svelte.ts#L147)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
// 消せない端末でもアカウント削除自体は完了している。
```

<!-- source: src/lib/moderation/preferences.svelte.ts:157 -->

### [src/lib/moderation/preferences.svelte.ts:157](../../../src/lib/moderation/preferences.svelte.ts#L157)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/**
 * 自動判定のうち、画像・動画から付きうるラベル。投稿者が全メディアをCWで伏せていれば
 * それ以上の警告は要らない。harassment・hate・!warn は本文由来でもありうるので含めない。
 * !hide（児童保護）は表示設定の対象外として常に残す。
 */
```

<!-- source: src/lib/moderation/preferences.svelte.ts:166 -->

### [src/lib/moderation/preferences.svelte.ts:166](../../../src/lib/moderation/preferences.svelte.ts#L166)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** 画像か動画が1つ以上あり、そのすべてに投稿者がCWを付けているか。 */
```

<!-- source: src/lib/moderation/preferences.svelte.ts:175 -->

### [src/lib/moderation/preferences.svelte.ts:175](../../../src/lib/moderation/preferences.svelte.ts#L175)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** 投稿・プロフィール・チャンネル・カスタム絵文字で共通の表示判定。 */
```

<!-- source: src/lib/moderation/preferences.svelte.ts:183 -->

### [src/lib/moderation/preferences.svelte.ts:183](../../../src/lib/moderation/preferences.svelte.ts#L183)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/**
	 * 投稿者のCWで画像がすでに伏せてあるなら、自動判定による投稿全体の警告は重ねない
	 * （2重に隠さない）。投稿者自身が付けたラベルは本人の意思なので、ここでは外さない。
	 * 非表示は利用者が選んだ設定なので、そのまま効かせる。
	 */
```

<!-- source: src/lib/moderation/preferences.svelte.ts:190 -->

### [src/lib/moderation/preferences.svelte.ts:190](../../../src/lib/moderation/preferences.svelte.ts#L190)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
// 見出しには投稿者自身の申告を優先して出すので、セルフラベルを先に積む。
```

## src/lib/moderation/reasons.ts

<!-- source: src/lib/moderation/reasons.ts:1 -->

### [src/lib/moderation/reasons.ts:1](../../../src/lib/moderation/reasons.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/**
 * 自動モデレーションで伏せた理由を、ぼかしの見出しに出す。
 *
 * 一律に「自動モデレーション」とだけ出すと、なぜ伏せられたかが分からず好奇心で
 * 開かれてしまう。AppView が返す moderationLabels から理由を引いて添える。
 * 判定には誤りがありうるので、文言はどれも「〜の可能性」にしてある。
 */
```

<!-- source: src/lib/moderation/reasons.ts:18 -->

### [src/lib/moderation/reasons.ts:18](../../../src/lib/moderation/reasons.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/**
 * ラベル → 理由。
 *
 * !hide（画像の未成年に関わる性的表現の判定）は sexual と同じ文言にする。誤判定だった
 * ときに、その疑いを投稿へ公に貼らないため。未成年の閲覧者にはサーバがそもそも返さない。
 * !warn は自傷・画像の暴力・違法行為などの受け皿なので、まとめた文言で出す。
 */
```

<!-- source: src/lib/moderation/reasons.ts:35 -->

### [src/lib/moderation/reasons.ts:35](../../../src/lib/moderation/reasons.ts#L35)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** ラベルから理由のキーを引く。知らないラベルは汎用の文言に寄せ、同じ理由は1つにまとめる。 */
```

<!-- source: src/lib/moderation/reasons.ts:45 -->

### [src/lib/moderation/reasons.ts:45](../../../src/lib/moderation/reasons.ts#L45)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/** ぼかしの見出しの下に出す理由。例 ["性的な表現の可能性"]。ラベルが無ければ空。 */
```

## src/routes/dev/e2e/report/+page.svelte

<!-- source: src/routes/dev/e2e/report/+page.svelte:8 -->

### [src/routes/dev/e2e/report/+page.svelte:8](../../../src/routes/dev/e2e/report/+page.svelte#L8)

分類: 検証・再現条件。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
/**
	 * 「運営に伝える」の確認用。他人の投稿・botたんの投稿・リアクションが付いた自分の投稿を並べる。
	 * 送信は com.suibari.nagi.createReport へ飛ぶので、e2e ではそこを差し替える。
	 * サインイン済みなら本物のセッションを使う（OAuth の復元を待ってから描く）。
	 */
```

## src/routes/privacy/PrivacyEn.svelte

<!-- source: src/routes/privacy/PrivacyEn.svelte:5 -->

### [src/routes/privacy/PrivacyEn.svelte:5](../../../src/routes/privacy/PrivacyEn.svelte#L5)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
<!-- English translation. If there is any discrepancy, the Japanese version prevails. -->
```

## src/routes/settings/moderation/+page.svelte

<!-- source: src/routes/settings/moderation/+page.svelte:31 -->

### [src/routes/settings/moderation/+page.svelte:31](../../../src/routes/settings/moderation/+page.svelte#L31)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
<!--
		年齢確認と表示設定は、どちらもアカウントに紐づく判断（年齢は AppView が持ち、
		成人向けの出し分けもサーバが行う）。他の設定ページと同じくログインを必須にする。
	-->
```

<!-- source: src/routes/settings/moderation/+page.svelte:38 -->

### [src/routes/settings/moderation/+page.svelte:38](../../../src/routes/settings/moderation/+page.svelte#L38)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
<!--
			未成年に成人向けを見せない強制はサーバ側（AppView が返さない）。ここでの設定は
			成人ユーザーの好みなので、未成年アカウントには効かないことを明示する。
		-->
```

## src/routes/terms/TermsEn.svelte

<!-- source: src/routes/terms/TermsEn.svelte:5 -->

### [src/routes/terms/TermsEn.svelte:5](../../../src/routes/terms/TermsEn.svelte#L5)

分類: 仕様・設計の根拠。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
<!-- English translation. If there is any discrepancy, the Japanese version prevails. -->
```

## tests/e2e/report.spec.ts

<!-- source: tests/e2e/report.spec.ts:67 -->

### [tests/e2e/report.spec.ts:67](../../../tests/e2e/report.spec.ts#L67)

分類: 検証・再現条件。対応仕様: [moderation-privacy](spec.md#requirements)。

```text
// 自分の投稿には「運営に伝える」は出さず、リアクションだけを伝えられる。
```
