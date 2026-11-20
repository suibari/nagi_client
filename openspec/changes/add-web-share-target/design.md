# Design

## Context

目的と利用者との合意は[提案](proposal.md)、確認条件は[POST-11](specs/post-composer/spec.md)に記す。

現在のmanifestにはshare_targetがなく、`src/service-worker.ts`はPush用でfetch受信を持たない。配信はadapter-staticと限定的なVercel SPA rewriteである。`ComposerHost.showWithText`と`PostModal`には既存本文への追記があるが、Fileの引き渡しと取り込み確認はない。画像選択は`ImageAttachmentPicker`が処理し、通常投稿の上限は4枚である。

POST-04によりこっそりへ切り替えると添付が外れるため、共有画像をそのまま注入すると失われる。POST-06のAppView下書きに画像blobは保存されない。共有の一時保存はこの下書きとは別のライフサイクルにする。

## Goals / Non-Goals

受信POSTからOAuth復帰、通常投稿への取り込みまでを同じoriginの端末内でつなぐ。Push処理、既存の本文seed、投稿API・公開範囲・下書き形式の互換を保つ。

一般のオフラインアプリ化、ページ全体のキャッシュ、サーバー側共有保管、動画受信、ネイティブアプリの追加は行わない。

## Spec Integration Notes

**機能概要**

対応環境にインストールしたNagiを外部アプリの共有先として選び、テキスト・URL・画像を通常投稿へ取り込めるようにする。

| 機能             | 役割                                | 要件ID  |
| ---------------- | ----------------------------------- | ------- |
| 外部共有の受信   | テキスト、URL、画像を通常投稿へ渡す | POST-11 |
| 取り込み前の保護 | 書きかけと公開範囲を確認する        | POST-11 |
| 認証待ちと失敗   | 端末内で一時保持し、失敗を伝える    | POST-11 |

主な利用の流れは、外部アプリで共有 → Nagiを選択 → 必要ならログイン → 取り込み確認 → 通常投稿で編集・範囲確認 → 投稿、とする。

参照目的とリンクは[本設計](design.md)のReferences / Verification Boundaryにまとめる。主仕様への反映時には、この概要・一覧・利用の流れと参照資料も統合する（tasks 3.5）。差分の自動同期対象は以下の追加要件である。

## Decisions

### D1: 画像も本文も同じPOSTで受ける

manifestの`share_target`はaction `/share-target`、method `POST`、enctype `multipart/form-data`とし、title/text/urlと複数画像のfilesを宣言する。acceptは既存の画像選択が宣言するJPEG/PNG/WebP/GIFと揃える。受信後も画像処理で内容と形式を検証し、宣言だけを信用しない。

同一origin・同一path・POSTにだけService Workerのfetch handlerを適用し、FormDataを読み取る。それ以外は従来の通信へ委ねる。共有データを受け取ったらIndexedDBへ保存を完了してから`/share-target?id=<opaque-id>`へ303で移す。GETの受信ページはVercelの限定SPA rewriteとnoindex対象にする。

GETだけの構成は画像を受けられず、サーバー経由は静的構成に受信APIと個人データ保管を増やすため採らない。保存に失敗したPOSTは成功扱いのredirectにせず、再共有を案内する固定のエラー応答を返す。URLに本文、画像名、共有先アカウントの情報を埋めない。

### D2: 受信ごとの端末内一時保存と取り込み完了確認

新しい共有受信用IndexedDB領域に、推測困難なID、受信日時、title/text/url、File群、取り込み状態を格納する。同じキーへ後続共有を上書きせず、受信ページはURLが指定する受信分だけを読む。アプリ全体で無関係な保留共有を自動的に開かない。

OAuth完了前や画面の準備前にSWからpostMessageだけで送る方式では取りこぼすため、永続的な引き渡しを使う。取り込み権は受信IDごとのWeb Locksで確保し、二重タブで同じ受信を適用しない。ロックは画像処理と保存確認まで維持し、ページ終了で解放される。画像処理結果と本文の取り込みは受信IDで冪等にし、反映確認後に成功分の一時データを同一IndexedDBトランザクションで消す。失敗分は再試行・明示破棄できる状態で残す。再読込中の取り込み所有権の回復も検証する。

