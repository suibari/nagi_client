# Spec Delta

## MODIFIED Requirements

### Requirement: NEWS-03 コメント・共有・投稿受付

ニュースコメントはニュース本体への引用投稿としなければならない（MUST）。Blueskyへも出せ、Bluesky側ではNagiのニュースページをリンクとして出す（BSKY-04・05）。元記事のURLにはしない。合成botコメントURIは表示専用で、リアクションはニュース本体をsubjectにする。共有キャンセルは成功コピーと区別する。URL投稿はpreview後のURL編集で旧previewを無効にし、受付成功後に一覧を更新する。

#### Scenario: URLの書き換え

- **WHEN** preview取得後に別URLへ変える
- **THEN** 古い内容のまま追加させない

#### Scenario: 履歴取得失敗

- **WHEN** 投稿フォームの履歴APIが落ちる
- **THEN** 新規URLの追加自体は可能にする

#### Scenario: ニュースのコメントをBlueskyにも出す

- **WHEN** ニュースへのコメントをBlueskyにも出す
- **THEN** Bluesky側ではNagiのニュースページをリンクカードにし、元記事のURLにしない
