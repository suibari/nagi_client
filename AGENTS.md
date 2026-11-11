# リポジトリでの作業方針

- 仕様の入口は [openspec/README.md](openspec/README.md)。変更前に関係分野の `spec.md` と `design.md`、[既知の不整合](openspec/known-gaps.md) を読む。
- 振る舞いの要件は `openspec/specs/<domain>/spec.md`、実装理由・過去経緯・互換条件は同じ場所の `design.md` に集約する。出典は `openspec/comment-catalog.json` と `coverage.md` で追える。
- 現在の段階は仕様書の整備。アプリのコード・既存設定・依存関係・既存コメントを変更しない。コードやコメントの変更は後続の明示された依頼で扱う。
- 今後の仕様変更はOpenSpecのchangeで提案し、要件、判断理由、確認条件を更新する。単なる区切り、型reference、ライセンス、ツール抑制コメントは仕様移管だけを理由に削除しない。
- AppView・bot・lexiconの実装は別リポジトリにある。外部の実装経緯や契約は、このリポジトリから確認できた範囲と区別する。
