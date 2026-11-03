import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/oauth/session.svelte', () => ({ session: { subscribe: () => () => {} } }));

const { migratedDocument } = await import('./repo');

describe('migratedDocument', () => {
	const legacy = {
		$type: 'site.standard.document',
		site: 'at://did:plc:alice/site.standard.publication/3pub',
		path: '/blog/did:plc:alice/3doc',
		title: 't',
		nagi: { facets: [] },
		content: {
			$type: 'at.markpub.markdown',
			flavor: 'commonmark',
			text: { $type: 'at.markpub.text', markdown: '# t\n\na\nb' },
		},
	};

	it('moves the path under the per-user URL and the source into nagi.text', () => {
		const next = migratedDocument(legacy, 'did:plc:alice', '3doc');
		expect(next?.path).toBe('/3doc');
		expect(next?.nagi).toEqual({ facets: [], text: '# t\n\na\nb' });
		expect(next?.content).toEqual({
			$type: 'at.markpub.markdown',
			flavor: 'gfm',
			text: { $type: 'at.markpub.text', markdown: '# t\n\na\\\nb\n' },
		});
	});

	it('leaves migrated documents alone', () => {
		const once = migratedDocument(legacy, 'did:plc:alice', '3doc')!;
		expect(migratedDocument(once, 'did:plc:alice', '3doc')).toBeUndefined();
	});
});
