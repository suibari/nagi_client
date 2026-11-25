/** Nagi の投稿へ直接返信できる相手（POST-10）。レコードの replyGate に対応する。 */
export type NagiReplyGate = 'everyone' | 'bot' | 'nobody';
export const NAGI_REPLY_GATES: NagiReplyGate[] = ['everyone', 'bot', 'nobody'];

const REPLY_GATE_KEY = 'nagi-last-reply-gate';

const isNagiReplyGate = (value: unknown): value is NagiReplyGate =>
	value === 'everyone' || value === 'bot' || value === 'nobody';

export function getLastReplyGate(): NagiReplyGate {
	if (typeof window === 'undefined') return 'everyone';
	try {
		const stored = window.localStorage.getItem(REPLY_GATE_KEY);
		return isNagiReplyGate(stored) ? stored : 'everyone';
	} catch {
		return 'everyone';
	}
}

export function setLastReplyGate(gate: NagiReplyGate) {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(REPLY_GATE_KEY, gate);
	} catch {
		// 保存できなくても投稿自体には影響しない。
	}
}

/** レコードへ書く値。誰でも返信できるときは付けない。 */
export const replyGateRecordValue = (gate: NagiReplyGate): 'bot' | 'nobody' | undefined =>
	gate === 'everyone' ? undefined : gate;
