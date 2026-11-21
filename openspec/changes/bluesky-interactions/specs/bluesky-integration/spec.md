# Spec Delta

## MODIFIED Requirements

### Requirement: BSKY-01 データ境界

Blueskyは本人PDSのatproto-proxyから取得し、Nagi AppViewを中継・保存先にしてはならない（MUST）。独自の表示型へ変換し、Nagi PostViewへの変換でBluesky URIをNagiリアクションAPIに渡す経路を作らない。Blueskyへの操作（いいね・リポスト・返信・引用・削除・ミュート・ブックマーク・通報）は本人PDSへ直接行い、Nagiのリアクション・返信の操作と見た目でも区別する。いいね・返信・リポスト・引用の数は取得しても捨て、画面のどこにも件数を出してはならない（MUST NOT）。

#### Scenario: Bluesky投稿の描画

- **WHEN** フィードと会話を取得する
- **THEN** 表示部品だけを再利用し、Nagiのリアクション・返信の操作を付けない
- **AND** Bluesky専用の操作だけを、自分がしたかどうかの状態とともに表示する

#### Scenario: 操作の送信先

- **WHEN** Bluesky投稿にいいね・リポスト・返信などの操作をする
- **THEN** 本人PDSへ送り、Nagi AppViewのAPIへBlueskyのURIを渡さない

### Requirement: BSKY-04 クロスポストの可否

外部連携はオプトイン・実際の権限・対象の存在を確認しなければならない（MUST）。kossoriと本文CWは送信しない。メディアCWはBlueskyがぼかすself-labelがある場合だけ許可する。Nagi投稿の返信・引用ボタンから開く共通Composerでは、本人のクロスポスト済み投稿の既存コピーを1つ参照できる場合にBlueskyへ続けられる。返信と引用の同時外部化は許可しない。Bluesky投稿への返信・引用はこの判定の対象外で、BSKY-09に従う。

#### Scenario: コピー削除済み

- **WHEN** 自分のクロスポストへの返信を外部にも出そうとする
- **THEN** 孤立した返信を作らず送信を止める

#### Scenario: メディアCWのみ

- **WHEN** 対応ラベルが無い画像を外部へ出そうとする
- **THEN** ぼかしが失われるのでブロックする

### Requirement: BSKY-06 作成順序と補償の限界

通常投稿のBlueskyコピーはNagi投稿の保存が成功した後に作り、作成できたコピーの強参照をNagi投稿へ追記しなければならない（MUST）。Nagi保存に失敗したらBlueskyへ何も作らない。Bluesky投稿の権限は作成と削除とし、更新は要求しない。削除は利用者が明示した場合（BSKY-10）にだけ行い、失敗時に作成済みのコピーを自動で削除して巻き戻してはならない（MUST NOT）。コピー作成・分割の途中・参照追記のいずれが失敗しても、Nagi投稿は成功のまま扱い、Bluesky側の状態を警告で伝える。記事ティーザーは公開URLが要るため記事作成後に出し、失敗で記事を巻き戻さない。

#### Scenario: Bluesky側の作成失敗

- **WHEN** Nagi保存後に通常コピーを1件も作れない
- **THEN** Nagi投稿は成功のまま表示し、Blueskyへ投稿できなかったことを警告で伝える

#### Scenario: Nagi側の作成失敗

- **WHEN** クロスポストを選んだ投稿のNagi保存が失敗する
- **THEN** Blueskyへは何も作らず、削除も試みずに投稿エラーを伝える

#### Scenario: 分割投稿の途中失敗

- **WHEN** 分割したBluesky投稿の一部だけが作成できた
- **THEN** 作成済みの分を自動で削除せず、Nagi投稿へ参照を追記せず、Blueskyに途中までのコピーが残ったことを警告で伝える

#### Scenario: 参照追記の失敗

- **WHEN** Blueskyのコピーは揃ったが、Nagi投稿へのコピー参照の追記が失敗する
- **THEN** Nagi投稿とBlueskyのコピーは残したまま、Nagi上でBlueskyへの返信・引用を続けられないことを警告で伝える

#### Scenario: 権限の範囲

- **WHEN** Bluesky連携のためにOAuth権限を要求する
- **THEN** Bluesky投稿についてはcreateとdeleteを要求し、updateを要求しない

## ADDED Requirements

