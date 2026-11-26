# Proposal

## Why

Nagi の姉妹アプリとして、リアルタイム音声チャット「Nagi Space」（別リポジトリ `nagi_space`）を作っている。Nagi の投稿に付いた Space のリンクカードやリンクから移動したとき、Nagi Space でハンドルを入力し直さずにログインへ進めるようにしたい。

## What Changes

- 姉妹アプリの許可 origin（`src/lib/sso/links.ts` の `SSO_APPS`）に Nagi Space（`https://space.nagi.suibari.com`。ドメインは仮で、Nagi Space 側の決定待ち）を加える。これにより、Nagi Space へのリンクに閲覧者の DID ヒントが付く（AUTH-06）。
- Nagi Space の SSO チケットの受け口は `/sso`（nagi-passport の既定）。チケットを使う導線（`gotoSsoApp`）は今回は足さない。リンクの DID ヒントだけで、Nagi Space はハンドル入力を省いて認可へ進む。

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `auth-session`：AUTH-06 の許可 origin に Nagi Space を加える。

## 非対象

- Nagi AppView の `PASSPORT_AUDIENCES` への追加（AppView の環境変数の設定で、コードの変更は無い）。チケットの導線を足すときに必要になる。
- Nagi 画面内への「開催中の Space」の表示。

## Impact

- `src/lib/sso/links.ts`（許可 origin の追加）と、そのテスト。
- CSP やリンクの描画への影響は無い（既存の姉妹アプリと同じ扱い）。
