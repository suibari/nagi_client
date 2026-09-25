import { get, writable } from 'svelte/store';
import { getChronicle } from '$lib/api/appview';
import type { ChronicleEventView } from '$lib/api/types';
import { session } from '$lib/oauth/session.svelte';
import { chronicleReadToken, createChronicleReadState } from './read-state';

export const chronicleUnread = writable(0);
const states = new Map<string, ReturnType<typeof createChronicleReadState>>();
let latest = new Set<string>();
let viewer: string | undefined;
let generation = 0;

// 表示言語で変わるカード・ニュースの展開情報は比較しない。
export function chronicleRevision(event: ChronicleEventView): string {
	return JSON.stringify([
		event.kind,
		event.date,
		event.titleJa,
		event.titleEn,
		event.detailJa,
		event.detailEn,
		event.diaryDate,
	]);
}

function readState(did: string) {
	let state = states.get(did);
	if (!state) {
		state = createChronicleReadState(did, () => get(session)?.did === did, update);
		states.set(did, state);
	}
	return state;
}

function update() {
	const read = viewer ? readState(viewer).tokens : new Set<string>();
	chronicleUnread.set(viewer && [...latest].some((token) => !read.has(token)) ? 1 : 0);
}

/** 実際に読み込めたページだけ既読にする。未表示の年は残す。 */
export async function markChronicleSeen(did: string, items: ChronicleEventView[]) {
	if (get(session)?.did !== did) return;
	await readState(did).mark(items.map((item) => [item.id, chronicleRevision(item)]));
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
		try {
			const revisions = new Set<string>();
			await readState(did).sync();
			if (generation !== version) return;
			let cursor: string | undefined;
			const cursors = new Set<string>();
			do {
				const page = await getChronicle(did, { cursor });
				if (generation !== version) return;
				const tokens = await Promise.all(
					page.items.map((item) => chronicleReadToken(item.id, chronicleRevision(item))),
				);
				if (generation !== version) return;
				for (const token of tokens) revisions.add(token);
				cursor = page.hasMore ? page.cursor : undefined;
				if (cursor && cursors.has(cursor)) return;
				if (cursor) cursors.add(cursor);
			} while (cursor);
			latest = revisions;
			update();
		} catch {
			/* 通信失敗では未読状態を変えない。 */
		} finally {
			if (generation === version) pending = false;
		}
	}
	const unsubscribe = session.subscribe((value) => {
		viewer = value?.did;
		generation++;
		pending = false;
		latest = new Set();
		chronicleUnread.set(0);
		void refresh();
	});
	const onVisible = () => {
		if (!document.hidden) void refresh();
	};
	document.addEventListener('visibilitychange', onVisible);
	return () => {
		unsubscribe();
		generation++;
		viewer = undefined;
		chronicleUnread.set(0);
		document.removeEventListener('visibilitychange', onVisible);
	};
}
