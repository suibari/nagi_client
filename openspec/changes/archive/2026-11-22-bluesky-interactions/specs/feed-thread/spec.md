# Spec Delta

## MODIFIED Requirements

### Requirement: FEED-01 タブと旧リンク

フィードは設定されたタブと?tab=idで選択し、取得経路・可視性は既存APIに従わなければならない（MUST）。不正タブだけを捨て、旧channel/tag検索タブはhashtagへ移す。全て無効な場合だけ既定へ戻す。廃止チャンネルの旧URLはPDSから名前を読みタグページへ案内する。Blueskyのフィードのタブには、タブバーと一覧のメニューでBlueskyのアイコンを付け、Nagiのタブと見分けられるようにする（2026-11-22に合意）。

#### Scenario: 一部の設定破損

- **WHEN** 保存タブに読めない要素が1つある
- **THEN** 有効な残りの並びを保持する

#### Scenario: 旧チャンネルURL

- **WHEN** 以前共有したチャンネルを開く
- **THEN** 廃止APIを呼ばずタグ検索へ移す

#### Scenario: Blueskyのフィードのタブ

- **WHEN** NagiのタブとBlueskyのフォロー中やカスタムフィードのタブを並べている
- **THEN** Blueskyのタブにだけ名前の前にBlueskyのアイコンを付け、読み上げでもBlueskyのタブだと分かるようにする
