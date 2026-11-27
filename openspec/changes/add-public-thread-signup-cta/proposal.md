# Proposal

## Why

公開投稿のリンクからNagiを訪れた人に、投稿を読んだ後でアカウントを作る方法を伝える。上流 main (`81b40cd`) ではニュース・ブログの個別ページに共通のNagi紹介があり、投稿詳細では共通シェルのログイン導線だけが表示される。

## What Changes

- 公開投稿詳細で、未ログインの閲覧者にNagi紹介を会話の後ろに1つ表示する。
- ニュース・ブログと同じ紹介から、既存のログイン・アカウント作成画面に進めるようにする。

## Capabilities

### New Capabilities

### Modified Capabilities

- `feed-thread`：公開投稿詳細に未ログイン向けの参加導線を追加する。

## Impact

変更の対象は投稿詳細の表示と検証。投稿の閲覧条件は既存のAppView判定に従う。共通CTAとOAuthのUmami計測は別の変更で扱う。
