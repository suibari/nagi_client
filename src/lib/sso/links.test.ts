import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	session: null as unknown as ReturnType<typeof writable<{ did: string } | null>>,
	createSsoTicket: vi.fn(),
}));

vi.mock('$lib/oauth/session.svelte', async () => {
	const { writable } = await import('svelte/store');
	mocks.session = writable<{ did: string } | null>(null);
	return { session: mocks.session };
});
vi.mock('$lib/api/appview', () => ({ createSsoTicket: mocks.createSsoTicket }));

const { decorateSiblingUrl, interceptSiblingLinkClick, ticketPathFor } = await import('./links');

const DID = 'did:plc:viewer';

function clickOn(href: string) {
	const anchor = { href, target: '', closest: () => anchor };
	Object.setPrototypeOf(anchor, HTMLAnchorElementStub.prototype);
	const event = {
		defaultPrevented: false,
		button: 0,
		metaKey: false,
		ctrlKey: false,
		shiftKey: false,
		altKey: false,
		target: anchor,
		preventDefault: vi.fn(),
	};
	interceptSiblingLinkClick(event as unknown as MouseEvent);
	return event;
}

class ElementStub {}
class HTMLAnchorElementStub extends ElementStub {}

beforeEach(() => {
	mocks.session.set({ did: DID });
	vi.stubGlobal('Element', ElementStub);
	vi.stubGlobal('HTMLAnchorElement', HTMLAnchorElementStub);
	vi.stubGlobal('window', { location: { href: 'https://nagi.suibari.com/' } });
	mocks.createSsoTicket.mockReset();
	mocks.createSsoTicket.mockReturnValue(new Promise(() => {}));
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('decorateSiblingUrl（AUTH-06）', () => {
	it('お部屋と Nagi Space の URL に閲覧者の DID ヒントを付ける', () => {
		expect(decorateSiblingUrl('https://room.bot-tan.com/')).toBe(
			`https://room.bot-tan.com/?did=${encodeURIComponent(DID)}`,
		);
		expect(decorateSiblingUrl('https://nagi-space.suibari.com/s/abc')).toBe(
			`https://nagi-space.suibari.com/s/abc?did=${encodeURIComponent(DID)}`,
		);
	});

	it('無関係な URL には付けない', () => {
		expect(decorateSiblingUrl('https://example.com/s/abc')).toBe('https://example.com/s/abc');
		expect(decorateSiblingUrl('https://nagi-space.suibari.com.evil.test/')).toBe(
			'https://nagi-space.suibari.com.evil.test/',
		);
	});

	it('既存の did を尊重し、未ログインなら何もしない', () => {
		const own = 'https://nagi-space.suibari.com/s/abc?did=did%3Aplc%3Aother';
		expect(decorateSiblingUrl(own)).toBe(own);
		mocks.session.set(null);
		expect(decorateSiblingUrl('https://nagi-space.suibari.com/s/abc')).toBe(
			'https://nagi-space.suibari.com/s/abc',
		);
	});
});

describe('チケットを使う先（AUTH-06）', () => {
	it('チケットの受け口はお部屋だけにある', () => {
		expect(ticketPathFor('https://room.bot-tan.com')).toBe('/api/sso/');
		expect(ticketPathFor('https://nagi-space.suibari.com')).toBeUndefined();
		expect(ticketPathFor('https://example.com')).toBeUndefined();
	});

	it('お部屋宛のクリックはチケットを取りに行く', () => {
		const event = clickOn('https://room.bot-tan.com/?did=x');
		expect(event.preventDefault).toHaveBeenCalled();
		expect(mocks.createSsoTicket).toHaveBeenCalledWith('https://room.bot-tan.com');
	});

	it('Nagi Space 宛のクリックは横取りせず、チケットも取りに行かない', () => {
		const event = clickOn('https://nagi-space.suibari.com/s/abc?did=x');
		expect(event.preventDefault).not.toHaveBeenCalled();
		expect(mocks.createSsoTicket).not.toHaveBeenCalled();
	});
});
