import { beforeEach, describe, expect, it, vi } from 'vitest';

const did = 'did:plc:account-data-test';
const listRecords = vi.fn();
const deleteRecord = vi.fn();
const createRecord = vi.fn();
const getRecord = vi.fn();
const putRecord = vi.fn();
const uploadBlob = vi.fn();
const createKossoriPost = vi.hoisted(() => vi.fn());
const ensureRecord = vi.hoisted(() => vi.fn());

vi.mock('svelte/store', () => ({ get: () => ({ did }) }));
vi.mock('@atproto/api', () => ({
	Agent: class {
		com = {
			atproto: {
				repo: { listRecords, deleteRecord, createRecord, getRecord, putRecord, uploadBlob },
			},
		};
	},
}));
vi.mock('$lib/oauth/session.svelte', () => ({ session: {} }));
vi.mock('$lib/i18n/languagePreferences.svelte', () => ({ languagePreferences: {} }));
vi.mock('$lib/optin/scope-optin', () => ({ hasOptInScope: vi.fn(async () => false) }));
vi.mock('$lib/standardsite/cache', () => ({ forgetPublicationCache: vi.fn() }));
vi.mock('$lib/standardsite/repo', () => ({ deleteNagiStandardSiteRecords: vi.fn() }));
vi.mock('$lib/oauth/client', () => ({ BLUESKY_PROFILE_COLLECTION_SCOPE: '' }));
vi.mock('$lib/api/appview', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/api/appview')>()),
	createKossoriPost,
	ensureRecord,
}));

import {
	createPost,
	deleteAllNagiRecords,
	NAGI_ACCOUNT_DATA_COLLECTIONS,
	preparePostDraft,
	updatePost,
} from './records';

const reply = {
	root: { uri: 'at://did:plc:root/com.suibari.nagi.post/root', cid: 'bafyroot' },
	parent: { uri: 'at://did:plc:parent/com.suibari.nagi.post/parent', cid: 'bafyparent' },
};

describe('silent replies', () => {
	it('adds silentReply only when the draft is a reply', () => {
		const silentReply = preparePostDraft(
			'reply',
			reply,
			undefined,
			[],
			[],
			[],
			[],
			[],
			false,
			undefined,
			false,
			true,
		);
		const topLevel = preparePostDraft(
			'top level',
			undefined,
			undefined,
			[],
			[],
			[],
			[],
			[],
			false,
			undefined,
			true,
			true,
		);

		expect(silentReply.silentReply).toBe(true);
		expect(topLevel.botSilent).toBe(true);
		expect(topLevel.silentReply).toBeUndefined();
	});

	it('writes silentReply to the public Nagi post record', async () => {
		createRecord.mockResolvedValue({
			data: { uri: 'at://did:plc:self/com.suibari.nagi.post/reply', cid: 'bafyreply' },
		});
		const draft = preparePostDraft(
			'reply',
			reply,
			undefined,
			[],
			[],
			[],
			[],
			[],
			false,
			undefined,
			false,
			true,
		);

		await createPost(draft, { images: [], cards: [] });

		expect(createRecord).toHaveBeenCalledWith(
			expect.objectContaining({
				record: expect.objectContaining({ reply, silentReply: true }),
			}),
		);
	});

	it('writes silentReply through the AppView-only kossori reply route', async () => {
		createKossoriPost.mockResolvedValue({
			uri: 'at://did:web:nagi-api.suibari.com/com.suibari.nagi.post/reply',
			cid: 'bafykossori',
		});
		const draft = preparePostDraft(
			'reply',
			reply,
			undefined,
			[],
			[],
			[],
			[],
			[],
			true,
			undefined,
			false,
			true,
		);

		await createPost(draft);

		expect(createKossoriPost).toHaveBeenCalledWith(
			expect.objectContaining({ reply, silentReply: true }),
		);
	});
});

describe('content warning storage boundaries', () => {
	it('keeps self-labels on the post and per-image warnings on each attachment', () => {
		const draft = preparePostDraft(
			'warning boundaries',
			undefined,
			undefined,
			[
				{
					id: 'image-1',
					blob: new Blob(['image'], { type: 'image/png' }),
					previewUrl: 'blob:image-1',
					alt: '',
					contentWarning: true,
					aspectRatio: { width: 1, height: 1 },
				},
			],
			[],
			[],
			[],
			[],
			false,
			undefined,
			false,
			false,
			['sexual', 'ai-generated'],
		);

		expect(draft.labels).toEqual({
			$type: 'com.atproto.label.defs#selfLabels',
			values: [{ val: 'sexual' }, { val: 'ai-generated' }],
		});
		expect(draft.attachments[0]).toEqual(expect.objectContaining({ contentWarning: true }));
		expect(draft.attachments[0]).not.toHaveProperty('labels');
	});
});

