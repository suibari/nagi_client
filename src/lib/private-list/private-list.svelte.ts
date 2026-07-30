import { get } from 'svelte/store';
import { getPrivateList, setPrivateListMember } from '$lib/api/appview';
import type { ActorView } from '$lib/api/types';
import { session } from '$lib/oauth/session.svelte';

/**
 * 本人のホームリスト。非公開情報なので、プロフィールなどの公開レスポンスには混ぜず、
 * 認証必須の専用 API からだけ読み込む。
 */
class PrivateList {
	members = $state<ActorView[]>([]);
	limit = $state(200);
	loaded = $state(false);
	pending = $state<string[]>([]);
	#loadRequest = 0;

	has(did: string) {
		return this.members.some((member) => member.did === did);
	}
	isPending(did: string) {
		return this.pending.includes(did);
	}

	async load() {
		const current = get(session);
		if (!current) {
			this.clear();
			return;
		}
		const ownerDid = current.did;
		const request = ++this.#loadRequest;
		// アカウント切替直後に前の利用者の一覧を一瞬でも描画しない。
		this.members = [];
		this.pending = [];
		this.loaded = false;
		try {
			const view = await getPrivateList();
			if (request !== this.#loadRequest || get(session)?.did !== ownerDid) return;
			this.members = view.members;
			this.limit = view.limit;
			this.loaded = true;
		} catch {
			if (request !== this.#loadRequest || get(session)?.did !== ownerDid) return;
			this.loaded = false;
		}
	}

	clear() {
		this.#loadRequest++;
		this.members = [];
		this.limit = 200;
		this.loaded = false;
		this.pending = [];
	}

	async toggle(actor: ActorView, included = !this.has(actor.did)) {
		const ownerDid = get(session)?.did;
		if (!ownerDid) throw new Error('Authentication required');
		const previous = this.members;
		this.members = included
			? [...this.members.filter((member) => member.did !== actor.did), actor]
			: this.members.filter((member) => member.did !== actor.did);
		this.pending = [...this.pending, actor.did];
		try {
			await setPrivateListMember(actor.did, included);
		} catch (error) {
			if (get(session)?.did === ownerDid) this.members = previous;
			throw error;
		} finally {
			this.pending = this.pending.filter((did) => did !== actor.did);
		}
	}
}

export const privateList = new PrivateList();
