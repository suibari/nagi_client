import { getRadioTrack, markRadioSeen } from '$lib/api/appview';
import type { RadioTrack } from '$lib/api/types';
import { writable } from 'svelte/store';

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
