import { getPreferences, putPreferences } from '$lib/api/appview';
import type { ChronicleEventView, ChroniclePage, ChronicleReadYear } from '$lib/api/types';

export const chronicleStorageKey = (did: string) => `nagi-chronicle-seen:${did}`;
export const chronicleRevisionsKey = (did: string) => `nagi-chronicle-read-revisions:${did}`;
export const chronicleYearsKey = (did: string) => `nagi-chronicle-read-years:${did}`;

/** 従来の端末内既読の移行用。新しい既読のハッシュはサーバーが発行する。 */
export function legacyChronicleRevision(event: ChronicleEventView): string {
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

export function createChronicleReadState(
	did: string,
	isCurrent: () => boolean,
	onChange: () => void,
) {
	const years = new Map<number, string>();
	const pending = new Map<number, string>();
	let disposed = false;
	let syncing: Promise<void> | undefined;
	let resync = false;
	const active = () => !disposed && isCurrent();
	const loadEntries = (value: unknown, target: Map<number, string>) => {
		if (!Array.isArray(value)) return;
		const thisYear = new Date(Date.now() + 5 * 60 * 60_000).getUTCFullYear();
		for (const entry of value)
			if (
				Array.isArray(entry) &&
				entry.length === 2 &&
				Number.isInteger(entry[0]) &&
				entry[0] >= 2020 &&
				entry[0] <= thisYear &&
				typeof entry[1] === 'string' &&
				/^[0-9a-f]{64}$/.test(entry[1])
			)
				target.set(entry[0], entry[1]);
	};
	const load = () => {
		try {
			const saved = JSON.parse(localStorage.getItem(chronicleYearsKey(did)) ?? '{}');
			years.clear();
			loadEntries(saved.years, years);
			loadEntries(saved.pending, pending);
			for (const [year, revision] of pending) years.set(year, revision);
		} catch {
			/* 保存不可でもサーバーから回復する。 */
		}
	};
	load();

	const persist = () => {
		if (!active()) return;
		try {
			localStorage.setItem(
				chronicleYearsKey(did),
				JSON.stringify({ years: [...years], pending: [...pending] }),
			);
		} catch {
			/* 通信・ストレージが使えなくてもメモリの既読は保持する。 */
		}
		onChange();
	};
	const adopt = (remote: ChronicleReadYear[]) => {
		years.clear();
		for (const read of remote) years.set(read.year, read.revision);
		for (const [year, revision] of pending) years.set(year, revision);
		persist();
	};
	async function syncOnce() {
		if (!active()) return;
		try {
			const view = await getPreferences();
			if (!active() || !view.chronicleReadYears) return;
			adopt(view.chronicleReadYears);
			const sent = [...pending].map(([year, revision]) => ({ year, revision }));
			for (let index = 0; index < sent.length; index += 100) {
				if (!active()) return;
				const batch = sent.slice(index, index + 100);
				const merged = await putPreferences({ chronicleReadYears: batch });
				if (!active() || !merged.chronicleReadYears) return;
				for (const read of batch)
					if (pending.get(read.year) === read.revision) pending.delete(read.year);
				// 古い版はサーバーが保存しない。再送し続けず、返された確定値を採用する。
				adopt(merged.chronicleReadYears);
			}
		} catch {
			/* 未送信の年は次の閲覧・画面復帰で再送する。 */
		}
	}
	const sync = (): Promise<void> => {
		resync = true;
		if (!syncing)
			syncing = (async () => {
				while (resync && active()) {
					resync = false;
					await syncOnce();
				}
			})().finally(() => {
				syncing = undefined;
			});
		return syncing;
	};
	const mark = (read: ChronicleReadYear): Promise<void> => {
		if (!active()) return Promise.resolve();
		years.set(read.year, read.revision);
		pending.set(read.year, read.revision);
		persist();
		return sync();
	};
	return {
		years,
		sync,
		mark,
		/** 元の端末でその年の全項目を読んでいた場合だけ年単位へ移行する。 */
		async migrate(page: ChroniclePage) {
			if (page.year === undefined || !page.revision || !page.items.length || years.has(page.year))
				return;
			try {
				const legacy = new Map<string, string>(
					JSON.parse(localStorage.getItem(chronicleStorageKey(did)) ?? '[]'),
				);
				const tokens = new Set<string>(
					JSON.parse(localStorage.getItem(chronicleRevisionsKey(did)) ?? '[]'),
				);
				const read = await Promise.all(
					page.items.map(async (item) => {
						const revision = legacyChronicleRevision(item);
						if (legacy.get(item.id) === revision) return true;
						if (!tokens.size) return false;
						const hash = await crypto.subtle.digest(
							'SHA-256',
							new TextEncoder().encode(JSON.stringify([item.id, revision])),
						);
						return tokens.has(
							Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join(
								'',
							),
						);
					}),
				);
				if (active() && !years.has(page.year) && read.every(Boolean))
					await mark({ year: page.year, revision: page.revision });
			} catch {
				/* 壊れた従来の保存は既読扱いにしない。 */
			}
		},
		/** 他のタブが保存した既読を取り込む。自分の未送信分は残す。 */
		reload() {
			if (!active()) return;
			load();
			onChange();
		},
		dispose() {
			disposed = true;
		},
	};
}
