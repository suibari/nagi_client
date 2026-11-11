# Nagiの仕様書

Nagiの機能、振る舞い、設計判断をまとめる。アプリコード・既存コメントは変更せず、導入時のコメントをもとに18分野、123要件・230シナリオを整理した。

## 読む順序

1. 下の分野一覧から対象の `spec.md` を開く。**機能概要 → 機能一覧 → 主な利用の流れ → 詳細要件**の順に読める。機能一覧の要件IDから詳細へ移動できる。
2. 「なぜこの振る舞いか」を調べるときは同じ場所の `design.md` を読む。課題・採用判断・理由と制約、および現在の実装の入口を記す。
3. 外部仕様の意味を確認するときは各 `spec.md` の参照資料へ進む。参照目的と関連する内部仕様も示す。
4. 過去の記述を確認するときだけ [導入時コメント原文](reference/comment-snapshot/README.md) と [台帳](comment-catalog.json) を読む。現行設計書とは別の固定履歴である。

## 文書の役割

| 文書                                                                               | 内容                                                 | 更新するタイミング                                       |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| `specs/<domain>/spec.md`                                                           | 目的、機能一覧、利用の流れ、動作要件、参照資料       | 機能や振る舞いが変わるとき                               |
| 同じ場所の `design.md`                                                             | 課題、採用判断、その理由・制約、ファイルと処理の入口 | 設計上の判断や実装の構成が変わるとき                     |
| [known-gaps.md](known-gaps.md)                                                     | 旧説明との不一致、実装上の制約、外部実装の確認境界   | 不一致を発見・解消したとき                               |
| [coverage.md](coverage.md)                                                         | 調査範囲、コメントの移管先、検証内容                 | 文書の対応関係を整理したとき                             |
| [コメント原文](reference/comment-snapshot/README.md)・[台帳](comment-catalog.json) | 導入時の原文、行範囲、ファイルハッシュ               | 導入時の証跡として固定。現行コードに合わせて再生成しない |

原文に残る古い説明を現在の要件としてそのまま採用しない。不一致は `known-gaps.md` と各分野の要件で扱う。原文にない過去の議論は推測して補わない。

## 分野別の入口

| 分野                                   | 仕様                                        | 設計・経緯                                    |
| -------------------------------------- | ------------------------------------------- | --------------------------------------------- |
| 認証・セッション・SSO                  | [仕様](specs/auth-session/spec.md)          | [設計](specs/auth-session/design.md)          |
| AppView通信・AT Protocol・型契約       | [仕様](specs/appview-protocol/spec.md)      | [設計](specs/appview-protocol/design.md)      |
| 投稿・入力・下書き                     | [仕様](specs/post-composer/spec.md)         | [設計](specs/post-composer/design.md)         |
| 画像・GIF・動画・リンクカード          | [仕様](specs/media-processing/spec.md)      | [設計](specs/media-processing/design.md)      |
| フィード・タブ・スレッド・リアクション | [仕様](specs/feed-thread/spec.md)           | [設計](specs/feed-thread/design.md)           |
| Bluesky閲覧・クロスポスト              | [仕様](specs/bluesky-integration/spec.md)   | [設計](specs/bluesky-integration/design.md)   |
| ブログ・standard.site                  | [仕様](specs/blog-publication/spec.md)      | [設計](specs/blog-publication/design.md)      |
| 日記・気分・3行日記                    | [仕様](specs/diary-trilines/spec.md)        | [設計](specs/diary-trilines/design.md)        |
| カード・ゼンカツ・アドベント・名刺     | [仕様](specs/cards-zenkatsu-advent/spec.md) | [設計](specs/cards-zenkatsu-advent/design.md) |
| botたんラジオ                          | [仕様](specs/radio/spec.md)                 | [設計](specs/radio/design.md)                 |
| ニュース・年表                         | [仕様](specs/news-chronicle/spec.md)        | [設計](specs/news-chronicle/design.md)        |
| 通知・Push・既読                       | [仕様](specs/notifications-unread/spec.md)  | [設計](specs/notifications-unread/design.md)  |
| 絵文字・タグ                           | [仕様](specs/emoji-tags/spec.md)            | [設計](specs/emoji-tags/design.md)            |
| 設定同期・プロフィール・ゲスト         | [仕様](specs/preferences-profile/spec.md)   | [設計](specs/preferences-profile/design.md)   |
| モデレーション・年齢・通報             | [仕様](specs/moderation-privacy/spec.md)    | [設計](specs/moderation-privacy/design.md)    |
| 表示言語・翻訳・テーマ                 | [仕様](specs/i18n-theme/spec.md)            | [設計](specs/i18n-theme/design.md)            |
| 検索・OGP・静的配信・デプロイ          | [仕様](specs/seo-deployment/spec.md)        | [設計](specs/seo-deployment/design.md)        |
| 画面基盤・レイアウト・操作・開発検証   | [仕様](specs/ui-platform/spec.md)           | [設計](specs/ui-platform/design.md)           |

