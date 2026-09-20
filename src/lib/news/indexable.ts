import { listIndexableNews } from '$lib/api/appview';
import type { ActorView, NewsView } from '$lib/api/types';

/**
 * 検索に載せるニュースの集合。prerender の `entries()`、記事ページの `load()`、
 * sitemap.xml が**同じこの関数**を通る。
 *
 * 別々に取ると3者の集合がずれ、「sitemap には載っているが存在しないURL」や
 * 「ビルドされているが sitemap に無い記事」が静かに生まれる。
 */

/**
 * 一度のビルドで索引に載せる上限。
 *
 * botたんは1日最大20件なので、1500 はおよそ2.5か月分。これより古い記事は
 * ビルド対象から外れて 404 になるが、日付の付いたポジティブニュースに検索価値は
 * ほぼ残らないうえ、上限が無いとビルド時間が年々伸び続ける。
 * ビルドが5分を超えるようなら、この値ではなく方式（増分ビルド）を見直すこと。
 */
export const MAX_INDEXABLE_NEWS = 1500;

/** `at://<did>/com.suibari.nagi.news/<rkey>` の末尾。パーマリンクの識別子。 */
export const newsRkey = (uri: string): string => uri.split('/').pop() ?? '';

type NewsPageLike = {
	items: NewsView[];
	cursor?: string;
	hasMore: boolean;
	botActor?: ActorView;
};

/** 索引対象の一式。botたんの表示名とアイコンはプリレンダにも焼き込む。 */
export type IndexableNews = { items: NewsView[]; botActor?: ActorView };

/**
 * ページングを畳んで1本の配列にする。ページャを差し替えられるようにしてあるのは、
 * ネットワークなしでテストするため。
 */
export async function collectIndexableNews(
	page: (cursor?: string) => Promise<NewsPageLike>,
	max = MAX_INDEXABLE_NEWS,
): Promise<IndexableNews> {
	const items: NewsView[] = [];
	let botActor: ActorView | undefined;
	let cursor: string | undefined;
	// cursor が進まない実装に当たっても止まるよう、回数でも縛る。
	for (let guard = 0; guard < 100 && items.length < max; guard += 1) {
		const result = await page(cursor);
		items.push(...result.items);
		botActor ??= result.botActor;
		if (!result.hasMore || !result.cursor || result.cursor === cursor) break;
		cursor = result.cursor;
	}
	return { items: items.slice(0, max), botActor };
}

let memo: Promise<IndexableNews> | undefined;

/**
 * ビルド1回につき1度だけ取得する。entries() → load() × 記事数 → sitemap と
 * 三度呼ばれるので、都度取りに行くとビルドがネットワーク待ちになる。
 *
 * **失敗してもビルドを落とさない。** AppView が一時的に落ちていたり、まだこの
 * エンドポイントを持っていない場合は空配列になり、記事ページが生成されないだけで済む
 * （既存ページは無傷）。ここで throw すると、ニュースの不調がサイト全体のデプロイを止める。
 */
export function fetchIndexableNews(): Promise<IndexableNews> {
	return (memo ??= collectIndexableNews((cursor) => listIndexableNews('ja', cursor)).catch(
		(error) => {
			console.warn('[seo] 索引対象ニュースを取得できませんでした:', error);
			return { items: [] };
		},
	));
}

/** テスト用。モジュールスコープのメモを捨てる。 */
export function resetIndexableNewsCache(): void {
	memo = undefined;
}
