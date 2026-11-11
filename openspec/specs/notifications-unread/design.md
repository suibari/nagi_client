# notifications-unread：設計判断・コメント出典

この文書は初期仕様化時点のコメント原文を保存する設計資料である。現在の振る舞い・検証条件は [spec.md](spec.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。

## src/lib/notifications/href.ts

<!-- source: src/lib/notifications/href.ts:5 -->

### [src/lib/notifications/href.ts:5](../../../src/lib/notifications/href.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** 投稿以外の通知は専用画面へ、投稿は記事・返信の種類に合うページへ。 */
```

<!-- source: src/lib/notifications/href.ts:12 -->

### [src/lib/notifications/href.ts:12](../../../src/lib/notifications/href.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 感情グラフは「アクティビティ」の既定タブにある。
```

<!-- source: src/lib/notifications/href.ts:14 -->

### [src/lib/notifications/href.ts:14](../../../src/lib/notifications/href.ts#L14)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// アドカレは開いた先で手紙の開封演出が始まる。
```

<!-- source: src/lib/notifications/href.ts:26 -->

### [src/lib/notifications/href.ts:26](../../../src/lib/notifications/href.ts#L26)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 付随する post が別の投稿を指す場合、その記事属性で subject の行き先を変えない。
```

## src/lib/notifications/preferences.ts

<!-- source: src/lib/notifications/preferences.ts:3 -->

### [src/lib/notifications/preferences.ts:3](../../../src/lib/notifications/preferences.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * 通知設定。判定はすべて AppView 側（通知一覧・未読数・プッシュ配信）が行い、
 * クライアントは設定画面で読み書きするだけ。
 *
 * 保存の形は Bluesky に合わせて { list, push } を持つが、今の UI は
 * 「通知欄＝プッシュ」のトグル1つで両方へ同じ値を書く。あとで分けたくなっても、
 * UI を2つにするだけで保存形式は変えなくてよい。
 */
```

<!-- source: src/lib/notifications/preferences.ts:12 -->

### [src/lib/notifications/preferences.ts:12](../../../src/lib/notifications/preferences.ts#L12)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** 設定画面での並び。人から / botたんから / そのほか。 */
```

<!-- source: src/lib/notifications/preferences.ts:25 -->

### [src/lib/notifications/preferences.ts:25](../../../src/lib/notifications/preferences.ts#L25)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** 未設定は有効。list と push のどちらかでも生きていれば「オン」と見せる。 */
```

<!-- source: src/lib/notifications/preferences.ts:34 -->

### [src/lib/notifications/preferences.ts:34](../../../src/lib/notifications/preferences.ts#L34)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** トグル1つ分の変更を、送信用の設定全体にして返す（サーバーは丸ごと置き換える）。 */
```

## src/lib/notifications/push-state.ts

<!-- source: src/lib/notifications/push-state.ts:24 -->

### [src/lib/notifications/push-state.ts:24](../../../src/lib/notifications/push-state.ts#L24)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// AppView再登録の一時失敗は、ブラウザで有効な購読意思をOFFに変えない。
```

## src/lib/notifications/push.svelte.ts

<!-- source: src/lib/notifications/push.svelte.ts:19 -->

### [src/lib/notifications/push.svelte.ts:19](../../../src/lib/notifications/push.svelte.ts#L19)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * Web Push の購読状態と購読/解除の操作をまとめたモジュール。
 *
 * 閉じた PWA でも通知を届ける唯一の実用手段が Web Push（Service Worker の push
 * イベント）。iOS/iPadOS では 16.4+ かつ「ホーム画面に追加した standalone PWA」でしか
 * PushManager が存在しないため、非対応環境は UI 側で案内する。
 */
```

<!-- source: src/lib/notifications/push.svelte.ts:27 -->

### [src/lib/notifications/push.svelte.ts:27](../../../src/lib/notifications/push.svelte.ts#L27)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** standalone（ホーム画面から起動）で動いているか。iOS の Web Push 可否判定に使う。 */
```

<!-- source: src/lib/notifications/push.svelte.ts:32 -->

### [src/lib/notifications/push.svelte.ts:32](../../../src/lib/notifications/push.svelte.ts#L32)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// iOS Safari 独自プロパティ
```

<!-- source: src/lib/notifications/push.svelte.ts:37 -->

### [src/lib/notifications/push.svelte.ts:37](../../../src/lib/notifications/push.svelte.ts#L37)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** この環境で Web Push が使えるか（SW + PushManager + Notification + VAPID鍵）。 */
```

<!-- source: src/lib/notifications/push.svelte.ts:48 -->

### [src/lib/notifications/push.svelte.ts:48](../../../src/lib/notifications/push.svelte.ts#L48)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * iOS で「非対応」に見えるのが standalone 未起動が原因かどうか。true のとき UI は
 * 「ホーム画面に追加して起動してください」を案内する。
 */
```

<!-- source: src/lib/notifications/push.svelte.ts:111 -->

### [src/lib/notifications/push.svelte.ts:111](../../../src/lib/notifications/push.svelte.ts#L111)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** リアクティブな購読状態。トグルは端末側、registeredはAppView側の状態を表す。 */
```

<!-- source: src/lib/notifications/push.svelte.ts:139 -->

### [src/lib/notifications/push.svelte.ts:139](../../../src/lib/notifications/push.svelte.ts#L139)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * 現在の購読状態を読み直す。端末内に購読があれば AppView へ idempotent に再登録し、
 * 「端末だけ購読済み」の不整合を自動修復する。
 */
```

<!-- source: src/lib/notifications/push.svelte.ts:186 -->

### [src/lib/notifications/push.svelte.ts:186](../../../src/lib/notifications/push.svelte.ts#L186)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * 通知許可を取り、プッシュ購読して AppView に登録する。成功で subscribed=true。
 * 許可が拒否された場合や非対応の場合は false を返す。
 */
```

<!-- source: src/lib/notifications/push.svelte.ts:218 -->

### [src/lib/notifications/push.svelte.ts:218](../../../src/lib/notifications/push.svelte.ts#L218)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// ブラウザ購読は保持する。online/visibility復帰時にAppView登録を自己修復できる。
```

<!-- source: src/lib/notifications/push.svelte.ts:227 -->

### [src/lib/notifications/push.svelte.ts:227](../../../src/lib/notifications/push.svelte.ts#L227)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** プッシュ購読を解除し、AppView からも削除する。 */
```

<!-- source: src/lib/notifications/push.svelte.ts:239 -->

### [src/lib/notifications/push.svelte.ts:239](../../../src/lib/notifications/push.svelte.ts#L239)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// ローカル解除に成功していれば表示はOFFのままにする。AppView側の失効購読は
		// 次回配信の404/410でも掃除される。
```

<!-- source: src/lib/notifications/push.svelte.ts:280 -->

### [src/lib/notifications/push.svelte.ts:280](../../../src/lib/notifications/push.svelte.ts#L280)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** Service Workerと同じcapability経路を、ブラウザ復帰時の軽量な修復にも利用する。 */
```

<!-- source: src/lib/notifications/push.svelte.ts:294 -->

### [src/lib/notifications/push.svelte.ts:294](../../../src/lib/notifications/push.svelte.ts#L294)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * 現在のデバイスの購読を解除して AppView からも消す。サインアウト時にも使うため
 * pushState を触らず副作用を最小化した下請け。失敗しても致命的でないので握りつぶす。
 */
```

<!-- source: src/lib/notifications/push.svelte.ts:302 -->

### [src/lib/notifications/push.svelte.ts:302](../../../src/lib/notifications/push.svelte.ts#L302)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 未ログイン・SW未登録などは無視。
```

## src/lib/notifications/unread.svelte.ts

<!-- source: src/lib/notifications/unread.svelte.ts:5 -->

### [src/lib/notifications/unread.svelte.ts:5](../../../src/lib/notifications/unread.svelte.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * 未読通知件数のグローバルストア。サーバーの readAt を単一の真実源とし、
 * ここには getUnreadCount の結果だけを持つ（ローカルで既読状態を持たない）。
 */
```

<!-- source: src/lib/notifications/unread.svelte.ts:11 -->

### [src/lib/notifications/unread.svelte.ts:11](../../../src/lib/notifications/unread.svelte.ts#L11)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** PWA アプリアイコンのバッジを未読件数に合わせる。非対応環境では静かに無視。 */
```

<!-- source: src/lib/notifications/unread.svelte.ts:22 -->

### [src/lib/notifications/unread.svelte.ts:22](../../../src/lib/notifications/unread.svelte.ts#L22)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// バッジ非対応（多くのデスクトップブラウザ等）は無視。
```

<!-- source: src/lib/notifications/unread.svelte.ts:31 -->

### [src/lib/notifications/unread.svelte.ts:31](../../../src/lib/notifications/unread.svelte.ts#L31)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * 「この時点より前に発射した getUnreadCount の応答は捨てる」ための世代。
 * markAllSeen の楽観的 0 が、それ以前に飛んでいた応答で巻き戻されるのを防ぐ。
 */
```

<!-- source: src/lib/notifications/unread.svelte.ts:37 -->

### [src/lib/notifications/unread.svelte.ts:37](../../../src/lib/notifications/unread.svelte.ts#L37)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** 未読件数をサーバーから取り直す。未ログイン・失敗時は静かにスキップ（次回に再試行）。 */
```

<!-- source: src/lib/notifications/unread.svelte.ts:46 -->

### [src/lib/notifications/unread.svelte.ts:46](../../../src/lib/notifications/unread.svelte.ts#L46)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 一時的な認証切れやネットワーク断。60秒待たずに一度だけ取り直す
		// （タブ復帰の直後はトークン更新と重なって失敗しやすい）。
```

<!-- source: src/lib/notifications/unread.svelte.ts:56 -->

### [src/lib/notifications/unread.svelte.ts:56](../../../src/lib/notifications/unread.svelte.ts#L56)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** seenAt までを一括既読にし、成功したらバッジを 0 に落とす。 */
```

<!-- source: src/lib/notifications/unread.svelte.ts:64 -->

### [src/lib/notifications/unread.svelte.ts:64](../../../src/lib/notifications/unread.svelte.ts#L64)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 失敗しても致命的ではない。次回オープン時に再送される。
```

<!-- source: src/lib/notifications/unread.svelte.ts:72 -->

### [src/lib/notifications/unread.svelte.ts:72](../../../src/lib/notifications/unread.svelte.ts#L72)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * ポーリング（60秒）＋ウィンドウ復帰時・プッシュ受信時の再取得を開始する。多重起動しない。
 * ログイン中は即時取得、ログアウトでバッジを 0 に戻す。
 */
```

<!-- source: src/lib/notifications/unread.svelte.ts:79 -->

### [src/lib/notifications/unread.svelte.ts:79](../../../src/lib/notifications/unread.svelte.ts#L79)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 件数が変わるたびに PWA アプリバッジへ反映する（唯一の真実源は unreadCount）。
	// ただし購読直後に流れてくる初期値 0 では消さない。Service Worker が
	// バックグラウンドで積んだ OS バッジを、起動しただけで消してしまうため。
```

<!-- source: src/lib/notifications/unread.svelte.ts:90 -->

### [src/lib/notifications/unread.svelte.ts:90](../../../src/lib/notifications/unread.svelte.ts#L90)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// ログイン/ログアウトに追従（初回購読で現在値が即座に流れる）。
```

<!-- source: src/lib/notifications/unread.svelte.ts:101 -->

### [src/lib/notifications/unread.svelte.ts:101](../../../src/lib/notifications/unread.svelte.ts#L101)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// タブを開いたままプッシュが届いたとき、次のポーリングまで最大60秒バッジが
	// 古いままになるのを避ける。Service Worker からの合図で即座に取り直す。
```

## src/lib/unread/sections.svelte.ts

<!-- source: src/lib/unread/sections.svelte.ts:5 -->

### [src/lib/unread/sections.svelte.ts:5](../../../src/lib/unread/sections.svelte.ts#L5)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * アカウント同期する既読セクションのレジストリ。
 *
 * 以前は画面を開くたびに createReadWatermark していたため、同じセクションでも
 * インスタンスがバラバラで、サーバーの位置を流し込む相手を決められなかった。
 * ここでセクションごとに1つに固定し、保存が前に進んだら preferences へ push する。
 *
 * storageKey と viewerDid はサインイン状態で変わる。変わったら作り直す
 * （前の利用者の既読を引き継がないため）。viewerDid が無い＝サインアウト中の閲覧は
 * 端末ローカルに閉じ、サーバーとは一切やり取りしない。
 */
```

<!-- source: src/lib/unread/sections.svelte.ts:19 -->

### [src/lib/unread/sections.svelte.ts:19](../../../src/lib/unread/sections.svelte.ts#L19)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** サーバー側の位置と突き合わせ、ローカルが進んでいる分は押し戻す。 */
```

<!-- source: src/lib/unread/sections.svelte.ts:40 -->

### [src/lib/unread/sections.svelte.ts:40](../../../src/lib/unread/sections.svelte.ts#L40)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 同期が済んだあとに開かれた画面でも、サーバーの既読をそのまま引き継ぐ。
```

<!-- source: src/lib/unread/sections.svelte.ts:45 -->

### [src/lib/unread/sections.svelte.ts:45](../../../src/lib/unread/sections.svelte.ts#L45)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * 同期直後・送信直後に、そのアカウントのセクションをまとめて突き合わせ直す。
 * 別アカウント（やサインアウト中）のまま残っているエントリには触らない。
 */
```

<!-- source: src/lib/unread/sections.svelte.ts:54 -->

### [src/lib/unread/sections.svelte.ts:54](../../../src/lib/unread/sections.svelte.ts#L54)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * メモリ上のウォーターマークを捨てる。全データ削除の直後に、生き残ったインスタンスが
 * 消したはずの localStorage を書き戻さないようにする。
 */
```

## src/lib/unread/watermark.svelte.ts

<!-- source: src/lib/unread/watermark.svelte.ts:3 -->

### [src/lib/unread/watermark.svelte.ts:3](../../../src/lib/unread/watermark.svelte.ts#L3)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * 「ここまで読んだ」位置（ウォーターマーク）。保存と比較だけをここに置き、
 * ポーリングや取得は利用側（news / feed / my Nagi）が持つ。
 *
 * 保存先は常に localStorage。アカウント同期するセクション（my Nagi・ニュース）では
 * onPersist / mergeRemote を通して `$lib/preferences` がサーバーとも突き合わせるが、
 * この層はサーバーを知らないままにしておく（フィードは同期しないため）。
 */
```

<!-- source: src/lib/unread/watermark.svelte.ts:14 -->

### [src/lib/unread/watermark.svelte.ts:14](../../../src/lib/unread/watermark.svelte.ts#L14)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** AppView と同じ indexedAt DESC, uri DESC の順序で新旧を比較する。 */
```

<!-- source: src/lib/unread/watermark.svelte.ts:48 -->

### [src/lib/unread/watermark.svelte.ts:48](../../../src/lib/unread/watermark.svelte.ts#L48)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * 画面を開いた時点の既読基準を凍結したビュー。マウントごとに1つ作る。
 * 既読化は保存側だけを進めるので、表示中の未読マークは消えない（通知画面と同じモデル）。
 */
```

<!-- source: src/lib/unread/watermark.svelte.ts:53 -->

### [src/lib/unread/watermark.svelte.ts:53](../../../src/lib/unread/watermark.svelte.ts#L53)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** 表示した最新分までを既読へ進める。凍結した基準は動かさない。 */
```

<!-- source: src/lib/unread/watermark.svelte.ts:55 -->

### [src/lib/unread/watermark.svelte.ts:55](../../../src/lib/unread/watermark.svelte.ts#L55)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** 開いた時点の基準より新しい＝未読マーク対象か。未初期化の端末では常に false。 */
```

<!-- source: src/lib/unread/watermark.svelte.ts:60 -->

### [src/lib/unread/watermark.svelte.ts:60](../../../src/lib/unread/watermark.svelte.ts#L60)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** 未読があるか。ナビのドット用（購読しない画面は無視してよい）。 */
```

<!-- source: src/lib/unread/watermark.svelte.ts:63 -->

### [src/lib/unread/watermark.svelte.ts:63](../../../src/lib/unread/watermark.svelte.ts#L63)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** 端末が初期化済みか。未初期化＝全既読扱い。 */
```

<!-- source: src/lib/unread/watermark.svelte.ts:65 -->

### [src/lib/unread/watermark.svelte.ts:65](../../../src/lib/unread/watermark.svelte.ts#L65)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** 既知の最新位置を反映して未読状態を再計算する（ポーリング用）。 */
```

<!-- source: src/lib/unread/watermark.svelte.ts:67 -->

### [src/lib/unread/watermark.svelte.ts:67](../../../src/lib/unread/watermark.svelte.ts#L67)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** localStorage を読み直して未読状態を再計算する（別タブ同期用）。 */
```

<!-- source: src/lib/unread/watermark.svelte.ts:69 -->

### [src/lib/unread/watermark.svelte.ts:69](../../../src/lib/unread/watermark.svelte.ts#L69)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
	 * サーバーから受け取った位置を取り込む。既読は前にしか進まないので、
	 * 新しい方だけを採用して保存する。戻り値はマージ後の現在位置（無ければ undefined）で、
	 * ローカルが勝ったかどうかは呼び出し側が戻り値と remote を比べて判断する。
	 * onPersist は呼ばない（受け取った値をそのまま送り返さないため）。
	 */
```

<!-- source: src/lib/unread/watermark.svelte.ts:76 -->

### [src/lib/unread/watermark.svelte.ts:76](../../../src/lib/unread/watermark.svelte.ts#L76)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** 表示用ビューを作る。凍結前に保存値を読み直し、別タブの既読を取り込む。 */
```

<!-- source: src/lib/unread/watermark.svelte.ts:81 -->

### [src/lib/unread/watermark.svelte.ts:81](../../../src/lib/unread/watermark.svelte.ts#L81)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** 保存位置が前に進んだときだけ呼ばれる。アカウント同期するセクションで使う。 */
```

<!-- source: src/lib/unread/watermark.svelte.ts:99 -->

### [src/lib/unread/watermark.svelte.ts:99](../../../src/lib/unread/watermark.svelte.ts#L99)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 保存できない環境でも、このタブを開いている間はメモリ上で状態を維持する。
```

<!-- source: src/lib/unread/watermark.svelte.ts:104 -->

### [src/lib/unread/watermark.svelte.ts:104](../../../src/lib/unread/watermark.svelte.ts#L104)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** 掲載終了プレースホルダなど indexedAt が空のものは位置として扱わない。 */
```

<!-- source: src/lib/unread/watermark.svelte.ts:128 -->

### [src/lib/unread/watermark.svelte.ts:128](../../../src/lib/unread/watermark.svelte.ts#L128)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 一覧取得後にさらに新しいものを検出済みなら、その分の未読表示は残す。
```

<!-- source: src/lib/unread/watermark.svelte.ts:141 -->

### [src/lib/unread/watermark.svelte.ts:141](../../../src/lib/unread/watermark.svelte.ts#L141)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 機能を初めて使う端末では、現在の掲載分を既読の基準にする。
```

<!-- source: src/lib/unread/watermark.svelte.ts:163 -->

### [src/lib/unread/watermark.svelte.ts:163](../../../src/lib/unread/watermark.svelte.ts#L163)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// ローカルが勝った（または同期対象がまだ無い）。呼び出し側が押し戻す。
```

<!-- source: src/lib/unread/watermark.svelte.ts:167 -->

### [src/lib/unread/watermark.svelte.ts:167](../../../src/lib/unread/watermark.svelte.ts#L167)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 別タブでの既読を取り込んでから基準を凍結する。保存に失敗する端末では
			// localStorage が古いままなので、メモリ上の状態を信じる。
```

## src/routes/dev/e2e/notifications/+page.svelte

<!-- source: src/routes/dev/e2e/notifications/+page.svelte:6 -->

### [src/routes/dev/e2e/notifications/+page.svelte:6](../../../src/routes/dev/e2e/notifications/+page.svelte#L6)

分類: 検証・再現条件。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
	 * 通知一覧の確認用。仮のセッションで通知画面をそのまま描く。
	 * com.suibari.nagi.getNotifications はネットワーク越しに取るので、e2e で差し替える。
	 */
```

## src/routes/notifications/+page.svelte

<!-- source: src/routes/notifications/+page.svelte:32 -->

### [src/routes/notifications/+page.svelte:32](../../../src/routes/notifications/+page.svelte#L32)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** 通知カード全体がリンクなので、サムネはギャラリー無しの素の img で並べる。 */
```

<!-- source: src/routes/notifications/+page.svelte:37 -->

### [src/routes/notifications/+page.svelte:37](../../../src/routes/notifications/+page.svelte#L37)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
	 * 一覧を取り直して、表示した分までを既読にする。
	 * マウント時だけでなくタブ復帰・ナビ再タップでも走らせる。1回きりにしていた頃は、
	 * この画面を開いたまま戻ってきても一覧が伸びず、バッジの数字も消えなかった。
	 */
```

<!-- source: src/routes/notifications/+page.svelte:47 -->

### [src/routes/notifications/+page.svelte:47](../../../src/routes/notifications/+page.svelte#L47)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 通知に引用は出さないので、prepare が引用まで展開しないよう必要な項目だけ渡す。
			// 既に翻訳済み/翻訳中の投稿は prepare が飛ばすので、ポーリングで重複リクエストにならない。
```

<!-- source: src/routes/notifications/+page.svelte:65 -->

### [src/routes/notifications/+page.svelte:65](../../../src/routes/notifications/+page.svelte#L65)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 表示した最新分までを一括既読にしてバッジを落とす。取得後に届いた通知は
			// まだ見えていないので、seenAt は表示済みの最新 createdAt に限定する。
```

<!-- source: src/routes/notifications/+page.svelte:69 -->

### [src/routes/notifications/+page.svelte:69](../../../src/routes/notifications/+page.svelte#L69)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 名刺更新があるときだけ本人の最新名刺を1回取得する。通知行には更新当時の
			// スナップショットが無いので、複数行があってもすべて現在の名刺を表示する。
```

<!-- source: src/routes/notifications/+page.svelte:78 -->

### [src/routes/notifications/+page.svelte:78](../../../src/routes/notifications/+page.svelte#L78)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 通知一覧そのものは表示し、名刺だけ従来のプロフィールリンクへフォールバックする。
```

<!-- source: src/routes/notifications/+page.svelte:83 -->

### [src/routes/notifications/+page.svelte:83](../../../src/routes/notifications/+page.svelte#L83)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 再取得の失敗で、すでに出ている一覧を消さない。
```

<!-- source: src/routes/notifications/+page.svelte:91 -->

### [src/routes/notifications/+page.svelte:91](../../../src/routes/notifications/+page.svelte#L91)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// OAuth 復元は非同期なので oauthReady を待つ。待たずに required API を叩くと、リロード時に
	// session がまだ null で "Authentication required" になる。
```

<!-- source: src/routes/notifications/+page.svelte:102 -->

### [src/routes/notifications/+page.svelte:102](../../../src/routes/notifications/+page.svelte#L102)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// タブ復帰（と保険の60秒ポーリング）で最新へ追従する。
```

<!-- source: src/routes/notifications/+page.svelte:104 -->

### [src/routes/notifications/+page.svelte:104](../../../src/routes/notifications/+page.svelte#L104)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// ナビの通知アイコンをもう一度押したときも開き直す。reload() が読む状態を依存に
	// 取り込まないよう untrack する（取り込むと初回ロードと二重に走る）。
```

<!-- source: src/routes/notifications/+page.svelte:113 -->

### [src/routes/notifications/+page.svelte:113](../../../src/routes/notifications/+page.svelte#L113)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/** ゼンカツはお題、ドローの控えは引いた札の名前を、投稿本文の代わりに出す。 */
```

<!-- source: src/routes/notifications/+page.svelte:119 -->

### [src/routes/notifications/+page.svelte:119](../../../src/routes/notifications/+page.svelte#L119)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
	 * 通知は素のテキスト表示（カード全体がリンク）なので TranslateToggle は使わず、
	 * 共有ストアから訳文だけ受け取る。翻訳待ち／失敗のときは undefined を返して原文表示へ落とす。
	 * 流し見する画面なので「翻訳中…」や再試行リンクといった状態表示は出さない。
	 */
```

<!-- source: src/routes/notifications/+page.svelte:154 -->

### [src/routes/notifications/+page.svelte:154](../../../src/routes/notifications/+page.svelte#L154)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
<!--
		ゼンカツとドローの控えは本文を持たないので、「何に付いたのか」は文末で言い切る。
		ここを投稿と同じ文言にすると、英語で "to your post" と嘘をつくことになる。
	-->
```

<!-- source: src/routes/notifications/+page.svelte:183 -->

### [src/routes/notifications/+page.svelte:183](../../../src/routes/notifications/+page.svelte#L183)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
<!-- 返信/メンションは新しい投稿、リアクションは対象投稿を AppView が post に入れる。 -->
```

## src/routes/settings/notifications/+page.svelte

<!-- source: src/routes/settings/notifications/+page.svelte:32 -->

### [src/routes/settings/notifications/+page.svelte:32](../../../src/routes/settings/notifications/+page.svelte#L32)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 通知する内容（種別ごとのオン・オフ）。判定は AppView が通知欄・未読数・プッシュの
	// すべてで行うので、ここは読み書きだけ。端末ごとではなくアカウントの設定。
```

<!-- source: src/routes/settings/notifications/+page.svelte:85 -->

### [src/routes/settings/notifications/+page.svelte:85](../../../src/routes/settings/notifications/+page.svelte#L85)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 先に見た目を変え、失敗したら戻す。保存中は他のトグルを止めて送信を直列にする。
```

<!-- source: src/routes/settings/notifications/+page.svelte:103 -->

### [src/routes/settings/notifications/+page.svelte:103](../../../src/routes/settings/notifications/+page.svelte#L103)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// このページは pushState を表示・操作するだけ。購読状態の同期は +layout.svelte が
	// セッション確立時に済ませている（ページを開かないと直らない状態を作らないため）。
	// ここで表示されるエラーは、その起動時同期の結果であることが多い。
```

<!-- source: src/routes/settings/notifications/+page.svelte:134 -->

### [src/routes/settings/notifications/+page.svelte:134](../../../src/routes/settings/notifications/+page.svelte#L134)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 権限の取り直しでオプトイン済みの機能を落とさないよう、現状を含めて要求する。
```

<!-- source: src/routes/settings/notifications/+page.svelte:194 -->

### [src/routes/settings/notifications/+page.svelte:194](../../../src/routes/settings/notifications/+page.svelte#L194)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
<!-- 種別の行は群ごとの小分け（level 3）に並べ、この section は見出しと説明だけを持つ。 -->
```

## src/service-worker.ts

<!-- source: src/service-worker.ts:1 -->

### [src/service-worker.ts:1](../../../src/service-worker.ts#L1)

分類: ツール指示（削除対象外）。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />
```

<!-- source: src/service-worker.ts:7 -->

### [src/service-worker.ts:7](../../../src/service-worker.ts#L7)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// SvelteKit が自動登録する Service Worker。ここではキャッシュは扱わず、Web Push の
// 受信（push）とクリック（notificationclick）だけを担当する。閉じた PWA でも OS の
// プッシュサービス経由でこのワーカーが起こされ、通知を表示できる。
```

<!-- source: src/service-worker.ts:31 -->

### [src/service-worker.ts:31](../../../src/service-worker.ts#L31)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// この SW は薄く保つ。修正しても旧版が居座ると端末に届かないため、判断はできる限り
// サーバー（payload）に寄せ、ここは受け取ったものを表示するだけにする。
// skipWaiting / clients.claim は、次に不具合が見つかったときすぐ差し替えるための保険。
```

<!-- source: src/service-worker.ts:37 -->

### [src/service-worker.ts:37](../../../src/service-worker.ts#L37)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * ⚠ この型は bsky-affirmative-bot/apps/nagi_appview/src/services/pushPayload.ts と対。
 *    別リポジトリで型を共有できないため、変更時は必ず両方を更新すること。
 *    サーバーだけ先にデプロイされる／SW だけ古いまま残る状況が普通に起きるので、
 *    すべてのフィールドは optional にして受信側でフォールバックする。
 */
```

<!-- source: src/service-worker.ts:51 -->

### [src/service-worker.ts:51](../../../src/service-worker.ts#L51)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * 通知タグを決める。tag はサーバーが通知1件ごとに一意な値を入れてくる（pushPayload.ts）。
 *
 * ⚠ payload に tag が無いときのフォールバックは必ず「一意な値」にすること。
 *    かつてここが payload.type だったため、同じ種別の通知が既存の通知を静かに置き換え、
 *    2通目以降が音もバナーも無しに消えるという障害を起こした（Notifications 仕様では
 *    同一 tag の通知は renotify なしだと再アラートされない）。
 *    フォールバックは「通知が重複して出る」側に倒す。うるさいが気づける。
 *    「消える」側に倒すと誰も気づけない。
 */
```

<!-- source: src/service-worker.ts:82 -->

### [src/service-worker.ts:82](../../../src/service-worker.ts#L82)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// tag が万一衝突しても再アラートさせる保険。tag の指定が前提の項目なので、
				// tag を空にする変更を入れるとここも壊れる。
```

<!-- source: src/service-worker.ts:87 -->

### [src/service-worker.ts:87](../../../src/service-worker.ts#L87)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// アプリバッジを 1 増やす（未読の正確な件数はアプリ起動時に再同期される）。
```

<!-- source: src/service-worker.ts:89 -->

### [src/service-worker.ts:89](../../../src/service-worker.ts#L89)

分類: ツール指示（削除対象外）。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// @ts-expect-error setAppBadge is not yet in the SW lib types
```

<!-- source: src/service-worker.ts:92 -->

### [src/service-worker.ts:92](../../../src/service-worker.ts#L92)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// バッジ非対応環境では無視。
```

<!-- source: src/service-worker.ts:94 -->

### [src/service-worker.ts:94](../../../src/service-worker.ts#L94)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 開いているタブへ知らせる。これが無いと、タブを開いたままプッシュが来ても
			// 次のポーリング（最大60秒）までナビの未読バッジが古いままになる。
```

<!-- source: src/service-worker.ts:108 -->

### [src/service-worker.ts:108](../../../src/service-worker.ts#L108)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// 既に開いているウィンドウがあればフォーカスして遷移、無ければ新規に開く。
```

<!-- source: src/service-worker.ts:121 -->

### [src/service-worker.ts:121](../../../src/service-worker.ts#L121)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
/**
 * ブラウザ側の都合（鍵のローテーション等）で購読が差し替わったときに呼ばれる。
 *
 * installation capability はDIDを変更できない端末固有の秘密なので、OAuth sessionを
 * 持たないSWからでもAppView上の同じ購読だけを更新できる。失敗時は次回アプリ起動時の
 * refreshPushState() が認証済み経路で引き受ける。
 * この分担が崩れると「端末は購読済みだがサーバーに行が無い」端末が生まれ、
 * 通知が来ないのにユーザーからは ON に見える状態になる。
 */
```

<!-- source: src/service-worker.ts:131 -->

### [src/service-worker.ts:131](../../../src/service-worker.ts#L131)

分類: 仕様・設計の根拠。対応仕様: [notifications-unread](spec.md#requirements)。

```text
// pushsubscriptionchange は TS の SW 型定義に含まれないので手当てする。
```
