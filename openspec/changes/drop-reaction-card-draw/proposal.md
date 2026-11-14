# Proposal

## Why

全肯定カードは、通常枠（1日1枚）に加えて、他人の投稿・ニュース等へリアクションするとその日もう1枚引ける「リアクション枠」を持っている。運営者はリアクション枠を廃止し、カードを引けるのを1日1枚に限ると判断した（2026-11-14）。

リアクション枠を前提に決めた数字がある。おすそわけボードでbotたんから受け取るAAR（ボードに無いときのAAR）の価格600Ƶは、カードの供給を1.5枚/日（通常枠1枚＋リアクション枠の利用0.5枚）として決めた（AppView `docs/zenkatsu.md` 13.3・13.8、2026-10-27）。供給が1枚/日になると、新しい人が600Ƶを貯めるまでの日数は中央値で約252日から約378日へ延び、当初の狙い（半年〜8か月で届く）から外れる。

## What Changes

- **リアクション枠の廃止**：リアクションしてもカードを引けなくする。取得の入口・案内・「Next: リアクションでもう一枚！」・リアクション後のカード表示と再試行の表示を削除する。カードを引けるのは通常枠の1日1枚になる。
- **記念日カードは変えない**：抽選枠を消費しない特別枠として残す。
- **botたんのAARの価格を600Ƶから300Ƶへ下げる**：根拠は design.md の D2。置いたときにもらうƵ、ボードの他のカードの価格、はじめてのƵ（30Ƶ）は変えない。
- **AppView（別リポジトリ）**：`source: "reaction"` のドローを受け付けない。drawStatusからリアクション枠を外す（または常に引けない状態で返す。D3）。`CARD_SHELF_AAR_PRICE` を300にする。`docs/zenkatsu.md` の供給前提（1.5枚/日）と価格の根拠を更新する。
- 過去にリアクション枠で引いたカードは、所持・図鑑・ニュース・リアクション対象としてそのまま残す。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `cards-zenkatsu`：CARD-02からリアクション枠を除き、通常枠1日1枚と記念日の区別にする。CARD-07にbotたんのAARの扱いと価格を加える。

## Impact

- クライアント：`src/lib/cards/reaction-reward.svelte.ts`（削除）、`src/lib/components/ReactionCardRewardHost.svelte`（削除）、`src/lib/components/CardReactionGuideDialog.svelte`（削除）、`src/lib/components/ReactionBar.svelte`、`CardDrawEntry.svelte`・`CardDrawBanner.svelte`・`CardDrawFab.svelte`、`CardDetailDialog.svelte`、`src/routes/+layout.svelte`、`src/lib/cards/share-board.ts`（`BOT_AAR_PRICE`）、`src/lib/api/types.ts`・`appview.ts`、`src/lib/i18n/ja.ts`・`en.ts`、`src/routes/dev/cards`、関連テスト。
- AppView：`apps/nagi_appview/src/queries/cards.ts`、`services/reactionCardEligibility.ts`、`packages/shared-configs/src/cardBoard.ts`、lexiconの `source` の説明、`docs/zenkatsu.md`。
- 公開順序：クライアントを先に公開してよい（リアクション後にドローを呼ばなくなるだけ）。AppViewを先に公開すると、旧クライアントのリアクション後のドローが拒否され、再試行の表示が出る。価格はAppViewの公開時点で切り替わる。
- 非対象：ゼンカツのお休み日数・提出枚数、排出率、置いたときのƵ、ボードの他のカードの価格。
