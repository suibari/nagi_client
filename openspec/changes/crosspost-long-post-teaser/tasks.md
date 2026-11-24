# Tasks

フェーズごとにコミットを分ける。フェーズ1はクライアント1コミット、フェーズ2はlexicon（別リポジトリ）とクライアントで1コミットずつ。

## 1. フェーズ1：冒頭＋「…もっと見る」の1件（クライアント1コミット）

- [x] 1.1 `crosspost/bluesky.ts`に冒頭の組み立てを追加する。上限に収まれば全文、超えれば先頭チャンク＋`…もっと見る`とし、「もっと見る」にスレッドページへのlink facetを張る。文言のぶんは上限から取り置く。画像付き引用で本文の末尾へ足すURLは、`…もっと見る`の後ろに残す
- [x] 1.2 `crosspostToBluesky`がNagi投稿のURIを受け取った場合（クロスポスト）だけ1件で出し、受け取らない場合（`bsky/compose.ts`のBluesky専用投稿）は従来どおり分割する
- [x] 1.3 `crosspost/after-post.ts`からNagi投稿のURIを渡す。クロスポストでは`CrosspostPartialError`が起きないことを確かめ、Composerの途中失敗の分岐が不要なら整理する
- [x] 1.4 i18n（ja・en）に`…もっと見る`／`…See more`を追加する
- [x] 1.5 単体テスト（`bluesky.test.ts`、`crosspost-chain.test.ts`）：上限内は全文1件で続きが付かない、上限超えは1件で末尾の文言とfacetのbyte位置が正しい、画像付き引用でURLが残る、Bluesky専用投稿は分割のまま。e2e（`crosspost-thread.spec.ts`）の分割前提の期待を1件版へ改める
- [x] 1.6 `pnpm test`・`pnpm check`・e2eを通す

実施メモ（フェーズ1）：1.3でクロスポストの`CrosspostPartialError`の分岐と、使われなくなった警告文`crosspostPartial`を削除した。e2eの「分割の途中失敗」は1件版のテストに置き換え、空いた失敗注入でBSKY-06の「Bluesky側の作成失敗」のテストを足した。1.6は、`pnpm test`が全件成功、`pnpm check`は変更前からある`node:fs`などの型定義の23件だけ、e2eの`crosspost-thread.spec.ts`は16件成功（初回だけ開発サーバの起動直後に1件が間に合わず、単独と再実行では成功）。

## 2. フェーズ2-a：lexicon（bsky-affirmative-bot 1コミット）

- [ ] 2.1 `packages/nagi-lexicon/lexicons/com/suibari/nagi/longPost.json`を追加する（`uri`・`cid`必須の`object`。同じリポジトリに限ること、`cid`はクロスポストした時点の版であることを説明に書く）。型とスキーマのテストを追加する
- [ ] 2.2 `com.atproto.lexicon.schema/com.suibari.nagi.longPost`を公開する。bsky-affirmative-botの`scripts/deploy.sh`が、`packages/nagi-lexicon/lexicons/`に差分があるデプロイで`lex:publish`を実行するので、2.1のデプロイで公開される。公開後に`com.atproto.repo.getRecord`で取得できることを確かめる

## 3. フェーズ2-b：目印の書き込みと読み取り（クライアント1コミット）

- [ ] 3.1 1.1で省略したときだけ、コピーのレコードに`com.suibari.nagi.longPost`（Nagi投稿のURIと、保存直後のCID）を入れる。ComposerからCIDを渡す
- [ ] 3.2 `bsky/mapView.ts`で目印を表示型へ取り込む。同じDIDの`com.suibari.nagi.post`以外は捨てる
- [ ] 3.3 `BskyPostCard.svelte`に「全文を表示」を追加する。`getThread`で取得して本文とfacetを差し替え、取得中はスピナーを出す。取得できない・隠れた状態なら冒頭のまま伝える。アカウント切替で取得結果を捨てる
- [ ] 3.4 単体テスト：省略したときだけ目印が入る、DID違い・コレクション違い・壊れた形は無視、取得失敗で冒頭に戻る、CIDの違いで編集済みにしない
- [ ] 3.5 `pnpm test`・`pnpm check`・e2eを通す

## 4. 仕様書の同期

フェーズ1で変わったBSKY-05・BSKY-06、機能一覧、利用の流れ、design.mdのD10と実装の入口は、フェーズ1のコミットで同期済み。BSKY-16はフェーズ2-bで同期する。

- [ ] 4.1 主仕様（BSKY-05・BSKY-06・BSKY-16）、機能一覧と利用の流れ、`bluesky-integration/design.md`（冒頭＋続きの判断と目印の判断、実装の入口）を実装と一致させる
- [ ] 4.2 `known-gaps.md`に関係する記述があれば更新する
- [ ] 4.3 `npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive`と`node openspec/tools/comment-catalog.mjs --check`を通す
