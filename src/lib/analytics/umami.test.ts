import { afterEach, describe, expect, it, vi } from 'vitest';
import { injectUmami, shouldLoadUmami, trackUmami, UMAMI_SCRIPT_SRC } from './umami';

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
