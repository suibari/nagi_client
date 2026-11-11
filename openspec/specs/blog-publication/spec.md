# standard.site記事公開・ブログ表示

## Purpose

記事正本、publicationの所有範囲、移行、公開ページと翻訳を定義する。

この仕様は導入時点の実装・コメントから復元した現状の基準である。根拠と詳細な設計判断は [design.md](design.md)、確認された不整合は [known-gaps.md](../../known-gaps.md) を参照する。記載するシナリオは確認条件であり、今回すべての外部サービスを実行検証したという意味ではない。

## Requirements

### Requirement: BLOG-01 正本とpublication

新規blogは本人PDSのsite.standard.documentを正本とし、Nagiの原文・facet・添付をnagiフィールド、外部リーダー向けGFMをcontentに保存しなければならない（MUST）。publicationはNagiプロフィールから初回公開時に遅延作成し、他アプリのpublicationを流用しない。

#### Scenario: 初めての公開

- **WHEN** Nagi publicationをまだ持っていない
- **THEN** 本人用のpublicationを作り、そのsiteをdocumentに設定する

#### Scenario: 同居する別アプリ

- **WHEN** repoの先頭publicationが他アプリのもの
- **THEN** 先頭1件を採用せずNagi URLで照合する

### Requirement: BLOG-02 URLと検証・再開可能な移行

publication.urlは https://nagi.suibari.com/blog/<did>、document.pathは /<rkey> とし、組合せのcanonicalを維持しなければならない（MUST）。旧共通originをNagiの旧レコードとして認め、documentを先に移行してからpublicationのURLを更新する。失敗時は完了印を付けず次回再開する。

#### Scenario: 移行途中の失敗

- **WHEN** documentの一部だけを書き直せた
- **THEN** publication.urlは旧値を残し、次回に残りを直す

#### Scenario: ユーザー別検証

- **WHEN** well-knownでpublicationを検証する
- **THEN** ユーザー別パスでそのDIDのpublicationを返す

### Requirement: BLOG-03 編集・削除の追従と非公開保持

既存記事はrkeyで対応させて編集・削除し、記事でない投稿を編集だけで公開してはならない（MUST）。本文に見出しが無ければ既存タイトルを残す。タグ省略は既存タグ保持を意味し、site/publishedAt/未知フィールドを保持する。全削除はNagiに属するpublication/documentだけを対象にする。

#### Scenario: 通常投稿の編集

- **WHEN** documentが存在しない
- **THEN** 新規記事を作らない

#### Scenario: 本文だけの編集

- **WHEN** タグ指定なしで更新する
- **THEN** 記事メタ欄で設定したタグを消さない

### Requirement: BLOG-04 公開同意と外部カード

記事公開選択は発見フィード掲載への同意として扱い、publicationの設定と既定配色を揃えなければならない（MUST）。プロフィール更新だけではpublicationを新規作成しない。Blueskyティーザーは取得可能ならdocument/publicationの強参照を付け、取れなければ通常リンクカードにする。

#### Scenario: 過去にdiscover無効

- **WHEN** 次に本人が記事を公開する
- **THEN** showInDiscoverを有効へ揃える

#### Scenario: プロフィールだけ編集

- **WHEN** 記事をまだ公開したことが無い
- **THEN** ブログ公開を勝手に有効にしない

### Requirement: BLOG-05 本文内の画像・カード

画像はNagi公開originのDID/CID固定URLを使い、本文の画像行の位置で添付と照合して描画しなければならない（MUST）。本文に配置したメディアは下の一覧へ重複させない。外部画像URLを無条件で本文へ読み込まない。先頭の未配置画像はヘッダー、残りは本文後とする。

#### Scenario: PDS移転

- **WHEN** 本人PDSのホストが変わる
- **THEN** 本文の公開画像URLはDID/CIDにより同じまま使える

#### Scenario: 古いalt

- **WHEN** altが添付にしか保存されていない
- **THEN** 編集中の空alt画像行へ移してから本文を真実源にする

### Requirement: BLOG-06 静的公開と翻訳の責務

プリレンダは原文の本文を残し、AppView取得失敗でもPDSから取得済みの記事を公開し続けなければならない（MUST）。本文翻訳はhydration後にlangsとcidが揃ってから行い、原文のfacetを訳文へ適用しない。一覧カードはキャッシュ済み翻訳だけを取得する。

#### Scenario: 補助情報の取得失敗

- **WHEN** 記事本文は読めるがAppViewやタグ取得が失敗する
- **THEN** 本文を維持し補助情報だけ省く

#### Scenario: 本文翻訳

- **WHEN** 訳文へ差し替える
- **THEN** 原文のbyte位置を訳文に当てない
