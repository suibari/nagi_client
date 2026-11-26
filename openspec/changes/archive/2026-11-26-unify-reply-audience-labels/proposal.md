# Proposal

## Why

同じ投稿範囲モーダルの「返信できる人」で、Nagiは「返信不可」、Blueskyは「誰も返信できない」と表示している。Nagiでは投稿者本人が返信できるため、全員の返信が止まると読める文言を避け、既存の「返信不可」に揃える。

## What Changes

- Nagi内のBluesky返信範囲で「誰も返信できない」を「返信不可」に、英語では「Nobody」を「No replies」に変更する。クロスポスト、Bluesky専用投稿、投稿後の設定で同じ選択肢を表示する。
- 返信・引用の設定値、保存先、適用条件は現行仕様に従う。
- 周辺文言の調査結果は設計に記録する。追加で見つけた文言の修正は今回の対象外とする。

## Capabilities

### Modified Capabilities

- `bluesky-integration` の BSKY-12 に返信範囲の表示文言を定める。Nagi側は POST-10 の既存表記を使用する。

## Impact

Nagiクライアントの返信範囲コントロールと日英の翻訳辞書に影響する。AppView、bot、レコード形式への変更は不要。
