# Proposal

## Why

外部アプリの共有メニューからNagiへテキストや画像を渡す入口がない。対応環境でインストールしたNagiをWeb Share Targetとして登録し、コピーやファイルの選び直しをせず通常投稿へ進めるようにする。

## What Changes

- テキスト・URL・画像を受け取る共有先としてNagiをmanifestへ登録する。
- 通常の投稿画面へ本文と画像を取り込み、利用者が確認・編集して投稿する。自動投稿は行わない。
- 画像は既存の形式検証・圧縮と4枚上限を使う。テキストのみ、画像のみ、両方の共有に対応する。
- 書きかけがある場合は取り込み前に確認し、上書きしない。未ログイン時は端末内で一時保持してログイン後に取り込む。これは2026-11-20に利用者が合意した方針である。
- 公開範囲はPOST-01/04を維持する。こっそりが選択されている場合は画像を取り込む前に範囲変更を利用者に求め、黙って公開範囲を広げたり画像を消したりしない。
- 動画・音声・一般ファイルの受信、ブログ・3行日記・ゲスト投稿への取り込み、未対応OS向けのネイティブ実装は対象外。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `post-composer`: Web Share Target受信と通常投稿への取り込み、認証待ち・競合・失敗時の保護をPOST-11として追加する。

## Impact

- `static/manifest.webmanifest`、`src/service-worker.ts`、新しい受信ページ `/share-target` と端末内一時保存モジュール。
- `composer-host.svelte.ts`、`PostModal.svelte`、`Composer.svelte`、`ImageAttachmentPicker.svelte`の取り込み経路。既存の`showWithText`の利用者は変更しない。
- 既存のOAuth復帰先処理、共有受信ページのnoindexとVercel SPA rewrite、日英メッセージ、Vitest/Playwright検証。
- 関連仕様はPOST-01/03/04/06/09、MEDIA-01/02、SEO-01/05、認証セッション。既存の下書きAPIに画像を保存する変更は含めない。
- AppView・bot・lexiconの契約変更や追加scopeは不要な設計とする。PWA更新・インストールとOS/ブラウザの対応状況によって共有先への表示は異なる。
- 現在のmanifestにshare_targetはなく、Service WorkerはPush処理を担当する。以下の成果物は将来の変更提案であり、実装済みの主仕様とは区別する。
