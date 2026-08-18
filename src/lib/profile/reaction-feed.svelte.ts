import type {
	ActorView,
	FeedItem,
	Page,
	ProfileFeedItem,
	ProfileKossoriReactionItem,
	ProfileNewsReactionItem,
} from '$lib/api/types';
import { m } from '$lib/i18n/i18n.svelte';
import { postTranslations } from '$lib/i18n/postTranslations.svelte';

const message = (error: unknown) => (error instanceof Error ? error.message : m.loadFailed());

export const isNewsReactionItem = (item: ProfileFeedItem): item is ProfileNewsReactionItem =>
	'kind' in item && item.kind === 'news';

/** こっそり投稿へのリアクション。元投稿は辿れないのでプレースホルダとして描く。 */
export const isKossoriReactionItem = (item: ProfileFeedItem): item is ProfileKossoriReactionItem =>
	'kind' in item && item.kind === 'kossori';

const isPostReactionItem = (item: ProfileFeedItem): item is FeedItem =>
	!isNewsReactionItem(item) && !isKossoriReactionItem(item);

export const reactionItemUri = (item: ProfileFeedItem) =>
	isNewsReactionItem(item)
		? item.news.uri
		: isKossoriReactionItem(item)
			? item.reactionUri
			: item.uri;
const reactionPosts = (items: ProfileFeedItem[]) => items.filter(isPostReactionItem);

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
			void postTranslations.prepare(reactionPosts(page.items));
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
		this.error = '';
		try {
			const page = await this.#fetcher(this.cursor);
			void postTranslations.prepare(reactionPosts(page.items));
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
		this.items = this.items.filter((item) => !isPostReactionItem(item) || item.uri !== uri);
	}

	removeReaction(uri: string) {
		this.items = this.items.filter((item) => reactionItemUri(item) !== uri);
	}
}
