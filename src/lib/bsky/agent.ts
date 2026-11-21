import { BskyThreadLoader, toThreadSnapshot } from './thread';
import { get } from 'svelte/store';
import { SvelteSet } from 'svelte/reactivity';
import { Agent, type AppBskyFeedDefs, type ModerationOpts } from '@atproto/api';
import type { OAuthSession } from '@atproto/oauth-client-browser';
import { session } from '$lib/oauth/session.svelte';
import { feedGeneratorUri, isFeedGeneratorUri, parseFeedInput } from './links';
import { filterTimeline, type TimelineViewPrefs } from './timelineFilter';
import { toActor, toFeedItem, type BskyActor, type BskyFeedItemView } from './mapView';
import { BskyInteractions, type BskyInteractionWriter } from './interactions.svelte';
import { hasBlueskyInteractionScope } from '$lib/optin/scope-optin';

/**
 * Bluesky の AppView への入口。ユーザーの PDS へ atproto-proxy 付きで投げる（A案）。
 * Nagi の AppView は Bluesky のコンテンツを中継も保存もしない。
 * 権限は Bluesky 連携のオプトインで付く（BLUESKY_VIEW_SCOPES）。
 */

const BSKY_APPVIEW_DID = 'did:web:api.bsky.app';
/** ハンドルの解決だけは認証の要らない公開 API を使う（PDS 経由だと rpc 権限がもう1つ要る）。 */
const PUBLIC_API = 'https://public.api.bsky.app';
const PAGE_SIZE = 30;

/** フィードタブの指し先。ホームタイムライン（フォロー中）はフィードジェネレータを持たない。 */
export type BskyFeedRef = { kind: 'timeline' } | { kind: 'generator'; uri: string };

type LoadedPrefs = {
	moderation: ModerationOpts;
	savedFeeds: string[];
	/** Bluesky アプリの「フォロー中」の表示設定（返信・リポスト・引用を隠すか）。 */
	homeView?: TimelineViewPrefs;
};

type Context = {
	session: OAuthSession;
	agent: Agent;
	prefs?: Promise<LoadedPrefs>;
	threads?: BskyThreadLoader;
};
let context: Context | undefined;

function currentContext(): Context {
	const current = get(session);
	if (!current) throw new Error('Authentication required');
	if (context?.session !== current) {
		const agent = new Agent(current);
		agent.configureProxy(`${BSKY_APPVIEW_DID}#bsky_appview`);
		context = { session: current, agent };
	}
	return context;
}

/**
 * 本人の Bluesky 側の設定（モデレーション・保存済みフィード・フォロー中の表示設定）。
 * 購読ラベラーを atproto-accept-labelers に載せないと AppView がそのラベルを返さないので、
 * フィードを引く前に必ず済ませる。セッション中は使い回す（Bluesky 側で設定を変えたら再読み込みで反映）。
 */
function loadPrefs(ctx: Context): Promise<LoadedPrefs> {
	ctx.prefs ??= (async () => {
		const prefs = await ctx.agent.getPreferences();
		ctx.agent.configureLabelers(prefs.moderationPrefs.labelers.map((labeler) => labeler.did));
		// 定義が引けなくてもラベル値そのものでの判定は効くので、フィードは止めない。
		const labelDefs = await ctx.agent.getLabelDefinitions(prefs).catch(() => ({}));
		return {
			moderation: { userDid: ctx.session.did, prefs: prefs.moderationPrefs, labelDefs },
			savedFeeds: prefs.savedFeeds.filter((feed) => feed.type === 'feed').map((feed) => feed.value),
			homeView: prefs.feedViewPrefs.home,
		};
	})();
	// 失敗を握ったままにすると、一度落ちたら再読み込みまで直らない。
	ctx.prefs.catch(() => {
		if (context === ctx) ctx.prefs = undefined;
	});
	return ctx.prefs;
}

export const getModerationOpts = async () => (await loadPrefs(currentContext())).moderation;

/** Fetch replies through the same authenticated PDS proxy and subscribed labelers as the feed. */
export async function getBskyThread(uri: string) {
	const ctx = currentContext();
	ctx.threads ??= new BskyThreadLoader(async (rootUri) => {
		await loadPrefs(ctx);
		const { data } = await ctx.agent.app.bsky.feed.getPostThread({
			uri: rootUri,
			depth: 100,
			parentHeight: 0,
		});
		return toThreadSnapshot(data.thread);
	});
	return ctx.threads.get(uri);
}

export type BskyFeedPage = { items: BskyFeedItemView[]; cursor?: string };

/**
 * 表示設定で絞り込むと1ページがほとんど空になることがある（返信を隠す設定で返信の多いTLなど）。
 * この件数に届くまで続きを読む。上限回数で打ち切り、残りは無限スクロールに任せる。
 */
const MIN_PAGE_ITEMS = 10;
const MAX_FETCH_ROUNDS = 4;