この保存は受信を投稿画面へ渡すためのものであり、投稿済みや画像を含む下書き保存済みという表示には使わない。取り込み完了後の画像は既存のComposerの状態・離脱確認に従う。自動の保存期限・件数制限を新設して黙って破棄せず、保存容量不足は受信失敗として扱う。

### D3: 通常投稿への取り込みを明示的な操作として分ける

`composer-host.svelte.ts`へ共有受信IDと画像を持つ専用経路を追加し、既存`showWithText`はそのまま保つ。`PostModal`/`Composer`で既存本文・添付・文脈を確認してから適用する。単にモーダルが閉じていることを「入力なし」と判定しない。日記は保持したまま通常ポストを開き、ブログの入力へは触れない。

タイトル・本文・URLを空値と同一値の重複を除いて改行連結し、既存本文には空行を挟んで追記する。画像処理は選択・ペーストと共有で共通化し、待機中の取り込みをbusy時に黙って捨てない。既存の4枚上限と各ファイルの処理エラーを維持する。

受信ページの確認には現在の投稿者と取り込み先を表示する。既存の返信・引用は勝手に解除せず、利用者が新規投稿へ戻すまで待機する。投稿範囲がこっそりなら画像を保留して変更を促す。POST-01の前回値を優先する条件とexternalの権限確認は維持し、共有を理由に範囲を広げない。画像URLの解放は取り込み後の所有者へ渡してから行い、表示中のプレビューを壊さない。

### D4: 認証は既存の復帰先機構に接続する

受信ページはOAuth復元完了を待つ。未ログインなら`setOAuthReturnTo`で受信ID付きの同一origin相対パスを指定して既存ログインへ案内する。callbackの`consumeOAuthReturnTo`経路を使い、別の認証処理を作らない。受信処理は読み込み時のDIDと照合し、切替後へ旧処理を反映しない。未ログインで受信した内容も、取り込み時に現在の投稿者を確認できるようにする。

## Risks / Trade-offs

- OS/ブラウザ、manifest更新、PWAインストール状態で表示可否が変わる → インストール済み対応環境での実機確認を別項目とし、PlaywrightのPOST注入だけで共有メニュー対応済みと主張しない。
- SW未登録・旧SWでは受信POSTを処理できない → 更新済みSWでの受信を受け入れ条件とする。未処理POSTをVercelで成功扱いにしないことも確認する。
- 端末ストレージは消去・制限されうる → 受信失敗と再共有案内を表示し、サーバーに保管されたという保証はしない。
- タブ終了・再読込・同時受信でデータ損失や二重適用が起きうる → 受信ごとの状態管理と完了通知を検証する。Push購読用IndexedDBや通知の更新処理とは分離する。
- 既存の画像選択エラーと共有取り込みのエラーが食い違う → 共通処理を使い、部分成功と再試行時の重複をテストする。

## Migration Plan

受信ページ・保存処理・SW・manifestを同じ変更で公開する。既存PWAは新manifestとSWが反映されてから共有先を使える。新規外部依存やAppView移行は予定しない。

ロールバックはshare_target宣言を外して入口を停止し、既にOSへ登録済みの共有先や保留受信に備えて受信ページの説明と一時保存の読み取り・破棄は保持する。即時にOSの共有一覧から消えるとは保証しない。

## References / Verification Boundary

- [Chrome公式](https://developer.chrome.com/docs/capabilities/web-apis/web-share-target)と[web.dev公式](https://web.dev/articles/files/receive-shared-files)：manifestとPOST受信の技術的根拠。2026-11-20に参照。
- [投稿の設計](../../specs/post-composer/design.md)、[画像の設計](../../specs/media-processing/design.md)、[配信の設計](../../specs/seo-deployment/design.md)：既存入力・画像・SPAの制約。
- [投稿コメント原文](../../reference/comment-snapshot/post-composer.md)と[台帳](../../comment-catalog.json)：導入時の固定履歴への入口。原文や採録コミットのリンクは上書きしない。
- この段階ではソース・設定の読み取りと提案文書の形式検証のみを実施する。OSの共有メニュー、実機インストール、OAuth本番往復、外部リポジトリの動作は未検証。
