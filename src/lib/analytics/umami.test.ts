import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	injectUmami,
	shouldLoadUmami,
	trackSignupEvent,
	trackUmami,
	UMAMI_SCRIPT_SRC,
} from './umami';

describe('shouldLoadUmami', () => {
	it('本番のホスト名でサイトIDがあるときだけ読み込む', () => {
		expect(shouldLoadUmami('site-id', 'nagi.suibari.com')).toBe(true);
	});

	it('サイトIDが空なら読み込まない', () => {
		expect(shouldLoadUmami('', 'nagi.suibari.com')).toBe(false);
		expect(shouldLoadUmami('  ', 'nagi.suibari.com')).toBe(false);
	});

	it('プレビューやローカルのホスト名では読み込まない', () => {
		expect(shouldLoadUmami('site-id', 'nagi-client-git-branch.vercel.app')).toBe(false);
		expect(shouldLoadUmami('site-id', '127.0.0.1')).toBe(false);
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('injectUmami', () => {
	function mockBrowser(
		navigator: { doNotTrack?: string; msDoNotTrack?: string } = {},
		doNotTrack?: string,
	) {
		const appendChild = vi.fn();
		vi.stubGlobal('window', { navigator, doNotTrack });
		vi.stubGlobal('location', { hostname: 'nagi.suibari.com' });
		vi.stubGlobal('document', {
			querySelector: () => null,
			createElement: () => ({ dataset: {} }),
			head: { appendChild },
		});
		return appendChild;
	}

	it.each([
		[{ doNotTrack: '1' }, undefined],
		[{}, 'yes'],
		[{ msDoNotTrack: '1' }, undefined],
	])('Do Not Trackが有効なら外部スクリプトを取得しない', (navigator, doNotTrack) => {
		const appendChild = mockBrowser(navigator, doNotTrack);
		injectUmami('site-id');
		expect(appendChild).not.toHaveBeenCalled();
	});

	it('Do Not Trackが無効ならトラッカーの除外属性を付けて読み込む', () => {
		const appendChild = mockBrowser({ doNotTrack: '0' });
		injectUmami(' site-id ');
		expect(appendChild).toHaveBeenCalledExactlyOnceWith({
			defer: true,
			src: UMAMI_SCRIPT_SRC,
			dataset: {
				websiteId: 'site-id',
				domains: 'nagi.suibari.com',
				excludeSearch: 'true',
				excludeHash: 'true',
				doNotTrack: 'true',
			},
		});
	});
});

describe('trackUmami', () => {
	it('トラッカーが無くても例外を出さない', () => {
		vi.stubGlobal('window', {});
		expect(() => trackUmami('oauth_restore_failed', { failure: 'network' })).not.toThrow();
	});

	it('トラッカーの例外を呼び出し元へ伝えない', () => {
		vi.stubGlobal('window', {
			umami: {
				track: () => {
					throw new Error('blocked');
				},
			},
		});
		expect(() => trackUmami('oauth_restore_failed')).not.toThrow();
	});

	it('トラッカーがあれば同じ名前と項目を渡す', () => {
		const track = vi.fn();
		vi.stubGlobal('window', { umami: { track } });
		trackUmami('oauth_session_deleted', { failure: 'none', online: true });
		expect(track).toHaveBeenCalledWith('oauth_session_deleted', { failure: 'none', online: true });
	});
});

describe('signup events', () => {
	function mockTracker({
		referrer = 'https://www.google.com/user?query=secret#token',
		origin = 'https://nagi.suibari.com',
		doNotTrack = '0',
		websiteId = 'site-id',
	} = {}) {
		const send = vi.fn();
		vi.stubGlobal('location', new URL(origin));
		vi.stubGlobal('document', {
			referrer,
			querySelector: () => (websiteId ? { dataset: { websiteId } } : null),
		});
		vi.stubGlobal('window', {
			navigator: { doNotTrack },
			umami: {
				track: (payload: (defaults: object) => object) =>
					send(
						payload({
							website: websiteId,
							hostname: 'nagi.suibari.com',
							screen: '1280x720',
							url: '/oauth/callback?state=secret#token',
							title: 'did:plc:private',
							referrer: 'https://example.com/did:plc:private?token=secret',
							id: 'did:plc:private',
							language: 'ja',
						}),
					),
			},
		});
		return send;
	}

	it('sends a fixed route and external origin using the existing tracker context', () => {
		const send = mockTracker();
		trackSignupEvent('signup_cta_click', '/blog/[did]/[rkey]');
		expect(send).toHaveBeenCalledExactlyOnceWith({
			name: 'signup_cta_click',
			website: 'site-id',
			hostname: 'nagi.suibari.com',
			screen: '1280x720',
			url: '/blog/[did]/[rkey]',
			referrer: 'https://www.google.com',
			language: 'ja',
		});
	});

	it.each(['https://nagi.suibari.com/profile/did:plc:private?hint=secret', 'file:///private', ''])(
		'omits same-origin, non-HTTP and missing referrers',
		(referrer) => {
			const send = mockTracker({ referrer });
			trackSignupEvent('signup_complete', '/oauth/callback');
			expect(send).toHaveBeenCalledWith(
				expect.objectContaining({ name: 'signup_complete', url: '/oauth/callback', referrer: '' }),
			);
		},
	);

	it.each([{ doNotTrack: '1' }, { origin: 'https://nagi-preview.vercel.app' }, { websiteId: '' }])(
		'suppresses events when the tracker is disabled',
		(options) => {
			const send = mockTracker(options);
			trackSignupEvent('signup_oauth_start', '/login');
			expect(send).not.toHaveBeenCalled();
		},
	);
});
