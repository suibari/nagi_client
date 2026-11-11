# 導入時コメント原文

このディレクトリは、既存コードのコメントに書かれていた情報を失わないための固定履歴である。日常的に読む仕様は [仕様書の入口](../../README.md) から、判断理由は各分野の `design.md` から参照する。

採録コミット: `24aad5eebea23501b9f7f0b9dfcbde2aa6f6bfdf`。採録日は2026-11-11。670ソース・設定ファイルのうち462ファイルにある3,227コメントを保存している。

## 行番号の意味

各出典リンクはGitHubの `blob/<採録コミット>/<パス>#L<行>` に固定している。現行ブランチのコード位置を示すリンクではないため、その後にコードが増減しても出典の指す内容は変わらない。元の場所は [機械可読台帳](../../comment-catalog.json) にも記録する。

## 更新方針

- 現行の要件と設計判断は `specs/` で更新する。過去の原文を現在の振る舞いに合わせて書き直さない。
- ここに残る古い説明や矛盾は、現在の要件として一律に採用しない。[既知の不整合](../../known-gaps.md) を合わせて参照する。
- コメント削減後も原文を保持する。ツール指示やテンプレート、区切りを利用者向け動作要件にはしない。
- 原文の転載と、仕様・判断の説明は分ける。コードとの意味の対応は各分野の仕様・設計書とカバレッジ一覧で追う。

## 分野別の原文

| 分野                                     | 原文                             | 現在の仕様                                        | 現在の設計                                          |
| ---------------------------------------- | -------------------------------- | ------------------------------------------------- | --------------------------------------------------- |
| AppView通信・AT Protocolレコード         | [原文](appview-protocol.md)      | [仕様](../../specs/appview-protocol/spec.md)      | [設計](../../specs/appview-protocol/design.md)      |
| 認証・セッション・姉妹アプリ連携         | [原文](auth-session.md)          | [仕様](../../specs/auth-session/spec.md)          | [設計](../../specs/auth-session/design.md)          |
| standard.site記事公開・ブログ表示        | [原文](blog-publication.md)      | [仕様](../../specs/blog-publication/spec.md)      | [設計](../../specs/blog-publication/design.md)      |
| Bluesky閲覧・クロスポスト                | [原文](bluesky-integration.md)   | [仕様](../../specs/bluesky-integration/spec.md)   | [設計](../../specs/bluesky-integration/design.md)   |
| 全肯定カード・ゼンカツ・アドベント・名刺 | [原文](cards-zenkatsu-advent.md) | [仕様](../../specs/cards-zenkatsu-advent/spec.md) | [設計](../../specs/cards-zenkatsu-advent/design.md) |
| 日記・気分・3行日記                      | [原文](diary-trilines.md)        | [仕様](../../specs/diary-trilines/spec.md)        | [設計](../../specs/diary-trilines/design.md)        |
| 絵文字・タグ・生成UI                     | [原文](emoji-tags.md)            | [仕様](../../specs/emoji-tags/spec.md)            | [設計](../../specs/emoji-tags/design.md)            |
| フィード・タブ・スレッド・リアクション   | [原文](feed-thread.md)           | [仕様](../../specs/feed-thread/spec.md)           | [設計](../../specs/feed-thread/design.md)           |
| 表示言語・翻訳・テーマ                   | [原文](i18n-theme.md)            | [仕様](../../specs/i18n-theme/spec.md)            | [設計](../../specs/i18n-theme/design.md)            |
| 画像・GIF・動画・リンクカード            | [原文](media-processing.md)      | [仕様](../../specs/media-processing/spec.md)      | [設計](../../specs/media-processing/design.md)      |
| モデレーション・年齢・通報               | [原文](moderation-privacy.md)    | [仕様](../../specs/moderation-privacy/spec.md)    | [設計](../../specs/moderation-privacy/design.md)    |
| ニュース・年表                           | [原文](news-chronicle.md)        | [仕様](../../specs/news-chronicle/spec.md)        | [設計](../../specs/news-chronicle/design.md)        |
| 通知・Web Push・既読位置                 | [原文](notifications-unread.md)  | [仕様](../../specs/notifications-unread/spec.md)  | [設計](../../specs/notifications-unread/design.md)  |
| 投稿・編集入力・下書き                   | [原文](post-composer.md)         | [仕様](../../specs/post-composer/spec.md)         | [設計](../../specs/post-composer/design.md)         |
| 設定同期・プロフィール・ゲスト投稿       | [原文](preferences-profile.md)   | [仕様](../../specs/preferences-profile/spec.md)   | [設計](../../specs/preferences-profile/design.md)   |
| botたんラジオ                            | [原文](radio.md)                 | [仕様](../../specs/radio/spec.md)                 | [設計](../../specs/radio/design.md)                 |
| 検索・OGP・静的配信・デプロイ            | [原文](seo-deployment.md)        | [仕様](../../specs/seo-deployment/spec.md)        | [設計](../../specs/seo-deployment/design.md)        |
| 画面基盤・レイアウト・操作・開発検証     | [原文](ui-platform.md)           | [仕様](../../specs/ui-platform/spec.md)           | [設計](../../specs/ui-platform/design.md)           |
