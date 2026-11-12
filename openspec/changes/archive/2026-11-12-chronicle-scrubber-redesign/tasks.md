# Tasks

## 1. 読み込みと初期位置

- [x] 1.1 `ChronicleTimeline.svelte` の読み込みを、cursorの繰り返しを防ぎつつ全年を順に読む処理へ変える。途中失敗時は読み込めた年を残し、再試行で続きから読む
- [x] 1.2 全年を読み終えたら末尾の節目へスクロールする。previewのときは行わない
- [x] 1.3 InfiniteScrollを外し、読み込み中・失敗・再試行の表示を年表の末尾に出す

## 2. スクラバー

- [x] 2.1 スクラバーのコンポーネントを追加する（目盛りの測定、つまみの追従、ドラッグ・クリック、キーボード、スライダーとしてのARIA）
- [x] 2.2 年が2つ以上で、previewでないときだけ表示する
- [x] 2.3 スクラバーのラベル文言をjaとenに追加する

## 3. 見た目と演出（unslop）

- [x] 3.1 方向（design.md D4）に沿ってレール・年見出し・節目・余白・太さを整える
- [x] 3.2 年の数字と節目のタイトルにscroll-driven animationの強調を加え、基底状態が最大の大きさになることを確かめる
- [x] 3.3 /dev/chronicle と /about で、スマホ幅・PC幅・reduced-motionのスクリーンショットを確認する

## 4. テストと仕様の同期

- [x] 4.1 `chronicle-motion.test.ts` をInfiniteScroll前提から新しい契約（全年読み込み、基底状態、@supports）へ更新し、全年読み込みと失敗時の続きのユニットテストを追加する
- [x] 4.2 `pnpm test`・`pnpm check` を確認する
- [x] 4.3 主仕様（news-chronicle の spec.md・design.md）を同期し、`openspec validate --all --strict` と `comment-catalog.mjs --check` を通す

## Workflow follow-up

- 主仕様（CHRON-02〜05）とdesign.md（D4追記、D5〜D7）は実装と同時に手で同期済み。archiveは `archive --skip-specs` で行う。
- AppViewのlexicon（getChronicle）の並び順とcursorの説明が実装と逆だったため、AppView側で修正しデプロイ済み（PR #179）。
- 紹介ページでスクラバーと末尾への移動を外す指定は、`preview` と分けて `showcase` で行う。開発用の /dev/chronicle は `preview` だけを渡し、スクラバーと初期位置を確認できる。
- 4.1の全年読み込みと失敗時の続きはユニットテストに加え、E2E（`tests/e2e/chronicle.spec.ts`）で末尾からの表示、キーボード操作、失敗後の再試行を確認した。
