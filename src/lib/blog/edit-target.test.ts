import { describe, expect, it } from 'vitest';
import type { PostView } from '$lib/api/types';
import { parsePostText } from '$lib/atproto/facets';
import { blogEditTargetFromPost, toPostEditImage } from './edit-target';
import { inlineImageUrl } from './inlineImages';

const did = 'did:plc:author';
const coverCid = 'bafkreicover';
const inlineCid = 'bafkreiinline';

function post(): PostView {
	const parsed = parsePostText(
		`# タイトル\n\n本文 #本文タグ\n\n![本文の画像](${inlineImageUrl(did, inlineCid)})`,
	);
	return {
		uri: `at://${did}/site.standard.document/3abc`,
		cid: 'bafy-post',
		author: { did, handle: 'author.example' },
		text: parsed.text,
		facets: parsed.facets,
		createdAt: '2026-11-16T00:00:00.000Z',
		indexedAt: '2026-11-16T00:00:00.000Z',
		images: [
			{ url: `/api/blob/${did}/${coverCid}`, alt: 'カバー', aspectRatio: { width: 2, height: 1 } },
			{ url: `/api/blob/${did}/${inlineCid}`, alt: '本文の画像' },
		],
		linkCards: [{ uri: 'https://example.com/', title: 'Example' }],
		article: true,
		reactions: [],
		isBot: false,
		isAffirmation: false,
	};
}

describe('blogEditTargetFromPost', () => {
	it('splits the heading off as the title and keeps the body for the editor', () => {
		const target = blogEditTargetFromPost(post(), []);
		expect(target.rkey).toBe('3abc');
		expect(target.title).toBe('タイトル');
		expect(target.text.startsWith('本文 #本文タグ')).toBe(true);
		expect(target.text).not.toContain('# タイトル');
	});

	it('marks only an unplaced first image as the header and keeps the saved blobs', () => {
		const [cover, inline] = blogEditTargetFromPost(post(), []).images;
		expect(cover).toMatchObject({ header: true, existing: { sourceIndex: 0, cid: coverCid } });
		expect(inline.header).toBeUndefined();
		expect(inline.existing).toMatchObject({ sourceIndex: 1, cid: inlineCid });
	});

	it('shows only the tags that do not come from body hashtags', () => {
		expect(blogEditTargetFromPost(post(), ['本文タグ', '既存タグ']).tags).toEqual(['既存タグ']);
	});

	it('keeps link cards in their saved order', () => {
		expect(blogEditTargetFromPost(post(), []).linkCards).toMatchObject([
			{ sourceIndex: 0, uri: 'https://example.com/' },
		]);
	});
});

describe('toPostEditImage', () => {
	it('reuses saved images without uploading and keeps the stored aspect ratio', () => {
		const [cover, inline] = blogEditTargetFromPost(post(), []).images;
		expect(toPostEditImage({ ...cover, alt: '新しいalt' })).toMatchObject({
			kind: 'existing',
			sourceIndex: 0,
			alt: '新しいalt',
			aspectRatio: { width: 2, height: 1 },
		});
		expect(toPostEditImage(inline)).not.toHaveProperty('aspectRatio');
	});

	it('uploads images added in the editor', () => {
		const image = {
			id: 'new',
			blob: new Blob(['x']),
			previewUrl: 'blob:new',
			alt: '',
			aspectRatio: { width: 1, height: 1 },
		};
		expect(toPostEditImage(image)).toMatchObject({ kind: 'new', id: 'new' });
	});
});
