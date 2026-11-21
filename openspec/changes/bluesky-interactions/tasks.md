# Tasks

## 1. 権限と再認可

- [x] 1.1 `src/lib/oauth/client.ts`のBluesky連携scopeに、投稿のcreate/delete、like・repost・threadgate・postgateの必要なaction、通知・ミュート・ブックマーク・通報のrpcを足す。update・block・followを含まないことをテストで確認する。
- [x] 1.2 nagi-lexicon（`bsky-affirmative-bot/guillemot/packages/nagi-lexicon`）の`NAGI_BLUESKY_VIEW_SCOPES`等を同じ内容に揃える。既存の`oauthScope.test.ts`を通す。
- [x] 1.3 操作の権限の付与判定と、操作時の再認可案内を実装する（AUTH-08）。閲覧だけの旧セッション、再認可のキャンセルをモック認証で確認する。

## 2. いいね・リポスト

- [x] 2.1 mapViewに`repostedByMe`と取り消し用の自分のレコードURIを足す。件数を表示型に持たないことをテストで確認する。
- [x] 2.2 投稿URIを鍵にした操作状態のストアと、楽観切替・失敗時の巻き戻し・処理中の重複防止を実装する。
- [x] 2.3 `BskyPostCard.svelte`に操作列（返信・リポスト／引用・いいね・メニュー）を置く。Nagiのリアクションと見た目を分け、件数を出さないことを確認する。

## 3. 返信・引用・削除

- [x] 3.1 Bluesky専用モードでは下書きの自動保存・手動保存を行わず、本文や添付がある状態で閉じるときに破棄の確認を出す（2026-11-21に合意）。Nagi AppViewの下書きAPIが呼ばれないこと、確認でキャンセルすると入力が残ることを操作テストで確認する。
- [x] 3.2 `composerHost`に`openBskyReply`／`openBskyQuote`を追加し、ポストモーダルにBluesky専用の入力欄（投稿先の表示、こっそり等の非表示）を足す。NagiのComposerとは別の部品にした理由はdesign D3に記す。
- [x] 3.3 `crosspost/bluesky.ts`の分割・facet・埋め込み処理を、返信先と引用を指定して呼べるようにする。`via: "Nagi"`を付けることを確認する。
- [x] 3.4 返信先の削除済み・返信不可の場合に入力を残して止めることを確認する。
- [x] 3.5 `via: "Nagi"`を持つ自分の投稿にだけ削除の操作を出す。Nagi投稿の削除確認に「Blueskyのコピーも削除する」（初期オフ）を足し、分割分を全件削除する。部分失敗の警告を確認する。
- [x] 3.6 削除の呼び出しが明示操作の経路以外から呼ばれないこと（クロスポストの失敗処理に削除がないこと）をテストで確認する。

## 4. 通知タブ

- [x] 4.1 ナビゲーションの未読バッジにBlueskyの未読を含めない方針を利用者と合意した（2026-11-21）。Blueskyタブに未読の印を付ける。
- [x] 4.2 通知画面にNagi／Blueskyのタブを追加し、`listNotifications`の取得・ページング・`updateSeen`を実装する。連携していない利用者にはタブを出さない。
- [x] 4.3 対象6種の表示、件数の表現を使わない個別表示、年齢保護を実装する。クロスポストのコピーから元のNagi投稿への移動は見送った（2026-11-21、design D5）。
- [x] 4.4 取得失敗時に一覧を残し、Nagiのタブに影響しないことを確認する。

## 5. ミュート・返信と引用の許可・ブックマーク・通報

- [x] 5.1 投稿メニューに作者のミュート・スレッドのミュートを追加する。自分には出さない。
- [x] 5.2 Blueskyへ投稿するComposer（クロスポスト・Bluesky専用モード）に返信できる人と引用の可否の設定を足し、threadgate／postgateを作る。分割スレッドでの付け方を確認する。
- [x] 5.3 Nagi経由の自分のBluesky投稿について、投稿後に設定を変更できるようにする（削除して作り直す）。
- [x] 5.4 Blueskyのブックマークの保存・解除と、Nagiのブックマーク画面のBluesky区分を実装する。
- [x] 5.5 Bluesky投稿の通報をメニューに追加する。送信先がBlueskyであることを示し、自分の投稿には出さない。

## 6. 文書と検証

- [ ] 6.1 主仕様（bluesky-integration・auth-session・notifications-unread）・各design.md・known-gaps.md（GAP-01の経緯）を実装と一致させる。`BskyPostCard.svelte`・`mapView.ts`・`oauth/client.ts`の閲覧専用・作成のみの旧コメントを更新する。
- [ ] 6.2 `npm run check`、関連Vitest、`npm run build`、操作のPlaywrightテストを実行し、結果をverification.mdに記録する。本番のBlueskyでの確認と、モックでの確認を区別する。
- [ ] 6.3 `npx --yes @fission-ai/openspec@1.17.0 validate --all --strict --no-interactive`と`node openspec/tools/comment-catalog.mjs --check`を実行する。
