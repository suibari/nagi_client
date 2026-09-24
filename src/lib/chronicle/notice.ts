import { get, writable } from 'svelte/store';
import { getChronicle } from '$lib/api/appview';
import type { ChronicleEventView } from '$lib/api/types';
import { session } from '$lib/oauth/session.svelte';

export const chronicleUnread = writable(0);
const seenByDid = new Map<string, Map<string, string>>();
let latest = new Map<string, string>();
let viewer: string | undefined;
let generation = 0;
const storageKey = (did: string) => `nagi-chronicle-seen:${did}`;

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

function seen(did: string): Map<string, string> {
	let value = seenByDid.get(did);
	if (!value) {
		value = new Map();
		try {
			const stored: unknown = JSON.parse(localStorage.getItem(storageKey(did)) ?? '[]');
			if (Array.isArray(stored))
				for (const entry of stored)
					if (
						Array.isArray(entry) &&
						entry.length === 2 &&
						entry.every((v) => typeof v === 'string')
					)
						value.set(entry[0], entry[1]);
		} catch {
			/* 保存不可でもメモリ上の既読は使う。 */
		}
		seenByDid.set(did, value);
	}
	return value;
}

function update() {
	const read = viewer ? seen(viewer) : new Map<string, string>();
	chronicleUnread.set(
		viewer && [...latest].some(([id, revision]) => read.get(id) !== revision) ? 1 : 0,
	);
}

/** 実際に読み込めたページだけ既読にする。古い年の未読は残す。 */
export function markChronicleSeen(did: string, items: ChronicleEventView[]) {
	if (get(session)?.did !== did) return;
	const read = seen(did);
	for (const item of items) read.set(item.id, chronicleRevision(item));
	try {
		localStorage.setItem(storageKey(did), JSON.stringify([...read]));
	} catch {
		/* メモリに保持。 */
	}
	update();
}

export function startChronicleNotice(): () => void {
	let pending = false;
	async function refresh() {
		const did = viewer;
		if (!did || pending) return;
		pending = true;
		const version = generation;
		try {
			const revisions = new Map<string, string>();
			let cursor: string | undefined;
			const cursors = new Set<string>();
			do {
				const page = await getChronicle(did, { cursor });
				if (generation !== version) return;
				for (const item of page.items) revisions.set(item.id, chronicleRevision(item));
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
		latest = new Map();
		chronicleUnread.set(0);
		void refresh();
	});
	const onVisible = () => {
		if (!document.hidden) void refresh();
	};
	const onStorage = (event: StorageEvent) => {
		if (viewer && (event.key === null || event.key === storageKey(viewer))) {
			seenByDid.delete(viewer);
			update();
		}
	};
	const timer = setInterval(onVisible, 2 * 60_000);
	document.addEventListener('visibilitychange', onVisible);
	window.addEventListener('storage', onStorage);
	return () => {
		unsubscribe();
		generation++;
		viewer = undefined;
		chronicleUnread.set(0);
		clearInterval(timer);
		document.removeEventListener('visibilitychange', onVisible);
		window.removeEventListener('storage', onStorage);
	};
}
