import type {
	AppBskyActorDefs,
	AppBskyEmbedExternal,
	AppBskyEmbedImages,
	AppBskyEmbedRecord,
	AppBskyEmbedRecordWithMedia,
	AppBskyEmbedVideo,
	AppBskyFeedDefs,
} from '@atproto/api';
import type { LinkCardView, PostImage, PostVideoView } from '$lib/api/types';
import { bskyPostUrl, bskyProfileUrl } from './links';

/**
 * Bluesky の FeedViewPost を、Nagi の表示部品（ImageGallery / VideoPlayer / LinkCard / Avatar）が
 * 受け取れる形へ落とす。Nagi の PostView には寄せない — ThreadUnit やリアクション UI が
 * bsky の URI を Nagi AppView へ投げる経路を作らないため。
 *
 * いいねの数・リポスト数・返信数はここで捨てる（Nagi は数を出さない）。
 */

export type BskyFacet = { index: { byteStart: number; byteEnd: number }; features: unknown[] };

export type BskyActor = {
	did: string;
	handle: string;
	displayName?: string;
	avatar?: string;
	profileUrl: string;
};

export type BskyQuote =
	| {
			kind: 'post';
			uri: string;
			url?: string;
			author: BskyActor;
			text: string;
			facets?: BskyFacet[];
			createdAt?: string;
			images?: PostImage[];
			video?: PostVideoView;
			external?: LinkCardView;
	  }
	| { kind: 'unavailable' };

export type BskyPostCardView = {
	uri: string;
	url?: string;
	author: BskyActor;
	text: string;
	facets?: BskyFacet[];
	createdAt: string;
	images?: PostImage[];
	video?: PostVideoView;
	external?: LinkCardView;
	quote?: BskyQuote;
	likedByMe: boolean;
	/** モデレーション判定にそのまま渡す元のビュー。 */
	raw: AppBskyFeedDefs.PostView;
};

export type BskyFeedItemView = {
	/** 同じ投稿が別の人のリポストで2回来るので、uri だけでは DOM キーにならない。 */
	key: string;
	post: BskyPostCardView;
	repostedBy?: BskyActor;
	/** Conversation context included by the feed API; each post retains its own moderation view. */
	root?: BskyPostCardView;
	parent?: BskyPostCardView;
	replyTo?: BskyActor;
	/**
	 * 返信なら、その返信先の情報。フォロー中の表示設定（返信を隠す・フォロー外への返信を隠す）の
	 * 判定に使う。返信先が削除・ブロックで見えないときは parentDid が無い。
	 */
	reply?: { parentDid?: string; parentFollowed: boolean };
};

export function toActor(
	actor: Pick<AppBskyActorDefs.ProfileViewBasic, 'did' | 'handle' | 'displayName' | 'avatar'>,
): BskyActor {
	return {
		did: actor.did,
		handle: actor.handle,
		displayName: actor.displayName || undefined,
		avatar: actor.avatar,
		profileUrl: bskyProfileUrl(actor.did),
	};
}

type RecordText = { text: string; facets?: BskyFacet[]; createdAt?: string };

function recordText(record: unknown): RecordText {
	const value = (record ?? {}) as Record<string, unknown>;
	return {
		text: typeof value.text === 'string' ? value.text : '',
		facets: Array.isArray(value.facets) ? (value.facets as BskyFacet[]) : undefined,
		createdAt: typeof value.createdAt === 'string' ? value.createdAt : undefined,
	};
}

type Media = { images?: PostImage[]; video?: PostVideoView; external?: LinkCardView };

/**
 * 埋め込みは $type で見分ける。@atproto/api の isView 系ガードは「未知の $type」側の
 * 開いた型へ絞り込んでしまい、フィールドに触れないため。
 */
const typeOf = (value: unknown) => (value as { $type?: unknown } | undefined)?.$type;

function mediaOf(embed: unknown): Media {
	switch (typeOf(embed)) {
		case 'app.bsky.embed.images#view':
			return {
				images: (embed as AppBskyEmbedImages.View).images.map((image) => ({
					url: image.fullsize,
					alt: image.alt,
					aspectRatio: image.aspectRatio,
				})),
			};
		case 'app.bsky.embed.video#view': {
			const video = embed as AppBskyEmbedVideo.View;
			// サムネイルが無い動画もある。VideoPlayer は thumbnail を必須で取るので空にしておく。
			return {
				video: {
					playlist: video.playlist,
					thumbnail: video.thumbnail ?? '',
					alt: video.alt,
					aspectRatio: video.aspectRatio,
				},
			};
		}
		case 'app.bsky.embed.external#view': {
			const { external } = embed as AppBskyEmbedExternal.View;
			return {
				external: {
					uri: external.uri,
					title: external.title,
					description: external.description || undefined,
					thumb: external.thumb,
				},
			};
		}
		default:
			return {};
	}
}

