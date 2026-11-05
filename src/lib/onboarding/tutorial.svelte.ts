/**
 * 「Nagiのはじめかた」チェックリスト。サインアップ直後のユーザーにだけ出す。
 *
 * 進捗は DID ごとに localStorage へ置く。記録が無いユーザー（既存ユーザー・別端末）は
 * 対象外として何も出さない。サーバーに持たないのは、取りこぼしても困らない案内だから。
 */
export type TutorialTask = 'post' | 'reaction' | 'mood';
export const TUTORIAL_TASKS: TutorialTask[] = ['post', 'reaction', 'mood'];

type Saved = { done: TutorialTask[]; dismissed?: boolean; celebrated?: boolean };

const storageKey = (did: string) => `nagi-welcome-tutorial:${did}`;

function read(did: string): Saved | null {
	try {
		const raw = localStorage.getItem(storageKey(did));
		if (!raw) return null;
		const value = JSON.parse(raw) as Partial<Saved>;
		const done = Array.isArray(value.done)
			? TUTORIAL_TASKS.filter((task) => value.done?.includes(task))
			: [];
		return { done, dismissed: value.dismissed === true, celebrated: value.celebrated === true };
	} catch {
		return null;
	}
}

function write(did: string, saved: Saved) {
	try {
		localStorage.setItem(storageKey(did), JSON.stringify(saved));
	} catch {
		// 保存できなくても、このタブの中では進捗を持ち続ける。
	}
}

class WelcomeTutorial {
	#did: string | undefined;
	saved = $state<Saved | null>(null);
	open = $state(false);
	/** 3つ目が済んだ瞬間だけ true。コンフェッティを1回だけ出すのに使う。 */
	celebrating = $state(false);

	get done(): TutorialTask[] {
		return this.saved?.done ?? [];
	}
	get complete(): boolean {
		return this.done.length === TUTORIAL_TASKS.length;
	}
	/** フィードの入口を出すか。済ませた・もう出さないを選んだら消す。 */
	get showEntry(): boolean {
		return Boolean(this.saved && !this.saved.dismissed && !this.complete);
	}

	/** サインイン中の DID に切り替える。記録が無ければ対象外。 */
	load(did: string | undefined) {
		if (did === this.#did) return;
		this.#did = did;
		this.saved = did ? read(did) : null;
		this.open = false;
		this.celebrating = false;
	}

	/** 新規ユーザーとして始める。プロフィールを自動作成した直後に呼ぶ。 */
	start(did: string) {
		this.#did = did;
		this.saved = read(did) ?? { done: [] };
		this.#persist();
		this.open = true;
	}

	markDone(task: TutorialTask) {
		const saved = this.saved;
		if (!saved || saved.done.includes(task)) return;
		const done = TUTORIAL_TASKS.filter((t) => t === task || saved.done.includes(t));
		const finished = done.length === TUTORIAL_TASKS.length && !saved.celebrated;
		this.saved = { ...saved, done, celebrated: saved.celebrated || finished };
		this.#persist();
		// 全部済んだら、閉じていても開き直して一緒に喜ぶ（もう出さないを選んだ人にも）。
		if (finished) {
			this.celebrating = true;
			this.open = true;
		}
	}

	show() {
		if (this.saved) this.open = true;
	}

	close() {
		this.open = false;
		this.celebrating = false;
	}

	/** フィードの入口を消す。進捗の記録は続ける。 */
	dismiss() {
		if (!this.saved) return;
		this.saved = { ...this.saved, dismissed: true };
		this.#persist();
		this.open = false;
	}

	#persist() {
		if (this.#did && this.saved) write(this.#did, this.saved);
	}
}

export const welcomeTutorial = new WelcomeTutorial();