describe('post link card editing', () => {
	beforeEach(() => {
		getRecord.mockReset();
		putRecord.mockReset();
		uploadBlob.mockReset();
		ensureRecord.mockReset();
		putRecord.mockResolvedValue({
			data: { uri: `at://${did}/com.suibari.nagi.post/post`, cid: 'bafyupdated' },
		});
		ensureRecord.mockResolvedValue({});
	});

	it('replaces the stored cards, reuses an existing thumb, and uploads only a new thumb', async () => {
		const removedThumb = { ref: { $link: 'bafyremoved' } };
		const reusedThumb = { ref: { $link: 'bafyreused' } };
		getRecord.mockResolvedValue({
			data: {
				value: {
					$type: 'com.suibari.nagi.post',
					text: 'old',
					createdAt: '2026-09-13T00:00:00.000Z',
					linkCards: [
						{ uri: 'https://removed.example/', title: 'Removed', thumb: removedThumb },
						{ uri: 'https://kept.example/', title: 'Old title', thumb: reusedThumb },
					],
				},
			},
		});
		const newThumbnail = new Blob(['thumbnail'], { type: 'image/png' });
		uploadBlob.mockResolvedValue({ data: { blob: { ref: { $link: 'bafynew' } } } });
		const draft = preparePostDraft(
			'https://kept.example/ https://new.example/',
			undefined,
			undefined,
			[],
			[
				{
					uri: 'https://kept.example/',
					title: 'Kept',
					description: 'Updated metadata',
					previewUrl: '/api/blob/author/bafyreused',
					sourceIndex: 1,
				},
				{
					uri: 'https://new.example/',
					title: 'New',
					thumbnail: newThumbnail,
				},
			],
		);

		const result = await updatePost('post', draft);

		expect(uploadBlob).toHaveBeenCalledTimes(1);
		expect(uploadBlob).toHaveBeenCalledWith(newThumbnail, { encoding: 'image/png' });
		const record = putRecord.mock.calls[0][0].record;
		expect(record.linkCards).toEqual([
			{
				uri: 'https://kept.example/',
				title: 'Kept',
				description: 'Updated metadata',
				thumb: reusedThumb,
			},
			{
				uri: 'https://new.example/',
				title: 'New',
				thumb: { ref: { $link: 'bafynew' } },
			},
		]);
		expect(record.linkCards).not.toContainEqual(
			expect.objectContaining({ uri: 'https://removed.example/' }),
		);
		expect(result.linkCardViews).toEqual([
			{
				uri: 'https://kept.example/',
				title: 'Kept',
				description: 'Updated metadata',
				thumb: '/api/blob/author/bafyreused',
			},
			{
				uri: 'https://new.example/',
				title: 'New',
				thumb: `/api/blob/${encodeURIComponent(did)}/bafynew`,
			},
		]);
	});

	it('removes the stored linkCards field when every card is deleted', async () => {
		getRecord.mockResolvedValue({
			data: {
				value: {
					$type: 'com.suibari.nagi.post',
					text: 'old',
					linkCards: [{ uri: 'https://old.example/', title: 'Old' }],
				},
			},
		});
		const draft = preparePostDraft('link removed');

		const result = await updatePost('post', draft);

		const record = putRecord.mock.calls[0][0].record;
		expect(record).not.toHaveProperty('linkCards');
		expect(uploadBlob).not.toHaveBeenCalled();
		expect(result.linkCardViews).toEqual([]);
	});
});

describe('deleteAllNagiRecords', () => {
	beforeEach(() => {
		listRecords.mockReset();
		deleteRecord.mockReset();
		createRecord.mockReset();
		createKossoriPost.mockReset();
		listRecords.mockImplementation(async ({ collection }: { collection: string }) => ({
			data: {
				records:
					collection === 'com.suibari.nagi.bluemoji'
						? []
						: [{ uri: `at://${did}/${collection}/record` }],
			},
		}));
		deleteRecord.mockResolvedValue({});
	});

	it('deletes every Nagi-owned account-data collection from the user PDS', async () => {
		expect(NAGI_ACCOUNT_DATA_COLLECTIONS).toEqual([
			'com.suibari.nagi.post',
			'com.suibari.nagi.reaction',
			'com.suibari.nagi.profile',
			'com.suibari.nagi.channel',
			'com.suibari.nagi.news',
			'com.suibari.nagi.appLinks',
			// ゼンカツの提出とドローの控え。どちらも本人の repo にあるので、
			// アカウントデータの削除で必ず消えること。
			'com.suibari.nagi.zenkatsu',
			'com.suibari.nagi.cardGet',
		]);

		await deleteAllNagiRecords();

		expect(deleteRecord.mock.calls.map(([call]) => call.collection)).toEqual([
			...NAGI_ACCOUNT_DATA_COLLECTIONS,
		]);
	});
});
