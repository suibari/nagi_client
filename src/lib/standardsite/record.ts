import type { Facet } from '$lib/api/types';
import { stripMarkdown } from '$lib/atproto/markdown';
import { toCommonMark } from './commonmark';
import { DOCUMENT, MARKDOWN, MARKDOWN_TEXT, NAGI_PUBLIC_ORIGIN, type ArticleInput } from './types';

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

export function buildRecord(input: ArticleInput, site: string) {
	const plain = stripMarkdown(input.markdown);
	return {
		$type: DOCUMENT,
		site,
		title: input.title,
		// publication.url（/blog/<did>）からの相対。連結すると /blog/<did>/<rkey> になる。
		path: `/${input.rkey}`,
		publishedAt: input.publishedAt,
		// Nagi の原文と facet は nagi に残す（AppView と編集はこちらを読む）。
		// content には他のリーダー向けに書き出した GFM を置く。打ち消し線（~~）を使うので
		// flavor は gfm。
		nagi: { ...input.nagi, text: input.markdown },
		...(input.labels ? { labels: input.labels } : {}),
		...(plain ? { description: excerpt(plain), textContent: plain } : {}),
		content: {
			$type: MARKDOWN,
			flavor: 'gfm',
			text: {
				$type: MARKDOWN_TEXT,
				markdown: toCommonMark(
					input.markdown,
					(input.nagi?.facets as Facet[] | undefined) ?? [],
					NAGI_PUBLIC_ORIGIN,
				),
			},
		},
		...(input.tags?.length ? { tags: input.tags } : {}),
		...(input.coverImage !== undefined ? { coverImage: input.coverImage } : {}),
		...(input.bskyPostRef ? { bskyPostRef: input.bskyPostRef } : {}),
	};
}
