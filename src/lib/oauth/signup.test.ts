import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const oauth = vi.hoisted(() => ({ init: vi.fn(), restore: vi.fn(), signIn: vi.fn() }));
vi.mock('./client', async (importOriginal) => ({
	...(await importOriginal<typeof import('./client')>()),
	getOAuthClient: () => oauth,
}));
vi.mock('./diagnostics', () => ({
	isTransientOAuthFailure: () => false,
	rememberOAuthSuccess: vi.fn(),
	reportOAuthDiagnostic: vi.fn(),
	requestPersistentOAuthStorage: vi.fn(),
}));

import { BLUESKY_ENTRYWAY_URL, SIGNUP_OAUTH_STATE } from './client';
import {
	consumeSignupCallback,
	initOAuth,
	oauthReady,
	session,
	signIn,
	signUp,
	type OAuthSession,
} from './session.svelte';

const makeAccount = () => ({ did: 'did:plc:signup' }) as unknown as OAuthSession;
const account = makeAccount();

beforeEach(() => {
	vi.resetAllMocks();
	session.set(null);
	oauthReady.set(false);
	vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());

describe('registration OAuth', () => {
	it('marks signup for a confirmed guest and leaves normal login unmarked', async () => {
		oauthReady.set(true);
		await signUp({ crosspost: true });
		await signIn('alice.example');
		expect(oauth.signIn).toHaveBeenNthCalledWith(
			1,
			BLUESKY_ENTRYWAY_URL,
			expect.objectContaining({ state: SIGNUP_OAUTH_STATE, ui_locales: expect.any(String) }),
		);
		expect(oauth.signIn.mock.calls[1]).toEqual(['alice.example', { scope: expect.any(String) }]);
	});

	it('does not mark signup for an authenticated visitor', async () => {
		oauthReady.set(true);
		session.set(account);
		await signUp();
		expect(oauth.signIn.mock.calls[0][1]).not.toHaveProperty('state');
	});

	it('consumes the signup result only once and only for the callback session', async () => {
		oauth.init.mockResolvedValue({ session: account, state: SIGNUP_OAUTH_STATE });
		await initOAuth();
		expect(consumeSignupCallback(makeAccount())).toBe(false);
		expect(consumeSignupCallback(account)).toBe(true);
		expect(consumeSignupCallback(account)).toBe(false);
	});

	it('ignores restored and ordinary callback sessions', async () => {
		oauth.init.mockResolvedValueOnce({ session: account }).mockResolvedValueOnce({
			session: account,
			state: null,
		});
		await initOAuth();
		expect(consumeSignupCallback(account)).toBe(false);
		await initOAuth();
		expect(consumeSignupCallback(account)).toBe(false);
	});

	it('ignores failed and replayed callbacks', async () => {
		oauth.init
			.mockRejectedValueOnce(new Error('OAuth cancelled'))
			.mockRejectedValueOnce(new Error('Unknown authorization session'));
		await initOAuth();
		await initOAuth();
		expect(consumeSignupCallback(account)).toBe(false);
	});
});
