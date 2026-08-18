import { drawCard } from '$lib/api/appview';
import type { CardView } from '$lib/api/types';
import { cardCollections } from './collection.svelte';
import { session } from '$lib/oauth/session.svelte';

/**
 * 記念日カードの受け取り。ガチャと違って本人の操作を待たず、記念日にログインした時点で
 * 自動的に受け取ってモーダルを開く（記念日は1日しか来ないので、気づかず終わるのが一番惜しい）。
 *
 * 同じ日に複数の記念日が重なる（ハロウィン + ユーザー記念日など）ことがあるので、
 * 受け取ったぶんはキューに積んで**1枚ずつ順番に**出す。モーダルを重ねない方針は
 * ReactionCardRewardHost と同じ。
 */
class AnniversaryCardReward {
	/** いま開いているカード。undefined なら何も出していない。 */
	current = $state<CardView>();
	error = $state('');
	busy = $state(false);
	/** まだ見せていないぶん。current を閉じるとここから次を出す。 */
	#rest = $state<CardView[]>([]);
	#did: string | undefined;
	/**
	 * 受け取り済みの記念日の並び。真偽値ではなく中身で覚えるのは、JST 4:00 をまたいで
	 * 別の記念日が現れたときにもう一度受け取れるようにするため（アプリを開きっぱなしの人がいる）。
	 */
	#claimedKey: string | undefined;

	constructor() {
		session.subscribe((value) => {
			const did = value?.did;
			if (did === this.#did) return;
			this.#did = did;
			this.current = undefined;
			this.#rest = [];
			this.error = '';
			this.#claimedKey = undefined;
		});
	}

	get did(): string | undefined {
		return this.#did;
	}

	/**
	 * 背景画像を先に読み込ませる。記念日モーダルは一発勝負の演出なので、
	 * 画像が間に合わないと文字だけのカードがめくれてしまう。
	 */
	preload(art: string | undefined): void {
		if (!art || typeof Image === 'undefined') return;
		new Image().src = `/card-art/${art}.webp`;
	}

	/**
	 * 未受領ぶんをまとめて受け取る。サーバは冪等なので二重送信でも増えないが、
	 * モーダルが二度開くのは事故なので #claimed でも止める。
	 */
	async claim(did: string, key: string): Promise<void> {
		if (this.busy || this.#claimedKey === key || this.#did !== did) return;
		this.busy = true;
		this.#claimedKey = key;
		this.error = '';
		try {
			const result = await drawCard({ source: 'anniversary' });
			if (this.#did !== did) return;
			const cards = result.cards?.length ? result.cards : [result.card];
			cardCollections.applyAnniversaryClaim(did, cards);
			// 既に受け取り済みだった（別タブなど）ときは、もう一度祝い直さない。
			if (result.alreadyDrawn) return;
			this.current = cards[0];
			this.#rest = cards.slice(1);
		} catch (error) {
			if (this.#did !== did) return;
			// 失敗したら次のポーリングでやり直せるようにする。pendingAnniversary は
			// サーバ側に残っているので、取りこぼしにはならない。
			this.#claimedKey = undefined;
			this.error = error instanceof Error ? error.message : '';
		} finally {
			this.busy = false;
		}
	}

	/** 表示中のカードを閉じ、残りがあれば次を出す。 */
	close(final: CardView): void {
		if (this.#did) cardCollections.applyCard(this.#did, final);
		this.current = this.#rest[0];
		this.#rest = this.#rest.slice(1);
	}

	clearError(): void {
		this.error = '';
	}
}

export const anniversaryCardReward = new AnniversaryCardReward();
