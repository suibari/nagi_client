# 絵文字生成機能 設計（2026-10-28）

> **実装時の変更（同日）**
> - モード（文字／イラスト）は無くし、プロンプトを1つ書くだけにした。受付時に gemma が「描く内容（英文）」「書く文字」「縦横比」「登録名」「説明」を作る。本人は候補の「登録」を押すだけ（絵文字名は重複してよい）。
> - 画風は suibari LoRA 1.0 で統一。文字だけの絵文字に顔などが描き足されることがあるが、botたんが描くものなのでご愛敬とする。
> - タブは左から「AIでつくる」（既定）「画像から作成」「まとめて作成」「作成した絵文字」。
> - 即時復旧は biorhythm ではなく、GPU 機の ollama-recovery が imggen の `/health` を見て行う（復旧を動かしているのはそちらだったため）。
> - サーバー側の現行仕様は bsky-affirmative-bot の `docs/emoji-generation.md`。以下は検討時の記録。

プロンプトから Nagi のカスタム絵文字（Bluemoji）を imggen（MOSS-Image）で生成する。
クライアント（nagi_client）、AppView（bsky-affirmative-bot / apps/nagi_appview）、
imggen サイドカー（bot-tan-imagegen）の3者で協調する。

## 検証で決まったこと

| 項目 | 結論 |
|---|---|
| 画風 | 絵文字テンプレート（bold simple shapes, no fine details）で、小サイズでも潰れない絵が出る。suibari LoRA を当てても絵文字らしさは保たれる |
| 文字 | 6文字まで誤字なし。文字列は `"…"` で囲んで英語テンプレートに埋める |
| 縦横比 | 3文字以上を正方形に収めると26px表示で読めない。文字数で横長にする（Nagi は横長絵文字を高さ揃えで表示する） |
| 背景の透過 | 白背景＋形の判定は、白い縁取りや白い被写体で必ずどこかが破綻する。**クロマキー背景（マゼンタ／緑）で生成し、キー色に近い画素を一律に抜く**。ループの内側（ら・草など）も同じ規則で抜ける |
| キー色の衝突 | ピンクの被写体をマゼンタ背景に置くと半透明になる。抜いた後に「輪郭の帯を除いて面で半透明になった画素の割合（conflict）」が 0.05 を超えたら、もう一方の色で撮り直す（破綻例 0.418、正常 ≤ 0.005） |
| 日本語プロンプト | 名詞は伝わるが、修飾・動作が落ちる（三毛→茶白、ガッツポーズ無し、なると無し）。**イラストモードは gemma で英訳してから渡す** |
| 候補の多様性 | シードを変えても構図・色がほぼ同じ。**候補はスタイル違いで出す** |
| 生成時間 | 768² 相当で1枚 30〜45秒（ComfyUI の起動時は＋30秒程度） |

## 全体構成

```
Nagi クライアント ──(PDS プロキシ)──▶ AppView（ラズパイ5）──(LAN)──▶ imggen サイドカー（5070 Ti 機）──▶ ComfyUI / MOSS
  依頼・一覧・候補選択・登録           プロンプト組み立て・ジョブ（DB）・通知        生成・クロマキー抜き・128px化
```

生成済み候補の登録は、既存のカスタム絵文字登録（`processImage` → blob アップロード → bluemoji レコード）をそのまま使う。

## imggen サイドカー

「画風は呼び出し側が決める」方針どおり、サイドカーには画像処理だけを足す。

- `/generate` に `cutout` オプションを追加する。例：`{"type": "chroma", "key": [255, 0, 255], "max_side": 128}`
  - 縁の中央値からキー色を推定し、色距離で alpha を作る。半透明部は背景色の混ざりを差し引く
  - トリミング、3%の余白、長辺128pxに縮小
  - 応答に `conflict` を含める
- 1リクエスト1枚、同時実行1のまま。候補は1枚ずつ別リクエストにして、bot の1日1枚が合間に入れるようにする
- `batch_size` による複数枚同時生成は、速度もVRAMも未計測なので見送る

