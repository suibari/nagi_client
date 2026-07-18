export type ActorView = {
	did: string;
	handle: string;
	displayName?: string;
	description?: string;
	avatar?: string;
};
export type ReactionView = { emoji: string; count: number; reactedByMe?: boolean };
export type PostView = {
	uri: string;
	cid: string;
	author: ActorView;
	text: string;
	createdAt: string;
	indexedAt: string;
	reply?: { root?: string; parent: string };
	images?: Array<{ url?: string; image?: unknown; alt: string }>;
	reactions: ReactionView[];
	isBot: boolean;
	isTrend: boolean;
	deleted?: boolean;
};
export type TimelinePage = { items: PostView[]; cursor?: string; hasMore: boolean };
