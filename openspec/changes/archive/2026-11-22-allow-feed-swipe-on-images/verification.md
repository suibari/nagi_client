# 検証記録

2026-11-22、提案への「ok」を受けて実装した。

## 動作テスト

- `npx playwright test tests/e2e/feed-interactions.spec.ts --workers=2`：23件成功。既存12件と追加11件。
- Nagi・Blueskyの実コンポーネントに画像を表示し、Chromiumのタッチ入力で左右のプレビューとタブ移動、タップとキーボードでの拡大、画像上の縦スクロールを確認した。
- 短いドラッグ、終端、touchcancel、複数指による中断後に拡大しないことと、次のタップが使えることを確認した。中断シナリオは実タッチでドラッグを開始し、DOMのTouchEventで中断条件を与え、CDPのtouchCancelで入力を終了している。
- Chromiumがドラッグ後のクリック自体を生成しない場合も抑止を検証できるよう、後続MouseEventを明示的に送り、defaultPreventedと拡大ビュー非表示を確認した。
- 警告解除・再非表示、通常のbuttonとリンク、video・audio、内部の横・縦スクロール、portalの拡大ビューがタブスワイプされないことを確認した。
- `npm test -- src/lib/feed/gestures.test.ts`：5件成功（距離・速度の既存判定）。

## 型・文書

- `npm run check`：APIの型チェックは成功、svelte-checkは23エラー・0警告。すべて変更対象外の既存テストにあるnode:fsの型不足と、それに伴う暗黙anyである。
- HEADのソースを一時ディレクトリへ展開して同じnode_modulesでcheckを実行し、今回の23診断すべてが変更前にも再現することを照合した。一時ディレクトリにはローカルenvをコピーしていないため、変更前側ではこれに加えて公開env未定義が2件出る。
- OpenSpec strict検証はchange・feed-thread主仕様ともに成功。`node openspec/tools/comment-catalog.mjs --check` は19分野・670基準ファイル・3227コメント原文・5725ローカルリンクの検証に成功した。`git diff --check` も成功。固定原文・台帳は変更していない。

## 確認境界

認証・API応答は開発用画面とモックを使った。iOS Safari・Android実機のタッチ／互換クリック、実アカウントでのフィード閲覧、本番デプロイは未実施。メディアグリッドの投稿リンクは通常リンクとして引き続き除外し、今回の対象はImageGalleryの拡大用タイルである。
