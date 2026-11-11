# Nagiの仕様書

既存コードのコメントにあった仕様・実装理由・過去経緯・互換条件を、OpenSpecの分野別仕様と設計資料へ集約した。アプリのコード、既存設定、依存関係、コメントはこの段階では変更していない。

## 読み方

- **`specs/<domain>/spec.md`**: 現状の振る舞いを整理した123要件・230シナリオ。OpenSpecの正式な基準仕様。
- **同じ場所の `design.md`**: 実装判断の根拠・詳細な型の意味・UIの意図・テストの再現条件。コメント原文を出典付きで全件保存する。「なぜそうなっているか」はここで追える。
- **[coverage.md](coverage.md)**: 調査範囲、分野別件数、ファイルごとの移管先、完了条件と確認結果。
- **[comment-catalog.json](comment-catalog.json)**: 670ソース・設定ファイルのSHA-256とコメント原文・行範囲・移管分野を記録した機械可読台帳。
- **[known-gaps.md](known-gaps.md)**: コメントと実装の不一致、旧設計、外部リポジトリの確認境界。現状の欠陥を修正済みとは扱わない。

要件が記す現状と、設計資料に原文として残る古い説明を区別する。不一致の扱いは `known-gaps.md` を優先して読む。`design.md` のツール抑制、テンプレート、見出しだけのコメントは利用者向け動作要件ではない。原文にない経緯は推測していない。

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

## OpenSpecの利用

[公式CLI](https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md) の **1.17.0** で初期化した。`schema: spec-driven` とCodex向けの標準6スキルを `.agents/skills/` に導入している。アプリの `package.json` やlockfileには追加せず、CLIは固定版を `npx` で実行できる。

```sh
# リポジトリルートから実行
npx --yes @fission-ai/openspec@1.17.0 list --specs
npx --yes @fission-ai/openspec@1.17.0 show auth-session --type spec
npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive
node openspec/tools/comment-catalog.mjs --check
```

Codexの生成スキルから `openspec` コマンド名で実行したい環境では、利用者のCLI環境へ同じ版をインストールする。

```sh
npm install -g @fission-ai/openspec@1.17.0
```

この作業ではグローバルインストールはしていない。Codexのスキル認識にはセッションの再読込が必要な場合がある。

## 今後の運用

1. 関連する `spec.md`、`design.md`、既知の不整合を読む。
2. 振る舞いを変える場合は `openspec-propose` 等で `changes/<name>/` にproposal/design/specs/tasksを作る。現状の基準仕様へ未実装の理想を直接混ぜない。
3. 仕様整備と実装・コメント削減を分ける。現段階では仕様書だけを整備する。
4. 実装が別途依頼されたら、要件と確認条件を更新し、完了したchangeをsync/archiveする。判断の理由はドキュメントへ残す。

今回の既存仕様の復元は、将来の機能変更ではないため `specs/` に直接基準を置いた。未実装のchangeや、未実施のコード変更を完了扱いしたtasksは作っていない。

## 後続のコメント削減時に守ること

現時点のコメントは全件、コードにも文書にも残っている。削減する際は仕様の重複説明と、コードに必要な局所説明・ライセンス・ツール指示を区別する。出典の行番号は導入時点の位置なので、その後の正確な復元には台帳の基準コミットを使う。

台帳は導入時点の証跡であり、コメントを消した後に再生成して過去経緯まで消してはならない。検証ツールの通常実行は読み取り専用で、既存台帳の上書きを拒否する。`--check` は今回の文書化段階でソース不変を確認する検査であり、将来の動作変更後には出典の維持と新仕様への移行を別途レビューする。

## 既存の設計資料

- [絵文字生成の設計案](../docs/emoji-generation-design.md)
- [botたんラジオPoC](../docs/bot-tan-radio-poc.md)

これらは設計案・実測の背景資料として保持する。サーバ側の現状を保証する仕様には自動変換していない。
