import type { ActorView, Page, ProfileFeedItem, ProfileNewsReactionItem } from '$lib/api/types';
import { m } from '$lib/i18n/i18n.svelte';

const message = (error: unknown) => (error instanceof Error ? error.message : m.loadFailed());

export const isNewsReactionItem = (item: ProfileFeedItem): item is ProfileNewsReactionItem =>
	'kind' in item && item.kind === 'news';

export const reactionItemUri = (item: ProfileFeedItem) =>
	isNewsReactionItem(item) ? item.news.uri : item.uri;

/** 投稿専用の楽観Feedへニュースを混ぜずに扱う、プロフィール用の軽量ページング状態。 */
export class ProfileReactionFeed {
	items = $state<ProfileFeedItem[]>([]);
	cursor = $state<string>();
	hasMore = $state(false);
	loading = $state(false);
	error = $state('');
	botActor = $state<ActorView>();
	#fetcher: (cursor?: string) => Promise<Page<ProfileFeedItem>>;
	#request = 0;

	constructor(fetcher: (cursor?: string) => Promise<Page<ProfileFeedItem>>) {
		this.#fetcher = fetcher;
	}

	async load() {
		const request = ++this.#request;
		this.loading = true;
		try {
			const page = await this.#fetcher();
			if (request !== this.#request) return;
			this.items = page.items;
			this.cursor = page.cursor;
			this.hasMore = page.hasMore;
			this.botActor = page.botActor ?? this.botActor;
			this.error = '';
		} catch (error) {
			if (request === this.#request) this.error = message(error);
		} finally {
			if (request === this.#request) this.loading = false;
		}
	}

	async loadMore() {
		if (!this.cursor || this.loading) return;
		this.loading = true;
		try {
			const page = await this.#fetcher(this.cursor);
			const known = new Set(this.items.map(reactionItemUri));
			this.items = [
				...this.items,
				...page.items.filter((item) => !known.has(reactionItemUri(item))),
			];
			this.cursor = page.cursor;
			this.hasMore = page.hasMore;
			this.botActor = page.botActor ?? this.botActor;
			this.error = '';
		} catch (error) {
			this.error = message(error);
		} finally {
			this.loading = false;
		}
	}

	removePost(uri: string) {
		this.items = this.items.filter((item) => isNewsReactionItem(item) || item.uri !== uri);
	}
}
