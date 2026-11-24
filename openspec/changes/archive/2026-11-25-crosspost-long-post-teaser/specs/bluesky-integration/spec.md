# Spec Delta

## MODIFIED Requirements

### Requirement: BSKY-05 分割と埋め込み

Nagi投稿のBlueskyコピーは1件にし、上限（300graphemesかつ3000bytes）を超える本文は、冒頭の末尾に「…もっと見る」を付けて「もっと見る」をNagiのスレッドページへのリンクにしなければならない（MUST）。冒頭は改行→空白→grapheme境界の順に切り、可能な限りfacetをまたがない。Bluesky投稿への返信・引用（BSKY-09）は同じ規則で分割し、続きを自分の返信へつなぐ。画像と動画の混在は動画だけにし、via=Nagiを付ける。

引用は、本人のクロスポスト済み投稿でコピーを参照できればコピーの引用、それ以外は引用先の公開ページのリンクカードにする（MUST）。リンク先は、Nagi投稿ならスレッドページ、ニュースならNagiのニュースページ、ラジオなら曲ページとする。メディアもある場合は引用先のURLを本文の末尾に入れ、冒頭を切るときも残す。引用のカードは本文のリンクカードより優先する。他人のNagi投稿のURLはリンクカードにしてはならない（MUST NOT、POST-07）。

#### Scenario: 長い日本語投稿

- **WHEN** Nagiの本文がBluesky上限を超える投稿をクロスポストする
- **THEN** byte数とgrapheme数の両方を守る冒頭に「…もっと見る」を付けた1件を作り、「もっと見る」をNagiのスレッドページへのリンクにする

#### Scenario: 英語の表示言語

- **WHEN** 表示言語が英語の人が長い投稿をクロスポストする
- **THEN** 冒頭の末尾を「…See more」にし、「See more」をリンクにする

#### Scenario: 上限に収まる投稿

- **WHEN** Nagiの本文がBluesky上限に収まる投稿をクロスポストする
- **THEN** 全文を1件で出し、「…もっと見る」を付けない

#### Scenario: 長いBlueskyへの返信

- **WHEN** Bluesky投稿への返信が上限を超える
- **THEN** byte数とgrapheme数の両方を守るスレッドに分割する

#### Scenario: 巨大facet

- **WHEN** facetを避けると冒頭を切れない、または分割できない
- **THEN** 必要な箇所だけfacetを諦めて強制的に切る

#### Scenario: コピーのある投稿の引用

- **WHEN** 自分のクロスポスト済み投稿を引用し、コピーを参照できる
- **THEN** Bluesky側ではコピーの引用にする

#### Scenario: コピーの無い投稿の引用

- **WHEN** 引用先にBlueskyのコピーが無い、またはコピーを参照できない
- **THEN** 引用先のスレッドページのリンクカードにする

#### Scenario: 画像付きの引用

- **WHEN** 画像を添付し、コピーの無い投稿を引用してBlueskyにも出す
- **THEN** 画像を埋め込み、引用先のURLを本文の末尾にリンクとして入れる

#### Scenario: 画像付きの引用で本文が長い

- **WHEN** 画像を添付し、コピーの無い投稿を引用した長い本文をBlueskyにも出す
- **THEN** 冒頭と「…もっと見る」の後ろに引用先のURLを残し、画像を埋め込む

#### Scenario: 本文に他人の投稿のリンクがある

- **WHEN** 他人のNagi投稿のURLを本文に書いてBlueskyにも出す
- **THEN** リンクの文字だけを出し、リンクカードを付けない

### Requirement: BSKY-06 作成順序と補償の限界

