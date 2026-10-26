import { BskyThreadLoader, toThreadSnapshot } from './thread';
import { get } from 'svelte/store';
import { Agent, type AppBskyFeedDefs, type ModerationOpts } from '@atproto/api';
import type { OAuthSession } from '@atproto/oauth-client-browser';
import { session } from '$lib/oauth/session.svelte';
import { feedGeneratorUri, isFeedGeneratorUri, parseFeedInput } from './links';
import { filterTimeline, type TimelineViewPrefs } from './timelineFilter';
import { toActor, toFeedItem, type BskyActor, type BskyFeedItemView } from './mapView';

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
