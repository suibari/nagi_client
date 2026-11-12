# 検証結果

2026-11-12、変更の実装後に確認。

## 動作テスト

- `npx vitest run src/lib/notifications src/lib/api src/lib/oauth`：10ファイル、45テスト成功。
- `npm test`：122ファイル・779テスト成功、1ファイル・9テストは既存のskip。
- 追加した`src/lib/notifications/unread.test.ts`の12ケースは、OAuthクライアントと通信応答を差し替え、実際の`initOAuth` → 公開前フック → `getUnreadCount` → PDS proxy向けfetchHandler → 未読storeの経路を検証した。プロフィールは先に通常購読を登録した実モジュールを使い、初回通知取得がプロフィールとホーム取得より先に呼ばれ、応答待ちが他の取得を止めないことを確認した。
- 他のAPI応答を保留して通知応答だけを返した状態で、PC・モバイル共通のナビ定義のstoreと実際のNavBadgeのサーバーレンダリングに7件が反映され、PWAバッジAPIにも7件を渡すことを確認した。ブラウザ上の描画時間の測定ではない。
- 未認証時の取得抑止、401/403/500時の継続・再試行、DID markerからの復元、既存セッションでの起動、二重起動、切替・ログアウト・同DID再ログイン、既読化前の応答、以前の既読更新の遅延、60秒・focus・visibility・Push、停止時の後始末を検証した。
- レイアウトのonMountで通知起動を最初に呼び、他のnoticeとinitOAuthより前に置いていることはコード差分でも確認した。

## 型検査

- `npm run check`を実行。API側の`tsc -p api/tsconfig.json`は成功。
- Svelte側は20エラー、0警告。すべて今回変更していない18ファイル内で、既存テストの`node:fs`の型が見つからないエラー18件と、それに伴う`routing/vercel-rewrites.test.ts`の暗黙any 2件。今回の変更ファイルと追加テストには診断なし。型検査全体の成功とは扱わない。
- package.json、依存関係、tsconfigは変更していない。

## 仕様形式と出典

- `npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive`：22項目成功。
- 主仕様にはNOTIFY-06を同期済み。changeのADDEDを主仕様へ再適用すると重複する旨のINFOが出る。archive時はこの同期済み状態を考慮する。
- `node openspec/tools/comment-catalog.mjs --check`：19分野、670基準ファイル、3227固定コメント、5644ローカルリンクの検証に成功。固定履歴は未変更。
- `git diff --check`：成功。

## 実環境での確認境界

本番の認証済みセッションを使った確認環境は本作業では用意していない。実回線・PDS/AppViewの待ち時間、ブラウザが実際に送信する順番、リロード後のバッジ表示までの時間は未実測。今回保証するのは認証復元後の呼び出し開始順と、応答待ちで他の読み込みを止めないこと。
