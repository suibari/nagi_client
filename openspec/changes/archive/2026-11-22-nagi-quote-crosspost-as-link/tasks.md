# Tasks

## 1. 貼り付けとリンクカード（POST-07）

- [x] 1.1 `QuotePick`で、引用できない相手（`forbidden`）と分かったら、カーソル位置へURLを文字として入れ、エラーを出さない。`notFound`は従来どおりとする。
- [x] 1.2 本人以外のNagiスレッド URL を、リンクカードの対象から外す（`linkCardAllowed`、`LinkCardEditor`）。botたんの投稿は`isBot`で判定し、判定できるまではカードを付けない。ブログとBluesky専用の入力欄にも同じ判定を使う。
- [x] 1.3 単独貼り付け・カード判定を単体テストで確認する（`quote-pick.test.ts`、`link-card-allowed.test.ts`）。

## 2. クロスポストの可否（BSKY-04）

- [x] 2.1 `Composer.svelte`の`externalEligible`を改め、引用ありでもクロスポストを選べるようにする。引用先がこっそり投稿なら選べない。返信の条件と、返信と引用の同時外部化の禁止は変えない。理由の文言を返信と引用で分ける。
- [x] 2.2 引用先のコピーが消えている、または確かめられない場合は、送信を止めずにリンクカードへ切り替える。返信は従来どおり止める。
- [x] 2.3 ニュースの引用は共通Composerから投稿しているため、2.1でクロスポストを選べるようになる。使われていなかった`NewsQuote`を削除する。
- [x] 2.4 ラジオの引用（`quoteTarget.radio`）は曲ページへのリンクとしてクロスポストできる。曲ページが無い回は選べない。

## 3. 埋め込みの組み立て（BSKY-05）

- [x] 3.1 `crosspost/quote-link.ts`で引用先のリンク先（スレッドページ・ニュースページ・曲ページ）を決め、既存のリンクカード取得でメタデータとサムネイルを取る。取得失敗でもホスト名で出す。
- [x] 3.2 画像・動画があるときは、引用先のURLを本文の末尾に空行で区切って足し、分割前にfacetを付ける。
- [x] 3.3 引用のカードを本文のリンクカードより優先する。コピーがある場合は従来どおり`embed.record`／`recordWithMedia`にする。
- [x] 3.4 組み合わせを単体テスト（`bluesky.test.ts`、`quote-link.test.ts`）とe2e（`crosspost-thread.spec.ts`）で確認する。

## 4. 文書と検証

- [x] 4.1 確認が要る細部（ブログでの扱い、貼り付け時の案内）を利用者に確認し、差分仕様へ反映した（2026-11-22）。
- [x] 4.2 主仕様（bluesky-integration・post-composer・news-chronicle）、各`design.md`、known-gaps.mdを実装と一致させる。
- [x] 4.3 型チェック・単体テスト・e2e・`openspec validate --all --strict`を通す。型チェックの`node:fs`型エラー23件と、e2eのchronicle・guest-heroの6件の失敗は変更前から同じく起きる。