async function fetchRaw(ctx: Context, feed: BskyFeedRef, cursor?: string) {
	const { data } =
		feed.kind === 'timeline'
			? await ctx.agent.app.bsky.feed.getTimeline({ cursor, limit: PAGE_SIZE })
			: await ctx.agent.app.bsky.feed.getFeed({ feed: feed.uri, cursor, limit: PAGE_SIZE });
	return {
		items: data.feed.map(toFeedItem),
		// 同じカーソルが返ってくるフィードがある。続きが無いのに無限に引き続けないよう止める。
		cursor: data.cursor && data.cursor !== cursor ? data.cursor : undefined,
	};
}

export async function getBskyFeed(feed: BskyFeedRef, cursor?: string): Promise<BskyFeedPage> {
	const ctx = currentContext();
	const prefs = await loadPrefs(ctx);
	// 絞り込むのはホームタイムラインだけ。カスタムフィードの中身はフィード側が決めている
	// （Bluesky アプリもフォロー中の表示設定をカスタムフィードには掛けない）。
	const viewPrefs = feed.kind === 'timeline' ? prefs.homeView : undefined;
	const items: BskyFeedItemView[] = [];
	let next = cursor;
	for (let round = 0; round < MAX_FETCH_ROUNDS; round++) {
		const page = await fetchRaw(ctx, feed, next);
		items.push(
			...(viewPrefs ? filterTimeline(page.items, viewPrefs, ctx.session.did) : page.items),
		);
		next = page.cursor;
		if (!next || items.length >= MIN_PAGE_ITEMS) break;
	}
	return { items, cursor: next };
}

export type BskyFeedGenerator = {
	uri: string;
	displayName: string;
	avatar?: string;
	creator: BskyActor;
};

const toGenerator = (view: AppBskyFeedDefs.GeneratorView): BskyFeedGenerator => ({
	uri: view.uri,
	displayName: view.displayName,
	avatar: view.avatar,
	creator: toActor(view.creator),
});

export async function getBskyFeedGenerators(uris: string[]): Promise<BskyFeedGenerator[]> {
	if (!uris.length) return [];
	const { data } = await currentContext().agent.app.bsky.feed.getFeedGenerators({ feeds: uris });
	return data.feeds.map(toGenerator);
}

/** Bluesky で保存（ピン留め含む）しているフィード。リストやタイムラインは対象外。 */
export async function getSavedBskyFeeds(): Promise<BskyFeedGenerator[]> {
	const uris = (await loadPrefs(currentContext())).savedFeeds.filter(isFeedGeneratorUri);
	return getBskyFeedGenerators(uris);
}

async function resolveHandle(handle: string): Promise<string | undefined> {
	const url = new URL('/xrpc/com.atproto.identity.resolveHandle', PUBLIC_API);
	url.searchParams.set('handle', handle);
	const response = await fetch(url);
	if (!response.ok) return undefined;
	const body = (await response.json()) as { did?: unknown };
	return typeof body.did === 'string' ? body.did : undefined;
}

/** 貼り付けられた bsky.app の URL / AT-URI からフィードを引く。見つからなければ undefined。 */
export async function lookupBskyFeed(input: string): Promise<BskyFeedGenerator | undefined> {
	const parsed = parseFeedInput(input);
	if (!parsed) return undefined;
	const did = parsed.actor.startsWith('did:')
		? parsed.actor
		: await resolveHandle(parsed.actor.replace(/^@/, '').toLowerCase());
	if (!did) return undefined;
	const uri = feedGeneratorUri(did, parsed.rkey);
	if (!isFeedGeneratorUri(uri)) return undefined;
	const [generator] = await getBskyFeedGenerators([uri]);
	return generator;
}

/** 自分の投稿にいいねした人。数は返さず、先頭の数人だけ。 */
export async function getBskyLikers(uri: string, limit = 5): Promise<BskyActor[]> {
	const { data } = await currentContext().agent.app.bsky.feed.getLikes({ uri, limit });
	return data.likes.slice(0, limit).map((like) => toActor(like.actor));
}

/**
 * 本人のレコードへの書き込みは PDS が自分で処理するので、Bluesky AppView への proxy を付けない
 * Agent を使う（atproto-proxy 付きだと PDS が書き込みを AppView へ転送しようとする）。
 */
function repoAgent(): Agent {
	const current = get(session);
	if (!current) throw new Error('Authentication required');
	return new Agent(current);
}

const interactionWriter: BskyInteractionWriter = {
	async create(kind, subject) {
		const agent = repoAgent();
		const created =
			kind === 'like'
				? await agent.like(subject.uri, subject.cid)
				: await agent.repost(subject.uri, subject.cid);
		return created.uri;
	},
	async remove(kind, recordUri) {
		const agent = repoAgent();
		if (kind === 'like') await agent.deleteLike(recordUri);
		else await agent.deleteRepost(recordUri);
	},
};

