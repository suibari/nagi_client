# 設定同期・プロフィール・ゲスト投稿：導入時コメント原文

この文書は基準コミット `24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf` に固定した履歴資料であり、現行コードの行番号一覧ではない。現在の要件は [spec.md](../../specs/preferences-profile/spec.md)、判断理由は [design.md](../../specs/preferences-profile/design.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/badges/badges.test.ts

<!-- source: src/lib/badges/badges.test.ts:47 -->

### [src/lib/badges/badges.test.ts:47](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/badges/badges.test.ts#L47)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 絵文字だけだとスマホで意味が伝わらない。
```

<!-- source: src/lib/badges/badges.test.ts:53 -->

### [src/lib/badges/badges.test.ts:53](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/badges/badges.test.ts#L53)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 累積表示は競争圧力になるとして超ポジティブLvが既に非表示にされている。
		// 同じものを別名で復活させないための固定。
```

## src/lib/badges/badges.ts

<!-- source: src/lib/badges/badges.ts:7 -->

### [src/lib/badges/badges.ts:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/badges/badges.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** ホバー時の補足。読み上げ用の言い換えにも使う。 */
```

<!-- source: src/lib/badges/badges.ts:9 -->

### [src/lib/badges/badges.ts:9](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/badges/badges.ts#L9)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** CSS 修飾子 `.badge--{tone}` に対応するトークン名。 */
```

<!-- source: src/lib/badges/badges.ts:13 -->

### [src/lib/badges/badges.ts:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/badges/badges.ts#L13)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** 超ポジティブLvの色が変わる境界。下限値の昇順。 */
```

<!-- source: src/lib/badges/badges.ts:16 -->

### [src/lib/badges/badges.ts:16](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/badges/badges.ts#L16)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** レベルから 1〜5 のティアを返す。100以上はすべて最上位（Bluesky側のラベルもここで頭打ち）。 */
```

<!-- source: src/lib/badges/badges.ts:26 -->

### [src/lib/badges/badges.ts:26](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/badges/badges.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** false にするとデータを残したまま Nagi の全表示箇所から外せる。 */
```

<!-- source: src/lib/badges/badges.ts:31 -->

### [src/lib/badges/badges.ts:31](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/badges/badges.ts#L31)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * Nagi で表示するユーザーバッジの唯一のレジストリ。
 * 表示の再開は enabled、新しい種類の追加はこの配列だけを変更すればよい。
 */
```

<!-- source: src/lib/badges/badges.ts:41 -->

### [src/lib/badges/badges.ts:41](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/badges/badges.ts#L41)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 称号は Bluesky と共通。あちらのラベルは24時間で失効するが、こちらは
		// 次の日記が書かれるまで出しっぱなしにする。
```

<!-- source: src/lib/badges/badges.ts:57 -->

### [src/lib/badges/badges.ts:57](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/badges/badges.ts#L57)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/*
		 * 今日のゼンカツ部長（前日の受賞者）。
		 *
		 * **毎日ひとりだけが持ち、1日で消える。** 下の超ポジティブLvが「競争や
		 * 『ネガティブなことを言いづらい』という圧力につながる」として非表示にされているのと
		 * 同じ轍を踏まないため、累積は絶対に出さない。単調増加しないことがこのバッジの肝。
		 *
		 * ラベルに賞名を入れているのは、title 属性がタッチ端末では読めないから。
		 * 絵文字だけだとスマホで意味が伝わらない。
		 */
```

<!-- source: src/lib/badges/badges.ts:79 -->

### [src/lib/badges/badges.ts:79](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/badges/badges.ts#L79)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 競争や「ネガティブなことを言いづらい」という圧力につながるため現在は非表示。
		// レベルの取得・蓄積・表示定義は残し、方針が変わったらここだけで再開できる。
```

## src/lib/bookmarks/bookmarks.svelte.ts

<!-- source: src/lib/bookmarks/bookmarks.svelte.ts:226 -->

### [src/lib/bookmarks/bookmarks.svelte.ts:226](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bookmarks/bookmarks.svelte.ts#L226)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 保存先の記憶だけ失敗してもブックマーク本体には影響させない。
```

<!-- source: src/lib/bookmarks/bookmarks.svelte.ts:250 -->

### [src/lib/bookmarks/bookmarks.svelte.ts:250](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/bookmarks/bookmarks.svelte.ts#L250)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 本体の保存・解除は成功済み。件数は次回読み込みで収束させる。
```

## src/lib/components/ActorSuggestionList.svelte

<!-- source: src/lib/components/ActorSuggestionList.svelte:6 -->

### [src/lib/components/ActorSuggestionList.svelte:6](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ActorSuggestionList.svelte#L6)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// アクター候補ドロップダウンの見た目だけを担う純粋な提示コンポーネント。
	// listbox の骨組みは SuggestionList、検索・キーボード操作はホスト側
	// （MentionTextarea / HandleInput）が持つ。
```

## src/lib/components/AvatarLink.svelte

<!-- source: src/lib/components/AvatarLink.svelte:8 -->

### [src/lib/components/AvatarLink.svelte:8](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AvatarLink.svelte#L8)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
	 * プロフィールへ飛ぶアバターリンク。デスクトップではホバーで名刺を出す。
	 *
	 * クリック＝プロフィール遷移は据え置きで、ホバーは足すだけ。タッチ端末には
	 * ホバーが無く、代替として長押しなどを充てると本来の遷移を邪魔するので、
	 * (hover: hover) and (pointer: fine) のときだけ有効化する。
	 */
```

<!-- source: src/lib/components/AvatarLink.svelte:25 -->

### [src/lib/components/AvatarLink.svelte:25](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AvatarLink.svelte#L25)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** 呼び出し元固有の配置・重なりスタイルを保つための追加クラス。 */
```

<!-- source: src/lib/components/AvatarLink.svelte:29 -->

### [src/lib/components/AvatarLink.svelte:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AvatarLink.svelte#L29)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** アバターと名前をひとつのプロフィールリンクにする。 */
```

<!-- source: src/lib/components/AvatarLink.svelte:33 -->

### [src/lib/components/AvatarLink.svelte:33](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AvatarLink.svelte#L33)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** 通り過ぎるだけのカーソルで取得を走らせないための待ち時間。 */
```

<!-- source: src/lib/components/AvatarLink.svelte:35 -->

### [src/lib/components/AvatarLink.svelte:35](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AvatarLink.svelte#L35)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** アバターからカード本体へマウスを移す間、閉じないでおく猶予。 */
```

<!-- source: src/lib/components/AvatarLink.svelte:50 -->

### [src/lib/components/AvatarLink.svelte:50](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/AvatarLink.svelte#L50)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 取得済みなら待たずに出す。2回目以降のホバーで間が空くのは鬱陶しい。
```

## src/lib/components/PreferencesSyncNotice.svelte

<!-- source: src/lib/components/PreferencesSyncNotice.svelte:9 -->

### [src/lib/components/PreferencesSyncNotice.svelte:9](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/PreferencesSyncNotice.svelte#L9)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
	 * permission-set に lxm を足した直後は、既存ユーザーのトークンに旧スコープが
	 * 焼き付いたままなので同期用の API が 403 を返す。その間は端末ローカルで従来どおり
	 * 動くが、黙って同期されないと「壊れている」ように見えるのでここで告知する。
	 * 認可サーバのキャッシュ（最大24h）が切れるまでは再ログインしても解消しないため、
	 * ボタンは「試せる導線」であって保証ではない。
	 */
```

## src/lib/components/ProfileAppLinks.svelte

<!-- source: src/lib/components/ProfileAppLinks.svelte:11 -->

### [src/lib/components/ProfileAppLinks.svelte:11](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ProfileAppLinks.svelte#L11)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// did ごとに一度だけ読む。表示は所有者の PDS を直読みするため失敗しても静かに握りつぶす。
```

<!-- source: src/lib/components/ProfileAppLinks.svelte:27 -->

### [src/lib/components/ProfileAppLinks.svelte:27](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ProfileAppLinks.svelte#L27)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 自分のプロフィールなら各カードに編集ボタンを出し、押すと設定画面の該当連携を開く。
```

<!-- source: src/lib/components/ProfileAppLinks.svelte:49 -->

### [src/lib/components/ProfileAppLinks.svelte:49](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ProfileAppLinks.svelte#L49)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/* profile-header の grid アイテムとして、長い URL の min-content 幅を親へ伝播させない。 */
```

## src/lib/components/ProfileDescription.svelte

<!-- source: src/lib/components/ProfileDescription.svelte:13 -->

### [src/lib/components/ProfileDescription.svelte:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/ProfileDescription.svelte#L13)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// Bluesky と同じ検出規則を使う。mention の DID 解決はせず、handle のまま
		// Nagi 内プロフィールへ渡して AppView 側で解決する。
```

## src/lib/components/SignedOutNotice.svelte

<!-- source: src/lib/components/SignedOutNotice.svelte:7 -->

### [src/lib/components/SignedOutNotice.svelte:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/SignedOutNotice.svelte#L7)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
	 * 設定画面などの未ログイン表示。ページごとに違うのは文言だけなので、ここに集約する。
	 * 設定の面（.settings-panel）と同じ形の1枚に、説明とログインへの導線を置く。
	 */
```

<!-- source: src/lib/components/SignedOutNotice.svelte:14 -->

### [src/lib/components/SignedOutNotice.svelte:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/SignedOutNotice.svelte#L14)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// ログイン後に見ていた設定ページへ戻す。遷移そのものは href に任せる。
```

<!-- source: src/lib/components/SignedOutNotice.svelte:36 -->

### [src/lib/components/SignedOutNotice.svelte:36](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/SignedOutNotice.svelte#L36)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/* 面の行区切り（> * + *）は、この中の段落とボタンには付けない。 */
```

## src/lib/components/WelcomeTutorialDialog.svelte

<!-- source: src/lib/components/WelcomeTutorialDialog.svelte:35 -->

### [src/lib/components/WelcomeTutorialDialog.svelte:35](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/WelcomeTutorialDialog.svelte#L35)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 開いた瞬間に1行目へフォーカス枠が出ないよう、読み始めは見出しから。
```

## src/lib/components/WelcomeTutorialEntry.svelte

<!-- source: src/lib/components/WelcomeTutorialEntry.svelte:7 -->

### [src/lib/components/WelcomeTutorialEntry.svelte:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/WelcomeTutorialEntry.svelte#L7)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** モーダルを閉じたあとも、済むまではフィードの上から開き直せるようにしておく控えめな入口。 */
```

<!-- source: src/lib/components/WelcomeTutorialEntry.svelte:98 -->

### [src/lib/components/WelcomeTutorialEntry.svelte:98](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/WelcomeTutorialEntry.svelte#L98)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/* 狭い画面ではタイトルを優先し、進捗は数字だけにする。 */
```

## src/lib/components/WelcomeTutorialHost.svelte

<!-- source: src/lib/components/WelcomeTutorialHost.svelte:9 -->

### [src/lib/components/WelcomeTutorialHost.svelte:9](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/WelcomeTutorialHost.svelte#L9)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/*
	 * 「Nagiのはじめかた」の進捗をアプリ全体で拾う。対象外のユーザー（記録が無い）では
	 * markDone は何もしないので、ここでは条件を分けずに合図だけ流す。
	 * 絵文字の送信は ReactionBar が直接 markDone('reaction') を呼ぶ。
	 */
```

<!-- source: src/lib/components/WelcomeTutorialHost.svelte:18 -->

### [src/lib/components/WelcomeTutorialHost.svelte:18](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/WelcomeTutorialHost.svelte#L18)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 投稿の合図はカウンタなので、マウント時点の値は「済んだ」扱いにしない。
```

<!-- source: src/lib/components/WelcomeTutorialHost.svelte:27 -->

### [src/lib/components/WelcomeTutorialHost.svelte:27](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/components/WelcomeTutorialHost.svelte#L27)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 感情グラフは /diary の月間アクティビティ（既定のタブ）にある。年表タブは数えない。
```

## src/lib/guest-posts/guest-posts.svelte.ts

<!-- source: src/lib/guest-posts/guest-posts.svelte.ts:85 -->

### [src/lib/guest-posts/guest-posts.svelte.ts:85](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/guest-posts/guest-posts.svelte.ts#L85)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 一時的なオフラインでは端末内の投稿を残し、次のポーリングで再試行する。
```

## src/lib/guest-posts/privacy.test.ts

<!-- source: src/lib/guest-posts/privacy.test.ts:83 -->

### [src/lib/guest-posts/privacy.test.ts:83](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/guest-posts/privacy.test.ts#L83)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 条件が揃うまでは送信ボタンを控えめな見た目にして、押せない理由が伝わるようにする。
```

<!-- source: src/lib/guest-posts/privacy.test.ts:119 -->

### [src/lib/guest-posts/privacy.test.ts:119](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/guest-posts/privacy.test.ts#L119)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 未サインインの TOP はランディング、サインイン済みはフィード。
```

<!-- source: src/lib/guest-posts/privacy.test.ts:122 -->

### [src/lib/guest-posts/privacy.test.ts:122](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/guest-posts/privacy.test.ts#L122)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// フィードは見出し → タブ。ゲスト投稿は FeedShell の中にだけ出る。
```

<!-- source: src/lib/guest-posts/privacy.test.ts:134 -->

### [src/lib/guest-posts/privacy.test.ts:134](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/guest-posts/privacy.test.ts#L134)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 末尾は /about と同じ参加の締めを使う。
```

## src/lib/mute/mutes.svelte.ts

<!-- source: src/lib/mute/mutes.svelte.ts:7 -->

### [src/lib/mute/mutes.svelte.ts:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/mute/mutes.svelte.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * 自分のミュート一覧。除外そのものは AppView が SQL でやるので、ここでフィードを絞ることは
 * しない（Feed は画面ごとに作り直されて再取得するし、クライアントで絞るとミュート非適用の
 * プロフィールフィードまで巻き込む）。この状態はボタンの ON/OFF 表示と設定画面の一覧が用途。
 * ミュートは非公開情報なので、この集合を他人に見せる経路を作らないこと。
 */
```

<!-- source: src/lib/mute/mutes.svelte.ts:15 -->

### [src/lib/mute/mutes.svelte.ts:15](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/mute/mutes.svelte.ts#L15)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** # を除いた小文字のタグ。AppView 側の正規形と同じ。 */
```

<!-- source: src/lib/mute/mutes.svelte.ts:18 -->

### [src/lib/mute/mutes.svelte.ts:18](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/mute/mutes.svelte.ts#L18)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** 進行中の切り替え（連打防止とスピナー表示用）。値は subject。 */
```

<!-- source: src/lib/mute/mutes.svelte.ts:31 -->

### [src/lib/mute/mutes.svelte.ts:31](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/mute/mutes.svelte.ts#L31)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** サインイン後に1回だけ読む。未ログインなら空のままにする。 */
```

<!-- source: src/lib/mute/mutes.svelte.ts:43 -->

### [src/lib/mute/mutes.svelte.ts:43](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/mute/mutes.svelte.ts#L43)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 取得できなくてもサーバ側のフィルタは効くので、閲覧自体は止めない。
```

<!-- source: src/lib/mute/mutes.svelte.ts:55 -->

### [src/lib/mute/mutes.svelte.ts:55](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/mute/mutes.svelte.ts#L55)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** 楽観的に反映してから API を呼び、失敗したら巻き戻す。 */
```

## src/lib/onboarding/tutorial.svelte.ts

<!-- source: src/lib/onboarding/tutorial.svelte.ts:1 -->

### [src/lib/onboarding/tutorial.svelte.ts:1](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/onboarding/tutorial.svelte.ts#L1)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * 「Nagiのはじめかた」チェックリスト。サインアップ直後のユーザーにだけ出す。
 *
 * 進捗は DID ごとに localStorage へ置く。記録が無いユーザー（既存ユーザー・別端末）は
 * 対象外として何も出さない。サーバーに持たないのは、取りこぼしても困らない案内だから。
 */
```

<!-- source: src/lib/onboarding/tutorial.svelte.ts:32 -->

### [src/lib/onboarding/tutorial.svelte.ts:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/onboarding/tutorial.svelte.ts#L32)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 保存できなくても、このタブの中では進捗を持ち続ける。
```

<!-- source: src/lib/onboarding/tutorial.svelte.ts:40 -->

### [src/lib/onboarding/tutorial.svelte.ts:40](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/onboarding/tutorial.svelte.ts#L40)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** 3つ目が済んだ瞬間だけ true。コンフェッティを1回だけ出すのに使う。 */
```

<!-- source: src/lib/onboarding/tutorial.svelte.ts:49 -->

### [src/lib/onboarding/tutorial.svelte.ts:49](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/onboarding/tutorial.svelte.ts#L49)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** フィードの入口を出すか。済ませた・もう出さないを選んだら消す。 */
```

<!-- source: src/lib/onboarding/tutorial.svelte.ts:54 -->

### [src/lib/onboarding/tutorial.svelte.ts:54](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/onboarding/tutorial.svelte.ts#L54)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** サインイン中の DID に切り替える。記録が無ければ対象外。 */
```

<!-- source: src/lib/onboarding/tutorial.svelte.ts:63 -->

### [src/lib/onboarding/tutorial.svelte.ts:63](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/onboarding/tutorial.svelte.ts#L63)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** 新規ユーザーとして始める。プロフィールを自動作成した直後に呼ぶ。 */
```

<!-- source: src/lib/onboarding/tutorial.svelte.ts:78 -->

### [src/lib/onboarding/tutorial.svelte.ts:78](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/onboarding/tutorial.svelte.ts#L78)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 全部済んだら、閉じていても開き直して一緒に喜ぶ（もう出さないを選んだ人にも）。
```

<!-- source: src/lib/onboarding/tutorial.svelte.ts:94 -->

### [src/lib/onboarding/tutorial.svelte.ts:94](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/onboarding/tutorial.svelte.ts#L94)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** フィードの入口を消す。進捗の記録は続ける。 */
```

## src/lib/preferences/preferences.svelte.ts

<!-- source: src/lib/preferences/preferences.svelte.ts:17 -->

### [src/lib/preferences/preferences.svelte.ts:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/preferences.svelte.ts#L17)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * 端末をまたいで同期する設定（既読位置・お気に入り絵文字・お気に入りタグなど）の通信層。
 *
 * ここはトランスポートと「サーバーが持っている値」の保持だけを行い、それをどこへ
 * 適用するかは `$lib/preferences/sync.svelte` が決める。favorites / watermark 側から
 * このモジュールへ push できるよう、逆向きの依存を作らないため。
 *
 * permission-set に lxm を足した直後は、既存ユーザーのトークンに旧スコープが焼き付いた
 * ままなので 403 が返る。それは障害ではなく「まだ同期できない端末」なので、静かに
 * unauthorized を立てて localStorage 単独動作（＝従来の挙動）へ落とす。
 */
```

<!-- source: src/lib/preferences/preferences.svelte.ts:36 -->

### [src/lib/preferences/preferences.svelte.ts:36](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/preferences.svelte.ts#L36)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** マージ後の確定値の通知。sent はこの送信に何を含めたか（含めていない項目で上書きしないため）。 */
```

<!-- source: src/lib/preferences/preferences.svelte.ts:50 -->

### [src/lib/preferences/preferences.svelte.ts:50](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/preferences.svelte.ts#L50)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** サーバーと同期できている（getPreferences が成功した）か。 */
```

<!-- source: src/lib/preferences/preferences.svelte.ts:55 -->

### [src/lib/preferences/preferences.svelte.ts:55](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/preferences.svelte.ts#L55)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** 同期結果をキャッシュへ保存した後、表示側へ再読込を知らせる。 */
```

<!-- source: src/lib/preferences/preferences.svelte.ts:57 -->

### [src/lib/preferences/preferences.svelte.ts:57](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/preferences.svelte.ts#L57)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
	 * スコープが足りずに拒否された。再ログインを促す告知はこれが true のときだけ出す
	 * （オフラインや一時的な障害と区別するため）。
	 */
```

<!-- source: src/lib/preferences/preferences.svelte.ts:64 -->

### [src/lib/preferences/preferences.svelte.ts:64](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/preferences.svelte.ts#L64)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** サーバーが持っている既読位置。あとから作られるウォーターマークもここから取り込む。 */
```

<!-- source: src/lib/preferences/preferences.svelte.ts:77 -->

### [src/lib/preferences/preferences.svelte.ts:77](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/preferences.svelte.ts#L77)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** マージ後の確定値を受け取るハンドラ。sync 層が1つだけ登録する。 */
```

<!-- source: src/lib/preferences/preferences.svelte.ts:82 -->

### [src/lib/preferences/preferences.svelte.ts:82](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/preferences.svelte.ts#L82)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** そのセクションについてサーバーが持っている位置。未同期なら undefined。 */
```

<!-- source: src/lib/preferences/preferences.svelte.ts:87 -->

### [src/lib/preferences/preferences.svelte.ts:87](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/preferences.svelte.ts#L87)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** サインイン時に1回。失敗しても投げない（同期は付加機能で、無くても全機能が動く）。 */
```

<!-- source: src/lib/preferences/preferences.svelte.ts:202 -->

### [src/lib/preferences/preferences.svelte.ts:202](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/preferences.svelte.ts#L202)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** デバウンスを待たずに送り切りたいとき用。 */
```

<!-- source: src/lib/preferences/preferences.svelte.ts:209 -->

### [src/lib/preferences/preferences.svelte.ts:209](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/preferences.svelte.ts#L209)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
	 * この端末のタイムゾーンを AppView に教える（日記の1日をその人のタイムゾーンで区切るため）。
	 * 変わったときだけ送る。送れなくても次に開いたときにまた試すので、失敗は黙って捨てる。
	 */
```

<!-- source: src/lib/preferences/preferences.svelte.ts:237 -->

### [src/lib/preferences/preferences.svelte.ts:237](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/preferences.svelte.ts#L237)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** 送信は直列化する。並行に投げると後勝ち判定がリクエスト順に依存してしまう。 */
```

<!-- source: src/lib/preferences/preferences.svelte.ts:318 -->

### [src/lib/preferences/preferences.svelte.ts:318](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/preferences.svelte.ts#L318)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 認可が切れた/足りない。以後の push を止めて localStorage 単独へ落とす。
```

<!-- source: src/lib/preferences/preferences.svelte.ts:323 -->

### [src/lib/preferences/preferences.svelte.ts:323](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/preferences.svelte.ts#L323)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 通信断などは次の変更で送り直す。取りこぼさないよう保留へ戻す
			// （そのあいだに入った新しい値は上書きしない）。
```

## src/lib/preferences/sync.svelte.ts

<!-- source: src/lib/preferences/sync.svelte.ts:56 -->

### [src/lib/preferences/sync.svelte.ts:56](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L56)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * サーバーの設定をこの端末へ、この端末の設定をサーバーへ流し込む層。
 * トランスポート（`./preferences.svelte`）とストレージ（favorites / watermark）の
 * あいだに置くことで、どちらからも逆向きの import を作らずに済む。
 */
```

<!-- source: src/lib/preferences/sync.svelte.ts:69 -->

### [src/lib/preferences/sync.svelte.ts:69](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L69)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// ストレージが使えない端末では毎回「初回」＝和集合になる。
		// 黙って失うより、1回多く足す方を選ぶ。
```

<!-- source: src/lib/preferences/sync.svelte.ts:79 -->

### [src/lib/preferences/sync.svelte.ts:79](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L79)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 記録できなくても同期自体は成立する。
```

<!-- source: src/lib/preferences/sync.svelte.ts:83 -->

### [src/lib/preferences/sync.svelte.ts:83](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L83)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * お気に入りの突き合わせ。
 * - 初回（この端末×このアカウントで初めて）は和集合。単純な後勝ちにすると、サーバーが
 *   空の状態で端末Aと端末Bが別々の一覧を持っていたとき、後から同期した側が消える。
 * - 2回目以降は updatedAt による後勝ち。
 */
```

<!-- source: src/lib/preferences/sync.svelte.ts:98 -->

### [src/lib/preferences/sync.svelte.ts:98](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L98)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 和集合が増えていない＝サーバーと同じ。updatedAt を無駄に進めない。
```

<!-- source: src/lib/preferences/sync.svelte.ts:106 -->

### [src/lib/preferences/sync.svelte.ts:106](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L106)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// ISO 8601(UTC) 同士なので文字列比較がそのまま時刻順になる。
```

<!-- source: src/lib/preferences/sync.svelte.ts:112 -->

### [src/lib/preferences/sync.svelte.ts:112](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L112)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// ローカルの方が本当に新しいときだけ押し上げる。同着で saveFavorites を呼ぶと
	// サインインのたびに updatedAt だけが進み、この端末が常に後勝ちしてしまう。
```

<!-- source: src/lib/preferences/sync.svelte.ts:118 -->

### [src/lib/preferences/sync.svelte.ts:118](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L118)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * フィードのタブ構成の突き合わせ。お気に入りと違い**和集合はしない** — 順序のある
 * 1本の設定で、和集合すると同じタブが2枚並ぶ。純粋に updatedAt の後勝ち。
 * どちらにも記録が無ければ何もしない（既定タブのまま。勝手に保存すると、将来
 * 既定を変えてもこの人には反映されなくなる）。
 */
```

<!-- source: src/lib/preferences/sync.svelte.ts:128 -->

### [src/lib/preferences/sync.svelte.ts:128](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L128)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// ISO 8601(UTC) 同士なので文字列比較がそのまま時刻順になる。
```

<!-- source: src/lib/preferences/sync.svelte.ts:138 -->

### [src/lib/preferences/sync.svelte.ts:138](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L138)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * お気に入りタグの突き合わせ。updatedAt の後勝ち。
 * サーバーが持っていない（旧 AppView、または未同期）なら、この端末の値を押し上げる。
 * 新設の項目で、同期前から端末に溜まった一覧は無いので、絵文字のような初回の和集合は要らない。
 */
```

<!-- source: src/lib/preferences/sync.svelte.ts:147 -->

### [src/lib/preferences/sync.svelte.ts:147](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L147)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// ISO 8601(UTC) 同士なので文字列比較がそのまま時刻順になる。
```

<!-- source: src/lib/preferences/sync.svelte.ts:176 -->

### [src/lib/preferences/sync.svelte.ts:176](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L176)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// AppView未設定の最初の1回だけ、従来の4キーを一組にして移行する。
```

<!-- source: src/lib/preferences/sync.svelte.ts:184 -->

### [src/lib/preferences/sync.svelte.ts:184](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L184)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** 3ラベルの表示方法は一組の設定として、updatedAt が新しい側を採用する。 */
```

<!-- source: src/lib/preferences/sync.svelte.ts:209 -->

### [src/lib/preferences/sync.svelte.ts:209](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L209)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** 自動再試行待ちでも、その場で取り直せる。 */
```

<!-- source: src/lib/preferences/sync.svelte.ts:218 -->

### [src/lib/preferences/sync.svelte.ts:218](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L218)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** 同期の完了を待ちたい処理（お気に入りパレットの事前解決など）から使う。 */
```

<!-- source: src/lib/preferences/sync.svelte.ts:221 -->

### [src/lib/preferences/sync.svelte.ts:221](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L221)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * サインイン状態が変わるたびに呼ぶ。同じDIDの重複起動を抑え、一時失敗は再試行する。
 * 失敗しても投げない（同期はあくまで付加機能で、無くても全機能が動く）。
 */
```

<!-- source: src/lib/preferences/sync.svelte.ts:248 -->

### [src/lib/preferences/sync.svelte.ts:248](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L248)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// タブ構成はサーバー同期の成否に関わらずアカウント単位。load を待たずに切り替える
	// （待つと、同期できない端末で guest のタブを見せたまま guest のキーへ書いてしまう）。
```

<!-- source: src/lib/preferences/sync.svelte.ts:259 -->

### [src/lib/preferences/sync.svelte.ts:259](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L259)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 継続障害時は最大60秒間隔。429を即時に叩き直さない。
```

<!-- source: src/lib/preferences/sync.svelte.ts:272 -->

### [src/lib/preferences/sync.svelte.ts:272](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L272)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// ニュースだけはサインイン前（guest スコープ）に作られていることがある。
		// アカウント側のキーへ差し替えてから突き合わせる。
```

<!-- source: src/lib/preferences/sync.svelte.ts:287 -->

### [src/lib/preferences/sync.svelte.ts:287](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L287)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * 廃止した my Nagi の既読位置キー。もう読み書きしないが、使っていた端末には残っているので
 * 全データ削除ではこれも消す。
 */
```

<!-- source: src/lib/preferences/sync.svelte.ts:294 -->

### [src/lib/preferences/sync.svelte.ts:294](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L294)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * DID スコープへ移行する前に使っていたキー。移行前から使っている端末には
 * まだ残っているので、全データ削除ではこれらも消す。
 */
```

<!-- source: src/lib/preferences/sync.svelte.ts:301 -->

### [src/lib/preferences/sync.svelte.ts:301](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L301)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 廃止したチャンネルタブの表示名キャッシュ。
```

<!-- source: src/lib/preferences/sync.svelte.ts:305 -->

### [src/lib/preferences/sync.svelte.ts:305](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L305)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * 同期していた設定の端末側キャッシュを消す。全データ削除で AppView の行を消しても、
 * ここを消さないと既読位置とお気に入りがこの端末に残り続ける。
 * サインアウト前のスコープ（DID）と、旧キー・guest スコープの両方を対象にする。
 */
```

<!-- source: src/lib/preferences/sync.svelte.ts:341 -->

### [src/lib/preferences/sync.svelte.ts:341](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L341)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 消せない端末でもアカウント削除自体は完了している。
```

<!-- source: src/lib/preferences/sync.svelte.ts:353 -->

### [src/lib/preferences/sync.svelte.ts:353](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L353)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 送信結果（マージ後の確定値）でローカルを整える。押し返さないと、端末ごとに違う値を
// 持ったまま「同期したつもり」になる。
```

<!-- source: src/lib/preferences/sync.svelte.ts:360 -->

### [src/lib/preferences/sync.svelte.ts:360](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/preferences/sync.svelte.ts#L360)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 送っていない項目を応答で上書きすると、デバウンス待ちの編集を巻き戻して
	// しまう。自分が送った回の結果だけ取り込む。
```

## src/lib/private-list/private-list.svelte.ts

<!-- source: src/lib/private-list/private-list.svelte.ts:6 -->

### [src/lib/private-list/private-list.svelte.ts:6](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/private-list/private-list.svelte.ts#L6)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * 本人のホームリスト。非公開情報なので、プロフィールなどの公開レスポンスには混ぜず、
 * 認証必須の専用 API からだけ読み込む。
 */
```

<!-- source: src/lib/private-list/private-list.svelte.ts:32 -->

### [src/lib/private-list/private-list.svelte.ts:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/private-list/private-list.svelte.ts#L32)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// アカウント切替直後に前の利用者の一覧を一瞬でも描画しない。
```

<!-- source: src/lib/private-list/private-list.svelte.ts:39 -->

### [src/lib/private-list/private-list.svelte.ts:39](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/private-list/private-list.svelte.ts#L39)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 吹き出しごとに has() で引くので、想定外の応答でも配列以外を入れない（描画ごと止まる）。
```

## src/lib/profile/me.svelte.ts

<!-- source: src/lib/profile/me.svelte.ts:7 -->

### [src/lib/profile/me.svelte.ts:7](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/profile/me.svelte.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * ログイン中ユーザーのプロフィールを 1 回だけ取って共有する。
 * サイドバー・モバイルヘッダ・Composer が同じものを見るほか、optimisticPosts に
 * 覚えさせることで「初投稿の楽観カードだけアバターが出ない」ズレを防ぐ。
 */
```

<!-- source: src/lib/profile/me.svelte.ts:33 -->

### [src/lib/profile/me.svelte.ts:33](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/profile/me.svelte.ts#L33)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 取れなくてもアバターがイニシャル表示になるだけなので黙って諦める
```

<!-- source: src/lib/profile/me.svelte.ts:37 -->

### [src/lib/profile/me.svelte.ts:37](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/profile/me.svelte.ts#L37)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** プロフィール編集後など、明示的に取り直したいとき */
```

## src/lib/profile/reaction-feed.svelte.ts

<!-- source: src/lib/profile/reaction-feed.svelte.ts:17 -->

### [src/lib/profile/reaction-feed.svelte.ts:17](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/profile/reaction-feed.svelte.ts#L17)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** こっそり投稿へのリアクション。元投稿は辿れないのでプレースホルダとして描く。 */
```

<!-- source: src/lib/profile/reaction-feed.svelte.ts:32 -->

### [src/lib/profile/reaction-feed.svelte.ts:32](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/profile/reaction-feed.svelte.ts#L32)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** 投稿専用の楽観Feedへニュースを混ぜずに扱う、プロフィール用の軽量ページング状態。 */
```

## src/lib/profile/tags.ts

<!-- source: src/lib/profile/tags.ts:25 -->

### [src/lib/profile/tags.ts:25](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/lib/profile/tags.ts#L25)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * プロフィール表示用の6タグを作る。
 * 前半は分析タグを元の順序のまま最大3件、後半は興味テーマから最大3件を毎回選び直す。
 */
```

## src/routes/dev/e2e/welcome-tutorial/+page.svelte

<!-- source: src/routes/dev/e2e/welcome-tutorial/+page.svelte:12 -->

### [src/routes/dev/e2e/welcome-tutorial/+page.svelte:12](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/e2e/welcome-tutorial/+page.svelte#L12)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
	 * 「Nagiのはじめかた」の確認用。?done=post,reaction で済んだ項目を、?closed でモーダルを閉じた状態を作る。
	 * ボタンで残りの項目を済ませて、全部済んだときの演出も確かめられる。
	 */
```

<!-- source: src/routes/dev/e2e/welcome-tutorial/+page.svelte:21 -->

### [src/routes/dev/e2e/welcome-tutorial/+page.svelte:21](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/e2e/welcome-tutorial/+page.svelte#L21)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/*
		 * OAuth の復元が終わってから始める。先に仮のセッションを入れると、あとから本物のセッションに
		 * 置き換わった時点で「別ユーザーに切り替わった」扱いになり、モーダルが閉じてしまう。
		 * サインイン済みならその DID で（このページを開くとその DID の進捗はやり直しになる）、
		 * 未サインインなら仮のセッションで始める。
		 */
```

<!-- source: src/routes/dev/e2e/welcome-tutorial/+page.svelte:48 -->

### [src/routes/dev/e2e/welcome-tutorial/+page.svelte:48](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/e2e/welcome-tutorial/+page.svelte#L48)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 確認用ページなので、消せなくても続ける。
```

## src/routes/dev/name-card/+page.svelte

<!-- source: src/routes/dev/name-card/+page.svelte:14 -->

### [src/routes/dev/name-card/+page.svelte:14](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/name-card/+page.svelte#L14)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
	 * 名刺デザインの確認台（開発限定 / /dev/name-card）。
	 * 本番では +page.ts が 404 を投げる（/dev/cards と同じ流儀）。
	 *
	 * 分析は「初回登録」か「100投稿ごと」でしか発火しないので、実データを待っていては
	 * デザインを詰められない。ここでダミーだけで見た目を確定させてから、実データに移る。
	 */
```

<!-- source: src/routes/dev/name-card/+page.svelte:28 -->

### [src/routes/dev/name-card/+page.svelte:28](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/name-card/+page.svelte#L28)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** botたんの長文分析。モーダル下部の表示を確かめるために実データから拾う。 */
```

<!-- source: src/routes/dev/name-card/+page.svelte:252 -->

### [src/routes/dev/name-card/+page.svelte:252](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/name-card/+page.svelte#L252)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/* grid/flex の子は既定で内容幅まで広がる。長いハンドルのケースで
		   トラックごと伸びてしまうので明示的に縮められるようにする。 */
```

## src/routes/dev/name-card/+page.ts

<!-- source: src/routes/dev/name-card/+page.ts:4 -->

### [src/routes/dev/name-card/+page.ts:4](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/dev/name-card/+page.ts#L4)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/**
 * 名刺カードの見た目を、Gemini も DB もワーカーも無しで詰めるための開発用ページ。
 * 分析は「初回登録」か「100投稿ごと」でしか発火しないので、実データを待っていては
 * デザインを確定できない。dev はビルド時に false へ畳まれるので本番では必ず 404。
 */
```

## src/routes/onboarding/+page.ts

<!-- source: src/routes/onboarding/+page.ts:3 -->

### [src/routes/onboarding/+page.ts:3](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/onboarding/+page.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 初回のプロフィール登録画面は廃止した（Bluesky のプロフィールを写して、すぐフィードから始める）。
// 古いリンク用にフィードへ送る。
```

## src/routes/profile/[did]/+page.svelte

<!-- source: src/routes/profile/[did]/+page.svelte:44 -->

### [src/routes/profile/[did]/+page.svelte:44](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/profile/[did]/+page.svelte#L44)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// カードはポストではないので Feed には載らない。タブだけ同じ並びに足す。
```

<!-- source: src/routes/profile/[did]/+page.svelte:98 -->

### [src/routes/profile/[did]/+page.svelte:98](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/profile/[did]/+page.svelte#L98)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 閲覧者ごとにキャッシュする。匿名取得後のログイン復元では本人向けの情報を再取得する。
```

<!-- source: src/routes/profile/[did]/+page.svelte:125 -->

### [src/routes/profile/[did]/+page.svelte:125](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/profile/[did]/+page.svelte#L125)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// カードタブでもプロフィール欄は要るので、投稿フィードは読んでおく。
```

<!-- source: src/routes/profile/[did]/+page.svelte:156 -->

### [src/routes/profile/[did]/+page.svelte:156](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/profile/[did]/+page.svelte#L156)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// メディアはグリッド（1画像1タイル）なので、会話グループ化せず投稿単位で受け取る。
					// 畳むと同じスレッドの2枚目以降の画像がグリッドから落ちてしまう。
```

<!-- source: src/routes/profile/[did]/+page.svelte:188 -->

### [src/routes/profile/[did]/+page.svelte:188](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/profile/[did]/+page.svelte#L188)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 名刺はヘッダーに並べず、アバターを押して開くモーダルに入れる。
	// アバター・表示名・ハンドルはプロフィール上部と丸ごと重複するので、
	// 常時出すとヘッダーが同じ情報で縦に伸びるだけになる。
```

<!-- source: src/routes/profile/[did]/+page.svelte:202 -->

### [src/routes/profile/[did]/+page.svelte:202](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/profile/[did]/+page.svelte#L202)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// ポストモーダルからの投稿を拾う。自分のプロフィールを見ながら投稿したときに、
	// 確定データ（botたんの返信予定など）まで反映されるようにする。
```

<!-- source: src/routes/profile/[did]/+page.svelte:210 -->

### [src/routes/profile/[did]/+page.svelte:210](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/profile/[did]/+page.svelte#L210)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 投稿直後の画面追従。楽観カード → 確定カードで DOM が入れ替わる。
```

<!-- source: src/routes/profile/[did]/+page.svelte:234 -->

### [src/routes/profile/[did]/+page.svelte:234](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/profile/[did]/+page.svelte#L234)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
<!-- 名刺があることは、アバターの周りを回る光で示す。押すと名刺が開く。 -->
```

<!-- source: src/routes/profile/[did]/+page.svelte:271 -->

### [src/routes/profile/[did]/+page.svelte:271](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/profile/[did]/+page.svelte#L271)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
<!-- ミュートしても、このプロフィールの投稿は今までどおり見える（自分で開いたので）。
							     効くのはTL・検索・通知のほう。 -->
```

## src/routes/settings/bot-name/+page.svelte

<!-- source: src/routes/settings/bot-name/+page.svelte:13 -->

### [src/routes/settings/bot-name/+page.svelte:13](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/bot-name/+page.svelte#L13)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** lexicon の maxGraphemes と揃えること（サーバ側も同じ値で弾く）。 */
```

<!-- source: src/routes/settings/bot-name/+page.svelte:20 -->

### [src/routes/settings/bot-name/+page.svelte:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/bot-name/+page.svelte#L20)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** サーバに保存されている呼び名。空文字＝未設定（表示名で呼ばれる）。 */
```

<!-- source: src/routes/settings/bot-name/+page.svelte:50 -->

### [src/routes/settings/bot-name/+page.svelte:50](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/bot-name/+page.svelte#L50)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 空文字を送ると登録を解除して表示名に戻る（サーバ側で行を消す）。
```

<!-- source: src/routes/settings/bot-name/+page.svelte:97 -->

### [src/routes/settings/bot-name/+page.svelte:97](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/bot-name/+page.svelte#L97)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
<!-- 解除は取り返しがつく（表示名に戻るだけ）ので、danger ではなく控えめに。 -->
```

## src/routes/settings/bot-reply-freq/+page.svelte

<!-- source: src/routes/settings/bot-reply-freq/+page.svelte:18 -->

### [src/routes/settings/bot-reply-freq/+page.svelte:18](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/bot-reply-freq/+page.svelte#L18)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/** サーバに保存されている返信確率（0〜100、デフォルト100）。 */
```

## src/routes/settings/delete-data/+page.svelte

<!-- source: src/routes/settings/delete-data/+page.svelte:35 -->

### [src/routes/settings/delete-data/+page.svelte:35](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/delete-data/+page.svelte#L35)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// AppViewの下書きはサーバ削除済み。移行未完了の画像付き旧下書きも端末から消す。
```

<!-- source: src/routes/settings/delete-data/+page.svelte:41 -->

### [src/routes/settings/delete-data/+page.svelte:41](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/delete-data/+page.svelte#L41)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 既読位置とお気に入りは AppView と端末の両方にある。サーバー側は
			// deleteAccountData が消すので、端末のキャッシュもここで揃えて消す。
```

<!-- source: src/routes/settings/delete-data/+page.svelte:45 -->

### [src/routes/settings/delete-data/+page.svelte:45](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/delete-data/+page.svelte#L45)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 廃止した「みんなで全肯定」で反応済みの URI（こっそり投稿を含みうる）。
```

<!-- source: src/routes/settings/delete-data/+page.svelte:49 -->

### [src/routes/settings/delete-data/+page.svelte:49](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/delete-data/+page.svelte#L49)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/* 端末側の掃除なので失敗しても続ける。 */
```

<!-- source: src/routes/settings/delete-data/+page.svelte:64 -->

### [src/routes/settings/delete-data/+page.svelte:64](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/delete-data/+page.svelte#L64)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
<!-- 「残るもの」の注記。警告と役割が逆（消えない範囲の説明）なので、赤ではなく同じ面の行にする。 -->
```

## src/routes/settings/mute/+page.svelte

<!-- source: src/routes/settings/mute/+page.svelte:20 -->

### [src/routes/settings/mute/+page.svelte:20](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/mute/+page.svelte#L20)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// レイアウト側でサインイン時に読んでいるが、直リンクで来た場合に備えて自分でも確かめる。
```

## src/routes/settings/profile/+page.svelte

<!-- source: src/routes/settings/profile/+page.svelte:59 -->

### [src/routes/settings/profile/+page.svelte:59](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/src/routes/settings/profile/+page.svelte#L59)

分類: 仕様・設計の根拠。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/* The PDS remains the source of truth until AppView catches up. */
```

## tests/e2e/profile-reaction-owner.spec.ts

<!-- source: tests/e2e/profile-reaction-owner.spec.ts:76 -->

### [tests/e2e/profile-reaction-owner.spec.ts:76](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/profile-reaction-owner.spec.ts#L76)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// Vite の同じモジュールを使って、非同期の OAuth 復元を再現する。
```

<!-- source: tests/e2e/profile-reaction-owner.spec.ts:79 -->

### [tests/e2e/profile-reaction-owner.spec.ts:79](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/profile-reaction-owner.spec.ts#L79)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
/* @vite-ignore */
```

## tests/e2e/reaction-privacy.spec.ts

<!-- source: tests/e2e/reaction-privacy.spec.ts:8 -->

### [tests/e2e/reaction-privacy.spec.ts:8](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/reaction-privacy.spec.ts#L8)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// レイアウトがログイン直後に読む周辺データは、この表示検証では空レスポンスで固定する。
```

## tests/e2e/welcome-tutorial.spec.ts

<!-- source: tests/e2e/welcome-tutorial.spec.ts:29 -->

### [tests/e2e/welcome-tutorial.spec.ts:29](https://github.com/suibari/nagi_client/blob/24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf/tests/e2e/welcome-tutorial.spec.ts#L29)

分類: 検証・再現条件。対応仕様: [preferences-profile](../../specs/preferences-profile/spec.md#requirements)。

```text
// 3つ目で、閉じていても開き直して完了を見せる。入口は役目を終えて消える。
```
