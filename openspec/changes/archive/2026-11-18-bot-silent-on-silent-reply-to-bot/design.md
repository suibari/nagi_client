# Design

## Context

- クライアントは返信のときbotたんサイレントのボタンを出さず、送信時も返信では `botSilent` を常に偽にしている。サイレントリプライ（`silentReply`）は返信のときだけ付く。
- botたんが返信を積むかどうかは bot-runtime の `decideNagiReplyJob` が一か所で決める。`botSilent` が真なら返信でも積まない。返信先がbotたん、または本文でbotたんをメンションしていると「botたん宛て」になる。こっそり投稿はAppViewの作成経路が `botSilent` を見て判断する。（bsky-affirmative-bot `06c1fe06` で確認）
- `silentReply` はAppViewの通知判定だけが見ており、botの返信判定には使われていない。
- 投稿がbotたんのものかは AppView が `PostView.isBot` で示す。クライアントはbotのDIDを持たない。

## Decisions

### D1: クライアントで `botSilent` を付ける

返信先がbotたん（`replyTarget.post.isBot`）でサイレントリプライがONのとき、レコードへ `botSilent: true` を付ける。bot側で「`silentReply` かつ親がbot」を判定する案もあるが、bot側の判定は既に `botSilent` に集約されており、レコードを見ればbotたんが返事をしない理由がそのまま読める。別リポジトリの変更とデプロイ順序も要らない。

### D2: 判定は直接の返信先だけ

サイレントリプライが通知を抑えるのは直接の返信先だけなので、botたんサイレントとみなす条件も直接の返信先に揃える。本文でbotたんをメンションした返信は対象外とする。

### D3: 説明文で伝える

返信先がbotたんのときは、サイレントリプライのボタンの説明文（tooltip・aria-label）でbotたんも返信しないことを示す。ボタンを増やさない。

## Risks

- `isBot` が取れない返信先（AppViewの応答に無い場合）は偽として扱い、従来どおり `botSilent` を付けない。botたんが返事をするだけで、公開範囲は変わらない。
