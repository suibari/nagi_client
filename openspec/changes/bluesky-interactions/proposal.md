# Proposal

## Why

NagiではBlueskyのフィードを読めるが、読んだ投稿に返信・いいね・リポスト・引用できず、Bluesky側で受けた反応にも気付けない。応じるたびにBlueskyのアプリへ移る必要がある。Nagiの方針（人と比べる数値を出さない、静かに反応を受け取る）を保ったまま、Blueskyでのやり取りをNagi内で完結できるようにする。

## What Changes

2026-11-21に利用者と合意した方針は次のとおり。

- **いいね・リポスト**：Bluesky投稿に対して付け外しできる。表示するのは自分がしたかどうかだけで、件数はどこにも出さない。
- **返信・引用の投稿先**：返信・引用する相手の投稿で決まる。Bluesky投稿へはBlueskyだけに投稿し、Nagi投稿へは従来どおりNagiに投稿する（クロスポストの既存条件はBSKY-04のまま）。Blueskyタブで見た自分のクロスポストのコピーへ返信した場合もBlueskyへ投稿する。
- **削除**：Bluesky投稿の権限を作成と削除に広げる（更新は要求しない）。GAP-01で確定した「作成のみ」の方針を改める。削除できるのはNagi経由で作った投稿（`via: "Nagi"`）だけとし、Nagi投稿を削除するときは確認画面でBlueskyのコピーも消すか選べる。失敗時に自動で消して巻き戻すことは引き続き行わない。
- **通知**：通知画面にBlueskyのタブを足し、BlueskyのAPIから通知を一覧する。返信・メンション・引用・いいね・リポスト・フォローを対象とし、数値の集計表示はしない。
- **ミュート**：Bluesky投稿の作者とスレッドをミュートでき、Bluesky側の設定に保存する。
- **返信・引用の許可**：Blueskyへ投稿するときに、返信できる人と引用の可否を設定できる（threadgate／postgate）。
- **ブックマーク**：Bluesky投稿をBluesky自身のブックマーク機能へ保存し、Nagiのブックマーク画面にBlueskyの区分を足して見せる。
- **通報**：Bluesky投稿をBlueskyのモデレーションへ通報できる。

対象外とするもの：

- ブロック・フォロー・Bluesky内のプロフィール画面。Nagiの思想と合わず、ボタンがあること自体に違和感があるため。プロフィールは今のままbsky.appへのリンクとする。
- DM、ワードミュートの編集、Blueskyでの検索。
- BlueskyのPush通知は別change [bluesky-push](../bluesky-push/proposal.md) で扱う。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `bluesky-integration`：BSKY-01（データ境界）・BSKY-04（クロスポストの可否）・BSKY-06（権限と補償）を改め、BSKY-08〜14（いいね・リポスト、返信・引用、削除、ミュート、返信と引用の許可、ブックマーク、通報）を追加する。
- `auth-session`：AUTH-03の権限範囲を広げ、AUTH-08で既存セッションの再認可を扱う。
- `notifications-unread`：NOTIFY-07でBlueskyの通知タブを追加する。

## Impact

- クライアント：`src/lib/oauth/client.ts`のscope、`src/lib/bsky/`（agentに書き込み・通知・ミュート・ブックマーク・通報の呼び出しを追加、mapViewに`repostedByMe`等）、`BskyPostCard.svelte`の操作列、共通Composerへの「Blueskyだけに投稿」モード、通知画面のタブ、ブックマーク画面、Nagi投稿の削除確認。
- 外部リポジトリ：nagi-lexiconの`NAGI_BLUESKY_VIEW_SCOPES`等の権限定義を揃える（`bsky-affirmative-bot/guillemot/packages/nagi-lexicon`）。Nagi AppViewのAPI変更はない。
- 既存利用者は新しい権限を持っていないため、再認可が必要になる。再認可するまでは閲覧だけが今までどおり使える。
- 文書：known-gaps.mdのGAP-01に方針変更の経緯を追記する。プライバシーポリシーへの影響はない（Nagi AppViewにBlueskyのデータを保存しない）。
