import { get, writable } from 'svelte/store';
import { getAdventCalendar, getPreferences, putPreferences } from '$lib/api/appview';
import type { AdventCalendarView, AdventReadState } from '$lib/api/types';
import { session } from '$lib/oauth/session.svelte';
import { adventYear, isAdventMenuSeason } from './advent';

/**
 * アドカレのメニューのバッジ（新しいカードが開いた）と、既読・開封済みの状態。
 *
 * 既読は AppView の preferences（adventRead）に持つ。専用の XRPC を作らないのは、
 * OAuth の権限を増やすと既存の利用者全員に再認可を求めることになるため。
 */
export const adventUnread = writable(0);
/** 最後に取れたカレンダー。ページを開いたときの初回描画に使う。 */
export const adventCalendar = writable<AdventCalendarView | undefined>(undefined);
export const adventReadState = writable<AdventReadState | undefined>(undefined);

let viewer: string | undefined;
let request = 0;

function update() {
	const calendar = get(adventCalendar);
	const read = get(adventReadState);
	const lastSeen = read && read.year === calendar?.year ? read.lastSeenDay : 0;
	adventUnread.set(viewer && calendar && calendar.openedDay > lastSeen ? 1 : 0);
}

export async function loadAdventCalendar(): Promise<AdventCalendarView> {
	const calendar = await getAdventCalendar(adventYear());
	adventCalendar.set(calendar);
	update();
	return calendar;
}

async function loadReadState(did: string): Promise<AdventReadState | undefined> {
	const preferences = await getPreferences();
	if (get(session)?.did !== did) return undefined;
	adventReadState.set(preferences.adventRead);
	update();
	return preferences.adventRead;
}

/**
 * ページを開いたときの既読の読み込み。開封演出を出すかどうかは、サーバーの既読を
 * 読めてから決める（読めないまま出すと、別の端末で見た手紙をもう一度開けることになる）。
 */
export async function fetchAdventReadState(did: string): Promise<AdventReadState | null> {
	return (await loadReadState(did)) ?? null;
}

function applyLocal(year: number, change: { lastSeenDay?: number; openedDay?: number }) {
	const current = get(adventReadState);
	const base = current?.year === year ? current : { year, lastSeenDay: 0, openedDays: [] };
	adventReadState.set({
		year,
		lastSeenDay: Math.max(base.lastSeenDay, change.lastSeenDay ?? 0),
		openedDays:
			change.openedDay && !base.openedDays.includes(change.openedDay)
				? [...base.openedDays, change.openedDay].sort((a, b) => a - b)
				: base.openedDays,
	});
	update();
}

async function save(year: number, change: { lastSeenDay?: number; openedDay?: number }) {
	const did = get(session)?.did;
	if (!did) return;
	applyLocal(year, change);
	try {
		const saved = await putPreferences({ adventRead: { year, ...change } });
		if (get(session)?.did === did && saved.adventRead) adventReadState.set(saved.adventRead);
		update();
	} catch (cause) {
		// 端末内では既読にしたまま。次に開いたときにもう一度送る。
		console.error('Failed to save advent read state:', cause);
	}
}

/** カレンダーを画面に出した。開いている最新の日まで既読にする。 */
export function markAdventSeen(year: number, day: number) {
	const read = get(adventReadState);
	if (day < 1 || (read?.year === year && read.lastSeenDay >= day)) return;
	void save(year, { lastSeenDay: day });
}

/** 自分のカードの開封演出を見終えた。 */
export function markAdventOpened(year: number, day: number) {
	void save(year, { openedDay: day });
}

export function startAdventNotice(): () => void {
	let timer: ReturnType<typeof setTimeout> | undefined;
	let lastRefresh = 0;
	async function refresh() {
		lastRefresh = Date.now();
		if (timer) clearTimeout(timer);
		timer = undefined;
		// メニューに出していない時期は、バッジのための取得もしない。
		if (!isAdventMenuSeason()) return;
		const did = viewer;
		const version = ++request;
		try {
			const calendar = await loadAdventCalendar();
			if (version !== request) return;
			if (did) await loadReadState(did);
			// 次の日が開いたら（0:00）取り直す。日をまたいで開きっぱなしのタブ向け。
			if (calendar.nextOpenAt) {
				const wait = Date.parse(calendar.nextOpenAt) - Date.now() + 5_000;
				if (wait > 0 && wait < 24 * 60 * 60_000) timer = setTimeout(() => void refresh(), wait);
			}
		} catch {
			// 取れないときはバッジを付けない（未読と断定しない）。
		}
	}
	const unsubscribe = session.subscribe((value) => {
		if (viewer === value?.did) return;
		viewer = value?.did;
		adventReadState.set(undefined);
		update();
		void refresh();
	});
	// タブに戻るたびに取り直すと多すぎる。カードは1日1枚なので5分あければ足りる。
	const onVisible = () => {
		if (!document.hidden && Date.now() - lastRefresh > 5 * 60_000) void refresh();
	};
	document.addEventListener('visibilitychange', onVisible);
	return () => {
		unsubscribe();
		if (timer) clearTimeout(timer);
		viewer = undefined;
		request++;
		adventUnread.set(0);
		document.removeEventListener('visibilitychange', onVisible);
	};
}
