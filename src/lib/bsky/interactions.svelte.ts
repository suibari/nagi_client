import type { BskyPostCardView } from './mapView';

export type BskyInteractionKind = 'like' | 'repost';

export type BskyInteractionWriter = {
	/** 作成したレコードの AT-URI を返す。 */
	create(kind: BskyInteractionKind, subject: { uri: string; cid: string }): Promise<string>;
	remove(kind: BskyInteractionKind, recordUri: string): Promise<void>;
};

/** 作成の応答を待つ間の「付けた」状態。レコードの URI はまだ分からない。 */
const PENDING = '';
type Override = string | null;

const keyOf = (kind: BskyInteractionKind, uri: string) => `${kind} ${uri}`;

/**
 * Bluesky 投稿のいいね・リポストの、自分の状態（BSKY-08）。
 *
 * 同じ投稿がリポストで複数のカードに出るので、状態はカードでなく投稿の URI で持つ。
 * 押した結果は AppView の反映を待たずに表示し、フィードを読み直して古い viewer が
 * 返ってきても巻き戻さないよう、セッションの間は押した結果を優先する。
 */
export class BskyInteractions {
	#owner: string | undefined;
	#overrides = $state<Record<string, Override>>({});
	#busy = $state<Record<string, true>>({});
	readonly #writer: BskyInteractionWriter;

	constructor(writer: BskyInteractionWriter) {
		this.#writer = writer;
	}

	/** アカウントが変わったら、前の人の押した結果を持ち越さない。 */
	setOwner(did: string | undefined) {
		if (did === this.#owner) return;
		this.#owner = did;
		this.#overrides = {};
		this.#busy = {};
	}

	#record(kind: BskyInteractionKind, post: BskyPostCardView): Override {
		const override = this.#overrides[keyOf(kind, post.uri)];
		if (override !== undefined) return override;
		return (kind === 'like' ? post.viewerLike : post.viewerRepost) ?? null;
	}

	active(kind: BskyInteractionKind, post: BskyPostCardView): boolean {
		return this.#record(kind, post) !== null;
	}

	busy(kind: BskyInteractionKind, post: BskyPostCardView): boolean {
		return Boolean(this.#busy[keyOf(kind, post.uri)]);
	}

	/** 失敗したら元の状態に戻して例外を投げる。処理中の再押下は何もしない。 */
	async toggle(kind: BskyInteractionKind, post: BskyPostCardView): Promise<void> {
		const key = keyOf(kind, post.uri);
		if (this.#busy[key]) return;
		const owner = this.#owner;
		const before = this.#record(kind, post);
		this.#busy[key] = true;
		this.#overrides[key] = before === null ? PENDING : null;
		try {
			if (before === null) {
				const uri = await this.#writer.create(kind, { uri: post.uri, cid: post.cid });
				if (owner === this.#owner) this.#overrides[key] = uri;
			} else {
				// 応答待ちのまま再読込された等で URI が分からないときは、取り消しようがない。
				if (before === PENDING) throw new Error('Record URI is unknown');
				await this.#writer.remove(kind, before);
			}
		} catch (error) {
			if (owner === this.#owner) this.#overrides[key] = before;
			throw error;
		} finally {
			if (owner === this.#owner) delete this.#busy[key];
		}
	}
}
