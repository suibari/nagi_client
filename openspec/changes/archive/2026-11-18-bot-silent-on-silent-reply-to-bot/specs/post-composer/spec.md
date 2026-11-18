## ADDED Requirements

### Requirement: POST-10 botたんサイレントとサイレントリプライ

返信でない新規投稿では、botたんサイレントを選べなければならない（MUST）。ONで投稿すると `botSilent: true` を保存し、botたんはその投稿に返信しない。返信では代わりにサイレントリプライを選べる。ONで返信すると `silentReply: true` を保存し、直接の返信先へ返信の通知を送らない。直接の返信先がbotたんの投稿でサイレントリプライをONにした返信は、botたんサイレントと同じく `botSilent: true` も保存し、botたんは返信しない。このときボタンの説明文でbotたんも返信しないことを示す。編集ではどちらも変更できない。

#### Scenario: botたんへのサイレントリプライ

- **WHEN** botたんの投稿に、サイレントリプライをONにして返信する
- **THEN** 返信に `silentReply: true` と `botSilent: true` を保存し、botたんはその返信に返事をしない

#### Scenario: 他の人へのサイレントリプライ

- **WHEN** botたん以外の投稿に、サイレントリプライをONにして返信する
- **THEN** 返信に `silentReply: true` だけを保存し、`botSilent` は付けない

#### Scenario: botたんへの通常の返信

- **WHEN** botたんの投稿に、サイレントリプライをOFFのまま返信する
- **THEN** `silentReply` も `botSilent` も付けず、botたんは従来どおり返事をする

#### Scenario: こっそりでbotたんへサイレントリプライ

- **WHEN** botたんの投稿に、こっそりでサイレントリプライをONにして返信する
- **THEN** こっそり投稿の作成にも `botSilent: true` を渡し、botたんは返事をしない
