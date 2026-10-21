import { get } from 'svelte/store';
import { getMutes, setMute } from '$lib/api/appview';
import type { ActorView, MuteSubjectType } from '$lib/api/types';
import { session } from '$lib/oauth/session.svelte';
import { normalizeTag } from '$lib/tags';

/**
 * 自分のミュート一覧。除外そのものは AppView が SQL でやるので、ここでフィードを絞ることは
 * しない（Feed は画面ごとに作り直されて再取得するし、クライアントで絞るとミュート非適用の
 * プロフィールフィードまで巻き込む）。この状態はボタンの ON/OFF 表示と設定画面の一覧が用途。
 * ミュートは非公開情報なので、この集合を他人に見せる経路を作らないこと。
 */
class Mutes {
	actors = $state<ActorView[]>([]);
	/** # を除いた小文字のタグ。AppView 側の正規形と同じ。 */
	tags = $state<string[]>([]);
	loaded = $state(false);
	/** 進行中の切り替え（連打防止とスピナー表示用）。値は subject。 */
	pending = $state<string[]>([]);

	hasActor(did: string) {
		return this.actors.some((actor) => actor.did === did);
	}
	hasTag(tag: string) {
		return this.tags.includes(normalizeTag(tag));
	}
	isPending(subject: string) {
		return this.pending.includes(subject);
	}

	/** サインイン後に1回だけ読む。未ログインなら空のままにする。 */
	async load() {
		if (!get(session)) {
			this.clear();
			return;
		}
		try {
			const view = await getMutes();
			this.actors = view.actors;
			this.tags = view.tags;
			this.loaded = true;
		} catch {
			// 取得できなくてもサーバ側のフィルタは効くので、閲覧自体は止めない。
			this.loaded = false;
		}
	}

	clear() {
		this.actors = [];
		this.tags = [];
		this.pending = [];
		this.loaded = false;
	}

	/** 楽観的に反映してから API を呼び、失敗したら巻き戻す。 */
	async toggleActor(actor: ActorView, muted = !this.hasActor(actor.did)) {
		const previous = this.actors;
		this.actors = muted
			? [...this.actors.filter((a) => a.did !== actor.did), actor]
			: this.actors.filter((a) => a.did !== actor.did);
		await this.#commit('actor', actor.did, muted, () => {
			this.actors = previous;
		});
	}

	async toggleTag(raw: string, muted = !this.hasTag(raw)) {
		const tag = normalizeTag(raw);
		if (!tag) return;
		const previous = this.tags;
		const rest = this.tags.filter((t) => t !== tag);
		this.tags = muted ? [...rest, tag].sort() : rest;
		await this.#commit('tag', tag, muted, () => {
			this.tags = previous;
		});
	}

	async #commit(
		subjectType: MuteSubjectType,
		subject: string,
		muted: boolean,
		rollback: () => void,
	) {
		this.pending = [...this.pending, subject];
		try {
			await setMute(subjectType, subject, muted);
		} catch (error) {
			rollback();
			throw error;
		} finally {
			this.pending = this.pending.filter((value) => value !== subject);
		}
	}
}

export const mutes = new Mutes();
