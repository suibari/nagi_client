# 検証結果

2026-11-16。クライアントは本changeの作業フォルダ、APIはOrcaの `blog-draft-metadata` ワークツリー（`suibari/blog-draft-metadata`）で変更した。APIの元リポジトリに作った一時的な作業差分は移動済みで、元リポジトリの追跡ファイルには差分を残していない。

## 動作テスト

- `npx playwright test tests/e2e/blog-drafts.spec.ts tests/e2e/blog-write.spec.ts --workers=2`: 13件成功。タイトル・タグだけの自動保存、本文の手動保存、旧下書き復元、旧API応答の欠落、保存失敗、保存中の追加入力、アカウント切替、画像付き離脱と再読み込み、ブラウザの戻る、公開成功時の移動、既存記事の編集を含む。API応答はモック。
- `npm test -- src/lib/drafts/content.test.ts`: 4件成功。旧応答の空メタデータ、タイトル・タグ・本文差分、参照のキー順、カード文字情報を比較した。
- APIワークツリーの `pnpm exec tsx --test apps/nagi_appview/test/drafts.test.ts`: 4件成功。旧形式、追加メタデータ、長文、型不正・バイナリ拒否を確認。
- APIワークツリーの `pnpm --filter @bsky-affirmative-bot/nagi-lexicon test`: 18件成功。
- `NAGI_DRAFT_TEST_DATABASE_URL` を使い捨ての `nagi_draft_test` DBに設定してAPIの `drafts.postgres.test.ts` を実行し、HTTPとPostgresを通る1件が成功。保存・取得・一覧のメタデータ保持、旧下書き、別所有者の読取・上書き・削除の防止を確認した。HTTPのテスト用入口は実際の下書きクエリを呼ぶ。認証ミドルウェア自体は変更しておらず、このテストでは検証していない。
- 追加のChromium検証では、使い捨てDBを使うローカルAPIへ下書き通信を転送し、本文・タイトル・タグを画面から保存、警告なく離脱、ページを閉じて別ページを開き、下書き一覧から3項目を復元・再保存できた。下書き以外の通信はモックとし、本番認証は使用していない。
- 追加のChromium検証で画像付きのタブを `runBeforeUnload` 付きで閉じ、ブラウザ標準確認を取り消すとタブが残ることを確認した。

## 型とビルド

APIワークツリーで `pnpm --filter nagi-appview... build` が成功した。

クライアントの `npm run check` はAPI型検査を通過したが、既存のNode型定義不足により未変更のテスト等で23件のエラーが残る。通常設定は `types: ["vite/client"]` で、クライアントの `node_modules/@types` にNode型定義がない。依存・lockfileへ本件外の変更は加えていない。

一時的な検証用tsconfigで既存のAPIリポジトリのNode型定義を参照し、クライアント全体の `svelte-check` が0エラー・0警告で通ることも確認した。この設定は生成物ディレクトリ内の検証専用ファイルで、製品設定には加えていない。

## 仕様形式と出典

主仕様は132要件・299シナリオ。固定履歴・原文スナップショットは変更していない。OpenSpecの全件strict検証と `node openspec/tools/comment-catalog.mjs --check` で、仕様形式と固定出典・ローカルリンクを確認した（22項目成功、固定コメント3227件・リンク5669件を検証）。

## 本番との境界

本番へデプロイしていない。実セッションでの認証付き往復、本番のDB・保存内容は未確認。AppViewのAPI／lexiconを先に反映し、その後クライアントを反映する。画像は引き続き下書きへ保存しない。
