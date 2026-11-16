# Tasks

## 1. 執筆ページ

- [x] 1.1 `src/routes/write/+page.svelte` と `src/routes/write/[rkey]/+page.svelte`（`ssr=false`、`prerender=false`）を追加し、未サインインは `/login` へ移す。`vercel.json` のrewriteとnoindexヘッダーに `/write` 系を足し、`vercel-rewrites.test.ts` を通す
- [x] 1.2 本文欄を画面の高さいっぱいに取り、PC幅では右カラムに記事メタ欄とおたすけを並べるレイアウトを作る
- [x] 1.3 `/blog` の「ブログを書く」を `/write` へのリンクにする。`BlogModal.svelte` と `composerHost` の `blogOpen`/`blogMounted`/`showBlog`/`hideBlog` を削除し、`dev/e2e/post-assist` を直す

## 2. 作成・編集の共通化

- [x] 2.1 `/write/<rkey>` で本人の `site.standard.document` を読み込む。無ければ「見つからない」を表示する
- [x] 2.2 `Composer` に `editTarget` を追加し、既存画像を含む添付・タイトル・タグ・本文の初期化を実装する。初期化と保存は別モジュールに切り出し、ユニットテストを書く
- [x] 2.3 編集の保存（`updatePost` と、タグを明示した `updateStandardSiteDocument`）を実装する。編集時は公開範囲・クロスポスト・下書きを出さない
- [x] 2.4 `ChatBubble` の記事のその場編集を削除し、記事の「編集」を `/write/<rkey>` への遷移にする。記事ページの `ArticleTitleInput` と `editing` まわりを整理する
- [x] 2.5 保存後に楽観データを登録して記事ページへ移動し、記事ページはAppViewが追いつくまで楽観データを表示する（新規の場合も404にしない）
- [x] 2.6 `beforeNavigate`・`beforeunload` で未保存の変更を確認する

## 3. おたすけ

- [x] 3.1 `ComposerAssistant` に `placement` を追加し、PC幅は右カラム内、スマホ幅は下部表示と余白の確保にする。ポストのモーダルの見た目が変わらないことを確認する

## 4. 検証

- [x] 4.1 `pnpm test`・`pnpm check`・E2E（post-assistを含む）を通す。新規作成・編集（タグ追加・削除、ヘッダー画像変更）・離脱確認・おたすけの配置をPC幅とスマホ幅で画面確認する

## 5. 仕様書の同期

- [x] 5.1 `blog-publication` と `post-composer` のspec.md・design.md（実装の入口を含む）を実装に合わせる
- [x] 5.2 `npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive` と `node openspec/tools/comment-catalog.mjs --check` を通す

## Workflow follow-up

- 主仕様（BLOG-03・BLOG-07・POST-03・POST-08）とdesign.mdは実装と同時に手で同期した。利用者の指示により、2026-11-16に `archive --skip-specs` でarchiveした。
- 旧形式の記事は、本番の索引対象（`listIndexableBlogs`）で確認した。1件あったテスト記事は利用者が削除し、`com.suibari.nagi.post`・`site.standard.document` とも `RecordNotFound` になったことを確かめた。
- 記事ページの読み取り側の旧形式互換（`legacyUri` での取得など）は、このchangeの範囲外として残した。
