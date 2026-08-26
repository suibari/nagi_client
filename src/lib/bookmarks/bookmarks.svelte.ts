import { get } from 'svelte/store';
import { session } from '$lib/oauth/session.svelte';
import type { BookmarkFolderView, BookmarkStateView } from '$lib/api/types';
import {
	deleteBookmark,
	deleteBookmarkFolder,
	getBookmarkFolders,
	getBookmarkStates,
	putBookmark,
	putBookmarkFolder,
	ApiRequestError,
} from '$lib/api/appview';
import { chooseBookmarkFolder, removeFolderFromBookmarkStates } from './state';
import { preferences } from '$lib/preferences/preferences.svelte';

const LAST_FOLDER_PREFIX = 'nagi.bookmarks.last-folder.v1.';

class Bookmarks {
	folders = $state<BookmarkFolderView[]>([]);
	states = $state<Record<string, BookmarkStateView>>({});
	pending = $state<string[]>([]);
	loaded = $state(false);
	unauthorized = $state(false);
	folderLimit = $state(100);
	bookmarkLimit = $state(10_000);
	#did?: string;
	#lang: 'ja' | 'en' = 'ja';
	#request = 0;
	#known = new Set<string>();
	#queued = new Set<string>();
	#batchTimer?: ReturnType<typeof setTimeout>;
	#lastFolderId?: string;
	#lastFolderUpdatedAt?: string;

