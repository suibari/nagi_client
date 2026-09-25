import { getRadioTrack, markRadioSeen } from '$lib/api/appview';
import type { RadioTrack } from '$lib/api/types';
import { derived, get, writable } from 'svelte/store';
import { session, oauthReady } from '$lib/oauth/session.svelte';

type RadioState = { did?: string; track?: RadioTrack };
const state = $state<RadioState>({});
export const radioUnread = writable(0);
let requestId = 0;

export const radio = {
	get track() {
		return state.track;
	},
	async refresh(did: string) {
		if (state.did !== did) {
			state.did = did;
			state.track = undefined;
			radioUnread.set(0);
		}
		const id = ++requestId;
		try {
			const result = await getRadioTrack();
			if (id !== requestId || state.did !== did) return;
			state.track = result.track;
			radioUnread.set(result.unreadSlotKey || result.hasUnread ? 1 : 0);
		} catch (error) {
			console.error('Failed to fetch bot-tan radio:', error);
		}
	},
	async markSeen(slotKey: string) {
		const did = state.did;
		if (!did) return;
		await markRadioSeen(slotKey);
		if (state.did === did) await this.refresh(did);
	},
	clear() {
		++requestId;
		state.did = undefined;
		state.track = undefined;
		radioUnread.set(0);
	},
};

/** 起動・ログインと画面復帰で取得する。開きっぱなしでの定期取得はしない。 */
export function startRadioNotice(): () => void {
	const viewer = derived([session, oauthReady], ([$session, $ready]) =>
		$ready ? $session?.did : undefined,
	);
	const unsubscribe = viewer.subscribe((did) => {
		if (did) void radio.refresh(did);
		else radio.clear();
	});
	const onVisible = () => {
		const did = get(viewer);
		if (did && !document.hidden) void radio.refresh(did);
	};
	document.addEventListener('visibilitychange', onVisible);
	return () => {
		unsubscribe();
		document.removeEventListener('visibilitychange', onVisible);
		radio.clear();
	};
}
