# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: POST-10 botたんサイレントとサイレントリプライ`
- TO: `### Requirement: POST-10 返信できる人`

## MODIFIED Requirements

### Requirement: POST-10 返信できる人

公開範囲モーダルでは、公開範囲に関わらず、Nagiの投稿に返信できる人を **誰でも**・**botたんのみ**・**返信不可** から選べなければならない（MUST）。新規投稿・返信・ブログ・3行日記で選べ、通常の投稿と3行日記の入力は同じ選択を共有する。3行日記では日記レコード（`com.suibari.trilinesat.diary`）に `replyGate` を保存し、`botSilent` は付けない。「botたんのみ」は `replyGate: "bot"` を保存し、投稿者本人とbotたん以外の返信を受け付けない。「返信不可」は `replyGate: "nobody"` と `botSilent: true` を保存し、投稿者本人以外の返信を受け付けず、botたんも返事をしない。「誰でも」はどちらも付けない。選んだ値はブラウザに保存して次の投稿の初期値にし、保存がなければ「誰でも」とする。投稿後は編集でも変更できない。

#### Scenario: 返信不可で投稿

- **WHEN** 返信できる人を「返信不可」にして投稿する
- **THEN** 投稿に `replyGate: "nobody"` と `botSilent: true` を保存し、botたんも他の利用者も返信できない

#### Scenario: botたんのみで投稿

- **WHEN** 返信できる人を「botたんのみ」にして投稿する
- **THEN** 投稿に `replyGate: "bot"` だけを保存し、botたんは従来どおり返事をする

#### Scenario: 3行日記を返信不可で書く

- **WHEN** 3行日記の入力で返信できる人を「返信不可」にして書く
- **THEN** 日記レコードに `replyGate: "nobody"` を保存し、botたんも他の利用者も返信できない

#### Scenario: 選択の引き継ぎ

- **WHEN** 「返信不可」で投稿した後に、新しい投稿を始める
- **THEN** 返信できる人の初期値は「返信不可」になる

## ADDED Requirements

### Requirement: POST-12 サイレントリプライと送信欄の表示

返信では、公開範囲モーダルでサイレントリプライを選べなければならない（MUST）。ONで返信すると `silentReply: true` を保存し、直接の返信先へ通知しない。直接の返信先がbotたんなら `botSilent: true` も保存し、botたんは返信しない。このことをトグルの説明文で示す。サイレントリプライは保存せず、返信先が変わるとOFFへ戻す。送信ボタンの横には返信の設定のボタンを置かず、制限やサイレントリプライが有効なときは公開範囲ボタンに示す。こっそりスレッドへの返信でもモーダルを開け、公開範囲は固定のまま返信の設定だけを選べる（POST-02）。編集では変更できない。

#### Scenario: botたんへのサイレントリプライ

- **WHEN** botたんの投稿に、サイレントリプライをONにして返信する
- **THEN** 返信に `silentReply: true` と `botSilent: true` を保存し、botたんはその返信に返事をしない

#### Scenario: 他の人へのサイレントリプライ

- **WHEN** botたん以外の投稿に、サイレントリプライをONにして返信する
- **THEN** 返信に `silentReply: true` だけを保存し、`botSilent` は付けない

#### Scenario: botたんへの通常の返信

- **WHEN** botたんの投稿に、サイレントリプライをOFF・返信できる人を「誰でも」のまま返信する
- **THEN** `silentReply` も `botSilent` も `replyGate` も付けず、botたんは従来どおり返事をする

#### Scenario: こっそりでbotたんへサイレントリプライ

- **WHEN** botたんの投稿に、こっそりでサイレントリプライをONにして返信する
- **THEN** こっそり投稿の作成にも `botSilent: true` を渡し、botたんは返事をしない

#### Scenario: サイレントリプライは引き継がない

- **WHEN** サイレントリプライをONにして返信した後に、別の投稿へ返信を始める
- **THEN** サイレントリプライはOFFから始まる

#### Scenario: 制限中の目印

- **WHEN** 返信できる人を「返信不可」にしている
- **THEN** 送信欄の公開範囲ボタンに、返信を制限していることを示す
