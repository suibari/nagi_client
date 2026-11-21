# Spec Delta

## ADDED Requirements

### Requirement: NOTIFY-07 Blueskyの通知タブ

Bluesky連携を有効にしている利用者には、通知画面にNagiとBlueskyのタブを分けて表示しなければならない（MUST）。Blueskyのタブは本人PDS経由でBlueskyの通知APIから一覧を取得し、既読もBluesky側に記録する。Nagiの通知の既読（NOTIFY-01・02）とは混ぜない。対象は返信・メンション・引用・いいね・リポスト・フォローとし、それ以外の種類は表示しない。複数人からの同種の通知も件数で集約して表示してはならず（MUST NOT）、1件ずつ表示する。ミュート・ブロック・ラベルはBluesky側の判定に従い、Nagiで成人確認できない人には成人向けの内容を隠す（BSKY-02）。ナビゲーションの未読バッジにはBlueskyの未読を含めず、Blueskyの未読はBlueskyタブの印で示す。

#### Scenario: タブの表示

- **WHEN** Bluesky連携を有効にした利用者が通知画面を開く
- **THEN** NagiとBlueskyのタブを表示し、Nagiのタブを初期表示にする

#### Scenario: 連携していない利用者

- **WHEN** Bluesky連携を有効にしていない利用者が通知画面を開く
- **THEN** Blueskyのタブを表示しない

#### Scenario: 複数人のいいね

- **WHEN** 同じ投稿に3人がいいねした
- **THEN** 「ほか2人」のような件数の表現を使わず、3件を個別に表示する

#### Scenario: 既読の記録

- **WHEN** Blueskyのタブで通知を表示する
- **THEN** 表示できた最新の通知までをBluesky側で既読にし、Nagiの通知の既読は変えない

#### Scenario: Blueskyだけに未読がある

- **WHEN** Nagiの通知はすべて既読で、Blueskyに未読の通知がある
- **THEN** ナビゲーションの未読バッジは出さず、通知画面のBlueskyタブに未読の印を出す

#### Scenario: 取得の失敗

- **WHEN** Blueskyの通知の取得が失敗する
- **THEN** 表示済みの一覧を消さず、Nagiのタブには影響させない
