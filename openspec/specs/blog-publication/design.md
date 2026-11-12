# standard.site記事公開・ブログ表示：設計判断

## この文書の役割

[spec.md](spec.md) が定める振る舞いについて、課題・採用判断・理由と制約を説明する。実装の行番号に依存せず、判断が変わるときに更新する。原文にない過去の議論や、採用されなかった案を推測で補わない。

## 設計判断

### D1: 外部リーダー用とNagi編集用の表現を共存させる

**課題**：Nagiの原文facetを捨てると再編集しにくく、独自表現だけでは他リーダーが読めない。

**採用判断**：documentのnagiに原文・facet・添付を残し、contentへGFMを書き出す。

**理由と制約**：公開の正本をstandard.siteへ置きながら入力に必要な情報を失わない。タイトル・タグ・未知フィールドの更新規則を分け、本文編集でメタ情報を消さない。

### D2: publicationの所有範囲をURLで識別する

**課題**：同じcollectionには他アプリのpublicationもあり、先頭1件を使う初期方式では別ブログへ記事を紐付ける恐れがあった。

**採用判断**：Nagiの公開originと著者別URLで探索し、作成・編集・削除の対象を絞る。

**理由と制約**：プロフィール編集だけでpublicationを作らず、公開の意思を初回記事作成と分離しない。旧共通URLは互換読み取りだけ残す。

### D3: URL移行は参照先を先に直す

**課題**：publication.urlを先に変えると、旧document.pathとの組合せで記事URLが変わってしまう。

**採用判断**：documentを先に修正し、完了後に著者別publication URLへ移す。

**理由と制約**：途中失敗ではURLを旧値に保ち、次回残りを再開する。静的記事・well-known・HTML検証リンクも同じ対応関係を保つ。

### D4: 原文公開を補助サービスの不調から切り離す

**課題**：AppViewの補助情報や翻訳が取れないだけで、本人PDSにある記事本文まで消すべきではない。

**採用判断**：原文は静的HTMLに残し、タグ・viewer情報・翻訳は取得できた分だけ補う。

**理由と制約**：訳文には原文facetを流用しない。一覧の翻訳は既存キャッシュだけを使い、一覧閲覧で大量の新規生成を始めない。

## 実装の入口

現在のコードを調べるための入口。行番号は管理せず、ファイル内の処理名・責務で探す。ファイル移動時はこの一覧を更新する。

| ファイル                                                                                | 探す処理・責務                  |
| --------------------------------------------------------------------------------------- | ------------------------------- |
| [src/lib/standardsite/document.ts](../../../src/lib/standardsite/document.ts)           | 記事の公開と更新                |
| [src/lib/standardsite/repo.ts](../../../src/lib/standardsite/repo.ts)                   | findNagiPublicationと移行・削除 |
| [src/lib/standardsite/publication.ts](../../../src/lib/standardsite/publication.ts)     | publication管理                 |
| [src/lib/blog/inlineImages.ts](../../../src/lib/blog/inlineImages.ts)                   | 本文配置と添付照合              |
| [src/routes/blog/[did]/[rkey]/+page.ts](../../../src/routes/blog/[did]/[rkey]/+page.ts) | 記事の公開データ取得            |

## 出典と変更時の扱い

- [導入時コメント原文](../../reference/comment-snapshot/blog-publication.md)は、基準コミット `24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf` の固定資料である。原文内の行番号はそのコミットだけを指す。
- [機械可読台帳](../../comment-catalog.json)に元ファイル・行範囲・原文・SHA-256を保持する。コメント削減後も履歴として残し、現在のコードに合わせて書き換えない。
- [既知の不整合](../../known-gaps.md)に現在の要件と旧説明の違いを記録する。改善が実装済みとは扱わない。
- 振る舞いの変更はspec.md、判断の変更はこの文書へ反映する。原文資料は増補・修正する現行設計書として使わない。
