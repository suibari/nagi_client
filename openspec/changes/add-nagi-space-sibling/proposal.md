# Proposal

## Why

Nagi の姉妹アプリとして、リアルタイム音声チャット「Nagi Space」（別リポジトリ `nagi_space`、`https://nagi-space.suibari.com`）を作っている。Nagi の投稿に付いた Space のリンクカードやリンクから移動したとき、Nagi Space でハンドルを入力し直さずにログインへ進めるようにしたい。

今の AUTH-06 は、許可した姉妹アプリすべてに DID ヒントを付け、クリック時にチケットを取りに行く。ところが Nagi Space は本人の PDS 経由の API（ミュート一覧・通報・シェア）を呼ぶため、チケットがあっても必ず自分の OAuth 認可を通る。チケットでは手間が減らず、AppView の `PASSPORT_AUDIENCES` の設定と、アプリごとの受け口のパスだけが増える。また、チケットの受け口のパス（`/api/sso/`）はお部屋向けの値が全アプリで共通になっており、お部屋以外にチケットを使うと受け口が見つからない。

そこで姉妹アプリの連携を、次の規則にそろえる。

> DID ヒントは許可した姉妹アプリすべてに付ける。チケットは、チケットだけでサインインが完結するアプリ（DID だけで足りるアプリ）にだけ使い、受け口のパスはアプリごとに持つ。

今はお部屋がチケットを使い、Nagi Space は DID ヒントだけを使う。

## What Changes

- 姉妹アプリの許可 origin（`src/lib/sso/links.ts` の `SSO_APPS`）に Nagi Space（`https://nagi-space.suibari.com`）を加える。Nagi Space へのリンクに閲覧者の DID ヒントが付く。
- チケットを使うアプリと受け口のパスを、DID ヒントの許可 origin とは別に持つ（今はお部屋の `/api/sso/` だけ）。チケットを使わないアプリ宛のクリックは横取りせず、`?did=` 付きのリンクのままブラウザに任せる。
- お部屋の振る舞いは変わらない。

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `auth-session`：AUTH-06 の許可 origin に Nagi Space を加え、チケットを使う先を「チケットだけでサインインが完結するアプリ」に限る。

## 非対象

- Nagi AppView の `PASSPORT_AUDIENCES` への追加（Nagi Space はチケットを使わないので不要）。
- Nagi 画面内への「開催中の Space」の表示。

## Impact

- `src/lib/sso/links.ts` と、そのテスト（`src/lib/sso/links.test.ts`）。
- CSP やリンクの描画への影響は無い（既存の姉妹アプリと同じ扱い）。
- Nagi Space 側は、共有 URL（`/s/<id>?did=`）とトップの DID ヒントでハンドル入力を省いて認可へ進む（nagi_space の change `drop-sso-ticket`）。
