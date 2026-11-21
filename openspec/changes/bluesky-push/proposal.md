# Proposal

## Why

[bluesky-interactions](../bluesky-interactions/proposal.md)でBlueskyの通知をNagiの通知画面に表示できるようになるが、Nagiを開いていないと気付けない。Nagiは反応を穏やかに受け取ることを方針としており、Nagiの通知と同じようにBlueskyの反応もPushで届けたい。

## What Changes

2026-11-21に利用者と合意した方針は次のとおり。

- **配信の仕組み**：Nagi AppViewがJetstreamを受信し、Bluesky連携のPushを有効にした利用者宛ての返信・メンション・引用・いいね・リポスト・フォローを見つけて、Web Pushを配信する。利用者が以前作ったSkyPutter（`suibari/bsky_skyputter_pwa_server`）と同じ方式である。
- **初期状態はオフ**：利用者が設定で有効にしたときだけ届く。種類ごとに切り替えられる。
- **1件ずつ配信**：いいねが続いてもまとめず、1件ごとに送る。件数は出さない。
- **本文はNagiの通知と同じ見せ方**：相手の表示名と、返信等の本文または対象投稿の文を入れる。
- **ミュートは反映しない**：Bluesky側でミュートした相手からの操作でもPushが届く。ミュートはBlueskyで非公開の情報で、本人の認証なしにはサーバーから取得できない。反映するには、認証情報をサーバーに持たせる（ログインの仕組みの作り直し）か、ミュート一覧をAppViewに保存する必要がある。どちらも実装が複雑になるため、まずは制約として仕様に明記して許容する。利用者から要望があれば改めて検討する。Nagiの通知タブ（NOTIFY-07）はBluesky側で除外済みの一覧を使うので、ミュートが効く。

対象外とするもの：

- スレッドのミュートとワードミュートの反映（ミュートと同じ理由）。
- DMの通知。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `bluesky-integration`：BSKY-15で、BSKY-01のデータ境界の例外としてPush判定のためのJetstream受信を加える。
- `notifications-unread`：NOTIFY-08（配信と設定）・NOTIFY-09（文面と除外）でBlueskyの通知のPushを追加する。

## Impact

- 外部リポジトリ（Nagi AppView、`bsky-affirmative-bot/guillemot/apps/nagi_appview`）：Bluesky用のJetstream受信、宛先判定、Push配信、利用者ごとの有効化と種類別の設定。今のJetstream受信はNagiのコレクションだけを対象にしており、Blueskyの全投稿・いいねを受けると量が桁違いに増えるため、受信処理を分けるかJetstreamProxyを使う。
- クライアント：通知設定画面にBlueskyの項目、Service Workerの遷移先（Blueskyのタブ・スレッド）。
- 保存されるデータ：Pushを有効にした利用者のDIDと種類別の設定だけ。Blueskyの投稿・表示名は配信のために一時的に取得するだけで保存しない。プライバシーポリシーには、Pushのために公開されているBlueskyの操作を監視することを追記する。
- [bluesky-interactions](../bluesky-interactions/proposal.md)の通知タブ（NOTIFY-07）を前提とする。
