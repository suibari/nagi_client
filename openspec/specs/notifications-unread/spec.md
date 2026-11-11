# 通知・Web Push・既読位置

## Purpose

通知件数、端末購読の修復、セクション既読の同期を定義する。

この仕様は導入時点の実装・コメントから復元した現状の基準である。根拠と詳細な設計判断は [design.md](design.md)、確認された不整合は [known-gaps.md](../../known-gaps.md) を参照する。記載するシナリオは確認条件であり、今回すべての外部サービスを実行検証したという意味ではない。

## Requirements

### Requirement: NOTIFY-01 一覧・Push設定と件数

通知設定はアカウント単位でAppViewが一覧・未読・Pushの全てへ適用しなければならない（MUST）。UIの1トグルはlist/pushの両方へ同じ値を書き、未設定は有効とする。通知件数の正本はサーバのreadAtで、別のローカル通知既読を作らない。

#### Scenario: トグル変更

- **WHEN** 通知種別をオフにする
- **THEN** 設定全体を送信しlistとpushを揃える

#### Scenario: 設定保存失敗

- **WHEN** 楽観的に切り替えたAPIが失敗する
- **THEN** 見た目を戻し、保存中の並行変更を止める

### Requirement: NOTIFY-02 読み直しと既読の上限

一覧はOAuth復元後、初回・画面復帰・ナビ再タップで再取得し、表示できた最新createdAtまで既読にしなければならない（MUST）。取得後に到着した未表示通知まで消さない。未読取得は60秒・復帰・Push受信で行い、既読化前の古い応答を世代で捨てる。

#### Scenario: 一覧表示中の新着

- **WHEN** 取得後に通知が到着する
- **THEN** 表示していない通知をseenAtへ巻き込まない

#### Scenario: 再取得失敗

- **WHEN** 既存一覧がある状態で通信が落ちる
- **THEN** 一覧を消さず次回へ残す

### Requirement: NOTIFY-03 端末購読とサーバ登録の分離

ブラウザ購読意思とAppView登録成功は別状態で保持しなければならない（MUST）。端末に購読があれば起動・復帰等で冪等再登録し、サーバ一時失敗だけで端末の意思をOFFにしない。解除が端末で成功したら表示をOFFに保つ。iOS非standalone等の非対応環境では理由を案内する。

#### Scenario: 端末だけ購読済み

- **WHEN** AppViewの購読行が失われる
- **THEN** 次の同期で再登録して自己修復する

#### Scenario: 再登録の一時失敗

- **WHEN** ブラウザの購読は有効
- **THEN** 購読意思を保持し復帰時の再試行に委ねる

### Requirement: NOTIFY-04 Service Workerの互換性

SWはキャッシュを担当せずPush受信・クリック・購読更新を薄く担当しなければならない（MUST）。payloadは全項目optionalで旧サーバ/旧SWを扱う。tag欠落時は一意な値を作り、同種通知の上書き消失を防ぐ。skipWaitingとclients.claimで更新を反映する。

#### Scenario: tag無しの連続通知

- **WHEN** 同じtypeの通知が2通届く
- **THEN** typeをtagに流用せず両方を気付ける通知にする

#### Scenario: アプリ表示中の受信

- **WHEN** SWがPushを表示する
- **THEN** 開いているタブへ合図し未読件数を即時再取得する

### Requirement: NOTIFY-05 installation capabilityと遷移

SWの購読更新はDIDを変更できない端末固有capabilityを使い、失敗時はブラウザの認証済み修復へ引き継がなければならない（MUST）。クリック時は既存windowへfocusして遷移し、無ければ新規に開く。通知種別とsubjectに応じて記事・日記・年表・カード等の正しい画面へ送る。

#### Scenario: 購読鍵の更新

- **WHEN** SWだけでpushsubscriptionchangeを受ける
- **THEN** 同じ受取人の購読だけを更新する

#### Scenario: 無関係の付随post

- **WHEN** 通知subjectと別postが付く
- **THEN** そのpostの記事属性でsubjectの遷移先を変えない

### Requirement: UNREAD-01 セクション既読の単調性

セクション既読はindexedAt DESC, uri DESCの順で比較し、新しい方へだけ進めなければならない（MUST）。初利用端末は現在位置を既読基準とし、表示ビューは開いた時点の基準を凍結する。空のindexedAtは位置に使わない。localStorage失敗時もメモリ状態を維持する。

#### Scenario: 別端末の古い位置

- **WHEN** 現在より古いremoteを受信する
- **THEN** 既読を後退させない

#### Scenario: 表示中の既読化

- **WHEN** 最新表示分まで保存位置を進める
- **THEN** 凍結したビューの未読マークは消さない

### Requirement: UNREAD-02 スコープと同期の分担

セクションは1インスタンスへ集約し、DID変更時に作り直さなければならない（MUST）。news等のアカウント同期と端末だけのfeed既読を区別する。guestはサーバへ送らず、remote取り込みは反射送信しない。全削除時は生きたインスタンスも破棄して消したキーを書き戻させない。

#### Scenario: サインアウト中の既読

- **WHEN** guestがニュースを読む
- **THEN** 本人の既読へ混ぜず端末内へ閉じる

#### Scenario: 全データ削除後

- **WHEN** 旧watermarkがメモリに残りうる
- **THEN** インスタンスを捨てて保存値の復活を防ぐ
