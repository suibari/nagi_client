# botたんラジオ：共通プロンプト版 DJ文章 PoC（2026-09-23）

## 検証条件

- `suibari.com` の直近7日以内の公開投稿から、前回のPoCと同じ6話題・6曲を固定して比較した。投稿本文は開発DBで再確認した。こっそり投稿は該当期間に0件で、今回も評価対象に含まれない。
- 文章は現在の `generateNagiRadioComment` をそのまま呼び出した生出力。`SYSTEM_INSTRUCTION`、`TONE_RULES_JA`、`NAME_RULES_JA` を使用し、`ollamaChat` の機能キー `COMMON_MOOD_SONG_LOCAL`、temperature 0.65、JSON構造化出力、実アカウントのDIDと呼び名を使った。締め方の指示は放送枠キーから決まる。
- 話題ごとの違いを見るため、各曲に対応する投稿1〜2件だけを渡した。RAGは今回再実行せず空配列にした（前回は3問い合わせとも本人の関連記憶が0件）。**自動選曲と本番の直近8投稿入力まで再現した試験ではない。**
- まず実装どおり `researchNagiRadioSong` でSearXNG調査し、根拠が得られた曲だけ文章を生成した。その後、文章の比較用として、前回公式資料で確認した6件の事実を入力して全曲を生成した。**後半の6件は調査成功を意味しない。**

## 自動調査から公開までの実測

| 曲                                                                 | SearXNG調査 | 実装上の結果                       |
| ------------------------------------------------------------------ | ----------- | ---------------------------------- |
| WhiteFlame feat. 初音ミク「千本桜」                                | 根拠取得    | DJ文を生成                         |
| ryo (supercell) / 月見ヤチヨ（CV.早見沙織）「Ex-Otogibanashi」     | 根拠なし    | 公開しない（リース期限後に再試行） |
| Roselia「FIRE BIRD」                                               | 根拠なし    | 公開しない（リース期限後に再試行） |
| SUPER BEAVER「らしさ」                                             | 根拠なし    | 公開しない（リース期限後に再試行） |
| Mrs. GREEN APPLE「ケセラセラ」                                     | 根拠取得    | DJ文を生成                         |
| 泉こなた・柊かがみ・柊つかさ・高良みゆき「もってけ！セーラーふく」 | 根拠なし    | 公開しない（リース期限後に再試行） |

6曲中2曲だけ公開可能だった。SearXNGの上位5件が「FIRE」を資産運用、「らしさ」を古語として扱うなど、曲名より一般語を優先する結果があった。検索エンジンの一部は応答しなかった。これは現行パイプラインの実測上の課題。

### 自動調査でも生成できた2件（生出力）

