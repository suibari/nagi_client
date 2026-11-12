import type { ChronicleEventKind, ChronicleEventView, ChroniclePage } from '$lib/api/types';

/**
 * 年表の見せ方を決める純関数だけを置く。
 * $lib/diary/calendar.ts と同じで、ロジックをコンポーネントから出してテストできるようにする。
 */

export type ChronicleYear = { year: string; events: ChronicleEventView[] };

/**
 * 年ごとにまとめる。**サーバが1ページ＝1年を古い順で返すので、通常はページ境界と一致する。**
 * それでも自前でまとめ直すのは、ページをまたいで同じ年が続く場合（将来カーソルを
 * 変えたとき）に見出しが二度出ないようにするため。
 *
 * 並べ替えはしない。サーバが決めた順序（古い順）をそのまま保つ。
 */
export function groupChronicleByYear(items: ChronicleEventView[]): ChronicleYear[] {
	const years: ChronicleYear[] = [];
	for (const event of items) {
		const year = event.date.slice(0, 4);
		const last = years[years.length - 1];
		if (last?.year === year) last.events.push(event);
		else years.push({ year, events: [event] });
	}
	return years;
}

/**
 * 追加ページを既存へ足す。**id で重複を落とす。**
 * 同じ年をもう一度読んだときに行が二重に並ぶのを防ぐ（「はじめて」の記録は
 * どの年窓からも同じ id で出うる）。
 */
export function mergeChronicle(
	held: ChronicleEventView[],
	incoming: ChronicleEventView[],
): ChronicleEventView[] {
	const seen = new Set(held.map((event) => event.id));
	return [...held, ...incoming.filter((event) => !seen.has(event.id))];
}

/** kind ごとのアイコン名（$lib/components/shell/Icon.svelte の名前）。 */
const ICONS: Record<ChronicleEventKind, string> = {
	nagi_joined: 'home',
	bot_met: 'heart',
	first_card_ur: 'cards',
	first_card_aar: 'cards',
	anniversary_card: 'cards',
	highlight: 'pin',
	news_context: 'newspaper',
};

export const chronicleEventIcon = (kind: ChronicleEventKind): string => ICONS[kind];

/**
 * 年表に出す見出し。
 *
 * **LLM が書いた kind だけサーバの文字列を使い、それ以外は i18n から引く。**
 * 固定文言をサーバに作らせると、その行を作った時点の言語で固まってしまう。
 * labels は呼び出し側が m から渡す（このファイルを i18n に依存させないため＝テストが軽い）。
 */
export function chronicleEventLabel(
	event: ChronicleEventView,
	locale: string,
	labels: Partial<Record<ChronicleEventKind, string>>,
): string {
	const ja = locale === 'ja';
	if (event.titleJa || event.titleEn)
		return (ja ? (event.titleJa ?? event.titleEn) : (event.titleEn ?? event.titleJa))!;
	return labels[event.kind] ?? '';
}

/** ひとこと。LLM が書いた kind にだけ入る。 */
export function chronicleEventDetail(
	event: ChronicleEventView,
	locale: string,
): string | undefined {
	const ja = locale === 'ja';
	return (
		(ja ? (event.detailJa ?? event.detailEn) : (event.detailEn ?? event.detailJa)) || undefined
	);
}

/**
 * その月のニュースを、同じ月の最後の項目の**下に紐づける**ための判定。
 *
 * サーバは news_context を月末の日付で返すので、昇順に並べればその月のまとめの後ろに来る。
 * 表示側はそれを独立した節目ではなく、**直前のまとめに付く一行**として描く
 * （日付も出さない。「8/19 まとめ ＋ その下にこの頃の世間の出来事」という読ませ方）。
 */
export const isAttachedNews = (event: ChronicleEventView): boolean => event.kind === 'news_context';

export type ChronicleLoadResult = {
	items: ChronicleEventView[];
	/** 失敗したときに再試行で渡すcursor。全年を読み終えたら undefined。 */
	cursor?: string;
	hasMore: boolean;
	error?: unknown;
};

/**
 * 古い年から今年まで、ページを順に読み切る（CHRON-03）。
 * 途中で失敗したら、読めた分と失敗したページのcursorを返して呼び出し側に再試行させる。
 * AppViewが同じcursorを返し続けても止まるよう、一度通ったcursorで打ち切る。
 */
export async function loadAllChronicle(
	fetchPage: (cursor: string | undefined) => Promise<ChroniclePage>,
	start: { items: ChronicleEventView[]; cursor?: string } = { items: [] },
	onPage?: (page: ChroniclePage) => void,
): Promise<ChronicleLoadResult> {
	let items = start.items;
	let cursor = start.cursor;
	const seen = new Set<string>();
	for (;;) {
		let page: ChroniclePage;
		try {
			page = await fetchPage(cursor);
		} catch (error) {
			return { items, cursor, hasMore: true, error };
		}
		items = mergeChronicle(items, page.items);
		onPage?.(page);
		if (!page.hasMore || !page.cursor || seen.has(page.cursor)) return { items, hasMore: false };
		seen.add(page.cursor);
		cursor = page.cursor;
	}
}
