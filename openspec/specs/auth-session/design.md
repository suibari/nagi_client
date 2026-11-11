# auth-session：設計判断・コメント出典

この文書は初期仕様化時点のコメント原文を保存する設計資料である。現在の振る舞い・検証条件は [spec.md](spec.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/oauth/client.ts

<!-- source: src/lib/oauth/client.ts:4 -->

### [src/lib/oauth/client.ts:4](../../../src/lib/oauth/client.ts#L4)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/** Bluesky が提供する PDS 群の共通 OAuth / アカウント作成入口。 */
```

<!-- source: src/lib/oauth/client.ts:7 -->

### [src/lib/oauth/client.ts:7](../../../src/lib/oauth/client.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/** クロスポスト対象コレクション。付与判定の前方一致にも使う。 */
```

<!-- source: src/lib/oauth/client.ts:9 -->

### [src/lib/oauth/client.ts:9](../../../src/lib/oauth/client.ts#L9)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// Nagi は Bluesky 投稿を作成するだけで、更新・削除は一切行わない（cf. crosspost/bluesky.ts）。
// action 未指定は create/update/delete 全許可になるため、明示的に create のみへ絞る。
```

<!-- source: src/lib/oauth/client.ts:13 -->

### [src/lib/oauth/client.ts:13](../../../src/lib/oauth/client.ts#L13)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// Bluesky のカスタムフィードをタブで読むための権限。クロスポストと同じオプトインでまとめて要求する
// （同意の導線を増やさない）。PDS へ atproto-proxy 付きで投げるので aud は Bluesky AppView だが、
// bare aud で照合する旧 PDS のため既存の rpc と同じく wildcard にする。
// 真実源は nagi-lexicon の NAGI_BLUESKY_VIEW_SCOPES。
```

<!-- source: src/lib/oauth/client.ts:19 -->

### [src/lib/oauth/client.ts:19](../../../src/lib/oauth/client.ts#L19)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// PDS は getFeed の代理リクエストで getFeedSkeleton 用の service auth を発行する
	// （AppView がそのトークンをフィードジェネレータへ回すため）。これが無いと getFeed が通らない。
```

<!-- source: src/lib/oauth/client.ts:30 -->

### [src/lib/oauth/client.ts:30](../../../src/lib/oauth/client.ts#L30)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// standard.site（長文記事の共通 lexicon）へブログの正本を保存するコレクション。
// 記事は作成だけでなく編集(putRecord)・削除も Nagi の投稿に追従させるため、
// crosspost と違って action は絞らない。
// site.standard.authFull という permission set も公開されているが、
// subscription / recommend まで含む過剰な束なので採らない。
```

<!-- source: src/lib/oauth/client.ts:39 -->

### [src/lib/oauth/client.ts:39](../../../src/lib/oauth/client.ts#L39)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// TriLinesAt の3行日記。作成・編集・削除するので action は絞らない。
// 別 namespace なので permission set に入れられない。真実源は nagi-lexicon の NAGI_TRILINES_SCOPE。
```

<!-- source: src/lib/oauth/client.ts:42 -->

### [src/lib/oauth/client.ts:42](../../../src/lib/oauth/client.ts#L42)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// botたんラジオの公開。permission set にも入れたが、古いキャッシュでも再認可で取れるよう明示する。
```

<!-- source: src/lib/oauth/client.ts:44 -->

### [src/lib/oauth/client.ts:44](../../../src/lib/oauth/client.ts#L44)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// Nagi namespace の repo/rpc 権限は permission set に集約し、公開済み lexicon を真実源にする。
// 定義: bsky-affirmative-bot/packages/nagi-lexicon/lexicons/com/suibari/nagi/appviewAccess.json
// blob と別 namespace の Bluemoji repo 権限は permission set に入れられないため直接スコープで残す。
// rpc aud は permission set 側で "aud":"*" にハードコード（旧 PDS の bare-aud 照合対応, cf. Skyblur）。
// そのため include に aud パラメータは付けない。真実源は nagi-lexicon の NAGI_OAUTH_SCOPE。
```

<!-- source: src/lib/oauth/client.ts:53 -->

### [src/lib/oauth/client.ts:53](../../../src/lib/oauth/client.ts#L53)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 新機能の権限は permission set の古いキャッシュでも再認可で取得できるよう明示する。
```

<!-- source: src/lib/oauth/client.ts:56 -->

### [src/lib/oauth/client.ts:56](../../../src/lib/oauth/client.ts#L56)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// カードニュースは未認証でも読めるが、自分のリアクションを見分けるのに認証が要る。
```

<!-- source: src/lib/oauth/client.ts:65 -->

### [src/lib/oauth/client.ts:65](../../../src/lib/oauth/client.ts#L65)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 動画は video.bsky.app に変換を任せる。PDS から service auth を取るための権限で、
	// どちらも Nagi namespace ではないので permission set に入れられない。
	// 真実源は nagi-lexicon の NAGI_VIDEO_SCOPES。
```

<!-- source: src/lib/oauth/client.ts:75 -->

### [src/lib/oauth/client.ts:75](../../../src/lib/oauth/client.ts#L75)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/** standardSite は旧呼び出し元との互換用。standard.site 権限は常に base に含む。 */
```

<!-- source: src/lib/oauth/client.ts:78 -->

### [src/lib/oauth/client.ts:78](../../../src/lib/oauth/client.ts#L78)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/**
 * オプトインの組み合わせからスコープ文字列を組み立てる。
 * 有効化済みのものを落とすと黙って機能が止まるので、呼び出し側は
 * 「今付与されているもの + 今回追加するもの」を渡すこと（cf. lib/optin/scope-optin.ts）。
 */
```

<!-- source: src/lib/oauth/client.ts:89 -->

### [src/lib/oauth/client.ts:89](../../../src/lib/oauth/client.ts#L89)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// standard.site は必須、Bluesky 連携（クロスポストとフィード閲覧）だけがオプトイン。
```

<!-- source: src/lib/oauth/client.ts:103 -->

### [src/lib/oauth/client.ts:103](../../../src/lib/oauth/client.ts#L103)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/**
 * BrowserOAuthClient は生成時に IndexedDB を開くため、プリレンダリング中には生成しない。
 * 公開ページを静的HTMLにしつつ、ブラウザでは従来どおり単一のクライアントを共有する。
 */
```

<!-- source: src/lib/oauth/client.ts:128 -->

### [src/lib/oauth/client.ts:128](../../../src/lib/oauth/client.ts#L128)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 本番だけでなく preview(develop) でもサインインできるよう、client metadata は
		// デプロイ先から組み立てる。ローカル開発だけは loopback client を使う。
```

## src/lib/oauth/deployment.ts

<!-- source: src/lib/oauth/deployment.ts:19 -->

### [src/lib/oauth/deployment.ts:19](../../../src/lib/oauth/deployment.ts#L19)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/**
 * Vercel Preview はデプロイ固有 URL ではなく、更新後も変わらないブランチ URL を
 * OAuth の正規 origin にする。認可サーバにキャッシュされるメタデータと、ブラウザの
 * origin 単位で保存される OAuth state / IndexedDB を同じ URL に固定するため。
 */
```

## src/lib/oauth/diagnostics.ts

<!-- source: src/lib/oauth/diagnostics.ts:67 -->

### [src/lib/oauth/diagnostics.ts:67](../../../src/lib/oauth/diagnostics.ts#L67)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 計測用markerを保存できなくてもsession自体の成否には影響させない。
```

## src/lib/oauth/session.svelte.ts

<!-- source: src/lib/oauth/session.svelte.ts:31 -->

### [src/lib/oauth/session.svelte.ts:31](../../../src/lib/oauth/session.svelte.ts#L31)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// session store側の削除は完了しているのでmarker削除失敗は無視する。
```

<!-- source: src/lib/oauth/session.svelte.ts:42 -->

### [src/lib/oauth/session.svelte.ts:42](../../../src/lib/oauth/session.svelte.ts#L42)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// IndexedDB側のOAuth sessionが真実源。markerは一時障害からの復元補助にすぎない。
```

<!-- source: src/lib/oauth/session.svelte.ts:48 -->

### [src/lib/oauth/session.svelte.ts:48](../../../src/lib/oauth/session.svelte.ts#L48)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/**
 * 直近までサインインしていた形跡があるか。
 *
 * 真実源は IndexedDB の OAuth セッションだが、その復元は非同期で、終わるまで
 * `$session` は null のまま。プリレンダした HTML は常に未ログイン向けの内容なので、
 * 復元を待つと戻ってきた利用者に一瞬それが見えてしまう。この目印は同期的に読めるので、
 * ハイドレーション最初の描画から正しい側を出せる。
 *
 * **判定にしか使わないこと。** サインアウトや別端末では外れるし、認可の根拠にはならない。
 */
```

<!-- source: src/lib/oauth/session.svelte.ts:62 -->

### [src/lib/oauth/session.svelte.ts:62](../../../src/lib/oauth/session.svelte.ts#L62)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// SSR（localStorage が無い）と、ストレージを塞いだブラウザ。どちらも未ログイン扱いでよい。
```

<!-- source: src/lib/oauth/session.svelte.ts:72 -->

### [src/lib/oauth/session.svelte.ts:72](../../../src/lib/oauth/session.svelte.ts#L72)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 戻り先を保存できなくてもOAuth自体は続行できる。
```

<!-- source: src/lib/oauth/session.svelte.ts:98 -->

### [src/lib/oauth/session.svelte.ts:98](../../../src/lib/oauth/session.svelte.ts#L98)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// public clientのrefresh中に通信だけが落ちた場合、ライブラリ内部の「最後に使ったsub」
		// markerは外れることがある。Nagi側markerから期限切れtokenを許容してsession objectを
		// 復元し、次のAPI呼び出し/online復帰でrefreshを再試行する。
```

<!-- source: src/lib/oauth/session.svelte.ts:111 -->

### [src/lib/oauth/session.svelte.ts:111](../../../src/lib/oauth/session.svelte.ts#L111)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 元の分類可能なエラーを表示・計測する。
```

<!-- source: src/lib/oauth/session.svelte.ts:126 -->

### [src/lib/oauth/session.svelte.ts:126](../../../src/lib/oauth/session.svelte.ts#L126)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// standard.site は常に要求し、Bluesky クロスポストだけを有効化時に追加する。
	// 先頭 @ や大文字・前後空白を落として handle 解決の失敗を防ぐ。
```

<!-- source: src/lib/oauth/session.svelte.ts:134 -->

### [src/lib/oauth/session.svelte.ts:134](../../../src/lib/oauth/session.svelte.ts#L134)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/**
 * アカウントをまだ持たない利用者向けに、Bluesky の Entryway から OAuth を開始する。
 * PDS 側でアカウント作成後、そのまま通常の OAuth 認可と Nagi の callback へ進む。
 */
```

<!-- source: src/lib/oauth/session.svelte.ts:141 -->

### [src/lib/oauth/session.svelte.ts:141](../../../src/lib/oauth/session.svelte.ts#L141)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// PDS が対応していれば、現在の Nagi 表示言語を登録画面にも引き継ぐ。
```

<!-- source: src/lib/oauth/session.svelte.ts:149 -->

### [src/lib/oauth/session.svelte.ts:149](../../../src/lib/oauth/session.svelte.ts#L149)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 認可が切れる前にこのデバイスのプッシュ購読を解除・削除しておく（AppView 呼び出しは
		// 有効なセッションが要るため signOut より先に行う）。循環 import を避け動的読み込み。
```

<!-- source: src/lib/oauth/session.svelte.ts:155 -->

### [src/lib/oauth/session.svelte.ts:155](../../../src/lib/oauth/session.svelte.ts#L155)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 購読解除に失敗してもサインアウト自体は続行する。
```

## src/lib/optin/scope-optin.ts

<!-- source: src/lib/optin/scope-optin.ts:10 -->

### [src/lib/optin/scope-optin.ts:10](../../../src/lib/optin/scope-optin.ts#L10)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/**
 * 追加スコープを要する機能のオプトイン管理。
 *
 * どれも「localStorage の有効フラグ」と「実際に付与されたスコープ」の AND で動く。
 * 有効化には再サインインが必要なため、リダイレクト前に保留フラグを立て、
 * 戻ってきた +layout.svelte の resolvePendingOptIns() で確定させる。
 * 保存先が localStorage なので設定は端末ごとになる。
 */
```

<!-- source: src/lib/optin/scope-optin.ts:23 -->

### [src/lib/optin/scope-optin.ts:23](../../../src/lib/optin/scope-optin.ts#L23)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/** 付与判定に使うコレクションスコープ。すべて揃っていれば付与済みとみなす。 */
```

<!-- source: src/lib/optin/scope-optin.ts:57 -->

### [src/lib/optin/scope-optin.ts:57](../../../src/lib/optin/scope-optin.ts#L57)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// オプトイン設定は保存できなくても投稿自体には影響しない。
```

<!-- source: src/lib/optin/scope-optin.ts:69 -->

### [src/lib/optin/scope-optin.ts:69](../../../src/lib/optin/scope-optin.ts#L69)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/**
 * 付与済みスコープに required がすべて含まれるか。パラメータ（action / aud）は見ない。
 * 旧セッションは action 無し（全操作許可）の広いスコープを保持しているため、
 * 完全一致だと既存ユーザーの機能が黙って止まる。
 */
```

<!-- source: src/lib/optin/scope-optin.ts:90 -->

### [src/lib/optin/scope-optin.ts:90](../../../src/lib/optin/scope-optin.ts#L90)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/** 現在のセッションに、その機能が要求するコレクションの書き込み権限が付与されているか。 */
```

<!-- source: src/lib/optin/scope-optin.ts:93 -->

### [src/lib/optin/scope-optin.ts:93](../../../src/lib/optin/scope-optin.ts#L93)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/**
 * Bluesky のフィードを読む権限があるか。クロスポストと同じ再認可で付与されるが、
 * 閲覧権限を足す前にクロスポストだけ許可した人がいるので、判定は別に持つ。
 */
```

<!-- source: src/lib/optin/scope-optin.ts:99 -->

### [src/lib/optin/scope-optin.ts:99](../../../src/lib/optin/scope-optin.ts#L99)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/**
 * いま付与されているオプトインの一覧。再認可のとき、片方を有効化する操作で
 * もう片方の権限を落とさないために signIn へ渡す。
 */
```

<!-- source: src/lib/optin/scope-optin.ts:108 -->

### [src/lib/optin/scope-optin.ts:108](../../../src/lib/optin/scope-optin.ts#L108)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/**
 * 再サインインから戻ってきた直後の確定処理。
 * 保留フラグが立っていて実際にスコープが付与されていれば有効化する。
 */
```

## src/lib/sso/links.ts

<!-- source: src/lib/sso/links.ts:6 -->

### [src/lib/sso/links.ts:6](../../../src/lib/sso/links.ts#L6)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 姉妹アプリの canonical origin。SSO チケットの aud と必ず一致させる。
// room-bot-tan.suibari.com は room.bot-tan.com へリダイレクトされるので、
// OAuth の client_id と揃えて後者を正とする。
```

<!-- source: src/lib/sso/links.ts:17 -->

### [src/lib/sso/links.ts:17](../../../src/lib/sso/links.ts#L17)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/**
 * 外部リンクが姉妹アプリ宛なら did ヒントを足す。それ以外の URL は一切変更しない。
 *
 * 表示するリンクすべてに適用したいので、プロフィールの website カード・投稿中の
 * リンクカード・本文のリンク・App Links の描画点から呼ぶ。
 *
 * ここで載せるのは「閲覧している人」の DID であって、リンク先の持ち主の DID ではない。
 * 姉妹アプリ側は「誰としてサインインするか」のヒントとしてしか使わず、認証は
 * 遷移先の OAuth が担保する。
 *
 * 許可した origin 以外には絶対に付けない（無関係な外部サイトへ閲覧者の DID を
 * 送ってしまうため）。
 */
```

<!-- source: src/lib/sso/links.ts:41 -->

### [src/lib/sso/links.ts:41](../../../src/lib/sso/links.ts#L41)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 既に did が載っているリンク（利用者が自分で書いた場合など）は尊重する。
```

<!-- source: src/lib/sso/links.ts:47 -->

### [src/lib/sso/links.ts:47](../../../src/lib/sso/links.ts#L47)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/**
 * 署名なしのフォールバック URL。
 *
 * 付与する did は「誰としてサインインするか」のヒントでしかなく、認証そのものは
 * 遷移先アプリの OAuth が担保する。したがって詐称されても他人になりすませるわけ
 * ではなく、「他人のハンドルが初期表示される」だけで済む。
 */
```

<!-- source: src/lib/sso/links.ts:61 -->

### [src/lib/sso/links.ts:61](../../../src/lib/sso/links.ts#L61)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/**
 * 姉妹アプリへ「サインイン済みのまま」移動する。
 *
 * チケットは有効期間が60秒しかないので、描画時ではなくクリック時に取りに行く
 * （リンクの href に埋めておくと開かれる頃には期限切れになる）。
 *
 * 取得に失敗したときはヒント経路へ落とす。permission-set を publish した直後は
 * 認可サーバのキャッシュが最大24h残り createSsoTicket が 403 になりうるので、
 * この分岐が無いとその間ずっと導線が壊れる（appview.ts の withPublicFallback と同じ理由）。
 */
```

<!-- source: src/lib/sso/links.ts:71 -->

### [src/lib/sso/links.ts:71](../../../src/lib/sso/links.ts#L71)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// お部屋は Next.js の API ルートでチケットを受ける。trailingSlash 設定のため
// 末尾スラッシュまで書く（無いと 308 で1往復増える）。
```

<!-- source: src/lib/sso/links.ts:87 -->

### [src/lib/sso/links.ts:87](../../../src/lib/sso/links.ts#L87)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/** ヒント用に付けた did は遷移先で不要なので、戻り先パスからは落とす。 */
```

<!-- source: src/lib/sso/links.ts:98 -->

### [src/lib/sso/links.ts:98](../../../src/lib/sso/links.ts#L98)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 同期で開いた空タブは opener を持つので、遷移前に切っておく。
```

<!-- source: src/lib/sso/links.ts:119 -->

### [src/lib/sso/links.ts:119](../../../src/lib/sso/links.ts#L119)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 取得できなければ ?did= 付きの元のリンクへ。遷移先で通常の OAuth になる。
```

<!-- source: src/lib/sso/links.ts:123 -->

### [src/lib/sso/links.ts:123](../../../src/lib/sso/links.ts#L123)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/**
 * 姉妹アプリ宛リンクのクリックを横取りし、チケット経由の遷移に差し替える。
 *
 * チケットは60秒で失効するので href には埋められない。かといってリンクを
 * ヒント経路のままにすると遷移先で毎回 OAuth の承認画面が出るため、
 * クリック時にだけ取りに行く。
 *
 * ルートレイアウトから document のクリックに繋いで、個々のリンク側に手を
 * 入れずに全リンクへ効かせる。
 */
```

<!-- source: src/lib/sso/links.ts:135 -->

### [src/lib/sso/links.ts:135](../../../src/lib/sso/links.ts#L135)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 修飾キー付き（別タブで開く等）はブラウザ既定の挙動を尊重する。
	// この場合は href の ?did= が使われ、遷移先で1クリックの OAuth になる。
```

<!-- source: src/lib/sso/links.ts:153 -->

### [src/lib/sso/links.ts:153](../../../src/lib/sso/links.ts#L153)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// ポップアップブロッカに掛からないよう、新規タブはクリック直後に同期で開く。
	// noopener を渡すと参照が返らず遷移先を設定できないので、後から opener を切る。
```

## src/routes/login/+page.svelte

<!-- source: src/routes/login/+page.svelte:14 -->

### [src/routes/login/+page.svelte:14](../../../src/routes/login/+page.svelte#L14)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// standard.site は常に認可し、このスイッチは任意の Bluesky 連携（クロスポストとフィード閲覧）だけを扱う。
```

<!-- source: src/routes/login/+page.svelte:17 -->

### [src/routes/login/+page.svelte:17](../../../src/routes/login/+page.svelte#L17)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 前回クロスポストを有効にしていたら、スイッチの初期値も ON にして復元する。
		// enabled フラグはログアウトをまたいで残るので、うっかりログアウトや再ログインでも
		// 1 回のサインインで元の状態に戻せる。
```

<!-- source: src/routes/login/+page.svelte:29 -->

### [src/routes/login/+page.svelte:29](../../../src/routes/login/+page.svelte#L29)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// 復帰後にクロスポストの有効化を確定させるため保留フラグを立てておく。
```

<!-- source: src/routes/login/+page.svelte:99 -->

### [src/routes/login/+page.svelte:99](../../../src/routes/login/+page.svelte#L99)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/* ToggleSwitch は内部で <button> を描画するため、.auth-card 直下に置くと
	   .auth-card > button のプライマリボタン装飾を拾ってしまう。div で包んで直下 button を回避する。 */
```

<!-- source: src/routes/login/+page.svelte:104 -->

### [src/routes/login/+page.svelte:104](../../../src/routes/login/+page.svelte#L104)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/* トグル直下の補足文。カード内の他の段落より小さく、左寄せでトグルと揃える。 */
```

<!-- source: src/routes/login/+page.svelte:125 -->

### [src/routes/login/+page.svelte:125](../../../src/routes/login/+page.svelte#L125)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
/* 年齢要件の告知と規約同意。両方の入口の直下に置いて、押す前に目に入るようにする。 */
```

## static/auth-init.js

<!-- source: static/auth-init.js:1 -->

### [static/auth-init.js:1](../../../static/auth-init.js#L1)

分類: 仕様・設計の根拠。対応仕様: [auth-session](spec.md#requirements)。

```text
// プリレンダHTMLのヒーローを、OAuth復元が始まる前の初回描画から隠す。
// 認証確認が終わったら +layout.svelte が属性を外す。
```
