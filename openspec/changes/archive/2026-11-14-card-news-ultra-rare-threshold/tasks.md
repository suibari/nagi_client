# Tasks

## 1. ニュースの表示条件

- [x] 1.1 `CardNewsList.svelte` にCARD-10の表示条件を適用し、日付見出しも表示対象から組み立てる。`tests/e2e/zenkatsu.spec.ts` に全5レア度の混在と低レア度の札を含むハイライト・コンボ発見のテストを追加し、UR・AARと既存ハイライトだけが順序どおり表示されることを確認する。
- [x] 1.2 除外後が空でもcursorがあれば追加読み込み操作を出す。空ページから次ページへ進むケース、追加ページにSR以下が混在するケースを同じE2Eに追加し、既存項目の保持・対象だけの追加・不要な日付見出しの除外を確認する。
- [x] 1.3 `CardNewsList.svelte`・`src/lib/api/appview.ts` の周辺コメントを整理し、仕様の重複説明を残さず、必要な理由・公開フォールバックの説明を保っていることを差分レビューで確認する。

## 2. 仕様整備と統合確認

- [x] 2.1 主仕様 `cards-zenkatsu/spec.md` の概要・機能一覧・利用の流れにカードニュースを加え、CARD-10を反映する。`design.md` と `known-gaps.md` にクライアントの絞り込みとAppView未確認の境界を記録し、固定履歴を変更していないことを差分で確認する。
- [x] 2.2 仕様形式はOpenSpecのstrict検証、出典網羅性は `node openspec/tools/comment-catalog.mjs --check`、型整合は `npm run check`、動作は対象E2Eで確認し、各結果を区別して報告する。

## 検証結果

- 動作テスト：`npx playwright test tests/e2e/zenkatsu.spec.ts --grep 'card news'` は5件通過。初回・追加ページの対象制限、空ページからの継続、低レア度を含むハイライト、既存の反応・詳細表示・日付区切りをモック応答で確認した。
- 仕様形式：changeと主仕様 `cards-zenkatsu` のstrict検証は通過。
- 出典網羅性：`node openspec/tools/comment-catalog.mjs --check` は通過（19分野、3227コメント、5656ローカルリンク）。固定履歴は変更していない。
- 型整合：`npm run check` のAPI型検証は通過。svelte-checkは変更対象外の21ファイルで23件のエラー（`node:fs`の型解決とそれに伴う暗黙any）により失敗。今回変更したファイルの診断は0件。既存テストの型設定の修正は今回の範囲に含めていない。
- 差分形式：`git diff --check` は通過。
