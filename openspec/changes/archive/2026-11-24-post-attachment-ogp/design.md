# 投稿の共有画像の配信設計

## Context

スレッドURLは `/api/spa` へ rewrite され、`withPostCardMeta` が `og:image` と `twitter:image` に同じ投稿カードURLを入れる。画像の要求時に `api/post-card.tsx` が公開の `getThread` で投稿を取得し、こっそりとその他の保護条件を判定する。クライアントの `PostView` は画像の `url`、動画の `thumbnail`、添付ごとの `contentWarning` を定義している。 [現行の設計](../../../specs/seo-deployment/design.md#d2-共有先にも非公開の境界を適用する) [導入時コメント原文](../../../reference/comment-snapshot/seo-deployment.md)

## Goals / Non-Goals

同じスレッドURLから添付ベースの共有画像を取得できるようにし、HTMLの配信経路と投稿の公開判定を共用する。対象範囲は [提案書](proposal.md) に記載する。

## Decisions

### 投稿カードの画像要求時に添付を選ぶ

スレッドHTMLは従来どおり同一オリジンの投稿カードURLを指す。通常投稿用のURLはバージョンを更新し、画像形式が変わり得るためHTML内の固定の `og:image:type` と寸法を外す。画像レスポンスの `Content-Type` は実際の形式に合わせる。画像と動画が同時に添付できるNagiでは、フィードの表示順に合わせて画像から選び、次に動画のサムネイルを試す。動画の表示方法はBlueskyの共有画像の実装に合わせる。 [Blueskyの実装差分](https://github.com/bluesky-social/social-app/pull/9877/files)

HTMLに添付のURLを直接設定する案では、HTML配信時に投稿の取得が増え、共有先が添付を取得できなかった際にNagiで従来カードへ戻せない。画像を配信する関数で選ぶことで、投稿の取得と既存のフォールバックを共用できる。

### 公開条件を確認してから配信元にアクセスする

公開の `getThread` から対象投稿を取得し、既存のこっそりと本文の公開保護をそのまま添付にも適用する。保護対象の投稿ではメディア取得を開始しない。通常投稿自身の `images` と `video.thumbnail` だけを候補とし、個別CWがある添付は除く。

画像は既存のNagi/AppViewのblob proxy、動画サムネイルは本番AppViewの `/api/video/…/thumbnail.jpg` と既存の `video.bsky.app` のサムネイル経路に絞る。候補URLのオリジンとパスを照合し、配信に必要なリダイレクトがあれば許可した宛先に限って追う。取得には時間・サイズの上限を設け、対応する画像形式だけを返す。画像の取得が失敗すれば次の候補を試し、総時間の上限までに取得できなければ従来の描画経路へ戻る。

## Risks / Trade-offs

- 投稿が削除されたり添付が警告の対象になったりする場合に備え、新バージョンの通常投稿カード画像は共有キャッシュへ保存せず、画像要求ごとに公開条件を確認する。外部サービスがリンクカードに保存済みの画像は、そのサービスの保存期間に従う。 [Blueskyのリンクカードの保存方式](https://bsky.network/docs/about-bluesky-content/posts/#website-card-embeds)
- 添付で取得できるURL形式とリダイレクト先はAppViewや配信元に依存する。コードに記載される既存経路を基準にし、本番でのURL形式と共有先の取得は実装時の確認項目にする。

## Migration Plan

通常投稿向け共有画像の新バージョンはクライアントの配信と同時に有効にする。投稿データの移行は不要。従来バージョンの画像URLは従来のカードを配信し、必要ならHTMLからの参照先を従来バージョンへ戻せる。

## 参照資料

- 画像URLと画像形式のメタデータ定義を確認する。 [Open Graph protocol](https://ogp.me/)