## AppView

### API

| NSID | 種別 | 内容 |
|---|---|---|
| `com.suibari.nagi.createEmojiGeneration` | procedure | `mode`（`text` / `illust`）、`text`、`aspect`（`auto` / `square` / `wide`）→ `jobId`、目安の待ち時間 |
| `com.suibari.nagi.getEmojiGenerations` | query | 本人のジョブ一覧（state、待ち順、完了枚数、候補） |

- `requiredServiceAuth` で本人に限り、`private, no-store` にする
- `IMAGEGEN_BASE_URL` が無ければ機能ごと無効にする

### ジョブ（DB）

- `nagi.emoji_generations`：id、did、mode、入力、英訳後の文、state（`queued` / `running` / `done` / `failed`）、候補PNG、失敗理由、作成・完了日時、有効期限
- 候補は1日で削除する。AppView が再起動しても、途中まで描いたジョブは続きから描く
- ワーカーは全体で1本、順番に処理する

### 利用制限

- 回数制限なし、全ユーザーが使える
- 1ユーザーにつき未完了ジョブは同時1件まで（順番待ちの公平さのため）
- 全体の待ち件数に上限（例：20件）。超えたら「混み合っています」を返す

### GPU の同居相手を守る

5070 Ti には bot 用 ollama（gemma-4-12B、約7.9GB）、Irodori-TTS（待機0.4GB、読み上げ時に約3.8GB）、imggen サイドカー（生成時だけ ComfyUI）が同居する。
MOSS の速度は落とせないので、ComfyUI の VRAM に上限は設けない。OOM が起きたら `reloadOllama` で復旧する前提で、**OOM の回数と劣化時間を最小にする**。

#### 2026-10-28 に起きたこと

| 時刻 | 出来事 |
|---|---|
| 〜10:41 | MOSS を連続で生成中。ComfyUI が空き VRAM をほぼ使い切る（`--reserve-vram 2.0` は上限として効かず、空き 342MB を観測） |
| 10:41:24 | 機内（127.0.0.1）からの `/api/chat` で、ollama が計算バッファ 311MB を追加確保しようとして `cudaMalloc failed: out of memory`。`runtime OOM detected; expiring loaded models` でモデルを降ろす |
| 10:41:57 | bot-tan-youtuber（ARDY）の `_free_imagegen` が、システム RAM 不足でサイドカーを `/unload` |
| 10:41:57〜 | 検証スクリプトの次の生成が ComfyUI をすぐ立ち上げ直す |
| 10:42:55 | ollama が空き 3.6GB で読み直し、49層中11層だけ GPU に載る |
| 10:46:54 | ComfyUI 停止後、`reloadOllama` が全49層を載せ直す |

Irodori を 5060 Ti に移しても解決しない。ComfyUI は空いた分を使い切るだけで、5060 Ti も約12.1GB 使用中で、Irodori の読み上げ時の約3.8GB を足すと容量ぎりぎりになる。

#### `reloadOllama`（biorhythm_server）の条件

- mixed（一部が CPU）で、GPU に載っている分＋空き ≥ 9GiB が 120秒続いたら載せ直す
- 試行のあと30分は次を試さない。3回失敗で blocked（手動で戻すまで止まる）
- つまり30分以内に2回 OOM が起きると、2回目は最大30分劣化が続く

#### 対策

