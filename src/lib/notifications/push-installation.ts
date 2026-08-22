export interface PushInstallationCredential {
	installationId: string;
	capability: string;
	recipientDid: string;
}

const DB_NAME = 'nagi-push-installation';
const STORE_NAME = 'credentials';
const CURRENT_KEY = 'current';

function openDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);
		request.onupgradeneeded = () => {
			if (!request.result.objectStoreNames.contains(STORE_NAME)) {
				request.result.createObjectStore(STORE_NAME);
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? new Error('Push credential database failed'));
	});
}

async function withStore<T>(
	mode: IDBTransactionMode,
	operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
	const database = await openDatabase();
	try {
		return await new Promise<T>((resolve, reject) => {
			const transaction = database.transaction(STORE_NAME, mode);
			const request = operation(transaction.objectStore(STORE_NAME));
			let result: T;
			request.onsuccess = () => {
				result = request.result;
			};
			request.onerror = () =>
				reject(request.error ?? new Error('Push credential operation failed'));
			transaction.oncomplete = () => resolve(result);
			transaction.onabort = () =>
				reject(transaction.error ?? new Error('Push credential transaction aborted'));
			transaction.onerror = () =>
				reject(transaction.error ?? new Error('Push credential transaction failed'));
		});
	} finally {
		database.close();
	}
}

export async function loadPushInstallation(): Promise<PushInstallationCredential | null> {
	if (typeof indexedDB === 'undefined') return null;
	const value = await withStore<PushInstallationCredential | undefined>('readonly', (store) =>
		store.get(CURRENT_KEY),
	);
	if (
		!value ||
		typeof value.installationId !== 'string' ||
		typeof value.capability !== 'string' ||
		typeof value.recipientDid !== 'string'
	) {
		return null;
	}
	return value;
}

export async function savePushInstallation(credential: PushInstallationCredential): Promise<void> {
	await withStore<IDBValidKey>('readwrite', (store) => store.put(credential, CURRENT_KEY));
}

export async function clearPushInstallation(): Promise<void> {
	if (typeof indexedDB === 'undefined') return;
	await withStore<undefined>('readwrite', (store) => store.delete(CURRENT_KEY));
}

function base64Url(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function createPushInstallation(recipientDid: string): PushInstallationCredential {
	const capabilityBytes = crypto.getRandomValues(new Uint8Array(32));
	return {
		installationId: crypto.randomUUID(),
		capability: base64Url(capabilityBytes),
		recipientDid,
	};
}
