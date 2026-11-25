# Spec Delta

## MODIFIED Requirements

### Requirement: POST-01 投稿範囲の単一軸

投稿範囲はkossori→feed→externalの排他的3段階でなければならない（MUST）。独立トグルの組み合わせが分かりにくかったため1本のゲージに統合した。記事公開は範囲の軸に含めず、書き方のblogタブで選ぶ。前回選択を優先し、未保存の / と /feed はkossori、それ以外はfeedを既定にする。

feedの表示名は、投稿範囲モーダルと送信欄の投稿範囲ボタンで日本語は「Nagiに」、英語は「Nagi」に揃えなければならない（MUST）。公開投稿へのこっそり返信を止める案内にも、同じ表示名を使わなければならない（MUST）。

#### Scenario: 未保存のホーム投稿

- **WHEN** /feedで新規投稿を始める
- **THEN** kossoriを初期選択する

#### Scenario: 外部権限の確認待ち

- **WHEN** 前回externalでreadinessが未確定
- **THEN** externalを保ち、利用不能確定後だけfeedへ狭める

#### Scenario: 投稿範囲を選択して確認する

- **WHEN** 投稿範囲モーダルでfeedを選ぶ
- **THEN** モーダルの選択肢と送信欄の投稿範囲ボタンが、日本語では「Nagiに」、英語では「Nagi」と表示される

#### Scenario: こっそりで公開投稿に返信できない案内

- **WHEN** こっそりで書きかけがある状態で公開投稿を返信先にする
- **THEN** 投稿範囲を日本語では「Nagiに」、英語では「Nagi」へ切り替えるよう案内する