- 候補1枚ごとに、生成前に ollama の配置（`/api/ps` の `size_vram == size`）を確認する。mixed ならワーカーは止まり、ComfyUI は降ろしたままにする（復旧中に ComfyUI が VRAM を取ると、また一部しか載らない）
- キューが空になったらすぐ `/unload` し、VRAM と RAM（ComfyUI は RSS 約13GB）を返す。ARDY が降ろしに来る前に返す
- 絵文字の生成で mixed になったら、ワーカーが ComfyUI を降ろしたうえで biorhythm の内部 API に即時復旧を頼む。30分の待ちと120秒の安定待ちを飛ばす（biorhythm に内部 API を足す。どちらもラズパイ上）
- 復旧の状態が blocked なら、絵文字の受付を止めて「混み合っています」を返す
- 全体で1時間あたりの生成数に上限を設ける（同じ時間帯に OOM を繰り返さないための安全弁）
- ollama の `runtime OOM detected` の件数と、応答の `meta.ollamaEvicted` を記録する。頻度が高ければ、速度への影響を測ったうえで `--reserve-vram` を見直す

### プロンプトの組み立て

| モード | 入力 | 縦横比 | LoRA |
|---|---|---|---|
| 文字 | 文字列（6文字まで）＋任意の色・雰囲気 | 1〜2文字は 768² ／ 3〜4文字は 1088×544 ／ 5〜6文字は 1280×448 | 要調整（下記） |
| イラスト | 描くもの（100字程度まで、gemma で英訳） | 正方形 または 2:1 | suibari 1.0 |

- 画風は bot と同じ suibari：チェックポイント `moss_image_sft_int8_convrot.safetensors`、LoRA `moss-suibari-v1-000006.safetensors`。先頭に `suibari style. A loose hand-drawn sketch with rough lines and simple flat colors.` を置く
- テンプレート（bold simple shapes, no fine details、背景指定）はサーバーで固定し、ユーザー入力は描く対象の部分にだけ入れる
- 候補は3案。スタイル違いで出す（文字なら、白＋濃い縁の二重縁取り／キラキラ付き／手書き風 など）
- キー色はマゼンタが基本。入力に ピンク・桃・マゼンタ・紫・pink・magenta などがあれば緑から始める。`conflict > 0.05` ならもう一方の色で1回だけ撮り直す
- 生成前に入力を既存の OpenAI moderation に通す。登録後の絵文字は、取り込み時のモデレーション（`moderationWorker` の emojis）でも判定される

### 完了通知

- `notification_type` に `emoji` を追加する。「gift」と同じく AppView が直接作り、プッシュ通知も送る

## クライアント

- 絵文字登録画面に「AIで作る」を追加：モード切替、入力欄、縦横比（文字モードは自動）
- 送信したら受付トーストを出す。例：「受け付けました（目安：約N分）。ほかの画面に移動しても大丈夫です。できたらお知らせします」
- 「生成した絵文字」タブに、待ち（待ち順）・生成中（n/3）・完了・失敗の一覧を出す。通知からここへ飛ぶ
- 候補は白・ダークの背景と実際の表示サイズ（26px）で見せる。選んで名前を付け（既定は入力した文字列）、既存の登録処理へ渡す
- 生成した絵文字のレコードには `labels: { $type: "com.atproto.label.defs#selfLabels", values: [{ val: "ai-generated" }] }` を付ける。`blue.moji.collection.item` の定義に `labels` の欄がある。表示は別の作業として後回し

## 未解決

- 文字モードと suibari LoRA の組み合わせ：「No characters or faces」と指定しても、文字の横に顔が付くことがあった（それな）。LoRA の重みを下げる・外す・テンプレートを直す、のどれにするかを検証する
- 1時間あたり上限と、待ち件数上限の具体的な値
- biorhythm の即時復旧 API の形（認証、呼べる条件）
- TTS 読み上げ中に MOSS を回したときの VRAM の釣り合い（README でも未測定）
- ARDY（bot-tan-youtuber）の動く時間帯（朝6時・夕18時）に絵文字の生成を止めるかどうか

## 実装の順番

1. サイドカー：`cutout` と `conflict`
2. AppView：lexicon、DB テーブル、ワーカー（GPU 確認込み）、プロンプト、英訳、通知。biorhythm に即時復旧の内部 API
3. クライアント：生成 UI、一覧タブ、登録処理への接続、`ai-generated` ラベル
4. 調整：文字モードの LoRA、スタイル3案、各上限の値
