import { SvelteMap } from 'svelte/reactivity';
import type { OAuthSession } from '@atproto/oauth-client-browser';
import { session } from '$lib/oauth/session.svelte';
import type { BskyPostCardView } from './mapView';
import type { BskyThreadSnapshot } from './thread';

export type SentBskyReply = {
	post: BskyPostCardView;
	objectUrls: string[];
};
type SentConversation = { revision: number; replies: SentBskyReply[] };

class SentBskyReplies {
	#roots = new SvelteMap<string, SentConversation>();
	#owner: OAuthSession | null = null;

	constructor() {
		session.subscribe((owner) => {
			if (owner === this.#owner) return;
			for (const { replies } of this.#roots.values()) this.#release(replies);
			this.#roots.clear();
			this.#owner = owner;
		});
	}

	get(rootUri: string) {
		return this.#roots.get(rootUri);
	}

	add(rootUri: string, replies: SentBskyReply[]) {
		const current = this.#roots.get(rootUri);
		this.#roots.set(rootUri, {
			revision: (current?.revision ?? 0) + 1,
			replies: [...(current?.replies ?? []), ...replies],
		});
	}

	reconcile(rootUri: string, snapshot: BskyThreadSnapshot) {
		const current = this.#roots.get(rootUri);
		if (!current?.replies.length) return;
		const resolved = new Set([
			...snapshot.posts.map((post) => post.uri),
			...snapshot.unavailableUris,
		]);
		this.#discard(rootUri, current, (reply) => resolved.has(reply.post.uri));
	}

	remove(uri: string) {
		for (const [rootUri, current] of this.#roots) {
			this.#discard(rootUri, current, (reply) => reply.post.uri === uri);
		}
	}

	#discard(rootUri: string, current: SentConversation, matches: (reply: SentBskyReply) => boolean) {
		const remaining = current.replies.filter((reply) => !matches(reply));
		if (remaining.length === current.replies.length) return;
		this.#release(current.replies.filter(matches));
		this.#roots.set(rootUri, { ...current, replies: remaining });
	}

	#release(replies: SentBskyReply[]) {
		for (const reply of replies) {
			for (const url of reply.objectUrls) URL.revokeObjectURL(url);
		}
	}
}

export const sentBskyReplies = new SentBskyReplies();
