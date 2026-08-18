import { drawCard, drawGuestCard } from '$lib/api/appview';
import type { DrawCardResult, GuestCardDrawResult } from '$lib/api/types';

const DEVICE_TOKEN_KEY = 'nagi.guest-card.device.v1';
const DRAW_KEY = 'nagi.guest-card.draw.v1';

function randomToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
}

export function isGuestCardDrawCurrent(
	value: unknown,
	now = Date.now(),
): value is GuestCardDrawResult {
	const result = value as Partial<GuestCardDrawResult> | undefined;
	return (
		typeof result?.expiresAt === 'string' &&
		Date.parse(result.expiresAt) > now &&
		typeof result.card?.id === 'number' &&
		typeof result.card?.volume === 'number'
	);
}

class GuestCardDraw {
	result = $state<GuestCardDrawResult>();
	ready = $state(false);
	drawing = $state(false);
	claiming = $state(false);

	get canDrawToday() {
		return this.ready && !this.result;
	}

	hydrate() {
		if (typeof localStorage === 'undefined' || this.ready) return;
		try {
			const parsed = JSON.parse(localStorage.getItem(DRAW_KEY) ?? 'null') as unknown;
			if (isGuestCardDrawCurrent(parsed)) this.result = parsed;
			else localStorage.removeItem(DRAW_KEY);
		} catch {
			localStorage.removeItem(DRAW_KEY);
		}
		this.ready = true;
	}

	refreshDay() {
		if (!this.ready) return this.hydrate();
		if (this.result && Date.parse(this.result.expiresAt) <= Date.now()) {
			this.result = undefined;
			localStorage.removeItem(DRAW_KEY);
		}
	}

	#deviceToken(): string {
		let token = localStorage.getItem(DEVICE_TOKEN_KEY);
		if (!token || token.length < 32) {
			token = randomToken();
			localStorage.setItem(DEVICE_TOKEN_KEY, token);
		}
		return token;
	}

	async draw(): Promise<GuestCardDrawResult> {
		this.hydrate();
		if (this.result) return this.result;
		if (this.drawing) throw new Error('Guest card draw is already in progress');
		this.drawing = true;
		try {
			const result = await drawGuestCard(this.#deviceToken());
			this.result = result;
			localStorage.setItem(DRAW_KEY, JSON.stringify(result));
			return result;
		} finally {
			this.drawing = false;
		}
	}

	/** サインイン後、同日の通常枠へ同じカードを移す。成功するまでローカル結果は消さない。 */
	async claim(): Promise<DrawCardResult | undefined> {
		this.hydrate();
		if (!this.result || this.claiming) return;
		this.claiming = true;
		try {
			const result = await drawCard({ source: 'my_nagi', guestToken: this.#deviceToken() });
			this.result = undefined;
			localStorage.removeItem(DRAW_KEY);
			return result;
		} finally {
			this.claiming = false;
		}
	}
}

export const guestCardDraw = new GuestCardDraw();
