import { describe, expect, it } from 'vitest';
import { computeBlobCid } from './cid';

describe('computeBlobCid', () => {
	it('matches the CIDv1 raw sha2-256 used for atproto blobs', async () => {
		// 空バイト列の raw CID（よく知られた値）。
		expect(await computeBlobCid(new Blob([]))).toBe(
			'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
		);
		expect(await computeBlobCid(new Blob(['hello world']))).toBe(
			'bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e',
		);
	});
});