### Requirement: BSKY-08 いいね・リポストの付け外し

Bluesky投稿にいいね・リポストを付け外しできなければならない（MUST）。表示するのは本人が付けているかどうかだけで、件数を出してはならない。押した直後に表示を切り替え、失敗したら元の状態に戻して伝える。処理中は同じ投稿の同じ操作を受け付けず、レコードを重複して作らない。同じ投稿が別の人のリポストで複数表示されていても、状態は投稿単位で揃える。自分の投稿についてのいいねした人の表示（最大5人、本人だけ）は従来どおりとする。返信・リポスト・引用・いいねの操作は、Nagiの投稿と同じくアイコンだけで示し、タイムラインにラベルの文字を出さない（2026-11-21に合意）。

#### Scenario: いいねを付ける

- **WHEN** いいねしていないBluesky投稿のいいねを押す
- **THEN** すぐに「いいね済み」の表示にし、本人PDSにいいねのレコードを作る

#### Scenario: 取り消しの失敗

- **WHEN** いいねやリポストの取り消しが失敗する
- **THEN** 表示を付けた状態に戻し、取り消せなかったことを伝える

#### Scenario: 連打

- **WHEN** 処理が終わる前に同じボタンをもう一度押す
- **THEN** 2回目は受け付けず、レコードを重複して作らない

#### Scenario: 操作の見た目

- **WHEN** Blueskyタブで投稿を表示する
- **THEN** 返信・リポスト・引用・いいねをNagiの投稿の操作列と同じアイコンだけのボタンで出し、名前は読み上げとツールチップで示す
- **AND** 「Blueskyで開く」は投稿のカードに文字で出さず、「…」のメニューの中に置く

#### Scenario: 同じ投稿の複数表示

- **WHEN** リポストで同じ投稿がフィードに2回出ている状態で片方にいいねする
- **THEN** もう片方の表示も「いいね済み」に揃える

### Requirement: BSKY-09 Bluesky投稿への返信・引用

Bluesky投稿への返信・引用は、共通ComposerのBluesky専用モードでBlueskyにだけ投稿しなければならない（MUST）。Nagi投稿は作らない。Blueskyタブに表示された自分のクロスポストのコピーへの返信・引用も同じ扱いとする。本文の分割・埋め込みはBSKY-05、メディアCWの扱いはBSKY-04と同じ条件に従う。こっそり・本文CW・Nagiだけの機能は、このモードでは選べない。作成した投稿には`via: "Nagi"`を付ける。投稿先がBlueskyであることを画面に表示する。入力内容はNagiの下書き（POST-06）に保存せず、本文や添付がある状態で閉じるときは破棄の確認を出す。

#### Scenario: Bluesky投稿へ返信

- **WHEN** Blueskyタブの投稿の返信ボタンから投稿する
- **THEN** Blueskyに返信として投稿し、Nagi投稿を作らない

#### Scenario: Bluesky投稿を引用

- **WHEN** Blueskyタブの投稿の引用ボタンから投稿する
- **THEN** Bluesky上の引用として投稿する

#### Scenario: Nagi投稿へ返信

- **WHEN** Nagiのフィードで投稿の返信ボタンから投稿する
- **THEN** 従来どおりNagiに投稿し、クロスポストはBSKY-04の条件で選べる

#### Scenario: 長い返信

- **WHEN** Blueskyへの返信が300graphemesを超える
- **THEN** BSKY-05に従って分割し、続きを自分の返信へつなぐ

#### Scenario: 書きかけで閉じる

- **WHEN** Blueskyへの返信を書きかけのまま閉じようとする
- **THEN** 破棄してよいかを確認し、キャンセルすれば入力を残す。Nagiの下書きには保存しない

#### Scenario: 返信先が見られない

- **WHEN** 返信先が削除済み、または返信を許可されていない
- **THEN** 投稿を止めて理由を伝え、入力した本文を残す

### Requirement: BSKY-10 Bluesky投稿の削除

Nagi経由で作った自分のBluesky投稿（`via: "Nagi"`を持つもの）だけを、利用者の明示的な操作で削除できなければならない（MUST）。Nagi以外で作ったBluesky投稿に削除の操作を出してはならない。Nagi投稿を削除するときにBlueskyのコピーの参照があれば、確認画面で「Blueskyのコピーも削除する」を選べるようにする（初期状態はオフ）。分割したコピーは全件を対象とする。コピーの削除に失敗しても、Nagi投稿の削除は成功として扱い、残ったコピーを警告で伝える。