通常投稿のBlueskyコピーはNagi投稿の保存が成功した後に作り、作成できたコピーの強参照をNagi投稿へ追記しなければならない（MUST）。Nagi保存に失敗したらBlueskyへ何も作らない。Bluesky投稿の権限は作成と削除とし、更新は要求しない。削除は利用者が明示した場合（BSKY-10）にだけ行い、失敗時に作成済みのコピーを自動で削除して巻き戻してはならない（MUST NOT）。コピー作成・参照追記のいずれが失敗しても、Nagi投稿は成功のまま扱い、Bluesky側の状態を警告で伝える。Bluesky投稿への返信・引用（BSKY-09）の分割が途中で失敗した場合も、作成済みの分を削除しない。記事ティーザーは公開URLが要るため記事作成後に出し、失敗で記事を巻き戻さない。

#### Scenario: Bluesky側の作成失敗

- **WHEN** Nagi保存後に通常コピーを作れない
- **THEN** Nagi投稿は成功のまま表示し、Blueskyへ投稿できなかったことを警告で伝える

#### Scenario: Nagi側の作成失敗

- **WHEN** クロスポストを選んだ投稿のNagi保存が失敗する
- **THEN** Blueskyへは何も作らず、削除も試みずに投稿エラーを伝える

#### Scenario: 分割投稿の途中失敗

- **WHEN** Bluesky投稿への長い返信の一部だけが作成できた
- **THEN** 作成済みの分を自動で削除せず、Blueskyに途中までの投稿が残ったことを伝える

#### Scenario: 参照追記の失敗

- **WHEN** Blueskyのコピーは作れたが、Nagi投稿へのコピー参照の追記が失敗する
- **THEN** Nagi投稿とBlueskyのコピーは残したまま、Nagi上でBlueskyへの返信・引用を続けられないことを警告で伝える

#### Scenario: 権限の範囲

- **WHEN** Bluesky連携のためにOAuth権限を要求する
- **THEN** Bluesky投稿についてはcreateとdeleteを要求し、updateを要求しない

## ADDED Requirements

### Requirement: BSKY-16 長文の目印

BSKY-05で本文を省略したBlueskyコピーには、レコードの追加フィールド`com.suibari.nagi.longPost`に、全文を持つNagi投稿への強参照（`uri`と`cid`）を入れなければならない（MUST）。`cid`はコピーを作るときに参照したNagi投稿の版とする。全文をBlueskyに載せたコピーには入れてはならない（MUST NOT）。

NagiのBlueskyタブは、投稿者と同じリポジトリの`com.suibari.nagi.post`を指す目印を持つ投稿に「全文を表示」を出さなければならない（MUST）。押したらNagi AppViewからNagi投稿を取得し、その場で全文を表示する。Nagi AppViewへ渡すのはNagi投稿のURIだけとする（BSKY-01）。目印のDIDが投稿者と違う、参照先が`com.suibari.nagi.post`でない、形が壊れている場合は目印を無視する。目印の`cid`と取得したNagi投稿の版が違っても、編集済みとは表示しない。

#### Scenario: 長い投稿の目印

- **WHEN** 本文を省略してBlueskyにクロスポストする
- **THEN** コピーのレコードに、Nagi投稿のURIとコピー作成時のCIDを`com.suibari.nagi.longPost`として入れる

#### Scenario: 短い投稿

- **WHEN** 全文がBlueskyに収まる投稿をクロスポストする
- **THEN** 目印を入れない

#### Scenario: Blueskyタブで全文を表示

- **WHEN** Blueskyタブで目印を持つ投稿の「全文を表示」を押す
- **THEN** Nagi投稿の本文とリンクをその場に表示する

#### Scenario: 全文を取得できない

- **WHEN** Nagi投稿が削除されている、または表示できない状態で「全文を表示」を押す
- **THEN** 冒頭の表示のまま全文を表示できなかったことを伝え、「もっと見る」のリンクは残す

#### Scenario: 他人のリポジトリを指す目印

- **WHEN** 目印が投稿者と違うDIDのNagi投稿を指している
- **THEN** 目印を無視し、「全文を表示」を出さない

#### Scenario: 参照追記で版が進んだ

- **WHEN** 目印の`cid`と、取得したNagi投稿の現在の版が違う
- **THEN** 全文を表示し、編集済みの表示はしない