	state(uri: string) {
		return this.states[uri];
	}
	isSaved(uri: string) {
		return Boolean(this.states[uri]?.folderId);
	}
	isPending(uri: string) {
		return this.pending.includes(uri);
	}
	defaultFolder() {
		return this.folders.find((folder) => folder.isDefault);
	}
	lastFolder() {
		const fallback = this.defaultFolder();
		return chooseBookmarkFolder(this.folders, this.#lastFolderId ?? null) ?? fallback;
	}

	async load(did: string, lang: 'ja' | 'en') {
		const request = ++this.#request;
		if (this.#batchTimer) clearTimeout(this.#batchTimer);
		this.#batchTimer = undefined;
		this.#did = did;
		this.#lang = lang;
		this.folders = [];
		this.states = {};
		this.pending = [];
		this.loaded = false;
		this.unauthorized = false;
		this.#known.clear();
		this.#queued.clear();
		try {
			const view = await getBookmarkFolders(lang);
			if (request !== this.#request || get(session)?.did !== did) return;
			this.folders = view.folders;
			this.folderLimit = view.folderLimit;
			this.bookmarkLimit = view.bookmarkLimit;
			this.#lastFolderId = view.lastFolderId;
			this.#lastFolderUpdatedAt = view.lastFolderUpdatedAt;
			this.loaded = true;
			if (!view.lastFolderUpdatedAt && typeof localStorage !== 'undefined') {
				try {
					const legacyId = localStorage.getItem(`${LAST_FOLDER_PREFIX}${did}`);
					if (chooseBookmarkFolder(this.folders, legacyId)) this.#rememberFolder(legacyId!);
				} catch {}
			}
			this.#repairLastFolder();
		} catch (error) {
			if (request === this.#request && this.#did === did) {
				this.noteError(error);
				this.loaded = false;
			}
		}
	}

	clear() {
		this.#request++;
		this.#did = undefined;
		this.folders = [];
		this.states = {};
		this.pending = [];
		this.loaded = false;
		this.unauthorized = false;
		this.#known.clear();
		this.#lastFolderId = undefined;
		this.#lastFolderUpdatedAt = undefined;
		this.#queued.clear();
		if (this.#batchTimer) clearTimeout(this.#batchTimer);
		this.#batchTimer = undefined;
	}

	register(uri: string) {
		if (!this.#did || this.#known.has(uri) || this.#queued.has(uri)) return;
		this.#queued.add(uri);
		if (!this.#batchTimer) this.#batchTimer = setTimeout(() => void this.#flushStates(), 20);
	}

	noteError(error: unknown) {
		this.unauthorized =
			error instanceof ApiRequestError &&
			(error.status === 401 ||
				error.status === 403 ||
				(error.status === 400 && /scope|permission/i.test(error.message)));
	}

	async ensureState(uri: string) {
		if (!this.#known.has(uri)) {
			this.#queued.add(uri);
			await this.#flushStates();
		}
		return this.states[uri];
	}

	async #flushStates() {
		if (this.#batchTimer) clearTimeout(this.#batchTimer);
		this.#batchTimer = undefined;
		const did = this.#did;
		if (!did || !this.#queued.size) return;
		const uris = [...this.#queued].slice(0, 100);
		uris.forEach((uri) => this.#queued.delete(uri));
		try {
			const result = await getBookmarkStates(uris);
			if (this.#did !== did) return;
			for (const state of result.states) {
				this.states[state.subjectUri] = state;
				this.#known.add(state.subjectUri);
			}
		} catch (error) {
			if (this.#did === did) {
				this.noteError(error);
				for (const uri of uris) {
					this.states[uri] = { subjectUri: uri };
					this.#known.add(uri);
				}
			}
		} finally {
			if (this.#queued.size) this.#batchTimer = setTimeout(() => void this.#flushStates(), 20);
		}
	}

	async save(uri: string, folderId: string) {
		const did = this.#did;
		if (!did) throw new Error('Authentication required');
		const previous = this.states[uri];
		this.states[uri] = { subjectUri: uri, folderId, createdAt: new Date().toISOString() };
		this.#known.add(uri);
		this.pending = [...this.pending, uri];
		try {
			const state = await putBookmark(folderId, uri);
			if (this.#did !== did) return;
			this.states[uri] = state;
			this.#rememberFolder(state.folderId ?? folderId);
			this.#adjustFolderCount(state.folderId ?? folderId, 1, previous?.folderId);
			void this.#reloadFolders();
		} catch (error) {
			if (this.#did === did) {
				this.noteError(error);
				this.states[uri] = previous ?? { subjectUri: uri };
			}
			throw error;
		} finally {
			if (this.#did === did) this.pending = this.pending.filter((value) => value !== uri);
		}
	}

	async remove(uri: string) {
		const did = this.#did;
		if (!did) throw new Error('Authentication required');
		const previous = this.states[uri];
		this.states[uri] = { subjectUri: uri };
		this.pending = [...this.pending, uri];
		try {
			await deleteBookmark(uri);
			if (this.#did === did && previous?.folderId) this.#adjustFolderCount(previous.folderId, -1);
			void this.#reloadFolders();
		} catch (error) {
			if (this.#did === did) {
				this.noteError(error);
				if (previous) this.states[uri] = previous;
			}
			throw error;
		} finally {
			if (this.#did === did) this.pending = this.pending.filter((value) => value !== uri);
		}
	}

	async saveFolder(name: string, id?: string) {
		const folder = await putBookmarkFolder({ id, name, lang: this.#lang });
		const index = this.folders.findIndex((item) => item.id === folder.id);
		this.folders =
			index < 0
				? [...this.folders, folder]
				: this.folders.map((item) => (item.id === folder.id ? folder : item));
		return folder;
	}

	async deleteFolder(folder: BookmarkFolderView) {
		await deleteBookmarkFolder(folder.id);
		this.folders = this.folders.filter((item) => item.id !== folder.id);
		this.states = removeFolderFromBookmarkStates(this.states, folder.id);
		this.#repairLastFolder();
	}

	#rememberFolder(folderId: string) {
		if (!this.#did) return;
		this.#lastFolderId = folderId;
		this.#lastFolderUpdatedAt = new Date().toISOString();
		preferences.pushLastBookmarkFolder(folderId, this.#lastFolderUpdatedAt);
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(`${LAST_FOLDER_PREFIX}${this.#did}`, folderId);
		} catch {
			// 保存先の記憶だけ失敗してもブックマーク本体には影響させない。
		}
	}
	#repairLastFolder() {
		const folder = this.lastFolder();
		if (folder && folder.id !== this.#lastFolderId) this.#rememberFolder(folder.id);
	}
	#adjustFolderCount(folderId: string, delta: number, previousFolderId?: string) {
		if (previousFolderId) return;
		this.folders = this.folders.map((folder) =>
			folder.id === folderId ? { ...folder, count: Math.max(0, folder.count + delta) } : folder,
		);
	}
	async #reloadFolders() {
		const did = this.#did;
		if (!did) return;
		try {
			const view = await getBookmarkFolders(this.#lang);
			if (this.#did === did) {
				this.folders = view.folders;
				this.#lastFolderId = view.lastFolderId;
				this.#lastFolderUpdatedAt = view.lastFolderUpdatedAt;
			}
		} catch {
			// 本体の保存・解除は成功済み。件数は次回読み込みで収束させる。
		}
	}
}

export const bookmarks = new Bookmarks();

export function clearBookmarkPreferenceCache(did: string) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.removeItem(`${LAST_FOLDER_PREFIX}${did}`);
	} catch {}
}