function quoteOf(record: unknown): BskyQuote | undefined {
	switch (typeOf(record)) {
		case 'app.bsky.embed.record#viewRecord': {
			const view = record as AppBskyEmbedRecord.ViewRecord;
			const text = recordText(view.value);
			// 引用の中の引用は1段で止める。中のメディアだけは見せる。
			const media = (view.embeds ?? []).map(mediaOf).find((item) => Object.keys(item).length);
			return {
				kind: 'post',
				uri: view.uri,
				url: bskyPostUrl(view.uri),
				author: toActor(view.author),
				text: text.text,
				facets: text.facets,
				createdAt: text.createdAt,
				...media,
			};
		}
		case 'app.bsky.embed.record#viewNotFound':
		case 'app.bsky.embed.record#viewBlocked':
		case 'app.bsky.embed.record#viewDetached':
			return { kind: 'unavailable' };
		default:
			// フィード・リスト・スターターパックなどの埋め込みは出さない。
			return undefined;
	}
}

/** 引用先の viewRecord（あれば）。モデレーションも引用先のラベルを見るので共有する。 */
export function quotedRecord(embed: unknown): unknown {
	switch (typeOf(embed)) {
		case 'app.bsky.embed.record#view':
			return (embed as AppBskyEmbedRecord.View).record;
		case 'app.bsky.embed.recordWithMedia#view':
			return (embed as AppBskyEmbedRecordWithMedia.View).record.record;
		default:
			return undefined;
	}
}

function embedOf(embed: unknown): Media & { quote?: BskyQuote } {
	const media =
		typeOf(embed) === 'app.bsky.embed.recordWithMedia#view'
			? mediaOf((embed as AppBskyEmbedRecordWithMedia.View).media)
			: mediaOf(embed);
	const record = quotedRecord(embed);
	return record === undefined ? media : { ...media, quote: quoteOf(record) };
}

export function toPostCard(post: AppBskyFeedDefs.PostView): BskyPostCardView {
	const text = recordText(post.record);
	return {
		uri: post.uri,
		url: bskyPostUrl(post.uri),
		author: toActor(post.author),
		text: text.text,
		facets: text.facets,
		createdAt: text.createdAt ?? post.indexedAt,
		...embedOf(post.embed),
		likedByMe: Boolean(post.viewer?.like),
		raw: post,
	};
}

function replyInfo(item: AppBskyFeedDefs.FeedViewPost): BskyFeedItemView['reply'] {
	const isReply = Boolean((item.post.record as { reply?: unknown } | undefined)?.reply);
	if (!isReply) return undefined;
	const parent = item.reply?.parent;
	if (typeOf(parent) !== 'app.bsky.feed.defs#postView') return { parentFollowed: false };
	const author = (parent as AppBskyFeedDefs.PostView).author;
	return { parentDid: author.did, parentFollowed: Boolean(author.viewer?.following) };
}

export function toFeedItem(item: AppBskyFeedDefs.FeedViewPost): BskyFeedItemView {
	const repost =
		typeOf(item.reason) === 'app.bsky.feed.defs#reasonRepost'
			? (item.reason as AppBskyFeedDefs.ReasonRepost)
			: undefined;
	const parent = item.reply?.parent;
	return {
		key: repost ? `${item.post.uri}#repost:${repost.uri ?? repost.by.did}` : item.post.uri,
		post: toPostCard(item.post),
		repostedBy: repost ? toActor(repost.by) : undefined,
		reply: replyInfo(item),
		root:
			typeOf(item.reply?.root) === 'app.bsky.feed.defs#postView'
				? toPostCard(item.reply!.root as AppBskyFeedDefs.PostView)
				: undefined,
		parent:
			typeOf(parent) === 'app.bsky.feed.defs#postView'
				? toPostCard(parent as AppBskyFeedDefs.PostView)
				: undefined,
		replyTo:
			typeOf(parent) === 'app.bsky.feed.defs#postView'
				? toActor((parent as AppBskyFeedDefs.PostView).author)
				: undefined,
	};
}
