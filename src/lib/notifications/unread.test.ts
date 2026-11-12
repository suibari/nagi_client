import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import type { OAuthSession } from '$lib/oauth/session.svelte';

const oauth = vi.hoisted(() => ({ init: vi.fn(), restore: vi.fn() }));
vi.mock('$lib/oauth/client', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/oauth/client')>()),
	getOAuthClient: () => oauth,
	onOAuthSessionDeleted: vi.fn(),
}));
vi.mock('$lib/oauth/diagnostics', () => ({
	isTransientOAuthFailure: () => false,
	rememberOAuthSuccess: vi.fn(),
	reportOAuthDiagnostic: vi.fn(),
	requestPersistentOAuthStorage: vi.fn(),
}));
vi.mock('$app/environment', () => ({ dev: false }));

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (error: Error) => void;
	const promise = new Promise<T>((yes, no) => {
		resolve = yes;
		reject = no;
	});
	return { promise, resolve, reject };
}
const json = (body: unknown) =>
	new Response(JSON.stringify(body), {
		headers: { 'content-type': 'application/json' },
	});
function account(did = 'did:plc:alice') {
	return {
		did,
		fetchHandler: vi.fn().mockImplementation(() => Promise.resolve(json({ count: 4 }))),
	} as unknown as OAuthSession & { fetchHandler: ReturnType<typeof vi.fn> };
}

let stop: (() => void) | undefined;
let unsubscribers: Array<() => void>;
let win: EventTarget;
let doc: EventTarget & { visibilityState: string; documentElement: { lang: string } };
let sw: EventTarget;
let setBadge: ReturnType<typeof vi.fn>;
let clearBadge: ReturnType<typeof vi.fn>;
let auth: typeof import('$lib/oauth/session.svelte');
let unread: typeof import('./unread.svelte');

