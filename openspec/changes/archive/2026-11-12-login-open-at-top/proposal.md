# Proposal

## Why

ランディング上部と参加の締め（JoinFinale）の「Nagiをはじめる」は `/login#signup` へ移動し、ログイン画面の「はじめての方」の位置までスクロールした状態で開く。スマホでは、既存アカウント向けのハンドル入力とログインボタンが画面外の上側に隠れる。Blueskyのアカウントを持つ利用者から「登録のボタンしか見えず、誤って『はじめての方』から登録してしまった」という報告があった（2026-11-12）。

Nagiの利用者はほぼBlueskyから来るので、既存アカウントでのログインを最初に見せる方が合う。

## What Changes

- ランディングとJoinFinaleの参加ボタンの移動先を `/login` にし、ログイン画面を常に先頭から表示する。
- ログイン画面の「はじめての方」の節から `id="signup"` を外す。外部に残る `/login#signup` も先頭から表示する。
- ボタンの文言、ログイン画面の並び順と文言は変えない。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `auth-session`：AUTH-07（ログイン画面の初期表示）を追加する。

## Impact

- クライアント：`src/lib/components/landing/Landing.svelte`、`src/lib/components/JoinFinale.svelte`、`src/routes/login/+page.svelte`、`src/lib/guest-posts/privacy.test.ts`。
- AppView・lexicon・保存データ：変更なし。
- 非対象：ログイン画面の構成の見直し（2つの入口を最初の画面に並べる案）は、別のchangeで検討する。自動ログアウトの報告は原因の調査を続け、このchangeでは扱わない。
