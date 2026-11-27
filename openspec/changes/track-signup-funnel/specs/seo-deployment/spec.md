## MODIFIED Requirements

### Requirement: SEO-08 アクセス解析の送信範囲

本番環境では、Cookieを使わないアクセス解析としてVercel Web AnalyticsとUmami Cloudへページの閲覧を送らなければならない（MUST）。Umamiのトラッカーは、本番のビルドでサイトIDが設定され、本番のホスト名で開いたときだけ読み込む。Umamiへは、URLのクエリ文字列とハッシュを送ってはならない。参照元は送る。解析の訪問者を利用者のDIDやアカウントと結び付けてはならない。ブラウザがDo Not Trackを送っている場合はUmamiへ送らない。CSPは、Umamiのトラッカーの配信元だけを外部のscriptとして許可する。送信先と送信内容を変えるときは、プライバシーポリシーの記述を同時に改める。

Umamiで登録CTAのクリック、登録OAuth開始と登録完了を計測しなければならない（MUST）。登録完了には、登録経路のOAuthの成功とPDS上のNagiプロフィールの初回保存が必要である。

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

#### Scenario: ゲスト向け参加CTA

- **WHEN** 未ログインの閲覧者が参加CTAを押す
- **THEN** Umamiに `signup_cta_click` を送る

#### Scenario: 登録OAuth開始

- **WHEN** 未ログインの利用者がログイン画面でアカウント作成を選び、Entrywayの認可URL取得に成功する
- **THEN** OAuthへ移動する直前に `signup_oauth_start` を送る

#### Scenario: 登録完了

- **WHEN** 登録OAuthが成功し、そのセッションでNagiプロフィールの初回保存に成功する
- **THEN** `signup_complete` を1回送る

#### Scenario: 対象外の認証と失敗

- **WHEN** 通常ログイン、再認可、セッション復元、コールバックの再訪、認可失敗、既存プロフィールの確認、または初回保存の失敗が起こる
- **THEN** `signup_complete` を送らない

#### Scenario: 登録イベントの送信項目

- **WHEN** Umamiに登録イベントを送る
- **THEN** イベント名、固定ページ種別、外部参照元のHTTP(S)オリジン、既存の端末等の統計項目を送る。DID、ハンドル、トークン、ページタイトル、URLのクエリとハッシュ、動的パスの値は送らない
