# Tasks

## 1. 月の移動先と位置計算

- [x] 1.1 `ChronicleTimeline.svelte`で補足ニュースを除く各月の最初の節目を識別し、1年でも表示する条件へ変更する。`chronicle-motion.test.ts`の表示条件を更新し、空・1年・サンプルの条件を確認する。
- [x] 1.2 `chronicle/scrub.ts`を年月の位置・現在値・月順移動・年優先のラベル選択へ拡張する。`scrub.test.ts`で年またぎ、空月、同位置に収まる月、1か月、末尾の丸め、密集ラベルを検証する。
- [x] 1.3 主仕様の機能概要・一覧・利用の流れとCHRON-04を合意済みの差分に同期し、設計D6へ月アンカーの根拠を追記する。既存の出典・CHRON-01〜03・05が保持されていることを差分で確認する。

## 2. スクラバーの表示と操作

- [x] 2.1 `ChronicleScrubber.svelte`で年・月の実測、大小の目盛り、ラベル間引き、ドラッグ中の年月表示を実装する。同じ年数でデータが変わった場合と再試行後も再計測されることを確認する。
- [x] 2.2 月単位の上下・PageUp/PageDown、先頭・末尾のHome/End、年月のスライダー値を実装し、ja/enの文言を更新する。キー移動と読み上げ値が一致し、1か月でも有限の値になることをテストと開発ページで確認する。
- [x] 2.3 開発用年表ページの説明・確認データを年月操作に合わせ、1年・空月・年またぎの操作を確認できる状態にする。設計の実装入口も更新し、開発ページの挙動と説明を照合する。

## 3. 統合検証と仕様の整合

- [x] 3.1 関連するVitestと`npm run check`を実行し、動作ロジックの検証・型検査の結果を記録する。
- [x] 3.2 開発ページをPC・モバイル幅で操作し、ドラッグ・タップ・全キー操作・通常スクロール追従・密集ラベル・最新の月・1件のみ・reduced-motion・紹介サンプルを確認する。ブラウザでの動作確認として結果を記録する。
- [x] 3.3 `known-gaps.md`を照合し、実装と合意仕様の不一致があれば記録する。`npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive`と`node openspec/tools/comment-catalog.mjs --check`で仕様形式・固定出典の整合を検証し、動作テストとは区別して結果を記録する。

## 検証結果（2026-11-12）

- 動作ロジック：`npx vitest run src/lib/chronicle src/lib/components/chronicle-motion.test.ts`、5ファイル・47テスト合格。
- 型検査：`npm run check`のAPI検査は合格。Svelte検査は既存の`node:fs`型解決とそれに伴う暗黙anyに関する19エラー（17ファイル）で失敗。`@types/node`がなく、tsconfigのtypesはvite/clientのみ。今回追加したコードの型エラー・警告は出ていない。型設定の変更は本changeには含めていない。
- ブラウザ：Orcaの開発ページでPCと390×844のモバイル幅を確認。14か月の目盛りと補足ニュースの除外、ドラッグ中の年月、レールのポインター操作、上下・PageUp/PageDown・Home/End、通常スクロール追従、密集ラベルの間引き、末尾の年月を確認。1年・1件・空・紹介サンプルも確認し、reduced-motion時に節目が読めること、モバイルで横にはみ出さないことを確認した。
- 仕様形式：`openspec validate --all --strict --no-interactive`、21項目合格。
- 固定出典・ローカルリンク：`node openspec/tools/comment-catalog.mjs --check`合格。既知の仕様不一致の追加なし。固定履歴は変更していない。