beforeEach(async () => {
	vi.resetModules();
	vi.useFakeTimers();
	oauth.init.mockReset();
	oauth.restore.mockReset();
	unsubscribers = [];
	win = new EventTarget();
	doc = Object.assign(new EventTarget(), {
		visibilityState: 'visible',
		documentElement: { lang: 'ja' },
	});
	sw = new EventTarget();
	setBadge = vi.fn().mockResolvedValue(undefined);
	clearBadge = vi.fn().mockResolvedValue(undefined);
	vi.stubGlobal('window', win);
	vi.stubGlobal('document', doc);
	vi.stubGlobal('navigator', {
		serviceWorker: sw,
		setAppBadge: setBadge,
		clearAppBadge: clearBadge,
	});
	vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() });
	auth = await import('$lib/oauth/session.svelte');
	unread = await import('./unread.svelte');
});
afterEach(() => {
	stop?.();
	stop = undefined;
	unsubscribers.forEach((unsubscribe) => unsubscribe());
	vi.clearAllTimers();
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

async function restore(current: OAuthSession | null) {
	oauth.init.mockResolvedValue(current ? { session: current } : undefined);
	await auth.initOAuth();
	await vi.advanceTimersByTimeAsync(0);
}

describe('notification startup with real OAuth and AppView request paths', () => {
	it('starts before an earlier profile subscriber and updates nav and OS badges while other data is pending', async () => {
		await import('$lib/profile/me.svelte');
		const nav = await import('$lib/components/shell/nav');
		const { render } = await import('svelte/server');
		const { default: NavBadge } = await import('$lib/components/shell/NavBadge.svelte');
		const current = account();
		const count = deferred<Response>();
		const other = deferred<Response>();
		current.fetchHandler.mockImplementation((path: string, options: RequestInit) => {
			expect(options.headers).toMatchObject({
				'atproto-proxy': 'did:web:nagi-api.suibari.com#nagi_appview',
			});
			return path.endsWith('getUnreadCount') ? count.promise : other.promise;
		});
		const { getHomeTimeline } = await import('$lib/api/appview');
		unsubscribers.push(
			auth.session.subscribe((value) => {
				if (value) void getHomeTimeline();
			}),
		);
		stop = unread.startUnreadPolling();
		await restore(current);
		const paths = current.fetchHandler.mock.calls.map(([path]) => path as string);
		expect(paths[0]).toBe('/xrpc/com.suibari.nagi.getUnreadCount');
		expect(paths.filter((path) => path.endsWith('getUnreadCount'))).toHaveLength(1);
		expect(paths.some((path) => path.includes('getProfile'))).toBe(true);
		expect(paths.some((path) => path.includes('getHomeTimeline'))).toBe(true);
		count.resolve(json({ count: 7 }));
		await vi.advanceTimersByTimeAsync(0);
		for (const items of [nav.mobilePrimaryItems, nav.desktopNavGroups.flat()]) {
			const badge = items.find((item) => item.href === '/notifications')!.badge!;
			expect(get(badge.unread)).toBe(7);
			expect(render(NavBadge, { props: badge }).body).toContain('>7</span>');
		}
		expect(setBadge).toHaveBeenLastCalledWith(7);
	});

	it.each([401, 403, 500])(
		'keeps session and feed usable when count fails with %s',
		async (status) => {
			const current = account();
			current.fetchHandler.mockImplementation((path: string) =>
				Promise.resolve(
					path.endsWith('getUnreadCount') ? new Response('{}', { status }) : json({ items: [] }),
				),
			);
			const { getHomeTimeline } = await import('$lib/api/appview');
			const feedLoaded = vi.fn();
			unsubscribers.push(
				auth.session.subscribe((value) => {
					if (value) void getHomeTimeline().then(feedLoaded);
				}),
			);
			stop = unread.startUnreadPolling();
			await restore(current);
			expect(get(auth.session)).toBe(current);
			expect(feedLoaded).toHaveBeenCalled();
			current.fetchHandler.mockResolvedValue(json({ count: 3 }));
			await vi.advanceTimersByTimeAsync(5_000);
			expect(get(unread.unreadCount)).toBe(3);
		},
	);

	it('does not request personal data before restoration or for a guest', async () => {
		const current = account();
		const api = await import('$lib/api/appview');
		const fetchCount = vi.spyOn(api, 'getUnreadCount');
		const restored = deferred<{ session: OAuthSession } | undefined>();
		oauth.init.mockReturnValue(restored.promise);
		stop = unread.startUnreadPolling();
		const initializing = auth.initOAuth();
		await vi.advanceTimersByTimeAsync(60_000);
		expect(current.fetchHandler).not.toHaveBeenCalled();
		expect(fetchCount).not.toHaveBeenCalled();
		restored.resolve(undefined);
		await initializing;
		win.dispatchEvent(new Event('focus'));
		expect(get(auth.session)).toBeNull();
		expect(current.fetchHandler).not.toHaveBeenCalled();
		expect(fetchCount).not.toHaveBeenCalled();
	});

	it('handles marker-based restoration through the same priority path', async () => {
		const current = account();
		vi.stubGlobal('localStorage', { getItem: () => current.did, setItem: vi.fn() });
		oauth.init.mockResolvedValue(undefined);
		oauth.restore.mockResolvedValue(current);
		stop = unread.startUnreadPolling();
		await auth.initOAuth();
		await vi.advanceTimersByTimeAsync(0);
		expect(oauth.restore).toHaveBeenCalledWith(current.did);
		expect(current.fetchHandler).toHaveBeenCalledTimes(1);
		expect(get(unread.unreadCount)).toBe(4);
	});

	it('fetches once when already signed in and ignores repeated startup', async () => {
		const current = account();
		auth.session.set(current);
		stop = unread.startUnreadPolling();
		unread.startUnreadPolling();
		auth.session.set(current);
		await vi.advanceTimersByTimeAsync(0);
		expect(current.fetchHandler).toHaveBeenCalledTimes(1);
	});

	it('ignores delayed responses across direct account switches, logout, and same-DID relogin', async () => {
		const alice = account();
		const old = deferred<Response>();
		alice.fetchHandler.mockReturnValue(old.promise);
		stop = unread.startUnreadPolling();
		await restore(alice);
		const bob = account('did:plc:bob');
		auth.session.set(bob);
		await vi.advanceTimersByTimeAsync(0);
		expect(get(unread.unreadCount)).toBe(4);
		auth.session.set(null);
		const newAlice = account();
		newAlice.fetchHandler.mockResolvedValue(json({ count: 2 }));
		await restore(newAlice);
		old.resolve(json({ count: 99 }));
		await vi.advanceTimersByTimeAsync(0);
		expect(get(unread.unreadCount)).toBe(2);
		auth.session.set(null);
		expect(get(unread.unreadCount)).toBe(0);
		expect(clearBadge).toHaveBeenCalled();
	});

	it('does not reset the next account when an old mark-seen request finishes', async () => {
		const alice = account();
		const seen = deferred<Response>();
		alice.fetchHandler.mockImplementation((path: string) =>
			path.endsWith('updateSeen') ? seen.promise : Promise.resolve(json({ count: 4 })),
		);
		stop = unread.startUnreadPolling();
		await restore(alice);
		const marking = unread.markAllSeen('2026-11-12T00:00:00Z');
		auth.session.set(account('did:plc:bob'));
		await vi.advanceTimersByTimeAsync(0);
		seen.resolve(json({}));
		await marking;
		expect(get(unread.unreadCount)).toBe(4);
	});

	it('does not restore unread from a request started before marking seen', async () => {
		const current = account();
		const old = deferred<Response>();
		current.fetchHandler.mockImplementation((path: string) =>
			path.endsWith('getUnreadCount') ? old.promise : Promise.resolve(json({})),
		);
		stop = unread.startUnreadPolling();
		await restore(current);
		await unread.markAllSeen('2026-11-12T00:00:00Z');
		old.resolve(json({ count: 9 }));
		await vi.advanceTimersByTimeAsync(0);
		expect(get(unread.unreadCount)).toBe(0);
	});

	it('keeps polling, focus, visible resume, and Push refreshes', async () => {
		const current = account();
		stop = unread.startUnreadPolling();
		await restore(current);
		await vi.advanceTimersByTimeAsync(60_000);
		expect(current.fetchHandler).toHaveBeenCalledTimes(2);
		win.dispatchEvent(new Event('focus'));
		doc.visibilityState = 'hidden';
		doc.dispatchEvent(new Event('visibilitychange'));
		expect(current.fetchHandler).toHaveBeenCalledTimes(3);
		doc.visibilityState = 'visible';
		doc.dispatchEvent(new Event('visibilitychange'));
		sw.dispatchEvent(new MessageEvent('message', { data: { type: 'nagi:push' } }));
		await vi.advanceTimersByTimeAsync(0);
		expect(current.fetchHandler).toHaveBeenCalledTimes(5);
	});

	it('cancels retries and event handlers on stop or logout', async () => {
		const current = account();
		current.fetchHandler.mockRejectedValue(new TypeError('offline'));
		stop = unread.startUnreadPolling();
		await restore(current);
		auth.session.set(null);
		await vi.advanceTimersByTimeAsync(5_000);
		expect(current.fetchHandler).toHaveBeenCalledTimes(1);
		stop?.();
		stop = undefined;
		current.fetchHandler.mockResolvedValue(json({ count: 4 }));
		await restore(current);
		win.dispatchEvent(new Event('focus'));
		await vi.advanceTimersByTimeAsync(60_000);
		expect(current.fetchHandler).toHaveBeenCalledTimes(1);
	});
});
