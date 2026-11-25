import { getLastReplyGate, setLastReplyGate, type NagiReplyGate } from './reply-gate';

/**
 * 返信できる人の現在の選択。通常の投稿と3行日記の入力で同じ値を見るため、
 * ブラウザ保存の値を1つの状態として共有する。
 */
class ReplyGatePreference {
	value = $state<NagiReplyGate>(getLastReplyGate());

	set(gate: NagiReplyGate) {
		this.value = gate;
		setLastReplyGate(gate);
	}
}

export const replyGatePreference = new ReplyGatePreference();
