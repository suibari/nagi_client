import { afterEach, describe, expect, it, vi } from 'vitest';
import { shouldLoadUmami, trackUmami } from './umami';

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

describe('trackUmami', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

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
