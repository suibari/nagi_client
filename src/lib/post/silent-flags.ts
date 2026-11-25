import { replyGateRecordValue, type NagiReplyGate } from './reply-gate';

/** 送信時の botたんサイレント・サイレントリプライ・返信できる人のフラグを決める（POST-10・POST-12）。 */
export const postSilentFlags = (input: {
	reply: boolean;
	replyToBot: boolean;
	replyGate: NagiReplyGate;
	silentReply: boolean;
}): { botSilent: boolean; silentReply: boolean; replyGate?: 'bot' | 'nobody' } => {
	const silentReply = input.reply && input.silentReply;
	const replyGate = replyGateRecordValue(input.replyGate);
	return {
		botSilent: input.replyGate === 'nobody' || (silentReply && input.replyToBot),
		silentReply,
		...(replyGate ? { replyGate } : {}),
	};
};
