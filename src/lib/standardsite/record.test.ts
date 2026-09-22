import { describe, expect, it } from 'vitest';
import { buildRecord } from './record';

describe('buildRecord', () => {
	it('keeps long Markdown intact and links it to the Nagi publication', () => {
		const markdown = `# title\n\n${'あ'.repeat(3001)}`;
		const record = buildRecord(
			{
				rkey: '3doc',
				title: 'title',
				markdown,
				publishedAt: '2026-09-22T00:00:00.000Z',
				nagi: { botSilent: true },
			},
			'at://did:plc:alice/site.standard.publication/3pub',
			'did:plc:alice',
		);

		expect(record.site).toBe('at://did:plc:alice/site.standard.publication/3pub');
		expect(record.path).toBe('/blog/did:plc:alice/3doc');
		expect(record.content.text.markdown).toBe(markdown);
		expect(record.nagi).toEqual({ botSilent: true });
	});
});
