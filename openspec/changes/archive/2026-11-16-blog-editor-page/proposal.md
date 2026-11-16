# Proposal

## Why

ブログはモーダル（`BlogModal`）で書いている。ポストとは違い、ブログを書いている途中で別の操作に移ることはほとんどない。モーダルにしても利点は小さく、画面の一部しか入力に使えないので長文を書きにくい。

編集は記事ページやフィード上の吹き出し（`ChatBubble`）で、その場で行っている。この編集画面は新規作成の`Composer`とは別の実装で、記事メタ欄（`ComposerArticleMeta`）を持たない。そのため、**編集ではタグを付けたり変えたりできない**。ヘッダー画像の指定も新規作成と挙動が違う。作成と編集で同じ機能を二重に保守している。

おたすけbotたん（`ComposerAssistant`）は画面右下に固定表示される。幅の広いブログ画面では本文やメタ欄に重なり、入力の邪魔になる。

## What Changes

- ブログ用のモーダルを廃止し、ページで書くようにする。新規は `/write`、自分の記事の編集は `/write/<rkey>` とする。本文欄は画面の高さを使って大きく取る。
- 新規作成と編集で同じページ・同じ`Composer`を使う。編集でもタイトル・ヘッダー画像・タグ・本文・画像を新規作成と同じUIで変更できる。タグの変更はstandard.siteのdocumentへ保存する。
- 記事ページとフィード上の記事にある「編集」は、その場で編集する代わりに `/write/<rkey>` へ移動する。記事でない通常投稿のその場編集は変えない。
- 編集の対象は `site.standard.document` の記事だけとする（旧形式 `com.suibari.nagi.post` の記事は現存しない）。
- 保存（新規・編集とも）が済んだら、その記事のページへ移動する。AppViewが取り込むまでの間は、保存した内容を楽観的に表示する。
- 未保存の変更がある状態でページを離れようとしたら確認する。新規作成の本文は、従来どおり下書きにも自動保存する。
- おたすけbotたんは、PC幅では右カラム（記事メタ欄の下）に置き、本文と重ねない。スマホ幅では従来どおり下部に出すが、その高さの分だけページ下の余白を確保し、入力欄を覆わない。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `blog-publication`: 記事の執筆・編集ページの要件（BLOG-07）を追加する。BLOG-03に、編集でタグを明示的に変えられることを追記する。
- `post-composer`: POST-03からブログモーダルの記述を外し、執筆ページで書きかけを扱う規則に改める。POST-08の「モーダルを閉じるまで」を、ブログでは「ページを離れるまで」とし、配置の要件を加える。

## Impact

- クライアント：`BlogModal.svelte`を削除する。`composer-host.svelte.ts`からブログの開閉状態を削除する。`+layout.svelte`からモーダルを外す。新規ルート `src/routes/write/` を追加する。`Composer.svelte`に既存記事の読み込みと更新（既存画像の保持・タグ）を追加する。`ChatBubble.svelte`から記事のその場編集を削除する。`ComposerAssistant.svelte`に配置の指定を追加する。`/blog`一覧のボタンをページへのリンクにする。記事ページは楽観表示に対応する。`dev/e2e/post-assist`を直す。
- 配信：`/write`系はアプリ専用ルートとして`200.html`へ流す（SEO-05）。`vercel.json`のheaders（noindex）とrewritesに `/write` と `/write/:rkey` を足す。`/blog/:did`のrewriteとは衝突しない。
- AppView・lexicon：変更なし。
- 仕様書：`blog-publication`と`post-composer`のspec/design。
- 非対象：通常投稿（あっさり・しっかり）のモーダル、3行日記、記事の削除の場所（記事ページのまま）、公開範囲・Blueskyティーザーを編集で変えること。
