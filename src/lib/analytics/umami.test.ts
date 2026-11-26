import { afterEach, describe, expect, it, vi } from 'vitest';
import { shouldLoadUmami } from './umami';

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

type Navigation = Parameters<(typeof import('./umami'))['trackUmamiPageView']>[0];
type Target = NonNullable<Navigation['to']>;

function target(id: Target['route']['id'], path: string): Target {
	return {
		route: { id },
		url: new URL(path, 'https://nagi.suibari.com'),
	};
}

async function mockTracker(
	dnt = '0',
	referrer = 'https://source.example/search?q=private#results',
	legacyDnt: { window?: string; ms?: string } = {},
) {
	vi.resetModules();
	const analytics = await import('./umami');
	const track = vi.fn().mockResolvedValue(undefined);
	const addEventListener = vi.fn();
	const script = { dataset: {}, addEventListener };
	const appendChild = vi.fn();
	const navigator = { language: 'ja', doNotTrack: dnt, msDoNotTrack: legacyDnt.ms };
	vi.stubGlobal('navigator', navigator);
	vi.stubGlobal('location', { hostname: 'nagi.suibari.com' });
	vi.stubGlobal('window', {
		navigator,
		doNotTrack: legacyDnt.window,
		screen: { width: 1280, height: 720 },
		umami: { track },
	});
	vi.stubGlobal('document', {
		referrer,
		title: 'Free-form title',
		querySelector: () => null,
		createElement: () => script,
		head: { appendChild },
	});
	analytics.injectUmami(' site-id ');
	function trigger(event: string) {
		addEventListener.mock.calls.find(([name]) => name === event)?.[1]();
	}

	return { ...analytics, track, script, appendChild, trigger, navigator };
}

const diagnostic = {
	failure: 'network',
	online: true,
	locks: true,
	display: 'browser',
	hoursSinceSuccess: 3,
} as const;

describe('Umamiへの送信項目', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('初回はSDKの準備を待ち、固定ルートIDと参照元のオリジンを明示送信する', async () => {
		const { track, trackUmamiPageView, script, appendChild, trigger } = await mockTracker();
		expect(appendChild).toHaveBeenCalledExactlyOnceWith(script);
		expect(script.dataset).toMatchObject({
			websiteId: 'site-id',
			autoTrack: 'false',
			doNotTrack: 'true',
		});
		trackUmamiPageView({
			from: null,
			to: target('/blog/[did]/[rkey]', '/blog/author/article?q=private#intro'),
		});
		expect(track).not.toHaveBeenCalled();
		trigger('load');
		expect(track).toHaveBeenCalledExactlyOnceWith({
			website: 'site-id',
			hostname: 'nagi.suibari.com',
			language: 'ja',
			screen: '1280x720',
			url: '/blog/[did]/[rkey]',
			referrer: 'https://source.example',
		});
	});

	it('動的なページ間の移動と戻る・進むでルートIDを使い、クエリ・ハッシュ変更だけの遷移を省く', async () => {
		const { track, trackUmamiPageView, trigger } = await mockTracker();
		const first = target('/news/[rkey]', '/news/first');
		const second = target('/news/[rkey]', '/news/second');
		const profile = target('/profile/[did]', '/profile/actor');
		trackUmamiPageView({ from: null, to: first });
		trackUmamiPageView({ from: first, to: second });
		trigger('load');
		trackUmamiPageView({ from: second, to: profile });
		trackUmamiPageView({ from: profile, to: second });
		trackUmamiPageView({ from: second, to: profile });
		trackUmamiPageView({
			from: profile,
			to: target('/profile/[did]', '/profile/actor?tab=likes#head'),
		});
		expect(track.mock.calls.map(([{ url, referrer }]) => [url, referrer])).toEqual([
			['/news/[rkey]', 'https://source.example'],
			['/news/[rkey]', '/news/[rkey]'],
			['/profile/[did]', '/news/[rkey]'],
			['/news/[rkey]', '/profile/[did]'],
			['/profile/[did]', '/news/[rkey]'],
		]);
	});

	it.each([
		['https://nagi.suibari.com/profile/actor?tab=likes#head', 'https://nagi.suibari.com'],
		['', undefined],
		['file:///local-page.html', undefined],
	])('直接読み込みの参照元を最小化する', async (referrer, expected) => {
		const { track, trackUmamiPageView, trigger } = await mockTracker('0', referrer);
		trigger('load');
		trackUmamiPageView({ from: null, to: target('/search', '/search') });
		expect(track.mock.calls[0][0].referrer).toBe(expected);
	});

	it('OAuth診断に固定の項目だけを付け、未読込や不明なページでは省く', async () => {
		const { track, trackUmami, trackUmamiPageView, trigger } = await mockTracker();
		trackUmami('oauth_restore_failed', diagnostic);
		expect(track).not.toHaveBeenCalled();
		trigger('load');
		trackUmamiPageView({
			from: null,
			to: target('/oauth/callback', '/oauth/callback?state=fixture'),
		});
		trackUmami('oauth_restore_failed', { ...diagnostic, ...{ error: 'Fixture error text' } });
		expect(track).toHaveBeenLastCalledWith({
			website: 'site-id',
			hostname: 'nagi.suibari.com',
			language: 'ja',
			screen: '1280x720',
			url: '/oauth/callback',
			referrer: 'https://source.example',
			name: 'oauth_restore_failed',
			data: diagnostic,
		});
		trackUmamiPageView({ from: null, to: target(null, '/unknown') });
		trackUmami('oauth_restore_failed', diagnostic);
		expect(track).toHaveBeenCalledTimes(2);
	});

	it.each([
		['1', {}],
		['0', { window: 'yes' }],
		['0', { ms: '1' }],
	])('DNTが有効ならトラッカーの取得とイベント送信を抑える', async (dnt, legacyDnt) => {
		const { track, trackUmami, trackUmamiPageView, appendChild } = await mockTracker(
			dnt,
			undefined,
			legacyDnt,
		);
		trackUmamiPageView({ from: null, to: target('/', '/') });
		trackUmami('oauth_session_deleted', diagnostic);
		expect(appendChild).not.toHaveBeenCalled();
		expect(track).not.toHaveBeenCalled();
	});

	it('トラッカーの取得後にDNTが有効になっても送信を抑える', async () => {
		const { track, trackUmami, trackUmamiPageView, trigger, navigator } = await mockTracker();
		trackUmamiPageView({ from: null, to: target('/', '/') });
		navigator.doNotTrack = '1';
		trigger('load');
		trackUmami('oauth_session_deleted', diagnostic);
		expect(track).not.toHaveBeenCalled();
	});

	it('読み込み失敗後や計測エラー時にもアプリの処理を妨げない', async () => {
		const { track, trackUmami, trackUmamiPageView, trigger } = await mockTracker();
		trigger('load');
		track.mockRejectedValue(new Error('mock'));
		expect(() => trackUmamiPageView({ from: null, to: target('/', '/') })).not.toThrow();
		expect(() => trackUmami('oauth_restore_failed', diagnostic)).not.toThrow();
		expect(track).toHaveBeenCalledTimes(2);
		trigger('error');
		trackUmamiPageView({ from: null, to: target('/', '/') });
		trackUmami('oauth_restore_failed', diagnostic);
		expect(track).toHaveBeenCalledTimes(2);
	});
});
