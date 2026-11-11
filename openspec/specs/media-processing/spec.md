# 画像・GIF・動画・リンクカード

## Purpose

添付の制約、変換・再生、投稿を妨げないメタデータ取得を定義する。

この仕様は導入時点の実装・コメントから復元した現状の基準である。根拠と詳細な設計判断は [design.md](design.md)、確認された不整合は [known-gaps.md](../../known-gaps.md) を参照する。記載するシナリオは確認条件であり、今回すべての外部サービスを実行検証したという意味ではない。

## Requirements

### Requirement: MEDIA-01 添付の容量と組み合わせ

通常投稿の画像は4枚、動画は1本までとし両者の併用を認めなければならない（MUST）。記事の画像枚数には同じ上限を掛けない。通常画像と記事カバーの圧縮上限を区別し、coverImageは1MB未満に収める。TriLinesの行画像の上限は別契約とする。

#### Scenario: 画像4枚と動画

- **WHEN** 動画をまだ持たない通常投稿へ動画を加える
- **THEN** 画像上限だけで動画選択を禁止しない

#### Scenario: 記事カバー

- **WHEN** ヘッダー画像を追加する
- **THEN** 通常添付より強く圧縮し、先頭かつheader印で管理する

### Requirement: MEDIA-02 GIFの品質と端末保護

GIFはフレームを間引かず、色数と寸法を段階調整しなければならない（MUST）。2MB以下に達したら追加の高画質化をせず、出力サイズから無効な試行を飛ばし、最終試行は最小設定とする。過大なデコード入力を止め、透過は二値のまま維持する。

#### Scenario: 早期成功

- **WHEN** 途中の圧縮で2MB以下になる
- **THEN** それ以上の試行をせず結果を返す

#### Scenario: 透過GIF

- **WHEN** 画像を縮小する
- **THEN** 透明境界を半透明の色へ変えない

### Requirement: MEDIA-03 動画送信のライフサイクル

動画は添付時にvideo.bsky.appへの送信・変換を開始し、readyまで投稿を禁止しなければならない（MUST）。形式・300MB上限・長さ・デコード可否・残り枠を確認する。upload limitsとupload videoのservice authのaudを混同しない。取り外し・差し替えで中止しObject URLを解放する。

#### Scenario: 変換中

- **WHEN** blobがまだ返らない
- **THEN** 投稿ボタンを有効にしない

#### Scenario: モーダルを閉じる

- **WHEN** 動画送信が継続中
- **THEN** 送信を続け、ページ再読込やタブ終了では離脱確認を出す

### Requirement: MEDIA-04 進捗と動画サービス互換

送信中だけ実バイト数による%を示し、変換・仕上げは段階表示にしなければならない（MUST）。平らなjobStatus応答と409の既存jobを扱い、一時的なpoll失敗では続行する。再利用blobがPDSから消えていれば投稿前に止める。

#### Scenario: 同じ動画を再送

- **WHEN** uploadVideoが409とjobIdを返す
- **THEN** 失敗と決めつけず既存の変換結果を確認する

#### Scenario: 前の投稿を削除済み

- **WHEN** 既存blobがPDSに存在しない
- **THEN** 保存時のBlobNotFoundになる前に選び直しを案内する

### Requirement: MEDIA-05 HLS再生と音の競合

MSE対応ブラウザはhls.jsを優先し、MSE無しだけ組み込みHLSを利用しなければならない（MUST）。新しい動画の再生時は前の動画を止める。hls.js利用時の一時的なvideo要素エラーだけで停止しない。縦動画は高さを抑える。

#### Scenario: Chromeのmaybe

- **WHEN** canPlayTypeがHLSにmaybeを返すがMSEがある
- **THEN** リダイレクト失敗を避けhls.jsを選ぶ

#### Scenario: 動画を切替

- **WHEN** 別の動画を再生する
- **THEN** 同時に音が鳴らない

### Requirement: MEDIA-06 URLとメタデータのフォールバック

リンクカードはhttp(s)だけをリンクにしなければならない（MUST）。メタデータ取得とCardybの両方が失敗してもホスト名で表示し、投稿を塞がない。記事はURL単独行にカードを置き、消した行のカードを末尾に再出現させない。Object URLは自分が生成したものだけ解放する。

#### Scenario: 危険scheme

- **WHEN** カードURIがjavascript:である
- **THEN** クリック不能のカードとして描画する

#### Scenario: メタデータ失敗

- **WHEN** 取得先とフォールバックが応答しない
- **THEN** ホスト名を残して投稿可能にする
