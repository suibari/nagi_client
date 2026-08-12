import { getCards } from '$lib/api/appview';
import type { CardCollectionView, CardView, DrawCardResult } from '$lib/api/types';
import { session } from '$lib/oauth/session.svelte';

type Entry = {
	view?: CardCollectionView;
	loading: boolean;
	/** 直近の取得が失敗したか。文言は表示側が決めるので、ここは事実だけ持つ。 */
	failed: boolean;
	/** 失敗の理由。空なら表示側の既定文言を使う。 */
	error: string;
	/** 最後に取得できた時刻。refreshSelfIfStale の間引きに使う。 */
	fetchedAt: number;
	/**
	 * コレクション未取得のまま引いたときの drawStatus。空の view をでっち上げると
	 * ensure() が「取得済み」と誤認して図鑑が 0枚のまま固まるので、別枠で持つ。
	 */
	drawnStatus?: CardCollectionView['drawStatus'];
};

/** どちらかの取得枠が残っている間の再取得の下限間隔。 */
const UNDRAWN_RECHECK_MS = 60_000;

/**
 * 全肯定カードのコレクションを DID 単位で共有する。TOP の FAB（drawStatus だけ要る）と
 * プロフィールのカードタブ（図鑑ぜんぶ要る）が同じ getCards の結果を見るためのもので、
 * これが無いと同じ 30 枚を二重に取りに行き、しかも「TOP で引いたのにカードタブでは
 * まだ引けることになっている」というズレが出る。
 *
 * drawStatus は viewer === actor のときしか付いてこないので、セッションが変わったら
 * 全部捨てる（他人のぶんも viewer 依存の情報を含みうるので部分的に残さない）。
 */
class CardCollections {
	#entries = $state(new Map<string, Entry>());
	#selfDid: string | undefined;

	constructor() {
		session.subscribe((value) => {
			const did = value?.did;
			if (did === this.#selfDid) return;
			this.#selfDid = did;
			this.#entries = new Map();
		});
	}

	entry(actor: string): Readonly<Entry> | undefined {
		return this.#entries.get(actor);
	}
	view(actor: string): CardCollectionView | undefined {
		return this.#entries.get(actor)?.view;
	}

	/** 自分の本日のドロー状況。未取得のうちは undefined。 */
	get selfDrawStatus() {
		if (!this.#selfDid) return undefined;
		const entry = this.#entries.get(this.#selfDid);
		return entry?.view?.drawStatus ?? entry?.drawnStatus;
	}
	/**
	 * FAB の表示条件。「取得済み」かつ「引ける」ときだけ true にする（fail closed）。
	 * 未取得や、権限切れで公開フォールバックに落ちて drawStatus が消えた場合は出さない。
	 * どのみちその状態では drawCard()（auth 必須）も通らないので、出しても押せない。
	 */
	get canDrawMyNagi(): boolean {
		const status = this.selfDrawStatus;
		return status?.myNagi?.canDraw ?? status?.canDraw === true;
	}
	/** 新AppViewの状態が確認できた場合だけ有効にする（旧応答ではfail closed）。 */
	get canDrawWithReaction(): boolean {
		return this.selfDrawStatus?.reaction?.canDraw === true;
	}
	/** 既存呼び出しとの互換名。通常のmy Nagi枠を指す。 */
	get canDrawToday(): boolean {
		return this.canDrawMyNagi;
	}

	#patch(actor: string, patch: Partial<Entry>) {
		const next = new Map(this.#entries);
		const current: Entry = next.get(actor) ?? {
			loading: false,
			failed: false,
			error: '',
			fetchedAt: 0,
		};
		next.set(actor, { ...current, ...patch });
		this.#entries = next;
	}

	/** 未取得なら取る。取得済み・取得中なら何もしない。 */
	async ensure(actor: string): Promise<void> {
		if (!actor) return;
		const current = this.#entries.get(actor);
		if (current?.view || current?.loading) return;
		await this.#fetch(actor);
	}

	/** 明示的に取り直す。 */
	async refresh(actor: string): Promise<void> {
		if (!actor || this.#entries.get(actor)?.loading) return;
		await this.#fetch(actor);
	}

	/**
	 * 自分のぶんだけ、必要なときに取り直す。復帰のたびに叩かないよう条件を絞る。
	 * - 未取得 → 取る
	 * - どちらかの枠を引ける状態で 60 秒以上経っている → 取る（別タブで引いた場合を拾う）
	 * - 引けない状態で nextDrawAt を過ぎた → 取る（JST 4:00 の境界をまたいだ）
	 */
	refreshSelfIfStale(): void {
		const did = this.#selfDid;
		if (!did) return;
		const entry = this.#entries.get(did);
		if (!entry?.view) {
			void this.ensure(did);
			return;
		}
		const status = entry.view.drawStatus;
		if (!status) return;
		const canDrawAny = (status.myNagi?.canDraw ?? status.canDraw) || status.reaction?.canDraw;
		if (canDrawAny) {
			if (Date.now() - entry.fetchedAt >= UNDRAWN_RECHECK_MS) void this.refresh(did);
			return;
		}
		if (Date.now() >= Date.parse(status.nextDrawAt)) void this.refresh(did);
	}

	async #fetch(actor: string) {
		this.#patch(actor, { loading: true, failed: false, error: '' });
		try {
			const view = await getCards(actor);
			this.#patch(actor, {
				view,
				loading: false,
				failed: false,
				error: '',
				fetchedAt: Date.now(),
			});
		} catch (e) {
			this.#patch(actor, {
				loading: false,
				failed: true,
				error: e instanceof Error ? e.message : '',
			});
		}
	}

	/**
	 * ドロー結果を反映する。通常枠とリアクション枠を含むdrawStatusを丸ごと同期する。
	 * コレクション未取得のまま TOP で引いたときも、drawStatus だけは持っておく。
	 */
	applyDraw(actor: string, result: DrawCardResult) {
		this.#patch(actor, { drawnStatus: result.drawStatus });
		if (!this.view(actor)) return;
		this.applyCard(actor, result.card, result.drawStatus);
	}

	/**
	 * カード 1 枚を差し替える（botたんコメントが後から届いたときにも使う）。
	 * 並びは AppView が返した順のまま。図鑑の升目が動くと「どこが空いているか」が
	 * 毎回変わってしまうので、ここで並べ替えは絶対にしない。
	 */
	applyCard(actor: string, card: CardView, drawStatus = this.view(actor)?.drawStatus) {
		const view = this.view(actor);
		if (!view) return;
		const cards = view.cards.map((c) => (c.volume === card.volume && c.id === card.id ? card : c));
		this.#patch(actor, {
			view: {
				...view,
				cards,
				ownedCount: cards.filter((c) => c.owned).length,
				...(drawStatus ? { drawStatus } : {}),
			},
		});
	}
}

export const cardCollections = new CardCollections();
