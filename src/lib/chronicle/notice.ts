import { get, writable } from 'svelte/store';
import { getChronicle } from '$lib/api/appview';
import type { ChroniclePage } from '$lib/api/types';
import { session } from '$lib/oauth/session.svelte';
import { chronicleYearsKey, createChronicleReadState } from './read-state';

export const chronicleUnread = writable(0);
const states = new Map<string, ReturnType<typeof createChronicleReadState>>();
let latest = new Map<number, { revision: string; hasItems: boolean }>();
let viewer: string | undefined;
let generation = 0;
let lastRead = 0;

function readState(did: string) {
	let state = states.get(did);
	if (!state) {
		state = createChronicleReadState(did, () => get(session)?.did === did, update);
		states.set(did, state);
	}
	return state;
}

function update() {
	const read = viewer ? readState(viewer).years : new Map<number, string>();
	chronicleUnread.set(
		viewer &&
			[...latest].some(
				([year, page]) => (page.hasItems || read.has(year)) && read.get(year) !== page.revision,
			)
			? 1
			: 0,
	);
}

/** 年全体を読み込めたページだけ既読にする。未表示の年は残す。 */
export async function markChronicleSeen(did: string, page: ChroniclePage) {
	if (get(session)?.did !== did || page.year === undefined || !page.revision) return;
	lastRead++;
	latest.set(page.year, { revision: page.revision, hasItems: page.items.length > 0 });
	await readState(did).mark({ year: page.year, revision: page.revision });
}

export function clearChronicleReadState(did: string) {
	states.get(did)?.dispose();
	states.delete(did);
	if (viewer === did) {
		latest.clear();
		chronicleUnread.set(0);
	}
}

export function startChronicleNotice(): () => void {
	let pending = false;
	async function refresh() {
		const did = viewer;
		if (!did || pending) return;
		pending = true;
		const version = generation;
		const readVersion = lastRead;
		try {
			const revisions = new Map<number, { revision: string; hasItems: boolean }>();
			await readState(did).sync();
			if (generation !== version || lastRead !== readVersion) return;
			let cursor: string | undefined;
			const cursors = new Set<string>();
			do {
				const page = await getChronicle(did, { cursor });
				if (generation !== version || lastRead !== readVersion) return;
				if (page.year !== undefined && page.revision) {
					await readState(did).migrate(page);
					if (generation !== version || lastRead !== readVersion) return;
					revisions.set(page.year, { revision: page.revision, hasItems: page.items.length > 0 });
				}
				cursor = page.hasMore ? page.cursor : undefined;
				if (cursor && cursors.has(cursor)) return;
				if (cursor) cursors.add(cursor);
			} while (cursor);
			latest = revisions;
			update();
		} catch {
			/* 通信失敗では未読状態を変えない。 */
		} finally {
			if (generation === version) {
				pending = false;
				// 取得中に新しい年ページを読んだ場合、古い取得結果では上書きしない。
				if (lastRead !== readVersion) void refresh();
			}
		}
	}
	const unsubscribe = session.subscribe((value) => {
		viewer = value?.did;
		generation++;
		pending = false;
		latest = new Map();
		chronicleUnread.set(0);
		void refresh();
	});
	const onVisible = () => {
		if (!document.hidden) void refresh();
	};
	// 同じアカウントの別タブで既読にした内容を反映する。
	const onStorage = (event: StorageEvent) => {
		if (viewer && event.key === chronicleYearsKey(viewer)) states.get(viewer)?.reload();
	};
	document.addEventListener('visibilitychange', onVisible);
	window.addEventListener('storage', onStorage);
	return () => {
		unsubscribe();
		generation++;
		viewer = undefined;
		chronicleUnread.set(0);
		document.removeEventListener('visibilitychange', onVisible);
		window.removeEventListener('storage', onStorage);
	};
}
