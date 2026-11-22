# Tasks

## 1. 仕様の合意

- [x] 1.1 提案・差分仕様・設計・作業項目について利用者の合意を確認し、このchangeに合意内容を記録する。

## 2. 画像タイルと共通ジェスチャ

- [x] 2.1 ImageGalleryの拡大buttonに明示属性を付け、feedGesturesの除外判定をそのbuttonだけに緩和する。開発用フィード画面へNagi・Blueskyの画像を用意し、実タッチ入力のE2Eで左右のプレビューと移動、通常タップの拡大、縦スクロールを確認する。
- [x] 2.2 画像起点の横ドラッグ後のクリックを抑止し、移動成功・短いドラッグ・終端・複数指・touchcancelで誤起動しないことと、次のタップおよびキーボードの拡大が可能なことをE2Eで確認する。
- [x] 2.3 警告解除・再非表示、通常リンクやbutton、動画・音声、内部スクロール、拡大ビューが除外を維持することを操作検証する。既存feed-interactionsの回帰テストも通す。
- [x] 2.4 主仕様FEED-08とfeed-thread/design.mdへ合意済みの動作と採用理由を同期し、known-gaps.mdへ変更の経緯と確認境界を記録する。固定原文は保持し、OpenSpecのstrict検証と文書リンク検証で整合性を確認する。

## 3. 統合確認

- [x] 3.1 関連Vitest、feed-interactionsのPlaywright、npm run checkを実行し、仕様形式・動作テストの結果と実機未確認範囲をverification.mdへ記録する。出典資料を変更していないことをgit diffで確認する。
