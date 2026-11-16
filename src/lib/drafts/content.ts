import type { DraftContent } from '$lib/api/types';

export function draftContentKey(content: DraftContent): string {
	return JSON.stringify({
		text: content.text,
		mentions: content.mentions.map(({ start, end, did, handle }) => ({ start, end, did, handle })),
		emojis: content.emojis.map(({ start, end, uri }) => ({ start, end, uri })),
		linkCards: content.linkCards.map(({ uri, title, description }) => ({
			uri,
			title,
			description,
		})),
		dismissedUrls: content.dismissedUrls,
		quoteUri: content.quoteUri,
		articleTitle: content.articleTitle ?? '',
		articleTags: content.articleTags ?? [],
	});
}
