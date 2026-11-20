export const SHARE_PATH = '/share-target';

export interface SharedContent {
	id: string;
	createdAt: number;
	text: string;
	files: { id: string; file: File }[];
}

export function sharedText(form: FormData): string {
	const values = ['title', 'text', 'url'].map((key) => form.get(key));
	return [
		...new Set(
			values
				.filter((v): v is string => typeof v === 'string')
				.map((v) => v.trim())
				.filter(Boolean),
		),
	].join('\n');
}

export function sharedContent(form: FormData): SharedContent {
	const content = {
		id: crypto.randomUUID(),
		createdAt: Date.now(),
		text: sharedText(form),
		files: form
			.getAll('images')
			.filter((v): v is File => typeof v !== 'string' && v.size > 0)
			.map((file) => ({ id: crypto.randomUUID(), file })),
	};
	if (!content.text && !content.files.length) throw new Error('Empty share');
	return content;
}

const DB = 'nagi-share-target';
const STORE = 'received';

async function database(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB, 1);
		request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
		request.onblocked = () => reject(new Error('Share storage blocked'));
	});
}

async function transaction<T>(
	mode: IDBTransactionMode,
	run: (store: IDBObjectStore, result: (value: T) => void) => void,
): Promise<T> {
	const db = await database();
	try {
		return await new Promise<T>((resolve, reject) => {
			const tx = db.transaction(STORE, mode);
			let value: T;
			tx.oncomplete = () => resolve(value);
			tx.onabort = () => reject(tx.error ?? new Error('Share transaction aborted'));
			tx.onerror = () => reject(tx.error ?? new Error('Share transaction failed'));
			run(tx.objectStore(STORE), (result) => {
				value = result;
			});
		});
	} finally {
		db.close();
	}
}

export async function saveShare(content: SharedContent): Promise<void> {
	await transaction<void>('readwrite', (store) => {
		store.add(content);
	});
}

export async function loadShare(id: string): Promise<SharedContent | undefined> {
	return transaction('readonly', (store, result) => {
		store.get(id).onsuccess = (event) =>
			result((event.target as IDBRequest<SharedContent | undefined>).result);
	});
}

export async function discardShare(id: string): Promise<void> {
	await transaction<void>('readwrite', (store) => {
		store.delete(id);
	});
}

/** Call under withShareLock; acknowledge only the parts already handed to the composer. */
export async function acknowledgeShare(id: string, parts: string[]): Promise<void> {
	await transaction<void>('readwrite', (store) => {
		store.get(id).onsuccess = (event) => {
			const content = (event.target as IDBRequest<SharedContent | undefined>).result;
			if (!content) return;
			if (parts.includes('text')) content.text = '';
			content.files = content.files.filter((item) => !parts.includes(item.id));
			if (!content.text && !content.files.length) store.delete(id);
			else store.put(content);
		};
	});
}

export async function restoreShare(content: SharedContent): Promise<void> {
	await transaction<void>('readwrite', (store) => {
		store.put(content);
	});
}

export async function withShareLock<T>(
	id: string,
	work: () => Promise<T>,
): Promise<{ acquired: false } | { acquired: true; value: T }> {
	// Web Locks span asynchronous image processing and release even when a tab closes.
	return navigator.locks.request(`nagi-share:${id}`, { ifAvailable: true }, async (lock) => {
		if (!lock) return { acquired: false };
		return { acquired: true, value: await work() };
	});
}
