export type GuestPostStatus = 'pending' | 'posted' | 'failed';
export type StoredGuestPost = {
	id: string;
	text: string;
	createdAt: string;
	language: 'ja' | 'en';
	status: GuestPostStatus;
	reply?: string;
	request?: { id: string; token: string };
};

const DB_NAME = 'nagi-guest-posts';
const STORE = 'posts';
const VERSION = 1;
let connection: Promise<IDBDatabase> | undefined;

function open() {
	connection ??= new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, VERSION);
		request.onupgradeneeded = () => {
			if (!request.result.objectStoreNames.contains(STORE))
				request.result.createObjectStore(STORE, { keyPath: 'id' });
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	}).catch((error) => {
		connection = undefined;
		throw error;
	});
	return connection;
}

async function request<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
	const db = await open();
	return new Promise<T>((resolve, reject) => {
		const transaction = db.transaction(STORE, mode);
		const operation = run(transaction.objectStore(STORE));
		operation.onsuccess = () => resolve(operation.result);
		operation.onerror = () => reject(operation.error ?? transaction.error);
	});
}

export async function listGuestPosts(): Promise<StoredGuestPost[]> {
	if (typeof indexedDB === 'undefined') return [];
	try {
		return (await request<StoredGuestPost[]>('readonly', (store) => store.getAll())).sort((a, b) =>
			b.createdAt.localeCompare(a.createdAt),
		);
	} catch {
		return [];
	}
}

export const putGuestPost = (post: StoredGuestPost) =>
	request('readwrite', (store) => store.put(post));
export const deleteGuestPost = (id: string) => request('readwrite', (store) => store.delete(id));
