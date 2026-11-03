import { describe, expect, it } from 'vitest';
import { buildRecord } from './record';

describe('buildRecord', () => {
	it('keeps the Nagi source in nagi.text and links it to the Nagi publication', () => {
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
		);

		expect(record.site).toBe('at://did:plc:alice/site.standard.publication/3pub');
		// publication.url（/blog/<did>）からの相対。
		expect(record.path).toBe('/3doc');
		expect(record.nagi).toEqual({ botSilent: true, text: markdown });
		expect(record.content.flavor).toBe('gfm');
		expect(record.content.text.markdown).toBe(`# title\n\n${'あ'.repeat(3001)}\n`);
	});

	it('exports facets as Markdown links and newlines as hard breaks', () => {
		const markdown = '# t\n\nNagi\nline';
		const record = buildRecord(
			{
				rkey: '3doc',
				title: 't',
				markdown,
				publishedAt: '2026-09-22T00:00:00.000Z',
				nagi: {
					facets: [
						{
							index: { byteStart: 5, byteEnd: 9 },
							features: [{ $type: 'app.bsky.richtext.facet#link', uri: 'https://example.com' }],
						},
					],
				},
			},
			'at://did:plc:alice/site.standard.publication/3pub',
		);
		expect(record.content.text.markdown).toBe('# t\n\n[Nagi](https://example.com/)\\\nline\n');
		expect(record.textContent).toBe('t Nagi line');
	});
});