/** いいね・リポストの自分の状態（BSKY-08）。アカウントの切り替えで作り直す。 */
export const bskyInteractions = new BskyInteractions(interactionWriter);
session.subscribe((current) => bskyInteractions.setOwner(current?.did));

let interactionScope: { session: OAuthSession; granted: Promise<boolean> } | undefined;

/** 操作の権限があるか（AUTH-08）。押すたびにトークン情報を引かないよう、セッションごとに覚える。 */
export function canInteractWithBsky(): Promise<boolean> {
	const current = get(session);
	if (!current) return Promise.resolve(false);
	if (interactionScope?.session !== current)
		interactionScope = { session: current, granted: hasBlueskyInteractionScope() };
	return interactionScope.granted;
}

export type BskyTargetStatus = 'ok' | 'gone' | 'reply-disabled' | 'quote-disabled';

/**
 * 返信・引用する直前に、相手の投稿がまだあり、返信・引用を受け付けているかを確かめる（BSKY-09）。
 * Bluesky は返信先が消えていても返信レコードを受け付けるので、孤立した返信を作らないために聞く。
 */
export async function checkBskyTarget(
	uri: string,
	kind: 'reply' | 'quote',
): Promise<BskyTargetStatus> {
	const { data } = await currentContext()
		.agent.app.bsky.feed.getPostThread({ uri, depth: 0, parentHeight: 0 })
		.catch((error: unknown) => {
			if ((error as { error?: string })?.error === 'NotFound') return { data: undefined };
			throw error;
		});
	const thread = data?.thread as { $type?: string; post?: AppBskyFeedDefs.PostView } | undefined;
	if (!thread?.post || thread.$type !== 'app.bsky.feed.defs#threadViewPost') return 'gone';
	if (kind === 'reply' && thread.post.viewer?.replyDisabled) return 'reply-disabled';
	if (kind === 'quote' && thread.post.viewer?.embeddingDisabled) return 'quote-disabled';
	return 'ok';
}

/** この画面で削除した Bluesky 投稿。AppView の反映を待たずに表示から外す。 */
export const deletedBskyPosts = new SvelteSet<string>();

/**
 * Nagi 経由で作った自分の Bluesky 投稿を、利用者の明示的な操作で削除する（BSKY-10）。
 * 自分のリポジトリの投稿以外は消さない。
 */
export async function deleteOwnBskyPost(uri: string): Promise<void> {
	const agent = repoAgent();
	const [repo, collection] = uri.slice('at://'.length).split('/');
	if (repo !== agent.did || collection !== 'app.bsky.feed.post')
		throw new Error('Only your own Bluesky posts can be deleted');
	await agent.deletePost(uri);
	deletedBskyPosts.add(uri);
}

type ThreadNode = { post?: { uri: string; author: { did: string } }; replies?: unknown[] };

/**
 * 分割したクロスポストの、先頭から末尾までの自分の投稿を順に返す。Nagi の投稿は先頭と末尾しか
 * 覚えていないので、Bluesky のスレッドを辿って途中の分を見つける。辿れなければ先頭と末尾だけ。
 */
export function crosspostChainUris(
	thread: unknown,
	did: string,
	copy: { root: { uri: string }; tail: { uri: string } },
): string[] {
	const walk = (node: ThreadNode, path: string[]): string[] | undefined => {
		if (!node.post || node.post.author.did !== did) return undefined;
		const next = [...path, node.post.uri];
		if (node.post.uri === copy.tail.uri) return next;
		for (const reply of node.replies ?? []) {
			const found = walk(reply as ThreadNode, next);
			if (found) return found;
		}
		return undefined;
	};
	return walk(thread as ThreadNode, []) ?? [...new Set([copy.root.uri, copy.tail.uri])];
}

/**
 * Nagi の投稿を削除するときに、利用者が選んだら Bluesky のコピーも全件消す（BSKY-10）。
 * 消せなかった件数を返す。
 */
export async function deleteCrosspostCopies(copy: {
	root: { uri: string };
	tail: { uri: string };
}): Promise<number> {
	const ctx = currentContext();
	let uris = [...new Set([copy.root.uri, copy.tail.uri])];
	if (copy.root.uri !== copy.tail.uri) {
		try {
			const { data } = await ctx.agent.app.bsky.feed.getPostThread({
				uri: copy.root.uri,
				depth: 100,
				parentHeight: 0,
			});
			uris = crosspostChainUris(data.thread, ctx.session.did, copy);
		} catch (error) {
			console.warn('[bsky] could not trace the crosspost chain', error);
		}
	}
	let failed = 0;
	// 末尾から消す。途中で止まっても、残るのは先頭側の続きのない投稿になる。
	for (const uri of uris.reverse()) {
		try {
			await deleteOwnBskyPost(uri);
		} catch (error) {
			if ((error as { error?: string })?.error === 'RecordNotFound') continue;
			console.warn('[bsky] could not delete a crosspost copy', uri, error);
			failed++;
		}
	}
	return failed;
}
