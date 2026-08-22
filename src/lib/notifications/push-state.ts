import type { PushRegistration } from './push.svelte';

export interface PushStatusResult {
	browserSubscribed: boolean;
	registered: boolean;
	registration: PushRegistration;
	subscribed: boolean;
}

export function readyPushStatus(subscribed: boolean): PushStatusResult {
	return {
		browserSubscribed: subscribed,
		registered: subscribed,
		registration: subscribed ? 'registered' : 'none',
		subscribed,
	};
}

export function failedPushStatus(browserSubscribed: boolean): PushStatusResult {
	return {
		browserSubscribed,
		registered: false,
		registration: browserSubscribed ? 'repair-needed' : 'none',
		// AppView再登録の一時失敗は、ブラウザで有効な購読意思をOFFに変えない。
		subscribed: browserSubscribed,
	};
}
