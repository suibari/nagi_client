import { describe, expect, it } from 'vitest';
import type { NotificationView, PostView } from '$lib/api/types';
import { notificationHref } from './href';

const uri = 'at://did:plc:author/com.suibari.nagi.post/3abc';
const documentUri = uri.replace('com.suibari.nagi.post', 'site.standard.document');
const notification = (overrides: Partial<NotificationView> = {}): NotificationView => ({
	id: 'notification',
	type: 'reaction',
	actor: { did: 'did:plc:actor', handle: 'actor.test' },
	subjectUri: uri,
	reasonUri: 'at://did:plc:actor/com.suibari.nagi.reaction/3reaction',
	createdAt: '2026-10-03T00:00:00Z',
	...overrides,
});

describe('notificationHref', () => {
	it.each(['reaction', 'reply', 'mention'] as const)(
		'routes %s subjects by collection even without an embedded post',
		(type) => {
			expect(notificationHref(notification({ type, subjectUri: documentUri }))).toBe(
				'/blog/did:plc:author/3abc',
			);
			expect(notificationHref(notification({ type }))).toBe('/thread/did:plc:author/3abc');
		},
	);
	it('uses legacy article metadata only for the subject itself', () => {
		const post = { uri, article: true } as PostView;
		expect(notificationHref(notification({ post }))).toBe('/blog/did:plc:author/3abc');
		expect(notificationHref(notification({ post: { ...post, uri: `${uri}other` } }))).toBe(
			'/thread/did:plc:author/3abc',
		);
		expect(
			notificationHref(
				notification({
					post: { ...post, reply: { root: { uri, cid: '' }, parent: { uri, cid: '' } } },
				}),
			),
		).toBe('/thread/did:plc:author/3abc');
	});
	it('keeps diary and analysis notifications on their dedicated pages', () => {
		expect(notificationHref(notification({ type: 'diary' }))).toBe('/diary');
		expect(
			notificationHref(
				notification({ type: 'diary', diary: { date: '2026-10-03' } as NotificationView['diary'] }),
			),
		).toBe('/diary?date=2026-10-03');
		expect(notificationHref(notification({ type: 'analysis' }), 'did:plc:viewer')).toBe(
			'/profile/did:plc:viewer',
		);
	});
	it.each(['cardGet', 'zenkatsu'] as const)(
		'routes %s reactions to cards even when subject details are unavailable',
		(type) => {
			expect(
				notificationHref(
					notification({
						subjectUri: uri.replace('com.suibari.nagi.post', `com.suibari.nagi.${type}`),
					}),
				),
			).toBe('/cards');
			expect(notificationHref(notification({ cardSubject: { uri, type, cards: [] } }))).toBe(
				'/cards',
			);
		},
	);
});