共通部品が複数分野を横断する場合、出典は1分野に保管し、機能の要件は該当する複数分野から参照する。特定ファイルを探すときは `coverage.md` または台帳の `path` を使う。

## CodexとClaudeからの利用

仕様本文は共通のMarkdownであり、ツール別には複製しない。

- **Codex**：[AGENTS.md](../AGENTS.md) から仕様の入口へ誘導する。OpenSpecの標準6スキルを `.agents/skills/` に導入済み。
- **Claude Code**：[CLAUDE.md](../CLAUDE.md) が `@AGENTS.md` を読み、同じ仕様書へ誘導する。専用のOpenSpecスキル・コマンドはClaude向けにはまだ生成していないが、仕様の参照・利用はできる。

`CLAUDE.md` のimportは [Claude Code公式資料](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools) に基づく。OpenSpecのツール別生成物は [公式Supported Tools](https://github.com/Fission-AI/OpenSpec/blob/main/docs/supported-tools.md) を参照する。

## OpenSpecの利用と検証

[公式CLI](https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md) の **1.17.0**、`schema: spec-driven` を使用する。アプリの `package.json` とlockfileには追加せず、固定版を `npx` で実行する。

```sh
# リポジトリルートで実行
npx --yes @fission-ai/openspec@1.17.0 list --specs
npx --yes @fission-ai/openspec@1.17.0 show auth-session --type spec
npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive

# 文書構成、固定履歴の原文・リンク、ローカルリンクを検証
node openspec/tools/comment-catalog.mjs --check

# 今回の文書化で現行アプリが変わっていないことも検証
node openspec/tools/comment-catalog.mjs --check-current
```

履歴検証は採録コミットを含むGit履歴を必要とする。通常の `--check` は固定した基準ソースを使うため、将来のコード移動やコメント削減で行位置が変わっても検証できる。`--check-current` は導入時と現行ソースが同じかも調べるため、将来アプリを変更した後は失敗する。証跡の書き換えでこの差分を隠さない。

生成スキルから `openspec` のコマンド名で実行する環境では、同じ版をCLI環境へ導入する。

```sh
npm install -g @fission-ai/openspec@1.17.0
```

今回グローバルインストールはしていない。生成スキルの認識にはセッションの再読込が必要な場合がある。

## 今後の更新

1. 関連する `spec.md` と `design.md`、既知の不整合を読む。
2. 振る舞いを変える場合はOpenSpecのchangeへ提案・設計・差分仕様・作業項目を記録する。未実装の理想を現状の基準へ直接混ぜない。
3. 実装が別途依頼されたら要件・確認条件・設計判断を更新し、完了したchangeをsync/archiveする。今回の作業は仕様書整備であり、アプリコードと既存コメントは変更しない。
4. 文書表現の整理だけの場合も、機能概要・一覧・要件・設計・参照先の対応を確認する。

今回の既存仕様の復元は機能変更ではないため、基準仕様を `specs/` へ直接置いている。原文資料を移動した今回の整理でも、既存要件とシナリオは保持した。

## 行番号とコメント削減

現行の `design.md` はコードの行番号を管理しない。実装を探す入口はファイル名と処理・責務で示す。ファイルの移動や判断変更の際はこの入口と本文を更新する。

原文資料の行番号は採録コミットにだけ属する。リンクはそのコミットへ固定し、古い行が現行ブランチの別コードを指すことを避ける。コード側のコメントを将来減らしても、ここで保存した実装理由や過去経緯は消さない。

削減の対象となる重複説明と、コードに必要な局所説明・ライセンス・ツール指示を区別する。原文を保存したことだけで、すべてのコメントを削除してよいとは扱わない。

## 既存の背景資料

- [絵文字生成の設計案](../docs/emoji-generation-design.md)
- [botたんラジオPoC](../docs/bot-tan-radio-poc.md)

設計案と過去の実測は、現在のサーバ実装を保証する仕様と区別する。
