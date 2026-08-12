import type { BookmarkFolderView, BookmarkStateView } from '$lib/api/types';

export function chooseBookmarkFolder(folders: BookmarkFolderView[], storedId: string | null) {
	return (
		folders.find((folder) => folder.id === storedId) ?? folders.find((folder) => folder.isDefault)
	);
}

export function removeFolderFromBookmarkStates(
	states: Record<string, BookmarkStateView>,
	folderId: string,
) {
	return Object.fromEntries(
		Object.entries(states).map(([uri, state]) => [
			uri,
			state.folderId === folderId ? { subjectUri: uri } : state,
		]),
	);
}
