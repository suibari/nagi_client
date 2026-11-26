# Tasks

## 1. 解析スクリプト

- [x] 1.1 本番かつ `PUBLIC_UMAMI_WEBSITE_ID` があるときだけ、Umamiのトラッカーを属性付き（website-id・domains・exclude-search・exclude-hash・do-not-track）で読み込む。読み込み条件を判定する関数にテストを付ける。
- [x] 1.2 CSPの `script-src` に `https://cloud.umami.is` を加え、ビルドしたHTMLのCSPを確認する。
- [x] 1.3 OAuth診断をUmamiへも送る。トラッカーが無いときに例外を出さないことをテストする。
- [x] 1.4 `.env.example` に `PUBLIC_UMAMI_WEBSITE_ID` を加える。

## 2. プライバシーポリシー

- [x] 2.1 日英の外部送信先・アクセス解析・保持データの記述にUmamiを加え、`LEGAL_LAST_UPDATED` を改める。

## 3. 公開と仕様反映

- [ ] 3.1 運営者がUmami Cloudでサイトを登録し、Production環境変数を設定して再デプロイする。本番でイベントが届くこと、クエリが記録されないことを確かめる。
- [x] 3.2 主仕様・設計・既知の不整合を実装と照合し、OpenSpecの厳格検証・型検査・テストの結果を確認する。
