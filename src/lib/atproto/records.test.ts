import { beforeEach, describe, expect, it, vi } from 'vitest';

const did = 'did:plc:account-data-test';
const listRecords = vi.fn();
const deleteRecord = vi.fn();

vi.mock('svelte/store', () => ({ get: () => ({ did }) }));
vi.mock('@atproto/api', () => ({
	Agent: class {
		com = { atproto: { repo: { listRecords, deleteRecord } } };
	},
}));
vi.mock('$lib/oauth/session.svelte', () => ({ session: {} }));
vi.mock('$lib/i18n/languagePreferences.svelte', () => ({ languagePreferences: {} }));
vi.mock('$lib/optin/scope-optin', () => ({ hasOptInScope: vi.fn(async () => false) }));
vi.mock('$lib/standardsite/cache', () => ({ forgetPublicationCache: vi.fn() }));
vi.mock('$lib/standardsite/repo', () => ({ deleteNagiStandardSiteRecords: vi.fn() }));
vi.mock('$lib/oauth/client', () => ({ BLUESKY_PROFILE_COLLECTION_SCOPE: '' }));

import { deleteAllNagiRecords, NAGI_ACCOUNT_DATA_COLLECTIONS } from './records';

describe('deleteAllNagiRecords', () => {
	beforeEach(() => {
		listRecords.mockReset();
		deleteRecord.mockReset();
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
		]);

		await deleteAllNagiRecords();

		expect(deleteRecord.mock.calls.map(([call]) => call.collection)).toEqual([
			...NAGI_ACCOUNT_DATA_COLLECTIONS,
		]);
	});
});
