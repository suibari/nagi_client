# standard.site記事公開・ブログ表示

## Purpose

### 機能概要

利用者が長文や画像を記事として公開し、Nagi以外のstandard.site対応アプリからも読めるようにする。Nagiの編集体験を保ちながら、本人PDSにある記事を他のリーダーでも扱える形で保存する。

publicationは著者のブログに相当する公開単位、documentは1件の記事である。Nagiで作成したレコードだけを管理し、同じPDS上にある他アプリのブログへ干渉しない。

### 機能一覧

| 機能                 | 役割・利用者ができること                               | 詳細要件                                  |
| -------------------- | ------------------------------------------------------ | ----------------------------------------- |
| 記事とブログの作成   | 記事正本と著者のpublicationを本人PDSへ用意する。       | [BLOG-01](#blog-01)                       |
| 公開URLと検証        | 著者別URL・記事URLとAT URIの対応を示す。               | [BLOG-02](#blog-02)                       |
| 編集・削除と移行     | 既存記事だけを追従させ、旧形式を再開可能な手順で直す。 | [BLOG-02](#blog-02) / [BLOG-03](#blog-03) |
| 公開設定・外部カード | 発見フィード設定、配色、Blueskyティーザーを扱う。      | [BLOG-04](#blog-04)                       |
| 本文メディア         | 画像・URL行の位置に添付を配置する。                    | [BLOG-05](#blog-05)                       |
| 公開ページと翻訳     | 原文を静的公開し、閲覧者向けの翻訳を後から表示する。   | [BLOG-06](#blog-06)                       |

### 主な利用の流れ

1. blogモードで本文・タイトル・画像・タグを編集する。
2. 公開条件を確認し、必要なら本人用publicationを作る。
3. documentを本人PDSへ保存し、記事URLと検証情報を公開する。
4. 以後の編集・削除を既存記事へ反映する。閲覧時は静的な原文へ補助情報や翻訳を加える。

この文書は現行クライアントの振る舞いを整理する。設計判断は [design.md](design.md)、導入時の証跡は [コメント原文](../../reference/comment-snapshot/blog-publication.md)、既知の不整合は [known-gaps.md](../../known-gaps.md) に分けて記録する。シナリオは確認条件であり、全外部環境での実行合格を示すものではない。

## Requirements

<a id="blog-01"></a>

### Requirement: BLOG-01 正本とpublication

新規blogは本人PDSのsite.standard.documentを正本とし、Nagiの原文・facet・添付をnagiフィールド、外部リーダー向けGFMをcontentに保存しなければならない（MUST）。publicationはNagiプロフィールから初回公開時に遅延作成し、他アプリのpublicationを流用しない。

#### Scenario: 初めての公開

- **WHEN** Nagi publicationをまだ持っていない
- **THEN** 本人用のpublicationを作り、そのsiteをdocumentに設定する

#### Scenario: 同居する別アプリ

- **WHEN** repoの先頭publicationが他アプリのもの
- **THEN** 先頭1件を採用せずNagi URLで照合する

<a id="blog-02"></a>

### Requirement: BLOG-02 URLと検証・再開可能な移行

publication.urlは https://nagi.suibari.com/blog/<did>、document.pathは /<rkey> とし、組合せのcanonicalを維持しなければならない（MUST）。旧共通originをNagiの旧レコードとして認め、documentを先に移行してからpublicationのURLを更新する。失敗時は完了印を付けず次回再開する。

#### Scenario: 移行途中の失敗

- **WHEN** documentの一部だけを書き直せた
- **THEN** publication.urlは旧値を残し、次回に残りを直す

#### Scenario: ユーザー別検証

- **WHEN** well-knownでpublicationを検証する
- **THEN** ユーザー別パスでそのDIDのpublicationを返す

<a id="blog-03"></a>

### Requirement: BLOG-03 編集・削除の追従と非公開保持

既存記事はrkeyで対応させて編集・削除し、記事でない投稿を編集だけで公開してはならない（MUST）。本文に見出しが無ければ既存タイトルを残す。タグ省略は既存タグ保持を意味し、site/publishedAt/未知フィールドを保持する。全削除はNagiに属するpublication/documentだけを対象にする。

#### Scenario: 通常投稿の編集

- **WHEN** documentが存在しない
- **THEN** 新規記事を作らない

#### Scenario: 本文だけの編集

- **WHEN** タグ指定なしで更新する
- **THEN** 記事メタ欄で設定したタグを消さない

<a id="blog-04"></a>

### Requirement: BLOG-04 公開同意と外部カード

記事公開選択は発見フィード掲載への同意として扱い、publicationの設定と既定配色を揃えなければならない（MUST）。プロフィール更新だけではpublicationを新規作成しない。Blueskyティーザーは取得可能ならdocument/publicationの強参照を付け、取れなければ通常リンクカードにする。

#### Scenario: 過去にdiscover無効

- **WHEN** 次に本人が記事を公開する
- **THEN** showInDiscoverを有効へ揃える

#### Scenario: プロフィールだけ編集

- **WHEN** 記事をまだ公開したことが無い
- **THEN** ブログ公開を勝手に有効にしない

<a id="blog-05"></a>

### Requirement: BLOG-05 本文内の画像・カード

画像はNagi公開originのDID/CID固定URLを使い、本文の画像行の位置で添付と照合して描画しなければならない（MUST）。本文に配置したメディアは下の一覧へ重複させない。外部画像URLを無条件で本文へ読み込まない。先頭の未配置画像はヘッダー、残りは本文後とする。

#### Scenario: PDS移転

- **WHEN** 本人PDSのホストが変わる
- **THEN** 本文の公開画像URLはDID/CIDにより同じまま使える

#### Scenario: 古いalt

- **WHEN** altが添付にしか保存されていない
- **THEN** 編集中の空alt画像行へ移してから本文を真実源にする

<a id="blog-06"></a>

### Requirement: BLOG-06 静的公開と翻訳の責務

プリレンダは原文の本文を残し、AppView取得失敗でもPDSから取得済みの記事を公開し続けなければならない（MUST）。本文翻訳はhydration後にlangsとcidが揃ってから行い、原文のfacetを訳文へ適用しない。一覧カードはキャッシュ済み翻訳だけを取得する。

#### Scenario: 補助情報の取得失敗

- **WHEN** 記事本文は読めるがAppViewやタグ取得が失敗する
- **THEN** 本文を維持し補助情報だけ省く

#### Scenario: 本文翻訳

- **WHEN** 訳文へ差し替える
- **THEN** 原文のbyte位置を訳文に当てない

## 参照資料

### 外部資料

| 資料                                                                     | この機能で参照する理由                       |
| ------------------------------------------------------------------------ | -------------------------------------------- |
| [Standard.site — Introduction](https://standard.site/docs/introduction/) | publicationとdocumentによる長文公開の全体像  |
| [AT Protocol — Repository](https://atproto.com/specs/repository)         | PDSに保存する公開レコードと参照関係          |
| [AT Protocol — Blobs](https://atproto.com/specs/blob)                    | 添付のBlobRef、CID、参照レコードと保持の関係 |

リンクの到達先と対象を2026-11-11に確認した。外部の説明は更新されるため、本リポジトリ固有の制約と外部仕様を区別する。現行実装の基準はこの文書の要件とし、外部仕様への追従で振る舞いを変える場合は差分を記録する。

### 関連する内部資料

- [設計判断](design.md)：採用理由、互換条件、失敗時の考え方。
- [導入時コメント原文](../../reference/comment-snapshot/blog-publication.md)：基準コミットの出典を全件保存した履歴資料。
- [投稿・編集入力・下書き](../post-composer/spec.md)：連携する機能の要件。
- [検索・OGP・静的配信・デプロイ](../seo-deployment/spec.md)：連携する機能の要件。
- [Bluesky閲覧・クロスポスト](../bluesky-integration/spec.md)：連携する機能の要件。
- [表示言語・翻訳・テーマ](../i18n-theme/spec.md)：連携する機能の要件。
