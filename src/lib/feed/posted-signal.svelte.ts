/**
 * 投稿完了の合図。
 *
 * Composer が各ページにインラインで置かれていた頃は `onposted` を直接渡せたが、
 * ポストモーダルは +layout.svelte に1つだけ常駐するため、投稿できたことを
 * 表示中のフィードへ伝える経路が要る。カウンタを1つ増やすだけの最小の仕組みにして、
 * 各ページは $effect でこれを購読して自分の feed.refresh() を呼ぶ。
 *
 * なお optimisticPosts は元からグローバルで Feed.visibleItems が合流させるので、
 * 投稿直後の表示自体はこの合図が無くても成立する。ここでの refresh は
 * サーバ側の確定データ（botたんの返信予定など）へ寄せるためのもの。
 */
class PostedSignal {
	count = $state(0);

	notify() {
		this.count += 1;
	}
}

export const postedSignal = new PostedSignal();
