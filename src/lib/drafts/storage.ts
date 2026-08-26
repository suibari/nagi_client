import type { ChannelSelection, EmojiSelection, MentionSelection } from '$lib/atproto/facets';

/**
 * AppView同期以前の下書きを読むための互換形式。新規保存には使わない。
 * 画像なしはAppViewへ移行し、画像付きは「旧端末下書き」として復元・削除だけを許可する。
 */
export type StoredDraftImage = {
	id: string;
	blob: Blob;
	alt: string;
	contentWarning?: boolean;
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
	/** 候補から明示選択したチャンネルタグ。旧下書きには無いので復元側で空配列にする。 */
	channels?: ChannelSelection[];
	/** 本文内Bluemojiの参照範囲。旧下書きでは未定義。 */
	emojis?: EmojiSelection[];
	images: StoredDraftImage[];
	linkCards: StoredDraftLinkCard[];
	/** ユーザーが × で消したリンクカードの URL。復元時に再取得させないため。 */
	dismissedUrls: string[];
	/**
	 * 貼り付けでセットした引用元の AT-URI。表示に要る本文・著者は復元時に取り直すので
	 * ここには参照だけ持つ。旧下書きには無い。
	 */
	quoteUri?: string;
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
