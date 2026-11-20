# 検証記録

2026-11-20。ローカルのモック認証・Chromiumとビルド済みService Workerで検証した。デプロイは行っていない。

## 動作検証

- `npm test`：130ファイル・824テスト合格。共有FormData正規化と受信失敗、既存の投稿ホスト・メディア選択・Push保存/状態・配信rewriteを含む。
- `npx playwright test tests/e2e/share-target.spec.ts tests/e2e/composer-moderation.spec.ts tests/e2e/post-edit.spec.ts --workers=2`：18件合格（共有8件、既存10件）。
- `npx playwright test tests/e2e/share-target.spec.ts --workers=1`：共有12件合格。375px幅での横はみ出しがないことと、添付プレビューを画面画像で確認した。追加の4件では日記の書きかけ/既存seedの維持、受信再読込と読み取り失敗、取り込み完了保存の失敗からの再試行、画像選択とペーストの回帰を検証した。
- 共有では本文と複数画像、画像のみ、未ログインから復帰先を記録した再試行、書きかけへの追記、破損画像と部分再試行、こっそりからの明示的な範囲変更、4枚上限と超過分破棄、独立した複数受信、別タブでの排他とタブ終了後の復帰、処理中のDID変更、返信文脈の保留を確認した。外部への投稿操作は行わず、送信待ちのモーダルに留まることを確認した。
- `npm run build`：adapter-staticのビルド成功。新しい受信ページとService Workerを生成した。
- `npx playwright test --config playwright.share-preview.config.ts`：ビルド済みのService Workerでmultipart POST（本文と画像）を受け、303でID付きGETへ移り、IndexedDBに元のFile名とバイトが保持されることを確認した。manifestのaction・method・files名、未知URLの404、SWを通さないPOSTが失敗することも確認した。

## 型検査

`npm run check`のAPI型検査は成功した。Svelte/TypeScript検査は、既存テストの`node:fs`参照を解決する`@types/node`がこのcheckoutにないため、23エラー（21ファイル）で失敗する。共有の追加ファイルに残存する診断はない。

切り分けのため`/tmp/nagi-share-check-types`に`@types/node@22`を一時インストールし、リポジトリのtsconfigを継承してNode型だけを補う`.svelte-kit/tsconfig.share-check.json`で同じソース全体を検査した。`npx svelte-check --tsconfig .svelte-kit/tsconfig.share-check.json --config vite.config.ts`は0エラー・0警告。package.json・lockfile・主tsconfigは変更していない。この一時設定は成果物に含めない。

## 仕様形式・出典

- `npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive`：22項目合格。
- `node openspec/tools/comment-catalog.mjs --check`で固定台帳・出典・ローカルリンクが合格した。原文・台帳・採録コミットの固定リンクは変更しない。
- POST-11と概要・一覧・利用の流れ、投稿/配信の主設計、known-gapsを更新した。初回scopeの前回値復元の不一致を明記して修正した。

## 未検証の境界

- 実機の外部アプリのOS共有一覧からNagiを選択する確認は未実施。インストール済みPWA、新manifest/SWの反映、対象OS/ブラウザの対応が必要。PlaywrightのPOST送信とOS共有一覧への表示確認は区別する。
- 本番のOAuthサーバーとの往復、Vercel上での配信、デプロイ、AppView・bot・lexiconの外部実装は未検証。認証はモックで確認し、追加scope・サーバー契約変更は行っていない。
- Orcaのデスクトップブラウザからこの実行環境の127.0.0.1へは接続できず、LANのHTTP URLではOAuthライブラリが要求するsecure contextを満たさなかった。画面操作はプロジェクト既存のPlaywright/Chromiumのループバック環境で検証した。
