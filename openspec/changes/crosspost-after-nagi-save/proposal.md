# Proposal

## Why

Bluesky投稿の要求権限はcreate限定と決めている。一方、現行の通常クロスポストはBlueskyのコピーを先に作り、Nagi保存が失敗するとそのコピーを削除して巻き戻そうとする。この削除は権限上拒否されうるうえ、削除権限を足して成立させることは方針に反する（[GAP-01](../../known-gaps.md#gap-01)）。Nagiに保存してからBlueskyへ出す順序に変えれば、削除による補償そのものが不要になる。

コピーを先に作る理由は、Nagi投稿へ後からコピー参照を書き足すとAppViewが「編集」とみなし、翻訳や判定をやり直すためだった。AppViewの編集判定を「利用者に見える内容が変わったか」で行う定義へ改めれば、この制約は解消する。`crosspost` だけを例外扱いするのではなく、編集の定義を内容の差分に寄せることで、将来の付帯情報にも同じ規則を当てはめられる。

## What Changes

- 通常投稿のクロスポストを「Nagi保存 → Bluesky作成 → Nagi投稿へのコピー参照の追記」の順に改める。記事ティーザーと同じ順序になる。
- Nagi保存に失敗した場合はBlueskyへ何も作らない。Blueskyのコピーを削除する処理（巻き戻し）を廃止する。
- Bluesky作成の失敗、分割投稿の途中失敗、参照追記の失敗は、Nagi投稿を成功のまま保ち警告として伝える。途中まで作られたBlueskyのコピーは削除しない。
- AppViewへの契約として、表示内容（本文・facets・embed・言語・CW・ラベル等）が変わらない更新を「編集」とみなさず、編集済み表示・翻訳・bot判定・通知をやり直さないことを求める。
- Bluesky投稿の権限はcreate限定のまま維持する。権限の変更はない。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `bluesky-integration`: BSKY-06の作成順序を「コピー先行」から「Nagi保存後」へ変更し、削除による補償を廃止する。各失敗時の扱いを定める。
- `appview-protocol`: 表示内容が変わらない更新を編集とみなさない、という取り込み側の契約を追加する（API-09）。

## Impact

- クライアント：通常投稿の送信処理（Composer）、クロスポスト処理（`src/lib/crosspost/bluesky.ts`）、Nagi投稿へ参照を追記する保存処理（`src/lib/atproto/records.ts`）。`deleteBlueskyPosts` は呼び出し元がなくなり削除する。
- AppView（別リポジトリ）：投稿更新時の編集判定、翻訳・bot判定・通知の再実行条件。クライアントの順序変更より先に本番へ反映されている必要がある。
- 仕様書：`bluesky-integration` のspec/design、`appview-protocol` のspec/design、`known-gaps.md` のGAP-01。
- 権限・依存関係：変更なし。
- 非対象：記事（standard.site）のティーザー順序、こっそり投稿、他人の投稿へのクロスポスト拡張、既存の孤立コピーの掃除、Bluesky側コピーへのNagi URLの追加。
