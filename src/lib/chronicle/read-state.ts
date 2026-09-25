import { getPreferences, putPreferences } from '$lib/api/appview';

export const chronicleStorageKey = (did: string) => `nagi-chronicle-seen:${did}`;
export const chronicleRevisionsKey = (did: string) => `nagi-chronicle-read-revisions:${did}`;

/** 項目IDと表示内容の組を既読にする。別端末が古い版を読んでも、新しい版の既読を消さない。 */
export async function chronicleReadToken(id: string, revision: string): Promise<string> {
	const bytes = new TextEncoder().encode(JSON.stringify([id, revision]));
	const hash = await crypto.subtle.digest('SHA-256', bytes);
	return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createChronicleReadState(
	did: string,
	isCurrent: () => boolean,
	onChange: () => void,
) {
	const tokens = new Set<string>();
	let disposed = false;
	let syncing: Promise<void> | undefined;
	let resync = false;
	const active = () => !disposed && isCurrent();
	const persist = () => {
		if (!active()) return;
		try {
			localStorage.setItem(chronicleRevisionsKey(did), JSON.stringify([...tokens]));
		} catch {
			// 保存不可でも、この画面の既読は保持する。
		}
		onChange();
	};
	const ready = (async () => {
		try {
			const stored: unknown = JSON.parse(localStorage.getItem(chronicleRevisionsKey(did)) ?? '[]');
			if (Array.isArray(stored))
				for (const token of stored)
					if (typeof token === 'string' && /^[0-9a-f]{64}$/.test(token)) tokens.add(token);
			// 従来の端末内の既読も移行する。未表示の項目や更新された版は既読にしない。
			const legacy: unknown = JSON.parse(localStorage.getItem(chronicleStorageKey(did)) ?? '[]');
			if (Array.isArray(legacy)) {
				const migrated = await Promise.all(
					legacy
						.filter(
							(entry): entry is [string, string] =>
								Array.isArray(entry) &&
								entry.length === 2 &&
								entry.every((v) => typeof v === 'string'),
						)
						.map(([id, revision]) => chronicleReadToken(id, revision)),
				);
				if (!active()) return;
				for (const token of migrated) tokens.add(token);
			}
		} catch {
			// 壊れたローカル保存はサーバーから回復できる。
		}
	})();

	async function syncOnce() {
		await ready;
		if (!active()) return;
		try {
			let view = await getPreferences();
			if (!active() || !view.chronicleReadRevisions) return;
			const remote = new Set(view.chronicleReadRevisions);
			for (const token of remote) tokens.add(token);
			persist();
			const missing = [...tokens].filter((token) => !remote.has(token));
			// 既読は集合の追加のみ。端末A/Bの同時更新でも互いの既読を上書きしない。
			for (let index = 0; index < missing.length; index += 200) {
				if (!active()) return;
				view = await putPreferences({ chronicleReadRevisions: missing.slice(index, index + 200) });
				if (!active()) return;
				for (const token of view.chronicleReadRevisions ?? []) tokens.add(token);
				persist();
			}
		} catch {
			// 未送信の既読はキャッシュに残す。次の閲覧・画面復帰で再送する。
		}
	}

	return {
		tokens,
		ready,
		async mark(entries: [string, string][]) {
			await ready;
			const added = await Promise.all(
				entries.map(([id, revision]) => chronicleReadToken(id, revision)),
			);
			if (!active()) return;
			for (const token of added) tokens.add(token);
			persist();
			await this.sync();
		},
		sync(): Promise<void> {
			resync = true;
			if (!syncing) {
				syncing = (async () => {
					while (resync && active()) {
						resync = false;
						await syncOnce();
					}
				})().finally(() => {
					syncing = undefined;
				});
			}
			return syncing;
		},
		dispose() {
			disposed = true;
		},
	};
}
