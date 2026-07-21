import { session } from '$lib/oauth/session.svelte';
import { getProfile } from '$lib/api/appview';
import type { ProfileDetail } from '$lib/api/types';
import { optimisticPosts } from '$lib/feed/optimistic-posts.svelte';

/**
 * ログイン中ユーザーのプロフィールを 1 回だけ取って共有する。
 * サイドバー・モバイルヘッダ・Composer が同じものを見るほか、optimisticPosts に
 * 覚えさせることで「初投稿の楽観カードだけアバターが出ない」ズレを防ぐ。
 */
class MyProfile {
	current = $state<ProfileDetail>();
	#did: string | undefined;

	constructor() {
		session.subscribe((value) => {
			const did = value?.did;
			if (did === this.#did) return;
			this.#did = did;
			this.current = undefined;
			if (did) void this.#fetch(did);
		});
	}

	async #fetch(did: string) {
		try {
			const { profile } = await getProfile(did, { limit: 1 });
			if (this.#did !== did) return;
			this.current = profile;
			optimisticPosts.rememberActor(profile);
		} catch {
			// 取れなくてもアバターがイニシャル表示になるだけなので黙って諦める
		}
	}

	/** プロフィール編集後など、明示的に取り直したいとき */
	refresh() {
		if (this.#did) void this.#fetch(this.#did);
	}
}

export const myProfile = new MyProfile();
