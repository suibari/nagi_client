import { describe, expect, it } from 'vitest';
import type { DiaryView } from '$lib/api/types';
import { isDiaryBodyHidden } from './privacy';

const diary = (extra: Partial<DiaryView> = {}): DiaryView => ({
	uri: 'at://did:web:nagi-api.suibari.com/com.suibari.nagi.diary/alice-2026-08-18',
	cid: 'bafyreidiary',
	subject: 'did:plc:alice',
	date: '2026-08-18',
	text: '本人には見える日記',
	createdAt: '2026-08-18T13:00:00.000Z',
	indexedAt: '2026-08-18T13:00:01.000Z',
	...extra,
});

describe('diary body visibility', () => {
	it('shows a private diary when the API returned its body to the owner', () => {
		expect(isDiaryBodyHidden(diary({ isPrivate: true }))).toBe(false);
	});

	it('hides a private diary only when the API explicitly withheld its body', () => {
		expect(isDiaryBodyHidden(diary({ isPrivate: true, bodyHidden: true, text: '' }))).toBe(true);
	});
});
