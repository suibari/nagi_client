# Design

## Context

動機は [proposal.md](proposal.md) のWhyを参照する。

- 新規作成は `BlogModal` が `Composer mode="blog"` を包んでいる。記事メタ欄（タイトル・ヘッダー画像・タグ）は `ComposerArticleMeta` が受け持つ。モーダルは `+layout.svelte` に常駐し、一度開いたら書きかけと添付画像のObject URLをリロードまで保持する。
- 編集は `ChatBubble` の `startEdit`/`submitEdit` が担う。`ComposerEditor`・`PostImageEditor`・`LinkCardEditor` を直接組み合わせた別実装で、記事メタ欄を持たない。記事ページは `managementOnly` と `externalTitleEditor` を付けて同じ処理を使う。standard.siteへの反映は `updateStandardSiteDocument` を呼ぶが、tagsを渡さない（BLOG-03の「タグ省略は保持」）。そのため、編集でタグを変える経路がない。
- 編集済み画像は `PostEditImage`（既存blobの `existing` と新規の `new`）で扱う。`Composer` の添付は新規の `ImageAttachment` だけを扱う。
- `ComposerAssistant` は body直下へportalし、`position: fixed` で右下に出る。`reservedHeight` をモーダルの下余白に使っているが、PC幅の広いブログモーダルでは本文やメタ欄と重なる。
- `vercel.json` は `/blog/:did` と `/blog/:did/:rkey` をrewriteしているので、`/blog` 配下に固定パスを足すとDIDと衝突する。
- 記事ページの `load` はAppViewの `getThread` とindexable一覧から記事を探し、どちらにも無ければ404にする。保存直後はAppViewの取り込みが済んでいないことがある。

## Goals / Non-Goals

**Goals:**

- ブログの作成・編集を、1つのページと1つの `Composer` に集約する。
- 編集でもタグ・ヘッダー画像を新規と同じ方法で変えられるようにする。
- おたすけを入力欄と重ならない位置に置く。

**Non-Goals:**

- 通常投稿のモーダルや、通常投稿のその場編集を変えること。
- 公開範囲やBlueskyティーザーを編集で変えること。編集画面ではこれらの操作を出さない。
- 画像を下書きに保存できるようにすること。

## Decisions

### D1: `/write` と `/write/<rkey>` にする

編集できるのは本人の記事だけなので、DIDはURLに入れずセッションから決める。`/blog/new` のような案は、`/blog/:did` のrewriteとプリレンダの例外を足す必要があるため採らない。`/write` 系はアプリ専用ルートとして `200.html` へ流し、noindexを付ける（SEO-05）。

### D2: `Composer` に「既存記事の編集」を持たせる

`Composer` に任意の `editTarget`（読み込んだ記事）を渡せるようにする。渡されたときは次のように振る舞う。

- 初期値として、本文・facet（`restorePostEditState`）・タイトル・既存画像・リンクカード・タグ（documentのtagsから本文のハッシュタグを除いたもの）を入れる。
- 添付は既存画像も扱えるよう、`ImageAttachment` に保存済みの印（`existing`：元の位置とCID）を足し、同じ一覧で持つ。保存時に `PostEditImage` の `existing` へ戻し、アップロードし直さない。ヘッダー画像の印（`header`）は、旧来どおり「本文に置かれていない先頭の画像」を初期値にする。
- 保存は `updatePost` と `updateStandardSiteDocument` に分ける。tagsは「本文のハッシュタグ ∪ 記事メタ欄」を明示的に渡す（BLOG-03の置き換え）。
- 編集の対象は `site.standard.document` だけとする。`com.suibari.nagi.post` だけの旧形式の記事は現存しないことを利用者に確認した（2026-11-16）ため、編集画面では扱わない。既存の読み取り側の互換処理はこのchangeでは削除しない。
- 公開範囲のゲージ、Blueskyクロスポスト、下書き一覧と下書きの自動保存は出さない。

`ChatBubble` の記事用の編集処理（画像URL対応、alt移動、`syncStandardSiteDocument` の記事分岐など）は `Composer` 側へ移す。`ChatBubble` は記事なら `/write/<rkey>` へ遷移するだけにする。通常投稿のその場編集は残す。

検討した代替案：

- **編集用に別コンポーネントを作り、`ComposerArticleMeta` だけ共有する**：変更は小さいが、本文の画像配置やalt同期の処理が2か所に残る。タグが編集できなかったのもこの二重化が原因なので、採らない。

### D3: 保存後の楽観表示

保存が成功したら、保存した記事の表示用データ（text・facets・images・linkCards・cid）とタグを `savedArticles`（`src/lib/blog/saved-articles.svelte.ts`）に登録し、記事ページへ `goto` する。記事ページは、AppViewのthreadのcidが保存したcidと一致するまで、この楽観データを優先して表示する。`load` がthreadもindexable一覧も得られなかった場合でも、楽観データがあれば404にしない。新規作成の一覧向け楽観表示（`optimisticPosts.blogs`）は今の動きを保つ。

### D4: 離脱の確認

ページ内の遷移は `beforeNavigate` で、タブを閉じる・リロードは `beforeunload` で確認する。「変更がある」は、新規なら入力済みの内容があること、編集なら読み込んだ時点の値（本文・タイトル・タグ・画像の並び）と違うことで判定する。保存成功による移動は確認の対象から外す。

### D5: おたすけの配置

`ComposerAssistant` に配置の指定（`placement: 'floating' | 'inline'`）を足す。執筆ページでは、PC幅（1024px以上）では右カラムの記事メタ欄の下に `inline` で置き、カラムごとstickyにする。portalは使わない。スマホ幅では従来の `floating` とし、`reservedHeight` の分だけページ下にpaddingを入れる。ポストのモーダルは今のまま `floating` を使う。

## Risks / Trade-offs

- `Composer` がさらに大きくなる。編集時の初期化は `src/lib/blog/edit-target.ts` に切り出し、`Composer` には保存の分岐だけを置いた。
- ページ化すると、離れた時点で添付画像が失われる。離脱の確認（D4）で補う。
- 楽観表示のデータは、記事ページでAppViewのcidが追いついた時点で破棄する。追いつく前に離れた場合はリロードまで残るが、表示に使うのはcidが一致しない間だけである。
- `updatePost` は、1MBを超える先頭画像をカバーにしようとすると保存を止めていた。新規作成ではカバーを付けないだけで記事は出していたので、編集も同じ扱いに揃えた。ヘッダー画像は1MB未満に圧縮して付けるので、この差が出るのはヘッダーが無く、本文の大きな画像が先頭にある場合だけである。
