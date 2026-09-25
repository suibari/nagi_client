import { afterEach, describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import type { PostView } from '$lib/api/types';
import {
	clearModerationPreferences,
	setModerationPreference,
} from '$lib/moderation/preferences.svelte';
import PostModerationGuard from './PostModerationGuard.svelte';
import QuoteCard from './QuoteCard.svelte';

const post: PostView = {
	uri: 'at://did:plc:alice/app.nagi.feed.post/example',
	cid: 'example',
	author: { did: 'did:plc:alice', handle: 'alice.test' },
	text: 'Moderated quoted text',
	createdAt: '2026-01-01T00:00:00Z',
	moderationLabels: ['harassment'],
	indexedAt: '2026-01-01T00:00:00Z',
	reactions: [],
	isBot: false,
	isAffirmation: false,
};

afterEach(() => clearModerationPreferences());

describe('embedded post moderation', () => {
	it('conceals a quote independently of the containing post', () => {
		const { body } = render(QuoteCard, { props: { post } });
		expect(body).toContain('concealed');
		expect(body).toContain('aria-expanded="false"');
		expect(body).toContain('aria-hidden="true"');
	});

	it('omits hidden quoted content', () => {
		setModerationPreference('automatic', 'hide');
		const { body } = render(QuoteCard, { props: { post } });
		expect(body).not.toContain(post.text);
		expect(body).not.toContain('quote-card');
	});

	it('respects ignore for quoted content', () => {
		setModerationPreference('automatic', 'ignore');
		const { body } = render(QuoteCard, { props: { post } });
		expect(body).not.toContain('concealed');
		expect(body).toContain(post.text);
	});

	it('conceals self-labeled content in composer previews', () => {
		const { body } = render(PostModerationGuard, {
			props: {
				post: { ...post, moderationLabels: [], selfLabels: ['sexual'] },
				children: createRawSnippet(() => ({ render: () => '<p>Preview text</p>' })),
			},
		});
		expect(body).toContain('concealed');
		expect(body).toContain('aria-hidden="true"');
	});

	it('guards label-only content such as mood post excerpts', () => {
		const excerpt = {
			uri: post.uri,
			moderationLabels: ['harassment'],
		};
		const children = createRawSnippet(() => ({ render: () => '<span>Mood excerpt</span>' }));
		expect(render(PostModerationGuard, { props: { post: excerpt, children } }).body).toContain(
			'concealed',
		);
		setModerationPreference('automatic', 'hide');
		expect(render(PostModerationGuard, { props: { post: excerpt, children } }).body).not.toContain(
			'Mood excerpt',
		);
	});
});
