import { stripMarkdown } from '$lib/atproto/markdown';
import { DOCUMENT, MARKDOWN, MARKDOWN_TEXT, type ArticleInput } from './types';

const DESCRIPTION_GRAPHEMES = 200;
const COVER_IMAGE_MAX_BYTES = 1_000_000;

function excerpt(plain: string): string {
	const segments = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(plain)];
	if (segments.length <= DESCRIPTION_GRAPHEMES) return plain;
	return `${segments
		.slice(0, DESCRIPTION_GRAPHEMES)
		.map((s) => s.segment)
		.join('')}…`;
}

/** BlobRef が coverImage として使えるサイズか。 */
export function usableAsCoverImage(blob: unknown): boolean {
	if (!blob || typeof blob !== 'object') return false;
	const size = (blob as { size?: unknown }).size;
	return typeof size === 'number' && size > 0 && size < COVER_IMAGE_MAX_BYTES;
}

export function buildRecord(input: ArticleInput, site: string, did: string) {
	const plain = stripMarkdown(input.markdown);
	return {
		$type: DOCUMENT,
		site,
		title: input.title,
		path: `/blog/${did}/${input.rkey}`,
		publishedAt: input.publishedAt,
		...(input.nagi ? { nagi: input.nagi } : {}),
		...(input.labels ? { labels: input.labels } : {}),
		...(plain ? { description: excerpt(plain), textContent: plain } : {}),
		content: {
			$type: MARKDOWN,
			flavor: 'commonmark',
			text: { $type: MARKDOWN_TEXT, markdown: input.markdown },
		},
		...(input.tags?.length ? { tags: input.tags } : {}),
		...(input.coverImage !== undefined ? { coverImage: input.coverImage } : {}),
		...(input.bskyPostRef ? { bskyPostRef: input.bskyPostRef } : {}),
	};
}