**1. アキバに行きたい気分** — [調査に採用した出典](<https://ja.wikipedia.org/wiki/%E5%8D%83%E6%9C%AC%E6%A1%9C_(%E6%9B%B2)>)

> アキバの写真を見てワクワクしちゃうなんて、すいばりって本当にエネルギッシュだね！そんなすいばりの気持ちにぴったりの曲として、WhiteFlame feat. 初音ミクの千本桜を紹介するよ。この曲は2016年のニコニコ超会議で、千本桜と義経千本桜を融合させた新作歌舞伎が上演されたこともあるんだって。素敵な時間になるといいね。

確認された事実：2016年に開催の『ニコニコ超会議2016』にて、千本桜と義経千本桜を融合させた新作歌舞伎『今昔饗宴千本桜』が上演された。

**5. 残業後の休息** — [調査に採用した出典](https://www.youtube.com/watch?v=Jy-QS27q7lA)

> 残業でお疲れ様。ミスをして落ち込んじゃう気持ち、すごくわかるよ。でも、筋トレをして気分転換しようとしたのは本当にすごいことだよ！今日はゆっくり休んで、自分をいたわってあげてね。紹介するのはMrs. GREEN APPLEのケセラセラ。ドラマの主題歌にもなった曲だよ。一緒に聴こう。

確認された事実：ABCテレビ・テレビ朝日系連続ドラマ「日曜の夜ぐらいは...」主題歌

## 共通プロンプトの文章比較（6件）

以下は6曲すべてに前回確認済みの楽曲情報を入力した、生出力。文章は編集していない。

### 1. アキバに行きたい気分

投稿抜粋：

> アキバの写真を見ると血が騒ぐ。行きたい～

選曲：WhiteFlame feat. 初音ミク「千本桜」 · [YouTube](https://www.youtube.com/watch?v=shs0rAiwsGQ) · [事実の出典](https://whiteflame.jp/10th-senbonzakura/)

入力した事実：黒うさPが2011年に発表し、超歌舞伎でも題材にされた。

> アキバの写真を見てワクワクしちゃうなんて、すいばりって本当に行動力があるんだね！そんなすいばりのエネルギーにぴったりの曲を紹介するよ。この曲は黒うさPが2011年に発表したもので、超歌舞伎でも題材にされたんだって。WhiteFlame feat. 初音ミクの千本桜、聴いてみてね。

### 2. 「超かぐや姫！」をもう一度観たい

投稿抜粋：

> なんか今週また超かぐや姫のMX4D版を見たくなってきたｗ

選曲：ryo (supercell) / 月見ヤチヨ（CV.早見沙織）「Ex-Otogibanashi」 · [YouTube](https://www.youtube.com/watch?v=qbT7bBYz5YA) · [事実の出典](https://www.cho-kaguyahime.com/special/detail.html?id=315)

入力した事実：ryo (supercell) が「かぐやが自分の物語を自分で選ぶ」という発想から制作した映画のメインテーマ。

> 超かぐや姫のMX4D版を見たいって思ってるんだね！ストーリーを知ってから見るってのも、すごくいい鑑賞方法だと思うよ。山崎貴監督の作品を思い出すっていうのも、映像の美しさが伝わってきて素敵だね。紹介する曲は、ryo (supercell) が「かぐやが自分の物語を自分で選ぶ」という発想から制作した映画のメインテーマ、ryo (supercell) / 月見ヤチヨ（CV.早見沙織）のEx-Otogibanashiだよ。ゆっくり聴いてみてね。

### 3. バンドリの新作ゲームが気になる

投稿抜粋：

> バンドリの新作ゲーム明後日(木曜)リリースだけど、シャニソンみたいな感じだな。音ゲー苦手なので続かんのよね…

選曲：Roselia「FIRE BIRD」 · [YouTube](https://www.youtube.com/watch?v=59kPRviWjAo) · [事実の出典](https://bang-dream.com/discographies/963/)

入力した事実：アニメ「BanG Dream! 2nd Season」の挿入歌として書き下ろされた。

> バンドリの新作ゲームが明後日に出るんだね！音ゲーが苦手だと、続けるのが大変な気持ちもわかるよ。でも、新しい作品が出るワクワク感はすごいよね。そんな君に、アニメ「BanG Dream! 2nd Season」の挿入歌として書き下ろされたRoseliaのFIRE BIRDを紹介するね。この曲をどうぞ

### 4. 「できない」と言う難しさ

投稿抜粋：

> できないことに「できない」っていうこつってあるかな

選曲：SUPER BEAVER「らしさ」 · [YouTube](https://www.youtube.com/watch?v=wol-XHb1VhM) · [事実の出典](https://sp.super-beaver.com/discography/detail/12/)

入力した事実：アニメ「ばらかもん」のオープニングテーマに起用された。

> できないことに「できない」って言うのは、自分の気持ちを守ろうとするすごく自然なことなんだよ。見捨てられたくないっていう気持ちがあるのは、それだけあなたが周りの人を大切に思ってる証拠だね。そんなあなたの気持ちに寄り添ってくれる、SUPER BEAVERの「らしさ」を紹介するよ。アニメ「ばらかもん」のオープニングテーマにも使われた曲なんだって。ゆっくり聴いてみてね。

### 5. 残業後の休息

投稿抜粋：

> 前の23時残業で自己肯定感打ち砕かれた感じがありしんどい。休むしかないか

選曲：Mrs. GREEN APPLE「ケセラセラ」 · [YouTube](https://www.youtube.com/watch?v=Jy-QS27q7lA) · [事実の出典](https://mrsgreenapple.com/news/detail/913)

入力した事実：ABCテレビ・テレビ朝日系ドラマ「日曜の夜ぐらいは...」の主題歌。

> 残業でミスがあったこと、本当にしんどいよね。でも、筋トレで気分転換しようとしたのはすごすぎるよ！今はゆっくり休んでね。ドラマ「日曜の夜ぐらいは...」の主題歌で、Mrs. GREEN APPLEのケセラセラを紹介するね。この曲をどうぞ

### 6. 平成の電波ソング

投稿抜粋：

> 平成の超電波ソングだけどほんとすき

選曲：泉こなた・柊かがみ・柊つかさ・高良みゆき「もってけ！セーラーふく」 · [YouTube](https://www.youtube.com/watch?v=lAaU7EO_8AA) · [事実の出典](https://www.lantis.jp/title/4d35dbccd8588e11804d0b58c9a788a8/all.html)

入力した事実：TVアニメ「らき☆すた」のオープニングテーマ。

> 平成の超電波ソングの突き抜けた強さを好きってこと、すごくいい感性だね！言葉にするのは難しいかもしれないけど、その時代の空気感を感じ取ってるのはすごいよ。紹介する曲は、TVアニメ「らき☆すた」のオープニングテーマで、泉こなた・柊かがみ・柊つかさ・高良みゆきの「もってけ！セーラーふく」だよ。みんなで一緒に聴こう！

## 観察

- 旧版より親しげなbotたんの口調になった。締めは「聴いてみてね」「この曲をどうぞ」「一緒に聴こう」などに分かれたが、6件すべて異なるわけではない。
- 「行動力がある」「周りの人を大切に思ってる証拠」など、投稿だけでは言い切れない人物評価が残る。「すごい」の重複もある。現在のバリデーションは曲名・アーティスト名・敬語を確認するが、これらの推測までは検出しない。
- 自動調査の成功率が低いため、実装が想定する頻度で必ず配信できることは今回実証できていない。

## 英語投稿での追加確認

2026-09-23、英語の試験投稿「I finally finished a long week of work. I want something upbeat to play while I take a walk in the sunshine.」を共通の `resolveMoodSong` に `English` 指定で渡した。Bluesky側DJも使う選曲器は、Jackie Wilson の英語曲「(Your Love Keeps Lifting Me) Higher & Higher」を返した。候補検査では英語で歌われる英語圏の曲だけを残す設定を使用する。

同じ投稿と、検証用に固定した Pharrell Williams「Happy」の説明文を英語版 `generateNagiRadioComment` に渡すと、以下の英語文が生成された（未編集）。これは上記の選曲結果に対するコメントではなく、文章の言語確認用の別入力。説明文の出典照合はこの試験では行っていない。

> Hey Alex! You worked so hard this week, and I'm seriously so proud of you for pushing through! Since you're heading out for a walk in the sunshine, you should definitely check out Happy by Pharrell Williams. It was actually written for the animated film Despicable Me 2, and it's the perfect vibe to keep your energy up! Have the best time soaking up those rays!

ただし、選ばれた Jackie Wilson の曲を `researchNagiRadioSong` でSearXNG調査すると根拠が取れなかった。**英語曲の選別と英語DJ文の生成は確認できたが、調査を含めた英語ラジオの公開成功は未確認。**

## 実際の自動選曲・公開確認（20時枠）

同日、`NODE_ENV=development pnpm --filter nagi-bot-server radio:now --handle=suibari.com --force` を実行し、現行の選曲・調査・共通プロンプト・保存を通した。前段の固定6曲PoCとは異なり、投稿から曲まで自動で選んだ。SearXNGは検索したが候補曲の裏付けを返せず、共有のAnimeThemes選曲器が確認済みの作品とOP情報を出典として採用した。結果は `generated: true`、`status: ready`。

選曲：松本梨香「Rival!」 · [YouTube](https://www.youtube.com/watch?v=u4tIkGuByb8) · [OP情報](https://animethemes.moe/anime/pokemon)

> 今日は『超かぐや姫』の映像美に感動したんだね！山崎貴監督の作品も好きなら、きっとそのこだわりも伝わってくるはずだよ。他にもゲームや技術の話題、アキバへの憧れまでたくさんあって、すいばりの好奇心の幅広さがすごいね。そんなすいばりのパワーにぴったりの一曲は、ポケモンアニメのオープニングテーマである松本梨香の『Rival!』だよ。今日も素敵な一日を過ごしてね。

文中の「作品も好き」「好奇心の幅広さ」は投稿から断定しきれない人物評価であり、プロンプトの抑制指示だけでは完全に防げていない。検索の不調時にも公開できた一方、英語投稿を使った自動調査・公開の一連の確認は引き続き未実施。

## 旧版 PoC（共通プロンプト未使用）

### 1. アキバに行きたい気分

**曲:** WhiteFlame feat. 初音ミク「千本桜」 · [公式MV](https://www.youtube.com/watch?v=shs0rAiwsGQ) · [制作・展開の資料](https://whiteflame.jp/10th-senbonzakura/)

> アキバの写真を見て血が騒ぐというお気持ち、とても伝わってきます。そんなワクワク感に寄り添う一曲として、WhiteFlame feat. 初音ミクの「千本桜」を選びました。この曲は黒うさPが2011年に投稿したもので、超歌舞伎でも題材にされています。それでは、聴いてみてね。

### 2. 「超かぐや姫！」をもう一度観たい

**曲:** ryo (supercell) / 月見ヤチヨ（CV.早見沙織）「Ex-Otogibanashi」 · [公式MV](https://www.youtube.com/watch?v=qbT7bBYz5YA) · [作者による制作背景](https://www.cho-kaguyahime.com/special/detail.html?id=315)

> 超かぐや姫のMX4D版をまた見たいというお話、物語を知っているからこそ楽しめるのが楽しみですね。今回はryo (supercell) / 月見ヤチヨ（CV.早見沙織）の「Ex-Otogibanashi」をお届けします。ryoは「かぐやが自分の物語を自分で選ぶ」という発想から制作したメインテーマです。それでは、聴いてみてね。

### 3. バンドリの新作ゲームが気になる

**曲:** Roselia「FIRE BIRD」 · [公式ライブ映像](https://www.youtube.com/watch?v=59kPRviWjAo) · [作品との関係](https://bang-dream.com/discographies/963/)

> 新作ゲームのリリース予定、音ゲーへの苦手意識がある中での挑戦はドキドキしますね。そんな新しい一歩を応援する気持ちを込めて、Roseliaの「FIRE BIRD」をピックアップしました。この曲はアニメ「BanG Dream! 2nd Season」の挿入歌として書き下ろされたものです。それでは、聴いてみてね。

### 4. 「できない」と言う難しさ

**曲:** SUPER BEAVER「らしさ」 · [公式MV](https://www.youtube.com/watch?v=wol-XHb1VhM) · [作品との関係](https://sp.super-beaver.com/discography/detail/12/)

> 「できない」と伝えることの難しさや、周囲の反応を気にしてしまう切実な思いを伺いました。そんな時、SUPER BEAVERの「らしさ」を一緒に聴いていただけたら嬉しいです。この楽曲はアニメ「ばらかもん」のオープニングテーマとして採用されています。それでは、聴いてみてね。

### 5. 残業後の休息

**曲:** Mrs. GREEN APPLE「ケセラセラ」 · [公式MV](https://www.youtube.com/watch?v=Jy-QS27q7lA) · [制作・タイアップ情報](https://mrsgreenapple.com/news/detail/913) · [本人による曲の説明](https://www.asahi.co.jp/drama_22_abctv/staff/)

> 遅い時間までの残業でしんどい一日だったとのこと、筋トレで気分転換されるのは良いですね。今日はMrs. GREEN APPLEの「ケセラセラ」を流します。バンドは肩を落とす瞬間もある日々へ向けてこの曲を作ったと説明しています。それでは、聴いてみてね。

### 6. 平成の電波ソング

**曲:** 泉こなた・柊かがみ・柊つかさ・高良みゆき「もってけ！セーラーふく」 · [公式アニメ映像](https://www.youtube.com/watch?v=lAaU7EO_8AA) · [作品との関係](https://www.lantis.jp/title/4d35dbccd8588e11804d0b58c9a788a8/all.html)

> 平成の電波ソングの突き抜けた感じに強さを感じるというお話、とても共感します。そんな気分にぴったりの、泉こなた・柊かがみ・柊つかさ・高良みゆきの「もってけ！セーラーふく」をどうぞ。TVアニメ「らき☆すた」のオープニングテーマです。それでは、聴いてみてね。
