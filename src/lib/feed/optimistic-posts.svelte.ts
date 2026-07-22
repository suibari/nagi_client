import type { ActorView, FeedItem, PostView } from '$lib/api/types';
import type { PostDraft } from '$lib/atproto/records';

type Entry = { id: string; item: FeedItem; objectUrls: string[] };

class OptimisticPosts {
	entries = $state<Entry[]>([]);
	#actors = new Map<string, ActorView>();

	get items(): FeedItem[] {
		return this.entries.map((entry) => entry.item);
	}

	remember(items: PostView[]) {
		for (const item of items) this.#actors.set(item.author.did, item.author);
	}
	rememberActor(actor: ActorView) {
		this.#actors.set(actor.did, actor);
	}

	author(did: string): ActorView {
		return this.#actors.get(did) ?? { did, handle: did };
	}

	add(draft: PostDraft, did: string, context: { replyParent?: PostView; quote?: PostView } = {}) {
		const id = crypto.randomUUID();
		const objectUrls: string[] = [];
		const localUrl = (blob?: Blob) => {
			if (!blob) return undefined;
			const url = URL.createObjectURL(blob);
			objectUrls.push(url);
			return url;
		};
		const item: FeedItem = {
			uri: `optimistic://${id}`,
			cid: id,
			author: this.author(did),
			text: draft.text,
			facets: draft.facets,
			langs: draft.langs,
			createdAt: draft.createdAt,
			indexedAt: draft.createdAt,
			...(draft.reply && { reply: { root: draft.reply.root.uri, parent: draft.reply.parent.uri } }),
			...(draft.attachments.length && {
				images: draft.attachments.map((attachment) => ({
					url: localUrl(attachment.blob)!,
					alt: attachment.alt,
					aspectRatio: attachment.aspectRatio,
				})),
			}),
			...(draft.linkCards.length && {
				linkCards: draft.linkCards.map((card) => ({
					uri: card.uri,
					title: card.title,
					description: card.description,
					thumb: localUrl(card.thumbnail),
				})),
			}),
			...(context.quote && { quote: { kind: 'post' as const, post: context.quote } }),
			...(context.replyParent && { replyParent: context.replyParent }),
			...(draft.kossori && { kossori: true }),
			reactions: [],
			isBot: false,
			isAffirmation: false,
			optimisticState: 'sending',
		};
		this.entries = [{ id, item, objectUrls }, ...this.entries];
		return id;
	}

	markCreated(id: string, result: { uri: string; cid: string }) {
		this.entries = this.entries.map((entry) =>
			entry.id === id
				? { ...entry, item: { ...entry.item, ...result, optimisticState: 'indexing' } }
				: entry,
		);
	}

	reconcile(items: PostView[]) {
		this.remember(items);
		const uris = new Set(items.map((item) => item.uri));
		for (const entry of this.entries) {
			if (uris.has(entry.item.uri)) entry.objectUrls.forEach(URL.revokeObjectURL);
		}
		this.entries = this.entries.filter((entry) => !uris.has(entry.item.uri));
	}

	remove(id: string) {
		const entry = this.entries.find((candidate) => candidate.id === id);
		entry?.objectUrls.forEach(URL.revokeObjectURL);
		this.entries = this.entries.filter((candidate) => candidate.id !== id);
	}
}

export const optimisticPosts = new OptimisticPosts();
