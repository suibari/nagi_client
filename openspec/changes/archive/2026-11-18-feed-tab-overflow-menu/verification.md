# 検証結果

2026-11-18。クライアントだけの変更で、API通信はすべてモックした。

## 動作テスト

- `npx playwright test tests/e2e/feed-tab-overflow.spec.ts`: 7件成功。FEED-09の各シナリオを確認した。収まる4本での ＋ と伸張、はみ出したときの ▾ と端のフェード、一覧からの選択・移動・選んだタブのスクロール、一覧からカスタマイズへの移動、Escで閉じてフォーカスが戻ること、ホイールでの横送り（ページは縦に動かない）、設定プレビューが左寄せにならないこと、スマホ幅（390px）で一覧が画面内に収まること。デスクトップ幅とスマホ幅のスクリーンショットを目視で確認した。
- `npx playwright test tests/e2e/feed-interactions.spec.ts tests/e2e/bsky-feed-tab-dialog.spec.ts tests/e2e/tag-palette.spec.ts`: 成功。
- `tests/e2e/guest-hero.spec.ts` は4件失敗する。変更を退避した状態でも同じ4件が失敗するため、本changeとは無関係（ローカルにAppViewが無い）。
- `npm test`: 805件成功（9件スキップ）。`mobile-overflow.test.ts` はスクロール要素の変更に合わせて更新した。

## 型と仕様

- `npm run check`: 23件のエラーが残る。いずれも本changeで変更していないファイルで、Node型定義が無いことによる既存のエラー。
- `npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive`: 22件すべて成功。
- `node openspec/tools/comment-catalog.mjs --check`: PASS。固定履歴は変更していない。
