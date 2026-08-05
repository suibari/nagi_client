import { get } from 'svelte/store';
import { ApiRequestError, getPreferences, putPreferences } from '$lib/api/appview';
import type {
	EmojiFavorite,
	PreferencesView,
	PutPreferencesInput,
	ReadPositionSection,
	RemoteReadPosition,
} from '$lib/api/types';
import type { ReadPosition } from '$lib/unread/watermark.svelte';
import { session } from '$lib/oauth/session.svelte';

/**
 * 端末をまたいで同期する設定（my Nagi の既読位置・お気に入り絵文字）の通信層。
 *
 * ここはトランスポートと「サーバーが持っている値」の保持だけを行い、それをどこへ
 * 適用するかは `$lib/preferences/sync.svelte` が決める。favorites / watermark 側から
 * このモジュールへ push できるよう、逆向きの依存を作らないため。
 *
 * permission-set に lxm を足した直後は、既存ユーザーのトークンに旧スコープが焼き付いた
 * ままなので 403 が返る。それは障害ではなく「まだ同期できない端末」なので、静かに
 * unauthorized を立てて localStorage 単独動作（＝従来の挙動）へ落とす。
 */
const FLUSH_DELAY_MS = 1_500;

const isScopeDenied = (error: unknown) =>
	error instanceof ApiRequestError &&
	(error.status === 401 ||
		error.status === 403 ||
		(error.status === 400 && /scope|permission/i.test(error.message)));

/** マージ後の確定値の通知。sentFavorites はこの送信にお気に入りを含めたか。 */
type MergedHandler = (view: PreferencesView, sentFavorites: boolean) => void;

class Preferences {
	/** サーバーと同期できている（getPreferences が成功した）か。 */
	synced = $state(false);
	/**
	 * スコープが足りずに拒否された。再ログインを促す告知はこれが true のときだけ出す
	 * （オフラインや一時的な障害と区別するため）。
	 */
	unauthorized = $state(false);
	#did: string | undefined;
	#loadRequest = 0;
	/** サーバーが持っている既読位置。あとから作られるウォーターマークもここから取り込む。 */
	#remotePositions = new Map<ReadPositionSection, RemoteReadPosition>();
	#pendingPositions = new Map<ReadPositionSection, RemoteReadPosition>();
	#pendingFavorites: { choices: EmojiFavorite[]; updatedAt: string } | undefined;
	#flushTimer: ReturnType<typeof setTimeout> | undefined;
	#flushing: Promise<void> = Promise.resolve();
	#onMerged: MergedHandler | undefined;

	/** マージ後の確定値を受け取るハンドラ。sync 層が1つだけ登録する。 */
	subscribeMerged(handler: MergedHandler) {
		this.#onMerged = handler;
	}

	/** そのセクションについてサーバーが持っている位置。未同期なら undefined。 */
	remotePosition(section: ReadPositionSection): RemoteReadPosition | undefined {
		return this.#remotePositions.get(section);
	}

	/** サインイン時に1回。失敗しても投げない（同期は付加機能で、無くても全機能が動く）。 */
	async load(): Promise<PreferencesView | undefined> {
		const current = get(session);
		if (!current) {
			this.clear();
			return undefined;
		}
		const did = current.did;
		const request = ++this.#loadRequest;
		this.#did = did;
		this.synced = false;
		this.unauthorized = false;
		this.#remotePositions.clear();
		try {
			const view = await getPreferences();
			if (request !== this.#loadRequest || get(session)?.did !== did) return undefined;
			this.#rememberPositions(view);
			this.synced = true;
			return view;
		} catch (error) {
			if (request !== this.#loadRequest || get(session)?.did !== did) return undefined;
			this.unauthorized = isScopeDenied(error);
			return undefined;
		}
	}

	clear() {
		this.#loadRequest++;
		this.#did = undefined;
		this.synced = false;
		this.unauthorized = false;
		this.#remotePositions.clear();
		this.#pendingPositions.clear();
		this.#pendingFavorites = undefined;
		if (this.#flushTimer) clearTimeout(this.#flushTimer);
		this.#flushTimer = undefined;
	}

	pushReadPosition(section: ReadPositionSection, position: ReadPosition) {
		if (!this.synced) return;
		this.#pendingPositions.set(section, { section, ...position });
		this.#schedule();
	}

	pushFavorites(choices: EmojiFavorite[], updatedAt: string) {
		if (!this.synced) return;
		this.#pendingFavorites = { choices, updatedAt };
		this.#schedule();
	}

	/** デバウンスを待たずに送り切りたいとき用。 */
	flushNow(): Promise<void> {
		if (this.#flushTimer) clearTimeout(this.#flushTimer);
		this.#flushTimer = undefined;
		return this.#flush();
	}

	#rememberPositions(view: PreferencesView) {
		this.#remotePositions = new Map(
			view.readPositions.map((position) => [position.section, position]),
		);
	}

	#schedule() {
		if (this.#flushTimer) return;
		this.#flushTimer = setTimeout(() => {
			this.#flushTimer = undefined;
			void this.#flush();
		}, FLUSH_DELAY_MS);
	}

	/** 送信は直列化する。並行に投げると後勝ち判定がリクエスト順に依存してしまう。 */
	#flush(): Promise<void> {
		this.#flushing = this.#flushing.then(() => this.#send());
		return this.#flushing;
	}

	async #send() {
		if (!this.synced) return;
		const did = this.#did;
		const positions = [...this.#pendingPositions.values()];
		const favorites = this.#pendingFavorites;
		if (!positions.length && !favorites) return;
		this.#pendingPositions.clear();
		this.#pendingFavorites = undefined;
		const input: PutPreferencesInput = {
			...(positions.length ? { readPositions: positions } : {}),
			...(favorites
				? {
						emojiFavorites: favorites.choices,
						emojiFavoritesUpdatedAt: favorites.updatedAt,
					}
				: {}),
		};
		try {
			const view = await putPreferences(input);
			if (get(session)?.did !== did) return;
			this.#rememberPositions(view);
			this.#onMerged?.(view, Boolean(favorites));
		} catch (error) {
			if (isScopeDenied(error)) {
				// 認可が切れた/足りない。以後の push を止めて localStorage 単独へ落とす。
				this.synced = false;
				this.unauthorized = true;
				return;
			}
			// 通信断などは次の変更で送り直す。取りこぼさないよう保留へ戻す
			// （そのあいだに入った新しい値は上書きしない）。
			for (const position of positions)
				if (!this.#pendingPositions.has(position.section))
					this.#pendingPositions.set(position.section, position);
			if (favorites && !this.#pendingFavorites) this.#pendingFavorites = favorites;
		}
	}
}

export const preferences = new Preferences();
