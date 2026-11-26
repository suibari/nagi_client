# Spec Delta

## ADDED Requirements

### Requirement: SEO-08 アクセス解析の送信範囲

本番環境では、Cookieを使わないアクセス解析としてVercel Web AnalyticsとUmami Cloudへページの閲覧を送らなければならない（MUST）。Umamiのトラッカーは、本番のビルドでサイトIDが設定され、本番のホスト名で開いたときだけ読み込む。Umamiへは、URLのクエリ文字列とハッシュを送ってはならない。参照元は送る。解析の訪問者を利用者のDIDやアカウントと結び付けてはならない。ブラウザがDo Not Trackを送っている場合はUmamiへ送らない。CSPは、Umamiのトラッカーの配信元だけを外部のscriptとして許可する。送信先と送信内容を変えるときは、プライバシーポリシーの記述を同時に改める。

#### Scenario: 検索結果ページの閲覧

- **WHEN** 本番で `/search?q=...` を開く
- **THEN** Umamiへは `/search` のパスと参照元だけを送り、検索語は送らない

#### Scenario: Googleからニュースへ来て別のページへ移る

- **WHEN** Google検索の結果からニュース記事を開き、続けて別のページへ移動する
- **THEN** Umamiで、同じ訪問の中の入口ページ・移動先・滞在時間を確認できる

#### Scenario: サイトIDが無い・開発環境・プレビュー

- **WHEN** サイトIDが未設定、開発サーバ、または本番以外のホスト名で開く
- **THEN** Umamiへは何も送らない

#### Scenario: Do Not Trackが有効なブラウザ

- **WHEN** Do Not Trackを送るブラウザで本番を開く
- **THEN** Umamiへは何も送らない

#### Scenario: ログイン中の閲覧

- **WHEN** ログインした利用者がページを移動する
- **THEN** UmamiへDIDやハンドルを訪問者の識別子として送らない

#### Scenario: OAuth診断

- **WHEN** OAuthの復旧結果を診断イベントとして記録する
- **THEN** 同じ項目をVercelとUmamiの両方へ送り、Umamiが読み込まれていなければ失敗せずに省く
