import type { MentionSelection } from '$lib/atproto/facets';

/**
 * 下書きは非公開データだが、AppView に置くと下書き本文と画像バイトをサーバが抱えることに
 * なる（PDS の未参照 blob は GC されるため画像は AppView 保存が必須になり、
 * 「AppView は blob を保存しない」原則が崩れる）。テーマ・ロケール・クロスポスト設定と
 * 同じデバイスローカル方針に揃え、Blob をそのまま入れられる IndexedDB に保存する。
 */
export type StoredDraftImage = {
	id: string;
	blob: Blob;
	alt: string;
	aspectRatio: { width: number; height: number };
};
export type StoredDraftLinkCard = {
	uri: string;
	title: string;
	description?: string;
	thumbnail?: Blob;
};
export type StoredDraft = {
	id: string;
	/** 所有者 DID。端末を共有しても他アカウントの下書きは見えない。 */
	did: string;
	text: string;
	mentions: MentionSelection[];
	images: StoredDraftImage[];
	linkCards: StoredDraftLinkCard[];
	/** ユーザーが × で消したリンクカードの URL。復元時に再取得させないため。 */
	dismissedUrls: string[];
	createdAt: string;
	updatedAt: string;
};

export const MAX_DRAFTS = 30;
const DB_NAME = 'nagi-drafts';
const DB_VERSION = 1;
const STORE = 'drafts';
const OWNER_INDEX = 'by-owner';

export class DraftStorageError extends Error {
	constructor(readonly code: 'limit' | 'quota' | 'unavailable') {
		super(code);
	}
}

const available = () => typeof indexedDB !== 'undefined';

let connection: Promise<IDBDatabase> | undefined;

function open(): Promise<IDBDatabase> {
	if (!available()) return Promise.reject(new DraftStorageError('unavailable'));
	connection ??= new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE)) {
				db.createObjectStore(STORE, { keyPath: 'id' }).createIndex(OWNER_INDEX, 'did');
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? new DraftStorageError('unavailable'));
	}).catch((error) => {
		// 失敗した接続を握ったままにすると以降ずっと開けなくなる。
		connection = undefined;
		throw error;
	});
	return connection;
}

async function run<T>(
	mode: IDBTransactionMode,
	body: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
	const db = await open();
	return new Promise<T>((resolve, reject) => {
		const transaction = db.transaction(STORE, mode);
		const request = body(transaction.objectStore(STORE));
		request.onsuccess = () => resolve(request.result);
		const fail = () => {
			const error = request.error ?? transaction.error;
			reject(error?.name === 'QuotaExceededError' ? new DraftStorageError('quota') : error);
		};
		request.onerror = fail;
		transaction.onabort = fail;
	});
}

const newest = (a: StoredDraft, b: StoredDraft) => b.updatedAt.localeCompare(a.updatedAt);

/** 更新日時の新しい順。IndexedDB が使えない環境では空配列。 */
export async function listDrafts(did: string): Promise<StoredDraft[]> {
	if (!available()) return [];
	try {
		const all = await run<StoredDraft[]>('readonly', (store) =>
			store.index(OWNER_INDEX).getAll(did),
		);
		return all.sort(newest);
	} catch {
		return [];
	}
}

export async function putDraft(draft: StoredDraft): Promise<void> {
	if (!available()) throw new DraftStorageError('unavailable');
	const existing = await listDrafts(draft.did);
	if (existing.length >= MAX_DRAFTS && !existing.some((item) => item.id === draft.id)) {
		throw new DraftStorageError('limit');
	}
	// 呼び出し側で $state.snapshot 済みのプレーンなオブジェクトを渡すこと（proxy は構造化複製できない）。
	await run('readwrite', (store) => store.put(draft));
}

export async function deleteDraft(id: string): Promise<void> {
	if (!available()) return;
	try {
		await run('readwrite', (store) => store.delete(id));
	} catch {
		// 削除できなくても投稿機能には影響しない。
	}
}

export async function clearDrafts(did: string): Promise<void> {
	const drafts = await listDrafts(did);
	for (const draft of drafts) await deleteDraft(draft.id);
}
