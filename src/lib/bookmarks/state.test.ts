import { describe, expect, it } from 'vitest';
import type { BookmarkFolderView } from '$lib/api/types';
import { chooseBookmarkFolder, removeFolderFromBookmarkStates } from './state';

const folder = (id: string, isDefault = false): BookmarkFolderView => ({
	id,
	name: id,
	isDefault,
	count: 0,
	createdAt: '2026-08-12T00:00:00.000Z',
	updatedAt: '2026-08-12T00:00:00.000Z',
});

describe('bookmark folder state', () => {
	it('uses the remembered folder and falls back to the default when it was deleted', () => {
		const folders = [folder('default', true), folder('later')];
		expect(chooseBookmarkFolder(folders, 'later')?.id).toBe('later');
		expect(chooseBookmarkFolder(folders, 'deleted')?.id).toBe('default');
	});

	it('clears only states belonging to a deleted folder', () => {
		expect(
			removeFolderFromBookmarkStates(
				{
					one: { subjectUri: 'one', folderId: 'deleted' },
					two: { subjectUri: 'two', folderId: 'kept' },
				},
				'deleted',
			),
		).toEqual({
			one: { subjectUri: 'one' },
			two: { subjectUri: 'two', folderId: 'kept' },
		});
	});
});