#### Scenario: Nagi経由の返信を削除

- **WHEN** Nagiから作ったBlueskyへの返信の削除を選び、確認する
- **THEN** Blueskyからその投稿を削除し、表示から消す

#### Scenario: Nagi以外で作った投稿

- **WHEN** Bluesky公式アプリで作った自分の投稿をBlueskyタブで見る
- **THEN** 削除の操作を表示しない

#### Scenario: Nagi投稿とコピーを一緒に削除

- **WHEN** クロスポスト済みのNagi投稿を削除し、確認画面でBlueskyのコピーも削除するを選ぶ
- **THEN** Nagi投稿を削除した後、分割分を含むBlueskyのコピーを全件削除する

#### Scenario: コピーの削除に失敗

- **WHEN** Nagi投稿は削除できたが、Blueskyのコピーの一部が削除できない
- **THEN** Nagi投稿の削除は成功のまま、Blueskyにコピーが残っていることを警告で伝える

### Requirement: BSKY-11 ミュート

Bluesky投稿の作者とスレッドを、Bluesky側の設定としてミュート・解除できなければならない（MUST）。ミュートの状態はBlueskyのAPIを正本とし、Nagi AppViewへ保存しない。ミュートした作者・スレッドは、Bluesky側の判定に従ってフィード・スレッド・通知の一覧から隠れる。自分自身はミュートの対象に出さない。

#### Scenario: 作者をミュート

- **WHEN** Bluesky投稿のメニューから作者をミュートする
- **THEN** Blueskyの設定にミュートを保存し、表示中のフィードからその作者の投稿を隠す

#### Scenario: スレッドをミュート

- **WHEN** 自分が参加しているスレッドをミュートする
- **THEN** そのスレッドについてのBlueskyの通知が一覧に出なくなる

### Requirement: BSKY-12 返信・引用の許可

Blueskyへ投稿するとき（クロスポスト・Bluesky専用モードの両方）、返信できる人と引用の可否を設定できなければならない（MUST）。初期値はBlueskyの既定と同じく「誰でも返信可・引用可」とする。投稿した後も、Nagi経由で作った自分のBluesky投稿については設定を変更できる。分割したスレッドでは先頭の投稿に返信の制限を付け、引用の可否は全件へ揃える。

#### Scenario: 返信をフォロー中の人に限る

- **WHEN** 返信できる人を「フォローしている人」にして投稿する
- **THEN** Blueskyの投稿に対応する返信制限を付ける

#### Scenario: 引用を許可しない

- **WHEN** 引用を許可しない設定で投稿する
- **THEN** Blueskyの投稿に引用を受け付けない設定を付ける

### Requirement: BSKY-13 ブックマーク

Bluesky投稿をBlueskyのブックマーク機能へ保存・解除できなければならない（MUST）。保存先はBluesky側とし、Nagi AppViewにBlueskyのURIを保存しない。Nagiのブックマーク画面にはBlueskyの区分を設け、Bluesky側のブックマークを一覧する。Nagiのブックマークのフォルダ機能はBlueskyのブックマークには適用しない。

#### Scenario: Bluesky投稿を保存

- **WHEN** Bluesky投稿のブックマークを押す
- **THEN** Bluesky側に保存し、Nagiのブックマーク画面のBluesky区分に表示する

#### Scenario: 公式アプリで保存した投稿

- **WHEN** Bluesky公式アプリでブックマークした投稿がある
- **THEN** Nagiのブックマーク画面のBluesky区分にも表示する

### Requirement: BSKY-14 Bluesky投稿の通報

他人のBluesky投稿を、Blueskyのモデレーションへ通報できなければならない（MUST）。通報はNagiの運営への通報（MOD-04）とは区別し、送信先がBlueskyであることを示す。通報したことは相手に通知されない。操作はメニューの中に置き、投稿の操作列には出さない。

#### Scenario: 他人の投稿を通報

- **WHEN** Bluesky投稿のメニューから理由を選んで通報する
- **THEN** Blueskyのモデレーションへ送り、送信できたことを伝える

#### Scenario: 自分の投稿

- **WHEN** 自分のBluesky投稿のメニューを開く
- **THEN** 通報の操作を表示しない
